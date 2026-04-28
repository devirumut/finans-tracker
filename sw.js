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

// ==========================================
// 🔔 BİLDİRİM TIKLANMA OLAYI (APP'İ ÖNE GETİR)
// ==========================================
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Tıklayınca bildirimi sistemden sil
    
    // Uygulama açıksa o sekmeye odaklan, kapalıysa yeni sekmede uygulamayı aç
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(function(clientList) {
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url.includes('/') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('./');
            }
        })
    );
});