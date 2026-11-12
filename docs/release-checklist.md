# Runenwerk – Launch- und Qualitätscheckliste

Stand: 12.11.2026. Ziel: eine zuverlässige, sichere und professionell gestaltete Plattform, bevor Premium-Zahlungen aktiviert werden.

## P0 – Vor öffentlichem oder kostenpflichtigem Launch

- [ ] Automatisierte Tests auf jedem Pull Request; Deploys bei fehlgeschlagenen Tests blockieren (GitHub Branch Protection / Vercel Settings).
- [ ] Mit echten Testkonten alle Rollen durchspielen: registrieren, E-Mail bestätigen, anmelden, Passwort zurücksetzen, Gruppe erstellen/beitreten, Premium-/Free-Grenzen, DM/Spieler, Session-Resume, Reset und Logout.
- [ ] Test mit drei Geräten und gleichzeitigem Beitritt: Rolle darf nur einmal vergeben werden; kein Datenverlust bei parallelen Aktionen.
- [ ] Zugriffsschutz für alle Supabase-Tabellen mit eigenen und fremden Benutzerkonten testen, einschließlich Handouts und privaten Rätsellösungen.
- [ ] Supabase Auth: Leaked Password Protection aktivieren und Password-Policy/SMTP-Limits prüfen.
- [ ] Vercel: Firewall/Rate Limits und Logs auf API-Fehler/Fehlschläge prüfen; Kosten- und Nutzungswarnungen einrichten.
- [ ] Bestehende Raum-Tokens und Auth-Sitzungen auf sichere Speicherung, Widerruf und Ablauf prüfen; kein Zugriff über fremde Sitzungen.
- [ ] Backups und Wiederherstellung auf einem separaten Testprojekt demonstrieren.
- [ ] Datenschutzerklärung, Impressum, Nutzungsbedingungen, Abo-/Kündigungs- und Widerrufsabläufe juristisch prüfen.
- [ ] Lizenz/Rechte prüfen: eigene Rätseltexte, Icons, Bilder, D&D-Begriffe. Wizards Fan Content Policy ist nicht automatisch eine Erlaubnis für kostenpflichtige Fan-Inhalte; ggf. CC-SRD mit korrekter Attribution nutzen.
- [ ] Einwilligungspflicht und Datenschutz von Vercel Analytics und weiterer Telemetrie für den geplanten Betrieb in Deutschland prüfen.
- [ ] Vercel-Domain, Weiterleitungen, SSL, E-Mail-Zustellung und produktive Umgebungsvariablen verifizieren.

## P1 – Zuverlässigkeit und professionelle UX

- [ ] Browser-E2E-Tests (Chromium, Firefox, Mobil) für Login, Premium-Rechte, Live-Sitzungen und Rätselsuche.
- [ ] Sichtprüfung aller Seiten in 360/768/1440px; Tastaturbedienung, Kontrast, Fokus, Screenreader-Beschriftungen.
- [ ] Fehlerzustände: Offline, API-Timeout, ungültiger Code, falsches Passwort, fehlender Zugriff, verlorene Verbindung.
- [ ] Fehlermonitoring (z. B. Sentry) und Vercel-Dashboard verbinden; Datenschutz und Kosten prüfen.
- [ ] Profil- und Kontolöschung einschließlich assoziierter Daten testen.
- [ ] Bibliothek: alle 18 Rätsel redaktionell prüfen (Lösung, Hinweisstufen, Dauer, Spielbarkeit und Spoiler).
- [ ] Performance/Lighthouse, Bundle-Größe und SEO-Crawlbarkeit der dynamischen Rätseldetails prüfen.
- [ ] Transaktionssicherheit bei Raumerstellung und Sitzungsverwaltung (Postgres-RPC statt mehrstufige getrennte Writes).

## P2 – Monetarisierung (erst nach P0/P1)

- [ ] Free/Premium-Funktionsumfang verbindlich definieren, inklusive fairer Limits und Rückerstattungen.
- [ ] Zahlungsanbieter auswählen, Webhooks signieren und idempotent verarbeiten.
- [ ] Premium-Rechte ausschließlich aus verifizierten Zahlungsereignissen ableiten, nicht aus Client-Daten.
- [ ] Buchhaltung, Steuer- und Rechnungsanforderungen, Abo-Verwaltung und Kündigungsprozess prüfen.
- [ ] Preis- und Conversion-Experimente mit Datenschutz, Rate-Limits und Supportabläufen abstimmen.

## Durchgeführte Arbeiten am 12.11.2026

- Öffentliche Bewertungsabfrage auf aggregierte Statistik ohne fremde Nutzer-IDs umgestellt.
- Formular-Doppelsendungen im Arbeitsbereich gesperrt, solange eine Anfrage läuft.
- API-Vertragstests ergänzt: Methoden, JSON-Validierung, Cross-Origin-Verhalten, Fehler.
- Seiten-Metadaten, robots.txt und eine verständliche 404-Seite hinzugefügt.
- CI und Vercel-Commitstatus überprüft.

**Wichtig:** Ein erfolgreicher Build beweist keine Ende-zu-Ende-Funktion und keine vollständige Sicherheitskonformität.
