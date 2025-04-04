from flask import Flask
from werkzeug.serving import make_server
import threading
import logging
from datetime import datetime
from .routes import Routes
from utils.config import FLASK_HOST, FLASK_PORT

# 獲取日誌記錄器
logger = logging.getLogger(__name__)


class FlaskApp:
    def __init__(self, discord_bot):
        self.discord_bot = discord_bot
        self.app = Flask(__name__,
                         template_folder='templates',
                         static_folder='static')
        self.server = None
        self.server_thread = None

        # 初始化訊息快取
        self.message_cache = {}
        self.setup_routes()
        logger.info("FlaskApp 初始化完成")

    def setup_routes(self):
        # 初始化路由
        self.routes = Routes(self.app, self.discord_bot, self.message_cache)
        logger.info("路由設置完成")

    def start(self):
        try:
            logger.info(f"正在啟動 Flask 伺服器於 {FLASK_HOST}:{FLASK_PORT}")
            self.server = make_server(FLASK_HOST, FLASK_PORT, self.app)
            self.server_thread = threading.Thread(
                target=self.server.serve_forever,
                name="FlaskServer"
            )
            self.server_thread.daemon = True
            self.server_thread.start()
            logger.info("Flask 伺服器已啟動")
        except Exception as e:
            logger.error(f"啟動 Flask 伺服器時發生錯誤: {str(e)}")
            raise

    def shutdown(self):
        if self.server:
            logger.info("正在關閉 Flask 伺服器...")
            self.server.shutdown()
            self.server_thread.join()
            logger.info("Flask 伺服器已關閉")
