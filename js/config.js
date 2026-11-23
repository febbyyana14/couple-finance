/**
 * =====================================================================================
 * COUPLE FINANCE – FRONTEND CONFIGURATION
 * File: js/config.js (Berdasarkan panduan gas-pro-api & gas-rahasia-script-properties)
 * =====================================================================================
 * File konfigurasi satu pintu untuk URL Backend Google Apps Script (GAS).
 * User dapat memasukkan GAS_URL langsung di sini atau lewat UI Pengaturan aplikasi.
 * =====================================================================================
 */

const CONFIG = {
  APP_NAME: 'Couple Finance',
  APP_TAGLINE: 'Family Financial Management System',
  VERSION: '1.3.0',

  // Masukkan URL Deployment Web App Google Apps Script Anda (akhiran /exec)
  // Contoh: 'https://script.google.com/macros/s/AKfycbx.../exec'
  DEFAULT_GAS_URL: 'https://script.google.com/macros/s/AKfycbwQayLJFQK9DpNATohjl7JQWlw4IzdAor2Ms8bEsdSfTExqzFpGgDPKWJwRQ6ifjiwoaQ/exec',

  // Fungsi dinamis mengambil GAS URL dari localStorage jika user mengubahnya lewat modal pengaturan
  get GAS_URL() {
    return localStorage.getItem('CF_GAS_URL') || this.DEFAULT_GAS_URL;
  },

  set GAS_URL(url) {
    if (url) localStorage.setItem('CF_GAS_URL', url.trim());
    else localStorage.removeItem('CF_GAS_URL');
  },

  // Token & Kunci Sesi
  SESSION_STORAGE_KEY: 'CF_SESSION_TOKEN',
  ACTIVE_USER_KEY: 'CF_ACTIVE_USER',
  THEME_STORAGE_KEY: 'CF_THEME_MODE',
  DATA_CACHE_KEY: 'CF_BOOT_DATA_CACHE',

  // Identitas Warna & Styling Token
  COLORS: {
    primaryTeal: '#0E4D43',
    primaryHover: '#134E48',
    warmIvory: '#FAF7F2',
    pureWhite: '#FFFFFF',
    darkCanvas: '#0F172A',
    darkCard: '#1E293B',
    emerald: '#10B981',
    goldMilestone: '#EAB308',
    oceanBlue: '#0284C7',
    coral: '#EA580C',
    amber: '#D97706',
    rose: '#E11D48',
    cryptoBtc: '#F7931A'
  }
};
