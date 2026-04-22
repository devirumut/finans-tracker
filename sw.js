const CACHE_NAME = 'finans-tracker-v4';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js'
];

// Yükleme aşamasında dosyaları önbelleğe al
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// İnternet olmasa bile önbellekten dosyaları getir (Offline destek)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Önbellekte varsa onu ver
                }
                return fetch(event.request); // Yoksa internetten çek
            })
    );
});