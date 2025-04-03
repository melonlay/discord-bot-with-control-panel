from flask import Flask, render_template, jsonify, Response, request
from utils.config import FLASK_HOST, FLASK_PORT
from utils.logger import logger
from threading import Thread, Lock
from werkzeug.serving import make_server
import json
import time
import uuid


class FlaskApp:
    def __init__(self, discord_bot):
        self.app = Flask(__name__)
        self.discord_bot = discord_bot
        self.last_messages = []
        self.connections = set()
        self.connections_lock = Lock()
        self.setup_routes()
        logger.info("Flask 應用初始化完成")

    def setup_routes(self):
        @self.app.route('/')
        def index():
            logger.debug("訪問首頁")
            return render_template('index.html')

        @self.app.route('/messages')
        def get_messages():
            try:
                # 獲取時間戳參數
                after_timestamp = request.args.get('after')
                if after_timestamp:
                    logger.debug(f"請求 {after_timestamp} 之後的訊息")

                # 獲取訊息
                messages = self.discord_bot.get_message_history(
                    after_timestamp)
                logger.debug(f"從 DiscordBot 獲取訊息歷史，共 {len(messages)} 條訊息")

                # 處理訊息格式
                for msg in messages:
                    if 'guild_id' in msg and msg['guild_id'] is not None:
                        msg['guild_id'] = str(msg['guild_id'])
                    logger.debug(f"訊息內容: {msg}")

                return jsonify(messages)
            except Exception as e:
                logger.error(f"獲取訊息時發生錯誤: {e}")
                return jsonify([])

        @self.app.route('/guilds')
        def get_guilds():
            guilds = self.discord_bot.get_guilds()
            logger.debug(f"從 DiscordBot 獲取伺服器列表，共 {len(guilds)} 個伺服器")
            for guild in guilds:
                guild['id'] = str(guild['id'])
                logger.debug(f"伺服器: {guild}")
            return jsonify(guilds)

        @self.app.route('/stream')
        def stream():
            def event_stream():
                # 生成唯一的連接 ID
                connection_id = str(uuid.uuid4())

                # 註冊新的連接
                with self.connections_lock:
                    self.connections.add(connection_id)
                    logger.debug(
                        f"新的 SSE 連接建立，ID: {connection_id}，當前連接數: {len(self.connections)}")

                try:
                    # 發送初始訊息
                    initial_messages = self.discord_bot.get_message_history()
                    for msg in initial_messages:
                        if 'guild_id' in msg and msg['guild_id'] is not None:
                            msg['guild_id'] = str(msg['guild_id'])
                    yield f"data: {json.dumps({'messages': initial_messages})}\n\n"

                    # 定期發送最新訊息
                    while True:
                        time.sleep(1)  # 每秒更新一次
                        current_messages = self.discord_bot.get_message_history()
                        for msg in current_messages:
                            if 'guild_id' in msg and msg['guild_id'] is not None:
                                msg['guild_id'] = str(msg['guild_id'])
                        yield f"data: {json.dumps({'messages': current_messages})}\n\n"
                except GeneratorExit:
                    logger.debug(f"SSE 連接被關閉，ID: {connection_id}")
                finally:
                    # 移除斷開的連接
                    with self.connections_lock:
                        if connection_id in self.connections:
                            self.connections.remove(connection_id)
                            logger.debug(
                                f"SSE 連接關閉，ID: {connection_id}，當前連接數: {len(self.connections)}")

            return Response(
                event_stream(),
                mimetype="text/event-stream",
                headers={
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'X-Accel-Buffering': 'no',
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'text/event-stream',
                    'Transfer-Encoding': 'chunked'
                }
            )

    def notify_new_message(self):
        messages = self.discord_bot.get_message_history()
        for msg in messages:
            if 'guild_id' in msg and msg['guild_id'] is not None:
                msg['guild_id'] = str(msg['guild_id'])

        self.last_messages = messages
        logger.debug(f"已更新訊息，當前連接數: {len(self.connections)}")

    def run(self):
        self.app.run(host=FLASK_HOST, port=FLASK_PORT, threaded=True)


class FlaskThread(Thread):
    def __init__(self, app):
        Thread.__init__(self)
        self.app = app
        logger.info("Flask 執行緒初始化完成")

    def run(self):
        self.app.run()

    def shutdown(self):
        logger.info("正在關閉 Flask 伺服器...")
