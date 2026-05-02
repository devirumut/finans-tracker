// 5. YARDIMCI FONKSİYONLAR VE BİLDİRİMLER
// ==========================================
function getLocalDateString(date) {
    const safeDate = new Date(date);
    safeDate.setMinutes(safeDate.getMinutes() - safeDate.getTimezoneOffset());
    return safeDate.toISOString().split('T')[0];
}

function getDateForSelectedMonthToday() {
    const today = new Date();
    const todayString = getLocalDateString(today);
    const fallbackMonth = todayString.substring(0, 7);
    const selectedMonth = monthFilterEl && monthFilterEl.value ? monthFilterEl.value : fallbackMonth;
    const [year, month] = selectedMonth.split('-').map(Number);

    if (!year || !month) return todayString;

    const todayDay = today.getDate();
    const daysInSelectedMonth = new Date(year, month, 0).getDate();
    const safeDay = Math.min(todayDay, daysInSelectedMonth);

    return `${year}-${String(month).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
}

function setDefaultDate() {
    const today = new Date();
    const todayString = getLocalDateString(today);
    const currentMonthString = todayString.substring(0, 7);

    if (monthFilterEl && !monthFilterEl.value) monthFilterEl.value = currentMonthString;
    if (dateEl && !editingId) dateEl.value = getDateForSelectedMonthToday();

    const docDateEl = document.getElementById('doc-date');
    if (docDateEl) docDateEl.value = todayString;
}

/* ========================================= */
/* 🚨 BİLDİRİM MOTORU KURTARMA YAMASI 🚨 */
/* ========================================= */

let notifyTimeout;
function showNotify(message, icon = 'fa-circle-check') {
    if (!notifyUIEnabled) return; // BİLDİRİMLER KAPALIYSA ÇALIŞMAYI DURDUR
    // Kutuyu site ilk açıldığında değil, bildirim gerektiği an arayıp buluyoruz!
    const bildirimKutusu = document.getElementById('notification');
    
    if (!bildirimKutusu) return;
    
    bildirimKutusu.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`; 
    bildirimKutusu.classList.add('show');
    
    clearTimeout(notifyTimeout); 
    notifyTimeout = setTimeout(() => bildirimKutusu.classList.remove('show'), 3000);
}

// ==========================================
// 6. MENÜ VE SEKME (TAB) SİSTEMİ
// ==========================================
const hamburgerBtn = document.getElementById('hamburger-btn');
const sidebar = document.querySelector('.sidebar');
const mobileOverlay = document.getElementById('mobile-overlay');

if (hamburgerBtn && sidebar && mobileOverlay) {
    hamburgerBtn.addEventListener('click', () => { sidebar.classList.add('mobile-open'); mobileOverlay.classList.add('active'); });
    mobileOverlay.addEventListener('click', () => { sidebar.classList.remove('mobile-open'); mobileOverlay.classList.remove('active'); });
}

// switchMenu fonksiyonu içine documents ekle
function switchMenu(activeMenuBtn, activeViewDiv) {
    [menuDashboard, menuCalendar, menuYearly, menuNotes, menuDocuments, menuSettings, menuTrends].forEach(btn => { if(btn) btn.classList.remove('active'); });
    [dashboardView, calendarView, yearlyView, notesView, documentsView, settingsView, trendsView].forEach(view => { if(view) view.style.display = 'none'; });
    if(activeMenuBtn) activeMenuBtn.classList.add('active');
    if(activeViewDiv) activeViewDiv.style.display = 'flex';

    if (window.innerWidth <= 850 && sidebar && mobileOverlay) {
        sidebar.classList.remove('mobile-open'); mobileOverlay.classList.remove('active');
    }
}

if(menuDashboard) menuDashboard.onclick = (e) => { e.preventDefault(); switchMenu(menuDashboard, dashboardView); };
if(menuCalendar) menuCalendar.onclick = (e) => { e.preventDefault(); switchMenu(menuCalendar, calendarView); renderCalendar(); };
if(menuYearly) menuYearly.onclick = (e) => { e.preventDefault(); switchMenu(menuYearly, yearlyView); initYearlyStatus(); };
if(menuTrends) menuTrends.onclick = (e) => { e.preventDefault(); switchMenu(menuTrends, trendsView); initTrendOptions(); };
if(menuNotes) menuNotes.onclick = (e) => { e.preventDefault(); switchMenu(menuNotes, notesView); initNotes(); };
if(menuDocuments) menuDocuments.onclick = (e) => { e.preventDefault(); switchMenu(menuDocuments, documentsView); initDocuments(); };
if(menuSettings) menuSettings.onclick = (e) => { e.preventDefault(); switchMenu(menuSettings, settingsView); };

const settingsTabs = document.querySelectorAll('.settings-tab-btn');
const settingsContents = document.querySelectorAll('.settings-tab-content');
settingsTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        settingsTabs.forEach(t => t.classList.remove('active'));
        settingsContents.forEach(c => { c.classList.remove('active'); c.style.display = 'none'; });
        tab.classList.add('active');
        const targetContent = document.getElementById(tab.getAttribute('data-tab'));
        if(targetContent) { targetContent.classList.add('active'); targetContent.style.display = 'flex'; }
    });
});

// ==========================================
