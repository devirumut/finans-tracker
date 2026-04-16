// --- 1. AYARLAR VE GOOGLE API (OAUTH 2.0) ---
// BURAYA KENDİ İSTEMCİ KİMLİĞİNİ YAPIŞTIR!
const CLIENT_ID = '443504738907-rnrnore3ebpsf1rfdb4r7c9s37q4sqmd.apps.googleusercontent.com'; 
const SCOPES = 'https://www.googleapis.com/auth/drive.file'; // Sadece kendi oluşturduğu dosyaya erişim izni

let tokenClient;
let accessToken = null;
let driveFileId = null; // Drive'daki JSON dosyamızın ID'si

// --- 2. DOM ELEMENTLERİ ---
const balanceEl = document.getElementById('total-balance');
const incomeEl = document.getElementById('total-income');
const expenseEl = document.getElementById('total-expense');
const listEl = document.getElementById('transaction-list');
const formEl = document.getElementById('transaction-form');
const textEl = document.getElementById('text');
const amountEl = document.getElementById('amount');
const authBtn = document.getElementById('auth-btn');

// --- 3. BAŞLANGIÇ VERİLERİ ---
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// --- 4. GOOGLE KİMLİK DOĞRULAMA (GIS) ---
window.onload = function () {
    // Google API yüklendiğinde kimlik doğrulama istemcisini başlat
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
                accessToken = tokenResponse.access_token;
                
                // UI Güncellemesi (Başarılı Giriş)
                authBtn.innerHTML = '<i class="fa-solid fa-check"></i> Drive Bağlandı';
                authBtn.style.backgroundColor = 'var(--success-color)';
                authBtn.style.color = 'white';
                authBtn.style.pointerEvents = 'none'; // Tekrar tıklanmasını engelle
                
                // Drive'dan verileri çek
                syncFromDrive();
            }
        },
    });
};

// Butona tıklandığında Google giriş penceresini aç
authBtn.addEventListener('click', () => {
    if (tokenClient) {
        tokenClient.requestAccessToken();
    }
});

// --- 5. GOOGLE DRIVE'DAN VERİ ÇEKME ---
async function syncFromDrive() {
    try {
        // Önce dosya var mı diye arıyoruz
        const searchRes = await fetch('https://www.googleapis.com/drive/v3/files?q=name="finans_yedek.json" and trashed=false', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const searchData = await searchRes.json();

        if (searchData.files && searchData.files.length > 0) {
            // Dosya bulundu, içeriğini okuyalım
            driveFileId = searchData.files[0].id;
            const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${driveFileId}?alt=media`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const fileData = await fileRes.json();
            
            // Verileri eşitle ve ekranı yenile
            transactions = fileData;
            updateLocalStorage();
            init();
            alert('Drive verileri başarıyla senkronize edildi!');
        } else {
            // Dosya yoksa ilk yedeklemeyi başlat
            syncToDrive();
        }
    } catch (error) {
        console.error("Drive'dan veri çekilirken hata oluştu:", error);
    }
}

// --- 6. GOOGLE DRIVE'A VERİ KAYDETME ---
async function syncToDrive() {
    if (!accessToken) return; // Giriş yapılmadıysa sadece LocalStorage'a kaydeder (sessizce atlar)

    const fileContent = JSON.stringify(transactions);
    const metadata = { name: 'finans_yedek.json', mimeType: 'application/json' };

    let method = driveFileId ? 'PATCH' : 'POST';
    let url = driveFileId 
        ? `https://www.googleapis.com/upload/drive/v3/files/${driveFileId}?uploadType=multipart`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    // Google API için özel Multipart Body yapısı
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";
    
    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' + fileContent +
        close_delim;

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': `multipart/related; boundary=${boundary}`
            },
            body: multipartRequestBody
        });
        const data = await res.json();
        if (!driveFileId) driveFileId = data.id; // İlk kez oluştuysa ID'yi kaydet
    } catch (error) {
        console.error("Drive'a kaydedilirken hata oluştu:", error);
    }
}

// --- 7. ARAYÜZ VE MANTIK FONKSİYONLARI (Önceki Adımdan Aynı) ---
function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? '-' : '+';
    const item = document.createElement('li');
    item.classList.add('transaction-item');
    item.innerHTML = `
        <div class="transaction-info">
            <span>${transaction.text}</span>
        </div>
        <div>
            <span class="transaction-amount ${transaction.amount < 0 ? 'amount-minus' : 'amount-plus'}">
                ${sign}₺${Math.abs(transaction.amount).toFixed(2)}
            </span>
            <button class="delete-btn" onclick="removeTransaction(${transaction.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;
    listEl.appendChild(item);
}

function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0).toFixed(2);
    const expense = (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2);

    balanceEl.innerText = `₺${total}`;
    incomeEl.innerText = `₺${income}`;
    expenseEl.innerText = `₺${expense}`;
}

function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    syncToDrive(); // Silme işleminden sonra bulutu güncelle
    init();
}

function addTransaction(e) {
    e.preventDefault();
    if (textEl.value.trim() === '' || amountEl.value.trim() === '') {
        alert('Lütfen işlem adı ve geçerli bir tutar giriniz!');
        return;
    }
    const transaction = { id: generateID(), text: textEl.value, amount: +amountEl.value };
    transactions.push(transaction);
    
    addTransactionDOM(transaction);
    updateValues();
    updateLocalStorage();
    syncToDrive(); // Yeni eklemeden sonra bulutu güncelle
    
    textEl.value = '';
    amountEl.value = '';
}

function generateID() { return Math.floor(Math.random() * 100000000); }
function updateLocalStorage() { localStorage.setItem('transactions', JSON.stringify(transactions)); }

function init() {
    listEl.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
}

init();
formEl.addEventListener('submit', addTransaction);