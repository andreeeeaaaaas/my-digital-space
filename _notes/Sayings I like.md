---
title: Sayings I like
date: 2026-04-21
tags:
  - writing
description: Some in English, some not
---
<div class="sayings-controls">
  <button class="circle-btn" id="shuffle-saying" aria-label="Shuffle saying">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 5h2.5a4 4 0 0 1 3.2 1.6L9 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
      <path d="M2 15h2.5a4 4 0 0 0 3.2-1.6l4.6-6.8A4 4 0 0 1 15.5 5H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
      <path d="M16 3l2 2-2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="square"/>
      <path d="M9 12l1.3 1.4A4 4 0 0 0 13.5 15H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M16 13l2 2-2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="square"/>
    </svg>
  </button>
</div>

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
<br>
<br>
<br>

<script>
(function () {
  const sayings = Array.from(document.querySelectorAll('[data-saying]'));
  if (!sayings.length) return;

  let current = -1;
  let deck = [];

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function refillDeck(excludeIndex) {
    deck = sayings
      .map((_, i) => i)
      .filter((i) => i !== excludeIndex);
    shuffle(deck);
  }

  function getNextIndex() {
    if (sayings.length === 1) return 0;
    if (deck.length === 0) refillDeck(current);
    return deck.pop();
  }

  function show(index) {
    sayings.forEach((s, i) => s.style.display = i === index ? '' : 'none');
  }

  current = getNextIndex();
  show(current);

  document.getElementById('shuffle-saying').addEventListener('click', function () {
    current = getNextIndex();
    show(current);
  });

})();
</script>
