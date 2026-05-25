(function () {
  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Image preview');
  overlay.innerHTML = `
    <button id="lightbox-close" aria-label="Close">&times;</button>
    <img id="lightbox-img" alt="" />
    <p id="lightbox-caption"></p>
  `;
  document.body.appendChild(overlay);

  const img = overlay.querySelector('#lightbox-img');
  const caption = overlay.querySelector('#lightbox-caption');
  const closeBtn = overlay.querySelector('#lightbox-close');

  function open(src, alt, cap) {
    img.src = src;
    img.alt = alt || '';
    caption.textContent = cap || '';
    caption.hidden = !cap;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
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

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
})();
