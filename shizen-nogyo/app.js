/* 自然農業シミュレーター — アプリ本体（依存なし・localStorage保存） */
(function () {
  'use strict';

  var CROPS = window.CROPS, GROW = window.GROW, TEMPS = window.TEMPS;
  var REASONS = window.REASONS, HEAVY = window.HEAVY_FAM;
  var SOIL = window.SOIL_TASKS, PRIN = window.SOIL_PRINCIPLES;
  var KEEP = window.KEEP || {}, SEED = window.SEED || {};
  var ROT = window.ROTATION || {}, PREP = window.PREP || {}, AH = window.AFTER_HARVEST || {};
  var GERM = window.GERM || {};
  var SOWLIM = window.SOW_LIMIT || {}, AFTNG = window.AFTER_NG || [], AFTGOOD = window.AFTER_GOOD || [];
  var SLIFE = window.SEED_LIFE || {};
  var ALIAS = window.ALIAS || {};

  /* 検索用：ひらがな→カタカナ、全角英数→半角、小文字化 */
  function norm(s) {
    return String(s)
      .replace(/[ぁ-ゖ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) + 0x60); })
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); })
      .replace(/[ー－―‐]/g, 'ー')
      .toLowerCase();
  }
  var CATS = ["果菜", "葉菜", "根菜", "豆", "イモ", "香味", "果樹", "緑肥", "染料"];
  /* うちの畑（記録・日誌をこの単位で紐づける） */
  var FIELDS = [
    { id: 'iizumi', name: '飯泉畑' },
    { id: 'n255', name: '255畑' }
  ];
  function fieldName_(id) {
    for (var i = 0; i < FIELDS.length; i++) if (FIELDS[i].id === id) return FIELDS[i].name;
    return '';
  }

  var app = document.getElementById('app');
  var now = new Date();
  var THIS_M = now.getMonth() + 1;

  /* ───────── ユーティリティ ───────── */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  function ymd(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function daysSince(s) {
    var p = new Date(s + 'T00:00:00');
    var t = new Date(); t.setHours(0, 0, 0, 0);
    return Math.floor((t - p) / 86400000) + 1;
  }
  function cropById(id) { for (var i = 0; i < CROPS.length; i++) if (CROPS[i].id === id) return CROPS[i]; return null; }
  function growById(id) { for (var i = 0; i < GROW.length; i++) if (GROW[i].id === id) return GROW[i]; return null; }

  var TABS = ['month', 'plan', 'mine', 'notes'];
  function tabFromHash() {
    var h = (location.hash || '').replace(/^#/, '');
    return TABS.indexOf(h) >= 0 ? h : 'month';
  }
  var hashLock = false;
  function goTab(t) {
    if (t !== 'notes') S.note = null;
    S.tab = t;
    if ((location.hash || '').replace(/^#/, '') !== t) { hashLock = true; location.hash = t; }
    render();
  }

  /* 旧名称のときに保存したデータを引き継ぐ（一度だけ動く） */
  (function migrate() {
    try {
      var pairs = [['yui-plan', 'shizen-plan'], ['yui-mine', 'shizen-mine']];
      for (var p = 0; p < pairs.length; p++) {
        var v = localStorage.getItem(pairs[p][0]);
        if (v === null) continue;
        if (localStorage.getItem(pairs[p][1]) === null) localStorage.setItem(pairs[p][1], v);
        localStorage.removeItem(pairs[p][0]);
      }
      for (var i = localStorage.length - 1; i >= 0; i--) {
        var k = localStorage.key(i);
        if (!k || k.indexOf('yui-soil-') !== 0) continue;
        var nk = 'shizen-soil-' + k.slice(9);
        if (localStorage.getItem(nk) === null) localStorage.setItem(nk, localStorage.getItem(k));
        localStorage.removeItem(k);
      }
    } catch (e) { }
  })();

  var S = {
    tab: tabFromHash(),
    soilMonth: THIS_M,
    pMonth: THIS_M,
    pMode: 'sow',
    pCat: null,
    pQ: '',
    focus: null,
    plan: load('shizen-plan', []),
    mine: load('shizen-mine', []),
    seeds: load('shizen-seeds', []),
    mSel: [],
    mQ: '',
    mineQ: '',
    mField: load('shizen-mfield', 'iizumi'),
    mStage: 'field',
    notes: null,
    note: null
  };

  /* 今日の日付表示 */
  (function () {
    var w = ['日', '月', '火', '水', '木', '金', '土'][now.getDay()];
    document.getElementById('today').textContent =
      now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日（' + w + '）';
  })();

  /* ───────── 共通パーツ ───────── */
  function calRow(months, kind) {
    var h = '<div class="cal cal-' + kind + '">';
    for (var m = 1; m <= 12; m++) {
      h += '<div class="m' + (months.indexOf(m) >= 0 ? ' on' : '') + '">' + m + '</div>';
    }
    return h + '</div>';
  }

  /* 線画アイコン（絵文字は使わない） */
  function icon(n) {
    var d = {
      keep: '<path d="M4.8 8.4h14.4l-1.2 10.4a2 2 0 0 1-2 1.8H8a2 2 0 0 1-2-1.8L4.8 8.4Z"/><path d="M9 8.4V6.4a3 3 0 0 1 6 0v2"/>',
      seed: '<path d="M12 3.6c3.6 2 5.4 4.8 5.4 7.8a5.4 5.4 0 1 1-10.8 0c0-3 1.8-5.8 5.4-7.8Z"/><path d="M12 20.4v-5.8"/><path d="M12 16.4c-1.7 0-2.9-1.2-2.9-2.9 1.7 0 2.9 1.2 2.9 2.9Z"/>',
      sprout: '<path d="M12 21v-8.6"/><path d="M12 14.4C12 10.8 9.4 8.2 5.8 8.2 5.8 11.8 8.4 14.4 12 14.4Z"/><path d="M12 16.2c0-3.6 2.6-6.2 6.2-6.2 0 3.6-2.6 6.2-6.2 6.2Z"/>',
      field: '<path d="M2.8 19.4c2-1.3 4-1.3 6 0s4 1.3 6 0 4-1.3 6.4 0"/><path d="M2.8 15.4c2-1.3 4-1.3 6 0s4 1.3 6 0 4-1.3 6.4 0"/><path d="M12 12V5.6"/><path d="M12 9.2c-2.1 0-3.4-1.3-3.4-3.4C10.7 5.8 12 7.1 12 9.2Z"/>',
      leaf: '<path d="M19.4 4.6C10.6 4.6 5.4 8.4 5.4 14.2c0 2.6 1.4 4.6 3.4 5.2 1-6.2 4.4-9.6 9.4-11.2-4 2.4-6.6 5.8-7.6 11.4 5.6.6 8.8-3.6 8.8-15Z"/>',
      rot: '<path d="M20.2 12a8.2 8.2 0 0 1-14 5.8"/><path d="M3.8 12a8.2 8.2 0 0 1 14-5.8"/><path d="M17.8 2.6v3.8h-3.8"/><path d="M6.2 21.4v-3.8h3.8"/>',
      germ: '<path d="M12 20.4v-7.2"/><path d="M12 13.2c0-3 2.2-5.2 5.2-5.2 0 3-2.2 5.2-5.2 5.2Z"/><path d="M8.4 6.2a3.6 3.6 0 1 1 7.2 0c0 2-1.6 3.6-3.6 3.6S8.4 8.2 8.4 6.2Z"/>'
    };
    return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (d[n] || '') + '</svg>';
  }

  /* 保存・種取りの1行（値が無ければ出さない） */
  function srow(k, v, cls) {
    if (!v) return '';
    return '<div class="srow' + (cls ? ' ' + cls : '') + '"><div class="sk">' + k +
      '</div><div class="sv">' + inline(v) + '</div></div>';
  }

  /* 連作と、前後の手当て */
  function rotBlock(c) {
    var rot = ROT[c.fam], prep = PREP[c.id], ah = AH[c.id];
    if (!rot && !prep && !ah) return '';
    var h = '<details class="sub rot"><summary>' + icon('rot') + '連作・前後の手当て';
    if (rot) {
      h += '<span class="kind">' + (rot.years === 0 ? '連作できる' : rot.years + '年あける') + '</span>';
    }
    h += '</summary><div class="subbody">';
    if (rot) {
      h += srow('あける年数',
        (rot.years === 0 ? '**続けて作ってよい**' : '**' + rot.years + '年あける**') +
        '（' + c.fam + '）' + (rot.why ? '　' + rot.why : ''),
        rot.years >= 3 ? 'warn' : '');
      if (rot.note) h += srow('補足', rot.note);
    }
    if (prep) h += srow('植える前に', prep, 'pre');
    if (ah) h += srow('収穫のあと', ah);
    return h + '</div></details>';
  }

  /* 発芽のコツ */
  function germBlock(id) {
    var g = GERM[id];
    if (!g) return '';
    var h = '<details class="sub germ"><summary>' + icon('germ') + '発芽のコツ' +
      (g.days ? '<span class="kind">' + esc(g.days) + '</span>' : '') +
      '</summary><div class="subbody">';
    h += srow('まく前に', g.pre, 'pre');
    h += srow('温度', g.temp);
    h += srow('光と覆土', g.light);
    h += srow('日数', g.days);
    h += srow('失敗しないコツ', g.tip, 'warn');
    return h + '</div></details>';
  }

  /* 保存のしかた */
  function keepBlock(id) {
    var k = KEEP[id];
    if (!k) return '';
    var h = '<details class="sub keep"><summary>' + icon('keep') +
      '保存のしかた</summary><div class="subbody">';
    h += srow('常温', k.room);
    h += srow('冷蔵', k.cold);
    h += srow('冷凍', k.freeze);
    h += srow('長く置く', k.long);
    h += srow('日持ちの目安', k.days);
    h += srow('しがちな失敗', k.ng, 'warn');
    return h + '</div></details>';
  }

  /* 種を採る・まく準備 */
  function seedBlock(id) {
    var s = SEED[id];
    if (!s) return '';
    var h = '<details class="sub seed"><summary>' + icon('seed') + '種を採る・まく準備' +
      (s.kind ? '<span class="kind">' + inline(s.kind).replace(/<\/?strong>/g, '') + '</span>' : '') +
      '</summary><div class="subbody">';
    h += srow('採種用に残す', s.keep);
    h += srow('採りどき', s.sign);
    h += srow('種の取り方', s.take);
    h += srow('乾かして保存', s.dry);
    h += srow('まく前の準備', s.pre, 'pre');
    h += srow('交雑の注意', s.cross, 'warn');
    return h + '</div></details>';
  }

  /* 同じ作物の追加ボタン（一覧の＋・カード内の大ボタン）をまとめて切り替える */
  function syncAddButtons(id, on) {
    var els = document.querySelectorAll('[data-add="' + id + '"]');
    for (var i = 0; i < els.length; i++) {
      els[i].classList.toggle('on', on);
      if (els[i].classList.contains('quickadd')) els[i].textContent = on ? '✓' : '＋';
      else els[i].textContent = on ? '✓ 畑プランに入れた' : '＋ 畑プランに入れる';
    }
  }

  function cropCard(c, open) {
    var inPlan = S.plan.indexOf(c.id) >= 0;
    var h = '<details class="card crop" id="crop-' + c.id + '" data-id="' + c.id + '"' + (open ? ' open' : '') + '>';
    h += '<summary>';
    h += '<span class="dot" style="background:var(--c-' + c.cat + ')"></span>';
    h += '<span class="nm">' + esc(c.name) + '</span>';
    h += '<span class="fam">' + esc(c.fam) + '</span>';
    h += '<span class="lv ' + c.lvl + '">' + c.lvl + '</span>';
    h += '<button class="quickadd' + (inPlan ? ' on' : '') + '" data-add="' + c.id +
      '" title="畑プランに入れる" aria-label="畑プランに入れる">' + (inPlan ? '✓' : '＋') + '</button>';
    h += '</summary><div class="body">';

    h += '<div class="cal-lab"><b>まく・植える</b></div>' + calRow(c.sow, 'sow');
    h += '<div class="cal-lab"><b>収穫</b></div>' + calRow(c.harvest, 'har');

    h += '<div class="field"><div class="k">土づくり</div><div class="v">' + esc(c.soil) + '</div></div>';
    h += '<div class="field"><div class="k">育て方のコツ</div><div class="v">' + esc(c.tip) + '</div></div>';

    if (c.comp && c.comp.length && c.comp[0] !== '—') {
      h += '<div class="field"><div class="k">相棒（コンパニオン）</div><div class="chips">';
      for (var i = 0; i < c.comp.length; i++) {
        h += '<span class="chip comp" data-comp="' + esc(c.comp[i]) + '">' + esc(c.comp[i]) + '</span>';
      }
      h += '</div><div class="reason" hidden></div></div>';
    }
    if (c.tags && c.tags.length) {
      h += '<div class="field"><div class="chips">';
      for (var j = 0; j < c.tags.length; j++) h += '<span class="chip tag">' + esc(c.tags[j]) + '</span>';
      h += '</div></div>';
    }
    var rb = rotBlock(c), gb = germBlock(c.id), kb = keepBlock(c.id), sb = seedBlock(c.id);
    h += rb + gb + kb + sb;
    if (!gb && !kb && !sb) h += '<div class="soon">発芽のコツ・保存・種の採り方は、これから順に加えていきます。</div>';

    h += '<button class="addbtn' + (inPlan ? ' on' : '') + '" data-add="' + c.id + '">' +
      (inPlan ? '✓ 畑プランに入れた' : '＋ 畑プランに入れる') + '</button>';
    h += '</div></details>';
    return h;
  }

  /* ───────── タブ1：今月やること ───────── */
  /* 画面のあたまに置く、短い説明（何の画面で、どこと繋がるか） */
  function explain_(title, body) {
    return '<div class="card card-pad" style="border-left:4px solid var(--green,#5a7d3a)">' +
      '<div style="font-weight:700;font-family:var(--mincho);margin-bottom:4px">' + title + '</div>' +
      '<div style="font-size:13px;line-height:1.9;color:var(--ink-sub,#5d5b4f)">' + body + '</div></div>';
  }

  /* 5つの画面の関係。ふだんは畳んでおく */
  function howItWorks_() {
    return '<details class="card" style="margin-top:18px">' +
      '<summary style="cursor:pointer;padding:13px 15px;font-weight:700">' +
      'この5つの画面は、どう繋がっているか</summary>' +
      '<div class="card-pad" style="padding-top:0;font-size:13px;line-height:1.95;color:var(--ink-sub,#5d5b4f)">' +
      '<p style="margin:0 0 6px"><b>今月やること</b>（この画面）… 今月は何をする月か。' +
      '小田原の暖地を基準に、作物137種の中から今月ぶんを出しています。' +
      '<b>あなたの登録とは関係なく、全部出ます</b>。</p>' +
      '<p style="margin:0 0 6px"><b>作付け</b> … 何を作るか<b>決める場</b>。選ぶと「畑プラン」に入り、' +
      '一緒に植えていい組み合わせかを診ます。選んだだけでは記録にはなりません。</p>' +
      '<p style="margin:0 0 6px"><b>マイ畑</b> … 実際にうちの畑で何がどうなっているかの<b>記録</b>。' +
      'ここだけが現実です。</p>' +
      '<p style="margin:0 0 6px"><b>年間計画</b> … 畝ごと（①L3 など）の一年の段取り。' +
      '上の3つとは別のデータを見ています。</p>' +
      '<p style="margin:0 0 12px"><b>ノウハウ</b> … 作物ごとの詳しい記事。</p>' +
      '<div style="font-weight:700;color:var(--ink,#2f2e28);margin-bottom:4px">ふだんの流れ</div>' +
      '<div>① 作付けで、作りたいものを選ぶ<br>' +
      '② マイ畑の「畑プランを選択に入れる」で取り込み、<b>予定</b>として登録する<br>' +
      '③ まき時が来た予定は、マイ畑の<b>「🔔 いま出番」に自動で上がる</b>（下から探さなくていい）<br>' +
      '④ 実際にまいたら、その場のボタンを押す。日付は今日で入る<br>' +
      '⑤ 育てているものは、この画面の「マイ畑のようす」にも出る</div>' +
      '<p style="margin:12px 0 0">記録はこの端末の中だけに保存されます（サーバーには送られません）。</p>' +
      '</div></details>';
  }

  function viewMonth() {
    var m = S.soilMonth;
    var key = 'shizen-soil-' + now.getFullYear() + '-' + m;
    var checked = load(key, {});
    var list = SOIL[m] || [];

    var h = '<section class="sec">';
    h += explain_('今月やること — 今月の目安',
      'いま何をする月かを、作物137種の一般データから出しています。'
      + '<b>登録に関係なく全部出ます</b>ので、うちの畑の話は下の「マイ畑のようす」を見てください。');
    h += '<div class="card soil"><div class="soil-head"><h2>' + m + '月の土づくり</h2>' +
      '<div class="soil-nav"><button data-soil="-1" aria-label="前の月">‹</button>' +
      '<button data-soil="1" aria-label="次の月">›</button></div></div>';
    h += '<ul class="tasklist">';
    for (var i = 0; i < list.length; i++) {
      h += '<li><label><input type="checkbox" data-soilkey="' + key + '" data-i="' + i + '"' +
        (checked[i] ? ' checked' : '') + '><span>' + esc(list[i]) + '</span></label></li>';
    }
    h += '</ul></div>';

    h += '<details class="card principles"><summary>自然農・土づくりの背骨（五つの原則）</summary><div class="body"><dl>';
    for (var p = 0; p < PRIN.length; p++) {
      h += '<dt>' + esc(PRIN[p][0]) + '</dt><dd>' + esc(PRIN[p][1]) + '</dd>';
    }
    h += '</dl></div></details></section>';

    /* 今月まける／収穫 */
    var sow = CROPS.filter(function (c) { return c.sow.indexOf(m) >= 0; });
    var har = CROPS.filter(function (c) { return c.harvest.indexOf(m) >= 0; });

    h += chipSection(m + '月にまける・植える', sow, 'sow', m);
    h += chipSection(m + '月に収穫できる', har, 'har', m);

    /* マイ畑ダイジェスト */
    h += '<section class="sec"><div class="sec-head"><h2>マイ畑のようす</h2>' +
      '<span class="count">' + S.mine.length + '件</span></div>';
    if (!S.mine.length) {
      h += '<div class="card"><div class="empty"><span class="em">' + icon('field') + '</span>' +
        'まだ記録がありません。<br>下の「マイ畑」タブから、いま育てているものを登録してください。</div></div>';
    } else {
      var sorted = S.mine.slice().sort(function (a, b) { return a.planted < b.planted ? 1 : -1; });
      h += '<div class="card"><ul class="tasklist" style="padding:8px 6px">';
      for (var k = 0; k < Math.min(sorted.length, 4); k++) {
        var e = sorted[k], g = growById(e.id), c0 = cropById(e.id);
        var nm0 = g ? g.name : (c0 ? c0.name : e.id);
        var sub0 = daysSince(mineStart_(e)) + '日目';
        if (g) sub0 += '・' + Object.keys(e.checks || {}).length + '/' + g.tasks.length;
        var st0 = mineStage_(e);
        if (st0 !== 'field') sub0 += '・' + STAGE_LABEL[st0];
        h += '<li><label style="cursor:default"><span style="flex:1 1 auto">' + esc(nm0) +
          '　<span style="color:var(--ink-sub2);font-size:12px">' + sub0 + '</span></span></label></li>';
      }
      h += '</ul></div>';
    }
    h += '</section>';

    h += howItWorks_();
    h += '<div class="foot">月・適期は小田原（暖地）の目安です。品種・その年の天候・畑の状態で前後します。</div>';
    return h;
  }

  function chipSection(title, arr, kind, m) {
    var h = '<section class="sec"><div class="sec-head"><h2>' + esc(title) + '</h2>' +
      '<span class="count">' + arr.length + '種</span></div>';
    if (!arr.length) {
      h += '<div class="card"><div class="empty">この月に該当する作物はありません。</div></div>';
      return h + '</section>';
    }
    h += '<div class="card card-pad"><div class="chips">';
    for (var i = 0; i < arr.length; i++) {
      h += '<span class="chip" style="border-color:var(--c-' + arr[i].cat + ');color:var(--c-' + arr[i].cat +
        ');background:#fffdf7" data-jump="' + arr[i].id + '" data-kind="' + kind + '" data-m="' + m + '">' +
        esc(arr[i].name) + '</span>';
    }
    h += '</div></div></section>';
    return h;
  }

  /* ───────── タブ2：作付けシミュレーター ───────── */
  function viewPlan() {
    var h = explain_('作付け — 何を作るか決める',
      '月と条件でしぼって、作りたいものを選びます。選んだものは<b>畑プラン</b>に入り、'
      + '一番下で相性（◎ 一緒に植えると良い／⚠ 同じ科で連作注意）を診ます。'
      + '<b>ここで選んだだけでは記録になりません。</b>「マイ畑」タブの'
      + '「畑プランを選択に入れる」で取り込むと、記録が始まります。');
    h += '<div class="filters">';
    h += '<div class="row" id="modeRow">' +
      '<button class="pill' + (S.pMode === 'sow' ? ' on' : '') + '" data-mode="sow">まく・植える</button>' +
      '<button class="pill' + (S.pMode === 'har' ? ' on' : '') + '" data-mode="har">収穫</button>' +
      '<button class="pill' + (S.pMode === 'all' ? ' on' : '') + '" data-mode="all">通年（全作物）</button>' +
      '</div>';
    h += '<div class="monthbar" id="monthRow"' + (S.pMode === 'all' ? ' hidden' : '') + '>';
    for (var m = 1; m <= 12; m++) {
      h += '<button class="mbtn' + (S.pMonth === m ? ' on' : '') + '" data-month="' + m + '">' + m + '月</button>';
    }
    h += '</div>';
    h += '<div class="row" id="catRow"><button class="pill' + (S.pCat === null ? ' on' : '') + '" data-cat="">すべて</button>';
    for (var i = 0; i < CATS.length; i++) {
      h += '<button class="pill cat' + (S.pCat === CATS[i] ? ' on' : '') + '" data-cat="' + CATS[i] + '"' +
        (S.pCat === CATS[i] ? ' style="background:var(--c-' + CATS[i] + ');border-color:var(--c-' + CATS[i] + ')"' : '') +
        '>' + CATS[i] + '</button>';
    }
    h += '</div>';
    h += '<input class="search" id="q" type="search" placeholder="作物名・科・特徴で探す" value="' + esc(S.pQ) + '">';
    h += '</div>';
    h += '<div id="planBox"></div><div id="cropList"></div>';
    h += '<div class="foot">全' + CROPS.length + '種を収録。月は暖地（小田原・湘南）の目安です。</div>';
    return h;
  }

  /* 検索語との近さ（0=名前が一致 / 1=別名が一致 / 2=説明文が一致） */
  function matchRank(c, q) {
    if (norm(c.name).indexOf(q) >= 0) return 0;
    if (ALIAS[c.id] && norm(ALIAS[c.id].join(' ')).indexOf(q) >= 0) return 1;
    return 2;
  }

  function filteredCrops() {
    var m = S.pMonth, q = norm(S.pQ.trim());
    var arr = CROPS.filter(function (c) {
      if (S.pMode === 'sow' && c.sow.indexOf(m) < 0) return false;
      if (S.pMode === 'har' && c.harvest.indexOf(m) < 0) return false;
      if (S.pCat && c.cat !== S.pCat) return false;
      if (q) {
        var k = KEEP[c.id], s = SEED[c.id], g = GERM[c.id], extra = '';
        if (k) extra += ' ' + k.room + k.cold + k.freeze + k.long + k.ng;
        if (s) extra += ' ' + s.kind + s.keep + s.sign + s.take + s.dry + s.pre + s.cross;
        if (g) extra += ' ' + g.pre + g.tip;
        if (ALIAS[c.id]) extra += ' ' + ALIAS[c.id].join(' ');
        var hay = norm(c.name + ' ' + c.fam + ' ' + c.cat + ' ' + c.tip + ' ' + c.soil + ' ' +
          c.tags.join(' ') + ' ' + c.comp.join(' ') + ' ' + c.id + extra);
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });

    /* 名前で当たったものを先に出す（「ねぎ」で長ネギが埋もれないように） */
    if (q) {
      arr = arr.slice().sort(function (a, b) {
        var d = matchRank(a, q) - matchRank(b, q);
        return d !== 0 ? d : 0;
      });
    }
    return arr;
  }

  function paintList() {
    var box = document.getElementById('cropList');
    if (!box) return;
    var arr = filteredCrops();
    var head = '<div class="sec-head" style="margin-top:6px"><h2>' +
      (S.pMode === 'all' ? '全作物' : S.pMonth + '月に' + (S.pMode === 'sow' ? 'まける・植えられる' : '収穫できる')) +
      '</h2><span class="count">' + arr.length + '種</span></div>';
    if (!arr.length) {
      box.innerHTML = head + '<div class="card"><div class="empty"><span class="em">' + icon('leaf') + '</span>' +
        '条件に合う作物がありません。<br>月・カテゴリ・検索語を変えてみてください。</div></div>';
      return;
    }
    var h = head;
    for (var i = 0; i < arr.length; i++) h += cropCard(arr[i], S.focus === arr[i].id);
    box.innerHTML = h;
    if (S.focus) {
      var el = document.getElementById('crop-' + S.focus);
      if (el) el.scrollIntoView({ block: 'center' });
      S.focus = null;
    }
  }

  function paintPlanBox() {
    var box = document.getElementById('planBox');
    if (!box) return;
    if (!S.plan.length) { box.innerHTML = ''; paintPlanBar(); return; }
    var sel = S.plan.map(cropById).filter(Boolean);

    var good = [], warn = [], i, j;
    for (i = 0; i < sel.length; i++) {
      for (j = i + 1; j < sel.length; j++) {
        var a = sel[i], b = sel[j];
        if (a.comp.indexOf(b.name) >= 0 || b.comp.indexOf(a.name) >= 0) {
          var r = REASONS[b.name] || REASONS[a.name] || '相性のよい組み合わせです。';
          good.push([a.name + ' × ' + b.name, r]);
        }
        if (a.fam === b.fam && HEAVY[a.fam]) {
          warn.push([a.name + ' × ' + b.name + '（同じ' + a.fam + '）', HEAVY[a.fam] + ' 隣り合わせず、区画を分けてください。']);
        }
      }
    }
    var famCount = {};
    for (i = 0; i < sel.length; i++) famCount[sel[i].fam] = (famCount[sel[i].fam] || 0) + 1;

    var h = '<details class="card" open style="margin-top:10px"><summary style="padding:13px 15px;list-style:none;cursor:pointer">' +
      '<span style="font-family:var(--mincho);font-weight:700;font-size:16px;color:var(--green)">畑プラン診断</span>' +
      '<span style="float:right;font-size:12px;color:var(--ink-sub2)">' + sel.length + '種</span></summary>' +
      '<div class="card-pad" style="border-top:1px solid var(--line-soft)">';

    h += '<div class="chips" style="margin-bottom:12px">';
    for (i = 0; i < sel.length; i++) {
      h += '<span class="chip" style="border-color:var(--c-' + sel[i].cat + ');color:var(--c-' + sel[i].cat +
        ');background:#fffdf7" data-remove="' + sel[i].id + '">' + esc(sel[i].name) + ' ✕</span>';
    }
    h += '</div><div class="diag">';

    if (good.length) {
      for (i = 0; i < Math.min(good.length, 8); i++) {
        h += '<div class="item good"><b>◎ 一緒に植えるとよい　' + esc(good[i][0]) + '</b>' + esc(good[i][1]) + '</div>';
      }
      if (good.length > 8) h += '<div class="item good">ほか ' + (good.length - 8) + ' 組の好相性があります。</div>';
    }
    if (warn.length) {
      for (i = 0; i < Math.min(warn.length, 8); i++) {
        h += '<div class="item warn"><b>△ ' + esc(warn[i][0]) + '</b>' + esc(warn[i][1]) + '</div>';
      }
      if (warn.length > 8) h += '<div class="item warn">ほか ' + (warn.length - 8) + ' 組の同科の重なりがあります。</div>';
    }
    if (!good.length && !warn.length) {
      h += '<div class="item good">相性の衝突はありません。科がばらけているほど、畑は安定します。</div>';
    }

    /* ① 植え付けの期限（今月を過ぎていないか） */
    var late = [], soon = [];
    for (i = 0; i < sel.length; i++) {
      var lim = SOWLIM[sel[i].id];
      if (!lim) continue;
      if (THIS_M > lim.m) late.push([sel[i].name, lim.label, lim.risk]);
      else if (THIS_M === lim.m) soon.push([sel[i].name, lim.label, lim.risk]);
    }
    for (i = 0; i < late.length; i++) {
      h += '<div class="item bad"><b>× ' + esc(late[i][0]) + ' は期限（' + esc(late[i][1]) + '）を過ぎています</b>' +
        inline(late[i][2]) + '。次のまき時まで待つか、別のものに替えてください。</div>';
    }
    for (i = 0; i < soon.length; i++) {
      h += '<div class="item warn"><b>！ ' + esc(soon[i][0]) + ' は今月が期限（' + esc(soon[i][1]) + '）です</b>' +
        inline(soon[i][2]) + '。急いでください。</div>';
    }

    /* ② 前の作 → 次の作で避けたい並び */
    var seenNg = {};
    for (i = 0; i < sel.length; i++) {
      for (j = 0; j < sel.length; j++) {
        /* 同じ科どうしは上の「同科の重なり」で出しているので、ここでは省く */
        if (i === j || sel[i].fam === sel[j].fam) continue;
        for (var n = 0; n < AFTNG.length; n++) {
          var rule = AFTNG[n];
          if ((rule.prev !== sel[i].fam && rule.prev !== sel[i].id) ||
              (rule.next !== sel[j].fam && rule.next !== sel[j].id)) continue;
          var key = sel[i].id + '>' + sel[j].id;
          if (seenNg[key]) continue;
          seenNg[key] = true;
          h += '<div class="item warn"><b>△ 続けて植えない　' + esc(sel[i].name) + ' → ' + esc(sel[j].name) + '</b>' +
            inline(rule.why) + '</div>';
        }
      }
    }

    /* ③ よい並び */
    var seenOk = {};
    for (i = 0; i < sel.length; i++) {
      for (j = 0; j < sel.length; j++) {
        if (i === j) continue;
        for (var g2 = 0; g2 < AFTGOOD.length; g2++) {
          var rg = AFTGOOD[g2];
          if ((rg.prev !== sel[i].fam && rg.prev !== sel[i].id) ||
              (rg.next !== sel[j].fam && rg.next !== sel[j].id)) continue;
          var k2 = sel[i].id + '>' + sel[j].id;
          if (seenOk[k2]) continue;
          seenOk[k2] = true;
          h += '<div class="item good"><b>◎ 続けて植えるとよい　' + esc(sel[i].name) + ' → ' + esc(sel[j].name) + '</b>' +
            inline(rg.why) + '</div>';
        }
      }
    }

    /* ④ 連作であける年数 */
    var fams = Object.keys(famCount).sort(function (x, y) { return famCount[y] - famCount[x]; });
    var rotLines = [];
    for (i = 0; i < fams.length; i++) {
      var rr = ROT[fams[i]];
      if (!rr) continue;
      rotLines.push(fams[i] + '（' + famCount[fams[i]] + '種）' +
        (rr.years === 0 ? '連作できる' : rr.years + '年あける'));
    }
    if (rotLines.length) {
      h += '<div class="item good" style="background:#f6f2ec;border-color:#e0d6c4;border-left-color:#8e5a32;color:var(--ink-sub)">' +
        '<b>科ごとにあける年数</b>' + esc(rotLines.join('　/　')) + '</div>';
    }

    /* ⑤ 必要な畝数の目安 */
    var needBeds = fams.filter(function (f) { var r = ROT[f]; return !r || r.years > 0; }).length;
    h += '<div class="item good" style="background:#f7f2e4;border-color:#e5dbc2;border-left-color:#b0762c;color:var(--ink-sub)">' +
      '<b>畝はいくつ要るか</b>連作をあける必要のある科が <b>' + needBeds + '</b> つあります。' +
      'ひとつの科に1畝を割り当てて回すなら、<b>最低 ' + needBeds + ' 畝</b>（休ませる畝を入れるなら ' + (needBeds + 1) + ' 畝）が目安です。' +
      'ネギ類・サツマイモ・イネ科・シソ科は連作できるので、この数には入れていません。</div>';

    h += '</div><button class="del" style="width:100%;margin:6px 0 0" data-clearplan="1">プランを空にする</button>';
    h += '</div></details>';
    box.innerHTML = h;
    paintPlanBar();
  }

  function paintPlanBar() {
    var bar = document.getElementById('planbar');
    if (S.tab !== 'plan' || !S.plan.length) { if (bar) bar.remove(); return; }
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'planbar'; bar.className = 'planbar';
      document.body.appendChild(bar);
    }
    bar.innerHTML = '<span class="t">畑プラン ' + S.plan.length + '種を選択中</span>' +
      '<button data-scrollplan="1">診断を見る</button>';
  }

  /* ───────── タブ3：マイ畑 ───────── */
  function viewMine() {
    var h = explain_('マイ畑 — うちの畑の記録',
      'いま実際に何がどうなっているかを記録する画面です。'
      + '<b>予定 → 発芽処理 → 種をまいた／苗を買った → 畑に植えた</b> と進めます。'
      + 'これから作るものも<b>予定</b>で入れておけば、'
      + 'まき時が来た月に<b>「🔔 いま出番」へ自動で上がる</b>ので、'
      + '長い一覧から探す必要はありません。');
    h += '<div class="card picker"><div style="font-family:var(--mincho);font-weight:700;font-size:16px;color:var(--green)">いま育てているものを記録</div>';
    h += '<div class="lead" style="margin:7px 0 0">一覧からタップで選んで（<b>複数OK</b>）、日付を決めて、まとめて加えます。</div>';
    h += '<input class="search" id="mq" type="search" placeholder="作物名で絞り込み（ひらがなでもOK）" value="' + esc(S.mQ) + '" style="margin-top:10px">';
    h += '<div id="mPickBox" class="mpickbox"></div>';
    h += '<div id="mSelBar"></div>';

    h += '<div class="k">どこから記録を始める？</div><div class="chips" id="mStageRow">';
    [['planned', '📌 これから育てる（予定）'], ['prep', '🫘 発芽処理（浸水・芽出し）'], ['sow', '🌱 種をまいた'], ['bought', '🛒 苗を買った'], ['field', '🪴 畑に植えた']]
      .forEach(function (s) {
        h += '<button type="button" class="chip mpick' + (S.mStage === s[0] ? ' on' : '') +
          '" data-mstage="' + s[0] + '">' + s[1] + '</button>';
      });
    h += '</div>';

    h += '<div class="k">どちらの畑（畑に植えたとき用）</div><div class="chips" id="mFieldRow">';
    FIELDS.forEach(function (f) {
      h += '<button type="button" class="chip mpick' + (S.mField === f.id ? ' on' : '') +
        '" data-mfield="' + f.id + '">' + f.name + '</button>';
    });
    h += '</div>';

    h += '<div class="k">その日付</div><input type="date" id="mDate" value="' + ymd(now) + '">';
    h += '<button class="go" id="mAddMulti">選んだものを畑に加える</button>';
    if (S.plan.length) {
      h += '<button class="go alt" id="mFromPlan">作付けタブの畑プラン（' + S.plan.length + '種）を選択に入れる</button>';
    }
    h += '</div>';

    h += '<input class="search" id="mineq" type="search" style="margin-top:20px"'
      + ' placeholder="登録した中から探す（例：なす）" value="' + esc(S.mineQ) + '">';
    h += '<div id="mineList"></div>';

    /* ── 種の在庫箱 ── */
    h += '<section class="sec" style="margin-top:26px"><div class="sec-head"><h2>種の在庫箱</h2>' +
      '<span class="count" id="seedCount"></span></div>';
    h += '<div class="lead">持っている種を登録すると、寿命から「今年まけるか」を教えます。' +
      '藍は1年・玉ねぎは2年など、種には寿命があります。</div>';
    h += '<div class="card picker">';
    h += '<div class="k">作物</div><select id="sSel">';
    var byCat2 = {};
    CROPS.forEach(function (c) { (byCat2[c.cat] = byCat2[c.cat] || []).push(c); });
    CATS.forEach(function (cat) {
      if (!byCat2[cat]) return;
      h += '<optgroup label="' + cat + '">';
      byCat2[cat].forEach(function (c) { h += '<option value="' + c.id + '">' + esc(c.name) + '</option>'; });
      h += '</optgroup>';
    });
    h += '</select>';
    h += '<div class="k">買った・採った年</div><select id="sYear">';
    var yNow = now.getFullYear();
    for (var yy = yNow; yy >= yNow - 7; yy--) {
      h += '<option value="' + yy + '">' + yy + '年</option>';
    }
    h += '</select>';
    h += '<button class="go" id="sAdd">在庫箱に入れる</button></div>';
    h += '<div id="seedList"></div></section>';

    /* ── LINE畑日誌 ── */
    h += '<section class="sec" style="margin-top:26px"><div class="sec-head"><h2>LINE畑日誌</h2></div>';
    h += '<div class="card card-pad" style="font-size:13px;line-height:1.9;color:var(--ink-sub)">' +
      '専用の<b>畑Bot</b>（LINE）に写真やひとことを送ると、そのまま日誌に残ります。' +
      '「飯泉 ニンニク 発芽処理はじめた」のように送ると、畑名・工程も自動で読み取ります。' +
      '<div class="chips" style="margin-top:10px">' +
      '<a class="chip" href="https://docs.google.com/spreadsheets/d/1dP5qrD3OTeR7Evd5K_OGZDJyswuuCHoPcqLbjEG0CHo/edit" target="_blank" rel="noopener">📒 台帳を開く</a>' +
      '<a class="chip" href="https://drive.google.com/drive/folders/1aA0XQfxGgJ0CDKyxbCP-6thMZv_a2DmQ" target="_blank" rel="noopener">📁 写真フォルダ</a>' +
      '</div></div></section>';

    h += '<div class="foot">記録はこの端末の中だけに保存されます（サーバーには送られません）。</div>';
    return h;
  }

  /* マイ畑：工程（発芽処理 → 育苗 → 畑）。古い記録（plantedのみ）もそのまま扱える */
  var STAGE_LABEL = { planned: '予定', prep: '発芽処理中', sow: '育苗中', bought: '苗（購入）', field: '畑' };
  var STAGE_NEXT = { prep: 'sow', sow: 'field', bought: 'field' };
  var STAGE_NEXT_BTN = {
    prep: '🌱 種をまいた（育苗へ進める）',
    sow: '🪴 畑に植えた（畑へ進める）',
    bought: '🪴 畑に植えた（畑へ進める）'
  };
  /* 予定からは3方向に進める */
  var PLANNED_STARTS = [
    ['prep', '🫘 発芽処理を始めた'],
    ['sow', '🌱 種をまいた'],
    ['bought', '🛒 苗を買った']
  ];
  function mineStage_(e) { return e.stage || 'field'; }
  var STAGE_ORDER = ['planned', 'prep', 'sow', 'bought', 'field'];
  /* 間違えて進めたとき用：日付が残っている、ひとつ手前の工程 */
  function minePrevStage_(e) {
    var d = mineDates_(e), idx = STAGE_ORDER.indexOf(mineStage_(e));
    for (var i = idx - 1; i >= 0; i--) if (d[STAGE_ORDER[i]]) return STAGE_ORDER[i];
    return null;
  }
  function mineDates_(e) { return e.dates || { field: e.planted }; }
  function mineStart_(e) { var d = mineDates_(e); return d.prep || d.sow || d.bought || d.field || d.planned || e.planted; }

  /* マイ畑：作物えらび（全作物から複数選択） */
  function paintMinePicker() {
    var box = document.getElementById('mPickBox');
    if (!box) return;
    var q = norm(S.mQ.trim());
    var h = '';
    CATS.forEach(function (cat) {
      var items = CROPS.filter(function (c) {
        if (c.cat !== cat) return false;
        if (!q) return true;
        var extra = ALIAS[c.id] ? ' ' + ALIAS[c.id].join(' ') : '';
        return norm(c.name + ' ' + c.fam + ' ' + c.id + extra).indexOf(q) >= 0;
      });
      if (!items.length) return;
      h += '<div class="mpick-cat">' + cat + '</div><div class="chips">';
      items.forEach(function (c) {
        var on = S.mSel.indexOf(c.id) >= 0;
        h += '<button type="button" class="chip mpick' + (on ? ' on' : '') + '" data-mpick="' + c.id + '">' +
          esc(c.name) + '</button>';
      });
      h += '</div>';
    });
    box.innerHTML = h || '<div class="empty" style="padding:16px 10px">該当する作物がありません</div>';
    paintMineSelBar();
  }

  function paintMineSelBar() {
    var bar = document.getElementById('mSelBar');
    if (!bar) return;
    if (!S.mSel.length) {
      bar.innerHTML = '';
    } else {
      var h = '<div class="k" style="margin-top:12px">選択中（' + S.mSel.length + '種）　タップで外す</div><div class="chips">';
      S.mSel.forEach(function (id) {
        var c = cropById(id);
        h += '<button type="button" class="chip msel" data-munpick="' + id + '">' + esc(c ? c.name : id) + ' ✕</button>';
      });
      bar.innerHTML = h + '</div>';
    }
    var btn = document.getElementById('mAddMulti');
    if (btn) btn.textContent = S.mSel.length ? '選んだ' + S.mSel.length + '種を畑に加える' : '選んだものを畑に加える';
  }

  /* 種の寿命判定 */
  function seedJudge_(id, year) {
    var life = SLIFE[id], approx = false;
    if (!life) { life = 3; approx = true; }
    var expire = year + life;
    var yNow = new Date().getFullYear();
    if (yNow > expire) return { cls: 'dead', label: '寿命切れ', life: life, approx: approx,
      note: 'まく前に発芽試験を（濡らした紙に10粒・8粒出れば使える）' };
    if (yNow === expire) return { cls: 'last', label: '今年が最後', life: life, approx: approx,
      note: '今年中にまくか、今季採り直す' };
    return { cls: 'ok', label: 'あと' + (expire - yNow) + '年まける', life: life, approx: approx, note: '' };
  }

  function paintSeeds() {
    var box = document.getElementById('seedList');
    if (!box) return;
    var cnt = document.getElementById('seedCount');
    if (cnt) cnt.textContent = S.seeds.length ? S.seeds.length + '袋' : '';
    if (!S.seeds.length) {
      box.innerHTML = '<div class="card" style="margin-top:10px"><div class="empty">' +
        'まだ登録がありません。<br>種袋を手元に置いて、上から入れてください。</div></div>';
      return;
    }
    /* 危ないもの順（寿命切れ→今年が最後→OK） */
    var order = { dead: 0, last: 1, ok: 2 };
    var rows = S.seeds.map(function (e) {
      var c = cropById(e.id);
      return { e: e, c: c, j: seedJudge_(e.id, e.year) };
    }).sort(function (a, b) {
      var d = order[a.j.cls] - order[b.j.cls];
      return d !== 0 ? d : (a.e.year - b.e.year);
    });

    var h = '<div class="card" style="margin-top:10px"><ul class="seedrows">';
    rows.forEach(function (r) {
      var name = r.c ? r.c.name : r.e.id;
      h += '<li class="seedrow ' + r.j.cls + '">';
      h += '<div class="sr-main"><b>' + esc(name) + '</b>' +
        '<span class="sr-year">' + r.e.year + '年' +
        '（寿命' + r.j.life + '年' + (r.j.approx ? '・目安' : '') + '）</span></div>';
      h += '<span class="sr-badge">' + esc(r.j.label) + '</span>';
      h += '<button class="sr-del" data-sdel="' + r.e.uid + '" aria-label="削除">✕</button>';
      if (r.j.note) h += '<div class="sr-note">' + esc(r.j.note) + '</div>';
      h += '</li>';
    });
    h += '</ul></div>';
    box.innerHTML = h;
  }

  /* 予定のまき時：2=今月 / 1=来月 / 0=まだ先 */
  function mineSowSoon_(e) {
    var c = cropById(e.id);
    if (!c || !c.sow || !c.sow.length) return 0;
    var mNow = now.getMonth() + 1, mNext = (mNow % 12) + 1;
    if (c.sow.indexOf(mNow) >= 0) return 2;
    if (c.sow.indexOf(mNext) >= 0) return 1;
    return 0;
  }
  /* 次にまける月まで、あと何か月か（「これから」の並べ替え用） */
  function mineSowWait_(e) {
    var c = cropById(e.id);
    if (!c || !c.sow || !c.sow.length) return 99;
    var mNow = now.getMonth() + 1, best = 99;
    for (var i = 0; i < c.sow.length; i++) {
      var d = (c.sow[i] - mNow + 12) % 12;
      if (d < best) best = d;
    }
    return best;
  }
  function mineName_(e) {
    var g = growById(e.id), c = cropById(e.id);
    return g ? g.name : (c ? c.name : e.id);
  }
  function mineMatch_(e, q) {
    if (!q) return true;
    var c = cropById(e.id);
    var extra = ALIAS[e.id] ? ' ' + ALIAS[e.id].join(' ') : '';
    return norm(mineName_(e) + ' ' + (c ? c.fam : '') + ' ' + e.id + extra).indexOf(q) >= 0;
  }

  /* 記録1件のカード。compact=true のときは解説・チェックリストを出さない
     （予定は数が増えるので、探しやすさを優先する） */
  function mineCard_(e, compact) {
    var g = growById(e.id), c = cropById(e.id);
    /* 詳細データ（GROW）が無い作物でも、登録した記録は必ず表示する */
    var nm = mineName_(e);
    var cat = g ? g.cat : (c ? c.cat : '果菜');
    var st = mineStage_(e), dts = mineDates_(e);
    var start = mineStart_(e);

    var h = '<div class="card mine" data-uid="' + e.uid + '">';
    h += '<div class="head"><span class="dot" style="background:var(--c-' + cat + ')"></span>' +
      '<span class="nm">' + esc(nm) + '</span>';
    if (e.field) h += '<span class="fbadge">' + esc(fieldName_(e.field)) + '</span>';
    if (st !== 'field') h += '<span class="stbadge">' + STAGE_LABEL[st] + '</span>';
    if (st !== 'planned') h += '<span class="days">' + daysSince(start) + '日目</span>';
    h += '</div>';

    /* 予定の作物には、まき時が来たら知らせるバッジを出す */
    if (st === 'planned' && c) {
      var soon = mineSowSoon_(e);
      if (soon === 2) {
        h += '<div class="temp hint"><b>🔔 今月がまき時です</b>まける月：' + c.sow.join('・') + '月</div>';
      } else if (soon === 1) {
        h += '<div class="temp"><b>来月がまき時</b>まける月：' + c.sow.join('・') + '月。種と場所の用意を</div>';
      } else {
        h += '<div class="meta">まける月：' + c.sow.join('・') + '月</div>';
      }
    }

    /* 工程の足あと（発芽処理→育苗→畑） */
    var trail = [];
    if (dts.prep) trail.push('🫘 ' + dts.prep.replace(/-/g, '/').slice(5) + ' 発芽処理');
    if (dts.sow) trail.push('🌱 ' + dts.sow.replace(/-/g, '/').slice(5) + ' 種まき');
    if (dts.bought) trail.push('🛒 ' + dts.bought.replace(/-/g, '/').slice(5) + ' 苗を購入');
    if (dts.field) trail.push('🪴 ' + dts.field.replace(/-/g, '/').slice(5) + ' 畑へ');
    if (trail.length) h += '<div class="meta">' + trail.join('　→　') + '</div>';

    if (st === 'planned') {
      PLANNED_STARTS.forEach(function (ps) {
        h += '<button class="advance" data-advto="' + ps[0] + '" data-uid2="' + e.uid + '">' + ps[1] + '</button>';
      });
    } else if (STAGE_NEXT[st]) {
      h += '<button class="advance" data-advance="' + e.uid + '">' + STAGE_NEXT_BTN[st] + '</button>';
    }
    var prevSt = minePrevStage_(e);
    if (prevSt) {
      h += '<button class="stback" data-stback="' + e.uid + '">↩ 間違えたとき：「' +
        STAGE_LABEL[st] + '」を取り消して ' + STAGE_LABEL[prevSt] + ' に戻す</button>';
    }

    if (!compact) {
      if (g) {
        var t = TEMPS[e.id];
        var done = 0; for (var kk in (e.checks || {})) if (e.checks[kk]) done++;
        var pct = Math.round(done / g.tasks.length * 100);
        h += '<div class="meta">' + esc(g.care) + '</div>';
        h += '<div class="bar"><i style="width:' + pct + '%"></i></div>';
        h += '<div class="temp hint"><b>ひとことコツ</b>' + esc(g.point) + '</div>';
        if (t) h += '<div class="temp"><b>温度の目安</b>' + esc(t.g) + '<br>' + esc(t.n) + '</div>';

        h += '<div class="bigtips">';
        for (var b = 0; b < g.big.length; b++) {
          h += '<div class="t"><h4>' + esc(g.big[b][0]) + '</h4><p>' + esc(g.big[b][1]) + '</p></div>';
        }
        h += '</div>';

        h += '<ul class="tasklist">';
        for (var j = 0; j < g.tasks.length; j++) {
          h += '<li><label><input type="checkbox" data-uid="' + e.uid + '" data-task="' + j + '"' +
            ((e.checks && e.checks[j]) ? ' checked' : '') + '><span>' + esc(g.tasks[j]) + '</span></label></li>';
        }
        h += '</ul>';
      } else if (c) {
        h += '<div class="temp hint"><b>育て方のコツ</b>' + esc(c.tip) + '</div>';
        h += '<div class="temp"><b>土づくり</b>' + esc(c.soil) + '</div>';
      }
    }

    h += '<button class="del" data-del="' + e.uid + '">この記録を削除</button>';
    h += '</div>';
    return h;
  }

  function mineHead_(title, n, note) {
    return '<div class="sec-head" style="margin-top:20px"><h2>' + title + '</h2>' +
      '<span class="count">' + n + '件</span></div>' +
      (note ? '<div class="lead" style="margin:0 0 8px">' + note + '</div>' : '');
  }

  function paintMine() {
    var box = document.getElementById('mineList');
    if (!box) return;
    if (!S.mine.length) {
      box.innerHTML = '<div class="card" style="margin-top:12px"><div class="empty"><span class="em">' + icon('sprout') + '</span>' +
        'まだ何も登録されていません。<br>上の欄から、いま畑にあるものを加えてください。</div></div>';
      return;
    }
    var qRaw = (S.mineQ || '').trim();
    var q = norm(qRaw);
    var hit = S.mine.filter(function (e) { return mineMatch_(e, q); });

    /* 三つに分ける：いま出番の予定 ／ 育てているもの ／ まだ先の予定 */
    var nowUp = [], growing = [], later = [];
    hit.forEach(function (e) {
      if (mineStage_(e) !== 'planned') { growing.push(e); return; }
      if (mineSowSoon_(e)) nowUp.push(e); else later.push(e);
    });
    nowUp.sort(function (a, b) {
      return (mineSowSoon_(b) - mineSowSoon_(a)) || (mineName_(a) < mineName_(b) ? -1 : 1);
    });
    growing.sort(function (a, b) { return mineStart_(a) < mineStart_(b) ? 1 : -1; });
    later.sort(function (a, b) {
      return (mineSowWait_(a) - mineSowWait_(b)) || (mineName_(a) < mineName_(b) ? -1 : 1);
    });

    var h = '';
    if (qRaw) {
      h += mineHead_('「' + esc(qRaw) + '」で絞り込み中', hit.length, '');
      if (!hit.length) {
        h += '<div class="card"><div class="empty">見つかりません。登録した作物名の一部で探してください。</div></div>';
      }
    }

    if (nowUp.length) {
      h += mineHead_('🔔 いま出番', nowUp.length,
        'まき時が来た予定です。作業したら、下のボタンをそのまま押してください（日付は今日で入ります）。');
      nowUp.forEach(function (e) { h += mineCard_(e, true); });
    }

    if (growing.length) {
      h += mineHead_('育てているもの', growing.length, '');
      growing.forEach(function (e) { h += mineCard_(e, false); });
    }

    if (later.length) {
      h += '<details style="margin-top:20px"' + (qRaw ? ' open' : '') + '>';
      h += '<summary style="cursor:pointer;padding:13px 15px;' +
        'background:var(--card,#fffdf7);border:1px solid var(--line,#d9d0ba);border-radius:14px;' +
        'font-weight:700">📌 これから育てる（予定）　' + later.length + '件' +
        '<span style="font-weight:400;font-size:13px;color:var(--ink-sub2,#6b5a3e)">　― まき時が近い順。タップでひらく</span>' +
        '</summary>';
      later.forEach(function (e) { h += mineCard_(e, true); });
      h += '</details>';
    }

    box.innerHTML = h;
  }

  /* ───────── タブ4：ノウハウ ───────── */
  function viewNotes() {
    if (S.note) {
      return '<a class="backlink" href="#" data-noteback="1">‹ 一覧にもどる</a>' +
        '<div class="card md" id="mdBody" style="margin-top:10px">読み込み中…</div>';
    }
    var h = '<div class="lead">作物ごとの詳しいノウハウ集です。基本データから自家採種・失敗あるあるまで、12章の型でまとめています。</div>';
    h += '<div id="noteList"><div class="card"><div class="empty">読み込み中…</div></div></div>';
    h += '<div class="foot">これから少しずつ増やしていきます。</div>';
    return h;
  }

  function paintNoteList() {
    var box = document.getElementById('noteList');
    if (!box) return;
    if (!S.notes) { box.innerHTML = '<div class="card"><div class="empty">読み込みに失敗しました。</div></div>'; return; }
    var h = '';
    for (var i = 0; i < S.notes.length; i++) {
      var n = S.notes[i];
      h += '<div class="card notelist"><a href="#" data-note="' + esc(n.file) + '">' +
        '<span class="dot" style="background:var(--c-' + (n.cat || '果菜') + ')"></span>' +
        '<span class="nm">' + esc(n.title) + '</span><span class="ar">›</span></a></div>';
    }
    box.innerHTML = h;
  }

  function loadNotes() {
    fetch('notes/notes.json', { cache: 'no-cache' })
      .then(function (r) { return r.json(); })
      .then(function (j) { S.notes = j; paintNoteList(); })
      .catch(function () { S.notes = null; paintNoteList(); });
  }

  function loadNote(file) {
    fetch('notes/' + file, { cache: 'no-cache' })
      .then(function (r) { return r.text(); })
      .then(function (t) {
        var el = document.getElementById('mdBody');
        if (el) { el.innerHTML = mdToHtml(t); window.scrollTo(0, 0); }
      })
      .catch(function () {
        var el = document.getElementById('mdBody');
        if (el) el.innerHTML = '<p>読み込みに失敗しました。通信環境をご確認ください。</p>';
      });
  }

  /* Markdownレンダラは md.js に切り出し（plan.html と共用） */
  var inline = window.MD.inline;
  var mdToHtml = window.MD.toHtml;

  /* ───────── 描画 ───────── */
  function render(keepScroll) {
    if (S.tab === 'month') app.innerHTML = viewMonth();
    else if (S.tab === 'plan') { app.innerHTML = viewPlan(); paintPlanBox(); paintList(); }
    else if (S.tab === 'mine') { app.innerHTML = viewMine(); paintMinePicker(); paintMine(); paintSeeds(); }
    else if (S.tab === 'notes') {
      app.innerHTML = viewNotes();
      if (S.note) loadNote(S.note);
      else if (S.notes) paintNoteList();
      else loadNotes();
    }
    paintPlanBar();
    var tb = document.getElementById('tabbar').children;
    for (var i = 0; i < tb.length; i++) tb[i].classList.toggle('on', tb[i].dataset.tab === S.tab);
    if (!keepScroll) window.scrollTo(0, 0);
  }

  /* ───────── イベント ───────── */
  document.getElementById('tabbar').addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-tab]');
    if (!b) return;
    var t = b.dataset.tab;
    if (S.tab === t) {
      if (t === 'notes' && S.note) { S.note = null; render(); }
      else window.scrollTo(0, 0);
      return;
    }
    goTab(t);
  });

  window.addEventListener('hashchange', function () {
    if (hashLock) { hashLock = false; return; }
    var t = tabFromHash();
    if (t !== S.tab) { S.tab = t; S.note = null; render(); }
  });

  document.body.addEventListener('change', function (ev) {
    var t = ev.target;
    /* 土づくりチェック */
    if (t.dataset && t.dataset.soilkey) {
      var k = t.dataset.soilkey, obj = load(k, {});
      if (t.checked) obj[t.dataset.i] = true; else delete obj[t.dataset.i];
      save(k, obj);
      return;
    }
    /* マイ畑のやることチェック */
    if (t.dataset && t.dataset.task !== undefined && t.dataset.uid) {
      var uid = t.dataset.uid, idx = t.dataset.task;
      for (var i = 0; i < S.mine.length; i++) {
        if (S.mine[i].uid === uid) {
          S.mine[i].checks = S.mine[i].checks || {};
          if (t.checked) S.mine[i].checks[idx] = true; else delete S.mine[i].checks[idx];
          save('shizen-mine', S.mine);
          var card = t.closest('.mine'), g = growById(S.mine[i].id);
          if (card && g) {
            var d = 0; for (var kk in S.mine[i].checks) if (S.mine[i].checks[kk]) d++;
            var bar = card.querySelector('.bar > i');
            if (bar) bar.style.width = Math.round(d / g.tasks.length * 100) + '%';
          }
          break;
        }
      }
      return;
    }
  });

  document.body.addEventListener('input', function (ev) {
    if (ev.target.id === 'q') { S.pQ = ev.target.value; paintList(); }
    if (ev.target.id === 'mq') { S.mQ = ev.target.value; paintMinePicker(); }
    if (ev.target.id === 'mineq') { S.mineQ = ev.target.value; paintMine(); }
  });

  document.body.addEventListener('click', function (ev) {
    var t = ev.target;
    var el;

    /* 土づくり 月送り */
    if ((el = t.closest('[data-soil]'))) {
      S.soilMonth = ((S.soilMonth - 1 + Number(el.dataset.soil) + 12) % 12) + 1;
      render(true); return;
    }
    /* 今月やること → 作付けタブへジャンプ */
    if ((el = t.closest('[data-jump]'))) {
      S.pMode = el.dataset.kind; S.pMonth = Number(el.dataset.m);
      S.pCat = null; S.pQ = ''; S.focus = el.dataset.jump;
      goTab('plan'); return;
    }
    /* モード切替 */
    if ((el = t.closest('[data-mode]'))) {
      S.pMode = el.dataset.mode;
      var row = document.getElementById('modeRow');
      Array.prototype.forEach.call(row.children, function (b) { b.classList.toggle('on', b.dataset.mode === S.pMode); });
      document.getElementById('monthRow').hidden = (S.pMode === 'all');
      paintList(); return;
    }
    /* 月切替 */
    if ((el = t.closest('[data-month]'))) {
      S.pMonth = Number(el.dataset.month);
      var mr = document.getElementById('monthRow');
      Array.prototype.forEach.call(mr.children, function (b) { b.classList.toggle('on', Number(b.dataset.month) === S.pMonth); });
      paintList(); return;
    }
    /* カテゴリ切替 */
    if ((el = t.closest('[data-cat]'))) {
      S.pCat = el.dataset.cat || null;
      var cr = document.getElementById('catRow');
      Array.prototype.forEach.call(cr.children, function (b) {
        var on = (b.dataset.cat || null) === S.pCat;
        b.classList.toggle('on', on);
        b.style.background = on && b.dataset.cat ? 'var(--c-' + b.dataset.cat + ')' : '';
        b.style.borderColor = on && b.dataset.cat ? 'var(--c-' + b.dataset.cat + ')' : '';
      });
      paintList(); return;
    }
    /* コンパニオンの理由 */
    if ((el = t.closest('.chip.comp'))) {
      var box = el.closest('.field').querySelector('.reason');
      var name = el.dataset.comp;
      var txt = REASONS[name] || 'このあたりは相性がよいとされています。実際の畑で試して、記録を残してください。';
      if (!box.hidden && box.dataset.cur === name) { box.hidden = true; return; }
      box.dataset.cur = name;
      box.innerHTML = '<b>' + esc(name) + 'と一緒に植えると</b>' + esc(txt);
      box.hidden = false; return;
    }
    /* 畑プランに追加・削除（一覧の＋と、カードを開いたときの大きいボタンを両方そろえる） */
    if ((el = t.closest('[data-add]'))) {
      ev.preventDefault();
      ev.stopPropagation();
      var id = el.dataset.add, k = S.plan.indexOf(id);
      if (k >= 0) S.plan.splice(k, 1); else S.plan.push(id);
      syncAddButtons(id, k < 0);
      save('shizen-plan', S.plan); paintPlanBox(); return;
    }
    if ((el = t.closest('[data-remove]'))) {
      var rid = el.dataset.remove, ri = S.plan.indexOf(rid);
      if (ri >= 0) S.plan.splice(ri, 1);
      save('shizen-plan', S.plan); paintPlanBox();
      syncAddButtons(rid, false);
      return;
    }
    if (t.closest('[data-clearplan]')) {
      S.plan = []; save('shizen-plan', S.plan); paintPlanBox(); paintList(); return;
    }
    if (t.closest('[data-scrollplan]')) {
      var pb = document.getElementById('planBox');
      if (pb) pb.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    /* マイ畑：作物チップの選択・解除 */
    if ((el = t.closest('[data-mpick]'))) {
      var pid = el.dataset.mpick, pix = S.mSel.indexOf(pid);
      if (pix >= 0) S.mSel.splice(pix, 1); else S.mSel.push(pid);
      paintMinePicker(); return;
    }
    if ((el = t.closest('[data-munpick]'))) {
      var uix = S.mSel.indexOf(el.dataset.munpick);
      if (uix >= 0) S.mSel.splice(uix, 1);
      paintMinePicker(); return;
    }
    /* マイ畑：開始する工程・畑のトグル */
    if ((el = t.closest('[data-mstage]'))) {
      S.mStage = el.dataset.mstage;
      var sr = document.querySelectorAll('#mStageRow .chip');
      for (var si = 0; si < sr.length; si++) sr[si].classList.toggle('on', sr[si].dataset.mstage === S.mStage);
      return;
    }
    if ((el = t.closest('[data-mfield]'))) {
      S.mField = el.dataset.mfield; save('shizen-mfield', S.mField);
      var fr = document.querySelectorAll('#mFieldRow .chip');
      for (var fi = 0; fi < fr.length; fi++) fr[fi].classList.toggle('on', fr[fi].dataset.mfield === S.mField);
      return;
    }
    /* マイ畑：畑プランを選択に取り込む */
    if (t.id === 'mFromPlan') {
      S.plan.forEach(function (id2) { if (S.mSel.indexOf(id2) < 0) S.mSel.push(id2); });
      paintMinePicker(); return;
    }
    /* マイ畑：まとめて追加 */
    if (t.id === 'mAddMulti') {
      var dt = document.getElementById('mDate');
      if (!S.mSel.length || !dt.value) return;
      var stg = S.mStage || 'field';
      S.mSel.forEach(function (id3) {
        var dts = {}; dts[stg] = dt.value;
        S.mine.push({
          uid: Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
          id: id3, planted: dt.value, stage: stg, dates: dts,
          field: S.mField, checks: {}
        });
      });
      S.mSel = [];
      save('shizen-mine', S.mine); paintMinePicker(); paintMine();
      var ml = document.getElementById('mineList');
      if (ml) ml.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    /* マイ畑：予定 → 実際の開始（3方向） */
    if ((el = t.closest('[data-advto]'))) {
      var toSt = el.dataset.advto, tuid = el.dataset.uid2;
      for (var ti = 0; ti < S.mine.length; ti++) {
        if (S.mine[ti].uid !== tuid) continue;
        var te = S.mine[ti];
        te.dates = mineDates_(te);
        te.dates[toSt] = ymd(new Date());
        te.stage = toSt;
        break;
      }
      save('shizen-mine', S.mine); paintMine(); return;
    }
    /* マイ畑：工程をひとつ戻す（間違えたときの取り消し） */
    if ((el = t.closest('[data-stback]'))) {
      var buid = el.dataset.stback;
      for (var bi = 0; bi < S.mine.length; bi++) {
        if (S.mine[bi].uid !== buid) continue;
        var be = S.mine[bi];
        var bprev = minePrevStage_(be);
        if (!bprev) break;
        be.dates = mineDates_(be);
        delete be.dates[mineStage_(be)];
        be.stage = bprev;
        be.planted = be.dates.field || be.dates.bought || be.dates.sow || be.dates.prep || be.planted;
        break;
      }
      save('shizen-mine', S.mine); paintMine(); return;
    }
    /* マイ畑：次の工程へ進める（発芽処理→育苗→畑） */
    if ((el = t.closest('[data-advance]'))) {
      var auid = el.dataset.advance;
      for (var ai = 0; ai < S.mine.length; ai++) {
        if (S.mine[ai].uid !== auid) continue;
        var ee = S.mine[ai];
        var cur = mineStage_(ee), nxt = STAGE_NEXT[cur];
        if (!nxt) break;
        ee.dates = mineDates_(ee);
        ee.dates[nxt] = ymd(new Date());
        ee.stage = nxt;
        if (nxt === 'field') ee.planted = ee.dates.field;   // 旧形式との互換を保つ
        break;
      }
      save('shizen-mine', S.mine); paintMine(); return;
    }
    /* 種の在庫箱 追加 */
    if (t.id === 'sAdd') {
      var ssel = document.getElementById('sSel'), syr = document.getElementById('sYear');
      if (!ssel.value || !syr.value) return;
      S.seeds.push({
        uid: Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
        id: ssel.value, year: Number(syr.value)
      });
      save('shizen-seeds', S.seeds); paintSeeds();
      var sl = document.getElementById('seedList');
      if (sl) sl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    /* 種の在庫箱 削除 */
    if ((el = t.closest('[data-sdel]'))) {
      S.seeds = S.seeds.filter(function (x) { return x.uid !== el.dataset.sdel; });
      save('shizen-seeds', S.seeds); paintSeeds(); return;
    }
    /* マイ畑 削除 */
    if ((el = t.closest('[data-del]'))) {
      var duid = el.dataset.del;
      var g2 = null;
      for (var m = 0; m < S.mine.length; m++) if (S.mine[m].uid === duid) g2 = growById(S.mine[m].id);
      if (!window.confirm((g2 ? g2.name + 'の' : '') + '記録を削除します。よろしいですか？')) return;
      S.mine = S.mine.filter(function (x) { return x.uid !== duid; });
      save('shizen-mine', S.mine); paintMine(); return;
    }
    /* ノウハウ */
    if ((el = t.closest('[data-note]'))) {
      ev.preventDefault(); S.note = el.dataset.note; render(); return;
    }
    if (t.closest('[data-noteback]')) {
      ev.preventDefault(); S.note = null; render(); return;
    }
  });

  render();

  /* Service Worker（オフライン用）
     新しい版が入ったら1回だけ自動で読み直す。
     これが無いと「開き直さないと更新が届かない」が起きる。 */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { });
    });
    var swRefreshed = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (swRefreshed) return;
      swRefreshed = true;
      location.reload();
    });
  }
})();
