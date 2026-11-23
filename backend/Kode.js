/**
 * =====================================================================================
 * COUPLE FINANCE – FAMILY FINANCIAL MANAGEMENT SYSTEM
 * Backend REST API Google Apps Script (GAS) — Versi 1.3 (Final Production Edition)
 * =====================================================================================
 * Arsitektur: Pure REST API JSON (ContentService), Decoupled Frontend (GitHub Pages)
 * Keamanan: Zero Literal Secrets (Script Properties), PIN 6-digit Salted HMAC, LockService
 * Performa: Batch Array Processing, Chunked CacheX, In-Flight Deduplication, Anti-CORS
 * =====================================================================================
 */

const APP_VERSION = '1.3.0';
const SESI_JAM = 24;

// =====================================================================================
// 1. AKSES SATU PINTU SCRIPT PROPERTIES (gas-rahasia-script-properties)
// =====================================================================================
const PROPS = PropertiesService.getScriptProperties();
let _PROP_MEMO = null;

function prop_(key, def) {
  if (!_PROP_MEMO) _PROP_MEMO = PROPS.getProperties() || {};
  const v = _PROP_MEMO[key];
  return (v === undefined || v === null || v === '') ? (def === undefined ? '' : def) : v;
}

function setProp_(key, val) {
  PROPS.setProperty(key, String(val));
  if (_PROP_MEMO) _PROP_MEMO[key] = String(val);
}

function setProps_(obj) {
  PROPS.setProperties(obj);
  if (_PROP_MEMO) Object.keys(obj).forEach(k => { _PROP_MEMO[k] = String(obj[k]); });
}

// Konfigurasi Database
const CONFIG = {
  get SPREADSHEET_ID() { return prop_('SPREADSHEET_ID'); },
  get UPLOADS_FOLDER_ID() { return prop_('UPLOADS_FOLDER_ID'); },
  get BACKUPS_FOLDER_ID() { return prop_('BACKUPS_FOLDER_ID'); },
  SHEETS: {
    transaksi: 'Transaksi',
    dompet: 'Dompet_Rekening',
    portofolio: 'Portofolio_Investasi',
    mutasiInvestasi: 'Mutasi_Investasi',
    hargaAset: 'Harga_Aset',
    anggaran: 'Anggaran_Bulanan',
    kategori: 'Kategori_Master',
    utangPiutang: 'Utang_Piutang',
    tagihanRutin: 'Tagihan_Rutin',
    targetTabungan: 'Target_Tabungan',
    mutasiTabungan: 'Mutasi_Tabungan',
    pengguna: 'Pengguna',
    pengaturan: 'Pengaturan',
    audit: 'Audit_Aktivitas'
  }
};

// =====================================================================================
// 2. KRIPTOGRAFI, PIN HASH, DAN TOKEN SESI BER-HMAC
// =====================================================================================
function acak_(n, huruf) {
  huruf = huruf || 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  while (s.length < n) {
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid())
      .forEach(b => { if (s.length < n) s += huruf[(b & 0xff) % huruf.length]; });
  }
  return s;
}

function secret_() {
  let s = prop_('SESSION_SECRET');
  if (!s) { s = acak_(64); setProp_('SESSION_SECRET', s); }
  return s;
}

function hmac_(s) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(s, secret_())).replace(/=+$/, '');
}

function hashPIN_(pin, salt) {
  let h = String(pin) + String(salt);
  for (let i = 0; i < 300; i++) {
    h = Utilities.base64Encode(Utilities.computeHmacSha256Signature(h, salt));
  }
  return h;
}

function samaAman_(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function signToken_(payload) {
  const body = Utilities.base64EncodeWebSafe(JSON.stringify(payload)).replace(/=+$/, '');
  return body + '.' + hmac_(body);
}

function verifyToken_(token) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 2 || !samaAman_(hmac_(parts[0]), parts[1])) return null;
    let b = parts[0]; while (b.length % 4) b += '=';
    const p = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(b)).getDataAsString());
    if (!p.x || p.x < Date.now()) return null;
    return p;
  } catch (e) {
    return null;
  }
}

// =====================================================================================
// 3. CACHEX – CHUNKING CACHE BESAR (> 50 KB) (gas-scale-turbo)
// =====================================================================================
const CacheX = {
  SZ: 50000,
  c: function () { return CacheService.getScriptCache(); },
  get: function (key) {
    try {
      const c = this.c(), head = c.get(key);
      if (head == null) return null;
      if (head.indexOf('__chunks:') !== 0) return JSON.parse(head);
      const n = +head.slice(9), keys = [];
      for (let i = 0; i < n; i++) keys.push(key + '#' + i);
      const parts = c.getAll(keys);
      let s = '';
      for (let i = 0; i < n; i++) {
        if (parts[keys[i]] == null) return null;
        s += parts[keys[i]];
      }
      return JSON.parse(s);
    } catch (e) { return null; }
  },
  put: function (key, val, ttl) {
    try {
      const s = JSON.stringify(val), c = this.c();
      if (s.length <= this.SZ) { c.put(key, s, ttl || 21600); return true; }
      const n = Math.ceil(s.length / this.SZ);
      if (n > 20) return false;
      const m = {};
      for (let i = 0; i < n; i++) m[key + '#' + i] = s.substr(i * this.SZ, this.SZ);
      c.putAll(m, ttl || 21600);
      c.put(key, '__chunks:' + n, ttl || 21600);
      return true;
    } catch (e) { return false; }
  },
  remove: function (key) {
    try {
      const c = this.c();
      c.remove(key);
      const keys = [];
      for (let i = 0; i < 20; i++) keys.push(key + '#' + i);
      c.removeAll(keys);
    } catch (e) {}
  }
};

function bumpCache() {
  CacheX.remove('boot_data');
  CacheX.remove('net_worth_stats');
}

// =====================================================================================
// 4. ENTRY POINTS — doGet & doPost (CORS-SAFE REST API)
// =====================================================================================
function doGet(e) {
  const t0 = Date.now();
  let res;
  try {
    const action = (e && e.parameter && e.parameter.action) || 'ping';
    if (action === 'ping') {
      res = { success: true, message: 'Couple Finance API Ready', version: APP_VERSION, time: new Date().toISOString() };
    } else if (action === 'getBootData') {
      res = getBootData();
    } else {
      res = { success: false, message: 'Action GET tidak dikenal: ' + action };
    }
  } catch (err) {
    res = { success: false, message: err.message };
  }
  res.ms = Date.now() - t0;
  return buildResponse_(res);
}

function doPost(e) {
  const t0 = Date.now();
  let body = {}, res;
  try {
    const raw = (e && e.postData && e.postData.contents) || '{}';
    body = JSON.parse(raw);
    res = dispatchPost_(body);
  } catch (err) {
    res = { success: false, message: err.message || 'Terjadi kesalahan sistem' };
  }
  res.ms = Date.now() - t0;
  res.v = APP_VERSION;
  return buildResponse_(res);
}

function buildResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Router Action POST
function dispatchPost_(body) {
  const action = body.action;
  const data = body.data || {};
  const token = body.token;

  // Endpoint Tanpa Token (Login / Auth)
  if (action === 'loginPIN') {
    return handleLoginPIN_(data.user_id, data.pin);
  }

  // Verifikasi Token untuk Seluruh Aksi Lainnya
  const session = verifyToken_(token);
  if (!session) {
    return { success: false, code: 'AUTH_EXPIRED', message: 'Sesi telah berakhir atau tidak valid. Silakan masukkan PIN kembali.' };
  }

  const actor = session.name || 'Sistem';

  // Endpoint dengan Perlindungan Concurrency Lock (LockService)
  switch (action) {
    case 'getBootData':
      return getBootData();

    case 'simpanTransaksi':
      return withLock_(function() {
        return handleSimpanTransaksi_(data, actor);
      });

    case 'hapusTransaksi':
      return withLock_(function() {
        return handleHapusTransaksi_(data.id_transaksi, actor);
      });

    case 'bayarTagihan':
      return withLock_(function() {
        return handleBayarTagihan_(data, actor);
      });

    case 'kelolaTagihanRutin':
      return withLock_(function() {
        return handleKelolaTagihanRutin_(data, actor);
      });

    case 'setorTarikTabungan':
      return withLock_(function() {
        return handleSetorTarikTabungan_(data, actor);
      });

    case 'kelolaTargetTabungan':
      return withLock_(function() {
        return handleKelolaTargetTabungan_(data, actor);
      });

    case 'beliAsetInvestasi':
      return withLock_(function() {
        return handleBeliAsetInvestasi_(data, actor);
      });

    case 'jualAsetInvestasi':
      return withLock_(function() {
        return handleJualAsetInvestasi_(data, actor);
      });

    case 'updateHargaAset':
      return withLock_(function() {
        return handleUpdateHargaAset_(data, actor);
      });

    case 'kelolaAnggaran':
      return withLock_(function() {
        return handleKelolaAnggaran_(data, actor);
      });

    case 'kelolaUtangPiutang':
      return withLock_(function() {
        return handleKelolaUtangPiutang_(data, actor);
      });

    case 'bayarCicilanUtangPiutang':
      return withLock_(function() {
        return handleBayarCicilanUtangPiutang_(data, actor);
      });

    case 'simpanPengaturan':
      return withLock_(function() {
        return handleSimpanPengaturan_(data, actor);
      });

    case 'gantiFotoProfil':
      return withLock_(function() {
        return handleGantiFotoProfil_(data, actor);
      });

    case 'tambahKategori':
      return withLock_(function() {
        return handleTambahKategori_(data, actor);
      });

    case 'backupDatabase':
      return handleBackupDatabase_(actor);

    default:
      return { success: false, message: 'Aksi POST tidak dikenal: ' + action };
  }
}

// Wrapper LockService Concurrency
function withLock_(fn) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    return fn();
  } catch (e) {
    return { success: false, message: 'Server sedang sibuk memproses transaksi lain. Silakan coba 5 detik lagi. (' + e.message + ')' };
  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

// =====================================================================================
// 5. HELPER DATABASE & SPREADSHEET
// =====================================================================================
function getSS_() {
  const id = CONFIG.SPREADSHEET_ID;
  if (!id) throw new Error('SPREADSHEET_ID belum terkonfigurasi di Script Properties.');
  return SpreadsheetApp.openById(id);
}

function getSheet_(name) {
  const ss = getSS_();
  const sh = ss.getSheetByName(name);
  if (!sh) throw new Error('Sheet "' + name + '" tidak ditemukan.');
  return sh;
}

function getSheetObjects_(sheetName) {
  const sh = getSheet_(sheetName);
  const v = sh.getDataRange().getValues();
  if (v.length <= 1) return [];
  const h = v[0].map(String);
  return v.slice(1).map((row, rIdx) => {
    const o = { _row: rIdx + 2 };
    h.forEach((key, cIdx) => {
      if (key) o[key] = row[cIdx];
    });
    return o;
  });
}

function logAudit_(aktor, aksi, sheetName, idRekaman, dataLama, dataBaru) {
  try {
    const sh = getSheet_(CONFIG.SHEETS.audit);
    sh.appendRow([
      'LOG-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss-') + acak_(4),
      new Date().toISOString(),
      aktor,
      aksi,
      sheetName,
      idRekaman || '',
      dataLama ? JSON.stringify(dataLama) : '',
      dataBaru ? JSON.stringify(dataBaru) : '',
      'WebApp Client'
    ]);
  } catch (e) {
    Logger.log('Audit Error: ' + e.message);
  }
}

// =====================================================================================
// 6. BUSINESS LOGIC: LOGIN & GET BOOT DATA (ALL IN ONE INSTANT PAYLOAD)
// =====================================================================================
function handleLoginPIN_(userId, pin) {
  const users = getSheetObjects_(CONFIG.SHEETS.pengguna);
  const user = users.find(u => String(u.id_pengguna) === String(userId));
  if (!user) {
    return { success: false, message: 'Profil pengguna tidak ditemukan.' };
  }

  const salt = user.pin_salt || '';
  const calculatedHash = hashPIN_(pin, salt);

  if (!samaAman_(calculatedHash, user.pin_hash)) {
    return { success: false, message: 'PIN yang Anda masukkan salah. Silakan coba lagi.' };
  }

  const now = Date.now();
  const payload = {
    id: user.id_pengguna,
    name: user.nama_panggilan,
    role: user.default_role || 'Dual-Admin',
    iat: now,
    x: now + SESI_JAM * 3600e3
  };
  const token = signToken_(payload);

  // Update Waktu Login
  try {
    const sh = getSheet_(CONFIG.SHEETS.pengguna);
    sh.getRange(user._row, 8).setValue(new Date().toISOString());
  } catch (e) {}

  return {
    success: true,
    token: token,
    user: {
      id: user.id_pengguna,
      name: user.nama_panggilan,
      role: user.default_role,
      avatar: user.avatar_url
    },
    message: 'Login berhasil!'
  };
}

function getBootData() {
  const cached = CacheX.get('boot_data');
  if (cached) return { success: true, data: cached, fromCache: true };

  const transaksi = getSheetObjects_(CONFIG.SHEETS.transaksi).filter(t => t.status === 'VALID');
  const dompet = getSheetObjects_(CONFIG.SHEETS.dompet).filter(w => w.status_aktif === true || w.status_aktif === 'TRUE');
  const portofolio = getSheetObjects_(CONFIG.SHEETS.portofolio);
  const mutasiInvestasi = getSheetObjects_(CONFIG.SHEETS.mutasiInvestasi);
  const hargaAset = getSheetObjects_(CONFIG.SHEETS.hargaAset);
  const anggaran = getSheetObjects_(CONFIG.SHEETS.anggaran);
  const kategori = getSheetObjects_(CONFIG.SHEETS.kategori).filter(k => k.status_aktif === true || k.status_aktif === 'TRUE');
  const utangPiutang = getSheetObjects_(CONFIG.SHEETS.utangPiutang).filter(u => u.status !== 'BATAL');
  const tagihanRutin = getSheetObjects_(CONFIG.SHEETS.tagihanRutin).filter(b => b.status_aktif === true || b.status_aktif === 'TRUE');
  const targetTabungan = getSheetObjects_(CONFIG.SHEETS.targetTabungan).filter(g => g.status !== 'DIARSIPKAN');
  const mutasiTabungan = getSheetObjects_(CONFIG.SHEETS.mutasiTabungan);
  const pengguna = getSheetObjects_(CONFIG.SHEETS.pengguna).map(u => ({
    id_pengguna: u.id_pengguna,
    nama_panggilan: u.nama_panggilan,
    avatar_url: u.avatar_url
  }));
  const pengaturanRaw = getSheetObjects_(CONFIG.SHEETS.pengaturan);
  const pengaturan = {};
  pengaturanRaw.forEach(p => { pengaturan[p.kunci] = p.nilai; });

  // Kalkulasi Saldo Berjalan Dompet Secara Dinamis
  const saldoMap = {};
  dompet.forEach(d => {
    saldoMap[d.id_dompet] = Number(d.saldo_awal) || 0;
  });

  transaksi.forEach(t => {
    const nom = Number(t.nominal) || 0;
    const asal = t.id_dompet_asal;
    const tujuan = t.id_dompet_tujuan;
    const jenis = t.jenis_transaksi;

    if (jenis === 'Pemasukan' || jenis === 'Jual Aset') {
      if (saldoMap[asal] !== undefined) saldoMap[asal] += nom;
    } else if (jenis === 'Pengeluaran' || jenis === 'Beli Aset' || jenis === 'Bayar Tagihan') {
      if (saldoMap[asal] !== undefined) saldoMap[asal] -= nom;
    } else if (jenis === 'Transfer') {
      if (saldoMap[asal] !== undefined) saldoMap[asal] -= nom;
      if (saldoMap[tujuan] !== undefined) saldoMap[tujuan] += nom;
    }
  });

  dompet.forEach(d => {
    d.saldo_berjalan = saldoMap[d.id_dompet] || 0;
  });

  // Hitung Net Worth & Ringkasan Metrik
  let totalCash = 0;
  dompet.forEach(d => { totalCash += Number(d.saldo_berjalan) || 0; });

  let totalInvestasi = 0;
  portofolio.forEach(p => {
    p.nilai_pasar_total = (Number(p.total_unit) || 0) * (Number(p.harga_pasar_terkini) || 0);
    p.unrealized_pnl = p.nilai_pasar_total - (Number(p.total_modal) || 0);
    p.unrealized_pnl_persen = p.total_modal > 0 ? (p.unrealized_pnl / p.total_modal) * 100 : 0;
    totalInvestasi += p.nilai_pasar_total;
  });

  let totalPiutang = 0;
  let totalUtang = 0;
  utangPiutang.forEach(u => {
    const sisa = Number(u.sisa_nominal) || 0;
    if (u.status === 'BELUM_LUNAS') {
      if (u.jenis === 'Piutang') totalPiutang += sisa;
      else if (u.jenis === 'Utang') totalUtang += sisa;
    }
  });

  // Target Tabungan Earmarked Funds
  let totalEarmarked = 0;
  targetTabungan.forEach(g => {
    totalEarmarked += Number(g.nominal_terkumpul) || 0;
  });

  const netWorth = (totalCash + totalInvestasi + totalPiutang) - totalUtang;

  const data = {
    transaksi,
    dompet,
    portofolio,
    mutasiInvestasi,
    hargaAset,
    anggaran,
    kategori,
    utangPiutang,
    tagihanRutin,
    targetTabungan,
    mutasiTabungan,
    pengguna,
    pengaturan,
    summary: {
      netWorth,
      totalCash,
      totalInvestasi,
      totalPiutang,
      totalUtang,
      totalEarmarked,
      serverTime: new Date().toISOString()
    }
  };

  CacheX.put('boot_data', data, 1800);
  return { success: true, data: data, fromCache: false };
}

// =====================================================================================
// 7. BUSINESS LOGIC: TRANSAKSI HARIAN (< 5 DETIK & LOCKSERVICE)
// =====================================================================================
function handleSimpanTransaksi_(data, actor) {
  const nominal = Number(data.nominal) || 0;
  if (nominal <= 0) return { success: false, message: 'Nominal transaksi harus lebih dari 0.' };
  if (!data.id_dompet_asal) return { success: false, message: 'Dompet asal wajib dipilih.' };

  const idTrx = data.id_transaksi || ('TRX-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss-') + acak_(4));
  const sh = getSheet_(CONFIG.SHEETS.transaksi);

  // Unggah Struk ke Drive jika ada base64
  let urlStruk = data.url_struk || '';
  if (data.struk_base64 && CONFIG.UPLOADS_FOLDER_ID) {
    try {
      const folder = DriveApp.getFolderById(CONFIG.UPLOADS_FOLDER_ID);
      const decoded = Utilities.base64Decode(data.struk_base64.split(',')[1] || data.struk_base64);
      const blob = Utilities.newBlob(decoded, 'image/jpeg', idTrx + '.jpg');
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      urlStruk = 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1000';
    } catch (e) {
      Logger.log('Gagal upload struk: ' + e.message);
    }
  }

  sh.appendRow([
    idTrx,
    new Date().toISOString(),
    data.tanggal || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
    data.waktu || Utilities.formatDate(new Date(), 'GMT+7', 'HH:mm'),
    data.pencatat || actor,
    data.sifat_transaksi || 'Rumah Tangga Bersama',
    data.jenis_transaksi || 'Pengeluaran',
    data.id_kategori || '',
    data.id_dompet_asal || '',
    data.id_dompet_tujuan || '',
    nominal,
    data.keterangan || '',
    urlStruk,
    data.id_referensi || '',
    'VALID'
  ]);

  bumpCache();
  logAudit_(actor, 'INSERT', CONFIG.SHEETS.transaksi, idTrx, null, data);
  return { success: true, message: 'Transaksi berhasil disimpan!', id_transaksi: idTrx };
}

function handleHapusTransaksi_(idTransaksi, actor) {
  if (!idTransaksi) return { success: false, message: 'ID Transaksi wajib diberikan.' };
  const sh = getSheet_(CONFIG.SHEETS.transaksi);
  const rows = sh.getDataRange().getValues();
  let foundRow = -1;
  let oldData = null;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(idTransaksi)) {
      foundRow = i + 1;
      oldData = rows[i];
      break;
    }
  }

  if (foundRow === -1) return { success: false, message: 'Transaksi tidak ditemukan.' };

  // Soft delete: status = DELETED
  sh.getRange(foundRow, 15).setValue('DELETED');
  bumpCache();
  logAudit_(actor, 'DELETE', CONFIG.SHEETS.transaksi, idTransaksi, { row: oldData }, { status: 'DELETED' });
  return { success: true, message: 'Transaksi berhasil dihapus!' };
}

// =====================================================================================
// 8. BUSINESS LOGIC: TAGIHAN RUTIN (1-CLICK PAY & ANTI-DUPLIKASI)
// =====================================================================================
function handleBayarTagihan_(data, actor) {
  const idTagihan = data.id_tagihan;
  const nominal = Number(data.nominal_bayar) || 0;
  const idDompet = data.id_dompet;
  const periode = data.periode_bulan || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM');

  if (!idTagihan || nominal <= 0 || !idDompet) {
    return { success: false, message: 'Data pembayaran tagihan tidak lengkap.' };
  }

  const shTagihan = getSheet_(CONFIG.SHEETS.tagihanRutin);
  const tagihanRows = shTagihan.getDataRange().getValues();
  let tagihanRowIdx = -1;
  let tagihanData = null;

  for (let i = 1; i < tagihanRows.length; i++) {
    if (String(tagihanRows[i][0]) === String(idTagihan)) {
      tagihanRowIdx = i + 1;
      tagihanData = tagihanRows[i];
      break;
    }
  }

  if (tagihanRowIdx === -1) return { success: false, message: 'Tagihan rutin tidak ditemukan.' };

  // Cek Idempotency: apakah sudah dibayar bulan ini
  const terakhirBayar = String(tagihanData[11] || '');
  if (terakhirBayar.indexOf(periode) === 0 && tagihanData[10] === 'Sudah Dibayar') {
    return { success: false, message: 'Tagihan ini sudah tercatat lunas untuk periode ' + periode + '!' };
  }

  // 1. Catat ke Transaksi Kas (Pengeluaran)
  const idTrx = 'TRX-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss-') + acak_(4);
  const shTrx = getSheet_(CONFIG.SHEETS.transaksi);
  shTrx.appendRow([
    idTrx,
    new Date().toISOString(),
    data.tanggal || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
    Utilities.formatDate(new Date(), 'GMT+7', 'HH:mm'),
    data.pencatat || actor,
    tagihanData[3] || 'Rumah Tangga Bersama',
    'Bayar Tagihan',
    tagihanData[2] || '', // id_kategori
    idDompet,
    '',
    nominal,
    'Pembayaran Tagihan Rutin: ' + tagihanData[1] + ' (' + periode + ')',
    data.url_struk || '',
    idTagihan,
    'VALID'
  ]);

  // 2. Perbarui Status di Tagihan_Rutin
  shTagihan.getRange(tagihanRowIdx, 11).setValue('Sudah Dibayar');
  shTagihan.getRange(tagihanRowIdx, 12).setValue(data.tanggal || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'));
  shTagihan.getRange(tagihanRowIdx, 13).setValue(idTrx);

  bumpCache();
  logAudit_(actor, 'BAYAR_TAGIHAN', CONFIG.SHEETS.tagihanRutin, idTagihan, null, { nominal, idTrx });
  return { success: true, message: 'Tagihan ' + tagihanData[1] + ' berhasil dibayar!', id_transaksi: idTrx };
}

function handleKelolaTagihanRutin_(data, actor) {
  const sh = getSheet_(CONFIG.SHEETS.tagihanRutin);
  const id = data.id_tagihan || ('BIL-' + acak_(4).toUpperCase());

  if (data.is_delete) {
    const rows = sh.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === String(id)) {
        sh.getRange(i + 1, 15).setValue('FALSE');
        bumpCache();
        return { success: true, message: 'Tagihan rutin berhasil dinonaktifkan.' };
      }
    }
  }

  sh.appendRow([
    id,
    data.nama_tagihan || '',
    data.id_kategori || '',
    data.sifat_tagihan || 'Rumah Tangga Bersama',
    data.tipe_nominal || 'TETAP',
    Number(data.nominal_estimasi) || 0,
    Number(data.tanggal_jatuh_tempo) || 1,
    data.frekuensi || 'Bulanan',
    data.id_dompet_default || '',
    Number(data.pengingat_h_minus) || 3,
    'Belum Dibayar',
    '',
    '',
    data.catatan || '',
    'TRUE'
  ]);

  bumpCache();
  logAudit_(actor, 'INSERT', CONFIG.SHEETS.tagihanRutin, id, null, data);
  return { success: true, message: 'Tagihan rutin berhasil disimpan!', id_tagihan: id };
}

// =====================================================================================
// 9. BUSINESS LOGIC: TARGET TABUNGAN (SAVINGS GOALS – EARMARKING NON-KONSUMTIF)
// =====================================================================================
function handleSetorTarikTabungan_(data, actor) {
  const idTarget = data.id_target;
  const tipe = data.tipe_mutasi; // SETORAN atau PENARIKAN
  const nominal = Number(data.nominal) || 0;
  const idDompet = data.id_dompet;

  if (!idTarget || nominal <= 0 || !idDompet || !tipe) {
    return { success: false, message: 'Data setoran/penarikan tabungan tidak lengkap.' };
  }

  const shTarget = getSheet_(CONFIG.SHEETS.targetTabungan);
  const rows = shTarget.getDataRange().getValues();
  let targetRowIdx = -1;
  let targetData = null;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(idTarget)) {
      targetRowIdx = i + 1;
      targetData = rows[i];
      break;
    }
  }

  if (targetRowIdx === -1) return { success: false, message: 'Target tabungan tidak ditemukan.' };

  let terkumpulLama = Number(targetData[5]) || 0;
  let terkumpulBaru = terkumpulLama;

  if (tipe === 'SETORAN') {
    terkumpulBaru = terkumpulLama + nominal;
  } else if (tipe === 'PENARIKAN') {
    if (nominal > terkumpulLama) {
      return { success: false, message: 'Nominal penarikan melebihi dana terkumpul (Maks: Rp ' + terkumpulLama.toLocaleString('id-ID') + ').' };
    }
    terkumpulBaru = terkumpulLama - nominal;
  }

  const nominalTarget = Number(targetData[4]) || 1;
  const sisa = Math.max(0, nominalTarget - terkumpulBaru);
  const persentase = Math.min(100, (terkumpulBaru / nominalTarget) * 100);
  const statusTarget = persentase >= 100 ? 'TERCAPAI' : 'AKTIF';

  // 1. Catat ke Mutasi_Tabungan
  const idMutasi = 'SAV-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss-') + acak_(4);
  const shMutasi = getSheet_(CONFIG.SHEETS.mutasiTabungan);
  shMutasi.appendRow([
    idMutasi,
    idTarget,
    new Date().toISOString(),
    data.tanggal || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
    tipe,
    data.pencatat || actor,
    nominal,
    idDompet,
    '',
    data.keterangan || (tipe === 'SETORAN' ? 'Alokasi Setoran Tabungan' : 'Penarikan Alokasi Tabungan')
  ]);

  // 2. Perbarui Target_Tabungan
  shTarget.getRange(targetRowIdx, 6).setValue(terkumpulBaru);
  shTarget.getRange(targetRowIdx, 7).setValue(sisa);
  shTarget.getRange(targetRowIdx, 8).setValue(persentase);
  shTarget.getRange(targetRowIdx, 12).setValue(statusTarget);

  bumpCache();
  logAudit_(actor, 'MUTASI_TABUNGAN', CONFIG.SHEETS.targetTabungan, idTarget, { terkumpulLama }, { terkumpulBaru, tipe, nominal });
  return { success: true, message: tipe + ' tabungan berhasil disimpan!', terkumpul: terkumpulBaru, persentase };
}

function handleKelolaTargetTabungan_(data, actor) {
  const sh = getSheet_(CONFIG.SHEETS.targetTabungan);
  const id = data.id_target || ('GOL-' + acak_(4).toUpperCase());

  sh.appendRow([
    id,
    data.nama_target || '',
    data.kategori_target || 'Lainnya',
    data.sifat_target || 'Tabungan Bersama',
    Number(data.nominal_target) || 0,
    0, // terkumpul awal
    Number(data.nominal_target) || 0, // sisa
    0, // persen
    data.tanggal_mulai || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
    data.target_tanggal_selesai || '',
    data.id_dompet_alokasi || '',
    data.catatan || '',
    'AKTIF'
  ]);

  bumpCache();
  logAudit_(actor, 'INSERT', CONFIG.SHEETS.targetTabungan, id, null, data);
  return { success: true, message: 'Target tabungan baru berhasil dibuat!', id_target: id };
}

// =====================================================================================
// 10. BUSINESS LOGIC: PORTOFOLIO INVESTASI (BELI, JUAL, UPDATE HARGA)
// =====================================================================================
function handleBeliAsetInvestasi_(data, actor) {
  const idAset = data.id_aset;
  const unitBeli = Number(data.jumlah_unit) || 0;
  const hargaBeli = Number(data.harga_satuan) || 0;
  const fee = Number(data.biaya_transaksi) || 0;
  const idDompet = data.id_dompet;
  const totalBersih = (unitBeli * hargaBeli) + fee;

  if (unitBeli <= 0 || hargaBeli <= 0 || !idDompet) {
    return { success: false, message: 'Data pembelian investasi tidak valid.' };
  }

  const shAset = getSheet_(CONFIG.SHEETS.portofolio);
  const rows = shAset.getDataRange().getValues();
  let rowIdx = -1;
  let asetData = null;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(idAset)) {
      rowIdx = i + 1;
      asetData = rows[i];
      break;
    }
  }

  let totalUnitLama = 0;
  let totalModalLama = 0;

  if (rowIdx > -1) {
    totalUnitLama = Number(asetData[5]) || 0;
    totalModalLama = Number(asetData[7]) || 0;
  }

  const totalUnitBaru = totalUnitLama + unitBeli;
  const totalModalBaru = totalModalLama + totalBersih;
  const avgBaru = totalUnitBaru > 0 ? (totalModalBaru / totalUnitBaru) : hargaBeli;

  // 1. Potong Kas Operasional
  const idTrx = 'TRX-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss-') + acak_(4);
  const shTrx = getSheet_(CONFIG.SHEETS.transaksi);
  shTrx.appendRow([
    idTrx,
    new Date().toISOString(),
    data.tanggal || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
    Utilities.formatDate(new Date(), 'GMT+7', 'HH:mm'),
    data.pencatat || actor,
    data.kepemilikan || 'Bersama',
    'Beli Aset',
    'Investasi',
    idDompet,
    '',
    totalBersih,
    'Beli Aset ' + (data.nama_aset || (asetData && asetData[2])),
    '',
    idAset,
    'VALID'
  ]);

  // 2. Catat Mutasi Investasi
  const idMutasi = 'MUT-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss-') + acak_(4);
  const shMut = getSheet_(CONFIG.SHEETS.mutasiInvestasi);
  shMut.appendRow([
    idMutasi,
    idAset,
    new Date().toISOString(),
    data.tanggal || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
    'BELI',
    data.pencatat || actor,
    unitBeli,
    hargaBeli,
    unitBeli * hargaBeli,
    fee,
    totalBersih,
    0, // realized PnL
    idTrx,
    data.keterangan || ''
  ]);

  // 3. Update atau Insert Portofolio
  if (rowIdx > -1) {
    shAset.getRange(rowIdx, 6).setValue(totalUnitBaru);
    shAset.getRange(rowIdx, 7).setValue(avgBaru);
    shAset.getRange(rowIdx, 8).setValue(totalModalBaru);
    shAset.getRange(rowIdx, 9).setValue(hargaBeli);
    shAset.getRange(rowIdx, 10).setValue(totalUnitBaru * hargaBeli);
    shAset.getRange(rowIdx, 13).setValue(new Date().toISOString());
  } else {
    shAset.appendRow([
      idAset,
      data.jenis_aset || 'Saham',
      data.nama_aset || '',
      data.kepemilikan || 'Bersama',
      data.lokasi_penyimpanan || '',
      unitBeli,
      avgBaru,
      totalModalBaru,
      hargaBeli,
      unitBeli * hargaBeli,
      0,
      0,
      new Date().toISOString()
    ]);
  }

  bumpCache();
  logAudit_(actor, 'BELI_ASET', CONFIG.SHEETS.portofolio, idAset, null, { unitBeli, hargaBeli, totalBersih });
  return { success: true, message: 'Pembelian aset berhasil disimpan!', id_mutasi: idMutasi };
}

function handleJualAsetInvestasi_(data, actor) {
  const idAset = data.id_aset;
  const unitJual = Number(data.jumlah_unit) || 0;
  const hargaJual = Number(data.harga_satuan) || 0;
  const fee = Number(data.biaya_transaksi) || 0;
  const idDompet = data.id_dompet;
  const totalKotor = unitJual * hargaJual;
  const totalBersih = totalKotor - fee;

  const shAset = getSheet_(CONFIG.SHEETS.portofolio);
  const rows = shAset.getDataRange().getValues();
  let rowIdx = -1;
  let asetData = null;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(idAset)) {
      rowIdx = i + 1;
      asetData = rows[i];
      break;
    }
  }

  if (rowIdx === -1) return { success: false, message: 'Aset tidak ditemukan di portofolio.' };

  const unitLama = Number(asetData[5]) || 0;
  if (unitJual > unitLama) {
    return { success: false, message: 'Jumlah unit jual (' + unitJual + ') melebihi kepemilikan unit (' + unitLama + ').' };
  }

  const avgBuy = Number(asetData[6]) || 0;
  const modalTerjual = unitJual * avgBuy;
  const realizedPnL = (unitJual * hargaJual) - modalTerjual - fee;

  const unitBaru = unitLama - unitJual;
  const modalBaru = (Number(asetData[7]) || 0) - modalTerjual;

  // 1. Tambah Kas Operasional Penerima
  const idTrx = 'TRX-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss-') + acak_(4);
  const shTrx = getSheet_(CONFIG.SHEETS.transaksi);
  shTrx.appendRow([
    idTrx,
    new Date().toISOString(),
    data.tanggal || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
    Utilities.formatDate(new Date(), 'GMT+7', 'HH:mm'),
    data.pencatat || actor,
    asetData[3] || 'Bersama',
    'Jual Aset',
    'Investasi',
    idDompet,
    '',
    totalBersih,
    'Jual Aset ' + asetData[2] + ' (' + unitJual + ' unit)',
    '',
    idAset,
    'VALID'
  ]);

  // 2. Catat Mutasi Jual
  const idMutasi = 'MUT-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss-') + acak_(4);
  const shMut = getSheet_(CONFIG.SHEETS.mutasiInvestasi);
  shMut.appendRow([
    idMutasi,
    idAset,
    new Date().toISOString(),
    data.tanggal || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
    'JUAL',
    data.pencatat || actor,
    unitJual,
    hargaJual,
    totalKotor,
    fee,
    totalBersih,
    realizedPnL,
    idTrx,
    data.keterangan || ''
  ]);

  // 3. Perbarui Portofolio
  shAset.getRange(rowIdx, 6).setValue(unitBaru);
  shAset.getRange(rowIdx, 8).setValue(modalBaru);
  shAset.getRange(rowIdx, 9).setValue(hargaJual);
  shAset.getRange(rowIdx, 10).setValue(unitBaru * hargaJual);
  shAset.getRange(rowIdx, 13).setValue(new Date().toISOString());

  bumpCache();
  logAudit_(actor, 'JUAL_ASET', CONFIG.SHEETS.portofolio, idAset, null, { unitJual, hargaJual, totalBersih, realizedPnL });
  return { success: true, message: 'Penjualan aset berhasil disimpan! Realized PnL: Rp ' + realizedPnL.toLocaleString('id-ID'), realizedPnL };
}

function handleUpdateHargaAset_(data, actor) {
  const idAset = data.id_aset;
  const hargaBaru = Number(data.harga_pasar_terkini) || 0;
  if (!idAset || hargaBaru <= 0) return { success: false, message: 'Data harga pasar tidak valid.' };

  const shAset = getSheet_(CONFIG.SHEETS.portofolio);
  const rows = shAset.getDataRange().getValues();
  let rowIdx = -1;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(idAset)) {
      rowIdx = i + 1;
      const unit = Number(rows[i][5]) || 0;
      shAset.getRange(rowIdx, 9).setValue(hargaBaru);
      shAset.getRange(rowIdx, 10).setValue(unit * hargaBaru);
      shAset.getRange(rowIdx, 13).setValue(new Date().toISOString());
      break;
    }
  }

  // Rekam Jejak Historis di Harga_Aset
  const shHarga = getSheet_(CONFIG.SHEETS.hargaAset);
  shHarga.appendRow([
    'PRC-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss-') + acak_(4),
    idAset,
    data.tanggal || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
    hargaBaru,
    actor,
    new Date().toISOString()
  ]);

  bumpCache();
  logAudit_(actor, 'UPDATE_PRICE', CONFIG.SHEETS.portofolio, idAset, null, { hargaBaru });
  return { success: true, message: 'Harga pasar aset berhasil diperbarui!' };
}

// =====================================================================================
// 11. BUSINESS LOGIC: ANGGARAN, UTANG PIUTANG, PENGATURAN, & BACKUP
// =====================================================================================
function handleKelolaAnggaran_(data, actor) {
  const sh = getSheet_(CONFIG.SHEETS.anggaran);
  const id = data.id_anggaran || ('BDG-' + (data.periode_bulan || '2026-11') + '-' + acak_(4));
  sh.appendRow([
    id,
    data.periode_bulan || '2026-11',
    data.id_kategori || '',
    data.alokasi_sifat || 'Semua',
    Number(data.nominal_anggaran) || 0,
    0, // realisasi
    Number(data.nominal_anggaran) || 0,
    0, // persen
    'AMAN'
  ]);
  bumpCache();
  return { success: true, message: 'Anggaran belanja berhasil disimpan!' };
}

function handleKelolaUtangPiutang_(data, actor) {
  const sh = getSheet_(CONFIG.SHEETS.utangPiutang);
  const id = data.id_utang_piutang || ('DEB-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-') + acak_(4));
  const nominal = Number(data.nominal_awal) || 0;

  sh.appendRow([
    id,
    data.tanggal || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
    data.jenis || 'Utang',
    data.pencatat || actor,
    data.pihak_kedua || '',
    data.sifat || 'Rumah Tangga Bersama',
    nominal,
    0, // total_terbayar
    nominal, // sisa
    data.jatuh_tempo || '',
    'BELUM_LUNAS',
    data.keterangan || ''
  ]);
  bumpCache();
  return { success: true, message: 'Data ' + (data.jenis || 'Utang') + ' berhasil disimpan!', id_utang_piutang: id };
}

function handleBayarCicilanUtangPiutang_(data, actor) {
  const id = data.id_utang_piutang;
  const nominal = Number(data.nominal) || 0;
  const idDompet = data.id_dompet;

  const sh = getSheet_(CONFIG.SHEETS.utangPiutang);
  const rows = sh.getDataRange().getValues();
  let rowIdx = -1;
  let current = null;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      rowIdx = i + 1;
      current = rows[i];
      break;
    }
  }

  if (rowIdx === -1) return { success: false, message: 'Data utang/piutang tidak ditemukan.' };

  const sisaLama = Number(current[8]) || 0;
  const bayarLama = Number(current[7]) || 0;
  const bayarBaru = bayarLama + nominal;
  const sisaBaru = Math.max(0, sisaLama - nominal);
  const status = sisaBaru === 0 ? 'LUNAS' : 'BELUM_LUNAS';

  // 1. Catat ke Transaksi Kas
  const jenisTrx = current[2] === 'Utang' ? 'Pengeluaran' : 'Pemasukan';
  const idTrx = 'TRX-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss-') + acak_(4);
  const shTrx = getSheet_(CONFIG.SHEETS.transaksi);
  shTrx.appendRow([
    idTrx,
    new Date().toISOString(),
    data.tanggal || Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd'),
    Utilities.formatDate(new Date(), 'GMT+7', 'HH:mm'),
    data.pencatat || actor,
    current[5] || 'Rumah Tangga Bersama',
    jenisTrx,
    'Utang Piutang',
    idDompet,
    '',
    nominal,
    'Cicilan ' + current[2] + ' (' + current[4] + ')',
    '',
    id,
    'VALID'
  ]);

  // 2. Perbarui Utang_Piutang
  sh.getRange(rowIdx, 8).setValue(bayarBaru);
  sh.getRange(rowIdx, 9).setValue(sisaBaru);
  sh.getRange(rowIdx, 11).setValue(status);

  bumpCache();
  logAudit_(actor, 'BAYAR_CICILAN', CONFIG.SHEETS.utangPiutang, id, null, { nominal, sisaBaru, status });
  return { success: true, message: 'Pembayaran cicilan ' + current[2] + ' berhasil!', sisa: sisaBaru, status };
}

function handleSimpanPengaturan_(data, actor) {
  const sh = getSheet_(CONFIG.SHEETS.pengaturan);
  const rows = sh.getDataRange().getValues();
  const keys = Object.keys(data);

  keys.forEach(k => {
    let found = false;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === k) {
        sh.getRange(i + 1, 2).setValue(String(data[k]));
        found = true;
        break;
      }
    }
    if (!found) {
      sh.appendRow([k, String(data[k]), 'Pengaturan User']);
    }
  });

  bumpCache();
  logAudit_(actor, 'UPDATE', CONFIG.SHEETS.pengaturan, 'APP_CONFIG', null, data);
  return { success: true, message: 'Pengaturan berhasil diperbarui!' };
}

function handleBackupDatabase_(actor) {
  try {
    const ssId = CONFIG.SPREADSHEET_ID;
    const backupFolderId = CONFIG.BACKUPS_FOLDER_ID;
    if (!ssId || !backupFolderId) {
      return { success: false, message: 'Folder backup Google Drive belum terkonfigurasi.' };
    }

    const file = DriveApp.getFileById(ssId);
    const folder = DriveApp.getFolderById(backupFolderId);
    const timeStr = Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd_HHmm');
    const backupName = 'CoupleFinance_DB_Backup_' + timeStr;
    const copy = file.makeCopy(backupName, folder);

    // Housekeeping: pertahankan maksimal 12 backup
    const files = folder.getFiles();
    const backupFiles = [];
    while (files.hasNext()) {
      const f = files.next();
      backupFiles.push({ file: f, date: f.getDateCreated() });
    }
    backupFiles.sort((a, b) => b.date - a.date);
    if (backupFiles.length > 12) {
      for (let i = 12; i < backupFiles.length; i++) {
        backupFiles[i].file.setTrashed(true);
      }
    }

    logAudit_(actor, 'BACKUP', 'GoogleDrive', copy.getId(), null, { backupName });
    return { success: true, message: 'Backup berhasil dibuat: ' + backupName, backup_id: copy.getId() };
  } catch (e) {
    return { success: false, message: 'Gagal membuat backup: ' + e.message };
  }
}

function handleGantiFotoProfil_(data, actor) {
  const userId = data.user_id;
  const avatarUrl = data.avatar_url;
  if (!userId || !avatarUrl) return { success: false, message: 'Data avatar tidak lengkap.' };

  const sh = getSheet_(CONFIG.SHEETS.pengguna);
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(userId)) {
      sh.getRange(i + 1, 6).setValue(avatarUrl);
      bumpCache();
      logAudit_(actor, 'UPDATE_AVATAR', CONFIG.SHEETS.pengguna, userId, null, { avatarUrl });
      return { success: true, message: 'Foto profil berhasil diperbarui!' };
    }
  }
  return { success: false, message: 'Pengguna tidak ditemukan.' };
}

function handleTambahKategori_(data, actor) {
  const nama = data.nama_kategori;
  const tipe = data.tipe || 'Pengeluaran';
  if (!nama) return { success: false, message: 'Nama kategori wajib diisi.' };

  const id = 'KAT-' + acak_(4).toUpperCase();
  const sh = getSheet_(CONFIG.SHEETS.kategori);
  sh.appendRow([
    id,
    nama,
    tipe,
    data.kelompok_default || 'Rumah Tangga Bersama',
    data.ikon || 'tag',
    data.warna_badge || '#0E4D43',
    'TRUE'
  ]);

  bumpCache();
  logAudit_(actor, 'INSERT', CONFIG.SHEETS.kategori, id, null, data);
  return { success: true, message: 'Kategori berhasil ditambahkan!', id_kategori: id };
}
