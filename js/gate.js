/* 一時公開（GitHub Pages）専用の簡易パスワードゲート。
   github.io ドメイン上でのみ動作し、ローカルプレビュー・本番ドメインでは何もしない。
   認証状態は sessionStorage（ブラウザを閉じるまで有効）。
   ※静的ホスティングのためソースを読めば回避可能。あくまで一時プレビューの簡易ガード。 */
(function () {
  if (!/\.github\.io$/.test(location.hostname)) return;
  var ok = false;
  try { ok = sessionStorage.getItem('zk-gate') === 'ok'; } catch (e) {}
  if (ok) return;
  var to = encodeURIComponent(location.pathname + location.search + location.hash);
  location.replace('/zenkai-ai-site/gate.html?to=' + to);
})();
