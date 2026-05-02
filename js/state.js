// 3. VERİ DEPOLARI VE VARSAYILANLAR
// ==========================================
let transactions = safeJsonParse(localStorage.getItem('transactions'), []);
let subscriptions = safeJsonParse(localStorage.getItem('subscriptions'), []);
let notes = safeJsonParse(localStorage.getItem('notes'), []);

const defaultCategories = [
    { id: 1, name: "Maaş 💰", type: "income", keywords: ["maaş", "avans", "prim", "harçlık", "burs", "ikramiye"] },
    { id: 2, name: "Market 🛒", type: "expense", keywords: ["market", "bakkal", "manav", "kasap", "migros", "şok", "bim", "a101", "carrefour"] },
    { id: 3, name: "Faturalar ⚡", type: "expense", keywords: ["fatura", "elektrik", "su", "doğalgaz", "internet", "telefon", "turkcell", "vodafone", "enerji"] },
    { id: 4, name: "Kira 🏠", type: "expense", keywords: ["kira", "aidat"] },
    { id: 5, name: "Diğer 📦", type: "expense", keywords: [] }
];
let userCategories = safeJsonParse(localStorage.getItem('userCategories'), defaultCategories);

let currentCurrency = localStorage.getItem('currency') || '₺';
let currentColorTheme = localStorage.getItem('colorTheme') || 'default';

// ==========================================
