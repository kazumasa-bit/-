// ジャービスが使えるツール群。データは data/store.json にローカル保存する。
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const here = path.dirname(fileURLToPath(import.meta.url));
const STORE_PATH = path.resolve(here, "..", "data", "store.json");

async function loadStore() {
  try {
    return JSON.parse(await fs.readFile(STORE_PATH, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return { memos: [], tasks: [] };
    throw err;
  }
}

async function saveStore(store) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}

const newId = () => crypto.randomBytes(3).toString("hex");

const obj = (properties, required = []) => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
});

// Claude に渡すツール定義（クライアント側で実行するもの）
export const clientTools = [
  {
    name: "get_current_datetime",
    description: "現在の日時（日本時間）と曜日を取得する。日付や時刻に関する質問の前に使う。",
    input_schema: obj({}),
  },
  {
    name: "save_memo",
    description: "ユーザーに頼まれた事柄をメモとして記憶する。「覚えておいて」「メモして」などに使う。",
    input_schema: obj({ text: { type: "string", description: "メモの内容" } }, ["text"]),
  },
  {
    name: "search_memos",
    description: "保存済みメモを検索する。query を省略すると全件を返す。",
    input_schema: obj({ query: { type: "string", description: "検索キーワード" } }),
  },
  {
    name: "delete_memo",
    description: "IDを指定してメモを削除する。",
    input_schema: obj({ id: { type: "string" } }, ["id"]),
  },
  {
    name: "add_task",
    description: "ToDoタスクを追加する。期限があれば due に YYYY-MM-DD 形式で入れる。",
    input_schema: obj(
      {
        title: { type: "string" },
        due: { type: "string", description: "期限 (YYYY-MM-DD)" },
      },
      ["title"],
    ),
  },
  {
    name: "list_tasks",
    description: "ToDoタスクの一覧を返す。include_done=true で完了済みも含める。",
    input_schema: obj({ include_done: { type: "boolean" } }),
  },
  {
    name: "complete_task",
    description: "IDを指定してタスクを完了にする。",
    input_schema: obj({ id: { type: "string" } }, ["id"]),
  },
].map((t) => ({ ...t, strict: true, eager_input_streaming: true }));

// 入力の簡易バリデーション（ストリーミング時は API 側で検証されないため）
function validate(tool, input) {
  if (typeof input !== "object" || input === null) return "input must be an object";
  const { properties, required } = tool.input_schema;
  for (const key of required) {
    if (!(key in input)) return `missing required field: ${key}`;
  }
  for (const [key, value] of Object.entries(input)) {
    const spec = properties[key];
    if (!spec) return `unknown field: ${key}`;
    if (typeof value !== spec.type) return `field ${key} must be ${spec.type}`;
  }
  return null;
}

const handlers = {
  async get_current_datetime() {
    const now = new Date();
    return {
      datetime: now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
      weekday: now.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo", weekday: "long" }),
      iso: now.toISOString(),
    };
  },
  async save_memo({ text }) {
    const store = await loadStore();
    const memo = { id: newId(), text, created_at: new Date().toISOString() };
    store.memos.push(memo);
    await saveStore(store);
    return memo;
  },
  async search_memos({ query }) {
    const { memos } = await loadStore();
    if (!query) return memos;
    const q = query.toLowerCase();
    return memos.filter((m) => m.text.toLowerCase().includes(q));
  },
  async delete_memo({ id }) {
    const store = await loadStore();
    const before = store.memos.length;
    store.memos = store.memos.filter((m) => m.id !== id);
    await saveStore(store);
    return { deleted: before !== store.memos.length };
  },
  async add_task({ title, due }) {
    const store = await loadStore();
    const task = { id: newId(), title, due: due ?? null, done: false, created_at: new Date().toISOString() };
    store.tasks.push(task);
    await saveStore(store);
    return task;
  },
  async list_tasks({ include_done }) {
    const { tasks } = await loadStore();
    return include_done ? tasks : tasks.filter((t) => !t.done);
  },
  async complete_task({ id }) {
    const store = await loadStore();
    const task = store.tasks.find((t) => t.id === id);
    if (!task) return { error: `task ${id} not found` };
    task.done = true;
    await saveStore(store);
    return task;
  },
};

// tool_use ブロックを実行して tool_result ブロックを返す
export async function runTool(block) {
  const tool = clientTools.find((t) => t.name === block.name);
  if (!tool) {
    return { type: "tool_result", tool_use_id: block.id, is_error: true, content: `unknown tool: ${block.name}` };
  }
  const problem = validate(tool, block.input);
  if (problem) {
    return { type: "tool_result", tool_use_id: block.id, is_error: true, content: `INVALID_INPUT: ${problem}` };
  }
  try {
    const result = await handlers[block.name](block.input);
    return { type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) };
  } catch (err) {
    return { type: "tool_result", tool_use_id: block.id, is_error: true, content: String(err.message ?? err) };
  }
}
