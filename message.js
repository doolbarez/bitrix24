#!/usr/bin/env node
require('dotenv').config();
const minimist = require('minimist');
const { call } = require('./webhook-client/shared');

(async () => {
  const argv = minimist(process.argv.slice(2));
  const botId = argv.bot || argv.b;
  const dialogId = argv.dialog || argv.d;
  const text = argv.text || argv.t || 'Доброе утро!';
  if (!botId || !dialogId) {
    console.error('Usage: node message.js --bot <BOT_ID> --dialog <DIALOG_ID> --text "message"');
    process.exit(1);
  }
  try {
    const result = await call('imbot.message.add', {
      BOT_ID: botId,
      CLIENT_ID: 1,
      DIALOG_ID: String(dialogId),
      MESSAGE: text,
    });
    console.log('Message result:', result);
  } catch (e) {
    console.error('Message error:', e.message || e);
    process.exit(1);
  }
})();
