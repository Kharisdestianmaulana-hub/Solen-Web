# Solen Browser

*(Scroll down for Bahasa Indonesia)*

Solen is a next-generation browser featuring a modern, fast design integrated with a smart agent assistant. Built using **Tauri**, **React**, and **Rust**, Solen offers native performance (especially on macOS using `WKWebView`) with a stunning and feature-rich user interface.

## ✨ Key Features
- **Workspace Management**: Separate your work contexts (e.g., Development, Research, Media) into different environments.
- **Dynamic Appearance**: Supports Dark Mode and Light Mode with custom accent colors per workspace.
- **Premium Design**: Crafted with glassmorphism, micro-animations, and modern layouts.
- **Smart Search**: Direct integration with various search engines (Bing, Google, DuckDuckGo).

## 🚀 How to Run on Other Devices

To develop or run Solen on your computer, you need to install several system prerequisites first.

### 1. Prerequisites
Ensure you have the following software installed:
- **Node.js** (Version 18 or newer) & `npm`.
- **Rust** & **Cargo** (Use [rustup](https://rustup.rs/)).
- **Tauri Dependencies**:
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`).
  - **Linux (Ubuntu/Debian)**: 
    ```bash
    sudo apt update
    sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
    ```

### 2. Installation
Clone this repository, navigate to the project directory, and install Node.js dependencies:
```bash
git clone <your-repo-url>
cd Solen
npm install
```

### 3. Running Development Mode
To run the application in development mode (with hot-reload for React):
```bash
npm run dev
```
*Note: On the first run, Cargo will download and compile the Rust backend, which may take a few minutes.*

### 4. Build for Production
To build the application into a standalone binary (`.app` on macOS, `.deb`/`.AppImage` on Linux):
```bash
npm run build
npm run tauri build
```

---

## 📄 License & Contribution
This project uses a custom proprietary license. Only the original creator and approved contributors are allowed to modify the code. Please read [LICENSE.md](LICENSE.md) for licensing details and [CONTRIBUTING.md](CONTRIBUTING.md) for contribution rules.

<br>
<br>

---
---

# Solen Browser (Bahasa Indonesia)

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
