'use strict';

const TelegramBot = require('node-telegram-bot-api');
const { stmts } = require('./db');
const { getSubdomain, listAliases } = require('./cities');
const { buildRssUrl, pollWatch } = require('./poller');

// ── Formatting helpers ────────────────────────────────────────────────────────

function fmtPriceRange(min, max) {
  if (min == null && max == null) return 'any price';
  if (min == null) return `up to $${max}`;
  if (max == null) return `$${min}+`;
  return `$${min}–$${max}`;
}

function fmtWatchLine(w) {
  const icon   = w.status === 'active' ? '🟢' : '⏸';
  const digest = w.digest_mode ? ' 📰' : '';
  return (
    `${icon} <b>#${w.id}${digest}</b> — <code>${w.keyword}</code> in ${w.city}\n` +
    `   💰 ${fmtPriceRange(w.min_price, w.max_price)}  ` +
    `🌐 ${w.subdomain}.craigslist.org`
  );
}

const HELP_TEXT =
  `<b>Craigslist Monitor Bot</b>\n\n` +
  `<b>Commands:</b>\n` +
  `/watch [city] [keyword] [min] [max]\n` +
  `  <i>e.g.</i> <code>/watch baltimore kettlebell 0 50</code>\n` +
  `  <i>e.g.</i> <code>/watch "new york" "standing desk" 50 300</code>\n\n` +
  `/list — show your watches\n` +
  `/stop [id] — delete a watch\n` +
  `/pause [id] — pause alerts\n` +
  `/resume [id] — resume alerts\n` +
  `/digest [id] — toggle daily digest mode\n` +
  `/cities — list supported cities\n` +
  `/help — show this message`;

// ── Argument parser (handles quoted strings) ──────────────────────────────────

function parseArgs(str) {
  const args = [];
  let cur = '';
  let inQ = false;
  let qc  = '';

  for (const ch of str) {
    if (inQ) {
      if (ch === qc) { inQ = false; if (cur) { args.push(cur); cur = ''; } }
      else cur += ch;
    } else if (ch === '"' || ch === "'") {
      inQ = true; qc = ch;
    } else if (ch === ' ') {
      if (cur) { args.push(cur); cur = ''; }
    } else {
      cur += ch;
    }
  }
  if (cur) args.push(cur);
  return args;
}

// ── Bot factory ───────────────────────────────────────────────────────────────

function createBot(token) {
  const bot = new TelegramBot(token, { polling: true });
  const POLL_MIN = process.env.POLL_INTERVAL_MINUTES || '15';

  // ── /start + /help ──────────────────────────────────────────────────────────
  bot.onText(/\/(start|help)/, (msg) => {
    bot.sendMessage(msg.chat.id, HELP_TEXT, { parse_mode: 'HTML' });
  });

  // ── /cities ─────────────────────────────────────────────────────────────────
  bot.onText(/\/cities/, (msg) => {
    const list = listAliases().join(', ');
    bot.sendMessage(msg.chat.id,
      `<b>Supported city names:</b>\n${list}`,
      { parse_mode: 'HTML' }
    );
  });

  // ── /watch ──────────────────────────────────────────────────────────────────
  bot.onText(/\/watch (.+)/, async (msg, match) => {
    const chatId = String(msg.chat.id);
    const args   = parseArgs(match[1]);

    if (args.length < 2) {
      return bot.sendMessage(chatId,
        '❌ Usage: <code>/watch [city] [keyword] [min_price] [max_price]</code>\n' +
        'Example: <code>/watch baltimore kettlebell 0 50</code>',
        { parse_mode: 'HTML' }
      );
    }

    const city     = args[0];
    const keyword  = args[1];
    const minPrice = args[2] != null ? parseInt(args[2], 10) : null;
    const maxPrice = args[3] != null ? parseInt(args[3], 10) : null;

    const subdomain = getSubdomain(city);
    if (!subdomain) {
      return bot.sendMessage(chatId,
        `❌ Unknown city: <b>${city}</b>\nUse /cities to see supported cities.`,
        { parse_mode: 'HTML' }
      );
    }

    const { lastInsertRowid: watchId } = stmts.addWatch.run({
      chat_id: chatId, city, subdomain, keyword,
      min_price: minPrice, max_price: maxPrice,
    });

    await bot.sendMessage(chatId,
      `✅ <b>Watch #${watchId} created!</b>\n` +
      `🏙 ${city} (${subdomain}.craigslist.org)\n` +
      `🔍 ${keyword}  💰 ${fmtPriceRange(minPrice, maxPrice)}\n\n` +
      `Seeding current listings — you'll only be alerted on <i>new</i> ones…`,
      { parse_mode: 'HTML' }
    );

    // Seed: mark all existing listings as seen, no alerts
    const watch = { id: watchId, chat_id: chatId, city, subdomain, keyword,
                    min_price: minPrice, max_price: maxPrice, digest_mode: 0 };
    try {
      const count = await pollWatch(watch, bot, { seed: true });
      await bot.sendMessage(chatId,
        `Seeded ${count} existing listing(s). ` +
        `New ones will arrive every ${POLL_MIN} min.`
      );
    } catch (err) {
      console.error(`[bot] seed poll failed for watch ${watchId}:`, err.message);
      await bot.sendMessage(chatId, `Watch active. Polling every ${POLL_MIN} min.`);
    }
  });

  // ── /list ───────────────────────────────────────────────────────────────────
  bot.onText(/\/list$/, (msg) => {
    const chatId  = String(msg.chat.id);
    const watches = stmts.getWatchesByChat.all(chatId);

    if (!watches.length) {
      return bot.sendMessage(chatId,
        'No watches yet. Use /watch to create one.',
        { parse_mode: 'HTML' }
      );
    }

    const lines = watches.map(fmtWatchLine).join('\n\n');
    bot.sendMessage(chatId, `<b>Your watches:</b>\n\n${lines}`, { parse_mode: 'HTML' });
  });

  // ── /stop [id] ──────────────────────────────────────────────────────────────
  bot.onText(/\/stop (\d+)/, (msg, match) => {
    const chatId  = String(msg.chat.id);
    const watchId = parseInt(match[1], 10);
    const watch   = stmts.getWatch.get(watchId, chatId);

    if (!watch) return bot.sendMessage(chatId, `❌ Watch #${watchId} not found.`);

    stmts.deleteWatch.run(watchId, chatId);
    bot.sendMessage(chatId,
      `🗑 Watch #${watchId} (<code>${watch.keyword}</code> in ${watch.city}) removed.`,
      { parse_mode: 'HTML' }
    );
  });

  // ── /pause [id] ─────────────────────────────────────────────────────────────
  bot.onText(/\/pause (\d+)/, (msg, match) => {
    const chatId  = String(msg.chat.id);
    const watchId = parseInt(match[1], 10);
    const watch   = stmts.getWatch.get(watchId, chatId);

    if (!watch) return bot.sendMessage(chatId, `❌ Watch #${watchId} not found.`);
    if (watch.status === 'paused')
      return bot.sendMessage(chatId, `Watch #${watchId} is already paused. Use /resume to activate.`);

    stmts.pauseWatch.run(watchId, chatId);
    bot.sendMessage(chatId,
      `⏸ Watch #${watchId} (<code>${watch.keyword}</code> in ${watch.city}) paused.`,
      { parse_mode: 'HTML' }
    );
  });

  // ── /resume [id] ────────────────────────────────────────────────────────────
  bot.onText(/\/resume (\d+)/, (msg, match) => {
    const chatId  = String(msg.chat.id);
    const watchId = parseInt(match[1], 10);
    const watch   = stmts.getWatch.get(watchId, chatId);

    if (!watch) return bot.sendMessage(chatId, `❌ Watch #${watchId} not found.`);
    if (watch.status === 'active')
      return bot.sendMessage(chatId, `Watch #${watchId} is already active.`);

    stmts.resumeWatch.run(watchId, chatId);
    bot.sendMessage(chatId,
      `▶️ Watch #${watchId} (<code>${watch.keyword}</code> in ${watch.city}) resumed.`,
      { parse_mode: 'HTML' }
    );
  });

  // ── /digest [id] ────────────────────────────────────────────────────────────
  bot.onText(/\/digest (\d+)/, (msg, match) => {
    const chatId  = String(msg.chat.id);
    const watchId = parseInt(match[1], 10);
    const watch   = stmts.getWatch.get(watchId, chatId);

    if (!watch) return bot.sendMessage(chatId, `❌ Watch #${watchId} not found.`);

    stmts.toggleDigest.run(watchId, chatId);
    const nowOn = !watch.digest_mode;
    bot.sendMessage(chatId,
      `📰 Watch #${watchId} digest mode: ${nowOn ? '✅ ON — daily summary' : '❌ OFF — instant alerts'}`
    );
  });

  bot.on('polling_error', (err) => {
    console.error('[bot] polling error:', err.message);
  });

  return bot;
}

module.exports = { createBot };
