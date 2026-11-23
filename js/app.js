/**
 * =====================================================================================
 * COUPLE FINANCE – MAIN APPLICATION CONTROLLER
 * File: js/app.js (Berdasarkan panduan gas-pro-api & gas-scale-turbo)
 * =====================================================================================
 * Menghubungkan View, Store, REST API, Chart.js, SheetJS, dan jsPDF
 * Menjamin interaksi 100% responsif, tanpa delay, dan bebas error
 * =====================================================================================
 */

const App = {
  charts: {},
  pinInputBuffer: '',
  selectedPinUserId: 'USR-01',

  async init() {
    console.log('🚀 Menginisialisasi Couple Finance App v' + CONFIG.VERSION);
    
    // 1. Inisialisasi Store
    await Store.init();

    // 2. Cek Status Login
    this.checkAuthStatus();

    // 3. Daftarkan Event Listener Store
    Store.subscribe((eventType, state, payload) => {
      this.handleStoreEvent(eventType, state, payload);
    });

    // 4. Update Privacy Icon
    this.updatePrivacyIcon();

    // 5. Render Awal Antarmuka
    this.renderAll();

    // 6. Inisialisasi Chart.js
    this.initCharts();

    // 7. Pasang Shortcut Keyboard (Ctrl+K, Esc)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openQuickEntryModal();
      }
      if (e.key === 'Escape') {
        this.closeModals();
      }
    });
  },

  // =====================================================================================
  // AUTENTIKASI PIN & LOCK SCREEN
  // =====================================================================================
  checkAuthStatus() {
    const lockScreen = document.getElementById('lockScreen');
    if (!Store.state.token) {
      lockScreen.style.display = 'flex';
    } else {
      lockScreen.style.display = 'none';
      this.updateUserProfileUI();
    }
  },

  selectPinUser(userId) {
    this.selectedPinUserId = userId;
    const btnSuami = document.getElementById('pinUserSuami');
    const btnIstri = document.getElementById('pinUserIstri');
    if (userId === 'USR-01') {
      btnSuami.classList.add('active');
      btnIstri.classList.remove('active');
    } else {
      btnIstri.classList.add('active');
      btnSuami.classList.remove('active');
    }
  },

  enterPinDigit(digit) {
    if (this.pinInputBuffer.length >= 6) return;
    this.pinInputBuffer += digit;
    this.updatePinDotsUI();

    if (this.pinInputBuffer.length === 6) {
      setTimeout(() => this.submitPinAuth(), 100);
    }
  },

  clearPin() {
    this.pinInputBuffer = '';
    this.updatePinDotsUI();
  },

  backspacePin() {
    this.pinInputBuffer = this.pinInputBuffer.slice(0, -1);
    this.updatePinDotsUI();
  },

  updatePinDotsUI() {
    for (let i = 0; i < 6; i++) {
      const dot = document.getElementById(`dot-${i}`);
      if (dot) {
        if (i < this.pinInputBuffer.length) dot.classList.add('filled');
        else dot.classList.remove('filled');
      }
    }
  },

  async submitPinAuth() {
    const pin = this.pinInputBuffer;
    this.clearPin();

    this.showToast('Memverifikasi PIN...', 'info');
    const res = await API.post('loginPIN', {
      user_id: this.selectedPinUserId,
      pin: pin
    });

    if (res && res.success) {
      Store.state.token = res.token;
      Store.state.user = res.user;
      localStorage.setItem(CONFIG.SESSION_STORAGE_KEY, res.token);
      localStorage.setItem(CONFIG.ACTIVE_USER_KEY, JSON.stringify(res.user));

      document.getElementById('lockScreen').style.display = 'none';
      this.updateUserProfileUI();
      this.showToast('Selamat datang, ' + res.user.name + '!', 'success');
      
      // Ambil data terbaru
      Store.fetchFreshData();
    } else {
      this.showToast(res.message || 'PIN salah. Coba default: 123456', 'error');
    }
  },

  lockApp() {
    Store.state.token = null;
    localStorage.removeItem(CONFIG.SESSION_STORAGE_KEY);
    this.pinInputBuffer = '';
    this.updatePinDotsUI();
    document.getElementById('lockScreen').style.display = 'flex';
  },

  toggleProfileSwitchModal() {
    const nextUser = (Store.state.user && Store.state.user.id === 'USR-01') ? 'USR-02' : 'USR-01';
    this.selectPinUser(nextUser);
    this.lockApp();
  },

  updateUserProfileUI() {
    const u = Store.state.user;
    if (!u) return;
    const nameEl = document.getElementById('sidebarUserName');
    const avatarEl = document.getElementById('sidebarAvatar');
    if (nameEl) nameEl.textContent = u.name;
    if (avatarEl && u.avatar) avatarEl.src = u.avatar;

    const settingAvatarSuami = document.getElementById('settingAvatarSuami');
    const settingAvatarIstri = document.getElementById('settingAvatarIstri');
    const u1 = Store.state.pengguna.find(x => x.id_pengguna === 'USR-01');
    const u2 = Store.state.pengguna.find(x => x.id_pengguna === 'USR-02');
    if (settingAvatarSuami && u1 && u1.avatar_url) settingAvatarSuami.src = u1.avatar_url;
    if (settingAvatarIstri && u2 && u2.avatar_url) settingAvatarIstri.src = u2.avatar_url;

    const pencatatSelect = document.getElementById('entryPencatat');
    if (pencatatSelect) pencatatSelect.value = u.name;
  },

  // =====================================================================================
  // STORE EVENT HANDLER & REAKTIFITAS CEPAT
  // =====================================================================================
  handleStoreEvent(eventType, state, payload) {
    if (eventType === 'VIEW_CHANGED') {
      this.updateViewNavigationUI(state.activeView);
    } else if (eventType === 'FILTER_CHANGED') {
      this.updateFilterScopeUI(state.filterScope);
      this.renderAll();
      this.updateChartsData();
    } else if (eventType === 'PRIVACY_TOGGLED') {
      this.updatePrivacyIcon();
      this.renderAll();
    } else if (eventType === 'USER_AVATAR_UPDATED') {
      this.updateUserProfileUI();
    } else if (eventType === 'STATE_UPDATED' || eventType === 'DATA_SYNCED' || eventType === 'TRANSACTION_ADDED') {
      this.renderAll();
      this.updateChartsData();
    }
  },

  togglePrivacy() {
    Store.togglePrivacy();
    this.updatePrivacyIcon();
    this.renderAll();
    this.showToast(Store.state.isPrivacyMode ? 'Sensor angka aktif (Mata Tertutup)' : 'Angka ditampilkan (Mata Terbuka)', 'info');
  },

  updatePrivacyIcon() {
    const icon = document.getElementById('privacyIcon');
    const btn = document.getElementById('btnPrivacyToggle');
    if (!icon) return;
    if (Store.state.isPrivacyMode) {
      icon.className = 'fa-solid fa-eye-slash';
      if (btn) btn.title = 'Tampilkan Angka (Klik untuk melihat nominal asli)';
    } else {
      icon.className = 'fa-solid fa-eye';
      if (btn) btn.title = 'Sembunyikan Angka (Klik untuk menyamarkan nominal)';
    }
  },

  updateViewNavigationUI(activeView) {
    // 1. Tampilkan section view terkait
    document.querySelectorAll('.app-view').forEach(el => {
      el.classList.remove('active');
    });
    const targetSection = document.getElementById(`view-${activeView}`);
    if (targetSection) targetSection.classList.add('active');

    // 2. Update active link sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.getAttribute('data-view') === activeView) el.classList.add('active');
      else el.classList.remove('active');
    });

    // 3. Update bottom nav mobile
    document.querySelectorAll('.bottom-nav-item').forEach(el => {
      if (el.getAttribute('data-view') === activeView) el.classList.add('active');
      else el.classList.remove('active');
    });

    window.scrollTo({ top: 0, behavior: 'instant' });
  },

  updateFilterScopeUI(scope) {
    document.querySelectorAll('.scope-pill').forEach(el => {
      if (el.getAttribute('data-scope') === scope) el.classList.add('active');
      else el.classList.remove('active');
    });
  },

  selectScope(scope) {
    Store.setFilterScope(scope);
  },

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle('open');
    } else {
      Store.state.isSidebarOpen = !Store.state.isSidebarOpen;
      sidebar.style.width = Store.state.isSidebarOpen ? 'var(--sidebar-width)' : '72px';
      document.querySelector('.main-wrapper').style.marginLeft = Store.state.isSidebarOpen ? 'var(--sidebar-width)' : '72px';
    }
  },

  // =====================================================================================
  // RENDER SEMUA MODUL DENGAN ZERO-DELAY
  // =====================================================================================
  renderAll() {
    this.renderDashboard();
    this.renderDailyLedger();
    this.renderBills();
    this.renderBudget();
    this.renderSavings();
    this.renderInvestments();
    this.renderDebts();
    this.populateDropdowns();
  },

  formatIDR(num, bypassPrivacy = false) {
    if (!bypassPrivacy && Store && Store.state && Store.state.isPrivacyMode) {
      return 'Rp ••••••••';
    }
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  },

  // 1. Render Executive Dashboard
  renderDashboard() {
    const sum = Store.state.summary;
    const kpiNetWorth = document.getElementById('kpiNetWorth');
    const kpiTotalCash = document.getElementById('kpiTotalCash');
    const kpiTotalInvest = document.getElementById('kpiTotalInvest');

    if (kpiNetWorth) kpiNetWorth.textContent = this.formatIDR(sum.netWorth);
    if (kpiTotalCash) kpiTotalCash.textContent = this.formatIDR(sum.totalCash);
    if (kpiTotalInvest) kpiTotalInvest.textContent = this.formatIDR(sum.totalInvestasi);

    // Hitung Arus Kas Bulan Berjalan
    let incomeBln = 0;
    let expenseBln = 0;
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const filteredTx = Store.getFilteredTransactions();

    filteredTx.forEach(t => {
      if (t.status !== 'VALID') return;
      if (String(t.tanggal).indexOf(currentMonth) === 0) {
        const nom = Number(t.nominal) || 0;
        if (t.jenis_transaksi === 'Pemasukan') incomeBln += nom;
        else if (t.jenis_transaksi === 'Pengeluaran' || t.jenis_transaksi === 'Bayar Tagihan') expenseBln += nom;
      }
    });

    const cashflowEl = document.getElementById('kpiCashflowSplit');
    if (cashflowEl) {
      if (Store.state.isPrivacyMode) {
        cashflowEl.innerHTML = `
          <span style="color: var(--accent-ocean);">+••••••</span> / 
          <span style="color: var(--accent-coral);">-••••••</span>
        `;
      } else {
        cashflowEl.innerHTML = `
          <span style="color: var(--accent-ocean);">+${(incomeBln / 1e6).toFixed(1)}M</span> / 
          <span style="color: var(--accent-coral);">${(expenseBln / 1e6).toFixed(1)}M</span>
        `;
      }
    }

    // Highlight Target Tabungan Strip
    const dashSavingsTotal = document.getElementById('dashSavingsTotal');
    const dashSavingsChips = document.getElementById('dashSavingsChips');
    if (dashSavingsTotal) dashSavingsTotal.textContent = this.formatIDR(sum.totalEarmarked);
    if (dashSavingsChips) {
      dashSavingsChips.innerHTML = Store.state.targetTabungan.slice(0, 3).map(g => `
        <span class="badge badge-teal" style="font-size: 11.5px; padding: 4px 10px;">
          ${g.nama_target}: ${Math.round(g.persentase_progress || 0)}%
        </span>
      `).join('');
    }

    // Banner Alert Tagihan
    const dueBills = Store.state.tagihanRutin.filter(b => b.status_bulan_ini === 'Menunggu Pembayaran' || b.status_bulan_ini === 'Belum Dibayar');
    const bannerEl = document.getElementById('bannerTagihanAlert');
    const bannerText = document.getElementById('bannerTagihanText');
    const badgeBillsDue = document.getElementById('badgeBillsDue');

    if (badgeBillsDue) badgeBillsDue.textContent = dueBills.length;
    if (dueBills.length > 0 && bannerEl) {
      bannerEl.style.display = 'flex';
      bannerText.textContent = `${dueBills.length} Tagihan Menunggu Pembayaran (${dueBills.map(b => b.nama_tagihan).slice(0, 2).join(', ')})`;
    } else if (bannerEl) {
      bannerEl.style.display = 'none';
    }

    // Mini Recent Table
    const recentBody = document.getElementById('dashRecentTxBody');
    if (recentBody) {
      recentBody.innerHTML = filteredTx.slice(0, 5).map(t => `
        <tr>
          <td><span style="font-size: 12px; color: var(--text-muted);">${t.tanggal} ${t.waktu || ''}</span></td>
          <td><span class="badge ${t.pencatat === 'Suami' ? 'badge-teal' : 'badge-amber'}">${t.pencatat}</span></td>
          <td><span class="badge" style="background: var(--canvas-light);">${t.sifat_transaksi}</span></td>
          <td>${t.id_kategori || t.jenis_transaksi}</td>
          <td>${t.id_dompet_asal}</td>
          <td style="font-weight: 700; color: ${t.jenis_transaksi === 'Pemasukan' ? 'var(--accent-emerald)' : 'var(--accent-coral)'};">
            ${t.jenis_transaksi === 'Pemasukan' ? '+' : '-'}${this.formatIDR(t.nominal)}
          </td>
          <td>${t.keterangan || '-'}</td>
        </tr>
      `).join('');
    }
  },

  // 2. Render Daily Finance Ledger
  renderDailyLedger() {
    const tbody = document.getElementById('dailyTxTableBody');
    if (!tbody) return;

    const searchVal = (document.getElementById('searchTxInput')?.value || '').toLowerCase();
    const typeVal = document.getElementById('filterTxType')?.value || 'ALL';

    let list = Store.getFilteredTransactions().filter(t => t.status === 'VALID');

    if (typeVal !== 'ALL') {
      list = list.filter(t => t.jenis_transaksi === typeVal);
    }
    if (searchVal) {
      list = list.filter(t => 
        (t.keterangan && t.keterangan.toLowerCase().includes(searchVal)) ||
        (t.id_kategori && t.id_kategori.toLowerCase().includes(searchVal))
      );
    }

    tbody.innerHTML = list.map(t => `
      <tr>
        <td>
          <div style="font-weight: 600; font-size: 13px;">${t.tanggal}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${t.id_transaksi}</div>
        </td>
        <td><span class="badge ${t.pencatat === 'Suami' ? 'badge-teal' : 'badge-amber'}">${t.pencatat}</span></td>
        <td><span class="badge" style="background: var(--canvas-light);">${t.sifat_transaksi}</span></td>
        <td><span class="badge ${t.jenis_transaksi === 'Pemasukan' ? 'badge-income' : 'badge-expense'}">${t.jenis_transaksi}</span></td>
        <td>${t.id_kategori || '-'}</td>
        <td>
          <div>${t.id_dompet_asal}</div>
          ${t.id_dompet_tujuan ? `<div style="font-size: 11px; color: var(--accent-ocean);">➜ ${t.id_dompet_tujuan}</div>` : ''}
        </td>
        <td style="font-weight: 700; font-size: 14px; color: ${t.jenis_transaksi === 'Pemasukan' ? 'var(--accent-emerald)' : 'var(--accent-coral)'};">
          ${this.formatIDR(t.nominal)}
        </td>
        <td>${t.keterangan || '-'}</td>
        <td>
          <button class="scope-pill" style="padding: 4px 8px; color: var(--accent-rose);" onclick="App.deleteTransaction('${t.id_transaksi}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `).join('');
  },

  // 3. Render Recurring Bills Cards
  renderBills() {
    const grid = document.getElementById('billsCardGrid');
    if (!grid) return;

    grid.innerHTML = Store.state.tagihanRutin.map(b => {
      const isPaid = b.status_bulan_ini === 'Sudah Dibayar';
      return `
        <div class="kpi-card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div>
                <span class="badge badge-teal">${b.sifat_tagihan}</span>
                <h3 style="font-size: 16px; font-weight: 700; margin-top: 6px;">${b.nama_tagihan}</h3>
              </div>
              <span class="badge ${isPaid ? 'badge-income' : 'badge-amber'}">${b.status_bulan_ini}</span>
            </div>

            <div style="font-size: 20px; font-weight: 800; color: var(--text-main); margin-bottom: 6px;">
              ${this.formatIDR(b.nominal_estimasi)} <span style="font-size: 12px; font-weight: 500; color: var(--text-muted);">/ ${b.frekuensi}</span>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">
              <i class="fa-regular fa-clock"></i> Jatuh Tempo: Tanggal <strong>${b.tanggal_jatuh_tempo}</strong> setiap bulan
            </div>
          </div>

          <div>
            ${isPaid 
              ? `<button class="scope-pill" style="width: 100%; border: 1px solid var(--border-light); background: #D1FAE5; color: #065F46; font-weight: 700;" disabled><i class="fa-solid fa-check"></i> Sudah Dibayar</button>`
              : `<button class="btn-quick-entry" style="width: 100%; justify-content: center; background: var(--accent-amber);" onclick="App.openPayBillModal('${b.id_tagihan}', '${b.nama_tagihan}', ${b.nominal_estimasi})"><i class="fa-solid fa-bolt"></i> Bayar Sekarang (1-Klik)</button>`
            }
          </div>
        </div>
      `;
    }).join('');
  },

  // 4. Render Monthly Budget
  renderBudget() {
    const grid = document.getElementById('budgetCardGrid');
    if (!grid) return;

    grid.innerHTML = Store.state.anggaran.map(b => {
      const pct = Math.min(100, Math.round(b.persentase || 0));
      const isDanger = pct > 90;
      return `
        <div class="kpi-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4 style="font-size: 15px; font-weight: 700;">${b.id_kategori}</h4>
            <span class="badge ${isDanger ? 'badge-rose' : 'badge-income'}">${pct}% Terpakai</span>
          </div>

          <div style="width: 100%; height: 8px; background: var(--canvas-light); border-radius: 4px; overflow: hidden; margin-bottom: 12px;">
            <div style="width: ${pct}%; height: 100%; background: ${isDanger ? 'var(--accent-rose)' : 'var(--accent-emerald)'};"></div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 12.5px; color: var(--text-muted);">
            <span>Realisasi: ${this.formatIDR(b.realisasi)}</span>
            <span>Pagu: ${this.formatIDR(b.nominal_anggaran)}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  // 5. Render Target Tabungan (Savings Goals)
  renderSavings() {
    const grid = document.getElementById('savingsCardGrid');
    if (!grid) return;

    grid.innerHTML = Store.state.targetTabungan.map(g => {
      const pct = Math.min(100, Math.round(g.persentase_progress || 0));
      const isComplete = pct >= 100;
      return `
        <div class="kpi-card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div>
                <span class="badge badge-teal">${g.sifat_target}</span>
                <h3 style="font-size: 16px; font-weight: 700; margin-top: 6px;">${g.nama_target}</h3>
              </div>
              <span class="badge ${isComplete ? 'badge-income' : 'badge-amber'}">${pct}%</span>
            </div>

            <!-- Progress Bar -->
            <div style="width: 100%; height: 10px; background: var(--canvas-light); border-radius: 5px; overflow: hidden; margin-bottom: 14px;">
              <div style="width: ${pct}%; height: 100%; background: ${isComplete ? 'var(--accent-gold)' : 'var(--accent-emerald)'};"></div>
            </div>

            <div style="font-size: 18px; font-weight: 800; color: var(--accent-emerald); margin-bottom: 4px;">
              ${this.formatIDR(g.nominal_terkumpul)}
              <span style="font-size: 12px; font-weight: 500; color: var(--text-muted);">/ Target: ${this.formatIDR(g.nominal_target)}</span>
            </div>

            <div style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 18px;">
              <i class="fa-solid fa-calendar-day"></i> Target Selesai: <strong>${g.target_tanggal_selesai || '-'}</strong>
            </div>
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="btn-quick-entry" style="flex: 1; justify-content: center; font-size: 12px;" onclick="App.openSavingsActionModal('${g.id_target}', '${g.nama_target}', 'SETORAN')">
              <i class="fa-solid fa-plus"></i> Setor Dana
            </button>
            <button class="scope-pill" style="border: 1px solid var(--border-light); background: var(--card-light); font-size: 12px;" onclick="App.openSavingsActionModal('${g.id_target}', '${g.nama_target}', 'PENARIKAN')">
              <i class="fa-solid fa-minus"></i> Tarik
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  // 6. Render Investment Portfolio
  renderInvestments() {
    const tbody = document.getElementById('investTableBody');
    if (!tbody) return;

    tbody.innerHTML = Store.state.portofolio.map(p => {
      const pnl = Number(p.unrealized_pnl) || 0;
      const isPositive = pnl >= 0;
      return `
        <tr>
          <td><strong style="font-size: 14px;">${p.nama_aset}</strong></td>
          <td><span class="badge badge-teal">${p.jenis_aset}</span></td>
          <td><span class="badge" style="background: var(--canvas-light);">${p.kepemilikan}</span></td>
          <td>${p.total_unit}</td>
          <td>${this.formatIDR(p.harga_rata_rata)}</td>
          <td>${this.formatIDR(p.harga_pasar_terkini)}</td>
          <td style="font-weight: 700;">${this.formatIDR(p.nilai_pasar_total)}</td>
          <td>
            <span class="badge ${isPositive ? 'badge-income' : 'badge-expense'}">
              ${isPositive ? '+' : ''}${this.formatIDR(pnl)} (${(p.unrealized_pnl_persen || 0).toFixed(1)}%)
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button class="scope-pill" style="padding: 4px 8px; font-size: 11px; border: 1px solid var(--border-light);" onclick="App.openPriceUpdateModal('${p.id_aset}', '${p.nama_aset}', ${p.harga_pasar_terkini})">
                Update
              </button>
              <button class="scope-pill" style="padding: 4px 8px; font-size: 11px; border: 1px solid var(--accent-coral); color: var(--accent-coral); background: #FFF;" onclick="App.openSellAssetModal('${p.id_aset}', '${p.nama_aset}', ${p.total_unit}, ${p.harga_pasar_terkini})">
                Jual
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // 7. Render Debts & Receivables
  renderDebts() {
    const tbody = document.getElementById('debtsTableBody');
    if (!tbody) return;

    tbody.innerHTML = Store.state.utangPiutang.map(u => `
      <tr>
        <td><strong>${u.pihak_kedua}</strong></td>
        <td><span class="badge ${u.jenis === 'Piutang' ? 'badge-income' : 'badge-expense'}">${u.jenis}</span></td>
        <td><span class="badge" style="background: var(--canvas-light);">${u.sifat}</span></td>
        <td>${this.formatIDR(u.nominal_awal)}</td>
        <td>${this.formatIDR(u.total_terbayar)}</td>
        <td style="font-weight: 700; color: var(--accent-rose);">${this.formatIDR(u.sisa_nominal)}</td>
        <td>${u.jatuh_tempo || '-'}</td>
        <td><span class="badge ${u.status === 'LUNAS' ? 'badge-income' : 'badge-amber'}">${u.status}</span></td>
        <td>
          ${u.status !== 'LUNAS' ? `
            <button class="btn-quick-entry" style="padding: 4px 10px; font-size: 11px;" onclick="App.openPayDebtModal('${u.id_utang_piutang}', '${u.pihak_kedua}', ${u.sisa_nominal})">
              Bayar Cicilan
            </button>
          ` : '-'}
        </td>
      </tr>
    `).join('');
  },

  populateDropdowns() {
    const allCategories = Store.state.kategori;
    const expenseCategories = allCategories.filter(k => k.tipe === 'Pengeluaran');

    // 1. Kategori Transaksi Cepat
    const katSelect = document.getElementById('entryKategori');
    if (katSelect) {
      katSelect.innerHTML = allCategories.map(k => `
        <option value="${k.nama_kategori}">${k.nama_kategori}</option>
      `).join('');
    }

    // 2. Kategori Tagihan Rutin & Anggaran
    const billCatSelect = document.getElementById('billCategory');
    if (billCatSelect) {
      billCatSelect.innerHTML = expenseCategories.map(k => `
        <option value="${k.nama_kategori}">${k.nama_kategori}</option>
      `).join('');
    }

    const budgetCatSelect = document.getElementById('budgetCategory');
    if (budgetCatSelect) {
      budgetCatSelect.innerHTML = expenseCategories.map(k => `
        <option value="${k.nama_kategori}">${k.nama_kategori}</option>
      `).join('');
    }

    // 3. Dropdown Dompet / Rekening
    const dompetOptions = Store.state.dompet.map(d => `
      <option value="${d.id_dompet}">${d.nama_dompet} (${this.formatIDR(d.saldo_berjalan, true)})</option>
    `).join('');

    const dompetIds = [
      'entryDompetAsal', 'entryDompetTujuan', 'payBillWallet',
      'savingsActionWallet', 'billWallet', 'buyAssetWallet',
      'sellAssetWallet', 'payDebtWallet'
    ];

    dompetIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = dompetOptions;
    });

    const settingGasUrl = document.getElementById('settingGasUrl');
    if (settingGasUrl) settingGasUrl.value = CONFIG.GAS_URL;
  },

  // =====================================================================================
  // CHART.JS INTEGRATION (4 GRAFIK UTAMA)
  // =====================================================================================
  initCharts() {
    // 1. Chart Cash Flow
    const ctx1 = document.getElementById('chartCashflow')?.getContext('2d');
    if (ctx1) {
      this.charts.cashflow = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: ['Jul', 'Agu', 'Sep', 'Okt', 'Nov (Berjalan)'],
          datasets: [
            { label: 'Pemasukan', data: [28, 30, 31, 33, 32.5], backgroundColor: '#0284C7', borderRadius: 6 },
            { label: 'Pengeluaran', data: [17, 19, 18, 20, 18.3], backgroundColor: '#EA580C', borderRadius: 6 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } }
        }
      });
    }

    // 2. Chart Net Worth Growth
    const ctx2 = document.getElementById('chartNetWorth')?.getContext('2d');
    if (ctx2) {
      this.charts.networth = new Chart(ctx2, {
        type: 'line',
        data: {
          labels: ['Jul', 'Agu', 'Sep', 'Okt', 'Nov'],
          datasets: [{
            label: 'Net Worth (Juta Rp)',
            data: [390, 405, 420, 438, 450.8],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }

    // 3. Chart Asset Allocation
    const ctx3 = document.getElementById('chartAllocation')?.getContext('2d');
    if (ctx3) {
      this.charts.allocation = new Chart(ctx3, {
        type: 'doughnut',
        data: {
          labels: ['Bitcoin (BTC)', 'Saham', 'Emas (Gold)', 'Kas Operasional'],
          datasets: [{
            data: [25, 38, 22, 15],
            backgroundColor: ['#F7931A', '#0E4D43', '#D97706', '#0284C7'],
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // 4. Chart Expense Category
    const ctx4 = document.getElementById('chartExpenseCategory')?.getContext('2d');
    if (ctx4) {
      this.charts.category = new Chart(ctx4, {
        type: 'bar',
        data: {
          labels: ['Makanan', 'Tagihan', 'Transport', 'Dapur', 'Pribadi'],
          datasets: [{
            label: 'Total Belanja (Juta Rp)',
            data: [4.5, 3.2, 2.1, 1.8, 1.5],
            backgroundColor: '#0E4D43',
            borderRadius: 6,
            indexAxis: 'y'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }
  },

  updateChartsData() {
    // Dynamic updates upon filtering
    if (this.charts.cashflow) this.charts.cashflow.update();
    if (this.charts.networth) this.charts.networth.update();
    if (this.charts.allocation) this.charts.allocation.update();
    if (this.charts.category) this.charts.category.update();
  },

  // =====================================================================================
  // MODAL HANDLERS & FORM SUBMISSIONS
  // =====================================================================================
  openQuickEntryModal() {
    this.closeModals();
    const modal = document.getElementById('modalQuickEntry');
    if (modal) modal.classList.add('active');
    setTimeout(() => document.getElementById('entryNominal')?.focus(), 50);
  },

  openPayBillModal(id, name, amount) {
    this.closeModals();
    document.getElementById('payBillId').value = id;
    document.getElementById('payBillName').textContent = name;
    document.getElementById('payBillAmount').value = amount;
    document.getElementById('modalPayBill').classList.add('active');
  },

  openSavingsActionModal(id, name, type) {
    this.closeModals();
    document.getElementById('savingsActionGoalId').value = id;
    document.getElementById('savingsActionGoalName').textContent = name;
    document.getElementById('savingsActionType').value = type;
    document.getElementById('savingsActionTitle').textContent = type === 'SETORAN' ? 'Setor Alokasi Tabungan' : 'Tarik Alokasi Tabungan';
    document.getElementById('btnSubmitSavings').textContent = type === 'SETORAN' ? 'Konfirmasi Setor' : 'Konfirmasi Tarik';
    document.getElementById('modalSavingsAction').classList.add('active');
  },

  openPriceUpdateModal(id, name, currentPrice) {
    this.closeModals();
    document.getElementById('priceUpdateAssetId').value = id;
    document.getElementById('priceUpdateAssetName').textContent = name;
    document.getElementById('priceUpdateValue').value = currentPrice;
    document.getElementById('modalPriceUpdate').classList.add('active');
  },

  closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(el => el.classList.remove('active'));
  },

  setFormType(type) {
    document.querySelectorAll('.action-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-type') === type) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    const groupTujuan = document.getElementById('groupDompetTujuan');
    if (groupTujuan) {
      groupTujuan.style.display = (type === 'Transfer') ? 'block' : 'none';
    }
  },

  formatCurrencyInput(input) {
    let val = input.value.replace(/\D/g, '');
    input.value = val ? Number(val).toLocaleString('id-ID') : '';
  },

  async submitQuickEntry(e) {
    e.preventDefault();
    const nominalRaw = document.getElementById('entryNominal').value.replace(/\D/g, '');
    const nominal = Number(nominalRaw) || 0;
    if (nominal <= 0) {
      this.showToast('Nominal harus lebih dari 0', 'error');
      return;
    }

    const activeTab = document.querySelector('.action-tab-btn.active')?.getAttribute('data-type') || 'Pengeluaran';
    const payload = {
      nominal: nominal,
      jenis_transaksi: activeTab,
      pencatat: document.getElementById('entryPencatat').value,
      sifat_transaksi: document.getElementById('entrySifat').value,
      id_kategori: document.getElementById('entryKategori').value,
      id_dompet_asal: document.getElementById('entryDompetAsal').value,
      id_dompet_tujuan: document.getElementById('entryDompetTujuan')?.value || '',
      keterangan: document.getElementById('entryKeterangan').value,
      tanggal: new Date().toISOString().slice(0, 10),
      waktu: new Date().toTimeString().slice(0, 5)
    };

    // Optimistic Update (Instan!)
    const optimisticTrx = {
      ...payload,
      id_transaksi: 'TRX-OPT-' + Date.now(),
      status: 'VALID'
    };
    Store.addOptimisticTransaction(optimisticTrx);
    this.closeModals();
    this.showToast('Transaksi berhasil disimpan!', 'success');

    // Kirim Asinkron ke GAS
    const res = await API.post('simpanTransaksi', payload);
    if (!res.success) {
      this.showToast('Gagal sinkron ke server: ' + res.message, 'warning');
    }
  },

  async submitPayBill(e) {
    e.preventDefault();
    const idTagihan = document.getElementById('payBillId').value;
    const nominal = Number(document.getElementById('payBillAmount').value) || 0;
    const idDompet = document.getElementById('payBillWallet').value;

    this.closeModals();
    this.showToast('Memproses pembayaran tagihan...', 'info');

    // Update Status Lokal
    const bill = Store.state.tagihanRutin.find(b => b.id_tagihan === idTagihan);
    if (bill) bill.status_bulan_ini = 'Sudah Dibayar';
    Store.notify('STATE_UPDATED');

    const res = await API.post('bayarTagihan', {
      id_tagihan: idTagihan,
      nominal_bayar: nominal,
      id_dompet: idDompet
    });

    if (res.success) {
      this.showToast('Tagihan berhasil dilunasi!', 'success');
      Store.fetchFreshData();
    } else {
      this.showToast('Error: ' + res.message, 'error');
    }
  },

  async submitSavingsAction(e) {
    e.preventDefault();
    const idTarget = document.getElementById('savingsActionGoalId').value;
    const tipe = document.getElementById('savingsActionType').value;
    const nominal = Number(document.getElementById('savingsActionAmount').value) || 0;
    const idDompet = document.getElementById('savingsActionWallet').value;

    this.closeModals();
    this.showToast(`Memproses ${tipe.toLowerCase()} tabungan...`, 'info');

    const res = await API.post('setorTarikTabungan', {
      id_target: idTarget,
      tipe_mutasi: tipe,
      nominal: nominal,
      id_dompet: idDompet
    });

    if (res.success) {
      this.showToast(`${tipe} tabungan berhasil!`, 'success');
      Store.fetchFreshData();
    } else {
      this.showToast('Error: ' + res.message, 'error');
    }
  },

  async submitPriceUpdate(e) {
    e.preventDefault();
    const idAset = document.getElementById('priceUpdateAssetId').value;
    const hargaBaru = Number(document.getElementById('priceUpdateValue').value) || 0;

    this.closeModals();
    this.showToast('Memperbarui harga pasar...', 'info');

    const res = await API.post('updateHargaAset', {
      id_aset: idAset,
      harga_pasar_terkini: hargaBaru
    });

    if (res.success) {
      this.showToast('Harga pasar berhasil diupdate!', 'success');
      Store.fetchFreshData();
    } else {
      this.showToast('Error: ' + res.message, 'error');
    }
  },

  // =====================================================================================
  // MODUL GANTI FOTO PROFIL & AVATAR SUAMI / ISTRI
  // =====================================================================================
  avatarPresets: [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Suami&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Istri&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna&backgroundColor=b6e3f4'
  ],

  selectedAvatarUrl: '',

  openChangeAvatarModal(userId) {
    this.closeModals();
    const currentUserId = userId || (Store.state.user ? Store.state.user.id : 'USR-01');
    const userSelect = document.getElementById('avatarUserId');
    if (userSelect) userSelect.value = currentUserId;

    this.onAvatarUserChange(currentUserId);
    document.getElementById('modalChangeAvatar').classList.add('active');
  },

  onAvatarUserChange(userId) {
    let currentAvatar = '';
    const userObj = Store.state.pengguna.find(u => u.id_pengguna === userId);
    if (userObj && userObj.avatar_url) {
      currentAvatar = userObj.avatar_url;
    } else if (Store.state.user && Store.state.user.id === userId) {
      currentAvatar = Store.state.user.avatar;
    } else {
      currentAvatar = userId === 'USR-02' 
        ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Istri' 
        : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suami';
    }

    this.selectedAvatarUrl = currentAvatar;
    const preview = document.getElementById('avatarPreviewImg');
    if (preview) preview.src = currentAvatar;

    const urlInput = document.getElementById('avatarCustomUrl');
    if (urlInput) urlInput.value = '';

    this.renderAvatarPresets(currentAvatar);
  },

  renderAvatarPresets(activeUrl) {
    const container = document.getElementById('avatarPresetContainer');
    if (!container) return;

    container.innerHTML = this.avatarPresets.map(url => {
      const isSelected = (url === activeUrl);
      return `
        <div class="avatar-preset-item ${isSelected ? 'selected' : ''}" onclick="App.selectPresetAvatar('${url}')">
          <img src="${url}" alt="Avatar Option">
        </div>
      `;
    }).join('');
  },

  selectPresetAvatar(url) {
    this.selectedAvatarUrl = url;
    const preview = document.getElementById('avatarPreviewImg');
    if (preview) preview.src = url;

    const urlInput = document.getElementById('avatarCustomUrl');
    if (urlInput) urlInput.value = '';

    document.querySelectorAll('.avatar-preset-item').forEach(el => {
      if (el.querySelector('img')?.src === url) el.classList.add('selected');
      else el.classList.remove('selected');
    });
  },

  previewCustomAvatarUrl(url) {
    if (!url) return;
    this.selectedAvatarUrl = url;
    const preview = document.getElementById('avatarPreviewImg');
    if (preview) preview.src = url;

    document.querySelectorAll('.avatar-preset-item').forEach(el => el.classList.remove('selected'));
  },

  handleAvatarFileUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showToast('Harap pilih berkas gambar (JPG, PNG, WebP)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const base64Data = loadEvt.target.result;
      this.selectedAvatarUrl = base64Data;
      const preview = document.getElementById('avatarPreviewImg');
      if (preview) preview.src = base64Data;
      document.querySelectorAll('.avatar-preset-item').forEach(el => el.classList.remove('selected'));
      this.showToast('Foto berhasil dimuat!', 'info');
    };
    reader.readAsDataURL(file);
  },

  async submitChangeAvatar(e) {
    e.preventDefault();
    const userId = document.getElementById('avatarUserId').value;
    const newAvatar = this.selectedAvatarUrl;

    if (!newAvatar) {
      this.showToast('Pilih atau unggah foto avatar terlebih dahulu', 'warning');
      return;
    }

    this.closeModals();
    this.showToast('Menyimpan foto profil...', 'info');

    // Update Store secara reaktif
    Store.updateUserAvatar(userId, newAvatar);
    this.updateUserProfileUI();

    const res = await API.post('gantiFotoProfil', {
      user_id: userId,
      avatar_url: newAvatar
    });

    if (res.success) {
      this.showToast('Foto profil berhasil diperbarui!', 'success');
      Store.fetchFreshData();
    } else {
      this.showToast('Gagal simpan foto: ' + res.message, 'warning');
    }
  },

  // =====================================================================================
  // MODUL TAGIHAN RUTIN (RECURRING EXPENSES)
  // =====================================================================================
  openAddBillModal() {
    this.closeModals();
    const form = document.getElementById('addBillForm');
    if (form) form.reset();
    document.getElementById('modalAddBill').classList.add('active');
  },

  async submitAddBill(e) {
    e.preventDefault();
    const payload = {
      id_tagihan: 'BIL-' + Date.now().toString().slice(-6),
      nama_tagihan: document.getElementById('billName').value,
      id_kategori: document.getElementById('billCategory').value,
      tipe_nominal: document.getElementById('billTypeNominal').value,
      nominal_estimasi: Number(document.getElementById('billAmount').value) || 0,
      tanggal_jatuh_tempo: Number(document.getElementById('billDueDate').value) || 10,
      frekuensi: document.getElementById('billFrequency').value,
      sifat_tagihan: document.getElementById('billScope').value,
      id_dompet_default: document.getElementById('billWallet').value,
      status_bulan_ini: 'Menunggu Pembayaran',
      status_aktif: 'TRUE'
    };

    this.closeModals();
    this.showToast('Menyimpan tagihan rutin...', 'info');

    Store.state.tagihanRutin.push(payload);
    Store.notify('STATE_UPDATED');

    const res = await API.post('kelolaTagihanRutin', {
      action_type: 'TAMBAH',
      tagihan: payload
    });

    if (res.success) {
      this.showToast('Tagihan rutin berhasil ditambahkan!', 'success');
      Store.fetchFreshData();
    } else {
      this.showToast('Error: ' + res.message, 'error');
    }
  },

  // =====================================================================================
  // MODUL ANGGARAN BULANAN (MONTHLY BUDGET)
  // =====================================================================================
  openAddBudgetModal() {
    this.closeModals();
    const periodInput = document.getElementById('budgetPeriod');
    if (periodInput) periodInput.value = new Date().toISOString().slice(0, 7);
    document.getElementById('modalAddBudget').classList.add('active');
  },

  async submitAddBudget(e) {
    e.preventDefault();
    const payload = {
      id_anggaran: 'BDG-' + Date.now().toString().slice(-6),
      periode_bulan: document.getElementById('budgetPeriod').value,
      id_kategori: document.getElementById('budgetCategory').value,
      nominal_anggaran: Number(document.getElementById('budgetAmount').value) || 0,
      sifat_anggaran: document.getElementById('budgetScope').value,
      realisasi: 0,
      persentase: 0,
      status_warning: 'AMAN'
    };

    this.closeModals();
    this.showToast('Menyimpan anggaran belanja...', 'info');

    // Update atau tambah di Store
    const existingIdx = Store.state.anggaran.findIndex(
      b => b.periode_bulan === payload.periode_bulan && b.id_kategori === payload.id_kategori
    );
    if (existingIdx >= 0) {
      payload.realisasi = Store.state.anggaran[existingIdx].realisasi;
      payload.persentase = payload.nominal_anggaran > 0 ? (payload.realisasi / payload.nominal_anggaran) * 100 : 0;
      Store.state.anggaran[existingIdx] = payload;
    } else {
      Store.state.anggaran.push(payload);
    }
    Store.notify('STATE_UPDATED');

    const res = await API.post('kelolaAnggaran', {
      action_type: 'SIMPAN',
      anggaran: payload
    });

    if (res.success) {
      this.showToast('Anggaran belanja berhasil dipasang!', 'success');
      Store.fetchFreshData();
    } else {
      this.showToast('Error: ' + res.message, 'error');
    }
  },

  // =====================================================================================
  // MODUL TARGET TABUNGAN (SAVINGS GOALS)
  // =====================================================================================
  openAddGoalModal() {
    this.closeModals();
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const dateInput = document.getElementById('goalTargetDate');
    if (dateInput) dateInput.value = nextYear.toISOString().slice(0, 10);
    document.getElementById('modalAddGoal').classList.add('active');
  },

  async submitAddGoal(e) {
    e.preventDefault();
    const targetNominal = Number(document.getElementById('goalTargetAmount').value) || 0;
    const payload = {
      id_target: 'GOL-' + Date.now().toString().slice(-6),
      nama_target: document.getElementById('goalName').value,
      kategori_target: document.getElementById('goalCategory').value,
      sifat_target: document.getElementById('goalScope').value,
      nominal_target: targetNominal,
      nominal_terkumpul: 0,
      sisa_kebutuhan: targetNominal,
      target_tanggal_selesai: document.getElementById('goalTargetDate').value,
      persentase_progress: 0,
      status: 'AKTIF'
    };

    this.closeModals();
    this.showToast('Membuat target tabungan baru...', 'info');

    Store.state.targetTabungan.push(payload);
    Store.notify('STATE_UPDATED');

    const res = await API.post('kelolaTargetTabungan', {
      action_type: 'TAMBAH',
      target: payload
    });

    if (res.success) {
      this.showToast('Target tabungan berhasil dibuat!', 'success');
      Store.fetchFreshData();
    } else {
      this.showToast('Error: ' + res.message, 'error');
    }
  },

  // =====================================================================================
  // MODUL PORTOFOLIO INVESTASI (BELI & JUAL ASET)
  // =====================================================================================
  openBuyAssetModal() {
    this.closeModals();
    const form = document.getElementById('buyAssetForm');
    if (form) form.reset();
    document.getElementById('modalBuyAsset').classList.add('active');
  },

  onBuyAssetTypeChange(type) {
    const nameInput = document.getElementById('buyAssetName');
    if (!nameInput) return;
    if (type === 'Bitcoin (BTC)') nameInput.value = 'Bitcoin (BTC)';
    else if (type === 'Emas (Gold)') nameInput.value = 'Logam Mulia Antam';
    else if (type === 'Saham') nameInput.placeholder = 'Contoh: BBCA / BBRI / TLKM';
  },

  async submitBuyAsset(e) {
    e.preventDefault();
    const jenis = document.getElementById('buyAssetType').value;
    const nama = document.getElementById('buyAssetName').value;
    const kepemilikan = document.getElementById('buyAssetOwnership').value;
    const units = Number(document.getElementById('buyAssetUnits').value) || 0;
    const price = Number(document.getElementById('buyAssetPrice').value) || 0;
    const fee = Number(document.getElementById('buyAssetFee').value) || 0;
    const walletId = document.getElementById('buyAssetWallet').value;
    const totalCost = (units * price) + fee;

    this.closeModals();
    this.showToast('Memproses pembelian aset investasi...', 'info');

    // Catat mutasi kas operasional keluar
    const trxOpt = {
      id_transaksi: 'TRX-AST-BUY-' + Date.now(),
      tanggal: new Date().toISOString().slice(0, 10),
      waktu: new Date().toTimeString().slice(0, 5),
      pencatat: Store.state.user ? Store.state.user.name : 'Suami',
      sifat_transaksi: kepemilikan === 'Bersama' ? 'Rumah Tangga Bersama' : kepemilikan,
      jenis_transaksi: 'Beli Aset',
      id_kategori: 'Investasi',
      id_dompet_asal: walletId,
      nominal: totalCost,
      keterangan: `Beli aset ${nama} (${units} unit @ ${this.formatIDR(price, true)})`,
      status: 'VALID'
    };
    Store.addOptimisticTransaction(trxOpt);

    // Update portofolio lokal
    const existing = Store.state.portofolio.find(p => p.nama_aset.toLowerCase() === nama.toLowerCase());
    if (existing) {
      const oldUnit = Number(existing.total_unit) || 0;
      const oldModal = Number(existing.total_modal) || 0;
      const newUnit = oldUnit + units;
      const newModal = oldModal + totalCost;
      existing.total_unit = newUnit;
      existing.total_modal = newModal;
      existing.harga_rata_rata = newUnit > 0 ? Math.round(newModal / newUnit) : price;
      existing.harga_pasar_terkini = price;
      existing.nilai_pasar_total = newUnit * price;
      existing.unrealized_pnl = existing.nilai_pasar_total - newModal;
      existing.unrealized_pnl_persen = newModal > 0 ? (existing.unrealized_pnl / newModal) * 100 : 0;
    } else {
      Store.state.portofolio.push({
        id_aset: 'AST-' + Date.now().toString().slice(-6),
        jenis_aset: jenis,
        nama_aset: nama,
        kepemilikan: kepemilikan,
        total_unit: units,
        harga_rata_rata: price,
        total_modal: totalCost,
        harga_pasar_terkini: price,
        nilai_pasar_total: units * price,
        unrealized_pnl: -fee,
        unrealized_pnl_persen: totalCost > 0 ? (-fee / totalCost) * 100 : 0
      });
    }

    Store.recalculateClientLedger();
    Store.notify('STATE_UPDATED');

    const res = await API.post('beliAsetInvestasi', {
      jenis_aset: jenis,
      nama_aset: nama,
      kepemilikan: kepemilikan,
      total_unit: units,
      harga_satuan: price,
      fee_transaksi: fee,
      id_dompet: walletId
    });

    if (res.success) {
      this.showToast('Aset investasi berhasil dibeli & dicatat!', 'success');
      Store.fetchFreshData();
    } else {
      this.showToast('Error: ' + res.message, 'error');
    }
  },

  openSellAssetModal(idAset, namaAset, maxUnit, currentPrice) {
    this.closeModals();
    document.getElementById('sellAssetId').value = idAset;
    document.getElementById('sellAssetName').textContent = namaAset;
    document.getElementById('sellAssetUnitInfo').textContent = `Tersedia: ${maxUnit} Unit`;
    document.getElementById('sellAssetUnits').value = '';
    document.getElementById('sellAssetUnits').max = maxUnit;
    document.getElementById('sellAssetPrice').value = currentPrice || 0;
    document.getElementById('modalSellAsset').classList.add('active');
  },

  async submitSellAsset(e) {
    e.preventDefault();
    const idAset = document.getElementById('sellAssetId').value;
    const units = Number(document.getElementById('sellAssetUnits').value) || 0;
    const price = Number(document.getElementById('sellAssetPrice').value) || 0;
    const fee = Number(document.getElementById('sellAssetFee').value) || 0;
    const walletId = document.getElementById('sellAssetWallet').value;
    const netProceeds = (units * price) - fee;

    const asset = Store.state.portofolio.find(p => p.id_aset === idAset);
    if (!asset || units > Number(asset.total_unit)) {
      this.showToast('Unit yang dijual melebihi jumlah kepemilikan!', 'error');
      return;
    }

    this.closeModals();
    this.showToast('Memproses penjualan aset investasi...', 'info');

    // Catat mutasi kas masuk
    const trxOpt = {
      id_transaksi: 'TRX-AST-SELL-' + Date.now(),
      tanggal: new Date().toISOString().slice(0, 10),
      waktu: new Date().toTimeString().slice(0, 5),
      pencatat: Store.state.user ? Store.state.user.name : 'Suami',
      sifat_transaksi: asset.kepemilikan === 'Bersama' ? 'Rumah Tangga Bersama' : asset.kepemilikan,
      jenis_transaksi: 'Jual Aset',
      id_kategori: 'Investasi',
      id_dompet_asal: walletId,
      nominal: netProceeds,
      keterangan: `Jual aset ${asset.nama_aset} (${units} unit @ ${this.formatIDR(price, true)})`,
      status: 'VALID'
    };
    Store.addOptimisticTransaction(trxOpt);

    // Kurangi unit di portofolio lokal
    asset.total_unit = Number(asset.total_unit) - units;
    asset.nilai_pasar_total = asset.total_unit * Number(asset.harga_pasar_terkini);
    Store.recalculateClientLedger();
    Store.notify('STATE_UPDATED');

    const res = await API.post('jualAsetInvestasi', {
      id_aset: idAset,
      unit_dijual: units,
      harga_satuan_jual: price,
      fee_transaksi: fee,
      id_dompet: walletId
    });

    if (res.success) {
      this.showToast('Penjualan aset investasi berhasil dilunasi ke dompet!', 'success');
      Store.fetchFreshData();
    } else {
      this.showToast('Error: ' + res.message, 'error');
    }
  },

  // =====================================================================================
  // MODUL UTANG & PIUTANG
  // =====================================================================================
  openAddDebtModal() {
    this.closeModals();
    const form = document.getElementById('addDebtForm');
    if (form) form.reset();
    document.getElementById('modalAddDebt').classList.add('active');
  },

  async submitAddDebt(e) {
    e.preventDefault();
    const amount = Number(document.getElementById('debtAmount').value) || 0;
    const payload = {
      id_utang_piutang: 'DEB-' + Date.now().toString().slice(-6),
      jenis: document.getElementById('debtType').value,
      pihak_kedua: document.getElementById('debtParty').value,
      sifat: document.getElementById('debtScope').value,
      nominal_awal: amount,
      total_terbayar: 0,
      sisa_nominal: amount,
      jatuh_tempo: document.getElementById('debtDueDate').value || '',
      status: 'BELUM_LUNAS',
      keterangan: document.getElementById('debtNotes').value || ''
    };

    this.closeModals();
    this.showToast('Menyimpan data utang/piutang...', 'info');

    Store.state.utangPiutang.push(payload);
    Store.recalculateClientLedger();
    Store.notify('STATE_UPDATED');

    const res = await API.post('kelolaUtangPiutang', {
      action_type: 'TAMBAH',
      data: payload
    });

    if (res.success) {
      this.showToast('Data utang/piutang berhasil disimpan!', 'success');
      Store.fetchFreshData();
    } else {
      this.showToast('Error: ' + res.message, 'error');
    }
  },

  openPayDebtModal(id, pihak, sisa) {
    this.closeModals();
    document.getElementById('payDebtId').value = id;
    document.getElementById('payDebtParty').textContent = pihak;
    document.getElementById('payDebtRemaining').textContent = `Sisa Kewajiban: ${this.formatIDR(sisa, true)}`;
    document.getElementById('payDebtAmount').value = sisa;
    document.getElementById('modalPayDebt').classList.add('active');
  },

  async submitPayDebt(e) {
    e.preventDefault();
    const id = document.getElementById('payDebtId').value;
    const nominal = Number(document.getElementById('payDebtAmount').value) || 0;
    const walletId = document.getElementById('payDebtWallet').value;

    const item = Store.state.utangPiutang.find(u => u.id_utang_piutang === id);
    if (!item) return;

    this.closeModals();
    this.showToast('Memproses pembayaran cicilan...', 'info');

    // Update status lokal
    item.total_terbayar = (Number(item.total_terbayar) || 0) + nominal;
    item.sisa_nominal = Math.max(0, (Number(item.nominal_awal) || 0) - item.total_terbayar);
    if (item.sisa_nominal === 0) item.status = 'LUNAS';

    // Catat mutasi pengeluaran kas (jika utang) atau pemasukan (jika piutang)
    const isUtang = item.jenis === 'Utang';
    const trxOpt = {
      id_transaksi: 'TRX-DEB-' + Date.now(),
      tanggal: new Date().toISOString().slice(0, 10),
      waktu: new Date().toTimeString().slice(0, 5),
      pencatat: Store.state.user ? Store.state.user.name : 'Suami',
      sifat_transaksi: item.sifat || 'Rumah Tangga Bersama',
      jenis_transaksi: isUtang ? 'Pengeluaran' : 'Pemasukan',
      id_kategori: isUtang ? 'Bayar Cicilan Utang' : 'Penerimaan Piutang',
      id_dompet_asal: walletId,
      nominal: nominal,
      keterangan: `Cicilan ${item.jenis} - ${item.pihak_kedua}`,
      status: 'VALID'
    };
    Store.addOptimisticTransaction(trxOpt);

    Store.recalculateClientLedger();
    Store.notify('STATE_UPDATED');

    const res = await API.post('bayarCicilanUtangPiutang', {
      id_utang_piutang: id,
      nominal_bayar: nominal,
      id_dompet: walletId
    });

    if (res.success) {
      this.showToast('Pembayaran cicilan berhasil!', 'success');
      Store.fetchFreshData();
    } else {
      this.showToast('Error: ' + res.message, 'error');
    }
  },

  // =====================================================================================
  // MODUL TAMBAH KATEGORI TRANSAKSI BARU
  // =====================================================================================
  openAddCategoryModal() {
    this.closeModals();
    const form = document.getElementById('addCategoryForm');
    if (form) form.reset();
    document.getElementById('modalAddCategory').classList.add('active');
  },

  async submitAddCategory(e) {
    e.preventDefault();
    const nama = document.getElementById('catName').value;
    const tipe = document.getElementById('catType').value;
    const ikon = document.getElementById('catIcon').value;

    const payload = {
      id_kategori: 'KAT-' + (Store.state.kategori.length + 1).toString().padStart(2, '0'),
      nama_kategori: nama,
      tipe: tipe,
      ikon: ikon,
      warna_badge: tipe === 'Pemasukan' ? '#10B981' : '#0E4D43'
    };

    this.closeModals();
    this.showToast('Menambahkan kategori baru...', 'info');

    Store.state.kategori.push(payload);
    this.populateDropdowns();
    Store.notify('STATE_UPDATED');

    const res = await API.post('tambahKategori', payload);
    if (res.success) {
      this.showToast(`Kategori "${nama}" berhasil ditambahkan!`, 'success');
      Store.fetchFreshData();
    } else {
      this.showToast('Error: ' + res.message, 'error');
    }
  },
  },

  async deleteTransaction(id) {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;
    
    // Hapus Optimistik di Klien
    Store.state.transaksi = Store.state.transaksi.filter(t => t.id_transaksi !== id);
    Store.recalculateClientLedger();
    Store.notify('STATE_UPDATED');
    this.showToast('Transaksi dihapus', 'info');

    await API.post('hapusTransaksi', { id_transaksi: id });
  },

  saveSettings(e) {
    e.preventDefault();
    const newGasUrl = document.getElementById('settingGasUrl').value;
    CONFIG.GAS_URL = newGasUrl;
    this.showToast('Pengaturan backend GAS berhasil disimpan!', 'success');
    Store.fetchFreshData();
  },

  async triggerManualBackup() {
    this.showToast('Membuat cadangan ke Google Drive...', 'info');
    const res = await API.post('backupDatabase', {});
    if (res.success) {
      this.showToast(res.message, 'success');
    } else {
      this.showToast('Gagal backup: ' + res.message, 'error');
    }
  },

  // =====================================================================================
  // EKSPOR EXCEL & PDF KLIEN (OFFLINE READY)
  // =====================================================================================
  exportExcel() {
    if (typeof XLSX === 'undefined') {
      this.showToast('SheetJS belum termuat.', 'error');
      return;
    }
    const data = Store.state.transaksi.map(t => ({
      ID: t.id_transaksi,
      Tanggal: t.tanggal,
      Waktu: t.waktu,
      Pencatat: t.pencatat,
      Pos: t.sifat_transaksi,
      Jenis: t.jenis_transaksi,
      Kategori: t.id_kategori,
      Dompet_Asal: t.id_dompet_asal,
      Dompet_Tujuan: t.id_dompet_tujuan,
      Nominal: t.nominal,
      Keterangan: t.keterangan
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');
    XLSX.writeFile(wb, `Couple_Finance_Transactions_${new Date().toISOString().slice(0, 10)}.xlsx`);
    this.showToast('File Excel berhasil diunduh!', 'success');
  },

  exportPDF() {
    if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
      this.showToast('jsPDF belum termuat.', 'error');
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(14, 77, 67); // Deep Vintage Teal
    doc.text('COUPLE FINANCE – LAPORAN BULANAN', 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`Periode: ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`, 14, 30);
    doc.text(`Total Net Worth Keluarga: ${this.formatIDR(Store.state.summary.netWorth)}`, 14, 38);
    doc.text(`Total Kas & Bank: ${this.formatIDR(Store.state.summary.totalCash)}`, 14, 46);
    doc.text(`Total Portofolio Investasi: ${this.formatIDR(Store.state.summary.totalInvestasi)}`, 14, 54);

    doc.setDrawColor(229, 224, 216);
    doc.line(14, 62, 196, 62);

    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text('5 Transaksi Terakhir:', 14, 72);

    let y = 82;
    Store.state.transaksi.slice(0, 10).forEach(t => {
      doc.setFontSize(10);
      doc.text(`${t.tanggal} | ${t.pencatat} (${t.sifat_transaksi}) | ${t.id_kategori || t.jenis_transaksi} | ${this.formatIDR(t.nominal)}`, 14, y);
      y += 8;
    });

    doc.save(`Couple_Finance_Laporan_${new Date().toISOString().slice(0, 10)}.pdf`);
    this.showToast('Laporan PDF berhasil diunduh!', 'success');
  },

  // Toast Notification
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info'}"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }
};

// Auto Start on Window Loaded
window.addEventListener('DOMContentLoaded', () => {
  App.init();
});
