#!/usr/bin/env node
/* quick cannibalization checker: fetch pages & list their <title> for duplicate keywords */
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const BASE = 'https://frontend-weqm.onrender.com';
const routes = ['/', '/about', '/delivery', '/blog', '/contact'];

(async () => {
  const seen = new Map();
  for (const route of routes) {
    const url = `${BASE}${route}`;
    const html = await fetch(url).then((r) => r.text());
    const dom = new JSDOM(html);
    const title = dom.window.document.querySelector('title')?.textContent || '';
    console.log(route, '->', title);
    const words = title.toLowerCase().split(/[^a-z0-9]+/);
    const primary = words.filter(Boolean);
    primary.forEach((w) => {
      seen.set(w, (seen.get(w) || 0) + 1);
    });
  }
  console.log('\nPotential duplicates (keyword appearing >3 times):');
  for (const [word, count] of seen) {
    if (count > 3) console.log(word, count);
  }
})();