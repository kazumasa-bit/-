(function(){
"use strict";
const D = window.DRILL;
const $ = id => document.getElementById(id);
const KEY = "drill-" + D.id;
const KEY_UNLOCK = KEY + "-unlocked";
const KEY_WELCOME = KEY + "-welcomed";
const today = () => new Date().toLocaleDateString("sv-SE");

const ALL = [];
D.chapters.forEach((c, ci) => c.m.forEach(m => ALL.push(Object.assign({}, m, {ch: c, ci}))));

function load(k, fallback){ try{ const v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); }catch(e){ return fallback; } }
function store(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }

let state = Object.assign({done:{}, memo:{}, days:[]}, load(KEY, {}));
let unlocked = !!load(KEY_UNLOCK, false);
let filter = "all", openId = null, memoTimer = null;

const isFree = ci => ci < D.freeChapters;
const canOpen = m => unlocked || isFree(m.ci);
const save = () => store(KEY, state);

/* ---------- home ---------- */
function render(){
  const n = ALL.filter(m => state.done[m.id]).length;
  $("sDone").textContent = n;
  $("sLeft").textContent = ALL.length - n;
  $("sDays").textContent = state.days.length;
  $("sBar").style.width = Math.round(n / ALL.length * 100) + "%";

  const next = ALL.find(m => !state.done[m.id]);
  const tOpen = $("tOpen");
  if(!next){
    $("tLabel").textContent = "修了";
    $("tTitle").textContent = "全ミッション達成！おめでとうございます";
    $("tWhy").textContent = "メモを見返すと、自分だけのコツ集になっています。好きなミッションをもう一度やってみましょう。";
    $("tMeta").textContent = ""; tOpen.hidden = true;
  } else if(!canOpen(next)){
    $("tLabel").textContent = "無料体験クリア";
    $("tTitle").textContent = "無料のミッションを全部できました！";
    $("tWhy").textContent = `ここから先は「${D.chapters[D.freeChapters].t}」など${ALL.filter(m => !isFree(m.ci)).length}個のミッション。続きは購入で開きます。`;
    $("tMeta").textContent = ""; tOpen.hidden = false; tOpen.textContent = "続きを見る"; tOpen.onclick = openBuy;
  } else {
    $("tLabel").textContent = "次のミッション";
    $("tTitle").textContent = next.t;
    $("tWhy").textContent = next.why;
    $("tMeta").textContent = `CH ${pad(next.ci + 1)} ・ 約${next.min}分${next.pop ? " ・ 人気" : ""}`;
    tOpen.hidden = false; tOpen.textContent = "やってみる"; tOpen.onclick = () => openMission(next.id);
  }

  const box = $("chapters"); box.textContent = "";
  D.chapters.forEach((c, ci) => {
    const items = ALL.filter(m => m.ci === ci && (filter === "all" || (filter === "done") === !!state.done[m.id]));
    if(!items.length) return;
    const total = c.m.length, d = c.m.filter(m => state.done[m.id]).length;
    const el = document.createElement("article"); el.className = "ch";
    const h = document.createElement("div"); h.className = "ch-h";
    const no = document.createElement("span"); no.className = "ch-no"; no.textContent = "CH " + pad(ci + 1);
    const t = document.createElement("div"); t.className = "ch-t"; t.textContent = c.t;
    if(isFree(ci) && !unlocked){ const f = document.createElement("span"); f.className = "free"; f.textContent = "無料"; t.appendChild(f); }
    const s = document.createElement("span"); s.textContent = c.s; t.appendChild(s);
    const p = document.createElement("span"); p.className = "ch-p"; p.textContent = `${d}/${total}`;
    h.append(no, t, p);
    const fr = document.createElement("div"); fr.className = "frames";
    c.m.forEach(m => { const i = document.createElement("i"); if(state.done[m.id]) i.className = "on"; fr.appendChild(i); });
    const ul = document.createElement("ul"); ul.className = "list";
    items.forEach(m => {
      const li = document.createElement("li");
      const b = document.createElement("button"); b.type = "button";
      const locked = !canOpen(m), done = !!state.done[m.id];
      b.className = "m" + (done ? " is-done" : "") + (locked ? " is-locked" : "");
      const bx = document.createElement("span"); bx.className = "box"; bx.setAttribute("aria-hidden", "true"); bx.textContent = done ? "✓" : "";
      const mt = document.createElement("span"); mt.className = "mt"; mt.textContent = m.t;
      const tg = document.createElement("span"); tg.className = "tag" + (m.pop ? " pop" : ""); tg.textContent = (m.pop ? "人気 " : "") + m.min + "分";
      b.append(bx, mt, tg);
      b.setAttribute("aria-label", m.t + (done ? "（できた）" : locked ? "（購入で開きます）" : ""));
      b.onclick = () => locked ? openBuy() : openMission(m.id);
      li.appendChild(b); ul.appendChild(li);
    });
    el.append(h, fr, ul); box.appendChild(el);
  });

  $("footStatus").textContent = unlocked ? "全ミッション解放済み" : `無料体験中（${D.freeChapters}章まで）`;
  $("openCode").hidden = unlocked;
}
const pad = n => String(n).padStart(2, "0");

/* ---------- sheets ---------- */
let openSheet = null;
function show(id){ hideAll(); $("scrim").hidden = false; $(id).hidden = false; $(id).scrollTop = 0; openSheet = id; }
function hideAll(){ ["sheet","buy","confirm"].forEach(i => $(i).hidden = true); $("scrim").hidden = true; openSheet = null; }
function closeAny(){ if(openSheet === "sheet") flushMemo(); openId = null; hideAll(); }

function addLabeled(el, label, text){ el.textContent = ""; const b = document.createElement("b"); b.textContent = label; el.append(b, text); }

function openMission(id){
  const m = ALL.find(x => x.id === id); if(!m) return;
  openId = id;
  $("mKicker").textContent = `CH ${pad(m.ci + 1)} ${m.ch.t} ・ 約${m.min}分`;
  $("mTitle").textContent = m.t;
  addLabeled($("mWhy"), "なぜ？ ", m.why);
  const ol = $("mSteps"); ol.textContent = "";
  m.steps.forEach(s => { const li = document.createElement("li"); const sp = document.createElement("span"); sp.textContent = s; li.appendChild(sp); ol.appendChild(li); });
  samples(m);
  addLabeled($("mOk"), "できた目安：", m.ok);
  addLabeled($("mTip"), "コツ：", m.tip);
  $("mMemo").value = state.memo[m.id] || "";
  const d = !!state.done[m.id];
  $("mDone").textContent = d ? "できた を取り消す" : "できた！";
  $("mDone").className = d ? "btn ghost" : "btn";
  show("sheet");
  $("mClose").focus();
}

/* sample photos: photos/<id>-before.jpg / -after.jpg — shown only if the file exists */
function samples(m){
  const box = $("mSamples"); box.textContent = ""; box.hidden = true;
  [["before","ビフォー"],["after","アフター"]].forEach(([k, cap]) => {
    const file = `photos/${m.id}-${k}.jpg`;
    const fig = document.createElement("figure");
    const img = new Image(); img.alt = `${m.t}の${cap}`; img.loading = "lazy";
    const fc = document.createElement("figcaption"); fc.textContent = cap;
    img.onload = () => { box.hidden = false; };
    img.onerror = () => {
      if(window.DRILL_PREVIEW){ const ph = document.createElement("div"); ph.className = "ph"; ph.textContent = "見本写真をここに\n" + file; img.replaceWith(ph); box.hidden = false; }
      else fig.remove();
    };
    img.src = file;
    fig.append(img, fc); box.appendChild(fig);
  });
}

$("mDone").onclick = () => {
  const m = ALL.find(x => x.id === openId); if(!m) return;
  flushMemo();
  if(state.done[m.id]) delete state.done[m.id];
  else {
    state.done[m.id] = today();
    if(!state.days.includes(today())) state.days.push(today());
    toast(ALL.every(x => state.done[x.id]) ? "全部できた！修了です" : "ナイス！ひとつ覚えた");
  }
  save(); render();
  if(state.done[m.id]) setTimeout(closeAny, 450);
  else openMission(m.id);
};
$("mMemo").addEventListener("input", () => {
  if(!openId) return;
  state.memo[openId] = $("mMemo").value;
  clearTimeout(memoTimer); memoTimer = setTimeout(() => { memoTimer = null; save(); }, 600);
});
function flushMemo(){ if(memoTimer){ clearTimeout(memoTimer); memoTimer = null; save(); } }

/* ---------- purchase ---------- */
function openBuy(){
  $("bTitle").textContent = `${D.name} 完全版`;
  $("bLead").textContent = D.buy.lead;
  const ul = $("bList"); ul.textContent = "";
  D.chapters.forEach((c, ci) => { if(isFree(ci)) return; const li = document.createElement("li"); li.textContent = `${c.t}（${c.m.length}ミッション）`; ul.appendChild(li); });
  $("bPrice").textContent = D.buy.price;
  const a = $("bBuy");
  if(D.buy.url){ a.href = D.buy.url; a.removeAttribute("aria-disabled"); a.textContent = "購入ページへ"; }
  else { a.removeAttribute("href"); a.setAttribute("aria-disabled", "true"); a.textContent = "購入ページは準備中です"; }
  $("bCode").value = ""; $("bErr").textContent = "";
  show("buy");
}
async function sha256(text){
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}
$("bApply").onclick = async () => {
  const code = $("bCode").value.trim().toUpperCase().replace(/\s+/g, "");
  if(!code){ $("bErr").textContent = "購入コードを入力してください。"; return; }
  if(!window.crypto || !crypto.subtle){ $("bErr").textContent = "このブラウザでは確認できません。Safariで開き直してください。"; return; }
  const h = await sha256(D.id + ":" + code);
  if((D.buy.codeHashes || []).includes(h)){
    unlocked = true; store(KEY_UNLOCK, true); hideAll(); render(); toast("全ミッションが開きました！");
  } else {
    $("bErr").textContent = "コードが違います。購入完了メールのコードを、ハイフンも含めてそのまま入力してください。";
  }
};
$("bClose").onclick = closeAny;
$("openCode").onclick = openBuy;

/* ---------- misc ---------- */
$("mClose").onclick = closeAny;
$("scrim").onclick = closeAny;
document.addEventListener("keydown", e => { if(e.key === "Escape" && openSheet) closeAny(); });
document.querySelectorAll(".chip").forEach(b => b.onclick = () => {
  filter = b.dataset.f;
  document.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
  render();
});
$("resetBtn").onclick = () => show("confirm");
$("cNo").onclick = closeAny;
$("cYes").onclick = () => { state = {done:{}, memo:{}, days:[]}; save(); closeAny(); render(); toast("リセットしました"); };
function toast(t){ const el = $("toast"); el.textContent = t; el.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => el.hidden = true, 1800); }

$("appName").textContent = D.name;
$("appSub").textContent = D.sub;
if(!load(KEY_WELCOME, false)){ $("welcome").hidden = false; }
$("welcomeOk").onclick = () => { store(KEY_WELCOME, true); $("welcome").hidden = true; };
render();

if("serviceWorker" in navigator && location.protocol === "https:" && !window.DRILL_PREVIEW){
  try{ navigator.serviceWorker.register("sw.js").catch(() => {}); }catch(e){}
}
})();
