# 🥗 DapurSage — Catatan Menu Makanan & Meal Planner Cerdas

Aplikasi web modern berbasis **Astro.js** dan **React** untuk mencatat resep menu makanan, merencanakan jadwal makan mingguan (**Pagi, Siang, Malam**), manajemen daftar belanja otomatis, dan integrasi kecerdasan buatan (**9Router AI Gateway**).

Didesain dengan palet warna estetik **Sage Green** yang menyejukkan mata serta tampilan yang sepenuhnya **responsif** di perangkat HP, tablet, maupun desktop/laptop.

---

## ✨ Fitur Utama

### 1. 🍳 Katalog & Detail Resep Lengkap
- **Kategori Waktu Makan Fleksibel**: Menu dapat diatur untuk sarapan (**Pagi**), makan siang (**Siang**), maupun makan malam (**Malam**), atau kombinasi ketiganya.
- **Pemisah Bahan & Bumbu**: Format input terpisah antara **Bahan Pokok** dan **Bumbu Dapur**.
- **Galeri Foto**:
  - Galeri hingga **5 foto masakan** dengan preview carousel interaktif.
  - Foto bumbu dapur individual untuk mempermudah identifikasi bumbu saat berbelanja atau memasak.
- **Kalkulator Porsi Otomatis**: Takaran bahan dan bumbu dapat diatur secara dinamis sesuai jumlah porsi (1 porsi, 2 porsi, 4 porsi, dst).
- **Interactive Cooking Checklist**: Centang bahan dan langkah memasak saat sedang beraksi di dapur.

### 2. 📅 Meal Planner Mingguan (7 Hari)
- Grid kalender 7 hari (Senin - Minggu) untuk waktu makan Pagi, Siang, dan Malam.
- Pilih menu langsung dari koleksi resep yang tersimpan.
- Tombol **"Kirim ke Daftar Belanja"** untuk mengekstrak seluruh bahan & bumbu dari jadwal mingguan secara instan.

### 3. 🛒 Daftar Belanja Pintar
- Terkelompok rapi antara kategori **Bahan** dan **Bumbu**.
- Checklist interaktif saat berbelanja di pasar tradisional atau supermarket.
- Fitur **Ekspor WhatsApp**: Format teks belanjaan siap dikirim via chat dengan satu klik.

### 4. 🤖 Asisten AI 9Router Terintegrasi
- **Auto-Parse Resep dari Teks Bebas**: Cukup paste catatan resep acak (dari WhatsApp, Instagram, atau TikTok), AI akan otomatis memisahkan nama, bahan, bumbu, dan langkah memasak.
- **Generator Resep dari Nama Menu**: Ketik nama masakan (contoh: *Resep Oseng Tempe Puyuh*), AI akan langsung menyusun resep komplit.
- **Roulette Acak Menu**: Solusi saat bingung *"Mau masak apa hari ini?"*.
- **Kreasi Masakan Bahan Kulkas**: Masukkan sisa bahan di dapur, AI akan merekomendasikan masakan lezat yang bisa dibuat.
- Menggunakan endpoint **9Router Gateway** (`https://router.mgentaarya.my.id/v1`) dengan pengaturan custom model dan API key.

### 5. 🌿 Desain Sage Green & Responsif
- Tema Sage Green yang elegan, minimalis, dan nyaman untuk penggunaan lama.
- Mobile bottom navigation bar untuk kemudahan akses jempol pada smartphone.
- Local persistence menggunakan **IndexedDB (`idb-keyval`)** — data tersimpan aman dan privat di browser tanpa butuh registrasi akun. Fitur Backup & Restore JSON juga tersedia.

---

## 🛠️ Tech Stack

- **Framework**: [Astro 5](https://astro.build/)
- **UI Library**: React 19
- **Styling**: Tailwind CSS (Custom Sage Palette)
- **Icons**: Lucide Icons
- **Storage**: IndexedDB (`idb-keyval`)
- **AI Gateway**: 9Router API (`https://router.mgentaarya.my.id/v1`)
- **Deployment**: Vercel

---

## 🚀 Menjalankan Secara Lokal

1. Clone repositori:
   ```bash
   git clone https://github.com/Genta-arya/catatan-menu-makanan.git
   cd catatan-menu-makanan
   ```

2. Pasang dependensi:
   ```bash
   npm install
   ```

3. Jalankan server pengembang:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:4321` di browser Anda.

4. Build untuk produksi:
   ```bash
   npm run build
   ```

---

## ⚙️ Pengaturan 9Router AI

Secara default, aplikasi telah dikonfigurasi dengan gateway 9Router:
- **Base URL**: `https://router.mgentaarya.my.id/v1`
- Anda dapat mengubah API Key atau Model AI kapan saja melalui ikon roda gigi (**Pengaturan**) di navigasi pojok kanan atas.

---

## 📄 Lisensi

MIT License © 2026 DapurSage
