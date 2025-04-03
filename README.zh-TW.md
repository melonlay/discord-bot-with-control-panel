# Discord Bot with Control Panel

繁體中文 | [English](README.md)

一個使用 Python 和 Flask 開發的 Discord 機器人，具有網頁控制面板功能。

## 功能特點

- Discord 機器人功能
  - 訊息監聽和記錄
  - 自定義命令系統
  - 伺服器管理
- 網頁控制面板
  - 即時訊息顯示
  - 伺服器選擇
  - 訊息歷史記錄
  - 圖片預覽和縮放

## 技術棧

- 後端
  - Python 3.10+
  - Discord.py
  - Flask
  - SQLite
- 前端
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Fetch API

## 安裝說明

1. 克隆專案
```bash
git clone https://github.com/melonlay/discord-bot-with-control-panel.git
cd discord-bot-with-control-panel
```

2. 安裝依賴
```bash
pip install -r requirements.txt
```

3. 設置環境變數
```bash
# 複製環境變數範本
cp .env.template .env

# 編輯 .env 檔案，設定您的配置
# 您至少需要設定 DISCORD_TOKEN
```

4. 運行專案
```bash
python main.py
```

## 使用說明

1. 啟動機器人後，訪問 `http://localhost:5000` 打開控制面板
2. 在控制面板中選擇要查看的伺服器
3. 訊息會自動更新，也可以手動點擊重新整理按鈕
4. 點擊圖片可以放大查看

## 資料存儲

- 訊息存儲在 `log/messages.json` 中
- 日誌檔案存儲在 `log` 目錄中
- `log` 目錄會在機器人啟動時自動建立
- `log` 目錄被 git 忽略以保護敏感資料

## 專案結構

```
discord-bot-with-control-panel/
├── bot/                    # Discord 機器人相關
│   ├── core/              # 核心功能
│   │   └── logger.py      # 日誌工具
│   ├── handlers/          # 處理器
│   │   ├── events.py      # 事件處理器
│   │   └── commands.py    # 命令處理器
│   ├── bot.py             # 主機器人類
│   └── __init__.py        # 模組初始化
├── web/                    # 網頁相關
│   ├── static/            # 靜態檔案
│   │   ├── css/           # 樣式表
│   │   └── js/            # JavaScript
│   ├── templates/         # HTML 模板
│   └── app.py             # Flask 應用
├── utils/                  # 工具函數
├── log/                    # 日誌和訊息存儲
│   ├── messages.json      # 訊息歷史
│   └── bot.log            # 機器人日誌
├── main.py                # 主程式
├── requirements.txt       # 依賴列表
├── LICENSE               # 授權條款
└── README.md             # 說明文件
```

## 授權條款

本專案採用 GPL-3.0 授權條款，詳見 [LICENSE](LICENSE) 檔案。

## 貢獻指南

1. Fork 本專案
2. 創建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟一個 Pull Request

## 聯絡方式

如有任何問題或建議，請開啟 Issue 或 Pull Request。 