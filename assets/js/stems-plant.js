// The Stems loading animation, live: a port of PlantEngine (PlantGrowth.swift in the Stems app).
// Each cycle grows a new plant from a fresh seed, alternating the app's two styles (fork and bed),
// blooms one flower per stem, holds, then starts over. The wind bends each branch on an arc, and
// brushing the pointer over the plant stirs it up, as in the app.
//
// The engine's grid is 96×96; the canvas shows it centred in a 128×96 (4:3) frame.
//
// Greys are drawn as ink at level/15 opacity, so the app's 16-level ramp sits on any background:
// white ink in dark mode (as in the app), black ink in light mode (the ramp inverted).
// Follows the site's theme toggle and the system setting, pauses off-screen, and with reduced
// motion shows one still, fully bloomed plant.
(function () {
  const SIZE = 96, GROUND = 88, FPS = 12;
  const COLS = 128, ROWS = 96, OFFSET = (COLS - SIZE) / 2;
  const GROW_SECONDS = 4.5, HOLD_SECONDS = 2.5, SPLIT = 0.96;
  // The app's 150pt of pointer travel for a full gust, at 2pt per grid pixel; then it fades.
  const FULL_GUST = 75, GUST_FADE = 0.9;

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

  const smooth = (u) => u * u * (3 - 2 * u);

  // How hard the wind leans the plant at a moment, roughly -2.7...2.7: a drift that turns over every
  // couple of seconds, a quicker flutter on top, and now and then a gust from the seed's side. Each
  // branch bends by this times its own share (FORK_BEND, BED_BEND). A pointer gust bends it up to 1.8×
  // as far (in strength) and adds a quicker rustle on top.
  function wind(time, seed, strength, rustle) {
    return (lag = 0) => {
      if (strength <= 0) return 0;
      const t = time - lag;
      const drift = (noise(t * 0.6, seed) * 2 - 1) * 1.2;
      const flutter = (noise(t * 1.8, (seed + 9) >>> 0) * 2 - 1) * 0.4;
      const g = noise(t * 0.12, (seed + 17) >>> 0);
      const gust = g > 0.6 ? smooth((g - 0.6) / 0.4) * 1.1 : 0;
      const stir = (noise(t * 4, (seed + 23) >>> 0) * 2 - 1) * 0.6 * rustle;
      return strength * (drift + flutter + stir + gust * (seed % 2 === 0 ? 1 : -1));
    };
  }

  // Radians a fork segment turns from base to tip at full wind, by depth (the trunk barely, the tips
  // most), and the seconds each level of branching lags the one below, so it doesn't move as one block.
  const FORK_BEND = [0.035, 0.06, 0.085, 0.1], FORK_LAG = 0.12;
  // Radians a bed sprout turns from soil to flower, and how many seconds each lags its left neighbour.
  const BED_BEND = 0.2, BED_LAG = 0.25;

  // Re-walks a path from base, turning each step a little more until it has turned `turn` radians at
  // the tip, on top of the heading it inherits. Branches curve rather than hinge, and swing on an arc
  // rather than sliding sideways (no shear).
  function bend(path, base, heading, turn) {
    const out = [base];
    let x = base.x, y = base.y;
    const steps = Math.max(1, path.length - 1);
    for (let j = 1; j < path.length; j++) {
      const dx = path[j].x - path[j - 1].x, dy = path[j].y - path[j - 1].y;
      const a = heading + (turn * j) / steps, c = Math.cos(a), sn = Math.sin(a);
      x += dx * c - dy * sn;
      y += dx * sn + dy * c;
      out.push({ x, y });
    }
    return out;
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

  // Draws the first `count` pixels of a bent path, joined up so it stays unbroken.
  function drawPath(g, path, count, level) {
    const moved = path.slice(0, count).map((p) => ({ x: round(p.x), y: round(p.y) }));
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
        c0, c1: c0 + path.length * r.between(0.85, 1.15), isTip: single, stem: 0, leaves: [], parent,
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
    // gust (0...1) strengthens the wind while the pointer brushes the plant.
    return function pixels(growth, frame, bloom, still, palette, gust) {
      const g = grid(), t = frame / FPS, tips = [];
      gust = clamp(gust || 0, 0, 1);
      const lean = wind(t, seed, still ? 0 : 1 + 0.8 * gust, gust);
      if (style === "fork") {
        // Each segment's bent tip and heading, so its children start there and inherit its lean.
        const ends = [], headings = [];
        for (let x = 41; x <= 55; x++) g.put(x, GROUND + 1, (x + 1) % 4 === 0 ? 4 : 3);
        for (let x = 37; x <= 59; x += 2) g.put(x, GROUND + 2, 2);
        segments.forEach((s, i) => {
          const base = s.parent == null ? { x: s.path[0].x, y: s.path[0].y } : ends[s.parent];
          const heading = s.parent == null ? 0 : headings[s.parent];
          const turn = lean(s.depth * FORK_LAG) * FORK_BEND[Math.min(s.depth, FORK_BEND.length - 1)];
          const bent = bend(s.path, base, heading, turn);
          ends[i] = bent[bent.length - 1];
          headings[i] = heading + turn;
          const f = clamp((growth - s.c0) / Math.max(0.0001, s.c1 - s.c0), 0, 1);
          const count = Math.ceil(s.path.length * f);
          if (count < 1) return;
          const moved = drawPath(g, bent, count, s.depth === 0 ? 9 : 8);
          for (const l of s.leaves) if (count - l.k > 2) leaf(g, moved[l.k], l.side, count - l.k);
          const tip = moved[moved.length - 1];
          if (f < 1) g.put(tip.x, tip.y - 1, 10);
          else if (s.isTip) tips.push([s.stem, tip, names[s.stem % stems]]);
        });
      } else {
        const first = sprouts[0], last = sprouts[sprouts.length - 1];
        for (let x = first.x - 10; x <= last.x + 10; x++) g.put(x, GROUND + 1, x % 3 === 0 ? 4 : 3);
        for (let x = first.x - 9; x < last.x + 10; x += 2) g.put(x, GROUND + 2, 2);
        sprouts.forEach((p, i) => {
          const pg = clamp((growth - p.start) / 0.62, 0, 1);
          if (pg <= 0) return g.put(p.x, GROUND, 6);
          const count = Math.max(1, Math.ceil(p.path.length * pg));
          const turn = lean(i * BED_LAG) * BED_BEND;
          const moved = drawPath(g, bend(p.path, { x: p.path[0].x, y: p.path[0].y }, 0, turn), count, 8);
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
    const playing = !reduceMotion.matches, still = reduceMotion.matches;
    let inView = false, last = null;
    // How hard the pointer last brushed the plant, and when (seconds of elapsed time).
    let brush = { strength: 0, at: -Infinity }, lastPointer = null;
    const gustAt = () => brush.strength * Math.exp(-Math.max(0, elapsed - brush.at) / GUST_FADE);

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
      const g = plant(growth, frame, splitFrame == null ? null : frame - splitFrame, still, dark ? palettes.dark : palettes.light, gustAt());

      // One fill per grey and per flower colour; cell edges rounded to device pixels so they stay crisp.
      const W = canvas.width, H = canvas.height;
      const ex = (i) => Math.round(((i + OFFSET) * W) / COLS), ey = (i) => Math.round((i * H) / ROWS);
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
      ctx.clearRect(0, 0, W, H);
      for (const [fill, cells] of batches) {
        ctx.fillStyle = fill;
        for (const i of cells) {
          const x = i % SIZE, y = (i / SIZE) | 0;
          ctx.fillRect(ex(x), ey(y), ex(x + 1) - ex(x), ey(y + 1) - ey(y));
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
      const w = Math.max(COLS, Math.round(width)), h = Math.round((w * ROWS) / COLS);
      if (canvas.width !== w) { canvas.width = w; canvas.height = h; draw(); }
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

    // Brushing the pointer over the plant stirs the wind: a full gust per FULL_GUST grid pixels of
    // travel, fading over about a second. Mouse and pen only; a finger scrolling past shouldn't count.
    canvas.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      const rect = canvas.getBoundingClientRect(), scale = COLS / rect.width;
      const point = { x: e.clientX * scale, y: e.clientY * scale };
      if (lastPointer) {
        const moved = Math.hypot(point.x - lastPointer.x, point.y - lastPointer.y);
        brush = { strength: Math.min(1, gustAt() + moved / FULL_GUST), at: elapsed };
      }
      lastPointer = point;
    });
    canvas.addEventListener("pointerleave", () => (lastPointer = null));

    nextPlant();
    draw();
  });
})();
