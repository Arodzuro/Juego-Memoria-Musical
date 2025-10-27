let synth;
let audioInitialized = false;
let patternSequence = [];
let playerSequence = [];
let currentLevel = 0;
let bestScore = 0;
let isPlayingPattern = false;
let gameActive = false;

const notes = [
    "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
    "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5"
];

// Inicializar audio
function initAudio() {
    if (audioInitialized) return;
    
    try {
        Tone.start();
        synth = new Tone.Synth({
            oscillator: { type: "sine" },
            envelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.2,
                release: 0.3
            }
        }).toDestination();
        audioInitialized = true;
        console.log('Audio inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar audio:', error);
    }
}

function generateNote() {
    return notes[Math.floor(Math.random() * notes.length)];
}

function playPatternSequence() {
    if (!gameActive) {
        console.log('playPatternSequence cancelado - juego no activo');
        return;
    }
    isPlayingPattern = true;
    disableButton(true);
    let index = 0;
    
    const playNext = () => {
        if (!gameActive) {
            isPlayingPattern = false;
            return;
        }
        if (index < patternSequence.length) {
            playNoteWithHighlight(patternSequence[index]);
            index++;
            setTimeout(playNext, 500);
        } else {
            isPlayingPattern = false;
            if (gameActive) {
                disableButton(true);
                showMessage('🎹 ¡Tu turno!');
            }
        }
    };
    
    playNext();
}

function playNoteWithHighlight(note) {
    const key = document.querySelector(`[data-note="${note}"]`);
    if (key) {
        key.classList.add('active');
        if (audioInitialized && synth) {
            try {
                synth.triggerAttackRelease(note, '8n');
            } catch (e) {
                console.error('Error al reproducir nota:', e);
            }
        }
        setTimeout(() => {
            key.classList.remove('active');
        }, 350);
    }
}

function checkPlayerSequence() {
    const currentStep = playerSequence.length - 1;
    
    if (playerSequence[currentStep] !== patternSequence[currentStep]) {
        showMessage('❌ ¡Incorrecto! Intenta nuevamente', 'error');
        gameActive = false;
        isPlayingPattern = false;
        setTimeout(() => {
            resetGame();
            disableButton(false);
        }, 1500);
        return;
    }

    if (playerSequence.length === patternSequence.length) {
        currentLevel++;
        updateLevel();
        
        if (currentLevel > bestScore) {
            bestScore = currentLevel;
            document.getElementById('bestScore').textContent = bestScore;
        }
        
        showMessage(`✨ ¡Excelente! Nivel ${currentLevel}`, 'success');
        setTimeout(() => {
            if (gameActive) {
                nextLevel();
            }
        }, 1200);
    }
}

function nextLevel() {
    if (!gameActive) {
        console.log('nextLevel cancelado - juego no activo');
        return;
    }
    playerSequence = [];
    patternSequence.push(generateNote());
    console.log('Patrón actual:', patternSequence);
    showMessage('👀 Observa la secuencia...');
    setTimeout(() => {
        if (gameActive) {
            playPatternSequence();
        }
    }, 600);
}

function resetGame() {
    gameActive = false;
    currentLevel = 0;
    patternSequence = [];
    playerSequence = [];
    isPlayingPattern = false;
    updateLevel();
    showMessage('');
}

function updateLevel() {
    document.getElementById('levelDisplay').textContent = currentLevel;
}

function showMessage(text, type = '') {
    const msgEl = document.getElementById('message');
    msgEl.textContent = text;
    msgEl.className = type === 'error' ? 'message-error' : type === 'success' ? 'message-success' : '';
}

function disableButton(disabled) {
    const btn = document.getElementById('startButton');
    btn.disabled = disabled;
    if (disabled) {
        btn.textContent = '⏳ Jugando...';
    } else {
        btn.textContent = '🎮 Empezar';
    }
}

// Event listener del botón
document.getElementById('startButton').addEventListener('click', () => {
    if (gameActive || isPlayingPattern) return;
    
    initAudio();
    
    const intro = document.getElementById('intro');
    if (intro) {
        intro.style.display = 'none';
    }
    
    gameActive = true;
    resetGame();
    gameActive = true;
    disableButton(true);
    showMessage('🎮 ¡Comenzando!');
    setTimeout(() => {
        nextLevel();
    }, 800);
});

// Event listeners de las teclas
const keys = document.querySelectorAll('.key');
keys.forEach(key => {
    const note = key.getAttribute('data-note');

    const handleNotePress = () => {
        if (isPlayingPattern || !gameActive) {
            console.log('Click bloqueado - Playing:', isPlayingPattern, 'Active:', gameActive);
            return;
        }
        
        initAudio();
        
        key.classList.add('active');
        if (audioInitialized && synth) {
            try {
                synth.triggerAttackRelease(note, '8n');
            } catch (e) {
                console.error('Error:', e);
            }
        }
        
        playerSequence.push(note);
        console.log('Jugador presionó:', note, 'Secuencia actual:', playerSequence);
        checkPlayerSequence();
        
        setTimeout(() => {
            key.classList.remove('active');
        }, 200);
    };

    // Mouse
    key.addEventListener('mousedown', handleNotePress);

    // Touch
    key.addEventListener('touchstart', e => {
        e.preventDefault();
        handleNotePress();
    }, { passive: false });
});

// Teclado físico
const keyMap = {
    'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4',
    'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4',
    'u': 'A#4', 'j': 'B4', 'k': 'C5', 'o': 'C#5', 'l': 'D5',
    'p': 'D#5', 'ñ': 'E5'
};

document.addEventListener('keydown', (event) => {
    if (isPlayingPattern || !gameActive) return;
    
    const key = event.key.toLowerCase();
    const note = keyMap[key];

    if (note) {
        initAudio();
        const keyElement = document.querySelector(`.key[data-note="${note}"]`);
        if (keyElement) {
            keyElement.classList.add('active');
            if (audioInitialized && synth) {
                try {
                    synth.triggerAttackRelease(note, '8n');
                } catch (e) {
                    console.error('Error:', e);
                }
            }
            playerSequence.push(note);
            checkPlayerSequence();
            setTimeout(() => {
                keyElement.classList.remove('active');
            }, 200);
        }
    }
});
