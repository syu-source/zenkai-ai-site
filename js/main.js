/* =========================================================================
   ZENKAI AI パートナーズ（仮） — main.js
   依存ライブラリなし（Vanilla JS）。全ページ共通で読み込む。
   機能: モバイルメニュー開閉 / スクロール淡入(IntersectionObserver) / 平滑スクロール
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
    if (!header) return;

    var toggle = header.querySelector('.hamburger');
    var navMobile = header.querySelector('.nav-mobile');
    if (!toggle || !navMobile) return;

    function closeNav() {
      header.classList.remove('is-nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    }

    function openNav() {
      header.classList.add('is-nav-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('no-scroll');
    }

    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', navMobile.id || '');

    toggle.addEventListener('click', function () {
      var isOpen = header.classList.contains('is-nav-open');
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    // メニュー内のリンクをクリックしたら閉じる
    navMobile.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    // Escキーで閉じる
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-nav-open')) {
        closeNav();
        toggle.focus();
      }
    });

    // デスクトップ幅にリサイズされたら状態をリセット
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1120 && header.classList.contains('is-nav-open')) {
        closeNav();
      }
    });
  }

  /* -----------------------------------------------------------------------
     2. スクロール淡入（IntersectionObserver）
        prefers-reduced-motion の場合は即座に表示し監視しない
     ----------------------------------------------------------------------- */
  function initFadeIn() {
    var targets = document.querySelectorAll('.fade-in');
    if (!targets.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
      }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* -----------------------------------------------------------------------
     3. 平滑アンカースクロール（固定ヘッダー分のオフセット補正）
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

      // アクセシビリティ: フォーカス移動
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
    initFadeIn();
    initSmoothAnchors();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
