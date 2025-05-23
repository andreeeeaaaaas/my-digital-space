document.addEventListener('DOMContentLoaded', () => {
    const quotes = document.querySelectorAll('.quote');
    const button = document.getElementById('show-quote-btn');

    // Initially hide all quotes
    quotes.forEach(quote => {
        quote.style.display = 'none';
    });

    button.addEventListener('click', () => {
        // Hide all quotes first
        quotes.forEach(quote => {
            quote.style.display = 'none';
        });

        // Pick one at random
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const chosenQuote = quotes[randomIndex];

        // Show it
        chosenQuote.style.display = 'block';

        // (Optional) Log which one was picked
        console.log('Showing quote with ID:', chosenQuote.id);
    });
});