// UI管理模組
const UIManager = {
    // 更新伺服器列表
    updateGuildList(guilds) {
        try {
            const guildSelect = document.getElementById('guildSelect');
            if (!guildSelect) {
                console.error('找不到伺服器選擇器元素');
                return;
            }

            console.debug('更新伺服器列表:', guilds);
            
            // 保存當前選擇
            const currentSelection = guildSelect.value;
            
            // 清空現有選項
            guildSelect.innerHTML = '';
            
            // 添加新選項
            guilds.forEach(guild => {
                const option = document.createElement('option');
                option.value = guild.id;
                option.textContent = guild.name;
                guildSelect.appendChild(option);
            });
            
            // 恢復之前的選擇
            if (currentSelection && guilds.some(g => g.id === currentSelection)) {
                guildSelect.value = currentSelection;
            } else if (guilds.length > 0) {
                guildSelect.value = guilds[0].id;
            }
            
            // 觸發訊息更新
            MessageManager.displayMessages();
        } catch (error) {
            console.error('更新伺服器列表時發生錯誤:', error);
        }
    },

    // 顯示載入中狀態
    showLoading() {
        const messageContainer = document.getElementById('messages');
        if (messageContainer) {
            messageContainer.innerHTML = '<div class="loading">載入中...</div>';
        }
    },

    // 顯示錯誤訊息
    showError(message) {
        const messageContainer = document.getElementById('messages');
        if (messageContainer) {
            messageContainer.innerHTML = `<div class="error">${message}</div>`;
        }
    },

    // 更新連接狀態
    updateConnectionStatus(isConnected) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.className = isConnected ? 'connected' : 'disconnected';
            statusElement.textContent = isConnected ? '已連接' : '未連接';
        }
    }
}; 