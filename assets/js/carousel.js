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

  // Like turning a page: next moves content left (dir -1), previous moves it right (dir 1).
  // Both slides travel the full width together and the frame hides the edges.
  const TIMING = { duration: 420, easing: 'cubic-bezier(0.3, 0, 0.15, 1)', fill: 'forwards' };

  function leave(dir) {
    return [{ transform: 'translateX(0)' }, { transform: 'translateX(' + dir * 100 + '%)' }];
  }

  function arrive(dir) {
    return [{ transform: 'translateX(' + -dir * 100 + '%)' }, { transform: 'translateX(0)' }];
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
    let active = null;

    // Puts the end state in place and drops the animations. Safe to call twice.
    function end(t) {
      slides.forEach(function (s) { s.img.hidden = s !== t.to; });
      label.innerHTML = t.text;
      if (t.outLabel) t.outLabel.remove();
      t.anims.forEach(function (a) { a.cancel(); });
      if (active === t) active = null;
    }

    function show(target, dir) {
      if (active) end(active);
      const from = slides[index];
      index = (target + slides.length) % slides.length;
      const t = { to: slides[index], text: captionFor(index), anims: [] };
      active = t;
      if (reduceMotion.matches) return end(t);

      // The old caption slides out as the new one slides in, inside the caption's box.
      t.outLabel = label.cloneNode(true);
      t.outLabel.classList.add('carousel-label-out');
      t.outLabel.setAttribute('aria-hidden', 'true');
      label.after(t.outLabel);
      label.innerHTML = t.text;
      t.to.img.hidden = false;

      t.anims = [
        from.img.animate(leave(dir), TIMING),
        t.to.img.animate(arrive(dir), TIMING),
        t.outLabel.animate(leave(dir), TIMING),
        label.animate(arrive(dir), TIMING),
      ];
      Promise.all(t.anims.map(function (a) { return a.finished; })).then(
        function () { if (active === t) end(t); },
        function () {} // a newer click took over
      );
    }

    prev.addEventListener('click', function () { show(index - 1, 1); });
    next.addEventListener('click', function () { show(index + 1, -1); });
    figure.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(index - 1, 1);
      if (e.key === 'ArrowRight') show(index + 1, -1);
    });
  });
})();
