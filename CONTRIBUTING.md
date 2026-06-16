# Panduan Kontribusi Solen Browser

Terima kasih atas minat Anda untuk berkontribusi pada Solen Browser! Aplikasi ini dikembangkan dengan kontrol yang sangat ketat untuk memastikan kualitas, konsistensi desain, dan keamanan basis kode.

## 🔒 Aturan Umum

Sesuai dengan `LICENSE.md`, proyek ini bersifat *proprietary*. **Hanya Kreator Utama dan Kontributor yang Telah Disetujui (Approved Contributors)** yang diizinkan untuk mengubah kode secara langsung.

### Bagaimana Cara Menjadi Kontributor yang Disetujui?
1. Anda harus mendapatkan persetujuan tertulis atau diundang secara langsung oleh Kreator Utama.
2. Anda harus memahami tumpukan teknologi utama kami: **Tauri**, **React**, **TypeScript**, **Zustand**, dan **Rust**.
3. Memiliki pemahaman yang kuat tentang prinsip-prinsip desain modern (UI/UX) yang dianut oleh Solen (glassmorphism, micro-animations, rich typography).

## 💻 Standar Kode & Pengembangan

Jika Anda sudah menjadi kontributor yang disetujui, harap ikuti panduan berikut saat menulis kode:

### 1. Gaya Penulisan TypeScript / React
- Gunakan **Functional Components** dan **React Hooks** secara eksklusif. Jangan gunakan Class Components.
- Gunakan fitur TypeScript (Interfaces, Types) dengan ketat. Hindari penggunaan tipe `any` sebisa mungkin.
- Ekstrak *styling* jika mulai terlalu panjang, namun sebisa mungkin manfaatkan CSS Variables (Design Tokens) bawaan dari `index.css` (misal: `var(--bg-primary)`, `var(--space-2)`).
- Dilarang keras menggunakan TailwindCSS kecuali telah disepakati untuk modul tertentu. Kami menggunakan Vanilla CSS inline dan stylesheet eksternal untuk kontrol desain absolut.

### 2. State Management
- Gunakan **Zustand** (`src/store/useBrowserStore.ts`) sebagai sumber kebenaran tunggal (*Single Source of Truth*) untuk global state.
- Hindari menyebarkan *state* antar komponen yang berjauhan menggunakan `props drilling`. Gunakan Store jika data tersebut dipakai oleh lebih dari dua level komponen.

### 3. Backend (Rust)
- Komponen backend di `src-tauri` ditujukan untuk menjembatani sistem OS *Native* (macOS WKWebView) dan menangani operasi *file system* atau proksi saat *development* di Linux.
- Pastikan kode Rust ditangani secara aman menggunakan `Result` dan tidak mudah memicu `panic!`.

## 🌿 Alur Kerja Git (Git Workflow)

1. **Branching**:
   - Jangan pernah melakukan perubahan langsung di `main`.
   - Buat *branch* baru untuk setiap fitur atau perbaikan. Format penamaan: `feature/nama-fitur` atau `fix/deskripsi-bug`.
2. **Commit**:
   - Gunakan format commit yang deskriptif dan terstruktur (contoh: `feat: add workspace modal` atau `fix: resolve proxy loop`).
3. **Pull Requests (PR)**:
   - Buat PR yang menjelaskan secara detail apa yang diubah, tujuan perubahan, dan lampirkan *screenshot* atau video (jika ada perubahan UI).
   - PR akan di-*review* oleh Kreator Utama sebelum digabungkan (merge).

## 🤝 Persetujuan Hak Cipta
Dengan mengirimkan *Pull Request* atau kode apa pun ke dalam proyek ini, Anda sepenuhnya menyetujui bahwa hasil kerja Anda menjadi bagian dari proyek Solen dan mematuhi lisensi yang tertera di `LICENSE.md`.
