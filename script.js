document.addEventListener('DOMContentLoaded', () => {
    // Configuración del sintetizador
    const synth = new Tone.Synth().toDestination();

    // Secuencia de notas (patrón) que el juego genera
    let patternSequence = [];
    // Secuencia del jugador
    let playerSequence = [];
    let currentLevel = 0;
    let isPlayingPattern = false;

    // Generar una nueva nota aleatoria
    function generateNote() {
        const notes = [
            "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
            "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
            "C6"
        ];
        return notes[Math.floor(Math.random() * notes.length)];
    }

    // Reproducir secuencia del patrón
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
            time += 600; // Ajustar el tiempo entre las notas
        });
    }

    // Reproducir una nota con la iluminación de la tecla
    function playNoteWithHighlight(note) {
        const key = document.querySelector(`[data-note="${note}"]`);
        key.classList.add('active');
        synth.triggerAttackRelease(note, '8n');
        setTimeout(() => {
            key.classList.remove('active');
        }, 500); // Duración de la iluminación
    }

    // Verificar la secuencia del jugador
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

    // Comenzar el siguiente nivel
    function nextLevel() {
        playerSequence = [];
        patternSequence.push(generateNote());
        playPatternSequence();
    }

    // Reiniciar el juego
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
/*prueba rotación*/
    function checkOrientation() {
        if (window.innerHeight > window.innerWidth) {
            // Modo vertical
            document.getElementById('rotateMessage').style.display = 'flex';
        } else {
            // Modo horizontal
            document.getElementById('rotateMessage').style.display = 'none';
        }
    }
    
    // Ejecutar la función al cargar la página
    window.addEventListener('load', checkOrientation);
    
    // Detectar cambios en la orientación
    window.addEventListener('resize', checkOrientation);
/*prueba rotación*/    

    // Comenzar el juego
    document.getElementById('startButton').addEventListener('click', () => {
        resetGame();
        nextLevel();
    });

    // Evento para cuando el jugador toca una nota
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.addEventListener('mousedown', () => {
            if (isPlayingPattern) return; // Prevenir que el jugador toque durante la reproducción del patrón

            const note = key.getAttribute('data-note');
            synth.triggerAttackRelease(note, '8n');
            key.classList.add('active');
            playerSequence.push(note);
            checkPlayerSequence();
        });
        key.addEventListener('mouseup', () => {
            key.classList.remove('active');
        });
    });
});
