// Adds pause/play and restart buttons to the bottom right of every looping video in a figure,
// plus a mute button on videos marked data-audio (they start muted so they can autoplay).
// With reduced motion on, videos start paused. Without JavaScript they just autoplay.
(function () {
  const icon = function (body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">' + body + '</svg>';
  };
  const pauseIcon = icon('<path d="M3 1.5h2.5v11H3zM8.5 1.5H11v11H8.5z" fill="currentColor"/>');
  const playIcon = icon('<path d="M3.5 1.5v11L12 7z" fill="currentColor"/>');
  const restartIcon = icon('<path d="M1.75 7a5.25 5.25 0 1 0 1.54-3.71L1.75 4.67M1.75 1.75v2.92h2.92" stroke="currentColor" stroke-width="1.67"/>');
  const soundIcon = icon('<path d="M1.5 5h2.5l3.5-3v10l-3.5-3H1.5z" fill="currentColor"/><path d="M9.75 4.75a3 3 0 0 1 0 4.5M11.25 2.75a5.75 5.75 0 0 1 0 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>');
  const mutedIcon = icon('<path d="M1.5 5h2.5l3.5-3v10l-3.5-3H1.5z" fill="currentColor"/><path d="M9.5 5.25l3.5 3.5M13 5.25l-3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('figure video[loop]').forEach(function (video) {
    const frame = document.createElement('div');
    frame.className = 'video-frame';
    video.replaceWith(frame);
    frame.appendChild(video);

    function button(icon, text) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'circle-btn video-btn';
      b.innerHTML = icon;
      b.setAttribute('aria-label', text);
      return b;
    }
    const toggle = button(pauseIcon, 'Pause video');
    const restart = button(restartIcon, 'Restart video');
    const controls = document.createElement('div');
    controls.className = 'video-controls';
    controls.append(toggle, restart);
    frame.appendChild(controls);

    if (video.hasAttribute('data-audio')) {
      const mute = button(mutedIcon, 'Unmute video');
      controls.appendChild(mute);
      video.addEventListener('volumechange', function () {
        mute.innerHTML = video.muted ? mutedIcon : soundIcon;
        mute.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
      });
      mute.addEventListener('click', function () {
        video.muted = !video.muted;
      });
    }

    // The icon follows the video, including when the browser blocks autoplay
    function sync() {
      toggle.innerHTML = video.paused ? playIcon : pauseIcon;
      toggle.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
      frame.classList.toggle('is-paused', video.paused);
    }
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);

    if (reduceMotion.matches) {
      video.removeAttribute('autoplay');
      video.pause();
    }
    sync();

    toggle.addEventListener('click', function () {
      if (video.paused) video.play();
      else video.pause();
    });
    restart.addEventListener('click', function () {
      video.currentTime = 0;
      video.play();
    });
  });
})();
