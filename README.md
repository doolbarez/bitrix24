# Bitrix24 Webhook Client (Node)

Simple scripts to call Bitrix24 REST via your incoming webhook (no OAuth).

Supports:
- register: register a chatbot (imbot.register)
- message: send a message from bot (imbot.message.add)
- unregister: remove bot (imbot.unregister)
- profile: get current webhook user profile (profile)
- bots: list available bots (imbot.bot.list)
- morning: ensure bot exists, then send a daily message at 09:00 Asia/Krasnoyarsk

## Setup
1) Copy `.env.example` to `.env` and set your webhook:

BITRIX_WEBHOOK_BASE=https://<domain>/rest/<userId>/<code>/
APP_URL=https://<public>/  # optional; used for EVENT_* handler URLs if BITRIX_EVENT_HANDLER_URL not set
BITRIX_EVENT_HANDLER_URL=https://<public>/handler  # optional; direct handler URL
BOT_NAME=Бобр Бот
BOT_CODE=good_morning_bot

## Usage
From this folder:

- Register bot (with event handler):
  node register.js

- Register bot without events (some portals may reject this):
  node register.js --no-events

- Send message:
  node message.js --bot 123 --dialog 1 --text "Доброе утро!"

- Unregister:
  node unregister.js --bot 123

- Profile:
  node profile.js

- List bots:
  node bots.js

- Start daily morning scheduler (09:00 Asia/Krasnoyarsk):
  node morning.js --dialog <DIALOG_ID>

  Optional env:
  MORNING_DIALOG_ID=<ID>
  MORNING_TEXT=Доброе утро!
  MORNING_TIMEZONE=Asia/Krasnoyarsk

Notes:
- APP_URL or BITRIX_EVENT_HANDLER_URL must be publicly accessible for EVENT_* handlers.
- You can also set BITRIX_WEBHOOK_CLIENT_ID if your portal requires it for imbot.register.
