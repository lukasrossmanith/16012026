const screens = { login: document.querySelector('#login-screen'), game: document.querySelector('#game-screen'), loss: document.querySelector('#loss-screen'), gallery: document.querySelector('#gallery-screen') };
const passwordForm = document.querySelector('#login-form');
const passwordInput = document.querySelector('#password');
const errorMessage = document.querySelector('#login-error');
const board = document.querySelector('#board');
const cells = [...document.querySelectorAll('.cell')];
const gameStatus = document.querySelector('#game-status');
const playAgain = document.querySelector('#play-again');
const carousel = document.querySelector('#carousel');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
const galleryTitle = document.querySelector('#gallery-title');
const pagination = document.querySelector('#pagination');
const memories = Array.from({ length: 15 }, (_, index) => `assets/optimized/memory-${String(index + 1).padStart(2, '0')}.jpg`);
let boardState = Array(9).fill(''), gameFinished = false, isComputerTurn = false, carouselRotation = -720, activePhoto = 0, carouselReady = false, touchStartX = 0;
const winningLines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const screenHideTimers = new Map();
function showScreen(name) { Object.entries(screens).forEach(([key, screen]) => { const selected = key === name; clearTimeout(screenHideTimers.get(key)); if (selected) { screen.hidden = false; requestAnimationFrame(() => screen.classList.add('is-active')); } else { screen.classList.remove('is-active'); screenHideTimers.set(key, setTimeout(() => { if (!screen.classList.contains('is-active')) screen.hidden = true; }, 550)); } }); }
function resetGame() { boardState = Array(9).fill(''); gameFinished = false; isComputerTurn = false; board.setAttribute('aria-busy', 'false'); gameStatus.textContent = 'Your turn — make a line of three hearts.'; cells.forEach((cell) => { cell.textContent = ''; cell.className = 'cell'; cell.disabled = false; }); }
function startGame() { resetGame(); showScreen('game'); setTimeout(() => cells[0].focus(), 600); }
passwordForm.addEventListener('submit', (event) => { event.preventDefault(); if (passwordInput.value === '160126') { errorMessage.textContent = ''; passwordInput.value = ''; startGame(); return; } errorMessage.textContent = 'That’s not quite it. Try again ♡'; errorMessage.classList.remove('shake'); requestAnimationFrame(() => errorMessage.classList.add('shake')); passwordInput.select(); });
function markCell(index, player) { const cell = cells[index]; boardState[index] = player; cell.textContent = player === 'heart' ? '♥' : '×'; cell.className = `cell ${player}`; cell.disabled = true; }
function getWinningLine(player) { return winningLines.find(([a, b, c]) => boardState[a] === player && boardState[b] === player && boardState[c] === player); }
function endGame(line, winner) { gameFinished = true; isComputerTurn = false; board.setAttribute('aria-busy', 'false'); cells.forEach((cell) => { cell.disabled = true; }); if (line) line.forEach((index) => cells[index].classList.add('winning')); if (winner === 'heart') { gameStatus.textContent = 'You won!'; setTimeout(startGallery, 720); return; } gameStatus.textContent = winner === 'x' ? 'The computer won.' : 'It’s a draw.'; setTimeout(() => showScreen('loss'), 720); }
function checkGame() { const heartLine = getWinningLine('heart'); if (heartLine) { endGame(heartLine, 'heart'); return true; } const computerLine = getWinningLine('x'); if (computerLine) { endGame(computerLine, 'x'); return true; } if (!boardState.includes('')) { endGame(null, null); return true; } return false; }
function computerMove() { if (gameFinished) return; const option = [0, 1, 2, 3, 5, 6, 7, 8, 4].find((index) => !boardState[index]); if (option === undefined) { checkGame(); return; } markCell(option, 'x'); isComputerTurn = false; board.setAttribute('aria-busy', 'false'); gameStatus.textContent = 'Your turn — make a line of three hearts.'; checkGame(); }
board.addEventListener('click', (event) => { const cell = event.target.closest('.cell'); const index = cells.indexOf(cell); if (index < 0 || cell.disabled || gameFinished || isComputerTurn) return; markCell(index, 'heart'); if (checkGame()) return; isComputerTurn = true; board.setAttribute('aria-busy', 'true'); gameStatus.textContent = 'Their turn…'; setTimeout(computerMove, 360); });
playAgain.addEventListener('click', startGame);
function startGallery() { carouselReady = false; activePhoto = 0; carouselRotation = -720; showScreen('gallery'); galleryTitle.hidden = false; carousel.className = 'carousel spinning'; carousel.innerHTML = memories.map((source, index) => `<figure class="carousel-card" style="--index: ${index}"><img src="${source}" alt="Memory ${index + 1}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${index === 0 ? 'high' : 'low'}" /></figure>`).join(''); pagination.innerHTML = memories.map((_, index) => `<button type="button" aria-label="Show photo ${index + 1}" data-photo="${index}" disabled></button>`).join(''); previous.disabled = true; next.disabled = true; carousel.addEventListener('animationend', finishSpin, { once: true }); if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) finishSpin(); }
function finishSpin() { if (carouselReady) return; carousel.classList.remove('spinning'); carousel.classList.add('is-ready'); carousel.style.setProperty('--rotation', `${carouselRotation}deg`); carouselReady = true; previous.disabled = false; next.disabled = false; [...pagination.children].forEach((dot) => { dot.disabled = false; }); galleryTitle.hidden = true; updatePagination(); }
function updatePagination() { [...pagination.children].forEach((dot, index) => dot.classList.toggle('is-active', index === activePhoto)); }
function turn(direction) { if (!carouselReady) return; activePhoto = (activePhoto + direction + memories.length) % memories.length; carouselRotation -= direction * (360 / memories.length); carousel.style.setProperty('--rotation', `${carouselRotation}deg`); updatePagination(); }
previous.addEventListener('click', () => turn(-1)); next.addEventListener('click', () => turn(1));
pagination.addEventListener('click', (event) => { const dot = event.target.closest('[data-photo]'); if (!dot || !carouselReady) return; const target = Number(dot.dataset.photo); let distance = target - activePhoto; if (distance > memories.length / 2) distance -= memories.length; if (distance < -memories.length / 2) distance += memories.length; turn(distance); });
document.addEventListener('keydown', (event) => { if (!carouselReady) return; if (event.key === 'ArrowLeft') turn(-1); if (event.key === 'ArrowRight') turn(1); });
carousel.addEventListener('pointerdown', (event) => { touchStartX = event.clientX; });
carousel.addEventListener('pointerup', (event) => { const distance = event.clientX - touchStartX; if (Math.abs(distance) > 28) turn(distance < 0 ? 1 : -1); });
