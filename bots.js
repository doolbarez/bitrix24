#!/usr/bin/env node
require('dotenv').config();
const { call } = require('./webhook-client/shared');

(async () => {
  try {
    const result = await call('imbot.bot.list');
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Bots error:', e.message || e);
    process.exit(1);
  }
})();
