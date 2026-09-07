/* 朝のLINE（畑Bot）と繋ぐ設定。
   空のままなら、アプリは今までどおり端末の中だけで動きます。

   url   … 畑Bot の実行口（secrets.env の HATAKE_BOT_EXEC_URL）。末尾は /exec
   token … hatake_bot/main.js の HTK_MINE_TOKEN と同じ値。
           公開サイトのJSに載るので、ほかのトークンとは別の、長いランダム文字列にすること。
           もし漏れても、できるのは「マイ畑の控えの書き換え」までです。 */
window.HTK_SYNC = {
  url: '',
  token: ''
};
