'use strict';

require('dotenv').config();

const cron = require('node-cron');
const { pollAll, sendDailyDigests } = require('./poller');

const POLL_MIN    = Math.max(1, parseInt(process.env.POLL_INTERVAL_MINUTES || '15', 10));
const DIGEST_HOUR = Math.max(0, Math.min(23, parseInt(process.env.DIGEST_HOUR || '8', 10)));

if (!process.env.SMTP_HOST) {
  console.warn('[main] SMTP_HOST not set — email alerts are disabled');
}

console.log(`[main] Craigslist Monitor starting`);
console.log(`[main] Poll interval : every ${POLL_MIN} min`);
console.log(`[main] Digest time   : ${DIGEST_HOUR}:00 UTC daily`);

// Run one poll immediately on startup
pollAll().catch((err) => console.error('[main] startup poll error:', err.message));

// Recurring poll
const pollCron = POLL_MIN <= 59
  ? `*/${POLL_MIN} * * * *`
  : `0 */${Math.floor(POLL_MIN / 60)} * * *`;

cron.schedule(pollCron, () => {
  pollAll().catch((err) => console.error('[main] poll error:', err.message));
});

// Daily digest
cron.schedule(`0 ${DIGEST_HOUR} * * *`, () => {
  sendDailyDigests().catch((err) => console.error('[main] digest error:', err.message));
});

process.once('SIGTERM', () => { console.log('[main] shutting down'); process.exit(0); });
process.once('SIGINT',  () => { console.log('[main] shutting down'); process.exit(0); });
