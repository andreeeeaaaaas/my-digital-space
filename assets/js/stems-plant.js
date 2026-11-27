// The Stems loading animation, live: a port of PlantEngine (PlantGrowth.swift in the Stems app).
// Each cycle grows a new plant from a fresh seed, alternating the app's two styles (fork and bed),
// blooms one flower per stem, holds, then starts over.
//
// Greys are drawn as ink at level/15 opacity, so the app's 16-level ramp sits on any background:
// white ink in dark mode (as in the app), black ink in light mode (the ramp inverted).
// Follows the site's theme toggle and the system setting, pauses off-screen, and with reduced
// motion shows one still, fully bloomed plant until the visitor presses play.
(function () {
  const SIZE = 96, GROUND = 88, FPS = 12;
  const GROW_SECONDS = 4.5, HOLD_SECONDS = 2.5, SPLIT = 0.96;

  // MARK: Maths, matching the Swift (UInt32 wrapping, rounding half away from zero)

  const round = (x) => (x < 0 ? -Math.round(-x) : Math.round(x));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function mix(...keys) {
    let h = 2166136261;
    for (const k of keys) h = Math.imul(h ^ k, 16777619) >>> 0;
    return h;
  }

  function unit(key) {
    let h = key >>> 0;
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  // mulberry32
  function random(seed) {
    let state = seed >>> 0;
    const r = {
      next() {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      },
      int: (upper) => Math.min(upper - 1, Math.trunc(r.next() * upper)),
      between: (a, b) => a + (b - a) * r.next(),
      shuffled(list) {
        list = list.slice();
        for (let i = list.length - 1; i > 0; i--) {
          const j = r.int(i + 1);
          [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
      },
    };
    return r;
  }

  function noise(t, seed) {
    const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f);
    const a = unit(mix(i >>> 0, seed)), b = unit(mix((i + 1) >>> 0, seed));
    return a + (b - a) * u;
  }

  // Bends everything above the soil, more the higher it is.
  function wind(time, seed, amp, still) {
    amp = still ? 0 : amp;
    const w = (noise(time * 0.35, seed) * 2 - 1) * 1.3 + (noise(time * 1.4, (seed + 9) >>> 0) * 2 - 1) * 0.35;
    return (y) => {
      const h = Math.max(0, GROUND - y) / 56;
      return round(amp * w * h * h);
    };
  }

  // MARK: Lines

  function line(a, b, out) {
    let x = a.x, y = a.y;
    const dx = Math.abs(b.x - a.x), sx = a.x < b.x ? 1 : -1, dy = -Math.abs(b.y - a.y), sy = a.y < b.y ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      const last = out[out.length - 1];
      if (!last || last.x !== x || last.y !== y) out.push({ x, y });
      if (x === b.x && y === b.y) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x += sx; }
      if (e2 <= dx) { err += dx; y += sy; }
    }
  }

  // A quadratic curve as a one-pixel line, base to tip.
  function bezier(a, c, b) {
    const n = Math.max(4, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 2));
    const at = (t) => {
      const u = 1 - t;
      return { x: round(u * u * a[0] + 2 * u * t * c[0] + t * t * b[0]), y: round(u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]) };
    };
    const out = [at(0)];
    for (let i = 1; i <= n; i++) line(out[out.length - 1], at(i / n), out);
    // Drop the inside pixel of each L corner so the line stays one pixel thin.
    const thin = [];
    out.forEach((p, i) => {
      const prev = thin[thin.length - 1];
      if (prev && i + 1 < out.length && Math.abs(prev.x - out[i + 1].x) === 1 && Math.abs(prev.y - out[i + 1].y) === 1) return;
      thin.push(p);
    });
    return thin;
  }

  // MARK: Grid

  function grid() {
    const levels = new Int8Array(SIZE * SIZE).fill(-1);
    const colours = new Uint32Array(SIZE * SIZE);
    const inside = (x, y) => x >= 0 && x < SIZE && y >= 0 && y < SIZE;
    return {
      levels, colours,
      put(x, y, level) {
        if (!inside(x, y)) return;
        levels[y * SIZE + x] = clamp(level, 0, 15);
        colours[y * SIZE + x] = 0;
      },
      paint(x, y, rgb) {
        if (!inside(x, y)) return;
        levels[y * SIZE + x] = 15;
        colours[y * SIZE + x] = rgb;
      },
    };
  }

  function drawPath(g, path, count, level, dx) {
    const moved = path.slice(0, count).map((p) => ({ x: p.x + dx(p.y), y: p.y }));
    const drawn = [];
    moved.forEach((p, i) => (i === 0 ? drawn.push(p) : line(moved[i - 1], p, drawn)));
    for (const p of drawn) g.put(p.x, p.y, level);
    return moved;
  }

  function leaf(g, p, side, past) {
    const stage = past > 9 ? 3 : past > 5 ? 2 : 1;
    g.put(p.x + side, p.y, 7);
    if (stage >= 2) { g.put(p.x + 2 * side, p.y - 1, 8); g.put(p.x + 2 * side, p.y, 6); }
    if (stage >= 3) { g.put(p.x + 3 * side, p.y - 1, 8); g.put(p.x + 4 * side, p.y - 2, 7); }
  }

  // MARK: Flowers

  // Vocals a daisy, drums a tulip, bass a sunflower, other lavender, guitar a rose, piano a lily.
  const species = (n) =>
    n === 2 ? ["daisy", "sunflower"]
      : n === 4 ? ["daisy", "tulip", "sunflower", "spike"]
        : ["daisy", "tulip", "sunflower", "spike", "rose", "lily"];

  // Bottom-centre anchored. P petal, S petal shade, K dark core, C centre.
  const sprites = {
    bud: [".S.", "SSS", "SSS"],
    open: ["P.P.P", ".PSP.", "..S.."],
    daisy: ["...P...", ".P.P.P.", "..SCS..", "PPCCCPP", "..SCS..", ".P.P.P.", "...P..."],
    tulip: ["P.P.P", "PSPSP", "PPPPP", "PPSPP", ".PPP."],
    sunflower: ["...P.P...", ".P.PPP.P.", "..PKKKP..", "PPKKKKKPP", ".PKKCKKP.", "PPKKKKKPP", "..PKKKP..", ".P.PPP.P.", "...P.P..."],
    spike: [".P.", "PSP", ".P.", "PSP", ".P.", "PSP", ".P.", "PSP", ".S.", ".S."],
    rose: [".PPP.", "PSSPP", "PSPSP", "PPSSP", ".PPP."],
    lily: ["P.....P", ".P.P.P.", "..PCP..", "PPCCCPP", ".PPSPP.", "...S..."],
  };

  // Petal, shade and centre. Dark is the app's (Apple's dark-appearance colours); light swaps in
  // Apple's light-appearance petals with shades and centres mixed the same way.
  const palettes = {
    dark: {
      daisy: [0xff375f, 0x801c30, 0xffb9c7],
      tulip: [0xbf5af2, 0x602d79, 0xe5bdfa],
      sunflower: [0xff9f0a, 0x805005, 0xffdda9],
      spike: [0x0a84ff, 0x054280, 0x9dceff],
      rose: [0xff453a, 0x80231d, 0xffb5b0],
      lily: [0xffd60a, 0x806b05, 0xfff1a8],
    },
    light: {},
  };
  const lightPetals = { daisy: 0xff2d55, tulip: 0xaf52de, sunflower: 0xff9500, spike: 0x007aff, rose: 0xff3b30, lily: 0xffcc00 };
  const mixRGB = (rgb, to, by) =>
    [16, 8, 0].reduce((out, s) => out | (Math.round(((rgb >> s) & 255) * (1 - by) + to * by) << s), 0);
  for (const [name, petal] of Object.entries(lightPetals)) {
    palettes.light[name] = [petal, mixRGB(petal, 0, 0.5), mixRGB(petal, 255, 0.6)];
  }

  function sprite(g, name, anchor, level, colours, flash) {
    const rows = sprites[name];
    const x0 = anchor.x - Math.floor(rows[0].length / 2), y0 = anchor.y - rows.length;
    rows.forEach((row, r) => {
      [...row].forEach((ch, c) => {
        if (ch === ".") return;
        const x = x0 + c, y = y0 + r;
        if (name === "bud") return g.put(x, y, 10);
        if (flash && ch !== "K") return g.put(x, y, 15);
        if (ch === "K") return g.put(x, y, 2);
        if (colours) return g.paint(x, y, ch === "P" ? colours[0] : ch === "S" ? colours[1] : colours[2]);
        g.put(x, y, ch === "P" ? level : ch === "S" ? Math.max(2, level - 5) : level >= 12 ? 3 : 15);
      });
    });
  }

  // MARK: Engine

  function stemLevels(n) {
    const span = n === 2 ? 7 : n === 4 ? 9 : 10;
    return Array.from({ length: n }, (_, i) => 15 - round((i * span) / Math.max(1, n - 1)));
  }

  function forkPlant(n, r) {
    for (let i = 0; i < 600; i++) {
      const plant = branch(n, r, true);
      if (plant) return withLeaves(plant, r);
    }
    return withLeaves(branch(n, r, false) || [], r);
  }

  function branch(n, r, check) {
    const segs = [];
    // The trunk and each split take a random length, so the forks land at random heights.
    function grow(start, angle, count, parent) {
      const single = count === 1;
      const range = parent == null ? [8, 44] : single ? [8, 20] : [6, 16];
      const length = r.between(range[0], range[1]), bendTo = angle * r.between(0.55, 0.85);
      const control = [start[0] + (Math.sin(angle) * length) / 2, start[1] - (Math.cos(angle) * length) / 2];
      const end = [control[0] + (Math.sin(bendTo) * length) / 2, control[1] - (Math.cos(bendTo) * length) / 2];
      const path = bezier(start, control, end), c0 = parent == null ? 0 : segs[parent].c1;
      segs.push({
        path, depth: parent == null ? 0 : segs[parent].depth + 1,
        c0, c1: c0 + path.length * r.between(0.85, 1.15), isTip: single, stem: 0, leaves: [],
      });
      if (single) return;
      const tip = path[path.length - 1], me = segs.length - 1;
      const k = count >= 3 && r.next() < 0.3 ? 3 : 2;
      const sizes = new Array(k).fill(1);
      for (let i = k; i < count; i++) sizes[r.int(k)] += 1;
      const spread = 1.35 * r.between(0.6, 1.2) * (0.55 + (0.45 * count) / n);
      let before = 0;
      for (const size of sizes) {
        const position = ((before + size / 2) / count) * 2 - 1;
        before += size;
        const childAngle = Math.min(1.4, Math.max(-1.4, bendTo + spread * position + (r.next() - 0.5) * 0.25));
        grow([tip.x, tip.y], childAngle, size, me);
      }
    }
    grow([48, GROUND], (r.next() - 0.5) * 0.25, n, null);

    const tips = segs.map((s, i) => (s.isTip ? i : -1)).filter((i) => i >= 0);
    const last = (i) => segs[i].path[segs[i].path.length - 1];
    if (check) {
      for (const s of segs) for (const p of s.path) if (p.x < 3 || p.x > 92 || p.y < 10) return null;
      for (const t of tips) {
        const p = last(t);
        if (p.x < 7 || p.x > 89 || p.y < 20 || p.y > 76) return null;
      }
      for (let i = 0; i < tips.length; i++) {
        for (let j = i + 1; j < tips.length; j++) {
          const p = last(tips[i]), q = last(tips[j]);
          if (Math.abs(p.x - q.x) < 10 && Math.abs(p.y - q.y) < 12) return null;
        }
      }
    }
    // Stems left to right, and the slowest tip finishes growing at 1.
    tips.slice().sort((a, b) => last(a).x - last(b).x).forEach((t, i) => (segs[t].stem = i));
    const total = Math.max(...tips.map((t) => segs[t].c1)) || 1;
    for (const s of segs) { s.c0 /= total; s.c1 /= total; }
    return segs;
  }

  function withLeaves(segs, r) {
    for (const s of segs) {
      let k = 4;
      while (k < s.path.length - 3) {
        if (r.next() < 0.7) s.leaves.push({ k, side: r.next() < 0.5 ? -1 : 1 });
        k += 6 + r.int(6);
      }
    }
    return segs;
  }

  const heights = { daisy: 44, tulip: 34, sunflower: 52, spike: 40, rose: 36, lily: 46 };

  // One plant per stem, each a different flower. Height, spacing and lean change per seed.
  function bedPlant(n, r) {
    const spacing = n === 2 ? 30 : n === 4 ? 20 : 13, names = species(n);
    const order = r.shuffled([...Array(n).keys()]);
    return names.slice(0, n).map((name, i) => {
      const slot = 48 + (i - (n - 1) / 2) * spacing;
      const jitter = (r.next() - 0.5) * spacing * 0.3;
      const x = round(slot + jitter);
      const h = heights[name] - 6 + r.int(16);
      const top = [x + round((r.next() * 2 - 1) * 4), GROUND - h];
      const path = bezier([x, GROUND], [x + (r.next() * 2 - 1) * 7, GROUND - h / 2], top);
      const k = Math.trunc(path.length * (0.18 + r.next() * 0.1));
      const leaves = [{ k, side: r.next() < 0.5 ? -1 : 1 }];
      if (h > 40) leaves.push({ k: Math.trunc(path.length / 2), side: -leaves[0].side });
      return { x, path, leaves, start: (order.indexOf(i) * 0.36) / n };
    });
  }

  function engine(style, stems, seed) {
    const r = random(seed), levels = stemLevels(stems), names = species(stems);
    const segments = style === "fork" ? forkPlant(stems, r) : [];
    const sprouts = style === "bed" ? bedPlant(stems, r) : [];

    function flower(g, name, tip, stem, bloom, still, palette) {
      const level = levels[stem % levels.length], colours = palette[name];
      if (bloom == null || bloom < 0) return sprite(g, "bud", tip, level);
      if (still || bloom >= 4) return sprite(g, name, tip, level, colours);
      sprite(g, bloom < 2 ? "open" : name, tip, level, colours, bloom === 2);
    }

    // growth runs 0...1 up to the split; bloom is how many frames ago the buds opened, or null.
    return function pixels(growth, frame, bloom, still, palette) {
      const g = grid(), t = frame / FPS, tips = [];
      if (style === "fork") {
        const dx = wind(t, seed, 2.2, still);
        for (let x = 41; x <= 55; x++) g.put(x, GROUND + 1, (x + 1) % 4 === 0 ? 4 : 3);
        for (let x = 37; x <= 59; x += 2) g.put(x, GROUND + 2, 2);
        for (const s of segments) {
          const f = clamp((growth - s.c0) / Math.max(0.0001, s.c1 - s.c0), 0, 1);
          const count = Math.ceil(s.path.length * f);
          if (count < 1) continue;
          const moved = drawPath(g, s.path, count, s.depth === 0 ? 9 : 8, dx);
          for (const l of s.leaves) if (count - l.k > 2) leaf(g, moved[l.k], l.side, count - l.k);
          const tip = moved[moved.length - 1];
          if (f < 1) g.put(tip.x, tip.y - 1, 10);
          else if (s.isTip) tips.push([s.stem, tip, names[s.stem % stems]]);
        }
      } else {
        const first = sprouts[0], last = sprouts[sprouts.length - 1];
        for (let x = first.x - 10; x <= last.x + 10; x++) g.put(x, GROUND + 1, x % 3 === 0 ? 4 : 3);
        for (let x = first.x - 9; x < last.x + 10; x += 2) g.put(x, GROUND + 2, 2);
        sprouts.forEach((p, i) => {
          const dx = wind(t + i * 0.4, seed, 1.8, still);
          const pg = clamp((growth - p.start) / 0.62, 0, 1);
          if (pg <= 0) return g.put(p.x, GROUND, 6);
          const count = Math.max(1, Math.ceil(p.path.length * pg));
          const moved = drawPath(g, p.path, count, 8, dx);
          for (const l of p.leaves) if (count - l.k > 2) leaf(g, moved[l.k], l.side, count - l.k);
          const tip = moved[moved.length - 1];
          if (pg >= 1) tips.push([i, tip, names[i]]);
          else g.put(tip.x, tip.y - 1, 9);
        });
      }
      // Flowers last, so no stalk crosses them.
      for (const [stem, tip, name] of tips) flower(g, name, tip, stem, bloom, still, palette);
      return g;
    };
  }

  // MARK: Page

  const icon = (body) =>
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">' + body + "</svg>";
  const pauseIcon = icon('<path d="M3 1.5h2.5v11H3zM8.5 1.5H11v11H8.5z" fill="currentColor"/>');
  const playIcon = icon('<path d="M3.5 1.5v11L12 7z" fill="currentColor"/>');
  const restartIcon = icon('<path d="M1.75 7a5.25 5.25 0 1 0 1.54-3.71L1.75 4.67M1.75 1.75v2.92h2.92" stroke="currentColor" stroke-width="1.67"/>');

  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : systemDark.matches);
  const newSeed = () => (Math.random() * 4294967296) >>> 0 || 1;

  document.querySelectorAll("canvas.stems-plant").forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let styleIndex = Math.random() < 0.5 ? 0 : 1;
    let plant, frame = 0, drawn = -1, splitFrame = null, elapsed = 0;
    let playing = !reduceMotion.matches, inView = false, last = null, still = reduceMotion.matches;

    function nextPlant() {
      styleIndex ^= 1;
      const stems = [2, 4, 6][Math.floor(Math.random() * 3)];
      plant = engine(styleIndex ? "bed" : "fork", stems, newSeed());
      elapsed = 0; frame = 0; drawn = -1; splitFrame = null;
    }

    function draw() {
      const progress = still ? 1 : Math.min(1, elapsed / GROW_SECONDS);
      if (progress >= SPLIT && splitFrame == null) splitFrame = frame;
      const growth = Math.min(1, progress / SPLIT);
      const dark = isDark();
      const g = plant(growth, frame, splitFrame == null ? null : frame - splitFrame, still, dark ? palettes.dark : palettes.light);

      // One fill per grey and per flower colour; cell edges rounded to device pixels so they stay crisp.
      const W = canvas.width, edge = (i) => Math.round((i * W) / SIZE);
      const ink = dark ? "255,255,255" : "0,0,0";
      const batches = new Map();
      for (let i = 0; i < SIZE * SIZE; i++) {
        const level = g.levels[i];
        if (level < 0) continue;
        const rgb = g.colours[i];
        const key = rgb ? "#" + rgb.toString(16).padStart(6, "0") : `rgba(${ink},${level / 15})`;
        if (!batches.has(key)) batches.set(key, []);
        batches.get(key).push(i);
      }
      ctx.clearRect(0, 0, W, W);
      for (const [fill, cells] of batches) {
        ctx.fillStyle = fill;
        for (const i of cells) {
          const x = i % SIZE, y = (i / SIZE) | 0;
          ctx.fillRect(edge(x), edge(y), edge(x + 1) - edge(x), edge(y + 1) - edge(y));
        }
      }
    }

    function tick(now) {
      if (!playing || !inView || document.hidden) { last = null; return; }
      if (last != null) elapsed += Math.min(0.1, (now - last) / 1000);
      last = now;
      if (elapsed >= GROW_SECONDS + HOLD_SECONDS) nextPlant();
      const f = Math.floor(elapsed * FPS);
      if (f !== drawn) { frame = drawn = f; draw(); }
      requestAnimationFrame(tick);
    }
    const run = () => { if (last == null && playing && inView && !document.hidden) requestAnimationFrame(tick); };

    // Size the backing store to the element's device pixels.
    function resize(width) {
      const px = Math.max(SIZE, Math.round(width));
      if (canvas.width !== px) { canvas.width = canvas.height = px; draw(); }
    }
    new ResizeObserver(([entry]) => {
      const box = entry.devicePixelContentBoxSize && entry.devicePixelContentBoxSize[0];
      resize(box ? box.inlineSize : entry.contentRect.width * devicePixelRatio);
    }).observe(canvas);

    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; run(); }).observe(canvas);
    document.addEventListener("visibilitychange", run);

    // Repaint on theme changes, even while paused.
    new MutationObserver(draw).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    systemDark.addEventListener("change", draw);

    // Controls, in the same style as the video buttons (see video-controls.js).
    const frameEl = document.createElement("div");
    frameEl.className = "video-frame";
    canvas.replaceWith(frameEl);
    frameEl.appendChild(canvas);
    const button = (html, label) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "circle-btn video-btn"; b.innerHTML = html;
      b.setAttribute("aria-label", label);
      return b;
    };
    const toggle = button(pauseIcon, "Pause animation");
    const again = button(restartIcon, "Grow a new plant");
    const controls = document.createElement("div");
    controls.className = "video-controls";
    controls.append(toggle, again);
    frameEl.appendChild(controls);

    function sync() {
      toggle.innerHTML = playing ? pauseIcon : playIcon;
      toggle.setAttribute("aria-label", playing ? "Pause animation" : "Play animation");
      frameEl.classList.toggle("is-paused", !playing);
    }
    toggle.addEventListener("click", () => {
      playing = !playing;
      if (playing && still) { still = false; nextPlant(); }
      sync(); run();
    });
    again.addEventListener("click", () => {
      still = false; nextPlant(); draw();
      if (!playing) { playing = true; sync(); }
      run();
    });
    // Touch screens have no hover, so a tap on the plant shows or hides the buttons.
    canvas.addEventListener("click", () => frameEl.classList.toggle("controls-shown"));

    nextPlant();
    sync();
    draw();
  });
})();
