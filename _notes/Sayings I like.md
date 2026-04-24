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
  <div class="saying" data-saying>
    <div class="saying-quote">"Som plommen i egget"</div>
    <p class="saying-explanation">Norwegian for 'Like the yolk in the egg'. To be in a very comfortable situation.</p>
  </div>
  <div class="saying" data-saying>
    <div class="saying-quote">"No dar papaya"</div>
    <p class="saying-explanation">Spanish for 'don't give papaya'. Don't give reason for misfortune.</p>
  </div>
  <div class="saying" data-saying>
    <div class="saying-quote">"The biggest problem with communication is the illusion that it has occurred"<br><br>– George Bernard Shaw</div>
    <p class="saying-explanation">George Bernard Shaw.</p>
  </div>
  <div class="saying" data-saying>
    <div class="saying-quote">"You can use an eraser on the drafting table, or a sledgehammer on the construction site"</div>
    <p class="saying-explanation">Frank Lloyd Wright.</p>
  </div>
  <div class="saying" data-saying>
    <div class="saying-quote">"The future never arrives all at once"</div>
    <p class="saying-explanation">Neil Gaiman.</p>
  </div>
  <div class="saying" data-saying>
    <div class="saying-quote">L'appétit vient en mangeant</div>
    <p class="saying-explanation">French for 'appetite comes with eating'. The doing inspires more doing.</p>
  </div>
  <div class="saying" data-saying>
    <div class="saying-quote">"Specialisation is for insects"</div>
    <p class="saying-explanation">Robert A. Heinlein.</p>
  </div>
  <div class="saying" data-saying>
    <div class="saying-quote">"A long muscle is a strong muscle"</div>
    <p class="saying-explanation">African proverb.</p>
  </div>
  <div class="saying" data-saying>
    <div class="saying-quote">Fasouli, to fasouli, yemizi to sakouli</div>
    <p class="saying-explanation">Greek for 'bean by bean, you fill the sack'.</p>
  </div>
  <div class="saying" data-saying>
    <div class="saying-quote">"If you want to go fast, go alone. If you want to go far, go together"</div>
    <p class="saying-explanation">African proverb.</p>
  </div>
  <div class="saying" data-saying>
    <div class="saying-quote">"Sometimes it's better to travel than to arrive"</div>
    <p class="saying-explanation">Robert M. Pirsig, Zen and the Art of Motorcycle Maintenance.</p>
  </div>
</div>
<br>
<br>
<br>

<script>
(function () {
  const sayings = Array.from(document.querySelectorAll('[data-saying]'));
  let current = Math.floor(Math.random() * sayings.length);

  function show(index) {
    sayings.forEach((s, i) => s.style.display = i === index ? '' : 'none');
  }

  show(current);

  document.getElementById('shuffle-saying').addEventListener('click', function () {
    let next;
    do { next = Math.floor(Math.random() * sayings.length); } while (next === current && sayings.length > 1);
    current = next;
    show(current);
  });

})();
</script>
