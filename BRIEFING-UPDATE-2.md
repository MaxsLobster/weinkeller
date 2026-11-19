# Weinkeller – Update 2: Rückgängig + Claude-Anbindung (Sommelier, Etikett-Foto, Bestellung einfügen)

Max hat freigegeben. Entscheidungen von Max:
- **Eigenes Supabase-Projekt „weinkeller“** (nicht das Casa-Projekt).
- **Claude API mit Ausgabenlimit 10 € pro Monat.**

Repo: `MaxsLobster/weinkeller` (lokal `~/Projects/weinkeller`), Vanilla-JS-PWA auf GitHub Pages. Update 1 (Header, Leiste, Weinschule) sollte schon drin sein – falls nicht, zuerst `weinkeller-update-1.zip` aus Downloads nach dessen Briefing umsetzen.

**Max führt selbst keine Terminal-Befehle aus.** Alles, was im Browser passieren muss (Supabase-Login, API-Schlüssel anlegen, Limit setzen), sagst du ihm Schritt für Schritt mit genauer Klick-Anleitung. Alles andere machst du selbst.

Reihenfolge: **Teil 1 → testen → deployen**, dann **Teil 2 → Teil 3 → testen → deployen.**

---

## Teil 1 – Rückgängig beim Öffnen (klein, sofort)

Problem: Max hat aus Versehen „Öffnen“ gedrückt, die Flasche steht jetzt als offen, es gibt kein Zurück.

1. Neue Funktion `undoOpen(tid)`: nur erlaubt, solange die offene Flasche **noch keine Probe** hat. Entfernt die Verkostung aus `S.tastings`, erhöht `bottles` des Weins um 1, speichert, springt zurück in den Keller, Toast „Zurück in den Keller gelegt“.
2. Nach `openBottle()` erscheint ein Toast mit Knopf **„Rückgängig“** (10 Sekunden sichtbar). Der bestehende `toast()` kann dafür eine optionale Aktion bekommen.
3. In `vTasting()` (Verlauf der offenen Flasche): Wenn `t.probes.length === 0`, dezenter Link-Knopf **„Doch nicht geöffnet“** unter den Hauptknöpfen → `undoOpen`.
4. Damit kann Max auch seine aktuell versehentlich geöffnete Flasche zurücklegen.

---

## Teil 2 – Server mit Claude-Anbindung

### Aufbau
- Supabase-Projekt **weinkeller** (Region EU, Frankfurt). Supabase CLI ist auf dem Mac schon vorhanden (`~/.supabase`). Falls Login nötig: Max per Browser einloggen lassen.
- **Eine Edge Function `claude`** (Deno/TypeScript) als einziger Weg zur Claude API. Der API-Schlüssel liegt nur als Supabase-Secret `ANTHROPIC_API_KEY`, **nie im Browser oder im Repo**.
- Modell: aktuelles Sonnet-Modell für Chat und Bilder (Stand jetzt `claude-sonnet-5-5` – Modell-ID in docs.claude.com prüfen). Konstante oben in der Function, leicht austauschbar.

### Zugang absichern
Die App ist öffentlich auf GitHub Pages, darum:
- Secret `APP_ACCESS_CODE` (langer Zufallscode, z. B. 24 Zeichen). Die Function lehnt jeden Aufruf ohne passenden Header `x-wk-code` ab.
- In der App: Beim ersten Öffnen des Sommeliers (oder in Profil → Daten) Feld **„Zugangscode“** einmal eingeben, wird in `localStorage` gespeichert. Den Code gibst du Max am Ende.
- CORS nur für `https://maxslobster.github.io` (und `http://localhost:*` zum Testen).

### Kosten im Griff
- Max legt in der Anthropic Console (console.anthropic.com) ein Konto an, lädt Guthaben auf und setzt das **monatliche Ausgabenlimit auf 10 €** (bzw. den nächstliegenden Wert in USD). Gib ihm dafür eine Klick-Anleitung, er schickt dir dann den API-Schlüssel und du setzt ihn als Secret.
- Zusätzlich in der Function: `max_tokens` begrenzen (Chat 1200, Extraktion 2000), höchstens 150 Aufrufe pro Tag (Zähler in einer kleinen Tabelle `usage(day date primary key, calls int)`), danach freundliche Fehlermeldung.

### Datensicherung (Bonus, klein)
- Tabelle `cellar_state(id text primary key, data jsonb, updated_at timestamptz)`, eine Zeile `id = 'max'`.
- Die Function bekommt zwei Aktionen `backup` (speichert `S`) und `restore` (liefert `S`). Gleicher Zugangscode-Schutz, Tabellen nur über die Function erreichbar (RLS an, keine Policies für anon).
- App: nach `save()` entprellt (5 s) `backup` schicken, wenn ein Zugangscode gesetzt ist. Profil → Daten bekommt „Vom Server wiederherstellen“ (mit Bestätigung). Bestehendes Sichern/Einspielen bleibt.

### API der Function (POST, JSON)
`{ action: 'chat' | 'label' | 'order' | 'backup' | 'restore', ... }`
- `chat`: `{ messages: [{role, content}], context }` → Antwort-Text (gern gestreamt per SSE; wenn das zu aufwendig ist, erst ohne Streaming).
- `label`: `{ image: base64 (JPEG, in der App vorher auf max. 1600 px verkleinert), context }` → `{ wines: [Wein] }`
- `order`: `{ text?: string, url?: string }` → `{ wines: [Wein] }`. Bei `url` holt die Function die Seite serverseitig (nur `gute-weine.de` und `lobenberg` erlaubt) und gibt den Text an Claude.

---

## Teil 3 – Funktionen in der App

### 3a Sommelier-Chat (ersetzt die Platzhalter-Seite)
- Oben: Emblem klein, Titel „Dein Sommelier“, Knopf „Neues Gespräch“.
- Leerer Zustand: die bisherigen Beispielfragen als antippbare Chips (die Fragen zu einem Wein, wenn er über „Sommelier zu diesem Wein fragen“ kommt – inklusive Chip „Zu: Lalama 2021“).
- Nachrichten als Blasen (Max rechts, Sommelier links), Eingabefeld unten über der schwebenden Leiste, Senden-Knopf. Während er schreibt: „schreibt …“.
- **Weinverweise:** Der Sommelier markiert Weine aus dem Keller als `[[wein-id]]`. Die App ersetzt das durch einen kleinen Chip mit Name + Jahrgang, Antippen öffnet die Wein-Karte (Bottom Sheet).
- Gesprächsverlauf in `localStorage` (letzte 40 Nachrichten), nicht im Backup nötig.

**Kontext**, den die App bei jedem Aufruf mitschickt (kompakt, als Text oder JSON):
- Alle Weine im Keller mit `id`, Name, Weingut, Jahrgang, Farbe, Rebsorten, Region, Flaschen, Status (trinkreif / lagern / offen), Trinkfenster, Dekantieren, Temperatur, Glas, „Passt zu“, Stil.
- Offene Flaschen mit Öffnungszeit und ihren Proben (Zeitpunkt, Aromen, Regler, Punkte, Notiz).
- Die letzten ~20 Proben anderer Flaschen in Kurzform.
- Profil: Radar-Werte, Satz („Du magst …“), Lieblingsrebsorten und -regionen.
- Heutiges Datum, Jahreszeit.
- Wenn über eine Flasche gestartet: deren `id` als Fokus.

**System-Prompt** (so übernehmen, bei Bedarf feinschleifen):

```
Du bist der persönliche Sommelier von Max. Du sprichst Deutsch, duzt ihn, locker und direkt, wie ein guter Freund, der viel von Wein versteht – nicht wie ein Verkäufer.

Du kennst seinen Keller, seine offenen Flaschen, seine Proben und sein Geschmacksprofil (siehe KONTEXT). Nutze das aktiv: Empfiehl zuerst aus seinem Keller und sag kurz, warum es zu ihm oder zum Anlass passt. Weine aus seinem Keller nennst du immer mit [[id]], z. B. [[lalama-21]] – die App macht daraus einen Link.

Regeln:
- Kurz und konkret. Am Handy lesbar: wenige Sätze oder ein paar Stichpunkte, keine Tabellen.
- Ehrlich: Wenn du etwas über einen Wein nicht sicher weißt (kleine Weingüter, genaue Trinkfenster), sag „geschätzt“ oder „weiß ich nicht sicher“. Nichts erfinden.
- Bei Empfehlungen zum Öffnen: Trinkfenster, Dekantierzeit und Temperatur aus dem Kontext beachten. Weine, die noch lagern sollten, nur mit Hinweis empfehlen.
- Bei offenen Flaschen: Beziehe dich auf seine Proben (wie hat sich der Wein entwickelt, was sagt das).
- Erkläre Begriffe einfach (Tannin, Reduktion, Säure …), wenn er fragt oder es hilft.
- Keine Kaufaufforderungen. Wenn er nach Nachkauf fragt: ehrlich, mit Bezug auf seinen Geschmack.
- Wenn ein Wunsch nicht zu seinem Keller passt, sag das offen und schlag die beste Alternative vor.
```

### 3b Neue Flaschen: „+“ im Keller öffnet ein Sheet mit drei Wegen
1. **Etikett fotografieren** – `<input type="file" accept="image/*" capture="environment">`, Bild in der App verkleinern, `action: 'label'`.
2. **Bestellung einfügen** – Textfeld (Mail-Text oder Link von Lobenberg/gute-weine.de einfügen), `action: 'order'`.
3. **Von Hand** – das bestehende Formular.

Bei 1 und 2 kommt eine **Bestätigungsansicht**: pro erkanntem Wein eine Karte mit allen Feldern zum Korrigieren, Anzahl Flaschen (Stepper), Haken „übernehmen“. Felder, die Claude geschätzt hat, tragen ein kleines „geschätzt“. Knopf „X Flaschen in den Keller“.

**Abgleich:** Gibt es denselben Wein (Weingut + Name + Jahrgang, unscharf verglichen) schon, wird nur `bottles` erhöht – kein Duplikat. In der Bestätigung steht dann „schon im Keller – +1“.

**Format pro Wein** (wie `SEED_WINES` in `data.js`, Claude liefert JSON nach diesem Schema, per Tool-Use/Structured Output erzwingen):
`{ name, producer, vintage, color: 'rot'|'weiss'|'rose', region (id aus REGIONS oder neuer Name), grapes, from, to, decant (Minuten), temp ('15–16'), glass, pairing: [..], style: [..], bottles, price?, url?, estimated: [Feldnamen, die geschätzt sind] }`
- Neue Region, die es in `REGIONS` nicht gibt: als Wein-Feld `regionName` + `country` speichern; die Regionen-Ansicht zeigt dafür eine schlichte Postkarte ohne Aquarell (Aquarell kann später nachkommen).
- Bild: Bei Lobenberg-Bestellungen, wenn ein Artikelcode erkennbar ist, das Flaschenfoto wie bei den bestehenden Weinen über `LB(code)` setzen. Beim Etikett-Foto das eigene Foto verkleinert (max. 600 px) als Daten-URL im Wein speichern und als Etikett verwenden.

---

## Testen
- Teil 1: Flasche öffnen → Toast „Rückgängig“ → zurück im Keller, Bestand stimmt. Erneut öffnen, Toast verstreichen lassen → im Verlauf „Doch nicht geöffnet“ → zurück. Nach einer Probe ist der Knopf weg.
- Function: ohne Code → 401; mit Code → Antwort; Tageslimit greift.
- Chat: „Was mach ich heute zu Lamm auf?“ → Empfehlung aus dem Keller mit klickbaren Wein-Chips. Über „Sommelier zu diesem Wein fragen“ starten → Antwort bezieht sich auf die Flasche und ihre Proben.
- Etikett: Testfoto eines bekannten Etiketts (z. B. ein Bild aus dem Internet) → Bestätigung → Wein im Keller. Zweites Mal → „schon im Keller – +1“.
- Bestellung: Text einer Lobenberg-Bestellmail einfügen → alle Positionen erkannt, Mengen stimmen.
- Backup: Gerät-Speicher löschen (Testprofil) → „Vom Server wiederherstellen“ → alles wieder da.
- iPhone: Kamera öffnet sich, Eingabefeld wird nicht von der Tastatur oder Leiste verdeckt.

## Am Ende Max sagen
- Ob alles live ist.
- Den **Zugangscode** (und wo er ihn eingibt).
- Dass er die App einmal ganz schließen und neu öffnen soll.

## Nicht in diesem Update
Automatischer Import von Lobenberg-Mails, Weinabend-Planer und Restaurant-Scan als eigene Screens (geht aber schon jetzt im Chat), Probe per Sprache.
