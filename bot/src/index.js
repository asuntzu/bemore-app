'use strict';

require('dotenv').config();

const cron = require('node-cron');
const { createBot }         = require('./bot');
const { pollAll, sendDailyDigests } = require('./poller');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error('[main] TELEGRAM_BOT_TOKEN is required');
  process.exit(1);
}

const POLL_MIN    = Math.max(1, parseInt(process.env.POLL_INTERVAL_MINUTES || '15', 10));
const DIGEST_HOUR = Math.max(0, Math.min(23, parseInt(process.env.DIGEST_HOUR || '8', 10)));

console.log(`[main] Craigslist Monitor Bot starting`);
console.log(`[main] Poll interval : ${POLL_MIN} min`);
console.log(`[main] Digest time   : ${DIGEST_HOUR}:00 UTC`);

const bot = createBot(TOKEN);

// ── Scheduled polling ─────────────────────────────────────────────────────────
// node-cron doesn't support intervals > 59 min natively,
// so we use a minute-level expression for intervals ≤ 59,
// or an hourly one for larger values.
const pollCron = POLL_MIN <= 59
  ? `*/${POLL_MIN} * * * *`
  : `0 */${Math.floor(POLL_MIN / 60)} * * *`;

cron.schedule(pollCron, () => {
  pollAll(bot).catch((err) => console.error('[main] poll error:', err.message));
});

// ── Daily digest ──────────────────────────────────────────────────────────────
cron.schedule(`0 ${DIGEST_HOUR} * * *`, () => {
  sendDailyDigests(bot).catch((err) => console.error('[main] digest error:', err.message));
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.once('SIGTERM', () => { console.log('[main] SIGTERM received, shutting down'); process.exit(0); });
process.once('SIGINT',  () => { console.log('[main] SIGINT received, shutting down');  process.exit(0); });

console.log('[main] Bot is running.');
