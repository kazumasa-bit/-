// 名刺の点検ツール
// 使い方: NODE_PATH=$(npm root -g) node check-card.js <名刺のHTML> [出力フォルダ]
// HTML は 910×550px（1mm=10px）の名刺1面。<x-dc> 形式でも、普通の HTML でもよい。
// 出力: 拡大画像 / 実寸に近い画像（名刺入れから出したときの見え方）/ 白黒画像 / 点検結果
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const MIN_PX = 21;      // 6pt。これより小さい文字は読めない
const SAFE_PX = 50;     // 断裁線から5mm。文字はこの内側に置く
const MAX_SIZES = 3;    // 文字の大きさは3種類まで

(async () => {
  const src = path.resolve(process.argv[2]);
  const out = path.resolve(process.argv[3] || path.dirname(src));
  fs.mkdirSync(out, { recursive: true });
  const base = path.basename(src).replace(/\.(dc\.)?html$/, '');

  // <x-dc> 形式のときは、テンプレートの中身だけを取り出して普通の HTML にする
  let html = fs.readFileSync(src, 'utf8');
  if (html.includes('<x-dc>')) {
    const head = (html.match(/<helmet>([\s\S]*?)<\/helmet>/) || [])[1] || '';
    const body = html.match(/<x-dc>([\s\S]*?)<\/x-dc>/)[1].replace(/<helmet>[\s\S]*?<\/helmet>/, '');
    const props = JSON.parse(((html.match(/data-props='([^']*)'/) || [])[1] || '{}').replace(/&amp;/g, '&'));
    const fill = s => s.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => (props[k] && props[k].default) ?? '');
    html = `<!doctype html><html><head><meta charset="utf-8">${fill(head)}</head><body style="margin:0">${fill(body)}</body></html>`;
  }
  const tmp = path.join(out, `.${base}.render.html`);
  fs.writeFileSync(tmp, html);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 910, height: 550 }, deviceScaleFactor: 2 });
  await page.goto('file://' + tmp, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // 文字を1つずつ調べる
  const report = await page.evaluate(({ MIN_PX, SAFE_PX }) => {
    const items = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode;
      const t = n.textContent.trim();
      if (!t) continue;
      const el = n.parentElement;
      const cs = getComputedStyle(el);
      const r = document.createRange(); r.selectNodeContents(n);
      const b = r.getBoundingClientRect();
      items.push({ text: t.slice(0, 30), px: parseFloat(cs.fontSize), weight: cs.fontWeight, font: cs.fontFamily.split(',')[0],
        box: [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)] });
    }
    const loaded = [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family))];
    return { items, loaded };
  }, { MIN_PX, SAFE_PX });

  const problems = [];
  const sizes = [...new Set(report.items.map(i => i.px))].sort((a, b) => a - b);
  for (const i of report.items) {
    if (i.px < MIN_PX) problems.push(`文字が小さすぎる（${(i.px / 3.53).toFixed(1)}pt）: 「${i.text}」`);
    const [l, t, r, b] = i.box;
    if (l < SAFE_PX || t < SAFE_PX || r > 910 - SAFE_PX || b > 550 - SAFE_PX) problems.push(`安全域（端から5mm）の外にある: 「${i.text}」`);
  }
  if (sizes.length > MAX_SIZES) problems.push(`文字の大きさが${sizes.length}種類ある（3種類まで）: ${sizes.map(s => (s / 3.53).toFixed(1) + 'pt').join(' / ')}`);
  const fonts = [...new Set(report.items.map(i => i.font.replace(/["']/g, '')))];
  if (fonts.length > 2) problems.push(`書体が${fonts.length}つある（2つまで）: ${fonts.join(' / ')}`);
  const missing = fonts.filter(f => !report.loaded.includes(f) && !/sans-serif|serif|system-ui/.test(f));
  if (missing.length) problems.push(`読み込めていない書体: ${missing.join(' / ')}`);

  // 画像を3種類書き出す
  const big = path.join(out, `${base}.png`);
  await page.screenshot({ path: big });
  // 実寸に近い見え方：91mm を 96dpi で表示すると約 344px
  const small = await browser.newPage({ viewport: { width: 344, height: 208 }, deviceScaleFactor: 2 });
  await small.setContent(`<body style="margin:0"><img src="data:image/png;base64,${fs.readFileSync(big).toString('base64')}" style="width:344px;height:208px"></body>`);
  await small.screenshot({ path: path.join(out, `${base}.actual-size.png`) });
  await page.addStyleTag({ content: 'html{filter:grayscale(1)}' });
  await page.screenshot({ path: path.join(out, `${base}.grayscale.png`) });
  await browser.close();
  fs.unlinkSync(tmp);

  const lines = [
    `# 点検結果: ${base}`,
    `文字の大きさ: ${sizes.map(s => `${s}px（${(s / 3.53).toFixed(1)}pt）`).join(' / ')}`,
    `書体: ${fonts.join(' / ')}`,
    problems.length ? `\n## 直すこと（${problems.length}件）\n` + problems.map(p => '- ' + p).join('\n') : '\n## 機械的な点検はすべて通過（見た目の判断は画像で行う）',
  ];
  fs.writeFileSync(path.join(out, `${base}.check.md`), lines.join('\n') + '\n');
  console.log(lines.join('\n'));
  process.exitCode = problems.length ? 1 : 0;
})();
