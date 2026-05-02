// ==========================================
// 1. AYARLAR VE KÜRESEL DEĞİŞKENLER
// ==========================================
const CLIENT_ID = '443504738907-rnrnore3ebpsf1rfdb4r7c9s37q4sqmd.apps.googleusercontent.com'; 
const SCOPES = 'https://www.googleapis.com/auth/drive.file profile email';

let tokenClient;
let accessToken = null;
let driveFileId = null;
let editingId = null; 
let editingCategoryId = null;
let expenseChartInstance = null; 

// ==========================================
// 2. DOM ELEMENTLERİ
// ==========================================
const balanceEl = document.getElementById('total-balance');
const incomeEl = document.getElementById('total-income');
const expenseEl = document.getElementById('total-expense');
const listEl = document.getElementById('transaction-list');
const formEl = document.getElementById('transaction-form');
const textEl = document.getElementById('text');
const amountEl = document.getElementById('amount');
const categoryEl = document.getElementById('category');
const ctx = document.getElementById('expenseChart');
const themeBtn = document.getElementById('theme-toggle');
const dateEl = document.getElementById('date');
const searchEl = document.getElementById('search');

const monthFilterEl = document.getElementById('month-filter');
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const backupBtn = document.getElementById('backup-btn');
const fetchBtn = document.getElementById('fetch-btn');
const notification = document.getElementById('notification');
const submitBtn = document.getElementById('submit-btn');

const menuDashboard = document.getElementById('menu-dashboard');
const menuCalendar = document.getElementById('menu-calendar'); 
const menuYearly = document.getElementById('menu-yearly');
const menuNotes = document.getElementById('menu-notes');
const menuSettings = document.getElementById('menu-settings');

const dashboardView = document.getElementById('dashboard-view');
const calendarView = document.getElementById('calendar-view'); 
const yearlyView = document.getElementById('yearly-view');
const notesView = document.getElementById('notes-view');
const settingsView = document.getElementById('settings-view');

const menuTrends = document.getElementById('menu-trends');
const trendsView = document.getElementById('trends-view');
const trendCtx = document.getElementById('trendChart');
let trendChartInstance = null;

const subForm = document.getElementById('subscription-form');
const subListEl = document.getElementById('subscription-list');
const tickerEl = document.getElementById('ticker-content');
const catForm = document.getElementById('category-form');
const catListEl = document.getElementById('category-list');
// YENİ PROJEEE/app.js - Dinamik Grafik Butonları (GÜNCELLENDİ)
const chartBtns = document.querySelectorAll('.chart-btn');
let currentChartType = localStorage.getItem('chartType') || 'doughnut';

// ==========================================
