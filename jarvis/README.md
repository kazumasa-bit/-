# J.A.R.V.I.S.（ジャービス）

映画『アイアンマン』のAI執事をモデルにした、音声で話しかけられるAI秘書です。
ブラウザで話しかけると、Claude が考えてツールを実行し、声で返事をします。

## できること

- **音声で会話**：マイクで話す → 文字起こし → 応答を読み上げ（文ごとに順次読み上げるので待ち時間が短い）
- **常時待機モード**：「ジャービス」と呼びかけると起動（「ジャービス、明日の天気は？」のように続けて言ってもOK）
- **Web検索**：ニュース・天気・調べ物などの最新情報
- **メモ**：「〇〇を覚えておいて」「メモ見せて」
- **ToDo**：「金曜までに請求書を送る、をタスクに追加」「残りのタスクは？」
- **日時の確認**
- テキスト入力・読み上げミュート・会話リセットにも対応

## 使い方

```bash
cd jarvis
npm install
export ANTHROPIC_API_KEY=sk-ant-...   # https://console.anthropic.com で取得
npm start
```

ブラウザで http://localhost:3000 を開きます。

- 音声認識は **Chrome / Edge** で動作します（Web Speech API を使用）。
- マイクは `localhost` か HTTPS でのみ使えます。

環境変数:

| 変数 | 既定値 | 説明 |
|---|---|---|
| `ANTHROPIC_API_KEY` | （必須） | Claude API キー |
| `PORT` | `3000` | 待ち受けポート |
| `JARVIS_MODEL` | `claude-opus-5-5` | 使うモデル |

## 構成

```
jarvis/
├── src/server.js   # Express サーバー。Claude API をストリーミングで呼び、ツールループを回す
├── src/tools.js    # ジャービスのツール（日時・メモ・ToDo）。data/store.json に保存
└── public/         # HUD風の画面、音声認識・音声合成
```

- 会話履歴はサーバーのメモリ上に保持します（再起動でリセット）。
- メモとタスクは `data/store.json` に保存されます。

## 機能を増やすには

`src/tools.js` の `clientTools` にツール定義を、`handlers` に処理を追加するだけで、ジャービスが使えるようになります。
例えば Google カレンダー・Gmail・Slack・社内システムの API をつなぐと、「今日の予定は？」「〇〇さんにメールして」まで対応できます。
