import os
from dotenv import load_dotenv

# 載入環境變數
load_dotenv()

# Discord 配置
DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')
COMMAND_PREFIX = '!'

# Flask 配置
FLASK_HOST = 'localhost'
FLASK_PORT = 5000

# 訊息歷史配置
MAX_MESSAGES = 100
