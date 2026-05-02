// 18. GÖRSEL HARCAMA TAKVİMİ MOTORU
// ==========================================
let calCurrentDate = new Date();

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthText = document.getElementById('cal-current-month-text');
    const totalIncEl = document.getElementById('cal-total-income');
    const totalExpEl = document.getElementById('cal-total-expense');
    const totalBalEl = document.getElementById('cal-total-balance');

    if(!grid || !monthText) return;

    const year = calCurrentDate.getFullYear();
    const month = calCurrentDate.getMonth();
    
    const monthNamesTR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    monthText.innerText = `${monthNamesTR[month]} ${year}`;
    grid.innerHTML = '';

    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthTransactions = transactions.filter(t => t.date.startsWith(prefix));
    
    const monthInc = monthTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const monthExp = Math.abs(monthTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
    const monthNet = monthInc - monthExp;

    if(totalIncEl) totalIncEl.innerText = `${currentCurrency}${monthInc.toLocaleString('tr-TR', {minimumFractionDigits: 0})}`;
    if(totalExpEl) totalExpEl.innerText = `${currentCurrency}${monthExp.toLocaleString('tr-TR', {minimumFractionDigits: 0})}`;
    if(totalBalEl) {
        const sign = monthNet < 0 ? '-' : '';
        totalBalEl.innerText = `${sign}${currentCurrency}${Math.abs(monthNet).toLocaleString('tr-TR', {minimumFractionDigits: 0})}`;
        totalBalEl.style.color = monthNet >= 0 ? '#10b981' : '#ef4444'; 
    }

    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 7 : firstDay; 
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        grid.appendChild(emptyDiv);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if(currentDateStr === todayStr) dayDiv.classList.add('today');

        const dayTrans = transactions.filter(t => t.date === currentDateStr);
        const inc = dayTrans.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const exp = Math.abs(dayTrans.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));

        let dayHtml = `<div class="day-number">${day}</div>`;
        if(inc > 0) dayHtml += `<div class="cal-income"><span><i class="fa-solid fa-arrow-up"></i></span> <span>${inc.toFixed(0)}</span></div>`;
        if(exp > 0) dayHtml += `<div class="cal-expense"><span><i class="fa-solid fa-arrow-down"></i></span> <span>${exp.toFixed(0)}</span></div>`;

        dayDiv.innerHTML = dayHtml;
        grid.appendChild(dayDiv);
    }
}

const calPrevBtn = document.getElementById('cal-prev-month');
const calNextBtn = document.getElementById('cal-next-month');
if(calPrevBtn) calPrevBtn.onclick = () => { calCurrentDate.setMonth(calCurrentDate.getMonth() - 1); renderCalendar(); };
if(calNextBtn) calNextBtn.onclick = () => { calCurrentDate.setMonth(calCurrentDate.getMonth() + 1); renderCalendar(); };

// ==========================================
