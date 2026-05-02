// 4. GENEL AYARLAR (TEMA VE PARA BİRİMİ)
// ==========================================
function applyGeneralSettings() {
    document.body.classList.remove('theme-green', 'theme-purple', 'theme-orange');
    if(currentColorTheme !== 'default') document.body.classList.add(currentColorTheme);
    
    document.querySelectorAll('#currency-selector .circle-btn').forEach(btn => {
        if(btn.getAttribute('data-value') === currentCurrency) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    document.querySelectorAll('#theme-selector .theme-color-btn').forEach(btn => {
        if(btn.getAttribute('data-value') === currentColorTheme) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    if(amountEl) amountEl.placeholder = `Tutar (${currentCurrency})`;
}

document.querySelectorAll('#currency-selector .circle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentCurrency = e.target.closest('.circle-btn').getAttribute('data-value');
        localStorage.setItem('currency', currentCurrency);
        applyGeneralSettings(); init(); if(yearlyView && yearlyView.style.display !== 'none') { initYearlyStatus(); }
        showNotify(`Para birimi ${currentCurrency} yapıldı`, "fa-coins");
    });
});

document.querySelectorAll('#theme-selector .theme-color-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentColorTheme = e.target.closest('.theme-color-btn').getAttribute('data-value');
        localStorage.setItem('colorTheme', currentColorTheme);
        applyGeneralSettings(); showNotify("Tema güncellendi", "fa-palette");
    });
});

if(themeBtn) { 
    themeBtn.onclick = () => { 
        document.body.classList.toggle('dark-mode'); 
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); 
    }; 
}
if(localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');

// ==========================================
