"""
Discord 機器人主模組

此模組包含 Discord 機器人的主要類別和功能。
"""

import json
import os
from datetime import datetime
from typing import List, Dict, Optional, Any
import discord
from discord.ext import commands
from flask import Flask, request, render_template

from .core.logger import logger
from .handlers.events import setup_events
from .handlers.commands import setup_commands


class DiscordBot:
    """
    Discord 機器人類

    此類別負責管理 Discord 機器人的所有功能，包括：
    - Discord 機器人實例
    - Flask 網頁應用
    - 訊息歷史記錄
    """

    def __init__(self, token: str) -> None:
        """
        初始化 Discord 機器人

        Args:
            token (str): Discord 機器人的令牌
        """
        self.token = token
        # 設置 intents
        intents = discord.Intents.default()
        intents.message_content = True  # 啟用訊息內容權限
        intents.members = False  # 禁用成員權限
        intents.presences = False  # 禁用狀態權限

        # 創建 bot 實例
        self.bot = commands.Bot(
            command_prefix='!',
            intents=intents,
            help_command=None  # 禁用預設的幫助命令
        )

        # 初始化 Flask 應用
        self.app = Flask(__name__,
                         template_folder=os.path.join(os.path.dirname(
                             os.path.dirname(__file__)), 'web', 'templates'),
                         static_folder=os.path.join(os.path.dirname(os.path.dirname(__file__)), 'web', 'static'))

        # 確保 log 目錄存在
        self.log_dir = 'log'
        os.makedirs(self.log_dir, exist_ok=True)

        self.message_history: List[Dict] = []
        self.message_file = os.path.join(self.log_dir, 'messages.json')
        self.max_messages = 100

        # 載入歷史訊息
        self.load_messages()

        # 設置事件處理器
        setup_events(self.bot, self)
        # 設置命令處理器
        setup_commands(self.bot)
        # 設置 Flask 路由
        self.setup_flask_app()

        logger.info("DiscordBot 初始化完成")

    def load_messages(self) -> None:
        """
        從檔案載入歷史訊息
        """
        try:
            if os.path.exists(self.message_file):
                with open(self.message_file, 'r', encoding='utf-8') as f:
                    self.message_history = json.load(f)
                logger.debug(f"已從檔案載入 {len(self.message_history)} 條歷史訊息")
            else:
                logger.debug("沒有找到歷史訊息檔案")
        except Exception as e:
            logger.error(f"載入歷史訊息時發生錯誤: {e}")
            self.message_history = []

    def save_messages(self) -> None:
        """
        保存訊息到檔案
        """
        try:
            # 只保留最新的100條訊息
            messages_to_save = self.message_history[-self.max_messages:]
            with open(self.message_file, 'w', encoding='utf-8') as f:
                json.dump(messages_to_save, f, ensure_ascii=False, indent=2)
            logger.debug(f"已保存 {len(messages_to_save)} 條訊息到檔案")
        except Exception as e:
            logger.error(f"保存訊息時發生錯誤: {e}")

    def add_message(self, message_data: Dict) -> None:
        """
        添加新訊息到歷史記錄

        Args:
            message_data (Dict): 訊息資料
        """
        self.message_history.append(message_data)
        self.save_messages()

    def get_message_history(self, after_timestamp: Optional[str] = None) -> List[Dict]:
        """
        獲取訊息歷史

        Args:
            after_timestamp (Optional[str]): 時間戳記，只返回此時間之後的訊息

        Returns:
            List[Dict]: 訊息列表
        """
        try:
            if after_timestamp is None:
                logger.debug(f"獲取所有訊息歷史，共 {len(self.message_history)} 條")
                return self.message_history

            # 將時間戳記轉換為 datetime 物件進行比較
            try:
                # 清理時間戳記格式
                after_timestamp = after_timestamp.strip()
                if ' ' in after_timestamp:
                    after_timestamp = after_timestamp.replace(' ', '+')
                after_datetime = datetime.fromisoformat(after_timestamp)
                logger.debug(f"過濾時間戳記之後的訊息: {after_datetime}")
            except ValueError as e:
                logger.error(f"時間戳記格式錯誤: {after_timestamp}, 錯誤: {e}")
                return []

            # 過濾出指定時間戳之後的訊息
            filtered_messages = []
            for msg in self.message_history:
                try:
                    msg_timestamp = datetime.fromisoformat(
                        msg['timestamp'].replace(' ', '+'))
                    if msg_timestamp > after_datetime:
                        filtered_messages.append(msg)
                except ValueError as e:
                    logger.error(f"訊息時間戳記格式錯誤: {msg['timestamp']}, 錯誤: {e}")
                    continue

            if len(filtered_messages) == 0:
                logger.debug(f"時間戳 {after_timestamp} 之後沒有新訊息")
            else:
                logger.debug(
                    f"獲取 {after_timestamp} 之後的訊息，共 {len(filtered_messages)} 條")

            return filtered_messages
        except Exception as e:
            logger.error(f"獲取訊息時發生錯誤: {e}")
            return []

    def get_guilds(self) -> List[Dict]:
        """
        獲取機器人加入的所有伺服器列表

        Returns:
            List[Dict]: 伺服器列表，每個伺服器包含 id 和 name
        """
        try:
            guilds = []
            for guild in self.bot.guilds:
                guilds.append({
                    'id': str(guild.id),
                    'name': guild.name
                })
            logger.debug(f"獲取到 {len(guilds)} 個伺服器")
            return guilds
        except Exception as e:
            logger.error(f"獲取伺服器列表時發生錯誤: {e}")
            return []

    def get_channels(self, guild_id: str) -> List[Dict]:
        """
        獲取指定伺服器的頻道列表

        Args:
            guild_id (str): 伺服器 ID

        Returns:
            List[Dict]: 頻道列表
        """
        try:
            guild = self.bot.get_guild(int(guild_id))
            if not guild:
                logger.error(f"找不到伺服器: {guild_id}")
                return []

            channels = []
            for channel in guild.text_channels:
                channels.append({
                    'id': str(channel.id),
                    'name': channel.name,
                    'type': 'text'
                })
            logger.debug(f"獲取頻道列表，共 {len(channels)} 個頻道")
            return channels
        except Exception as e:
            logger.error(f"獲取頻道列表時發生錯誤: {e}")
            return []

    def setup_flask_app(self) -> None:
        """
        設置 Flask 應用路由
        """
        if not hasattr(self, 'app'):
            self.app = Flask(__name__)

        @self.app.route('/')
        def index() -> str:
            """
            首頁路由

            Returns:
                str: 渲染後的 HTML 頁面
            """
            logger.debug("訪問首頁")
            return render_template('index.html')

        @self.app.route('/messages')
        def get_messages() -> str:
            """
            獲取訊息的路由

            Returns:
                str: JSON 格式的訊息列表
            """
            try:
                # 獲取請求中的時間戳記
                after_timestamp = request.args.get('after')
                logger.debug(f"收到訊息請求，時間戳記: {after_timestamp}")

                # 獲取訊息
                messages = self.get_message_history(after_timestamp)
                return json.dumps({'messages': messages})
            except Exception as e:
                logger.error(f"獲取訊息時發生錯誤: {e}")
                return json.dumps({'messages': []})

        @self.app.route('/guilds')
        def get_guilds() -> str:
            """
            獲取伺服器列表的路由

            Returns:
                str: JSON 格式的伺服器列表
            """
            try:
                guilds = self.get_guilds()
                return json.dumps(guilds)
            except Exception as e:
                logger.error(f"獲取伺服器列表時發生錯誤: {e}")
                return json.dumps([])

        @self.app.route('/channels/<guild_id>')
        def get_channels(guild_id: str) -> str:
            """
            獲取頻道列表的路由

            Args:
                guild_id (str): 伺服器 ID

            Returns:
                str: JSON 格式的頻道列表
            """
            try:
                channels = self.get_channels(guild_id)
                return json.dumps(channels)
            except Exception as e:
                logger.error(f"獲取頻道列表時發生錯誤: {e}")
                return json.dumps([])

    async def start_bot(self) -> None:
        """
        啟動 Discord 機器人
        """
        await self.bot.start(self.token)

    async def close_bot(self) -> None:
        """
        關閉 Discord 機器人
        """
        await self.bot.close()

    def get_bot(self) -> commands.Bot:
        """
        獲取 Discord 機器人實例

        Returns:
            commands.Bot: Discord 機器人實例
        """
        return self.bot
