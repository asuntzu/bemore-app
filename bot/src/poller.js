'use strict';

const RSSParser = require('rss-parser');
const fs = require('fs');
const path = require('path');
const { stmts } = require('./db');

const parser = new RSSParser({
  customFields: {
    item: [
      ['enc:enclosure', 'enclosure'],
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
    ],
  },
});

const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
fs.mkdirSync(LOG_DIR, { recursive: true });
const LOG_FILE = path.join(LOG_DIR, 'matches.log');

// ── URL builder ────────────────────────────────────────────────────────────────

function buildRssUrl(watch) {
  const params = new URLSearchParams({ query: watch.keyword, format: 'rss' });
  if (watch.min_price != null) params.set('min_price', watch.min_price);
  if (watch.max_price != null) params.set('max_price', watch.max_price);
  return `https://${watch.subdomain}.craigslist.org/search/sss?${params}`;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function extractListingId(link = '') {
  const m = link.match(/\/(\d+)\.html/);
  return m ? m[1] : link;
}

function extractPrice(title = '') {
  const m = title.match(/\$([\d,]+)/);
  return m ? `$${m[1]}` : null;
}

function cleanTitle(title = '') {
  return title.replace(/\s*-\s*\$[\d,]+.*$/, '').trim();
}

function extractThumb(item) {
  return (
    item.enclosure?.url ||
    item.mediaContent?.['$']?.url ||
    item.mediaThumbnail?.['$']?.url ||
    null
  );
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function appendLog(entry) {
  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
}

// ── Alert sender ───────────────────────────────────────────────────────────────

async function sendAlert(bot, watch, item) {
  const price     = extractPrice(item.title) || 'unknown price';
  const title     = cleanTitle(item.title || 'No title');
  const location  = item['g2:city'] || watch.city;
  const link      = item.link || '';
  const thumb     = extractThumb(item);
  const posted    = item.pubDate
    ? new Date(item.pubDate).toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short',
      })
    : 'unknown';

  const text =
    `🔔 <b>Watch #${watch.id}: ${escapeHtml(watch.keyword)} in ${escapeHtml(watch.city)}</b>\n` +
    `<b>${escapeHtml(title)}</b>\n` +
    `💰 ${escapeHtml(price)}  📍 ${escapeHtml(location)}  🕐 ${posted}\n` +
    `🔗 <a href="${escapeHtml(link)}">View listing</a>`;

  const opts = { parse_mode: 'HTML' };

  try {
    if (thumb) {
      await bot.sendPhoto(watch.chat_id, thumb, { caption: text, ...opts });
    } else {
      await bot.sendMessage(watch.chat_id, text, opts);
    }
  } catch (err) {
    // Photo may fail (invalid URL etc.) — fall back to text only
    try {
      await bot.sendMessage(watch.chat_id, text, opts);
    } catch (e) {
      console.error(`[poller] alert failed for watch ${watch.id}: ${e.message}`);
    }
  }

  appendLog({
    timestamp: new Date().toISOString(),
    watch_id:  watch.id,
    chat_id:   watch.chat_id,
    keyword:   watch.keyword,
    city:      watch.city,
    title:     item.title,
    price,
    link,
    listing_id: extractListingId(link),
  });
}

// ── Core poll ─────────────────────────────────────────────────────────────────

/**
 * @param {object} watch  - DB row
 * @param {object} bot    - TelegramBot instance
 * @param {object} opts
 * @param {boolean} opts.seed  - If true, mark listings seen but don't alert (initial seeding)
 * @returns {number}  count of new listings found
 */
async function pollWatch(watch, bot, { seed = false } = {}) {
  const url = buildRssUrl(watch);
  let feed;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CraigslistMonitorBot/1.0)' },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    feed = await parser.parseString(xml);
  } catch (err) {
    console.error(`[poller] watch ${watch.id} fetch error: ${err.message}`);
    return 0;
  }

  let newCount = 0;

  for (const item of feed.items || []) {
    const listingId = extractListingId(item.link || item.guid || '');
    if (!listingId) continue;
    if (stmts.isListingSeen.get(watch.id, listingId)) continue;

    stmts.markListingSeen.run(watch.id, listingId);
    newCount++;

    if (seed) continue;

    if (watch.digest_mode) {
      stmts.queueDigestItem.run({
        watch_id:   watch.id,
        chat_id:    watch.chat_id,
        title:      item.title || '',
        price:      extractPrice(item.title) || '',
        link:       item.link || '',
        listing_id: listingId,
      });
    } else {
      await sendAlert(bot, watch, item);
    }
  }

  return newCount;
}

// ── Scheduled full poll ────────────────────────────────────────────────────────

async function pollAll(bot) {
  const watches = stmts.getAllActiveWatches.all();
  console.log(`[poller] polling ${watches.length} active watch(es)...`);
  for (const watch of watches) {
    await pollWatch(watch, bot);
  }
}

// ── Daily digest sender ────────────────────────────────────────────────────────

async function sendDailyDigests(bot) {
  const chats = stmts.getDistinctDigestChats.all();
  if (!chats.length) return;

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC',
  });

  for (const { chat_id } of chats) {
    const items = stmts.getDigestItemsByChat.all(chat_id);
    if (!items.length) continue;

    // Group by watch
    const byWatch = {};
    for (const row of items) {
      (byWatch[row.watch_id] ??= []).push(row);
    }

    let msg = `📰 <b>Daily Digest — ${escapeHtml(dateStr)}</b>\n`;

    for (const [watchId, rows] of Object.entries(byWatch)) {
      const { keyword, city } = rows[0];
      msg += `\n<b>Watch #${watchId}: ${escapeHtml(keyword)} in ${escapeHtml(city)}</b>\n`;
      for (const row of rows.slice(0, 10)) {
        const title = cleanTitle(row.title || 'No title');
        const price = row.price || 'unknown price';
        msg += `• <a href="${escapeHtml(row.link)}">${escapeHtml(title)}</a> — ${escapeHtml(price)}\n`;
      }
      if (rows.length > 10) msg += `  <i>…and ${rows.length - 10} more</i>\n`;
    }

    try {
      await bot.sendMessage(chat_id, msg, { parse_mode: 'HTML', disable_web_page_preview: true });
    } catch (err) {
      console.error(`[digest] send failed for chat ${chat_id}: ${err.message}`);
    }

    stmts.clearDigestForChat.run(chat_id);
  }
}

module.exports = { buildRssUrl, pollWatch, pollAll, sendDailyDigests };
