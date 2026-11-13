/**
 * ==============================================================================
 * UNIT TESTS (ohne Framework, ausführbar mit: node test.js) - tipptrainer.eu
 * ==============================================================================
 */

const assert = require('node:assert/strict');
const {
    calculateTotalStrokes,
    calculatePrefixDiff,
    evaluate
} = require('./evaluation.js');

let passed = 0;

function test(name, fn) {
    try {
        fn();
        passed++;
        console.log(`✔ ${name}`);
    } catch (err) {
        console.error(`✘ ${name}`);
        console.error(err);
        process.exitCode = 1;
    }
}

// 1. Anschlagszählung nach deutschem QWERTZ-Layout
test('QWERTZ-Anschlagszählung: Kleinbuchstaben, ß, + und # zählen als 1 Anschlag', () => {
    assert.equal(calculateTotalStrokes('abc'), 3);
    assert.equal(calculateTotalStrokes('ß'), 1);
    assert.equal(calculateTotalStrokes('+#-.,< '), 7);
});

test('QWERTZ-Anschlagszählung: Großbuchstaben, Umlaute, Shift/AltGr, Tote Tasten und Akzente zählen als 2 Anschläge', () => {
    assert.equal(calculateTotalStrokes('A'), 2);
    assert.equal(calculateTotalStrokes('ÄÖÜ'), 6);
    assert.equal(calculateTotalStrokes('*\''), 4);
    assert.equal(calculateTotalStrokes('°²³'), 6);
    assert.equal(calculateTotalStrokes('^´`'), 6);
    assert.equal(calculateTotalStrokes('éèàâ'), 8);
    assert.equal(calculateTotalStrokes('Café'), 2 + 1 + 1 + 2); // C(2) + a(1) + f(1) + é(2) = 6
});

// 2. Buchstabendreher (Tie-Breaking: Substitution vor Deletion/Insertion)
test('Buchstabendreher: "ist" -> "sit" wird als Substitution ohne Auslassungszeichen (^) gewertet', () => {
    const orig = 'Das ist ein Test für die Schule.';
    const typed = 'Das sit ein ';
    const res = evaluate(orig, typed);

    assert.equal(res.fehler, 1);
    const rendered = res.tokens.map(t => t.char).join('');
    assert.equal(rendered, 'Das sit ein ');
    assert.equal(res.tokens.some(t => t.type === 'del'), false);
});

// 3. Übersprungenes Wort (Block-Markierung & 1 Wortfehler)
test('Übersprungenes Wort: "Das Haus ist groß" -> "Das ist " markiert "Haus " als Block und zählt 1 Fehler', () => {
    const orig = 'Das Haus ist groß und schön.';
    const typed = 'Das ist ';
    const res = evaluate(orig, typed);

    assert.equal(res.fehler, 1);
    const rendered = res.tokens.map(t => t.char).join('');
    assert.equal(rendered, 'Das ^^^^^ist ');
});

// 4. Wortfehler-Regel (Union-Find: mehrere Fehler in einem Wort = max. 1 Fehler)
test('Wortfehler-Regel: Mehrere Tippfehler im selben Wort zählen zusammen als 1 Fehler', () => {
    const orig = 'Schwierigkeit im Unterricht';
    const typed = 'Schwxrigkxt im ';
    const res = evaluate(orig, typed);

    assert.equal(res.fehler, 1);
});

// 5. Sonderregel für das letzte angefangene Wort
test('Letztes Wort (unvollständig vor Zeitablauf): Fehler zählt nicht, Anschläge enden vor dem Fehler', () => {
    const orig = 'Das ist ein langer Beispieltext für die Prüfung.';
    const typed = 'Das ist ein lanx'; // Fehler bei 'x' mitten im letzten angefangenen Wort
    const res = evaluate(orig, typed);

    assert.equal(res.fehler, 0);
    assert.equal(res.correctedTypedText, 'Das ist ein lan');
    assert.equal(res.tokens.at(-1).isLastWord, true);
});

test('Letztes Wort (bereits durch Leerzeichen abgeschlossen): Fehler zählt regulär', () => {
    const orig = 'Das ist ein langer Beispieltext für die Prüfung.';
    const typed = 'Das ist ein lanx '; // Leerzeichen nach dem Wort bereits getippt
    const res = evaluate(orig, typed);

    assert.equal(res.fehler, 1);
    assert.equal(res.correctedTypedText, 'Das ist ein lanx ');
});

test('Letztes Wort (Text komplett bis zum Ende abgeschrieben): Fehler im Schlusswort zählt regulär', () => {
    const orig = 'Hallo Welt';
    const typed = 'Hallo Welx'; // Textende erreicht -> kein unvollständiges Wort
    const res = evaluate(orig, typed);

    assert.equal(res.fehler, 1);
});

console.log(`\n${passed} Tests erfolgreich durchgeführt.`);
