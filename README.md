# 市場データ自動記録 (Stock Market Data Tracker)

株価予測・勉強のために、毎日の市場データを Google スプレッドシートへ自動記録するツールです。
GitHub Actions で毎朝自動実行され、PC を起動しておく必要はありません（すべて無料の範囲で動きます）。

## 記録する指標

| カテゴリ | 指標 | データ元 |
|---|---|---|
| 株価指数 | 日経平均 / TOPIX / ダウ / S&P500 / NASDAQ / VIX | Yahoo Finance |
| 為替・商品 | ドル円 / WTI原油 / 金 / ビットコイン | Yahoo Finance |
| 金利 | 米10年金利 / 日本10年金利 / FRB政策金利 / 日銀政策金利 | FRED |
| マクロ | 米CPI / 日本CPI / 米失業率 / 米非農業部門雇用者数 | FRED |

> 雇用統計・CPI・金利の一部は**月次**データのため、発表があるまでは最新の確報値が毎日同じ値で記録されます（分析時はそのまま使えます）。

### 総資産（楽天証券）について

`総資産(楽天証券)` という列を用意しています。楽天証券には資産額を外部へ渡す公式の仕組み（API）がなく、**安全に自動取得する方法がありません**（パスワードの受け渡しは行いません）。そのため、この列は**手入力**で使ってください。スクリプトはこの列を空欄で追記するだけなので、あなたが入力した数字は上書きされず残ります。毎日でなく、週1・月1の記録でも分析には十分です。

指標を増やしたいときは `fetch_market_data.py` の `YFINANCE_METRICS` / `FRED_METRICS` に1行追加するだけです。スプレッドシート側にも自動で新しい列が追加されます。

## セットアップ手順

データの記録には2つの準備が必要です。**①Google Sheetsへの書き込み権限** と **②FREDのAPIキー**（マクロ指標を取る場合のみ）です。

### 1. Google サービスアカウントを作る

スクリプトがあなたの代わりにスプレッドシートへ書き込むための「ロボット用アカウント」を作ります。

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. 「APIとサービス」→「ライブラリ」で **Google Sheets API** と **Google Drive API** を有効化
3. 「APIとサービス」→「認証情報」→「認証情報を作成」→「サービスアカウント」を作成
4. 作成したサービスアカウントの「キー」タブ →「鍵を追加」→「JSON」を選び、JSONファイルをダウンロード
5. JSON内の `client_email`（例: `xxx@yyy.iam.gserviceaccount.com`）をコピー

### 2. スプレッドシートを用意して共有する

1. 記録先の Google スプレッドシートを新規作成
2. 右上「共有」で、手順1でコピーした `client_email` を **編集者** として追加
3. URL からスプレッドシートIDを控える
   `https://docs.google.com/spreadsheets/d/`**`この部分がID`**`/edit`

### 3. FRED の API キーを取得（金利・マクロ指標用）

1. <https://fredaccount.stlouisfed.org/apikeys> で無料アカウントを作りAPIキーを取得
   （株価指数・為替・商品だけで良ければこの手順は省略可。その場合マクロ指標は空欄になります）

### 4. GitHub に Secrets を登録する

リポジトリの **Settings → Secrets and variables → Actions → New repository secret** で以下を登録します。

| Secret 名 | 値 |
|---|---|
| `GOOGLE_CREDENTIALS_JSON` | 手順1でダウンロードしたJSONファイルの中身（全文を貼り付け） |
| `SPREADSHEET_ID` | 手順2で控えたスプレッドシートID |
| `FRED_API_KEY` | 手順3のAPIキー（任意） |
| `WORKSHEET_NAME` | 書き込むシート名（任意・省略時は `data`） |

### 5. 動作確認

**Actions** タブ →「Daily Market Data」→「Run workflow」で手動実行できます。
成功するとスプレッドシートに1行追記されます。以降は毎朝 JST 7:00 に自動実行されます。

## ローカルで試す場合

```bash
pip install -r requirements.txt

export GOOGLE_CREDENTIALS_JSON="$(cat service_account.json)"
export SPREADSHEET_ID="あなたのスプレッドシートID"
export FRED_API_KEY="あなたのFREDキー"   # 任意

python fetch_market_data.py
```

## 実行タイミングについて

`.github/workflows/daily-market-data.yml` の cron は **UTC 22:00（= JST 翌7:00）** に設定しています。
米国市場のクローズ後・日本市場の寄り付き前のため、前営業日の確定値がそろったタイミングです。
変更したい場合は cron 式を編集してください。
