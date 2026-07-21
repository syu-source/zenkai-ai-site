/* =========================================================================
   ZENKAI AI パートナーズ（仮） — main.js [V2]
   依存ライブラリなし（Vanilla JS）。全ページ共通で読み込む。CDN失敗時も
   完全に単独で動作する（このファイル自体は外部ライブラリに依存しない）。

   機能:
   1. モバイルメニュー開閉（#navMobile は <header> の外に配置されている
      前提。backdrop-filter による containing block バグを避けるため）
   2. ヘッダーのスクロール状態（.is-scrolled）
   3. スクロール淡入の代替実装（GSAP/effects.js が読み込めない場合の
      最低限のフォールバック。IntersectionObserverで表示するのみで、
      初期状態はCSSで隠さないため、JS未実行でも常に完全に可視）
   4. 平滑アンカースクロール（固定ヘッダー分のオフセット補正）
   ========================================================================= */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------------------
     1. モバイルハンバーガーメニュー開閉
     ----------------------------------------------------------------------- */
  function initMobileNav() {
    var header = document.querySelector('.site-header');
    var navMobile = document.getElementById('navMobile');
    if (!header || !navMobile) return;

    var toggle = header.querySelector('.hamburger');
    if (!toggle) return;

    function closeNav() {
      navMobile.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    }

    function openNav() {
      navMobile.classList.add('is-open');
      toggle.classList.add('is-active');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('no-scroll');
    }

    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', navMobile.id || 'navMobile');

    toggle.addEventListener('click', function () {
      var isOpen = navMobile.classList.contains('is-open');
      if (isOpen) { closeNav(); } else { openNav(); }
    });

    // メニュー内のリンクをクリックしたら閉じる
    navMobile.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    // Escキーで閉じる
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMobile.classList.contains('is-open')) {
        closeNav();
        toggle.focus();
      }
    });

    // デスクトップ幅にリサイズされたら状態をリセット
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1120 && navMobile.classList.contains('is-open')) {
        closeNav();
      }
    });
  }

  /* -----------------------------------------------------------------------
     2. ヘッダーのスクロール状態（濃色ガラス背景への切り替え）
     ----------------------------------------------------------------------- */
  function initHeaderScrollState() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var ticking = false;
    var THRESHOLD = 8;

    function update() {
      ticking = false;
      if (window.scrollY > THRESHOLD) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* -----------------------------------------------------------------------
     3. スクロール淡入フォールバック（IntersectionObserver）
        effects.js（GSAP版）が動いている場合はそちらが担当するため、
        既に .is-visible-fallback 等の重複制御は行わず、単に「見えたら
        is-inview クラスを付ける」だけに留める。[data-reveal] 自体は
        CSSで隠していないため、このJSが動かなくても内容は常に見える。
     ----------------------------------------------------------------------- */
  function initRevealFallback() {
    var targets = document.querySelectorAll('[data-reveal], [data-reveal-group]');
    if (!targets.length || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* -----------------------------------------------------------------------
     4. 平滑アンカースクロール（固定ヘッダー分のオフセット補正）
     ----------------------------------------------------------------------- */
  function initSmoothAnchors() {
    var header = document.querySelector('.site-header');

    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href*="#"]');
      if (!link) return;

      var url;
      try {
        url = new URL(link.href, window.location.href);
      } catch (err) {
        return;
      }

      var samePage = url.pathname === window.location.pathname && url.hash;
      if (!samePage) return;

      var targetId = decodeURIComponent(url.hash.slice(1));
      if (!targetId) return;

      var targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      e.preventDefault();

      var headerHeight = header ? header.getBoundingClientRect().height : 0;
      var targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;

      window.scrollTo({
        top: targetTop,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });

      targetEl.setAttribute('tabindex', '-1');
      targetEl.focus({ preventScroll: true });

      history.pushState ? history.pushState(null, '', url.hash) : (window.location.hash = url.hash);
    });
  }

  /* -----------------------------------------------------------------------
     初期化
     ----------------------------------------------------------------------- */
  function init() {
    initMobileNav();
    initHeaderScrollState();
    initRevealFallback();
    initSmoothAnchors();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
