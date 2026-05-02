// ==========================================
// GRAFİKLER VE GRAFİK SEÇİMİ
// ==========================================
function updateChartSelectionUI() {
    chartBtns.forEach(btn => {
        if (btn.getAttribute('data-value') === currentChartType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// YENİ PROJEEE/app.js - Güncel updateChart Fonksiyonu
function updateChart(currentTransactions) {
    if(!ctx) return;
    if (expenseChartInstance) expenseChartInstance.destroy();

    let totalIncome = 0; 
    const expenseCats = {};
    
    currentTransactions.forEach(t => { 
        if (t.amount > 0) { totalIncome += t.amount; } 
        else { expenseCats[t.category] = (expenseCats[t.category] || 0) + Math.abs(t.amount); } 
    });

    const bgColors = ['#10b981', '#ef4444', '#f97316', '#f59e0b', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

    // 1. KLASİK PASTA GRAFİĞİ
    if (currentChartType === 'doughnut') {
        const labels = ['Toplam Gelir', ...Object.keys(expenseCats)]; 
        const dataValues = [totalIncome, ...Object.values(expenseCats)];
        
        expenseChartInstance = new Chart(ctx, { 
            type: 'doughnut', 
            data: { labels: labels, datasets: [{ data: dataValues, backgroundColor: bgColors, borderWidth: 0 }] }, 
            options: { responsive: true, maintainAspectRatio: false, animation: { duration: 400 } } 
        });
    } 
    // 2. ÇUBUK (BAR) GRAFİĞİ
    else if (currentChartType === 'bar') {
        const labels = ['Toplam Gelir', ...Object.keys(expenseCats)]; 
        const dataValues = [totalIncome, ...Object.values(expenseCats)];
        
        expenseChartInstance = new Chart(ctx, { 
            type: 'bar', 
            data: { labels: labels, datasets: [{ label: 'Tutar', data: dataValues, backgroundColor: bgColors, borderRadius: 6 }] }, 
            options: { 
                responsive: true, maintainAspectRatio: false, animation: { duration: 400 },
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            } 
        });
    } 
    // 3. GİDER YOĞUNLUĞU (Polar Area / Kutup Grafiği)
    else if (currentChartType === 'polar') {
        let labels = Object.keys(expenseCats); 
        let dataValues = Object.values(expenseCats);
        let isEmpty = false;

        // Eğer henüz harcama girilmemişse grafik boş kalmasın ama yalan veri de göstermesin
        if (labels.length === 0) {
            labels = ['Henüz Harcama Yok'];
            dataValues = [1]; // Şeklin çizilmesi için matematiksel 1 veriyoruz
            isEmpty = true;   // Ama sistem bunun boş olduğunu bilecek!
        }

        expenseChartInstance = new Chart(ctx, { 
            type: 'polarArea', 
            data: { 
                labels: labels, 
                datasets: [{ 
                    data: dataValues, 
                    // Eğer boşsa soluk gri bir daire çiz, doluysa renkli çiz
                    backgroundColor: isEmpty 
                        ? ['rgba(148, 163, 184, 0.2)'] 
                        : [
                        'rgba(239, 68, 68, 0.75)',   // Kırmızı
                        'rgba(249, 115, 22, 0.75)',  // Turuncu
                        'rgba(245, 158, 11, 0.75)',  // Sarı
                        'rgba(6, 182, 212, 0.75)',   // Turkuaz
                        'rgba(59, 130, 246, 0.75)',  // Mavi
                        'rgba(139, 92, 246, 0.75)',  // Mor
                        'rgba(217, 70, 239, 0.75)'   // Pembe
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }] 
            }, 
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                animation: { duration: 700, easing: 'easeOutBounce' },
                plugins: { 
                    legend: { display: false },
                    tooltip: { 
                        callbacks: { 
                            label: function(context) { 
                                // Boşken 1 TL yazmasın, bilgi versin!
                                if (isEmpty) return " Harcama eklediğinizde şekillenecektir.";
                                return ` ${currentCurrency}${context.raw.toFixed(2)}`; 
                            } 
                        } 
                    }
                },
                scales: {
                    r: {
                        ticks: { display: false },
                        grid: { color: 'rgba(0,0,0,0.08)' }
                    }
                }
            } 
        });
    }
}

chartBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentChartType = btn.getAttribute('data-value');
        localStorage.setItem('chartType', currentChartType);
        updateChartSelectionUI();
        init(); // Grafiği tazelemek için
        
        // 🚨 DÜZELTME: innerText yerine textContent kullanarak mobilde gizli olan ismi de alıyoruz
        const chartName = btn.querySelector('span') ? btn.querySelector('span').textContent.trim() : "Grafik";
        showNotify(`${chartName} moduna geçildi`, "fa-chart-line");
    });
});

// Sayfa yüklendiğinde aktif olanı işaretle
updateChartSelectionUI();
