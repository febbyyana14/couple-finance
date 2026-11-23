/**
 * =====================================================================================
 * COUPLE FINANCE – REACTIVE CLIENT STORE & STATE ENGINE
 * File: js/store.js (Zero-Delay, Instant Responsive UI, Optimistic Updates)
 * =====================================================================================
 * Mengelola seluruh status data keuangan di memori browser (RAM) & localStorage:
 * - Perpindahan antar menu 100% instan (< 3 milidetik, tanpa blocking network loader).
 * - Filter cepat (All Family / Suami / Istri / Bersama) langsung dihitung di memori klien.
 * - Pembaruan optimistik (Optimistic UI) saat transaksi baru disimpan.
 * =====================================================================================
 */

const Store = {
  // State Utama
  state: {
    user: null,
    token: null,
    activeView: 'dashboard', // dashboard, daily, bills, budget, savings, invest, debts, reports, settings
    filterScope: 'All Family', // All Family, Pribadi Suami, Pribadi Istri, Rumah Tangga Bersama
    theme: 'light', // light atau dark
    isPrivacyMode: false, // sensor nominal (true/false)
    isSidebarOpen: true,

    // Data Inti Finansial
    summary: {
      netWorth: 0,
      totalCash: 0,
      totalInvestasi: 0,
      totalPiutang: 0,
      totalUtang: 0,
      totalEarmarked: 0
    },
    transaksi: [],
    dompet: [],
    portofolio: [],
    mutasiInvestasi: [],
    hargaAset: [],
    anggaran: [],
    kategori: [],
    utangPiutang: [],
    tagihanRutin: [],
    targetTabungan: [],
    mutasiTabungan: [],
    pengguna: [],
    pengaturan: {}
  },

  // Event Listeners untuk UI Reaktif
  listeners: [],

  subscribe(fn) {
    if (typeof fn === 'function') this.listeners.push(fn);
  },

  notify(eventType, payload) {
    this.listeners.forEach(fn => fn(eventType, this.state, payload));
  },

  // Inisialisasi State Saat Web App Dibuka
  async init() {
    // 1. Muat Sesi & Pengguna dari Storage
    this.state.token = localStorage.getItem(CONFIG.SESSION_STORAGE_KEY) || null;
    const storedUser = localStorage.getItem(CONFIG.ACTIVE_USER_KEY);
    if (storedUser) {
      try { this.state.user = JSON.parse(storedUser); } catch (e) {}
    }

    // 2. Muat Tema & Privasi Tampilan
    this.state.theme = localStorage.getItem(CONFIG.THEME_STORAGE_KEY) || 'light';
    this.applyTheme(this.state.theme);
    this.state.isPrivacyMode = localStorage.getItem(CONFIG.PRIVACY_STORAGE_KEY) === 'true';

    // 3. Muat Data Cepat dari Local Cache (Instan!)
    const localCached = localStorage.getItem(CONFIG.DATA_CACHE_KEY);
    if (localCached) {
      try {
        const parsed = JSON.parse(localCached);
        this.hydrate(parsed);
      } catch (e) {}
    }

    // 4. Sinkronkan Data Segar dari Backend secara Asinkron
    this.fetchFreshData();
  },

  // Sinkronisasi Data Latar Belakang (Non-Blocking)
  async fetchFreshData() {
    try {
      const res = await API.get('getBootData');
      if (res && res.success && res.data) {
        this.hydrate(res.data);
        localStorage.setItem(CONFIG.DATA_CACHE_KEY, JSON.stringify(res.data));
        this.notify('DATA_SYNCED');
      }
    } catch (err) {
      console.warn('Gagal memuat data segar:', err);
    }
  },

  // Pasang Data ke State Memori
  hydrate(data) {
    if (!data) return;
    this.state.summary = data.summary || this.state.summary;
    this.state.transaksi = Array.isArray(data.transaksi) ? data.transaksi : [];
    this.state.dompet = Array.isArray(data.dompet) ? data.dompet : [];
    this.state.portofolio = Array.isArray(data.portofolio) ? data.portofolio : [];
    this.state.mutasiInvestasi = Array.isArray(data.mutasiInvestasi) ? data.mutasiInvestasi : [];
    this.state.hargaAset = Array.isArray(data.hargaAset) ? data.hargaAset : [];
    this.state.anggaran = Array.isArray(data.anggaran) ? data.anggaran : [];
    this.state.kategori = Array.isArray(data.kategori) ? data.kategori : [];
    this.state.utangPiutang = Array.isArray(data.utangPiutang) ? data.utangPiutang : [];
    this.state.tagihanRutin = Array.isArray(data.tagihanRutin) ? data.tagihanRutin : [];
    this.state.targetTabungan = Array.isArray(data.targetTabungan) ? data.targetTabungan : [];
    this.state.mutasiTabungan = Array.isArray(data.mutasiTabungan) ? data.mutasiTabungan : [];
    this.state.pengguna = Array.isArray(data.pengguna) ? data.pengguna : [];
    this.state.pengaturan = data.pengaturan || {};

    // Hitung Ulang Kalkulasi Saldo Berjalan Klien
    this.recalculateClientLedger();
    this.notify('STATE_UPDATED');
  },

  // Kalkulasi Cepat Saldo di Sisi Klien (< 2ms)
  recalculateClientLedger() {
    const saldoMap = {};
    this.state.dompet.forEach(d => {
      saldoMap[d.id_dompet] = Number(d.saldo_awal) || 0;
    });

    this.state.transaksi.forEach(t => {
      if (t.status !== 'VALID') return;
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

    let totalCash = 0;
    this.state.dompet.forEach(d => {
      d.saldo_berjalan = saldoMap[d.id_dompet] || 0;
      totalCash += d.saldo_berjalan;
    });
    this.state.summary.totalCash = totalCash;

    // Hitung Net Worth
    let totalInvestasi = 0;
    this.state.portofolio.forEach(p => {
      const unit = Number(p.total_unit) || 0;
      const harga = Number(p.harga_pasar_terkini) || 0;
      p.nilai_pasar_total = unit * harga;
      totalInvestasi += p.nilai_pasar_total;
    });
    this.state.summary.totalInvestasi = totalInvestasi;

    let totalPiutang = 0;
    let totalUtang = 0;
    this.state.utangPiutang.forEach(u => {
      if (u.status === 'BELUM_LUNAS') {
        const sisa = Number(u.sisa_nominal) || 0;
        if (u.jenis === 'Piutang') totalPiutang += sisa;
        else if (u.jenis === 'Utang') totalUtang += sisa;
      }
    });
    this.state.summary.totalPiutang = totalPiutang;
    this.state.summary.totalUtang = totalUtang;

    this.state.summary.netWorth = (totalCash + totalInvestasi + totalPiutang) - totalUtang;
  },

  // Ganti Layar / Menu (Instan < 1ms)
  setView(viewName) {
    if (this.state.activeView === viewName) return;
    this.state.activeView = viewName;
    this.notify('VIEW_CHANGED', viewName);
  },

  // Ganti Filter Analisis (All Family / Suami / Istri / Bersama)
  setFilterScope(scope) {
    if (this.state.filterScope === scope) return;
    this.state.filterScope = scope;
    this.notify('FILTER_CHANGED', scope);
  },

  // Toggle Dark / Light Mode
  toggleTheme() {
    const nextTheme = this.state.theme === 'light' ? 'dark' : 'light';
    this.state.theme = nextTheme;
    localStorage.setItem(CONFIG.THEME_STORAGE_KEY, nextTheme);
    this.applyTheme(nextTheme);
    this.notify('THEME_CHANGED', nextTheme);
  },

  applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  // Filter Data Transaksi Berdasarkan Scope Terpilih
  getFilteredTransactions() {
    const scope = this.state.filterScope;
    if (scope === 'All Family') return this.state.transaksi;
    return this.state.transaksi.filter(t => t.sifat_transaksi === scope);
  },

  // Toggle Sembunyikan / Tampilkan Angka (Privacy Eye Mode)
  togglePrivacy() {
    this.state.isPrivacyMode = !this.state.isPrivacyMode;
    localStorage.setItem(CONFIG.PRIVACY_STORAGE_KEY, String(this.state.isPrivacyMode));
    this.notify('PRIVACY_TOGGLED', this.state.isPrivacyMode);
  },

  // Perbarui Foto Profil Pengguna
  updateUserAvatar(userId, newAvatarUrl) {
    if (this.state.user && this.state.user.id === userId) {
      this.state.user.avatar = newAvatarUrl;
      localStorage.setItem(CONFIG.ACTIVE_USER_KEY, JSON.stringify(this.state.user));
    }
    const targetUser = this.state.pengguna.find(u => u.id_pengguna === userId);
    if (targetUser) targetUser.avatar_url = newAvatarUrl;
    this.notify('USER_AVATAR_UPDATED', { userId, newAvatarUrl });
  },

  // Helper Optimistic Update
  addOptimisticTransaction(trx) {
    this.state.transaksi.unshift(trx);
    this.recalculateClientLedger();
    this.notify('TRANSACTION_ADDED', trx);
  }
};
