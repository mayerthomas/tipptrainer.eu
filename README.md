# ⌨️ tipptrainer.eu

**Tippen Lernen | Üben | Abschriften Anfertigen** – ein datenschutzkonformer, webbasierter 10-Finger-Tipptrainer für den Informatikunterricht an Schulen und das Selbststudium.

🌐 **Live-Anwendung:** [https://tipptrainer.eu](https://tipptrainer.eu)

---

## ✨ Überblick & Philosophie

**tipptrainer.eu** wurde speziell für den Einsatz im Schulunterricht (Übungen sowie benotete Leistungsnachweise / Abschriften) entwickelt. Die Anwendung kombiniert eine ablenkungsfreie, layoutstabile Benutzeroberfläche mit einer präzisen, prüfungskonformen Fehlerauswertung und kompromisslosem Datenschutz.

* 🔒 **100 % Datenschutzkonform (Zero-Server-Data):** Alle Eingaben (Vorname, Nachname, Klasse, getippter Text und Auswertung) werden ausschließlich lokal im flüchtigen Arbeitsspeicher (RAM) des Browsers verarbeitet. Es gibt keine Datenbank, kein Tracking, keine Cookies und keine Datenübertragung an externe Server.
* ⚖️ **Prüfungskonforme Fehlerauswertung:** Intelligenter Vergleichsalgorithmus auf Basis einer modifizierten Levenshtein-Distanz und Union-Find-Wortgruppierung – exakt abgestimmt auf schulische Bewertungsmaßstäbe.
* 🛡️ **Integrierter Anti-Cheat-Schutz:** Technische Sperre gegen Copy & Paste (`onpaste`), Drag & Drop (`ondrop`), Textmarkierung sowie Manipulationen über die Browser-Konsole.
* 🎯 **Fokus-Modus ohne Layout-Shifts:** Bereits getippter Text wird dezent ausgeblendet, das aktuelle Zeichen farbig hervorgehoben und der Vorlagentext scrollt automatisch und ruckelfrei mit.
* 🖨️ **Toner-sparende Druckansicht:** Optimiertes Schwarz-Weiß-Drucklayout (`@media print`) auf DIN A4 zur direkten Ausgabe als Prüfungsblatt oder PDF-Dokument.

---

## 🚀 Funktionen im Detail

### 1. Flexible Textauswahl & Einstellbare Dauer
* **Integrierte Vorlagen:** 46 direkt wählbare Übungstexte – unterteilt in aufbauende **Lektionen (01–24)**, gezielte **Wortübungen** (Silben, Vorsilben, Endungen, Abkürzungen, Fremdwörter, Englisch) sowie aktuelle **freie Sachtexte** (KI, Klimawandel, Datenschutz, Raumfahrt u. v. m.).
* **Eigener Datei-Upload:** Lehrkräfte oder Schüler können beliebige eigene `.txt`-Dateien (UTF-8 sowie Windows-ANSI / Windows-1252) direkt von ihrem Gerät laden.
* **Zeiteinstellung:** Stufenlos einstellbare Abschreibdauer bis zu 20 Minuten (Countdown startet erst mit dem ersten Tastenanschlag).

### 2. Intelligente Auswertungslogik nach Prüfungsstandard
Nach Ablauf der Zeit oder bei Erreichen des Textendes erstellt **tipptrainer.eu** automatisch eine detaillierte Auswertung mit **Gesamtanschlägen**, **Anschlägen pro Minute (APM)**, **Fehleranzahl** und **Fehlerquotient (in %)**:

1. **Reale Anschlagszählung:** Großbuchstaben und Sonderzeichen, die mit der Umschalttaste (`Shift`) getippt werden, zählen regulär als **2 Anschläge**.
2. **Buchstabendreher & Auslassungen:** Durch eine speziell gewichtete Backtracing-Priorisierung (`sub > del > ins > match`) werden Buchstabendreher sauber als punktuelle Ersetzungsfehler erkannt und übersprungene Zeichen präzise mit `^` markiert, ohne Folgezeilen zu verschieben.
3. **Wortfehler-Regel (Union-Find):** Mehrere Tippfehler oder Auslassungen innerhalb desselben Wortes werden automatisch zusammengefasst und zählen zusammen als **maximal 1 Fehler**.
4. **Sonderregel für das letzte Wort:** Tippfehler im allerletzten angefangenen Wort vor Ablauf der Zeit werden **nicht als Fehler gewertet** (visuell mit Überstrich markiert); die Anschlagszählung endet in diesem Fall exakt vor dem ersten Fehler im letzten Wort.

---

## 🗂️ Projektstruktur & Tech-Stack

Das Projekt verzichtet bewusst auf komplexe Frameworks oder serverseitige Abhängigkeiten und setzt auf **natives HTML5**, **Vanilla JavaScript (ES6)** und **Tailwind CSS v4**:

```text
├── index.html                   # Hauptanwendung (SPA: Setup, Testbereich, Auswertung)
├── appinfos.html                # Funktionsübersicht & Programmbeschreibung für Nutzer
├── impressum-datenschutz.html   # Impressum & Datenschutzerklärung
├── config.js                    # Zentrale Konfiguration (Version, Vorlagenliste, Header/Footer)
├── app.js                       # Core-Engine (Timer, Anti-Cheat, Highlighter, Levenshtein/Union-Find)
├── input.css                    # Tailwind-Eingabe-CSS & Custom-Regeln (inkl. @media print)
├── style.css                    # Kompiliertes Stylesheet für den Produktiveinsatz
├── templates/                   # 46 integrierte .txt-Übungs- und Prüfungsvorlagen
└── sitemap.xml                  # Sitemap für Suchmaschinen
```

---

## ⚙️ Zentrale Konfiguration (`config.js`)

Alle standort- und projektspezifischen Einstellungen werden zentral in einer einzigen Datei – der **`config.js`** – verwaltet. Dadurch müssen die HTML-Dateien bei eigener Bereitstellung oder Updates nicht manuell durchsucht und angepasst werden:

* **Anwendungs-Metadaten & Update-Prüfung:**
  * `APP_NAME`: Name der Anwendung (Standard: `"tipptrainer.eu"`).
  * `APP_VERSION`: Aktuelle Programmversion (wird automatisch im Footer sowie auf dem Ausdruck angezeigt).
  * `APP_YEAR`: Erscheinungs-/Copyright-Jahr im Footer.
  * `CHECK_FOR_UPDATES`: Schaltet die automatische Update-Prüfung ein (`true`) oder aus (`false`). Ist sie aktiviert, gleicht die App einmal pro Sitzung die lokale Version mit dem GitHub-Repository (`GITHUB_REPO`) ab und zeigt bei verfügbaren Updates ein dezentes rotes Ausrufezeichen im Footer sowie einen Hinweisbanner unter `appinfos.html` an.
* **Impressums- & Kontaktdaten (`IMPRESSUM`):**
  * `institution`: Name der Schule, Behörde oder des Betreibers.
  * `name`: Vor- und Nachname der verantwortlichen Person.
  * `street`: Straße und Hausnummer.
  * `city`: Postleitzahl und Ort.
  * `email`: Kontakt-E-Mail-Adresse (wird in `impressum-datenschutz.html` automatisch verlinkt).
* **Übungsvorlagen (`templateDirectory` & `templateFiles`):**
  * Bestimmt den Ordnerpfad (Standard: `'templates/'`) sowie die Liste und Reihenfolge aller im Auswahlmenü verfügbaren `.txt`-Übungsdateien. Eigene Vorlagen können einfach im Ordner `templates/` abgelegt und hier im Array ergänzt werden.
* **Zentrale Layout-Komponenten (`headerHTML` & `footerHTML`):**
  * Steuert seitenübergreifend das Logo, die Untertitel sowie die Fußzeilen-Navigation nach dem DRY-Prinzip (*Don't Repeat Yourself*).

---

## 💻 Lokale Ausführung & Entwicklung

Da es sich um eine rein statische Webanwendung handelt, wird keine Datenbank und kein Backend benötigt.

1. **Repository klonen:**
   ```bash
   git clone https://github.com/mayerthomas/tipptrainer.eu.git
   cd tipptrainer.eu
   ```
2. **Lokal starten:**
   * Die Datei `index.html` kann für den Modus *„Eigene Datei hochladen"* direkt im Browser geöffnet werden.
   * Um auch die integrierten Vorlagen aus dem Ordner `templates/` per `fetch()` zu laden, empfiehlt sich ein lokaler Webserver (da Browser lokale `file://`-Anfragen aus Sicherheitsgründen blockieren), z. B.:
     ```bash
     # Mit Python:
     python -m http.server 8080
     # Oder mit Node.js (npx):
     npx serve .
     ```
   * Anschließend im Browser `http://localhost:8080` aufrufen.

---

## 👤 Autor & Kontakt

**tmtec IT-Dienstleistungen – Thomas Mayer**  
📧 E-Mail: [info@tipptrainer.eu](mailto:info@tipptrainer.eu)  
☕ [Das kostenlose Angebot von tipptrainer.eu unterstützen (Buy Me a Coffee)](https://buymeacoffee.com/tmtec)

