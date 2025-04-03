// 事件處理模組
const EventHandler = {
    // 初始化
    init() {
        console.debug('初始化事件處理器');
        this.setupGuildSelector();
        this.setupRefreshButton();
        // 初始載入資料
        this.loadInitialData();
        // 每5秒重新整理一次資料
        setInterval(() => this.refreshData(), 5000);
    },

    // 設置伺服器選擇器
    setupGuildSelector() {
        const guildSelect = document.getElementById('guildSelect');
        if (guildSelect) {
            guildSelect.addEventListener('change', () => {
                MessageManager.displayMessages();
            });
        }
    },

    // 設置重新整理按鈕
    setupRefreshButton() {
        const refreshButton = document.getElementById('refreshButton');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.refreshData();
            });
        }
    },

    // 載入初始資料
    async loadInitialData() {
        try {
            console.debug('開始載入初始資料');
            
            // 載入伺服器列表
            const guildResponse = await fetch('/guilds');
            const guilds = await guildResponse.json();
            UIManager.updateGuildList(guilds);
            
            // 如果有伺服器，載入歷史訊息
            if (guilds.length > 0) {
                const messageResponse = await fetch('/messages');
                const data = await messageResponse.json();
                
                if (data.messages && data.messages.length > 0) {
                    console.debug(`載入 ${data.messages.length} 條歷史訊息`);
                    MessageManager.updateMessages(data.messages, true);
                }
            }
        } catch (error) {
            console.error('載入初始資料時發生錯誤:', error);
        }
    },

    // 重新整理資料
    async refreshData() {
        try {
            console.debug('開始重新整理資料');
            
            // 重新整理伺服器列表
            const guildResponse = await fetch('/guilds');
            const guilds = await guildResponse.json();
            UIManager.updateGuildList(guilds);
            
            // 獲取最後一條訊息的時間戳記
            const lastMessage = MessageManager.getLastMessage();
            let afterTimestamp = null;
            if (lastMessage) {
                // 確保時間戳記格式正確
                afterTimestamp = lastMessage.timestamp.replace(' ', '+');
                console.debug('使用時間戳記:', afterTimestamp);
            }
            
            // 重新整理訊息，帶上時間戳記
            const messageResponse = await fetch(`/messages${afterTimestamp ? `?after=${afterTimestamp}` : ''}`);
            const data = await messageResponse.json();
            
            if (data.messages && data.messages.length > 0) {
                console.debug(`收到 ${data.messages.length} 條新訊息`);
                MessageManager.updateMessages(data.messages, false);
            }
        } catch (error) {
            console.error('重新整理資料時發生錯誤:', error);
        }
    },

    // 切換圖片縮放
    toggleZoom(img) {
        const overlay = document.querySelector('.overlay');
        if (img.classList.contains('zoomed')) {
            img.classList.remove('zoomed');
            overlay.style.display = 'none';
        } else {
            img.classList.add('zoomed');
            overlay.style.display = 'block';
        }
    }
};

// 將toggleZoom設為全局函數
window.toggleZoom = EventHandler.toggleZoom; 