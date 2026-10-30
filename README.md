# RUNENWERK ONLINE – Multiplayer D&D-Puzzles

Eine Netlify-fähige Website mit Serverless-API, Supabase-Postgres, DM-Raumverwaltung,
separaten Spielerrollen, gemeinsamer Zustandsverwaltung, acht Rätselmodulen,
Theme-Auswahl und einem synthetischen Soundboard.

## Einrichtung (einmalig, ~5 Schritte)

**1. Supabase anlegen**
- In https://supabase.com/ ein neues Projekt erstellen.
- Im SQL Editor den **gesamten Inhalt** von `supabase/schema.sql` ausführen.
- Im Projekt unter Settings / API die Project URL und den **service_role** Secret Key kopieren.
- Den service_role Key **niemals** in clientseitiges JavaScript oder öffentliche Repositories eintragen.

**2. Auf GitHub legen**
- Neues privates GitHub-Repository erstellen und den Inhalt dieses Ordners pushen.
- Kein .env mit echten Keys committen.

**3. Mit Netlify verbinden**
- In https://app.netlify.com/ „Add new project“ -> „Import an existing project“ -> GitHub.
- Repository wählen. Netlify erkennt `netlify.toml` automatisch.
- Build command: `echo 'Static website ready'` (bereits gesetzt).
- Publish directory: `public` (bereits gesetzt).
- Functions directory: `netlify/functions` (bereits gesetzt).

**4. Umgebungsvariablen eintragen** (Netlify: Project configuration -> Environment variables):
- `SUPABASE_URL` = `https://<project>.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = geheimer `service_role`-Key aus Supabase
- Danach in Netlify **Deploys -> Trigger deploy -> Deploy site**.

**5. Spielen**
- Netlify-URL aufrufen -> „Kampagne starten“.
- Als DM Room erstellen; Sitzungscode und Spieler-Links unter „Mitspieler“ teilen.
- Auf anderen Geräten Spieler A / B / C beitreten lassen.
- Als DM unter „Rätsel“ eine Aufgabe auswählen, starten, anpassen und zurücksetzen.
- Spieler sehen Aktualisierungen alle ~1,6 Sekunden (Polling; kein WebSocket).

## Lokal starten

Node.js >= 20 installieren. In diesem Ordner:

```bash
npm install
cp .env.example .env
# .env mit echten Werten ausfüllen
npx netlify dev
```

Netlify Dev zeigt die lokale Adresse an (in der Regel http://localhost:8888).
Ein einfacher statischer Server stellt nur das Design bereit, **keine** Online-API.

## Architektur / Spielregeln

- HTML, CSS und Vanilla JavaScript: keine Build-Abhängigkeit des Frontends.
- Netlify Functions: alle sensiblen Datenbank-Anfragen serverseitig, Tokens in SHA-256 gehasht.
- Supabase PostgreSQL: Speicherung über alle Geräte, Konfliktkontrolle mit Versionsprüfung.
- Supabase RLS aktiviert, keine öffentlichen SELECT/UPDATE-Policies.
- Spielerlinks sind nur Raum-/Rollenvorgaben. Der Zugang wird beim Beitritt über ein privates Token vergeben.
- 1 DM, maximal 1 Spieler pro Rolle A/B/C; Räume laufen nach 7 Tagen ab.
- Der DM kann aktive Rätsel zurücksetzen, wechseln, pausieren oder manuell lösen.
- 8 Rätsel: Runen, Hebel, Kompass, Spiegelkammer, Druckplatten, verborgene Zahlen,
  Feuerschale und Einstein (letzteres DM-geführt, da Ausgangshinweise unvollständig sind).
- Kompassfolge stammt aus der deutschen Vorlage, die englische Fassung weicht an zwei Stellen ab.
- Soundboard erzeugt **lokale** Klänge; es streamt derzeit keinen Ton an Spieler.

## Wichtige Grenzen vor einem öffentlichen kommerziellen Launch

Diese Anwendung ist eine funktionale Multiplayer-MVP, keine fertig abgesicherte SaaS-Plattform.
- **Kein Stripe/Abo/Login**. Der DM besitzt stattdessen ein geheimes Raum-Token.
- **Keine Missbrauchssicherung / Rate Limits**, kein Captcha, keine Zahlungsprüfung.
- Spielername/Rolle können nach Beitritt nicht über die UI freigegeben werden;
  eine falsch reservierte Rolle muss vorerst administrativ in `rw_players` entfernt werden.
- Zugangs-Token wird in localStorage auf diesem Gerät gespeichert. Browserdaten löschen verliert Zugang.
- Einladungslinks laufen indirekt mit dem Raum nach 7 Tagen ab, sind aber nicht einmalig gültig.
- Realtime bedeutet Polling und Änderungsabruf ca. alle 1,6 s, keine WebSockets.
- Die simultanen Druckplatten sind persistente Schalter, keine physisch gedrückten/losgelassenen Tasten.
- Datenbankraum wird nach Ablauf nicht automatisch physisch gelöscht (nur logisch blockiert).
- Deployment muss mit echten Supabase-Keys konfiguriert werden, sonst funktionieren Erstellen/Beitreten nicht.

## Entwicklung und Tests

```bash
npm run check
```

Tests prüfen unter anderem Zugriffsrollen, Rätsellösungen und Zurücksetzungen.
