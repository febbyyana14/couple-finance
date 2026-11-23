/**
 * =====================================================================================
 * COUPLE FINANCE – REST API CLIENT & NETWORK LAYER
 * File: js/api.js (Berdasarkan panduan gas-pro-api & gas-scale-turbo)
 * =====================================================================================
 * Fitur Utama:
 * 1. Anti-CORS POST: Selalu menggunakan Content-Type 'text/plain;charset=utf-8'
 * 2. In-Flight Request Deduplication: Menghindari pemanggilan ganda dalam waktu bersamaan
 * 3. Offline Demo Mode: Jika GAS_URL belum diatur, otomatis menyajikan data simulasi realistis
 * =====================================================================================
 */

const API = {
  _inflight: {},
  _writeEpoch: 0,

  // GET Request
  async get(action = 'getBootData') {
    const gasUrl = CONFIG.GAS_URL;
    if (!gasUrl) {
      console.warn('⚠️ GAS_URL belum disetel. Berjalan dalam Mode Demo Simulasi Lokal.');
      return this._mockGetBootData();
    }

    const cacheKey = `${this._writeEpoch}|GET|${action}`;
    if (this._inflight[cacheKey]) return this._inflight[cacheKey];

    const p = (async () => {
      try {
        const url = `${gasUrl}?action=${encodeURIComponent(action)}&t=${Date.now()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const json = await res.json();
        return json;
      } catch (err) {
        console.error('API GET Error:', err);
        return { success: false, message: err.message };
      } finally {
        delete this._inflight[cacheKey];
      }
    })();

    this._inflight[cacheKey] = p;
    return p;
  },

  // POST Request (CORS-Safe)
  async post(action, payload = {}) {
    const gasUrl = CONFIG.GAS_URL;
    if (!gasUrl) {
      console.warn('⚠️ GAS_URL belum disetel. Memproses aksi di Mode Demo Simulasi Lokal.');
      return this._mockPost(action, payload);
    }

    this._writeEpoch++; // Invalidate GET in-flight cache
    const token = localStorage.getItem(CONFIG.SESSION_STORAGE_KEY) || '';

    const bodyData = {
      action: action,
      data: payload,
      token: token,
      client_timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch(gasUrl, {
        method: 'POST',
        // WAJIB text/plain agar tidak memicu CORS preflight OPTIONS oleh browser
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(bodyData)
      });

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const json = await res.json();
      return json;
    } catch (err) {
      console.error('API POST Error:', err);
      return { success: false, message: 'Gagal terhubung ke backend: ' + err.message };
    }
  },

  // =====================================================================================
  // SIMULASI MOCK DATA (Untuk Demonstrasi Offline Cepat Sebelum GAS Dideploy)
  // =====================================================================================
  _mockGetBootData() {
    const cached = localStorage.getItem(CONFIG.DATA_CACHE_KEY);
    if (cached) {
      try {
        return { success: true, data: JSON.parse(cached), isMock: true };
      } catch (e) {}
    }

    const mockData = {
      summary: {
        netWorth: 450850000,
        totalCash: 68200000,
        totalInvestasi: 395150000,
        totalPiutang: 8000000,
        totalUtang: 15000000,
        totalEarmarked: 48500000,
        serverTime: new Date().toISOString()
      },
      pengguna: [
        { id_pengguna: 'USR-01', nama_panggilan: 'Suami', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suami' },
        { id_pengguna: 'USR-02', nama_panggilan: 'Istri', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Istri' }
      ],
      dompet: [
        { id_dompet: 'WLT-01', nama_dompet: 'BCA Payroll (Suami)', tipe_akun: 'Bank', kepemilikan: 'Pribadi Suami', saldo_awal: 25000000, saldo_berjalan: 28450000, status_aktif: 'TRUE' },
        { id_dompet: 'WLT-02', nama_dompet: 'Mandiri Operasional (Istri)', tipe_akun: 'Bank', kepemilikan: 'Pribadi Istri', saldo_awal: 18500000, saldo_berjalan: 19750000, status_aktif: 'TRUE' },
        { id_dompet: 'WLT-03', nama_dompet: 'Rekening Bersama Rumah Tangga', tipe_akun: 'Bank', kepemilikan: 'Bersama', saldo_awal: 15000000, saldo_berjalan: 17200000, status_aktif: 'TRUE' },
        { id_dompet: 'WLT-04', nama_dompet: 'GoPay & OVO Belanja', tipe_akun: 'E-Wallet', kepemilikan: 'Bersama', saldo_awal: 1200000, saldo_berjalan: 1300000, status_aktif: 'TRUE' },
        { id_dompet: 'WLT-05', nama_dompet: 'Kas Tunai Dompet', tipe_akun: 'Tunai', kepemilikan: 'Bersama', saldo_awal: 1500000, saldo_berjalan: 1500000, status_aktif: 'TRUE' }
      ],
      kategori: [
        { id_kategori: 'KAT-01', nama_kategori: 'Makanan & Minuman', tipe: 'Pengeluaran', ikon: 'utensils', warna_badge: '#EA580C' },
        { id_kategori: 'KAT-02', nama_kategori: 'Listrik & Utilitas', tipe: 'Pengeluaran', ikon: 'zap', warna_badge: '#D97706' },
        { id_kategori: 'KAT-03', nama_kategori: 'WiFi & Internet', tipe: 'Pengeluaran', ikon: 'wifi', warna_badge: '#0284C7' },
        { id_kategori: 'KAT-04', nama_kategori: 'Transport & Bensin', tipe: 'Pengeluaran', ikon: 'car', warna_badge: '#10B981' },
        { id_kategori: 'KAT-05', nama_kategori: 'Kebutuhan Dapur', tipe: 'Pengeluaran', ikon: 'shopping-cart', warna_badge: '#EA580C' },
        { id_kategori: 'KAT-06', nama_kategori: 'Pribadi Suami', tipe: 'Pengeluaran', ikon: 'smartphone', warna_badge: '#0E4D43' },
        { id_kategori: 'KAT-07', nama_kategori: 'Pribadi Istri', tipe: 'Pengeluaran', ikon: 'sparkles', warna_badge: '#F59E0B' },
        { id_kategori: 'KAT-08', nama_kategori: 'Gaji & Pendapatan', tipe: 'Pemasukan', ikon: 'briefcase', warna_badge: '#10B981' }
      ],
      transaksi: [
        { id_transaksi: 'TRX-SAMPLE-01', tanggal: '2026-11-23', waktu: '08:30', pencatat: 'Istri', sifat_transaksi: 'Rumah Tangga Bersama', jenis_transaksi: 'Pengeluaran', id_kategori: 'KAT-05', id_dompet_asal: 'WLT-03', nominal: 450000, keterangan: 'Belanja mingguan pasar & supermarket', status: 'VALID' },
        { id_transaksi: 'TRX-SAMPLE-02', tanggal: '2026-11-23', waktu: '12:15', pencatat: 'Suami', sifat_transaksi: 'Pribadi Suami', jenis_transaksi: 'Pengeluaran', id_kategori: 'KAT-04', id_dompet_asal: 'WLT-01', nominal: 150000, keterangan: 'Isi Pertamax mobil kantor', status: 'VALID' },
        { id_transaksi: 'TRX-SAMPLE-03', tanggal: '2026-11-22', waktu: '19:00', pencatat: 'Suami', sifat_transaksi: 'Rumah Tangga Bersama', jenis_transaksi: 'Transfer', id_kategori: '', id_dompet_asal: 'WLT-01', id_dompet_tujuan: 'WLT-04', nominal: 500000, keterangan: 'Top up GoPay bersama', status: 'VALID' },
        { id_transaksi: 'TRX-SAMPLE-04', tanggal: '2026-11-20', waktu: '09:00', pencatat: 'Suami', sifat_transaksi: 'Rumah Tangga Bersama', jenis_transaksi: 'Pemasukan', id_kategori: 'KAT-08', id_dompet_asal: 'WLT-01', nominal: 25000000, keterangan: 'Gaji Bulanan Suami', status: 'VALID' },
        { id_transaksi: 'TRX-SAMPLE-05', tanggal: '2026-11-20', waktu: '09:30', pencatat: 'Istri', sifat_transaksi: 'Rumah Tangga Bersama', jenis_transaksi: 'Pemasukan', id_kategori: 'KAT-08', id_dompet_asal: 'WLT-02', nominal: 12000000, keterangan: 'Gaji Bulanan Istri', status: 'VALID' }
      ],
      tagihanRutin: [
        { id_tagihan: 'BIL-01', nama_tagihan: 'IndiHome 100Mbps (WiFi)', id_kategori: 'KAT-03', sifat_tagihan: 'Rumah Tangga Bersama', tipe_nominal: 'TETAP', nominal_estimasi: 450000, tanggal_jatuh_tempo: 5, status_bulan_ini: 'Menunggu Pembayaran', status_aktif: 'TRUE' },
        { id_tagihan: 'BIL-02', nama_tagihan: 'Listrik PLN Pascabayar', id_kategori: 'KAT-02', sifat_tagihan: 'Rumah Tangga Bersama', tipe_nominal: 'VARIABEL', nominal_estimasi: 850000, tanggal_jatuh_tempo: 20, status_bulan_ini: 'Menunggu Pembayaran', status_aktif: 'TRUE' },
        { id_tagihan: 'BIL-03', nama_tagihan: 'Netflix 4K Premium', id_kategori: 'KAT-09', sifat_tagihan: 'Rumah Tangga Bersama', tipe_nominal: 'TETAP', nominal_estimasi: 186000, tanggal_jatuh_tempo: 15, status_bulan_ini: 'Sudah Dibayar', status_aktif: 'TRUE' }
      ],
      targetTabungan: [
        { id_target: 'GOL-01', nama_target: 'Dana Darurat 6 Bulan', kategori_target: 'Darurat', sifat_target: 'Tabungan Bersama', nominal_target: 60000000, nominal_terkumpul: 35000000, sisa_kebutuhan: 25000000, persentase_progress: 58.3, status: 'AKTIF' },
        { id_target: 'GOL-02', nama_target: 'Liburan Musim Dingin Jepang', kategori_target: 'Liburan', sifat_target: 'Tabungan Bersama', nominal_target: 30000000, nominal_terkumpul: 13500000, sisa_kebutuhan: 16500000, persentase_progress: 45.0, status: 'AKTIF' },
        { id_target: 'GOL-03', nama_target: 'Laptop Kerja Baru Suami', kategori_target: 'Gadget', sifat_target: 'Tabungan Pribadi Suami', nominal_target: 20000000, nominal_terkumpul: 17000000, sisa_kebutuhan: 3000000, persentase_progress: 85.0, status: 'AKTIF' }
      ],
      portofolio: [
        { id_aset: 'AST-BTC', jenis_aset: 'Bitcoin (BTC)', nama_aset: 'Bitcoin', kepemilikan: 'Bersama', total_unit: 0.25, harga_rata_rata: 950000000, total_modal: 237500000, harga_pasar_terkini: 1450000000, nilai_pasar_total: 362500000, unrealized_pnl: 125000000, unrealized_pnl_persen: 52.6 },
        { id_aset: 'AST-BBCA', jenis_aset: 'Saham', nama_aset: 'Bank Central Asia (BBCA)', kepemilikan: 'Pribadi Suami', total_unit: 25, harga_rata_rata: 9200, total_modal: 23000000, harga_pasar_terkini: 10150, nilai_pasar_total: 25375000, unrealized_pnl: 2375000, unrealized_pnl_persen: 10.3 },
        { id_aset: 'AST-GOLD', jenis_aset: 'Emas (Gold)', nama_aset: 'Logam Mulia Antam 25g', kepemilikan: 'Pribadi Istri', total_unit: 25, harga_rata_rata: 1250000, total_modal: 31250000, harga_pasar_terkini: 1420000, nilai_pasar_total: 35500000, unrealized_pnl: 4250000, unrealized_pnl_persen: 13.6 }
      ],
      anggaran: [
        { id_anggaran: 'BDG-01', periode_bulan: '2026-11', id_kategori: 'KAT-01', nominal_anggaran: 5000000, realisasi: 3200000, persentase: 64, status_warning: 'AMAN' },
        { id_anggaran: 'BDG-02', periode_bulan: '2026-11', id_kategori: 'KAT-02', nominal_anggaran: 1500000, realisasi: 1350000, persentase: 90, status_warning: 'WASPADA' },
        { id_anggaran: 'BDG-03', periode_bulan: '2026-11', id_kategori: 'KAT-04', nominal_anggaran: 2000000, realisasi: 1250000, persentase: 62.5, status_warning: 'AMAN' }
      ],
      utangPiutang: [
        { id_utang_piutang: 'DEB-01', jenis: 'Utang', pihak_kedua: 'Cicilan Kendaraan', nominal_awal: 60000000, total_terbayar: 45000000, sisa_nominal: 15000000, status: 'BELUM_LUNAS', jatuh_tempo: '2027-04-20' },
        { id_utang_piutang: 'DEB-02', jenis: 'Piutang', pihak_kedua: 'Pinjaman Kerabat', nominal_awal: 8000000, total_terbayar: 0, sisa_nominal: 8000000, status: 'BELUM_LUNAS', jatuh_tempo: '2026-12-31' }
      ],
      pengaturan: {
        app_name: 'Couple Finance – Family Financial Management',
        theme_default: 'light',
        color_sidebar: '#0E4D43',
        color_background: '#FAF7F2'
      }
    };

    localStorage.setItem(CONFIG.DATA_CACHE_KEY, JSON.stringify(mockData));
    return { success: true, data: mockData, isMock: true };
  },

  _mockPost(action, payload) {
    if (action === 'loginPIN') {
      const pin = payload.pin;
      if (pin === '123456') {
        const user = payload.user_id === 'USR-02' 
          ? { id: 'USR-02', name: 'Istri', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Istri' }
          : { id: 'USR-01', name: 'Suami', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suami' };
        
        localStorage.setItem(CONFIG.SESSION_STORAGE_KEY, 'DEMO_MOCK_TOKEN_' + Date.now());
        localStorage.setItem(CONFIG.ACTIVE_USER_KEY, JSON.stringify(user));
        return { success: true, message: 'Login Demo Berhasil! (PIN: 123456)', token: 'DEMO_TOKEN', user };
      } else {
        return { success: false, message: 'PIN salah! (Gunakan default: 123456)' };
      }
    }

    // Simulasi penyimpanan lokal
    return { success: true, message: 'Aksi berhasil diproses (Mode Demo Simulasi)', data: payload };
  }
};
