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

// Globale Variablen für den Ablauf der Abschrift
let originalText = "";
let timerInterval = null;
let totalSeconds = 0;
let timeLeft = 0;
let hasStarted = false;
let isTestActive = false;

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

    originalText = text.replace(/\r\n/g, '\n').trimEnd();

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

    // Timer konfigurieren
    totalSeconds = parseInt(durationSlider.value, 10);
    timeLeft = totalSeconds;
    updateTimerDisplay();

    // UI umschalten
    setupSection.classList.add('hidden');
    testSection.classList.remove('hidden');
    
    // Smooth Scrolling zum Beginn des Test-Bereichs (mit leichtem Render-Delay)
    setTimeout(() => {
        testSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);

    updateLiveHighlighter();
    typingArea.value = "";
    lastValidInput = "";
    typingArea.focus();
}

// Formular absenden (Datei einlesen oder Vorlage laden)
setupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const source = document.querySelector('input[name="text-source"]:checked').value;

    if (source === 'upload') {
        const file = fileInput.files[0];
        if (!file) return;
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
    btnEarlyFinish.classList.remove('hidden');

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) finishTest();
    }, 1000);
}

/**
 * Berechnet die Gesamtanschläge unter Berücksichtigung von 
 * Großbuchstaben und Sonderzeichen (die Shift benötigen = 2 Anschläge).
 */
function calculateTotalStrokes(text) {
    let strokes = 0;
    const twoStrokeChars = new Set([
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        'Ä', 'Ö', 'Ü', '!', '"', '§', '$', '%', '&', '/', '(', ')', '=', '?', '\`', ';', ':', '_', '\'', '*', '+', '~', '#', '>', '@', '|', 'µ', '€', '{', '}', '[', ']', '\\'
    ]);
    for (let i = 0; i < text.length; i++) {
        strokes += twoStrokeChars.has(text[i]) ? 2 : 1;
    }
    return strokes;
}

// Haupt-Event-Listener für die Texteingabe
typingArea.addEventListener('input', (e) => {
    const currentInput = e.target.value;

    // ANTI-CHEAT-ENGINE
    // Verhindert das Einfügen von Text per Drag&Drop, Paste oder Console (F12).
    // Toleranz: 2 Zeichen (nötig für manche mobile Autokorrekturen).
    if (currentInput.length - lastValidInput.length > 2) {
        e.target.value = lastValidInput;
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
 * Aktualisiert die visuelle Hervorhebung (Fokus-Modus) effizient,
 * indem nur die CSS-Klassen der betroffenen Spans geändert werden.
 */
function updateLiveHighlighter() {
    const highlightIndex = typingArea.value.length;
    if (highlightIndex >= originalText.length) return;

    // O(1) Update für normales Tippen (nur 1 Zeichen vorwärts = extrem schnell)
    if (highlightIndex === lastHighlightIndex + 1) {
        if (lastHighlightIndex < charSpans.length) {
            charSpans[lastHighlightIndex].className = 'text-gray-400 border-b-2 border-transparent';
        }
        if (highlightIndex < charSpans.length) {
            charSpans[highlightIndex].className = 'text-red-700 bg-red-200 border-b-2 border-red-500';
            if (highlightIndex > 0 && highlightIndex % 30 === 0) {
                charSpans[highlightIndex].scrollIntoView({ behavior: "smooth", block: "center" });
            }
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
                if (i > 0 && i % 30 === 0) {
                    span.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            } else {
                span.className = 'text-gray-700 border-b-2 border-transparent';
            }
        }
    }

    lastHighlightIndex = highlightIndex;
}


// ==============================================================================
// 6. AUSWERTUNGS-ALGORITHMUS (Modifizierte Levenshtein-Distanz)
// ==============================================================================

/**
 * Berechnet die präzise Abweichung zwischen Originaltext und geschriebener Eingabe.
 * Modifizierte Kostenfunktion, um das "Verschlucken" von Wörtern zu verhindern.
 * 
 * @param {string} orig - Der originale Vorlagentext
 * @param {string} typed - Die Eingabe des Schülers
 * @returns {Object} Ein Objekt mit dem Berechnungspfad und dem besten End-Index
 */
function calculatePrefixDiff(orig, typed) {
    const n = orig.length;
    const m = typed.length;
    if (m === 0) return { path: [], best_i: 0 };

    // Matrix Initialisierung
    const dp = new Int32Array((n + 1) * (m + 1));
    const get = (i, j) => dp[i * (m + 1) + j];
    const set = (i, j, val) => { dp[i * (m + 1) + j] = val; };

    for (let i = 0; i <= n; i++) set(i, 0, i);
    for (let j = 0; j <= m; j++) set(0, j, j);

    // Matrix befüllen (Kostenberechnung)
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (orig[i - 1] === typed[j - 1]) {
                set(i, j, get(i - 1, j - 1));
            } else {
                set(i, j, Math.min(
                    get(i - 1, j - 1) + 1, // Substitution (1 Punkt)
                    get(i - 1, j) + 1,     // Deletion (1 Punkt)
                    get(i, j - 1) + 1      // Insertion (1 Punkt)
                ));
            }
        }
    }

    // Den "günstigsten" Endpunkt finden
    let minCost = Infinity;
    let best_i = m;
    for (let i = 0; i <= n; i++) {
        if (get(i, m) <= minCost) {
            minCost = get(i, m);
            best_i = i;
        }
    }

    // Backtracing (Pfad-Rückverfolgung)
    let i = best_i;
    let j = m;
    const path = [];

    while (i > 0 || j > 0) {
        if (i === 0) {
            path.push({ type: 'ins', orig: null, typed: typed[j - 1] });
            j--;
        } else if (j === 0) {
            path.push({ type: 'del', orig: orig[i - 1], typed: null });
            i--;
        } else {
            const current = get(i, j);

            // Tie-Breaker: Priorisierung bei gleicher Fehlerpunktzahl, 
            // um korrekte Block-Markierungen bei fehlenden Wörtern zu erzwingen.
            if (orig[i - 1] !== typed[j - 1] && current === get(i - 1, j - 1) + 1) {
                // 1. Priorität: Substitution (Verhindert fehlerhaftes Springen bei Buchstabendrehern)
                path.push({ type: 'sub', orig: orig[i - 1], typed: typed[j - 1] });
                i--; j--;
            } else if (current === get(i - 1, j) + 1) {
                // 2. Priorität: Deletion 
                path.push({ type: 'del', orig: orig[i - 1], typed: null });
                i--;
            } else if (current === get(i, j - 1) + 1) {
                // 3. Priorität: Insertion 
                path.push({ type: 'ins', orig: null, typed: typed[j - 1] });
                j--;
            } else if (orig[i - 1] === typed[j - 1] && current === get(i - 1, j - 1)) {
                // 4. Priorität: Match (Übereinstimmung)
                path.push({ type: 'match', orig: orig[i - 1], typed: typed[j - 1] });
                i--; j--;
            }
        }
    }
    return { path: path.reverse(), best_i: best_i };
}

/**
 * Ordnet jedem Zeichen in einem Text eine Wort-ID zu.
 * Wird verwendet, um Fehler, die innerhalb desselben Wortes auftreten, 
 * als EINEN einzigen Fehler zu gruppieren (Prüfungsstandard).
 */
function getWordIds(text) {
    const ids = new Array(text.length).fill(-1);
    let currentId = 0;
    let inWord = false;
    const isSeparator = (c) => c === ' ' || c === '\n' || c === '\r' || c === '-';

    for (let i = 0; i < text.length; i++) {
        if (isSeparator(text[i])) {
            inWord = false;
        } else {
            if (!inWord && i > 0) currentId++;
            ids[i] = currentId;
            inWord = true;
        }
    }
    return ids;
}


// ==============================================================================
// 7. BEENDIGUNG & ZEUGNIS-GENERIERUNG
// ==============================================================================

function finishTest() {
    clearInterval(timerInterval);
    typingArea.disabled = true;
    isTestActive = false;

    const typedText = typingArea.value;

    const timeUsed = totalSeconds - timeLeft;
    const m = String(Math.floor(timeUsed / 60)).padStart(2, '0');
    const s = String(timeUsed % 60).padStart(2, '0');

    // Statistik ausfüllen
    document.getElementById('res-dauer').textContent = `${m}:${s}`;

    // Originaltext für den Vergleich anzeigen
    const lookahead = Math.min(originalText.length, typedText.length + 200);
    const origSub = originalText.substring(0, lookahead);
    document.getElementById('res-original-text').textContent = originalText;
    
    // Differenz berechnen
    const { path } = calculatePrefixDiff(origSub, typedText);

    // Wort-Gruppierung (Union-Find) für das korrekte Zählen der Fehler
    const origWordIds = getWordIds(origSub);
    const typedWordIds = getWordIds(typedText);

    const parent = {};
    function find(i) {
        if (parent[i] === undefined) parent[i] = i;
        if (parent[i] !== i) parent[i] = find(parent[i]);
        return parent[i];
    }
    function union(i, j) {
        const rootI = find(i);
        const rootJ = find(j);
        if (rootI !== rootJ) parent[rootI] = rootJ;
    }

    const errorNodes = new Set();
    let pureSeparatorErrors = 0;

    let oIdx = 0;
    let tIdx = 0;
    let inErrorBlock = false;
    let blockHasWordChar = false;

    const evaluatedContainer = document.getElementById('evaluated-text');
    evaluatedContainer.innerHTML = '';
    
    // Wort-IDs des allerletzten Wortes im Text ermitteln
    let tempOIdx = 0, tempTIdx = 0;
    let lastO = -1, lastT = -1;
    for (let op of path) {
        if (op.orig !== null && origWordIds[tempOIdx] !== -1) lastO = origWordIds[tempOIdx];
        if (op.typed !== null && typedWordIds[tempTIdx] !== -1) lastT = typedWordIds[tempTIdx];
        if (op.orig !== null) tempOIdx++;
        if (op.typed !== null) tempTIdx++;
    }

    // Korrigierte Anschläge berechnen ---
    let firstErrorInLastWordIdx = typedText.length;
    let scanOIdx = 0;
    let scanTIdx = 0;

    for (let op of path) {
        let isWordCharOrig = op.orig !== null && origWordIds[scanOIdx] !== -1;
        let isWordCharTyped = op.typed !== null && typedWordIds[scanTIdx] !== -1;
        
        let isLastWord = false;
        if (isWordCharOrig && origWordIds[scanOIdx] === lastO) isLastWord = true;
        if (isWordCharTyped && typedWordIds[scanTIdx] === lastT) isLastWord = true;

        // Wenn wir uns im letzten Wort befinden und es KEIN Treffer ('match') ist,
        // merken wir uns den exakten Index des Fehlers im getippten Text und brechen ab.
        if (isLastWord && op.type !== 'match') {
            firstErrorInLastWordIdx = scanTIdx;
            break; 
        }

        if (op.orig !== null) scanOIdx++;
        if (op.typed !== null) scanTIdx++;
    }

    // Schneidet den Text exakt vor dem ersten Fehler im letzten Wort ab
    const correctedTypedText = typedText.substring(0, firstErrorInLastWordIdx);
    
    // Anschläge auf Basis des korrigierten Textes berechnen (Die Variable ist jetzt wieder verfuegbar)
    const anschlaege = calculateTotalStrokes(correctedTypedText);

    // APM mit den neuen, sauberen Anschlägen berechnen
    let apm = 0;
    if (timeUsed > 0) {
        apm = Math.round((anschlaege / timeUsed) * 60);
    } else if (anschlaege > 0 && timeUsed === 0) {
        apm = anschlaege;
    }
    document.getElementById('res-apm').textContent = apm;

    // Render-Loop basierend auf dem berechneten Pfad
    for (let i = 0; i < path.length; i++) {
        let op = path[i];

        let isWordCharOrig = op.orig !== null && origWordIds[oIdx] !== -1;
        let isWordCharTyped = op.typed !== null && typedWordIds[tIdx] !== -1;
        
        // Prüfen, ob das aktuelle Zeichen zum letzten Wort gehört
        let isLastWord = false;
        if (isWordCharOrig && origWordIds[oIdx] === lastO) isLastWord = true;
        if (isWordCharTyped && typedWordIds[tIdx] === lastT) isLastWord = true;

        let oNode = isWordCharOrig ? 'O' + origWordIds[oIdx] : null;
        let tNode = isWordCharTyped ? 'T' + typedWordIds[tIdx] : null;

        if (op.type === 'match') {
            if (inErrorBlock) {
                if (!blockHasWordChar) pureSeparatorErrors++;
                inErrorBlock = false;
                blockHasWordChar = false;
            }
            if (oNode && tNode) union(oNode, tNode);
        } else {
            if (!inErrorBlock) {
                inErrorBlock = true;
                blockHasWordChar = false;
            }
            if (isWordCharOrig || isWordCharTyped) {
                blockHasWordChar = true;
                if (oNode) errorNodes.add(oNode);
                if (tNode) errorNodes.add(tNode);
                if (oNode && tNode) union(oNode, tNode);
            }
        }

        // Visuelles Rendering des Textes
        if (op.type !== 'match') {
            if (op.type === 'sub' || op.type === 'ins') {
                evaluatedContainer.appendChild(createErrorNode(op.typed, isLastWord));
            }
            else if (op.type === 'del') {
                // Für jedes fehlende Zeichen exakt ein ^ setzen
                evaluatedContainer.appendChild(createMissingCharNode(isLastWord));
            }
        } else {
            evaluatedContainer.appendChild(document.createTextNode(op.typed));
        }

        if (op.orig !== null) oIdx++;
        if (op.typed !== null) tIdx++;
    }

    if (inErrorBlock && !blockHasWordChar) {
        pureSeparatorErrors++;
    }

    // Finale Fehleranzahl ermitteln
    const uniqueErrors = new Set();
    const lastWordRootO = lastO !== -1 ? find('O' + lastO) : null;
    const lastWordRootT = lastT !== -1 ? find('T' + lastT) : null;
    
    for (let node of errorNodes) {
        let root = find(node);
        // Fehlerpunkte, die zum letzten Wort gehören, werden nicht gezählt!
        if (root !== lastWordRootO && root !== lastWordRootT) {
            uniqueErrors.add(root);
        }
    }

    let fehler = uniqueErrors.size + pureSeparatorErrors;
    let quotient = "0,000"; // Als String initialisieren, damit replace() immer funktioniert
    
    if (anschlaege > 0) {
        quotient = (fehler * 100 / anschlaege).toFixed(3).replace('.', ',');
    }

    // Finale Ergebnisse ins DOM schreiben
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
    clearInterval(timerInterval);

    hasStarted = false;
    isTestActive = false;
    lastValidInput = "";

    typingArea.value = "";
    typingArea.disabled = false;

    document.getElementById('live-anschlaege').textContent = "0";
    btnEarlyFinish.classList.add('hidden');

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

        const cleanup = () => {
            modal.classList.add('hidden');
            btnYes.removeEventListener('click', onYes);
            btnNo.removeEventListener('click', onNo);
        };

        const onYes = () => { cleanup(); resolve(true); };
        const onNo = () => { cleanup(); resolve(false); };

        btnYes.addEventListener('click', onYes);
        btnNo.addEventListener('click', onNo);
    });
}

/**
 * Bricht die aktuelle Abschrift ab und navigiert zurück zum Setup.
 */
async function handleNeueAbschriftClick() {
    if (hasStarted && isTestActive) {
        const confirmed = await showConfirmModal();
        if (!confirmed) return;
    }
    resetApp();
}

/**
 * Beendet die Abschrift vorzeitig und springt direkt in die Auswertung.
 */
async function handleEarlyFinishClick() {
    // Prüfen, ob das Textfeld komplett leer ist
    if (typingArea.value.trim().length === 0) {
        alert("Die Abschrift kann nicht beendet werden, da noch kein Text eingegeben wurde.");
        typingArea.focus(); // Setzt den Cursor wieder zurück ins Feld
        return; // Bricht die Funktion hier ab
    }

    if (hasStarted && isTestActive) {
        const confirmed = await showConfirmModal();
        if (!confirmed) return;
    }
    finishTest();
}