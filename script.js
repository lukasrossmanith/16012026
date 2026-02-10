document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('card');
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const surprise = document.getElementById('surprise');
    const heart = document.getElementById('heart');
    const photoContainer = document.getElementById('photo-container');

    // Desktop: Move No button on hover
    noBtn.addEventListener('mouseover', moveButton);
    
    // Mobile/Click: Show alert
    noBtn.addEventListener('click', (e) => {
        // Check if it's a touch device interaction or just a fast click
        // For simplicity, we trigger the alert on click as requested for mobile fallback
        alert("This option is not available. Please choose another message.");
        e.preventDefault();
    });

    yesBtn.addEventListener('click', () => {
        // Hide card
        card.style.opacity = '0';
        setTimeout(() => {
            card.classList.add('hidden');
            surprise.classList.remove('hidden');
            
            // Start heart explosion animation
            // removing pulse and adding explode
            heart.style.animation = 'explode 1s forwards ease-in-out';
            
            // After explosion, show photo
            setTimeout(() => {
                heart.classList.add('hidden');
                photoContainer.classList.remove('hidden');
                
                // Small delay to allow display:block to apply before opacity transition
                setTimeout(() => {
                    photoContainer.classList.add('show');
                }, 50);
                
            }, 800); // Wait for most of the explosion
        }, 500); // Wait for card fade out
    });

    function moveButton() {
        // Calculate random position within the window, but keep padding
        const padding = 50;
        const x = Math.random() * (window.innerWidth - noBtn.offsetWidth - padding * 2) + padding;
        const y = Math.random() * (window.innerHeight - noBtn.offsetHeight - padding * 2) + padding;

        noBtn.style.position = 'fixed'; // Switch to fixed to move freely
        noBtn.style.left = `${x}px`;
        noBtn.style.top = `${y}px`;
    }
});
