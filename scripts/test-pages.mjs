import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import http from 'node:http';
import {spawnSync} from 'node:child_process';
import {JSDOM} from 'jsdom';

// Each mount gets a fresh process because React's DOM globals are initialized once.
if (!process.argv[2]) {
  for (const mount of ['/', '/professor-review-renamed-repository/']) {
    const result = spawnSync(process.execPath, [process.argv[1], mount], {stdio: 'inherit'});
    if (result.status !== 0) process.exit(result.status || 1);
  }
  console.log('PASS GitHub Pages root and arbitrary repository-name deployments');
  process.exit(0);
}
const mount = process.argv[2];
const dist = path.resolve('dist');
const types = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.webp':'image/webp', '.ttf':'font/ttf', '.pdf':'application/pdf', '.svg':'image/svg+xml', '.png':'image/png', '.zip':'application/zip'};
// This is a short-lived integration-test fixture, not a user preview server.
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (!pathname.startsWith(mount)) {res.writeHead(404).end(); return;}
    const file = path.resolve(dist, pathname.slice(mount.length) || 'index.html');
    if (!file.startsWith(dist + path.sep)) {res.writeHead(403).end(); return;}
    const stat = await fs.stat(file);
    if (!stat.isFile()) {res.writeHead(404).end(); return;}
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream', 'Content-Length':stat.size});
    res.end(req.method === 'HEAD' ? undefined : await fs.readFile(file));
  } catch {res.writeHead(404).end();}
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const pageUrl = origin + mount;
const checked = new Set();
async function check(relative, base = pageUrl) {
  const url = new URL(relative, base);
  if (url.origin !== origin || !['http:', 'https:'].includes(url.protocol)) return;
  url.hash = '';
  assert(url.pathname.startsWith(mount), `Resource escapes project directory: ${url}`);
  if (checked.has(url.href)) return;
  const response = await fetch(url, {method:'HEAD'});
  assert.equal(response.status, 200, `Missing deployed file: ${url}`);
  checked.add(url.href);
}
let dom;
try {
  const response = await fetch(pageUrl);assert.equal(response.status, 200);
  const html = await response.text();dom = new JSDOM(html, {url:pageUrl, pretendToBeVisual:true});
  const scripts = [...dom.window.document.querySelectorAll('script[src]')];
  assert.equal(scripts.length, 1);
  for (const el of dom.window.document.querySelectorAll('[src],link[href]')) {
    await check(el.getAttribute('src') || el.getAttribute('href'));
  }
  for (const css of dom.window.document.querySelectorAll('link[rel=stylesheet]')) {
    const cssUrl = new URL(css.getAttribute('href'), pageUrl);
    const text = await (await fetch(cssUrl)).text();
    for (const [, asset] of text.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) {
      if (!asset.startsWith('data:')) await check(asset, cssUrl);
    }
  }
  Object.assign(globalThis, {window:dom.window,document:dom.window.document,XMLSerializer:dom.window.XMLSerializer,HTMLElement:dom.window.HTMLElement,MutationObserver:dom.window.MutationObserver});
  Object.defineProperty(globalThis, 'navigator', {value:dom.window.navigator,configurable:true});
  dom.window.HTMLElement.prototype.scrollIntoView = () => {};
  const errors = [];const originalError = console.error;
  console.error = (...args) => {errors.push(args.join(' '));originalError(...args);};
  try {
    const entry = new URL(scripts[0].getAttribute('src'), pageUrl);
    await import(pathToFileURL(path.join(dist, entry.pathname.slice(mount.length))).href);
    const pause = () => new Promise(resolve => setTimeout(resolve, 50));await pause();
    const document = dom.window.document;
    const click = el => {assert(el);el.dispatchEvent(new dom.window.MouseEvent('click', {bubbles:true}));};
    const button = title => [...document.querySelectorAll('button')].find(el => el.textContent === title);
    const localLinks = async () => {
      for (const el of document.querySelectorAll('img[src],a[href]')) {
        const href = el.getAttribute('src') || el.getAttribute('href');
        if (!href.startsWith('#')) await check(href);
      }
    };
    assert.equal(document.querySelectorAll('#radial-chart').length, 1);
    assert.equal(document.querySelectorAll('.ratio-point').length, 25);
    assert.equal(document.querySelectorAll('.district-shape').length, 25);
    await localLinks();
    click(document.querySelector('#radial-chart [data-district="11680"]'));await pause();
    assert.equal(document.querySelector('.district-panel h2').textContent, '강남구');await localLinks();
    click(button('지역 비교 ↗'));await pause();assert.equal(document.querySelectorAll('.compare-photo img').length,2);await localLinks();
    click(document.querySelector('.modal-header .close'));await pause();
    click(button('데이터 출처'));await pause();await localLinks();
    click(document.querySelector('.modal-header .close'));await pause();
    click(button('사진 출처'));await pause();assert.equal(document.querySelectorAll('.credit-grid img').length,66);await localLinks();
    const manifest = JSON.parse(await fs.readFile('assets-manifest.json','utf8'));
    for (const asset of manifest.assets) await check('./' + asset.file_name);
    for (const file of ['seoul_pet_care.json','seoul_pet_care.csv','seoul_districts.geojson']) await check('./data/processed/' + file);
    for (const file of ['SEOUL_PET_CARE_CITY_ASSETS.zip','SEOUL-PET-CARE-CITY.svg','SEOUL-PET-CARE-CITY-3600.png']) await check('./downloads/' + file);
    if (mount !== '/') assert.equal((await fetch(origin+'/assets/branding/hero_01.webp',{method:'HEAD'})).status,404);
    assert.equal(errors.length,0,'Built application reported a rendering error');
    console.log(`PASS compiled application at ${mount}: radial/map/photo selection, comparison, 66 images, fonts, source PDF, data and poster/ZIP paths (${checked.size} HTTP resources)`);
  } finally {console.error = originalError;}
} finally {dom?.window.close();await new Promise(resolve => server.close(resolve));}
