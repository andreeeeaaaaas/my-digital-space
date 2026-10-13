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

    // One row of images that scrolls sideways. The browser handles swiping and
    // snaps to one image per flick (see .carousel-track in _style.scss).
    const track = document.createElement('div');
    track.className = 'carousel-track';
    if (root.dataset.aspect) track.style.aspectRatio = root.dataset.aspect;
    slides.forEach(function (slide) {
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

    // The caption follows whichever image is mostly in view
    track.addEventListener('scroll', function () {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      if (i === index || i < 0 || i >= slides.length) return;
      index = i;
      label.innerHTML = captionFor(i);
    }, { passive: true });

    // Buttons and arrow keys jump straight to the image, wrapping around from
    // the last to the first and back. Only swipes scroll.
    function step(side) {
      const target = (index + side + slides.length) % slides.length;
      track.scrollTo({ left: target * track.clientWidth, behavior: 'instant' });
    }

    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    figure.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault(); // the focused track would otherwise scroll too
      step(e.key === 'ArrowLeft' ? -1 : 1);
    });
  });
})();
