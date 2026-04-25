const CACHE_NAME = 'finans-tracker-v3';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js'
];

// 1. Kurulum Aşaması
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// 2. Aktifleşme ve Temizlik (ESKİ İNATÇI HAFIZALARI SİLER)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. Ağ İstekleri (NETWORK FIRST: Önce internet, yoksa hafıza)
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});