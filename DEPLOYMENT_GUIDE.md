# Panduan Instalasi & Deployment Couple Finance
## Google Apps Script (Backend) + GitHub Pages (Frontend)

Panduan langkah-demi-langkah ini memandu Anda menghubungkan **Backend Google Apps Script & Google Sheets** dengan **Frontend Statis di GitHub Pages** secara cepat, aman, dan tanpa biaya server (*zero cloud cost*).

---

## TAHAP 1: Menyiapkan Backend Google Apps Script & Database (5 Menit)

1. Buka [Google Drive](https://drive.google.com).
2. Klik tombol **+ Baru (New)** → **Lainnya (More)** → **Google Apps Script**.
3. Beri nama proyek skrip di pojok kiri atas: `Couple Finance Backend`.
4. Hapus seluruh isi default pada file `Code.gs`, lalu salin seluruh kode dari:
   - 📄 [backend/Kode.js](file:///e:/WEBSITE/ANTIGRATIVY/3.%20KEUANGAN%20PASUTRI/backend/Kode.js)
5. Klik tanda **+** di samping *Files* pada editor Apps Script → pilih **Script**, beri nama `Setup.gs`, lalu salin seluruh kode dari:
   - 📄 [backend/Setup.js](file:///e:/WEBSITE/ANTIGRATIVY/3.%20KEUANGAN%20PASUTRI/backend/Setup.js)
6. Tambahkan satu file skrip lagi bernama `Migrasi.gs`, lalu salin seluruh kode dari:
   - 📄 [backend/Migrasi.js](file:///e:/WEBSITE/ANTIGRATIVY/3.%20KEUANGAN%20PASUTRI/backend/Migrasi.js)
7. Tekan ikon **Simpan (Save)** atau `Ctrl + S`.

### Menjalankan Inisialisasi Otomatis:
1. Pada menu dropdown fungsi di toolbar atas editor Apps Script, pilih fungsi `setupAppEnvironment`.
2. Klik tombol **Jalankan (Run)**.
3. Google akan meminta izin akses (*Review Permissions*):
   - Pilih akun Google Anda.
   - Klik **Advanced** (Lanjutan) di bagian bawah.
   - Klik **Go to Couple Finance Backend (unsafe)**.
   - Klik **Allow** (Izinkan).
4. Buka tab **Execution Log** di bagian bawah. Tunggu hingga muncul pesan:
   `🎉 SETUP SELESAI DENGAN SUKSES!`
   *(Database Spreadsheet dengan 14 sheet dan folder Google Drive telah dibuat secara otomatis).*

### Menerbitkan Web App (Deploy):
1. Klik tombol biru **Deploy** di pojok kanan atas → pilih **New deployment**.
2. Klik ikon gear ⚙️ di samping *Select type* → pilih **Web app**.
3. Isi konfigurasi deployment:
   - **Description:** `Couple Finance Production v1.3`
   - **Execute as:** `Me (email-anda@gmail.com)` *(Wajib)*
   - **Who has access:** `Anyone` *(Wajib, agar frontend GitHub Pages dapat mengakses REST API)*
4. Klik **Deploy**.
5. Salin **Web app URL** yang dihasilkan (berakhiran `/exec`).
   *(Contoh: `https://script.google.com/macros/s/AKfycbx.../exec`)*.

---

## TAHAP 2: Mengonfigurasi Frontend (1 Menit)

1. Buka berkas [js/config.js](file:///e:/WEBSITE/ANTIGRATIVY/3.%20KEUANGAN%20PASUTRI/js/config.js) di folder proyek lokal Anda.
2. Tempelkan URL Web App yang Anda salin tadi ke dalam variabel `DEFAULT_GAS_URL`:
   ```javascript
   DEFAULT_GAS_URL: 'https://script.google.com/macros/s/AKfycbx.../exec',
   ```
3. Simpan berkas (`Ctrl + S`).
   *(Catatan: Anda juga bisa memasukkan URL ini langsung di antarmuka web app lewat menu **Pengaturan & Backup**).*

---

## TAHAP 3: Deploy Frontend ke GitHub Pages (Berdasarkan panduan github-pages-deploy-guide)

1. Buka [GitHub](https://github.com) dan buat repositori baru:
   - Nama repositori: `couple-finance` *(atau nama pilihan Anda)*
   - Visibilitas: **Public**
   - **JANGAN** centang opsi "Add a README file" atau .gitignore.
   - Klik **Create repository**.

2. Buka terminal (Git Bash atau PowerShell) di folder proyek:
   ```bash
   cd "e:\WEBSITE\ANTIGRATIVY\3. KEUANGAN PASUTRI"
   ```

3. Jalankan rangkaian perintah Git berikut secara berurutan:
   ```bash
   # 1. Inisialisasi Git
   git init

   # 2. Tambahkan seluruh berkas frontend
   git add .

   # 3. Commit perdana
   git commit -m "feat: Initial release Couple Finance v1.3 with 6 Core Pillars"

   # 4. Ubah branch utama menjadi main
   git branch -M main

   # 5. Hubungkan ke repositori GitHub Anda (Ganti USERNAME dengan akun GitHub Anda)
   git remote add origin https://github.com/USERNAME/couple-finance.git

   # 6. Kirim ke GitHub (Gunakan GitHub Personal Access Token jika diminta password)
   git push -u origin main
   ```

4. Mengaktifkan GitHub Pages:
   - Pada halaman repositori GitHub Anda, klik tab **Settings** → menu **Pages** di bilah kiri.
   - Pada bagian **Build and deployment**:
     - Source: `Deploy from a branch`
     - Branch: Pilih `main` dan folder `/ (root)`
     - Klik **Save**.
   - Centang opsi **Enforce HTTPS**.
   - Tunggu 1–2 menit, refresh halaman hingga muncul banner hijau bertuliskan:  
     `Your site is live at https://USERNAME.github.io/couple-finance/`

---

## 🔐 Kredensial Awal & Akses Masuk:

- **Pengguna Default:**
  - Profil 1: **Suami** (PIN Default: `123456`)
  - Profil 2: **Istri** (PIN Default: `123456`)
- **Mode Uji Coba Offline (Demo Simulation):**
  - Aplikasi web dapat langsung Anda buka dan coba di browser lokal (buka file `index.html`) meskipun belum dideploy ke GAS/GitHub. Aplikasi otomatis menyajikan data simulasi realistis dengan respons instan tanpa delay!
