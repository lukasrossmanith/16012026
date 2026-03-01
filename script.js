document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const boardElement = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const statusMessage = document.getElementById('status-message');
    const lossContainer = document.getElementById('loss-container');
    const carouselContainer = document.getElementById('carousel-container');
    const carousel = document.getElementById('carousel');
    const revealContainer = document.getElementById('reveal-container');

    let board = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    const currentPlayer = '❤️'; // User is Heart
    const computerPlayer = 'O';

    lossContainer.addEventListener('click', () => {
        location.reload();
    });

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    function handleCellClick(event) {
        const clickedCell = event.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (board[clickedCellIndex] !== '' || !gameActive) {
            return;
        }

        makeMove(clickedCellIndex, currentPlayer);

        if (!checkResult()) {
            setTimeout(computerMove, 500);
        }
    }

    function makeMove(index, player) {
        board[index] = player;
        cells[index].innerText = player;
        cells[index].classList.add('taken');
        if (player === currentPlayer) {
            cells[index].classList.add('user-move');
        }
    }

    function computerMove() {
        if (!gameActive) return;

        // Purely deterministic: pick the first available cell from this list
        const preferences = [0, 1, 2, 3, 5, 6, 7, 8, 4];
        let move = -1;
        
        for (let i of preferences) {
            if (board[i] === '') {
                move = i;
                break;
            }
        }

        if (move !== -1) {
            makeMove(move, computerPlayer);
            checkResult();
        }
    }

    function checkResult() {
        let roundWon = false;
        let winner = '';

        for (let i = 0; i <= 7; i++) {
            const winCondition = winningConditions[i];
            let a = board[winCondition[0]];
            let b = board[winCondition[1]];
            let c = board[winCondition[2]];
            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                winner = a;
                break;
            }
        }

        if (roundWon) {
            gameActive = false;
            if (winner === currentPlayer) {
                handleWin();
            } else {
                handleLoss();
            }
            return true;
        }

        if (!board.includes('')) {
            gameActive = false;
            handleLoss(); // Draw is considered a loss for the "special" outcome
            return true;
        }

        return false;
    }

    function handleLoss() {
        statusMessage.innerText = "Game Over!";
        setTimeout(() => {
            gameContainer.style.opacity = '0';
            setTimeout(() => {
                gameContainer.classList.add('hidden');
                lossContainer.classList.remove('hidden');
            }, 500);
        }, 1000);
    }

    function handleWin() {
        statusMessage.innerText = "You Win!";
        setTimeout(() => {
            gameContainer.style.opacity = '0';
            setTimeout(() => {
                gameContainer.classList.add('hidden');
                startCarouselSequence();
            }, 500);
        }, 1000);
    }

    function startCarouselSequence() {
        carouselContainer.classList.remove('hidden');
        
        let rotation = 0;
        let speed = 1; // initial degrees per frame
        let accelerating = false;
        let startTime = null;

        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;

            if (elapsed > 3000 && !accelerating) {
                accelerating = true;
            }

            if (accelerating) {
                speed += 0.2; // Increase speed every frame
            }

            rotation += speed;
            carousel.style.transform = `rotateY(${rotation}deg)`;

            if (speed < 60) { // Limit max speed before explosion
                requestAnimationFrame(animate);
            } else {
                // EXPLODE
                createConfetti();
                carousel.classList.add('explode');
                setTimeout(() => {
                    carouselContainer.classList.add('hidden');
                    revealContainer.classList.remove('hidden');
                    showMessages();
                }, 500);
            }
        }

        requestAnimationFrame(animate);
    }

    function createConfetti() {
        const colors = ['#ff4d6d', '#ff758f', '#ffb3c1', '#c9184a', '#ffccd5'];
        for (let i = 0; i < 150; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = '50%';
            confetti.style.top = '50%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            document.body.appendChild(confetti);

            const destinationX = (Math.random() - 0.5) * window.innerWidth * 1.5;
            const destinationY = (Math.random() - 0.5) * window.innerHeight * 1.5;
            const rotation = Math.random() * 720;
            const delay = Math.random() * 200;

            confetti.animate([
                { transform: 'translate(-50%, -50%) scale(0) rotate(0deg)', opacity: 1 },
                { transform: `translate(${destinationX}px, ${destinationY}px) scale(${Math.random() * 1.5}) rotate(${rotation}deg)`, opacity: 0 }
            ], {
                duration: 1000 + Math.random() * 1000,
                easing: 'cubic-bezier(0, .9, .57, 1)',
                delay: delay,
                fill: 'forwards'
            }).onfinish = () => confetti.remove();
        }
    }

    function showMessages() {
        const rows = ['row-1', 'row-2', 'row-3'];
        rows.forEach((id, index) => {
            setTimeout(() => {
                document.getElementById(id).classList.add('show');
            }, index * 1500); // 1.5s delay between rows
        });
    }
});
