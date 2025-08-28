require('dotenv').config();
const minimist = require('minimist');
const cron = require('node-cron');
const { call, handlerUrl, BOT_CODE, BOT_NAME } = require('./shared');

const argv = minimist(process.argv.slice(2));

const MORNING_DIALOG_ID = (process.env.MORNING_DIALOG_ID || argv.dialog || argv.d || '').toString().trim();
const MORNING_TEXT = (process.env.MORNING_TEXT || argv.text || argv.t || 'Доброе утро!').toString();
const TIMEZONE = (process.env.MORNING_TIMEZONE || 'Asia/Krasnoyarsk').trim();
const NO_EVENTS = !!process.env.NO_EVENTS || !!argv['no-events'] || !!argv.noevents;

function getClientId() {
  return (process.env.BITRIX_WEBHOOK_CLIENT_ID || '').toString().trim();
}

function formatTimeInTz(tz) {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      timeZone: tz,
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(new Date());
  } catch (_) {
    return new Date().toLocaleTimeString('ru-RU');
  }
}

async function findExistingBot() {
  const list = await call('imbot.bot.list');
  if (!Array.isArray(list)) return null;
  const byCodeAndName = list.find(
    (b) => String(b.CODE).trim() === String(BOT_CODE).trim() && String(b.NAME).trim() === String(BOT_NAME).trim()
  );
  return byCodeAndName ? byCodeAndName.ID : null;
}

async function registerBot() {
  const h = handlerUrl();
  if (!h && !NO_EVENTS) {
    throw new Error('No event handler URL. Set BITRIX_EVENT_HANDLER_URL or APP_URL, or run with --no-events');
  }
  const payload = {
    CODE: BOT_CODE,
    TYPE: 'B',
    OPENLINE: 'Y',
    PROPERTIES: { NAME: BOT_NAME },
  };
  if (!NO_EVENTS && h) payload.EVENT_HANDLER = h;
  const cid = getClientId();
  if (cid) payload.CLIENT_ID = cid;
  const result = await call('imbot.register', payload);
  // result is BOT_ID (number)
  return result;
}

async function ensureBot() {
  let botId = await findExistingBot();
  if (botId) return botId;
  botId = await registerBot();
  return botId;
}

function sendMorning(botId) {
  return async () => {
    if (!MORNING_DIALOG_ID) {
      throw new Error('MORNING_DIALOG_ID is not set. Provide --dialog <ID> or set env MORNING_DIALOG_ID');
    }
    const payload = {
      BOT_ID: botId,
      DIALOG_ID: MORNING_DIALOG_ID,
      MESSAGE: MORNING_TEXT,
    };
    const cid = getClientId();
    if (cid) payload.CLIENT_ID = cid;
    const res = await call('imbot.message.add', payload);
    return res;
  };
}

async function sendStartupTimeMessage(botId) {
  if (!MORNING_DIALOG_ID) {
    throw new Error('MORNING_DIALOG_ID is not set. Provide --dialog <ID> or set env MORNING_DIALOG_ID');
  }
  const nowStr = formatTimeInTz(TIMEZONE);
  const text = `Бот запущен. Сейчас ${nowStr}. Утром я напишу`;
  const payload = {
    BOT_ID: botId,
    DIALOG_ID: MORNING_DIALOG_ID,
    MESSAGE: text,
  };
  const cid = getClientId();
  if (cid) payload.CLIENT_ID = cid;
  return call('imbot.message.add', payload);
}

(async () => {
  try {
    if (!MORNING_DIALOG_ID && !argv.now) {
      console.error('Set MORNING_DIALOG_ID in .env or pass --dialog <ID>.');
      process.exit(1);
    }
    const botId = await ensureBot();
    console.log(`Using BOT_ID=${botId} (NAME="${BOT_NAME}", CODE="${BOT_CODE}")`);

  // Always send a startup message with current time
  const sent = await sendStartupTimeMessage(botId);
  console.log('Startup time message sent:', sent);
  if (argv.now) return;

    // Schedule at 09:00:00 every day in Asia/Krasnoyarsk
    cron.schedule('0 0 9 * * *', async () => {
      try {
        const res = await sendMorning(botId)();
        console.log(`[${new Date().toISOString()}] Morning message sent:`, res);
      } catch (err) {
        console.error('Send error:', err.message || err);
      }
    }, { timezone: TIMEZONE });

    console.log(`Scheduler started. Timezone=${TIMEZONE}. Will send daily at 09:00.`);
  } catch (e) {
    console.error('Startup error:', e.message || e);
    process.exit(1);
  }
})();
