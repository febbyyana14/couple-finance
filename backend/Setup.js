/**
 * =====================================================================================
 * COUPLE FINANCE – SETUP & ENVIRONMENT INITIALIZATION
 * File: Setup.js (Jalankan fungsi setupAppEnvironment() SEKALI di Editor Apps Script)
 * =====================================================================================
 * Fungsi ini mengotomatiskan pembuatan:
 * 1. Folder Google Drive: "📁 Couple Finance"
 *    ├── "📂 CoupleFinance_Uploads" (Untuk foto struk/nota belanja)
 *    └── "📂 CoupleFinance_Backups" (Untuk arsip cadangan mingguan)
 * 2. Google Spreadsheet Database dengan 14 SHEET LENGKAP & HEADER RESMI
 * 3. Data Awal: Kategori Belanja, Akun Dompet Contoh, Konfigurasi Aplikasi, & Profil Pasutri
 * 4. Pengaturan Script Properties Otomatis (Zero-Manual Setup)
 * =====================================================================================
 */

function setupAppEnvironment() {
  Logger.log('🚀 Memulai inisialisasi lingkungan Couple Finance...');

  // 1. Buat Folder Terpusat di Google Drive
  const rootFolder = DriveApp.createFolder('📁 Couple Finance App');
  const uploadsFolder = rootFolder.createFolder('📂 CoupleFinance_Uploads');
  const backupsFolder = rootFolder.createFolder('📂 CoupleFinance_Backups');

  // Izin publik view untuk folder uploads agar foto struk bisa dimuat di web app
  uploadsFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // 2. Buat Google Spreadsheet Baru
  const ss = SpreadsheetApp.create('🗃️ Couple Finance – Database Induk (14 Sheets)');
  const ssFile = DriveApp.getFileById(ss.getId());
  ssFile.moveTo(rootFolder);

  Logger.log('📄 Spreadsheet berhasil dibuat: ' + ss.getUrl());

  // 3. Konfigurasi 14 Lembar Kerja (Sheets)
  const sheetsDef = [
    {
      name: 'Transaksi',
      headers: [
        'id_transaksi', 'timestamp', 'tanggal', 'waktu', 'pencatat', 
        'sifat_transaksi', 'jenis_transaksi', 'id_kategori', 'id_dompet_asal', 
        'id_dompet_tujuan', 'nominal', 'keterangan', 'url_struk', 'id_referensi', 'status'
      ]
    },
    {
      name: 'Dompet_Rekening',
      headers: [
        'id_dompet', 'nama_dompet', 'tipe_akun', 'kepemilikan', 
        'nomor_rekening', 'saldo_awal', 'saldo_berjalan', 'status_aktif'
      ]
    },
    {
      name: 'Portofolio_Investasi',
      headers: [
        'id_aset', 'jenis_aset', 'nama_aset', 'kepemilikan', 'lokasi_penyimpanan', 
        'total_unit', 'harga_rata_rata', 'total_modal', 'harga_pasar_terkini', 
        'nilai_pasar_total', 'unrealized_pnl', 'unrealized_pnl_persen', 'terakhir_update'
      ]
    },
    {
      name: 'Mutasi_Investasi',
      headers: [
        'id_mutasi', 'id_aset', 'timestamp', 'tanggal', 'tipe_mutasi', 
        'pencatat', 'jumlah_unit', 'harga_satuan', 'total_nominal', 
        'biaya_transaksi', 'total_bersih', 'realized_pnl', 'id_transaksi_kas', 'keterangan'
      ]
    },
    {
      name: 'Harga_Aset',
      headers: ['id_harga', 'id_aset', 'tanggal_harga', 'harga_pasar', 'diperbarui_oleh', 'timestamp']
    },
    {
      name: 'Anggaran_Bulanan',
      headers: [
        'id_anggaran', 'periode_bulan', 'id_kategori', 'alokasi_sifat', 
        'nominal_anggaran', 'realisasi', 'sisa_anggaran', 'persentase', 'status_warning'
      ]
    },
    {
      name: 'Kategori_Master',
      headers: ['id_kategori', 'nama_kategori', 'tipe', 'kelompok_default', 'ikon', 'warna_badge', 'status_aktif']
    },
    {
      name: 'Utang_Piutang',
      headers: [
        'id_utang_piutang', 'tanggal', 'jenis', 'pencatat', 'pihak_kedua', 
        'sifat', 'nominal_awal', 'total_terbayar', 'sisa_nominal', 'jatuh_tempo', 'status', 'keterangan'
      ]
    },
    {
      name: 'Tagihan_Rutin',
      headers: [
        'id_tagihan', 'nama_tagihan', 'id_kategori', 'sifat_tagihan', 'tipe_nominal', 
        'nominal_estimasi', 'tanggal_jatuh_tempo', 'frekuensi', 'id_dompet_default', 
        'pengingat_h_minus', 'status_bulan_ini', 'terakhir_dibayar', 'id_transaksi_terakhir', 'catatan', 'status_aktif'
      ]
    },
    {
      name: 'Target_Tabungan',
      headers: [
        'id_target', 'nama_target', 'kategori_target', 'sifat_target', 'nominal_target', 
        'nominal_terkumpul', 'sisa_kebutuhan', 'persentase_progress', 'tanggal_mulai', 
        'target_tanggal_selesai', 'id_dompet_alokasi', 'status', 'catatan'
      ]
    },
    {
      name: 'Mutasi_Tabungan',
      headers: [
        'id_mutasi_tabungan', 'id_target', 'timestamp', 'tanggal', 'tipe_mutasi', 
        'pencatat', 'nominal', 'id_dompet', 'id_transaksi_kas', 'keterangan'
      ]
    },
    {
      name: 'Pengguna',
      headers: ['id_pengguna', 'nama_panggilan', 'email_google', 'pin_hash', 'pin_salt', 'avatar_url', 'default_role', 'terakhir_login']
    },
    {
      name: 'Pengaturan',
      headers: ['kunci', 'nilai', 'deskripsi']
    },
    {
      name: 'Audit_Aktivitas',
      headers: ['id_log', 'timestamp', 'aktor', 'aksi', 'nama_sheet', 'id_rekaman', 'data_lama', 'data_baru', 'ip_address']
    }
  ];

  // Buat dan format setiap sheet
  sheetsDef.forEach((def, index) => {
    let sh = (index === 0) ? ss.getActiveSheet().setName(def.name) : ss.insertSheet(def.name);
    sh.clear();
    sh.appendRow(def.headers);
    
    // Format Header: Deep Teal Background, White Text, Bold, Freeze Row 1
    const headerRange = sh.getRange(1, 1, 1, def.headers.length);
    headerRange.setBackground('#0E4D43');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    sh.setFrozenRows(1);
  });

  // 4. Data Awal: Pengguna (Suami & Istri dengan Default PIN 123456)
  const saltSuami = Utilities.getUuid();
  const saltIstri = Utilities.getUuid();
  const defaultPinHashSuami = hashPIN_('123456', saltSuami);
  const defaultPinHashIstri = hashPIN_('123456', saltIstri);

  const shUser = ss.getSheetByName('Pengguna');
  shUser.appendRow([
    'USR-01', 'Suami', Session.getActiveUser().getEmail() || 'suami@example.com',
    defaultPinHashSuami, saltSuami, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suami', 'Dual-Admin', ''
  ]);
  shUser.appendRow([
    'USR-02', 'Istri', 'istri@example.com',
    defaultPinHashIstri, saltIstri, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Istri', 'Dual-Admin', ''
  ]);

  // 5. Data Awal: Dompet & Rekening Operasional
  const shDompet = ss.getSheetByName('Dompet_Rekening');
  shDompet.appendRow(['WLT-01', 'BCA Payroll (Suami)', 'Bank', 'Pribadi Suami', '••••1234', 25000000, 25000000, 'TRUE']);
  shDompet.appendRow(['WLT-02', 'Mandiri Operasional (Istri)', 'Bank', 'Pribadi Istri', '••••5678', 18500000, 18500000, 'TRUE']);
  shDompet.appendRow(['WLT-03', 'Rekening Bersama Rumah Tangga', 'Bank', 'Bersama', '••••9999', 15000000, 15000000, 'TRUE']);
  shDompet.appendRow(['WLT-04', 'GoPay & OVO Belanja', 'E-Wallet', 'Bersama', '0812••••', 1200000, 1200000, 'TRUE']);
  shDompet.appendRow(['WLT-05', 'Kas Tunai Dompet', 'Tunai', 'Bersama', '-', 1500000, 1500000, 'TRUE']);

  // 6. Data Awal: Kategori Master
  const shKat = ss.getSheetByName('Kategori_Master');
  const kategoriAwal = [
    ['KAT-01', 'Makanan & Minuman', 'Pengeluaran', 'Rumah Tangga Bersama', 'utensils', '#EA580C', 'TRUE'],
    ['KAT-02', 'Kebutuhan Dapur & Sembako', 'Pengeluaran', 'Rumah Tangga Bersama', 'shopping-cart', '#EA580C', 'TRUE'],
    ['KAT-03', 'Listrik & Utilitas', 'Pengeluaran', 'Rumah Tangga Bersama', 'zap', '#D97706', 'TRUE'],
    ['KAT-04', 'Air & PDAM', 'Pengeluaran', 'Rumah Tangga Bersama', 'faucet', '#0284C7', 'TRUE'],
    ['KAT-05', 'WiFi & Internet', 'Pengeluaran', 'Rumah Tangga Bersama', 'wifi', '#0284C7', 'TRUE'],
    ['KAT-06', 'Transportasi & Bensin', 'Pengeluaran', 'Rumah Tangga Bersama', 'car', '#10B981', 'TRUE'],
    ['KAT-07', 'Sewa / KPR Rumah', 'Pengeluaran', 'Rumah Tangga Bersama', 'house', '#6366F1', 'TRUE'],
    ['KAT-08', 'Perawatan Rumah & Servis', 'Pengeluaran', 'Rumah Tangga Bersama', 'wrench', '#64748B', 'TRUE'],
    ['KAT-09', 'Kesehatan, Obat & BPJS', 'Pengeluaran', 'Rumah Tangga Bersama', 'heart-pulse', '#EF4444', 'TRUE'],
    ['KAT-10', 'Pendidikan Anak & Sekolah', 'Pengeluaran', 'Rumah Tangga Bersama', 'book-open', '#8B5CF6', 'TRUE'],
    ['KAT-11', 'Belanja Harian & Pakaian', 'Pengeluaran', 'Rumah Tangga Bersama', 'bag-shopping', '#EC4899', 'TRUE'],
    ['KAT-12', 'Hiburan & Liburan', 'Pengeluaran', 'Rumah Tangga Bersama', 'umbrella-beach', '#F59E0B', 'TRUE'],
    ['KAT-13', 'Pulsa & Paket Data', 'Pengeluaran', 'Rumah Tangga Bersama', 'mobile-screen', '#0284C7', 'TRUE'],
    ['KAT-14', 'Langganan Aplikasi (Netflix/SaaS)', 'Pengeluaran', 'Rumah Tangga Bersama', 'tv', '#E11D48', 'TRUE'],
    ['KAT-15', 'Donasi, Zakat & Sedekah', 'Pengeluaran', 'Rumah Tangga Bersama', 'hand-holding-heart', '#10B981', 'TRUE'],
    ['KAT-16', 'Pribadi Suami (Hobi/Gadget)', 'Pengeluaran', 'Pribadi Suami', 'laptop', '#0E4D43', 'TRUE'],
    ['KAT-17', 'Pribadi Istri (Skincare/Fashion)', 'Pengeluaran', 'Pribadi Istri', 'sparkles', '#D97706', 'TRUE'],
    ['KAT-18', 'Pengeluaran Lainnya (dll)', 'Pengeluaran', 'Rumah Tangga Bersama', 'ellipsis', '#64748B', 'TRUE'],
    ['KAT-19', 'Gaji Pokok & Upah', 'Pemasukan', 'Rumah Tangga Bersama', 'briefcase', '#10B981', 'TRUE'],
    ['KAT-20', 'Bonus, THR & Tunjangan', 'Pemasukan', 'Rumah Tangga Bersama', 'gift', '#10B981', 'TRUE'],
    ['KAT-21', 'Hasil Usaha & Dagang', 'Pemasukan', 'Rumah Tangga Bersama', 'store', '#0284C7', 'TRUE'],
    ['KAT-22', 'Freelance & Sampingan', 'Pemasukan', 'Rumah Tangga Bersama', 'computer', '#0284C7', 'TRUE'],
    ['KAT-23', 'Dividen, Kupon & Investasi', 'Pemasukan', 'Rumah Tangga Bersama', 'coins', '#EAB308', 'TRUE'],
    ['KAT-24', 'Pemasukan Lainnya (dll)', 'Pemasukan', 'Rumah Tangga Bersama', 'ellipsis', '#64748B', 'TRUE']
  ];
  kategoriAwal.forEach(k => shKat.appendRow(k));

  // 7. Data Awal: Tagihan Rutin Contoh
  const shTagihan = ss.getSheetByName('Tagihan_Rutin');
  shTagihan.appendRow(['BIL-01', 'IndiHome 100Mbps (WiFi)', 'KAT-03', 'Rumah Tangga Bersama', 'TETAP', 450000, 5, 'Bulanan', 'WLT-03', 3, 'Belum Dibayar', '', '', 'ID Pelanggan: 122345678', 'TRUE']);
  shTagihan.appendRow(['BIL-02', 'Listrik PLN Pascabayar', 'KAT-02', 'Rumah Tangga Bersama', 'VARIABEL', 850000, 20, 'Bulanan', 'WLT-03', 3, 'Belum Dibayar', '', '', 'No Meteran: 543210987', 'TRUE']);
  shTagihan.appendRow(['BIL-03', 'Netflix 4K Family', 'KAT-09', 'Rumah Tangga Bersama', 'TETAP', 186000, 15, 'Bulanan', 'WLT-01', 3, 'Sudah Dibayar', Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-15'), 'TRX-SAMPLE-01', 'Akun Family', 'TRUE']);

  // 8. Data Awal: Target Tabungan Contoh
  const shTarget = ss.getSheetByName('Target_Tabungan');
  shTarget.appendRow(['GOL-01', 'Dana Darurat 6 Bulan', 'Darurat', 'Tabungan Bersama', 60000000, 35000000, 25000000, 58.3, '2026-01-01', '2027-06-30', 'WLT-01', 'AKTIF', 'Disimpan di rekening cadangan']);
  shTarget.appendRow(['GOL-02', 'Liburan Keluarga Jepang', 'Liburan', 'Tabungan Bersama', 30000000, 13500000, 16500000, 45.0, '2026-03-01', '2027-12-31', 'WLT-02', 'AKTIF', 'Rencana berangkat musim dingin']);
  shTarget.appendRow(['GOL-03', 'Laptop Baru Suami', 'Gadget', 'Tabungan Pribadi Suami', 20000000, 17000000, 3000000, 85.0, '2026-05-01', '2027-02-28', 'WLT-01', 'AKTIF', 'Kebutuhan kerja remote']);

  // 9. Data Awal: Portofolio Investasi Contoh
  const shPorto = ss.getSheetByName('Portofolio_Investasi');
  shPorto.appendRow(['AST-BTC', 'Bitcoin (BTC)', 'Bitcoin', 'Bersama', 'Hardware Wallet', 0.25, 950000000, 237500000, 1450000000, 362500000, 125000000, 52.6, new Date().toISOString()]);
  shPorto.appendRow(['AST-BBCA', 'Saham', 'Bank Central Asia (BBCA)', 'Pribadi Suami', 'Mirae Asset Sekuritas', 25, 9200, 23000000, 10150, 25375000, 2375000, 10.3, new Date().toISOString()]);
  shPorto.appendRow(['AST-GOLD', 'Emas (Gold)', 'Logam Mulia Antam 25g', 'Pribadi Istri', 'Brankas Rumah', 25, 1250000, 31250000, 1420000, 35500000, 4250000, 13.6, new Date().toISOString()]);

  // 10. Data Awal: Pengaturan Aplikasi
  const shSetting = ss.getSheetByName('Pengaturan');
  const configAwal = [
    ['app_name', 'Couple Finance – Family Financial Management', 'Nama aplikasi yang ditampilkan di header'],
    ['app_logo_url', '', 'URL logo kustom'],
    ['theme_default', 'light', 'Tema default: light atau dark'],
    ['color_sidebar', '#0E4D43', 'Warna primer sidebar Deep Vintage Teal'],
    ['color_background', '#FAF7F2', 'Warna kanvas Warm Ivory'],
    ['drive_folder_struk_id', uploadsFolder.getId(), 'ID folder Google Drive untuk foto struk'],
    ['drive_folder_backup_id', backupsFolder.getId(), 'ID folder Google Drive untuk backup'],
    ['backup_interval_days', '7', 'Interval backup otomatis (hari)'],
    ['last_backup_timestamp', new Date().toISOString(), 'Waktu backup terakhir']
  ];
  configAwal.forEach(c => shSetting.appendRow(c));

  // 11. Simpan ke Script Properties
  PropertiesService.getScriptProperties().setProperties({
    SPREADSHEET_ID: ss.getId(),
    UPLOADS_FOLDER_ID: uploadsFolder.getId(),
    BACKUPS_FOLDER_ID: backupsFolder.getId(),
    SESSION_SECRET: secret_()
  });

  // 12. Buat Pemicu Otomatis (Time-driven trigger backup setiap 7 hari sekali jam 02:00)
  try {
    ScriptApp.newTrigger('triggerAutomatedBackup')
      .timeBased()
      .everyDays(7)
      .atHour(2)
      .create();
    Logger.log('⏰ Trigger backup otomatis mingguan berhasil diaktifkan.');
  } catch (e) {
    Logger.log('Catatan trigger: ' + e.message);
  }

  Logger.log('========================================================');
  Logger.log('🎉 SETUP SELESAI DENGAN SUKSES!');
  Logger.log('👉 SPREADSHEET ID: ' + ss.getId());
  Logger.log('👉 UPLOADS FOLDER: ' + uploadsFolder.getUrl());
  Logger.log('👉 BACKUPS FOLDER: ' + backupsFolder.getUrl());
  Logger.log('👉 DEFAULT PIN: 123456 (Bisa diubah setelah login)');
  Logger.log('========================================================');
}

function triggerAutomatedBackup() {
  handleBackupDatabase_('SISTEM_CRON');
}
