/* =========================================================================
   ZENKAI OS — index-viz.js
   トップページ専用のデータビジュアル演出。
   現時点の担当は「課題共感区の統計リングチャート」のみ。

   設計方針:
   - 円周（stroke-dasharray）は SVG の r 属性から実算出する。数値は
     data-ring="20.4" のようにマークアップ側の実データだけを持ち、
     オフセットをハードコードしない。
   - 入場は IntersectionObserver のみで判定し、GSAP / ScrollTrigger には
     依存しない（CDN到達不可でも動作する）。
   - transform には一切触れないため、effects.js の [data-reveal] 入場アニメ
     および [data-tilt] の transform 制御（data-reveal-pending 機構）と
     競合しない。
   - prefers-reduced-motion: reduce では遷移なしで最終状態を即時表示。
   ========================================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initStatRings() {
    var rings = document.querySelectorAll('[data-ring]');
    if (!rings.length) return;

    var items = [];

    Array.prototype.forEach.call(rings, function (ring) {
      var value = ring.querySelector('.stat-ring__value');
      var track = ring.querySelector('.stat-ring__track');
      if (!value) return;

      var r = parseFloat(value.getAttribute('r'));
      if (!(r > 0)) return;

      var circumference = 2 * Math.PI * r;
      var percent = parseFloat(ring.getAttribute('data-ring'));
      if (!isFinite(percent)) percent = 0;
      percent = Math.max(0, Math.min(100, percent));

      var dash = circumference.toFixed(3);
      var filled = (circumference * (1 - percent / 100)).toFixed(3);

      if (track) {
        track.style.strokeDasharray = dash;
      }
      value.style.strokeDasharray = dash;
      /* 初期は空（＝全周ぶんオフセット） */
      value.style.strokeDashoffset = dash;

      items.push({ box: ring, el: value, target: filled });
    });

    if (!items.length) return;

    function fill(item) {
      item.el.style.strokeDashoffset = item.target;
    }

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(fill);
      return;
    }

    /* 監視対象は SVG 要素ではなく親の div（.stat-ring）。
       SVG子要素の監視はブラウザ差が出るため避ける。 */
    var byBox = new WeakMap();
    items.forEach(function (item) { byBox.set(item.box, item); });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var item = byBox.get(entry.target);
        if (item) fill(item);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.35 });

    items.forEach(function (item) { observer.observe(item.box); });
  }

  function init() {
    initStatRings();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
