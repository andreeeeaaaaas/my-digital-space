---
title: Sayings I like
date: 2026-04-21
tags:
  - writing
description: Some in English, some not
---
<div class="sayings-container">
  <blockquote class="note" data-saying>
    <p>"Som plommen i egget"</p>
    <p>Norwegian for 'Like the yolk in the egg'.</p>
  </blockquote>
  <blockquote class="note" data-saying>
    <p>"No dar papaya"</p>
    <p>Spanish for 'don't give papaya'. Don't give reason for misfortune.</p>
  </blockquote>
  <blockquote class="note" data-saying>
    <p>"The biggest problem with communication is the illusion that it has occurred"</p>
    <p>George Bernard Shaw.</p>
  </blockquote>
  <blockquote class="note" data-saying>
    <p>"You can use an eraser on the drafting table, or a sledgehammer on the construction site"</p>
    <p>Frank Lloyd Wright.</p>
  </blockquote>
  <blockquote class="note" data-saying>
    <p>"The future never arrives all at once"</p>
    <p>Neil Gaiman.</p>
  </blockquote>
  <blockquote class="note" data-saying>
    <p>"L'appétit vient en mangeant"</p>
    <p>French for 'appetite comes with eating'.</p>
  </blockquote>
  <blockquote class="note" data-saying>
    <p>"Specialisation is for insects"</p>
    <p>Robert A. Heinlein.</p>
  </blockquote>
  <blockquote class="note" data-saying>
    <p>"A long muscle is a strong muscle"</p>
    <p>African proverb.</p>
  </blockquote>
  <blockquote class="note" data-saying>
    <p>"Fasouli, to fasouli, yemizi to sakouli"</p>
    <p>Greek for 'bean by bean, you fill the sack'.</p>
  </blockquote>
  <blockquote class="note" data-saying>
    <p>"If you want to go fast, go alone. If you want to go far, go together"</p>
    <p>African proverb.</p>
  </blockquote>
  <blockquote class="note" data-saying>
    <p>"Sometimes it's better to travel than to arrive"</p>
    <p>Robert M. Pirsig, Zen and the Art of Motorcycle Maintenance.</p>
  </blockquote>
</div>

<div class="sayings-controls">
  <button class="sayings-nav-btn" id="prev-saying" aria-label="Previous saying">Previous</button>
  <button class="sayings-nav-btn" id="next-saying" aria-label="Next saying">Next</button>
</div>
<br>
<br>

<script>
(function () {
  const sayings = Array.from(document.querySelectorAll('[data-saying]'));
  if (!sayings.length) return;

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const storageKey = 'sayings-last-index';
  let lastIndex = -1;
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) lastIndex = parseInt(stored, 10);
  } catch (e) {}

  const order = shuffle(sayings.map((_, i) => i));
  if (sayings.length > 1 && order[0] === lastIndex) {
    [order[0], order[1]] = [order[1], order[0]];
  }
  let pos = 0;

  try {
    localStorage.setItem(storageKey, String(order[0]));
  } catch (e) {}

  function show() {
    sayings.forEach((s, i) => s.classList.toggle('active', i === order[pos]));
  }

  show();

  document.getElementById('prev-saying').addEventListener('click', function () {
    pos = (pos - 1 + order.length) % order.length;
    show();
  });

  document.getElementById('next-saying').addEventListener('click', function () {
    pos = (pos + 1) % order.length;
    show();
  });
})();
</script>
