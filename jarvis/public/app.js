// J.A.R.V.I.S. フロントエンド: 音声認識 → サーバー → ストリーミング応答 → 音声合成
const $ = (id) => document.getElementById(id);
const core = $("core");
const stateEl = $("state");
const log = $("log");
const wakeToggle = $("wakeMode");

const WAKE_WORDS = ["ジャービス", "じゃーびす", "jarvis", "ジャーヴィス"];

let sessionId = crypto.randomUUID();
let busy = false;
let muted = false;

// ---------- 表示 ----------
setInterval(() => {
  $("clock").textContent = new Date().toLocaleString("ja-JP", { hour12: false });
}, 1000);

function setMode(mode, label) {
  core.classList.remove("listening", "thinking", "speaking");
  if (mode) core.classList.add(mode);
  stateEl.textContent = label ?? "";
}

function addMsg(cls, text = "") {
  const el = document.createElement("div");
  el.className = `msg ${cls}`;
  el.textContent = text;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  return el;
}

function idleLabel() {
  return wakeToggle.checked ? "待機中…「ジャービス」と呼びかけてください" : "タップして話しかける";
}

// ---------- 音声合成 ----------
const speechQueue = [];
let speaking = false;
let jaVoice = null;

function pickVoice() {
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith("ja"));
  jaVoice = voices.find((v) => /male|otoya|ichiro|keita/i.test(v.name)) ?? voices[0] ?? null;
}
if ("speechSynthesis" in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

function speak(text) {
  if (muted || !("speechSynthesis" in window) || !text.trim()) return;
  speechQueue.push(text);
  if (!speaking) speakNext();
}

function speakNext() {
  const text = speechQueue.shift();
  if (!text) {
    speaking = false;
    if (!busy) afterTurn();
    return;
  }
  speaking = true;
  stopRecognition(); // 自分の声を拾わないように
  setMode("speaking", "応答中");
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  if (jaVoice) u.voice = jaVoice;
  u.rate = 1.1;
  u.pitch = 0.9;
  u.onend = u.onerror = speakNext;
  speechSynthesis.speak(u);
}

function stopSpeaking() {
  speechQueue.length = 0;
  speechSynthesis?.cancel();
  speaking = false;
}

// ---------- サーバーとのやりとり ----------
async function ask(text) {
  if (!text.trim() || busy) return;
  busy = true;
  stopSpeaking();
  addMsg("user", text);
  setMode("thinking", "解析中…");

  const reply = addMsg("jarvis");
  let pending = ""; // 読み上げ待ちのテキスト（文単位で区切って読み上げる）

  const flushSentences = (force = false) => {
    const re = /[^。！？!?\n]*[。！？!?\n]/g;
    let m, last = 0;
    while ((m = re.exec(pending))) {
      speak(m[0]);
      last = re.lastIndex;
    }
    pending = pending.slice(last);
    if (force && pending.trim()) {
      speak(pending);
      pending = "";
    }
  };

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, text }),
    });
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let buf = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += value;
      let nl;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl);
        buf = buf.slice(nl + 1);
        if (!line) continue;
        const ev = JSON.parse(line);
        if (ev.type === "text") {
          reply.textContent += ev.delta;
          pending += ev.delta;
          flushSentences();
          log.scrollTop = log.scrollHeight;
        } else if (ev.type === "status") {
          if (!speaking) setMode("thinking", ev.message);
        } else if (ev.type === "tools_done") {
          // ツール実行の前後で文が切れるよう区切りを入れる
          if (reply.textContent && !/\s$/.test(reply.textContent)) reply.textContent += "\n";
          flushSentences(true);
        } else if (ev.type === "error") {
          addMsg("error", ev.message);
          speak(ev.message);
        }
      }
    }
    flushSentences(true);
  } catch (err) {
    addMsg("error", `通信エラー: ${err.message}`);
  } finally {
    if (!reply.textContent) reply.remove();
    busy = false;
    if (!speaking) afterTurn();
  }
}

function afterTurn() {
  setMode(null, idleLabel());
  if (wakeToggle.checked) startRecognition();
}

// ---------- 音声認識 ----------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recog = null;
let recognizing = false;
let awaitingCommand = false; // ウェイクワード検出後、次の発話を命令として受け付ける

function startRecognition({ command = false } = {}) {
  if (!SR) {
    stateEl.textContent = "このブラウザは音声認識に未対応です（Chrome / Edge 推奨）";
    return;
  }
  if (recognizing || busy || speaking) return;
  awaitingCommand = command;
  recog = new SR();
  recog.lang = "ja-JP";
  recog.interimResults = true;
  recog.continuous = wakeToggle.checked && !command;

  recog.onstart = () => {
    recognizing = true;
    if (command || !wakeToggle.checked) setMode("listening", "聞いています…");
    else setMode(null, idleLabel());
  };

  recog.onresult = (e) => {
    const result = e.results[e.results.length - 1];
    const transcript = result[0].transcript.trim();
    if (awaitingCommand || !wakeToggle.checked) {
      stateEl.textContent = transcript;
      if (result.isFinal) {
        awaitingCommand = false;
        stopRecognition();
        ask(transcript);
      }
      return;
    }
    // 待機モード: ウェイクワードを探す
    if (!result.isFinal) return;
    const lower = transcript.toLowerCase();
    const hit = WAKE_WORDS.find((w) => lower.includes(w.toLowerCase()));
    if (!hit) return;
    const rest = transcript.slice(lower.indexOf(hit.toLowerCase()) + hit.length).replace(/^[、,。\s]+/, "");
    stopRecognition();
    if (rest.length > 1) {
      ask(rest); // 「ジャービス、明日の予定は？」のように続けて言った場合
    } else {
      // 返事を読み上げると自分の声を拾うので、表示だけにしてすぐ聞き取りに入る
      addMsg("status", "はい、ボス。");
      setTimeout(() => startRecognition({ command: true }), 300);
    }
  };

  recog.onerror = (e) => {
    if (e.error === "not-allowed") {
      stateEl.textContent = "マイクの使用が許可されていません";
      wakeToggle.checked = false;
    }
  };

  recog.onend = () => {
    recognizing = false;
    if (busy || speaking) return;
    if (wakeToggle.checked) {
      setTimeout(() => startRecognition({ command: awaitingCommand }), 300);
    } else {
      setMode(null, idleLabel());
    }
  };

  recog.start();
}

function stopRecognition() {
  if (recog && recognizing) recog.abort();
  recognizing = false;
}

// ---------- UI イベント ----------
core.addEventListener("click", () => {
  if (speaking) {
    stopSpeaking();
    afterTurn();
    return;
  }
  if (recognizing && !wakeToggle.checked) {
    stopRecognition();
    return;
  }
  stopRecognition();
  startRecognition({ command: true });
});

wakeToggle.addEventListener("change", () => {
  stopRecognition();
  if (wakeToggle.checked) startRecognition();
  else setMode(null, idleLabel());
});

$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("text");
  ask(input.value);
  input.value = "";
});

$("mute").addEventListener("click", (e) => {
  muted = !muted;
  e.currentTarget.textContent = muted ? "🔇" : "🔊";
  if (muted) stopSpeaking();
});

$("reset").addEventListener("click", async () => {
  await fetch("/api/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  sessionId = crypto.randomUUID();
  log.innerHTML = "";
  addMsg("status", "会話をリセットしました。");
});

addMsg("jarvis", "おかえりなさい、ボス。ご用件をどうぞ。");
setMode(null, idleLabel());
