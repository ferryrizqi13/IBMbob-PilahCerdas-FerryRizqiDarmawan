/**
 * PilahCerdas — script.js
 * Logika utama aplikasi: data edukasi, pencarian, CRUD catatan,
 * dashboard, checklist, localStorage, navigasi, notifikasi, dan keamanan.
 *
 * Prinsip keamanan yang diterapkan:
 * - Tidak menggunakan innerHTML untuk menampilkan input pengguna.
 * - Semua teks input pengguna di-render via textContent atau DOM builder.
 * - Tidak menggunakan eval(), Function(), atau string-based event handler.
 * - Data dari localStorage divalidasi strukturnya sebelum digunakan.
 * - Tidak menyimpan data sensitif.
 */

'use strict';

/* =============================================================
   KONSTANTA
   ============================================================= */
const LS_KEY_CATATAN   = 'pilahcerdas_catatan_v1';
const LS_KEY_CHECKLIST = 'pilahcerdas_checklist_v1';
const BERAT_MAX        = 1000;  // kg, batas per catatan
const BERAT_MIN        = 0.001; // kg minimum

/* =============================================================
   DATA EDUKASI STATIS
   ============================================================= */

/** @type {Array<{id:string, nama:string, kategori:string, ikon:string, panduan:string, tags:string[]}>} */
const DATA_PANDUAN = [
  // --- Organik ---
  {
    id: 'p01', nama: 'Sisa sayuran', kategori: 'organik', ikon: '🥬',
    panduan: 'Pisahkan dari plastik pembungkus. Masukkan ke tempat sampah organik atau jadikan kompos rumahan dengan cara ditimbun di tanah/pot.',
    tags: ['sayuran', 'sisa makanan', 'organik', 'kompos'],
  },
  {
    id: 'p02', nama: 'Kulit buah', kategori: 'organik', ikon: '🍊',
    panduan: 'Dapat dikompos bersama sisa organik lainnya. Hindari mencampur dengan plastik atau styrofoam sebelum dibuang.',
    tags: ['buah', 'kulit', 'organik', 'kompos'],
  },
  {
    id: 'p03', nama: 'Daun kering', kategori: 'organik', ikon: '🍂',
    panduan: 'Kumpulkan dan jadikan kompos atau mulsa untuk tanaman. Jangan dibakar — asap pembakaran daun berbahaya bagi kesehatan.',
    tags: ['daun', 'kering', 'organik', 'kompos'],
  },
  {
    id: 'p04', nama: 'Sisa nasi', kategori: 'organik', ikon: '🍚',
    panduan: 'Masukkan ke tempat sampah organik tertutup untuk menghindari bau dan serangga. Dapat dijadikan kompos atau pupuk cair organik.',
    tags: ['nasi', 'sisa makanan', 'organik'],
  },
  {
    id: 'p05', nama: 'Ampas kopi', kategori: 'organik', ikon: '☕',
    panduan: 'Ampas kopi kaya nitrogen — sangat baik untuk kompos atau pupuk tanaman hias. Campurkan ke media tanam dalam jumlah kecil.',
    tags: ['kopi', 'ampas', 'organik', 'kompos'],
  },
  {
    id: 'p06', nama: 'Kulit telur', kategori: 'organik', ikon: '🥚',
    panduan: 'Cuci dan keringkan, lalu tumbuk untuk dijadikan suplemen kalsium pada kompos atau media tanam.',
    tags: ['telur', 'kulit', 'organik', 'kompos'],
  },

  // --- Anorganik ---
  {
    id: 'p07', nama: 'Botol plastik', kategori: 'anorganik', ikon: '🍶',
    panduan: 'Bilas hingga bersih dan lepaskan tutupnya. Pisatkan berdasarkan jenis plastik (lihat kode daur ulang di bawah botol). Serahkan ke bank sampah atau pengepul setempat. Penerimaan tergantung fasilitas di daerah Anda.',
    tags: ['botol', 'plastik', 'anorganik', 'daur ulang'],
  },
  {
    id: 'p08', nama: 'Kertas bersih', kategori: 'anorganik', ikon: '📄',
    panduan: 'Kertas yang bersih dan kering dapat diserahkan ke bank sampah atau pengepul kertas. Kertas berminyak, basah, atau kotor sebaiknya dimasukkan ke sampah residu.',
    tags: ['kertas', 'anorganik', 'daur ulang'],
  },
  {
    id: 'p09', nama: 'Kardus', kategori: 'anorganik', ikon: '📦',
    panduan: 'Lipat atau potong agar tidak memakan ruang. Pastikan kering dan bersih dari sisa makanan. Dapat diserahkan ke bank sampah atau pengepul kardus.',
    tags: ['kardus', 'karton', 'anorganik', 'daur ulang'],
  },
  {
    id: 'p10', nama: 'Kaleng', kategori: 'anorganik', ikon: '🥫',
    panduan: 'Bilas kaleng hingga bersih. Kaleng baja dan aluminium biasanya diterima oleh pengepul atau bank sampah. Periksa apakah fasilitas setempat menerima jenis kaleng tersebut.',
    tags: ['kaleng', 'aluminium', 'baja', 'anorganik', 'daur ulang'],
  },
  {
    id: 'p11', nama: 'Botol kaca', kategori: 'anorganik', ikon: '🫙',
    panduan: 'Bilas botol kaca dan pastikan tidak ada pecahan. Kaca umumnya dapat didaur ulang tetapi tidak semua fasilitas menerimanya — cek ke bank sampah setempat.',
    tags: ['botol', 'kaca', 'anorganik', 'daur ulang'],
  },
  {
    id: 'p12', nama: 'Kemasan tetrapak', kategori: 'anorganik', ikon: '🧃',
    panduan: 'Tetrapak (karton minuman) perlu dikeringkan dan dilipat. Penerimaan bervariasi; tanyakan ke bank sampah atau program daur ulang setempat.',
    tags: ['tetrapak', 'karton', 'minuman', 'anorganik'],
  },

  // --- Penanganan Khusus ---
  {
    id: 'p13', nama: 'Baterai bekas', kategori: 'khusus', ikon: '🔋',
    panduan: '⚠️ Jangan buang ke tempat sampah biasa atau dibakar. Baterai mengandung bahan kimia berbahaya. Kumpulkan dan serahkan ke tempat pengumpulan baterai di toko elektronik, supermarket, atau fasilitas daur ulang yang berwenang.',
    tags: ['baterai', 'bekas', 'khusus', 'berbahaya', 'b3'],
  },
  {
    id: 'p14', nama: 'Perangkat elektronik bekas', kategori: 'khusus', ikon: '💻',
    panduan: '⚠️ E-waste (limbah elektronik) mengandung logam berat yang berbahaya. Jangan dibuang ke TPA biasa. Serahkan ke produsen, toko elektronik yang memiliki program take-back, atau fasilitas pengelola e-waste yang berwenang.',
    tags: ['elektronik', 'hp', 'laptop', 'komputer', 'khusus', 'e-waste', 'b3'],
  },
  {
    id: 'p15', nama: 'Lampu TL dan LED bekas', kategori: 'khusus', ikon: '💡',
    panduan: '⚠️ Lampu TL mengandung merkuri. Jangan dipecah atau dibuang ke sampah biasa. Kemas dengan hati-hati dan serahkan ke fasilitas pengelola limbah B3 atau program pengembalian lampu dari produsen.',
    tags: ['lampu', 'tl', 'led', 'neon', 'khusus', 'berbahaya', 'b3'],
  },
  {
    id: 'p16', nama: 'Cat dan pelarut bekas', kategori: 'khusus', ikon: '🎨',
    panduan: '⚠️ Limbah cat dan pelarut termasuk B3. Jangan dituangkan ke saluran air atau tanah. Keringkan sisa cat dalam wadah terbuka (jauh dari api), lalu hubungi fasilitas pengelola B3 setempat.',
    tags: ['cat', 'pelarut', 'thinner', 'khusus', 'b3', 'berbahaya'],
  },
  {
    id: 'p17', nama: 'Oli bekas kendaraan', kategori: 'khusus', ikon: '🛢️',
    panduan: '⚠️ Oli bekas mengandung logam berat dan tidak boleh dibuang ke tanah atau saluran air. Kumpulkan dalam wadah tertutup dan serahkan ke bengkel, SPBU, atau fasilitas pengelola oli bekas yang berwenang.',
    tags: ['oli', 'bekas', 'kendaraan', 'khusus', 'b3'],
  },
];

/** @type {Array<{id:string, teks:string}>} */
const DATA_KEBIASAAN = [
  { id: 'k01', teks: 'Memisahkan sampah organik, anorganik, dan sampah khusus setiap hari' },
  { id: 'k02', teks: 'Menggunakan kembali barang yang masih layak pakai (reuse)' },
  { id: 'k03', teks: 'Membawa botol minum sendiri saat bepergian' },
  { id: 'k04', teks: 'Mengurangi penggunaan barang sekali pakai (tas plastik, sedotan, stirofoam)' },
  { id: 'k05', teks: 'Memeriksa panduan sebelum menyalurkan sampah khusus atau B3' },
];

/** @type {Array<{ikon:string, judul:string, isi:string}>} */
const DATA_TIPS = [
  {
    ikon: '🗑️',
    judul: 'Siapkan Tiga Wadah Sampah',
    isi: 'Sediakan tiga tempat sampah berbeda di rumah: untuk sampah organik, anorganik (daur ulang), dan sampah residu/khusus. Label yang jelas membantu seluruh anggota keluarga.',
  },
  {
    ikon: '🧹',
    judul: 'Bilas Sebelum Membuang',
    isi: 'Bilas kemasan plastik, kaleng, dan botol kaca sebelum dimasukkan ke tempat daur ulang. Kemasan kotor dapat menyebabkan kontaminasi yang membuat seluruh batch tidak dapat didaur ulang.',
  },
  {
    ikon: '♻️',
    judul: 'Cek Simbol Daur Ulang',
    isi: 'Plastik memiliki kode 1–7 di bagian bawah kemasan. Tidak semua jenis plastik diterima oleh semua fasilitas. Cek ke bank sampah setempat untuk mengetahui jenis yang diterima.',
  },
  {
    ikon: '🌱',
    judul: 'Mulai Kompos Rumahan',
    isi: 'Sisa sayuran, buah, dan daun kering dapat dijadikan kompos. Kompos memperkaya tanah dan mengurangi volume sampah yang harus diangkut ke TPA.',
  },
  {
    ikon: '⚠️',
    judul: 'Jangan Bakar Sampah',
    isi: 'Pembakaran sampah, terutama plastik dan elektronik, menghasilkan gas beracun yang berbahaya bagi kesehatan dan lingkungan. Selalu gunakan fasilitas pengelolaan sampah yang tepat.',
  },
  {
    ikon: '🏦',
    judul: 'Manfaatkan Bank Sampah',
    isi: 'Bank sampah menerima berbagai jenis sampah anorganik dan memberikan nilai tukar. Cari tahu bank sampah terdekat di kelurahan atau komunitas lingkungan Anda.',
  },
];

/* =============================================================
   UTILITAS UMUM
   ============================================================= */

/**
 * Membuat elemen DOM dengan aman (tidak ada innerHTML dari input user).
 * @param {string} tag
 * @param {object} [attrs]
 * @param {string|Node|Array} [children]
 * @returns {HTMLElement}
 */
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'className') node.className = v;
    else if (k === 'style')    Object.assign(node.style, v);
    else node.setAttribute(k, v);
  });
  const items = Array.isArray(children) ? children : [children];
  items.forEach(child => {
    if (child === null || child === undefined) return;
    if (typeof child === 'string') node.appendChild(document.createTextNode(child));
    else node.appendChild(child);
  });
  return node;
}

/**
 * Sanitasi teks agar aman ditampilkan melalui textContent.
 * Trim dan batasi panjang.
 * @param {string} input
 * @param {number} [maxLen=200]
 * @returns {string}
 */
function sanitizeText(input, maxLen = 200) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLen);
}

/**
 * Format angka ke format Indonesia (koma sebagai desimal).
 * @param {number} num
 * @param {number} [decimals=2]
 * @returns {string}
 */
function formatAngka(num, decimals = 2) {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  return num.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
}

/**
 * Format tanggal ISO ke format Indonesia (DD MMM YYYY).
 * @param {string} isoDate
 * @returns {string}
 */
function formatTanggal(isoDate) {
  if (!isoDate) return '-';
  const d = new Date(isoDate + 'T00:00:00');
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Hasilkan ID unik sederhana berbasis waktu + random.
 * @returns {string}
 */
function generateId() {
  return `pc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Tanggal hari ini dalam format YYYY-MM-DD.
 * @returns {string}
 */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/* =============================================================
   TOAST NOTIFIKASI
   ============================================================= */
let toastTimer = null;

/**
 * Tampilkan toast notifikasi.
 * @param {string} pesan
 * @param {'success'|'error'|'info'|'warning'} [tipe='info']
 */
function showToast(pesan, tipe = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  // Hapus kelas tipe sebelumnya
  toast.classList.remove('success', 'error', 'info', 'warning', 'show', 'hidden');
  toast.textContent = sanitizeText(pesan, 150); // aman via textContent
  toast.classList.add(tipe, 'show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 3500);
}

/* =============================================================
   MODAL KONFIRMASI
   ============================================================= */

/**
 * Tampilkan modal konfirmasi.
 * @param {string} judul
 * @param {string} pesan
 * @param {function} onConfirm
 */
function showKonfirmasi(judul, pesan, onConfirm) {
  const overlay = document.getElementById('modal-konfirmasi');
  const titleEl = document.getElementById('modal-title');
  const bodyEl  = document.getElementById('modal-body');
  const btnOk   = document.getElementById('modal-confirm');
  const btnNo   = document.getElementById('modal-cancel');

  // Aman: gunakan textContent
  titleEl.textContent = sanitizeText(judul, 100);
  bodyEl.textContent  = sanitizeText(pesan, 300);
  overlay.classList.remove('hidden');

  // Hapus event listener lama dengan cara clone
  const newBtnOk = btnOk.cloneNode(true);
  const newBtnNo = btnNo.cloneNode(true);
  btnOk.parentNode.replaceChild(newBtnOk, btnOk);
  btnNo.parentNode.replaceChild(newBtnNo, btnNo);

  function tutupModal() {
    overlay.classList.add('hidden');
  }
  newBtnOk.addEventListener('click', () => { tutupModal(); onConfirm(); });
  newBtnNo.addEventListener('click', tutupModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) tutupModal(); }, { once: true });
}

/* =============================================================
   NAVBAR — MOBILE MENU & ACTIVE LINK
   ============================================================= */
function initNavbar() {
  const toggle     = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen   = document.getElementById('icon-open');
  const iconClose  = document.getElementById('icon-close');

  if (!toggle || !mobileMenu) return;

  // ── Mobile hamburger ──
  toggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    const nowOpen = !mobileMenu.classList.contains('hidden');
    toggle.setAttribute('aria-expanded', String(nowOpen));
    iconOpen.classList.toggle('hidden', nowOpen);
    iconClose.classList.toggle('hidden', !nowOpen);
  });

  // Tutup mobile menu saat link diklik
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      toggle.setAttribute('aria-expanded', 'false');
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
    });
  });

  // ── AI Tools Dropdown ──
  const dropdownBtn  = document.getElementById('btn-ai-tools');
  const dropdownMenu = document.getElementById('dropdown-ai-tools');

  if (dropdownBtn && dropdownMenu) {
    // Toggle saat klik tombol
    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdownMenu.classList.toggle('hidden') === false;
      // classList.toggle hidden: returns true if added (now hidden=closed)
      const nowOpen = !dropdownMenu.classList.contains('hidden');
      dropdownBtn.setAttribute('aria-expanded', String(nowOpen));
    });

    // Tutup dropdown saat klik item
    dropdownMenu.querySelectorAll('.nav-dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        dropdownMenu.classList.add('hidden');
        dropdownBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Tutup dropdown saat klik di luar
    document.addEventListener('click', (e) => {
      if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.add('hidden');
        dropdownBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Tutup dropdown saat Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !dropdownMenu.classList.contains('hidden')) {
        dropdownMenu.classList.add('hidden');
        dropdownBtn.setAttribute('aria-expanded', 'false');
        dropdownBtn.focus();
      }
    });
  }

  // ── Active nav link berdasarkan scroll ──
  // Map section ID ke href nav link yang sesuai
  const SECTION_NAV_MAP = {
    beranda: '#beranda',
    dashboard: '#beranda',
    panduan: '#panduan',
    kategori: '#panduan',
    scanner: '#scanner',
    konsultan: '#konsultan',
    upcycling: '#upcycling',
    'eco-challenge': '#eco-challenge',
    checklist: '#eco-challenge',
    catatan: '#catatan',
    tips: null,
    tentang: '#tentang',
  };

  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link, .nav-dropdown-item');

  function updateActiveLink() {
    let current = '';
    sections.forEach(sec => {
      if (sec.getBoundingClientRect().top <= 80) current = sec.id;
    });
    const activeHref = SECTION_NAV_MAP[current] || null;
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (activeHref && href === activeHref) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
        // Juga tandai tombol dropdown jika item aktif ada di dalam dropdown
        if (link.classList.contains('nav-dropdown-item') && dropdownBtn) {
          dropdownBtn.classList.add('active');
        }
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        if (link === dropdownBtn) link.classList.remove('active');
      }
    });
    // Jika tidak ada item dropdown yang aktif, hapus active dari btn
    if (dropdownBtn) {
      const anyDropdownActive = dropdownMenu && !dropdownMenu.classList.contains('hidden') === false &&
        [...(dropdownMenu?.querySelectorAll('.nav-dropdown-item') ?? [])].some(i => i.classList.contains('active'));
      if (!anyDropdownActive) dropdownBtn.classList.remove('active');
      else dropdownBtn.classList.add('active');
    }
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
}

/* =============================================================
   KATEGORI — FILTER LINK
   ============================================================= */
function initKategoriLinks() {
  document.querySelectorAll('[data-filter]').forEach(link => {
    link.addEventListener('click', (e) => {
      const kat = link.getAttribute('data-filter');
      if (!kat) return;
      const filterSelect = document.getElementById('filter-kategori');
      if (filterSelect) {
        filterSelect.value = kat;
        jalankanPencarian();
      }
    });
  });
}

/* =============================================================
   PANDUAN — PENCARIAN & FILTER
   ============================================================= */
function initPencarian() {
  const searchInput = document.getElementById('search-input');
  const filterSel   = document.getElementById('filter-kategori');
  const btnReset    = document.getElementById('btn-reset-search');

  if (!searchInput || !filterSel || !btnReset) return;

  searchInput.addEventListener('input', jalankanPencarian);
  filterSel.addEventListener('change', jalankanPencarian);
  btnReset.addEventListener('click', () => {
    searchInput.value = '';
    filterSel.value = '';
    jalankanPencarian();
    searchInput.focus();
  });

  // Tampilkan semua data saat pertama kali
  jalankanPencarian();
}

function jalankanPencarian() {
  const query = (document.getElementById('search-input')?.value ?? '').trim().toLowerCase();
  const kat   = document.getElementById('filter-kategori')?.value ?? '';

  const hasil = DATA_PANDUAN.filter(item => {
    const cocokKat = !kat || item.kategori === kat;
    const cocokQuery = !query ||
      item.nama.toLowerCase().includes(query) ||
      item.tags.some(t => t.includes(query));
    return cocokKat && cocokQuery;
  });

  renderHasilPencarian(hasil);
}

/**
 * Render hasil pencarian dengan DOM builder (aman, tanpa innerHTML dari input user).
 * @param {Array} hasil
 */
function renderHasilPencarian(hasil) {
  const container = document.getElementById('search-results');
  const emptyMsg  = document.getElementById('search-empty');
  if (!container || !emptyMsg) return;

  // Kosongkan container dengan aman
  while (container.firstChild) container.removeChild(container.firstChild);

  if (hasil.length === 0) {
    container.classList.add('hidden');
    emptyMsg.classList.remove('hidden');
    return;
  }

  container.classList.remove('hidden');
  emptyMsg.classList.add('hidden');

  hasil.forEach(item => {
    const badgeClass = `badge badge-${item.kategori}`;
    const labelKat   = labelKategori(item.kategori);

    const card = el('div', { className: 'panduan-card' }, [
      el('div', { className: 'flex items-start justify-between gap-2 mb-2' }, [
        el('span', { className: 'text-2xl flex-shrink-0', 'aria-hidden': 'true' }, item.ikon),
        el('span', { className: badgeClass }, labelKat),
      ]),
      el('p', { className: 'panduan-nama' }, item.nama),
      el('p', { className: 'panduan-panduan' }, item.panduan),
    ]);

    container.appendChild(card);
  });
}

/**
 * Kembalikan label kategori yang ramah pengguna.
 * @param {string} kat
 * @returns {string}
 */
function labelKategori(kat) {
  const map = { organik: 'Organik', anorganik: 'Anorganik', khusus: 'Penanganan Khusus' };
  return map[kat] || kat;
}

/* =============================================================
   PENYIMPANAN DATA (localStorage)
   ============================================================= */

/**
 * Baca catatan dari localStorage.
 * Validasi struktur; kembalikan array kosong jika rusak.
 * @returns {Array<object>}
 */
function bacaCatatan() {
  try {
    const raw = localStorage.getItem(LS_KEY_CATATAN);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    // Validasi setiap item
    return data.filter(item =>
      item &&
      typeof item === 'object' &&
      typeof item.id       === 'string' &&
      typeof item.nama     === 'string' &&
      typeof item.kategori === 'string' &&
      typeof item.berat    === 'number' &&
      typeof item.tanggal  === 'string'
    );
  } catch {
    // Data rusak — kembalikan array kosong
    return [];
  }
}

/**
 * Simpan catatan ke localStorage.
 * @param {Array<object>} catatan
 */
function simpanCatatan(catatan) {
  try {
    localStorage.setItem(LS_KEY_CATATAN, JSON.stringify(catatan));
  } catch {
    showToast('Gagal menyimpan data. Penyimpanan browser mungkin penuh.', 'error');
  }
}

/**
 * Baca status checklist dari localStorage.
 * @returns {object}
 */
function bacaChecklist() {
  try {
    const raw = localStorage.getItem(LS_KEY_CHECKLIST);
    if (!raw) return {};
    const data = JSON.parse(raw);
    if (typeof data !== 'object' || Array.isArray(data)) return {};
    // Validasi nilai boolean
    const hasil = {};
    Object.entries(data).forEach(([k, v]) => {
      if (typeof k === 'string' && typeof v === 'boolean') hasil[k] = v;
    });
    return hasil;
  } catch {
    return {};
  }
}

/**
 * Simpan status checklist ke localStorage.
 * @param {object} status
 */
function simpanChecklist(status) {
  try {
    localStorage.setItem(LS_KEY_CHECKLIST, JSON.stringify(status));
  } catch {
    // Gagal simpan checklist bukan critical error
  }
}

/* =============================================================
   CATATAN PEMILAHAN — CRUD
   ============================================================= */
let catatanData = []; // cache in-memory

function initCatatan() {
  catatanData = bacaCatatan();
  renderTabelCatatan();
  updateDashboard();

  const form         = document.getElementById('form-catatan');
  const btnCancelEdit = document.getElementById('btn-cancel-edit');

  form.addEventListener('submit', handleSubmitCatatan);
  btnCancelEdit.addEventListener('click', resetFormCatatan);

  // Set tanggal default hari ini
  const inputTanggal = document.getElementById('input-tanggal');
  if (inputTanggal && !inputTanggal.value) inputTanggal.value = todayISO();
}

/**
 * Validasi form catatan.
 * @returns {object|null} data valid atau null jika ada error
 */
function validasiForm() {
  const nama     = sanitizeText(document.getElementById('input-nama').value, 100);
  const kategori = document.getElementById('input-kategori').value;
  const beratRaw = document.getElementById('input-berat').value;
  const tanggal  = document.getElementById('input-tanggal').value;
  let valid = true;

  function setError(id, pesan) {
    const errNode = document.getElementById(id);
    const input = document.getElementById(id.replace('error-', 'input-'));
    if (errNode) {
      errNode.textContent = pesan;
      errNode.classList.toggle('hidden', !pesan);
    }
    if (input) input.classList.toggle('error', !!pesan);
    if (pesan) valid = false;
  }

  // Reset errors
  ['nama', 'kategori', 'berat', 'tanggal'].forEach(f => setError(`error-${f}`, ''));

  if (!nama) setError('error-nama', 'Nama sampah wajib diisi.');
  else if (nama.length < 2) setError('error-nama', 'Nama sampah minimal 2 karakter.');

  if (!kategori) setError('error-kategori', 'Pilih kategori sampah.');

  const berat = parseFloat(beratRaw);
  if (!beratRaw) setError('error-berat', 'Berat wajib diisi.');
  else if (isNaN(berat)) setError('error-berat', 'Berat harus berupa angka.');
  else if (berat < BERAT_MIN) setError('error-berat', `Berat minimal ${BERAT_MIN} kg.`);
  else if (berat > BERAT_MAX) setError('error-berat', `Berat maksimal ${BERAT_MAX} kg per catatan.`);

  if (!tanggal) setError('error-tanggal', 'Tanggal wajib diisi.');
  else {
    const d = new Date(tanggal);
    if (isNaN(d.getTime())) setError('error-tanggal', 'Format tanggal tidak valid.');
  }

  if (!valid) return null;

  return { nama, kategori, berat, tanggal };
}

function handleSubmitCatatan(e) {
  e.preventDefault();
  const data = validasiForm();
  if (!data) return;

  const editId = document.getElementById('edit-id').value;

  if (editId) {
    // UPDATE
    const idx = catatanData.findIndex(c => c.id === editId);
    if (idx !== -1) {
      catatanData[idx] = { ...catatanData[idx], ...data };
      showToast('Catatan berhasil diperbarui.', 'success');
    }
  } else {
    // CREATE
    const newItem = { id: generateId(), ...data };
    catatanData.unshift(newItem); // terbaru di atas
    showToast('Catatan berhasil ditambahkan.', 'success');
  }

  simpanCatatan(catatanData);
  renderTabelCatatan();
  updateDashboard();
  resetFormCatatan();
}

function resetFormCatatan() {
  document.getElementById('form-catatan').reset();
  document.getElementById('edit-id').value = '';
  document.getElementById('input-tanggal').value = todayISO();
  document.getElementById('form-title').textContent = '➕ Tambah Catatan Baru';
  document.getElementById('btn-submit').textContent = 'Simpan Catatan';
  document.getElementById('btn-cancel-edit').classList.add('hidden');
  ['nama', 'kategori', 'berat', 'tanggal'].forEach(f => {
    const errEl   = document.getElementById(`error-${f}`);
    const inputEl = document.getElementById(`input-${f}`);
    if (errEl)   { errEl.textContent = ''; errEl.classList.add('hidden'); }
    if (inputEl) inputEl.classList.remove('error');
  });
}

/**
 * Isi form edit dengan data catatan yang ada.
 * @param {string} id
 */
function editCatatan(id) {
  const item = catatanData.find(c => c.id === id);
  if (!item) return;

  document.getElementById('edit-id').value          = item.id;
  document.getElementById('input-nama').value        = item.nama;
  document.getElementById('input-kategori').value    = item.kategori;
  document.getElementById('input-berat').value       = item.berat;
  document.getElementById('input-tanggal').value     = item.tanggal;
  document.getElementById('form-title').textContent  = '✏️ Edit Catatan';
  document.getElementById('btn-submit').textContent  = 'Perbarui Catatan';
  document.getElementById('btn-cancel-edit').classList.remove('hidden');

  // Scroll ke form
  document.getElementById('form-catatan').scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('input-nama').focus();
}

/**
 * Hapus satu catatan dengan konfirmasi.
 * @param {string} id
 */
function hapusCatatan(id) {
  const item = catatanData.find(c => c.id === id);
  if (!item) return;
  showKonfirmasi(
    'Hapus Catatan',
    `Yakin ingin menghapus catatan "${sanitizeText(item.nama, 60)}"? Tindakan ini tidak dapat dibatalkan.`,
    () => {
      catatanData = catatanData.filter(c => c.id !== id);
      simpanCatatan(catatanData);
      renderTabelCatatan();
      updateDashboard();
      showToast('Catatan berhasil dihapus.', 'info');
    }
  );
}

/**
 * Render seluruh tabel catatan.
 * PENTING: Semua nilai user di-render via textContent / el() builder — tidak ada innerHTML.
 */
function renderTabelCatatan() {
  const tbody     = document.getElementById('tabel-catatan');
  const emptyMsg  = document.getElementById('catatan-empty');
  if (!tbody || !emptyMsg) return;

  while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

  if (catatanData.length === 0) {
    emptyMsg.classList.remove('hidden');
    return;
  }
  emptyMsg.classList.add('hidden');

  catatanData.forEach(item => {
    const badgeClass = `badge badge-${item.kategori}`;
    const tr = el('tr', {}, [
      el('td', {}, sanitizeText(item.nama, 100)),
      el('td', {}, el('span', { className: badgeClass }, labelKategori(item.kategori))),
      el('td', { style: { textAlign: 'right' } }, formatAngka(item.berat)),
      el('td', {}, formatTanggal(item.tanggal)),
      el('td', { style: { textAlign: 'center' } }, [
        (() => {
          const btnEdit = el('button', { className: 'btn-edit', type: 'button', 'aria-label': `Edit catatan ${sanitizeText(item.nama, 60)}` }, 'Edit');
          btnEdit.addEventListener('click', () => editCatatan(item.id));
          return btnEdit;
        })(),
        document.createTextNode(' '),
        (() => {
          const btnDel = el('button', { className: 'btn-delete', type: 'button', 'aria-label': `Hapus catatan ${sanitizeText(item.nama, 60)}` }, 'Hapus');
          btnDel.addEventListener('click', () => hapusCatatan(item.id));
          return btnDel;
        })(),
      ]),
    ]);
    tbody.appendChild(tr);
  });
}

/* =============================================================
   HAPUS SEMUA DATA
   ============================================================= */
function initHapusSemua() {
  const btn = document.getElementById('btn-hapus-semua');
  if (!btn) return;
  btn.addEventListener('click', () => {
    showKonfirmasi(
      'Hapus Semua Data Aktivitas',
      'Yakin ingin menghapus semua catatan pemilahan dan checklist kebiasaan? Tindakan ini tidak dapat dibatalkan dan data tidak dapat dipulihkan.',
      () => {
        try {
          localStorage.removeItem(LS_KEY_CATATAN);
          localStorage.removeItem(LS_KEY_CHECKLIST);
        } catch {
          // Ignore storage error
        }
        catatanData = [];
        renderTabelCatatan();
        updateDashboard();
        renderChecklist();
        showToast('Semua data aktivitas telah dihapus.', 'warning');
      }
    );
  });
}

/* =============================================================
   DASHBOARD RINGKASAN
   ============================================================= */
function updateDashboard() {
  const container = document.getElementById('dashboard-cards');
  if (!container) return;

  const jumlahCatatan = catatanData.length;
  const totalBerat    = catatanData.reduce((sum, c) => sum + (c.berat || 0), 0);

  // Ringkasan per kategori
  const perKat = { organik: 0, anorganik: 0, khusus: 0 };
  catatanData.forEach(c => { if (c.kategori in perKat) perKat[c.kategori]++; });

  // Checklist selesai
  const checkStatus = bacaChecklist();
  const selesai = DATA_KEBIASAAN.filter(k => checkStatus[k.id] === true).length;

  const cards = [
    { ikon: '📋', nilai: jumlahCatatan, label: 'Total Catatan', empty: 'Belum ada catatan' },
    { ikon: '⚖️', nilai: `${formatAngka(totalBerat)} kg`, label: 'Total Berat Dipilah', empty: '0 kg' },
    {
      ikon: '🗂️',
      nilai: `${perKat.organik}O / ${perKat.anorganik}A / ${perKat.khusus}K`,
      label: 'Organik / Anorganik / Khusus',
      empty: '-',
    },
    { ikon: '✅', nilai: `${selesai} / ${DATA_KEBIASAAN.length}`, label: 'Kebiasaan Selesai Hari Ini', empty: '0' },
  ];

  while (container.firstChild) container.removeChild(container.firstChild);

  cards.forEach(card => {
    const cardEl = el('div', { className: 'stat-card' }, [
      el('span', { className: 'stat-icon', 'aria-hidden': 'true' }, card.ikon),
      el('span', { className: 'stat-value' }, String(card.nilai)),
      el('span', { className: 'stat-label' }, card.label),
    ]);
    container.appendChild(cardEl);
  });
}

/* =============================================================
   CHECKLIST KEBIASAAN
   ============================================================= */
function initChecklist() {
  renderChecklist();
}

function renderChecklist() {
  const list     = document.getElementById('checklist-list');
  const barEl    = document.getElementById('progress-bar');
  const labelEl  = document.getElementById('checklist-label');
  const barWrap  = document.getElementById('progress-bar-wrap');
  if (!list) return;

  const status  = bacaChecklist();
  let selesai   = 0;
  const total   = DATA_KEBIASAAN.length;

  while (list.firstChild) list.removeChild(list.firstChild);

  DATA_KEBIASAAN.forEach(item => {
    const checked  = status[item.id] === true;
    if (checked) selesai++;

    const checkboxId = `chk-${item.id}`;
    const li = el('li', { className: `checklist-item${checked ? ' checked' : ''}` });

    const checkbox = el('input', {
      type: 'checkbox',
      id: checkboxId,
      'aria-label': item.teks,
    });
    checkbox.checked = checked;
    checkbox.addEventListener('change', () => toggleKebiasaan(item.id, checkbox.checked));

    const label = el('label', { for: checkboxId }, item.teks);

    li.appendChild(checkbox);
    li.appendChild(label);

    // Klik seluruh li juga toggle
    li.addEventListener('click', (e) => {
      if (e.target !== checkbox && e.target !== label) checkbox.click();
    });

    list.appendChild(li);
  });

  // Update progress bar
  const persen = total > 0 ? Math.round((selesai / total) * 100) : 0;
  if (barEl) {
    barEl.style.width = `${persen}%`;
    // Tampilkan teks persentase jika bar cukup lebar
    const pctEl = document.getElementById('progress-pct');
    if (pctEl) {
      pctEl.textContent = `${persen}%`;
      pctEl.classList.toggle('hidden', persen < 20);
    }
  }
  if (labelEl) labelEl.textContent = `${selesai} / ${total} selesai`;
  if (barWrap) {
    barWrap.setAttribute('aria-valuenow', String(selesai));
    barWrap.setAttribute('aria-valuemax', String(total));
  }

  // Update dashboard (checklist mempengaruhi dashboard)
  updateDashboard();
}

/**
 * Toggle status kebiasaan dan simpan ke localStorage.
 * @param {string} id
 * @param {boolean} nilai
 */
function toggleKebiasaan(id, nilai) {
  const status = bacaChecklist();
  status[id] = nilai;
  simpanChecklist(status);
  renderChecklist();
}

/* =============================================================
   TIPS EDUKASI
   ============================================================= */
function renderTips() {
  const grid = document.getElementById('tips-grid');
  if (!grid) return;

  DATA_TIPS.forEach(tip => {
    const card = el('article', { className: 'tips-card' }, [
      el('div', { className: 'tips-icon', 'aria-hidden': 'true' }, tip.ikon),
      el('h3', { className: 'tips-title' }, tip.judul),
      el('p',  { className: 'tips-body' },  tip.isi),
    ]);
    grid.appendChild(card);
  });
}

/* =============================================================
   INISIALISASI UTAMA
   ============================================================= */
document.addEventListener('DOMContentLoaded', () => {
  try {
    initNavbar();
    initKategoriLinks();
    initPencarian();
    initCatatan();
    initHapusSemua();
    initChecklist();
    renderTips();
    // Modul tambahan — dipanggil dalam handler yang sama agar urutan terjamin
    initScanner();
    initKonsultan();
    initUpcycling();
  } catch (err) {
    // Tampilkan pesan umum tanpa detail teknis
    console.error('PilahCerdas: Terjadi kesalahan saat inisialisasi.', err);
    showToast('Terjadi kesalahan saat memuat aplikasi. Coba muat ulang halaman.', 'error');
  }
});

/* =============================================================
   MODUL 1 — AI WASTE SCANNER (Mode Demo)
   Foto TIDAK dikirim ke server manapun. Analisis menggunakan
   aturan lokal berdasarkan nama file dan ukuran — bukan
   analisis gambar AI sesungguhnya. Label "Mode Demo" ditampilkan
   dengan jelas di antarmuka.
   ============================================================= */

const SCANNER_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const SCANNER_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Data demo scanner: pola nama file → hasil analisis.
 * Dalam mode demo, analisis bersifat ilustratif, bukan AI sungguhan.
 * @type {Array<{keywords:string[], material:string, kategori:string, kondisi:string, panduan:string, peringatan:string|null}>}
 */
const SCANNER_DEMO_DATA = [
  {
    keywords: ['botol', 'plastik', 'pet', 'aqua', 'mineral'],
    material: 'Botol Plastik (kemungkinan PET)',
    kategori: 'anorganik',
    kondisi: 'Tidak dapat dipastikan kondisi barang hanya dari foto. Periksa apakah botol bersih dan tidak penyok parah.',
    panduan: 'Bilas botol hingga bersih, lepaskan tutupnya. Serahkan ke bank sampah atau pengepul plastik setempat. Penerimaan bergantung pada fasilitas di daerah Anda.',
    peringatan: null,
  },
  {
    keywords: ['kardus', 'karton', 'box', 'dus'],
    material: 'Kardus / Karton',
    kategori: 'anorganik',
    kondisi: 'Pastikan kardus kering dan tidak terkontaminasi minyak atau makanan.',
    panduan: 'Lipat atau potong kardus agar hemat ruang. Serahkan ke bank sampah atau pengepul kertas/kardus.',
    peringatan: null,
  },
  {
    keywords: ['kaleng', 'can', 'tin', 'aluminium', 'soda'],
    material: 'Kaleng Logam (baja atau aluminium)',
    kategori: 'anorganik',
    kondisi: 'Bilas kaleng hingga bersih sebelum disimpan untuk daur ulang.',
    panduan: 'Kaleng bersih umumnya diterima oleh pengepul atau bank sampah. Tanyakan terlebih dahulu ke fasilitas setempat.',
    peringatan: null,
  },
  {
    keywords: ['baterai', 'battery', 'batre', 'aa', 'aaa'],
    material: 'Baterai Bekas',
    kategori: 'khusus',
    kondisi: 'Baterai mengandung logam berat yang berbahaya. Jangan dibuang ke tempat sampah biasa.',
    panduan: 'Kumpulkan dalam wadah tertutup. Serahkan ke toko elektronik, supermarket, atau fasilitas pengumpulan baterai yang berwenang.',
    peringatan: '⚠️ Jangan dibuang ke tempat sampah biasa, dibakar, atau dihancurkan. Baterai mengandung bahan kimia berbahaya.',
  },
  {
    keywords: ['hp', 'handphone', 'ponsel', 'smartphone', 'laptop', 'komputer', 'elektronik', 'gadget', 'charger'],
    material: 'Perangkat Elektronik (E-Waste)',
    kategori: 'khusus',
    kondisi: 'Limbah elektronik mengandung logam berat dan bahan berbahaya.',
    panduan: 'Serahkan ke produsen, toko elektronik dengan program take-back, atau fasilitas pengelola e-waste berwenang di daerah Anda.',
    peringatan: '⚠️ Jangan dibuang ke TPA biasa atau dibakar. E-waste mengandung timbal, merkuri, dan kadmium yang berbahaya bagi tanah dan air.',
  },
  {
    keywords: ['daun', 'leaf', 'ranting', 'cabang', 'pohon'],
    material: 'Sampah Organik (Daun / Ranting)',
    kategori: 'organik',
    kondisi: 'Sampah organik yang dapat dikompos.',
    panduan: 'Kumpulkan dan jadikan kompos atau mulsa untuk tanaman. Jangan dibakar — asap pembakaran daun berbahaya bagi kesehatan.',
    peringatan: null,
  },
  {
    keywords: ['makanan', 'sisa', 'nasi', 'sayur', 'buah', 'kulit', 'food', 'organic'],
    material: 'Sisa Makanan / Organik',
    kategori: 'organik',
    kondisi: 'Sampah organik yang dapat diolah menjadi kompos.',
    panduan: 'Masukkan ke tempat sampah organik tertutup atau olah menjadi kompos rumahan.',
    peringatan: null,
  },
  {
    keywords: ['kertas', 'paper', 'koran', 'majalah', 'buku'],
    material: 'Kertas / Kertas Bekas',
    kategori: 'anorganik',
    kondisi: 'Kertas yang bersih dan kering lebih mudah diterima untuk daur ulang.',
    panduan: 'Pisahkan kertas bersih dari yang kotor/berminyak. Serahkan ke bank sampah atau pengepul kertas.',
    peringatan: null,
  },
];

/** Hasil demo default ketika tidak ada kata kunci yang cocok. */
const SCANNER_DEMO_DEFAULT = {
  material: 'Jenis material tidak teridentifikasi',
  kategori: null,
  kondisi: 'Gambar atau nama file tidak memberikan informasi yang cukup untuk identifikasi di Mode Demo.',
  panduan: 'Silakan cari nama barang di bagian Panduan Sampah, atau deskripsikan barang Anda ke Konsultan Eco.',
  peringatan: null,
  uncertain: true,
};

let scannerCurrentFile = null; // File object yang sedang aktif

function initScanner() {
  const dropzone  = document.getElementById('scanner-upload-area');
  const fileInput = document.getElementById('scanner-file-input');
  const btnAnalisis = document.getElementById('btn-scanner-analisis');
  const btnHapus    = document.getElementById('btn-scanner-hapus');
  const btnRetry    = document.getElementById('btn-scanner-retry');

  if (!dropzone || !fileInput) return;

  // Klik dropzone → trigger file input
  dropzone.addEventListener('click', (e) => {
    if (e.target === dropzone || dropzone.contains(e.target)) {
      if (!scannerCurrentFile) fileInput.click();
    }
  });

  // Keyboard: Enter/Space juga trigger
  dropzone.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !scannerCurrentFile) {
      e.preventDefault();
      fileInput.click();
    }
  });

  // File selected via input
  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      scannerTerimaFile(fileInput.files[0]);
    }
  });

  // Drag & Drop
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    const file = e.dataTransfer?.files?.[0];
    if (file) scannerTerimaFile(file);
  });

  // Analisis
  btnAnalisis.addEventListener('click', scannerAnalisis);

  // Hapus foto
  btnHapus.addEventListener('click', scannerReset);

  // Retry
  if (btnRetry) btnRetry.addEventListener('click', scannerReset);
}

/**
 * Validasi dan proses file yang dipilih.
 * @param {File} file
 */
function scannerTerimaFile(file) {
  const errEl = document.getElementById('scanner-file-error');

  // Validasi tipe — tidak bergantung pada nama file, cek MIME type
  if (!SCANNER_ALLOWED_TYPES.includes(file.type)) {
    errEl.textContent = 'Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.';
    errEl.classList.remove('hidden');
    return;
  }

  // Validasi ukuran
  if (file.size > SCANNER_MAX_BYTES) {
    errEl.textContent = `Ukuran file terlalu besar (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksimal 5 MB.`;
    errEl.classList.remove('hidden');
    return;
  }

  errEl.classList.add('hidden');
  errEl.textContent = '';

  // Tampilkan preview via FileReader (tidak dikirim ke server)
  const reader = new FileReader();
  reader.onload = (evt) => {
    const preview = document.getElementById('scanner-preview');
    const placeholder = document.getElementById('scanner-placeholder');
    const dropzone = document.getElementById('scanner-upload-area');
    const btnAnalisis = document.getElementById('btn-scanner-analisis');
    const btnHapus = document.getElementById('btn-scanner-hapus');

    // Tampilkan preview — src adalah data URL lokal, tidak dikirim ke mana-mana
    preview.src = evt.target.result;
    preview.classList.remove('hidden');
    placeholder.classList.add('hidden');
    dropzone.classList.add('has-image');

    btnAnalisis.disabled = false;
    btnAnalisis.setAttribute('aria-disabled', 'false');
    btnHapus.classList.remove('hidden');

    // Sembunyikan hasil sebelumnya
    document.getElementById('scanner-result').classList.add('hidden');
    document.getElementById('scanner-retry').classList.add('hidden');
    document.getElementById('scanner-status').classList.add('hidden');
  };
  reader.onerror = () => {
    errEl.textContent = 'Gagal membaca file gambar. Pastikan file tidak rusak.';
    errEl.classList.remove('hidden');
  };

  scannerCurrentFile = file;
  reader.readAsDataURL(file);
}

/**
 * Jalankan analisis demo berdasarkan nama file.
 * Tidak ada data yang dikirim ke server.
 */
function scannerAnalisis() {
  if (!scannerCurrentFile) return;

  const statusEl = document.getElementById('scanner-status');
  const resultEl = document.getElementById('scanner-result');
  const retryEl  = document.getElementById('scanner-retry');
  const btnAnalisis = document.getElementById('btn-scanner-analisis');

  // Tampilkan status loading
  statusEl.classList.remove('hidden');
  resultEl.classList.add('hidden');
  retryEl.classList.add('hidden');
  btnAnalisis.disabled = true;
  btnAnalisis.setAttribute('aria-disabled', 'true');

  // Simulasi delay analisis (Mode Demo — bukan API call)
  setTimeout(() => {
    statusEl.classList.add('hidden');

    // Analisis berdasarkan nama file (mode demo)
    // CATATAN: Nama file tidak dipercaya sebagai data akurat — hanya untuk demo
    const namaFileLower = scannerCurrentFile.name.toLowerCase().replace(/[^a-z0-9]/g, ' ');
    const hasil = scannerMatchDemoData(namaFileLower);

    scannerTampilkanHasil(hasil, resultEl);
    retryEl.classList.remove('hidden');
  }, 1500);
}

/**
 * Cocokkan nama file dengan data demo.
 * @param {string} namaFileLower
 * @returns {object}
 */
function scannerMatchDemoData(namaFileLower) {
  for (const entry of SCANNER_DEMO_DATA) {
    if (entry.keywords.some(k => namaFileLower.includes(k))) {
      return entry;
    }
  }
  return SCANNER_DEMO_DEFAULT;
}

/**
 * Render hasil analisis demo — semua via DOM builder, tidak ada innerHTML dari data user.
 * @param {object} hasil
 * @param {HTMLElement} container
 */
function scannerTampilkanHasil(hasil, container) {
  while (container.firstChild) container.removeChild(container.firstChild);

  if (hasil.uncertain) {
    // Tampilkan ketidakpastian
    const box = el('div', { className: 'scanner-uncertainty' }, [
      el('p', { className: 'text-2xl mb-2', 'aria-hidden': 'true' }, '🤔'),
      el('p', { className: 'font-medium text-gray-700 mb-1' }, 'Jenis barang tidak dapat diidentifikasi dari nama file.'),
      el('p', {}, hasil.kondisi),
      el('p', { className: 'mt-3 text-xs text-gray-400' }, 'Mode Demo hanya dapat menganalisis berdasarkan nama file. Untuk hasil lebih baik, gunakan nama file yang deskriptif, atau cari secara manual di Panduan Sampah.'),
    ]);
    container.appendChild(box);
  } else {
    const box = el('div', { className: 'scanner-result-box' });

    // Header: material + badge
    const headerRow = el('div', { className: 'flex items-start justify-between gap-3' }, [
      el('div', {}, [
        el('p', { className: 'result-material' }, hasil.material),
        el('p', { className: 'result-meta' }, '⚠️ Mode Demo — bukan analisis AI langsung. Hasil ilustratif.'),
      ]),
      el('span', { className: `badge badge-${hasil.kategori || 'organik'}` }, labelKategori(hasil.kategori || 'organik')),
    ]);
    box.appendChild(headerRow);

    // Kondisi
    const secKondisi = el('div', { className: 'result-section' }, [
      el('p', { className: 'result-label' }, 'Kondisi yang Dapat Diamati'),
      el('p', { className: 'result-value' }, hasil.kondisi),
    ]);
    box.appendChild(secKondisi);

    // Panduan
    const secPanduan = el('div', { className: 'result-section' }, [
      el('p', { className: 'result-label' }, 'Panduan Pemilahan'),
      el('p', { className: 'result-value' }, hasil.panduan),
    ]);
    box.appendChild(secPanduan);

    // Peringatan (jika ada)
    if (hasil.peringatan) {
      const warn = el('div', { className: 'result-warning' }, hasil.peringatan);
      box.appendChild(warn);
    }

    // Disclaimer keyakinan
    const disc = el('p', { className: 'mt-3 text-xs text-gray-400' },
      'Tingkat keyakinan tidak tersedia dalam Mode Demo. Identifikasi mungkin tidak akurat. Selalu verifikasi secara manual.'
    );
    box.appendChild(disc);

    container.appendChild(box);
  }

  container.classList.remove('hidden');
}

/** Reset scanner ke kondisi awal. */
function scannerReset() {
  scannerCurrentFile = null;

  const preview     = document.getElementById('scanner-preview');
  const placeholder = document.getElementById('scanner-placeholder');
  const dropzone    = document.getElementById('scanner-upload-area');
  const fileInput   = document.getElementById('scanner-file-input');
  const btnAnalisis = document.getElementById('btn-scanner-analisis');
  const btnHapus    = document.getElementById('btn-scanner-hapus');
  const errEl       = document.getElementById('scanner-file-error');
  const resultEl    = document.getElementById('scanner-result');
  const retryEl     = document.getElementById('scanner-retry');
  const statusEl    = document.getElementById('scanner-status');

  // Bersihkan preview src untuk melepas object URL dari memori
  preview.src = '';
  preview.classList.add('hidden');
  placeholder.classList.remove('hidden');
  dropzone.classList.remove('has-image', 'drag-over');

  fileInput.value = ''; // Reset file input
  btnAnalisis.disabled = true;
  btnAnalisis.setAttribute('aria-disabled', 'true');
  btnHapus.classList.add('hidden');
  errEl.classList.add('hidden');
  errEl.textContent = '';

  while (resultEl.firstChild) resultEl.removeChild(resultEl.firstChild);
  resultEl.classList.add('hidden');
  retryEl.classList.add('hidden');
  statusEl.classList.add('hidden');
}

/* =============================================================
   MODUL 2 — AI ECO CONSULTANT (Mode Demo)
   Jawaban berasal dari database lokal — bukan model AI generatif.
   Label "Mode Demo" ditampilkan dengan jelas di antarmuka.
   ============================================================= */

/**
 * Database FAQ konsultan eco.
 * Setiap entri memiliki keywords dan jawaban terstruktur.
 * @type {Array<{keywords:string[], jawaban:string}>}
 */
const CHAT_FAQ = [
  {
    keywords: ['kompos', 'komposter', 'pupuk', 'organik', 'dapur', 'sisa makanan'],
    jawaban: `🌱 **Cara Membuat Kompos dari Sisa Dapur**

Kompos rumahan mudah dibuat dari sisa organik dapur. Berikut caranya:

**Bahan yang Bisa Dikompos:**
• Sisa sayuran dan kulit buah
• Ampas kopi dan kantong teh
• Kulit telur (dihancurkan)
• Daun kering dan ranting kecil

**Yang Harus Dihindari:**
• Daging, ikan, dan susu (menimbulkan bau)
• Makanan berminyak
• Plastik atau logam

**Langkah Sederhana:**
1. Siapkan wadah berlubang (pot, ember, atau komposter plastik)
2. Masukkan lapisan coklat (daun kering, kardus) di dasar
3. Tambahkan sisa organik dapur (lapisan hijau)
4. Tutup dengan lapisan coklat lagi
5. Aduk setiap 3–7 hari dan jaga kelembapan
6. Dalam 4–8 minggu, kompos siap digunakan

💡 Tip: Cacah bahan menjadi potongan kecil agar proses dekomposisi lebih cepat.`,
  },
  {
    keywords: ['plastik', 'botol', 'daur ulang', 'recycle', 'pet', 'hdpe'],
    jawaban: `♻️ **Cara Mengelola Sampah Plastik**

Tidak semua plastik dapat langsung didaur ulang. Berikut panduannya:

**Kenali Kode Plastik (nomor segitiga di kemasan):**
• Kode 1 (PET) — botol minuman: umumnya diterima
• Kode 2 (HDPE) — botol deterjen/susu: umumnya diterima
• Kode 5 (PP) — wadah makanan: tergantung fasilitas
• Kode 3, 6, 7 — perlu penanganan khusus

**Persiapan Sebelum Diserahkan:**
1. Bilas dan keringkan kemasan plastik
2. Lepaskan tutup (serahkan terpisah)
3. Hindari plastik kotor atau berminyak

**Ke Mana Menyerahkan:**
• Bank sampah di kelurahan setempat
• Pengepul atau lapak plastik
• Program drop-off brand tertentu

⚠️ Catatan: Penerimaan bergantung pada fasilitas di daerah Anda. Selalu konfirmasi ke bank sampah setempat.`,
  },
  {
    keywords: ['baterai', 'elektronik', 'ewaste', 'e-waste', 'lampu', 'tl', 'b3', 'berbahaya'],
    jawaban: `⚠️ **Penanganan Sampah Berbahaya (B3)**

Sampah B3 tidak boleh dibuang ke tempat sampah biasa atau dibakar.

**Jenis Sampah B3 Rumah Tangga:**
• Baterai bekas (AA, AAA, lithium)
• Ponsel dan laptop rusak
• Lampu TL, CFL, dan LED bekas
• Cat, pelarut, dan oli bekas

**Cara Penanganan yang Aman:**
1. Simpan dalam wadah tertutup dan beri label "B3"
2. Jangan dihancurkan atau dibuka paksa
3. Jauhkan dari jangkauan anak-anak

**Tempat Pengumpulan:**
• Toko elektronik besar (program take-back)
• Bank sampah khusus B3
• Fasilitas pengelola limbah B3 resmi di kota Anda
• Dinas Lingkungan Hidup setempat untuk informasi lebih lanjut

🔍 Cari informasi fasilitas terdekat di website Dinas Lingkungan Hidup kota Anda.`,
  },
  {
    keywords: ['bank sampah', 'serahkan', 'kumpulkan', 'jual', 'pengepul'],
    jawaban: `🏦 **Memanfaatkan Bank Sampah**

Bank sampah adalah fasilitas yang menerima sampah daur ulang dan memberikan nilai tukar.

**Yang Biasanya Diterima:**
• Kertas dan kardus bersih
• Botol plastik bersih (PET, HDPE)
• Kaleng aluminium dan baja
• Botol kaca bersih

**Cara Memanfaatkan Bank Sampah:**
1. Cari bank sampah terdekat via kelurahan atau internet
2. Pisahkan dan cuci sampah sebelum diserahkan
3. Daftarkan diri sebagai nasabah
4. Setorkan sampah secara berkala dan dapatkan nilai tukar

**Tips:**
• Timbun dahulu sampah yang cukup banyak agar efisien
• Tanyakan item apa saja yang diterima di bank sampah tersebut
• Beberapa bank sampah juga menerima sampah organik untuk kompos

💡 Catatan: Tidak semua bank sampah menerima jenis yang sama. Konfirmasi terlebih dahulu.`,
  },
  {
    keywords: ['kurangi', 'reduce', 'zero waste', 'sampah rumah', 'minimalis'],
    jawaban: `🌿 **Tips Mengurangi Sampah Rumah Tangga**

Mengurangi sampah lebih baik daripada mendaur ulang. Berikut langkah praktisnya:

**Prinsip 5R:**
1. **Refuse** — tolak barang yang tidak perlu (kantong plastik, sedotan)
2. **Reduce** — kurangi konsumsi
3. **Reuse** — gunakan kembali wadah, tas, dan botol
4. **Recycle** — daur ulang yang masih bisa
5. **Rot** — komposkan sisa organik

**Langkah Praktis:**
• Bawa tas belanja sendiri
• Gunakan botol minum isi ulang
• Beli produk dengan kemasan minimal
• Pilih produk isi ulang (refill)
• Simpan makanan dengan benar agar tidak terbuang

**Target Realistis:**
Mulai dari satu kebiasaan kecil per minggu. Perubahan konsisten lebih efektif dari perubahan besar yang tidak bertahan.`,
  },
  {
    keywords: ['kerajinan', 'diy', 'kreatif', 'upcycle', 'daur ulang', 'buat'],
    jawaban: `🎨 **Ide Kerajinan dari Barang Bekas**

Upcycling mengubah barang bekas menjadi produk bernilai lebih tinggi.

**Ide Sederhana:**
• Botol plastik → pot tanaman, tempat pensil, lampu hias
• Kardus → organizer meja, rak buku mini, mainan anak
• Kaleng → tempat lilin, pot bunga, wadah alat tulis
• Kain bekas → totebag, lap dapur, sarung bantal

**Tips Memulai:**
1. Pilih satu barang yang paling banyak menumpuk di rumah
2. Cari referensi di platform video atau media sosial
3. Siapkan alat yang diperlukan (gunting, lem, cat)
4. Mulai dari proyek mudah dulu

💡 Gunakan fitur **Generator Ide Upcycling** di website ini untuk mendapatkan panduan langkah demi langkah!

⚠️ Tips Keselamatan: Gunakan sarung tangan saat memotong kaleng atau bahan tajam. Pastikan area kerja memiliki ventilasi jika menggunakan cat atau lem berbahan solvent.`,
  },
  {
    keywords: ['organik', 'sisa sayur', 'sayuran', 'buah', 'daun', 'tanaman'],
    jawaban: `🌱 **Pengelolaan Sampah Organik Rumah Tangga**

Sampah organik adalah sampah yang berasal dari makhluk hidup dan dapat terurai secara alami.

**Contoh Sampah Organik:**
• Sisa sayuran dan buah-buahan
• Kulit buah dan biji
• Ampas kopi dan teh
• Daun kering, rumput, ranting kecil
• Sisa nasi dan makanan yang tidak mengandung daging

**Pilihan Pengelolaan:**
1. **Kompos aerobik** — wadah terbuka dengan aerasi, cocok untuk lahan
2. **Komposter plastik** — praktis untuk dapur apartemen
3. **Lubang biopori** — gali lubang di tanah, masukkan organik secara berkala
4. **Eco-enzyme** — fermentasi kulit buah + gula + air selama 3 bulan menghasilkan cairan pembersih alami

**Yang Tidak Boleh Dikompos:**
• Daging, tulang, ikan (bau dan hama)
• Produk susu (bau)
• Makanan berminyak banyak`,
  },
];

/** Pesan sambutan chatbot */
const CHAT_WELCOME = `Halo! 👋 Saya adalah Konsultan Eco Cerdas PilahCerdas.

Saya siap membantu Anda dengan:
• 🗑️ Panduan pemilahan dan pengelolaan sampah
• ♻️ Cara daur ulang barang bekas
• 🌱 Pengelolaan sampah organik dan kompos
• 🎨 Ide kerajinan upcycling
• 🏦 Informasi bank sampah dan fasilitas
• 🌿 Tips mengurangi sampah rumah tangga

Silakan ketik pertanyaan Anda atau pilih salah satu topik di atas.`;

/** Saran pertanyaan awal */
const CHAT_SUGGESTIONS = [
  'Bagaimana cara membuat kompos?',
  'Ke mana menyerahkan baterai bekas?',
  'Cara mengelola sampah plastik',
  'Tips mengurangi sampah rumah tangga',
  'Ide kerajinan dari barang bekas',
];

/** Riwayat chat selama sesi berlangsung (tidak disimpan ke localStorage) */
let chatHistory = [];

function initKonsultan() {
  renderChatSuggestions();
  renderChatWelcome();

  const form     = document.getElementById('chat-form');
  const btnReset = document.getElementById('btn-chat-reset');

  if (form) form.addEventListener('submit', handleChatKirim);
  if (btnReset) btnReset.addEventListener('click', chatReset);
}

function renderChatWelcome() {
  const win = document.getElementById('chat-window');
  if (!win) return;
  while (win.firstChild) win.removeChild(win.firstChild);

  const bubble = el('div', { className: 'chat-bubble bot' }, CHAT_WELCOME);
  win.appendChild(bubble);
}

function renderChatSuggestions() {
  const container = document.getElementById('chat-suggestions');
  if (!container) return;
  while (container.firstChild) container.removeChild(container.firstChild);

  CHAT_SUGGESTIONS.forEach(saran => {
    const chip = el('button', {
      className: 'suggestion-chip',
      type: 'button',
      'aria-label': `Tanyakan: ${saran}`,
    }, saran);
    chip.addEventListener('click', () => {
      const input = document.getElementById('chat-input');
      if (input) {
        input.value = saran;
        input.focus();
      }
    });
    container.appendChild(chip);
  });
}

function handleChatKirim(e) {
  e.preventDefault();
  const input  = document.getElementById('chat-input');
  const errEl  = document.getElementById('chat-input-error');
  const pertanyaan = sanitizeText(input.value, 300);

  errEl.classList.add('hidden');
  errEl.textContent = '';

  if (!pertanyaan) {
    errEl.textContent = 'Tulis pertanyaan terlebih dahulu.';
    errEl.classList.remove('hidden');
    return;
  }
  if (pertanyaan.length < 3) {
    errEl.textContent = 'Pertanyaan terlalu pendek. Tuliskan pertanyaan yang lebih lengkap.';
    errEl.classList.remove('hidden');
    return;
  }

  // Tambah bubble user
  chatTambahBubble(pertanyaan, 'user');
  input.value = '';
  chatHistory.push({ role: 'user', teks: pertanyaan });

  // Tampilkan indikator mengetik
  const typingId = chatTambahBubble('sedang mengetik...', 'bot-typing');

  // Simulasi delay respons
  setTimeout(() => {
    chatHapusBubble(typingId);
    const jawaban = chatCarijawaban(pertanyaan);
    chatTambahBubble(jawaban, 'bot');
    chatHistory.push({ role: 'bot', teks: jawaban });
  }, 700);
}

/**
 * Cari jawaban dari FAQ lokal berdasarkan kemiripan kata kunci.
 * @param {string} pertanyaan
 * @returns {string}
 */
function chatCarijawaban(pertanyaan) {
  const q = pertanyaan.toLowerCase();

  // Skor berdasarkan jumlah keyword yang cocok
  let bestMatch = null;
  let bestScore = 0;

  for (const faq of CHAT_FAQ) {
    const score = faq.keywords.filter(k => q.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  if (bestMatch && bestScore > 0) return bestMatch.jawaban;

  // Tidak ditemukan
  return `Maaf, saya belum memiliki informasi spesifik untuk pertanyaan tersebut dalam database lokal saya.

Beberapa hal yang dapat Anda coba:
• 🔍 Cari nama barang di bagian **Panduan Sampah**
• 💡 Coba pertanyaan dengan kata kunci lebih spesifik (misalnya: "kompos", "plastik", "baterai")
• 🏛️ Hubungi Dinas Lingkungan Hidup kota Anda untuk informasi fasilitas setempat

Topik yang dapat saya bantu: kompos, plastik, baterai, elektronik, bank sampah, mengurangi sampah, kerajinan, dan sampah organik.`;
}

let chatBubbleIdCounter = 0;

/**
 * Tambah bubble percakapan ke chat window.
 * @param {string} teks - Teks yang akan ditampilkan (data lokal/statis, bukan input user langsung)
 * @param {'user'|'bot'|'bot-typing'|'system'} tipe
 * @returns {string} id bubble
 */
function chatTambahBubble(teks, tipe) {
  const win = document.getElementById('chat-window');
  if (!win) return '';

  const id = `bubble-${++chatBubbleIdCounter}`;
  const bubble = el('div', { className: `chat-bubble ${tipe}`, id });

  // Teks user disanitasi dan ditampilkan via textContent (aman)
  // Teks bot (data statis dari FAQ) juga via textContent
  bubble.textContent = tipe === 'user' ? sanitizeText(teks, 300) : teks;
  win.appendChild(bubble);

  // Auto-scroll ke bawah
  win.scrollTop = win.scrollHeight;
  return id;
}

/**
 * Hapus bubble berdasarkan ID (untuk menghapus indikator mengetik).
 * @param {string} id
 */
function chatHapusBubble(id) {
  if (!id) return;
  const el2 = document.getElementById(id);
  if (el2) el2.remove();
}

function chatReset() {
  chatHistory = [];
  renderChatWelcome();
}

/* =============================================================
   MODUL 3 — UPCYCLING IDEA GENERATOR (Aturan Lokal)
   Rekomendasi dari database lokal — bukan AI generatif.
   Label jelas ditampilkan di antarmuka.
   ============================================================= */

/**
 * Database ide upcycling.
 * keywords: kata yang cocok dengan input barang pengguna.
 * tujuan: kategori tujuan yang cocok.
 * kesulitan: tingkat kesulitan.
 * @type {Array<object>}
 */
const UPCYCLING_DATABASE = [
  {
    id: 'uc01',
    ikon: '🪴',
    judul: 'Pot Tanaman dari Botol Plastik',
    keywords: ['botol', 'plastik', 'pet'],
    tujuan: ['dekorasi', 'rumah'],
    kesulitan: ['mudah'],
    waktu: '15–30 menit',
    deskripsi: 'Ubah botol plastik bekas menjadi pot tanaman gantung atau meja yang cantik dan fungsional.',
    bahan: ['Botol plastik bekas', 'Tanah dan bibit tanaman', 'Tali/benang (opsional untuk gantung)', 'Cat akrilik (opsional)'],
    alat: ['Gunting atau cutter', 'Paku atau obeng untuk membuat lubang drainase', 'Spidol untuk menandai'],
    langkah: [
      'Cuci bersih botol plastik dan keringkan.',
      'Potong botol menjadi dua bagian. Bagian bawah digunakan sebagai pot.',
      'Buat 3–5 lubang kecil di bagian dasar untuk drainase.',
      'Cat bagian luar botol jika ingin tampilan lebih menarik (opsional). Tunggu kering.',
      'Masukkan tanah dan bibit tanaman.',
      'Siram secukupnya dan letakkan di tempat yang mendapat sinar matahari.',
    ],
    tips_keselamatan: 'Gunakan sarung tangan saat memotong botol. Tepi plastik yang baru dipotong bisa tajam.',
    sisa_material: 'Bagian atas botol dapat dijadikan corong atau mini-greenhouse untuk bibit.',
    tags: ['botol plastik', 'tanaman', 'dekorasi'],
  },
  {
    id: 'uc02',
    ikon: '✏️',
    judul: 'Tempat Pensil dari Botol Plastik',
    keywords: ['botol', 'plastik', 'pet', 'hdpe'],
    tujuan: ['penyimpanan', 'kerajinan'],
    kesulitan: ['mudah'],
    waktu: '10–20 menit',
    deskripsi: 'Botol plastik kecil dapat disulap menjadi tempat pensil atau organizer meja yang praktis.',
    bahan: ['Botol plastik bekas (ukuran 500ml–1L)', 'Kain perca atau kertas kado untuk dekorasi', 'Lem'],
    alat: ['Gunting', 'Spidol'],
    langkah: [
      'Cuci bersih botol dan keringkan.',
      'Tandai ketinggian yang diinginkan (sekitar 10–12 cm dari dasar).',
      'Potong botol sesuai tanda.',
      'Ampelas atau gunakan selotip di tepi potongan agar tidak tajam.',
      'Dekorasi bagian luar dengan kain perca, kertas, atau cat.',
      'Tempatkan di meja sebagai organizer pensil dan alat tulis.',
    ],
    tips_keselamatan: 'Ampelas tepi potongan plastik untuk menghilangkan sisi tajam sebelum digunakan.',
    sisa_material: 'Bagian atas botol bisa digunakan sebagai corong kecil.',
    tags: ['botol plastik', 'organizer', 'penyimpanan'],
  },
  {
    id: 'uc03',
    ikon: '📦',
    judul: 'Organizer Meja dari Kardus',
    keywords: ['kardus', 'karton', 'box', 'dus'],
    tujuan: ['penyimpanan', 'rumah'],
    kesulitan: ['mudah', 'sedang'],
    waktu: '30–60 menit',
    deskripsi: 'Gunakan kardus bekas untuk membuat organizer meja dengan sekat-sekat yang dapat dikustomisasi.',
    bahan: ['Kardus bekas (tebal lebih baik)', 'Kertas kado atau majalah bekas', 'Lem putih atau lem bakar', 'Cat atau spidol warna (opsional)'],
    alat: ['Cutter', 'Penggaris', 'Pensil', 'Kuas atau spons'],
    langkah: [
      'Ukur dan tandai ukuran organizer yang diinginkan di kardus.',
      'Potong kardus sesuai ukuran untuk bagian luar dan sekat dalam.',
      'Susun dan rekatkan bagian luar terlebih dahulu hingga membentuk kotak.',
      'Buat sekat-sekat sesuai kebutuhan dan rekatkan di dalam kotak.',
      'Tunggu lem kering selama minimal 30 menit.',
      'Lapisi bagian luar dengan kertas kado atau cat untuk tampilan lebih rapi.',
    ],
    tips_keselamatan: 'Hati-hati saat menggunakan cutter. Selalu potong menjauhi tubuh dan gunakan alas potong.',
    sisa_material: 'Potongan kardus kecil dapat digunakan sebagai label atau kartu ucapan.',
    tags: ['kardus', 'organizer', 'meja'],
  },
  {
    id: 'uc04',
    ikon: '🕯️',
    judul: 'Tempat Lilin dari Kaleng Bekas',
    keywords: ['kaleng', 'can', 'tin', 'aluminium'],
    tujuan: ['dekorasi'],
    kesulitan: ['mudah', 'sedang'],
    waktu: '20–40 menit',
    deskripsi: 'Kaleng bekas yang dilubangi dengan pola tertentu akan memancarkan cahaya lilin yang indah sebagai dekorasi ruangan.',
    bahan: ['Kaleng bekas (isi dengan air dan bekukan dahulu)', 'Lilin tea light', 'Cat semprot (opsional)'],
    alat: ['Paku berbagai ukuran', 'Palu', 'Spidol untuk menandai pola', 'Tang'],
    langkah: [
      'Isi kaleng dengan air sampai penuh lalu bekukan selama semalam. (Es membantu kaleng tidak penyok saat dipaku.)',
      'Gambar pola titik-titik di bagian luar kaleng menggunakan spidol.',
      'Gunakan paku dan palu untuk melubangi kaleng mengikuti pola.',
      'Biarkan es mencair, keringkan kaleng.',
      'Haluskan tepi tajam di dalam kaleng menggunakan tang jika perlu.',
      'Cat bagian luar jika diinginkan. Masukkan lilin tea light.',
    ],
    tips_keselamatan: 'Periksa bagian dalam kaleng dari tepi tajam sebelum memasukkan tangan. Gunakan sarung tangan.',
    sisa_material: 'Tutup kaleng yang terpisah dapat dibuat menjadi gantungan kunci atau ornamen kecil.',
    tags: ['kaleng', 'lilin', 'dekorasi', 'cahaya'],
  },
  {
    id: 'uc05',
    ikon: '🌸',
    judul: 'Bunga Hias dari Botol Plastik',
    keywords: ['botol', 'plastik'],
    tujuan: ['dekorasi', 'kerajinan'],
    kesulitan: ['sedang'],
    waktu: '45–90 menit',
    deskripsi: 'Potong bagian bawah botol plastik menjadi mahkota bunga yang cantik untuk dekorasi atau hadiah.',
    bahan: ['Botol plastik bening ukuran 600ml', 'Cat akrilik berbagai warna', 'Kawat florist atau tusuk sate', 'Lem tembak'],
    alat: ['Gunting', 'Korek api (untuk melelehkan tepi)', 'Kuas cat'],
    langkah: [
      'Potong bagian bawah botol setinggi 3–4 cm (ini akan menjadi mahkota bunga).',
      'Gunting bagian tepi membentuk kelopak bunga (8–12 kelopak).',
      'Hangatkan sedikit kelopak dengan korek api (hati-hati) agar melengkung alami — opsional.',
      'Cat setiap kelopak dengan warna yang diinginkan. Biarkan kering.',
      'Pasang kawat atau tusuk sate sebagai tangkai menggunakan lem tembak.',
      'Tambahkan daun dari botol plastik hijau untuk tampilan lebih nyata.',
    ],
    tips_keselamatan: 'Lakukan pemanasan plastik di area berventilasi baik. Jangan menghirup asap plastik yang terbakar. Awasi anak-anak.',
    sisa_material: 'Sisa tubuh botol dapat dibuat menjadi pot kecil atau tempat pensil.',
    tags: ['botol plastik', 'bunga', 'dekorasi', 'hadiah'],
  },
  {
    id: 'uc06',
    ikon: '🗂️',
    judul: 'Rak Buku Mini dari Kardus',
    keywords: ['kardus', 'karton'],
    tujuan: ['penyimpanan', 'rumah'],
    kesulitan: ['sedang'],
    waktu: '60–120 menit',
    deskripsi: 'Buat rak buku atau majalah mini dari kardus tebal yang kuat dan tahan lama.',
    bahan: ['Kardus tebal bekas (2–3 lapis)', 'Lem kayu atau lem tembak', 'Cat atau decoupage', 'Kertas kado atau kain perca'],
    alat: ['Cutter', 'Penggaris besi', 'Kuas', 'Pensil'],
    langkah: [
      'Rencanakan ukuran rak (tinggi, lebar, kedalaman). Gambar pola di kardus.',
      'Potong beberapa lapis kardus untuk setiap bagian dan tumpuk untuk ketebalan lebih.',
      'Rekatkan tumpukan kardus dengan lem dan beri beban di atasnya selama kering.',
      'Susun bagian-bagian rak: dasar, sisi kiri-kanan, dan sekat tengah.',
      'Rekatkan semua bagian dan tunggu benar-benar kering (minimal 2 jam).',
      'Lapisi seluruh permukaan dengan cat atau kertas kado untuk memperkuat dan memperindah.',
    ],
    tips_keselamatan: 'Kardus rak tidak cocok untuk beban berat atau lingkungan lembap. Batasi penggunaan untuk buku ringan dan majalah.',
    sisa_material: 'Potongan kardus kecil dapat dijadikan label buku atau kartu.',
    tags: ['kardus', 'rak', 'buku', 'penyimpanan'],
  },
  {
    id: 'uc07',
    ikon: '🎵',
    judul: 'Celengan Unik dari Kaleng',
    keywords: ['kaleng', 'can', 'tin'],
    tujuan: ['kerajinan', 'penyimpanan'],
    kesulitan: ['mudah'],
    waktu: '20–30 menit',
    deskripsi: 'Kaleng bekas yang didekorasi menjadi celengan atau tempat menyimpan uang yang lucu.',
    bahan: ['Kaleng dengan tutup plastik (kaleng biskuit/keripik)', 'Cat akrilik', 'Stiker atau kertas dekorasi', 'Lem'],
    alat: ['Gunting', 'Kuas', 'Cutter atau obeng untuk membuat celah'],
    langkah: [
      'Bersihkan kaleng dan keringkan.',
      'Buat celah di bagian tengah tutup kaleng selebar 0.5 cm dan panjang 3 cm menggunakan cutter.',
      'Haluskan tepi celah agar tidak tajam.',
      'Cat bagian luar kaleng sesuai selera. Biarkan kering.',
      'Hiasi dengan stiker, gambar, atau tulisan nama.',
      'Celengan siap digunakan!',
    ],
    tips_keselamatan: 'Pastikan tepi celah tidak tajam agar aman digunakan terutama untuk anak-anak.',
    sisa_material: 'Jika kaleng tidak memiliki tutup plastik, gunakan lingkaran kardus yang dipotong dan dilubangi.',
    tags: ['kaleng', 'celengan', 'anak-anak'],
  },
  {
    id: 'uc08',
    ikon: '🪑',
    judul: 'Lampu Hias dari Botol Kaca',
    keywords: ['botol', 'kaca', 'glass'],
    tujuan: ['dekorasi'],
    kesulitan: ['sedang'],
    waktu: '30–60 menit',
    deskripsi: 'Botol kaca bekas menjadi lampu hias yang elegan dengan memasukkan lampu string LED di dalamnya.',
    bahan: ['Botol kaca bening bekas', 'Lampu string LED (battery-operated)', 'Batu atau kerikil dekorasi (opsional)', 'Pita atau benang rami'],
    alat: ['Kain lap', 'Gunting'],
    langkah: [
      'Cuci bersih botol kaca dan keringkan dengan sempurna.',
      'Masukkan kerikil dekorasi secukupnya ke dasar botol (opsional).',
      'Masukkan ujung kabel lampu string LED ke dalam botol secara perlahan.',
      'Pastikan bagian kotak baterai berada di luar botol atau di mulut botol.',
      'Atur lampu string agar tersebar merata di dalam botol.',
      'Dekorasi bagian luar leher botol dengan pita atau benang rami.',
    ],
    tips_keselamatan: 'Gunakan hanya LED battery-operated, bukan lampu yang tersambung listrik langsung. Periksa kondisi botol — jangan gunakan botol yang retak atau pecah.',
    sisa_material: 'Botol kaca gelap dapat digunakan untuk membuat flower vase atau terrarium.',
    tags: ['botol kaca', 'lampu', 'LED', 'dekorasi'],
  },
];

let ucSelectedId = null;

function initUpcycling() {
  const form = document.getElementById('upcycling-form');
  if (form) form.addEventListener('submit', handleUcGenerate);
}

function handleUcGenerate(e) {
  e.preventDefault();
  const barangRaw    = sanitizeText(document.getElementById('uc-barang').value, 80);
  const tujuan       = document.getElementById('uc-tujuan').value;
  const kesulitan    = document.getElementById('uc-kesulitan').value;
  const errEl        = document.getElementById('uc-error-barang');

  errEl.classList.add('hidden');
  errEl.textContent = '';
  document.getElementById('uc-barang').classList.remove('error');

  if (!barangRaw || barangRaw.length < 2) {
    errEl.textContent = 'Masukkan jenis barang bekas terlebih dahulu (minimal 2 karakter).';
    errEl.classList.remove('hidden');
    document.getElementById('uc-barang').classList.add('error');
    return;
  }

  ucSelectedId = null;
  const kata = barangRaw.toLowerCase().split(/[\s,\/]+/).filter(Boolean);

  // Filter berdasarkan keyword barang, tujuan, dan kesulitan
  const cocok = UPCYCLING_DATABASE.filter(ide => {
    const cocokBarang    = ide.keywords.some(k => kata.some(w => k.includes(w) || w.includes(k)));
    const cocokTujuan    = ide.tujuan.includes(tujuan);
    const cocokKesulitan = ide.kesulitan.includes(kesulitan);
    // Cocok barang wajib; tujuan dan kesulitan sebagai bobot
    return cocokBarang && (cocokTujuan || cocokKesulitan);
  });

  // Jika tidak ada yang benar-benar cocok, tampilkan yang cocok keyword saja
  const fallback = cocok.length === 0
    ? UPCYCLING_DATABASE.filter(ide => ide.keywords.some(k => kata.some(w => k.includes(w) || w.includes(k))))
    : cocok;

  ucTampilkanHasil(fallback);
}

/**
 * Render kartu ide upcycling.
 * @param {Array} ideDaftar
 */
function ucTampilkanHasil(ideDaftar) {
  const resultsDiv  = document.getElementById('uc-results');
  const cardsDiv    = document.getElementById('uc-idea-cards');
  const detailDiv   = document.getElementById('uc-detail');
  const emptyDiv    = document.getElementById('uc-empty');

  // Sembunyikan detail panel
  detailDiv.classList.add('hidden');
  while (detailDiv.firstChild) detailDiv.removeChild(detailDiv.firstChild);

  if (ideDaftar.length === 0) {
    resultsDiv.classList.add('hidden');
    emptyDiv.classList.remove('hidden');
    return;
  }

  emptyDiv.classList.add('hidden');
  resultsDiv.classList.remove('hidden');

  while (cardsDiv.firstChild) cardsDiv.removeChild(cardsDiv.firstChild);

  ideDaftar.forEach(ide => {
    const card = el('article', {
      className: 'uc-idea-card',
      tabindex: '0',
      role: 'button',
      'aria-label': `Lihat detail: ${ide.judul}`,
      'data-id': ide.id,
    });

    const iconEl   = el('div', { className: 'uc-icon', 'aria-hidden': 'true' }, ide.ikon);
    const titleEl  = el('p', { className: 'uc-title' }, ide.judul);
    const metaEl   = el('p', { className: 'uc-meta' }, `⏱ ${ide.waktu}`);
    const tagsCont = el('div', { className: 'uc-tags' });
    ide.tags.forEach(t => {
      tagsCont.appendChild(el('span', { className: 'badge badge-anorganik text-xs' }, t));
    });

    card.appendChild(iconEl);
    card.appendChild(titleEl);
    card.appendChild(metaEl);
    card.appendChild(tagsCont);

    card.addEventListener('click', () => ucTampilkanDetail(ide.id));
    card.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ucTampilkanDetail(ide.id); }
    });

    cardsDiv.appendChild(card);
  });

  // Scroll ke hasil
  resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Tampilkan detail satu ide upcycling.
 * Semua data dari database statis — aman untuk ditampilkan via textContent.
 * @param {string} id
 */
function ucTampilkanDetail(id) {
  const ide = UPCYCLING_DATABASE.find(u => u.id === id);
  if (!ide) return;

  // Update selected state pada kartu
  ucSelectedId = id;
  document.querySelectorAll('.uc-idea-card').forEach(c => {
    c.classList.toggle('selected', c.getAttribute('data-id') === id);
  });

  const detailDiv = document.getElementById('uc-detail');
  while (detailDiv.firstChild) detailDiv.removeChild(detailDiv.firstChild);

  // Header
  const header = el('div', { className: 'flex items-start justify-between gap-3 mb-4' }, [
    el('div', {}, [
      el('div', { className: 'flex items-center gap-2 mb-1' }, [
        el('span', { 'aria-hidden': 'true' }, ide.ikon),
        el('h4', { className: 'text-base font-bold text-gray-800' }, ide.judul),
      ]),
      el('p', { className: 'text-sm text-gray-500' }, ide.deskripsi),
    ]),
    el('span', { className: `uc-difficulty-badge ${ide.kesulitan[0]}` },
      ide.kesulitan[0] === 'mudah' ? '⭐ Mudah' : ide.kesulitan[0] === 'sedang' ? '⭐⭐ Sedang' : '⭐⭐⭐ Sulit'
    ),
  ]);
  detailDiv.appendChild(header);

  // Waktu
  detailDiv.appendChild(
    el('p', { className: 'text-xs text-gray-400 mb-4' }, `⏱ Perkiraan waktu: ${ide.waktu}`)
  );

  // Bahan & Alat (dua kolom)
  const bahanAlat = el('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4' });

  const secBahan = el('div', {}, [
    el('p', { className: 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2' }, '🧰 Bahan'),
  ]);
  const ulBahan = el('ul', { className: 'space-y-1' });
  ide.bahan.forEach(b => ulBahan.appendChild(el('li', { className: 'text-sm text-gray-600 flex gap-1' }, [
    el('span', { 'aria-hidden': 'true' }, '•'),
    el('span', {}, b),
  ])));
  secBahan.appendChild(ulBahan);

  const secAlat = el('div', {}, [
    el('p', { className: 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2' }, '🔧 Alat'),
  ]);
  const ulAlat = el('ul', { className: 'space-y-1' });
  ide.alat.forEach(a => ulAlat.appendChild(el('li', { className: 'text-sm text-gray-600 flex gap-1' }, [
    el('span', { 'aria-hidden': 'true' }, '•'),
    el('span', {}, a),
  ])));
  secAlat.appendChild(ulAlat);

  bahanAlat.appendChild(secBahan);
  bahanAlat.appendChild(secAlat);
  detailDiv.appendChild(bahanAlat);

  // Langkah-langkah
  const secLangkah = el('div', { className: 'mb-4' }, [
    el('p', { className: 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3' }, '📋 Langkah Pembuatan'),
  ]);
  ide.langkah.forEach((l, i) => {
    const step = el('div', { className: 'uc-step' }, [
      el('span', { className: 'uc-step-num', 'aria-hidden': 'true' }, String(i + 1)),
      el('span', { className: 'uc-step-text' }, l),
    ]);
    secLangkah.appendChild(step);
  });
  detailDiv.appendChild(secLangkah);

  // Tips keselamatan
  const safetyBox = el('div', { className: 'uc-safety-box' }, [
    el('p', { className: 'font-semibold mb-1' }, '⚠️ Tips Keselamatan'),
    el('p', {}, ide.tips_keselamatan),
  ]);
  detailDiv.appendChild(safetyBox);

  // Saran sisa material
  const sisaMat = el('p', { className: 'text-xs text-gray-400 mt-3 italic' }, `♻️ Sisa material: ${ide.sisa_material}`);
  detailDiv.appendChild(sisaMat);

  detailDiv.classList.remove('hidden');
  detailDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// initScanner, initKonsultan, dan initUpcycling dipanggil dari
// DOMContentLoaded utama di atas (baris ~894).
