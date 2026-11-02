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
const APP_VERSION = "1.0.3";
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
        <a href="/">
            <?xml version="1.0" encoding="UTF-8" standalone="no"?>
                <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
                <svg width="100%" height="100%" viewBox="0 0 1084 414" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:affinity="https://www.affinity.studio/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                    <g transform="matrix(1,0,0,1,-472.440945,-1262.251482)">
                        <g transform="matrix(0.935265,0,0,0.935265,-53.479904,64.455093)">
                            <path d="M919.821,1280.702C966.458,1280.702 1004.321,1318.565 1004.321,1365.202L1004.321,1638.201C1004.321,1684.837 966.458,1722.7 919.821,1722.7L646.822,1722.7C600.186,1722.7 562.323,1684.837 562.323,1638.201L562.323,1365.202C562.323,1318.565 600.186,1280.702 646.822,1280.702L919.821,1280.702Z" style="fill:rgb(255,210,48);"/>
                        </g>
                        <g transform="matrix(1.609469,0,0,1.609469,-149.946158,-1009.219629)">
                            <g>
                                <g transform="matrix(150,0,0,150,677.898066,1539.966064)">
                                    <path d="M0.258,-0.057C0.272,-0.057 0.285,-0.058 0.299,-0.06C0.313,-0.062 0.325,-0.065 0.333,-0.068L0.333,-0.005C0.324,-0.001 0.311,0.002 0.294,0.005C0.277,0.008 0.261,0.01 0.245,0.01C0.217,0.01 0.191,0.005 0.168,-0.005C0.145,-0.015 0.126,-0.032 0.113,-0.056C0.099,-0.079 0.092,-0.112 0.092,-0.154L0.092,-0.472L0.016,-0.472L0.016,-0.511L0.092,-0.543L0.125,-0.659L0.173,-0.659L0.173,-0.535L0.33,-0.535L0.33,-0.472L0.173,-0.472L0.173,-0.157C0.173,-0.123 0.181,-0.098 0.197,-0.082C0.212,-0.065 0.233,-0.057 0.258,-0.057Z" style="fill-rule:nonzero;"/>
                                </g>
                                <g transform="matrix(150,0,0,150,731.364862,1539.966064)">
                                    <path d="M0.167,-0.535L0.167,-0L0.085,-0L0.085,-0.535L0.167,-0.535ZM0.127,-0.735C0.14,-0.735 0.152,-0.731 0.161,-0.722C0.171,-0.714 0.176,-0.7 0.176,-0.682C0.176,-0.664 0.171,-0.651 0.161,-0.642C0.152,-0.633 0.14,-0.629 0.127,-0.629C0.113,-0.629 0.101,-0.633 0.092,-0.642C0.083,-0.651 0.078,-0.664 0.078,-0.682C0.078,-0.7 0.083,-0.714 0.092,-0.722C0.101,-0.731 0.113,-0.735 0.127,-0.735Z" style="fill-rule:nonzero;"/>
                                </g>
                                <g transform="matrix(150,0,0,150,769.231073,1539.966064)">
                                    <path d="M0.337,-0.545C0.404,-0.545 0.457,-0.522 0.497,-0.476C0.536,-0.43 0.556,-0.361 0.556,-0.269C0.556,-0.208 0.547,-0.157 0.529,-0.116C0.511,-0.074 0.485,-0.043 0.452,-0.022C0.419,-0.001 0.38,0.01 0.335,0.01C0.307,0.01 0.282,0.006 0.26,-0.001C0.239,-0.009 0.22,-0.019 0.205,-0.032C0.19,-0.044 0.177,-0.058 0.167,-0.073L0.161,-0.073C0.162,-0.061 0.163,-0.045 0.165,-0.027C0.166,-0.009 0.167,0.006 0.167,0.02L0.167,0.239L0.085,0.239L0.085,-0.535L0.152,-0.535L0.163,-0.456L0.167,-0.456C0.177,-0.472 0.19,-0.487 0.205,-0.501C0.22,-0.514 0.238,-0.525 0.26,-0.533C0.282,-0.541 0.307,-0.545 0.337,-0.545ZM0.323,-0.477C0.286,-0.477 0.256,-0.469 0.233,-0.455C0.211,-0.441 0.194,-0.419 0.184,-0.391C0.173,-0.362 0.168,-0.327 0.167,-0.284L0.167,-0.268C0.167,-0.223 0.172,-0.185 0.182,-0.153C0.192,-0.122 0.208,-0.098 0.231,-0.082C0.254,-0.066 0.285,-0.058 0.324,-0.058C0.357,-0.058 0.385,-0.067 0.407,-0.084C0.429,-0.102 0.445,-0.127 0.456,-0.159C0.467,-0.191 0.473,-0.228 0.473,-0.27C0.473,-0.333 0.46,-0.383 0.436,-0.421C0.411,-0.458 0.374,-0.477 0.323,-0.477Z" style="fill-rule:nonzero;"/>
                                </g>
                                <g transform="matrix(150,0,0,150,861.003534,1539.966064)">
                                    <path d="M0.337,-0.545C0.404,-0.545 0.457,-0.522 0.497,-0.476C0.536,-0.43 0.556,-0.361 0.556,-0.269C0.556,-0.208 0.547,-0.157 0.529,-0.116C0.511,-0.074 0.485,-0.043 0.452,-0.022C0.419,-0.001 0.38,0.01 0.335,0.01C0.307,0.01 0.282,0.006 0.26,-0.001C0.239,-0.009 0.22,-0.019 0.205,-0.032C0.19,-0.044 0.177,-0.058 0.167,-0.073L0.161,-0.073C0.162,-0.061 0.163,-0.045 0.165,-0.027C0.166,-0.009 0.167,0.006 0.167,0.02L0.167,0.239L0.085,0.239L0.085,-0.535L0.152,-0.535L0.163,-0.456L0.167,-0.456C0.177,-0.472 0.19,-0.487 0.205,-0.501C0.22,-0.514 0.238,-0.525 0.26,-0.533C0.282,-0.541 0.307,-0.545 0.337,-0.545ZM0.323,-0.477C0.286,-0.477 0.256,-0.469 0.233,-0.455C0.211,-0.441 0.194,-0.419 0.184,-0.391C0.173,-0.362 0.168,-0.327 0.167,-0.284L0.167,-0.268C0.167,-0.223 0.172,-0.185 0.182,-0.153C0.192,-0.122 0.208,-0.098 0.231,-0.082C0.254,-0.066 0.285,-0.058 0.324,-0.058C0.357,-0.058 0.385,-0.067 0.407,-0.084C0.429,-0.102 0.445,-0.127 0.456,-0.159C0.467,-0.191 0.473,-0.228 0.473,-0.27C0.473,-0.333 0.46,-0.383 0.436,-0.421C0.411,-0.458 0.374,-0.477 0.323,-0.477Z" style="fill-rule:nonzero;"/>
                                </g>
                            </g>
                        </g>
                        <g transform="matrix(0.906803,0,0,0.906803,328.036409,247.776843)">
                            <g>
                                <g transform="matrix(150,0,0,150,677.898066,1539.966064)">
                                    <path d="M0.258,-0.057C0.272,-0.057 0.285,-0.058 0.299,-0.06C0.313,-0.062 0.325,-0.065 0.333,-0.068L0.333,-0.005C0.324,-0.001 0.311,0.002 0.294,0.005C0.277,0.008 0.261,0.01 0.245,0.01C0.217,0.01 0.191,0.005 0.168,-0.005C0.145,-0.015 0.126,-0.032 0.113,-0.056C0.099,-0.079 0.092,-0.112 0.092,-0.154L0.092,-0.472L0.016,-0.472L0.016,-0.511L0.092,-0.543L0.125,-0.659L0.173,-0.659L0.173,-0.535L0.33,-0.535L0.33,-0.472L0.173,-0.472L0.173,-0.157C0.173,-0.123 0.181,-0.098 0.197,-0.082C0.212,-0.065 0.233,-0.057 0.258,-0.057Z" style="fill-rule:nonzero;"/>
                                </g>
                                <g transform="matrix(150,0,0,150,731.364862,1539.966064)">
                                    <path d="M0.329,-0.545C0.339,-0.545 0.351,-0.544 0.362,-0.543C0.374,-0.542 0.384,-0.541 0.394,-0.539L0.383,-0.463C0.375,-0.466 0.365,-0.467 0.354,-0.469C0.343,-0.47 0.333,-0.471 0.324,-0.471C0.302,-0.471 0.282,-0.466 0.263,-0.458C0.244,-0.449 0.227,-0.437 0.213,-0.421C0.199,-0.405 0.187,-0.385 0.179,-0.363C0.171,-0.34 0.167,-0.315 0.167,-0.287L0.167,-0L0.085,-0L0.085,-0.535L0.153,-0.535L0.162,-0.437L0.165,-0.437C0.176,-0.456 0.189,-0.475 0.205,-0.491C0.221,-0.507 0.239,-0.521 0.26,-0.53C0.28,-0.54 0.303,-0.545 0.329,-0.545Z" style="fill-rule:nonzero;"/>
                                </g>
                                <g transform="matrix(150,0,0,150,792.668573,1539.966064)">
                                    <path d="M0.286,-0.544C0.349,-0.544 0.397,-0.53 0.428,-0.501C0.459,-0.472 0.474,-0.427 0.474,-0.364L0.474,-0L0.415,-0L0.399,-0.079L0.396,-0.079C0.381,-0.06 0.365,-0.043 0.349,-0.03C0.332,-0.017 0.314,-0.007 0.292,-0C0.271,0.006 0.245,0.01 0.214,0.01C0.181,0.01 0.152,0.004 0.127,-0.007C0.102,-0.019 0.082,-0.036 0.068,-0.059C0.053,-0.082 0.046,-0.111 0.046,-0.147C0.046,-0.2 0.067,-0.241 0.109,-0.27C0.152,-0.299 0.216,-0.314 0.303,-0.317L0.395,-0.321L0.395,-0.354C0.395,-0.4 0.385,-0.432 0.365,-0.451C0.345,-0.469 0.317,-0.479 0.281,-0.479C0.253,-0.479 0.227,-0.474 0.201,-0.466C0.176,-0.458 0.152,-0.449 0.129,-0.438L0.104,-0.499C0.128,-0.511 0.156,-0.522 0.187,-0.531C0.218,-0.54 0.251,-0.544 0.286,-0.544ZM0.394,-0.264L0.312,-0.26C0.246,-0.258 0.199,-0.247 0.171,-0.228C0.144,-0.208 0.13,-0.181 0.13,-0.146C0.13,-0.115 0.14,-0.093 0.158,-0.078C0.177,-0.063 0.201,-0.056 0.232,-0.056C0.279,-0.056 0.318,-0.069 0.349,-0.096C0.379,-0.122 0.394,-0.162 0.394,-0.214L0.394,-0.264Z" style="fill-rule:nonzero;"/>
                                </g>
                                <g transform="matrix(150,0,0,150,876.018183,1539.966064)">
                                    <path d="M0.167,-0.535L0.167,-0L0.085,-0L0.085,-0.535L0.167,-0.535ZM0.127,-0.735C0.14,-0.735 0.152,-0.731 0.161,-0.722C0.171,-0.714 0.176,-0.7 0.176,-0.682C0.176,-0.664 0.171,-0.651 0.161,-0.642C0.152,-0.633 0.14,-0.629 0.127,-0.629C0.113,-0.629 0.101,-0.633 0.092,-0.642C0.083,-0.651 0.078,-0.664 0.078,-0.682C0.078,-0.7 0.083,-0.714 0.092,-0.722C0.101,-0.731 0.113,-0.735 0.127,-0.735Z" style="fill-rule:nonzero;"/>
                                </g>
                                <g transform="matrix(150,0,0,150,913.884394,1539.966064)">
                                    <path d="M0.339,-0.545C0.402,-0.545 0.45,-0.529 0.483,-0.498C0.515,-0.467 0.532,-0.417 0.532,-0.349L0.532,-0L0.452,-0L0.452,-0.343C0.452,-0.388 0.441,-0.421 0.421,-0.443C0.401,-0.465 0.37,-0.477 0.328,-0.477C0.268,-0.477 0.227,-0.46 0.203,-0.426C0.179,-0.393 0.167,-0.344 0.167,-0.28L0.167,-0L0.085,-0L0.085,-0.535L0.151,-0.535L0.163,-0.458L0.167,-0.458C0.179,-0.477 0.193,-0.493 0.211,-0.506C0.229,-0.518 0.248,-0.528 0.27,-0.535C0.292,-0.542 0.315,-0.545 0.339,-0.545Z" style="fill-rule:nonzero;"/>
                                </g>
                                <g transform="matrix(150,0,0,150,1005.876581,1539.966064)">
                                    <path d="M0.292,-0.545C0.337,-0.545 0.376,-0.535 0.409,-0.515C0.441,-0.494 0.466,-0.466 0.483,-0.43C0.501,-0.394 0.509,-0.351 0.509,-0.303L0.509,-0.252L0.14,-0.252C0.141,-0.19 0.156,-0.142 0.187,-0.109C0.217,-0.076 0.259,-0.06 0.314,-0.06C0.348,-0.06 0.378,-0.063 0.404,-0.069C0.43,-0.075 0.457,-0.084 0.485,-0.096L0.485,-0.025C0.458,-0.013 0.432,-0.004 0.405,0.001C0.378,0.007 0.347,0.01 0.311,0.01C0.26,0.01 0.215,-0.001 0.177,-0.022C0.138,-0.043 0.109,-0.074 0.087,-0.114C0.066,-0.155 0.056,-0.205 0.056,-0.264C0.056,-0.321 0.065,-0.371 0.085,-0.413C0.104,-0.455 0.131,-0.488 0.167,-0.511C0.202,-0.534 0.244,-0.545 0.292,-0.545ZM0.291,-0.479C0.247,-0.479 0.213,-0.464 0.187,-0.436C0.161,-0.408 0.146,-0.368 0.141,-0.317L0.424,-0.317C0.424,-0.349 0.419,-0.377 0.409,-0.402C0.4,-0.426 0.385,-0.445 0.366,-0.458C0.346,-0.472 0.321,-0.479 0.291,-0.479Z" style="fill-rule:nonzero;"/>
                                </g>
                                <g transform="matrix(150,0,0,150,1090.105097,1539.966064)">
                                    <path d="M0.329,-0.545C0.339,-0.545 0.351,-0.544 0.362,-0.543C0.374,-0.542 0.384,-0.541 0.394,-0.539L0.383,-0.463C0.375,-0.466 0.365,-0.467 0.354,-0.469C0.343,-0.47 0.333,-0.471 0.324,-0.471C0.302,-0.471 0.282,-0.466 0.263,-0.458C0.244,-0.449 0.227,-0.437 0.213,-0.421C0.199,-0.405 0.187,-0.385 0.179,-0.363C0.171,-0.34 0.167,-0.315 0.167,-0.287L0.167,-0L0.085,-0L0.085,-0.535L0.153,-0.535L0.162,-0.437L0.165,-0.437C0.176,-0.456 0.189,-0.475 0.205,-0.491C0.221,-0.507 0.239,-0.521 0.26,-0.53C0.28,-0.54 0.303,-0.545 0.329,-0.545Z" style="fill-rule:nonzero;"/>
                                </g>
                                <g transform="matrix(150,0,0,150,1151.408808,1539.966064)">
                                    <path d="M0.073,-0.051C0.073,-0.074 0.079,-0.09 0.09,-0.099C0.101,-0.109 0.114,-0.114 0.13,-0.114C0.147,-0.114 0.161,-0.109 0.172,-0.099C0.184,-0.09 0.189,-0.074 0.189,-0.051C0.189,-0.028 0.184,-0.012 0.172,-0.002C0.161,0.009 0.147,0.014 0.13,0.014C0.114,0.014 0.101,0.009 0.09,-0.002C0.079,-0.012 0.073,-0.028 0.073,-0.051Z" style="fill-rule:nonzero;"/>
                                </g>
                                <g transform="matrix(150,0,0,150,1190.813105,1539.966064)">
                                    <path d="M0.292,-0.545C0.337,-0.545 0.376,-0.535 0.409,-0.515C0.441,-0.494 0.466,-0.466 0.483,-0.43C0.501,-0.394 0.509,-0.351 0.509,-0.303L0.509,-0.252L0.14,-0.252C0.141,-0.19 0.156,-0.142 0.187,-0.109C0.217,-0.076 0.259,-0.06 0.314,-0.06C0.348,-0.06 0.378,-0.063 0.404,-0.069C0.43,-0.075 0.457,-0.084 0.485,-0.096L0.485,-0.025C0.458,-0.013 0.432,-0.004 0.405,0.001C0.378,0.007 0.347,0.01 0.311,0.01C0.26,0.01 0.215,-0.001 0.177,-0.022C0.138,-0.043 0.109,-0.074 0.087,-0.114C0.066,-0.155 0.056,-0.205 0.056,-0.264C0.056,-0.321 0.065,-0.371 0.085,-0.413C0.104,-0.455 0.131,-0.488 0.167,-0.511C0.202,-0.534 0.244,-0.545 0.292,-0.545ZM0.291,-0.479C0.247,-0.479 0.213,-0.464 0.187,-0.436C0.161,-0.408 0.146,-0.368 0.141,-0.317L0.424,-0.317C0.424,-0.349 0.419,-0.377 0.409,-0.402C0.4,-0.426 0.385,-0.445 0.366,-0.458C0.346,-0.472 0.321,-0.479 0.291,-0.479Z" style="fill-rule:nonzero;"/>
                                </g>
                                <g transform="matrix(150,0,0,150,1275.04162,1539.966064)">
                                    <path d="M0.527,-0.535L0.527,-0L0.461,-0L0.449,-0.075L0.445,-0.075C0.434,-0.057 0.419,-0.041 0.402,-0.028C0.384,-0.016 0.365,-0.006 0.343,0C0.321,0.007 0.297,0.01 0.272,0.01C0.23,0.01 0.195,0.003 0.166,-0.011C0.137,-0.024 0.116,-0.046 0.101,-0.074C0.087,-0.103 0.08,-0.14 0.08,-0.185L0.08,-0.535L0.162,-0.535L0.162,-0.19C0.162,-0.146 0.172,-0.113 0.192,-0.091C0.212,-0.069 0.243,-0.058 0.284,-0.058C0.324,-0.058 0.356,-0.065 0.379,-0.08C0.403,-0.095 0.42,-0.117 0.43,-0.146C0.441,-0.175 0.446,-0.211 0.446,-0.253L0.446,-0.535L0.527,-0.535Z" style="fill-rule:nonzero;"/>
                                </g>
                            </g>
                        </g>
                        <g transform="matrix(2.362205,0,0,2.362205,767.716535,1557.527072)">
                            <g transform="matrix(1,0,0,1,-50,-50)">
                                <g transform="matrix(0.104167,0,0,0.104167,0,100)">
                                    <path d="M366.15,-253.85L140,-480L366.15,-706.15L408.31,-664L254.31,-510L760,-510L760,-670L820,-670L820,-450L254.31,-450L408.31,-296L366.15,-253.85Z" style="fill-rule:nonzero;"/>
                                </g>
                            </g>
                        </g>
                    </g>
                </svg>
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