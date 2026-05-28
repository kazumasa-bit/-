/**
 * 市場データ自動記録ロボット (Google Apps Script)
 * ------------------------------------------------------------
 * スプレッドシート自身の中で動き、毎日1行ずつ市場データを追記します。
 * GitHub やサービスアカウントは不要です。
 *
 * 使い方:
 *   1. スプレッドシートのメニュー「拡張機能 → Apps Script」を開く
 *   2. このコードをすべて貼り付けて保存
 *   3. 関数「setup」を一度実行 → 表示される画面で「許可」する
 *      （これで毎朝 7:00 に自動実行する予約までセットされます）
 *   4. 動作確認したいときは関数「recordDaily」を手動実行
 *
 * 金利・マクロ指標(FRED)も記録したい場合:
 *   下の FRED_API_KEY に、FRED の無料APIキーを貼り付けてください。
 *   （空のままなら株価指数・為替・暗号資産のみ記録します）
 */

// ===== 設定 ===============================================================
const SHEET_NAME = 'data';
const FRED_API_KEY = ''; // ← 金利・マクロも記録するなら FRED の鍵をここに貼る（任意）

// 手動入力する列（ロボットは空欄で追記し、入力済みの値は上書きしません）
const MANUAL_COLUMNS = ['総資産(楽天証券)'];

// GOOGLEFINANCE で取れる市場データ  （列名: シンボル）
const GF_METRICS = {
  '日経平均': 'INDEXNIKKEI:NI225',
  'TOPIX': 'INDEXTOPIX:TOPIX',
  'ダウ': 'INDEXDJX:.DJI',
  'S&P500': 'INDEXSP:.INX',
  'NASDAQ': 'INDEXNASDAQ:.IXIC',
  'VIX': 'INDEXCBOE:VIX',
  'ドル円': 'CURRENCY:USDJPY',
  'ビットコイン': 'CURRENCY:BTCUSD',
};

// FRED で取る金利・マクロ・商品  （列名: シリーズID）
const FRED_METRICS = {
  '米10年金利': 'DGS10',
  '日本10年金利': 'IRLTLT01JPM156N',
  'FRB政策金利': 'DFF',
  '日銀政策金利': 'INTDSRJPM193N',
  '米CPI': 'CPIAUCSL',
  '日本CPI': 'JPNCPIALLMINMEI',
  '米失業率': 'UNRATE',
  '米雇用者数(非農業)': 'PAYEMS',
  'WTI原油': 'DCOILWTICO',
  '金': 'GOLDAMGBD228NLBM',
};

// ===== 初回セットアップ（1回だけ実行）=====================================
function setup() {
  // 既存の同名トリガーを消してから作り直す（重複防止）
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'recordDaily') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('recordDaily').timeBased().everyDays(1).atHour(7).create();

  // 動作確認も兼ねて1回記録する
  recordDaily();
  SpreadsheetApp.getActive().toast('セットアップ完了！毎朝7時に自動記録します。', '市場データ記録', 5);
}

// ===== メイン処理（毎日実行される）=======================================
function recordDaily() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  // 1行分のデータを作る
  const row = {};
  row['日付'] = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd');
  MANUAL_COLUMNS.forEach(function (c) { row[c] = ''; }); // 手動列は空欄

  // --- 市場データ（GOOGLEFINANCE）---
  const gfValues = fetchGoogleFinance_(Object.values(GF_METRICS));
  Object.keys(GF_METRICS).forEach(function (label, i) {
    row[label] = gfValues[i];
  });

  // --- 金利・マクロ・商品（FRED）---
  Object.keys(FRED_METRICS).forEach(function (label) {
    row[label] = FRED_API_KEY ? fetchFred_(FRED_METRICS[label]) : '';
  });

  // ヘッダー行を用意（無ければ作成。新しい指標は末尾に追加）
  let header = sheet.getLastRow() > 0
    ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].filter(String)
    : [];
  if (header.length === 0) {
    header = Object.keys(row);
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
  } else {
    const newCols = Object.keys(row).filter(function (k) { return header.indexOf(k) === -1; });
    if (newCols.length) {
      header = header.concat(newCols);
      sheet.getRange(1, 1, 1, header.length).setValues([header]);
    }
  }

  // ヘッダーの順に並べて追記
  const values = header.map(function (col) {
    return (row[col] === undefined || row[col] === null) ? '' : row[col];
  });
  sheet.appendRow(values);
}

// ===== GOOGLEFINANCE をまとめて取得 ======================================
function fetchGoogleFinance_(symbols) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tmp = ss.getSheetByName('_tmp') || ss.insertSheet('_tmp');
  tmp.clear();

  const formulas = symbols.map(function (s) {
    return ['=IFERROR(GOOGLEFINANCE("' + s + '","price"),"")'];
  });
  tmp.getRange(1, 1, formulas.length, 1).setFormulas(formulas);
  SpreadsheetApp.flush();

  // GOOGLEFINANCE は読み込みに少し時間がかかるので数回待って読む
  let vals = [];
  for (let attempt = 0; attempt < 5; attempt++) {
    Utilities.sleep(1500);
    vals = tmp.getRange(1, 1, formulas.length, 1).getValues().map(function (r) { return r[0]; });
    const stillLoading = vals.some(function (v) { return v === '#N/A' || v === 'Loading...'; });
    if (!stillLoading) break;
  }

  // 後始末
  ss.deleteSheet(tmp);
  return vals.map(function (v) { return (v === '' || v === '#N/A') ? '' : v; });
}

// ===== FRED から最新値を取得 =============================================
function fetchFred_(seriesId) {
  const url = 'https://api.stlouisfed.org/fred/series/observations'
    + '?series_id=' + encodeURIComponent(seriesId)
    + '&api_key=' + encodeURIComponent(FRED_API_KEY)
    + '&file_type=json&sort_order=desc&limit=10';
  try {
    const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) return '';
    const obs = (JSON.parse(resp.getContentText()).observations) || [];
    for (let i = 0; i < obs.length; i++) {
      if (obs[i].value && obs[i].value !== '.') return Number(obs[i].value);
    }
  } catch (e) {
    Logger.log('FRED ' + seriesId + ' 取得失敗: ' + e);
  }
  return '';
}
