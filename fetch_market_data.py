#!/usr/bin/env python3
"""日々の市場データを取得して Google Sheets に1行追記するスクリプト.

データ取得元:
  - Yahoo Finance (yfinance): 株価指数・為替・商品・暗号資産の終値
  - FRED (https://fred.stlouisfed.org): 金利・CPI・雇用などのマクロ指標
    ※ FRED_API_KEY が未設定の場合はマクロ指標をスキップします。

必要な環境変数:
  GOOGLE_CREDENTIALS_JSON : サービスアカウントの認証情報 (JSON文字列)
  SPREADSHEET_ID          : 書き込み先スプレッドシートのID
  WORKSHEET_NAME          : シート名 (省略時 "data")
  FRED_API_KEY            : FRED の API キー (マクロ指標を取る場合のみ)
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime
from zoneinfo import ZoneInfo

import gspread
import requests
import yfinance as yf
from google.oauth2.service_account import Credentials

JST = ZoneInfo("Asia/Tokyo")

# --- 取得する指標の定義 -----------------------------------------------------
# 手動で入力する列 (スクリプトは空欄で追記し、既存の入力値は上書きしません)
# 楽天証券の総資産は自動取得できないため、ここに時々手入力してください。
MANUAL_COLUMNS: list[str] = ["総資産(楽天証券)"]

# (列名, Yahoo Finance シンボル)
YFINANCE_METRICS: list[tuple[str, str]] = [
    ("日経平均", "^N225"),
    # TOPIX指数は Yahoo 側で取得できないことがあります。空欄が続く場合は
    # ETF "1306.T" (NEXT FUNDS TOPIX) を代理指標に差し替えてください。
    ("TOPIX", "^TOPX"),
    ("ダウ", "^DJI"),
    ("S&P500", "^GSPC"),
    ("NASDAQ", "^IXIC"),
    ("VIX", "^VIX"),
    ("ドル円", "JPY=X"),
    ("WTI原油", "CL=F"),
    ("金", "GC=F"),
    ("ビットコイン", "BTC-USD"),
]

# (列名, FRED シリーズID)  ※多くは月次なので最新の確報値を毎日記録します
FRED_METRICS: list[tuple[str, str]] = [
    ("米10年金利", "DGS10"),
    ("日本10年金利", "IRLTLT01JPM156N"),
    ("FRB政策金利", "DFF"),
    ("日銀政策金利", "INTDSRJPM193N"),
    ("米CPI", "CPIAUCSL"),
    ("日本CPI", "JPNCPIALLMINMEI"),
    ("米失業率", "UNRATE"),
    ("米非農業部門雇用者数", "PAYEMS"),
]


def fetch_yfinance(symbol: str) -> float | None:
    """直近の終値を返す。取得できなければ None。"""
    try:
        hist = yf.Ticker(symbol).history(period="7d")
        if hist.empty:
            print(f"  [warn] {symbol}: データが空でした", file=sys.stderr)
            return None
        close = hist["Close"].dropna()
        if close.empty:
            return None
        return round(float(close.iloc[-1]), 4)
    except Exception as exc:  # 個別の失敗で全体を止めない
        print(f"  [warn] {symbol}: 取得失敗 ({exc})", file=sys.stderr)
        return None


def fetch_fred(series_id: str, api_key: str) -> float | None:
    """FRED シリーズの最新観測値を返す。取得できなければ None。"""
    url = "https://api.stlouisfed.org/fred/series/observations"
    params = {
        "series_id": series_id,
        "api_key": api_key,
        "file_type": "json",
        "sort_order": "desc",
        "limit": 10,  # 末尾に "." (欠損) が並ぶことがあるので余裕を持つ
    }
    try:
        resp = requests.get(url, params=params, timeout=30)
        resp.raise_for_status()
        for obs in resp.json().get("observations", []):
            value = obs.get("value")
            if value and value != ".":
                return float(value)
        print(f"  [warn] {series_id}: 有効な値がありませんでした", file=sys.stderr)
        return None
    except Exception as exc:
        print(f"  [warn] {series_id}: 取得失敗 ({exc})", file=sys.stderr)
        return None


def open_worksheet():
    """サービスアカウントでスプレッドシートを開く。"""
    creds_json = os.environ.get("GOOGLE_CREDENTIALS_JSON")
    spreadsheet_id = os.environ.get("SPREADSHEET_ID")
    worksheet_name = os.environ.get("WORKSHEET_NAME", "data")

    if not creds_json or not spreadsheet_id:
        sys.exit("GOOGLE_CREDENTIALS_JSON と SPREADSHEET_ID を環境変数に設定してください。")

    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ]
    creds = Credentials.from_service_account_info(json.loads(creds_json), scopes=scopes)
    client = gspread.authorize(creds)
    spreadsheet = client.open_by_key(spreadsheet_id)

    try:
        return spreadsheet.worksheet(worksheet_name)
    except gspread.WorksheetNotFound:
        return spreadsheet.add_worksheet(title=worksheet_name, rows=1000, cols=40)


def main() -> None:
    fred_api_key = os.environ.get("FRED_API_KEY")

    # 1. データ収集 -------------------------------------------------------
    row: dict[str, object] = {"日付": datetime.now(JST).strftime("%Y-%m-%d")}

    # 手動入力列はヘッダーを確保するためだけに空欄で用意 (既存値は上書きしない)
    for col in MANUAL_COLUMNS:
        row[col] = None

    print("Yahoo Finance から取得中...")
    for label, symbol in YFINANCE_METRICS:
        row[label] = fetch_yfinance(symbol)
        print(f"  {label}: {row[label]}")

    if fred_api_key:
        print("FRED から取得中...")
        for label, series_id in FRED_METRICS:
            row[label] = fetch_fred(series_id, fred_api_key)
            print(f"  {label}: {row[label]}")
    else:
        print("FRED_API_KEY 未設定のためマクロ指標はスキップします。")
        for label, _ in FRED_METRICS:
            row[label] = None

    # 2. スプレッドシートへ追記 ------------------------------------------
    worksheet = open_worksheet()
    header = worksheet.row_values(1)

    if not header:
        # 初回: ヘッダー行を作成
        header = list(row.keys())
        worksheet.update("A1", [header])
        print("ヘッダー行を作成しました。")
    else:
        # 後から指標を増やした場合、新しい列名をヘッダー末尾に追加
        new_cols = [k for k in row.keys() if k not in header]
        if new_cols:
            header += new_cols
            worksheet.update("A1", [header])
            print(f"新しい列を追加しました: {new_cols}")

    # ヘッダーの並び順に合わせて値を整列 (欠損は空文字)
    values = [row.get(col, "") if row.get(col) is not None else "" for col in header]
    worksheet.append_row(values, value_input_option="USER_ENTERED")
    print(f"{row['日付']} の行を追記しました。")


if __name__ == "__main__":
    main()
