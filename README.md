# ♻️ PilahCerdas — Platform Edukasi Pemilahan Sampah dan Daur Ulang

> Website edukasi interaktif yang membantu masyarakat mengenali jenis sampah, mencari panduan penanganan, mencatat kegiatan pemilahan, dan membangun kebiasaan ramah lingkungan.

---

## 🎯 Tujuan Proyek

1. Menyediakan informasi pemilahan sampah yang mudah dipahami dan diakses.
2. Membantu pengguna mencari panduan penanganan berdasarkan nama atau kategori sampah.
3. Mendorong kebiasaan memilah dan mencatat sampah secara konsisten.
4. Menyajikan informasi edukasi dalam antarmuka yang menarik, praktis, dan inklusif.
5. Menerapkan prinsip keamanan digital sejak tahap pengembangan.
6. Menghasilkan website yang dapat diuji secara lokal dan dipublikasikan melalui GitHub Pages.

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| **Panduan Sampah** | 17 data panduan sampah (6 organik, 6 anorganik, 5 khusus/B3) dengan pencarian real-time dan filter kategori |
| **CRUD Catatan** | Tambah, lihat, edit, dan hapus catatan pemilahan dengan validasi lengkap |
| **Dashboard** | Ringkasan otomatis: total catatan, total berat, ringkasan per kategori, dan progres checklist |
| **Checklist Kebiasaan** | 5 kebiasaan ramah lingkungan dengan progress bar dan penyimpanan persisten |
| **Tips Edukasi** | 6 tips praktis memilah sampah dengan benar |
| **Penyimpanan Lokal** | Semua data disimpan di localStorage browser — tidak ada server |
| **Desain Responsif** | Mobile-first, berfungsi di semua ukuran layar |
| **Aksesibilitas** | ARIA label, keyboard navigation, focus indicator, semantic HTML |

---

## 🏗️ Struktur File

```
pilahcerdas/
├── index.html    # Halaman utama (entry point)
├── style.css     # CSS tambahan (komponen, animasi, override Tailwind)
├── script.js     # Logika aplikasi (data edukasi, CRUD, pencarian, dashboard)
└── README.md     # Dokumentasi project ini
```

**Penjelasan singkat setiap file:**

- **`index.html`** — Seluruh struktur halaman: navbar, hero, dashboard, kategori, panduan/pencarian, catatan CRUD, checklist, tips, footer, modal, dan toast. Menggunakan Tailwind CSS via CDN resmi.
- **`style.css`** — Komponen kustom yang tidak tersedia di Tailwind: button variants, cards, form inputs, checklist items, toast, modal, badge, dan animasi.
- **`script.js`** — Logika lengkap aplikasi. Berisi data edukasi statis, utilitas DOM yang aman, pencarian/filter, CRUD catatan, dashboard, checklist, localStorage, notifikasi, dan inisialisasi.

---

## 🛡️ Langkah Keamanan Digital yang Diterapkan

1. **Tidak menggunakan `innerHTML` untuk input pengguna** — semua nilai user di-render via `textContent` atau fungsi DOM builder `el()`.
2. **Tidak menggunakan `eval()`, `Function()`, atau string-based event handler**.
3. **Validasi dan sanitasi input** — trim, batasi panjang, validasi tipe data sebelum disimpan.
4. **Validasi data localStorage** — struktur data divalidasi saat dibaca; data rusak dikembalikan ke nilai default tanpa crash.
5. **Penanganan error localStorage** — kegagalan akses ditangani dengan pesan ramah tanpa detail teknis internal.
6. **Konfirmasi sebelum hapus** — modal konfirmasi wajib untuk aksi hapus catatan dan hapus semua data.
7. **Tidak menyimpan data sensitif** — hanya nama sampah, kategori, berat, tanggal. Tidak ada kata sandi, token, atau data pribadi.
8. **Penjelasan localStorage di UI** — pengguna diberi tahu bahwa data bersifat lokal dan tidak tersinkronisasi.
9. **Tidak ada script pihak ketiga yang tidak dipercaya** — hanya Tailwind CSS dari CDN resmi (`cdn.tailwindcss.com`) dan Google Fonts.
10. **Pesan error informatif** tanpa membocorkan detail teknis internal.

> **Catatan:** localStorage adalah penyimpanan sisi klien. Data tidak terenkripsi oleh aplikasi ini dan dapat diakses oleh siapa pun yang memiliki akses ke browser yang sama. Tidak ada backend, tidak ada enkripsi, tidak ada sinkronisasi antar perangkat.

---

## 🚀 Cara Menjalankan Secara Lokal

### Opsi 1: Buka Langsung (Paling Sederhana)

1. Unduh atau clone repository ini.
2. Buka file `index.html` langsung di browser (double-click).

> ⚠️ Beberapa fitur Tailwind CDN dan Google Fonts memerlukan koneksi internet. Fungsi JavaScript utama (CRUD, localStorage, pencarian) tetap berjalan tanpa internet.

### Opsi 2: Live Server (Disarankan untuk Pengembangan)

Jika menggunakan Visual Studio Code:

1. Install ekstensi **Live Server** (Ritwick Dey).
2. Klik kanan `index.html` → **Open with Live Server**.
3. Browser akan terbuka otomatis di `http://127.0.0.1:5500`.

Alternatif dengan Python:

```bash
# Python 3
python -m http.server 8080
# Buka http://localhost:8080 di browser
```

---

## 🧪 Cara Menguji Fitur

### Panduan Sampah & Pencarian
- [ ] Ketik nama barang (contoh: `botol plastik`, `baterai`) di kolom pencarian.
- [ ] Coba variasi huruf besar/kecil (`BOTOL`, `Kardus`).
- [ ] Filter berdasarkan kategori (Organik / Anorganik / Khusus).
- [ ] Klik "Reset" untuk mengembalikan ke tampilan awal.
- [ ] Cari kata yang tidak ada (contoh: `xyzabc`) → pastikan pesan "tidak ditemukan" muncul.

### Catatan Pemilahan (CRUD)
- [ ] **Create:** Isi form → klik "Simpan Catatan" → catatan muncul di tabel.
- [ ] **Read:** Catatan tampil dengan nama, kategori, berat, dan tanggal yang benar.
- [ ] **Update:** Klik "Edit" pada baris catatan → ubah data → klik "Perbarui Catatan".
- [ ] **Delete:** Klik "Hapus" → modal konfirmasi muncul → konfirmasi → catatan terhapus.
- [ ] **Validasi:** Coba submit form kosong → pesan error muncul di tiap field yang kosong.
- [ ] **Validasi berat:** Masukkan `0`, `-1`, `99999` → pastikan pesan error tepat.
- [ ] **Input berbahaya:** Masukkan `<script>alert(1)</script>` di kolom nama → tidak dieksekusi, ditampilkan sebagai teks biasa.

### Dashboard
- [ ] Setelah menambah catatan, angka di dashboard berubah secara otomatis.
- [ ] Setelah menghapus catatan, angka berkurang.
- [ ] Jika tidak ada data, tampilkan `0` dan bukan angka palsu.

### Checklist Kebiasaan
- [ ] Centang beberapa kebiasaan → progress bar bergerak.
- [ ] Muat ulang halaman → status checklist tetap tersimpan.
- [ ] Dashboard kartu "Kebiasaan Selesai" ikut berubah.

### Persistensi Data
- [ ] Tambah beberapa catatan → tutup browser → buka lagi → catatan masih ada.
- [ ] Klik "Hapus semua data aktivitas saya" → konfirmasi → semua data terhapus.

### Data LocalStorage Rusak
- Buka DevTools → Application → Local Storage → ubah nilai `pilahcerdas_catatan_v1` menjadi `[{invalid}]`.
- Muat ulang halaman → aplikasi tetap berjalan tanpa crash, catatan kosong.

### Responsivitas
- [ ] Buka di browser mobile atau gunakan DevTools (F12 → Toggle device toolbar).
- [ ] Pastikan tidak ada horizontal scroll.
- [ ] Navbar mobile berfungsi dengan tombol hamburger.

---

## ⚠️ Batasan yang Perlu Diketahui

1. **localStorage terbatas per browser dan perangkat** — data tidak tersinkronisasi antar perangkat atau browser berbeda.
2. **Data tidak terenkripsi** — siapa pun yang memiliki akses ke browser Anda dapat melihat data melalui DevTools.
3. **Tidak ada autentikasi** — tidak ada sistem login atau user account.
4. **Kapasitas localStorage terbatas** — umumnya 5–10 MB per origin; tidak cocok untuk data dalam jumlah sangat besar.
5. **Data panduan bersifat edukatif** — panduan penanganan sampah adalah panduan umum. Penerimaan dan metode pengolahan aktual bergantung pada fasilitas di daerah masing-masing.
6. **Tidak ada klaim dampak lingkungan** — aplikasi tidak menghitung atau mengklaim pengurangan emisi atau dampak lingkungan tertentu.

---

## 📤 Cara Mengunggah ke GitHub dan Mengaktifkan GitHub Pages

### Langkah 1: Buat Repository di GitHub

1. Login ke [github.com](https://github.com).
2. Klik tombol **New** (atau `+` → New repository).
3. Beri nama repository, misalnya `pilahcerdas`.
4. Pilih **Public**.
5. Jangan centang "Add a README file" (sudah ada di project ini).
6. Klik **Create repository**.

### Langkah 2: Upload File ke GitHub

**Cara A — Via GitHub Web (tanpa Git):**

1. Di halaman repository baru, klik **Add file** → **Upload files**.
2. Drag & drop semua file (`index.html`, `style.css`, `script.js`, `README.md`).
3. Klik **Commit changes**.

**Cara B — Via Git (Terminal/Command Prompt):**

```bash
# Inisialisasi Git di folder project
git init
git add .
git commit -m "Initial commit: PilahCerdas v1.0"

# Hubungkan ke repository GitHub (ganti USERNAME dan REPO)
git remote add origin https://github.com/USERNAME/pilahcerdas.git
git branch -M main
git push -u origin main
```

### Langkah 3: Aktifkan GitHub Pages

1. Di halaman repository GitHub, klik **Settings**.
2. Scroll ke bagian **Pages** (di sidebar kiri).
3. Di bagian **Source**, pilih **Deploy from a branch**.
4. Pilih branch **main** dan folder **/ (root)**.
5. Klik **Save**.
6. Tunggu beberapa menit, lalu GitHub Pages akan menampilkan URL publik seperti:
   `https://USERNAME.github.io/pilahcerdas/`

> ✅ Website siap diakses secara publik melalui URL tersebut.

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Versi / Sumber | Keterangan |
|---|---|---|
| HTML5 | — | Struktur halaman, semantic markup |
| Tailwind CSS | CDN resmi (`cdn.tailwindcss.com`) | Styling utama |
| CSS3 | `style.css` | Komponen kustom & animasi |
| JavaScript (ES2020+) | Vanilla JS | Logika aplikasi, DOM manipulation |
| localStorage | Browser built-in | Penyimpanan data lokal |
| Google Fonts (Inter) | CDN Google Fonts | Tipografi |

---

## 👥 Target Pengguna

- Pelajar dan mahasiswa.
- Keluarga dan rumah tangga.
- Masyarakat umum yang ingin belajar memilah sampah.
- Komunitas yang menjalankan kegiatan kebersihan dan lingkungan.

---

## 📝 Lisensi

Proyek ini dibuat sebagai Capstone Project edukasi. Bebas digunakan dan dimodifikasi untuk tujuan pembelajaran.

---

*Dibuat dengan ❤️ untuk bumi yang lebih bersih.*
#   I B M b o b - P i l a h C e r d a s - F e r r y R i z q i D a r m a w a n  
 