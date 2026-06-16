# Solen Browser

Solen adalah browser masa depan dengan desain modern, cepat, dan terintegrasi dengan asisten agen cerdas. Dibangun menggunakan teknologi **Tauri**, **React**, dan **Rust**, Solen menawarkan performa *native* (khususnya di macOS menggunakan `WKWebView`) dengan antarmuka pengguna yang sangat memukau dan kaya fitur.

## ✨ Fitur Utama
- **Manajemen Workspace**: Pisahkan konteks pekerjaan Anda (misalnya: Development, Research, Media) ke dalam ruang lingkup yang berbeda.
- **Tampilan Dinamis**: Mendukung tema Gelap (Dark Mode) dan Terang (Light Mode) dengan aksen warna khusus per-workspace.
- **Desain Premium**: Dirancang dengan *glassmorphism*, animasi mikro, dan tata letak modern.
- **Pencarian Cerdas**: Integrasi langsung dengan berbagai mesin pencari (Bing, Google, DuckDuckGo).

## 🚀 Cara Menjalankan di Perangkat Lain

Untuk mengembangkan atau menjalankan Solen di komputer Anda, Anda perlu menginstal beberapa persyaratan sistem terlebih dahulu.

### 1. Persyaratan Sistem (Prerequisites)
Pastikan Anda telah menginstal perangkat lunak berikut:
- **Node.js** (Versi 18 atau lebih baru) & `npm`.
- **Rust** & **Cargo** (Gunakan [rustup](https://rustup.rs/)).
- **Dependensi Tauri**:
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`).
  - **Linux (Ubuntu/Debian)**: 
    ```bash
    sudo apt update
    sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
    ```

### 2. Instalasi
Clone repositori ini, lalu masuk ke direktori proyek dan instal dependensi Node.js:
```bash
git clone <url-repo-anda>
cd Solen
npm install
```

### 3. Menjalankan Mode Development
Untuk menjalankan aplikasi dalam mode pengembangan (dengan *hot-reload* untuk React):
```bash
npm run dev
```
*Catatan: Pada saat pertama kali dijalankan, Cargo akan mengunduh dan mengkompilasi *backend* Rust yang mungkin memakan waktu beberapa menit.*

### 4. Build untuk Produksi
Untuk membangun aplikasi menjadi file biner siap pakai (`.app` di macOS, `.deb`/`.AppImage` di Linux):
```bash
npm run build
npm run tauri build
```

---

## 📄 Lisensi & Kontribusi
Proyek ini menggunakan lisensi khusus. Hanya kreator asli dan kontributor yang disetujui yang diizinkan untuk mengubah kode. Silakan baca [LICENSE.md](LICENSE.md) untuk detail lisensi dan [CONTRIBUTING.md](CONTRIBUTING.md) untuk aturan kontribusi.
