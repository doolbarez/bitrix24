// Load .env from current folder; if missing, try project root
const path = require('path');
const fs = require('fs');
const localEnv = path.join(__dirname, '.env');
if (fs.existsSync(localEnv)) {
  require('dotenv').config({ path: localEnv });
} else {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
}
const axios = require('axios');

const WEBHOOK_BASE = (process.env.BITRIX_WEBHOOK_BASE || '').trim();
const APP_URL = (process.env.APP_URL || '').trim();
const EVENT_HANDLER_URL = (process.env.BITRIX_EVENT_HANDLER_URL || '').trim();
const BOT_CODE = (process.env.BOT_CODE || 'deathlaff_bot').trim();
const BOT_NAME = (process.env.BOT_NAME || 'Бобр ДОБР Бот ').trim();

if (!WEBHOOK_BASE) console.error('Set BITRIX_WEBHOOK_BASE in .env (either webhook-client/.env or project .env)');

function handlerUrl() {
  if (EVENT_HANDLER_URL) return EVENT_HANDLER_URL;
  if (!APP_URL) return '';
  const base = APP_URL.endsWith('/') ? APP_URL.slice(0, -1) : APP_URL;
  return `${base}/handler`;
}

async function call(method, params = {}) {
  const url = `${WEBHOOK_BASE}${method}.json`;
  const res = await axios.post(url, params, { timeout: 15000, headers: { 'Content-Type': 'application/json' } });
  if (res.data && res.data.error) {
    throw new Error(`${res.data.error}: ${res.data.error_description || ''}`);
  }
  return res.data.result;
}

module.exports = { call, handlerUrl, BOT_CODE, BOT_NAME };
