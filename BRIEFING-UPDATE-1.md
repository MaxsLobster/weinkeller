# Weinkeller – Update 1: Header, schwebende Leiste, Weinschule

Max hat das Design freigegeben (Canvas „Runde 5“). Dieses Update kommt **auf das bestehende Repo** `MaxsLobster/weinkeller` (lokal `~/Projects/weinkeller`). Die Dateien in diesem Ordner sind fertig gebaut und im Headless-Chrome (390×844) ohne JS-Fehler getestet.

## Wichtig beim Übernehmen
Nicht blind überschreiben. Im Repo hast du beim ersten Deploy eigene Anpassungen gemacht (lokale Bildpfade statt HF/Cloudinary, Icons, evtl. `labelPos` in `bigLabel()`, Cache-Version im `sw.js`). **Diese Anpassungen behalten**, alles Neue aus diesem Update dazunehmen. Am einfachsten: pro Datei `diff` gegen das Repo und gezielt mergen.

Was sich geändert hat:
- **schule-data.js** (neu): 6 Kapitel, 29 Lektionen, 116 Fragen (Typen `mc`, `pair`, `temp`), Ränge (`RANKS`), 6 Mini-Lektionen nach einer Probe (`MINIS`).
- **data.js**: `ASSETS.header` mit 4 Jahreszeiten-Bildern (am Ende der Datei). Sonst unverändert.
- **index.html**: lädt zusätzlich `schule-data.js` (nach `data.js`, vor `app.js`).
- **app.js**:
  - State: `S.school = { right: {}, lessons: {} }` + `norm()` nach Laden und Import (alte Sicherungen bleiben kompatibel).
  - Neue Leiste: `tabsHtml()` → `.dock` mit Milchglas-Pille (Keller, Offen, Regionen, Profil – nur Icons, Punkt unter „Offen“, wenn eine Flasche offen ist) und eigenem runden Sommelier-Knopf. Sommelier ist kein normaler Tab mehr in der Pille.
  - Header: `seasonKey()` + `headerHtml()` – Aquarell oben im Keller, Wechsel nach Monat (Mär–Mai Frühling, Jun–Aug Sommer, Sep–Nov Lese, Dez–Feb Winter). Fallback ohne Bild = weicher Farbverlauf.
  - Weinschule (Abschnitt „Weinschule“): `vSchule`, `vQuiz`, `vMini`, Keller-Runde (`kellerPool`/`kellerRound`, Fragen aus den eigenen Flaschen: Rebsorte, Region, Dekantieren, Temperatur), Punkte (10 pro Frage, nur beim ersten Richtig), Ränge.
  - Profil: Lernkarten raus, stattdessen Karte „Weinschule“ oben.
  - Nach `saveProbe()` kommt eine Mini-Lektion, wenn eine passt (z. B. Tannin ≥ 4 → „Das Pelzige eben – das war Tannin“, ab Probe 2 → „Luft“). Jede nur, bis sie einmal richtig beantwortet ist.
  - Regionen: Postkarte bekommt „gelernt“, wenn die passende Regionen-Lektion abgeschlossen ist.
  - Leiste wird auf Probe, Quiz und Mini-Lektion ausgeblendet.
- **app.css**: alte `nav.tabs`-Regeln raus; neu: `.hdr`, `.dock`, Weinschule, Quiz, Mini-Lektion. `#app` unten mehr Platz (104px + Safe Area).
- **sw.js**: Cache `weinkeller-v3`, `schule-data.js` im Core. Falls im Repo schon eine höhere Version steht: einfach eins höher.

## Aufgaben
1. Dateien wie oben beschrieben ins Repo mergen.
2. Die 4 Header-Bilder aus `ASSETS.header` herunterladen nach `img/header/fruehling.jpg`, `sommer.jpg`, `lese.jpg`, `winter.jpg` (auf ca. 1200 px Breite verkleinern, je unter 300 KB), `ASSETS.header` auf die lokalen Pfade umstellen.
3. `sw.js`: Header-Bilder und `schule-data.js` in `CORE`, Cache-Version erhöhen.
4. Testen (390×844, am besten auch iPhone-Safari-Emulation):
   - Keller: Header zeigt „Lese“ (November), Etiketten laufen beim Scrollen verschwommen unter der Pille durch, Pille + Sommelier-Knopf bleiben unten, Safe Area unten passt.
   - Profil → Weinschule → Lektion „Rote Klassiker“: Auswahlfrage, Zuordnen (Paare), Auswertung, Punkte, Rang.
   - Service → Temperatur-Frage mit Regler.
   - Keller-Runde: 8 Fragen, Etikett neben der Frage.
   - Flasche öffnen → Probe mit Tannin „griffig“ speichern → Mini-Lektion erscheint → Fertig → zweite Probe → Mini-Lektion „Luft“.
   - Regionen-Lektion abschließen → Postkarte zeigt „gelernt“.
   - Sichern/Einspielen funktioniert weiter (Weinschule-Stand ist dabei).
5. Committen, pushen, GitHub Pages prüfen.
6. Max kurz sagen: Link ist gleich geblieben; App vom Homescreen einmal ganz schließen und neu öffnen, damit der neue Cache greift.

## Nicht in diesem Update
- Sommelier-Chat (Claude-Anbindung): Knopf und Platzhalter-Seite bleiben, Anbindung erst nach Max' Go.
- Keine weiteren Tabs, keine Erinnerungen, keine Streaks.

## Hinweise zu den Inhalten
- Die Fragen sind von Hand geschrieben und geprüft; bei `mc` steht die richtige Antwort im Datensatz immer an erster Stelle, die App mischt beim Anzeigen.
- Keller-Runde nutzt die Daten aus der Weinkarte (Rebsorten, Region, `decant`, `temp`). Bei Temperatur zählt ±1 °C als richtig.
- Punkte: 10 pro Frage, nur beim ersten Richtig (keine Punkte-Farm). Ränge: Lehrling 0 · Kellerknecht 200 · Kellermeister 600 · Sommelier 1200.
