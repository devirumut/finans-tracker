// 🔔 BİLDİRİM AYARLARI VE NATIVE PUSH MOTORU
// ==========================================
let notifyUIEnabled = localStorage.getItem('notifyUIEnabled') !== 'false'; 
let notifyReminderEnabled = localStorage.getItem('notifyReminderEnabled') !== 'false'; 

const notifyUIEl = document.getElementById('setting-notify-ui');
const notifyReminderEl = document.getElementById('setting-notify-reminder');
const saveNotifBtn = document.getElementById('save-notif-settings-btn');

// Arayüz yüklendiğinde butonların durumunu ayarla
if(notifyUIEl) notifyUIEl.checked = notifyUIEnabled;
if(notifyReminderEl) notifyReminderEl.checked = notifyReminderEnabled;

// 🚀 NATIVE PUSH: Kullanıcıdan İzin İsteme Fonksiyonu
async function requestPushPermission() {
    if (!("Notification" in window)) {
        showNotify("Tarayıcınız bildirimleri desteklemiyor.", "fa-circle-xmark");
        return false;
    }
    if (Notification.permission === "granted") return true;

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }
    return false;
}

// 🚀 NATIVE PUSH: Gerçek İşletim Sistemi Bildirimi Gönderme Fonksiyonu
function sendNativePush(title, body) {
    if (Notification.permission === "granted" && notifyReminderEnabled) {
        // PWA ve mobil cihazlarda en stabil yöntem Service Worker üzerinden göndermektir
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: body,
                icon: "./icon-192.png", // Uygulamanın ikonu
                badge: "./icon-192.png", // Android üst barda görünen küçük ikon
                vibrate: [200, 100, 200] // Telefonu titreştir
            });
        }).catch(err => {
            // Eğer Service Worker hazır değilse standart yöntemle gönder
            new Notification(title, { body: body, icon: "./icon-192.png" });
        });
    }
}

// Ayarları Kaydetme Butonu (Güncellendi)
if(saveNotifBtn) {
    saveNotifBtn.onclick = async () => {
        // Kullanıcı hatırlatıcıları açmak istiyorsa, önce tarayıcıdan izin isteyelim
        if (notifyReminderEl.checked && Notification.permission !== "granted") {
            const granted = await requestPushPermission();
            if (!granted) {
                showNotify("İşletim sistemi bildirimlerine izin vermelisiniz!", "fa-triangle-exclamation");
                notifyReminderEl.checked = false; // İzin verilmediyse butonu geri kapat
            } else {
                // İzin ilk kez verildiğinde test bildirimi gönder
                sendNativePush("Harika! 🚀", "Finans Asistanı bildirimleri başarıyla aktifleştirildi.");
            }
        }

        notifyUIEnabled = notifyUIEl.checked;
        notifyReminderEnabled = notifyReminderEl.checked;
        
        localStorage.setItem('notifyUIEnabled', notifyUIEnabled);
        localStorage.setItem('notifyReminderEnabled', notifyReminderEnabled);
        
        checkUpcomingPayments();
        
        // Sadece ekranda (Toast) uyarı göster
        const tempState = notifyUIEnabled;
        notifyUIEnabled = true; 
        showNotify("Bildirim ayarları başarıyla kaydedildi!", "fa-check");
        notifyUIEnabled = tempState;
        
        if(accessToken) backupToDrive(true);
    };
}


// ==========================================
