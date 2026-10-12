// Loads <iframe data-src> embeds once the page has finished loading. A same-origin demo
// shares the page's main thread, so starting it early holds up scripts like carousel.js.
(function () {
  function load() {
    document.querySelectorAll('iframe[data-src]').forEach(function (frame) {
      frame.src = frame.dataset.src;
      frame.removeAttribute('data-src');
    });
  }
  if (document.readyState === 'complete') load();
  else window.addEventListener('load', load, { once: true });
})();
