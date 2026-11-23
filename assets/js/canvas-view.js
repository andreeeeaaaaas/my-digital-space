// Canvas view for the home page: an endless, draggable board of the images,
// code, quotes and text pulled from every project and note (see
// _plugins/canvas_fragments.rb, which writes /canvas.json at build time).
//
// The board is a masonry of columns. Columns repeat sideways, and each
// column repeats vertically on its own height, so there's never a seam.
(() => {
  const VIEW_KEY = "index-view";
  const STATE_KEY = "canvas:state";
  const TAG_SLOTS = ["design", "music", "creative", "writing"];
  const DRAG_THRESHOLD = 6;
  const FRICTION = 0.94; // velocity kept per 16ms frame while gliding

  const root = document.documentElement;
  const viewport = document.getElementById("canvas-view");
  const viewButtons = document.querySelectorAll("[data-view]");
  if (!viewport || viewButtons.length === 0) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // --- Storage helpers: storage can throw, and the canvas must still work ---
  function read(store, key) {
    try {
      return store.getItem(key);
    } catch {
      return null;
    }
  }
  function write(store, key, value) {
    try {
      store.setItem(key, value);
    } catch {
      // Ignore: the view just won't be remembered.
    }
  }

  const saved = JSON.parse(read(sessionStorage, STATE_KEY) || "null") || {};
  const state = {
    x: Number.isFinite(saved.x) ? saved.x : null,
    y: Number.isFinite(saved.y) ? saved.y : null,
    seed: saved.seed || Math.floor(Math.random() * 2 ** 31),
    vx: 0,
    vy: 0,
  };

  function saveState() {
    write(
      sessionStorage,
      STATE_KEY,
      JSON.stringify({ x: state.x, y: state.y, seed: state.seed })
    );
  }

  // Seeded shuffle, so the board keeps its arrangement when you come back
  function rng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(list, random) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  const mod = (n, m) => ((n % m) + m) % m;

  // --- Data ---
  let dataPromise = null;
  function loadData() {
    if (!dataPromise) {
      dataPromise = fetch("/canvas.json", { credentials: "same-origin" })
        .then((res) => {
          if (!res.ok) throw new Error(`canvas.json ${res.status}`);
          return res.json();
        })
        .catch((error) => {
          dataPromise = null;
          throw error;
        });
    }
    return dataPromise;
  }

  // Interleave pages so neighbouring tiles come from different places:
  // one fragment from each page per round, pages shuffled each round.
  function sequence(entries, random) {
    const queues = entries.map((entry, index) => {
      const queue = shuffle(entry.fragments, random).map((f) => ({ ...f, entry, index }));
      // Drop the title card in among its fragments, so titles don't all
      // land in the first row
      const at = Math.floor(random() * (Math.min(queue.length, 3) + 1));
      queue.splice(at, 0, { kind: "title", entry, index });
      return queue;
    });
    const out = [];
    while (queues.some((q) => q.length)) {
      for (const q of shuffle(queues, random)) {
        if (q.length) out.push(q.shift());
      }
    }
    return out;
  }

  // --- Tile markup ---
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function dots(tags) {
    const wrap = el("span", "tile-dots");
    wrap.setAttribute("aria-hidden", "true");
    for (const slot of TAG_SLOTS) {
      wrap.append(el("span", `tag-dot ${slot}${tags.includes(slot) ? "" : " empty"}`));
    }
    return wrap;
  }

  function label(entry) {
    return el("span", "tile-label", entry.title);
  }

  function tileFor(item) {
    const { entry } = item;
    const a = el("a", `canvas-tile tile-${item.kind}`);
    a.href = entry.url;
    a.draggable = false;
    a.dataset.index = item.index;

    switch (item.kind) {
      case "title": {
        a.append(dots(entry.tags), el("span", "tile-title-text", entry.title));
        if (entry.description) a.append(el("span", "tile-description", entry.description));
        if (entry.date) a.append(el("span", "tile-date", entry.date));
        break;
      }
      case "image": {
        const img = el("img", item.invert ? "invert-dark" : "");
        // Keep extreme crops sensible: very tall or very wide images get cropped
        const ratio = Math.min(1.5, Math.max(0.6, item.h / item.w));
        img.style.aspectRatio = `1 / ${ratio}`;
        img.alt = item.alt || "";
        img.loading = "lazy";
        img.decoding = "async";
        img.draggable = false;
        img.src = item.src;
        a.append(img, label(entry));
        break;
      }
      case "code": {
        const pre = el("pre");
        pre.append(el("code", null, item.text));
        a.append(pre, label(entry));
        break;
      }
      case "quote": {
        a.append(el("blockquote", null, item.text), label(entry));
        break;
      }
      default: {
        a.append(el("p", "tile-text-body", item.text), label(entry));
      }
    }
    return a;
  }

  // --- Layout ---
  const board = el("div", "canvas-board");
  viewport.append(board);

  let layout = null; // { nodes, periodX, step, gap }
  let items = null;
  let entries = null;
  let originals = [];

  function metrics() {
    const vw = viewport.clientWidth;
    if (vw < 640) return { colW: 156, gap: 12 };
    if (vw < 1100) return { colW: 208, gap: 18 };
    return { colW: 248, gap: 22 };
  }

  function build() {
    if (!items) return;
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const { colW, gap } = metrics();
    const step = colW + gap;

    board.replaceChildren();
    board.style.setProperty("--tile-w", `${colW}px`);

    // Render originals once to measure their heights
    originals = items.map((item) => {
      const node = tileFor(item);
      board.append(node);
      return node;
    });
    const heights = originals.map((node) => node.offsetHeight);

    // Pick a column count that makes the board roughly landscape
    const area = heights.reduce((sum, h) => sum + (h + gap) * step, 0);
    const cols = Math.max(2, Math.round(Math.sqrt(area * 1.5) / step));

    // Masonry: each tile goes to the shortest column
    const columns = Array.from({ length: cols }, () => ({ height: 0, tiles: [] }));
    items.forEach((item, i) => {
      const col = columns.reduce((a, b) => (b.height < a.height ? b : a));
      col.tiles.push({ node: originals[i], y: col.height, h: heights[i], index: i });
      col.height += heights[i] + gap;
    });

    // Repeat columns sideways until one period is wider than the screen
    const boardW = cols * step;
    const copiesX = Math.max(1, Math.ceil((vw + step) / boardW));
    const maxH = Math.max(...heights);

    const nodes = [];
    for (let cx = 0; cx < copiesX; cx++) {
      columns.forEach((col, c) => {
        // Each column repeats on its own height, so there's never a gap
        const copiesY = Math.max(1, Math.ceil((vh + maxH + gap) / col.height));
        for (let cy = 0; cy < copiesY; cy++) {
          for (const t of col.tiles) {
            let node = t.node;
            if (cx > 0 || cy > 0) {
              node = t.node.cloneNode(true);
              node.setAttribute("aria-hidden", "true");
              node.tabIndex = -1;
              node.classList.add("is-clone");
              board.append(node);
            }
            nodes.push({
              node,
              index: items[t.index].index,
              x: (cx * cols + c) * step,
              y: cy * col.height + t.y,
              h: t.h,
              period: col.height * copiesY,
            });
          }
        }
      });
    }

    layout = { nodes, periodX: boardW * copiesX, step, gap };

    if (state.x == null) {
      // Start with the board's first columns just in from the left
      state.x = Math.max(gap, (vw - Math.min(vw, boardW)) / 2);
      state.y = 96;
    }

    applyFilter();
    render();
  }

  function render() {
    if (!layout) return;
    const { nodes, periodX, step, gap } = layout;
    for (const n of nodes) {
      const x = mod(n.x + state.x + step, periodX) - step;
      const y = mod(n.y + state.y + n.h + gap, n.period) - (n.h + gap);
      n.node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      n.cx = x;
      n.cy = y;
    }
    viewport.style.setProperty("--pan-x", `${state.x}px`);
    viewport.style.setProperty("--pan-y", `${state.y}px`);
  }

  let frame = 0;
  function schedule() {
    if (!frame) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        render();
      });
    }
  }

  // --- Motion: glide after a flick, and eased pans for keyboard/focus ---
  let motion = 0;
  function stopMotion() {
    cancelAnimationFrame(motion);
    motion = 0;
    state.vx = 0;
    state.vy = 0;
  }

  function glide() {
    if (reduceMotion.matches) return;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(48, now - last);
      last = now;
      state.x += state.vx * dt;
      state.y += state.vy * dt;
      const decay = Math.pow(FRICTION, dt / 16);
      state.vx *= decay;
      state.vy *= decay;
      render();
      if (Math.hypot(state.vx, state.vy) > 0.02) {
        motion = requestAnimationFrame(tick);
      } else {
        motion = 0;
      }
    };
    motion = requestAnimationFrame(tick);
  }

  function panBy(dx, dy) {
    stopMotion();
    if (reduceMotion.matches) {
      state.x += dx;
      state.y += dy;
      render();
      return;
    }
    const fromX = state.x;
    const fromY = state.y;
    const start = performance.now();
    const duration = 420;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      state.x = fromX + dx * e;
      state.y = fromY + dy * e;
      render();
      motion = t < 1 ? requestAnimationFrame(tick) : 0;
    };
    motion = requestAnimationFrame(tick);
  }

  // --- Input: drag, wheel, keys ---
  let pointer = null;
  let suppressClick = false;

  viewport.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || !layout) return;
    stopMotion();
    pointer = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: state.x,
      originY: state.y,
      dragging: false,
      samples: [],
    };
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const dx = event.clientX - pointer.startX;
    const dy = event.clientY - pointer.startY;

    if (!pointer.dragging) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      pointer.dragging = true;
      // Capture only once it's a drag, so a plain click still reaches the link
      viewport.setPointerCapture(pointer.id);
      viewport.classList.add("is-dragging");
      clearHover();
    }

    state.x = pointer.originX + dx;
    state.y = pointer.originY + dy;
    const now = performance.now();
    pointer.samples.push({ t: now, x: event.clientX, y: event.clientY });
    while (pointer.samples.length > 2 && now - pointer.samples[0].t > 90) {
      pointer.samples.shift();
    }
    schedule();
  });

  function endPointer(event) {
    if (!pointer || event.pointerId !== pointer.id) return;
    if (pointer.dragging) {
      suppressClick = true;
      viewport.classList.remove("is-dragging");
      const s = pointer.samples;
      const first = s[0];
      const last = s[s.length - 1];
      const dt = last && first ? last.t - first.t : 0;
      // A flick that stopped before release shouldn't glide
      const stale = last ? performance.now() - last.t > 60 : true;
      if (dt > 0 && !stale && event.type === "pointerup") {
        state.vx = (last.x - first.x) / dt;
        state.vy = (last.y - first.y) / dt;
        glide();
      }
      saveState();
    }
    pointer = null;
  }
  viewport.addEventListener("pointerup", endPointer);
  viewport.addEventListener("pointercancel", endPointer);

  // A drag that ends on a tile shouldn't open it
  viewport.addEventListener(
    "click",
    (event) => {
      if (suppressClick) {
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
      }
    },
    true
  );
  viewport.addEventListener("dragstart", (event) => event.preventDefault());

  viewport.addEventListener(
    "wheel",
    (event) => {
      if (!layout) return;
      event.preventDefault();
      if (event.ctrlKey) return; // pinch-zoom gesture: ignore rather than zoom the page
      stopMotion();
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1;
      let dx = event.deltaX * scale;
      let dy = event.deltaY * scale;
      if (event.shiftKey && !dx) {
        dx = dy;
        dy = 0;
      }
      state.x -= dx;
      state.y -= dy;
      schedule();
      clearTimeout(viewport._saveTimer);
      viewport._saveTimer = setTimeout(saveState, 200);
    },
    { passive: false }
  );

  viewport.addEventListener("keydown", (event) => {
    const amount = event.shiftKey ? 480 : 200;
    const moves = {
      ArrowLeft: [amount, 0],
      ArrowRight: [-amount, 0],
      ArrowUp: [0, amount],
      ArrowDown: [0, -amount],
      PageUp: [0, viewport.clientHeight * 0.8],
      PageDown: [0, -viewport.clientHeight * 0.8],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    panBy(move[0], move[1]);
  });

  // Tabbing to a tile off screen pans it into view
  viewport.addEventListener("focusin", (event) => {
    const tile = event.target.closest(".canvas-tile");
    if (!tile || !layout) return;
    const n = layout.nodes.find((node) => node.node === tile);
    if (!n) return;
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const pad = 96;
    const w = tile.offsetWidth;
    const inView = n.cx >= pad / 2 && n.cx + w <= vw - pad / 2 && n.cy >= pad && n.cy + n.h <= vh - pad;
    if (!inView) panBy(vw / 2 - (n.cx + w / 2), vh / 2 - (n.cy + n.h / 2));
  });

  // Focus can scroll an overflow:hidden box; the transforms do the moving here
  viewport.addEventListener("scroll", () => {
    viewport.scrollTop = 0;
    viewport.scrollLeft = 0;
  });

  // --- Hover: light up every tile from the same page ---
  let hoverIndex = null;
  function clearHover() {
    if (hoverIndex == null) return;
    hoverIndex = null;
    viewport.classList.remove("has-hover");
    board.querySelectorAll(".is-related").forEach((n) => n.classList.remove("is-related"));
  }

  board.addEventListener("pointerover", (event) => {
    if (event.pointerType !== "mouse" || pointer?.dragging || motion) return;
    const tile = event.target.closest(".canvas-tile");
    // Gaps between tiles are still the board, so clear the highlight there
    if (!tile || tile.classList.contains("is-filtered")) return clearHover();
    const index = tile.dataset.index;
    if (index === hoverIndex) return;
    clearHover();
    hoverIndex = index;
    viewport.classList.add("has-hover");
    board
      .querySelectorAll(`.canvas-tile[data-index="${index}"]`)
      .forEach((n) => n.classList.add("is-related"));
    if (typeof window.playHoverSound === "function") window.playHoverSound();
  });
  board.addEventListener("pointerleave", clearHover);

  // --- Tag filter: dim tiles that don't match, rather than leave holes ---
  function applyFilter() {
    if (!layout) return;
    const active = window.activeTagFilters || [];
    for (const n of layout.nodes) {
      const tags = entries[n.index].tags;
      const match = active.every((t) => tags.includes(t));
      n.node.classList.toggle("is-filtered", !match);
      if (!n.node.classList.contains("is-clone")) n.node.tabIndex = match ? 0 : -1;
    }
  }
  document.addEventListener("tagfilter:change", applyFilter);

  // --- View switching ---
  let built = false;
  let resizeTimer = 0;

  function showError() {
    viewport.replaceChildren(
      el("p", "canvas-message", "The canvas didn't load. Switch back to the list, or try again in a moment.")
    );
  }

  function setView(view, remember = true) {
    const canvas = view === "canvas";
    root.classList.toggle("view-canvas", canvas);
    viewport.hidden = !canvas;
    viewButtons.forEach((b) => {
      const on = b.dataset.view === view;
      b.setAttribute("aria-pressed", String(on));
      b.classList.toggle("active", on);
      b.classList.toggle("inactive", !on);
    });
    if (remember) write(localStorage, VIEW_KEY, view);

    if (!canvas) {
      stopMotion();
      saveState();
      return;
    }

    window.scrollTo(0, 0);
    if (built) {
      build(); // the viewport may have resized while hidden
      return;
    }
    viewport.classList.add("is-loading");
    loadData()
      .then((data) => {
        entries = data.entries;
        items = sequence(entries, rng(state.seed));
        built = true;
        viewport.classList.remove("is-loading");
        if (!viewport.hidden) build();
      })
      .catch(() => {
        viewport.classList.remove("is-loading");
        showError();
      });
  }

  viewButtons.forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));

  window.addEventListener("resize", () => {
    if (viewport.hidden || !built) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 150);
  });
  window.addEventListener("pagehide", saveState);

  setView(read(localStorage, VIEW_KEY) === "canvas" ? "canvas" : "list", false);
})();
