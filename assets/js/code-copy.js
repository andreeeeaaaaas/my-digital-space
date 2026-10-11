(function () {
  if (!navigator.clipboard) return;

  const copyIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
  const checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

  document.querySelectorAll('div.highlight').forEach(function (block) {
    const code = block.querySelector('pre code');
    if (!code) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.innerHTML = copyIcon;
    button.setAttribute('aria-label', 'Copy code');

    let resetTimer;
    button.addEventListener('click', function () {
      navigator.clipboard.writeText(code.innerText.trimEnd()).then(function () {
        button.innerHTML = checkIcon;
        button.setAttribute('aria-label', 'Copied');
        button.classList.add('is-copied');
        clearTimeout(resetTimer);
        resetTimer = setTimeout(function () {
          button.innerHTML = copyIcon;
          button.setAttribute('aria-label', 'Copy code');
          button.classList.remove('is-copied');
        }, 1500);
      });
    });

    block.appendChild(button);
  });
})();
