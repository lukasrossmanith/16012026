const screens = { login: document.querySelector('#login-screen'), game: document.querySelector('#game-screen'), reveal: document.querySelector('#reveal-screen'), gallery: document.querySelector('#gallery-screen') };
const passwordForm = document.querySelector('#login-form');
const passwordInput = document.querySelector('#password');
const errorMessage = document.querySelector('#login-error');
const board = document.querySelector('#board');
const cells = [...document.querySelectorAll('.cell')];
const carousel = document.querySelector('#carousel');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
const galleryTitle = document.querySelector('#gallery-title');
const pagination = document.querySelector('#pagination');
const memories = Array.from({ length: 15 }, (_, index) => `assets/memory-${String(index + 1).padStart(2, '0')}.jpg`);
let moves = 0, gameFinished = false, carouselRotation = -720, activePhoto = 0, carouselReady = false, touchStartX = 0;
const heartIndexes = [];
function showScreen(name) { Object.entries(screens).forEach(([key, screen]) => { const selected = key === name; screen.hidden = !selected; requestAnimationFrame(() => screen.classList.toggle('is-active', selected)); }); }
passwordForm.addEventListener('submit', (event) => { event.preventDefault(); if (passwordInput.value === '160126') { errorMessage.textContent = ''; showScreen('game'); return; } errorMessage.textContent = 'That’s not quite it. Try again ♡'; errorMessage.classList.remove('shake'); requestAnimationFrame(() => errorMessage.classList.add('shake')); passwordInput.select(); });
function markHeart(cell) { cell.textContent = '♥'; cell.className = 'cell heart'; cell.disabled = true; }
function computerMove() { const option = cells.find((cell) => !cell.disabled); if (!option) return; option.textContent = '×'; option.className = 'cell x'; option.disabled = true; }
function winGame(winningHearts) { gameFinished = true; winningHearts.forEach((index) => cells[index].classList.add('winning')); cells.forEach((cell) => { cell.disabled = true; }); setTimeout(startReveal, 720); }
board.addEventListener('click', (event) => { const cell = event.target.closest('.cell'); if (!cell || cell.disabled || gameFinished) return; heartIndexes.push(cells.indexOf(cell)); markHeart(cell); moves += 1; if (moves === 3) winGame(heartIndexes); else computerMove(); });
function startReveal() { showScreen('reveal'); setTimeout(() => screens.reveal.classList.add('zooming'), 1000); setTimeout(startGallery, 2900); }
function startGallery() { screens.reveal.classList.remove('zooming'); showScreen('gallery'); galleryTitle.hidden = false; carousel.innerHTML = memories.map((source, index) => `<figure class="carousel-card" style="--index: ${index}"><img src="${source}" alt="Memory ${index + 1}" /></figure>`).join(''); pagination.innerHTML = memories.map((_, index) => `<button type="button" aria-label="Show photo ${index + 1}" data-photo="${index}" disabled></button>`).join(''); carousel.classList.add('spinning'); carousel.addEventListener('animationend', finishSpin, { once: true }); if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) finishSpin(); }
function finishSpin() { carousel.classList.remove('spinning'); carousel.classList.add('is-ready'); carousel.style.setProperty('--rotation', `${carouselRotation}deg`); carouselReady = true; previous.disabled = false; next.disabled = false; [...pagination.children].forEach((dot) => { dot.disabled = false; }); galleryTitle.hidden = true; updatePagination(); }
function updatePagination() { [...pagination.children].forEach((dot, index) => dot.classList.toggle('is-active', index === activePhoto)); }
function turn(direction) { if (!carouselReady) return; activePhoto = (activePhoto + direction + memories.length) % memories.length; carouselRotation -= direction * (360 / memories.length); carousel.style.setProperty('--rotation', `${carouselRotation}deg`); updatePagination(); }
previous.addEventListener('click', () => turn(-1)); next.addEventListener('click', () => turn(1));
pagination.addEventListener('click', (event) => { const dot = event.target.closest('[data-photo]'); if (!dot || !carouselReady) return; const target = Number(dot.dataset.photo); let distance = target - activePhoto; if (distance > memories.length / 2) distance -= memories.length; if (distance < -memories.length / 2) distance += memories.length; turn(distance); });
document.addEventListener('keydown', (event) => { if (!carouselReady) return; if (event.key === 'ArrowLeft') turn(-1); if (event.key === 'ArrowRight') turn(1); });
carousel.addEventListener('pointerdown', (event) => { touchStartX = event.clientX; });
carousel.addEventListener('pointerup', (event) => { const distance = event.clientX - touchStartX; if (Math.abs(distance) > 28) turn(distance < 0 ? 1 : -1); });
