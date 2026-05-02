// ==========================================
// PWA OTOMATİK GÜNCELLEME YARDIMCISI
// ==========================================
(function () {
  if (!('serviceWorker' in navigator)) return;

  let refreshing = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');

      // Her açılışta sadece sw.js değişmiş mi diye hafif kontrol yapar.
      registration.update();

      // Uygulama açık kalırsa 30 dakikada bir kontrol eder.
      setInterval(() => registration.update(), 30 * 60 * 1000);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    } catch (error) {
      console.warn('Service Worker güncelleme kontrolü başarısız:', error);
    }
  });
})();
