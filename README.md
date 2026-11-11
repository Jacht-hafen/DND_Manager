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

Node.js >= 22 installieren. In diesem Ordner:

```bash
npm install
cp .env.example .env
# .env mit echten Werten ausfüllen
npx netlify dev
```

Netlify Dev zeigt die lokale Adresse an (in der Regel http://localhost:8888).
Ein einfacher statischer Server stellt nur das Design bereit, **keine** Online-API.

## Architektur / Spielregeln

- HTML, CSS und Vanilla JavaScript; die verwendeten Fluent-Web-Components werden lokal gebündelt.
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

Fluent UI 3.2.1 ergänzt Standardaktionen, Status-Badges, Hinweise und Ladeanzeigen.
Formularfelder und Submit-Buttons bleiben native HTML-Elemente, ebenso die speziellen
Rätselbedienelemente. Farben und Typografie werden in `ui/fluent.js` auf Runenwerk abgestimmt;
die begleitenden Styles stehen in `public/fluent-ui.css`.

Nach Änderungen an `ui/fluent.js` das lokale Bundle neu erstellen:

```bash
npm run build:ui
```

`public/fluent-ui.js` ist als erzeugte Datei eingecheckt, damit der bestehende statische
Netlify-Deploy ohne zusätzlichen Build-Schritt weiter funktioniert. Es werden nur die
verwendeten Komponenten gebündelt; ein zusätzliches Fluent-CDN ist nicht erforderlich.

```bash
npm run check
```

Tests prüfen unter anderem Zugriffsrollen, Rätsellösungen und Zurücksetzungen.

## Vercel und Sicherheit

- Das statische Frontend liegt in `public/`. Vercel benutzt `vercel.json` und die Funktion `api/[endpoint].js`; Netlify benutzt weiterhin `netlify/functions/api.mjs`.
- In Vercel müssen `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` als **serverseitige** Umgebungsvariablen gesetzt werden. Der Service-Role-Schlüssel darf niemals im Frontend stehen.
- Die API validiert Codes und Namen, begrenzt JSON-Anfragen, prüft Herkunft bei Browser-POSTs, verlangt Authentifizierung für Raumaktionen und gibt interne Datenbankfehler nicht an Clients weiter.
- PostgREST-Filter nutzen validierte Codes und kodierte Werte, keine direkte SQL-Stringkonkatenation. Das schützt vor SQL-Injection in diesen Endpunkten, ersetzt aber keine Prüfung zukünftiger SQL-Zugriffe.
- Die im API-Code enthaltene Rate-Begrenzung ist **nur pro Server-Instanz** und daher kein zuverlässiger Schutz gegen verteilte Brute-Force-Angriffe. Vor öffentlichem Launch Vercel Firewall-/WAF-Rate-Limits für `/api/check-password`, `/api/join`, `/api/check-code` und `/api/create` einrichten, gegebenenfalls mit Captcha oder zentralem Rate-Limit-Speicher.
- Einstellungen für RLS, minimale Berechtigungen, Secret-Rotation, Monitoring, Abuse-Alerts, Backups und Passwort-Reset müssen im Supabase-/Vercel-Dashboard separat geprüft werden.
- Sicherheitstests: `npm run check`. Nach Deployment mit Testkonten die komplette Anmeldung, Premium-Rechte und den Raumbeitritt prüfen.

## Arbeitsbereich, Kampagnen & Sicherheit (2026-11)

Die Website besitzt jetzt einen Arbeitsbereich unter `/workspace.html`. Dort können angemeldete Benutzer Kampagnen, eigene Rätsel, Favoriten, Bewertungen, Handouts und Sitzungschroniken verwalten. Premium-Nutzer können neue Kampagnen in ihren Gruppen anlegen, eigene Rätsel erstellen und in einer aktiven Live-Sitzung starten. Dungeon Master können Rollen freigeben und Hinweise senden.

Neue Räume bleiben ab Erstellung ein Jahr gültig. Öffnet der Eigentümer sie erneut, wird die Laufzeit verlängert. Die Raumerstellung erfordert ein Premium-Konto und ein gesondertes Raumpasswort.

Die angewendeten Datenbankmigrationen sind unter `supabase/migrations/` versioniert. Bei einem neuen Projekt müssen die Migrationen ausgeführt werden. Das ursprüngliche `supabase/schema.sql` ist nur das alte MVP-Basisschema.

**Sicherheit:** Nutzergebundene Tabellen nutzen RLS; eigene Rätsellösungen bleiben privat. Passwortversuche werden zentral in Postgres limitiert. Die API protokolliert fehlgeschlagene Raum-Passworteingaben ohne Klartext-IP-Adressen oder Passwörter. Konto-Seite: Passwort-Zurücksetzen, Datenexport und Kontolöschung. In Supabase Auth muss `/account.html` als zulässige Redirect-URL hinterlegt sein.

**Noch konfigurieren:** Die Produktivbereitstellung auf Vercel benötigt `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` als geheime Server-Umgebungsvariablen. Zusätzlich solltest du Supabase Auth Leaked Password Protection und Vercel WAF/Firewall-Limits aktivieren. Die automatischen Checks laufen per GitHub Actions (`npm run check`).
