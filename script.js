// Game state
let currentRound = 0;
let score = 0;
let selectedPhotos = [];
let currentPhotoIndex = 0;

// DOM elements
const landingScreen = document.getElementById('landing-screen');
const gameScreen = document.getElementById('game-screen');
const scoreScreen = document.getElementById('score-screen');
const startBtn = document.getElementById('start-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const gamePhoto = document.getElementById('game-photo');
const optionsContainer = document.getElementById('options-container');
const resultContainer = document.getElementById('result-container');
const resultIcon = document.getElementById('result-icon');
const resultText = document.getElementById('result-text');
const resultCaption = document.getElementById('result-caption');
const nextBtn = document.getElementById('next-btn');
const currentRoundDisplay = document.getElementById('current-round');
const finalScoreDisplay = document.getElementById('final-score');
const scoreMessage = document.getElementById('score-message');

// Shuffle array function
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Generate year options
function generateYearOptions(correctYear) {
    const options = [correctYear];
    
    // Add 3 nearby years (±1-3 years)
    const offsets = [];
    while (offsets.length < 3) {
        const offset = Math.floor(Math.random() * 6) - 3; // -3 to +2
        if (offset !== 0 && !offsets.includes(offset)) {
            offsets.push(offset);
            options.push(correctYear + offset);
        }
    }
    
    return shuffleArray(options);
}

// Start game
function startGame() {
    // Shuffle all photos
    const shuffledPhotos = shuffleArray(photos);
    
    // Select 5 photos with unique years
    selectedPhotos = [];
    const usedYears = new Set();
    
    for (const photo of shuffledPhotos) {
        if (!usedYears.has(photo.year)) {
            selectedPhotos.push(photo);
            usedYears.add(photo.year);
            
            // Stop when we have 5 photos with different years
            if (selectedPhotos.length === 5) {
                break;
            }
        }
    }
    
    // If we couldn't find 5 unique years, fill with remaining photos
    if (selectedPhotos.length < 5) {
        console.warn(`Only found ${selectedPhotos.length} unique years. Filling with additional photos.`);
        for (const photo of shuffledPhotos) {
            if (!selectedPhotos.includes(photo) && selectedPhotos.length < 5) {
                selectedPhotos.push(photo);
            }
        }
    }
    
    // Shuffle the selected photos so they're not in year order
    selectedPhotos = shuffleArray(selectedPhotos);
    
    currentRound = 0;
    score = 0;
    currentPhotoIndex = 0;
    
    console.log('Selected photos with unique years:', selectedPhotos.map(p => `${p.src} (${p.year})`));
    
    landingScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    loadRound();
}

// Load current round
function loadRound() {
    const photo = selectedPhotos[currentPhotoIndex];
    currentRoundDisplay.textContent = currentRound + 1;
    
    // Reset UI
    optionsContainer.innerHTML = '';
    resultContainer.classList.add('hidden');
    gamePhoto.style.display = 'none';
    
    // Show loading state
    const loadingText = document.createElement('div');
    loadingText.id = 'loading-text';
    loadingText.textContent = 'Loading photo...';
    loadingText.style.textAlign = 'center';
    loadingText.style.padding = '2rem';
    loadingText.style.color = '#666';
    optionsContainer.appendChild(loadingText);
    
    // Load photo with error handling and extension fallback
    let triedExtensions = [];
    
    function tryLoadImage(extensions) {
        if (extensions.length === 0) {
            // All extensions failed
            const loadingEl = document.getElementById('loading-text');
            if (loadingEl) {
                loadingEl.innerHTML = `Error: Could not find image file.<br><small>Tried: ${triedExtensions.join(', ')}</small>`;
                loadingEl.style.color = '#f44336';
            }
            console.error('Failed to load image after trying:', triedExtensions);
            return;
        }
        
        const ext = extensions[0];
        const baseName = photo.src.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
        const testSrc = baseName + '.' + ext;
        triedExtensions.push(testSrc);
        
        console.log('Trying to load:', testSrc);
        
        const img = new Image();
        img.onload = function() {
            console.log('Successfully loaded:', testSrc);
            gamePhoto.src = testSrc;
            photo.src = testSrc; // Update the photo object with correct path
            gamePhoto.alt = `Photo from ${photo.year}`;
            gamePhoto.style.display = 'block';
            
            // Remove loading text
            const loadingEl = document.getElementById('loading-text');
            if (loadingEl) loadingEl.remove();
            
            // Generate and display year options
            const yearOptions = generateYearOptions(photo.year);
            yearOptions.forEach(year => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.textContent = year;
                btn.onclick = () => selectYear(year, photo.year, photo.caption);
                optionsContainer.appendChild(btn);
            });
        };
        
        img.onerror = function() {
            // Try next extension
            tryLoadImage(extensions.slice(1));
        };
        
        img.src = testSrc;
    }
    
    // Try common extensions: jpg, jpeg, png, gif, webp
    const currentExt = photo.src.match(/\.([^.]+)$/i)?.[1]?.toLowerCase() || 'jpg';
    const extensions = [currentExt, 'jpg', 'jpeg', 'png', 'gif', 'webp'].filter((v, i, a) => a.indexOf(v) === i);
    tryLoadImage(extensions);
}

// Handle year selection
function selectYear(selectedYear, correctYear, caption) {
    // Disable all option buttons
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        if (parseInt(btn.textContent) === correctYear) {
            btn.style.borderColor = '#4caf50';
            btn.style.background = '#e8f5e9';
        }
        if (parseInt(btn.textContent) === selectedYear && selectedYear !== correctYear) {
            btn.style.borderColor = '#f44336';
            btn.style.background = '#ffebee';
        }
    });
    
    // Show result
    const isCorrect = selectedYear === correctYear;
    if (isCorrect) {
        score++;
        resultIcon.textContent = '✅';
        resultText.textContent = 'Correct';
        resultText.style.color = '#4caf50';
    } else {
        resultIcon.textContent = '❌';
        resultText.textContent = 'Not quite';
        resultText.style.color = '#f44336';
    }
    
    resultCaption.textContent = `${correctYear} — ${caption}`;
    resultContainer.classList.remove('hidden');
}

// Move to next round
function nextRound() {
    currentPhotoIndex++;
    currentRound++;
    
    if (currentRound < 5) {
        loadRound();
    } else {
        showScoreScreen();
    }
}

// Show final score screen
function showScoreScreen() {
    gameScreen.classList.remove('active');
    scoreScreen.classList.add('active');
    
    finalScoreDisplay.textContent = score;
    
    // Set score message
    if (score === 5) {
        scoreMessage.textContent = 'Photographic memory';
    } else if (score >= 3) {
        scoreMessage.textContent = 'Pretty impressive';
    } else {
        scoreMessage.textContent = 'Time flies, huh?';
    }
}

// Play again
function playAgain() {
    scoreScreen.classList.remove('active');
    startGame();
}

// Check if photos are loaded
if (typeof photos === 'undefined' || photos.length === 0) {
    console.error('No photos found! Make sure data.js is loaded and contains photo entries.');
    alert('Error: No photos found. Please check that data.js is loaded correctly.');
}

// Event listeners
startBtn.addEventListener('click', startGame);
nextBtn.addEventListener('click', nextRound);
playAgainBtn.addEventListener('click', playAgain);

