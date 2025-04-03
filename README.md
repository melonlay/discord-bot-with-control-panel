# Discord Bot with Control Panel

English | [繁體中文](README_zh.md)

A Discord bot with a web control panel for real-time message monitoring and management.

## Features

- Real-time Message Monitoring
  - Auto-updates every 5 seconds
  - Supports text and image messages
  - Click to zoom images
  - Messages are preserved when switching channels
- Server Management
  - Shows all servers the bot is in
  - Automatically selects the first server
- Channel Management
  - Shows all channels in the selected server
  - Automatically selects the first channel
  - Detailed debug logs for channel switching
- Message Sending
  - Send messages to selected channels
  - Detailed logging of sent messages
- User Interface
  - Clean web control panel
  - Responsive design
  - Image zoom functionality
  - Auto-scroll to latest messages

## Tech Stack

- Backend
  - Python
  - Flask
  - discord.py
- Frontend
  - HTML5
  - CSS3
  - JavaScript (ES6+)
- Others
  - WebSocket (for real-time updates)
  - RESTful API

## Installation

1. Clone the project
```bash
git clone https://github.com/yourusername/discord-bot-with-control-panel.git
cd discord-bot-with-control-panel
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Set up environment variables
```bash
# Copy example config
cp .env.example .env
# Edit .env file and add your Discord Bot Token
```

4. Start the application
```bash
python main.py
```

## Usage

1. After starting the application, visit `http://localhost:5000`
2. Select the server and channel to monitor
3. Messages will auto-update, or click refresh button manually
4. Click on images to zoom

## Project Structure

```
discord-bot-with-control-panel/
├── bot/
│   ├── __init__.py
│   ├── bot.py
│   ├── handlers/
│   │   ├── __init__.py
│   │   ├── commands.py
│   │   └── events.py
│   └── core/
│       ├── __init__.py
│       └── logger.py
├── web/
│   ├── __init__.py
│   ├── app.py
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css
│   │   └── js/
│   │       ├── eventHandler.js
│   │       ├── messageManager.js
│   │       └── uiManager.js
│   └── templates/
│       └── index.html
├── utils/
├── .env.template
├── .gitignore
├── main.py
├── requirements.txt
├── LICENSE
├── README.md
└── README_zh.md
```

## Developer Guide

### Adding New Features

1. Add new handlers in `bot/handlers/` directory
2. Add new JavaScript modules in `web/static/js/` directory
3. Update `web/templates/index.html` for new UI elements
4. Add new styles in `web/static/css/style.css`

### Debugging

- Check logs in `bot/core/logger.py`
- Use browser developer tools for frontend errors
- Check Flask debug output

## Changelog

### v1.0.0 (2024-03-21)
- Initial release
- Basic features implemented
  - Server selection
  - Channel selection
  - Message display
  - Image attachment support

### v1.0.1 (2024-03-21)
- Fixed image zoom functionality
  - Optimized image click event handling
  - Improved overlay styles
  - Enhanced user experience
- Updated README files
  - Added changelog
  - Improved feature descriptions
  - Updated project structure

### v1.0.2 (2024-04-03)
- Enhanced channel management
  - Added detailed debug logging for channel switching
  - Improved message display when switching channels
  - Optimized server and channel information storage
- Improved message handling
  - Enhanced message sending with channel name logging
  - Added more comprehensive error handling
  - Messages are now preserved when switching channels

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details

## Contact

For any questions or suggestions, please open an Issue or Pull Request. 