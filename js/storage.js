// GÜVENLİ VERİ / METİN YARDIMCILARI
// ==========================================
function safeJsonParse(value, fallback) {
    try {
        const parsed = JSON.parse(value);
        return parsed ?? fallback;
    } catch (e) {
        return fallback;
    }
}

function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatMoney(value) {
    return `${currentCurrency}${Number(value || 0).toFixed(2)}`;
}


// ==========================================
// INDEXEDDB DOSYA DEPOSU
// ==========================================
const DOCUMENT_DB_NAME = 'finans-asistani-documents';
const DOCUMENT_DB_VERSION = 1;
const DOCUMENT_STORE_NAME = 'files';

function openDocumentDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DOCUMENT_DB_NAME, DOCUMENT_DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(DOCUMENT_STORE_NAME)) {
                db.createObjectStore(DOCUMENT_STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

const documentFileStore = {
    async put(id, file) {
        const db = await openDocumentDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(DOCUMENT_STORE_NAME, 'readwrite');
            tx.objectStore(DOCUMENT_STORE_NAME).put({ id, file });
            tx.oncomplete = () => { db.close(); resolve(true); };
            tx.onerror = () => { db.close(); reject(tx.error); };
        });
    },
    async get(id) {
        const db = await openDocumentDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(DOCUMENT_STORE_NAME, 'readonly');
            const request = tx.objectStore(DOCUMENT_STORE_NAME).get(id);
            request.onsuccess = () => resolve(request.result ? request.result.file : null);
            request.onerror = () => reject(request.error);
            tx.oncomplete = () => db.close();
        });
    },
    async delete(id) {
        const db = await openDocumentDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(DOCUMENT_STORE_NAME, 'readwrite');
            tx.objectStore(DOCUMENT_STORE_NAME).delete(id);
            tx.oncomplete = () => { db.close(); resolve(true); };
            tx.onerror = () => { db.close(); reject(tx.error); };
        });
    },
    async clear() {
        const db = await openDocumentDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(DOCUMENT_STORE_NAME, 'readwrite');
            tx.objectStore(DOCUMENT_STORE_NAME).clear();
            tx.oncomplete = () => { db.close(); resolve(true); };
            tx.onerror = () => { db.close(); reject(tx.error); };
        });
    }
};

function dataUrlToBlob(dataUrl) {
    const [meta, base64] = dataUrl.split(',');
    const mime = (meta.match(/data:(.*?);base64/) || [])[1] || 'application/octet-stream';
    const binary = atob(base64 || '');
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
}

async function persistDocumentsMeta() {
    localStorage.setItem('documents', JSON.stringify(documents.map(({ fileData, ...meta }) => meta)));
}

async function migrateLegacyDocumentsToIndexedDB() {
    let migrated = false;
    for (const doc of documents) {
        if (doc.fileData) {
            await documentFileStore.put(doc.id, dataUrlToBlob(doc.fileData));
            doc.fileName = doc.fileName || doc.name || `belge-${doc.id}`;
            doc.fileType = doc.fileType || 'application/octet-stream';
            doc.storage = 'indexedDB';
            delete doc.fileData;
            migrated = true;
        }
    }
    if (migrated) await persistDocumentsMeta();
}

// YENİ PROJEEE/app.js - Başlangıca ekle
const menuDocuments = document.getElementById('menu-documents');
const documentsView = document.getElementById('documents-view');
let documents = safeJsonParse(localStorage.getItem('documents'), []);

// YENİ PROJEEE/app.js 
let userWorkHours = parseFloat(localStorage.getItem('userWorkHours')) || 160;

const settingWorkHoursEl = document.getElementById('setting-work-hours');
const saveTimeMoneyBtn = document.getElementById('save-time-money-btn');
const timeCostDisplay = document.getElementById('time-cost-display');
const timeCostValue = document.getElementById('time-cost-value');



if(settingWorkHoursEl) settingWorkHoursEl.value = userWorkHours || 160;

if(saveTimeMoneyBtn) {
    saveTimeMoneyBtn.onclick = () => {
        userWorkHours = parseFloat(settingWorkHoursEl.value) || 160;
        localStorage.setItem('userWorkHours', userWorkHours);
        showNotify("Çalışma saati kaydedildi!", "fa-check");
        if(accessToken) backupToDrive(true);
    };
}

// ==========================================
