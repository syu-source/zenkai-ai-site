/* 一時公開（GitHub Pages / さくらサーバ仮URL）専用の簡易パスワードゲート。
   下記ホスト上でのみ動作し、ローカルプレビュー・本番ドメインでは何もしない。
   認証状態は sessionStorage（ブラウザを閉じるまで有効）。
   ※静的ホスティングのためソースを読めば回避可能。あくまで一時プレビューの簡易ガード。 */
(function () {
  var ROOT = null;
  if (/\.github\.io$/.test(location.hostname)) ROOT = '/zenkai-ai-site/';
  else if (/\.sakura\.ne\.jp$/.test(location.hostname)) ROOT = '/zenkai-os04/';
  if (!ROOT) return;
  var ok = false;
  try { ok = sessionStorage.getItem('zk-gate') === 'ok'; } catch (e) {}
  if (ok) return;
  var to = encodeURIComponent(location.pathname + location.search + location.hash);
  location.replace(ROOT + 'gate.html?to=' + to);
})();
