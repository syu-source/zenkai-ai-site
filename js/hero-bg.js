/* =========================================================================
   ZENKAI AI パートナーズ（仮） — hero-bg.js [V2]
   three.js による Hero 背景の粒子ネットワーク（漂浮パーティクル＋近距離連線、
   マウス視差つき）。#hero-canvas が存在するページでのみ動作する。

   読込方法: このファイルは ES Module として <script type="module"> で
   読み込む前提（three.js はUMDグローバルビルドを提供しないため）。
   importmap で "three" を解決できない/CDNがオフラインの場合は
   import が失敗するが、try/catch で捕捉し何もせず終了する
   （＝エラーを外に漏らさず、Hero部は CSS のグローだけで成立する）。

   prefers-reduced-motion の場合は生成自体を行わない。
   ========================================================================= */
(async function () {
  'use strict';

  try {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    var reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    var THREE = await import('three');

    var isMobile = window.innerWidth < 768;
    var PARTICLE_COUNT = isMobile ? 60 : 160;
    var LINK_DISTANCE = isMobile ? 90 : 130;
    var COLOR_A = new THREE.Color('#6366F1'); // indigo
    var COLOR_B = new THREE.Color('#22D3EE'); // cyan

    var container = canvas.parentElement || canvas;
    var width = container.clientWidth || window.innerWidth;
    var height = container.clientHeight || window.innerHeight;

    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, width / height, 1, 2000);
    camera.position.z = 480;

    /* --- 粒子生成 --- */
    var particles = [];
    var positions = new Float32Array(PARTICLE_COUNT * 3);
    var colors = new Float32Array(PARTICLE_COUNT * 3);

    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var p = {
        x: (Math.random() - 0.5) * 900,
        y: (Math.random() - 0.5) * 560,
        z: (Math.random() - 0.5) * 400,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        vz: (Math.random() - 0.5) * 0.18
      };
      particles.push(p);

      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;

      var mixed = COLOR_A.clone().lerp(COLOR_B, Math.random());
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    var pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    var pointMaterial = new THREE.PointsMaterial({
      size: isMobile ? 3.2 : 4,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    var points = new THREE.Points(pointGeometry, pointMaterial);
    scene.add(points);

    /* --- 近距離連線（LineSegments・毎フレーム座標更新） --- */
    var maxLines = PARTICLE_COUNT * 8;
    var linePositions = new Float32Array(maxLines * 2 * 3);
    var lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    var lineMaterial = new THREE.LineBasicMaterial({
      color: 0x8b93f5,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    var lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);

    var mouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', function (e) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    function resize() {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }
    window.addEventListener('resize', resize);

    var clock = new THREE.Clock();
    var visible = true;
    document.addEventListener('visibilitychange', function () {
      visible = document.visibilityState === 'visible';
    });

    function animate() {
      requestAnimationFrame(animate);
      if (!visible) return;

      var posAttr = pointGeometry.attributes.position;
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.x > 450 || p.x < -450) p.vx *= -1;
        if (p.y > 280 || p.y < -280) p.vy *= -1;
        if (p.z > 200 || p.z < -200) p.vz *= -1;

        posAttr.array[i * 3] = p.x;
        posAttr.array[i * 3 + 1] = p.y;
        posAttr.array[i * 3 + 2] = p.z;
      }
      posAttr.needsUpdate = true;

      // 連線の再計算（近い粒子同士のみ）
      var lineIndex = 0;
      var linkDistSq = LINK_DISTANCE * LINK_DISTANCE;
      for (var a = 0; a < PARTICLE_COUNT && lineIndex < maxLines; a++) {
        for (var b = a + 1; b < PARTICLE_COUNT && lineIndex < maxLines; b++) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var dz = particles[a].z - particles[b].z;
          var distSq = dx * dx + dy * dy + dz * dz;
          if (distSq < linkDistSq) {
            var li = lineIndex * 6;
            linePositions[li] = particles[a].x;
            linePositions[li + 1] = particles[a].y;
            linePositions[li + 2] = particles[a].z;
            linePositions[li + 3] = particles[b].x;
            linePositions[li + 4] = particles[b].y;
            linePositions[li + 5] = particles[b].z;
            lineIndex++;
          }
        }
      }
      lineGeometry.setDrawRange(0, lineIndex * 2);
      lineGeometry.attributes.position.needsUpdate = true;

      // マウス視差（軽微）
      camera.position.x += (mouse.x * 60 - camera.position.x) * 0.02;
      camera.position.y += (-mouse.y * 40 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      points.rotation.y += 0.0006;
      lineSegments.rotation.y += 0.0006;

      renderer.render(scene, camera);
    }

    animate();
  } catch (err) {
    // CDN未到達・WebGL非対応など。Hero は CSS のグローのみで成立するため
    // ここでは何もしない（コンソールにも余計な例外を投げない）。
    return;
  }
})();
