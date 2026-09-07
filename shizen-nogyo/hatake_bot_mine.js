/** ================================================================
 *  畑Bot 追加分 ── マイ畑をアプリから預かり、朝の便を1作物1行に整理する
 *
 *  入れ方: このファイルの中身を hatake_bot/main.js の末尾に足し、
 *          既存の doPost と htkSection_ を下の「差し替え」の通りに直して clasp push。
 *
 *  やること
 *    ① アプリのマイ畑を「マイ畑」シートに預かる（端末が変わっても消えない）
 *    ② 朝の便で、同じ作物の話が二重に出ないようにする
 *         ・もう着手していた作物 → 期限の行は出さない（済んだこと）
 *         ・予定で入れてある作物 → 期限の行に「📌 マイ畑に予定あり」を付ける
 *         ・期限表に無いが、マイ畑の予定で今月がまき時 → マイ畑発の行を足す
 *         ・育てているもので、今月が穫れる月 → 「そろそろ穫れます」を足す
 *    ③ LINEで工程を進めたら、その結果がアプリに戻る（更新が新しいほうを採る）
 *  ================================================================ */

/* マイ畑同期用のトークン。アプリの data/sync.js と同じ値にする。
   公開サイトのJSに載るので、他のトークンとは別の値にしておくこと。 */
var HTK_MINE_TOKEN = 'htkMine-ここを長いランダム文字列に';

var HTK_MINE_SHEET = 'マイ畑';
var HTK_MINE_HEAD = ['uid', '作物id', '作物名', '工程', '予定', '発芽処理', '種まき',
  '苗購入', '畑へ', '畑', 'まける月', '穫れる月', '更新'];
var HTK_STAGE_JA = { planned: '予定', prep: '発芽処理', sow: '育苗', bought: '苗', field: '畑' };

/* ──────────────── シートの読み書き ──────────────── */

function htkMineSheet_() { return htkSheet_(HTK_MINE_SHEET, HTK_MINE_HEAD); }

function htkDs_(v) {
  if (!v) return '';
  if (v instanceof Date) return Utilities.formatDate(v, 'Asia/Tokyo', 'yyyy-MM-dd');
  return String(v);
}
function htkNums_(v) {
  return String(v || '').split(/[^0-9]+/).filter(function (x) { return x; }).map(Number);
}

function htkMineRead_() {
  var sh = htkMineSheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, HTK_MINE_HEAD.length).getValues().map(function (r) {
    return {
      uid: String(r[0]), id: String(r[1]), name: String(r[2]),
      stage: String(r[3]) || 'field',
      dates: {
        planned: htkDs_(r[4]), prep: htkDs_(r[5]), sow: htkDs_(r[6]),
        bought: htkDs_(r[7]), field: htkDs_(r[8])
      },
      field: String(r[9]), sow: htkNums_(r[10]), harvest: htkNums_(r[11]),
      t: Number(r[12]) || 0
    };
  }).filter(function (e) { return e.uid; });
}

function htkMineWrite_(list) {
  var sh = htkMineSheet_();
  var last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, HTK_MINE_HEAD.length).clearContent();
  if (!list.length) return 0;
  var rows = list.map(function (e) {
    var d = e.dates || {};
    return [e.uid, e.id, e.name || '', e.stage || 'field',
      d.planned || '', d.prep || '', d.sow || '', d.bought || '', d.field || '',
      e.field || '', (e.sow || []).join('・'), (e.harvest || []).join('・'),
      Number(e.t) || Date.now()];
  });
  sh.getRange(2, 1, rows.length, HTK_MINE_HEAD.length).setValues(rows);
  return rows.length;
}

/* どの記録があるかはアプリが決める（消したら消える）。
   工程の進み具合だけ、更新が新しいほうを採る（LINEで進めた分をアプリへ戻すため）。 */
function htkMineMerge_(server, client) {
  var srv = {};
  (server || []).forEach(function (e) { srv[e.uid] = e; });
  return (client || []).map(function (c) {
    var s = srv[c.uid];
    if (s && (Number(s.t) || 0) > (Number(c.t) || 0)) {
      return {
        uid: c.uid, id: c.id, name: c.name || s.name,
        stage: s.stage, dates: s.dates, field: s.field || c.field,
        sow: c.sow && c.sow.length ? c.sow : s.sow,
        harvest: c.harvest && c.harvest.length ? c.harvest : s.harvest,
        t: s.t
      };
    }
    return c;
  });
}

/* ──────────────── 朝の便：重複の整理 ──────────────── */

/* その記録を実際に始めた日（ミリ秒）。予定しかなければ 0 */
function htkMineStartMs_(e) {
  var d = e.dates || {};
  var s = d.prep || d.sow || d.bought || d.field;
  if (!s) return 0;
  var t = new Date(String(s) + 'T00:00:00+09:00').getTime();
  return isNaN(t) ? 0 : t;
}

/* 期限の1行に対応するマイ畑の記録を探す。
   期限の文面に作物名が入っていれば同じ話とみなす（作物キーがあればそれも見る）。 */
function htkMineFor_(row, mine) {
  var res = { started: null, planned: null };
  for (var i = 0; i < (mine || []).length; i++) {
    var e = mine[i];
    var sameName = e.name && String(row.what).indexOf(e.name) >= 0;
    var sameKey = row.crop && e.id && row.crop === e.id;
    if (!sameName && !sameKey) continue;
    if ((e.stage || 'field') === 'planned') { if (!res.planned) res.planned = e; continue; }
    /* 着手済み。ただし去年の記録を「済んだ」と誤解しないよう、
       その期限の60日前より後に始めたものだけを対象にする */
    var ms = htkMineStartMs_(e);
    if (ms && (row.due.getTime() - ms) <= 60 * 86400000) res.started = e;
  }
  return res;
}

/* 期限の行にマイ畑を重ねる。戻り値 {rows: 残す行, skipped: 出さなかった作物名} */
function htkApplyMine_(rows, mine) {
  var out = [], skipped = [];
  (rows || []).forEach(function (r) {
    var hit = htkMineFor_(r, mine);
    if (hit.started) { skipped.push(hit.started.name); return; }
    if (hit.planned) r.mineNote = '📌 マイ畑に予定あり';
    out.push(r);
  });
  return { rows: out, skipped: skipped };
}

/* 期限表に出てこないぶんを、マイ畑から足す */
function htkMineOwnLines_(rows, mine, now) {
  var m = now.getMonth() + 1;
  var covered = {};
  (rows || []).forEach(function (r) {
    (mine || []).forEach(function (e) {
      if (e.name && String(r.what).indexOf(e.name) >= 0) covered[e.uid] = true;
    });
  });
  var L = [];
  (mine || []).forEach(function (e) {
    if (covered[e.uid]) return;
    var st = e.stage || 'field';
    if (st === 'planned') {
      if ((e.sow || []).indexOf(m) >= 0) L.push('・🌱 ' + e.name + '　今月がまき時です（マイ畑の予定）');
      return;
    }
    if ((e.harvest || []).indexOf(m) >= 0) L.push('・🧺 ' + e.name + '　そろそろ穫れます');
  });
  return L;
}

/* ──────────────── 実行口 ──────────────── */

function htkMineSaveEndpoint_(e, p) {
  function out(o) {
    return ContentService.createTextOutput(JSON.stringify(o))
      .setMimeType(ContentService.MimeType.JSON);
  }
  if (String(p.token) !== HTK_MINE_TOKEN) return out({ ok: false, error: 'unauthorized' });
  var body;
  try { body = JSON.parse(e.postData.contents); }
  catch (err) { return out({ ok: false, error: 'bad json' }); }
  if (!body || !(body.mine instanceof Array)) return out({ ok: false, error: 'no mine' });

  var lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (err) { return out({ ok: false, error: 'busy' }); }
  try {
    var merged = htkMineMerge_(htkMineRead_(), body.mine);
    htkMineWrite_(merged);
    htkLog_('マイ畑を預かった', merged.length + '件');
    return out({ ok: true, mine: merged });
  } finally {
    lock.releaseLock();
  }
}

/* ================================================================
 *  差し替え① doPost の先頭に、次の3行を足す
 * ----------------------------------------------------------------
 *  function doPost(e) {
 *    var p = (e && e.parameter) || {};
 *    if (String(p.action) === 'minesave') return htkMineSaveEndpoint_(e, p);
 *    …以下は今のまま（LINEのwebhook）…
 * ================================================================ */

/* ================================================================
 *  差し替え② htkSection_ を、この htkSection2_ の中身に置き換える
 *  （既存の htkSection_ を消して、これを htkSection_ にリネームする）
 * ================================================================ */
function htkSection2_(now) {
  now = now || new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var isMonday = (today.getDay() === 1);
  var horizon = isMonday ? 14 : 3;
  var rows = [];
  for (var i = 0; i < HTK_DEADLINES.length; i++) {
    var it = HTK_DEADLINES[i];
    for (var k = 0; k <= 1; k++) {
      var due = htkDeadlineDate_(today.getFullYear() + k, it[0], it[1]);
      var days = Math.round((due - today) / 86400000);
      if (days >= 0 && days <= horizon) {
        rows.push({ days: days, due: due, what: it[2], risk: it[3], crop: it[4] || '' });
        break;
      }
    }
  }

  /* マイ畑を重ねて、同じ作物の話が二重に出ないようにする */
  var mine = [];
  try { mine = htkMineRead_(); } catch (_) { }
  var applied = htkApplyMine_(rows, mine);
  rows = applied.rows;
  var own = htkMineOwnLines_(applied.rows.concat([]), mine, now);

  if (!rows.length && !own.length) return '';
  rows.sort(function (a, b) { return a.days - b.days; });

  /* 気温をとる（失敗しても通知は止めない） */
  var wx = null;
  try { wx = htkWeather_(); } catch (_) { }

  var L = [isMonday ? '🌱 今週の畑' : '🌱 畑の期限が近づいています'];
  if (wx) {
    L.push('（小田原 きょう ' + Math.round(wx.min[0]) + '〜' + Math.round(wx.max[0]) + '℃）');
  }
  rows.forEach(function (r) {
    var ds = (r.due.getMonth() + 1) + '/' + r.due.getDate();
    var tail = r.days === 0 ? '【きょうまで】' : r.days === 1 ? '【あす ' + ds + ' まで】'
      : '（あと' + r.days + '日・' + ds + 'まで）';
    L.push('・' + r.what + '　' + tail + (r.mineNote ? '　' + r.mineNote : ''));
    if (r.days <= 3 && r.risk) L.push('　└ 遅れると：' + r.risk);
    if (r.crop && wx) {
      var adv = htkTempAdvice_(r.crop, wx);
      if (adv) L.push('　└ ' + adv);
    }
  });
  if (own.length) {
    L.push('');
    L.push('── マイ畑から ──');
    L = L.concat(own);
  }
  if (applied.skipped.length) {
    L.push('');
    L.push('（' + applied.skipped.join('・') + ' は着手済みなので省きました）');
  }
  L.push('📗 全体像 → ' + HTK_APP_URL + '/plan#month');
  return L.join('\n');
}
