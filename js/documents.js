// BELGE YÜKLEME VE LİSTELEME MANTIĞI
const addDocBtn = document.getElementById('add-doc-btn');
const docFormContainer = document.getElementById('doc-form-container');
const docUploadForm = document.getElementById('document-upload-form');
const cancelDocBtn = document.getElementById('cancel-doc-btn');

if(addDocBtn) addDocBtn.onclick = () => docFormContainer.style.display = 'block';
if(cancelDocBtn) cancelDocBtn.onclick = () => {
    docFormContainer.style.display = 'none';
    docUploadForm.reset();
    const display = document.getElementById('file-name-display');
    if (display) display.textContent = 'Dosya Seç veya Foto Çek';
};

// Belge dosyaları artık localStorage yerine IndexedDB içinde saklanır.
// localStorage yalnızca küçük metadata bilgisini taşır.
if(docUploadForm) {
    docUploadForm.onsubmit = async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('doc-file');
        const file = fileInput.files[0];
        if (!file) return;

        const id = Date.now();
        const newDoc = {
            id,
            name: document.getElementById('doc-name').value.trim(),
            category: document.getElementById('doc-category').value,
            date: document.getElementById('doc-date').value,
            description: document.getElementById('doc-desc').value.trim(),
            fileName: file.name,
            fileType: file.type || 'application/octet-stream',
            fileSize: file.size,
            storage: 'indexedDB'
        };

        try {
            await documentFileStore.put(id, file);
            documents.unshift(newDoc);
            await persistDocumentsMeta();
            await initDocuments();
            cancelDocBtn.onclick();
            showNotify("Belge arşive eklendi!", "fa-file-shield");
            if(accessToken) backupToDrive(true);
        } catch (err) {
            console.error('Belge kaydedilemedi:', err);
            showNotify("Belge kaydedilemedi!", "fa-circle-xmark");
        }
    };
}

// YENİ PROJEEE/app.js - initDocuments fonksiyonunu güncelleyin// YENİ PROJEEE/app.js - initDocuments fonksiyonunu güncelleyin
async function initDocuments() {
    const grid = document.getElementById('documents-grid');
    if(!grid) return;

    await migrateLegacyDocumentsToIndexedDB();
    grid.innerHTML = '';
    
    if(documents.length === 0) {
        grid.innerHTML = '<div class="documents-empty-state"><i class="fa-regular fa-folder-open fa-3x"></i><p>Arşiv henüz boş.</p></div>';
        return;
    }

    documents.forEach(doc => {
        const div = document.createElement('div');
        div.className = 'doc-card';
        const icon = doc.category === 'Fiş' ? 'fa-receipt' : doc.category === 'Fatura' ? 'fa-file-invoice-dollar' : 'fa-certificate';
        const descHtml = doc.description ? `<p title="${escapeHTML(doc.description)}">${escapeHTML(doc.description)}</p>` : '';
        const fileSizeText = doc.fileSize ? ` • ${(doc.fileSize / 1024 / 1024).toFixed(2)} MB` : '';

        div.innerHTML = `
            <div class="doc-icon"><i class="fa-solid ${icon}"></i></div>
            <div class="doc-info">
                <h4>${escapeHTML(doc.name)}</h4>
                <small>${escapeHTML(doc.category)} • ${new Date(doc.date).toLocaleDateString('tr-TR')}${fileSizeText}</small>
                ${descHtml}
            </div>
            <div class="doc-actions">
                <button type="button" class="doc-action-btn download" onclick="downloadDocument(${doc.id})" title="İndir">
                    <i class="fa-solid fa-download"></i><span>İndir</span>
                </button>
                <button type="button" class="doc-action-btn delete" onclick="deleteDocument(${doc.id})" title="Sil">
                    <i class="fa-solid fa-trash-can"></i><span>Sil</span>
                </button>
            </div>
        `;
        grid.appendChild(div);
    });
}

window.downloadDocument = async (id) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    try {
        const file = await documentFileStore.get(id);
        if (!file) {
            showNotify("Dosya bulunamadı. Metadata var ancak dosya deposu boş.", "fa-triangle-exclamation");
            return;
        }
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.fileName || doc.name || 'belge';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
        console.error('Belge indirilemedi:', err);
        showNotify("Belge indirilemedi!", "fa-circle-xmark");
    }
};

window.deleteDocument = async (id) => {
    if(confirm("Bu belgeyi silmek istediğinize emin misiniz?")) {
        documents = documents.filter(d => d.id !== id);
        await documentFileStore.delete(id);
        await persistDocumentsMeta();
        await initDocuments();
        showNotify("Belge silindi.", "fa-trash");
        if(accessToken) backupToDrive(true);
    }
};

// YENİ PROJEEE/app.js - Dosya seçildiğinde ismini göster// YENİ PROJEEE/app.js - Dosya seçildiğinde ismini göster
document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'doc-file') {
        const fileName = e.target.files[0] ? e.target.files[0].name : "Dosya Seç veya Foto Çek";
        const display = document.getElementById('file-name-display');
        if (display) display.textContent = fileName.length > 20 ? fileName.substring(0, 17) + "..." : fileName;
    }
});

if (amountEl) amountEl.addEventListener('input', calculateTimeCost);
if (dateEl) dateEl.addEventListener('change', calculateTimeCost);
if (typeExpense) typeExpense.addEventListener('change', calculateTimeCost);
if (typeIncome) typeIncome.addEventListener('change', calculateTimeCost);

// YENİ PROJEEE/app.js
function calculateTimeCost() {
    if (!timeCostDisplay || !timeCostValue) return;
    
    const amount = parseFloat(amountEl.value) || 0;
    const isExpense = typeExpense && typeExpense.checked;

    if (amount <= 0 || !isExpense || userWorkHours <= 0) {
        timeCostDisplay.style.display = 'none';
        return;
    }

    const transactionDate = dateEl && dateEl.value ? dateEl.value : null;
    const timeCost = getTimeCostString(-Math.abs(amount), transactionDate);

    if (!timeCost) {
        timeCostDisplay.style.display = 'none';
        return;
    }

    timeCostValue.innerText = timeCost;
    timeCostDisplay.style.display = 'block';
}

if(formEl) {
    formEl.addEventListener('reset', () => {
        if(timeCostDisplay) timeCostDisplay.style.display = 'none';
    });
}
// ==========================================
