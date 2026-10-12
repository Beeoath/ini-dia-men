# Desain Spanduk Komprehensif Matematika Sigma (3 × 1,5 Meter)

Rencana pembuatan aset grafis spanduk resolusi tinggi bertema terpadu Matematika Sigma untuk MA Darunnajah 9, memadukan trio superhero matematika, tipografi 3D futuristik, simbol kalkulus/aljabar/geometri, dan identitas madrasah dalam format horizontal siap cetak tanpa memodifikasi tata letak aplikasi yang ada.

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan sesi tanya-jawab interaktif pada Tahap 1, spesifikasi dan batasan berikut telah dikonfirmasi dan menjadi acuan utama:

- **Rasio & Ukuran Terkonfirmasi**: Spanduk horizontal rasio 3 × 1,5 meter (aspek rasio 2:1). Dibuat menggunakan format horizontal *high-definition widescreen* dengan komposisi simetris dan batas aman cetak (*safe zone*).
- **Penempatan Terkonfirmasi**: **Tidak ditampilkan pada antarmuka web aplikasi** (*"jangan ditampiin di aplikasi nya"*). Spanduk akan diproduksi sebagai berkas aset grafis beresolusi tinggi di direktori aset dan artefak, sehingga siap diunduh dan dicetak langsung tanpa mengubah tampilan UI landing page atau modul belajar siswa.
- **Komposisi Visual Terkonfirmasi**: **Menggabungkan seluruh elemen ("gabungkan semua")**:
  - **Trio Superhero Matematika**: Sigma-Slinger (Aljabar & Fungsi), Geo-Arachne (Geometri & Vektor), dan Prob-Spinner (Peluang & Data).
  - **Tipografi Utama 3D**: Judul megah *"MATEMATIKA SIGMA"* berlapis titanium/chrome dengan aksen cahaya neon cyan dan emas.
  - **Identitas Lembaga**: *"MA Darunnajah 9"* dan tagline *"Sistem Interaktif Gerbang Modul Matematika Atraktif"*.
  - **Aksen Matematika Kosmik**: Kisi-kisi koordinat Cartesian 3D, simbol integral ($\int$), sigma ($\sum$), matriks, vektor sudut geometri, serta formula trigonometri berpijar.
  - **Kelima Pilar Modul**: Penanda 5 domain (Aljabar, Bilangan, Geometri, Peluang, Trigonometri).

---

## 1. Overview & Core Concept

- **Tujuan Desain**: Menciptakan spanduk visual spektakuler berstandar profesional yang merefleksikan identitas pembelajaran matematika masa depan di MA Darunnajah 9.
- **Audiens Sasaran**: Santri/siswa MA Darunnajah 9, dewan guru matematika, wali santri, dan pengunjung kegiatan akademik/ekstrakurikuler.
- **Fungsi Utama**: Materi publikasi visual dan media promosi fisik/digital untuk acara sekolah, pameran STEM/matematika, seminar edukasi, serta latar panggung/backdrop kegiatan madrasah.

---

## 2. User Experience & Visual Design

### Komposisi Tata Letak (Spatial Composition 3 × 1,5)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [LOGO / IDENTITAS]                                                          [TAHUN / KELAS]     │
│   MA DARUNNAJAH 9                                                             AKADEMIK 2026      │
│                                                                                                  │
│      [SIGMA-SLINGER]                 MATEMATIKA SIGMA                   [PROB-SPINNER]           │
│    (Ahli Aljabar & Fungsi)      ┌─────────────────────────┐         (Peluang & Analisis Data)    │
│      Pose Heroik Dinamis        │  TITANIUM 3D CHROME     │            Pose Heroik Analitis      │
│                                 │   NEON CYAN & GOLD      │                                      │
│                                 └─────────────────────────┘                                      │
│                                              │                                                   │
│                                       [GEO-ARACHNE]                                              │
│                                 (Geometri & Vektor 3D)                                           │
│                                                                                                  │
│  [PILAR MODUL]: ALJABAR · BILANGAN · GEOMETRI · PELUANG · TRIGONOMETRI                           │
│  [KISI LATAR]: Partikel Kosmik Deep Blue · Kisi Vektor Tron · Rumus-Rumus Matematika Bersinar   │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Visual Identity & Theme Tokens

- **Aesthetic Direction**: *Sci-Fi Cinematic Heroic Math* — Memadukan kedalaman fiksi ilmiah (cyber-blue nebula, kisi koordinat hologram) dengan kekuatan komik pahlawan super modern (Justice League/Avengers) dan keanggunan akademis islami MA Darunnajah 9.
- **Color Palette**:
  - *Dominant Space*: Deep Cosmic Blue (`#050814`) ke Obsidian Black (`#0a0f24`).
  - *Primary Neon Energy*: Electric Cyan (`#00F0FF`) merepresentasikan kecerdasan aljabar dan masa depan.
  - *Secondary Energy*: Radiant Magenta (`#FF007A`) untuk dimensi spasial geometri.
  - *Gold Accent*: Solar Gold (`#FFD600`) untuk presisi probabilitas dan logo mahkota madrasah.
  - *Highlight Reflection*: Brushed Titanium & Liquid Chrome untuk tipografi judul.
- **Tipografi Spanduk**:
  - *Judul Utama*: Heavy 3D Display Font (*Matematika Sigma*) dengan bevel logam dan refleksi cahaya neon.
  - *Subjudul*: Clean Bold Modernist (*MA DARUNNAJAH 9*).
  - *Tagline & Kicker*: Geometric Sans (*Sistem Interaktif Gerbang Modul Matematika Atraktif*).

---

## 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Pembuatan Aset Visual Melalui Mesin Generasi Gambar AI Terarah**:
  - *Pendekatan*: Memanfaatkan `generate_image` dengan prompt sinematik terperinci berorientasi spanduk fisik (aspect ratio 16:9 yang mendekati 2:1 atau format wide horizontal) dengan resolusi maksimal, fokus subjek tajam, serta kontras tinggi yang siap dicetak di bahan flexi/vinyl.
  - *Alasan*: Menghasilkan visual 3D yang kohesif dengan aset yang sudah ada di repositori (`siap_masuk_dredd`, `sigma_justice_title`, `cyber_hero_profile`).
- **Keputusan 2: Pemisahan Aset dari Runtime UI (Sesuai Permintaan Pengguna)**:
  - *Pendekatan*: Menyimpan gambar akhir secara rapi di `public/assets/spanduk_matematika_sigma_3x1.5.jpg` dan menyediakannya di repositori tanpa menambahkan komponen baru yang mengganggu alur navigasi web app.
  - *Alasan*: Pengguna secara tegas meminta *"jangan ditampiin di aplikasi nya"*, sehingga integritas tampilan web saat ini dipertahankan 100%.

---

## 4. Technical Architecture & Data Strategy

### Diagram Alur Produksi Aset Spanduk

```
┌─────────────────────────────────┐
│     Sintesis Karakter & Tema    │
│  - Trio Superhero Matematika    │
│  - Branding MA Darunnajah 9     │
│  - Rumus & Kisi Kosmik 3D       │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│       Image Generation RPC      │
│  - Engine: Imagen / Gemini      │
│  - Format: Widescreen Landscape │
│  - Style: Ultra-detailed 3D     │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│        Verifikasi & Storage     │
│  - Verifikasi ketajaman visual  │
│  - Penempatan di public/assets  │
│  - Link akses & unduh siap pakai│
└─────────────────────────────────┘
```

### Spesifikasi Aset Luaran

| Parameter | Spesifikasi |
| :--- | :--- |
| **Nama Berkas** | `spanduk_matematika_sigma_3x1.5.jpg` |
| **Lokasi Penyimpanan** | `/public/assets/` & `/src/assets/images/` |
| **Aspek Rasio Target** | 16:9 (Landscape Widescreen, format proporsional spanduk horizontal 3 × 1,5 meter) |
| **Konten Teks & Simbol** | "MATEMATIKA SIGMA", "MA DARUNNAJAH 9", Simbol $\Sigma, f(x), \pi, \int, \Delta$, Trio Hero Mascots |
| **Status Integrasi Web** | Standalone Graphic Asset (Tidak dimasukkan ke kode UI aplikasi) |
