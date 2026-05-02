// ==========================================
// MODERN TARİH POPUP TAKVİMİ
// Görünen format: GG-AA-YYYY
// İç kayıt formatı: YYYY-MM-DD
// ==========================================
(function(){
  const isoInput = document.getElementById('date');
  const displayInput = document.getElementById('date-display');
  if (!isoInput || !displayInput) return;

  const monthNames = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const weekdayNames = ['Pt','Sa','Ça','Pe','Cu','Ct','Pz'];
  let selectedDate = null;
  let viewDate = null;
  let popup = null;

  function parseIsoDate(value) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [y,m,d] = value.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
    return date;
  }

  function parseDisplayDate(value) {
    if (!value || !/^\d{2}-\d{2}-\d{4}$/.test(value)) return null;
    const [d,m,y] = value.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
    return date;
  }

  function formatIsoDate(date) {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,'0');
    const d = String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  }

  function formatDisplayDate(date) {
    if (!date) return '';
    const d = String(date.getDate()).padStart(2,'0');
    const m = String(date.getMonth()+1).padStart(2,'0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  }

  function sameDay(a,b){
    return a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  }

  function currentDate() {
    return parseIsoDate(isoInput.value) || parseDisplayDate(displayInput.value) || new Date();
  }

  function syncDisplayFromIso() {
    const date = parseIsoDate(isoInput.value);
    displayInput.value = date ? formatDisplayDate(date) : '';
  }

  function syncFromInputs() {
    selectedDate = currentDate();
    viewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    syncDisplayFromIso();
    render();
  }

  function ensurePopup() {
    if (popup) return;
    popup = document.createElement('div');
    popup.className = 'date-picker-popup';
    popup.innerHTML = `
      <div class="date-picker-header">
        <button type="button" class="date-picker-nav" data-nav="prev" aria-label="Önceki ay">&#10094;</button>
        <div class="date-picker-title"></div>
        <button type="button" class="date-picker-nav" data-nav="next" aria-label="Sonraki ay">&#10095;</button>
      </div>
      <div class="date-picker-weekdays"></div>
      <div class="date-picker-grid"></div>
      <div class="date-picker-footer">
        <button type="button" class="date-picker-action" data-action="today">Bugün</button>
        <button type="button" class="date-picker-action primary" data-action="close">Tamam</button>
      </div>`;
    document.body.appendChild(popup);

    const weekdays = popup.querySelector('.date-picker-weekdays');
    weekdayNames.forEach(day => {
      const el = document.createElement('div');
      el.className = 'date-picker-weekday';
      el.textContent = day;
      weekdays.appendChild(el);
    });

    popup.addEventListener('click', (e) => {
      const nav = e.target.closest('[data-nav]');
      if (nav) {
        const dir = nav.getAttribute('data-nav');
        viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + (dir === 'prev' ? -1 : 1), 1);
        render();
        return;
      }

      const action = e.target.closest('[data-action]');
      if (action) {
        const type = action.getAttribute('data-action');
        if (type === 'today') {
          setSelectedDate(new Date(), true);
        } else if (type === 'close') {
          closePopup();
        }
        return;
      }

      const dayBtn = e.target.closest('.date-picker-day');
      if (dayBtn) {
        const date = parseIsoDate(dayBtn.dataset.date);
        if (date) setSelectedDate(date, true);
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (!popup.classList.contains('open')) return;
      if (e.target === displayInput || displayInput.contains(e.target)) return;
      if (popup.contains(e.target)) return;
      closePopup();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePopup();
    });

    window.addEventListener('resize', positionPopup);
    window.addEventListener('scroll', positionPopup, true);
  }

  function render() {
    if (!popup) return;
    popup.querySelector('.date-picker-title').textContent = `${monthNames[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
    const grid = popup.querySelector('.date-picker-grid');
    grid.innerHTML = '';

    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const gridStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1 - startOffset);
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'date-picker-day';
      if (date.getMonth() !== viewDate.getMonth()) btn.classList.add('is-outside');
      if (sameDay(date, today)) btn.classList.add('is-today');
      if (sameDay(date, selectedDate)) btn.classList.add('is-selected');
      btn.textContent = date.getDate();
      btn.dataset.date = formatIsoDate(date);
      grid.appendChild(btn);
    }
  }

  function positionPopup() {
    if (!popup || !popup.classList.contains('open')) return;
    const rect = displayInput.getBoundingClientRect();
    const margin = 8;
    let top = rect.bottom + margin;
    let left = rect.left;
    const popupWidth = popup.offsetWidth || 308;
    const popupHeight = popup.offsetHeight || 360;

    if (left + popupWidth > window.innerWidth - 10) left = window.innerWidth - popupWidth - 10;
    if (left < 10) left = 10;
    if (top + popupHeight > window.innerHeight - 10) top = Math.max(10, rect.top - popupHeight - margin);

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
  }

  function openPopup() {
    ensurePopup();
    syncFromInputs();
    popup.classList.add('open');
    positionPopup();
  }

  function closePopup() {
    if (popup) popup.classList.remove('open');
  }

  function setSelectedDate(date, shouldClose) {
    selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    viewDate = new Date(date.getFullYear(), date.getMonth(), 1);

    isoInput.value = formatIsoDate(selectedDate);
    displayInput.value = formatDisplayDate(selectedDate);

    isoInput.dispatchEvent(new Event('input', { bubbles: true }));
    isoInput.dispatchEvent(new Event('change', { bubbles: true }));
    displayInput.dispatchEvent(new Event('input', { bubbles: true }));
    displayInput.dispatchEvent(new Event('change', { bubbles: true }));

    render();
    if (shouldClose) closePopup();
  }

  displayInput.addEventListener('click', (e) => {
    e.preventDefault();
    openPopup();
  });
  displayInput.addEventListener('focus', openPopup);

  if (typeof window.setDefaultDate === 'function') {
    const originalSetDefaultDate = window.setDefaultDate;
    window.setDefaultDate = function() {
      const result = originalSetDefaultDate.apply(this, arguments);
      syncDisplayFromIso();
      return result;
    };
  }

  if (typeof window.editTransaction === 'function') {
    const originalEditTransaction = window.editTransaction;
    window.editTransaction = function() {
      const result = originalEditTransaction.apply(this, arguments);
      syncDisplayFromIso();
      syncFromInputs();
      return result;
    };
  }

  // dateEl.value dışarıdan değiştirildiğinde görünür alanı eşitle.
  isoInput.addEventListener('change', syncDisplayFromIso);
  isoInput.addEventListener('input', syncDisplayFromIso);

  // İlk durum
  syncDisplayFromIso();
  syncFromInputs();
})();
