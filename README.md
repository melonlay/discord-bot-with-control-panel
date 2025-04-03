# Discord Bot with Control Panel

[繁體中文](README.zh-TW.md) | English

A Discord bot with web control panel developed using Python and Flask.

## Features

- Discord Bot Features
  - Message monitoring and logging
  - Custom command system
  - Server management
- Web Control Panel
  - Real-time message display
  - Server selection
  - Message history
  - Image preview and zoom

## Tech Stack

- Backend
  - Python 3.10+
  - Discord.py
  - Flask
  - SQLite
- Frontend
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Fetch API

## Installation

1. Clone the repository
```bash
git clone https://github.com/melonlay/discord-bot-with-control-panel.git
cd discord-bot-with-control-panel
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Set up environment variables
```bash
# Copy the environment template
cp .env.template .env

# Edit the .env file with your configuration
# You need to set at least the DISCORD_TOKEN
```

4. Run the project
```bash
python main.py
```

## Usage

1. After starting the bot, visit `http://localhost:5000` to open the control panel
2. Select the server you want to monitor in the control panel
3. Messages will update automatically, or you can click the refresh button manually
4. Click on images to view them in full size

## Data Storage

- Messages are stored in `log/messages.json`
- Log files are stored in the `log` directory
- The `log` directory is automatically created when the bot starts
- The `log` directory is ignored by git to protect sensitive data

## Project Structure

```
discord-bot-with-control-panel/
├── bot/                    # Discord bot related
│   ├── core/              # Core functionality
│   │   └── logger.py      # Logging utilities
│   ├── handlers/          # Handlers
│   │   ├── events.py      # Event handlers
│   │   └── commands.py    # Command handlers
│   ├── bot.py             # Main bot class
│   └── __init__.py        # Module initialization
├── web/                    # Web related
│   ├── static/            # Static files
│   │   ├── css/           # Stylesheets
│   │   └── js/            # JavaScript
│   ├── templates/         # HTML templates
│   └── app.py             # Flask application
├── utils/                  # Utility functions
├── log/                    # Logs and message storage
│   ├── messages.json      # Message history
│   └── bot.log            # Bot logs
├── main.py                # Main program
├── requirements.txt       # Dependencies
├── LICENSE               # License
└── README.md             # Documentation
```

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact

For any questions or suggestions, please open an Issue or Pull Request. 