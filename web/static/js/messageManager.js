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
                messageElement.dataset.messageId = message.id;
                messageElement.dataset.channelId = message.channel_id;
                
                const header = document.createElement('div');
                header.className = 'message-header';
                
                const author = document.createElement('span');
                author.className = 'message-author';
                author.textContent = message.author;
                
                const timestamp = document.createElement('span');
                timestamp.className = 'message-timestamp';
                timestamp.textContent = new Date(message.timestamp).toLocaleString();
                
                const channel = document.createElement('span');
                channel.className = 'message-channel';
                channel.textContent = `#${message.channel_name}`;
                
                const messageId = document.createElement('span');
                messageId.className = 'message-id';
                messageId.textContent = `ID: ${message.id}`;

                header.appendChild(author);
                header.appendChild(timestamp);
                header.appendChild(channel);
                header.appendChild(messageId);
                
                const content = document.createElement('div');
                content.className = 'message-content';
                content.textContent = message.content || '';
                
                messageElement.appendChild(header);
                messageElement.appendChild(content);

                // 如果有附件，添加附件
                if (message.attachments && message.attachments.length > 0) {
                    const attachmentsContainer = document.createElement('div');
                    attachmentsContainer.className = 'message-attachments';
                    
                    message.attachments.forEach(attachment => {
                        if (attachment.url) {
                            const imgContainer = document.createElement('div');
                            imgContainer.className = 'image-container';
                            
                            const img = document.createElement('img');
                            img.src = attachment.url;
                            img.alt = '附件圖片';
                            img.className = 'message-image';
                            img.onclick = () => {
                                window.toggleZoom(img);
                                // 點擊遮罩層時關閉圖片
                                const overlay = document.querySelector('.overlay');
                                overlay.onclick = () => {
                                    window.toggleZoom(img);
                                };
                            };
                            imgContainer.appendChild(img);
                            attachmentsContainer.appendChild(imgContainer);
                        }
                    });
                    
                    messageElement.appendChild(attachmentsContainer);
                }

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
    },

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.dataset.messageId = message.id;
        messageDiv.dataset.channelId = message.channel_id;

        const header = document.createElement('div');
        header.className = 'message-header';
        
        const author = document.createElement('span');
        author.className = 'message-author';
        author.textContent = message.author;
        
        const timestamp = document.createElement('span');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = new Date(message.timestamp).toLocaleString();
        
        const channel = document.createElement('span');
        channel.className = 'message-channel';
        channel.textContent = `#${message.channel_name}`;
        
        const messageId = document.createElement('span');
        messageId.className = 'message-id';
        messageId.textContent = `ID: ${message.id}`;

        header.appendChild(author);
        header.appendChild(timestamp);
        header.appendChild(channel);
        header.appendChild(messageId);
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = message.content;
        
        messageDiv.appendChild(header);
        messageDiv.appendChild(content);
        
        if (message.attachments && message.attachments.length > 0) {
            const attachmentsDiv = document.createElement('div');
            attachmentsDiv.className = 'message-attachments';
            
            message.attachments.forEach(attachment => {
                if (attachment.content_type && attachment.content_type.startsWith('image/')) {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'image-container';
                    
                    const img = document.createElement('img');
                    img.src = attachment.url;
                    img.alt = '附件圖片';
                    img.className = 'message-image';
                    
                    // 添加點擊事件處理
                    img.onclick = () => {
                        window.toggleZoom(img);
                    };
                    
                    imgContainer.appendChild(img);
                    attachmentsDiv.appendChild(imgContainer);
                }
            });
            
            messageDiv.appendChild(attachmentsDiv);
        }
        
        return messageDiv;
    }
}; 