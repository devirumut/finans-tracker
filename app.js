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

// FİLTRE VE BUTONLAR
const monthFilterEl = document.getElementById('month-filter');
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const backupBtn = document.getElementById('backup-btn');
const fetchBtn = document.getElementById('fetch-btn');
const notification = document.getElementById('notification');
const submitBtn = document.getElementById('submit-btn');

// 4'LÜ MENÜ VE EKRAN ELEMENTLERİ
const menuDashboard = document.getElementById('menu-dashboard');
const menuYearly = document.getElementById('menu-yearly');
const menuNotes = document.getElementById('menu-notes');
const menuSettings = document.getElementById('menu-settings');

const dashboardView = document.getElementById('dashboard-view');
const yearlyView = document.getElementById('yearly-view');
const notesView = document.getElementById('notes-view');
const settingsView = document.getElementById('settings-view');

// ABONELİK VE KATEGORİ ELEMENTLERİ
const subForm = document.getElementById('subscription-form');
const subListEl = document.getElementById('subscription-list');
const tickerEl = document.getElementById('ticker-content');
const catForm = document.getElementById('category-form');
const catListEl = document.getElementById('category-list');

// ==========================================
// 3. VERİ DEPOLARI VE VARSAYILANLAR
// ==========================================
let expenseChartInstance = null; 
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let subscriptions = JSON.parse(localStorage.getItem('subscriptions')) || [];
let notes = JSON.parse(localStorage.getItem('notes')) || [];

const defaultCategories = [
    { id: 1, name: "Maaş 💰", type: "income", keywords: ["maaş", "avans", "prim", "harçlık", "burs", "ikramiye"] },
    { id: 2, name: "Market 🛒", type: "expense", keywords: ["market", "bakkal", "manav", "kasap", "migros", "şok", "bim", "a101", "carrefour"] },
    { id: 3, name: "Faturalar ⚡", type: "expense", keywords: ["fatura", "elektrik", "su", "doğalgaz", "internet", "telefon", "turkcell", "vodafone", "enerji"] },
    { id: 4, name: "Kira 🏠", type: "expense", keywords: ["kira", "aidat"] },
    { id: 5, name: "Diğer 📦", type: "expense", keywords: [] }
];
let userCategories = JSON.parse(localStorage.getItem('userCategories')) || defaultCategories;

let currentCurrency = localStorage.getItem('currency') || '₺';
let currentColorTheme = localStorage.getItem('colorTheme') || 'default';

// ==========================================
// 4. GENEL AYARLAR (TEMA VE PARA BİRİMİ)
// ==========================================
function applyGeneralSettings() {
    document.body.classList.remove('theme-green', 'theme-purple', 'theme-orange');
    if(currentColorTheme !== 'default') document.body.classList.add(currentColorTheme);
    
    document.querySelectorAll('#currency-selector .circle-btn').forEach(btn => {
        if(btn.getAttribute('data-value') === currentCurrency) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    document.querySelectorAll('#theme-selector .theme-color-btn').forEach(btn => {
        if(btn.getAttribute('data-value') === currentColorTheme) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    if(amountEl) amountEl.placeholder = `Tutar (${currentCurrency})`;
}

document.querySelectorAll('#currency-selector .circle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentCurrency = e.target.closest('.circle-btn').getAttribute('data-value');
        localStorage.setItem('currency', currentCurrency);
        applyGeneralSettings(); init(); if(document.getElementById('tab-yearly') && document.getElementById('tab-yearly').classList.contains('active')) { initYearlyStatus(); }
        showNotify(`Para birimi ${currentCurrency} yapıldı`, "fa-coins");
    });
});

document.querySelectorAll('#theme-selector .theme-color-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentColorTheme = e.target.closest('.theme-color-btn').getAttribute('data-value');
        localStorage.setItem('colorTheme', currentColorTheme);
        applyGeneralSettings(); showNotify("Tema güncellendi", "fa-palette");
    });
});

if(themeBtn) { 
    themeBtn.onclick = () => { 
        document.body.classList.toggle('dark-mode'); 
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); 
    }; 
}
if(localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');

// ==========================================
// 5. YARDIMCI FONKSİYONLAR VE BİLDİRİMLER
// ==========================================
function setDefaultDate() {
    const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    const dateString = today.toISOString().split('T')[0]; const monthString = dateString.substring(0, 7);
    if (dateEl) dateEl.value = dateString; if (monthFilterEl && !monthFilterEl.value) monthFilterEl.value = monthString;
}

let notifyTimeout;
function showNotify(message, icon = 'fa-circle-check') {
    if (!notification) return;
    notification.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`; notification.classList.add('show');
    clearTimeout(notifyTimeout); notifyTimeout = setTimeout(() => notification.classList.remove('show'), 3000);
}

// ==========================================
// 6. MENÜ VE SEKME (TAB) SİSTEMİ + MOBİL HAMBURGER
// ==========================================

// Hamburger Menü Tanımları
const hamburgerBtn = document.getElementById('hamburger-btn');
const sidebar = document.querySelector('.sidebar');
const mobileOverlay = document.getElementById('mobile-overlay');

// Menü Açma Kapatma Olayları
if (hamburgerBtn && sidebar && mobileOverlay) {
    hamburgerBtn.addEventListener('click', () => {
        sidebar.classList.add('mobile-open');
        mobileOverlay.classList.add('active');
    });

    mobileOverlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        mobileOverlay.classList.remove('active');
    });
}

// Menü geçişlerinde mobil menünün kapandığından emin olan parça:
function switchMenu(activeMenuBtn, activeViewDiv) {
    [menuDashboard, menuYearly, menuNotes, menuSettings].forEach(btn => { if(btn) btn.classList.remove('active'); });
    [dashboardView, yearlyView, notesView, settingsView].forEach(view => { if(view) view.style.display = 'none'; });
    
    if(activeMenuBtn) activeMenuBtn.classList.add('active');
    if(activeViewDiv) activeViewDiv.style.display = 'flex';

    // Menü tıklandığında mobilde sidebar'ı ve karartmayı kapat
    const sidebar = document.querySelector('.sidebar');
    const mobileOverlay = document.getElementById('mobile-overlay');
    if (window.innerWidth <= 850 && sidebar && mobileOverlay) {
        sidebar.classList.remove('mobile-open');
        mobileOverlay.classList.remove('active');
    }
}

if(menuDashboard) menuDashboard.onclick = (e) => { e.preventDefault(); switchMenu(menuDashboard, dashboardView); };
if(menuYearly) menuYearly.onclick = (e) => { e.preventDefault(); switchMenu(menuYearly, yearlyView); initYearlyStatus(); };
if(menuNotes) menuNotes.onclick = (e) => { e.preventDefault(); switchMenu(menuNotes, notesView); initNotes(); };
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
// 7. GOOGLE DRİVE VE GİRİŞ SİSTEMİ
// ==========================================
async function fetchUserProfile() {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { 'Authorization': `Bearer ${accessToken}` } });
        const user = await response.json();
        document.getElementById('user-photo').src = user.picture; document.getElementById('user-name').innerText = user.name;
        document.getElementById('login-container').style.display = 'none'; document.getElementById('user-profile').style.display = 'flex';
        showNotify(`Hoş geldin, ${user.given_name}!`, 'fa-face-smile');
    } catch (error) { console.error("Profil alınamadı:", error); }
}

window.onload = function () {
    if (typeof google === 'undefined') return; 
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID, scope: SCOPES,
        callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
                accessToken = tokenResponse.access_token; await fetchUserProfile(); await syncFromDrive();
            }
        },
    });
};

if (loginBtn) loginBtn.onclick = () => { if(tokenClient) tokenClient.requestAccessToken({prompt: 'consent'}); };

let logoutTimeout;
if (logoutBtn) {
    logoutBtn.onclick = () => {
        const modal = document.getElementById('logout-modal'); const timerBar = document.getElementById('logout-timer-bar');
        if (modal) modal.style.display = 'flex';
        if (timerBar) { timerBar.style.transition = 'none'; timerBar.style.width = '0%'; setTimeout(() => { timerBar.style.transition = 'width 5s linear'; timerBar.style.width = '100%'; }, 50); }
        clearTimeout(logoutTimeout); logoutTimeout = setTimeout(() => { autoBackupAndLogout(); }, 5000);
    };
}

const logoutYesBtn = document.getElementById('logout-yes');
if (logoutYesBtn) {
    logoutYesBtn.onclick = async () => {
        clearTimeout(logoutTimeout); const timerBar = document.getElementById('logout-timer-bar'); if (timerBar) timerBar.style.transition = 'none';
        logoutYesBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Yedekleniyor...'; logoutYesBtn.style.opacity = '0.7'; logoutYesBtn.style.pointerEvents = 'none'; 
        await autoBackupAndLogout();
        setTimeout(() => { logoutYesBtn.innerHTML = 'Evet (Yedekle ve Çık)'; logoutYesBtn.style.opacity = '1'; logoutYesBtn.style.pointerEvents = 'auto'; }, 500);
    };
}
const logoutNoBtn = document.getElementById('logout-no');
if (logoutNoBtn) { logoutNoBtn.onclick = () => { clearTimeout(logoutTimeout); completeLogout(); }; }

async function autoBackupAndLogout() { if(accessToken) { showNotify("Veriler Drive'a aktarılıyor...", "fa-cloud-arrow-up"); await backupToDrive(true); } completeLogout(); }

function completeLogout() {
    accessToken = null; const modal = document.getElementById('logout-modal'); if (modal) modal.style.display = 'none';
    document.getElementById('login-container').style.display = 'block'; document.getElementById('user-profile').style.display = 'none';
    showNotify("Güvenli çıkış yapıldı", "fa-right-from-bracket");
}

if (fetchBtn) fetchBtn.onclick = async () => { if (!accessToken) { showNotify("Lütfen önce Google ile giriş yapın!", "fa-triangle-exclamation"); return; } if (confirm("Drive'daki verileriniz indirilecek. Kaydedilmemiş işlemleriniz silinebilir. Emin misiniz?")) { showNotify("Drive'dan indiriliyor...", "fa-spinner fa-spin"); await syncFromDrive(); } };
if (backupBtn) backupBtn.onclick = async () => { if (!accessToken) { showNotify("Lütfen önce Google ile giriş yapın!", "fa-triangle-exclamation"); return; } await backupToDrive(false); };

async function backupToDrive(isSilent = false) {
    if(!isSilent) showNotify("Yedekleniyor...", "fa-spinner fa-spin");
    const backupData = { 
        transactions: transactions, subscriptions: subscriptions, userCategories: userCategories, notes: notes,
        settings: { currency: currentCurrency, theme: currentColorTheme } 
    };
    const fileContent = JSON.stringify(backupData);
    const metadata = { name: 'finans_yedek.json', mimeType: 'application/json' };
    let url = driveFileId ? `https://www.googleapis.com/upload/drive/v3/files/${driveFileId}?uploadType=multipart` : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    const boundary = '-------314159265358979323846';
    const body = "\r\n--" + boundary + "\r\nContent-Type: application/json\r\n\r\n" + JSON.stringify(metadata) + "\r\n--" + boundary + "\r\nContent-Type: application/json\r\n\r\n" + fileContent + "\r\n--" + boundary + "--";

    try {
        const res = await fetch(url, { method: driveFileId ? 'PATCH' : 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': `multipart/related; boundary=${boundary}` }, body: body });
        const data = await res.json(); if (!driveFileId) driveFileId = data.id;
        if(!isSilent) showNotify("Drive'a Yedeklendi!", "fa-cloud-arrow-up");
    } catch (e) { showNotify("Yedekleme Hatası!", "fa-circle-xmark"); }
}

async function syncFromDrive() {
    try {
        const res = await fetch('https://www.googleapis.com/drive/v3/files?q=name="finans_yedek.json" and trashed=false', { headers: { 'Authorization': `Bearer ${accessToken}` } });
        const data = await res.json();
        if (data.files && data.files.length > 0) {
            driveFileId = data.files[0].id;
            const file = await fetch(`https://www.googleapis.com/drive/v3/files/${driveFileId}?alt=media`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
            const parsedData = await file.json();
            
            if (Array.isArray(parsedData)) { transactions = parsedData; subscriptions = []; userCategories = defaultCategories; notes = []; } 
            else { 
                transactions = parsedData.transactions || []; subscriptions = parsedData.subscriptions || [];
                userCategories = parsedData.userCategories || defaultCategories; notes = parsedData.notes || [];
                if(parsedData.settings) { currentCurrency = parsedData.settings.currency || '₺'; currentColorTheme = parsedData.settings.theme || 'default'; }
            }
            
            localStorage.setItem('transactions', JSON.stringify(transactions)); localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
            localStorage.setItem('userCategories', JSON.stringify(userCategories)); localStorage.setItem('notes', JSON.stringify(notes));
            localStorage.setItem('currency', currentCurrency); localStorage.setItem('colorTheme', currentColorTheme); 
            
            applyGeneralSettings(); init(); initSubscriptions(); initCategories(); initYearlyStatus(); initNotes();
            showNotify("Veriler başarıyla indirildi!", "fa-cloud-arrow-down");
        } else { showNotify("Bulutta yedek bulunamadı.", "fa-circle-info"); }
    } catch (e) { showNotify("İndirme Hatası!", "fa-circle-xmark"); }
}

// ==========================================
// 8. İŞLEM GİRİŞİ VE LİSTELEME
// ==========================================
window.editTransaction = function(id) {
    const t = transactions.find(t => t.id === id); if(!t) return;
    editingId = id; textEl.value = t.text; amountEl.value = Math.abs(t.amount); dateEl.value = t.date; categoryEl.value = t.category;
    if(t.amount > 0) document.getElementById('type-income').checked = true; else document.getElementById('type-expense').checked = true;
    if(submitBtn) { submitBtn.innerText = "Değişiklikleri Kaydet"; submitBtn.style.backgroundColor = "var(--primary-color)"; }
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
};

window.togglePaymentStatus = function(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        transaction.isPaid = !transaction.isPaid; localStorage.setItem('transactions', JSON.stringify(transactions)); init();
        if(transaction.isPaid) showNotify("Harcama 'Ödendi' yapıldı!", "fa-check-circle"); else showNotify("Harcama 'Ödenmedi' durumuna alındı!", "fa-clock");
        if(accessToken) backupToDrive(true);
    }
};

window.removeTransaction = function(id) { transactions = transactions.filter(t => t.id !== id); localStorage.setItem('transactions', JSON.stringify(transactions)); init(); };

function addTransactionDOM(t) {
    const item = document.createElement('li'); item.classList.add('transaction-item');
    const isPaid = t.isPaid !== false; if (t.amount < 0 && !isPaid) item.classList.add('unpaid-item'); 
    const sign = t.amount < 0 ? '-' : '+';
    let statusBadge = ''; let actionBtns = `<button class="list-btn edit-btn" onclick="editTransaction(${t.id})" title="Düzenle"><i class="fa-regular fa-pen-to-square"></i></button><button class="list-btn delete-btn" onclick="removeTransaction(${t.id})" title="Sil"><i class="fa-regular fa-trash-can"></i></button>`;
    if (t.amount < 0) {
        if (isPaid) {
            statusBadge = `<span class="category-badge" style="background: rgba(16, 185, 129, 0.1); color: var(--success-color); border: 1px solid var(--success-color);"><i class="fa-solid fa-check"></i> Ödendi</span>`;
            actionBtns = `<button class="list-btn undo-pay-btn" onclick="togglePaymentStatus(${t.id})" title="Geri Al"><i class="fa-solid fa-arrow-rotate-left"></i></button>` + actionBtns;
        } else {
            statusBadge = `<span class="category-badge" style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color); border: 1px solid var(--danger-color);"><i class="fa-regular fa-clock"></i> Ödenmedi</span>`;
            actionBtns = `<button class="list-btn pay-btn" onclick="togglePaymentStatus(${t.id})" title="Ödendi İşaretle"><i class="fa-solid fa-check"></i> Öde</button>` + actionBtns;
        }
    }
    item.innerHTML = `<div class="transaction-info"><span style="display:flex; align-items:center; gap:8px;">${t.text} <span class="category-badge">${t.category}</span> ${statusBadge}</span><small>${new Date(t.date).toLocaleDateString('tr-TR')}</small></div><div style="display:flex; align-items:center; gap:8px;"><span class="transaction-amount ${t.amount < 0 ? 'amount-minus' : 'amount-plus'}" style="margin-right: 10px;">${sign}${currentCurrency}${Math.abs(t.amount).toFixed(2)}</span><div style="display:flex; gap:5px;">${actionBtns}</div></div>`;
    if (listEl) listEl.appendChild(item);
}

// ==========================================
// YAPAY ZEKA VE DEĞER GÜNCELLEMELERİ
// ==========================================
function updateValues(currentTransactions) {
    const total = currentTransactions.reduce((acc, t) => acc + t.amount, 0).toFixed(2);
    const inc = currentTransactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0).toFixed(2);
    const exp = Math.abs(currentTransactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0)).toFixed(2);
    
    if(balanceEl) balanceEl.innerText = `${currentCurrency}${total}`; 
    if(incomeEl) incomeEl.innerText = `${currentCurrency}${inc}`; 
    if(expenseEl) expenseEl.innerText = `${currentCurrency}${exp}`;
    
    updateIncomeExpenseUI(parseFloat(inc), parseFloat(exp));
    generateAIInsights(currentTransactions, parseFloat(inc), parseFloat(exp)); // YZ MOTORUNU ÇALIŞTIR
}

// 🤖 MİNİ YAPAY ZEKA MOTORU
function generateAIInsights(transactions, totalInc, totalExp) {
    const aiContainer = document.getElementById('ai-insights-text');
    if(!aiContainer) return;

    let insights = [];

    // 1. Bütçe ve Tasarruf Analizi
    if(totalInc > 0) {
        const saveRate = (((totalInc - totalExp) / totalInc) * 100).toFixed(1);
        if(saveRate > 20) insights.push(`Harika gidiyorsunuz! Bu ay gelirinizin <strong>%${saveRate}</strong> kadarını tasarruf ettiniz. Hedeflerinize hızla ulaşıyorsunuz. 🎯`);
        else if(saveRate > 0) insights.push(`Bütçeniz artıda ancak tasarruf oranınız <strong>(%${saveRate})</strong> biraz düşük. Bu ayki gereksiz harcamaları gözden geçirebilirsiniz. 💡`);
        else insights.push(`<strong>Dikkat!</strong> Giderleriniz gelirinizi aşmış durumda. Bütçeniz alarm veriyor, acil fren yapmalısınız! 🚨`);
    } else if (totalExp > 0) {
        insights.push(`Bu ay henüz bir gelir girmediniz ama harcama yapıyorsunuz. Bakiyeniz eriyor! 📉`);
    }

    // 2. En Yüksek Harcama Kalemi Analizi
    const expCats = {};
    transactions.filter(t => t.amount < 0).forEach(t => { expCats[t.category] = (expCats[t.category] || 0) + Math.abs(t.amount); });

    let highestCat = null; let highestAmt = 0;
    for(let cat in expCats) { if(expCats[cat] > highestAmt) { highestAmt = expCats[cat]; highestCat = cat; } }

    if(highestCat) {
        insights.push(`En büyük harcama kaleminiz <strong>${currentCurrency}${highestAmt.toFixed(2)}</strong> ile <strong>${highestCat}</strong> oldu. Bu kategoriyi kontrol altında tutun. 📊`);
    }

    if(insights.length === 0) {
        aiContainer.innerHTML = "Harcamalarınız girildikçe finansal analizlerim burada belirecek. Sizi bekliyorum! 🤖";
    } else {
        aiContainer.innerHTML = "<ul>" + insights.map(i => `<li>${i}</li>`).join('') + "</ul>";
    }
}

function updateChart(currentTransactions) {
    if(!ctx) return;
    let totalIncome = 0; const expenseCats = {};
    currentTransactions.forEach(t => { if (t.amount > 0) { totalIncome += t.amount; } else { expenseCats[t.category] = (expenseCats[t.category] || 0) + Math.abs(t.amount); } });
    const labels = ['Toplam Gelir', ...Object.keys(expenseCats)]; const dataValues = [totalIncome, ...Object.values(expenseCats)];
    const bgColors = ['#10b981', '#ef4444', '#f97316', '#f59e0b', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];
    if (expenseChartInstance) expenseChartInstance.destroy();
    expenseChartInstance = new Chart(ctx, { type: 'doughnut', data: { labels: labels, datasets: [{ data: dataValues, backgroundColor: bgColors, borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, animation: false } });
}

function init() {
    if(listEl) listEl.innerHTML = '';
    const selectedMonth = monthFilterEl ? monthFilterEl.value : ''; 
    const filteredTransactions = transactions.filter(t => { return !selectedMonth || t.date.startsWith(selectedMonth); });
    filteredTransactions.forEach(addTransactionDOM); updateValues(filteredTransactions); updateChart(filteredTransactions);
}

function changeMonth(offset) {
    if (!monthFilterEl || !monthFilterEl.value) return;
    let [year, month] = monthFilterEl.value.split('-').map(Number); month += offset;
    if (month > 12) { month = 1; year += 1; } else if (month < 1) { month = 12; year -= 1; }
    monthFilterEl.value = `${year}-${String(month).padStart(2, '0')}`; init(); 
}

if(monthFilterEl) monthFilterEl.addEventListener('change', init); 
if(prevMonthBtn) prevMonthBtn.addEventListener('click', () => changeMonth(-1));
if(nextMonthBtn) nextMonthBtn.addEventListener('click', () => changeMonth(1));

if(searchEl) {
    searchEl.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim(); const selectedMonth = monthFilterEl ? monthFilterEl.value : ''; 
        const filteredTransactions = transactions.filter(t => { const isMonthMatch = !selectedMonth || t.date.startsWith(selectedMonth); const isTextMatch = t.text.toLowerCase().includes(searchTerm) || (t.category && t.category.toLowerCase().includes(searchTerm)); return isMonthMatch && isTextMatch; });
        if(listEl) listEl.innerHTML = ''; filteredTransactions.forEach(addTransactionDOM);
    });
}

// ==========================================
// 9. DİNAMİK GELİR / GİDER ÇUBUĞU (AI)
// ==========================================
function updateIncomeExpenseUI(totalIncome, totalExpense) {
    const trackerCard = document.getElementById('income-expense-tracker-card');
    const progressFill = document.getElementById('tracker-progress-fill');
    const statusText = document.getElementById('tracker-status-text');
    const warningText = document.getElementById('tracker-warning-text');
    
    if(!trackerCard) return;

    if (totalIncome === 0 && totalExpense > 0) {
        trackerCard.style.display = 'block'; progressFill.style.width = `100%`; progressFill.style.backgroundColor = 'var(--danger-color)';
        statusText.innerHTML = `${currentCurrency}${totalExpense.toFixed(2)} <span style="color:var(--text-muted); font-size:0.85rem;">/ Gelir Yok</span>`;
        warningText.innerText = "🚨 Uyarı: Bu ay henüz geliriniz yok ama harcama yapıyorsunuz!"; warningText.style.color = 'var(--danger-color)'; return;
    }

    if (totalIncome === 0 && totalExpense === 0) { trackerCard.style.display = 'none'; return; }

    trackerCard.style.display = 'block';
    let percent = (totalExpense / totalIncome) * 100;
    let displayPercent = percent > 100 ? 100 : percent; 

    progressFill.style.width = `${displayPercent}%`;
    statusText.innerHTML = `${currentCurrency}${totalExpense.toFixed(2)} <span style="color:var(--text-muted); font-size:0.85rem;">/ ${currentCurrency}${totalIncome.toFixed(2)}</span>`;

    if (percent <= 50) { progressFill.style.backgroundColor = 'var(--success-color)'; warningText.innerText = "👍 Harika! Gelirinizin yarısından azını harcadınız, birikim yapabilirsiniz."; warningText.style.color = 'var(--success-color)'; } 
    else if (percent > 50 && percent <= 85) { progressFill.style.backgroundColor = '#f59e0b'; warningText.innerText = "⚠️ Dikkat: Harcamalarınız gelirinizin önemli bir kısmına ulaştı."; warningText.style.color = '#f59e0b'; } 
    else if (percent > 85 && percent <= 100) { progressFill.style.backgroundColor = 'var(--danger-color)'; warningText.innerText = "🚨 Limit Sınırı: Gelirinizin tamamını harcamak üzeresiniz!"; warningText.style.color = 'var(--danger-color)'; } 
    else { progressFill.style.backgroundColor = '#991b1b'; warningText.innerText = "💥 Kritik Durum: Giderleriniz gelirinizi aştı! (Borçlanıyorsunuz)"; warningText.style.color = 'var(--danger-color)'; }
}

const typeIncome = document.getElementById('type-income');
const typeExpense = document.getElementById('type-expense');

if (textEl && categoryEl) {
    textEl.addEventListener('input', () => {
        if(editingId) return; 
        const text = textEl.value.toLowerCase(); let matchedCategory = null;
        for (let cat of userCategories) { if (cat.keywords && cat.keywords.some(w => text.includes(w.toLowerCase()))) { matchedCategory = cat; break; } }
        if (matchedCategory) {
            categoryEl.value = matchedCategory.name;
            if (matchedCategory.type === 'income' && typeIncome) typeIncome.checked = true;
            if (matchedCategory.type === 'expense' && typeExpense) typeExpense.checked = true;
        }
    });
}

if(formEl) {
    formEl.onsubmit = (e) => {
        e.preventDefault();
        const type = document.querySelector('input[name="transaction-type"]:checked').value;
        let val = Math.abs(+amountEl.value); if (type === 'expense') val *= -1;
        if (editingId) {
            const tIndex = transactions.findIndex(t => t.id === editingId);
            if(tIndex > -1) { transactions[tIndex].text = textEl.value; transactions[tIndex].amount = val; transactions[tIndex].category = categoryEl.value; transactions[tIndex].date = dateEl.value; }
            editingId = null; if(submitBtn) { submitBtn.innerText = "Ekle"; submitBtn.style.backgroundColor = "var(--primary-color)"; }
            showNotify("İşlem başarıyla güncellendi!", "fa-pen-to-square");
        } else {
            const isPaidStatus = (type === 'income'); 
            transactions.push({ id: Date.now(), text: textEl.value, amount: val, category: categoryEl.value, date: dateEl.value, isPaid: isPaidStatus });
            showNotify("İşlem eklendi!", "fa-check");
        }
        localStorage.setItem('transactions', JSON.stringify(transactions)); init(); if(accessToken) backupToDrive(true);
        formEl.reset(); if (typeExpense) typeExpense.checked = true; setDefaultDate();
    };
}

// ==========================================
// 10. KATEGORİ YÖNETİMİ
// ==========================================
function initCategories() {
    if(categoryEl) {
        const currentVal = categoryEl.value; categoryEl.innerHTML = '<option value="" disabled selected>Kategori Seç</option>';
        userCategories.forEach(cat => { categoryEl.innerHTML += `<option value="${cat.name}">${cat.name}</option>`; });
        if(currentVal && userCategories.some(c => c.name === currentVal)) categoryEl.value = currentVal;
    }
    if(!catListEl) return; catListEl.innerHTML = '';
    userCategories.forEach(cat => {
        const item = document.createElement('li'); item.classList.add('transaction-item');
        const badgeClass = cat.type === 'income' ? 'income' : 'expense'; const badgeText = cat.type === 'income' ? 'Gelir' : 'Gider';
        const keywordsHtml = (cat.keywords || []).map(k => `<span class="keyword-badge">${k}</span>`).join('');
        item.innerHTML = `<div class="transaction-info" style="flex:1;"><span style="display:flex; align-items:center; font-weight: bold; margin-bottom: 5px;">${cat.name} <span class="cat-type-badge ${badgeClass}">${badgeText}</span></span><div style="display:flex; flex-wrap:wrap;">${keywordsHtml || '<span style="color:var(--text-muted); font-size:0.75rem;">(Otomatik tanıma kelimesi yok)</span>'}</div></div><div style="display:flex; gap:5px;"><button class="list-btn edit-btn" onclick="editCategory(${cat.id})" title="Kategoriyi Düzenle"><i class="fa-regular fa-pen-to-square"></i></button><button class="list-btn delete-btn" onclick="removeCategory(${cat.id})" title="Kategoriyi Sil"><i class="fa-regular fa-trash-can"></i></button></div>`;
        catListEl.appendChild(item);
    });
}

window.editCategory = function(id) {
    const cat = userCategories.find(c => c.id === id); if(!cat) return;
    editingCategoryId = id; document.getElementById('cat-type').value = cat.type; document.getElementById('cat-name').value = cat.name; document.getElementById('cat-keywords').value = (cat.keywords || []).join(', ');
    const btn = document.querySelector('#category-form button[type="submit"]'); if(btn) { btn.innerText = "Değişiklikleri Kaydet"; btn.style.backgroundColor = "var(--success-color)"; }
};

window.removeCategory = function(id) {
    if(confirm("Bu kategoriyi silmek istediğinize emin misiniz? (Önceki işlemler silinmez)")) {
        userCategories = userCategories.filter(c => c.id !== id); localStorage.setItem('userCategories', JSON.stringify(userCategories)); initCategories(); if(accessToken) backupToDrive(true);
    }
};

if(catForm) {
    catForm.onsubmit = (e) => {
        e.preventDefault();
        const type = document.getElementById('cat-type').value; const name = document.getElementById('cat-name').value.trim(); const keywordsInput = document.getElementById('cat-keywords').value;
        const keywords = keywordsInput ? keywordsInput.split(',').map(k => k.trim().toLowerCase()).filter(k => k) : [];
        if (editingCategoryId) {
            const idx = userCategories.findIndex(c => c.id === editingCategoryId);
            if (idx > -1) {
                const oldName = userCategories[idx].name; userCategories[idx].type = type; userCategories[idx].name = name; userCategories[idx].keywords = keywords;
                transactions.forEach(t => { if (t.category === oldName) t.category = name; }); localStorage.setItem('transactions', JSON.stringify(transactions)); init(); showNotify("Kategori güncellendi!", "fa-pen");
            }
            editingCategoryId = null; const btn = document.querySelector('#category-form button[type="submit"]'); if(btn) { btn.innerText = "Ekle / Güncelle"; btn.style.backgroundColor = "var(--primary-color)"; }
        } else {
            const existingCatIndex = userCategories.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
            if (existingCatIndex > -1) { userCategories[existingCatIndex].type = type; userCategories[existingCatIndex].keywords = keywords; showNotify("Kategori güncellendi!", "fa-pen"); } 
            else { userCategories.push({ id: Date.now(), name: name, type: type, keywords: keywords }); showNotify("Kategori başarıyla eklendi!", "fa-tags"); }
        }
        localStorage.setItem('userCategories', JSON.stringify(userCategories)); initCategories(); catForm.reset(); if(accessToken) backupToDrive(true);
    };
}

// ==========================================
// 11. ABONELİK SİSTEMİ VE AKILLI HATIRLATICI
// ==========================================
let editingSubscriptionId = null; // Düzenlenen aboneliği takip etmek için

const subIconMap = { 
    'Elektrik': '<i class="fa-solid fa-bolt" style="color: #eab308;"></i>', 
    'Su': '<i class="fa-solid fa-droplet" style="color: #3b82f6;"></i>', 
    'Doğalgaz': '<i class="fa-solid fa-fire" style="color: #ef4444;"></i>', 
    'İnternet': '<i class="fa-solid fa-wifi" style="color: #8b5cf6;"></i>', 
    'Telefon': '<i class="fa-solid fa-phone" style="color: #10b981;"></i>', 
    'Diğer': '<i class="fa-solid fa-file-invoice" style="color: #94a3b8;"></i>' 
};

function renderTicker() {
    if(!tickerEl) return;
    if(subscriptions.length === 0) { tickerEl.innerHTML = '<span style="color: var(--text-muted);">Henüz abonelik eklenmedi.</span>'; return; }
    let html = ''; const displayList = [...subscriptions, ...subscriptions, ...subscriptions]; 
    displayList.forEach((sub) => { 
        const icon = subIconMap[sub.category] || subIconMap['Diğer']; 
        html += `<div class="ticker-item">${icon} <span>${sub.name}:</span> <span class="ticker-number">${sub.number}</span></div><i class="fa-solid fa-circle-small ticker-separator"></i>`; 
    });
    tickerEl.innerHTML = html;
}

// ABONELİK DÜZENLEME FONKSİYONU
window.editSubscription = function(id) {
    const sub = subscriptions.find(s => s.id === id);
    if(!sub) return;
    
    editingSubscriptionId = id;
    document.getElementById('sub-category').value = sub.category;
    document.getElementById('sub-name').value = sub.name;
    document.getElementById('sub-number').value = sub.number;
    document.getElementById('sub-day').value = sub.day || "";
    
    const submitBtn = document.querySelector('#subscription-form button[type="submit"]');
    if(submitBtn) {
        submitBtn.innerText = "Güncelle";
        submitBtn.style.backgroundColor = "var(--success-color)";
    }
    
    // Ayarlar sekmesinde formu görebilmesi için yukarı kaydır
    document.getElementById('tab-subscriptions').scrollTo({ top: 0, behavior: 'smooth' });
};

window.removeSubscription = function(id) {
    if(confirm("Bu abonelik kaydını silmek istediğinize emin misiniz?")) {
        subscriptions = subscriptions.filter(s => s.id !== id);
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
        initSubscriptions();
        if(accessToken) backupToDrive(true);
    }
};

function initSubscriptions() {
    if(subListEl) subListEl.innerHTML = '';
    subscriptions.forEach(sub => {
        const item = document.createElement('li'); 
        item.classList.add('transaction-item'); 
        const icon = subIconMap[sub.category] || subIconMap['Diğer'];
        const dayText = sub.day ? `<br><small style="color:#f59e0b; font-weight:600;"><i class="fa-regular fa-calendar"></i> Her ayın ${sub.day}. günü</small>` : '';
        
        item.innerHTML = `
            <div class="transaction-info">
                <span style="display:flex; align-items:center; gap:8px;">${icon} ${sub.name} <span class="category-badge">${sub.category}</span></span>
                <small>No: <strong>${sub.number}</strong>${dayText}</small>
            </div>
            <div style="display:flex; gap:5px;">
                <button class="list-btn edit-btn" onclick="editSubscription(${sub.id})" title="Düzenle"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="list-btn delete-btn" onclick="removeSubscription(${sub.id})" title="Sil"><i class="fa-regular fa-trash-can"></i></button>
            </div>`;
        if(subListEl) subListEl.appendChild(item);
    });
    renderTicker();
    checkUpcomingPayments();
}

if(subForm) {
    subForm.onsubmit = (e) => {
        e.preventDefault();
        const cat = document.getElementById('sub-category').value;
        const name = document.getElementById('sub-name').value;
        const num = document.getElementById('sub-number').value;
        const day = document.getElementById('sub-day').value;

        if (editingSubscriptionId) {
            // GÜNCELLEME MODU
            const idx = subscriptions.findIndex(s => s.id === editingSubscriptionId);
            if(idx > -1) {
                subscriptions[idx].category = cat;
                subscriptions[idx].name = name;
                subscriptions[idx].number = num;
                subscriptions[idx].day = parseInt(day);
            }
            editingSubscriptionId = null;
            const btn = subForm.querySelector('button[type="submit"]');
            btn.innerText = "Abonelik Ekle";
            btn.style.backgroundColor = "var(--primary-color)";
            showNotify("Abonelik güncellendi", "fa-pen");
        } else {
            // YENİ EKLEME MODU
            subscriptions.push({ id: Date.now(), category: cat, name: name, number: num, day: parseInt(day) });
            showNotify("Abonelik eklendi", "fa-check");
        }
        
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
        initSubscriptions();
        subForm.reset();
        if(accessToken) backupToDrive(true);
    };
}

// 🤖 YENİ: AKILLI YAKLAŞAN ÖDEME MOTORU (GÖRÜNÜRLÜK FIX)
function checkUpcomingPayments() {
    const container = document.getElementById('payment-reminders-container');
    if(!container) return;
    container.innerHTML = '';
    container.style.display = 'none';

    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    let remindersHTML = '';
    let hasReminders = false;

    subscriptions.forEach(sub => {
        if(!sub.day) return;
        let targetDay = sub.day > daysInMonth ? daysInMonth : sub.day;
        let diff = targetDay - currentDay;

        // Ödemeye 3 gün kala veya bugünse göster
        if (diff >= 0 && diff <= 3) {
            hasReminders = true;
            let timeText = diff === 0 ? "Bugün!" : `${diff} gün sonra`;
            remindersHTML += `
                <div class="reminder-alert">
                    <i class="fa-solid fa-bell-concierge fa-shake"></i>
                    <span><strong>${sub.name}</strong> ödemesi yaklaştı <strong>(${timeText})</strong></span>
                </div>`;
        }
    });

    if(hasReminders) {
        container.style.display = 'flex';
        container.innerHTML = remindersHTML;
    }
}

// ==========================================
// 12. YILLIK DURUM TABLOSU
// ==========================================
const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function initYearlyStatus() {
    const yearSelect = document.getElementById('yearly-status-year'); const tableBody = document.getElementById('yearly-status-body'); const tableFoot = document.getElementById('yearly-status-foot');
    if(!yearSelect || !tableBody) return;
    const years = [...new Set(transactions.map(t => t.date.split('-')[0]))].sort().reverse();
    const currentYear = new Date().getFullYear().toString(); if(!years.includes(currentYear)) years.unshift(currentYear);
    const prevYear = yearSelect.value; yearSelect.innerHTML = years.map(y => `<option value="${y}" ${y === (prevYear || currentYear) ? 'selected' : ''}>${y}</option>`).join('');
    const selectedYear = yearSelect.value; let yearlyTotalInc = 0; let yearlyTotalExp = 0; let html = '';
    monthNames.forEach((name, index) => {
        const monthNum = String(index + 1).padStart(2, '0'); const prefix = `${selectedYear}-${monthNum}`;
        const monthData = transactions.filter(t => t.date.startsWith(prefix));
        const inc = monthData.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0); const exp = Math.abs(monthData.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
        const net = inc - exp; yearlyTotalInc += inc; yearlyTotalExp += exp;
        html += `<tr><td>${name}</td><td>${currentCurrency}${inc.toFixed(2)}</td><td>${currentCurrency}${exp.toFixed(2)}</td><td class="${net >= 0 ? 'net-positive' : 'net-negative'}">${currentCurrency}${net.toFixed(2)}</td></tr>`;
    });
    tableBody.innerHTML = html;
    tableFoot.innerHTML = `<tr><td><strong>TOPLAM</strong></td><td><strong>${currentCurrency}${yearlyTotalInc.toFixed(2)}</strong></td><td><strong>${currentCurrency}${yearlyTotalExp.toFixed(2)}</strong></td><td class="${(yearlyTotalInc - yearlyTotalExp) >= 0 ? 'net-positive' : 'net-negative'}"><strong>${currentCurrency}${(yearlyTotalInc - yearlyTotalExp).toFixed(2)}</strong></td></tr>`;
}
if(document.getElementById('yearly-status-year')) { document.getElementById('yearly-status-year').addEventListener('change', initYearlyStatus); }

// ==========================================
// 13. EXCEL DIŞA AKTARICI
// ==========================================
const exportExcelBtn = document.getElementById('export-excel-btn');
if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', () => {
        if (transactions.length === 0) { showNotify("İndirilecek işlem bulunamadı!", "fa-circle-exclamation"); return; }
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += "Tarih;Islem Adi;Kategori;Tur;Tutar;Durum\r\n";
        transactions.forEach(t => {
            const type = t.amount > 0 ? "Gelir" : "Gider";
            const status = t.isPaid !== false ? "Odendi" : "Odenmedi";
            const amount = Math.abs(t.amount).toFixed(2).replace('.', ',');
            const cleanCategory = t.category ? t.category.replace(/[^\p{L}\p{N}\s]/gu, '').trim() : '';
            const row = [ t.date, `"${t.text}"`, `"${cleanCategory}"`, type, amount, status ];
            csvContent += row.join(";") + "\r\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a"); link.setAttribute("href", encodedUri);
        const today = new Date().toISOString().split('T')[0]; link.setAttribute("download", `Finans_Gecmisi_${today}.csv`);
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        showNotify("Excel dosyası indirildi!", "fa-file-excel");
    });
}

// ==========================================
// 14. SEÇMELİ SIFIRLAMA MODALI (RESET)
// ==========================================
const openResetModalBtn = document.getElementById('open-reset-modal-btn');
const resetModal = document.getElementById('reset-modal');
const cancelResetBtn = document.getElementById('cancel-reset-btn');
const confirmResetBtn = document.getElementById('confirm-reset-btn');
const resetAllCb = document.getElementById('reset-all');

if (openResetModalBtn) openResetModalBtn.addEventListener('click', () => { if (resetModal) resetModal.style.display = 'flex'; });

if (cancelResetBtn) cancelResetBtn.addEventListener('click', () => { 
    if (resetModal) resetModal.style.display = 'none'; 
    document.querySelectorAll('.danger-checkbox').forEach(cb => cb.checked = false); 
});

// YENİ: "Tümünü Seç" Kutusu Mantığı
if (resetAllCb) {
    resetAllCb.addEventListener('change', (e) => {
        // Tümünü seç'e tıklanınca diğer tüm kutuları da aynı duruma getir
        document.querySelectorAll('.reset-item').forEach(cb => cb.checked = e.target.checked);
    });
}

// YENİ: Alt kutulardan biri kapanırsa "Tümünü Seç" kutusunun da tikini kaldır
document.querySelectorAll('.reset-item').forEach(item => {
    item.addEventListener('change', () => {
        const allChecked = Array.from(document.querySelectorAll('.reset-item')).every(cb => cb.checked);
        if (resetAllCb) resetAllCb.checked = allChecked;
    });
});

if (confirmResetBtn) {
    confirmResetBtn.addEventListener('click', async () => {
        const chkTrans = document.getElementById('reset-transactions').checked;
        const chkSubs = document.getElementById('reset-subscriptions').checked;
        const chkCats = document.getElementById('reset-categories').checked;
        const chkNotes = document.getElementById('reset-notes').checked;
        const chkSettings = document.getElementById('reset-settings').checked;

        if (!chkTrans && !chkSubs && !chkCats && !chkNotes && !chkSettings) { showNotify("Lütfen silmek için en az bir veri türü seçin!", "fa-triangle-exclamation"); return; }
        
        if (confirm("⚠️ DİKKAT: Seçtiğiniz veriler kalıcı olarak silinecektir! Onaylıyor musunuz?")) {
            if (chkTrans) { transactions = []; localStorage.removeItem('transactions'); init(); }
            if (chkSubs) { subscriptions = []; localStorage.removeItem('subscriptions'); initSubscriptions(); }
            if (chkCats) { userCategories = defaultCategories; localStorage.removeItem('userCategories'); initCategories(); }
            if (chkNotes) { notes = []; localStorage.removeItem('notes'); initNotes(); }
            if (chkSettings) { currentCurrency = '₺'; currentColorTheme = 'default'; localStorage.removeItem('currency'); localStorage.removeItem('colorTheme'); applyGeneralSettings(); }
            
            if (resetModal) resetModal.style.display = 'none';
            document.querySelectorAll('.danger-checkbox').forEach(cb => cb.checked = false);
            showNotify("Veriler sıfırlandı.", "fa-check-double");
            if (accessToken) { showNotify("Yedek güncelleniyor...", "fa-spinner fa-spin"); await backupToDrive(true); }
        }
    });
}

// ==========================================
// 15. NOTLARIM MODÜLÜ (YENİ)
// ==========================================
const addNoteBtn = document.getElementById('add-note-btn');
const noteFormContainer = document.getElementById('note-form-container');
const cancelNoteBtn = document.getElementById('cancel-note-btn');
const saveNoteBtn = document.getElementById('save-note-btn');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const notesGrid = document.getElementById('notes-grid');

if(addNoteBtn) addNoteBtn.onclick = () => { noteFormContainer.style.display = 'block'; noteTitleInput.focus(); };
if(cancelNoteBtn) cancelNoteBtn.onclick = () => { noteFormContainer.style.display = 'none'; noteTitleInput.value = ''; noteContentInput.value = ''; };

if(saveNoteBtn) {
    saveNoteBtn.onclick = () => {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        if(!content) { showNotify("Not içeriği boş olamaz!", "fa-triangle-exclamation"); return; }
        
        const newNote = {
            id: Date.now(),
            title: title || "Başlıksız Not",
            content: content,
            date: new Date().toLocaleString('tr-TR')
        };
        
        notes.unshift(newNote); // En başa ekle
        localStorage.setItem('notes', JSON.stringify(notes));
        initNotes();
        cancelNoteBtn.onclick();
        showNotify("Not kaydedildi!", "fa-check");
        if(accessToken) backupToDrive(true);
    };
}

function initNotes() {
    if(!notesGrid) return;
    notesGrid.innerHTML = '';
    if(notes.length === 0) {
        notesGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--text-muted);"><i class="fa-regular fa-note-sticky fa-3x" style="margin-bottom: 10px;"></i><p>Henüz bir not eklenmedi.</p></div>';
        return;
    }
    notes.forEach(note => {
        const div = document.createElement('div');
        div.className = 'note-card';
        div.innerHTML = `
            <i class="fa-solid fa-trash-can delete-note" onclick="deleteNote(${note.id})"></i>
            <h4>${note.title}</h4>
            <p>${note.content}</p>
            <span class="note-date">${note.date}</span>
        `;
        notesGrid.appendChild(div);
    });
}

window.deleteNote = (id) => {
    if(confirm("Bu notu silmek istiyor musunuz?")) {
        notes = notes.filter(n => n.id !== id);
        localStorage.setItem('notes', JSON.stringify(notes));
        initNotes();
        showNotify("Not silindi", "fa-trash");
        if(accessToken) backupToDrive(true);
    }
};

// ==========================================
// 16. BAŞLANGIÇ ÇALIŞTIRMALARI (INIT)
// ==========================================
applyGeneralSettings();
setDefaultDate();
initCategories();
init();
initSubscriptions();
initNotes();

// ==========================================
// 17. PWA (MOBİL UYGULAMA) MOTORU KAYDI
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker başarıyla kaydedildi! Kapsam: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker kaydı başarısız oldu: ', err);
            });
    });
}