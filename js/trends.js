// 📈 HARCAMA TRENDLERİ (ULTRA PREMIUM DROPDOWN)
// ==========================================
const customDropdown = document.getElementById('trend-custom-dropdown');
const dropdownSelected = document.getElementById('trend-dropdown-selected');
const selectedText = document.getElementById('trend-selected-text');
const dropdownOptions = document.getElementById('trend-dropdown-options');

const TREND_ALL_VALUE = '__all__';
const TREND_COLORS = [
    '#4a6cf7', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#f97316', '#d946ef', '#14b8a6', '#64748b'
];

// Menüyü Aç/Kapat
if (dropdownSelected) {
    dropdownSelected.addEventListener('click', () => {
        if (customDropdown) customDropdown.classList.toggle('active');
    });
}

// Menü Dışına Tıklanınca Kapansın
document.addEventListener('click', (e) => {
    if (customDropdown && !customDropdown.contains(e.target)) {
        customDropdown.classList.remove('active');
    }
});

function getTrendExpenseGroups() {
    const expenses = transactions.filter(t => t.amount < 0 && t.text && t.date);
    const grouped = {};

    expenses.forEach(t => {
        const key = t.text.trim().toLowerCase();
        if (!key) return;

        if (!grouped[key]) {
            grouped[key] = {
                key,
                label: t.text.trim(),
                items: []
            };
        }

        grouped[key].items.push(t);
    });

    return Object.values(grouped)
        .filter(group => group.items.length > 1)
        .sort((a, b) => a.label.localeCompare(b.label, 'tr'));
}

function createTrendDropdownItem(label, onClick) {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.innerText = label;
    item.addEventListener('click', () => {
        if (selectedText) selectedText.innerText = label;
        if (customDropdown) customDropdown.classList.remove('active');
        onClick();
    });
    return item;
}

function initTrendOptions() {
    if(!dropdownOptions) return;

    const trendGroups = getTrendExpenseGroups();
    dropdownOptions.innerHTML = '';

    if (trendGroups.length === 0) {
        if (selectedText) selectedText.innerText = 'Tekrarlayan harcama yok';
        if(trendChartInstance) trendChartInstance.destroy();
        trendChartInstance = null;
        return;
    }

    dropdownOptions.appendChild(createTrendDropdownItem('Tümü', () => renderAllTrendCharts(trendGroups)));

    trendGroups.forEach(group => {
        dropdownOptions.appendChild(createTrendDropdownItem(group.label, () => renderTrendChart(group.key)));
    });

    if (selectedText && (selectedText.innerText === 'Harcama Seçin' || selectedText.innerText === 'Tekrarlayan harcama yok')) {
        selectedText.innerText = 'Tümü';
        renderAllTrendCharts(trendGroups);
    }
}

function getTrendMonthlyData(items) {
    const monthlyData = {};

    items.forEach(t => {
        const monthStr = t.date.substring(0, 7);
        monthlyData[monthStr] = (monthlyData[monthStr] || 0) + Math.abs(t.amount);
    });

    return monthlyData;
}

function formatTrendLabel(monthKey) {
    const [year, month] = monthKey.split('-');
    const monthNamesTR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    return `${monthNamesTR[parseInt(month, 10) - 1]} ${year}`;
}

function renderTrendChart(selectedNameLowerCase) {
    if(!trendCtx || !selectedNameLowerCase) return;

    const expenses = transactions
        .filter(t => t.amount < 0 && t.text && t.text.trim().toLowerCase() === selectedNameLowerCase)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const monthlyData = getTrendMonthlyData(expenses);
    const labels = Object.keys(monthlyData).sort();
    const data = labels.map(l => monthlyData[l]);
    const displayLabels = labels.map(formatTrendLabel);

    if(trendChartInstance) trendChartInstance.destroy();

    trendChartInstance = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: displayLabels,
            datasets: [{
                label: 'Aylık Ödenen Tutar',
                data: data,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                borderWidth: 3,
                pointBackgroundColor: '#ea580c',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (ctx) => ` ${currentCurrency}${ctx.raw.toFixed(2)}` } }
            },
            scales: {
                y: { beginAtZero: true, min: 0, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderAllTrendCharts(existingGroups = null) {
    if(!trendCtx) return;

    const trendGroups = existingGroups || getTrendExpenseGroups();
    if (trendGroups.length === 0) return;

    const monthKeys = [...new Set(
        trendGroups.flatMap(group => group.items.map(t => t.date.substring(0, 7)))
    )].sort();

    const datasets = trendGroups.map((group, index) => {
        const monthlyData = getTrendMonthlyData(group.items);
        const color = TREND_COLORS[index % TREND_COLORS.length];

        return {
            label: group.label,
            data: monthKeys.map(monthKey => monthlyData[monthKey] ?? null),
            borderColor: color,
            backgroundColor: color,
            borderWidth: 2,
            pointBackgroundColor: color,
            pointBorderColor: '#fff',
            pointBorderWidth: 1,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: false,
            tension: 0.25,
            spanGaps: true
        };
    });

    if(trendChartInstance) trendChartInstance.destroy();

    trendChartInstance = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: monthKeys.map(formatTrendLabel),
            datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'nearest', intersect: false },
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        boxHeight: 12,
                        usePointStyle: true,
                        padding: 14
                    }
                },
                tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${currentCurrency}${ctx.raw.toFixed(2)}` } }
            },
            scales: {
                y: { beginAtZero: true, min: 0, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}
