'use strict';

const RSSParser = require('rss-parser');
const fs        = require('fs');
const path      = require('path');
const { stmts } = require('./db');
const mailer    = require('./mailer');

// Optional HTTP/HTTPS proxy — set HTTPS_PROXY or HTTP_PROXY env var.
// Craigslist blocks datacenter IPs; a residential proxy is required on Railway.
let _fetchOptions = {};
(async () => {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (proxyUrl) {
    try {
      const { ProxyAgent } = await import('undici');
      _fetchOptions.dispatcher = new ProxyAgent(proxyUrl);
      console.log(`[poller] using proxy: ${proxyUrl}`);
    } catch {
      console.warn('[poller] undici not available; proxy ignored');
    }
  }
})();

const parser = new RSSParser({
  customFields: {
    item: [
      ['enc:enclosure',   'enclosure'],
      ['media:content',   'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
    ],
  },
});

const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
fs.mkdirSync(LOG_DIR, { recursive: true });
const LOG_FILE = path.join(LOG_DIR, 'matches.log');

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildRssUrl(watch) {
  const p = new URLSearchParams({ query: watch.keyword, format: 'rss' });
  if (watch.min_price != null) p.set('min_price', watch.min_price);
  if (watch.max_price != null) p.set('max_price', watch.max_price);
  return `https://${watch.subdomain}.craigslist.org/search/sss?${p}`;
}

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
    item.enclosure?.url            ||
    item.mediaContent?.['$']?.url  ||
    item.mediaThumbnail?.['$']?.url ||
    null
  );
}

function appendLog(entry) {
  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
}

// ── Core poll ─────────────────────────────────────────────────────────────────

/**
 * @param {object} watch
 * @param {object} [opts]
 * @param {boolean} [opts.seed]  Mark listings seen but do not alert.
 * @returns {number}  Count of new listings found.
 */
async function pollWatch(watch, { seed = false } = {}) {
  const url = buildRssUrl(watch);
  let feed;

  try {
    const res = await fetch(url, {
      ..._fetchOptions,
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept':          'application/rss+xml, application/xml, text/xml, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control':   'no-cache',
      },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    feed = await parser.parseString(await res.text());
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

    const price    = extractPrice(item.title);
    const title    = cleanTitle(item.title || 'No title');
    const location = item['g2:city'] || watch.city;
    const link     = item.link || '';
    const thumb    = extractThumb(item);
    const posted   = item.pubDate
      ? new Date(item.pubDate).toLocaleString('en-US', {
          month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
          timeZone: 'UTC', timeZoneName: 'short',
        })
      : 'unknown';

    if (watch.digest_mode) {
      stmts.queueDigestItem.run({
        watch_id:   watch.id,
        chat_id:    watch.chat_id,
        title:      item.title || '',
        price:      price || '',
        link,
        listing_id: listingId,
      });
    } else {
      try {
        await mailer.sendAlert({ watch, title, price, location, posted, link, thumb });
      } catch (err) {
        console.error(`[poller] email failed for watch ${watch.id}: ${err.message}`);
      }
    }

    appendLog({
      timestamp:  new Date().toISOString(),
      watch_id:   watch.id,
      keyword:    watch.keyword,
      city:       watch.city,
      title:      item.title,
      price,
      link,
      listing_id: listingId,
    });
  }

  return newCount;
}

// ── Full scheduled sweep ───────────────────────────────────────────────────────

async function pollAll() {
  const watches = stmts.getAllActiveWatches.all();
  console.log(`[poller] polling ${watches.length} active watch(es)...`);
  for (const watch of watches) {
    await pollWatch(watch);
  }
}

// ── Daily digest ──────────────────────────────────────────────────────────────

async function sendDailyDigests() {
  const chats = stmts.getDistinctDigestChats.all();
  if (!chats.length) return;

  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC',
  });

  for (const { chat_id } of chats) {
    const rows = stmts.getDigestItemsByChat.all(chat_id);
    if (!rows.length) continue;

    const byWatch = {};
    for (const row of rows) {
      (byWatch[row.watch_id] ??= []).push(row);
    }

    const sections = Object.entries(byWatch).map(([wid, items]) => ({
      watchId: wid,
      keyword: items[0].keyword,
      city:    items[0].city,
      items:   items.map(r => ({ title: cleanTitle(r.title), price: r.price, link: r.link })),
    }));

    try {
      await mailer.sendDigest({ chatLabel: chat_id, date, sections });
    } catch (err) {
      console.error(`[digest] email failed: ${err.message}`);
    }

    stmts.clearDigestForChat.run(chat_id);
  }
}

module.exports = { buildRssUrl, pollWatch, pollAll, sendDailyDigests };
