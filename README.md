Бот для Битрикс24. Скрипт сам регистрирует бота, если необходимо. Сам бот уведомляет о запуске выдавая текущее время и желает доброе утро каждый день.
# Установка зависимостей
npm install

# Пример правильного .env
BITRIX_WEBHOOK_BASE=ссылка
BITRIX_WEBHOOK_CLIENT_ID=1
BOT_NAME=Имя
BOT_CODE=id
BITRIX_EVENT_HANDLER_URL=http://www.hazz/chatApi/event.php
MORNING_DIALOG_ID=1
MORNING_TEXT=Доброе утро!
MORNING_TIMEZONE=Asia/Krasnoyarsk

# Запуск бота
npm run morning
