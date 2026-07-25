/* =========================================================================
   ZENKAI AI パートナーズ（仮） — effects.js [V2]
   GSAP / ScrollTrigger / Lenis を用いた高度演出。
   これらのCDNライブラリが読み込めない場合は、該当機能を静かにスキップする
   （typeof チェックで存在確認。存在しなければ何もしない＝エラーも出さず、
   コンテンツはCSSのデフォルト状態のまま完全に可視）。

   重要: [data-reveal] 等の初期非表示は、このファイルが実際にGSAPを使って
   アニメーションを開始する直前にのみ、JS（gsap）が動的に付与する。
   CSSファイル側では一切 opacity:0 等の事前非表示を行っていない。

   提供コンポーネント（data属性 / クラス）:
   - [data-reveal]                 : 単体要素、スクロールで上移動+フェードイン
   - [data-reveal-group]           : 直下の [data-reveal] 子要素をstagger
   - [data-reveal-delay="0.2"]     : 個別遅延（秒）
   - [data-counter="1234"]         : 数値カウントアップ
     [data-counter-suffix="%"]     : 接尾辞（任意）
     [data-counter-duration="1.5"] : 秒数（任意、既定1.6s）
   - [data-tilt]                   : カード3Dチルト + ホバーグロー
   - .btn-primary                  : マグネティックボタン（自動適用）
   - .cursor-glow                  : カーソル追従光斑（自動生成、PCのみ）
   ========================================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var hasGsap = typeof window.gsap !== 'undefined';
  var hasScrollTrigger = hasGsap && typeof window.ScrollTrigger !== 'undefined';
  var hasLenis = typeof window.Lenis !== 'undefined';
  var isCoarsePointer = window.matchMedia &&
    window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var isNarrow = window.innerWidth < 1120;

  if (hasGsap && hasScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  /* -----------------------------------------------------------------------
     0. Lenis 丝滑スクロール（reduced-motionでは通常スクロールのまま）
     ----------------------------------------------------------------------- */
  var lenis = null;
  function initLenis() {
    if (reduceMotion || !hasLenis) return;

    lenis = new window.Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 1
    });

    if (hasGsap) {
      lenis.on('scroll', hasScrollTrigger ? window.ScrollTrigger.update : function () {});
      window.gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        window.requestAnimationFrame(raf);
      }
      window.requestAnimationFrame(raf);
    }
  }

  /* -----------------------------------------------------------------------
     1. [data-reveal] / [data-reveal-group] スクロール入場アニメーション
     ----------------------------------------------------------------------- */
  function initReveal() {
    if (!hasGsap || reduceMotion) return;

    /* 入場アニメ中の要素に data-reveal-pending を立て、tilt等の他エフェクトが
       transform を上書き（overwrite）して途中停止＝縦ズレを起こすのを防ぐ。
       完了時は clearProps でインライン transform/opacity を必ず消し、
       最終位置が常にCSS本来のレイアウト（＝一直線）になるようにする。 */
    var singles = document.querySelectorAll('[data-reveal]:not([data-reveal-group] [data-reveal])');
    singles.forEach(function (el) {
      var delay = parseFloat(el.getAttribute('data-reveal-delay')) || 0;
      el.setAttribute('data-reveal-pending', '');
      window.gsap.from(el, {
        opacity: 0,
        y: 32,
        duration: 0.8,
        ease: 'power3.out',
        delay: delay,
        clearProps: 'opacity,transform',
        onComplete: function () { el.removeAttribute('data-reveal-pending'); },
        scrollTrigger: hasScrollTrigger ? {
          trigger: el,
          start: 'top 88%',
          once: true
        } : undefined
      });
    });

    var groups = document.querySelectorAll('[data-reveal-group]');
    groups.forEach(function (group) {
      var children = group.querySelectorAll('[data-reveal]');
      var items = children.length ? children : group.children;
      Array.prototype.forEach.call(items, function (item) {
        item.setAttribute('data-reveal-pending', '');
      });
      window.gsap.from(items, {
        opacity: 0,
        y: 32,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.12,
        clearProps: 'opacity,transform',
        onComplete: function () {
          Array.prototype.forEach.call(items, function (item) {
            item.removeAttribute('data-reveal-pending');
          });
        },
        scrollTrigger: hasScrollTrigger ? {
          trigger: group,
          start: 'top 85%',
          once: true
        } : undefined
      });
    });
  }

  /* -----------------------------------------------------------------------
     2. [data-counter] 数値カウントアップ
     ----------------------------------------------------------------------- */
  function initCounters() {
    var targets = document.querySelectorAll('[data-counter]');
    if (!targets.length) return;

    function animateCounter(el) {
      var end = parseFloat(el.getAttribute('data-counter')) || 0;
      var suffix = el.getAttribute('data-counter-suffix') || '';
      var duration = parseFloat(el.getAttribute('data-counter-duration')) || 1.6;
      var decimals = (String(end).split('.')[1] || '').length;

      if (reduceMotion || !hasGsap) {
        el.textContent = end.toLocaleString('ja-JP', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        return;
      }

      var counter = { value: 0 };
      window.gsap.to(counter, {
        value: end,
        duration: duration,
        ease: 'power2.out',
        onUpdate: function () {
          el.textContent = counter.value.toLocaleString('ja-JP', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
          }) + suffix;
        }
      });
    }

    if (hasScrollTrigger) {
      targets.forEach(function (el) {
        window.ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: function () { animateCounter(el); }
        });
      });
    } else if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      targets.forEach(function (el) { observer.observe(el); });
    } else {
      targets.forEach(animateCounter);
    }
  }

  /* -----------------------------------------------------------------------
     3. [data-tilt] カード3Dチルト + グロー
     ----------------------------------------------------------------------- */
  function initTilt() {
    if (reduceMotion || isCoarsePointer) return;

    var cards = document.querySelectorAll('[data-tilt]');
    cards.forEach(function (card) {
      var maxTilt = parseFloat(card.getAttribute('data-tilt-max')) || 8;

      function onMove(e) {
        if (card.hasAttribute('data-reveal-pending')) return;
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rotateY = (px - 0.5) * maxTilt * 2;
        var rotateX = (0.5 - py) * maxTilt * 2;

        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');

        var transform = 'perspective(900px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateY(-6px)';
        if (hasGsap) {
          window.gsap.to(card, { transform: transform, duration: 0.4, ease: 'power2.out', overwrite: true });
        } else {
          card.style.transform = transform;
        }
      }

      function onEnter() { card.classList.add('is-tilting'); }

      function onLeave() {
        card.classList.remove('is-tilting');
        if (card.hasAttribute('data-reveal-pending')) return;
        var transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
        if (hasGsap) {
          window.gsap.to(card, { transform: transform, duration: 0.5, ease: 'power3.out', overwrite: true });
        } else {
          card.style.transform = transform;
        }
      }

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });
  }

  /* -----------------------------------------------------------------------
     4. マグネティックボタン（.btn-primary）
     ----------------------------------------------------------------------- */
  function initMagneticButtons() {
    if (reduceMotion || isCoarsePointer) return;

    var buttons = document.querySelectorAll('.btn-primary');
    buttons.forEach(function (btn) {
      var strength = 0.35;

      function onMove(e) {
        var rect = btn.getBoundingClientRect();
        var x = (e.clientX - rect.left - rect.width / 2) * strength;
        var y = (e.clientY - rect.top - rect.height / 2) * strength;
        var transform = 'translate(' + x.toFixed(1) + 'px, ' + (y - 2).toFixed(1) + 'px)';
        if (hasGsap) {
          window.gsap.to(btn, { x: x, y: y - 2, duration: 0.3, ease: 'power2.out', overwrite: true });
        } else {
          btn.style.transform = transform;
        }
      }

      function onLeave() {
        if (hasGsap) {
          window.gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1, 0.5)', overwrite: true });
        } else {
          btn.style.transform = '';
        }
      }

      btn.addEventListener('mousemove', onMove);
      btn.addEventListener('mouseleave', onLeave);
    });
  }

  /* -----------------------------------------------------------------------
     5. カーソル追従光斑（PCのみ。全ページ1個生成）
     ----------------------------------------------------------------------- */
  function initCursorGlow() {
    if (reduceMotion || isCoarsePointer || isNarrow) return;

    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);

    var pos = { x: -1000, y: -1000 };
    var target = { x: -1000, y: -1000 };
    var hasMoved = false;

    document.addEventListener('mousemove', function (e) {
      target.x = e.clientX;
      target.y = e.clientY;
      hasMoved = true;
    });

    function raf() {
      if (hasMoved) {
        pos.x += (target.x - pos.x) * 0.12;
        pos.y += (target.y - pos.y) * 0.12;
        glow.style.transform = 'translate(' + pos.x + 'px, ' + pos.y + 'px)';
      }
      window.requestAnimationFrame(raf);
    }
    window.requestAnimationFrame(raf);
  }

  /* -----------------------------------------------------------------------
     初期化
     ----------------------------------------------------------------------- */
  function init() {
    initLenis();
    initReveal();
    initCounters();
    initTilt();
    initMagneticButtons();
    initCursorGlow();

    if (hasScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
