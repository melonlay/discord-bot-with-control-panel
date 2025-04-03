"""
命令處理模組

此模組包含所有 Discord 機器人的自定義命令。
"""

from typing import Optional
import discord
from discord.ext import commands
from ..core.logger import logger


def setup_commands(bot: commands.Bot) -> None:
    """
    設置所有自定義命令

    Args:
        bot (commands.Bot): Discord 機器人實例
    """
    @bot.command(name='ping')
    async def ping(ctx: commands.Context) -> None:
        """
        回應 ping 命令，用於測試機器人是否在線

        Args:
            ctx (commands.Context): 命令上下文
        """
        logger.debug(f"收到 ping 命令，來自 {ctx.author}")
        await ctx.send('Pong!')

    @bot.command(name='help')
    async def help(ctx: commands.Context) -> None:
        """
        顯示幫助訊息

        Args:
            ctx (commands.Context): 命令上下文
        """
        help_message = """
        可用的命令：
        !ping - 測試機器人是否在線
        !help - 顯示此幫助訊息
        """
        await ctx.send(help_message)
