# High-Fidelity UI/UX Design Specification & AI Prompt
## Couple Finance – Family Financial Management System
### Versi 1.3 – Premium Vintage Modern Design System (6 Pillars Edition)

**Target Platform:** Web App Google Apps Script (GAS) & Google Sheets Database  
**Arsitektur Frontend:** Single Page Application (SPA) Responsive — Desktop (1440px), Tablet (768px), Smartphone (375px)  
**Konsep Visual:** *Premium Vintage Modern Dashboard* (Deep Vintage Teal & Warm Ivory)  
**Tujuan Penggunaan:** Prompt Visual Lengkap untuk Google Stitch AI, Midjourney UI, atau Acuan Implementasi Frontend  
**Terakhir Diperbarui:** 23 November 2026  

---

## 1. Identitas Desain & Sistem Token Visual

### 1.1 Filosofi Visual
Antarmuka dirancang dengan pendekatan **Premium Vintage Modern** yang memadukan kehangatan estetika klasik (*Warm Ivory, Deep Vintage Teal, dan Golden Accents*) dengan ketelitian fungsional aplikasi fintech kelas eksekutif modern. Menghilangkan kesan kaku dan dingin, menghadirkan atmosfer finansial keluarga yang harmonis, transparan, dan terpercaya.

### 1.2 Palet Warna & Kode HEX Spesifik

| Token Desain | Peran Visual | Kode HEX | Penerapan Komponen |
| :--- | :--- | :--- | :--- |
| `color-primary` | Deep Vintage Teal | `#0E4D43` | Sidebar navigasi, tombol utama (Primary CTA), header brand |
| `color-primary-hover` | Forest Teal | `#134E48` | Sorotan menu aktif dan efek kursor hover |
| `color-canvas-light` | Warm Ivory | `#FAF7F2` | Latar belakang kanvas utama (Light Mode) |
| `color-card-light` | Pure Warm White | `#FFFFFF` | Permukaan kartu konten dengan border `#E5E0D8` |
| `color-canvas-dark` | Deep Slate Obsidian | `#0F172A` | Latar belakang kanvas utama (Dark Mode) |
| `color-card-dark` | Midnight Slate | `#1E293B` | Permukaan kartu konten (Dark Mode) dengan border `#334155` |
| `color-text-primary` | Deep Slate | `#111827` | Tipografi judul dan nominal utama (Light Mode: `#111827`, Dark Mode: `#F8FAFC`) |
| `color-text-muted` | Neutral Slate | `#64748B` | Label sekunder, keterangan, dan tanggal (Dark Mode: `#94A3B8`) |
| `color-accent-emerald` | Emerald Teal | `#10B981` | Net Worth, pemasukan investasi, indikator tabungan aktif (Badge: `#D1FAE5`) |
| `color-accent-gold` | Golden Glow | `#EAB308` | Milestone perayaan target tabungan 100% tercapai! (Badge: `#FEF9C3`) |
| `color-accent-blue` | Ocean Blue | `#0284C7` | Arus kas masuk, saldo perbankan operasional (Badge: `#E0F2FE`) |
| `color-accent-coral` | Terracotta Coral | `#EA580C` | Pengeluaran kas dan peringatan batas anggaran (Badge: `#FFEDD5`) |
| `color-accent-amber` | Vintage Amber | `#D97706` | Peringatan jatuh tempo tagihan rutin H-3 (Badge: `#FEF3C7`) |
| `color-accent-rose` | Rose Crimson | `#E11D48` | Tagihan terlambat/overdue, tombol hapus data (Badge: `#FFE4E6`) |
| `color-crypto-btc` | Crypto Amber | `#F7931A` | Aset Bitcoin pada diagram alokasi investasi |

### 1.3 Tipografi & Geometri Komponen
- **Font Family:** `Plus Jakarta Sans`, alternatif `Inter` (sans-serif geometris bersih).
- **Hierarki Ukuran:**
  - `Display / KPI`: 28px – 32px (Bold 700)
  - `H1 / Page Title`: 22px – 24px (Bold 700)
  - `H2 / Section Title`: 18px – 20px (Semibold 600)
  - `Body / Values`: 14px (Regular 400 & Medium 500)
  - `Badges & Captions`: 11px – 12px (Medium 500, uppercase letter-spacing: 0.05em)
- **Sudut Lengkung (Corner Radius):**
  - Kartu & Modal: `rounded-2xl` (16px)
  - Tombol Utama: `rounded-xl` (10px)
  - Form Input: `rounded-lg` (8px)
  - Badges & Filter Pills: `rounded-full` (9999px)
- **Elevasi & Bayangan (Box Shadow):**
  - Kartu Standar: `0 2px 8px rgba(14, 77, 67, 0.04)`
  - Kartu Hover / Floating: `0 8px 24px rgba(14, 77, 67, 0.08)` dengan transformasi `translateY(-2px)`

---

## 2. Prompt Lengkap untuk Google Stitch AI (Siap Salin)

Salin seluruh teks di dalam blok kode berikut ke Google Stitch AI:

```text
Design a complete High-Fidelity UI/UX design system for "Couple Finance – Family Financial Management System (Version 1.3)".
Couple Finance is an executive household financial operating system designed for husband and wife with an equal dual-admin model. It seamlessly unifies six core financial pillars: (1) Daily Finance transaction logging (<5s), (2) Monthly Budgeting, (3) Recurring Expenses tracking, (4) Savings Goals & fund allocation (earmarking), (5) Multi-asset Investment Portfolio (Cash, BTC, Stocks, Gold), and (6) Real-time Net Worth calculation with debt/receivables handling.

## Design Identity
- Style: Premium Vintage Modern Dashboard (inspired by luxury fintech aesthetics, linear precision, and warm vintage tones).
- Aesthetic: Rounded-2xl card-based architecture, soft diffused elevation shadows (0 4px 20px rgba(14, 77, 67, 0.05)), organic warm feel, and high-contrast typography.
- Color Palette:
  Primary Sidebar: Deep Vintage Teal #0E4D43 (Hover: #134E48, Active pill: rgba(255,255,255,0.12))
  Light Mode Background: Warm Ivory #FAF7F2 (Card surface: #FFFFFF, Card border: #E5E0D8)
  Dark Mode Background: Deep Slate Obsidian #0F172A (Card surface: #1E293B, Card border: #334155)
  Text Primary: Deep Slate #111827 (Dark mode: #F8FAFC)
  Text Secondary / Muted: Neutral Slate #64748B (Dark mode: #94A3B8)
  Accent Net Worth & Savings Progress: Emerald Teal #10B981 (Soft badge: #D1FAE5 / Text: #065F46)
  Accent Savings Completed Milestone: Golden Glow #EAB308 (Soft badge: #FEF9C3 / Text: #854D0E)
  Accent Cash & Income: Ocean Blue #0284C7 (Soft badge: #E0F2FE / Text: #0369A1)
  Accent Expense & Budget Alert: Terracotta Coral #EA580C (Soft badge: #FFEDD5 / Text: #9A3412)
  Accent Recurring Bills & Due Warning: Amber Gold #D97706 (Soft badge: #FEF3C7 / Text: #92400E)
  Accent Overdue / Danger: Rose Crimson #E11D48 (Soft badge: #FFE4E6 / Text: #9F1239)
  Accent Bitcoin / Crypto: Crypto Amber #F7931A
- Typography: Plus Jakarta Sans / Inter — clean geometric sans-serif with high legibility across mobile and desktop.
  H1/Display: 24px-28px bold (weight: 700), H2/Section: 18px-20px semibold (weight: 600), Body: 14px regular (weight: 400), Captions/Badges: 11px-12px medium (weight: 500).
- Icons: Lucide Icons outline style, 20px on desktop, 18px on mobile, perfectly paired with labels.
- Corner Radius: 16px (rounded-2xl) for cards and modals, 10px (rounded-xl) for primary buttons, 8px (rounded-lg) for form inputs, 9999px (rounded-full) for badges and filter pills.
- Spacing: 8px modular grid system (p-4 = 16px, p-6 = 24px, gap-4 = 16px).

## Application Overview
The interface spans 12 comprehensive screens covering both desktop widescreen and mobile responsive touch layouts:

--- SCREEN 1: PIN AUTHENTICATION & QUICK PROFILE SWITCHER ---
Layout: Centered luxury card (440px width) on Warm Ivory #FAF7F2 with subtle radial gradient.
- Header: Elegant gold/teal emblem logo [Couple Finance], H1 "Welcome Back" in #0E4D43.
- Subtitle: "Choose active family profile and enter 6-digit PIN" in #64748B.
- User Selector Segmented Control: 
  - [ Suami (Husband) - Avatar with Deep Teal border ] (Active state with filled shadow)
  - [ Istri (Wife) - Avatar with Warm Amber border ]
- PIN Display: 6 sleek pill dots with smooth glow animation on filled state (#0E4D43 for Suami, #D97706 for Istri).
- Touch Keypad Grid: 3x4 grid of circular soft ivory buttons (#FFFFFF, border #E5E0D8, active scale 0.95), bold numbers 1-9, 0, and Lucide [Delete] icon.
- Bottom Security Pill: Green shield icon [icon: shield-check] "Protected by 256-bit HMAC & Zero Cloud Cost Storage".
- Secondary Action: Text link "Sign in with Google Workspace Account".

--- SCREEN 2: EXECUTIVE FINANCIAL DASHBOARD (DESKTOP MAIN VIEW) ---
Layout: Full viewport layout with fixed Deep Vintage Teal sidebar (260px) and fluid Warm Ivory content area.
- Fixed Left Sidebar (#0E4D43):
  - Brand header: High-contrast white brand text "Couple Finance" with gold leaf emblem, collapse toggle button [icon: panel-left-close].
  - Current Profile Widget: Mini rounded card (rgba(255,255,255,0.08)) showing Avatar, "Suami (Admin)" with green online indicator dot and quick-switch chevron.
  - Navigation Menu:
    - [icon: layout-dashboard] "Executive Dashboard" (Active: background rgba(255,255,255,0.12), left 3px Emerald bar).
    - [icon: plus-circle] "Quick Entry (+)" (Highlighted with subtle golden badge "Hot").
    - [icon: receipt] "Daily Finance".
    - [icon: calendar-clock] "Recurring Bills" (Badge: Amber "2 Due").
    - [icon: target] "Monthly Budget".
    - [icon: trophy] "Savings Goals" (Badge: "3 Active").
    - [icon: trending-up] "Investment Portfolio".
    - [icon: handshake] "Debts & Receivables".
    - [icon: file-text] "Reports & PDF".
    - [icon: settings] "Settings & Backup".
  - Sidebar Footer: Dark/Light Mode switch [icon: sun/moon] and system status "Google Sheets Connected".
- Top Navigation Header:
  - Instant Search Bar: White input pill (border #E5E0D8) with search icon and keyboard shortcut badge `Ctrl+K`.
  - Global Filter Pills: Segmented toggle with smooth slider:
    [ ● All Family ] [ ○ Pribadi Suami ] [ ○ Pribadi Istri ] [ ○ Rumah Tangga Bersama ]
  - Right items: Notification bell [icon: bell] with red counter badge "2", and quick lock button [icon: lock].
- Smart Urgency Banner (Amber Gold & Coral):
  - Card with soft amber gradient border: [icon: alert-triangle in #D97706] "2 Bills Require Attention: Home WiFi (Due in 2 days - Rp 450.000) & Electricity PLN (Due tomorrow - Est. Rp 800.000)".
  - Action Button: Solid Amber button [Pay Now (1-Click)] with chevron icon.
- Top Metric Cards (4-Column Grid, Rounded-2xl, White Background #FFFFFF):
  - Card 1 (Net Worth): Top label "TOTAL NET WORTH" with mini info tooltip. Huge number "Rp 450.850.000" in bold #111827. Badge: Emerald Teal [ +4.2% MoM ]. Mini sparkline showing positive upward trajectory.
  - Card 2 (Liquid Cash): Label "OPERATIONAL CASH & BANK". Value "Rp 68.200.000". Subtitle "Across 5 Accounts (BCA, Mandiri, Jenius, GoPay, Cash)".
  - Card 3 (Monthly Cash Flow): Split bar design. Income "Rp 32.500.000" in Ocean Blue (#0284C7) vs Expense "Rp 18.345.000" in Terracotta Coral (#EA580C). Net savings rate: "43.5% Saved".
  - Card 4 (Investments): Label "INVESTMENT ASSETS". Value "Rp 395.150.000". Unrealized Profit badge: "+Rp 42.100.000 (+11.9%)".
- Savings Goals Summary Strip (Pilar 4 Highlight Banner):
  - Rounded-2xl card (#FFFFFF, border #E5E0D8) featuring a mini savings progress strip:
    - Left: Icon [trophy] in Emerald circle, Title "Family Savings Goals Earmarks: Rp 48.500.000 Total Allocated".
    - Center: 3 Mini Progress Pills: [ Emergency Fund: 70% ] [ Japan Vacation: 45% ] [ Car Downpayment: 25% ].
    - Right: Button [ View All Goals -> ].
- Interactive Chart Grid (2x2 Modular Layout):
  - Chart 1: "Monthly Cash Flow Comparison" — Dual bar chart (Ocean Blue for Income, Terracotta Coral for Expense) with month filters (Jan - Nov).
  - Chart 2: "Net Worth Growth Trajectory" — Smooth gradient-filled line chart with Emerald Teal line showing 6-month growth from Rp 390M to Rp 450M.
  - Chart 3: "Asset Allocation Breakdown" — Premium Donut Chart with center label: BTC (25% #F7931A), Stocks (38% #0E4D43), Gold (22% #D97706), Cash (15% #0284C7).
  - Chart 4: "Expense Category Distribution" — Horizontal rounded bar chart ranking top expenses: Groceries & Food, Utilities & WiFi, Housing & Maintenance, Transport, Personal.
- Recent Transactions Feed:
  - Clean table with subtle zebra hover (#FAF7F2). Columns: Date, Recorder badge (Suami in Deep Teal / Istri in Amber), Entity badge (Joint / Personal), Category with Lucide icon, Account, Amount (Red for expense, Green for income), and Receipt thumbnail.

--- SCREEN 3: QUICK ENTRY TRANSACTION MODAL (<5s FAST FORM) ---
Layout: Centered popup modal (520px width) with backdrop blur (rgba(14, 77, 67, 0.4)).
- Header: Bold title "Record Transaction" with quick close button [X].
- 6-Action Quick Tabs:
  [ (●) Expense ] [ (○) Income ] [ (○) Transfer ] [ (○) Buy Asset ] [ (○) Pay Bill ] [ (○) Save Goal ]
- Big Currency Input Display:
  - Massive input box with light ivory fill: "Rp [ 150.000 ]" with automatic formatting and clear button.
- Form Grid:
  - Row 1: Date & Time picker (pre-filled with current moment) + Recorder toggle [ ● Suami ] [ ○ Istri ].
  - Row 2: Expense Entity pills [ ● Rumah Tangga Bersama ] [ ○ Pribadi Suami ] [ ○ Pribadi Istri ].
  - Row 3: Category dropdown with icon [ Food & Dining v ] + Source Wallet dropdown [ BCA Payroll v ].
  - Row 4 (Conditional for Transfer/Save Goal): Target Goal dropdown [ e.g. Family Emergency Fund v ].
  - Row 5: Notes input "e.g. Weekly family supermarket trip".
  - Row 6: Receipt Photo Dropzone with camera icon [ Upload Receipt / Snapshot (Auto-compressed <300KB) ].
- Footer Action Buttons:
  - [ Secondary Ghost: Cancel ]
  - [ Primary Solid #0E4D43: Save Transaction (<1s) ] with lightning icon.

--- SCREEN 4: DAILY FINANCE & TRANSACTION LEDGER ---
Layout: Full-page ledger view with sticky filter header and rich data table.
- Filter Action Header:
  - Search box with instant debounce typing.
  - Date preset buttons: [ Today ] [ This Week ] [ (●) This Month ] [ Custom Range ].
  - Dropdown filters for Category, Wallet, Recorder, and Entity.
  - Export Button: Outlined [ Export Excel (.xlsx) ] with green Excel icon + Primary [+ Add Record].
- Data Table:
  - Header: Uppercase 11px font in #64748B, subtle border-b #E5E0D8.
  - Status Indicators: Emerald badge for Income, Terracotta badge for Expense, Blue badge for Transfer, Golden badge for Savings Deposit.
  - Receipt preview thumbnail: Clickable lightbox icon.
  - Actions column: [icon: edit-3] and [icon: trash-2] with confirmation tooltip.
  - Bottom Pagination Bar: Showing 1-25 of 142 records, elegant pill pagination [ < Prev ] 1 [2] 3 4 [ Next > ].

--- SCREEN 5: MONTHLY BUDGETING & ANTI-LEAK TRACKER ---
Layout: Visual budgeting dashboard with high-impact progress indicators.
- Top Header: "Monthly Budget – November 2026" with Month Selector [ < November 2026 > ] and [ Button: Copy Previous Month Budget ].
- 3 Summary Indicator Cards:
  - Card 1: Total Allocated "Rp 20.000.000".
  - Card 2: Spent So Far "Rp 14.250.000" (71.25%).
  - Card 3: Safe Remaining "Rp 5.750.000".
- Master Visual Progress Bar: Segmented bar with threshold flags (75% Warning, 90% Danger).
- Category Budget Cards Grid (2 Columns, Rounded-2xl #FFFFFF, border #E5E0D8):
  - Card Item 1: Icon [Utensils] "Food & Dining" | Budget: Rp 5.000.000 | Spent: Rp 3.200.000 | Remaining: Rp 1.800.000 | Progress: 64% in Emerald Green | Badge: [ Normal ].
  - Card Item 2: Icon [Zap] "Utilities & WiFi" | Budget: Rp 3.000.000 | Spent: Rp 2.750.000 | Remaining: Rp 250.000 | Progress: 91.6% in Amber Gold | Badge: [ Warning ].
  - Card Item 3: Icon [Shopping-Bag] "Lifestyle & Shopping" | Budget: Rp 2.000.000 | Spent: Rp 2.150.000 | Overspent: -Rp 150.000 | Progress: 107.5% in Rose Crimson | Badge: [ Overbudget Alert ].

--- SCREEN 6: RECURRING EXPENSES & MONTHLY BILLS MANAGER ---
Layout: Dedicated recurring bills manager with smart due dates and 1-click payment confirmation.
- Top Header: "Recurring Bills & Obligations" with [+ New Recurring Bill] button.
- Monthly Fulfillment Bar:
  - 3 Stat Badges: "Total Monthly: Rp 4.250.000" | "Paid: Rp 2.800.000 (4 Bills)" | "Unpaid: Rp 1.450.000 (2 Bills)".
- Bill Cards Grid (3 Columns of Rounded-2xl Cards):
  - Card 1 (Due in 2 Days):
    - Top: Icon [Wifi] in Deep Teal circle, Title "IndiHome 100Mbps", Entity badge [Rumah Tangga].
    - Amount: "Rp 450.000 / month" (Fixed).
    - Due Date: "5th of every month (Due in 2 Days)" highlighted in Amber Gold.
    - Status Badge: [ Menunggu Pembayaran ].
    - Action: Full-width Solid Amber Button [ Quick Pay (Rp 450.000) ].
  - Card 2 (Due Tomorrow):
    - Top: Icon [Zap] in Amber circle, Title "PLN Postpaid Electricity", Entity badge [Rumah Tangga].
    - Amount: "Est. Rp 800.000 / month" (Variable).
    - Due Date: "20th of every month (Due Tomorrow)" highlighted in Amber Gold.
    - Status Badge: [ Menunggu Pembayaran ].
    - Action: Full-width Solid Amber Button [ Enter Amount & Pay ].
  - Card 3 (Paid):
    - Top: Icon [Tv] in Emerald circle, Title "Netflix 4K Premium", Entity badge [Bersama].
    - Amount: "Rp 186.000 / month" (Fixed).
    - Status Badge: [ Sudah Dibayar (15 Nov) ] in Emerald Teal.
    - Action: Outlined disabled button [ Paid with BCA ].
- 1-Click Pay Confirmation Modal Overlay:
  - Shows Bill Name, editable actual amount for variable bills, payment date, wallet selector dropdown, and warning "Atomically deducts wallet and logs expense with zero double-counting guarantee".

--- SCREEN 7: SAVINGS GOALS & FUND ALLOCATION MANAGER (NEW SCREEN) ---
Layout: Dedicated goals dashboard balancing dreams, emergency preparedness, and earmarked cash.
- Top Header: "Family Savings Goals & Dedicated Earmarks" with button [+ Create New Goal].
- Top Allocation Metric Cards (4 Cards, Rounded-2xl #FFFFFF):
  - Card 1: Total Allocated Savings "Rp 48.500.000" (Safely earmarked inside bank accounts).
  - Card 2: Active Goals "3 Goals in Progress".
  - Card 3: Near Completion (>80%) "1 Goal (Emergency Fund)".
  - Card 4: Completed Goals "2 Goals Achieved" (with gold star badge).
- Scope Filter Tabs:
  [ All Goals (5) ] [ (●) Tabungan Bersama (3) ] [ Pribadi Suami (1) ] [ Pribadi Istri (1) ] [ Archived (2) ]
- Goal Cards Grid (3 Columns of Rounded-2xl Cards):
  - Goal Card 1: "Family Emergency Fund (6 Months)"
    - Category Icon [Shield-Alert] in Emerald Teal circle.
    - Entity Badge: Deep Teal [ Tabungan Bersama ].
    - Progress Ring & Bar: 70% filled in Emerald Teal (#10B981).
    - Amount Metrics: "Terkumpul Rp 35.000.000 / Target Rp 50.000.000 (Sisa Rp 15.000.000)".
    - Smart Prediction Pill: "Est. completion in 6 months (May 2027) based on Rp 2.5M/mo deposit".
    - Stored At: "Jenius Save It (BTPN)".
    - Action Buttons: [ Primary Solid #0E4D43: + Setor Dana ] and [ Outlined: - Tarik Dana ].
  - Goal Card 2: "Japan Family Winter Vacation"
    - Category Icon [Plane] in Ocean Blue circle.
    - Entity Badge: Deep Teal [ Tabungan Bersama ].
    - Progress Bar: 45% filled in Ocean Blue (#0284C7).
    - Amount Metrics: "Terkumpul Rp 13.500.000 / Target Rp 30.000.000 (Sisa Rp 16.500.000)".
    - Target Date: "Target: December 2027".
    - Action Buttons: [ + Setor Dana ] and [ - Tarik Dana ].
  - Goal Card 3: "New Laptop for Husband"
    - Category Icon [Laptop] in Amber circle.
    - Entity Badge: Ocean Blue [ Pribadi Suami ].
    - Progress Bar: 85% filled in Golden Glow (#EAB308) with pulsing badge [ Near Target! ].
    - Amount Metrics: "Terkumpul Rp 17.000.000 / Target Rp 20.000.000 (Sisa Rp 3.000.000)".
    - Action Buttons: [ + Setor Dana ] and [ - Tarik Dana ].
- Modal Overlay 1: "Deposit Funds to Savings Goal"
  - Modal Title: "Deposit Funds — [Family Emergency Fund]"
  - Input: Deposit Amount [ Rp 2.500.000 ] with thousands separator.
  - Source Wallet Dropdown: [ BCA Main Account (Balance: Rp 24.500.000) v ].
  - Deposit Date: [ 2026-11-23 ].
  - Notes: "Regular monthly allocation for emergency buffer".
  - Anti-Double Counting Notice Pill (Green): [icon: info] "This action earmarks internal funds. It does not count as a consumptive expense and does not inflate Net Worth."
  - Action Buttons: [ Cancel ] | [ Confirm Deposit ].
- Modal Overlay 2: "Withdraw Funds from Savings Goal"
  - Modal Title: "Withdraw Funds — [Japan Vacation]"
  - Input: Withdrawal Amount [ Rp 2.000.000 ] (Max Available: Rp 13.500.000).
  - Destination Wallet Dropdown: [ BCA Main Account v ].
  - Reason: "Early booking for bullet train tickets".
  - Action Buttons: [ Cancel ] | [ Confirm Withdrawal ].

--- SCREEN 8: INVESTMENT PORTFOLIO & MULTI-ASSET TRACKER ---
Layout: Multi-asset valuation table with asset allocation cards and manual price refresh modal.
- Header: "Investment Portfolio & Wealth Assets" with buttons [+ Buy / Log Asset] and [ Update Market Prices ].
- Top Performance Banner:
  - Invested Capital: "Rp 353.050.000" | Market Value: "Rp 395.150.000" | Total Profit: "+Rp 42.100.000 (+11.92%)" in bright Emerald Teal.
- Asset Category Tabs:
  [ All Assets (7) ] [ (●) Bitcoin (1) ] [ Stocks (3) ] [ Gold (2) ] [ Money Market Cash (1) ]
- Holdings Data Table:
  - Columns: Asset & Ticker | Category | Owner | Total Units | Avg Buy Price | Current Market Price | Total Market Value | Unrealized PnL | Last Price Update | Actions.
  - Rows with custom logos:
    - Bitcoin: 0.25 BTC | Avg: Rp 950.000.000 | Current: Rp 1.450.000.000 | Value: Rp 362.500.000 | PnL: +Rp 125.000.000 (+52.6%) | Updated: Today.
    - BBCA (Bank Central Asia): 25 Lots | Avg: Rp 9.200 | Current: Rp 10.150 | Value: Rp 25.375.000 | PnL: +Rp 2.375.000 (+10.3%) | Updated: Yesterday.
    - Antam Pure Gold: 25 Grams | Avg: Rp 1.250.000 | Current: Rp 1.420.000 | Value: Rp 35.500.000 | PnL: +Rp 4.250.000 (+13.6%) | Updated: 3 days ago.
- Action Buttons per row: [ Buy More ] [ Sell ] [ Quick Update Price ].

--- SCREEN 9: DEBTS & RECEIVABLES (UTANG & PIUTANG) ---
Layout: Clean split view balancing liabilities against receivables to ensure 100% accurate Net Worth.
- Summary Cards:
  - Card 1 (Liabilities): Total Debts "Rp 15.000.000" (Red deduction badge).
  - Card 2 (Receivables): Total Money Lent Out "Rp 8.000.000" (Green asset badge).
- Two Navigation Tabs: [ (●) Family Debts & Mortgages ] | [ Active Receivables ].
- Progress Card List:
  - Item 1: "Car Loan Installment" | Total: Rp 60.000.000 | Paid: Rp 45.000.000 | Remaining: Rp 15.000.000 | Due: 28th monthly | [ Button: Pay Installment ].
  - Item 2: "Lent to Brother (Emergency)" | Total: Rp 8.000.000 | Paid: Rp 0 | Due: Dec 2026 | [ Button: Record Repayment ].

--- SCREEN 10: FINANCIAL REPORTS & OFFICIAL PDF EXPORT ---
Layout: Document configuration on left and high-resolution A4 preview sheet on right.
- Left Controls:
  - Period selection: Month (November) & Year (2026).
  - Filter: All Family / Husband / Wife / Joint.
  - Format buttons: [ Export Raw Excel (.xlsx) ] and [ Download Official PDF ].
- Right A4 Preview Sheet (Shadowed White Paper Frame):
  - Formal Title: "COUPLE FINANCE – OFFICIAL MONTHLY FINANCIAL STATEMENT".
  - Family Header with Date Generated and Document ID.
  - Executive Financial Summary Grid (Income, Expense, Net Savings, Ending Cash).
  - Savings Goals Progress Summary (Total Earmarked Funds & Goals Met).
  - Recurring Bills Fulfillment Table (100% On-Time Badge).
  - Net Worth Balance Sheet (Assets Breakdown - Liabilities = Total Net Worth).
  - Dual Signature Blocks for Suami and Istri with digital verification seals.

--- SCREEN 11: APPLICATION SETTINGS & BACKUP RECOVERY CENTER ---
Layout: Two-column settings view with branding customization and cloud sync controls.
- Left Column (Branding & Personalization):
  - Application Title Input: "Couple Finance – Family Financial Management".
  - Custom Family Logo Upload with circular preview.
  - Theme Selector: Radio cards with live preview for [ Light Mode (Warm Ivory) ] and [ Dark Mode (Deep Slate) ].
  - Color Palette Customizer: Picker for Primary Deep Teal and Card Accents.
  - Profile PIN Settings: [ Change Suami PIN ] | [ Change Istri PIN ].
- Right Column (Cloud Drive Database & Disaster Recovery):
  - Connected Google Sheets Database ID with direct link [ Open Google Sheets ].
  - Dedicated Google Drive Folders: `CoupleFinance_Uploads/` and `CoupleFinance_Backups/`.
  - Automated Backup Schedule: Dropdown [ Every 7 Days ] with status "Last Backup: Today at 02:00 AM (Status: Healthy)".
  - Action Buttons:
    - [ Primary Solid #0E4D43: Backup Database Now ]
    - [ Danger Outlined #E11D48: Restore from Backup ] (Requires double-PIN approval).

--- SCREEN 12: MOBILE RESPONSIVE DASHBOARD (SMARTPHONE VIEW - 375px) ---
Layout: Mobile-first single-column vertical layout with bottom thumb navigation and sticky top bar.
- Top Sticky Header:
  - Left: Hamburger drawer icon [icon: menu].
  - Center: "Couple Finance" brand in bold #0E4D43.
  - Right: Active User Avatar badge [Suami ▾] with tap-to-switch popup.
- Horizontal Scrolling Filter Chips:
  [ (●) All Family ] [ Suami ] [ Istri ] [ Joint ]
- Swipeable Top KPI Cards:
  - Net Worth Card: "Rp 450.850.000" (+4.2%) in Emerald Teal.
  - Cash Card: "Rp 68.200.000" in Ocean Blue.
  - Earmarked Savings Card: "Rp 48.500.000" in Golden Glow.
- Urgent Bill Notification Card:
  - Compact amber alert box: "2 Bills Due: WiFi & Electricity" -> [Pay Now].
- Savings Goal Mini-Card:
  - "Emergency Fund: 70% reached (Rp 35M / Rp 50M) -> [+ Setor]".
- Floating Action Button (FAB):
  - Prominent circular floating button (56px) at bottom-right in Deep Vintage Teal #0E4D43 with plus (+) icon, accessible with thumb for instant transaction entry in <5 seconds.
- Sticky Bottom Navigation Bar (Height 64px, White background, border-t #E5E0D8):
  - [icon: home] Dashboard (Active Teal)
  - [icon: receipt] Transaksi
  - [icon: trophy] Tabungan (Active badge)
  - [icon: calendar-clock] Tagihan (Red dot alert)
  - [icon: trending-up] Investasi

## Global Design Requirements
- Fully responsive layout: Seamless adaptation between Desktop widescreen (1440px), Tablet (768px), and Smartphone (375px).
- Skeleton loading states with subtle warm shimmer animation for all metric cards, charts, and data tables.
- Interactive Toast Notifications:
  - Success (Emerald Green #10B981): "Savings deposit recorded & allocation updated".
  - Warning (Amber Gold #D97706): "Electricity bill is due tomorrow".
  - Error (Rose Crimson #E11D48): "Insufficient wallet balance for this transaction".
- Empty States: Friendly minimal illustration + supportive message + prominent CTA button (e.g. "No savings goals created yet — [Create Your First Goal]").
- Hover & Active States: Interactive cards elevate by -2px with soft box-shadow (0 8px 24px rgba(14, 77, 67, 0.08)).
- Focus States: Accessible 2px Deep Teal focus outline ring for all form fields and action buttons.
- The Overall Feel: Warm, prestigious, clutter-free, highly trustworthy, and empowering for a couple managing their shared wealth together.
```

---

## 3. Matriks 12 Layar UI/UX High-Fidelity

| No | ID Layar | Modul / Fitur | Elemen Kunci & Interaksi |
| :---: | :---: | :--- | :--- |
| 1 | **Screen 1** | PIN Auth & Quick Profile Switcher | Keypad 3x4, toggle Suami/Istri, proteksi HMAC SHA-256 |
| 2 | **Screen 2** | Executive Dashboard (Desktop) | 4 KPI Cards, Banner Tagihan H-3, Strip Alokasi Tabungan, 4 Grafik |
| 3 | **Screen 3** | Quick Entry Modal (<5s) | Form 6 tab cepat (+ Setor Tabungan), input nominal besar, upload struk |
| 4 | **Screen 4** | Daily Finance & Ledger | Tabel transaksi interaktif, filter multi-dimensi, ekspor Excel |
| 5 | **Screen 5** | Monthly Budgeting Control | Pagu belanja, progress bar 3 warna (aman/waspada/overbudget), salin anggaran |
| 6 | **Screen 6** | Recurring Bills Manager | Kartu tagihan rutin, status jatuh tempo, modal konfirmasi bayar 1-klik |
| 7 | **Screen 7** | **Savings Goals Manager** *(BARU)* | **Kartu target tabungan, progress bar emas, estimasi tanggal, modal setor/tarik** |
| 8 | **Screen 8** | Investment Portfolio Tracker | Portofolio Cash/BTC/Saham/Emas, kalkulasi PnL, modal update harga pasar |
| 9 | **Screen 9** | Debts & Receivables Tracker | Kartu liabilitas utang vs piutang, pelunasan cicilan terhubung ke dompet |
| 10 | **Screen 10**| Financial Reports & PDF Export | Pratinjau lembar A4 laporan resmi bulanan, tombol ekspor Excel dan cetak PDF |
| 11 | **Screen 11**| Settings & Cloud Backup Vault | Konfigurasi branding, Dark/Light mode, trigger backup Drive, restore PIN ganda |
| 12 | **Screen 12**| Mobile Responsive View (375px)| Antarmuka ponsel satu kolom, Floating Action Button (+), bottom navigation bar |
