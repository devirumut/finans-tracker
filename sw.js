// SÜREKLİ GÜNCEL KALAN DİNAMİK CACHE (Artık manuel versiyon yazmaya SON!)
// İsmini o anın saatine göre milisaniye cinsinden kendi belirler.
const CACHE_NAME = 'finans-tracker-auto-' + new Date().getTime();

const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js'
];

// 1. Kurulum: Beklemeyi reddet, anında yüklen
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting(); 
});

// 2. Aktifleşme: Eski inatçı hafızaları acımadan sil
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
    self.clients.claim(); // Sayfanın kontrolünü anında ele geçir
});

// 3. Ağ İstekleri: Önce internetten tazesini çek, internet yoksa (çevrimdışıysa) önbelleği kullan
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});