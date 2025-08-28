#!/usr/bin/env node
require('dotenv').config();
const minimist = require('minimist');
const { call, handlerUrl, BOT_CODE, BOT_NAME } = require('./webhook-client/shared');

(async () => {
  try {
    const argv = minimist(process.argv.slice(2));
    let noEvents = !!process.env.NO_EVENTS || !!argv['no-events'] || !!argv.noevents;

    const h = handlerUrl();
    if (!h && !noEvents) {
      console.error('Registration requires an event handler URL (set BITRIX_EVENT_HANDLER_URL or APP_URL) or pass --no-events.');
      process.exit(1);
    }

    const payload = {
      CODE: BOT_CODE,
      TYPE: 'B',
      OPENLINE: 'Y',
      PROPERTIES: { NAME: BOT_NAME },
    };
    if (!noEvents && h) {
      // Minimal: single handler field is acceptable per docs
      payload.EVENT_HANDLER = h;
    }
    const clientId = (process.env.BITRIX_WEBHOOK_CLIENT_ID || '').trim();
    if (clientId) payload.CLIENT_ID = clientId;

    const result = await call('imbot.register', payload);
    console.log('Registered:', result);
    if (noEvents) {
      console.log('Note: Registered without EVENT_* handlers. Some portals may require valid handler URLs.');
    }
  } catch (e) {
    console.error('Register error:', e.message || e);
    process.exit(1);
  }
})();
