# 🎨 Design System: Custom Lightweight Browser (v2.0)

Dokumen ini memuat panduan desain antarmuka (UI) dan pengalaman pengguna (UX) untuk pengembangan browser ringan berbasis **Tauri + React + Vite**. Fokus utama desain ini adalah ergonomi *workflow* melalui *sidebar tab management*, efisiensi resource, dan estetika visual *clean*, *eye-care*, dengan sentuhan *modern neobrutalism*.

---

## 1. 🌟 Core Philosophy

- **Lightweight First:** Minimalis secara visual dan memori. Mengandalkan WebKit/WebKitGTK bawaan OS.
- **Ergonomic Management:** Vertikal *tabbing* di sebelah kiri untuk navigasi natural, diorganisir dalam *Workspaces*.
- **Eye-Care Aesthetic:** Menghindari *pure white* dan *pure black*. Latar menggunakan warna *cream* (Light Mode) dan *warm charcoal* (Dark Mode) yang menenangkan untuk penggunaan durasi panjang.
- **Tactile Feedback:** Animasi halus dan interaksi klik yang tegas (menggabungkan *smooth motion* dengan struktur *neobrutalist*).

---

## 2. 🎨 Color Palette (Light & Dark Mode)

Sistem warna menggunakan pendekatan dual-theme yang tetap nyaman di mata dalam kedua kondisi cahaya.

### Background & Surface (The Canvas)

| Token | Light (Cream) | Dark (Warm Dark) | Penggunaan Utama |
| :--- | :--- | :--- | :--- |
| `bg-primary` | `#F3F2EB` | `#1C1B1A` | Background utama *sidebar* dan area menu. |
| `bg-secondary` | `#FAF9F6` | `#262522` | Background untuk elemen *dropdown*, *context menu*. |
| `bg-tertiary` | `#EAE8DE` | `#33312E` | State saat elemen di-*hover* (Hover state). |

### Typography (The Inks)

| Token | Light | Dark | Penggunaan Utama |
| :--- | :--- | :--- | :--- |
| `text-primary` | `#2D2C28` | `#E8E6E1` | Judul *workspace*, teks *tab* aktif, teks input. |
| `text-secondary` | `#5C5750` | `#A39F96` | URL web, *tab* tidak aktif, teks *placeholder*. |
| `text-muted` | `#8C867C` | `#736F67` | Tanggal history, versi aplikasi, indikator pasif. |

### Accents & Workspaces (The Highlights)

> **Catatan:** Warna aksen tetap sama di kedua mode karena bersifat pastel yang cocok di latar terang maupun gelap.

| Token | Hex | Penggunaan Utama |
| :--- | :--- | :--- |
| `accent-dev` | `#6B8299` | Dusty Blue untuk Workspace "Development". |
| `accent-research` | `#8A9A86` | Sage Green untuk Workspace "Research/Study". |
| `accent-media` | `#DAB654` | Soft Mustard untuk Workspace "Media/Entertainment". |
| `accent-alert` | `#D9735D` | Muted Terracotta untuk Tombol Close, Notifikasi Error. |

### UI Borders & Interactions

| Token | Light | Dark | Penggunaan Utama |
| :--- | :--- | :--- | :--- |
| `border-main` | `#2D2C28` | `#45423D` | Garis tegas (1.5px - 2px) untuk sentuhan *neobrutalism*. |
| `border-subtle` | `#E3E1D5` | `#3A3733` | Garis pembatas tipis antar grup *tab*. |
| `shadow-solid` | `#2D2C28` | `#000000` | Bayangan blok tanpa *blur* (Neobrutalism shadow). |

---

## 3. 📏 Spacing & Sizing Scale

Menggunakan sistem grid **4-point** untuk menjaga konsistensi proporsi margin dan padding di seluruh UI.

| Token | Value | Penggunaan Utama |
| :--- | :--- | :--- |
| `space-1` | `4px` | Jarak antar ikon dan teks di dalam tab. |
| `space-2` | `8px` | Padding dalam tab item, jarak antar tab. |
| `space-3` | `12px` | Padding utama sidebar. |
| `space-4` | `16px` | Jarak antar grup workspace. |
| `space-6` | `24px` | Padding di dalam modal atau settings. |
| `space-8` | `32px` | Tinggi standar tab item, margin atas window drag area. |

---

## 4. 🖼️ Iconography & Favicon

- **Icon Library Utama:** `Lucide React` — dipilih karena ringan, *stroke* bersih, dan konsisten.
- **Stroke Width:** `1.5px` — menyesuaikan dengan ketebalan font Medium.

### Favicon Handling

| Kondisi | Behavior |
| :--- | :--- |
| Normal | Favicon asli web ditampilkan, ukuran konstan `16px × 16px`. |
| Tidak ada favicon | Gunakan ikon `Globe` dari Lucide dengan warna `text-muted`. |
| Loading | Favicon diganti sementara dengan animasi *spinner* (`Lucide Loader2`). |

---

## 5. 🧩 UI Components & States

### Sidebar Tab Item

- **Tinggi:** `32px` (`space-8`)
- **Padding:** `space-1` (vertikal) `space-2` (horizontal)
- **Border Radius:** `6px`

| State | Behavior |
| :--- | :--- |
| Inactive | Latar transparan, teks `text-secondary`. |
| Hover | Latar `bg-tertiary`, kursor *pointer*. |
| Active | Latar transparan, `border-left: 4px solid var(--accent-dev)`, teks `text-primary` (Medium weight). |
| Loading | Favicon berubah menjadi *spinner*. |

### Context Menu (Right-Click di Tab)

- **Background:** `bg-secondary`
- **Border:** `1.5px solid var(--border-main)`
- **Shadow:** `4px 4px 0px var(--shadow-solid)` — mempertegas gaya *neobrutalism*.
- **Padding:** `space-2`
- **Menu Items:** `Duplicate`, `Pin Tab`, `Move to Workspace...`, `Close Tab`

### Feedback System

| Kondisi | Behavior |
| :--- | :--- |
| Empty State (Workspace Baru) | Ilustrasi minimalis di tengah *sidebar* dengan teks "Belum ada tab terbuka" (`text-secondary`), dilengkapi tombol "New Tab" (`accent-dev`). |
| Error State (Gagal Load) | Background *webview* berubah menjadi `bg-primary`, menampilkan ikon peringatan `accent-alert` dengan tombol Refresh. |

---

## 6. 📐 Layout Architecture & Responsive

### Sidebar (Kiri) — Compact & Expanded Mode

| Mode | Width | Behavior |
| :--- | :--- | :--- |
| **Expanded** | `260px` | Menampilkan Favicon + Judul Tab + Tombol Close. |
| **Compact** | `60px` | Hanya menampilkan Favicon / Ikon Tab. Tab aktif ditandai `border-left: 4px`. Tooltip muncul saat hover untuk menampilkan judul web. |

Compact Mode diaktifkan via tombol toggle atau shortcut keyboard.

### Webview Panel (Kanan)

- **Width:** `flex-1` (mengisi sisa ruang layar)
- **Border:** `2px solid var(--border-main)` memisahkan *sidebar* dengan konten web.

### Custom Scrollbar (Sidebar CSS)

```css
/* Custom Scrollbar for Webkit */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--bg-primary);
}
::-webkit-scrollbar-thumb {
  background: var(--text-muted);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}
```

---

## 7. ⌨️ Keyboard Shortcuts Map

| Shortcut | Aksi |
| :--- | :--- |
| `Ctrl/Cmd + T` | Buka Tab Baru di Workspace aktif. |
| `Ctrl/Cmd + W` | Tutup Tab aktif. |
| `Ctrl/Cmd + L` | Fokus ke Address Bar (Omnibox). |
| `Ctrl/Cmd + B` | Toggle Sidebar (Collapse ke `60px` / Expand ke `260px`). |
| `Ctrl/Cmd + 1–9` | Pindah antar Workspace (1 untuk Dev, 2 untuk Research, dst.). |

---

## 8. 💫 Animation & Motion (Framer Motion)

Animasi dikonfigurasi menggunakan nilai fisika (Spring) agar terasa responsif dan natural.

```javascript
// Base Spring Config
const springTransition = {
  type: "spring",
  stiffness: 400,
  damping: 30
};

// Animasi Buka/Tutup Tab
const tabAnimation = {
  initial: { opacity: 0, height: 0, x: -10 },
  animate: { opacity: 1, height: "32px", x: 0 },
  exit: { opacity: 0, height: 0, scale: 0.95 },
  transition: springTransition
};
```