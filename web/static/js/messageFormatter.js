// 訊息格式化模組
const MessageFormatter = {
    // 格式化單一訊息
    formatMessage(message) {
        try {
            //console.debug('格式化訊息:', message);
            let html = `
                <div class="message">
                    <div class="message-header">
                        <span class="author">${message.author}</span>
                        <span class="timestamp">${new Date(message.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="message-content">
                        ${message.content}
                    </div>
            `;

            // 如果有附件，顯示附件
            if (message.attachments && message.attachments.length > 0) {
                html += '<div class="message-attachments">';
                message.attachments.forEach(attachment => {
                    // 如果是圖片，直接顯示
                    if (attachment.content_type && attachment.content_type.startsWith('image/')) {
                        html += `
                            <div class="attachment image">
                                <img src="${attachment.url}" alt="${attachment.filename}" 
                                     onclick="window.toggleZoom(this)"
                                     style="max-width: 100%; max-height: 300px; border-radius: 5px;">
                            </div>
                        `;
                    } else {
                        // 如果不是圖片，顯示下載連結
                        html += `
                            <div class="attachment file">
                                <a href="${attachment.url}" target="_blank">
                                    <i class="fas fa-file"></i> ${attachment.filename}
                                </a>
                            </div>
                        `;
                    }
                });
                html += '</div>';
            }

            html += '</div>';
            return html;
        } catch (error) {
            console.error('格式化訊息時發生錯誤:', error);
            return '<div class="message">訊息格式錯誤</div>';
        }
    }
}; 