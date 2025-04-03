import logging
import sys


def setup_logger():
    # 創建日誌記錄器
    logger = logging.getLogger('discord_bot')
    logger.setLevel(logging.DEBUG)

    # 創建控制台處理器
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)

    # 創建檔案處理器
    file_handler = logging.FileHandler('bot.log')
    file_handler.setLevel(logging.INFO)

    # 設置日誌格式
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    file_handler.setFormatter(formatter)

    # 添加處理器到日誌記錄器
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return logger


# 創建全局日誌記錄器
logger = setup_logger()
