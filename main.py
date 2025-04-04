import asyncio
import sys
import os
import logging
from dotenv import load_dotenv
from bot import DiscordBot
from web.app import FlaskApp

# 載入環境變數
load_dotenv()

# 配置根日誌記錄器


def setup_logging():
    # 移除所有現有的處理器
    root_logger = logging.getLogger()
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # 設置根日誌記錄器
    root_logger.setLevel(logging.DEBUG)

    # 創建控制台處理器
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)

    # 創建格式化器
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(formatter)

    # 添加處理器到根日誌記錄器
    root_logger.addHandler(console_handler)

    # 設置 Discord.py 的日誌級別
    logging.getLogger('discord.gateway').setLevel(logging.WARNING)
    logging.getLogger('discord.client').setLevel(logging.WARNING)
    logging.getLogger('discord.http').setLevel(logging.WARNING)


async def main():
    # 設置日誌
    setup_logging()
    logger = logging.getLogger(__name__)

    # 從環境變數獲取 Discord token
    token = os.getenv('DISCORD_TOKEN')
    if not token:
        logger.error("錯誤：未找到 DISCORD_TOKEN 環境變數")
        sys.exit(1)

    # 初始化 Discord 機器人
    discord_bot = DiscordBot(token)
    bot = discord_bot.get_bot()

    # 初始化並啟動 Flask 應用
    flask_app = FlaskApp(discord_bot)
    flask_app.start()

    try:
        # 啟動 Discord 機器人
        await discord_bot.start_bot()
    except KeyboardInterrupt:
        logger.info("正在關閉程式...")
        # 關閉 Flask 應用
        flask_app.shutdown()
        # 關閉 Discord 機器人
        await discord_bot.close_bot()
        sys.exit(0)


if __name__ == "__main__":
    asyncio.run(main())
