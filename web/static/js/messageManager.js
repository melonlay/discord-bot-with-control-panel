// 訊息管理模組
const MessageManager = {
    allMessages: [],
    lastMessageCount: 0,
    lastUpdateTime: null,
    currentGuildId: '',
    hasNewMessages: false,

    // 顯示訊息
    displayMessages(messages) {
        const messageList = document.getElementById('messages');
        if (!messageList) {
            console.error('找不到訊息列表元素');
            return;
        }

        try {
            // 清空現有訊息
            messageList.innerHTML = '';
            
            messages.forEach(message => {
                const messageElement = document.createElement('div');
                messageElement.className = 'message';
                
                // 添加訊息內容
                const content = document.createElement('div');
                content.className = 'message-content';
                content.textContent = message.content || '';
                messageElement.appendChild(content);

                // 如果有附件，添加附件
                if (message.attachments && message.attachments.length > 0) {
                    const attachmentsContainer = document.createElement('div');
                    attachmentsContainer.className = 'message-attachments';
                    
                    message.attachments.forEach(attachment => {
                        if (attachment.url) {
                            const img = document.createElement('img');
                            img.src = attachment.url;
                            img.alt = '附件圖片';
                            img.className = 'message-attachment';
                            img.onclick = () => {
                                window.toggleZoom(img);
                                // 點擊遮罩層時關閉圖片
                                const overlay = document.querySelector('.overlay');
                                overlay.onclick = () => {
                                    window.toggleZoom(img);
                                };
                            };
                            attachmentsContainer.appendChild(img);
                        }
                    });
                    
                    messageElement.appendChild(attachmentsContainer);
                }

                // 添加時間戳
                const timestamp = document.createElement('div');
                timestamp.className = 'message-timestamp';
                timestamp.textContent = message.timestamp || '';
                messageElement.appendChild(timestamp);

                messageList.appendChild(messageElement);
            });

            // 滾動到底部
            messageList.scrollTop = messageList.scrollHeight;
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
                
                // 顯示所有訊息
                this.displayMessages(this.allMessages);
            }
        } catch (error) {
            console.error('更新訊息時發生錯誤:', error);
        }
    }
}; 