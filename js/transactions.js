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
        if(transaction.isPaid) showNotify("Harcama 'Ödendi'!", "fa-check-circle"); else showNotify("Harcama 'Ödenmedi' durumuna alındı!", "fa-clock");
        if(accessToken) backupToDrive(true);
    }
};

window.removeTransaction = function(id) { transactions = transactions.filter(t => t.id !== id); localStorage.setItem('transactions', JSON.stringify(transactions)); init(); };

function addTransactionDOM(t) {
    const item = document.createElement('li'); item.classList.add('transaction-item');
    const isPaid = t.isPaid !== false; if (t.amount < 0 && !isPaid) item.classList.add('unpaid-item'); 
    const sign = t.amount < 0 ? '-' : '+';
    let statusBadge = ''; 
    let actionBtns = `<button class="list-btn edit-btn" onclick="editTransaction(${t.id})" title="Düzenle"><i class="fa-regular fa-pen-to-square"></i></button><button class="list-btn delete-btn" onclick="removeTransaction(${t.id})" title="Sil"><i class="fa-regular fa-trash-can"></i></button>`;
    
    if (t.amount < 0) {
        if (isPaid) {
            statusBadge = `<span class="category-badge" style="background: rgba(16, 185, 129, 0.1); color: var(--success-color); border: 1px solid var(--success-color);"><i class="fa-solid fa-check"></i> Ödendi</span>`;
            actionBtns = `<button class="list-btn undo-pay-btn" onclick="togglePaymentStatus(${t.id})" title="Geri Al"><i class="fa-solid fa-arrow-rotate-left"></i></button>` + actionBtns;
        } else {
            statusBadge = `<span class="category-badge" style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color); border: 1px solid var(--danger-color);"><i class="fa-regular fa-clock"></i> Ödenmedi</span>`;
            actionBtns = `<button class="list-btn pay-btn" onclick="togglePaymentStatus(${t.id})" title="Ödendi İşaretle"><i class="fa-solid fa-check"></i> Öde</button>` + actionBtns;
        }
    }

    // ⏳ Zaman maliyeti hesapla ve ikonu oluştur
    const timeCost = (t.amount < 0) ? getTimeCostString(t.amount, t.date) : null;
    const timeHtml = timeCost ? `
        <i class="fa-solid fa-circle-info time-info-btn" onclick="toggleTimeCost(this)" title="Zaman Maliyeti"></i>
        <span class="time-cost-badge">⌛ ${timeCost}</span>
    ` : '';

    const safeText = escapeHTML(t.text);
    const safeCategory = escapeHTML(t.category);

    // Tüm yapıyı TEK SEFERDE HTML'e basıyoruz (Eski ezilme sorunu çözüldü)
    item.innerHTML = `
        <div class="transaction-info">
            <span style="display:flex; align-items:center; gap:8px;">
                ${safeText} <span class="category-badge">${safeCategory}</span> ${statusBadge} ${timeHtml}
            </span>
            <small>${new Date(t.date).toLocaleDateString('tr-TR')}</small>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
            <span class="transaction-amount ${t.amount < 0 ? 'amount-minus' : 'amount-plus'}" style="margin-right: 10px;">${sign}${currentCurrency}${Math.abs(t.amount).toFixed(2)}</span>
            <div style="display:flex; gap:5px;">${actionBtns}</div>
        </div>
    `;
    if (listEl) listEl.appendChild(item);
}

// İkon tıklama mantığı (Artık sorunsuz çalışacak)
window.toggleTimeCost = (btn) => {
    const badge = btn.nextElementSibling;
    const isOpen = badge.style.display === 'inline-block';
    badge.style.display = isOpen ? 'none' : 'inline-block';
};

function updateValues(currentTransactions) {
    const total = currentTransactions.reduce((acc, t) => acc + t.amount, 0).toFixed(2);
    const inc = currentTransactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0).toFixed(2);
    const exp = Math.abs(currentTransactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0)).toFixed(2);
    
    if(balanceEl) balanceEl.innerText = `${currentCurrency}${total}`; 
    if(incomeEl) incomeEl.innerText = `${currentCurrency}${inc}`; 
    if(expenseEl) expenseEl.innerText = `${currentCurrency}${exp}`;
    
    updateIncomeExpenseUI(parseFloat(inc), parseFloat(exp));
    generateAIInsights(currentTransactions, parseFloat(inc), parseFloat(exp));
}

function generateAIInsights(transactions, totalInc, totalExp) {
    const aiContainer = document.getElementById('ai-insights-text');
    if(!aiContainer) return;

    let insights = [];

    if(totalInc > 0) {
        const saveRate = (((totalInc - totalExp) / totalInc) * 100).toFixed(1);
        if(saveRate > 20) insights.push(`Harika gidiyorsunuz! Bu ay gelirinizin <strong>%${saveRate}</strong> kadarını tasarruf ettiniz. Hedeflerinize hızla ulaşıyorsunuz. 🎯`);
        else if(saveRate > 0) insights.push(`Bütçeniz artıda ancak tasarruf oranınız <strong>(%${saveRate})</strong> biraz düşük. Bu ayki gereksiz harcamaları gözden geçirebilirsiniz. 💡`);
        else insights.push(`<strong>Dikkat!</strong> Giderleriniz gelirinizi aşmış durumda. Bütçeniz alarm veriyor, acil fren yapmalısınız! 🚨`);
    } else if (totalExp > 0) {
        insights.push(`Bu ay henüz bir gelir girmediniz ama harcama yapıyorsunuz. Bakiyeniz eriyor! 📉`);
    }

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


// YENİ PROJEEE/app.js - Akıllı Arama ve Sıralama Entegreli init()
function init() {
    if(listEl) listEl.innerHTML = '';
    const selectedMonth = monthFilterEl ? monthFilterEl.value : ''; 
    const searchTerm = searchEl ? searchEl.value.toLowerCase().trim() : '';
    const sortVal = document.getElementById('sort-filter') ? document.getElementById('sort-filter').value : 'date-desc';

    let filteredTransactions = transactions;

    if (searchTerm !== "") {
        // 🔍 Arama yapılıyorsa ay filtresini yoksay, tüm yılları tara
        filteredTransactions = transactions.filter(t => 
            t.text.toLowerCase().includes(searchTerm) || 
            (t.category && t.category.toLowerCase().includes(searchTerm))
        );
    } else {
        // 📅 Arama yoksa normal bir şekilde sadece seçili ayın verilerini getir
        filteredTransactions = transactions.filter(t => { 
            return !selectedMonth || t.date.startsWith(selectedMonth); 
        });
    }

    // 📉 YENİ: SIRALAMA MOTORU DEVREDE
    filteredTransactions.sort((a, b) => {
        if (sortVal === 'date-desc') {
            return new Date(b.date) - new Date(a.date) || b.id - a.id; // En Yeni (Varsayılan)
        } else if (sortVal === 'date-asc') {
            return new Date(a.date) - new Date(b.date) || a.id - b.id; // En Eski
        } else if (sortVal === 'amount-desc') {
            return Math.abs(b.amount) - Math.abs(a.amount); // Tutar: En Yüksek
        } else if (sortVal === 'amount-asc') {
            return Math.abs(a.amount) - Math.abs(b.amount); // Tutar: En Düşük
        }
    });

    filteredTransactions.forEach(addTransactionDOM); 
    updateValues(filteredTransactions); 
    updateChart(filteredTransactions);
}

function changeMonth(offset) {
    if (!monthFilterEl || !monthFilterEl.value) return;
    let [year, month] = monthFilterEl.value.split('-').map(Number); month += offset;
    if (month > 12) { month = 1; year += 1; } else if (month < 1) { month = 12; year -= 1; }
    monthFilterEl.value = `${year}-${String(month).padStart(2, '0')}`;
    setDefaultDate();
    init(); 
}

if(monthFilterEl) monthFilterEl.addEventListener('change', () => { setDefaultDate(); init(); }); 
if(prevMonthBtn) prevMonthBtn.addEventListener('click', () => changeMonth(-1));
if(nextMonthBtn) nextMonthBtn.addEventListener('click', () => changeMonth(1));

// Mevcut Arama çubuğuna her harf girildiğinde tüm sistemi canlı güncelle
if(searchEl) {
    searchEl.addEventListener('input', init);
}

// ==========================================
// 🔍 ARAMA ÇUBUĞU TEMİZLEME (ÇARPI) BUTONU
// ==========================================
const searchInputEl = document.getElementById('search');
const clearSearchBtn = document.getElementById('clear-search-btn');

if (searchInputEl && clearSearchBtn) {
    // 1. Yazı yazıldıkça çarpıyı göster veya gizle
    searchInputEl.addEventListener('input', () => {
        if (searchInputEl.value.trim().length > 0) {
            clearSearchBtn.style.display = 'block';
        } else {
            clearSearchBtn.style.display = 'none';
        }
    });

    // 2. Çarpıya basılınca yazıyı sil, çarpıyı gizle ve listeyi orijinal haline döndür
    clearSearchBtn.addEventListener('click', () => {
        searchInputEl.value = ''; // Kutuyu boşalt
        clearSearchBtn.style.display = 'none'; // Çarpıyı gizle
        init(); // Tabloyu, grafikleri ve kartları sıfırla (Eski haline döndür)
    });
}

// ==========================================
// 📉 PREMIUM SIRALAMA KUTUSU (CUSTOM DROPDOWN) ZEKÂSI
// ==========================================
const sortCustomDropdown = document.getElementById('sort-custom-dropdown');
const sortDropdownSelected = document.getElementById('sort-dropdown-selected');
const sortSelectedText = document.getElementById('sort-selected-text');
const sortHiddenInput = document.getElementById('sort-filter');
const sortOptions = document.querySelectorAll('#sort-dropdown-options .dropdown-item');

if (sortDropdownSelected) {
    // Kutuya tıklayınca menüyü aç/kapat
    sortDropdownSelected.addEventListener('click', (e) => {
        e.stopPropagation(); // Sayfa geneli tıklamayı engelle
        sortCustomDropdown.classList.toggle('active');
    });
}

if (sortOptions.length > 0) {
    sortOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Seçilen yazıyı ve gizli değeri güncelle
            sortSelectedText.innerText = option.innerText;
            sortHiddenInput.value = option.getAttribute('data-value');
            
            // Menüyü pürüzsüzce kapat
            sortCustomDropdown.classList.remove('active');
            
            // Sıralamayı uygula (Listeyi yenile)
            init();
        });
    });
}

// Boşluğa tıklayınca sıralama menüsü kendiliğinden kapansın
document.addEventListener('click', (e) => {
    if (sortCustomDropdown && !sortCustomDropdown.contains(e.target)) {
        sortCustomDropdown.classList.remove('active');
    }
});

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
        const checkedType = document.querySelector('input[name="transaction-type"]:checked');
        if (!checkedType || !textEl.value.trim() || !amountEl.value || !categoryEl.value || !dateEl.value) {
            showNotify("Lütfen tüm zorunlu alanları doldurun.", "fa-triangle-exclamation");
            return;
        }
        const type = checkedType.value;
        let val = Math.abs(Number(amountEl.value));
        if (!Number.isFinite(val) || val <= 0) {
            showNotify("Tutar sıfırdan büyük olmalı.", "fa-triangle-exclamation");
            return;
        }
        if (type === 'expense') val *= -1;
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
