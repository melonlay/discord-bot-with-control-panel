from flask import jsonify, render_template, request
import logging
import asyncio
from datetime import datetime
import traceback
import discord

# 獲取日誌記錄器
logger = logging.getLogger(__name__)


class Routes:
    def __init__(self, app, discord_bot, message_cache):
        self.app = app
        self.discord_bot = discord_bot
        self.message_cache = message_cache
        self.setup_routes()
        logger.info("Routes 初始化完成")

    def setup_routes(self):
        @self.app.route('/')
        def index():
            logger.debug("訪問首頁")
            return render_template('index.html')

        @self.app.route('/guilds')
        def get_guilds():
            try:
                logger.debug("開始獲取伺服器列表")
                guilds = []
                for guild in self.discord_bot.bot.guilds:
                    guilds.append({
                        'id': str(guild.id),
                        'name': guild.name,
                        'icon': str(guild.icon.url) if guild.icon else None
                    })
                logger.debug(f"成功獲取 {len(guilds)} 個伺服器")
                return jsonify(guilds)
            except Exception as e:
                logger.error(
                    f"獲取伺服器列表時發生錯誤: {str(e)}\n{traceback.format_exc()}")
                return jsonify({'error': str(e)}), 500

        @self.app.route('/channels/<guild_id>')
        def get_channels(guild_id):
            try:
                logger.debug(f"開始獲取伺服器 {guild_id} 的頻道列表")
                guild = self.discord_bot.bot.get_guild(int(guild_id))
                if not guild:
                    logger.warning(f"找不到指定的伺服器: {guild_id}")
                    return jsonify({'error': '找不到指定的伺服器'}), 404

                channels = []
                for channel in guild.text_channels:
                    channels.append({
                        'id': str(channel.id),
                        'name': channel.name
                    })
                logger.debug(f"成功獲取 {len(channels)} 個頻道")
                return jsonify(channels)
            except Exception as e:
                logger.error(
                    f"獲取頻道列表時發生錯誤: {str(e)}\n{traceback.format_exc()}")
                return jsonify({'error': str(e)}), 500

        @self.app.route('/messages/<channel_id>')
        def get_messages(channel_id):
            try:
                logger.debug(f"開始獲取頻道 {channel_id} 的訊息")
                channel = self.discord_bot.bot.get_channel(int(channel_id))
                if not channel:
                    logger.warning(f"找不到指定的頻道: {channel_id}")
                    return jsonify({'error': '找不到指定的頻道'}), 404

                # 獲取時間戳參數
                after_timestamp = request.args.get('after')
                if after_timestamp:
                    try:
                        after_timestamp = datetime.fromisoformat(
                            after_timestamp.replace('Z', '+00:00'))
                        logger.debug(f"請求 {after_timestamp} 之後的訊息")
                    except ValueError as e:
                        logger.error(
                            f"時間戳格式錯誤: {str(e)}\n{traceback.format_exc()}")
                        return jsonify({'error': '無效的時間戳格式'}), 400

                # 如果快取中沒有，則從 Discord 獲取
                if channel_id not in self.message_cache:
                    logger.debug(f"頻道 {channel_id} 的快取為空，從 Discord 獲取訊息")
                    messages = []

                    async def fetch_messages():
                        message: discord.Message
                        messages = []

                        async for message in channel.history(limit=10):
                            logger.debug(
                                f"獲取到的訊息: {message.content},time:{message.created_at.isoformat()}")

                            message_data = {
                                'id': str(message.id),
                                'content': message.content,
                                'author': {
                                    'id': str(message.author.id),
                                    'name': message.author.name,
                                    'avatar': str(message.author.avatar.url) if message.author.avatar else None
                                },
                                'timestamp': message.created_at.isoformat(),
                                'attachments': []
                            }
                            for attachment in message.attachments:
                                if attachment.content_type and attachment.content_type.startswith('image/'):
                                    message_data['attachments'].append({
                                        'url': attachment.url,
                                        'filename': attachment.filename
                                    })

                            messages.append(message_data)
                        messages.reverse()
                        return messages

                    messages = asyncio.run_coroutine_threadsafe(
                        fetch_messages(),
                        self.discord_bot.bot.loop
                    ).result()

                    # 更新快取
                    self.message_cache[channel_id] = messages
                    logger.debug(f"成功獲取並快取 {len(messages)} 條訊息")

                # 從快取中獲取訊息
                cached_messages = self.message_cache[channel_id]
                logger.debug(f"快取中有 {len(cached_messages)} 條訊息")
                for message in cached_messages:
                    logger.debug(
                        f"快取中的訊息: {message['content']},time:{message['timestamp']}")
                if after_timestamp:
                    # 只返回時間戳之後的新訊息
                    new_messages = []
                    skipped_count = 0
                    for msg in cached_messages:
                        msg_timestamp = datetime.fromisoformat(
                            msg['timestamp'].replace('Z', '+00:00'))
                        if msg_timestamp > after_timestamp:
                            new_messages.append(msg)
                        else:
                            skipped_count += 1

                    logger.debug(
                        f"從快取中過濾出 {len(new_messages)} 條新訊息，跳過 {skipped_count} 條舊訊息")

                    # 如果沒有新訊息，則重新從 Discord 獲取
                    if not new_messages:
                        logger.debug("快取中沒有新訊息，重新從 Discord 獲取")
                        messages = []

                        async def fetch_new_messages():
                            # 使用訊息 ID 來獲取新訊息
                            last_message = cached_messages[-1] if cached_messages else None
                            if last_message:
                                last_message_id = int(last_message['id'])
                                logger.debug(
                                    f"使用最後一條訊息的 ID {last_message_id} 來獲取新訊息")
                                async for message in channel.history(limit=50, after=discord.Object(id=last_message_id), oldest_first=True):
                                    message_data = {
                                        'id': str(message.id),
                                        'content': message.content,
                                        'author': {
                                            'id': str(message.author.id),
                                            'name': message.author.name,
                                            'avatar': str(message.author.avatar.url) if message.author.avatar else None
                                        },
                                        'timestamp': message.created_at.isoformat(),
                                        'attachments': []
                                    }

                                    for attachment in message.attachments:
                                        if attachment.content_type and attachment.content_type.startswith('image/'):
                                            message_data['attachments'].append({
                                                'url': attachment.url,
                                                'filename': attachment.filename
                                            })

                                    messages.append(message_data)
                                    logger.debug(
                                        f"獲取到新訊息: ID={message.id}, 時間={message.created_at.isoformat()}")
                            return messages

                        new_messages = asyncio.run_coroutine_threadsafe(
                            fetch_new_messages(),
                            self.discord_bot.bot.loop
                        ).result()

                        # 更新快取
                        if new_messages:
                            # 檢查並移除重複的訊息
                            existing_ids = {msg['id']
                                            for msg in cached_messages}
                            unique_new_messages = [
                                msg for msg in new_messages if msg['id'] not in existing_ids]

                            if unique_new_messages:
                                self.message_cache[channel_id] = unique_new_messages + \
                                    cached_messages
                                logger.debug(
                                    f"成功獲取並快取 {len(unique_new_messages)} 條新訊息")
                                # 確保新訊息按時間順序排序
                                new_messages = sorted(
                                    unique_new_messages, key=lambda x: x['timestamp'])
                            else:
                                logger.debug("沒有新的不重複訊息需要快取")
                                new_messages = []

                    # 返回新訊息，並確保包含最新的時間戳
                    if new_messages:
                        last_message = new_messages[-1]
                        logger.debug(
                            f"最後一條訊息的時間戳: {last_message['timestamp']}")
                    else:
                        logger.debug("沒有新訊息可返回")
                    return jsonify(new_messages)
                else:
                    logger.debug(f"返回所有 {len(cached_messages)} 條快取訊息")
                    return jsonify(cached_messages)

            except Exception as e:
                logger.error(f"獲取訊息時發生錯誤: {str(e)}\n{traceback.format_exc()}")
                return jsonify({'error': str(e)}), 500

        @self.app.route('/send-message', methods=['POST'])
        def send_message():
            try:
                data = request.get_json()
                channel_id = data.get('channel_id')
                content = data.get('content')

                if not channel_id or not content:
                    logger.warning("缺少必要的參數")
                    return jsonify({'error': '缺少必要的參數'}), 400

                logger.debug(f"準備發送訊息到頻道 {channel_id}")
                channel = self.discord_bot.bot.get_channel(int(channel_id))
                if not channel:
                    logger.warning(f"找不到指定的頻道: {channel_id}")
                    return jsonify({'error': '找不到指定的頻道'}), 404

                self.discord_bot.bot.loop.create_task(channel.send(content))
                logger.debug("訊息已發送")
                return jsonify({'status': 'success'})
            except Exception as e:
                logger.error(f"發送訊息時發生錯誤: {str(e)}\n{traceback.format_exc()}")
                return jsonify({'error': str(e)}), 500
