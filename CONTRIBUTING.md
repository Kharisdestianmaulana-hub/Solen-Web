# Solen Browser Contribution Guide

*(Scroll down for Bahasa Indonesia)*

Thank you for your interest in contributing to Solen Browser! This application is developed with strict controls to ensure quality, design consistency, and codebase security.

## 🔒 General Rules

In accordance with `LICENSE.md`, this project is *proprietary*. **Only the Principal Creator and Approved Contributors** are allowed to modify the code directly.

### How to Become an Approved Contributor?
1. You must obtain written permission or be directly invited by the Principal Creator.
2. You must understand our primary technology stack: **Tauri**, **React**, **TypeScript**, **Zustand**, and **Rust**.
3. Have a strong understanding of modern design principles (UI/UX) embraced by Solen (glassmorphism, micro-animations, rich typography).

## 💻 Code & Development Standards

If you are an approved contributor, please follow these guidelines when writing code:

### 1. TypeScript / React Style
- Use **Functional Components** and **React Hooks** exclusively. Do not use Class Components.
- Use TypeScript features (Interfaces, Types) strictly. Avoid using the `any` type whenever possible.
- Extract styling if it gets too long, but maximize the use of built-in CSS Variables (Design Tokens) from `index.css` (e.g., `var(--bg-primary)`, `var(--space-2)`).
- The use of TailwindCSS is strictly prohibited unless agreed upon for specific modules. We use inline Vanilla CSS and external stylesheets for absolute design control.

### 2. State Management
- Use **Zustand** (`src/store/useBrowserStore.ts`) as the Single Source of Truth for global state.
- Avoid passing state between distant components using `props drilling`. Use the Store if the data is needed by more than two levels of components.

### 3. Backend (Rust)
- Backend components in `src-tauri` are intended to bridge the Native OS system (macOS WKWebView) and handle file system operations or proxies during development on Linux.
- Ensure Rust code is handled safely using `Result` and does not easily trigger `panic!`.

## 🌿 Git Workflow

1. **Branching**:
   - Never make changes directly to `main`.
   - Create a new branch for each feature or fix. Naming format: `feature/feature-name` or `fix/bug-description`.
2. **Commit**:
   - Use descriptive and structured commit formats (e.g., `feat: add workspace modal` or `fix: resolve proxy loop`).
3. **Pull Requests (PR)**:
   - Create PRs explaining in detail what was changed, the purpose of the change, and attach screenshots or videos (if there are UI changes).
   - PRs will be reviewed by the Principal Creator before merging.

## 🤝 Copyright Agreement
By submitting a Pull Request or any code to this project, you fully agree that your work becomes part of the Solen project and complies with the license stated in `LICENSE.md`.

<br>
<br>

---
---

# Panduan Kontribusi Solen Browser (Bahasa Indonesia)

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
