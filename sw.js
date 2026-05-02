// ==========================================
// PWA SERVICE WORKER - OTOMATİK GÜNCELLEME STRATEJİSİ
// ==========================================
// Manuel APP_VERSION değiştirmen gerekmez.
// Online iken index/css/js dosyaları ağdan taze alınır, sonra cache güncellenir.
// Offline iken son çalışan cache kullanılır.
// localStorage / IndexedDB verileri silinmez.

const CACHE_NAME = 'finans-tracker-app-shell';

const APP_SHELL_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',

  './css/components.css',
  './css/layout.css',
  './css/mobile.css',
  './css/themes.css',

  './js/bootstrap.js',
  './js/calendar.js',
  './js/categories.js',
  './js/charts.js',
  './js/core.js',
  './js/datePickerEnhance.js',
  './js/documents.js',
  './js/driveSync.js',
  './js/notes.js',
  './js/notifications.js',
  './js/pdfReport.js',
  './js/pwaUpdate.js',
  './js/reports.js',
  './js/settings.js',
  './js/state.js',
  './js/storage.js',
  './js/subscriptions.js',
  './js/transactions.js',
  './js/trends.js',
  './js/ui.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(cacheName => cacheName.startsWith('finans-tracker-') && cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Harici servisleri agresif cache'leme.
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // Uygulama dosyaları: online ise daima taze dosya, offline ise cache.
  // Böylece GitHub'a dosya yükleyince APP_VERSION elle değiştirmeye gerek kalmaz.
  if (
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    ['style', 'script', 'manifest', 'image'].includes(request.destination) ||
    APP_SHELL_URLS.some(asset => url.pathname.endsWith(asset.replace('./', '/')))
  ) {
    event.respondWith(networkFirstAndUpdateCache(request));
    return;
  }

  event.respondWith(networkFirstAndUpdateCache(request));
});

async function networkFirstAndUpdateCache(request) {
  try {
    const freshResponse = await fetch(request, { cache: 'no-store' });

    if (freshResponse && freshResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, freshResponse.clone());
    }

    return freshResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    throw error;
  }
}

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
