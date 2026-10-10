// Turns a <div class="carousel"> of figures into one figure with previous and next
// buttons beside its caption. Without JavaScript the figures stay stacked.
(function () {
  const caret = function (d) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="' + d + '" stroke="currentColor" stroke-width="1.67"/></svg>';
  };
  const prevIcon = caret('M9 2 4 7l5 5');
  const nextIcon = caret('m5 2 5 5-5 5');

  // Like turning a page: next moves content left, previous moves it right.
  // The outgoing slide leaves in that direction and the incoming one arrives from the other side.
  const SHIFT = 12;
  const OUT = { duration: 140, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' };
  const IN = { duration: 240, easing: 'cubic-bezier(0, 0, 0.2, 1)' };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // dir is -1 to move left, 1 to move right.
  function frames(dir, leaving) {
    const shift = reduceMotion.matches ? 0 : SHIFT * dir;
    const away = leaving ? shift : -shift;
    const hidden = { opacity: 0, transform: 'translateX(' + away + 'px)' };
    const shown = { opacity: 1, transform: 'translateX(0)' };
    return leaving ? [shown, hidden] : [hidden, shown];
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
    function captionFor(i) {
      return slides[i].caption + ' (' + (i + 1) + '/' + slides.length + ')';
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
    let running = [];

    async function show(target, dir) {
      running.forEach(function (a) { a.cancel(); });
      const from = slides[index];
      index = (target + slides.length) % slides.length;
      const to = slides[index];

      running = [from.img.animate(frames(dir, true), OUT), label.animate(frames(dir, true), OUT)];
      const out = running;
      try {
        await Promise.all(out.map(function (a) { return a.finished; }));
      } catch (e) {
        return; // a newer click took over
      }

      slides.forEach(function (s) { s.img.hidden = s !== to; });
      label.innerHTML = captionFor(index);
      out.forEach(function (a) { a.cancel(); });
      running = [to.img.animate(frames(dir, false), IN), label.animate(frames(dir, false), IN)];
    }

    prev.addEventListener('click', function () { show(index - 1, 1); });
    next.addEventListener('click', function () { show(index + 1, -1); });
    figure.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(index - 1, 1);
      if (e.key === 'ArrowRight') show(index + 1, -1);
    });
  });
})();
