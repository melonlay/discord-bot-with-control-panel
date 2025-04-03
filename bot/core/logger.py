"""
日誌工具模組

此模組提供了一個統一的日誌記錄系統，用於整個應用程式。
"""

import logging
import sys
from typing import Optional


def setup_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    """
    設置並返回一個配置好的日誌記錄器

    Args:
        name (str): 日誌記錄器的名稱
        level (int): 日誌級別，預設為 INFO

    Returns:
        logging.Logger: 配置好的日誌記錄器實例
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # 如果已經有處理器，則不重複添加
    if not logger.handlers:
        # 創建控制台處理器
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(level)

        # 創建格式化器
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(formatter)

        # 添加處理器到日誌記錄器
        logger.addHandler(console_handler)

    return logger


# 創建預設的日誌記錄器
logger = setup_logger(__name__)
