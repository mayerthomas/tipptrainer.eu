/**
 * ==============================================================================
 * CORE LOGIC & ENGINE - tipptrainer.eu
 * ==============================================================================
 * Diese Datei enthält die gesamte Steuerungslogik für den Tipptrainer.
 * Sie umfasst das Setup der Textvorlagen, die Echtzeit-Auswertung der 
 * Tastenanschläge (inkl. Anti-Cheat), den Levenshtein-Algorithmus zur 
 * exakten Fehlerermittlung sowie die finale Zeugnis-Generierung.
 */

// ==============================================================================
// 1. KONFIGURATION & STATE (Zustandsverwaltung)
// ==============================================================================
(() => {

const MAX_TEXT_LENGTH = 20000;

// Globale Variablen für den Ablauf der Abschrift
let originalText = "";
let timerInterval = null;
let totalSeconds = 0;
let timeLeft = 0;
let startTime = 0;
let endTime = 0;
let hasStarted = false;
let isTestActive = false;
let hasFinished = false;
let closeConfirmModal = null;

// Anti-Cheat & UI-Rendering Variablen
let lastValidInput = "";
let charSpans = [];
let lastHighlightIndex = 0;


// ==============================================================================
// 2. DOM-ELEMENTE REFERENZIEREN
// ==============================================================================

// Sektionen
const setupSection = document.getElementById('setup-section');
const testSection = document.getElementById('test-section');
const resultSection = document.getElementById('result-section');

// Formular & Dateiauswahl
const setupForm = document.getElementById('setup-form');
const radioSources = document.querySelectorAll('input[name="text-source"]');
const templateSelectContainer = document.getElementById('template-select-container');
const templateSelect = document.getElementById('template-select');
const fileUploadContainer = document.getElementById('file-upload-container');
const fileInput = document.getElementById('file-input');

// Dauer & UI
const durationSlider = document.getElementById('duration-slider');
const durationDisplay = document.getElementById('duration-display');
const typingArea = document.getElementById('typing-area');
const originalTextDisplay = document.getElementById('original-text-display');
const timerDisplay = document.getElementById('timer-display');
const liveAnschlaege = document.getElementById('live-anschlaege');
const btnEarlyFinish = document.getElementById('btn-early-finish');

// Nativen Value-Getter/-Setter sichern und direkte Konsolen-Manipulation
// (z. B. document.getElementById('typing-area').value = ...) unterbinden
const nativeValueDesc = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
const getTypingValue = () => nativeValueDesc.get.call(typingArea);
const setTypingValue = (val) => nativeValueDesc.set.call(typingArea, val);

Object.defineProperty(typingArea, 'value', {
    get() {
        return getTypingValue();
    },
    set() {
        alert("Schummeln gilt nicht! Manipulation über die Konsole ist deaktiviert.");
    },
    configurable: false
});


// ==============================================================================
// 3. INITIALISIERUNG & EVENT LISTENER (Setup-Phase)
// ==============================================================================

// Dropdown mit Vorlagen befüllen
templateFiles.forEach((file) => {
    const option = document.createElement('option');
    option.value = file;
    option.textContent = file;
    templateSelect.appendChild(option);
});

// Toggle zwischen Datei-Upload und Vorlagen-Auswahl
radioSources.forEach(radio => {
    radio.addEventListener('change', () => {
        const source = document.querySelector('input[name="text-source"]:checked').value;
        if (source === 'upload') {
            fileUploadContainer.classList.remove('hidden');
            templateSelectContainer.classList.add('hidden');
            fileInput.required = true;
        } else {
            fileUploadContainer.classList.add('hidden');
            templateSelectContainer.classList.remove('hidden');
            fileInput.required = false;
        }
    });
});

// Slider für die Zeitangabe live aktualisieren
durationSlider.addEventListener('input', function () {
    const val = parseInt(this.value, 10);
    const m = Math.floor(val / 60).toString().padStart(2, '0');
    const s = (val % 60).toString().padStart(2, '0');
    durationDisplay.textContent = `${m}:${s}`;
});

// Warnung beim versehentlichen Schließen des Tabs während einer aktiven Abschrift
window.addEventListener('beforeunload', function (e) {
    if (isTestActive) {
        e.preventDefault();
        e.returnValue = 'Die Abschrift läuft noch. Möchtest du wirklich abbrechen?';
    }
});


// ==============================================================================
// 4. TEST VORBEREITEN & STARTEN
// ==============================================================================

/**
 * Bereitet den Text vor, baut das statische Span-Array für verzögerungsfreies 
 * Rendering und wechselt in die Test-Ansicht.
 * @param {ArrayBuffer} buffer - Die eingelesene Textdatei als Buffer
 */
function startAppWithBuffer(buffer) {
    let text = "";
    try {
        const decoder = new TextDecoder('utf-8', { fatal: true });
        text = decoder.decode(buffer);
    } catch (err) {
        // Fallback für Windows-ANSI encodierte TXT-Dateien
        const decoder = new TextDecoder('windows-1252');
        text = decoder.decode(buffer);
    }

    const cleanedText = text.replace(/\r\n/g, '\n').trimEnd();

    // Größen- und Inhaltsprüfung der Textvorlage
    if (cleanedText.length === 0) {
        alert("Die ausgewählte Datei enthält keinen Text.");
        fileInput.value = "";
        return;
    }
    if (cleanedText.length > MAX_TEXT_LENGTH) {
        alert(`Die ausgewählte Textvorlage ist zu lang (${cleanedText.length.toLocaleString('de-DE')} Zeichen). Maximal erlaubt sind ${MAX_TEXT_LENGTH.toLocaleString('de-DE')} Zeichen.`);
        fileInput.value = "";
        return;
    }

    originalText = cleanedText;

    // =====================================================================
    // DOM-Rendering: Text einmalig in Spans zerlegen.
    // Verhindert zu 100% Layout-Shifts (Springen der Wörter am Zeilenende),
    // da später nur noch CSS-Klassen getauscht werden, statt das DOM neu zu bauen.
    // =====================================================================
    originalTextDisplay.innerHTML = '';
    charSpans = [];
    lastHighlightIndex = 0;

    for (let i = 0; i < originalText.length; i++) {
        const span = document.createElement('span');
        if (originalText[i] === '\n') {
            span.textContent = '↵\n';
        } else {
            span.textContent = originalText[i];
        }
        span.className = 'text-gray-700 border-b-2 border-transparent';
        originalTextDisplay.appendChild(span);
        charSpans.push(span);
    }

    // Metadaten für die Auswertung setzen
    const fullName = document.getElementById('vorname').value.trim() + ' ' + document.getElementById('nachname').value.trim();
    const studentClass = document.getElementById('klasse').value.trim();

    document.getElementById('student-name-display').textContent = fullName;
    document.getElementById('student-class-display').textContent = studentClass;
    document.getElementById('res-name').textContent = fullName;
    document.getElementById('res-klasse').textContent = studentClass;

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    document.getElementById('res-datum').textContent = `${dd}.${mm}.${yyyy}`;

    // Status & Timer konfigurieren
    hasStarted = false;
    isTestActive = false;
    hasFinished = false;
    startTime = 0;
    endTime = 0;
    totalSeconds = parseInt(durationSlider.value, 10);
    timeLeft = totalSeconds;
    updateTimerDisplay();

    btnEarlyFinish.classList.add('hidden');
    btnEarlyFinish.classList.remove('inline-flex');

    // UI umschalten
    setupSection.classList.add('hidden');
    testSection.classList.remove('hidden');
    
    // Smooth Scrolling zum Beginn des Test-Bereichs (mit leichtem Render-Delay)
    setTimeout(() => {
        testSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);

    setTypingValue("");
    typingArea.disabled = false;
    lastValidInput = "";
    originalTextDisplay.scrollTop = 0;
    updateLiveHighlighter();
    typingArea.focus();
}

// Formular absenden (Datei einlesen oder Vorlage laden)
setupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const source = document.querySelector('input[name="text-source"]:checked').value;

    if (source === 'upload') {
        const file = fileInput.files[0];
        if (!file) return;
        if (file.size === 0) {
            alert("Die ausgewählte Datei ist leer.");
            fileInput.value = "";
            return;
        }
        if (file.size > MAX_TEXT_LENGTH * 4) {
            alert(`Die ausgewählte Datei ist zu groß. Maximal erlaubt sind ${MAX_TEXT_LENGTH.toLocaleString('de-DE')} Zeichen.`);
            fileInput.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => startAppWithBuffer(evt.target.result);
        reader.readAsArrayBuffer(file);
    } else {
        const filename = templateSelect.value;
        const filepath = templateDirectory + filename;

        fetch(filepath)
            .then(response => {
                if (!response.ok) throw new Error("Datei nicht gefunden");
                return response.arrayBuffer();
            })
            .then(buffer => startAppWithBuffer(buffer))
            .catch(err => {
                alert(`Vorlagendatei '${filepath}' konnte nicht geladen werden.\nHinweis: Wenn du die App lokal auf deinem Computer startest, blockieren Browser aus Sicherheitsgründen oft den Zugriff auf andere lokale Dateien. Nutze in diesem Fall die Option 'Eigene Datei hochladen' oder starte einen lokalen Webserver.`);
            });
    }
});


// ==============================================================================
// 5. TIMER & TASTATUREINGABE (Laufende Abschrift)
// ==============================================================================

function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${m}:${s}`;
}

function startTimer() {
    hasStarted = true;
    isTestActive = true;
    startTime = Date.now();
    endTime = startTime + totalSeconds * 1000;
    btnEarlyFinish.classList.remove('hidden');
    btnEarlyFinish.classList.add('inline-flex');

    timerInterval = setInterval(() => {
        const remainingMs = endTime - Date.now();
        timeLeft = Math.max(0, Math.ceil(remainingMs / 1000));
        updateTimerDisplay();
        if (remainingMs <= 0) finishTest();
    }, 250);
}

// Blockierte Input-Typen für das beforeinput-Event (Paste, Drop, Autokorrektur-Ersetzung)
const BLOCKED_INPUT_TYPES = new Set([
    'insertFromPaste',
    'insertFromPasteAsQuotation',
    'insertFromDrop',
    'insertFromYank',
    'insertReplacementText'
]);

typingArea.addEventListener('beforeinput', (e) => {
    if (BLOCKED_INPUT_TYPES.has(e.inputType) || (e.data && e.data.length > 2)) {
        e.preventDefault();
        if (e.inputType !== 'insertReplacementText') {
            alert("Schummeln gilt nicht! Einfügen von Text ist deaktiviert.");
        }
    }
});

// Haupt-Event-Listener für die Texteingabe
typingArea.addEventListener('input', (e) => {
    const currentInput = getTypingValue();

    // ANTI-CHEAT-ENGINE
    // Verhindert das Einfügen von Text sowie synthetische Events über die Konsole (F12).
    // Toleranz: 2 Zeichen als Fallback für mobile Eingabemethoden.
    if (!e.isTrusted || currentInput.length - lastValidInput.length > 2) {
        setTypingValue(lastValidInput);
        alert("Schummeln gilt nicht! Einfügen von Text ist deaktiviert.");
        return;
    }

    lastValidInput = currentInput;

    // Timer beim ersten Tastendruck starten
    if (!hasStarted && timeLeft > 0 && currentInput.length > 0) {
        startTimer();
    }
    
    liveAnschlaege.textContent = calculateTotalStrokes(currentInput);
    updateLiveHighlighter();

    // Test automatisch beenden, wenn das Textende erreicht ist
    if (currentInput.length >= originalText.length) {
        finishTest();
    }
});

/**
 * Scrollt ausschließlich den Vorlagen-Container (#original-text-display),
 * sobald das aktuelle Zeichen den komfortablen Sichtbereich verlässt.
 */
function keepCharInView(span) {
    const containerRect = originalTextDisplay.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    const padding = 36;

    if (spanRect.bottom > containerRect.bottom - padding || spanRect.top < containerRect.top + padding) {
        const targetTop = (spanRect.top - containerRect.top) + originalTextDisplay.scrollTop - (containerRect.height / 2) + (spanRect.height / 2);
        originalTextDisplay.scrollTo({
            top: Math.max(0, targetTop),
            behavior: 'smooth'
        });
    }
}

/**
 * Aktualisiert die visuelle Hervorhebung (Fokus-Modus) effizient,
 * indem nur die CSS-Klassen der betroffenen Spans geändert werden.
 */
function updateLiveHighlighter() {
    const highlightIndex = lastValidInput.length;
    if (highlightIndex >= originalText.length) return;

    // O(1) Update für normales Tippen (nur 1 Zeichen vorwärts = extrem schnell)
    if (highlightIndex === lastHighlightIndex + 1) {
        if (lastHighlightIndex < charSpans.length) {
            charSpans[lastHighlightIndex].className = 'text-gray-400 border-b-2 border-transparent';
        }
        if (highlightIndex < charSpans.length) {
            charSpans[highlightIndex].className = 'text-red-700 bg-red-200 border-b-2 border-red-500';
            keepCharInView(charSpans[highlightIndex]);
        }
    }
    // Fallback (z.B. bei Löschen mit Backspace) -> alle Spans neu berechnen
    else {
        for (let i = 0; i < charSpans.length; i++) {
            const span = charSpans[i];
            if (i < highlightIndex) {
                span.className = 'text-gray-400 border-b-2 border-transparent';
            } else if (i === highlightIndex) {
                span.className = 'text-red-700 bg-red-200 border-b-2 border-red-500';
                keepCharInView(span);
            } else {
                span.className = 'text-gray-700 border-b-2 border-transparent';
            }
        }
    }

    lastHighlightIndex = highlightIndex;
}


// ==============================================================================
// 6. BEENDIGUNG & ZEUGNIS-GENERIERUNG
// ==============================================================================

function finishTest() {
    if (hasFinished) return;
    hasFinished = true;

    if (closeConfirmModal) closeConfirmModal();

    clearInterval(timerInterval);
    typingArea.disabled = true;
    isTestActive = false;

    // Nur den durch echte Tastatureingaben validierten Text auswerten (Schutz gegen DOM-Manipulation)
    setTypingValue(lastValidInput);
    const typedText = lastValidInput;

    const elapsedMs = hasStarted
        ? Math.min(totalSeconds * 1000, Math.max(0, Date.now() - startTime))
        : 0;
    const elapsedSeconds = elapsedMs / 1000;
    const timeUsed = Math.round(elapsedSeconds);
    const m = String(Math.floor(timeUsed / 60)).padStart(2, '0');
    const s = String(timeUsed % 60).padStart(2, '0');

    // Dauer & Originaltext anzeigen
    document.getElementById('res-dauer').textContent = `${m}:${s}`;
    document.getElementById('res-original-text').textContent = originalText;

    // Reine Auswertungslogik (evaluation.js) aufrufen
    const { anschlaege, fehler, quotient, tokens } = evaluate(originalText, typedText);

    // APM mit den gewerteten Anschlägen und exakter Laufzeit berechnen
    let apm = 0;
    if (elapsedSeconds > 0) {
        apm = Math.round((anschlaege / elapsedSeconds) * 60);
    } else if (anschlaege > 0) {
        apm = anschlaege;
    }

    // Gewerteten Text ins DOM rendern
    const evaluatedContainer = document.getElementById('evaluated-text');
    evaluatedContainer.innerHTML = '';

    for (const token of tokens) {
        if (token.type === 'match') {
            evaluatedContainer.appendChild(document.createTextNode(token.char));
        } else if (token.type === 'del') {
            evaluatedContainer.appendChild(createMissingCharNode(token.isLastWord));
        } else {
            evaluatedContainer.appendChild(createErrorNode(token.char, token.isLastWord));
        }
    }

    // Finale Ergebnisse ins DOM schreiben
    document.getElementById('res-apm').textContent = apm;
    document.getElementById('res-anschlaege').textContent = anschlaege;
    document.getElementById('res-fehler').textContent = fehler;
    document.getElementById('res-quotient').textContent = quotient + ' %';

    // UI umschalten auf Ergebnis-Ansicht
    testSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
}

/**
 * Erstellt ein DOM-Element (Span) für fehlerhaft getippte Buchstaben.
 */
function createErrorNode(char, isLastWord = false) {
    const span = document.createElement('span');
    span.className = isLastWord ? 'typed-error-last-word' : 'typed-error';
    if (char === ' ') span.textContent = '␣';
    else if (char === '\n') span.textContent = '↵\n';
    else span.textContent = char;
    return span;
}

/**
 * Erstellt ein DOM-Element (Span) für ausgelassene Buchstaben.
 */
function createMissingCharNode(isLastWord = false) {
    const span = document.createElement('span');
    span.className = isLastWord ? 'typed-error-last-word' : 'typed-error';
    span.textContent = '^';
    return span;
}


// ==============================================================================
// 8. POPUP-DIALOGE & RESET
// ==============================================================================

/**
 * Setzt die Applikation komplett zurück, ohne die Seite neu zu laden (SPA Verhalten).
 */
function resetApp() {
    if (closeConfirmModal) closeConfirmModal();
    clearInterval(timerInterval);

    hasStarted = false;
    isTestActive = false;
    hasFinished = false;
    startTime = 0;
    endTime = 0;
    lastValidInput = "";

    setTypingValue("");
    typingArea.disabled = false;

    document.getElementById('live-anschlaege').textContent = "0";
    btnEarlyFinish.classList.add('hidden');
    btnEarlyFinish.classList.remove('inline-flex');

    testSection.classList.add('hidden');
    resultSection.classList.add('hidden');
    setupSection.classList.remove('hidden');
}

/**
 * Zeigt ein modales Bestätigungsfenster an (ersetzt das native window.confirm).
 * @returns {Promise<boolean>} True bei "Ja", False bei "Nein"
 */
function showConfirmModal() {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        const btnYes = document.getElementById('btn-confirm-yes');
        const btnNo = document.getElementById('btn-confirm-no');

        modal.classList.remove('hidden');
        btnNo.focus();

        const cleanup = () => {
            modal.classList.add('hidden');
            btnYes.removeEventListener('click', onYes);
            btnNo.removeEventListener('click', onNo);
            document.removeEventListener('keydown', onKeyDown);
            closeConfirmModal = null;
        };

        const onYes = () => {
            cleanup();
            resolve(true);
        };
        const onNo = () => {
            cleanup();
            if (isTestActive) typingArea.focus();
            resolve(false);
        };
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onNo();
            }
        };

        closeConfirmModal = () => {
            cleanup();
            resolve(false);
        };

        btnYes.addEventListener('click', onYes);
        btnNo.addEventListener('click', onNo);
        document.addEventListener('keydown', onKeyDown);
    });
}

/**
 * Bricht die aktuelle Abschrift ab und navigiert zurück zum Setup.
 */
async function handleNeueAbschriftClick() {
    if (hasStarted && isTestActive) {
        const confirmed = await showConfirmModal();
        if (!confirmed || !isTestActive) return;
    }
    resetApp();
}

/**
 * Beendet die Abschrift vorzeitig und springt direkt in die Auswertung.
 */
async function handleEarlyFinishClick() {
    // Prüfen, ob das Textfeld komplett leer ist
    if (lastValidInput.trim().length === 0) {
        alert("Die Abschrift kann nicht beendet werden, da noch kein Text eingegeben wurde.");
        typingArea.focus(); // Setzt den Cursor wieder zurück ins Feld
        return; // Bricht die Funktion hier ab
    }

    if (hasStarted && isTestActive) {
        const confirmed = await showConfirmModal();
        if (!confirmed || !isTestActive) return;
    }
    finishTest();
}

// Globale Handler für HTML-Inline-Events bereitstellen
window.handleNeueAbschriftClick = handleNeueAbschriftClick;
window.handleEarlyFinishClick = handleEarlyFinishClick;
window.resetApp = resetApp;

})();