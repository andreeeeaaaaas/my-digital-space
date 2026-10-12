// Turns a <div class="carousel"> of figures into one figure with previous and next
// buttons beside its caption. Without JavaScript the figures stay stacked.
// Options on the div: data-aspect="4 / 3" sets the frame's shape (default 2.4 / 1),
// data-count="false" leaves the "(n/total)" off captions. Figures without a caption show only the count.
(function () {
  const caret = function (d) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="' + d + '" stroke="currentColor" stroke-width="1.67"/></svg>';
  };
  const prevIcon = caret('M9 2 4 7l5 5');
  const nextIcon = caret('m5 2 5 5-5 5');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Like turning a page: next moves content left, previous moves it right. Two slides
  // sit side by side and travel together; the frame hides the edges. A full-width
  // move takes DURATION ms, shorter moves (finishing a drag) take proportionally less.
  const DURATION = 420;
  const MIN_DURATION = 160;
  const EASING = 'cubic-bezier(0.3, 0, 0.15, 1)';

  function tx(x) {
    return 'translateX(' + x + 'px)';
  }

  document.querySelectorAll('div.carousel').forEach(function (root) {
    const slides = Array.from(root.querySelectorAll('figure')).map(function (fig) {
      const caption = fig.querySelector('figcaption');
      return { img: fig.querySelector('img'), caption: caption ? caption.innerHTML : '' };
    });
    if (slides.length < 2) return;

    const figure = document.createElement('figure');
    figure.className = 'carousel-figure';
    figure.setAttribute('role', 'group');
    figure.setAttribute('aria-roledescription', 'carousel');
    if (root.getAttribute('aria-label')) figure.setAttribute('aria-label', root.getAttribute('aria-label'));

    const track = document.createElement('div');
    track.className = 'carousel-track';
    if (root.dataset.aspect) track.style.aspectRatio = root.dataset.aspect;
    slides.forEach(function (slide, i) {
      slide.img.hidden = i !== 0;
      slide.img.loading = 'eager';
      track.appendChild(slide.img);
    });

    const footer = document.createElement('div');
    footer.className = 'carousel-footer';
    const caption = document.createElement('figcaption');
    caption.setAttribute('aria-live', 'polite');
    const label = document.createElement('span');
    const counted = root.dataset.count !== 'false';
    function captionFor(i) {
      if (!counted) return slides[i].caption;
      const count = '(' + (i + 1) + '/' + slides.length + ')';
      return slides[i].caption ? slides[i].caption + ' ' + count : count;
    }
    label.innerHTML = captionFor(0);
    caption.appendChild(label);

    function button(cls, icon, text) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'circle-btn carousel-btn ' + cls;
      b.innerHTML = icon;
      b.setAttribute('aria-label', text);
      return b;
    }
    const prev = button('carousel-prev', prevIcon, 'Previous');
    const next = button('carousel-next', nextIcon, 'Next');
    footer.append(prev, caption, next);

    figure.append(track, footer);
    root.replaceChildren(figure);

    let index = 0;
    // Slides gliding into place after a click, key or released drag:
    // { base, side, commit, target, anims }
    let settling = null;

    function neighbour(i, side) {
      return (i + side + slides.length) % slides.length;
    }

    // Puts slide `base` at x px with its neighbour on `side` (1 next, -1 previous) beside it.
    // side null shows `base` alone. Every other slide is hidden.
    function lay(base, x, side) {
      const width = track.clientWidth;
      const other = side === null ? -1 : neighbour(base, side);
      slides.forEach(function (s, i) {
        s.img.hidden = i !== base && i !== other;
        s.img.style.transform = i === base ? tx(x) : i === other ? tx(x + side * width) : '';
      });
    }

    // Where the image is drawn right now, including any running animation
    function currentX(img) {
      const t = getComputedStyle(img).transform;
      return t === 'none' ? 0 : new DOMMatrixReadOnly(t).m41;
    }

    function finish(s) {
      s.anims.forEach(function (a) { a.cancel(); });
      if (settling === s) settling = null;
      lay(s.target, 0, null);
    }

    // Glides from `base` at x either back to rest or on to its neighbour on `side`.
    // The caption swaps straight away; only the images slide.
    function settle(base, x, side, commit) {
      if (settling) finish(settling);
      const width = track.clientWidth;
      const target = commit ? neighbour(base, side) : base;
      const endX = commit ? -side * width : 0;
      index = target;
      label.innerHTML = captionFor(target);

      const s = { base: base, side: side, commit: commit, target: target, anims: [] };
      settling = s;
      lay(base, x, side);
      if (reduceMotion.matches || x === endX) return finish(s);

      const timing = {
        duration: Math.max(MIN_DURATION, DURATION * Math.abs(endX - x) / width),
        easing: EASING,
        fill: 'forwards',
      };
      s.anims = [
        slides[base].img.animate([{ transform: tx(x) }, { transform: tx(endX) }], timing),
        slides[neighbour(base, side)].img.animate(
          [{ transform: tx(x + side * width) }, { transform: tx(endX + side * width) }],
          timing
        ),
      ];
      Promise.all(s.anims.map(function (a) { return a.finished; })).then(
        function () { if (settling === s) finish(s); },
        function () {} // a drag or newer click took over
      );
    }

    function step(side) {
      settle(index, 0, side, true);
    }

    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    figure.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });

    // Dragging on touch screens: the slides follow the finger, and a slide that's still
    // gliding can be caught and pushed back. On release it moves on if dragged past
    // COMMIT of the width or flicked that way, otherwise it springs back.
    // The track's touch-action: pan-y leaves vertical scrolling to the browser, which
    // cancels the pointer when the page scrolls instead.
    const COMMIT = 0.3;
    const FLICK_MS = 150; // how far ahead the release velocity is projected
    let drag = null;
    let draggedAt = -Infinity;

    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      let base = index;
      let x = 0;
      let caught = null;
      if (settling) {
        // Catch it where it is
        caught = settling;
        base = caught.base;
        x = currentX(slides[base].img);
        caught.anims.forEach(function (a) { a.cancel(); });
        settling = null;
      }
      drag = { base: base, originX: x, x: x, startX: e.clientX, lastX: e.clientX, lastT: e.timeStamp, v: 0, caught: caught };
      lay(base, x, x < 0 ? 1 : -1);
      try {
        track.setPointerCapture(e.pointerId); // keep the drag even if the finger leaves the frame
      } catch (err) {} // the pointer already ended
    });

    track.addEventListener('pointermove', function (e) {
      if (!drag) return;
      const width = track.clientWidth;
      const dt = e.timeStamp - drag.lastT;
      if (dt > 0) drag.v = 0.8 * ((e.clientX - drag.lastX) / dt) + 0.2 * drag.v;
      drag.lastX = e.clientX;
      drag.lastT = e.timeStamp;
      drag.x = drag.originX + e.clientX - drag.startX;
      // Dragged a whole slide across: carry on from the next one
      while (drag.x <= -width) { drag.base = neighbour(drag.base, 1); drag.x += width; drag.originX += width; }
      while (drag.x >= width) { drag.base = neighbour(drag.base, -1); drag.x -= width; drag.originX -= width; }
      lay(drag.base, drag.x, drag.x < 0 ? 1 : -1);
    });

    function release(e, cancelled) {
      if (!drag) return;
      const d = drag;
      drag = null;
      const moved = Math.abs(e.clientX - d.startX) > 10;
      if (moved) draggedAt = e.timeStamp;
      // A tap on a gliding slide lets it carry on where it was going
      if (!moved && d.caught) return settle(d.base, d.x, d.caught.side, d.caught.commit);
      if (d.x === 0) return lay(d.base, 0, null);
      const width = track.clientWidth;
      const v = cancelled || e.timeStamp - d.lastT > 100 ? 0 : d.v; // a pause before lifting kills the flick
      const projected = d.x + v * FLICK_MS;
      const commit = Math.sign(projected) === Math.sign(d.x) && Math.abs(projected) > width * COMMIT;
      settle(d.base, d.x, d.x < 0 ? 1 : -1, commit);
    }
    track.addEventListener('pointerup', function (e) { release(e, false); });
    track.addEventListener('pointercancel', function (e) { release(e, true); });

    // A drag shouldn't also count as a tap that opens the lightbox
    track.addEventListener('click', function (e) {
      if (e.timeStamp - draggedAt < 400) e.stopPropagation();
    }, true);
  });
})();
