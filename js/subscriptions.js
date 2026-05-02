// 11. ABONELİK SİSTEMİ VE AKILLI HATIRLATICI
// ==========================================
let editingSubscriptionId = null;

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
        html += `<div class="ticker-item">${icon} <span>${escapeHTML(sub.name)}:</span> <span class="ticker-number">${escapeHTML(sub.number)}</span></div><i class="fa-solid fa-circle-small ticker-separator"></i>`; 
    });
    tickerEl.innerHTML = html;
}

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
                <span style="display:flex; align-items:center; gap:8px;">${icon} ${escapeHTML(sub.name)} <span class="category-badge">${escapeHTML(sub.category)}</span></span>
                <small>No: <strong>${escapeHTML(sub.number)}</strong>${dayText}</small>
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
            subscriptions.push({ id: Date.now(), category: cat, name: name, number: num, day: parseInt(day) });
            showNotify("Abonelik eklendi", "fa-check");
        }
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
        initSubscriptions();
        subForm.reset();
        if(accessToken) backupToDrive(true);
    };
}

function checkUpcomingPayments() {
    const container = document.getElementById('payment-reminders-container');
    if(!container || !notifyReminderEnabled) { 
        if(container) container.style.display = 'none'; 
        return; 
    }
    
    container.innerHTML = '';
    container.style.display = 'none';

    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    let remindersHTML = '';
    let hasReminders = false;

    // Her gün aynı bildirimi defalarca atmamak için basit bir kontrol mekanizması
    const lastPushDate = localStorage.getItem('lastPushDate');
    const todayString = today.toISOString().split('T')[0];
    let shouldSendPush = (lastPushDate !== todayString);

    subscriptions.forEach(sub => {
        if(!sub.day) return;
        let targetDay = sub.day > daysInMonth ? daysInMonth : sub.day;
        let diff = targetDay - currentDay;

        if (diff >= 0 && diff <= 3) {
            hasReminders = true;
            let timeText = diff === 0 ? "Bugün!" : `${diff} gün sonra`;
            let msg = `${sub.name} ödemesi yaklaştı (${timeText})`;
            
            // Ekrana basılacak HTML
            remindersHTML += `
                <div class="reminder-alert">
                    <i class="fa-solid fa-bell-concierge fa-shake"></i>
                    <span><strong>${sub.name}</strong> ödemesi yaklaştı <strong>(${timeText})</strong></span>
                </div>`;
                
            // 🚀 Gerçek Telefon Bildirimini Gönder (Günde sadece 1 kez)
            if (shouldSendPush) {
                sendNativePush("💳 Ödeme Hatırlatması", msg);
            }
        }
    });

    // Eğer bugün bildirim gönderildiyse tarihi kaydet ki bugün bir daha atmasın
    if (hasReminders && shouldSendPush) {
        localStorage.setItem('lastPushDate', todayString);
    }

    if(hasReminders) {
        container.style.display = 'flex';
        container.innerHTML = remindersHTML;
    }
}

// ==========================================
