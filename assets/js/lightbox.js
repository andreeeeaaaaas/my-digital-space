(function () {
  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Image preview');
  overlay.setAttribute('tabindex', '-1');
  overlay.innerHTML = `
    <button id="lightbox-close" aria-label="Close">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>
    <img id="lightbox-img" alt="" />
    <p id="lightbox-caption"></p>
  `;
  document.body.appendChild(overlay);

  const img = overlay.querySelector('#lightbox-img');
  const caption = overlay.querySelector('#lightbox-caption');
  const closeBtn = overlay.querySelector('#lightbox-close');

  let savedScrollY = 0;

  function open(src, alt, cap) {
    img.src = src;
    img.alt = alt || '';
    caption.textContent = cap || '';
    caption.hidden = !cap;
    savedScrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = '100%';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    overlay.classList.add('open');
    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.paddingRight = '';
    window.scrollTo(0, savedScrollY);
  }

  document.querySelectorAll('figure img').forEach(function (el) {
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', function () {
      const fig = el.closest('figure');
      const cap = fig ? fig.querySelector('figcaption') : null;
      open(el.src, el.alt, cap ? cap.textContent.trim() : '');
    });
  });

  closeBtn.addEventListener('click', close);
  img.addEventListener('click', close);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
})();
