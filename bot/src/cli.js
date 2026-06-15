#!/usr/bin/env node
'use strict';

require('dotenv').config();

const { stmts }                      = require('./db');
const { getSubdomain, listAliases }  = require('./cities');
const { buildRssUrl, pollWatch }     = require('./poller');

const [,, cmd, ...args] = process.argv;

const HELP = `
Craigslist Monitor — CLI

Commands:
  watch <city> <keyword> [min_price] [max_price]
        Add a new watch. Seeds existing listings so only new ones alert.

  list
        Show all watches.

  stop <id>
        Delete a watch permanently.

  pause <id>
        Pause alerts for a watch.

  resume <id>
        Resume alerts for a paused watch.

  digest <id>
        Toggle daily digest mode for a watch.

  cities
        List supported city names.

  seed <id>
        Re-seed a watch (mark all current listings as seen, no alerts).

Examples:
  node src/cli.js watch baltimore kettlebell 0 50
  node src/cli.js watch "new york" "standing desk" 100 400
  node src/cli.js list
  node src/cli.js stop 3
  node src/cli.js pause 1
  node src/cli.js resume 1
  node src/cli.js digest 2
`.trimStart();

// ── Formatting ────────────────────────────────────────────────────────────────

function fmtPrice(min, max) {
  if (min == null && max == null) return 'any price';
  if (min == null) return `up to $${max}`;
  if (max == null) return `$${min}+`;
  return `$${min}–$${max}`;
}

function fmtWatch(w) {
  const status = w.status === 'active' ? '🟢 active' : '⏸  paused';
  const digest = w.digest_mode ? '  [daily digest]' : '';
  return (
    `  #${w.id}  ${status}${digest}\n` +
    `       keyword : ${w.keyword}\n` +
    `       city    : ${w.city} (${w.subdomain}.craigslist.org)\n` +
    `       price   : ${fmtPrice(w.min_price, w.max_price)}\n` +
    `       created : ${w.created_at}`
  );
}

// ── Commands ──────────────────────────────────────────────────────────────────

async function cmdWatch(args) {
  if (args.length < 2) {
    console.error('Usage: watch <city> <keyword> [min_price] [max_price]');
    process.exit(1);
  }
  const [city, keyword, rawMin, rawMax] = args;
  const minPrice = rawMin != null ? parseInt(rawMin, 10) : null;
  const maxPrice = rawMax != null ? parseInt(rawMax, 10) : null;

  const subdomain = getSubdomain(city);
  if (!subdomain) {
    console.error(`Unknown city: "${city}". Run \`cities\` to see supported names.`);
    process.exit(1);
  }

  const { lastInsertRowid: id } = stmts.addWatch.run({
    chat_id:   'cli',
    city, subdomain, keyword,
    min_price: minPrice,
    max_price: maxPrice,
  });

  console.log(`Watch #${id} created: "${keyword}" in ${city} (${fmtPrice(minPrice, maxPrice)})`);
  console.log('Seeding current listings (no alerts for these)…');

  const watch = { id, chat_id: 'cli', city, subdomain, keyword,
                  min_price: minPrice, max_price: maxPrice, digest_mode: 0 };
  const count = await pollWatch(watch, { seed: true });
  console.log(`Seeded ${count} existing listing(s). New ones will be emailed.`);
}

function cmdList() {
  const watches = stmts.getWatchesByChat.all('cli');
  if (!watches.length) {
    console.log('No watches. Use `watch` to create one.');
    return;
  }
  console.log(`\n${watches.length} watch(es):\n`);
  watches.forEach((w) => console.log(fmtWatch(w)));
  console.log('');
}

function cmdStop(args) {
  const id = parseInt(args[0], 10);
  if (!id) { console.error('Usage: stop <id>'); process.exit(1); }
  const watch = stmts.getWatch.get(id, 'cli');
  if (!watch) { console.error(`Watch #${id} not found.`); process.exit(1); }
  stmts.deleteWatch.run(id, 'cli');
  console.log(`Watch #${id} ("${watch.keyword}" in ${watch.city}) deleted.`);
}

function cmdPause(args) {
  const id = parseInt(args[0], 10);
  if (!id) { console.error('Usage: pause <id>'); process.exit(1); }
  const watch = stmts.getWatch.get(id, 'cli');
  if (!watch) { console.error(`Watch #${id} not found.`); process.exit(1); }
  if (watch.status === 'paused') { console.log(`Watch #${id} is already paused.`); return; }
  stmts.pauseWatch.run(id, 'cli');
  console.log(`Watch #${id} paused.`);
}

function cmdResume(args) {
  const id = parseInt(args[0], 10);
  if (!id) { console.error('Usage: resume <id>'); process.exit(1); }
  const watch = stmts.getWatch.get(id, 'cli');
  if (!watch) { console.error(`Watch #${id} not found.`); process.exit(1); }
  if (watch.status === 'active') { console.log(`Watch #${id} is already active.`); return; }
  stmts.resumeWatch.run(id, 'cli');
  console.log(`Watch #${id} resumed.`);
}

function cmdDigest(args) {
  const id = parseInt(args[0], 10);
  if (!id) { console.error('Usage: digest <id>'); process.exit(1); }
  const watch = stmts.getWatch.get(id, 'cli');
  if (!watch) { console.error(`Watch #${id} not found.`); process.exit(1); }
  stmts.toggleDigest.run(id, 'cli');
  const now = !watch.digest_mode;
  console.log(`Watch #${id} digest mode: ${now ? 'ON (daily email)' : 'OFF (instant email)'}`);
}

async function cmdSeed(args) {
  const id = parseInt(args[0], 10);
  if (!id) { console.error('Usage: seed <id>'); process.exit(1); }
  const watch = stmts.getWatch.get(id, 'cli');
  if (!watch) { console.error(`Watch #${id} not found.`); process.exit(1); }
  console.log(`Re-seeding watch #${id}…`);
  const count = await pollWatch(watch, { seed: true });
  console.log(`Marked ${count} listing(s) as seen.`);
}

function cmdCities() {
  console.log('\nSupported city names:\n');
  const cols = listAliases();
  // Print in 3 columns
  for (let i = 0; i < cols.length; i += 3) {
    console.log(
      cols.slice(i, i + 3).map((c) => c.padEnd(24)).join('')
    );
  }
  console.log('');
}

// ── Dispatch ──────────────────────────────────────────────────────────────────

(async () => {
  switch (cmd) {
    case 'watch':  await cmdWatch(args);  break;
    case 'list':         cmdList();       break;
    case 'stop':         cmdStop(args);   break;
    case 'pause':        cmdPause(args);  break;
    case 'resume':       cmdResume(args); break;
    case 'digest':       cmdDigest(args); break;
    case 'seed':   await cmdSeed(args);   break;
    case 'cities':       cmdCities();     break;
    default:
      process.stdout.write(HELP);
  }
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
