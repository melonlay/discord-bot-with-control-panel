// 訊息管理模組
const MessageManager = {
    allMessages: [],
    lastMessageCount: 0,
    lastUpdateTime: null,
    currentGuildId: '',
    hasNewMessages: false,

    // 顯示訊息
    displayMessages() {
        try {
            const messageContainer = document.getElementById('messages');
            if (!messageContainer) {
                console.error('找不到訊息容器元素');
                return;
            }
            
            const currentGuildId = document.getElementById('guildSelect').value;
            
            // 過濾並顯示訊息
            const filteredMessages = this.allMessages.filter(
                msg => msg.guild_id === currentGuildId
            );
            
            // 只在有新訊息時更新顯示
            if (this.hasNewMessages) {
                console.debug(`顯示 ${filteredMessages.length} 條訊息`);
                messageContainer.innerHTML = filteredMessages
                    .map(msg => MessageFormatter.formatMessage(msg))
                    .join('');
                
                // 滾動到底部
                messageContainer.scrollTop = messageContainer.scrollHeight;
                this.hasNewMessages = false;
            } else if (filteredMessages.length === 0) {
                // 如果沒有訊息，顯示提示
                messageContainer.innerHTML = '<div class="no-messages">此伺服器目前沒有訊息記錄</div>';
            }
        } catch (error) {
            console.error('顯示訊息時發生錯誤:', error);
        }
    },

    // 獲取最後一條訊息
    getLastMessage() {
        if (this.allMessages.length > 0) {
            return this.allMessages[this.allMessages.length - 1];
        }
        return null;
    },

    // 更新訊息
    updateMessages(newMessages, isRefresh = false) {
        try {
            if (!Array.isArray(newMessages)) {
                console.error('無效的訊息格式:', newMessages);
                return;
            }

            // 檢查是否有新訊息
            const hasNewMessages = newMessages.length > 0;
            if (hasNewMessages) {
                console.debug(`更新 ${newMessages.length} 條訊息`);
                
                // 如果是重新整理，清空現有訊息
                if (isRefresh) {
                    this.allMessages = [];
                }
                
                // 添加新訊息到現有訊息的後面
                const existingMessageIds = new Set(this.allMessages.map(msg => msg.timestamp));
                const uniqueNewMessages = newMessages.filter(msg => !existingMessageIds.has(msg.timestamp));
                
                if (uniqueNewMessages.length > 0) {
                    this.allMessages.push(...uniqueNewMessages);
                    this.hasNewMessages = true;
                    console.debug(`添加 ${uniqueNewMessages.length} 條新訊息`);
                }
                
                // 顯示訊息
                this.displayMessages();
            }
        } catch (error) {
            console.error('更新訊息時發生錯誤:', error);
        }
    }
}; 