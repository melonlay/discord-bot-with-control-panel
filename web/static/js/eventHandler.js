// 事件處理模組
class EventHandler {
    constructor() {
        this.currentGuildId = null;
        this.currentChannelId = null;
        this.lastMessageTimestamp = null;
        this.initialized = false;
        this.setupGuildSelector();
        this.setupChannelSelector();
        this.setupRefreshButton();
        this.setupAutoRefresh();
        this.setupMessageInput();
    }

    // 初始化
    async init() {
        console.debug('初始化事件處理器');
        await this.setupGuildSelector();
        this.setupChannelSelector();
        this.setupRefreshButton();
        this.setupAutoRefresh();
    }

    // 設置伺服器選擇器
    setupGuildSelector() {
        const guildSelector = document.getElementById('server-selector');
        if (!guildSelector) {
            console.error('找不到伺服器選擇器元素');
            return;
        }

        // 獲取伺服器列表
        fetch('/guilds')
            .then(response => response.json())
            .then(guilds => {
                // 清空選擇器
                guildSelector.innerHTML = '';
                
                // 添加伺服器選項
                guilds.forEach(guild => {
                    const option = document.createElement('option');
                    option.value = guild.id;
                    option.textContent = guild.name;
                    guildSelector.appendChild(option);
                });

                // 如果有伺服器，自動選擇第一個
                if (guilds.length > 0) {
                    guildSelector.value = guilds[0].id;
                    this.currentGuildId = guilds[0].id;
                    // 自動更新頻道列表
                    this.updateChannels(guilds[0].id);
                }
            })
            .catch(error => {
                console.error('獲取伺服器列表失敗:', error);
                this.showError('無法載入伺服器列表');
            });

        // 當選擇伺服器時，直接更新頻道列表
        guildSelector.addEventListener('change', (event) => {
            const selectedGuildId = event.target.value;
            if (selectedGuildId) {
                this.currentGuildId = selectedGuildId;
                this.updateChannels(selectedGuildId);
            }
        });
    }

    // 設置頻道選擇器
    setupChannelSelector() {
        const channelSelector = document.getElementById('channel-selector');
        if (!channelSelector) {
            console.error('找不到頻道選擇器元素');
            return;
        }

        channelSelector.addEventListener('change', async () => {
            const selectedChannelId = channelSelector.value;
            const selectedChannelName = channelSelector.options[channelSelector.selectedIndex].text;
            if (selectedChannelId) {
                console.log(`[DEBUG] 頻道切換開始`);
                console.log(`[DEBUG] 當前頻道: ${this.currentChannelId}`);
                console.log(`[DEBUG] 新選擇的頻道: ${selectedChannelId} (${selectedChannelName})`);
                
                this.currentChannelId = selectedChannelId;
                console.log(`[DEBUG] 當前頻道已更新為: ${this.currentChannelId}`);
                
                console.log(`[DEBUG] 開始更新訊息...`);
                await this.updateMessages();
                console.log(`[DEBUG] 頻道切換完成`);
            }
        });
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
            
            const channelSelector = document.getElementById('channel-selector');
            if (!channelSelector) {
                console.error('找不到頻道選擇器元素');
                return;
            }

            // 清空現有選項
            channelSelector.innerHTML = '<option value="" data-i18n="select-channel">選擇頻道</option>';
            
            // 添加新頻道
            channels.forEach(channel => {
                const option = document.createElement('option');
                option.value = channel.id;
                option.textContent = channel.name;
                channelSelector.appendChild(option);
            });

            // 自動選擇第一個頻道
            if (channels.length > 0) {
                const firstChannelId = channels[0].id;
                const firstChannelName = channels[0].name;
                console.log(`[DEBUG] 自動選擇第一個頻道: ${firstChannelId} (${firstChannelName})`);
                
                channelSelector.value = firstChannelId;
                this.currentChannelId = firstChannelId;
                console.log(`[DEBUG] 當前頻道已更新為: ${this.currentChannelId}`);
                
                console.log(`[DEBUG] 開始更新訊息...`);
                await this.updateMessages();
                console.log(`[DEBUG] 頻道列表更新完成`);
            }
        } catch (error) {
            console.error('更新頻道列表時發生錯誤:', error);
            this.showError('無法更新頻道列表');
        }
    }

    // 設置重新整理按鈕
    setupRefreshButton() {
        const button = document.getElementById('refresh-button');
        if (!button) {
            console.error('找不到重新整理按鈕元素');
            return;
        }
        button.addEventListener('click', () => this.refreshData());
    }

    // 設置自動重新整理
    setupAutoRefresh() {
        setInterval(() => this.refreshData(), 5000);
    }

    // 設置訊息輸入框
    setupMessageInput() {
        const input = document.getElementById('message-input');
        if (!input) {
            console.error('找不到訊息輸入框元素');
            return;
        }

        // 監聽 Enter 鍵
        input.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.sendMessage(input.value);
                input.value = '';
            }
        });

        // 監聽發送按鈕
        const sendButton = document.getElementById('send-button');
        if (sendButton) {
            sendButton.addEventListener('click', () => {
                this.sendMessage(input.value);
                input.value = '';
            });
        }
    }

    // 重新整理資料
    async refreshData() {
        if (!this.currentGuildId || !this.currentChannelId) {
            return;
        }

        try {
            const response = await fetch('/messages');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const messages = await response.json();
            this.updateMessages(messages);
        } catch (error) {
            console.error('獲取訊息時發生錯誤:', error);
            this.showError('無法載入訊息');
        }
    }

    // 更新訊息列表
    updateMessages(messages = []) {
        const container = document.getElementById('messages');
        if (!container) {
            console.error('找不到訊息容器元素');
            return;
        }

        // 清空容器
        container.innerHTML = '';

        // 如果沒有訊息，顯示提示
        if (!messages || messages.length === 0) {
            const noMessages = document.createElement('div');
            noMessages.className = 'no-messages';
            noMessages.setAttribute('data-i18n', 'no-messages');
            noMessages.textContent = '沒有訊息';
            container.appendChild(noMessages);
            return;
        }

        // 顯示訊息
        messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            container.appendChild(messageElement);
        });
    }

    // 創建訊息元素
    createMessageElement(message) {
        const div = document.createElement('div');
        div.className = 'message';
        
        // 創建伺服器資訊
        const serverInfo = document.createElement('div');
        serverInfo.className = 'message-server';
        serverInfo.textContent = `[${message.guild_name}]`;
        
        // 創建作者資訊
        const author = document.createElement('div');
        author.className = 'message-author';
        author.textContent = message.author;
        
        // 創建內容
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = message.content;
        
        // 添加元素到訊息容器
        div.appendChild(serverInfo);
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
        const container = document.getElementById('messages');
        if (!container) return;
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        container.innerHTML = '';
        container.appendChild(errorDiv);
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

            // 發送成功後重新整理訊息
            this.refreshData();
        } catch (error) {
            console.error('發送訊息時發生錯誤:', error);
            this.showError('無法發送訊息');
        }
    }

    // 更新訊息
    async updateMessages() {
        try {
            console.log(`[DEBUG] 開始更新訊息`);
            console.log(`[DEBUG] 當前頻道ID: ${this.currentChannelId}`);
            
            const response = await fetch('/messages');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const messages = await response.json();
            console.log(`[DEBUG] 獲取到 ${messages.length} 條訊息`);
            
            const messagesContainer = document.getElementById('messages');
            if (!messagesContainer) {
                console.error('找不到訊息容器元素');
                return;
            }
            
            // 添加新訊息
            let filteredMessages = 0;
            messages.forEach(message => {
                if (message.channel_id === this.currentChannelId) {
                    const messageElement = this.createMessageElement(message);
                    messagesContainer.appendChild(messageElement);
                    filteredMessages++;
                }
            });
            
            console.log(`[DEBUG] 過濾後顯示 ${filteredMessages} 條訊息`);
            
            // 滾動到底部
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            console.log(`[DEBUG] 訊息更新完成`);
        } catch (error) {
            console.error('更新訊息時發生錯誤:', error);
            this.showError('無法更新訊息');
        }
    }
}

// 初始化事件處理器
document.addEventListener('DOMContentLoaded', () => {
    window.eventHandler = new EventHandler();
    window.eventHandler.init();
});

// 將toggleZoom設為全局函數
window.toggleZoom = (img) => window.eventHandler.toggleZoom(img); 