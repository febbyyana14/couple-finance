# Wireframe Specification & AI Prompt
## Couple Finance – Family Financial Management System
### Versi 1.3 – Grayscale Wireframe Specification

**Target Platform:** Web App Google Apps Script (GAS) & Google Sheets Database  
**Arsitektur Frontend:** Single Page Application (SPA) Responsive  
**Gaya Desain:** Grayscale / Black-and-White Structural Wireframe  
**Tujuan Penggunaan:** Prompt siap pakai untuk Google Stitch AI, v0.dev, Uizard, atau Figma  
**Terakhir Diperbarui:** 23 November 2026  

---

## 1. Ringkasan Eksekutif Wireframe

Dokumen ini berisi spesifikasi tata letak struktural monokrom (*grayscale wireframe*) untuk aplikasi **Couple Finance**, mencakup **6 Pilar Utama Finansial Keluarga**:
1. **Daily Finance:** Pencatatan pemasukan, pengeluaran, dan transfer harian (< 5 detik).
2. **Monthly Budget:** Anggaran belanja bulanan per kategori dengan indikator batas pagu.
3. **Recurring Expenses:** Pengawasan tagihan rutin (WiFi, listrik, PDAM, sewa, asuransi) dengan sistem pengingat jatuh tempo dan pelunasan 1-klik.
4. **Savings Goals:** Perencanaan target tabungan keluarga (Dana Darurat, Rumah, Liburan, Pendidikan) dengan alokasi dana virtual (*earmarking*) anti-double counting.
5. **Investment Portfolio:** Pelacakan multi-aset (Kas investasi, Bitcoin, Saham, Emas) dengan pembaruan harga pasar manual.
6. **Net Worth Engine:** Kalkulasi kekayaan bersih keluarga secara komprehensif memperhitungkan aset likuid, investasi, hak tagih piutang, dan kewajiban utang.

---

## 2. Prompt Lengkap untuk Google Stitch AI (Siap Salin)

Salin seluruh teks di dalam blok kode berikut ke Google Stitch AI:

```text
Create detailed wireframes for Couple Finance – Family Financial Management System (Version 1.3).
Use grayscale/black-and-white wireframe style only — no colors, no images, just layout structure, placeholder boxes, labels, and navigation flow.

## Application Context
Couple Finance is an executive personal and household financial operating system tailored for husband and wife with an equal dual-admin model. The system integrates six core pillars: (1) Daily Finance transaction logging, (2) Monthly Budgeting, (3) Recurring Expenses & bill tracking, (4) Savings Goals & fund allocation (earmarking), (5) Multi-asset Investment Tracker (Cash, Bitcoin, Stocks, Gold), and (6) Real-time Net Worth calculation with debt/receivables handling.

Has 12 key wireframe views across desktop and mobile breakpoints:

## Wireframe Pages Required

--- PAGE W-01: AUTHENTICATION & QUICK PIN LOCK SCREEN ---
Layout: Centered single-card modal on clean neutral background.
- Header Box: [icon: lock] "Couple Finance" title and family avatar placeholder [X].
- Subtitle: "Select active profile and enter 6-digit PIN to continue."
- User Selector Segmented Control: [ Suami (Husband) ] | [ Istri (Wife) ].
- PIN Input Display: 6 circular empty dot placeholders [ ○ ○ ○ ○ ○ ○ ].
- Numeric Keypad: 3x4 grid with large rounded number buttons (1 to 9, 0, [icon: backspace], and [Clear]).
- Security Note: "Protected by SHA-256 HMAC encryption & Local Google Workspace Storage."
- Alternative Link: "Sign in with Google Workspace Account".

--- PAGE W-02: EXECUTIVE FINANCIAL DASHBOARD (DESKTOP MAIN VIEW) ---
Layout: Two-column layout with left collapsible sidebar (240px) and scrollable main content panel.
- Left Sidebar:
  - App Header: [icon: logo] "Couple Finance" with collapse button [icon: menu].
  - Active Profile Widget: Avatar [X] "Suami (Active)" with quick-switch dropdown [icon: chevron-down].
  - Main Navigation List:
    - [icon: layout-dashboard] "Dashboard" (Active indicator)
    - [icon: plus-circle] "Quick Entry (+)"
    - [icon: receipt] "Daily Transactions"
    - [icon: calendar-clock] "Recurring Bills" (Badge: "2 Due")
    - [icon: target] "Monthly Budget"
    - [icon: trophy] "Savings Goals" (Badge: "3 Active")
    - [icon: trending-up] "Investment Portfolio"
    - [icon: handshake] "Debts & Receivables"
    - [icon: file-text] "Reports & PDF"
    - [icon: settings] "Settings & Backup"
  - Theme Toggle at Bottom: [icon: sun] Light | [icon: moon] Dark toggle.
- Top Bar:
  - Global Search Input: [icon: search] "Search transactions, notes, categories..."
  - Global Analysis Filter Pills: [ ● All Family ] [ ○ Pribadi Suami ] [ ○ Pribadi Istri ] [ ○ Rumah Tangga Bersama ]
  - Notification Bell [icon: bell] with counter badge and Profile Avatar [X].
- Urgency Alert Banner (Conditional):
  - Warning Box [icon: alert-triangle]: "2 Recurring Bills Due within 3 Days: Home WiFi (Due in 2 days) & Electricity PLN (Due tomorrow) -> [Pay Now Button]".
- KPI Metric Cards (Top Grid - 4 Columns):
  - Card 1 (Net Worth): Label "TOTAL NET WORTH", Value "Rp 450.850.000", Subtext "+4.2% from last month".
  - Card 2 (Cash Flow): Label "TOTAL CASH & BANK", Value "Rp 68.200.000", Subtext "Across 5 Wallets/Accounts".
  - Card 3 (Monthly Income/Expense): Two-value split: Income "Rp 32.500.000" / Expense "Rp 18.345.000".
  - Card 4 (Investments): Label "INVESTMENT ASSETS", Value "Rp 395.150.000", Subtext "Unrealized PnL: +Rp 42.100.000".
- Savings Goals Summary Strip (Pillar 4 Highlight):
  - Horizontal Widget with 3 metric chips:
    - "Total Earmarked Savings: Rp 48.500.000 (Allocated across 3 goals)"
    - "Active Goals: 3 | Near Completion (>80%): 1 | Completed: 2"
    - Mini Progress Pills: [ Emergency Fund: 70% ] [ Japan Vacation: 45% ] [ Car Downpayment: 25% ]
    - Action Link: "Manage Goals ->".
- Analytics Charts Section (2x2 Grid):
  - Chart Frame 1: Monthly Cash Flow [Bar Chart Frame: Monthly Income vs Expenses for Jan-Jun].
  - Chart Frame 2: Net Worth Growth [Line Chart Frame: 6-month historical net worth curve].
  - Chart Frame 3: Asset Allocation [Donut Chart Frame: Cash 15%, BTC 25%, Stocks 40%, Gold 20%].
  - Chart Frame 4: Expense Breakdown [Horizontal Bar Chart Frame: Food, Utilities, Transport, Shopping].
- Recent Transactions Mini-Table:
  - Columns: Date/Time | Recorder [Suami/Istri] | Entity [Joint/Personal] | Category | Wallet | Amount | Status.

--- PAGE W-03: QUICK TRANSACTION ENTRY MODAL (<5s FAST FORM) ---
Layout: Centered popup modal (520px width) optimized for rapid data entry.
- Header: Title "Record Transaction" with Close button [icon: x].
- Transaction Type Quick Tabs (Full width):
  [ (●) Expense ] [ (○) Income ] [ (○) Transfer ] [ (○) Buy Asset ] [ (○) Pay Bill ] [ (○) Save Goal ]
- Big Currency Display: "Rp [ 150.000 ]" with automatic thousands separator.
- Two-Column Form Grid:
  - Date & Time: Input with default current timestamp [ 2026-11-23 16:30 ].
  - Recorded By: Radio pills [ ● Suami ] [ ○ Istri ].
  - Expense Entity: Radio pills [ ● Rumah Tangga Bersama ] [ ○ Pribadi Suami ] [ ○ Pribadi Istri ].
  - Category: Dropdown [ Select Category: e.g. Food & Dining v ].
  - Source Wallet: Dropdown [ Select Wallet: e.g. BCA Primary v ].
  - Destination Wallet: Dropdown (Visible only if Transfer is selected) [ e.g. GoPay v ].
- Notes & Attachment:
  - Description: Text input placeholder "e.g. Weekly grocery shopping at supermarket".
  - Receipt Attachment: File upload box [icon: camera] "Upload receipt / photo (Auto-compressed <300KB)".
- Bottom Action Buttons:
  - [ Secondary Outlined: Cancel ] | [ Primary Filled Dark: Save Transaction (<1s) ].

--- PAGE W-04: DAILY FINANCE & TRANSACTION LEDGER ---
Layout: Full-page data management view with top filter controls and data table.
- Filter Bar: Search box, date range picker [ Today | This Week | This Month | Custom ], and dropdown filters for Category, Wallet, Recorder, and Entity.
- Action Buttons: [ Secondary: Export Excel (.xlsx) ] and [ Primary: + Add Transaction ].
- Data Table:
  - Columns: [Check] | ID | Date & Time | Recorder | Entity | Category | From Wallet | To Wallet | Description | Amount | Receipt | Actions.
  - Rows with status badges for Income, Expense, Transfer, and Bill Payment.
- Bottom Pagination Controls: Showing 1-25 of 142 transactions.

--- PAGE W-05: MONTHLY BUDGET & EXPENSE CONTROL ---
Layout: Budget management view with top KPI cards and category budget progress list.
- Header: Title "Monthly Budgeting – November 2026" with Month Selector and [ Button: Copy Previous Month Budget ].
- 3 Summary Cards: Total Budget Allocated (Rp 20M) | Spent So Far (Rp 14.25M / 71.25%) | Safe Remaining (Rp 5.75M).
- Category Budget Cards Grid (2 Columns):
  - Item 1: "Food & Dining" | Allocated: Rp 5M | Spent: Rp 3.2M (64%) | Status: [Badge: Safe] | Progress Bar.
  - Item 2: "Utilities & Bills" | Allocated: Rp 3M | Spent: Rp 2.75M (91.6%) | Status: [Badge: Warning] | Progress Bar.
  - Item 3: "Shopping" | Allocated: Rp 2M | Spent: Rp 2.15M (107.5%) | Status: [Badge: Overbudget Alert] | Progress Bar.

--- PAGE W-06: RECURRING EXPENSES & MONTHLY BILLS MANAGER ---
Layout: Card-based and tabular bill manager with payment status tracker.
- Monthly Summary Metrics: Total Estimated Bills (Rp 4.25M) | Paid Bills (Rp 2.8M) | Pending / Due Soon (Rp 1.45M).
- Bill Cards Grid:
  - Card 1: "IndiHome WiFi" | Due: 5th monthly (In 2 days) | Type: Fixed (Rp 450.000) | Status: [Badge: Due Soon] | [ Button: Pay Now ].
  - Card 2: "PLN Electricity" | Due: 20th monthly | Type: Variable (Est. Rp 800.000) | Status: [Badge: Due Soon] | [ Button: Enter Amount & Pay ].
  - Card 3: "Netflix Premium" | Due: 15th monthly | Type: Fixed (Rp 186.000) | Status: [Badge: Paid on 15 Nov] | [ Button: Paid ].
- 1-Click Pay Confirmation Modal Overlay with auto-deduction and zero double-counting guarantee.

--- PAGE W-07: SAVINGS GOALS & FUND ALLOCATION MANAGER (NEW MODULE) ---
Layout: Goal planning dashboard with top allocation stats, goal card grid, and deposit/withdraw modals.
- Header: Title "Family Savings Goals & Earmarks" with Action Buttons: [ Button: + Create New Goal ].
- Top Summary Metrics (4 Cards):
  - Card 1: Total Allocated Savings "Rp 48.500.000" (Safely earmarked inside bank wallets).
  - Card 2: Active Goals "3 Goals in Progress".
  - Card 3: Near Target (>80%) "1 Goal (Emergency Fund)".
  - Card 4: Completed Goals "2 Goals Achieved".
- Filter Tabs: [ All Goals ] | [ Tabungan Bersama ] | [ Pribadi Suami ] | [ Pribadi Istri ] | [ Completed / Archived ].
- Goal Cards Grid (3 Columns of Rounded-2xl Cards):
  - Card 1: "Family Emergency Fund (6 Months)"
    - Category: Emergency | Sifat: [Badge: Tabungan Bersama]
    - Progress Bar: 70% filled in dark/emerald tone
    - Metrics: "Accumulated: Rp 35.000.000 / Target: Rp 50.000.000 (Remaining: Rp 15.000.000)"
    - Smart Estimation: "Est. completion in 6 months (May 2027) based on Rp 2.5M/mo deposit"
    - Linked Wallet: "Stored in Jenius Save It (BTPN)"
    - Action Buttons: [ Primary: + Deposit Funds ] | [ Secondary: - Withdraw Funds ] | [icon: more-horizontal].
  - Card 2: "Japan Family Vacation (Winter)"
    - Category: Vacation | Sifat: [Badge: Tabungan Bersama]
    - Progress Bar: 45% filled
    - Metrics: "Accumulated: Rp 13.500.000 / Target: Rp 30.000.000 (Remaining: Rp 16.500.000)"
    - Smart Estimation: "Est. completion in 8 months"
    - Action Buttons: [ + Deposit Funds ] | [ - Withdraw Funds ].
  - Card 3: "New Laptop for Husband"
    - Category: Personal Gadget | Sifat: [Badge: Pribadi Suami]
    - Progress Bar: 85% filled | Status: [Badge: Near Completion!]
    - Metrics: "Accumulated: Rp 17.000.000 / Target: Rp 20.000.000 (Remaining: Rp 3.000.000)"
    - Action Buttons: [ + Deposit Funds ] | [ - Withdraw Funds ].
- Modal Overlay 1: "Deposit to Savings Goal"
  - Select Target Goal: [ Family Emergency Fund v ]
  - Deposit Amount: [ Rp 2.500.000 ]
  - Source Wallet: [ BCA Payroll Main Account (Balance: Rp 24.500.000) v ]
  - Note: "Transfer to emergency fund allocation for November"
  - Anti-Double Counting Notice: "This is a virtual earmarking transfer. It does not count as consumptive expense and does not inflate Net Worth."
  - Action Buttons: [ Cancel ] | [ Confirm Deposit ].
- Modal Overlay 2: "Withdraw Funds from Savings Goal"
  - Select Target Goal: [ Japan Vacation v ]
  - Withdraw Amount: [ Rp 2.000.000 ] (Max available: Rp 13.500.000)
  - Destination Wallet: [ BCA Payroll v ]
  - Reason for withdrawal: [ e.g. Flight ticket downpayment ]
  - Action Buttons: [ Cancel ] | [ Confirm Withdrawal ].

--- PAGE W-08: INVESTMENT PORTFOLIO & MULTI-ASSET TRACKER ---
Layout: Multi-asset portfolio view with asset summary cards, allocation breakdown, and holding table.
- Top Stats: Invested Capital (Rp 353.05M) | Market Value (Rp 395.15M) | Unrealized Profit (+Rp 42.1M / +11.92%).
- Holdings Table:
  - Bitcoin: 0.25 BTC | Cost: Rp 950M | Current: Rp 1.45B | Value: Rp 362.5M | PnL: +Rp 125M (+52.6%).
  - BBCA Stocks: 25 Lots | Cost: Rp 9.200 | Current: Rp 10.150 | Value: Rp 25.375M | PnL: +Rp 2.375M (+10.3%).
  - Antam Gold: 25 Grams | Cost: Rp 1.25M | Current: Rp 1.42M | Value: Rp 35.5M | PnL: +Rp 4.25M (+13.6%).
- Modal: "Manual Market Price Update" with timestamp and re-calculation trigger.

--- PAGE W-09: DEBTS & RECEIVABLES (UTANG & PIUTANG) ---
Layout: Two-tab tracking panel for family obligations (Debts) and money lent out (Receivables).
- Summary Cards: Total Outstanding Debts (Rp 15M) vs Total Active Receivables (Rp 8M).
- Tabs: [ Family Debts (Liabilities) ] | [ Active Receivables (Assets) ].
- Rows with Progress Bars and [ Pay Installment ] action buttons.

--- PAGE W-10: FINANCIAL REPORTS & OFFICIAL PDF EXPORT ---
Layout: Document preview and export configuration screen.
- Control Bar: Month (November) & Year (2026) selector with [ Export Excel (.xlsx) ] and [ Download Official PDF ].
- Document Preview Panel (A4 Paper Aspect Ratio):
  - Header: "COUPLE FINANCE – MONTHLY STATEMENT".
  - Executive Summary Box (Income, Expense, Net Savings, Ending Cash).
  - Savings Goals Progress Summary (Total Earmarked Funds & Goals Met).
  - Recurring Bills Fulfillment Table (100% On-Time).
  - Net Worth Balance Sheet (Assets - Liabilities = Total Net Worth).
  - Dual Signature Blocks for Suami and Istri.

--- PAGE W-11: APPLICATION SETTINGS & BACKUP CENTER ---
Layout: Two-column settings panel.
- Left Column: Branding (App Title, Custom Logo, Light/Dark Mode, Color Accent, PIN Change).
- Right Column: Cloud Storage & Disaster Recovery:
  - Connected Spreadsheet ID with [ Open Sheet ] icon.
  - Dedicated Google Drive Folders: `CoupleFinance_Uploads/` and `CoupleFinance_Backups/`.
  - Frequency: [ Every 7 Days ] with Last Backup status.
  - Buttons: [ Backup Database Now ] and [ Restore from Backup ] (Double-PIN required).

--- PAGE W-12: MOBILE RESPONSIVE DASHBOARD BREAKPOINT (SMARTPHONE - 375px) ---
Layout: Single-column vertical mobile layout with top header and sticky bottom navigation.
- Top Bar: Menu drawer [icon: menu] | "Couple Finance" | Avatar badge [Suami ▾].
- Quick Filter Chips: [ (●) All ] [ Suami ] [ Istri ] [ Joint ].
- Swipeable Top KPI Cards: Net Worth (Rp 450.85M) | Total Cash (Rp 68.2M) | Earmarked Savings (Rp 48.5M).
- Urgency Bill Banner (Compact): "2 Bills Due Soon" -> [Pay].
- Savings Goal Mini-Card: "Emergency Fund: 70% reached (Rp 35M / Rp 50M) -> [+ Setor]".
- Floating Action Button (FAB): Bottom-right (+) button for instant <5s transaction entry.
- Sticky Bottom Navigation:
  [icon: home] Dashboard | [icon: receipt] Transaksi | [icon: trophy] Tabungan | [icon: calendar-clock] Tagihan | [icon: trending-up] Investasi.

## Wireframe Style Notes
- Use only grayscale: white (#FFFFFF), light gray (#F4F4F4), medium gray (#CCCCCC), dark gray (#555555), and black (#111111).
- Text placeholders: Use actual representative Indonesian financial labels and numbers, not "Lorem Ipsum".
- Buttons: Show shape and label clearly — primary action buttons filled dark/black, secondary buttons outlined with 1px border.
- Images/receipts: Show as plain box with an X through it (standard wireframe placeholder).
- Charts: Show as empty framed charts with axis lines, category labels, and chart type indicator.
- Icons: Show as simple square glyphs [icon: name] (e.g. [icon: lock], [icon: wallet], [icon: trophy], [icon: alert]).
- Number badges: Show on navigation items where relevant (e.g. "Tagihan (2 Due)", "Tabungan (3 Active)").
- Navigation Flow Arrows:
  - W-01 (PIN Lock Screen) ──► W-02 (Dashboard)
  - W-02 (Dashboard Quick +) ──► W-03 (Quick Entry Modal) ──► W-04 (Ledger updated)
  - W-02 (Savings Goals Link) ──► W-07 (Goals Manager) ──► Deposit Modal ──► W-07 (Goal Progress updated)
  - W-02 (Urgency Alert) ──► W-06 (Recurring Bills) ──► 1-Click Pay Modal ──► W-04 (Expense logged)
  - W-02 (Investments Tab) ──► W-08 (Portfolio) ──► Price Update Modal ──► W-02 (Net worth updated)
  - W-02 (Reports Tab) ──► W-10 (Official PDF & Excel Export)
  - Mobile View W-12 inherits all functionality with bottom navigation bar.
```

---

## 3. Matriks Navigasi & Struktur Layar

| Kode Layar | Nama Modul | Kategori Pilar | Interaksi Utama |
| :---: | :--- | :--- | :--- |
| **W-01** | PIN Lock & Quick Auth | Autentikasi | Keypad 3x4, switch Suami/Istri, verifikasi hash SHA-256 |
| **W-02** | Executive Dashboard | Dasbor Utama | 4 KPI Cards, Banner Tagihan, Widget Tabungan, 4 Grafik Analitik |
| **W-03** | Quick Entry Modal (<5s) | Pilar 1 (Daily) | Form 6 tab cepat (+ Setor Tabungan), input angka besar, upload struk |
| **W-04** | Daily Finance & Ledger | Pilar 1 (Daily) | Tabel transaksi lengkap, multi-filter, pencarian instan, ekspor Excel |
| **W-05** | Monthly Budgeting Control | Pilar 2 (Budget) | Pagu belanja, progress bar 3 warna (aman/waspada/overbudget), salin anggaran |
| **W-06** | Recurring Bills Manager | Pilar 3 (Bills) | Kartu tagihan rutin, status jatuh tempo, modal konfirmasi bayar 1-klik |
| **W-07** | Savings Goals Manager | Pilar 4 (Savings) | Kartu target tabungan, progress bar, estimasi tanggal, modal setor/tarik |
| **W-08** | Investment Portfolio Tracker | Pilar 5 (Invest) | Portofolio Cash/BTC/Saham/Emas, kalkulasi PnL, modal update harga pasar |
| **W-09** | Debts & Receivables Tracker | Utang & Piutang | Monitoring utang vs piutang, pelunasan cicilan terhubung ke dompet |
| **W-10** | Financial Reports & PDF Export | Pelaporan | Pratinjau lembar cetak A4 resmi bulanan, tombol ekspor Excel mentah |
| **W-11** | App Settings & Cloud Backup | Admin & Vault | Pengaturan branding, Dark/Light mode, backup otomatis Drive, restore PIN ganda |
| **W-12** | Mobile Responsive Dashboard | Antarmuka Ponsel| Layout 375px ponsel satu kolom, Floating Action Button (+), bottom navigation bar |
