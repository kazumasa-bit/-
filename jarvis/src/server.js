// J.A.R.V.I.S. — 音声で話しかけられるAI秘書のサーバー
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { clientTools, runTool } from "./tools.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3000);
const MODEL = process.env.JARVIS_MODEL ?? "claude-opus-5-5";
const MAX_STEPS = 10; // 1回の発話で回すツールループの上限

const client = new Anthropic();

const SYSTEM_PROMPT = `あなたは「ジャービス（J.A.R.V.I.S.）」。映画『アイアンマン』に登場するAI執事のように、落ち着いて知的で、少しだけウィットのある口調で主人を補佐する。
ユーザーのことは「ボス」と呼ぶ。

返答は音声で読み上げられる。次を守ること:
- 話し言葉の日本語で、基本は1〜3文に収める。詳しく頼まれたときだけ長く話す。
- Markdown、箇条書き記号、URL、絵文字は使わない。数字や記号は読み上げやすく書く。
- 遅延に敏感な用途なので、すぐに答え始める。

使える能力:
- 現在日時の確認、メモの保存・検索・削除、ToDoタスクの追加・一覧・完了。
- Web検索（ニュース、天気、調べ物など最新情報が要るとき）。
頼まれたことはツールで実際に実行してから、結果を短く報告する。できないことは正直に伝え、代わりにできることを提案する。`;

const tools = [
  ...clientTools,
  {
    type: "web_search_20260209",
    name: "web_search",
    max_uses: 3,
    user_location: { type: "approximate", country: "JP", timezone: "Asia/Tokyo" },
  },
];

// sessionId -> MessageParam[]（会話履歴。追記のみで、過去のターンは書き換えない）
const sessions = new Map();

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.resolve(here, "..", "public")));

app.post("/api/chat", async (req, res) => {
  const { sessionId, text } = req.body ?? {};
  if (typeof sessionId !== "string" || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "sessionId and text are required" });
  }

  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  const send = (event) => res.write(JSON.stringify(event) + "\n");

  const history = sessions.get(sessionId) ?? [];
  const messages = [...history, { role: "user", content: text.trim() }];

  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      const stream = client.beta.messages.stream({
        model: MODEL,
        max_tokens: 16000,
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        output_config: { effort: "low" },
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        tools,
        messages,
      });

      stream.on("text", (delta) => send({ type: "text", delta }));
      stream.on("streamEvent", (event) => {
        if (event.type === "content_block_start" && event.content_block.type === "server_tool_use") {
          send({ type: "status", message: "Web検索中…" });
        }
      });

      const message = await stream.finalMessage();

      if (message.stop_reason === "refusal") {
        send({ type: "text", delta: "申し訳ありません、ボス。その件はお手伝いできません。" });
        break;
      }

      messages.push({ role: "assistant", content: message.content });

      if (message.stop_reason === "pause_turn") continue;

      const toolUses = message.content.filter((b) => b.type === "tool_use");
      if (toolUses.length === 0) break;
      if (message.stop_reason === "max_tokens") {
        throw new Error("tool input truncated (max_tokens)");
      }

      for (const t of toolUses) send({ type: "status", message: `実行中: ${t.name}` });
      const results = await Promise.all(toolUses.map(runTool));
      messages.push({ role: "user", content: results });
      send({ type: "tools_done", names: toolUses.map((t) => t.name) });
    }

    sessions.set(sessionId, messages);
    send({ type: "done" });
  } catch (err) {
    // 失敗したターンは履歴に残さない（次の発話は直前の正常な状態から続く）
    console.error(err);
    const message =
      err instanceof Anthropic.AuthenticationError
        ? "APIキーが設定されていないか無効です。ANTHROPIC_API_KEY を確認してください。"
        : err instanceof Anthropic.RateLimitError
          ? "リクエストが混み合っています。少し待ってからもう一度お試しください。"
          : "エラーが発生しました。もう一度お試しください。";
    send({ type: "error", message });
  } finally {
    res.end();
  }
});

app.post("/api/reset", (req, res) => {
  sessions.delete(req.body?.sessionId);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`J.A.R.V.I.S. online → http://localhost:${PORT}  (model: ${MODEL})`);
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    console.warn("⚠ ANTHROPIC_API_KEY が未設定です。.env か環境変数で設定してください。");
  }
});
