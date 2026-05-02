// 10. KATEGORİ YÖNETİMİ
// ==========================================
// Kategori adındaki kelimelere ve anahtar kelimelere göre otomatik simge belirler.
const CATEGORY_ICON_RULES = [
    // Finans / gelir
    { icon: '💰', words: ['maaş', 'maas', 'gelir', 'ücret', 'ucret', 'avans', 'prim', 'ikramiye', 'burs', 'harçlık', 'harclik', 'mesai', 'ek ödeme', 'ek odeme', 'tazminat', 'maaş farkı', 'maas farki', 'bonus'] },
    { icon: '💸', words: ['nakit', 'para çekme', 'para cekme', 'para yatırma', 'para yatirma', 'havale', 'eft', 'fast', 'transfer'] },
    { icon: '📈', words: ['yatırım geliri', 'yatirim geliri', 'temettü', 'temettu', 'faiz geliri', 'getiri', 'kâr', 'kar payı', 'kar payi'] },

    // Banka / kredi / borç
    { icon: '💳', words: ['kredi kartı', 'kredi karti', 'kart', 'pos', 'ekstre', 'kredi', 'taksit', 'limit', 'asgari ödeme', 'asgari odeme', 'kart borcu'] },
    { icon: '🏦', words: ['banka', 'hesap', 'esnek hesap', 'kmh', 'kredili mevduat', 'mevduat', 'vadesiz', 'vadeli', 'iban', 'atm', 'komisyon', 'masraf', 'banka masrafı', 'banka masrafi', 'hesap işletim', 'hesap isletim'] },
    { icon: '📉', words: ['borç', 'borc', 'geri ödeme', 'geri odeme', 'ödeme planı', 'odeme plani', 'kredi borcu', 'ihtiyaç kredisi', 'ihtiyac kredisi', 'konut kredisi', 'taşıt kredisi', 'tasit kredisi', 'faiz'] },
    { icon: '🧾', words: ['vergi', 'ceza', 'harç', 'harc', 'resmi ödeme', 'resmi odeme', 'edevlet', 'e-devlet', 'mtv', 'trafik cezası', 'trafik cezasi', 'geçiş ihlali', 'gecis ihlali'] },

    // Altın / döviz / yatırım
    { icon: '🪙', words: ['altın', 'altin', 'gram altın', 'gram altin', 'çeyrek', 'ceyrek', 'yarım altın', 'yarim altin', 'tam altın', 'tam altin', 'cumhuriyet altını', 'cumhuriyet altini', 'reşat', 'resat', 'ziynet', 'ons', 'külçe', 'kulce', 'sarraf', 'bilezik'] },
    { icon: '💱', words: ['döviz', 'doviz', 'dolar', 'usd', 'euro', 'eur', 'sterlin', 'gbp', 'frank', 'chf', 'kur', 'exchange'] },
    { icon: '📊', words: ['borsa', 'hisse', 'hisse senedi', 'fon', 'yatırım', 'yatirim', 'kripto', 'bitcoin', 'btc', 'ethereum', 'eth', 'portföy', 'portfoy', 'viop', 'tefas'] },

    // Market / alışveriş
    { icon: '🛒', words: ['market', 'bakkal', 'manav', 'kasap', 'alışveriş', 'alisveris', 'migros', 'bim', 'a101', 'şok', 'sok', 'carrefour', 'gross', 'gıda', 'gida', 'erzak'] },
    { icon: '📦', words: ['kargo', 'paket', 'sipariş', 'siparis', 'e ticaret', 'e-ticaret', 'trendyol', 'hepsiburada', 'amazon', 'n11', 'pazarama'] },

    // Fatura / abonelik
    { icon: '⚡', words: ['fatura', 'elektrik', 'enerji', 'başkent elektrik', 'baskent elektrik'] },
    { icon: '💧', words: ['su', 'aski', 'su faturası', 'su faturasi'] },
    { icon: '🔥', words: ['doğalgaz', 'dogalgaz', 'gaz', 'başkentgaz', 'baskentgaz'] },
    { icon: '🌐', words: ['internet', 'wifi', 'fiber', 'modem', 'ttnet', 'superonline', 'kablonet', 'turknet'] },
    { icon: '📱', words: ['telefon', 'gsm', 'mobil', 'hat', 'turkcell', 'vodafone', 'türk telekom', 'turk telekom', 'faturalı', 'faturali'] },
    { icon: '📺', words: ['tv', 'televizyon', 'digiturk', 'dsmart', 'd-smart', 'netflix', 'disney', 'prime video', 'blu tv', 'blutv', 'exxen', 'gain'] },
    { icon: '🔔', words: ['abonelik', 'üyelik', 'uyelik', 'subscription', 'aylık ödeme', 'aylik odeme'] },

    // Ev / yaşam
    { icon: '🏠', words: ['kira', 'aidat', 'ev', 'konut', 'apartman', 'site yönetimi', 'site yonetimi'] },
    { icon: '🛋️', words: ['mobilya', 'koltuk', 'masa', 'sandalye', 'yatak', 'halı', 'hali', 'perde', 'dekorasyon'] },
    { icon: '🧹', words: ['temizlik', 'deterjan', 'çamaşır', 'camasir', 'bulaşık', 'bulasik', 'hijyen'] },
    { icon: '🔧', words: ['tamir', 'bakım', 'bakim', 'servis', 'usta', 'tesisat', 'onarım', 'onarim', 'yedek parça', 'yedek parca'] },

    // Ulaşım / araç
    { icon: '🚗', words: ['araba', 'araç', 'arac', 'oto', 'otomobil', 'otopark', 'hgs', 'ogs', 'muayene', 'sigorta araç', 'sigorta arac'] },
    { icon: '⛽', words: ['akaryakıt', 'akaryakit', 'benzin', 'mazot', 'motorin', 'lpg', 'petrol', 'yakıt', 'yakit', 'opet', 'shell', 'bp', 'aytemiz', 'total'] },
    { icon: '🚌', words: ['otobüs', 'otobus', 'dolmuş', 'dolmus', 'metro', 'ankaray', 'ego', 'ulaşım', 'ulasim', 'toplu taşıma', 'toplu tasima'] },
    { icon: '🚕', words: ['taksi', 'uber', 'bitaksi'] },
    { icon: '✈️', words: ['uçak', 'ucak', 'bilet', 'thy', 'pegasus', 'ajet', 'hava yolu', 'havayolu'] },

    // Yemek / sosyal
    { icon: '🍽️', words: ['yemek', 'restoran', 'lokanta', 'öğle yemeği', 'ogle yemegi', 'akşam yemeği', 'aksam yemegi', 'fast food'] },
    { icon: '☕', words: ['kahve', 'cafe', 'kafe', 'çay', 'cay', 'starbucks', 'espresso', 'latte'] },
    { icon: '🍕', words: ['pizza', 'burger', 'kebap', 'döner', 'doner', 'lahmacun', 'pide'] },

    // Sağlık
    { icon: '🏥', words: ['sağlık', 'saglik', 'hastane', 'doktor', 'muayene', 'randevu', 'tahlil', 'tetkik'] },
    { icon: '💊', words: ['eczane', 'ilaç', 'ilac', 'vitamin', 'reçete', 'recete'] },
    { icon: '🦷', words: ['diş', 'dis', 'dişçi', 'disci', 'ortodonti'] },
    { icon: '👓', words: ['gözlük', 'gozluk', 'lens', 'optik', 'göz', 'goz'] },

    // Eğitim / çocuk
    { icon: '🎓', words: ['eğitim', 'egitim', 'okul', 'kurs', 'ders', 'etüt', 'etut', 'üniversite', 'universite', 'akademi'] },
    { icon: '📚', words: ['kitap', 'kırtasiye', 'kirtasiye', 'defter', 'kalem', 'test', 'kaynak'] },
    { icon: '🧒', words: ['çocuk', 'cocuk', 'kreş', 'kres', 'anaokulu', 'bakıcı', 'bakici'] },

    // Eğlence / dijital
    { icon: '🎬', words: ['eğlence', 'eglence', 'sinema', 'film', 'dizi', 'tiyatro', 'konser'] },
    { icon: '🎮', words: ['oyun', 'playstation', 'xbox', 'steam', 'epic games', 'game pass'] },
    { icon: '🎵', words: ['müzik', 'muzik', 'spotify', 'youtube music', 'apple music'] },
    { icon: '🏋️', words: ['spor', 'fitness', 'gym', 'salon', 'pilates', 'yüzme', 'yuzme'] },

    // Giyim / kişisel bakım
    { icon: '👕', words: ['giyim', 'kıyafet', 'kiyafet', 'elbise', 'pantolon', 'tişört', 'tisort', 'mont', 'ceket'] },
    { icon: '👟', words: ['ayakkabı', 'ayakkabi', 'sneaker', 'bot', 'terlik'] },
    { icon: '💇', words: ['kuaför', 'kuafor', 'berber', 'saç', 'sac', 'bakım', 'bakim'] },
    { icon: '🧴', words: ['kozmetik', 'parfüm', 'parfum', 'cilt', 'şampuan', 'sampuan', 'kişisel bakım', 'kisisel bakim'] },

    // Seyahat / hediye / özel
    { icon: '🏨', words: ['otel', 'konaklama', 'pansiyon', 'airbnb'] },
    { icon: '🏖️', words: ['tatil', 'gezi', 'tur', 'plaj', 'seyahat'] },
    { icon: '🎁', words: ['hediye', 'doğum günü', 'dogum gunu', 'yılbaşı', 'yilbasi', 'özel gün', 'ozel gun'] },
    { icon: '🐾', words: ['pet', 'kedi', 'köpek', 'kopek', 'veteriner', 'mama', 'akvaryum'] },

    // Sigorta / hukuk / iş
    { icon: '🛡️', words: ['sigorta', 'kasko', 'poliçe', 'police', 'dask'] },
    { icon: '⚖️', words: ['avukat', 'hukuk', 'noter', 'dava', 'icra'] },
    { icon: '💼', words: ['iş', 'is', 'ofis', 'kurumsal', 'şirket', 'sirket'] },

    // Bağış / aile / diğer
    { icon: '🤝', words: ['bağış', 'bagis', 'yardım', 'yardim', 'destek', 'dernek', 'vakıf', 'vakif'] },
    { icon: '👨‍👩‍👧‍👦', words: ['aile', 'anne', 'baba', 'kardeş', 'kardes', 'akraba'] },
    { icon: '📦', words: ['diğer', 'diger', 'genel', 'misc', 'çeşitli', 'cesitli'] }
];

function normalizeCategoryText(value) {
    return String(value || '')
        .toLocaleLowerCase('tr-TR')
        .replace(/ı/g, 'i')
        .replace(/İ/g, 'i')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');
}

function categoryHasIcon(name) {
    return /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(String(name || ''));
}

function stripCategoryIcon(name) {
    return String(name || '')
        .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F\u200D]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function getAutoCategoryIcon(name, keywords = [], type = 'expense') {
    const haystack = normalizeCategoryText([name, ...(keywords || [])].join(' '));

    for (const rule of CATEGORY_ICON_RULES) {
        if (rule.words.some(word => haystack.includes(normalizeCategoryText(word)))) {
            return rule.icon;
        }
    }

    return type === 'income' ? '💰' : '📦';
}

function withAutoCategoryIcon(name, keywords = [], type = 'expense') {
    const baseName = stripCategoryIcon(String(name || '').trim());
    if (!baseName) return baseName;
    return `${baseName} ${getAutoCategoryIcon(baseName, keywords, type)}`;
}

function categoriesSameBaseName(a, b) {
    return normalizeCategoryText(stripCategoryIcon(a)) === normalizeCategoryText(stripCategoryIcon(b));
}

function migrateCategoryIcons() {
    let changed = false;
    const renameMap = {};

    userCategories = userCategories.map(cat => {
        const fixedName = withAutoCategoryIcon(cat.name, cat.keywords || [], cat.type);
        if (fixedName !== cat.name) {
            renameMap[cat.name] = fixedName;
            changed = true;
            return { ...cat, name: fixedName };
        }
        return cat;
    });

    if (changed) {
        transactions.forEach(t => {
            if (renameMap[t.category]) t.category = renameMap[t.category];
        });
        localStorage.setItem('userCategories', JSON.stringify(userCategories));
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    return changed;
}

function initCategories() {
    const migrated = migrateCategoryIcons();

    if(categoryEl) {
        const currentVal = categoryEl.value;
        categoryEl.innerHTML = '<option value="" disabled selected>Kategori Seç</option>';
        userCategories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.name;
            opt.textContent = cat.name;
            categoryEl.appendChild(opt);
        });

        const mappedCurrentVal = userCategories.find(c => categoriesSameBaseName(c.name, currentVal))?.name;
        if(mappedCurrentVal) categoryEl.value = mappedCurrentVal;
    }

    if(!catListEl) return;
    catListEl.innerHTML = '';

    userCategories.forEach(cat => {
        const item = document.createElement('li');
        item.classList.add('transaction-item', 'category-manage-item');

        const badgeClass = cat.type === 'income' ? 'income' : 'expense';
        const badgeText = cat.type === 'income' ? 'Gelir' : 'Gider';
        const keywordsHtml = (cat.keywords || []).map(k => `<span class="keyword-badge">${escapeHTML(k)}</span>`).join('');
        const emptyKeywordHtml = '<span class="category-keyword-empty">(Otomatik tanıma kelimesi yok)</span>';

        item.innerHTML = `
            <div class="transaction-info category-manage-info">
                <span class="category-manage-title">
                    ${escapeHTML(cat.name)}
                    <span class="cat-type-badge ${badgeClass}">${badgeText}</span>
                </span>
                <div class="category-keyword-list">${keywordsHtml || emptyKeywordHtml}</div>
            </div>
            <div class="category-manage-actions">
                <button class="list-btn edit-btn" onclick="editCategory(${cat.id})" title="Kategoriyi Düzenle"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="list-btn delete-btn" onclick="removeCategory(${cat.id})" title="Kategoriyi Sil"><i class="fa-regular fa-trash-can"></i></button>
            </div>
        `;
        catListEl.appendChild(item);
    });

    if (migrated && typeof init === 'function') init();
}

window.editCategory = function(id) {
    const cat = userCategories.find(c => c.id === id);
    if(!cat) return;

    editingCategoryId = id;
    document.getElementById('cat-type').value = cat.type;
    document.getElementById('cat-name').value = stripCategoryIcon(cat.name);
    document.getElementById('cat-keywords').value = (cat.keywords || []).join(', ');

    const btn = document.querySelector('#category-form button[type="submit"]');
    if(btn) {
        btn.innerText = "Değişiklikleri Kaydet";
        btn.style.backgroundColor = "var(--success-color)";
    }
};

window.removeCategory = function(id) {
    if(confirm("Bu kategoriyi silmek istediğinize emin misiniz? (Önceki işlemler silinmez)")) {
        userCategories = userCategories.filter(c => c.id !== id);
        localStorage.setItem('userCategories', JSON.stringify(userCategories));
        initCategories();
        if(accessToken) backupToDrive(true);
    }
};

if(catForm) {
    catForm.onsubmit = (e) => {
        e.preventDefault();

        const type = document.getElementById('cat-type').value;
        const rawName = document.getElementById('cat-name').value.trim();
        const keywordsInput = document.getElementById('cat-keywords').value;
        const keywords = keywordsInput ? keywordsInput.split(',').map(k => k.trim().toLowerCase()).filter(k => k) : [];
        const name = withAutoCategoryIcon(rawName, keywords, type);

        if (!stripCategoryIcon(name)) {
            showNotify("Kategori adı boş olamaz.", "fa-triangle-exclamation");
            return;
        }

        if (editingCategoryId) {
            const idx = userCategories.findIndex(c => c.id === editingCategoryId);
            if (idx > -1) {
                const oldName = userCategories[idx].name;
                userCategories[idx].type = type;
                userCategories[idx].name = name;
                userCategories[idx].keywords = keywords;

                transactions.forEach(t => {
                    if (t.category === oldName || categoriesSameBaseName(t.category, oldName)) t.category = name;
                });

                localStorage.setItem('transactions', JSON.stringify(transactions));
                init();
                showNotify("Kategori güncellendi!", "fa-pen");
            }

            editingCategoryId = null;
            const btn = document.querySelector('#category-form button[type="submit"]');
            if(btn) {
                btn.innerText = "Ekle / Güncelle";
                btn.style.backgroundColor = "var(--primary-color)";
            }
        } else {
            const existingCatIndex = userCategories.findIndex(c => categoriesSameBaseName(c.name, name));
            if (existingCatIndex > -1) {
                const oldName = userCategories[existingCatIndex].name;
                userCategories[existingCatIndex].type = type;
                userCategories[existingCatIndex].name = name;
                userCategories[existingCatIndex].keywords = keywords;

                transactions.forEach(t => {
                    if (t.category === oldName || categoriesSameBaseName(t.category, oldName)) t.category = name;
                });

                localStorage.setItem('transactions', JSON.stringify(transactions));
                init();
                showNotify("Kategori güncellendi!", "fa-pen");
            } else {
                userCategories.push({ id: Date.now(), name: name, type: type, keywords: keywords });
                showNotify("Kategori başarıyla eklendi!", "fa-tags");
            }
        }

        localStorage.setItem('userCategories', JSON.stringify(userCategories));
        initCategories();
        catForm.reset();
        if(accessToken) backupToDrive(true);
    };
}

// ==========================================
