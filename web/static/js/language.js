// 語言翻譯字典
const translations = {
    'en': {
        'title': 'Discord Bot Control Panel',
        'select-server': 'Select a server',
        'no-servers': 'No servers available',
        'error-server': 'Server error',
        'select-server-first': 'Select a server first',
        'select-channel': 'Select a channel',
        'no-channels': 'No channels available',
        'refresh': 'Refresh',
        'msg-no-messages': 'No messages available',
        'error-connection': 'Connection error',
        'loading': 'Loading...',
        'language': 'Language',
        'english': 'English',
        'chinese': 'Traditional Chinese'
    },
    'zh-TW': {
        'title': 'Discord 機器人控制面板',
        'select-server': '選擇伺服器',
        'no-servers': '沒有可用的伺服器',
        'error-server': '伺服器錯誤',
        'select-server-first': '請先選擇伺服器',
        'select-channel': '選擇頻道',
        'no-channels': '沒有可用的頻道',
        'refresh': '重新整理',
        'msg-no-messages': '沒有可用的訊息',
        'error-connection': '連線錯誤',
        'loading': '載入中...',
        'language': '語言',
        'english': '英文',
        'chinese': '繁體中文'
    }
};

// 當前語言
let currentLanguage = localStorage.getItem('language') || 'en';

// 翻譯函數
function t(key) {
    const translation = translations[currentLanguage];
    if (!translation) return key;
    return translation[key] || key;
}

// 切換語言
function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
        updateUI();
    }
}

// 更新界面文字
function updateUI() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (!key) return;
        
        if (element.tagName === 'INPUT' && element.type === 'button') {
            element.value = t(key);
        } else {
            element.textContent = t(key);
        }
    });
}

// 初始化語言
document.addEventListener('DOMContentLoaded', () => {
    // 設置初始語言
    document.documentElement.lang = currentLanguage;
    
    // 更新界面
    updateUI();
    
    // 設置語言切換按鈕事件
    const langEn = document.getElementById('lang-en');
    const langZh = document.getElementById('lang-zh');
    
    if (langEn) langEn.addEventListener('click', () => setLanguage('en'));
    if (langZh) langZh.addEventListener('click', () => setLanguage('zh-TW'));
}); 