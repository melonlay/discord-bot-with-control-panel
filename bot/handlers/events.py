"""
事件處理模組

此模組包含所有 Discord 機器人的事件處理器。
"""

from typing import Dict, List, Optional
import discord
from discord.ext import commands
from ..core.logger import logger


def setup_events(bot: commands.Bot, discord_bot) -> None:
    """
    設置所有事件處理器

    Args:
        bot (commands.Bot): Discord 機器人實例
        discord_bot: DiscordBot 類的實例
    """
    @bot.event
    async def on_ready() -> None:
        """
        當機器人準備就緒時觸發的事件處理器
        """
        logger.info(f'{bot.user} 已經上線！')
        logger.info('已加入的伺服器列表:')
        for guild in bot.guilds:
            logger.info(f'伺服器名稱: {guild.name}')
            logger.info(f'伺服器 ID: {guild.id}')
            logger.info(f'成員數量: {guild.member_count}')
            logger.info('---')

    @bot.event
    async def on_message(message: discord.Message) -> None:
        """
        當收到新訊息時觸發的事件處理器

        Args:
            message (discord.Message): 收到的訊息對象
        """
        if message.author == bot.user:
            return

        try:
            logger.info(f"收到來自 {message.author} 的訊息")

            # 處理附件
            attachments: List[Dict] = []
            for attachment in message.attachments:
                attachment_data = {
                    'url': attachment.url,
                    'filename': attachment.filename,
                    'content_type': attachment.content_type,
                    'size': attachment.size
                }
                attachments.append(attachment_data)
                logger.debug(f"處理附件: {attachment_data}")

            # 建立訊息資料
            message_data = {
                'id': str(message.id),
                'author': str(message.author),
                'content': message.content,
                'timestamp': message.created_at.isoformat(),
                'channel_id': str(message.channel.id),
                'channel_name': str(message.channel.name),
                'guild_id': str(message.guild.id) if message.guild else None,
                'guild_name': str(message.guild.name) if message.guild else None,
                'attachments': attachments
            }

            # 添加到訊息歷史
            discord_bot.add_message(message_data)

        except Exception as e:
            logger.error(f"處理訊息時發生錯誤: {e}")
            # 繼續處理命令
            await bot.process_commands(message)
            return

        await bot.process_commands(message)
