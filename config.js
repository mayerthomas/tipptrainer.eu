/**
 * ==============================================================================
 * GLOBALE KONFIGURATION & KOMPONENTEN - tipptrainer.eu
 * ==============================================================================
 * Diese Datei verwaltet die zentralen Anwendungsvariablen und injiziert 
 * wiederkehrende HTML-Bausteine (Header, Footer) per DOM-Manipulation.
 * Dadurch wird das DRY-Prinzip (Don't Repeat Yourself) über alle Unterseiten 
 * (Index, Impressum, Datenschutz) hinweg gewahrt.
 */

const APP_NAME = "tipptrainer.eu";
const APP_VERSION = "1.1.0";
const APP_YEAR = "2026";

// Automatische Versionsprüfung auf GitHub (für selbst gehostete Instanzen)
const CHECK_FOR_UPDATES = true;
const GITHUB_REPO = "mayerthomas/tipptrainer.eu";

// Kontaktdaten für Impressum & Datenschutz (impressum-datenschutz.html)
const IMPRESSUM = {
    institution: "[Schule / Institution]",
    name: "[Vorname / Nachname]",
    street: "[Straße / Hausnummer]",
    city: "[PLZ / Ort]",
    email: "[E-Mail-Adresse]"
};

/**
 * ------------------------------------------------------------------------------
 * Tipptrainer-Vorlagen (Templates) - Pfad und Dateinamen
 * ------------------------------------------------------------------------------
 */

const templateDirectory = 'templates/';
const templateFiles = [
    'Freier Text - KI.txt',
    'Freier Text - Klimawandel.txt',
    'Freier Text - Nachhaltigkeit.txt',
    'Freier Text - Raumfahrt.txt',
    'Freier Text - Cybermobbing.txt',
    'Freier Text - Datenschutz.txt',
    'Freier Text - Streaming.txt',
    'Freier Text - Ernährung.txt',
    'Freier Text - Tierschutz.txt',
    'Freier Text - Robotik.txt',
    'Freier Text - Demokratie.txt',
    'Freier Text - Smartphones.txt',
    'Freier Text - Gaming.txt',
    'Freier Text - Algorithmen.txt',
    'Freier Text - Mobilität.txt',
    'Freier Text - Influencer.txt',
    'Lektion 01 - a, s, d, f, j, k, l, ö und Leerzeichen.txt',
    'Lektion 02 - e und i.txt',
    'Lektion 03 - r und u.txt',
    'Lektion 04 - g und h.txt',
    'Lektion 05 - c, Komma und Punkt.txt',
    'Lektion 06 - Großschreibung.txt',
    'Lektion 07 - t und n.txt',
    'Lektion 08 - v und m.txt',
    'Lektion 09 - b und z.txt',
    'Lektion 10 - w und o.txt',
    'Lektion 11 - q und p.txt',
    'Lektion 12 - ä und ü.txt',
    'Lektion 13 - y und Mittestrich.txt',
    'Lektion 14 - x und Doppelpunkt.txt',
    'Lektion 15 - ß.txt',
    'Lektion 16 - 3, 4, 9 und 0.txt',
    'Lektion 17 - 5, 6, 7 und 8.txt',
    'Lektion 18 - 1,2 und runde Klammern.txt',
    'Lektion 19 - Prozent, Und-Zeichen und Schrägstrich.txt',
    'Lektion 20 - Ausrufe-, Anführungs- und Fragezeichen.txt',
    'Lektion 21 - Dollar-, Gleichheitszeichen und Strichpunkt.txt',
    'Lektion 22 - Stern, Plus und Raute.txt',
    'Lektion 23 - Weitere Zeichen.txt',
    'Lektion 24 - Wiederholung.txt',
    'Übung - Häufige Wörter und Silben.txt',
    'Übung - Wörter mit geläufigen Vorsilben.txt',
    'Übung - Wörter mit geläufigen Endungen.txt',
    'Übung - Abkürzungen.txt',
    'Übung - Fremdwörter.txt',
    'Übung - Englische Wörter.txt',
];

/**
 * ------------------------------------------------------------------------------
 * HTML BAUSTEINE (COMPONENTS)
 * ------------------------------------------------------------------------------
 */

// Zentrales Header-Markup inklusive Logo und Sub-Titel
const headerHTML = `
    <div class="flex w-45 mb-2 no-print">
        <!-- Logo -->
        <a href="index.html">
            <img src="logo.svg" alt="tipptrainer.eu" class="w-full">
        </a>
    </div>
    <p class="flex gap-2 text-gray-600 no-print">Tippen Lernen | Üben | Abschriften Anfertigen</p>
    <p class="flex gap-2 mb-4 text-sm text-gray-600 no-print"><span class="pl-2 pr-2 bg-amber-300 rounded-full">browserbasiert</span><span class="pl-2 pr-2 bg-amber-300 rounded-full">datenschutzkonform</span></p>
`;

// Zentrales Footer-Markup mit dynamischer Einbindung der Versionsvariablen
const footerHTML = `
    <div class="flex flex-col md:flex-row items-center justify-center gap-2 mt-4 text-center text-sm text-sky-600 no-print">
        <a href="index.html" class="pl-2 pr-2 bg-gray-200 rounded-full transition-colors hover:text-sky-800 hover:bg-gray-300">Startseite</a>
        <a href="appinfos.html" class="inline-flex items-center pl-2 pr-2 bg-gray-200 rounded-full transition-colors hover:text-sky-800 hover:bg-gray-300">
            <span>App-Version ${APP_VERSION} &copy; ${APP_YEAR}</span>
            <span id="update-badge" class="hidden items-center justify-center w-4 h-4 ml-1 text-[10px] font-bold text-white bg-red-600 rounded-full" title="Neue Version auf GitHub verfügbar!">!</span>
        </a>
        <a href="impressum-datenschutz.html" class="pl-2 pr-2 bg-gray-200 rounded-full transition-colors hover:text-sky-800 hover:bg-gray-300">Impressum & Datenschutz</a>
    </div>

    <!-- Support-Bereich -->
    <div class="mt-2 text-center text-sm text-sky-600 no-print">
        <p><a href="https://buymeacoffee.com/tmtec" target="_blank" rel="noopener noreferrer" class="transition-colors hover:text-sky-800">Unterstützen Sie das kostenlose Angebot von tipptrainer.eu!</a></p> 
    </div>

    <div class="hidden mt-2 text-center text-sm text-gray-600 print-only">tipptrainer.eu | Version ${APP_VERSION} &copy; ${APP_YEAR}</div>
`;

/**
 * ------------------------------------------------------------------------------
 * DOM INJEKTION BEIM LADEN DER SEITE
 * ------------------------------------------------------------------------------
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Header injizieren, falls der Container existiert
    const headerContainer = document.getElementById('app-header');
    if (headerContainer) {
        headerContainer.innerHTML = headerHTML;
    }

    // 2. Footer injizieren, falls der Container existiert
    const footerContainer = document.getElementById('app-footer');
    if (footerContainer) {
        footerContainer.innerHTML = footerHTML;
    }

    // 3. Impressumsdaten injizieren, falls die Container existieren
    const addressContainer = document.getElementById('impressum-address');
    if (addressContainer) {
        addressContainer.innerHTML = `
            ${IMPRESSUM.institution}<br>
            ${IMPRESSUM.name}<br>
            ${IMPRESSUM.street}<br>
            ${IMPRESSUM.city}
        `;
    }

    const contactContainer = document.getElementById('impressum-contact');
    if (contactContainer) {
        contactContainer.innerHTML = `
            E-Mail: <a href="mailto:${IMPRESSUM.email}" class="text-sky-600 hover:underline">${IMPRESSUM.email}</a>
        `;
    }

    // 4. Optionaler Update-Check gegen GitHub
    if (CHECK_FOR_UPDATES) {
        checkGitHubVersion();
    }
});

/**
 * Vergleicht zwei Versionsnummern im Format MAJOR.MINOR.PATCH (z. B. "1.0.2" vs "1.0.3").
 * @returns {boolean} True, wenn remoteVersion neuer als localVersion ist.
 */
function isNewerVersion(localVersion, remoteVersion) {
    const localParts = localVersion.split('.').map(Number);
    const remoteParts = remoteVersion.split('.').map(Number);
    const len = Math.max(localParts.length, remoteParts.length);

    for (let i = 0; i < len; i++) {
        const l = localParts[i] || 0;
        const r = remoteParts[i] || 0;
        if (r > l) return true;
        if (r < l) return false;
    }
    return false;
}

/**
 * Blendet das rote Ausrufezeichen im Footer sowie das Banner auf appinfos.html ein.
 */
function showUpdateNotification(latestVersion) {
    const badge = document.getElementById('update-badge');
    if (badge) {
        badge.classList.remove('hidden');
        badge.classList.add('inline-flex');
        badge.title = `Neue Version ${latestVersion} auf GitHub verfügbar!`;
    }

    const banner = document.getElementById('update-banner');
    const versionText = document.getElementById('update-version-text');
    if (banner && versionText) {
        versionText.textContent = latestVersion;
        banner.classList.remove('hidden');
    }
}

/**
 * Prüft einmal pro Browser-Sitzung über GitHub, ob eine neuere APP_VERSION vorliegt.
 */
function checkGitHubVersion() {
    try {
        const cachedVersion = sessionStorage.getItem('tipptrainer_latest_version');
        if (cachedVersion) {
            if (isNewerVersion(APP_VERSION, cachedVersion)) {
                showUpdateNotification(cachedVersion);
            }
            return;
        }

        fetch(`https://raw.githubusercontent.com/${GITHUB_REPO}/main/config.js`)
            .then(response => {
                if (!response.ok) throw new Error("GitHub-Abfrage fehlgeschlagen");
                return response.text();
            })
            .then(text => {
                const match = text.match(/const\s+APP_VERSION\s*=\s*["']([^"']+)["']/);
                if (match && match[1]) {
                    const latestVersion = match[1].trim();
                    sessionStorage.setItem('tipptrainer_latest_version', latestVersion);
                    if (isNewerVersion(APP_VERSION, latestVersion)) {
                        showUpdateNotification(latestVersion);
                    }
                }
            })
            .catch(() => {
                // Lautlos ignorieren (z. B. wenn offline oder durch Schul-Firewall blockiert)
            });
    } catch (e) {
        // Ignorieren, falls sessionStorage deaktiviert ist
    }
}

console.log(`${APP_NAME} gestartet - Version ${APP_VERSION}`);