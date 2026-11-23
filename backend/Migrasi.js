/**
 * =====================================================================================
 * COUPLE FINANCE – MODUL MIGRASI & SINKRONISASI DATABASE SPREADSHEET
 * File: Migrasi.js (Berdasarkan panduan skill gas-migrasi-database)
 * =====================================================================================
 * Kegunaan:
 * - Memindahkan data dari spreadsheet keuangan lama tanpa merusak atau menyentuh spreadsheet lama.
 * - Idempoten (aman diulang berulang kali tanpa risiko duplikasi baris).
 * - Mendukung Mode Pindai (Dry-Run) terlebih dahulu untuk menghitung data baru, update, dan skip.
 * =====================================================================================
 */

function migrasiDataLama(sourceSpreadsheetIdOrUrl, dryRun = true) {
  Logger.log('🔍 Memulai ' + (dryRun ? '[DRY-RUN SCAN]' : '[EKSEKUSI REAL]') + ' migrasi database...');
  
  const m = String(sourceSpreadsheetIdOrUrl).match(/\/d\/([A-Za-z0-9_-]{20,})/);
  const sourceId = m ? m[1] : String(sourceSpreadsheetIdOrUrl).trim();
  
  if (sourceId === SpreadsheetApp.getActiveSpreadsheet().getId()) {
    throw new Error('Spreadsheet yang dimasukkan adalah spreadsheet aplikasi baru. Masukkan ID spreadsheet LAMA.');
  }

  let sourceSS;
  try {
    sourceSS = SpreadsheetApp.openById(sourceId);
  } catch (e) {
    throw new Error('Spreadsheet lama tidak dapat dibuka. Pastikan ID benar dan berada di akun Google yang sama: ' + e.message);
  }

  const hasilMigrasi = {};

  // 1. Migrasi Sheet Transaksi
  hasilMigrasi['Transaksi'] = migrasiSheet_({
    sourceSS: sourceSS,
    sourceSheetName: 'Transaksi',
    targetSheetName: CONFIG.SHEETS.transaksi,
    keyField: 'id_transaksi',
    updatableFields: ['nominal', 'keterangan', 'status', 'url_struk'],
    dryRun: dryRun
  });

  // 2. Migrasi Sheet Dompet
  hasilMigrasi['Dompet_Rekening'] = migrasiSheet_({
    sourceSS: sourceSS,
    sourceSheetName: 'Dompet_Rekening',
    targetSheetName: CONFIG.SHEETS.dompet,
    keyField: 'id_dompet',
    updatableFields: ['saldo_awal', 'status_aktif'],
    dryRun: dryRun
  });

  // 3. Migrasi Sheet Portofolio
  hasilMigrasi['Portofolio_Investasi'] = migrasiSheet_({
    sourceSS: sourceSS,
    sourceSheetName: 'Portofolio_Investasi',
    targetSheetName: CONFIG.SHEETS.portofolio,
    keyField: 'id_aset',
    updatableFields: ['total_unit', 'harga_rata_rata', 'total_modal', 'harga_pasar_terkini'],
    dryRun: dryRun
  });

  // 4. Migrasi Sheet Tagihan Rutin
  hasilMigrasi['Tagihan_Rutin'] = migrasiSheet_({
    sourceSS: sourceSS,
    sourceSheetName: 'Tagihan_Rutin',
    targetSheetName: CONFIG.SHEETS.tagihanRutin,
    keyField: 'id_tagihan',
    updatableFields: ['nominal_estimasi', 'tanggal_jatuh_tempo', 'status_aktif'],
    dryRun: dryRun
  });

  // 5. Migrasi Sheet Target Tabungan
  hasilMigrasi['Target_Tabungan'] = migrasiSheet_({
    sourceSS: sourceSS,
    sourceSheetName: 'Target_Tabungan',
    targetSheetName: CONFIG.SHEETS.targetTabungan,
    keyField: 'id_target',
    updatableFields: ['nominal_target', 'nominal_terkumpul', 'status'],
    dryRun: dryRun
  });

  Logger.log('📊 Rekap Hasil Migrasi: ' + JSON.stringify(hasilMigrasi, null, 2));
  bumpCache();
  return hasilMigrasi;
}

function migrasiSheet_(opt) {
  const shSource = opt.sourceSS.getSheetByName(opt.sourceSheetName);
  if (!shSource) return { status: 'LEWAT', alasan: 'Sheet sumber tidak ditemukan' };

  const shTarget = getSheet_(opt.targetSheetName);
  const targetDataRange = shTarget.getDataRange().getValues();
  const targetHeaders = targetDataRange[0].map(String);

  // Buat indeks key baris target
  const keyIdxTarget = targetHeaders.indexOf(opt.keyField);
  const targetIndex = {};
  for (let r = 1; r < targetDataRange.length; r++) {
    const k = String(targetDataRange[r][keyIdxTarget]);
    if (k) targetIndex[k] = r;
  }

  // Baca data sumber berbasis header
  const sourceDataRange = shSource.getDataRange().getValues();
  if (sourceDataRange.length <= 1) return { status: 'KOSONG', inserted: 0, updated: 0, skipped: 0 };
  const sourceHeaders = sourceDataRange[0].map(String);

  const res = { inserted: 0, updated: 0, skipped: 0 };
  const newRows = [];
  const seen = {};

  for (let r = 1; r < sourceDataRange.length; r++) {
    const srcRow = sourceDataRange[r];
    const srcObj = {};
    sourceHeaders.forEach((h, i) => { if (h) srcObj[h] = srcRow[i]; });

    const k = String(srcObj[opt.keyField] || '');
    if (!k || seen[k]) { res.skipped++; continue; }
    seen[k] = true;

    if (targetIndex[k] !== undefined) {
      // Baris sudah ada -> Cek apakah ada update
      const existingRow = targetDataRange[targetIndex[k]];
      let changed = false;
      opt.updatableFields.forEach(f => {
        const cIdx = targetHeaders.indexOf(f);
        if (cIdx > -1 && srcObj[f] !== undefined && String(existingRow[cIdx]) !== String(srcObj[f])) {
          existingRow[cIdx] = srcObj[f];
          changed = true;
        }
      });
      changed ? res.updated++ : res.skipped++;
    } else {
      // Baris baru -> Masukkan ke newRows
      const newRow = targetHeaders.map(h => srcObj[h] !== undefined ? srcObj[h] : '');
      newRows.push(newRow);
      res.inserted++;
    }
  }

  // Tulis batch jika bukan dry-run
  if (!opt.dryRun && (res.updated || newRows.length)) {
    const all = targetDataRange.concat(newRows);
    shTarget.getRange(1, 1, all.length, targetHeaders.length).setValues(all);
  }

  return res;
}
