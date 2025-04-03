import asyncio
import sys
import os
from dotenv import load_dotenv
from bot import DiscordBot
from web.app import FlaskThread

# 載入環境變數
load_dotenv()


async def main():
    # 從環境變數獲取 Discord token
    token = os.getenv('DISCORD_TOKEN')
    if not token:
        print("錯誤：未找到 DISCORD_TOKEN 環境變數")
        sys.exit(1)

    # 初始化 Discord 機器人
    discord_bot = DiscordBot(token)
    bot = discord_bot.get_bot()

    # 啟動 Flask 伺服器
    flask_thread = FlaskThread(discord_bot.app)
    flask_thread.daemon = True
    flask_thread.start()

    try:
        # 啟動 Discord 機器人
        await discord_bot.start_bot()
    except KeyboardInterrupt:
        print("\n正在關閉程式...")
        # 關閉 Flask 伺服器
        flask_thread.shutdown()
        # 關閉 Discord 機器人
        await discord_bot.close_bot()
        sys.exit(0)

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n程式已關閉")
        sys.exit(0)
