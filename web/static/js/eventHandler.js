// 事件處理模組
class EventHandler {
    constructor() {
        this.lastMessageTimestamp = null;
        this.currentGuildId = null;
        this.currentChannelId = null;
        this.initialized = false;
        this.refreshInterval = null;
    }

    // 初始化
    async init() {
        if (this.initialized) {
            console.debug('事件處理器已經初始化');
            return;
        }

        console.debug('初始化事件處理器');
        await this.setupGuildSelector();
        this.setupRefreshButton();
        this.startAutoRefresh();
        this.initialized = true;
    }

    // 設置伺服器選擇器
    async setupGuildSelector() {
        const guildSelector = document.getElementById('guild-selector');
        if (!guildSelector) {
            console.error('找不到伺服器選擇器元素');
            return;
        }

        try {
            const response = await fetch('/guilds');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const guilds = await response.json();
            
            // 清空現有選項
            guildSelector.innerHTML = '<option value="">選擇伺服器</option>';
            
            // 添加伺服器選項
            guilds.forEach(guild => {
                const option = document.createElement('option');
                option.value = guild.id;
                option.textContent = guild.name;
                guildSelector.appendChild(option);
            });

            // 如果有伺服器，自動選擇第一個
            if (guilds.length > 0) {
                this.currentGuildId = guilds[0].id;
                guildSelector.value = this.currentGuildId;
                await this.setupChannelSelector();
                this.refreshData();
            }

            // 添加事件監聽器
            guildSelector.addEventListener('change', async (event) => {
                this.currentGuildId = event.target.value;
                this.currentChannelId = null;
                if (this.currentGuildId) {
                    await this.setupChannelSelector();
                    this.refreshData();
                }
            });

            console.debug('伺服器選擇器設置完成');
        } catch (error) {
            console.error('設置伺服器選擇器時發生錯誤:', error);
        }
    }

    // 設置頻道選擇器
    async setupChannelSelector() {
        const channelSelector = document.getElementById('channel-selector');
        if (!channelSelector) {
            console.error('找不到頻道選擇器元素');
            return;
        }

        if (!this.currentGuildId) {
            console.debug('未選擇伺服器，跳過頻道選擇器設置');
            return;
        }

        try {
            const response = await fetch(`/channels/${this.currentGuildId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const channels = await response.json();
            
            // 清空現有選項
            channelSelector.innerHTML = '<option value="">選擇頻道</option>';
            
            // 添加頻道選項
            channels.forEach(channel => {
                const option = document.createElement('option');
                option.value = channel.id;
                option.textContent = channel.name;
                channelSelector.appendChild(option);
            });

            // 如果有頻道，自動選擇第一個
            if (channels.length > 0) {
                this.currentChannelId = channels[0].id;
                channelSelector.value = this.currentChannelId;
                this.refreshData();
            }

            // 添加事件監聽器
            channelSelector.addEventListener('change', (event) => {
                this.currentChannelId = event.target.value;
                this.refreshData();
            });

            console.debug('頻道選擇器設置完成');
        } catch (error) {
            console.error('設置頻道選擇器時發生錯誤:', error);
        }
    }

    // 設置重新整理按鈕
    setupRefreshButton() {
        const refreshButton = document.getElementById('refresh-button');
        if (!refreshButton) {
            console.error('找不到重新整理按鈕元素');
            return;
        }

        refreshButton.addEventListener('click', () => {
            this.refreshData();
        });
    }

    // 載入初始資料
    async loadInitialData() {
        try {
            await this.setupGuildSelector();
            if (this.currentGuildId) {
                await this.setupChannelSelector();
            }
        } catch (error) {
            console.error('載入初始資料時發生錯誤:', error);
        }
    }

    // 重新整理資料
    async refreshData() {
        try {
            const params = new URLSearchParams();
            if (this.lastMessageTimestamp) {
                params.append('after', this.lastMessageTimestamp);
            }
            if (this.currentGuildId) {
                params.append('guild_id', this.currentGuildId);
            }
            if (this.currentChannelId) {
                params.append('channel_id', this.currentChannelId);
            }

            const response = await fetch(`/messages?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.messages && data.messages.length > 0) {
                MessageManager.updateMessages(data.messages, false);
                this.lastMessageTimestamp = data.messages[data.messages.length - 1].timestamp;
            }
        } catch (error) {
            console.error('重新整理資料時發生錯誤:', error);
        }
    }

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

    startAutoRefresh() {
        // 清除現有的定時器
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // 每5秒重新整理一次
        this.refreshInterval = setInterval(() => {
            if (this.currentGuildId && this.currentChannelId) {
                this.refreshData();
            }
        }, 5000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
}

// 初始化事件處理器
document.addEventListener('DOMContentLoaded', () => {
    if (!window.eventHandler) {
        window.eventHandler = new EventHandler();
        window.eventHandler.init();
    }
});

// 將toggleZoom設為全局函數
window.toggleZoom = (img) => window.eventHandler.toggleZoom(img); 