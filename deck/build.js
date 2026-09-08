/* =========================================================
   RAPORT METHOD — 達成の6原則 (60分プレゼン)
   pptxgenjs generator
   ========================================================= */
const pptxgen = require('pptxgenjs');
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';               // 13.333 x 7.5
pres.title = '最短で、目標に到達する。— RAPORT METHOD';
pres.subject = '達成に再現性をつくる6原則';

/* ---------- palette ---------- */
const INK   = '10243E';   // deep navy  (dominant)
const INK2  = '1D3A5F';   // navy light
const INK3  = '2C5583';
const GOLD  = 'D4A24C';   // accent
const GOLDL = 'F4E7CD';
const RED   = 'B94A3F';
const TEAL  = '1F7A8C';
const GREEN = '3E7C5A';
const WHITE = 'FFFFFF';
const SOFT  = 'F1F4F7';
const SOFT2 = 'E7EDF3';
const LINE  = 'D5DEE7';
const TXT   = '16222F';
const MUTED = '64748B';
const F     = 'Yu Gothic';

let PAGE = 0;
const ALL = [];   // [slide, isDark] — footers are stamped at the end

/* ---------- primitives ---------- */
function shadow() { return { type: 'outer', angle: 90, blur: 8, offset: 1, color: '9AA9B8', opacity: 0.28 }; }

function slideLight() {
  const s = pres.addSlide();
  s.background = { color: WHITE };
  ALL.push([s, false]);
  return s;
}
function slideDark() {
  const s = pres.addSlide();
  s.background = { color: INK };
  ALL.push([s, true]);
  return s;
}
function foot(s, dark) {
  PAGE += 1;
  s.addText('RAPORT METHOD', {
    x: 0.62, y: 6.94, w: 3.5, h: 0.3, fontSize: 9, color: dark ? INK3 : 'AAB6C2',
    fontFace: F, charSpacing: 1.5, isTextBox: true, margin: 0
  });
  s.addText(String(PAGE), {
    x: 11.9, y: 6.94, w: 0.82, h: 0.3, fontSize: 9, color: dark ? INK3 : 'AAB6C2',
    fontFace: F, align: 'right', isTextBox: true, margin: 0
  });
}
function head(s, kicker, title, sub) {
  if (kicker) s.addText(kicker, {
    x: 0.62, y: 0.42, w: 11.9, h: 0.28, fontSize: 11.5, bold: true, color: GOLD,
    fontFace: F, charSpacing: 2, isTextBox: true, margin: 0
  });
  s.addText(title, {
    x: 0.62, y: 0.72, w: 11.9, h: 0.62, fontSize: 29, bold: true, color: INK,
    fontFace: F, isTextBox: true, margin: 0
  });
  if (sub) s.addText(sub, {
    x: 0.62, y: 1.38, w: 11.9, h: 0.34, fontSize: 14, color: MUTED,
    fontFace: F, isTextBox: true, margin: 0
  });
}
function card(s, x, y, w, h, fill, border) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.07,
    fill: { color: fill || SOFT },
    line: { color: border || LINE, width: 0.75 },
    shadow: shadow()
  });
}
function numDot(s, x, y, d, label, bg, fg) {
  s.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: bg || GOLD }, line: { width: 0 } });
  s.addText(String(label), {
    x, y, w: d, h: d, fontSize: d > 0.5 ? 15 : 12, bold: true, color: fg || WHITE,
    fontFace: F, align: 'center', valign: 'middle', isTextBox: true, margin: 0
  });
}
function bullseye(s, cx, cy, r, ring) {
  [1, 0.66, 0.34].forEach(k => {
    s.addShape(pres.ShapeType.ellipse, {
      x: cx - r * k, y: cy - r * k, w: 2 * r * k, h: 2 * r * k,
      fill: { color: WHITE, transparency: 100 }, line: { color: ring, width: 1.5 }
    });
  });
  s.addShape(pres.ShapeType.ellipse, {
    x: cx - r * 0.08, y: cy - r * 0.08, w: r * 0.16, h: r * 0.16,
    fill: { color: ring }, line: { width: 0 }
  });
}
function ghostLetter(s, ch) {
  s.addText(ch, {
    x: 8.6, y: 0.9, w: 4.2, h: 5.6, fontSize: 300, bold: true, color: INK2,
    fontFace: 'Arial', align: 'center', valign: 'middle', isTextBox: true, margin: 0
  });
}
/* text helpers */
function tx(s, t, o) { s.addText(t, Object.assign({ fontFace: F, isTextBox: true, margin: 0 }, o)); }
function li(items) {
  return items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i !== items.length - 1 } }));
}

/* section divider */
function section(letter, no, jp, en, sub) {
  const s = slideDark();
  ghostLetter(s, letter);
  bullseye(s, 11.3, 5.9, 1.15, INK2);
  tx(s, `PRINCIPLE ${no}`, { x: 0.85, y: 2.05, w: 7.6, h: 0.32, fontSize: 13, bold: true, color: GOLD, charSpacing: 2.5 });
  tx(s, jp, { x: 0.85, y: 2.45, w: 7.6, h: 0.95, fontSize: 42, bold: true, color: WHITE });
  tx(s, en, { x: 0.85, y: 3.45, w: 7.6, h: 0.4, fontSize: 16, color: GOLDL, charSpacing: 1.5 });
  s.addShape(pres.ShapeType.rect, { x: 0.85, y: 4.05, w: 1.5, h: 0.03, fill: { color: GOLD }, line: { width: 0 } });
  tx(s, sub, { x: 0.85, y: 4.35, w: 7.4, h: 1.2, fontSize: 15, color: 'C3D0DE', lineSpacing: 26 });
  return s;
}

/* =========================================================
   01  TITLE
   ========================================================= */
{
  const s = slideDark();
  bullseye(s, 10.55, 3.75, 2.35, INK2);
  s.addShape(pres.ShapeType.line, {
    x: 6.9, y: 3.8, w: 3.6, h: 2.25, flipV: true,
    line: { color: GOLD, width: 2.25, endArrowType: 'triangle' }
  });
  tx(s, 'ACHIEVEMENT THEORY', { x: 0.85, y: 1.55, w: 7.5, h: 0.32, fontSize: 12.5, bold: true, color: GOLD, charSpacing: 3 });
  tx(s, '最短で、目標に到達する。', { x: 0.85, y: 2.0, w: 7.9, h: 1.9, fontSize: 44, bold: true, color: WHITE, lineSpacing: 58 });
  tx(s, '達成に「再現性」をつくる 6つの原則', { x: 0.85, y: 3.95, w: 7.9, h: 0.45, fontSize: 19, color: GOLDL });
  s.addShape(pres.ShapeType.rect, { x: 0.85, y: 4.62, w: 1.5, h: 0.03, fill: { color: GOLD }, line: { width: 0 } });
  tx(s, '人生は、寄り道をしていられるほど長くない。', { x: 0.85, y: 4.92, w: 7.9, h: 0.4, fontSize: 14, color: '9FB2C6', italic: true });
  tx(s, '【講師名を記入】 ／ 【肩書・所属を記入】', { x: 0.85, y: 5.85, w: 7.9, h: 0.34, fontSize: 13, color: 'C3D0DE' });
  tx(s, '所要 約60分（講義 50分＋演習 10分）／ Q&A 別途 8分', { x: 0.85, y: 6.25, w: 7.9, h: 0.3, fontSize: 11, color: INK3 });
  s.addNotes('【0:00–0:30】\n挨拶は短く。名乗ったらすぐ次のスライドの「問い」に入る。\n「今日は精神論を一切話しません。構造の話だけをします」と宣言して始める。');
}

/* =========================================================
   02  冒頭の問い
   ========================================================= */
{
  const s = slideDark();
  bullseye(s, 11.35, 5.75, 1.3, INK2);
  tx(s, 'OPENING QUESTION', { x: 0.85, y: 1.75, w: 10, h: 0.3, fontSize: 12, bold: true, color: GOLD, charSpacing: 2.5 });
  tx(s, 'その「いつかやりたい」は、\n何年前から言っていますか？', {
    x: 0.85, y: 2.2, w: 11.4, h: 2.0, fontSize: 38, bold: true, color: WHITE, lineSpacing: 62
  });
  s.addShape(pres.ShapeType.rect, { x: 0.85, y: 4.5, w: 1.5, h: 0.03, fill: { color: GOLD }, line: { width: 0 } });
  tx(s, '能力の問題ではありません。設計の問題です。', { x: 0.85, y: 4.85, w: 10.5, h: 0.45, fontSize: 20, color: GOLDL });
  tx(s, '同じ1年でも、到達点が10倍変わる。その差は「才能」ではなく「達成の型を持っているか」で決まります。', {
    x: 0.85, y: 5.45, w: 10.2, h: 0.7, fontSize: 13.5, color: '9FB2C6', lineSpacing: 22
  });
  s.addNotes('【0:30–2:00】\n参加者に実際に手を挙げてもらう、または隣と一言交換させる。\n「3年以上言っている人？」で笑いが起きたら掴めている。\nここで「あなたが悪いのではない」と一度受け止めてから、構造の話に入る。');
}

/* =========================================================
   03  能力 × 構造
   ========================================================= */
{
  const s = slideLight();
  head(s, 'WHY YOU ARE STUCK', '差がつくのは「能力」ではなく「構造」', '同じ能力でも、構造の有無で到達点はここまで変わる');
  const bx = 1.5, by = 2.15, bw = 4.15, bh = 1.9, g = 0.28;
  const q = [
    { x: bx, y: by, t: '頑張っているのに進まない人', d: '努力量は十分。ただし方向が定まらず、成果が積み上がらない。', c: RED, tag: '構造なし × 能力高' },
    { x: bx + bw + g, y: by, t: '圧倒的に伸びる人', d: '正しい方向に、正しい量。成果が複利で積み上がる。', c: GREEN, tag: '構造あり × 能力高' },
    { x: bx, y: by + bh + g, t: '迷子になる人', d: '何から手をつけるか分からず、情報収集で時間が終わる。', c: MUTED, tag: '構造なし × 能力中' },
    { x: bx + bw + g, y: by + bh + g, t: '着実に伸びる人', d: '能力が平均でも、型があるので毎月前に進む。', c: TEAL, tag: '構造あり × 能力中' }
  ];
  q.forEach(o => {
    card(s, o.x, o.y, bw, bh, o.c === GREEN ? 'EAF2ED' : SOFT, o.c === GREEN ? GREEN : LINE);
    tx(s, o.tag, { x: o.x + 0.28, y: o.y + 0.22, w: bw - 0.56, h: 0.26, fontSize: 10.5, bold: true, color: o.c, charSpacing: 1 });
    tx(s, o.t, { x: o.x + 0.28, y: o.y + 0.55, w: bw - 0.56, h: 0.4, fontSize: 18, bold: true, color: INK });
    tx(s, o.d, { x: o.x + 0.28, y: o.y + 1.02, w: bw - 0.56, h: 0.7, fontSize: 12.5, color: MUTED, lineSpacing: 19 });
  });
  tx(s, '能力は生まれつき。構造は、今日から手に入る。', {
    x: 1.5, y: 6.25, w: 8.9, h: 0.45, fontSize: 17, bold: true, color: INK
  });
  s.addNotes('【2:00–3:00】\n右下（着実に伸びる人）を指して「今日ここに全員を移動させます」と言う。\n左上（頑張っているのに進まない）に自分もいたと自己開示すると刺さる。');
}

/* =========================================================
   04  今日のゴール
   ========================================================= */
{
  const s = slideLight();
  head(s, "TODAY'S GOAL", '今日、持ち帰っていただくもの', '「良い話を聞いた」で終わらせません。成果物を3つ持って帰ります。');
  const items = [
    { n: '01', t: '自分が達成できない理由を、構造で説明できる', d: '根性や才能のせいにするのをやめて、どこが詰まっているかを言葉にできる状態になります。' },
    { n: '02', t: '目標から逆算した90日プランを、この場でつくる', d: '「今日やること」まで落ちた1枚。持ち帰ってすぐ動けます。' },
    { n: '03', t: '毎週まわす検証サイクルを手に入れる', d: '意志の力に頼らず、前に進み続ける仕組みを渡します。' }
  ];
  items.forEach((o, i) => {
    const y = 2.2 + i * 1.45;
    card(s, 1.1, y, 11.1, 1.2, SOFT);
    numDot(s, 1.42, y + 0.32, 0.56, o.n, GOLD, WHITE);
    tx(s, o.t, { x: 2.2, y: y + 0.2, w: 9.6, h: 0.4, fontSize: 18, bold: true, color: INK });
    tx(s, o.d, { x: 2.2, y: y + 0.66, w: 9.6, h: 0.42, fontSize: 12.5, color: MUTED });
  });
  s.addNotes('【3:00–4:00】\n3つを読み上げる。特に②は「今日つくって帰ってもらいます」と強調し、演習への予告にする。');
}

/* =========================================================
   05  自己紹介 (プレースホルダ)
   ========================================================= */
{
  const s = slideLight();
  head(s, 'WHO IS SPEAKING', 'なぜ、私がこれを話すのか', '理論の前に、それを実際に使って何が起きたかをお話しします。');
  card(s, 0.9, 2.05, 5.4, 4.35, SOFT);
  tx(s, 'プロフィール', { x: 1.25, y: 2.3, w: 4.7, h: 0.35, fontSize: 13, bold: true, color: GOLD, charSpacing: 1.5 });
  tx(s, [
    { text: '【氏名／年齢／出身を記入】', options: { bullet: true, breakLine: true } },
    { text: '【現在の事業・役職を記入】', options: { bullet: true, breakLine: true } },
    { text: '【何年、何を積み上げてきたかを記入】', options: { bullet: true, breakLine: true } },
    { text: '【最も苦しかった時期のエピソードを記入】', options: { bullet: true, breakLine: false } }
  ], { x: 1.25, y: 2.75, w: 4.75, h: 3.4, fontSize: 13.5, color: TXT, fontFace: F, isTextBox: true, margin: 0, paraSpaceAfter: 14, lineSpacing: 21 });
  card(s, 6.6, 2.05, 5.85, 4.35, INK, INK);
  tx(s, '数字で見る実績', { x: 6.95, y: 2.3, w: 5.2, h: 0.35, fontSize: 13, bold: true, color: GOLD, charSpacing: 1.5 });
  const stats = [
    { v: '【　】社', l: '経営する法人数' },
    { v: '【　】名', l: '組織の人数' },
    { v: '【　】年', l: 'この型を運用してきた年数' },
    { v: '【　】%', l: '導入後に改善した指標' }
  ];
  stats.forEach((o, i) => {
    const x = 6.95 + (i % 2) * 2.72, y = 2.85 + Math.floor(i / 2) * 1.62;
    tx(s, o.v, { x, y, w: 2.6, h: 0.62, fontSize: 30, bold: true, color: WHITE });
    tx(s, o.l, { x, y: y + 0.66, w: 2.6, h: 0.6, fontSize: 11.5, color: '9FB2C6', lineSpacing: 17 });
  });
  tx(s, '※ このページは必ずご自身の実数に置き換えてください。数字のない自己紹介は説得力を失います。', {
    x: 0.9, y: 6.52, w: 11.5, h: 0.3, fontSize: 10.5, color: RED
  });
  s.addNotes('【4:00–5:30】\n実績は「盛らない」。等身大の数字のほうが信頼される。\n必ず「うまくいかなかった時期」を先に話し、そこからどう変わったかの順で語る。失敗談→転機→現在。');
}

/* =========================================================
   06  なぜ信じてよいのか
   ========================================================= */
{
  const s = slideLight();
  head(s, 'CREDIBILITY', 'この理論を、信じてよい3つの理由', '「信じてください」とは言いません。「試してください」と言います。');
  const items = [
    { n: '01', t: '借り物ではない', d: '本や資格で覚えた知識ではなく、自分の会社・自分の組織で毎日検証し、うまくいかなかったものを削り続けて残った型です。', c: GOLD },
    { n: '02', t: '原理が単純', d: '覚えるのは6つだけ。複雑な理論は、忙しい現場では絶対に使われません。使われない理論に価値はありません。', c: TEAL },
    { n: '03', t: '検証できる', d: '30日あれば、効果があるかどうか自分で判定できます。効かなければ捨ててください。それが誠実な理論の条件です。', c: GREEN }
  ];
  items.forEach((o, i) => {
    const x = 0.9 + i * 3.92;
    card(s, x, 2.15, 3.6, 3.45, SOFT);
    numDot(s, x + 0.32, 2.48, 0.6, o.n, o.c, WHITE);
    tx(s, o.t, { x: x + 0.32, y: 3.25, w: 2.95, h: 0.45, fontSize: 20, bold: true, color: INK });
    tx(s, o.d, { x: x + 0.32, y: 3.82, w: 2.98, h: 1.6, fontSize: 12.5, color: MUTED, lineSpacing: 20 });
  });
  card(s, 0.9, 5.85, 11.55, 0.85, INK, INK);
  tx(s, '理論の価値は「正しそうに聞こえるか」ではなく「試して結果が変わるか」で決まります。', {
    x: 1.25, y: 5.85, w: 10.9, h: 0.85, fontSize: 16, bold: true, color: WHITE, valign: 'middle'
  });
  s.addNotes('【5:30–7:00】\nここが本日いちばん大事な導入。相手の警戒心を解くパート。\n「怪しい自己啓発ではない」と明言する。③の「効かなければ捨てて」は必ず言う。');
}

/* =========================================================
   07  達成の方程式
   ========================================================= */
{
  const s = slideLight();
  head(s, 'THE EQUATION', '達成の方程式', '足し算ではなく、掛け算。ひとつでもゼロなら、答えはゼロになります。');
  const terms = [
    { t: '目的の\n明確さ', c: GOLD }, { t: '逆算\n設計', c: TEAL }, { t: '回転数', c: INK3 }, { t: '継続', c: GREEN }
  ];
  tx(s, '達成', { x: 0.85, y: 2.55, w: 1.35, h: 1.0, fontSize: 30, bold: true, color: INK, align: 'center', valign: 'middle' });
  tx(s, '=', { x: 2.2, y: 2.55, w: 0.55, h: 1.0, fontSize: 28, bold: true, color: MUTED, align: 'center', valign: 'middle' });
  terms.forEach((o, i) => {
    const x = 2.85 + i * 2.5;
    s.addShape(pres.ShapeType.roundRect, { x, y: 2.55, w: 1.95, h: 1.0, rectRadius: 0.07, fill: { color: o.c }, line: { width: 0 }, shadow: shadow() });
    tx(s, o.t, { x, y: 2.55, w: 1.95, h: 1.0, fontSize: 17, bold: true, color: WHITE, align: 'center', valign: 'middle', lineSpacing: 24 });
    if (i < 3) tx(s, '×', { x: x + 1.95, y: 2.55, w: 0.55, h: 1.0, fontSize: 24, bold: true, color: MUTED, align: 'center', valign: 'middle' });
  });
  card(s, 0.85, 4.0, 11.6, 2.35, SOFT);
  tx(s, 'よくある失敗パターン', { x: 1.2, y: 4.2, w: 5, h: 0.32, fontSize: 13, bold: true, color: GOLD, charSpacing: 1.5 });
  const ex = [
    { l: 'やる気はあるが目標が曖昧', f: '目的 0 × 逆算 8 × 回転 9 × 継続 9', r: '= 0' },
    { l: '計画は立派だが動かない', f: '目的 9 × 逆算 9 × 回転 0 × 継続 9', r: '= 0' },
    { l: '始めるが3週間で消える', f: '目的 8 × 逆算 7 × 回転 8 × 継続 0', r: '= 0' }
  ];
  ex.forEach((o, i) => {
    const y = 4.62 + i * 0.56;
    tx(s, o.l, { x: 1.2, y, w: 4.1, h: 0.4, fontSize: 13.5, color: TXT, valign: 'middle' });
    tx(s, o.f, { x: 5.35, y, w: 5.0, h: 0.4, fontSize: 13.5, color: MUTED, valign: 'middle' });
    tx(s, o.r, { x: 10.5, y, w: 1.6, h: 0.4, fontSize: 16, bold: true, color: RED, valign: 'middle' });
  });
  s.addNotes('【7:00–8:30】\n「あなたはどこがゼロですか？」と問いかける。\nほとんどの人は「回転数」か「継続」がゼロ。だが実は原因は上流の「目的の明確さ」にあると予告する。');
}

/* =========================================================
   08  RAPORT マップ
   ========================================================= */
{
  const s = slideLight();
  head(s, 'THE FRAMEWORK', '達成の6原則 — RAPORT メソッド', '覚えるのは6文字だけ。この順番に意味があります。');
  const items = [
    { L: 'R', t: 'Reverse', jp: '逆算する', d: 'ゴールから今日を決める', c: GOLD },
    { L: 'A', t: 'Analyze', jp: '現在地を知る', d: 'マーケティング思考で自分を分析', c: TEAL },
    { L: 'P', t: 'PDCA', jp: '回す', d: '仮説検証の回転数を上げる', c: INK3 },
    { L: 'O', t: 'Overcome', jp: '失敗を越える', d: '失敗をデータに変えて続ける', c: RED },
    { L: 'R', t: 'Reframe', jp: '解釈を変える', d: '起きたことを課題として受け取る', c: GREEN },
    { L: 'T', t: 'Trust', jp: '信頼を積む', d: '有益性のバランスで関係を伸ばす', c: '7A5AA8' }
  ];
  items.forEach((o, i) => {
    const x = 0.9 + (i % 3) * 3.92, y = 2.15 + Math.floor(i / 3) * 2.28;
    card(s, x, y, 3.6, 1.95, SOFT);
    s.addShape(pres.ShapeType.roundRect, { x: x + 0.3, y: y + 0.3, w: 0.68, h: 0.68, rectRadius: 0.06, fill: { color: o.c }, line: { width: 0 } });
    tx(s, o.L, { x: x + 0.3, y: y + 0.3, w: 0.68, h: 0.68, fontSize: 26, bold: true, color: WHITE, align: 'center', valign: 'middle', fontFace: 'Arial' });
    tx(s, o.jp, { x: x + 1.12, y: y + 0.32, w: 2.3, h: 0.36, fontSize: 18, bold: true, color: INK });
    tx(s, o.t.toUpperCase(), { x: x + 1.12, y: y + 0.7, w: 2.3, h: 0.3, fontSize: 10.5, color: o.c, bold: true, charSpacing: 1.5 });
    tx(s, o.d, { x: x + 0.3, y: y + 1.18, w: 3.05, h: 0.6, fontSize: 12.5, color: MUTED, lineSpacing: 18 });
  });
  s.addNotes('【8:30–9:30】\n6つを一気に読み上げる。ここでは覚えさせない。「今から1つずつやります」と宣言するだけ。\nRAPORT＝ラポール（信頼関係）と同じ綴り、と補足すると記憶に残る。');
}

/* =========================================================
   SECTION R — Reverse
   ========================================================= */
section('R', '01', '目標から逆算する', 'REVERSE  ENGINEERING', '「今できること」から始めない。\nゴールを決めて、そこから今日を逆算する。\n順番を変えるだけで、到達までの距離が変わります。');

{
  const s = slideLight();
  head(s, 'R｜REVERSE', '積み上げ思考 vs 逆算思考', '同じ努力量でも、出発点の取り方で結果はここまで変わる');
  /* left: 積み上げ */
  card(s, 0.9, 2.1, 5.5, 4.3, SOFT);
  tx(s, '積み上げ思考', { x: 1.25, y: 2.35, w: 4.8, h: 0.45, fontSize: 22, bold: true, color: RED });
  tx(s, '今できることから始める', { x: 1.25, y: 2.82, w: 4.8, h: 0.32, fontSize: 12.5, color: MUTED });
  s.addShape(pres.ShapeType.line, { x: 1.3, y: 4.7, w: 1.3, h: 0.6, line: { color: RED, width: 2.5 } });
  s.addShape(pres.ShapeType.line, { x: 2.6, y: 3.9, w: 1.0, h: 0.8, flipV: true, line: { color: RED, width: 2.5 } });
  s.addShape(pres.ShapeType.line, { x: 3.6, y: 3.9, w: 1.1, h: 0.75, line: { color: RED, width: 2.5 } });
  s.addShape(pres.ShapeType.line, { x: 4.7, y: 3.55, w: 1.15, h: 1.1, flipV: true, line: { color: RED, width: 2.5, endArrowType: 'triangle' } });
  tx(s, [
    { text: '進んでいる「感じ」はする', options: { bullet: true, breakLine: true } },
    { text: 'ゴールとズレても気づけない', options: { bullet: true, breakLine: true } },
    { text: '寄り道の分だけ時間を失う', options: { bullet: true, breakLine: true } },
    { text: '到達できるかどうかは運任せ', options: { bullet: true, breakLine: false } }
  ], { x: 1.25, y: 5.15, w: 4.85, h: 1.15, fontSize: 12.5, color: TXT, fontFace: F, isTextBox: true, margin: 0, paraSpaceAfter: 5 });
  /* right: 逆算 */
  card(s, 6.95, 2.1, 5.5, 4.3, 'EAF2ED', GREEN);
  tx(s, '逆算思考', { x: 7.3, y: 2.35, w: 4.8, h: 0.45, fontSize: 22, bold: true, color: GREEN });
  tx(s, 'ゴールを決めてから今日を決める', { x: 7.3, y: 2.82, w: 4.8, h: 0.32, fontSize: 12.5, color: MUTED });
  s.addShape(pres.ShapeType.line, { x: 7.35, y: 4.65, w: 4.5, h: 1.05, flipV: true, line: { color: GREEN, width: 3, endArrowType: 'triangle' } });
  bullseye(s, 11.95, 3.6, 0.32, GREEN);
  tx(s, [
    { text: 'ゴールとの距離が常に見える', options: { bullet: true, breakLine: true } },
    { text: 'ズレたその週に修正できる', options: { bullet: true, breakLine: true } },
    { text: 'やらないことが決まる', options: { bullet: true, breakLine: true } },
    { text: '最短距離で到達できる', options: { bullet: true, breakLine: false } }
  ], { x: 7.3, y: 5.15, w: 4.85, h: 1.15, fontSize: 12.5, color: TXT, fontFace: F, isTextBox: true, margin: 0, paraSpaceAfter: 5 });
  s.addNotes('【9:30–11:15】\n左右の矢印を指しながら話す。「どちらも同じ距離を歩いています。違うのは到達点だけ」。\n積み上げ思考を否定しないこと。「悪いのではなく、遅い」と言う。');
}

{
  const s = slideLight();
  head(s, 'R｜REVERSE', '寄り道のコストを、数字で見る', '人生は、寄り道をしていられるほど長くない');
  card(s, 0.9, 2.1, 5.5, 4.3, INK, INK);
  tx(s, 'あなたが自由に使える時間', { x: 1.25, y: 2.35, w: 4.8, h: 0.35, fontSize: 13, bold: true, color: GOLD, charSpacing: 1.5 });
  const rows = [
    ['1週間', '168 時間'],
    ['− 睡眠', '−56 時間'],
    ['− 仕事', '−50 時間'],
    ['− 生活・移動・家族', '−30 時間']
  ];
  rows.forEach((r, i) => {
    const y = 2.85 + i * 0.5;
    tx(s, r[0], { x: 1.25, y, w: 3.0, h: 0.38, fontSize: 13.5, color: 'C3D0DE', valign: 'middle' });
    tx(s, r[1], { x: 4.25, y, w: 1.85, h: 0.38, fontSize: 13.5, color: WHITE, align: 'right', valign: 'middle' });
  });
  s.addShape(pres.ShapeType.rect, { x: 1.25, y: 4.92, w: 4.85, h: 0.02, fill: { color: INK3 }, line: { width: 0 } });
  tx(s, '勝負できる時間', { x: 1.25, y: 5.1, w: 2.3, h: 0.5, fontSize: 14, bold: true, color: GOLDL, valign: 'middle' });
  tx(s, '32 時間 / 週', { x: 3.7, y: 5.05, w: 2.4, h: 0.6, fontSize: 26, bold: true, color: GOLD, align: 'right', valign: 'middle' });
  tx(s, '年間にすると約 1,664 時間。ここをどう使うかで、5年後が決まります。', {
    x: 1.25, y: 5.75, w: 4.85, h: 0.55, fontSize: 12, color: '9FB2C6', lineSpacing: 18
  });
  card(s, 6.95, 2.1, 5.5, 4.3, SOFT);
  tx(s, '寄り道が生むロス', { x: 7.3, y: 2.35, w: 4.8, h: 0.35, fontSize: 13, bold: true, color: GOLD, charSpacing: 1.5 });
  tx(s, '本来3年で届く目標があるとします。\nそのうち40%の時間を「ゴールに直結しないこと」に使うと——', {
    x: 7.3, y: 2.75, w: 4.85, h: 0.92, fontSize: 13, color: TXT, lineSpacing: 21
  });
  tx(s, '5年', { x: 7.3, y: 3.7, w: 2.2, h: 0.95, fontSize: 52, bold: true, color: RED, valign: 'middle' });
  tx(s, 'かかる', { x: 9.4, y: 3.7, w: 1.4, h: 0.95, fontSize: 16, color: MUTED, valign: 'middle' });
  card(s, 7.3, 4.85, 4.8, 0.85, WHITE, RED);
  tx(s, '失うのは「2年」ではなく、\n2年分の複利で伸びたはずの自分です。', {
    x: 7.5, y: 4.85, w: 4.5, h: 0.85, fontSize: 13, bold: true, color: INK, valign: 'middle', lineSpacing: 19
  });
  tx(s, '最短ルートで駆け抜ける。それが逆算する唯一の理由です。', {
    x: 7.3, y: 5.85, w: 4.9, h: 0.45, fontSize: 12.5, color: MUTED
  });
  s.addNotes('【11:15–12:45】\n数字は参加者の生活に合わせて調整可。会社員向けなら仕事50時間、経営者向けなら70時間など。\n「2年分の複利」は次のO章・T章の複利グラフへの伏線。');
}

{
  const s = slideLight();
  head(s, 'R｜REVERSE', '逆算の5ステップ', '未来から現在へ、条件を一段ずつ降ろしていく作業です');
  const st = [
    { n: '1', t: 'ゴールを定義する', d: '数値・期限・状態の3点セットで書く。「痩せたい」ではなく「12月31日に体重62kg」。' },
    { n: '2', t: '達成した日の1日を描く', d: '朝起きて何をして、誰と会い、何を見ているか。情景が描けないゴールには到達できません。' },
    { n: '3', t: '「その直前」を書き出す', d: '達成の1つ手前で、何が起きているか。この問いを繰り返すのが逆算の本体です。' },
    { n: '4', t: '現在地まで降ろす', d: '3年 → 1年 → 四半期 → 今月 → 今週。段が細かいほど、迷いが消えます。' },
    { n: '5', t: '最初の1歩を今週に置く', d: '今週やる1つが決まるまで、逆算は終わっていません。' }
  ];
  st.forEach((o, i) => {
    const y = 2.1 + i * 0.94;
    card(s, 0.9, y, 11.55, 0.8, i === 4 ? 'EAF2ED' : SOFT, i === 4 ? GREEN : LINE);
    numDot(s, 1.2, y + 0.14, 0.52, o.n, i === 4 ? GREEN : GOLD, WHITE);
    tx(s, o.t, { x: 1.95, y, w: 3.0, h: 0.8, fontSize: 16, bold: true, color: INK, valign: 'middle' });
    tx(s, o.d, { x: 5.05, y, w: 7.2, h: 0.8, fontSize: 12.5, color: MUTED, valign: 'middle' });
  });
  s.addNotes('【12:45–14:15】\nステップ3が肝。「達成の直前に何が起きているか」を2〜3回繰り返し実演すると理解が早い。\n例：年商1億の直前 → 月800万の受注 → 商談60件 → リスト300件。');
}

{
  const s = slideLight();
  head(s, 'R｜REVERSE', 'ゴールの解像度チェック 7項目', '7つ埋まらないうちは、それはまだ「願望」です');
  const q = [
    '数字で言えるか',
    '期限が入っているか',
    '第三者が達成を判定できるか',
    '達成した日の情景を描写できるか',
    'なぜそれが欲しいか、3回掘り下げて説明できるか',
    '達成して得るもの／失うものを言えるか',
    '今日やることが1つ決まるか'
  ];
  q.forEach((t, i) => {
    const y = 2.1 + i * 0.63;
    s.addShape(pres.ShapeType.roundRect, { x: 0.9, y, w: 0.38, h: 0.38, rectRadius: 0.05, fill: { color: WHITE }, line: { color: GOLD, width: 1.5 } });
    tx(s, t, { x: 1.45, y: y - 0.03, w: 7.4, h: 0.44, fontSize: 15, color: TXT, valign: 'middle' });
  });
  card(s, 9.15, 2.1, 3.3, 4.3, INK, INK);
  tx(s, 'BAD', { x: 9.5, y: 2.35, w: 2.6, h: 0.3, fontSize: 11, bold: true, color: RED, charSpacing: 2 });
  tx(s, '「独立して\n成功したい」', { x: 9.5, y: 2.68, w: 2.65, h: 0.95, fontSize: 17, bold: true, color: '9FB2C6', lineSpacing: 25 });
  s.addShape(pres.ShapeType.rect, { x: 9.5, y: 3.85, w: 2.6, h: 0.02, fill: { color: INK3 }, line: { width: 0 } });
  tx(s, 'GOOD', { x: 9.5, y: 4.05, w: 2.6, h: 0.3, fontSize: 11, bold: true, color: GOLD, charSpacing: 2 });
  tx(s, '「2027年3月末までに\n本業以外で月商80万円、\n粗利50%を6か月連続」', { x: 9.5, y: 4.38, w: 2.65, h: 1.6, fontSize: 15, bold: true, color: WHITE, lineSpacing: 24 });
  s.addNotes('【14:15–15:15】\nチェックボックスを1つずつ読み上げ、参加者に自分のゴールで○×をつけてもらう。\n「7つ全部○の人？」→ ほぼ挙がらない。ここで演習への動機づけが完成する。');
}

{
  const s = slideLight();
  head(s, 'R｜REVERSE', '逆算プランの型（記入例）', 'ゴールから今日まで、1本の線でつながっているか');
  const hdr = ['', '3年後（ゴール）', '1年後', '四半期', '今月', '今週', '今日'];
  const r1 = ['例A｜独立', '月商300万', '月商100万', '月商40万', '新規契約2件', '商談5件', 'リスト20件作成'];
  const r2 = ['例B｜健康', '体脂肪15%', '体重−12kg', '体重−4kg', '体重−1.4kg', '運動4回', '朝30分歩く'];
  const r3 = ['例C｜キャリア', '事業責任者', 'マネージャー', '評価A獲得', '重点KPI達成', '報告2件', '上司と面談設定'];
  s.addTable([
    hdr.map(t => ({ text: t, options: { bold: true, color: WHITE, fill: { color: INK }, fontSize: 12 } })),
    ...[r1, r2, r3].map((r, ri) => r.map((t, ci) => ({
      text: t,
      options: {
        bold: ci === 0 || ci === 1,
        color: ci === 0 ? WHITE : (ci === 6 ? GREEN : TXT),
        fill: { color: ci === 0 ? INK3 : (ri % 2 ? SOFT : WHITE) },
        fontSize: 12
      }
    })))
  ], {
    x: 0.9, y: 2.15, w: 11.55, colW: [1.7, 1.85, 1.6, 1.5, 1.6, 1.5, 1.8],
    rowH: 0.62, border: { pt: 0.75, color: LINE }, fontFace: F, valign: 'middle', align: 'center'
  });
  card(s, 0.9, 5.05, 11.55, 1.3, SOFT);
  tx(s, '見るべきポイント', { x: 1.25, y: 5.22, w: 3, h: 0.3, fontSize: 12.5, bold: true, color: GOLD, charSpacing: 1.5 });
  tx(s, '右端の「今日」が具体的な動作になっているか。ここが抽象的なら、上流のどこかで逆算が切れています。\n逆に「今日」から左に読んで、ゴールまでつながって聞こえるかも必ず確認してください。', {
    x: 1.25, y: 5.55, w: 10.9, h: 0.7, fontSize: 12.5, color: TXT, lineSpacing: 20
  });
  s.addNotes('【60分版では省略／配布資料で補完】\n表を右から左に読み返す「逆読みチェック」を実演する。\n「リスト20件つくると商談5件になる、本当か？」と因果を疑わせるのがコツ。');
}

{
  const s = slideDark();
  bullseye(s, 11.3, 5.8, 1.2, INK2);
  tx(s, 'WORK 01 ／ 4分', { x: 0.85, y: 1.7, w: 8, h: 0.32, fontSize: 12.5, bold: true, color: GOLD, charSpacing: 2.5 });
  tx(s, '演習①：あなたのゴールを1文で書く', { x: 0.85, y: 2.1, w: 11.4, h: 0.75, fontSize: 34, bold: true, color: WHITE });
  const w = [
    '① いちばん実現したいことを1つだけ選ぶ（複数はNG）',
    '② 数値と期限を入れて、1文にする',
    '③ 7項目チェックにかける。埋まらない項目に印をつける',
    '④ 「今日やること」を1つだけ書く'
  ];
  w.forEach((t, i) => {
    const y = 3.2 + i * 0.72;
    numDot(s, 0.85, y, 0.48, i + 1, GOLD, INK);
    tx(s, t.slice(2), { x: 1.55, y: y - 0.05, w: 9.3, h: 0.55, fontSize: 17, color: WHITE, valign: 'middle' });
  });
  tx(s, '書けなくても構いません。「書けなかった」という事実こそが、いま最も価値のある発見です。', {
    x: 0.85, y: 6.2, w: 10.5, h: 0.4, fontSize: 13, color: '9FB2C6', italic: true
  });
  s.addNotes('【15:15–18:15】4分。\nタイマーを見せる。1分経過時点で「まだ数字が入っていない人？」と声をかける。\n終了後、2〜3名に発表してもらい、その場で7項目チェックを当てて添削するとライブ感が出る。');
}

/* =========================================================
   SECTION A — Analyze（マーケティング思考）
   ========================================================= */
section('A', '02', '現在地を知る', 'ANALYZE  YOURSELF', 'ゴールが決まったら、次は現在地。\n自分を「商品」として分析すると、\n何が足りないのかが一瞬で見えます。');

{
  const s = slideLight();
  head(s, 'A｜ANALYZE', 'なぜ「自分」にマーケティングを使うのか', 'マーケティングとは、望む結果が出る仕組みをつくる技術です');
  card(s, 0.9, 2.1, 5.5, 2.0, SOFT);
  tx(s, '一般的な定義', { x: 1.25, y: 2.3, w: 4.8, h: 0.3, fontSize: 12, bold: true, color: MUTED, charSpacing: 1.5 });
  tx(s, '「売れる仕組みをつくる技術」', { x: 1.25, y: 2.68, w: 4.85, h: 0.5, fontSize: 20, bold: true, color: INK });
  tx(s, '商品が、選ばれ続ける状態をつくること。', { x: 1.25, y: 3.3, w: 4.85, h: 0.4, fontSize: 13, color: MUTED });
  card(s, 6.95, 2.1, 5.5, 2.0, INK, INK);
  tx(s, '人生に置き換えると', { x: 7.3, y: 2.3, w: 4.8, h: 0.3, fontSize: 12, bold: true, color: GOLD, charSpacing: 1.5 });
  tx(s, '「望む結果が出る\n仕組みをつくる技術」', { x: 7.3, y: 2.62, w: 4.85, h: 0.9, fontSize: 20, bold: true, color: WHITE, lineSpacing: 27 });
  tx(s, '自分が、選ばれ続ける状態をつくること。', { x: 7.3, y: 3.55, w: 4.85, h: 0.4, fontSize: 13, color: '9FB2C6' });
  const map = [
    { a: '商品', b: 'あなた自身（スキル・実績・人柄）', c: GOLD },
    { a: '市場', b: 'あなたが選ばれたい場所・業界・領域', c: TEAL },
    { a: '顧客', b: 'あなたを選ぶ人（会社・上司・お客様）', c: INK3 },
    { a: '価格', b: 'あなたが受け取る報酬・評価', c: GREEN }
  ];
  map.forEach((o, i) => {
    const x = 0.9 + i * 2.92;
    card(s, x, 4.35, 2.65, 1.55, SOFT);
    s.addShape(pres.ShapeType.roundRect, { x: x + 0.25, y: 4.58, w: 0.85, h: 0.36, rectRadius: 0.05, fill: { color: o.c }, line: { width: 0 } });
    tx(s, o.a, { x: x + 0.25, y: 4.58, w: 0.85, h: 0.36, fontSize: 12, bold: true, color: WHITE, align: 'center', valign: 'middle' });
    tx(s, o.b, { x: x + 0.25, y: 5.05, w: 2.2, h: 0.75, fontSize: 12, color: TXT, lineSpacing: 18 });
  });
  tx(s, '売れない商品には、必ず理由があります。人も、まったく同じです。', {
    x: 0.9, y: 6.15, w: 11.5, h: 0.4, fontSize: 16, bold: true, color: INK
  });
  s.addNotes('【18:15–20:00】\n「自分を商品扱いするのは冷たい」と感じる人がいる。「自分を大事にするからこそ、正しく売り方を設計する」と補足する。');
}

{
  const s = slideLight();
  head(s, 'A｜ANALYZE', '自己分析の12ステップ（完全版）', '前半6つは土台。後半6つがないと、分析は成果に変わりません。');
  const steps = [
    { n: '1', t: '目的', q: '何を得たいか', o: 'ゴール1文', g: 0 },
    { n: '2', t: '現状分析', q: 'いま何を持っているか', o: '棚卸しリスト', g: 0 },
    { n: '3', t: '差分／不足', q: '何が足りないか', o: 'ギャップ一覧', g: 0 },
    { n: '4', t: '市場分析', q: 'どこで戦うか', o: '市場の見立て', g: 0 },
    { n: '5', t: 'セグメント', q: 'どう切り分けるか', o: '分類軸', g: 0 },
    { n: '6', t: 'ターゲット', q: '誰に選ばれるか', o: '顧客像1人', g: 0 },
    { n: '7', t: 'ポジショニング', q: 'なぜ"あなた"か', o: '差別化の一文', g: 1 },
    { n: '8', t: '提供価値／USP', q: '何を約束するか', o: '価値提案', g: 1 },
    { n: '9', t: '施策設計（4P）', q: 'どう届けるか', o: '具体的な打ち手', g: 1 },
    { n: '10', t: 'KPI設計', q: '何を数えるか', o: '先行指標', g: 2 },
    { n: '11', t: '実行／PDCA', q: 'どう回すか', o: '週次サイクル', g: 2 },
    { n: '12', t: '仕組み化', q: 'どう再現するか', o: '手順書・習慣', g: 2 }
  ];
  const col = [GOLD, TEAL, GREEN];
  steps.forEach((o, i) => {
    const x = 0.85 + (i % 4) * 3.03, y = 2.42 + Math.floor(i / 4) * 1.32;
    card(s, x, y, 2.82, 1.15, o.g === 0 ? SOFT : (o.g === 1 ? 'E8F1F3' : 'EAF2ED'), o.g === 0 ? LINE : col[o.g]);
    numDot(s, x + 0.2, y + 0.15, 0.42, o.n, col[o.g], WHITE);
    tx(s, o.t, { x: x + 0.72, y: y + 0.14, w: 2.0, h: 0.42, fontSize: 14, bold: true, color: INK, valign: 'middle' });
    tx(s, o.q, { x: x + 0.2, y: y + 0.60, w: 2.45, h: 0.26, fontSize: 11, color: MUTED });
    tx(s, '→ ' + o.o, { x: x + 0.2, y: y + 0.85, w: 2.45, h: 0.26, fontSize: 11, bold: true, color: col[o.g] });
  });
  const legend = [
    { c: GOLD, t: '1-6　土台（現状把握）' },
    { c: TEAL, t: '7-9　抜けやすい部分（勝ち方の設計）' },
    { c: GREEN, t: '10-12　その先（成果と再現性）' }
  ];
  legend.forEach((o, i) => {
    const x = 0.85 + i * 4.1;
    s.addShape(pres.ShapeType.ellipse, { x, y: 6.42, w: 0.22, h: 0.22, fill: { color: o.c }, line: { width: 0 } });
    tx(s, o.t, { x: x + 0.35, y: 6.35, w: 3.7, h: 0.35, fontSize: 12, color: TXT, valign: 'middle' });
  });
  s.addNotes('【20:00–21:30】\n「もともと私は6つで教えていました。ただ現場で見ていると、6で止まると"分析しただけ"で終わる」と正直に言う。\nこの正直さが理論の信頼性を上げる。7-12を足した経緯を語ること。');
}

{
  const s = slideLight();
  head(s, 'A｜ANALYZE　STEP 1-3', '土台：目的 → 現状 → 差分', 'ここを飛ばして打ち手を考えるから、努力が空回りします');
  const items = [
    {
      n: '1', t: '目的', s: '明確にイメージできている状態', c: GOLD,
      b: ['「明確」の定義＝他人に説明したとき、相手の頭に同じ絵が浮かぶこと', '曖昧なまま進むと、途中の判断がすべてブレる', 'R章の7項目チェックをここで使う']
    },
    {
      n: '2', t: '現状分析', s: 'まず自分の状態を知ること', c: GOLD,
      b: ['棚卸し4象限：スキル／実績／人脈／使える時間とお金', '3C：自分（Company）・相手（Customer）・比較対象（Competitor）', '「できるつもり」を排除する。証拠のあるものだけ書く']
    },
    {
      n: '3', t: '差分／不足', s: '目的と現状の差を知る', c: GOLD,
      b: ['差分＝これからやることリストそのもの', '不足は3種類：量の不足／質の不足／順番の誤り', 'どれかを見極めないと、間違った努力を増やすことになる']
    }
  ];
  items.forEach((o, i) => {
    const x = 0.85 + i * 3.95;
    card(s, x, 2.1, 3.65, 4.3, SOFT);
    numDot(s, x + 0.3, 2.35, 0.5, o.n, o.c, WHITE);
    tx(s, o.t, { x: x + 0.95, y: 2.33, w: 2.6, h: 0.42, fontSize: 20, bold: true, color: INK, valign: 'middle' });
    tx(s, o.s, { x: x + 0.3, y: 2.95, w: 3.05, h: 0.5, fontSize: 12.5, bold: true, color: o.c, lineSpacing: 18 });
    tx(s, li(o.b), { x: x + 0.3, y: 3.55, w: 3.08, h: 2.6, fontSize: 12, color: TXT, fontFace: F, isTextBox: true, margin: 0, paraSpaceAfter: 9, lineSpacing: 18 });
  });
  s.addNotes('【21:30–23:00】\nStep2の「証拠のあるものだけ書く」を強調。自己評価と他者評価のズレが最大の落とし穴。\nStep3の「順番の誤り」は具体例で：集客より先に商品を磨きすぎる、など。');
}

{
  const s = slideLight();
  head(s, 'A｜ANALYZE　STEP 4-6', '戦場を選ぶ：市場 → セグメント → ターゲット', '努力より先に、どこで戦うかで勝負の8割が決まります');
  const items = [
    {
      n: '4', t: '市場分析', s: 'どこで戦うか', c: TEAL,
      b: ['需要はあるか／伸びているか／すでに強者で埋まっていないか', '外部環境（PEST）：政治・経済・社会・技術の追い風を探す', '沈む市場で努力するのが、いちばんもったいない']
    },
    {
      n: '5', t: 'セグメント', s: 'どう切り分けるか', c: TEAL,
      b: ['全員にとって良いものは、誰にとっても良くない', '切り口：属性／状況／悩みの深さ／支払い能力', '悩みが深く、お金を払える層はどこかを見る']
    },
    {
      n: '6', t: 'ターゲット', s: '誰に選ばれるか', c: TEAL,
      b: ['1人に決める。年齢・仕事・悩み・口ぐせまで書く', '「その人が今夜、検索する言葉」まで言えるか', 'ターゲットが決まると、やらないことが決まる']
    }
  ];
  items.forEach((o, i) => {
    const x = 0.85 + i * 3.95;
    card(s, x, 2.1, 3.65, 4.3, 'E8F1F3', TEAL);
    numDot(s, x + 0.3, 2.35, 0.5, o.n, o.c, WHITE);
    tx(s, o.t, { x: x + 0.95, y: 2.33, w: 2.6, h: 0.42, fontSize: 20, bold: true, color: INK, valign: 'middle' });
    tx(s, o.s, { x: x + 0.3, y: 2.95, w: 3.05, h: 0.4, fontSize: 12.5, bold: true, color: o.c });
    tx(s, li(o.b), { x: x + 0.3, y: 3.5, w: 3.08, h: 2.7, fontSize: 12, color: TXT, fontFace: F, isTextBox: true, margin: 0, paraSpaceAfter: 9, lineSpacing: 18 });
  });
  s.addNotes('【60分版では省略／配布資料で補完】\n「1人に決める」で必ず反論が出る（客を減らしたくない）。\n返し：「1人に刺さらないメッセージは、100人にも刺さりません」。');
}

{
  const s = slideLight();
  head(s, 'A｜ANALYZE　STEP 7-9', '【ここが抜けやすい】勝ち方を設計する', '分析で終わる人と、成果が出る人の分かれ目がここです');
  const items = [
    {
      n: '7', t: 'ポジショニング', s: 'なぜ「あなた」なのか', c: TEAL,
      b: ['2軸マップを描き、誰もいない場所を取る', '比較された時点で、価格勝負に落ちる', '例：「若手向け × 実務伴走」で唯一になる']
    },
    {
      n: '8', t: '提供価値／USP', s: '何を約束するか', c: TEAL,
      b: ['「誰の」「どんな痛みを」「どう解決し」「他と何が違うか」を一文に', '機能ではなく、相手が得る変化を書く', '約束できないことは、書かない']
    },
    {
      n: '9', t: '施策設計（4P）', s: 'どう届けるか', c: TEAL,
      b: ['Product：提供するもの／Price：値付け', 'Place：出会う場所／Promotion：伝え方', '4つのうち1つでも欠けると、良いものが届かない']
    }
  ];
  items.forEach((o, i) => {
    const x = 0.85 + i * 3.95;
    card(s, x, 2.1, 3.65, 4.3, 'E8F1F3', TEAL);
    numDot(s, x + 0.3, 2.35, 0.5, o.n, o.c, WHITE);
    tx(s, o.t, { x: x + 0.95, y: 2.33, w: 2.6, h: 0.42, fontSize: 18, bold: true, color: INK, valign: 'middle' });
    tx(s, o.s, { x: x + 0.3, y: 2.95, w: 3.05, h: 0.4, fontSize: 12.5, bold: true, color: o.c });
    tx(s, li(o.b), { x: x + 0.3, y: 3.5, w: 3.08, h: 2.7, fontSize: 12, color: TXT, fontFace: F, isTextBox: true, margin: 0, paraSpaceAfter: 9, lineSpacing: 18 });
  });
  s.addNotes('【23:00–24:30】\nここは「もとの6ステップには無かった部分です」と明示して話す。\nUSPの一文テンプレを板書：「＿＿な人が、＿＿を、＿＿によって解決できる。他と違うのは＿＿だから」。');
}

{
  const s = slideLight();
  head(s, 'A｜ANALYZE　STEP 10-12', '【この先】成果と再現性をつくる', 'ここまで来て初めて、分析が「実力」に変わります');
  const items = [
    {
      n: '10', t: 'KPI設計', s: '何を数えるか', c: GREEN,
      b: ['結果指標（遅行指標）ではなく、行動指標（先行指標）を数える', '例：契約数ではなく商談数、体重ではなく運動回数', '自分でコントロールできる数字だけをKPIにする']
    },
    {
      n: '11', t: '実行／PDCA', s: 'どう回すか', c: GREEN,
      b: ['週1回30分の検証会を、カレンダーに固定する', '数えたKPIを見て、仮説が合っていたかを判定', '次章のP（PDCA）に接続します']
    },
    {
      n: '12', t: '仕組み化', s: 'どう再現するか', c: GREEN,
      b: ['うまくいった手順を文書化し、習慣に落とす', '再現できて初めて「実力」。1回だけなら偶然', '仕組みになったものは、人に任せられる']
    }
  ];
  items.forEach((o, i) => {
    const x = 0.85 + i * 3.95;
    card(s, x, 2.1, 3.65, 4.3, 'EAF2ED', GREEN);
    numDot(s, x + 0.3, 2.35, 0.5, o.n, o.c, WHITE);
    tx(s, o.t, { x: x + 0.95, y: 2.33, w: 2.6, h: 0.42, fontSize: 19, bold: true, color: INK, valign: 'middle' });
    tx(s, o.s, { x: x + 0.3, y: 2.95, w: 3.05, h: 0.4, fontSize: 12.5, bold: true, color: o.c });
    tx(s, li(o.b), { x: x + 0.3, y: 3.5, w: 3.08, h: 2.7, fontSize: 12, color: TXT, fontFace: F, isTextBox: true, margin: 0, paraSpaceAfter: 9, lineSpacing: 18 });
  });
  s.addNotes('【24:30–26:00】\n「1回できたことは、まだ実力ではない」を強く言う。\n12がある人だけが、次のステージ（人に任せる／規模を広げる）に行ける。');
}

{
  const s = slideLight();
  head(s, 'A｜ANALYZE', '個人のテーマに当てはめると', '同じ12ステップが、どんなテーマにもそのまま使えます');
  const hdr = ['ステップ', '例A｜転職・昇進', '例B｜副業を立ち上げる', '例C｜体づくり'];
  const rows = [
    ['1 目的', '2年で事業責任者', '3年で月商100万', '1年で体脂肪15%'],
    ['2 現状', '実績はあるが社内発信ゼロ', 'スキルあり・顧客ゼロ', '週0回運動・外食中心'],
    ['3 差分', '可視化と信頼の不足', '集客導線の不足', '習慣と食事管理の不足'],
    ['4-6 戦場', '成長部署／評価者は誰か', '狭い領域で1人に絞る', '続けられる運動を選ぶ'],
    ['7-9 勝ち方', '「数字で語る人」になる', '「〇〇専門」と名乗る', '朝の30分に固定する'],
    ['10-12 再現', '週次で上司に報告', '週次で商談数を数える', '記録アプリで毎日記録']
  ];
  s.addTable([
    hdr.map(t => ({ text: t, options: { bold: true, color: WHITE, fill: { color: INK }, fontSize: 12.5 } })),
    ...rows.map((r, ri) => r.map((t, ci) => ({
      text: t,
      options: { bold: ci === 0, color: ci === 0 ? INK : TXT, fill: { color: ci === 0 ? SOFT2 : (ri % 2 ? SOFT : WHITE) }, fontSize: 12.5 }
    })))
  ], {
    x: 0.9, y: 2.2, w: 11.55, colW: [2.55, 3.0, 3.0, 3.0],
    rowH: 0.6, border: { pt: 0.75, color: LINE }, fontFace: F, valign: 'middle',
    align: 'left', autoPage: false
  });
  s.addNotes('【60分版では省略／配布資料で補完】\n参加者の属性に近い列を指して話す。事前に参加者の目的を聞いておき、その場で1列書き換えると効果が高い。');
}

{
  const s = slideDark();
  bullseye(s, 11.3, 5.8, 1.2, INK2);
  tx(s, 'WORK 02 ／ 5分', { x: 0.85, y: 1.7, w: 8, h: 0.32, fontSize: 12.5, bold: true, color: GOLD, charSpacing: 2.5 });
  tx(s, '演習②：現在地とギャップを書き出す', { x: 0.85, y: 2.1, w: 11.4, h: 0.75, fontSize: 34, bold: true, color: WHITE });
  const w = [
    'いま持っているものを棚卸しする（スキル／実績／人脈／時間とお金）',
    'ゴールに必要なものを書き出す',
    '差分＝足りないものを3つに絞る',
    'その不足は「量」「質」「順番」のどれかを判定する'
  ];
  w.forEach((t, i) => {
    const y = 3.2 + i * 0.72;
    numDot(s, 0.85, y, 0.48, i + 1, GOLD, INK);
    tx(s, t, { x: 1.55, y: y - 0.05, w: 10.3, h: 0.55, fontSize: 17, color: WHITE, valign: 'middle' });
  });
  tx(s, '3つに絞れない人は、まだゴールが曖昧です。R章に戻ってください。', {
    x: 0.85, y: 6.2, w: 10.5, h: 0.4, fontSize: 13, color: '9FB2C6', italic: true
  });
  s.addNotes('【26:00–29:00】5分。\n巡回して手が止まっている人に「ゴールをもう一度声に出して」と促す。\n終了後、1〜2名に「足りない3つ」を発表してもらい、量／質／順番のどれかを全員で判定すると盛り上がる。');
}

/* =========================================================
   SECTION P — PDCA
   ========================================================= */
section('P', '03', '回す', 'PLAN  DO  CHECK  ACT', '言わずと知れた成功法。\nただし、ほとんどの人は回せていません。\n速く回した人が、正しい人に勝ちます。');

{
  const s = slideLight();
  head(s, 'P｜PDCA', 'PDCAの本質は「精神論を数字に変える装置」', '回すほど、あなたの「勘」が「データ」に変わっていきます');
  const st = [
    { l: 'P', t: 'Plan', jp: '仮説を立てる', d: '数値目標・仮説・期限・判定基準を、動く前に決める', c: GOLD },
    { l: 'D', t: 'Do', jp: '実行して記録する', d: '実行より記録。記録のない実行は、検証できない', c: TEAL },
    { l: 'C', t: 'Check', jp: '事実で検証する', d: '仮説と結果の差を、解釈を混ぜずに見る', c: INK3 },
    { l: 'A', t: 'Act', jp: '次の一手を決める', d: '続ける／変える／やめる の3択で必ず決める', c: GREEN }
  ];
  st.forEach((o, i) => {
    const x = 0.85 + i * 3.05;
    card(s, x, 2.15, 2.75, 3.1, SOFT);
    s.addShape(pres.ShapeType.roundRect, { x: x + 0.25, y: 2.42, w: 0.7, h: 0.7, rectRadius: 0.06, fill: { color: o.c }, line: { width: 0 } });
    tx(s, o.l, { x: x + 0.25, y: 2.42, w: 0.7, h: 0.7, fontSize: 28, bold: true, color: WHITE, align: 'center', valign: 'middle', fontFace: 'Arial' });
    tx(s, o.jp, { x: x + 0.25, y: 3.3, w: 2.3, h: 0.4, fontSize: 16, bold: true, color: INK });
    tx(s, o.t.toUpperCase(), { x: x + 0.25, y: 3.72, w: 2.3, h: 0.28, fontSize: 10.5, bold: true, color: o.c, charSpacing: 1.5 });
    tx(s, o.d, { x: x + 0.25, y: 4.08, w: 2.3, h: 1.0, fontSize: 12, color: MUTED, lineSpacing: 18 });
    if (i < 3) tx(s, '▶', { x: x + 2.72, y: 2.15, w: 0.35, h: 3.1, fontSize: 14, color: LINE, align: 'center', valign: 'middle' });
  });
  card(s, 0.85, 5.5, 11.6, 0.95, INK, INK);
  tx(s, '速く回した人が、正しい人に勝つ。 — 1回の完璧な計画より、10回の粗い検証。', {
    x: 1.2, y: 5.5, w: 10.9, h: 0.95, fontSize: 17, bold: true, color: WHITE, valign: 'middle'
  });
  s.addNotes('【29:00–30:45】\n「PDCAは知ってますよね？」と聞いて全員に頷かせてから、「では先週1周回した人？」で落とす。\n知識と実行のギャップを可視化するのがこのスライドの役割。');
}

{
  const s = slideLight();
  head(s, 'P｜PDCA', 'PDCAが回らない5つの理由', '知らないから回らないのではありません。型が違うから回らないのです。');
  const r = [
    { n: '1', t: 'Pが曖昧', d: '数字も期限もない。「頑張る」は計画ではありません。', f: '数値・期限・判定基準を先に決める' },
    { n: '2', t: 'Dが記録されていない', d: '「やった感」だけが残り、何をどれだけやったか誰も言えない。', f: '何を／どれだけ／結果 の3点だけ記録' },
    { n: '3', t: 'Cの基準が後付け', d: '結果を見てから基準を決めるので、いつでも言い訳が成立する。', f: '判定基準はPの時点で書いておく' },
    { n: '4', t: 'Aが感想で終わる', d: '「次は頑張る」は行動ではない。翌週も同じことが起きる。', f: '続ける／変える／やめる を明言する' },
    { n: '5', t: 'サイクルが長すぎる', d: '年1回の振り返りでは、学習が起きる前に忘れてしまう。', f: '週次を基本サイクルにする' }
  ];
  r.forEach((o, i) => {
    const y = 2.05 + i * 0.92;
    card(s, 0.85, y, 11.6, 0.78, SOFT);
    numDot(s, 1.12, y + 0.13, 0.52, o.n, RED, WHITE);
    tx(s, o.t, { x: 1.88, y, w: 2.5, h: 0.78, fontSize: 15, bold: true, color: INK, valign: 'middle' });
    tx(s, o.d, { x: 4.45, y, w: 4.6, h: 0.78, fontSize: 12, color: MUTED, valign: 'middle' });
    tx(s, '→ ' + o.f, { x: 9.15, y, w: 3.1, h: 0.78, fontSize: 12, bold: true, color: GREEN, valign: 'middle' });
  });
  s.addNotes('【30:45–32:15】\n参加者に「自分はどれか」を1つ選んでもらう。挙手させると4番が最多になりやすい。\n右列の処方箋だけメモさせれば十分。');
}

{
  const s = slideLight();
  head(s, 'P｜PDCA', '正しい Plan と Do', '動く前に決めることが4つ。動いた後に残すものが3つ。');
  card(s, 0.85, 2.1, 5.65, 4.3, SOFT);
  s.addShape(pres.ShapeType.roundRect, { x: 1.2, y: 2.38, w: 0.62, h: 0.62, rectRadius: 0.06, fill: { color: GOLD }, line: { width: 0 } });
  tx(s, 'P', { x: 1.2, y: 2.38, w: 0.62, h: 0.62, fontSize: 26, bold: true, color: WHITE, align: 'center', valign: 'middle', fontFace: 'Arial' });
  tx(s, '動く前に決める4つ', { x: 1.98, y: 2.38, w: 4.2, h: 0.62, fontSize: 20, bold: true, color: INK, valign: 'middle' });
  [
    ['数値目標', '「商談を週5件」のように数える対象を決める'],
    ['仮説', '「〜すれば、〜になるはず」の形で書く'],
    ['期限', 'いつ判定するかを日付で決める'],
    ['判定基準', '何点なら成功か、動く前に決めておく']
  ].forEach((o, i) => {
    const y = 3.25 + i * 0.78;
    tx(s, o[0], { x: 1.2, y, w: 1.6, h: 0.35, fontSize: 14, bold: true, color: GOLD });
    tx(s, o[1], { x: 2.85, y: y - 0.02, w: 3.4, h: 0.6, fontSize: 12, color: TXT, lineSpacing: 18 });
  });
  card(s, 6.8, 2.1, 5.65, 4.3, 'E8F1F3', TEAL);
  s.addShape(pres.ShapeType.roundRect, { x: 7.15, y: 2.38, w: 0.62, h: 0.62, rectRadius: 0.06, fill: { color: TEAL }, line: { width: 0 } });
  tx(s, 'D', { x: 7.15, y: 2.38, w: 0.62, h: 0.62, fontSize: 26, bold: true, color: WHITE, align: 'center', valign: 'middle', fontFace: 'Arial' });
  tx(s, '実行より、記録', { x: 7.93, y: 2.38, w: 4.2, h: 0.62, fontSize: 20, bold: true, color: INK, valign: 'middle' });
  tx(s, '記録されていない実行は、検証できません。\n検証できない実行は、何度やっても上達しません。', {
    x: 7.15, y: 3.2, w: 5.0, h: 0.7, fontSize: 13, color: TXT, lineSpacing: 21
  });
  [
    ['何を', 'やった行動の名前'],
    ['どれだけ', '回数・時間・件数'],
    ['結果', '起きたことの事実だけ']
  ].forEach((o, i) => {
    const y = 4.1 + i * 0.72;
    card(s, 7.15, y, 4.95, 0.6, WHITE, LINE);
    tx(s, o[0], { x: 7.4, y, w: 1.5, h: 0.6, fontSize: 14, bold: true, color: TEAL, valign: 'middle' });
    tx(s, o[1], { x: 8.85, y, w: 3.1, h: 0.6, fontSize: 12, color: MUTED, valign: 'middle' });
  });
  tx(s, '記録は3行で十分。続かない記録に意味はありません。', { x: 7.15, y: 6.0, w: 5.0, h: 0.32, fontSize: 11.5, color: MUTED, italic: true });
  s.addNotes('【32:15–33:45】\n「判定基準を先に決める」がいちばん抵抗される。理由は、逃げ道がなくなるから。\nそこを笑いにしてから「逃げ道を消すのが目的です」と言い切る。');
}

{
  const s = slideLight();
  head(s, 'P｜PDCA', 'Check：事実と解釈を分ける', 'ここを混ぜた瞬間に、改善点は消えます');
  const cols = [
    { t: '事実', c: TEAL, ex: ['商談 15件', '成約 2件', '成約率 13%', '返信率 40%'], d: '数えられること。誰が見ても同じもの。' },
    { t: '解釈', c: GOLD, ex: ['提案の順番が刺さっていない', '想定より単価が高かったかも', 'ターゲットがズレている可能性'], d: '事実から導いた仮の説明。次の仮説になる。' },
    { t: '言い訳', c: RED, ex: ['忙しかった', '相手が悪かった', 'タイミングが悪かった', '景気が悪い'], d: '自分の外に原因を置いた瞬間、改善点が消える。' }
  ];
  cols.forEach((o, i) => {
    const x = 0.85 + i * 3.95;
    card(s, x, 2.1, 3.65, 3.5, i === 2 ? 'F7EEED' : SOFT, i === 2 ? RED : LINE);
    tx(s, o.t, { x: x + 0.3, y: 2.32, w: 3.0, h: 0.45, fontSize: 22, bold: true, color: o.c });
    tx(s, li(o.ex), { x: x + 0.3, y: 2.9, w: 3.08, h: 1.75, fontSize: 12.5, color: TXT, fontFace: F, isTextBox: true, margin: 0, paraSpaceAfter: 8 });
    tx(s, o.d, { x: x + 0.3, y: 4.75, w: 3.08, h: 0.7, fontSize: 11.5, color: MUTED, lineSpacing: 17 });
  });
  card(s, 0.85, 5.8, 11.6, 0.85, INK, INK);
  tx(s, '検証すべき問いはひとつ。「立てた仮説と、実際の結果は、どこがどれだけ違ったか」。', {
    x: 1.2, y: 5.8, w: 10.9, h: 0.85, fontSize: 16, bold: true, color: WHITE, valign: 'middle'
  });
  s.addNotes('【33:45–35:15】\n3列目の「言い訳」は、参加者が普段書いている振り返りそのもの。自分の日報を思い出させる。\n「言い訳は悪ではなく、ただ改善に使えないだけ」と言うと受け入れられやすい。');
}

{
  const s = slideLight();
  head(s, 'P｜PDCA', 'Act：選択肢は3つしかない', '「次は頑張る」は選択肢に入っていません');
  const a = [
    { t: '続ける', e: 'CONTINUE', d: '仮説が当たった。同じことの「量」を増やす。', p: '勝ち筋が見えたら、迷わず倍にする。', c: GREEN },
    { t: '変える', e: 'CHANGE', d: '仮説が外れた。変数を1つだけ変えて再検証する。', p: '同時に2つ変えると、何が効いたか永遠に分からない。', c: GOLD },
    { t: 'やめる', e: 'STOP', d: '構造的に無理。撤退して資源を別に回す。', p: '撤退は敗北ではなく、時間を取り戻す戦略。', c: RED }
  ];
  a.forEach((o, i) => {
    const x = 0.85 + i * 3.95;
    card(s, x, 2.15, 3.65, 3.9, SOFT);
    s.addShape(pres.ShapeType.roundRect, { x: x + 0.3, y: 2.42, w: 2.0, h: 0.5, rectRadius: 0.06, fill: { color: o.c }, line: { width: 0 } });
    tx(s, o.t, { x: x + 0.3, y: 2.42, w: 2.0, h: 0.5, fontSize: 17, bold: true, color: WHITE, align: 'center', valign: 'middle' });
    tx(s, o.e, { x: x + 0.3, y: 3.05, w: 3.0, h: 0.28, fontSize: 10.5, bold: true, color: o.c, charSpacing: 2 });
    tx(s, o.d, { x: x + 0.3, y: 3.42, w: 3.08, h: 1.0, fontSize: 13.5, color: TXT, lineSpacing: 20 });
    card(s, x + 0.3, 4.55, 3.05, 1.2, WHITE, LINE);
    tx(s, o.p, { x: x + 0.5, y: 4.55, w: 2.65, h: 1.2, fontSize: 11.5, color: MUTED, valign: 'middle', lineSpacing: 17 });
  });
  tx(s, '3つのどれにも決められないときは、Cが甘い。事実に戻ってください。', {
    x: 0.85, y: 6.2, w: 11.5, h: 0.4, fontSize: 14, bold: true, color: INK
  });
  s.addNotes('【35:15–36:15】\n「変数を1つだけ」は実務でいちばん守られない。営業なら「トークを変えるならリストは変えない」と具体例で。');
}

{
  const s = slideLight();
  head(s, 'P｜PDCA', '回転数を設計する', '1年で何周回したか。それがそのまま、成長量になります');
  s.addChart(pres.ChartType.bar, [{
    name: '年間の検証回数',
    labels: ['年1回', '月1回', '週1回', '毎日'],
    values: [1, 12, 52, 365]
  }], {
    x: 0.85, y: 2.15, w: 5.9, h: 4.2,
    barDir: 'col', chartColors: [INK3, TEAL, GOLD, GREEN], varyColors: true,
    showTitle: true, title: '1年間に回せる検証サイクル数', titleFontSize: 13, titleColor: INK, titleFontFace: F,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFontSize: 11, dataLabelColor: TXT, dataLabelFontFace: F,
    showLegend: false, catAxisLabelColor: MUTED, valAxisLabelColor: MUTED,
    catAxisLabelFontFace: F, valAxisLabelFontFace: F, catAxisLabelFontSize: 11, valAxisLabelFontSize: 10,
    valGridLine: { color: 'E8EDF2', size: 1 }, catGridLine: { style: 'none' }, barGapWidthPct: 70
  });
  card(s, 7.05, 2.15, 5.4, 4.2, SOFT);
  tx(s, 'サイクルの使い分け', { x: 7.4, y: 2.38, w: 4.7, h: 0.35, fontSize: 13, bold: true, color: GOLD, charSpacing: 1.5 });
  [
    { t: '日次', m: '3分', d: '行動量のチェックのみ。数を記録する。', c: GREEN },
    { t: '週次', m: '30分', d: '仮説検証の主戦場。ここが最重要。', c: GOLD },
    { t: '月次', m: '60分', d: '戦術の見直し。KPIの取り方を疑う。', c: TEAL },
    { t: '四半期', m: '半日', d: '目標・戦略そのものの見直し。', c: INK3 }
  ].forEach((o, i) => {
    const y = 2.85 + i * 0.85;
    card(s, 7.4, y, 4.7, 0.72, WHITE, LINE);
    tx(s, o.t, { x: 7.62, y, w: 1.0, h: 0.72, fontSize: 14, bold: true, color: o.c, valign: 'middle' });
    tx(s, o.m, { x: 8.6, y, w: 0.8, h: 0.72, fontSize: 12, bold: true, color: MUTED, valign: 'middle' });
    tx(s, o.d, { x: 9.42, y, w: 2.5, h: 0.72, fontSize: 11.5, color: TXT, valign: 'middle', lineSpacing: 16 });
  });
  tx(s, '※ 四半期の見直しは、組織の評価サイクルと合わせると定着します。', {
    x: 7.05, y: 6.42, w: 5.4, h: 0.3, fontSize: 10.5, color: MUTED
  });
  s.addNotes('【36:15–37:45】\nグラフは「週1回で年52周」を指差す。「月1回の人の4年分を、1年で経験できます」。\n毎日365周は現実的でないので「日次は記録だけ」と補足する。');
}

{
  const s = slideLight();
  head(s, 'P｜PDCA　補足', 'PDCA と OODA の使い分け', '計画できる領域と、できない領域で、道具を変えます');
  card(s, 0.85, 2.15, 5.65, 3.6, SOFT);
  tx(s, 'PDCA', { x: 1.2, y: 2.4, w: 4.9, h: 0.5, fontSize: 24, bold: true, color: GOLD, fontFace: 'Arial' });
  tx(s, '既知・繰り返しの領域', { x: 1.2, y: 2.95, w: 4.9, h: 0.35, fontSize: 14, bold: true, color: INK });
  tx(s, li([
    '前例があり、変数が読める',
    '計画を立てる価値がある',
    '改善して精度を上げる段階',
    '例：既存業務、営業活動、学習、トレーニング'
  ]), { x: 1.2, y: 3.4, w: 4.95, h: 2.1, fontSize: 13, color: TXT, fontFace: F, isTextBox: true, margin: 0, paraSpaceAfter: 10, lineSpacing: 19 });
  card(s, 6.8, 2.15, 5.65, 3.6, 'E8F1F3', TEAL);
  tx(s, 'OODA', { x: 7.15, y: 2.4, w: 4.9, h: 0.5, fontSize: 24, bold: true, color: TEAL, fontFace: 'Arial' });
  tx(s, '未知・初挑戦の領域', { x: 7.15, y: 2.95, w: 4.9, h: 0.35, fontSize: 14, bold: true, color: INK });
  tx(s, li([
    '観察 → 情勢判断 → 意思決定 → 行動',
    '計画より、素早い当て勘と修正',
    '当たりを探す段階',
    '例：新規事業、転職活動、初めての挑戦'
  ]), { x: 7.15, y: 3.4, w: 4.95, h: 2.1, fontSize: 13, color: TXT, fontFace: F, isTextBox: true, margin: 0, paraSpaceAfter: 10, lineSpacing: 19 });
  card(s, 0.85, 5.95, 11.6, 0.75, INK, INK);
  tx(s, '新しいことは OODA で当たりを探し、型が見えたら PDCA で磨く。この順番が最短です。', {
    x: 1.2, y: 5.95, w: 10.9, h: 0.75, fontSize: 15.5, bold: true, color: WHITE, valign: 'middle'
  });
  s.addNotes('【60分版では省略／配布資料で補完】\n「PDCAが回らない」という相談の半分は、まだ計画できない段階でPDCAを使っているケース。\nこの区別を伝えるだけで救われる人がいる。');
}

{
  const s = slideDark();
  bullseye(s, 11.3, 5.8, 1.2, INK2);
  tx(s, 'WORK 03 ／ 4分', { x: 0.85, y: 1.7, w: 8, h: 0.32, fontSize: 12.5, bold: true, color: GOLD, charSpacing: 2.5 });
  tx(s, '演習③：今週まわす1周を設計する', { x: 0.85, y: 2.1, w: 11.4, h: 0.75, fontSize: 34, bold: true, color: WHITE });
  [
    '今週の数値目標を1つ書く（自分で数えられる行動指標）',
    '仮説を「〜すれば〜になるはず」の形で書く',
    '検証する曜日と時刻を決めて、カレンダーに入れる',
    '判定基準を先に書く（何点なら成功か）'
  ].forEach((t, i) => {
    const y = 3.2 + i * 0.72;
    numDot(s, 0.85, y, 0.48, i + 1, GOLD, INK);
    tx(s, t, { x: 1.55, y: y - 0.05, w: 10.3, h: 0.55, fontSize: 17, color: WHITE, valign: 'middle' });
  });
  tx(s, 'カレンダーに入っていない予定は、実行されません。今この場で入れてください。', {
    x: 0.85, y: 6.2, w: 10.5, h: 0.4, fontSize: 13, color: '9FB2C6', italic: true
  });
  s.addNotes('【37:45–40:45】4分。\nスマホを出させて、その場で週次30分の予定を入れさせる。ここで入れた人だけが実際に続く。');
}

/* =========================================================
   SECTION O — Overcome（失敗）
   ========================================================= */
section('O', '04', '失敗を越える', 'OVERCOME  FAILURE', '失敗は、避けるものではありません。\n集めるものです。\nやめない限り、失敗は存在しません。');

{
  const s = slideLight();
  head(s, 'O｜OVERCOME', '失敗の定義を、書き換える', '定義が変われば、同じ出来事の意味が変わります');
  card(s, 0.85, 2.1, 5.65, 2.15, SOFT);
  tx(s, '一般的な定義', { x: 1.2, y: 2.32, w: 4.9, h: 0.3, fontSize: 12, bold: true, color: MUTED, charSpacing: 1.5 });
  tx(s, '失敗 ＝ うまくいかないこと', { x: 1.2, y: 2.68, w: 4.95, h: 0.5, fontSize: 21, bold: true, color: MUTED });
  tx(s, 'だから避ける。避けるから挑戦の数が減る。数が減るから成功も減る。', {
    x: 1.2, y: 3.25, w: 4.95, h: 0.7, fontSize: 12.5, color: TXT, lineSpacing: 20
  });
  card(s, 6.8, 2.1, 5.65, 2.15, INK, INK);
  tx(s, 'この理論の定義', { x: 7.15, y: 2.32, w: 4.9, h: 0.3, fontSize: 12, bold: true, color: GOLD, charSpacing: 1.5 });
  tx(s, '失敗 ＝ やめること', { x: 7.15, y: 2.68, w: 4.95, h: 0.5, fontSize: 24, bold: true, color: WHITE });
  tx(s, 'それ以外は、すべて「データ」。\nやめない限り、失敗はまだ発生していません。', {
    x: 7.15, y: 3.25, w: 4.95, h: 0.7, fontSize: 12.5, color: '9FB2C6', lineSpacing: 20
  });
  s.addShape(pres.ShapeType.line, { x: 6.5, y: 3.17, w: 0.3, h: 0, line: { color: GOLD, width: 2.5, endArrowType: 'triangle' } });
  const g = [
    { t: 'うまくいかなかった', d: '→ 仮説が違ったというデータ', c: TEAL },
    { t: '断られた', d: '→ 相手か伝え方がズレていたというデータ', c: TEAL },
    { t: '同じ失敗を繰り返した', d: '→ これは失敗。記録していない証拠', c: RED },
    { t: '挑戦をやめた', d: '→ これが唯一の失敗', c: RED }
  ];
  g.forEach((o, i) => {
    const y = 4.5 + Math.floor(i / 2) * 1.05;
    const x = 0.85 + (i % 2) * 5.95;
    card(s, x, y, 5.65, 0.88, o.c === RED ? 'F7EEED' : SOFT, o.c === RED ? RED : LINE);
    tx(s, o.t, { x: x + 0.3, y, w: 2.4, h: 0.88, fontSize: 14, bold: true, color: INK, valign: 'middle' });
    tx(s, o.d, { x: x + 2.75, y, w: 2.7, h: 0.88, fontSize: 12, color: o.c, valign: 'middle', lineSpacing: 17 });
  });
  s.addNotes('【40:45–42:30】\n「同じ失敗の繰り返しは失敗」は必ず入れる。これがないと、ただの都合のいい理屈に聞こえる。\n記録があるかどうかが、データと失敗を分ける唯一の線。');
}

{
  const s = slideLight();
  head(s, 'O｜OVERCOME', '挑戦回数は、才能の代わりになる', '1回の成功率が低くても、打席に立てば結果は変わります');
  s.addChart(pres.ChartType.bar, [{
    name: '1回以上成功する確率',
    labels: ['1回', '5回', '10回', '20回', '30回'],
    values: [10, 41, 65, 88, 96]
  }], {
    x: 0.85, y: 2.15, w: 6.4, h: 4.2,
    barDir: 'col', chartColors: ['C9D3DE', 'A9BACB', '7E9AB5', GOLD, GREEN], varyColors: true,
    showTitle: true, title: '1回の成功率が10%のとき、n回挑戦して1回以上成功する確率（%）',
    titleFontSize: 12, titleColor: INK, titleFontFace: F,
    showValue: true, dataLabelPosition: 'outEnd', dataLabelFontSize: 11, dataLabelColor: TXT, dataLabelFontFace: F,
    showLegend: false, catAxisLabelColor: MUTED, valAxisLabelColor: MUTED,
    catAxisLabelFontFace: F, valAxisLabelFontFace: F, catAxisLabelFontSize: 11, valAxisLabelFontSize: 10,
    valAxisMaxVal: 100, valGridLine: { color: 'E8EDF2', size: 1 }, catGridLine: { style: 'none' }, barGapWidthPct: 60
  });
  card(s, 7.55, 2.15, 4.9, 4.2, INK, INK);
  tx(s, '読み取れること', { x: 7.9, y: 2.4, w: 4.2, h: 0.35, fontSize: 13, bold: true, color: GOLD, charSpacing: 1.5 });
  tx(s, li([
    '才能とは、1回あたりの確率のこと',
    '挑戦回数は、確率と同じだけ結果を動かす',
    '確率は変えにくいが、回数は今日から変えられる',
    '「怖くて1回で止める人」と「30回やる人」の差は、能力差ではない'
  ]), { x: 7.9, y: 2.9, w: 4.25, h: 2.6, fontSize: 13, color: WHITE, fontFace: F, isTextBox: true, margin: 0, paraSpaceAfter: 12, lineSpacing: 20 });
  s.addShape(pres.ShapeType.rect, { x: 7.9, y: 5.55, w: 4.2, h: 0.02, fill: { color: INK3 }, line: { width: 0 } });
  tx(s, '打席に立ち続けることは、\n才能を増やすことと同じ効果を持ちます。', {
    x: 7.9, y: 5.7, w: 4.25, h: 0.6, fontSize: 13, bold: true, color: GOLDL, lineSpacing: 20
  });
  s.addNotes('【42:30–44:00】\n数式は出さない。「10%でも30回で96%」だけ覚えてもらう。\n注意：この計算は各試行が独立の場合。実際は学習するので、もっと上がる、と補足すると納得感が増す。');
}

{
  const s = slideLight();
  head(s, 'O｜OVERCOME', '「成功するまで諦めなければ成功」— の3条件', 'ただ耐えることではありません。3つが揃って初めて成立します');
  const c = [
    {
      n: '1', t: '方向を変える自由を持つ', c: GOLD,
      d: '握るのは「目的」だけ。手段は捨ててよい。',
      b: ['手段に固執した継続は、ただの意地', '目的が同じなら、道は何本あってもいい', '「やり方を変えた」は諦めではない']
    },
    {
      n: '2', t: '生き残る', c: TEAL,
      d: '再挑戦できる体力・資金・信用を残す。',
      b: ['全額・全時間を1回に賭けない', '退場したら、続けることすらできない', '撤退ラインを先に決めておく']
    },
    {
      n: '3', t: '記録する', c: GREEN,
      d: '同じ失敗を繰り返さない仕組みを持つ。',
      b: ['記録のない継続は、同じ失敗の反復', '学習曲線が描けて初めて「継続」になる', '次の一手が前回より良くなっているか']
    }
  ];
  c.forEach((o, i) => {
    const x = 0.85 + i * 3.95;
    card(s, x, 2.1, 3.65, 4.05, SOFT);
    numDot(s, x + 0.3, 2.35, 0.5, o.n, o.c, WHITE);
    tx(s, o.t, { x: x + 0.3, y: 2.98, w: 3.08, h: 0.75, fontSize: 17, bold: true, color: INK, lineSpacing: 24 });
    tx(s, o.d, { x: x + 0.3, y: 3.78, w: 3.08, h: 0.55, fontSize: 12, bold: true, color: o.c, lineSpacing: 18 });
    tx(s, li(o.b), { x: x + 0.3, y: 4.4, w: 3.08, h: 1.6, fontSize: 11.5, color: MUTED, fontFace: F, isTextBox: true, margin: 0, paraSpaceAfter: 8, lineSpacing: 17 });
  });
  card(s, 0.85, 6.28, 11.6, 0.55, 'F7EEED', RED);
  tx(s, 'この3つがない継続は、前進ではなく、ただの消耗です。', {
    x: 1.2, y: 6.28, w: 10.9, h: 0.55, fontSize: 14, bold: true, color: RED, valign: 'middle'
  });
  s.addNotes('【44:00–45:30】\nここは誠実さが問われる場面。「諦めるな」だけ言う人との差別化ポイント。\n②の撤退ラインの話をすると、経営者・投資経験者からの信頼が一気に上がる。');
}

{
  const s = slideLight();
  head(s, 'O｜OVERCOME', '失敗を資産に変える5つの質問', 'この5つに答えた時点で、失敗はあなたの商品になります');
  const q = [
    { n: '1', t: '事実として、何が起きたか', d: '解釈を混ぜず、数字と出来事だけを書く' },
    { n: '2', t: '自分の意思決定の、どこが分岐点だったか', d: '他人ではなく、自分が選んだ場所を特定する' },
    { n: '3', t: '事前に気づけるサインはあったか', d: '次に同じ状況を早期発見するためのアラート' },
    { n: '4', t: '次に同じ状況が来たら、どう動くか', d: '具体的な行動として書く。感想では意味がない' },
    { n: '5', t: 'この経験を誰かの役に立てるなら、何を伝えるか', d: 'ここまで来た失敗は、価値のある知見になる' }
  ];
  q.forEach((o, i) => {
    const y = 2.1 + i * 0.92;
    card(s, 0.85, y, 11.6, 0.78, i === 4 ? 'EAF2ED' : SOFT, i === 4 ? GREEN : LINE);
    numDot(s, 1.12, y + 0.13, 0.52, o.n, i === 4 ? GREEN : GOLD, WHITE);
    tx(s, o.t, { x: 1.88, y, w: 6.0, h: 0.78, fontSize: 15.5, bold: true, color: INK, valign: 'middle' });
    tx(s, o.d, { x: 7.95, y, w: 4.3, h: 0.78, fontSize: 12, color: MUTED, valign: 'middle', lineSpacing: 17 });
  });
  tx(s, '5番に答えられた失敗だけが、他人に売れる経験になります。', {
    x: 0.85, y: 6.75, w: 11.5, h: 0.35, fontSize: 13.5, bold: true, color: INK
  });
  s.addNotes('【45:30–46:30】\n自分の大きな失敗を1つ、この5問に沿って実演すると強い。\n特に⑤で「だから今日こうして話しています」に着地させると、講師としての正当性が立つ。');
}

/* =========================================================
   SECTION R — Reframe
   ========================================================= */
section('R', '05', '解釈を変える', 'REFRAME  THE  EVENT', '人には、適切なことしか起こらない。\nこれは事実の主張ではなく、\n最も前に進める「前提の選び方」です。');

{
  const s = slideLight();
  head(s, 'R｜REFRAME', '出来事 × 解釈 ＝ 結果', '出来事は変えられません。変えられるのは、掛ける側だけです');
  const box = [
    { t: '出来事', d: 'すでに起きたこと。\n変えられない。', c: MUTED, x: 0.85 },
    { t: '解釈', d: 'どう受け取るか。\nここだけが選べる。', c: GOLD, x: 5.05 },
    { t: '結果', d: '次にとる行動と、\nその積み重ね。', c: GREEN, x: 9.25 }
  ];
  box.forEach((o, i) => {
    card(s, o.x, 2.15, 3.2, 1.85, i === 1 ? 'FBF3E4' : SOFT, i === 1 ? GOLD : LINE);
    tx(s, o.t, { x: o.x + 0.3, y: 2.4, w: 2.6, h: 0.45, fontSize: 21, bold: true, color: o.c });
    tx(s, o.d, { x: o.x + 0.3, y: 2.95, w: 2.65, h: 0.85, fontSize: 12.5, color: TXT, lineSpacing: 19 });
    if (i < 2) tx(s, i === 0 ? '×' : '=', { x: o.x + 3.2, y: 2.15, w: 1.0, h: 1.85, fontSize: 26, bold: true, color: MUTED, align: 'center', valign: 'middle' });
  });
  card(s, 0.85, 4.25, 11.6, 2.15, INK, INK);
  tx(s, 'なぜ「適切なことしか起こらない」と決めると強いのか', {
    x: 1.2, y: 4.45, w: 10.9, h: 0.4, fontSize: 16, bold: true, color: GOLD
  });
  const why = [
    { t: '原因が自分の側に置ける', d: '＝自分で改善できる範囲になる' },
    { t: '他人や環境を変えなくていい', d: '＝待たずに、今日から動ける' },
    { t: 'ネガティブが「課題」に変わる', d: '＝落ち込みが、行動できる形になる' }
  ];
  why.forEach((o, i) => {
    const x = 1.2 + i * 3.65;
    tx(s, o.t, { x, y: 4.98, w: 3.4, h: 0.6, fontSize: 14, bold: true, color: WHITE, lineSpacing: 20 });
    tx(s, o.d, { x, y: 5.62, w: 3.4, h: 0.6, fontSize: 12, color: '9FB2C6', lineSpacing: 18 });
  });
  s.addNotes('【46:30–48:15】\n「これはスピリチュアルな話ではありません」と先に否定しておく。\n"事実かどうか"ではなく"どちらの前提を採用すると前に進めるか"という功利的な説明にすると、論理的な人にも通る。');
}

{
  const s = slideLight();
  head(s, 'R｜REFRAME', '解釈の変換表', '同じ出来事を、行動できる形に翻訳します');
  const rows = [
    ['断られた', '対象か伝え方がズレている、というデータが取れた', '誰に・どう伝えたかを見直す'],
    ['批判された', '期待値と現実の差が可視化された', '差の中身を一つ確認する'],
    ['うまくいかない', '仮説が間違っていただけ（自分の否定ではない）', '変数を1つ変えて再検証する'],
    ['時間がない', '優先順位が決まっていない', 'やめることを1つ決める'],
    ['裏切られた', '人選と契約設計の学習機会', '次回の合意の取り方を変える'],
    ['評価されない', '相手の判断基準を把握できていない', '評価者に基準を直接聞く']
  ];
  s.addTable([
    [
      { text: '起きた出来事', options: { bold: true, color: WHITE, fill: { color: INK }, fontSize: 12.5 } },
      { text: '行動につながる解釈', options: { bold: true, color: WHITE, fill: { color: INK }, fontSize: 12.5 } },
      { text: '次にとる具体的な行動', options: { bold: true, color: WHITE, fill: { color: INK }, fontSize: 12.5 } }
    ],
    ...rows.map((r, ri) => r.map((t, ci) => ({
      text: t,
      options: {
        bold: ci === 0, color: ci === 2 ? GREEN : (ci === 0 ? INK : TXT),
        fill: { color: ci === 0 ? SOFT2 : (ri % 2 ? SOFT : WHITE) }, fontSize: 12.5
      }
    })))
  ], {
    x: 0.85, y: 2.15, w: 11.6, colW: [2.7, 4.85, 4.05],
    rowH: 0.6, border: { pt: 0.75, color: LINE }, fontFace: F, valign: 'middle', align: 'left'
  });
  tx(s, '翻訳のルール：「自分がコントロールできる言葉」に変えるまで、書き直し続けること。', {
    x: 0.85, y: 6.45, w: 11.5, h: 0.4, fontSize: 13.5, bold: true, color: INK
  });
  s.addNotes('【48:15–49:15】\n参加者に自分の直近の出来事を1つ出してもらい、その場で3列目まで一緒に埋める。\nライブで翻訳して見せると、この原則の実用性が一気に伝わる。');
}

{
  const s = slideLight();
  head(s, 'R｜REFRAME　重要', 'この考え方を使ってはいけない場面', '自分を責める道具にした瞬間、この原則は毒に変わります');
  card(s, 0.85, 2.15, 5.65, 3.55, 'EAF2ED', GREEN);
  tx(s, '使ってよい領域', { x: 1.2, y: 2.4, w: 4.9, h: 0.4, fontSize: 18, bold: true, color: GREEN });
  tx(s, li([
    '自分の判断・行動が関与している出来事',
    '仕事、人間関係、成果、習慣',
    '次に自分が動けば変えられること'
  ]), { x: 1.2, y: 2.95, w: 4.95, h: 1.6, fontSize: 13, color: TXT, fontFace: F, isTextBox: true, margin: 0, paraSpaceAfter: 11, lineSpacing: 19 });
  tx(s, 'ここでは「解釈」が最強の武器になります。', { x: 1.2, y: 4.95, w: 4.95, h: 0.5, fontSize: 13, bold: true, color: GREEN, lineSpacing: 20 });
  card(s, 6.8, 2.15, 5.65, 3.55, 'F7EEED', RED);
  tx(s, '使ってはいけない領域', { x: 7.15, y: 2.4, w: 4.9, h: 0.4, fontSize: 18, bold: true, color: RED });
  tx(s, li([
    '災害・事故・病気',
    '犯罪・ハラスメント・暴力',
    '構造的な不公平、他者の加害行為'
  ]), { x: 7.15, y: 2.95, w: 4.95, h: 1.6, fontSize: 13, color: TXT, fontFace: F, isTextBox: true, margin: 0, paraSpaceAfter: 11, lineSpacing: 19 });
  tx(s, 'ここで必要なのは「解釈」ではなく「対処」。\n逃げる・助けを求める・記録して相談するが正解です。', {
    x: 7.15, y: 4.85, w: 4.95, h: 0.7, fontSize: 13, bold: true, color: RED, lineSpacing: 20
  });
  card(s, 0.85, 5.95, 11.6, 0.85, INK, INK);
  tx(s, 'この原則は、自分を責めるための道具ではありません。前に進むための道具です。', {
    x: 1.2, y: 5.95, w: 10.9, h: 0.85, fontSize: 16, bold: true, color: WHITE, valign: 'middle'
  });
  s.addNotes('【49:15–50:15】\nこのスライドを入れることで、理論全体の信頼性が上がる。\n「何でも自己責任」と言う指導者との差別化がここで完成する。省略しないこと。');
}

/* =========================================================
   SECTION T — Trust（有益性のバランス / Win-Win）
   ========================================================= */
section('T', '06', '信頼を積む', 'TRUST  &  WIN-WIN', '人は「正しいこと」では動きません。\n「自分の得」で動きます。\nだから、相手の得を先に設計します。');

{
  const s = slideLight();
  head(s, 'T｜TRUST', '有益性のバランス', '関係が続くかどうかは、天秤がどちらに傾いているかで決まります');
  const b = [
    { t: 'Give ＞ Take', s: '関係は伸びる', d: '相手に残る価値が大きい。紹介・再依頼・信用が返ってくる。', c: GREEN, f: 'EAF2ED' },
    { t: 'Give ＝ Take', s: 'ただの取引', d: '続くが、広がらない。価格でしか比較されなくなる。', c: GOLD, f: 'FBF3E4' },
    { t: 'Give ＜ Take', s: '関係は切れる', d: '一度は取れても二度目がない。評判が先に減っていく。', c: RED, f: 'F7EEED' }
  ];
  b.forEach((o, i) => {
    const x = 0.85 + i * 3.95;
    card(s, x, 2.15, 3.65, 2.6, o.f, o.c);
    tx(s, o.t, { x: x + 0.3, y: 2.42, w: 3.05, h: 0.5, fontSize: 22, bold: true, color: o.c, fontFace: 'Arial' });
    tx(s, o.s, { x: x + 0.3, y: 3.0, w: 3.05, h: 0.4, fontSize: 16, bold: true, color: INK });
    tx(s, o.d, { x: x + 0.3, y: 3.5, w: 3.08, h: 1.05, fontSize: 12.5, color: MUTED, lineSpacing: 19 });
  });
  card(s, 0.85, 5.0, 11.6, 1.75, INK, INK);
  tx(s, 'なぜ先に出すのか', { x: 1.2, y: 5.2, w: 4.5, h: 0.35, fontSize: 13, bold: true, color: GOLD, charSpacing: 1.5 });
  tx(s, '相手は「あなたが正しいか」ではなく「自分にとって得か」で判断します。\n先に価値を渡した人だけが、判断の土俵に乗ることができます。長期で成功している人に例外はありません。', {
    x: 1.2, y: 5.6, w: 10.9, h: 0.95, fontSize: 14.5, color: WHITE, lineSpacing: 24
  });
  s.addNotes('【50:15–52:00】\n「ギブは自己犠牲ではない」と明確に。搾取される人との違いは、次のスライド（No Deal）で回収する。');
}

{
  const s = slideLight();
  head(s, 'T｜TRUST', 'Win-Winの法則と、5つ目の選択肢', '「組まない勇気」を持って初めて、Win-Winは選べます');
  const q = [
    { t: 'Win - Win', d: '両者が得をする。時間をかける価値がある唯一の関係。', c: GREEN, f: 'EAF2ED', x: 0.85, y: 2.15 },
    { t: 'Win - Lose', d: '自分だけ得。短期で終わり、評判を削る。', c: GOLD, f: SOFT, x: 4.8, y: 2.15 },
    { t: 'Lose - Win', d: '相手だけ得。続けると自分が消耗して撤退する。', c: GOLD, f: SOFT, x: 0.85, y: 4.15 },
    { t: 'Lose - Lose', d: '意地の張り合い。最も避けるべき状態。', c: RED, f: 'F7EEED', x: 4.8, y: 4.15 }
  ];
  q.forEach(o => {
    card(s, o.x, o.y, 3.7, 1.8, o.f, o.c === GREEN ? GREEN : LINE);
    tx(s, o.t, { x: o.x + 0.3, y: o.y + 0.25, w: 3.1, h: 0.45, fontSize: 19, bold: true, color: o.c, fontFace: 'Arial' });
    tx(s, o.d, { x: o.x + 0.3, y: o.y + 0.8, w: 3.12, h: 0.85, fontSize: 12.5, color: TXT, lineSpacing: 19 });
  });
  card(s, 8.9, 2.15, 3.55, 3.8, INK, INK);
  tx(s, '5つ目', { x: 9.25, y: 2.4, w: 2.9, h: 0.3, fontSize: 11.5, bold: true, color: GOLD, charSpacing: 2 });
  tx(s, 'No Deal', { x: 9.25, y: 2.75, w: 2.9, h: 0.55, fontSize: 26, bold: true, color: WHITE, fontFace: 'Arial' });
  tx(s, '組まない、という選択', { x: 9.25, y: 3.35, w: 2.95, h: 0.35, fontSize: 14, bold: true, color: GOLDL });
  tx(s, 'Win-Winにできないと分かった相手とは、無理に組まない。\n\nこの選択肢を持っている人だけが、消耗せずにGiveを続けられます。', {
    x: 9.25, y: 3.85, w: 2.95, h: 1.9, fontSize: 12.5, color: '9FB2C6', lineSpacing: 20
  });
  tx(s, '判断基準：3回Giveして、1度も返ってこない関係は、No Dealでよい。', {
    x: 0.85, y: 6.2, w: 11.5, h: 0.4, fontSize: 14, bold: true, color: INK
  });
  s.addNotes('【52:00–53:00】\nNo Dealの説明が、この章の信頼性を決める。「良い人でいろ」という話ではないと明示する。\n3回ルールは目安。数字を出すと実務で使いやすくなる。');
}

{
  const s = slideLight();
  head(s, 'T｜TRUST', '信頼は、複利で増える', '1日1%の差が、1年で37倍の差になります');
  s.addChart(pres.ChartType.line, [
    { name: '毎日 +1%', labels: ['0日', '60日', '120日', '180日', '240日', '300日', '365日'], values: [1, 1.8, 3.3, 6.0, 10.8, 19.8, 37.8] },
    { name: '現状維持', labels: ['0日', '60日', '120日', '180日', '240日', '300日', '365日'], values: [1, 1, 1, 1, 1, 1, 1] },
    { name: '毎日 −1%', labels: ['0日', '60日', '120日', '180日', '240日', '300日', '365日'], values: [1, 0.55, 0.30, 0.16, 0.09, 0.05, 0.03] }
  ], {
    x: 0.85, y: 2.15, w: 6.9, h: 4.2,
    chartColors: [GREEN, MUTED, RED], lineDataSymbol: 'circle', lineDataSymbolSize: 6, lineSize: 2.5,
    showTitle: true, title: '1年後にどれだけ差がつくか（初日を1とした場合）',
    titleFontSize: 12.5, titleColor: INK, titleFontFace: F,
    showLegend: true, legendPos: 'b', legendFontFace: F, legendFontSize: 11, legendColor: TXT,
    catAxisLabelColor: MUTED, valAxisLabelColor: MUTED, catAxisLabelFontFace: F, valAxisLabelFontFace: F,
    catAxisLabelFontSize: 10.5, valAxisLabelFontSize: 10,
    valGridLine: { color: 'E8EDF2', size: 1 }, catGridLine: { style: 'none' }
  });
  card(s, 8.05, 2.15, 4.4, 4.2, SOFT);
  tx(s, '信頼残高の考え方', { x: 8.4, y: 2.4, w: 3.7, h: 0.35, fontSize: 13, bold: true, color: GOLD, charSpacing: 1.5 });
  [
    { t: '入金', d: '約束を守る／先に渡す／期待を少し超える', c: GREEN },
    { t: '出金', d: '遅れる／言い訳する／連絡しない', c: RED },
    { t: '複利', d: '残高が増えるほど、次の機会が向こうから来る', c: TEAL }
  ].forEach((o, i) => {
    const y = 2.9 + i * 1.1;
    card(s, 8.4, y, 3.7, 0.95, WHITE, LINE);
    tx(s, o.t, { x: 8.62, y: y + 0.1, w: 1.0, h: 0.35, fontSize: 14, bold: true, color: o.c });
    tx(s, o.d, { x: 8.62, y: y + 0.45, w: 3.3, h: 0.45, fontSize: 11.5, color: TXT, lineSpacing: 17 });
  });
  tx(s, '短期の成果より、残高。ここが逆転すると、努力が効かなくなります。', {
    x: 8.4, y: 6.25, w: 4.0, h: 0.55, fontSize: 11.5, color: MUTED, lineSpacing: 17
  });
  s.addNotes('【53:00–54:00】\n1.01^365 = 37.8、0.99^365 = 0.03。この2つの数字だけ覚えてもらう。\n「毎日1%」は行動でも信頼でも同じ、と両方に効かせる。');
}

{
  const s = slideLight();
  head(s, 'T｜TRUST', '自分の有益性を、数値化する', '値引きではなく、価値の見える化。ここで報酬が決まります');
  const m = [
    { t: '金額', q: '相手はいくら増える／減らせるか', e: '例：月20万円のコスト削減', c: GOLD },
    { t: '時間', q: '相手は何時間手に入るか', e: '例：週10時間の作業を代替', c: TEAL },
    { t: 'リスク', q: '相手はどんな損失を避けられるか', e: '例：採用失敗1件＝300万円の回避', c: INK3 },
    { t: '確率', q: '相手の成功確率をどれだけ上げるか', e: '例：成約率を12%→20%に', c: GREEN }
  ];
  m.forEach((o, i) => {
    const x = 0.85 + i * 2.95;
    card(s, x, 2.15, 2.7, 2.9, SOFT);
    s.addShape(pres.ShapeType.roundRect, { x: x + 0.25, y: 2.4, w: 1.15, h: 0.42, rectRadius: 0.05, fill: { color: o.c }, line: { width: 0 } });
    tx(s, o.t, { x: x + 0.25, y: 2.4, w: 1.15, h: 0.42, fontSize: 13, bold: true, color: WHITE, align: 'center', valign: 'middle' });
    tx(s, o.q, { x: x + 0.25, y: 2.98, w: 2.2, h: 0.85, fontSize: 12.5, bold: true, color: INK, lineSpacing: 19 });
    tx(s, o.e, { x: x + 0.25, y: 3.95, w: 2.25, h: 0.85, fontSize: 11.5, color: MUTED, lineSpacing: 17 });
  });
  card(s, 0.85, 5.3, 11.6, 1.45, INK, INK);
  tx(s, '価格 ＜ 提供価値', { x: 1.2, y: 5.5, w: 3.6, h: 0.55, fontSize: 24, bold: true, color: GOLD, valign: 'middle' });
  tx(s, 'この不等号が成立している限り、値引きの必要はありません。\n売れないときに下げるべきは価格ではなく、価値が伝わっていないという伝え方の問題です。', {
    x: 5.0, y: 5.5, w: 7.1, h: 1.0, fontSize: 13.5, color: WHITE, valign: 'middle', lineSpacing: 21
  });
  s.addNotes('【60分版では省略／配布資料で補完】\n「自分の価値を数字で言えますか？」と問う。ほとんど言えない。\nここが言えるようになると、報酬交渉も営業も、根拠を持って話せるようになる。');
}

/* =========================================================
   統合パート
   ========================================================= */
{
  const s = slideDark();
  ghostLetter(s, '∞');
  bullseye(s, 11.3, 5.9, 1.15, INK2);
  tx(s, 'INTEGRATION', { x: 0.85, y: 2.05, w: 7.6, h: 0.32, fontSize: 13, bold: true, color: GOLD, charSpacing: 2.5 });
  tx(s, '6つを、ひとつに', { x: 0.85, y: 2.45, w: 7.6, h: 0.95, fontSize: 42, bold: true, color: WHITE });
  tx(s, 'PUT  IT  TOGETHER', { x: 0.85, y: 3.45, w: 7.6, h: 0.4, fontSize: 16, color: GOLDL, charSpacing: 1.5 });
  s.addShape(pres.ShapeType.rect, { x: 0.85, y: 4.05, w: 1.5, h: 0.03, fill: { color: GOLD }, line: { width: 0 } });
  tx(s, '原則は、つなげて初めて機能します。\nここからは、明日からの回し方の話をします。', {
    x: 0.85, y: 4.35, w: 7.4, h: 1.0, fontSize: 15, color: 'C3D0DE', lineSpacing: 26
  });
  s.addNotes('【54:00–54:30】\n短く。「ここからが本番、持ち帰り編です」と切り替える。');
}

{
  const s = slideLight();
  head(s, 'INTEGRATION', '6原則は、1年をこう回す', '一度きりの直線ではなく、回り続けるループです');
  const ring = [
    { L: 'R', t: '逆算する', d: '年始・四半期', c: GOLD },
    { L: 'A', t: '現在地を知る', d: '四半期はじめ', c: TEAL },
    { L: 'P', t: '回す', d: '毎週', c: INK3 },
    { L: 'O', t: '失敗を越える', d: 'つまずいた日', c: RED },
    { L: 'R', t: '解釈を変える', d: '落ち込んだ日', c: GREEN },
    { L: 'T', t: '信頼を積む', d: '毎日', c: '7A5AA8' }
  ];
  ring.forEach((o, i) => {
    const x = 0.85 + i * 2.0;
    card(s, x, 2.4, 1.75, 2.5, SOFT);
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.5, y: 2.65, w: 0.75, h: 0.75, fill: { color: o.c }, line: { width: 0 } });
    tx(s, o.L, { x: x + 0.5, y: 2.65, w: 0.75, h: 0.75, fontSize: 26, bold: true, color: WHITE, align: 'center', valign: 'middle', fontFace: 'Arial' });
    tx(s, o.t, { x: x + 0.1, y: 3.55, w: 1.55, h: 0.65, fontSize: 13, bold: true, color: INK, align: 'center', lineSpacing: 19 });
    tx(s, o.d, { x: x + 0.1, y: 4.25, w: 1.55, h: 0.4, fontSize: 11, color: o.c, align: 'center', bold: true });
    if (i < 5) tx(s, '▶', { x: x + 1.75, y: 2.4, w: 0.25, h: 2.5, fontSize: 13, color: LINE, align: 'center', valign: 'middle' });
  });
  s.addShape(pres.ShapeType.line, { x: 1.72, y: 5.15, w: 9.98, h: 0, line: { color: GOLD, width: 2, endArrowType: 'triangle', beginArrowType: 'triangle' } });
  tx(s, 'ループする（四半期ごとにRへ戻る）', { x: 4.0, y: 5.25, w: 5.4, h: 0.35, fontSize: 12, bold: true, color: GOLD, align: 'center' });
  card(s, 0.85, 5.8, 11.6, 0.95, INK, INK);
  tx(s, '毎週 P を回し、つまずいたら O と R を使い、T を毎日積む。四半期ごとに R と A に戻る。これだけです。', {
    x: 1.2, y: 5.8, w: 10.9, h: 0.95, fontSize: 15.5, bold: true, color: WHITE, valign: 'middle'
  });
  s.addNotes('【54:30–55:30】\n1枚で全体を思い出せるスライド。配布資料ではこのページを最初に持ってくるのも有効。');
}

{
  const s = slideLight();
  head(s, 'INTEGRATION', '90日実行プラン', '最初の90日で、型が身につくかどうかが決まります');
  const ph = [
    { p: 'Day 1-7', t: '設計する', c: GOLD, b: ['ゴールを7項目で確定させる', '逆算表を「今日」まで埋める', '週次30分をカレンダーに固定'] },
    { p: 'Day 8-30', t: '回し始める', c: TEAL, b: ['先行指標を1つだけ数え続ける', '週次検証を4回、必ず実施', '記録は3行だけ。完璧を狙わない'] },
    { p: 'Day 31-60', t: '調整する', c: INK3, b: ['当たった仮説の量を増やす', '外れた仮説は変数を1つ変える', '5つの質問で失敗を1件、資産化'] },
    { p: 'Day 61-90', t: '仕組みにする', c: GREEN, b: ['うまくいった手順を文書にする', '習慣化できたものを固定する', '次の90日のゴールを逆算する'] }
  ];
  ph.forEach((o, i) => {
    const x = 0.85 + i * 2.95;
    card(s, x, 2.15, 2.7, 4.15, SOFT);
    s.addShape(pres.ShapeType.roundRect, { x: x + 0.25, y: 2.4, w: 1.55, h: 0.4, rectRadius: 0.05, fill: { color: o.c }, line: { width: 0 } });
    tx(s, o.p, { x: x + 0.25, y: 2.4, w: 1.55, h: 0.4, fontSize: 12, bold: true, color: WHITE, align: 'center', valign: 'middle', fontFace: 'Arial' });
    tx(s, o.t, { x: x + 0.25, y: 2.95, w: 2.2, h: 0.4, fontSize: 18, bold: true, color: INK });
    tx(s, li(o.b), { x: x + 0.25, y: 3.5, w: 2.25, h: 2.55, fontSize: 12, color: TXT, fontFace: F, isTextBox: true, margin: 0, paraSpaceAfter: 11, lineSpacing: 18 });
  });
  tx(s, '90日が終わったら、必ず R に戻る。これを4回繰り返すと1年が終わります。', {
    x: 0.85, y: 6.45, w: 11.5, h: 0.4, fontSize: 13.5, bold: true, color: INK
  });
  s.addNotes('【55:30–56:30】\nこの1枚を配布資料の巻末に入れる。参加者が持ち帰る「地図」になる。');
}

{
  const s = slideLight();
  head(s, 'INTEGRATION', 'よくある3つの脱線と、処方箋', 'ここで落ちる人が、圧倒的に多い');
  const d = [
    { n: '1', t: '情報収集で満足する', s: '学んだ時点で、進んだ気になってしまう', f: 'インプット2：アウトプット8。学んだら24時間以内に1つ実行する。', c: GOLD },
    { n: '2', t: '完璧を待つ', s: '準備が終わらず、いつまでも始まらない', f: '60点で出して、直す。市場の反応だけが正解を知っている。', c: TEAL },
    { n: '3', t: '一人で抱える', s: '誰も見ていないので、静かに消えていく', f: '進捗を報告する相手を1人決める。第三者の目が継続率を上げる。', c: GREEN }
  ];
  d.forEach((o, i) => {
    const y = 2.15 + i * 1.45;
    card(s, 0.85, y, 11.6, 1.25, SOFT);
    numDot(s, 1.15, y + 0.32, 0.6, o.n, RED, WHITE);
    tx(s, o.t, { x: 1.95, y: y + 0.18, w: 3.4, h: 0.45, fontSize: 18, bold: true, color: INK });
    tx(s, o.s, { x: 1.95, y: y + 0.68, w: 3.6, h: 0.4, fontSize: 12, color: MUTED });
    s.addShape(pres.ShapeType.line, { x: 5.7, y: y + 0.62, w: 0.35, h: 0, line: { color: o.c, width: 2, endArrowType: 'triangle' } });
    card(s, 6.25, y + 0.18, 5.95, 0.88, WHITE, o.c);
    tx(s, o.f, { x: 6.5, y: y + 0.18, w: 5.5, h: 0.88, fontSize: 13, bold: true, color: INK, valign: 'middle', lineSpacing: 19 });
  });
  s.addNotes('【60分版では省略／配布資料で補完】\n「今日ここに来た時点で①の罠に片足を入れています」と言うと笑いが起きる。\nだから演習をやった、と回収する。');
}

{
  const s = slideLight();
  head(s, 'INTEGRATION', 'チェックリスト', '意志の力ではなく、リズムで続けます');
  const cl = [
    {
      t: '毎日（3分）', c: GREEN, b: ['先行指標を1つ記録した', '相手にGiveを1つした', 'ネガティブを1つ翻訳した']
    },
    {
      t: '毎週（30分）', c: GOLD, b: ['仮説と結果の差を見た', '続ける／変える／やめるを決めた', '来週の数値目標を書いた', '進捗を1人に報告した']
    },
    {
      t: '毎月（60分）', c: TEAL, b: ['KPIの取り方自体を疑った', '失敗を1件、5つの質問で資産化した', 'やめることを1つ決めた']
    },
    {
      t: '四半期（半日）', c: INK3, b: ['ゴールを7項目で再チェック', '逆算表を引き直した', '現在地（12ステップ）を再分析した']
    }
  ];
  cl.forEach((o, i) => {
    const x = 0.85 + (i % 2) * 5.95, y = 2.15 + Math.floor(i / 2) * 2.3;
    card(s, x, y, 5.65, 2.05, SOFT);
    s.addShape(pres.ShapeType.roundRect, { x: x + 0.3, y: y + 0.22, w: 1.9, h: 0.42, rectRadius: 0.05, fill: { color: o.c }, line: { width: 0 } });
    tx(s, o.t, { x: x + 0.3, y: y + 0.22, w: 1.9, h: 0.42, fontSize: 13, bold: true, color: WHITE, align: 'center', valign: 'middle' });
    o.b.forEach((t, j) => {
      const yy = y + 0.78 + j * 0.32;
      s.addShape(pres.ShapeType.roundRect, { x: x + 0.32, y: yy + 0.03, w: 0.2, h: 0.2, rectRadius: 0.03, fill: { color: WHITE }, line: { color: o.c, width: 1.2 } });
      tx(s, t, { x: x + 0.65, y: yy - 0.02, w: 4.85, h: 0.3, fontSize: 12, color: TXT, valign: 'middle' });
    });
  });
  s.addNotes('【60分版では省略／配布資料で補完】\n配布用に印刷して渡すページ。「冷蔵庫に貼ってください」レベルの実用性を狙う。');
}

{
  const s = slideDark();
  bullseye(s, 11.3, 5.8, 1.2, INK2);
  tx(s, 'HOW TO VERIFY', { x: 0.85, y: 1.7, w: 8, h: 0.32, fontSize: 12.5, bold: true, color: GOLD, charSpacing: 2.5 });
  tx(s, '信じる前に、試してください。', { x: 0.85, y: 2.1, w: 11.4, h: 0.8, fontSize: 36, bold: true, color: WHITE });
  tx(s, '30日で、この理論が自分に効くかどうかを判定する方法', { x: 0.85, y: 2.95, w: 11.4, h: 0.4, fontSize: 15, color: GOLDL });
  [
    'ゴールを1つ、7項目チェックを通して書く',
    '週次30分の検証を、4回まわす（＝4週間）',
    'つまずいたら、5つの質問で記録する',
    '30日後、「先月より前に進んだか」を判定する'
  ].forEach((t, i) => {
    const y = 3.6 + i * 0.68;
    numDot(s, 0.85, y, 0.46, i + 1, GOLD, INK);
    tx(s, t, { x: 1.5, y: y - 0.05, w: 10.3, h: 0.55, fontSize: 16.5, color: WHITE, valign: 'middle' });
  });
  card(s, 0.85, 6.15, 11.6, 0.7, INK2, INK2);
  tx(s, '効果がなければ、捨ててください。検証できることが、この理論の誠実さです。', {
    x: 1.2, y: 6.15, w: 10.9, h: 0.7, fontSize: 15, bold: true, color: GOLDL, valign: 'middle'
  });
  s.addNotes('【56:30–57:30】\n本日の中で最も「信頼を得る」スライド。売り込みの直前に、あえて「捨ててください」と言う。\nここで押さないことが、結果的にいちばん効く。');
}

{
  const s = slideLight();
  head(s, 'RESULTS', '実践した人に起きた変化', '※ ご自身の事例に必ず差し替えてください');
  const cs = [
    { n: 'CASE 01', t: '【業種・立場を記入】', b: ['Before：【状態・数値を記入】', 'やったこと：【どの原則をどう使ったか】', 'After：【期間と数値の変化を記入】'] },
    { n: 'CASE 02', t: '【業種・立場を記入】', b: ['Before：【状態・数値を記入】', 'やったこと：【どの原則をどう使ったか】', 'After：【期間と数値の変化を記入】'] },
    { n: 'CASE 03', t: '【業種・立場を記入】', b: ['Before：【状態・数値を記入】', 'やったこと：【どの原則をどう使ったか】', 'After：【期間と数値の変化を記入】'] }
  ];
  cs.forEach((o, i) => {
    const x = 0.85 + i * 3.95;
    card(s, x, 2.15, 3.65, 3.6, SOFT);
    tx(s, o.n, { x: x + 0.3, y: 2.4, w: 3.0, h: 0.3, fontSize: 11, bold: true, color: GOLD, charSpacing: 2 });
    tx(s, o.t, { x: x + 0.3, y: 2.75, w: 3.05, h: 0.42, fontSize: 16, bold: true, color: INK });
    tx(s, li(o.b), { x: x + 0.3, y: 3.3, w: 3.08, h: 2.2, fontSize: 12, color: TXT, fontFace: F, isTextBox: true, margin: 0, paraSpaceAfter: 12, lineSpacing: 18 });
  });
  card(s, 0.85, 5.95, 11.6, 0.8, 'F7EEED', RED);
  tx(s, '注意：数字を盛らないこと。等身大の事例のほうが、はるかに信頼されます。実名・数値の掲載は必ず本人の許可を取ってください。', {
    x: 1.2, y: 5.95, w: 10.9, h: 0.8, fontSize: 12.5, bold: true, color: RED, valign: 'middle'
  });
  s.addNotes('【57:30–58:00】\n事例は3つで十分。参加者の属性に近いものを1つは必ず入れる。\n許可のない事例は絶対に出さない。');
}

{
  const s = slideLight();
  head(s, 'NEXT ACTION', '24時間以内に、ひとつだけ', '今日聞いたことの99%は、明日には消えます。だから1つだけ決めます');
  card(s, 0.85, 2.2, 11.6, 2.0, INK, INK);
  tx(s, '私が24時間以内にやることは——', { x: 1.25, y: 2.45, w: 10.9, h: 0.4, fontSize: 14, color: GOLD });
  s.addShape(pres.ShapeType.line, { x: 1.25, y: 3.55, w: 10.5, h: 0, line: { color: INK3, width: 1.5 } });
  tx(s, '（ここに、今日決めた最初の1歩を書いてください）', { x: 1.25, y: 3.05, w: 10.5, h: 0.45, fontSize: 15, color: INK3, italic: true });
  const tips = [
    { t: '小さくする', d: '5分で終わる大きさまで割る。大きい一歩は踏み出せない。' },
    { t: '日時を決める', d: '「いつか」ではなく「明日の何時に」。カレンダーに入れる。' },
    { t: '誰かに言う', d: '宣言した相手がいるだけで、実行率は大きく変わる。' }
  ];
  tips.forEach((o, i) => {
    const x = 0.85 + i * 3.95;
    card(s, x, 4.5, 3.65, 1.75, SOFT);
    tx(s, o.t, { x: x + 0.3, y: 4.72, w: 3.0, h: 0.4, fontSize: 17, bold: true, color: GOLD });
    tx(s, o.d, { x: x + 0.3, y: 5.2, w: 3.08, h: 0.85, fontSize: 12.5, color: TXT, lineSpacing: 19 });
  });
  tx(s, '今日の価値は、明日の朝に何をするかで決まります。', {
    x: 0.85, y: 6.45, w: 11.5, h: 0.4, fontSize: 15, bold: true, color: INK
  });
  s.addNotes('【58:00–59:00】\n実際にペンを持たせて書かせる。書いた人に「何を書きましたか」と2〜3人聞く。\nここで宣言が生まれると、後日の相談につながりやすい。');
}

{
  const s = slideLight();
  head(s, 'SUPPORT', '一緒に走る、という選択肢', '独学で回せる人は、そのまま進んでください。伴走が要る人だけ、どうぞ');
  const menu = [
    { t: '単発セッション', d: '90分で、ゴール設定と逆算表を一緒に完成させます。', p: '【価格を記入】', f: ['ゴールの7項目化', '逆算表の作成', '最初の90日プラン'], c: TEAL },
    { t: '90日伴走', d: '週次でPDCAを一緒に回します。型が身につくまで。', p: '【価格を記入】', f: ['週1回30分の検証', 'チャットでの随時相談', '90日後の再設計'], c: GOLD, rec: true },
    { t: '月次アドバイザリー', d: '型がある方向け。四半期の戦略を一緒に見直します。', p: '【価格を記入】', f: ['月1回60分', '四半期の再逆算', '意思決定の壁打ち'], c: INK3 }
  ];
  menu.forEach((o, i) => {
    const x = 0.85 + i * 3.95;
    card(s, x, 2.1, 3.65, 4.25, o.rec ? 'FBF3E4' : SOFT, o.rec ? GOLD : LINE);
    if (o.rec) {
      s.addShape(pres.ShapeType.roundRect, { x: x + 2.35, y: 2.28, w: 1.05, h: 0.32, rectRadius: 0.05, fill: { color: GOLD }, line: { width: 0 } });
      tx(s, 'おすすめ', { x: x + 2.35, y: 2.28, w: 1.05, h: 0.32, fontSize: 10, bold: true, color: WHITE, align: 'center', valign: 'middle' });
    }
    tx(s, o.t, { x: x + 0.3, y: 2.32, w: o.rec ? 2.0 : 3.05, h: 0.45, fontSize: 17, bold: true, color: INK });
    tx(s, o.d, { x: x + 0.3, y: 2.88, w: 3.08, h: 0.8, fontSize: 12, color: MUTED, lineSpacing: 19 });
    tx(s, o.p, { x: x + 0.3, y: 3.75, w: 3.05, h: 0.5, fontSize: 20, bold: true, color: o.c });
    s.addShape(pres.ShapeType.rect, { x: x + 0.3, y: 4.35, w: 3.05, h: 0.02, fill: { color: LINE }, line: { width: 0 } });
    tx(s, li(o.f), { x: x + 0.3, y: 4.5, w: 3.08, h: 1.6, fontSize: 12, color: TXT, fontFace: F, isTextBox: true, margin: 0, paraSpaceAfter: 10, lineSpacing: 18 });
  });
  tx(s, '合わないと感じたら、断ってください。No Deal も、正しい選択です。', {
    x: 0.85, y: 6.45, w: 11.5, h: 0.4, fontSize: 13.5, bold: true, color: INK
  });
  s.addNotes('【59:00–59:30】\n売り込みは1枚だけ。押さない。T章のNo Dealを自分に適用して見せると、一貫性が伝わる。\n価格は必ず事前に決めて記入しておくこと。');
}

{
  const s = slideDark();
  bullseye(s, 10.55, 3.9, 2.3, INK2);
  s.addShape(pres.ShapeType.line, { x: 6.9, y: 3.95, w: 3.6, h: 2.25, flipV: true, line: { color: GOLD, width: 2.25, endArrowType: 'triangle' } });
  tx(s, 'THANK YOU', { x: 0.85, y: 1.7, w: 7.5, h: 0.32, fontSize: 12.5, bold: true, color: GOLD, charSpacing: 3 });
  tx(s, '人生は、寄り道を\nしていられるほど長くない。', {
    x: 0.85, y: 2.15, w: 7.9, h: 1.8, fontSize: 34, bold: true, color: WHITE, lineSpacing: 50
  });
  tx(s, '最短ルートで、駆け抜けてください。', { x: 0.85, y: 4.05, w: 7.9, h: 0.5, fontSize: 20, color: GOLDL });
  s.addShape(pres.ShapeType.rect, { x: 0.85, y: 4.75, w: 1.5, h: 0.03, fill: { color: GOLD }, line: { width: 0 } });
  tx(s, 'ご質問をどうぞ', { x: 0.85, y: 5.05, w: 7.9, h: 0.45, fontSize: 18, bold: true, color: WHITE });
  tx(s, '【氏名】　／　【メール】　／　【SNS・連絡先】', { x: 0.85, y: 5.6, w: 7.9, h: 0.35, fontSize: 13, color: 'C3D0DE' });
  tx(s, '本日の資料・チェックリストは【配布方法を記入】でお渡しします。', { x: 0.85, y: 6.05, w: 7.9, h: 0.35, fontSize: 12, color: INK3 });
  s.addNotes('【59:30–60:00】\nQ&Aは8分想定。よくある質問：\n・目標が見つからない → まず「嫌なこと」を書き出す、そこから反転させる\n・続かない → 目標が他人のものになっていないか確認\n・時間がない → 32時間スライドに戻る');
}

/* ---------- 付録：運用ガイド ---------- */
{
  const s = slideLight();
  head(s, 'APPENDIX', '講師用：時間配分と短縮版の作り方', '同じ資料で、30分／45分／60分／90分に対応できます');
  const t = [
    ['60分（標準）', 'ノートの時間表どおり。「60分版では省略」と書かれた7枚を飛ばす（逆算プラン例／STEP4-6／個人への当てはめ／OODA／有益性の数値化／3つの脱線／チェックリスト）。省略分は配布資料で補います。', 'この資料の基本形'],
    ['75分（フル）', '全ページを投影。省略した7枚を戻し、演習を各5分に拡張する。', '社内研修・勉強会'],
    ['45分', '上記に加えて、O章とT章を各2枚に圧縮。演習は①のみ（4分）。', 'セミナー登壇枠'],
    ['30分', 'R章とP章のみ。A章は12ステップ一覧の1枚だけ見せる。演習なし、Q&A 5分。', '説明会・初回接触'],
    ['90分', '全ページ＋各演習8分。演習後に必ず発表とフィードバックの時間を取る。', 'ワークショップ形式']
  ];
  s.addTable([
    ['形式', '構成の調整', '想定シーン'].map(x => ({ text: x, options: { bold: true, color: WHITE, fill: { color: INK }, fontSize: 12.5 } })),
    ...t.map((r, ri) => r.map((x, ci) => ({
      text: x, options: { bold: ci === 0, color: TXT, fill: { color: ci === 0 ? SOFT2 : (ri % 2 ? SOFT : WHITE) }, fontSize: 12.5 }
    })))
  ], { x: 0.85, y: 2.15, w: 11.6, colW: [2.0, 6.6, 3.0], rowH: 0.55, border: { pt: 0.75, color: LINE }, fontFace: F, valign: 'middle' });
  card(s, 0.85, 5.15, 11.6, 1.55, SOFT);
  tx(s, '事前に必ず記入するページ', { x: 1.2, y: 5.35, w: 5, h: 0.32, fontSize: 12.5, bold: true, color: GOLD, charSpacing: 1.5 });
  tx(s, '① 表紙（講師名・肩書）　② 自己紹介と実績の数字　③ 実践者の変化（3事例）　④ 伴走メニューの価格　⑤ 最終ページの連絡先\n【　】で囲まれた箇所がすべて記入欄です。ここが空欄のまま話すと、説得力が大きく落ちます。', {
    x: 1.2, y: 5.7, w: 10.9, h: 0.85, fontSize: 12.5, color: TXT, lineSpacing: 20
  });
  s.addNotes('このページは投影しません。講師用の付録です。');
}

/* =========================================================
   footers + write
   ========================================================= */
ALL.forEach(([s, dark], i) => {
  PAGE = i;
  foot(s, dark);
});

pres.writeFile({ fileName: process.argv[2] || '達成の6原則_RAPORTメソッド.pptx' })
  .then(f => console.log('WROTE:', f, '/ slides:', ALL.length));
