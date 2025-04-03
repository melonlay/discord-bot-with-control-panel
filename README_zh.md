# Discord Bot with Control Panel

[English](README.md) | 繁體中文

一個具有網頁控制面板的 Discord 機器人，可以即時查看和管理伺服器訊息。

## 功能特點

- 即時訊息監控
  - 自動每 5 秒更新一次訊息
  - 支援文字和圖片訊息
  - 圖片可以點擊放大查看
- 伺服器管理
  - 顯示機器人加入的所有伺服器
  - 自動選擇第一個伺服器
- 頻道管理
  - 顯示所選伺服器的所有頻道
  - 自動選擇第一個頻道
- 使用者介面
  - 簡潔的網頁控制面板
  - 響應式設計
  - 圖片縮放功能
  - 自動滾動到最新訊息

## 技術棧

- 後端
  - Python
  - Flask
  - discord.py
- 前端
  - HTML5
  - CSS3
  - JavaScript (ES6+)
- 其他
  - WebSocket (用於即時更新)
  - RESTful API

## 安裝說明

1. 克隆專案
```bash
git clone https://github.com/yourusername/discord-bot-with-control-panel.git
cd discord-bot-with-control-panel
```

2. 安裝依賴
```bash
pip install -r requirements.txt
```

3. 設定環境變數
```bash
# 複製範例設定檔
cp .env.example .env
# 編輯 .env 文件，填入你的 Discord Bot Token
```

4. 啟動應用程式
```bash
python main.py
```

## 使用說明

1. 啟動應用程式後，訪問 `http://localhost:5000`
2. 選擇要監控的伺服器和頻道
3. 訊息會自動更新，也可以手動點擊重新整理按鈕
4. 點擊圖片可以放大查看

## 專案結構

```
discord-bot-with-control-panel/
├── bot/
│   ├── __init__.py
│   ├── bot.py
│   ├── handlers/
│   │   ├── __init__.py
│   │   ├── commands.py
│   │   └── events.py
│   └── core/
│       ├── __init__.py
│       └── logger.py
├── web/
│   ├── __init__.py
│   ├── app.py
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css
│   │   └── js/
│   │       ├── eventHandler.js
│   │       ├── messageManager.js
│   │       └── uiManager.js
│   └── templates/
│       └── index.html
├── utils/
├── .env.template
├── .gitignore
├── main.py
├── requirements.txt
├── LICENSE
├── README.md
└── README_zh.md
```

## 開發者指南

### 新增功能

1. 在 `bot/handlers/` 目錄下添加新的處理器
2. 在 `web/static/js/` 目錄下添加新的 JavaScript 模組
3. 更新 `web/templates/index.html` 添加新的 UI 元素
4. 在 `web/static/css/style.css` 中添加新的樣式

### 除錯

- 檢查 `bot/core/logger.py` 的日誌輸出
- 使用瀏覽器的開發者工具查看前端錯誤
- 檢查 Flask 的除錯輸出

## 更新歷史

### v1.0.0 (2024-03-21)
- 初始版本發布
- 基本功能實現
  - 伺服器選擇
  - 頻道選擇
  - 訊息顯示
  - 圖片附件支援

### v1.0.1 (2024-03-21)
- 修復圖片放大功能
  - 優化圖片點擊事件處理
  - 改進遮罩層樣式
  - 提升使用者體驗
- 更新 README 文件
  - 添加更新歷史
  - 完善功能說明
  - 更新專案結構

## 貢獻指南

1. Fork 專案
2. 創建新的分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 授權

本專案採用 GPL-3.0 授權條款 - 詳見 [LICENSE](LICENSE) 文件

## 聯絡方式

如有任何問題或建議，請開啟 Issue 或 Pull Request。 