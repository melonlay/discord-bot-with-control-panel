import asyncio
import sys
import os
from dotenv import load_dotenv
from bot import DiscordBot
from web.app import FlaskApp

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

    # 初始化 Flask 應用
    flask_app = FlaskApp(discord_bot)

    try:
        # 啟動 Discord 機器人
        await discord_bot.start_bot()
    except KeyboardInterrupt:
        print("\n正在關閉程式...")
        # 關閉 Discord 機器人
        await discord_bot.close_bot()
        sys.exit(0)


if __name__ == "__main__":
    asyncio.run(main())
