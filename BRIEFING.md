# Weinkeller – Briefing für Claude Code

Max' persönliche Weinkeller-App fürs iPhone (PWA, wie Casa). Die App ist **fertig gebaut und getestet** – Vanilla JS, keine Abhängigkeiten, kein Build-Schritt. Deine Aufgabe: veröffentlichen, Bilder lokal machen, Etikett-Ausschnitt prüfen. Max tippt keine Terminal-Befehle – du führst alles selbst aus (inkl. git push).

## Dateien
- `index.html` – Einstieg, lädt `app.css`, `data.js`, `app.js`
- `data.js` – Stammdaten: 18 Weine aus Lobenberg-Bestellung #301535365 (16.11.2026), 22 Aromen, 13 Regionen, Lernkarten
- `app.js` – gesamte Logik (Keller, Weinkarte, Offen/Verlauf, Probe, Vergleich, Regionen, Profil, Sichern/Einspielen)
- `app.css` – Design (hell, Beerenrot #8C1D47, Bricolage Grotesque + Inter)
- `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` – PWA / Homescreen / Offline

Daten liegen in `localStorage` (Schlüssel `weinkeller.v1`). Beim Laden werden Stammdaten aus `SEED_WINES` nachgezogen, Bestand und Verkostungen bleiben erhalten.

## Aufgaben
1. **Repo + Hosting:** neues GitHub-Repo `MaxsLobster/weinkeller`, Dateien committen, GitHub Pages aktivieren (Branch `main`, Root). URL an Max geben.
2. **Bilder lokal machen:** Alle externen Bild-URLs in `data.js` (Higgsfield `d8j0ntlcm91z4.cloudfront.net` und Lobenberg `res.cloudinary.com/guteweine`) herunterladen nach `img/aromen/`, `img/regionen/`, `img/flaschen/` und in `data.js` auf relative Pfade umstellen (`HF`- und `LB()`-Helfer anpassen). Dann `sw.js` → `CACHE` auf `weinkeller-v2` hochzählen.
3. **Aquarell-Assets lokal:** `ASSETS` in `data.js` (Icon, Startbild, leere Zustände, Sommelier-Emblem) ebenfalls nach `img/` holen. Aus `ASSETS.icon` die Homescreen-Icons `icon-192.png` und `icon-512.png` erzeugen (vorhandene ersetzen) und in `index.html` den `apple-touch-icon` wieder auf `icon-512.png` stellen.
4. **Etikett-Ausschnitt prüfen:** Die Startseite ist eine Etiketten-Wand (2 Spalten). Die Flaschenfotos werden in `.biglabel img` per `object-position: 50% 72%` + `scale(1.9)` auf das Etikett gezoomt. Mit den echten Bildern im Browser (iPhone-Breite 390 px) prüfen und so einstellen, dass das Etikett gut sichtbar ist. Falls einzelne Flaschen abweichen: optionales Feld `labelPos` (z. B. `'50% 70%'`) pro Wein in `data.js` ergänzen und in `bigLabel()` nutzen. Lädt ein Foto nicht, zeigt die App automatisch ein gezeichnetes Etikett – das soll so bleiben.
5. **Test:** Durchklicken – Startbild → Etiketten-Wand → Etikett antippen (Karte von unten) → Weinkarte → Flasche öffnen → Probe speichern → Neue Probe → Verlauf → Mit Kritikern vergleichen → Flasche leer → Regionen (Stempel) → Sommelier-Tab → Profil. Keine Konsolenfehler.
6. **An Max:** Link schicken + kurz erklären: in Safari öffnen → Teilen → „Zum Home-Bildschirm“.

## Nächster Schritt (eigener Auftrag, erst nach Max' Go)
- **Sommelier-Chat:** Tab „Sommelier“ ist vorbereitet (`vSommelier()`, Platzhalter). Anbindung an die Claude-API über eine kleine Server-Funktion (z. B. Supabase Edge Function wie bei Casa, API-Schlüssel nie im Browser). Systemanweisung: Max' persönlicher Sommelier, Deutsch, du, ehrlich und auf Augenhöhe; als Kontext Keller, Proben und Profil mitschicken. Darauf bauen später Weinabend-Planer, Weinschule, Probe per Sprache und Weinkarten-Scan im Restaurant auf.

## Später (nicht jetzt, nur wenn Max es freigibt)
- Sync über Supabase wie bei Casa (eine Tabelle mit dem JSON-Zustand pro Nutzer), damit Daten nicht nur auf dem iPhone liegen.
- Neue Lobenberg-Bestellungen automatisch als Flaschen übernehmen.

## Hinweise zu den Daten
- Trinkfenster, Rebsorten, Stil-Tags, Punkte: Lobenberg-Produktseiten (gute-weine.de). Bei `est: true` ist das Trinkfenster geschätzt (Kalmit Spätburgunder, Trinité, Rosé 2025, Naranjo, Patinegro 2022).
- Kritiker-Aromen (`critic`) teils von Vorjahrgängen – Quelle steht im Feld `src`.
- Dekantieren, Temperatur, „Passt zu“ sind Faustregeln, keine Händlerangaben.
