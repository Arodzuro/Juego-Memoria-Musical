document.addEventListener('DOMContentLoaded', () => {
    // Configuración del AMSynth para un sonido más natural
    let synth = new Tone.Synth({
        oscillator: {
            type: "sine"
        },
        envelope: {
            attack: 0.05,
            decay: 0.1,
            sustain: 0.4,
            release: 0.8
        }
    }).toDestination();

    let patternSequence = [];
    let playerSequence = [];
    let currentLevel = 0;
    let isPlayingPattern = false;

    function generateNote() {
        const notes = [
            "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
            "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
            "C6"
        ];
        return notes[Math.floor(Math.random() * notes.length)];
    }

    function playPatternSequence() {
        isPlayingPattern = true;
        let time = 0;
        patternSequence.forEach((note, index) => {
            setTimeout(() => {
                playNoteWithHighlight(note);
                if (index === patternSequence.length - 1) {
                    isPlayingPattern = false;
                }
            }, time);
            time += 600;
        });
    }

    function playNoteWithHighlight(note) {
        const key = document.querySelector(`[data-note="${note}"]`);
        if (!key) return;
        key.classList.add('active');
        synth.triggerAttackRelease(note, '8n');
        setTimeout(() => {
            key.classList.remove('active');
        }, 500);
    }

    function checkPlayerSequence() {
        const currentStep = playerSequence.length - 1;
        if (playerSequence[currentStep] !== patternSequence[currentStep]) {
            document.getElementById('message').textContent = 'Incorrecto, intenta nuevamente.';
            resetGame(true);
            return;
        }

        if (playerSequence.length === patternSequence.length) {
            currentLevel++;
            document.getElementById('message').textContent = '¡Muy bien! Avanza al nivel ' + currentLevel;
            setTimeout(nextLevel, 1000);
        }
    }

    function nextLevel() {
        playerSequence = [];
        patternSequence.push(generateNote());
        playPatternSequence();
    }

    function resetGame(showMessage = false) {
        currentLevel = 0;
        patternSequence = [];
        playerSequence = [];
        if (showMessage) {
            document.getElementById('message').textContent = 'Juego reiniciado. ¡Intenta nuevamente!';
        } else {
            document.getElementById('message').textContent = '';
        }
    }

    document.getElementById('startButton').addEventListener('click', () => {
        resetGame();
        nextLevel();
    });

    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        const note = key.getAttribute('data-note');

        const handleNotePress = () => {
            if (isPlayingPattern) return;
            synth.triggerAttackRelease(note, '8n');
            key.classList.add('active');
            playerSequence.push(note);
            checkPlayerSequence();
        };

        const removeActive = () => {
            key.classList.remove('active');
        };

        // Ratón
        key.addEventListener('mousedown', handleNotePress);
        key.addEventListener('mouseup', removeActive);
        key.addEventListener('mouseleave', removeActive);

        // Táctil
        key.addEventListener('touchstart', e => {
            e.preventDefault();
            handleNotePress();
        }, { passive: false });

        key.addEventListener('touchend', removeActive);
    });

    // === NUEVO: Mapeo de teclado físico ===
    const keyMap = {
        'a': 'C4',
        'w': 'C#4',
        's': 'D4',
        'e': 'D#4',
        'd': 'E4',
        'f': 'F4',
        't': 'F#4',
        'g': 'G4',
        'y': 'G#4',
        'h': 'A4',
        'u': 'A#4',
        'j': 'B4',
        'k': 'C5'
    };

    document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        const note = keyMap[key];

        if (note && !isPlayingPattern) {
            const keyElement = document.querySelector(`.key[data-note="${note}"]`);
            if (keyElement) {
                keyElement.classList.add('active');
                synth.triggerAttackRelease(note, '8n');
                playerSequence.push(note);
                checkPlayerSequence();
                setTimeout(() => {
                    keyElement.classList.remove('active');
                }, 150);
            }
        }
    });
});
