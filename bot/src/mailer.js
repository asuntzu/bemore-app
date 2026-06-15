'use strict';

const nodemailer = require('nodemailer');

let _transport = null;

function transport() {
  if (_transport) return _transport;
  if (!process.env.SMTP_HOST) return null;
  _transport = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth:   process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return _transport;
}

async function sendAlert({ watch, title, price, location, posted, link, thumb }) {
  const t = transport();
  if (!t) return;

  const subject = `[CL #${watch.id}] ${title} — ${price || 'price unknown'}`;

  const thumbHtml = thumb
    ? `<p><img src="${thumb}" alt="listing photo" style="max-width:400px"></p>`
    : '';

  const html =
    `<h2>New Craigslist listing</h2>` +
    `<p><strong>Watch #${watch.id}</strong>: ${watch.keyword} in ${watch.city}</p>` +
    `${thumbHtml}` +
    `<table>` +
    `<tr><td><b>Title</b></td><td>${title}</td></tr>` +
    `<tr><td><b>Price</b></td><td>${price || '—'}</td></tr>` +
    `<tr><td><b>Location</b></td><td>${location}</td></tr>` +
    `<tr><td><b>Posted</b></td><td>${posted}</td></tr>` +
    `<tr><td><b>Link</b></td><td><a href="${link}">${link}</a></td></tr>` +
    `</table>`;

  await t.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      process.env.EMAIL_TO,
    subject,
    html,
    text:    `${title}\n${price || ''}\n${location}\n${posted}\n${link}`,
  });
}

async function sendDigest({ chatLabel, date, sections }) {
  const t = transport();
  if (!t) return;

  let html = `<h2>Craigslist Daily Digest — ${date}</h2>`;
  let text = `Craigslist Daily Digest — ${date}\n`;

  for (const { watchId, keyword, city, items } of sections) {
    html += `<h3>Watch #${watchId}: ${keyword} in ${city}</h3><ul>`;
    text += `\nWatch #${watchId}: ${keyword} in ${city}\n`;
    for (const item of items.slice(0, 20)) {
      html += `<li><a href="${item.link}">${item.title}</a>${item.price ? ` — ${item.price}` : ''}</li>`;
      text += `- ${item.title}${item.price ? ` — ${item.price}` : ''}\n  ${item.link}\n`;
    }
    if (items.length > 20) {
      html += `<li><em>…and ${items.length - 20} more</em></li>`;
      text += `…and ${items.length - 20} more\n`;
    }
    html += '</ul>';
  }

  await t.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      process.env.EMAIL_TO,
    subject: `Craigslist Digest — ${date}`,
    html,
    text,
  });
}

module.exports = { sendAlert, sendDigest };
