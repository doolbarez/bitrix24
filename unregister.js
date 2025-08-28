#!/usr/bin/env node
require('dotenv').config();
const minimist = require('minimist');
const { call } = require('./shared');

(async () => {
  const argv = minimist(process.argv.slice(2));
  const botId = argv.bot || argv.b;
  if (!botId) {
    console.error('Usage: node unregister.js --bot <BOT_ID>');
    process.exit(1);
  }
  try {
    const result = await call('imbot.unregister', { BOT_ID: botId , CLIENT_ID : 1});
    console.log('Unregistered:', result);
  } catch (e) {
    console.error('Unregister error:', e.message || e);
    process.exit(1);
  }
})();
