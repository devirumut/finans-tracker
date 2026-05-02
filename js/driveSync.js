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

let gisInitPromise = null;

function waitForGoogleIdentity(maxWaitMs = 8000) {
    const startedAt = Date.now();

    return new Promise((resolve, reject) => {
        const tick = () => {
            if (window.google?.accounts?.oauth2) {
                resolve(window.google);
                return;
            }

            if (Date.now() - startedAt >= maxWaitMs) {
                reject(new Error('Google Identity Services yüklenemedi.'));
                return;
            }

            setTimeout(tick, 100);
        };

        tick();
    });
}

async function initGoogleAuth() {
    if (tokenClient) return tokenClient;
    if (gisInitPromise) return gisInitPromise;

    gisInitPromise = waitForGoogleIdentity().then(() => {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: async (tokenResponse) => {
                if (tokenResponse?.error) {
                    console.error('Google giriş hatası:', tokenResponse);
                    showNotify('Google bağlantısı reddedildi veya başarısız oldu.', 'fa-circle-xmark');
                    return;
                }

                if (tokenResponse?.access_token) {
                    accessToken = tokenResponse.access_token;
                    await fetchUserProfile();
                    await syncFromDrive();
                }
            },
        });

        return tokenClient;
    }).catch((err) => {
        gisInitPromise = null;
        console.error(err);
        showNotify('Google servisi yüklenemedi. İnternet bağlantısını ve alan adını kontrol edin.', 'fa-triangle-exclamation');
        throw err;
    });

    return gisInitPromise;
}

window.addEventListener('load', () => {
    initGoogleAuth().catch(() => {});
});

if (loginBtn) {
    loginBtn.onclick = async () => {
        try {
            const client = await initGoogleAuth();
            client.requestAccessToken({ prompt: 'consent' });
        } catch (err) {
            console.error('Google bağlantısı başlatılamadı:', err);
        }
    };
}

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

function getCurrentAppSettingsForBackup() {
    return {
        currency: currentCurrency,
        theme: currentColorTheme,
        darkMode: localStorage.getItem('theme') || 'light',
        workHours: userWorkHours,
        chartType: currentChartType,
        notifyUIEnabled,
        notifyReminderEnabled
    };
}

function applyRestoredSettings(settings = {}) {
    currentCurrency = settings.currency || currentCurrency || '₺';
    currentColorTheme = settings.theme || currentColorTheme || 'default';
    userWorkHours = Number(settings.workHours) || Number(userWorkHours) || 160;
    currentChartType = settings.chartType || currentChartType || 'doughnut';

    if (typeof settings.notifyUIEnabled !== 'undefined') notifyUIEnabled = settings.notifyUIEnabled !== false;
    if (typeof settings.notifyReminderEnabled !== 'undefined') notifyReminderEnabled = settings.notifyReminderEnabled !== false;

    localStorage.setItem('currency', currentCurrency);
    localStorage.setItem('colorTheme', currentColorTheme);
    localStorage.setItem('userWorkHours', userWorkHours);
    localStorage.setItem('chartType', currentChartType);
    localStorage.setItem('notifyUIEnabled', notifyUIEnabled);
    localStorage.setItem('notifyReminderEnabled', notifyReminderEnabled);

    if (settings.darkMode === 'dark') {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else if (settings.darkMode === 'light') {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }

    if (settingWorkHoursEl) settingWorkHoursEl.value = userWorkHours;
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function collectDocumentFilesForBackup() {
    const files = [];

    for (const doc of documents) {
        try {
            const file = await documentFileStore.get(doc.id);
            if (!file) continue;

            files.push({
                id: doc.id,
                fileName: doc.fileName || file.name || doc.name || 'belge',
                fileType: doc.fileType || file.type || 'application/octet-stream',
                fileSize: doc.fileSize || file.size || 0,
                dataUrl: await blobToDataUrl(file)
            });
        } catch (error) {
            console.warn('Belge yedek dosyası okunamadı:', doc, error);
        }
    }

    return files;
}

async function restoreDocumentFilesFromBackup(documentFiles = []) {
    if (!Array.isArray(documentFiles)) return;

    for (const fileRecord of documentFiles) {
        try {
            if (!fileRecord?.id || !fileRecord?.dataUrl) continue;

            const blob = dataUrlToBlob(fileRecord.dataUrl);
            const file = new File(
                [blob],
                fileRecord.fileName || 'belge',
                { type: fileRecord.fileType || blob.type || 'application/octet-stream' }
            );

            await documentFileStore.put(fileRecord.id, file);
        } catch (error) {
            console.warn('Belge dosyası geri yüklenemedi:', fileRecord?.fileName || fileRecord?.id, error);
        }
    }
}

async function backupToDrive(isSilent = false) {
    const backupData = {
        schemaVersion: 2,
        exportedAt: new Date().toISOString(),
        transactions,
        subscriptions,
        userCategories,
        notes,
        documents: documents.map(({ fileData, ...meta }) => meta),
        documentFiles: await collectDocumentFilesForBackup(),
        settings: getCurrentAppSettingsForBackup()
    };

    const fileContent = JSON.stringify(backupData);
    const metadata = { name: 'finans_yedek.json', mimeType: 'application/json' };
    let url = driveFileId
        ? `https://www.googleapis.com/upload/drive/v3/files/${driveFileId}?uploadType=multipart`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    const boundary = '-------314159265358979323846';
    const body =
        "\r\n--" + boundary +
        "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(metadata) +
        "\r\n--" + boundary +
        "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
        fileContent +
        "\r\n--" + boundary + "--";

    try {
        const res = await fetch(url, {
            method: driveFileId ? 'PATCH' : 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': `multipart/related; boundary=${boundary}`
            },
            body
        });

        if (!res.ok) {
            const errText = await res.text().catch(() => '');
            throw new Error(`Drive yedekleme hatası: ${res.status} ${errText}`);
        }

        const data = await res.json();
        driveFileId = data.id || driveFileId;

        if(!isSilent) showNotify("Drive'a Yedeklendi!", "fa-cloud-arrow-up");
        return true;
    } catch (e) {
        console.error('Drive yedekleme hatası:', e);
        showNotify("Yedekleme Hatası!", "fa-circle-xmark");
        return false;
    }
}

async function syncFromDrive() {
    try {
        const res = await fetch(
            'https://www.googleapis.com/drive/v3/files?q=name="finans_yedek.json" and trashed=false&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc',
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (!res.ok) {
            const errText = await res.text().catch(() => '');
            throw new Error(`Drive listeleme hatası: ${res.status} ${errText}`);
        }

        const data = await res.json();

        if (!data.files || data.files.length === 0) {
            showNotify("Bulutta yedek bulunamadı.", "fa-circle-info");
            return false;
        }

        driveFileId = data.files[0].id;

        const file = await fetch(
            `https://www.googleapis.com/drive/v3/files/${driveFileId}?alt=media`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (!file.ok) {
            const errText = await file.text().catch(() => '');
            throw new Error(`Drive indirme hatası: ${file.status} ${errText}`);
        }

        const parsedData = await file.json();

        if (Array.isArray(parsedData)) {
            transactions = parsedData;
            subscriptions = [];
            userCategories = defaultCategories;
            notes = [];
            documents = [];
            await documentFileStore.clear();
        } else {
            transactions = Array.isArray(parsedData.transactions) ? parsedData.transactions : [];
            subscriptions = Array.isArray(parsedData.subscriptions) ? parsedData.subscriptions : [];
            userCategories = Array.isArray(parsedData.userCategories) ? parsedData.userCategories : defaultCategories;
            notes = Array.isArray(parsedData.notes) ? parsedData.notes : [];
            documents = Array.isArray(parsedData.documents) ? parsedData.documents.map(({ fileData, ...meta }) => meta) : [];

            await documentFileStore.clear();

            // Eski Base64 belge yedeği varsa onu da destekle.
            for (const doc of Array.isArray(parsedData.documents) ? parsedData.documents : []) {
                if (doc?.fileData && doc?.id) {
                    try {
                        await documentFileStore.put(doc.id, dataUrlToBlob(doc.fileData));
                    } catch (error) {
                        console.warn('Eski belge verisi geri yüklenemedi:', doc.name, error);
                    }
                }
            }

            await restoreDocumentFilesFromBackup(parsedData.documentFiles);

            if (parsedData.settings) applyRestoredSettings(parsedData.settings);
        }

        await persistDocumentsMeta();

        localStorage.setItem('transactions', JSON.stringify(transactions));
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
        localStorage.setItem('userCategories', JSON.stringify(userCategories));
        localStorage.setItem('notes', JSON.stringify(notes));

        applyGeneralSettings();
        initCategories();
        init();
        initSubscriptions();
        initYearlyStatus();
        initNotes();
        await initDocuments();

        showNotify("Veriler başarıyla indirildi!", "fa-cloud-arrow-down");
        return true;
    } catch (e) {
        console.error('Drive indirme hatası:', e);
        showNotify("İndirme Hatası!", "fa-circle-xmark");
        return false;
    }
}


function isSalaryTransaction(t) {
    if (!t || t.amount <= 0) return false;
    const category = String(t.category || '').toLowerCase();
    const text = String(t.text || '').toLowerCase();
    return category.includes('maaş') || text.includes('maaş');
}

function getMonthKeyFromDate(dateValue) {
    const value = String(dateValue || '').trim();
    if (/^\d{4}-\d{2}/.test(value)) return value.substring(0, 7);
    if (monthFilterEl && monthFilterEl.value) return monthFilterEl.value;
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthlySalary(monthKey) {
    if (!monthKey) return 0;
    const salaryTransactions = transactions
        .filter(t => isSalaryTransaction(t) && String(t.date || '').startsWith(monthKey))
        .sort((a, b) => new Date(a.date) - new Date(b.date) || a.id - b.id);

    if (salaryTransactions.length === 0) return 0;

    return salaryTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

function formatWorkDuration(totalHours) {
    if (!Number.isFinite(totalHours) || totalHours <= 0) return null;

    const totalMinutes = Math.round(totalHours * 60);
    const minutesPerWorkDay = 9 * 60;
    const days = Math.floor(totalMinutes / minutesPerWorkDay);
    const remainingMinutes = totalMinutes % minutesPerWorkDay;
    const hours = Math.floor(remainingMinutes / 60);
    const mins = remainingMinutes % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}g`);
    if (hours > 0) parts.push(`${hours}s`);
    if (mins > 0) parts.push(`${mins}dk`);

    return parts.join(' ') || '0dk';
}

function getTimeCostString(amount, dateValue) {
    const monthKey = getMonthKeyFromDate(dateValue);
    const salary = getMonthlySalary(monthKey);
    const workHours = Number(userWorkHours || 0);

    if (salary <= 0 || workHours <= 0 || Number(amount) >= 0) return null;

    const hourlyWage = salary / workHours;
    if (!Number.isFinite(hourlyWage) || hourlyWage <= 0) return null;

    return formatWorkDuration(Math.abs(Number(amount)) / hourlyWage);
}

// ==========================================
