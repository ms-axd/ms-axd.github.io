// Liquid Web — a verlet-physics web whose glossy liquid droplet chases the
// cursor, reaching gooey tendrils toward it (was a spider; now a liquid form).
(function () {
  var host = document.querySelector('.spider-web');
  var canvas = document.querySelector('[data-spider-web]');
  if (!host || !canvas) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d');

  // Colours adapt to the sidebar background luminance (light vs. dark theme).
  var strand = 'rgba(40, 44, 42, 0.32)';
  var strandSoft = 'rgba(40, 44, 42, 0.16)';
  var dewColor = 'rgba(255, 255, 255, 0.5)';
  var liquidColor = '#1a1c22';
  var liquidShade = '#2c2f38';

  function pickColors() {
    var bg = getComputedStyle(host.closest('.site-sidebar') || host).backgroundColor;
    var m = bg.match(/[\d.]+/g);
    if (!m) return;
    var r = +m[0], g = +m[1], b = +m[2];
    var lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (lum < 0.5) {
      // dark sidebar -> pale threads, dark liquid stays readable
      strand = 'rgba(226, 233, 228, 0.34)';
      strandSoft = 'rgba(226, 233, 228, 0.16)';
      dewColor = 'rgba(190, 255, 120, 0.55)';
      liquidColor = '#0c0e0c';
      liquidShade = '#1c2019';
    } else {
      strand = 'rgba(38, 42, 40, 0.34)';
      strandSoft = 'rgba(38, 42, 40, 0.15)';
      dewColor = 'rgba(255, 255, 255, 0.55)';
      liquidColor = '#191b20';
      liquidShade = '#2b2e37';
    }
  }

  // --- geometry ---------------------------------------------------------
  var W = 0, H = 0, cx = 0, cy = 0, R = 0;
  var SPOKES = 12;
  var RINGS = 6;
  var points = [];   // { x, y, ox, oy, pinned, dew }
  var links = [];    // { a, b, len, spoke }
  var grid = [];     // grid[ring][spoke] -> point index
  var center = null;
  var hold = null;   // web point the spider is attached to

  function makePoint(x, y, pinned) {
    points.push({ x: x, y: y, ox: x, oy: y, pinned: !!pinned, dew: false });
    return points.length - 1;
  }
  function link(a, b, spoke) {
    var dx = points[a].x - points[b].x;
    var dy = points[a].y - points[b].y;
    links.push({ a: a, b: b, len: Math.sqrt(dx * dx + dy * dy), spoke: !!spoke });
  }

  function build() {
    points = []; links = []; grid = [];
    center = makePoint(cx, cy, false);

    for (var r = 0; r < RINGS; r++) {
      grid[r] = [];
      // ease ring spacing so inner rings sit closer together
      var t = (r + 1) / RINGS;
      var rad = R * (0.12 + 0.88 * t * t);
      var outer = r === RINGS - 1;
      for (var s = 0; s < SPOKES; s++) {
        var ang = (s / SPOKES) * Math.PI * 2 - Math.PI / 2;
        // an anchor ring beyond the last one pins the web to the frame
        var pr = outer ? rad * 1.12 : rad;
        var px = cx + Math.cos(ang) * pr;
        var py = cy + Math.sin(ang) * pr;
        var idx = makePoint(px, py, outer);
        grid[r][s] = idx;
        if (Math.random() < 0.14) points[idx].dew = true;
      }
    }

    // radial threads (spokes)
    for (var s2 = 0; s2 < SPOKES; s2++) {
      link(center, grid[0][s2], true);
      for (var r2 = 0; r2 < RINGS - 1; r2++) link(grid[r2][s2], grid[r2 + 1][s2], true);
    }
    // capture spiral / rings
    for (var r3 = 0; r3 < RINGS; r3++) {
      for (var s3 = 0; s3 < SPOKES; s3++) {
        link(grid[r3][s3], grid[r3][(s3 + 1) % SPOKES], false);
      }
    }

    // spider grabs an inner ring point to sit on
    hold = grid[1][0];
  }

  // --- spider (Venom-style reaching tendrils) ---------------------------
  var spider = { x: 0, y: 0, ang: 0 };
  var LEGS = 8;
  var SEG = 7;          // nodes per tendril
  var legs = [];        // each: { nodes:[{x,y,ox,oy}], seg:restLen }
  function initSpider() {
    spider.x = cx; spider.y = cy;
    legs = [];
    for (var i = 0; i < LEGS; i++) {
      var nodes = [];
      for (var n = 0; n <= SEG; n++) nodes.push({ x: cx, y: cy, ox: cx, oy: cy });
      legs.push({ nodes: nodes, seg: R * 0.16 });
    }
  }

  // --- pointer ----------------------------------------------------------
  var pointer = { x: 0, y: 0, active: false };
  var idle = 0;

  function onMove(e) {
    var rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    // react while the cursor is anywhere near the sidebar column
    pointer.active = pointer.x > -140 && pointer.x < rect.width + 40 &&
                     pointer.y > -80 && pointer.y < rect.height + 80;
    if (pointer.active) idle = 0;
  }
  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('mouseleave', function () { pointer.active = false; });

  // --- sizing -----------------------------------------------------------
  function resize() {
    var rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2; cy = H / 2;
    R = Math.min(W, H) / 2 * 0.94;
    pickColors();
    build();
    initSpider();
    if (reduced) render();
  }

  // --- simulation -------------------------------------------------------
  function integrate() {
    var damp = 0.86;
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      if (p.pinned) continue;
      var vx = (p.x - p.ox) * damp;
      var vy = (p.y - p.oy) * damp;
      p.ox = p.x; p.oy = p.y;
      p.x += vx; p.y += vy;
      p.y += 0.06; // a touch of gravity so the web sags
    }
  }
  function solve() {
    for (var k = 0; k < 3; k++) {
      for (var i = 0; i < links.length; i++) {
        var l = links[i];
        var a = points[l.a], b = points[l.b];
        var dx = b.x - a.x, dy = b.y - a.y;
        var d = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        var diff = (l.len - d) / d * 0.5;
        var ox = dx * diff, oy = dy * diff;
        if (!a.pinned) { a.x -= ox; a.y -= oy; }
        if (!b.pinned) { b.x += ox; b.y += oy; }
      }
    }
  }

  // where the tendrils are reaching (the cursor, or a roaming point when idle)
  var aim = { x: 0, y: 0 };

  function stepSpider() {
    if (pointer.active) {
      aim.x = pointer.x; aim.y = pointer.y;
    } else {
      idle += 0.02;
      aim.x = cx + Math.cos(idle) * R * 0.7;
      aim.y = cy + Math.sin(idle * 1.3) * R * 0.55;
    }

    // body stays back on the web, drifting only slightly toward the cursor
    var bdx = aim.x - cx, bdy = aim.y - cy;
    var bd = Math.sqrt(bdx * bdx + bdy * bdy) || 0.0001;
    var bmax = R * 0.32;
    if (bd > bmax) { bdx = bdx / bd * bmax; bdy = bdy / bd * bmax; }
    var btx = cx + bdx, bty = cy + bdy;
    spider.x += (btx - spider.x) * 0.08;
    spider.y += (bty - spider.y) * 0.08;
    spider.ang = Math.atan2(aim.y - spider.y, aim.x - spider.x);

    // drag the held web point along -> the web stretches toward the spider
    var hp = points[hold];
    hp.pinned = true;
    hp.x = spider.x; hp.y = spider.y;
    hp.ox = spider.x; hp.oy = spider.y;

    // reach each tendril toward the cursor, fanned out around the aim direction
    var dm = Math.atan2(aim.y - spider.y, aim.x - spider.x);
    var reachDist = Math.min(Math.hypot(aim.x - spider.x, aim.y - spider.y), R * 1.25);
    var maxSeg = R * 0.2;
    for (var i = 0; i < LEGS; i++) {
      var leg = legs[i];
      var nodes = leg.nodes;
      var spread = ((i - (LEGS - 1) / 2) / (LEGS - 1)) * 1.9; // ~ -0.95..0.95 rad
      var ang = dm + spread;
      var reach = reachDist * (1 - Math.abs(spread) * 0.16);
      var tx = spider.x + Math.cos(ang) * reach;
      var ty = spider.y + Math.sin(ang) * reach;
      leg.seg = Math.min(maxSeg, Math.max(R * 0.05, (reach / SEG) * 1.12));

      // mount the tendril base on the body rim
      var mount = spider.ang + Math.PI + spread * 0.6;
      var body = R * 0.1;
      var ax = spider.x + Math.cos(mount) * body * 0.6;
      var ay = spider.y + Math.sin(mount) * body * 0.6;

      // verlet inertia -> whippy motion
      for (var n = 1; n <= SEG; n++) {
        var p = nodes[n];
        var vx = (p.x - p.ox) * 0.74, vy = (p.y - p.oy) * 0.74;
        p.ox = p.x; p.oy = p.y;
        p.x += vx; p.y += vy + 0.05;
      }
      // pull the tip toward the reach target
      var tip = nodes[SEG];
      tip.x += (tx - tip.x) * 0.32;
      tip.y += (ty - tip.y) * 0.32;

      // distance constraints, base pinned to the body mount
      for (var pass = 0; pass < 4; pass++) {
        nodes[0].x = ax; nodes[0].y = ay;
        for (var j = 0; j < SEG; j++) {
          var a = nodes[j], b = nodes[j + 1];
          var ddx = b.x - a.x, ddy = b.y - a.y;
          var d = Math.sqrt(ddx * ddx + ddy * ddy) || 0.0001;
          var diff = (leg.seg - d) / d;
          var ox = ddx * diff, oy = ddy * diff;
          if (j !== 0) { a.x -= ox * 0.5; a.y -= oy * 0.5; b.x += ox * 0.5; b.y += oy * 0.5; }
          else { b.x += ox; b.y += oy; }
        }
      }
    }
  }

  // --- render -----------------------------------------------------------
  function render() {
    ctx.clearRect(0, 0, W, H);

    // threads
    ctx.lineWidth = 1;
    for (var i = 0; i < links.length; i++) {
      var l = links[i];
      var a = points[l.a], b = points[l.b];
      ctx.strokeStyle = l.spoke ? strand : strandSoft;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // dew drops
    ctx.fillStyle = dewColor;
    for (var d = 0; d < points.length; d++) {
      if (!points[d].dew) continue;
      ctx.beginPath();
      ctx.arc(points[d].x, points[d].y, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    drawSpider();
  }

<<<<<<< HEAD
  // Metaball membrane: fills a smooth "neck" joining two liquid circles when
  // they are close enough, so nearby droplets read as one merged blob.
  // (canonical two-circle metaball connector, ported to canvas paths)
  function metaball(c1, r1, c2, r2) {
    var HALF_PI = Math.PI / 2, v = 0.5, handle = 2.4;
    var dx = c2.x - c1.x, dy = c2.y - c1.y;
    var d = Math.sqrt(dx * dx + dy * dy) || 0.0001;
    if (r1 === 0 || r2 === 0 || d > r1 + r2 * 2.5 || d <= Math.abs(r1 - r2)) return;
    var u1, u2;
    if (d < r1 + r2) {
      u1 = Math.acos((r1 * r1 + d * d - r2 * r2) / (2 * r1 * d));
      u2 = Math.acos((r2 * r2 + d * d - r1 * r1) / (2 * r2 * d));
    } else { u1 = 0; u2 = 0; }
    var ab = Math.atan2(dy, dx);
    var spread = Math.acos((r1 - r2) / d);
    var a1 = ab + u1 + (spread - u1) * v;
    var a2 = ab - u1 - (spread - u1) * v;
    var a3 = ab + Math.PI - u2 - (Math.PI - u2 - spread) * v;
    var a4 = ab - Math.PI + u2 + (Math.PI - u2 - spread) * v;
    var p1 = { x: c1.x + Math.cos(a1) * r1, y: c1.y + Math.sin(a1) * r1 };
    var p2 = { x: c1.x + Math.cos(a2) * r1, y: c1.y + Math.sin(a2) * r1 };
    var p3 = { x: c2.x + Math.cos(a3) * r2, y: c2.y + Math.sin(a3) * r2 };
    var p4 = { x: c2.x + Math.cos(a4) * r2, y: c2.y + Math.sin(a4) * r2 };
    var total = r1 + r2;
    var d2 = Math.min(v * handle, Math.sqrt((p1.x - p3.x) * (p1.x - p3.x) + (p1.y - p3.y) * (p1.y - p3.y)) / total);
    d2 *= Math.min(1, (d * 2) / total);
    var h1 = r1 * d2, h2 = r2 * d2;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.bezierCurveTo(
      p1.x - Math.cos(a1 - HALF_PI) * h1, p1.y - Math.sin(a1 - HALF_PI) * h1,
      p3.x + Math.cos(a3 - HALF_PI) * h2, p3.y + Math.sin(a3 - HALF_PI) * h2,
      p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.bezierCurveTo(
      p4.x + Math.cos(a4 + HALF_PI) * h2, p4.y + Math.sin(a4 + HALF_PI) * h2,
      p2.x - Math.cos(a2 + HALF_PI) * h1, p2.y - Math.sin(a2 + HALF_PI) * h1,
      p2.x, p2.y);
    ctx.closePath();
    ctx.fill();
  }

  function drawSpider() {
    var body = R * 0.16;

    // each tendril tip becomes a droplet: fat when gathered near the body,
    // small when flung out toward the cursor -> beads that merge and split
    var beads = [];
    for (var i = 0; i < LEGS; i++) {
      var tip = legs[i].nodes[SEG];
      var ddx = tip.x - spider.x, ddy = tip.y - spider.y;
      var dist = Math.sqrt(ddx * ddx + ddy * ddy);
      var near = 1 - Math.min(1, dist / (R * 0.9));       // 1 close, 0 far
      var pulse = 1 + Math.sin(tick + i) * 0.08;          // gentle liquid throb
      beads.push({ x: tip.x, y: tip.y, r: R * (0.05 + 0.06 * near) * pulse });
    }

    ctx.fillStyle = liquidColor;
    // necks first, then the round bodies on top -> one seamless blob
    for (var m = 0; m < beads.length; m++) {
      metaball({ x: spider.x, y: spider.y }, body, beads[m], beads[m].r);
    }
    ctx.beginPath();
    ctx.arc(spider.x, spider.y, body, 0, Math.PI * 2);
    ctx.fill();
    for (var n = 0; n < beads.length; n++) {
      ctx.beginPath();
      ctx.arc(beads[n].x, beads[n].y, beads[n].r, 0, Math.PI * 2);
      ctx.fill();
    }

    // wet sheen on the main droplet
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(spider.x - body * 0.34, spider.y - body * 0.4, body * 0.3, body * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    // a small glint on each bead
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (var g = 0; g < beads.length; g++) {
      ctx.beginPath();
      ctx.arc(beads[g].x - beads[g].r * 0.3, beads[g].y - beads[g].r * 0.35, beads[g].r * 0.35, 0, Math.PI * 2);
      ctx.fill();
=======
  function drawSpider() {
    var body = R * 0.13;

    // gooey liquid tendrils: rounded, fat at the base, thinning to a drip tip
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (var i = 0; i < LEGS; i++) {
      var nodes = legs[i].nodes;
      for (var j = 0; j < SEG; j++) {
        var a = nodes[j], b = nodes[j + 1];
        var t = j / SEG;
        ctx.strokeStyle = liquidColor;
        ctx.lineWidth = (1 - t) * 4.6 + 0.6;   // fat base -> thin tip, like a stretched drip
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      // a bead of liquid hanging off the tip
      var tip = nodes[SEG];
      ctx.fillStyle = liquidColor;
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 2.0, 0, Math.PI * 2);
      ctx.fill();
      // wet gloss running down each tendril
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      for (var k = 1; k <= SEG; k++) ctx.lineTo(nodes[k].x, nodes[k].y);
      ctx.stroke();
    }

    // body: a wobbling glossy droplet of liquid
    ctx.beginPath();
    var N = 18;
    for (var s = 0; s <= N; s++) {
      var ang = (s / N) * Math.PI * 2;
      var wob = 1 + Math.sin(ang * 3 + tick) * 0.06 + Math.sin(ang * 5 - tick * 1.3) * 0.04;
      var rr = body * wob;
      var xx = spider.x + Math.cos(ang) * rr;
      var yy = spider.y + Math.sin(ang) * rr;
      if (s === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
>>>>>>> e8ba5049310ddc9fa396f40014d2ae9bbf2096fb
    }
    ctx.closePath();
    // rounded sheen: lighter core toward the top-left, darker rim
    var grd = ctx.createRadialGradient(
      spider.x - body * 0.35, spider.y - body * 0.45, body * 0.15,
      spider.x, spider.y, body * 1.2);
    grd.addColorStop(0, liquidShade);
    grd.addColorStop(1, liquidColor);
    ctx.fillStyle = grd;
    ctx.fill();

    // specular highlight -> wet look
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(spider.x - body * 0.34, spider.y - body * 0.4, body * 0.3, body * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- loop -------------------------------------------------------------
  var running = false;
  var tick = 0;               // drives the droplet's idle wobble
  function frame() {
    if (!running) return;
    tick += 0.05;
    integrate();
    stepSpider();
    solve();
    render();
    requestAnimationFrame(frame);
  }

  function start() { if (!running && !reduced) { running = true; requestAnimationFrame(frame); } }
  function stop() { running = false; }

  // Only animate while the widget is on screen.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }).observe(host);
  }

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(resize, 150);
  });

  resize();
  start();
})();
