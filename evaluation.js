/**
 * ==============================================================================
 * EVALUATION ENGINE - tipptrainer.eu
 * ==============================================================================
 * Reine, DOM-unabhängige Berechnungslogik für Anschlagszählung (QWERTZ),
 * modifizierte Levenshtein-Distanz (Band-DP), Wortgruppierung (Union-Find)
 * und prüfungskonforme Fehlerauswertung.
 */

// Zeichen auf der deutschen QWERTZ-Tastatur, die 2 Anschläge benötigen
// (Shift, AltGr, Tote Tasten oder Tote Taste + Buchstabe).
// Großbuchstaben (A-Z, Ä, Ö, Ü, É etc.) werden separat über ch !== ch.toLowerCase() erkannt.
const TWO_STROKE_CHARS = new Set([
    '!', '"', '§', '$', '%', '&', '/', '(', ')', '=', '?', '`', ';', ':', '_', '\'', '*', '>',
    '°', '²', '³', '{', '[', ']', '}', '\\', '@', '€', '~', '|', 'µ',
    '^', '´',
    'á', 'é', 'í', 'ó', 'ú',
    'à', 'è', 'ì', 'ò', 'ù',
    'â', 'ê', 'î', 'ô', 'û'
]);

/**
 * Berechnet die Gesamtanschläge nach deutschem QWERTZ-Layout unter Berücksichtigung von
 * Großbuchstaben, Shift-/AltGr-Sonderzeichen, Toten Tasten und Akzentbuchstaben (= 2 Anschläge).
 * @param {string} text
 * @returns {number}
 */
function calculateTotalStrokes(text) {
    let strokes = 0;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        strokes += (ch !== ch.toLowerCase() || TWO_STROKE_CHARS.has(ch)) ? 2 : 1;
    }
    return strokes;
}

/**
 * Berechnet die präzise Abweichung zwischen Originaltext und geschriebener Eingabe.
 * Nutzt ein speicherschonendes Band-DP mit Uint16Array.
 *
 * @param {string} orig - Der originale Vorlagentext (bzw. Präfix-Ausschnitt)
 * @param {string} typed - Die Eingabe des Schülers
 * @returns {{ path: Array<{type: string, orig: string|null, typed: string|null}>, best_i: number }}
 */
function calculatePrefixDiff(orig, typed) {
    const n = orig.length;
    const m = typed.length;
    if (m === 0) return { path: [], best_i: 0 };

    // Band-DP (±K um die Diagonale) mit Uint16Array zur Speicheroptimierung:
    // Reduziert den Speicherbedarf von O(n * m) Int32 (~150 MB bei 6.000 Zeichen)
    // auf O(n * K) Uint16 (wenige MB), ideal für Schul-PCs und Chromebooks.
    const K = Math.min(Math.max(n, m), Math.max(250, Math.abs(n - m) + 50));
    const bandWidth = 2 * K + 1;
    const INF = 0xFFFF;

    const dp = new Uint16Array((n + 1) * bandWidth);
    dp.fill(INF);

    const get = (i, j) => {
        const offset = j - i + K;
        if (offset < 0 || offset >= bandWidth) return INF;
        return dp[i * bandWidth + offset];
    };
    const set = (i, j, val) => {
        dp[i * bandWidth + (j - i + K)] = val;
    };

    const initI = Math.min(n, K);
    for (let i = 0; i <= initI; i++) set(i, 0, i);
    const initJ = Math.min(m, K);
    for (let j = 0; j <= initJ; j++) set(0, j, j);

    // Matrix innerhalb des Bandes befüllen (Kostenberechnung)
    for (let i = 1; i <= n; i++) {
        const jMin = Math.max(1, i - K);
        const jMax = Math.min(m, i + K);
        for (let j = jMin; j <= jMax; j++) {
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

    // Den "günstigsten" Endpunkt innerhalb des Bandes finden
    let minCost = INF;
    let best_i = Math.min(n, m);
    const iMin = Math.max(0, m - K);
    const iMax = Math.min(n, m + K);
    for (let i = iMin; i <= iMax; i++) {
        const cost = get(i, m);
        if (cost <= minCost) {
            minCost = cost;
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

            // Tie-Breaker: Priorisierung bei gleicher Fehlerpunktzahl (sub > del > ins > match),
            // um Dreher punktuell zu markieren und übersprungene Wörter als Block zu halten.
            if (orig[i - 1] !== typed[j - 1] && current === get(i - 1, j - 1) + 1) {
                path.push({ type: 'sub', orig: orig[i - 1], typed: typed[j - 1] });
                i--; j--;
            } else if (current === get(i - 1, j) + 1) {
                path.push({ type: 'del', orig: orig[i - 1], typed: null });
                i--;
            } else if (current === get(i, j - 1) + 1) {
                path.push({ type: 'ins', orig: null, typed: typed[j - 1] });
                j--;
            } else if (orig[i - 1] === typed[j - 1] && current === get(i - 1, j - 1)) {
                path.push({ type: 'match', orig: orig[i - 1], typed: typed[j - 1] });
                i--; j--;
            } else {
                path.push({ type: 'sub', orig: orig[i - 1], typed: typed[j - 1] });
                i--; j--;
            }
        }
    }
    return { path: path.reverse(), best_i: best_i };
}

/**
 * Ordnet jedem Zeichen in einem Text eine Wort-ID zu (Trennzeichen erhalten -1).
 * @param {string} text
 * @returns {number[]}
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

/**
 * Führt die komplette prüfungskonforme Auswertung ohne DOM-Abhängigkeit durch.
 *
 * @param {string} originalText - Der vollständige Vorlagentext
 * @param {string} typedText - Der vom Schüler eingegebene Text
 * @returns {{
 *   anschlaege: number,
 *   fehler: number,
 *   quotient: string,
 *   correctedTypedText: string,
 *   tokens: Array<{type: string, char: string, isLastWord: boolean}>,
 *   path: Array<{type: string, orig: string|null, typed: string|null}>,
 *   best_i: number
 * }}
 */
function evaluate(originalText, typedText) {
    const lookahead = Math.min(originalText.length, typedText.length + 200);
    const origSub = originalText.substring(0, lookahead);

    const { path, best_i } = calculatePrefixDiff(origSub, typedText);
    const origWordIds = getWordIds(origSub);
    const typedWordIds = getWordIds(typedText);

    const parent = {};
    function find(x) {
        if (parent[x] === undefined) parent[x] = x;
        if (parent[x] !== x) parent[x] = find(parent[x]);
        return parent[x];
    }
    function union(a, b) {
        const rootA = find(a);
        const rootB = find(b);
        if (rootA !== rootB) parent[rootA] = rootB;
    }

    // Wort-IDs des allerletzten angefangenen Wortes ermitteln:
    // Nur aktiv, wenn am Ende noch KEIN Trennzeichen getippt wurde und
    // der Vorlagentext noch nicht vollständig abgeschrieben ist.
    let lastO = -1, lastT = -1;
    const endedInWord = typedText.length > 0 && typedWordIds[typedText.length - 1] !== -1;
    const isTextCompleted = typedText.length >= originalText.length || best_i >= originalText.length;

    if (endedInWord && !isTextCompleted) {
        let tempOIdx = 0, tempTIdx = 0;
        for (const op of path) {
            if (op.orig !== null && origWordIds[tempOIdx] !== -1) lastO = origWordIds[tempOIdx];
            if (op.typed !== null && typedWordIds[tempTIdx] !== -1) lastT = typedWordIds[tempTIdx];
            if (op.orig !== null) tempOIdx++;
            if (op.typed !== null) tempTIdx++;
        }
    }

    // Korrigierte Anschläge berechnen (Abschnitt vor dem ersten Fehler im letzten Wort)
    let firstErrorInLastWordIdx = typedText.length;
    let scanOIdx = 0;
    let scanTIdx = 0;

    for (const op of path) {
        const isWordCharOrig = op.orig !== null && origWordIds[scanOIdx] !== -1;
        const isWordCharTyped = op.typed !== null && typedWordIds[scanTIdx] !== -1;

        let isLastWord = false;
        if (isWordCharOrig && origWordIds[scanOIdx] === lastO) isLastWord = true;
        if (isWordCharTyped && typedWordIds[scanTIdx] === lastT) isLastWord = true;

        if (isLastWord && op.type !== 'match') {
            firstErrorInLastWordIdx = scanTIdx;
            break;
        }

        if (op.orig !== null) scanOIdx++;
        if (op.typed !== null) scanTIdx++;
    }

    const correctedTypedText = typedText.substring(0, firstErrorInLastWordIdx);
    const anschlaege = calculateTotalStrokes(correctedTypedText);

    // Fehler-Gruppierung per Union-Find & Token-Liste für das UI aufbauen
    const errorNodes = new Set();
    let pureSeparatorErrors = 0;
    let oIdx = 0;
    let tIdx = 0;
    let inErrorBlock = false;
    let blockHasWordChar = false;
    const tokens = [];

    for (let i = 0; i < path.length; i++) {
        const op = path[i];

        const isWordCharOrig = op.orig !== null && origWordIds[oIdx] !== -1;
        const isWordCharTyped = op.typed !== null && typedWordIds[tIdx] !== -1;

        let isLastWord = false;
        if (isWordCharOrig && origWordIds[oIdx] === lastO) isLastWord = true;
        if (isWordCharTyped && typedWordIds[tIdx] === lastT) isLastWord = true;

        const oNode = isWordCharOrig ? 'O' + origWordIds[oIdx] : null;
        const tNode = isWordCharTyped ? 'T' + typedWordIds[tIdx] : null;

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

        tokens.push({
            type: op.type,
            char: op.type === 'del' ? '^' : op.typed,
            isLastWord
        });

        if (op.orig !== null) oIdx++;
        if (op.typed !== null) tIdx++;
    }

    if (inErrorBlock && !blockHasWordChar) {
        pureSeparatorErrors++;
    }

    const uniqueErrors = new Set();
    const lastWordRootO = lastO !== -1 ? find('O' + lastO) : null;
    const lastWordRootT = lastT !== -1 ? find('T' + lastT) : null;

    for (const node of errorNodes) {
        const root = find(node);
        if (root !== lastWordRootO && root !== lastWordRootT) {
            uniqueErrors.add(root);
        }
    }

    const fehler = uniqueErrors.size + pureSeparatorErrors;
    let quotient = "0,000";
    if (anschlaege > 0) {
        quotient = (fehler * 100 / anschlaege).toFixed(3).replace('.', ',');
    }

    return {
        anschlaege,
        fehler,
        quotient,
        correctedTypedText,
        tokens,
        path,
        best_i
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TWO_STROKE_CHARS,
        calculateTotalStrokes,
        calculatePrefixDiff,
        getWordIds,
        evaluate
    };
}
