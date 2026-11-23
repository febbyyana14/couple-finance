# Product Requirements Document (PRD)
## Couple Finance – Family Financial Management System
### Versi 1.3 – Final Technical Specification (6 Core Financial Pillars)

**Target Platform:** Web App Google Apps Script (GAS) & Google Sheets Database  
**Arsitektur Frontend:** Single Page Application (SPA) Responsive — Desktop, Tablet, & Smartphone  
**Konsep Visual:** *Premium Vintage Modern Dashboard* (Deep Vintage Teal & Warm Ivory)  
**Status Dokumen:** Final & Terkunci Permanen (Dilengkapi Modul Savings Goals)  
**Terakhir Diperbarui:** 23 November 2026  

---

## DAFTAR ISI
1. [Ringkasan Eksekutif & 6 Pilar Utama Produk](#1-ringkasan-eksekutif--6-pilar-utama-produk)
2. [Matriks Pengguna, Autentikasi, & Keamanan (Dual-Admin RBAC)](#2-matriks-pengguna-autentikasi--keamanan-dual-admin-rbac)
3. [Aturan Bisnis & Integritas Finansial yang Dikunci](#3-aturan-bisnis--integritas-finansial-yang-dikunci)
4. [Arsitektur Database Google Sheets (14 Sheets Terintegrasi)](#4-arsitektur-database-google-sheets-14-sheets-terintegrasi)
5. [Rumus Matematis Finansial & Mesin Kalkulasi Otomatis](#5-rumus-matematis-finansial--mesin-kalkulasi-otomatis)
6. [Detail Fungsional 6 Pilar Utama Finansial Keluarga](#6-detail-fungsional-6-pilar-utama-finansial-keluarga)
7. [Modul Khusus: Target Tabungan & Alokasi Dana (Savings Goals)](#7-modul-khusus-target-tabungan--alokasi-dana-savings-goals)
8. [Spesifikasi Antarmuka UI/UX (Premium Vintage Modern)](#8-spesifikasi-antarmuka-uiux-premium-vintage-modern)
9. [Integritas Data, Pencegahan Transaksi Ganda (LockService), & Audit Trail](#9-integritas-data-pencegahan-transaksi-ganda-lockservice--audit-trail)
10. [Sistem Backup Otomatis & Pemulihan Data (Disaster Recovery)](#10-sistem-backup-otomatis--pemulihan-data-disaster-recovery)
11. [Arsitektur Teknis Google Apps Script & Manajemen Kuota](#11-arsitektur-teknis-google-apps-script--manajemen-kuota)
12. [Rencana Roadmap Implementasi & Deployment](#12-rencana-roadmap-implementasi--deployment)

---

## 1. Ringkasan Eksekutif & 6 Pilar Utama Produk

**Couple Finance – Family Financial Management** adalah sistem operasi finansial rumah tangga komprehensif berbasis web (*Single Page Application*) yang dirancang khusus untuk pasangan suami dan istri. Sistem ini mengusung prinsip transparansi kemitraan penuh (*dual-admin equality*), integritas matematis (*anti-double counting*), dan kemandirian data (*zero cloud server cost*) di atas ekosistem Google Workspace.

Sistem Couple Finance berpusat pada **6 Pilar Utama Finansial Keluarga**:

```
+-----------------------------------------------------------------------------------------+
|                  COUPLE FINANCE: 6 PILAR UTAMA FINANSIAL KELUARGA                       |
+-----------------------------------------------------------------------------------------+
|  [ PILAR 1 ] Daily Finance        : Catat mutasi pemasukan, pengeluaran & transfer (<5s)|
|  [ PILAR 2 ] Monthly Budget       : Anggaran belanja bulanan per kategori & anti-bocor  |
|  [ PILAR 3 ] Recurring Expenses   : Pengawasan tagihan rutin (WiFi, listrik, sewa, dll) |
|  [ PILAR 4 ] Savings Goals        : Perencanaan & alokasi target tabungan keluarga      |
|  [ PILAR 5 ] Investment Tracker   : Portofolio multi-aset (Cash, BTC, Saham, Emas)      |
|  [ PILAR 6 ] Net Worth Engine     : Perhitungan kekayaan bersih keluarga secara komplit |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Matriks Pengguna, Autentikasi, & Keamanan (Dual-Admin RBAC)

Sistem menggunakan model **Kemitraan Setara (Dual-Master / Dual-Admin)**. Suami dan Istri memiliki derajat wewenang yang seimbang tanpa subordinasi.

### 2.1 Matriks Hak Akses Pengguna
| Fitur / Modul | Suami | Istri | Catatan Keamanan |
| :--- | :---: | :---: | :--- |
| **1. Daily Finance** | Penuh (CRUD) | Penuh (CRUD) | Rekam identitas pencatat otomatis |
| **2. Monthly Budget** | Penuh (CRUD) | Penuh (CRUD) | Sinkronisasi realisasi otomatis |
| **3. Recurring Expenses** | Penuh (CRUD) | Penuh (CRUD) | Konfirmasi bayar 1-klik, anti-duplikasi |
| **4. Savings Goals** | Penuh (CRUD) | Penuh (CRUD) | Earmarking dana tanpa double counting |
| **5. Investment Tracker** | Penuh (CRUD) | Penuh (CRUD) | Menghitung realized & unrealized PnL |
| **6. Net Worth Engine** | Penuh | Penuh | Agregasi dinamis aset & liabilitas |
| **Utang & Piutang** | Penuh (CRUD) | Penuh (CRUD) | Penyesuaian kalkulasi liabilitas Net Worth |
| **Ekspor Data (Excel & PDF)** | Penuh | Penuh | Filter harian, bulanan, tahunan |
| **Pengaturan & Branding** | Penuh | Penuh | Konfigurasi tema, logo, dan nama keluarga |
| **Audit Trail Log** | Baca (Read-only)| Baca (Read-only)| Terkunci permanen tanpa tombol hapus |

### 2.2 Mekanisme Autentikasi & Sesi Klien
- **Verifikasi Kredensial:** PIN 6-digit unik (*PIN Suami* dan *PIN Istri*) tersimpan dalam format hash SHA-256 ber-garam (*salt*) pada sheet `Pengguna`.
- **Sesi Token Klien:** Token sesi bertanda tangan HMAC-SHA256 disimpan di `sessionStorage` (masa aktif 24 jam).
- **Quick Switch Profile:** Tombol sakelar profil di *Header* memungkinkan beralih pencatat aktif hanya dengan memasukkan PIN tanpa reload aplikasi.

---

## 3. Aturan Bisnis & Integritas Finansial yang Dikunci

1. **Aturan Pencatat Wajib:** Setiap mutasi mutlak menyimpan identitas pencatat (`Suami` atau `Istri`).
2. **Aturan Sifat Pos Wajib:** Setiap transaksi wajib diklasifikasikan ke salah satu dari 3 pos:
   - `Pribadi Suami`
   - `Pribadi Istri`
   - `Rumah Tangga Bersama`
3. **Netralitas Transfer:** Transaksi jenis `Transfer` antar-dompet bukan pemasukan dan bukan pengeluaran. Mutasi hanya mengubah saldo dompet asal (- nominal) dan dompet tujuan (+ nominal).
4. **Mekanisme Pembelian & Penjualan Aset:**
   - Pembelian aset memotong dompet kas operasional, menambah unit & modal pada `Portofolio_Investasi`, dan dicatat di `Mutasi_Investasi`.
   - Penjualan aset mengurangi unit pada `Portofolio_Investasi`, menambah kas operasional, dan menghitung laba/rugi terealisasi (*Realized PnL*).
5. **Anti-Double Counting (Pemisahan Kas Operasional vs Investasi):**
   - Saldo dompet operasional di sheet `Dompet_Rekening` **dilarang** dihitung ulang sebagai aset investasi jenis `Cash`.
   - Kategori `Cash` di sheet `Portofolio_Investasi` hanya untuk kas alokasi investasi (RDPU pasar uang, kas standby broker sekuritas, atau dana darurat terpisah).
6. **Integritas Target Tabungan (Savings Goals - Earmarking Non-Konsumtif):**
   - **Bukan Pengeluaran Konsumtif:** Setoran ke target tabungan **bukan pengeluaran belanja**, melainkan pemisahan alokasi dana (*virtual earmarking*).
   - **Anti-Double Counting Aset:** Dana target tabungan **tidak boleh** ditambahkan sebagai pos aset baru dalam kalkulasi Net Worth karena dana tersebut sudah berada di dalam saldo dompet/rekening riil (`Dompet_Rekening`).
   - **Koneksi Dompet Riil:** Setiap setoran wajib menunjuk dompet/rekening sumber, dan setiap penarikan wajib menunjuk dompet/rekening tujuan.
7. **Integritas Pembayaran Tagihan Rutin:**
   - Konfirmasi pembayaran tagihan rutin untuk periode bulan berjalan otomatis mencatat transaksi jenis `Bayar Tagihan` di sheet `Transaksi`.
   - Dilarang keras melakukan pembayaran ganda pada tagihan yang sama di periode bulan yang sama (*idempotent recurring payment*).
8. **Pengaruh Utang-Piutang terhadap Net Worth:**
   - `Utang` (Kewajiban keluarga) = Pengurang Net Worth.
   - `Piutang` (Hak tagih uang keluar) = Penambah aset Net Worth.
9. **Kemandirian Filter Analitik:** Filter dashboard (`All Family`, `Pribadi Suami`, `Pribadi Istri`, `Rumah Tangga Bersama`) murni penyaring visual, tanpa memodifikasi baris data riil di database.

---

## 4. Arsitektur Database Google Sheets (14 Sheets Terintegrasi)

Sistem menggunakan satu file Google Spreadsheet database dengan **14 Sheet** terstandardisasi:

```
+-----------------------------------------------------------------------------------------+
|                           GOOGLE SPREADSHEET (DATABASE INDUK)                           |
+-----------------------------------------------------------------------------------------+
| 1. Transaksi           | 6. Anggaran_Bulanan    | 10. Target_Tabungan    | 13. Pengaturan |
| 2. Dompet_Rekening     | 7. Kategori_Master     | 11. Mutasi_Tabungan    | 14. Audit_     |
| 3. Portofolio_Investasi| 8. Utang_Piutang       | 12. Pengguna           |     Aktivitas  |
| 4. Mutasi_Investasi    | 9. Tagihan_Rutin       |                        |                |
| 5. Harga_Aset          |                        |                        |                |
+-----------------------------------------------------------------------------------------+
```

### Rincian 14 Sheet:

1. **`Transaksi`:** Mutasi harian (ID: `TRX-YYYYMMDD-XXXX`). Kolom: `id_transaksi`, `timestamp`, `tanggal`, `waktu`, `pencatat`, `sifat_transaksi`, `jenis_transaksi` (*Pemasukan, Pengeluaran, Transfer, Beli Aset, Jual Aset, Bayar Tagihan*), `id_kategori`, `id_dompet_asal`, `id_dompet_tujuan`, `nominal`, `keterangan`, `url_struk`, `id_referensi`, `status`.
2. **`Dompet_Rekening`:** Master akun kas, bank, e-wallet (ID: `WLT-XX`). Kolom: `id_dompet`, `nama_dompet`, `tipe_akun`, `kepemilikan`, `nomor_rekening`, `saldo_awal`, `saldo_berjalan`, `status_aktif`.
3. **`Portofolio_Investasi`:** Master aset investasi (ID: `AST-XX`). Kolom: `id_aset`, `jenis_aset` (*Cash, Bitcoin (BTC), Saham, Emas (Gold)*), `nama_aset`, `kepemilikan`, `lokasi_penyimpanan`, `total_unit`, `harga_rata_rata`, `total_modal`, `harga_pasar_terkini`, `nilai_pasar_total`, `unrealized_pnl`, `unrealized_pnl_persen`, `terakhir_update`.
4. **`Mutasi_Investasi`:** Log mutasi beli, jual, dividen (ID: `MUT-YYYYMMDD-XXXX`). Kolom: `id_mutasi`, `id_aset`, `timestamp`, `tanggal`, `tipe_mutasi`, `pencatat`, `jumlah_unit`, `harga_satuan`, `total_nominal`, `biaya_transaksi`, `total_bersih`, `realized_pnl`, `id_transaksi_kas`, `keterangan`.
5. **`Harga_Aset`:** Riwayat harga pasar per tanggal untuk grafik (ID: `PRC-YYYYMMDD-XXXX`). Kolom: `id_harga`, `id_aset`, `tanggal_harga`, `harga_pasar`, `diperbarui_oleh`, `timestamp`.
6. **`Anggaran_Bulanan`:** Pagu anggaran per kategori (ID: `BDG-YYYYMM-XXXX`). Kolom: `id_anggaran`, `periode_bulan`, `id_kategori`, `alokasi_sifat`, `nominal_anggaran`, `realisasi`, `sisa_anggaran`, `persentase`, `status_warning`.
7. **`Kategori_Master`:** Master kategori pengeluaran/pemasukan (ID: `KAT-XX`). Kolom: `id_kategori`, `nama_kategori`, `tipe`, `kelompok_default`, `ikon`, `warna_badge`, `status_aktif`.
8. **`Utang_Piutang`:** Buku utang keluarga & piutang luar (ID: `DEB-YYYYMMDD-XXXX`). Kolom: `id_utang_piutang`, `tanggal`, `jenis`, `pencatat`, `pihak_kedua`, `sifat`, `nominal_awal`, `total_terbayar`, `sisa_nominal`, `jatuh_tempo`, `status`, `keterangan`.
9. **`Tagihan_Rutin`:** Master pengeluaran berulang (ID: `BIL-XX`). Kolom: `id_tagihan`, `nama_tagihan`, `id_kategori`, `sifat_tagihan`, `tipe_nominal` (*TETAP / VARIABEL*), `nominal_estimasi`, `tanggal_jatuh_tempo`, `frekuensi`, `id_dompet_default`, `pengingat_h_minus`, `status_bulan_ini` (*Belum Dibayar / Menunggu Pembayaran / Sudah Dibayar*), `terakhir_dibayar`, `id_transaksi_terakhir`, `catatan`, `status_aktif`.
10. **`Target_Tabungan` (MODUL BARU):** Master target tabungan & rencana finansial (ID: `GOL-XX`). Kolom: `id_target`, `nama_target`, `kategori_target`, `sifat_target` (*Tabungan Bersama / Tabungan Pribadi Suami / Tabungan Pribadi Istri*), `nominal_target`, `nominal_terkumpul`, `sisa_kebutuhan`, `persentase_progress`, `tanggal_mulai`, `target_tanggal_selesai`, `id_dompet_alokasi`, `status` (*AKTIF / TERCAPAI / DIARSIPKAN*), `catatan`.
11. **`Mutasi_Tabungan` (MODUL BARU):** Buku besar riwayat setoran & penarikan alokasi tabungan (ID: `SAV-YYYYMMDD-XXXX`). Kolom: `id_mutasi_tabungan`, `id_target`, `timestamp`, `tanggal`, `tipe_mutasi` (*SETORAN / PENARIKAN*), `pencatat` (*Suami / Istri*), `nominal`, `id_dompet`, `id_transaksi_kas`, `keterangan`.
12. **`Pengguna`:** Kredensial Suami & Istri (ID: `USR-01` & `USR-02`). Kolom: `id_pengguna`, `nama_panggilan`, `email_google`, `pin_hash`, `pin_salt`, `avatar_url`, `default_role`, `terakhir_login`.
13. **`Pengaturan`:** Key-value store konfigurasi app. Kolom: `kunci`, `nilai`, `deskripsi`.
14. **`Audit_Aktivitas`:** Log permanen audit trail (ID: `LOG-YYYYMMDD-XXXX`). Kolom: `id_log`, `timestamp`, `aktor`, `aksi`, `nama_sheet`, `id_rekaman`, `data_lama`, `data_baru`, `ip_address`.

---

## 5. Rumus Matematis Finansial & Mesin Kalkulasi Otomatis

### 5.1 Saldo Berjalan Dompet Kas Operasional
$$\text{Saldo Berjalan}_w = \text{Saldo Awal}_w + \sum \text{Masuk}_w - \sum \text{Keluar}_w + \sum \text{Transfer In}_w - \sum \text{Transfer Out}_w - \sum \text{Beli Aset}_w + \sum \text{Jual Aset}_w$$

### 5.2 Perhitungan Akumulasi Target Tabungan
Untuk setiap target tabungan $g$ pada sheet `Target_Tabungan`:
1. **Nominal Terkumpul Terkini ($S_g$):**
   $$S_g = \sum \text{Setoran}_g - \sum \text{Penarikan}_g$$
2. **Sisa Kebutuhan Dana ($R_g$):**
   $$R_g = \max(0, \text{Nominal Target}_g - S_g)$$
3. **Persentase Pencapaian ($\% P_g$):**
   $$\% P_g = \min\left(100\%, \left(\frac{S_g}{\text{Nominal Target}_g}\right) \times 100\%\right)$$
4. **Estimasi Waktu Tercapai (Bulan):**
   $$\text{Estimasi Bulan} = \frac{R_g}{\text{Rata-Rata Setoran Bulanan}_g}$$

### 5.3 Perhitungan Portofolio Investasi
1. $\text{Total Unit Terkini} = \sum \text{Unit Beli} - \sum \text{Unit Jual}$
2. $\text{Nilai Pasar Total} = \text{Total Unit} \times \text{Harga Pasar Terkini}$
3. $\text{Unrealized PnL} = \text{Nilai Pasar Total} - \text{Total Modal Aktif}$
4. $\text{Realized PnL} = (\text{Unit Jual} \times \text{Harga Jual}) - (\text{Unit Jual} \times \text{Harga Rata-Rata Beli}) - \text{Biaya Transaksi}$

### 5.4 Perhitungan Total Kekayaan Bersih (Net Worth Engine)
$$\text{Net Worth} = \text{Total Aset} - \text{Total Kewajiban}$$
$$\text{Total Aset} = \text{Saldo Dompet Operasional} + \text{Nilai Pasar Investasi} + \text{Piutang Aktif}$$
$$\text{Total Kewajiban} = \text{Sisa Saldo Utang Aktif}$$

*Catatan Integritas:* Total dana yang dialokasikan ke target tabungan **tidak dijumlahkan lagi** ke Total Aset karena dana tersebut sudah berada di dalam saldo dompet/rekening riil (`Saldo Dompet Operasional`). Ini mencegah duplikasi saldo secara matematis.

---

## 6. Detail Fungsional 6 Pilar Utama Finansial Keluarga

### Pilar 1: Daily Finance (Keuangan Harian Instan < 5 Detik)
- Tombol Pintas Form: Pemasukan | Pengeluaran | Transfer | Beli Aset | Bayar Tagihan | Alokasi Tabungan.
- Input cerdas ramah ponsel, format Rupiah otomatis, upload foto struk terkompresi (< 300 KB).
- Buku transaksi dengan multi-filter dan pencarian teks instan.

### Pilar 2: Monthly Budget (Pengendalian Anggaran & Anti-Bocor)
- Pagu anggaran per kategori untuk bulan berjalan.
- Indikator visual 3 warna: Hijau (<75%), Kuning (75%-90%), Merah (>90% Alert).
- Fitur *Copy Budget* dari bulan sebelumnya.

### Pilar 3: Recurring Expenses (Manajemen Tagihan & Beban Rutin)
- Monitoring tagihan bulanan: WiFi, listrik, PDAM, pulsa, sewa rumah, bensin, langganan SaaS, asuransi, pendidikan.
- Dukungan tagihan nominal tetap (*Fixed*) dan berubah-ubah (*Variable*).
- Konfirmasi pembayaran 1-klik (*One-Click Pay*) bebas duplikasi (`LockService`).
- Smart alert banner di dashboard untuk tagihan mendekati jatuh tempo (H-3).

### Pilar 4: Savings Goals (Target Tabungan & Earmarking Dana)
- Perencanaan dan pemantauan target tabungan keluarga (Dana Darurat, Rumah, Liburan, Pendidikan Anak, Kendaraan).
- Pelacakan progress nominal, persentase, estimasi tanggal tercapai, dan progress bar visual.
- Setoran dan penarikan yang terhubung dengan dompet kas riil tanpa risiko double counting.

### Pilar 5: Investment Tracker (Portofolio Multi-Aset)
- 4 Pilar Instrumen: Cash (khusus investasi), Bitcoin (BTC), Saham, dan Emas (Gold).
- Pelacakan modal beli, harga rata-rata, nilai pasar total, dan PnL mengambang/terealisasi.
- Modal pembaruan harga pasar manual kapan saja dengan rekam jejak di `Harga_Aset`.

### Pilar 6: Net Worth Engine (Sentralisasi Kekayaan Bersih Keluarga)
- Tampilan kartu Net Worth paling atas di dashboard secara *real-time*.
- Grafik tren Net Worth bulanan (*Line Chart*) dan diagram alokasi aset (*Donut Chart*).
- Integrasi utang & piutang aktif menjamin angka kekayaan bersih keluarga 100% nyata.

---

## 7. Modul Khusus: Target Tabungan & Alokasi Dana (Savings Goals)

### 7.1 Karakteristik & Klasifikasi Target Tabungan
- **Klasifikasi Sifat Target:**
  - `Tabungan Bersama` (Dana Darurat Keluarga, Beli Rumah/Renovasi, Liburan Keluarga, Pendidikan Anak, Tabungan Anniversary).
  - `Tabungan Pribadi Suami` (Gadget/Hobi Suami, Asuransi Pribadi, Modal Usaha Pribadi).
  - `Tabungan Pribadi Istri` (Perhiasan/Emas Istri, Kursus Keterampilan, Perawatan Pribadi).
- **Struktur Parameter Target:**
  - Nama Target (contoh: "Dana Darurat 6 Bulan", "Liburan ke Jepang Akhir Tahun").
  - Kategori Target (Darurat, Properti, Liburan, Pendidikan, Kendaraan, Lainnya).
  - Nominal Target (Rupiah).
  - Nominal Terkumpul (Dihitung otomatis dari akumulasi setoran - penarikan).
  - Sisa Kebutuhan Dana (`nominal_target - nominal_terkumpul`).
  - Tanggal Mulai dan Target Tanggal Selesai.
  - Dompet Penampung Dana (Rekening bank/dompet tempat dana tabungan secara fisik disimpan, misal: Rekening Tabungan Jenius Save It).

### 7.2 Alur Setoran & Penarikan Dana (*Zero-Double-Counting Earmarking*)
```
[ SETORAN TABUNGAN ] ────► Pilih Target Tabungan & Dompet Sumber Dana
                           Catat Mutasi di Sheet Mutasi_Tabungan (Tipe: SETORAN)
                           Update Nominal Terkumpul di Sheet Target_Tabungan
                           *TIDAK MENGURANGI NET WORTH (Karena murni alokasi internal)

[ PENARIKAN TABUNGAN ] ──► Pilih Target Tabungan & Dompet Tujuan Dana
                           Validasi: Nominal tarik <= Saldo terkumpul target
                           Catat Mutasi di Sheet Mutasi_Tabungan (Tipe: PENARIKAN)
                           Kurangi Nominal Terkumpul di Sheet Target_Tabungan
```

### 7.3 Visualisasi & Dashboard Target Tabungan
- **Kartu Metrik Tabungan:**
  - Total Dana Dialokasikan untuk Seluruh Tabungan (Total akumulasi yang di-earmark).
  - Jumlah Target Aktif Berjalan.
  - Target yang Hampir Tercapai (Progress > 80%).
  - Target yang Sudah Selesai / Tercapai (Progress = 100%).
- **Kartu Target Visual (Savings Goal Cards):**
  - Ikon kategori yang menarik (Rumah, Pesawat, Payung Darurat, Wisuda, Mobil).
  - Badge sifat pos: `Bersama` (Teal), `Suami` (Blue), `Istri` (Amber).
  - Indikator Progress Bar bertingkat:
    - Biru: Progress < 50%
    - Teal/Hijau: Progress 50% – 99%
    - Emas Cerah: Progress 100% (*Target Tercapai!*)
  - Teks metrik: *"Terkumpul Rp 35.000.000 dari Rp 50.000.000 (70%) — Sisa Rp 15.000.000"*.
  - Estimasi cerdas: *"Berdasarkan rata-rata setoran Rp 2.500.000/bln, target tercapai dalam 6 bulan (Mei 2027)"*.
  - Tombol Aksi: [ + Setor Dana ] dan [ - Tarik Dana ].

### 7.4 Pengelolaan & Riwayat Mutasi
- Pengguna dapat mengedit target, mengarsipkan target yang batal, atau menandai selesai target yang sudah terwujud.
- Riwayat setoran/penarikan dapat dilihat secara transparan oleh Suami dan Istri dalam tab riwayat mutasi tabungan.

---

## 8. Spesifikasi Antarmuka UI/UX (Premium Vintage Modern)

Mengadopsi konsep **Premium Vintage Modern Dashboard** terinspirasi dari referensi visual yang disetujui:

```
+---------------------------------------------------------------------------------------------------------+
| [≡] Couple Finance     🔍 Cari transaksi...               [☀️/🌙] [🎨]   [👤 Suami ▾ (PIN)]             |
+---------------------------------------------------------------------------------------------------------+
| SIDEBAR               | KARTU RINGKASAN UTAMA (Warm Ivory Cards - Rounded-2xl)                          |
| (Deep Vintage Teal)   | +-----------------+ +-----------------+ +-----------------+ +-----------------+ |
| --------------------- | | NET WORTH       | | TOTAL CASH      | | INCOME (BLN INI)| | EXPENSE (BLN INI)| |
| 📊 Dashboard          | | Rp 450.850.000  | | Rp 68.200.000   | | Rp 32.500.000   | | Rp 18.345.000   | |
| ⚡ Catat Cepat (+)    | +-----------------+ +-----------------+ +-----------------+ +-----------------+ |
| 💳 Buku Transaksi     |                                                                                 |
| 📅 Tagihan Rutin (2)  | BANNER PENGINGAT TAGIHAN: [ ⚠️ 2 Tagihan Jatuh Tempo dalam 3 Hari: WiFi & Listrik ]|
| 🎯 Anggaran Belanja   |---------------------------------------------------------------------------------|
| 🏆 Target Tabungan    | KARTU TARGET TABUNGAN KELUARGA (SAVINGS GOALS):                                 |
| 📈 Portofolio Aset    | [ Dana Darurat: 70% ] [ Liburan Jepang: 45% ] [ Beli Mobil: 25% ]               |
| 🤝 Utang & Piutang    | Total Dana Dialokasikan: Rp 48.500.000 (Terdistribusi di 3 Target Aktif)       |
| 📑 Laporan & PDF      |---------------------------------------------------------------------------------|
| 🏛️ Master Dompet/Kat  | GRAFIK 1: CASH FLOW BULANAN (Bar)       | GRAFIK 2: NET WORTH GROWTH (Line)     |
| ⚙️ Pengaturan Aplikasi| [ Pemasukan vs Pengeluaran ]            | [ Tren Perkembangan Kekayaan Bersih ] |
| 🔒 Kunci Profil       |---------------------------------------------------------------------------------|
|                       | GRAFIK 3: ALOKASI ASET (Donut)          | GRAFIK 4: DISTRIBUSI PENGELUARAN (Bar)|
|                       | [ BTC | Cash | Saham | Emas ]           | [ Belanja Rutin | Rumah | Pribadi ]   |
+-----------------------+---------------------------------------------------------------------------------+
```

### Palet Warna & Desain Token:
- **Sidebar & Navigasi Utama:** *Deep Vintage Teal* (`#0E4D43` primer, `#134E48` hover).
- **Latar Belakang Panel Konten:**
  - *Light Mode:* *Warm Ivory* (`#FAF7F2` latar utama, `#FFFFFF` kartu konten, border `#E5E0D8`).
  - *Dark Mode:* *Deep Slate Obsidian* (`#0F172A` latar utama, `#1E293B` kartu konten, border `#334155`).
- **Aksen Kartu Indikator, Tagihan, & Tabungan:**
  - *Net Worth & Investasi:* Emerald Teal (`#10B981` / `#059669`).
  - *Total Kas / Pemasukan:* Royal Blue Lembut (`#0284C7` / `#0369A1`).
  - *Pengeluaran / Anggaran Alert:* Warm Terracotta Coral (`#EA580C` / `#C2410C`).
  - *Tagihan Menunggu Pembayaran:* Amber Emas Vintage (`#D97706` / `#F59E0B`).
  - *Target Tabungan Tercapai:* Golden Glow (`#EAB308` / `#CA8A04`).
  - *Tagihan Belum Dibayar / Terlambat:* Red Rose Alert (`#E11D48`).
- **Karakteristik Komponen:**
  - Sudut membulat modern (`rounded-2xl`).
  - Sidebar *collapsible* (ciut desktop, model drawer di smartphone).
  - Sakelar instan Dark Mode / Light Mode tersimpan permanen di `localStorage`.
  - Kustomisasi Logo, Nama Aplikasi, dan Warna Aksen.

---

## 9. Integritas Data, Pencegahan Transaksi Ganda (LockService), & Audit Trail

### 9.1 Pencegahan Transaksi Ganda (Concurrency Lock & Idempotency)
Setiap mutasi finansial (termasuk setoran tabungan dan pembayaran tagihan rutin) dibungkus menggunakan `LockService.getScriptLock()`:
```javascript
const lock = LockService.getScriptLock();
try {
  lock.waitLock(15000); // Batas antrean 15 detik
  
  // 1. Validasi Token Idempotency Klien (Mencegah Klik Ganda)
  // 2. Baca data sheet terbaru dalam batch
  // 3. Validasi aturan bisnis
  // 4. Tulis mutasi transaksi dan perbarui saldo target tabungan / dompet
  // 5. Catat log audit aktivitas
} finally {
  lock.releaseLock();
}
```

### 9.2 Sistem Audit Trail Permanen
- Sheet `Audit_Aktivitas` mencatat setiap aksi penambahan, perubahan, penghapusan, pelunasan tagihan, atau mutasi tabungan.
- Menyimpan snapshot JSON `data_lama` dan `data_baru` tanpa tombol hapus di UI.

---

## 10. Sistem Backup Otomatis & Pemulihan Data (Disaster Recovery)

- **Backup Otomatis Mingguan:** Trigger time-driven berkala menduplikasi Spreadsheet database setiap 7 hari sekali ke folder Google Drive `CoupleFinance_Backups/` (retensi 12 file cadangan terakhir).
- **Backup Manual Sekali Klik:** Pengguna dapat membuat snapshot cadangan instan kapan saja dari menu Pengaturan.
- **Pemulihan Data (Restore):** Memulihkan data dari file cadangan dengan otorisasi PIN ganda Suami & Istri.

---

## 11. Arsitektur Teknis Google Apps Script & Manajemen Kuota

| Batasan Google Workspace | Strategi Mitigasi Arsitektur |
| :--- | :--- |
| **Batas Waktu Eksekusi (6 Menit)** | Menggunakan metode **Batch Processing** (`getValues()` / `setValues()`). Respon rata-rata server < 1,5 detik. |
| **Batas Kuota Read/Write Sheets** | Menggunakan **Client-Side Caching** (`localStorage` untuk kategori, dompet, tagihan, target tabungan) dan **CacheService** backend. |
| **Batas Payload Upload Gambar** | Foto struk dikompresi di sisi browser klien menjadi resolusi maksimal 1280px (< 300 KB) sebelum dikirim ke GAS. |
| **Penyimpanan Berkas Terpusat** | Otomatis membuat folder Google Drive `CoupleFinance_Uploads/` dan `CoupleFinance_Backups/`. |
| **Deployment Standalone** | Dideploy sebagai Web App standalone (*Execute as: Me*, *Access: Anyone*) yang diproteksi autentikasi PIN 6-digit ber-HMAC. |

---

## 12. Rencana Roadmap Implementasi & Deployment

Pembangunan aplikasi Couple Finance dibagi dalam 5 tahapan terstruktur:

```
[ FASE 1: STRUKTUR DATABASE (14 SHEETS) & BACKEND CORE ]
  • Setup 14 sheet terstruktur & relasi data
  • Endpoint API REST JSON (Transaksi, Dompet, Portofolio, Anggaran, Tagihan, Tabungan)
  • Implementasi LockService & Idempotency Engine

[ FASE 2: FRONTEND SPA & DESAIN PREMIUM VINTAGE MODERN ]
  • Layout Sidebar Collapsible Deep Teal & panel Warm Ivory (Dark/Light mode)
  • Form Catat Cepat (< 5 detik), Modal Bayar Tagihan, & Modal Setor Tabungan
  • Kompresi foto struk langsung di browser

[ FASE 3: DASHBOARD, TARGET TABUNGAN, & 4 GRAFIK ANALITIK ]
  • Integrasi Chart.js: Cashflow Bar, Net Worth Line, Asset Donut, Expense Breakdown
  • Widget Banner Pengingat Tagihan & Widget Target Tabungan Berjalan
  • Filter cerdas: All Family, Suami, Istri, Bersama

[ FASE 4: PELAPORAN RESMI, AUDIT TRAIL, & BACKUP OTOMATIS ]
  • Ekspor Excel (.xlsx/.csv) & Generator Laporan Bulanan Cetak PDF
  • Time-driven trigger backup otomatis mingguan ke Google Drive
  • Uji coba menyeluruh anti-double counting & simulasi pembayaran simultan

[ FASE 5: GO-LIVE & PANDUAN PENGGUNA ]
  • Deploy Web App Google Apps Script standalone
  • Konfigurasi PIN awal Suami & Istri serta pengujian di smartphone
```

---

🎨 **Tahapan Khusus: Penentuan Visual UI/UX**
1. **Unggah Referensi:** Silakan unggah referensi tangkapan layar, warna, dan gaya antarmuka yang diinginkan. *(Referensi visual Premium Vintage Modern Dashboard telah disetujui).*
2. **Jika Ingin Mengembangkan Prototipe Lebih Lanjut:**
   - Salin seluruh teks dokumen PRD Final di atas.
   - Buka Google Stitch, lalu tempelkan teks PRD ke dalamnya.
   - Unduh hasil pratinjau desain visual yang dihasilkan oleh Google Stitch.
   - Unggah gambar hasil desain tersebut ke percakapan ini untuk diimplementasikan ke dalam kode HTML/CSS.
