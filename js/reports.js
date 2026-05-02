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

if (resetAllCb) {
    resetAllCb.addEventListener('change', (e) => {
        document.querySelectorAll('.reset-item').forEach(cb => cb.checked = e.target.checked);
    });
}

document.querySelectorAll('.reset-item').forEach(item => {
    item.addEventListener('change', () => {
        const allChecked = Array.from(document.querySelectorAll('.reset-item')).every(cb => cb.checked);
        if (resetAllCb) resetAllCb.checked = allChecked;
    });
});

// YENİ PROJEEE/app.js - Sıfırlama Butonu Bloğunu Bununla Değiştir
if (confirmResetBtn) {
    confirmResetBtn.addEventListener('click', async () => {
        const chkTrans = document.getElementById('reset-transactions').checked;
        const chkSubs = document.getElementById('reset-subscriptions').checked;
        const chkCats = document.getElementById('reset-categories').checked;
        const chkNotes = document.getElementById('reset-notes').checked;
        const chkSettings = document.getElementById('reset-settings').checked;
        const chkDocs = document.getElementById('reset-documents').checked;

        // 🚨 DÜZELTME: chkDocs (!chkDocs) kontrolü buraya eklendi!
        if (!chkTrans && !chkSubs && !chkCats && !chkNotes && !chkSettings && !chkDocs) { 
            showNotify("Lütfen silmek için en az bir veri türü seçin!", "fa-triangle-exclamation"); 
            return; 
        }
        
        if (confirm("⚠️ DİKKAT: Seçtiğiniz veriler kalıcı olarak silinecektir! Onaylıyor musunuz?")) {
            if (chkTrans) { transactions = []; localStorage.removeItem('transactions'); init(); }
            if (chkSubs) { subscriptions = []; localStorage.removeItem('subscriptions'); initSubscriptions(); }
            if (chkCats) { userCategories = defaultCategories; localStorage.removeItem('userCategories'); initCategories(); }
            if (chkNotes) { notes = []; localStorage.removeItem('notes'); initNotes(); }
            if (chkSettings) { currentCurrency = '₺'; currentColorTheme = 'default'; localStorage.removeItem('currency'); localStorage.removeItem('colorTheme'); applyGeneralSettings(); }
            
            // Belgeleri Silme Komutu
            if (chkDocs) { documents = []; localStorage.removeItem('documents'); await documentFileStore.clear(); await initDocuments(); }
            
            if (resetModal) resetModal.style.display = 'none';
            document.querySelectorAll('.danger-checkbox').forEach(cb => cb.checked = false);
            showNotify("Veriler sıfırlandı.", "fa-check-double");
            if (accessToken) { showNotify("Yedek güncelleniyor...", "fa-spinner fa-spin"); await backupToDrive(true); }
        }
    });
}

// ==========================================
