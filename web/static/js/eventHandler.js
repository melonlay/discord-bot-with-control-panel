// 事件處理模組
class EventHandler {
    constructor() {
        this.currentGuildId = null;
        this.currentChannelId = null;
        this.lastMessageTimestamp = null;
        this.isFirstLoad = true;
        this.initializeElements();
        this.setupEventListeners();
    }

    // 初始化
    async init() {
        console.debug('初始化事件處理器');
        await this.setupGuildSelector();
        this.setupMessageRefresh();
    }

    initializeElements() {
        // 初始化所有必要的 DOM 元素
        this.guildSelector = document.getElementById('server-selector');
        this.channelSelector = document.getElementById('channel-selector');
        this.messageContainer = document.getElementById('messages');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.refreshButton = document.getElementById('refresh-button');

        // 檢查必要的元素是否存在
        if (!this.messageContainer) {
            console.error('找不到訊息容器元素');
            return;
        }
    }

    setupEventListeners() {
        // 設置伺服器選擇器事件
        if (this.guildSelector) {
            this.guildSelector.addEventListener('change', () => {
                this.currentGuildId = this.guildSelector.value;
                this.updateChannels(this.currentGuildId);
            });
        }

        // 設置頻道選擇器事件
        if (this.channelSelector) {
            this.channelSelector.addEventListener('change', () => {
                this.currentChannelId = this.channelSelector.value;
                this.lastMessageTimestamp = null; // 重置時間戳
                this.isFirstLoad = true; // 重置首次載入標記
                this.updateMessages();
            });
        }

        // 設置發送按鈕事件
        if (this.sendButton && this.messageInput) {
            this.sendButton.addEventListener('click', () => {
                this.sendMessage(this.messageInput.value);
                this.messageInput.value = '';
            });
        }

        // 設置重新整理按鈕事件（如果按鈕存在）
        if (this.refreshButton) {
            this.refreshButton.addEventListener('click', () => {
                this.lastMessageTimestamp = null; // 重置時間戳
                this.isFirstLoad = true; // 重置首次載入標記
                this.updateMessages();
            });
        }
    }

    // 設置伺服器選擇器
    async setupGuildSelector() {
        if (!this.guildSelector) {
            console.error('找不到伺服器選擇器元素');
            return;
        }

        // 獲取伺服器列表
        try {
            const response = await fetch('/guilds');
            const guilds = await response.json();
            console.log(`[DEBUG] 獲取到 ${guilds.length} 個伺服器`);
            console.log(`[DEBUG] 伺服器列表:`, guilds);
            
            // 清空選擇器
            this.guildSelector.innerHTML = '';
            
            // 添加伺服器選項
            guilds.forEach(guild => {
                const option = document.createElement('option');
                option.value = guild.id;
                option.textContent = guild.name;
                this.guildSelector.appendChild(option);
            });

            // 如果有伺服器，自動選擇第一個
            if (guilds.length > 0) {
                this.guildSelector.value = guilds[0].id;
                this.currentGuildId = guilds[0].id;
                // 自動更新頻道列表
                await this.updateChannels(guilds[0].id);
            }
        } catch (error) {
            console.error('獲取伺服器列表失敗:', error);
            this.showError('無法載入伺服器列表');
        }
    }

    // 更新頻道列表
    async updateChannels(guildId) {
        try {
            console.log(`[DEBUG] 開始更新頻道列表`);
            console.log(`[DEBUG] 伺服器ID: ${guildId}`);
            
            const response = await fetch(`/channels/${guildId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const channels = await response.json();
            console.log(`[DEBUG] 獲取到 ${channels.length} 個頻道`);
            console.log(`[DEBUG] 頻道列表:`, channels);
            
            if (!this.channelSelector) {
                console.error('找不到頻道選擇器元素');
                return;
            }
            
            // 清空現有選項
            this.channelSelector.innerHTML = '<option value="" data-i18n="select-channel">選擇頻道</option>';
            
            // 添加新頻道
            channels.forEach(channel => {
                const option = document.createElement('option');
                option.value = channel.id;
                option.textContent = channel.name;
                this.channelSelector.appendChild(option);
            });
            
            // 如果有頻道，自動選擇第一個
            if (channels.length > 0) {
                const firstChannelId = channels[0].id;
                const firstChannelName = channels[0].name;
                console.log(`[DEBUG] 自動選擇第一個頻道: ${firstChannelId} (${firstChannelName})`);
                
                this.channelSelector.value = firstChannelId;
                this.currentChannelId = firstChannelId;
                console.log(`[DEBUG] 當前頻道已更新為: ${this.currentChannelId}`);
                
                // 重置狀態並更新訊息
                this.isFirstLoad = true;
                this.lastMessageTimestamp = null;
                console.log(`[DEBUG] 開始更新訊息...`);
                await this.updateMessages();
            }
            
            console.log(`[DEBUG] 頻道列表更新完成`);
        } catch (error) {
            console.error('更新頻道列表時發生錯誤:', error);
            this.showError('無法載入頻道列表');
        }
    }

    // 更新訊息
    async updateMessages() {
        if (!this.currentChannelId) {
            console.debug('未選擇頻道，不更新訊息');
            return;
        }

        if (!this.messageContainer) {
            console.error('找不到訊息容器元素');
            return;
        }

        try {
            console.debug(`正在更新頻道 ${this.currentChannelId} 的訊息`);
            let url = `/messages/${this.currentChannelId}`;
            
            // 如果不是第一次載入，添加時間戳參數
            if (!this.isFirstLoad && this.lastMessageTimestamp) {
                const timestamp = new Date(this.lastMessageTimestamp).toISOString();
                url += `?after=${encodeURIComponent(timestamp)}`;
                console.debug(`請求時間戳之後的訊息: ${timestamp}`);
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const messages = await response.json();
            console.debug(`收到 ${messages.length} 條訊息`);

            if (messages.length > 0) {
                // 如果是第一次載入，清空訊息容器
                if (this.isFirstLoad) {
                    this.messageContainer.innerHTML = '';
                    this.isFirstLoad = false;
                }

                // 添加新訊息
                messages.forEach(message => {
                    const messageElement = this.createMessageElement(message);
                    this.messageContainer.appendChild(messageElement);
                });

                // 更新最後一條訊息的時間戳
                this.lastMessageTimestamp = messages[messages.length - 1].timestamp;
                console.debug(`更新最後一條訊息的時間戳: ${this.lastMessageTimestamp}`);

                // 滾動到底部
                this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
            }
        } catch (error) {
            console.error('更新訊息時發生錯誤:', error);
        }
    }

    // 創建訊息元素
    createMessageElement(message) {
        const div = document.createElement('div');
        div.className = 'message';
        
        // 創建作者資訊
        const author = document.createElement('div');
        author.className = 'message-author';
        author.textContent = message.author.name;
        
        // 創建內容
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = message.content;
        
        // 添加元素到訊息容器
        div.appendChild(author);
        div.appendChild(content);
        
        // 處理附件
        if (message.attachments && message.attachments.length > 0) {
            message.attachments.forEach(attachment => {
                if (attachment.content_type && attachment.content_type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.className = 'message-image';
                    img.src = attachment.url;
                    img.alt = 'Message attachment';
                    img.onclick = () => this.toggleZoom(img);
                    div.appendChild(img);
                }
            });
        }
        
        return div;
    }

    // 顯示錯誤訊息
    showError(message) {
        if (!this.messageContainer) return;
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.messageContainer.innerHTML = '';
        this.messageContainer.appendChild(errorDiv);
    }

    // 切換圖片縮放
    toggleZoom(img) {
        const overlay = document.getElementById('overlay');
        if (!overlay) return;
        
        if (img.classList.contains('zoomed')) {
            img.classList.remove('zoomed');
            overlay.style.display = 'none';
        } else {
            img.classList.add('zoomed');
            overlay.style.display = 'block';
        }
    }

    // 發送訊息
    async sendMessage(content) {
        if (!content.trim()) {
            return;
        }

        if (!this.currentGuildId || !this.currentChannelId) {
            this.showError('請先選擇伺服器和頻道');
            return;
        }

        try {
            const response = await fetch('/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    guild_id: this.currentGuildId,
                    channel_id: this.currentChannelId,
                    content: content
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await this.updateMessages();
        } catch (error) {
            console.error('發送訊息時發生錯誤:', error);
            this.showError('無法發送訊息');
        }
    }

    setupMessageRefresh() {
        // 每 5 秒更新一次訊息
        setInterval(() => {
            if (this.currentChannelId) {
                this.updateMessages();
            }
        }, 5000);
    }
}

// 初始化事件處理器
document.addEventListener('DOMContentLoaded', () => {
    window.eventHandler = new EventHandler();
    window.eventHandler.init();
});

// 將toggleZoom設為全局函數
window.toggleZoom = (img) => window.eventHandler.toggleZoom(img);