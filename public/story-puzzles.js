// Eigenständige Szenen nach allgemeinen Rätselprinzipien aus der Tanelorn-Sammlung.
// Öffentliche Bibliotheksinhalte; Lösungen sind in Live-Runden nur in der DM-Ansicht sichtbar.
export const STORY_PUZZLES = [
  {
    id: 'archive-numbers', name: 'Das Archiv der ungeschriebenen Zahlen', kind: 'Wortspiel', icon: '✎',
    desc: 'Zwei Messingmasken sprechen eine andere Sprache als der Rechenmeister.',
    difficulty: 'Mittel', duration: '5–10 Minuten',
    task: 'Im verlassenen Schreibhaus steht ein Lesepult mit einer sprechenden Messingmaske. Auf „sechs“ antwortet sie „fünf“, auf „zehn“ folgt „vier“ und auf „zwanzig“ folgt „sieben“.\nEine zweite Maske an der Archivtür erwacht: „Meine Schwester hat euch unsere Sprache gezeigt. Welche Antwort gehört zu dreißig?“\nNach der richtigen Antwort öffnet sich das erste Schloss. Für das zweite verlangt die Maske: „Nennt jetzt eine Zahl, der meine Schwester mit genau derselben Zahl antworten würde.“',
    hint: 'Ein Schreiber würde die Zahlen anders untersuchen als ein Rechenmeister.',
    solution: 'Zuerst sieben: „dreißig“ hat sieben Buchstaben. Danach vier: Das Wort „vier“ besteht selbst aus vier Buchstaben. Beide Antworten sind nötig.',
    materials: 'Die drei Beispielpaare als Handout; Papier und Stift.',
    campaign: 'Eine versiegelte Bibliothek, ein Schreibhaus oder die Aufnahmeprüfung einer Magierakademie.'
  },
  {
    id: 'folded-road', name: 'Der zusammengefaltete Weg', kind: 'Querdenken', icon: '⌁',
    desc: 'Eine ganze Straße soll in einen Briefumschlag passen.',
    difficulty: 'Leicht', duration: '5–10 Minuten',
    task: 'Eine Kartografin bietet euch einen Handel an: „Bringt mir die Straße vom Leuchtturm zur alten Mühle. Sie muss vollständig sein, trocken bleiben und in diesen Briefumschlag passen. Ihr dürft unterwegs keinen einzigen Pflasterstein entfernen.“\nAuf ihrem Tisch liegen Zeichenpapier, Kohle, Bindfaden und eine Schere. Was gebt ihr ihr?',
    hint: 'Die Straße muss erkennbar sein, aber niemand muss darauf laufen können.',
    solution: 'Eine gezeichnete Karte mit der vollständigen Straßenverbindung. Zusammengefaltet passt sie in den Umschlag. Auch ein passender vorhandener Kartenausschnitt gilt.',
    materials: 'Papier, Stift und optional ein Briefumschlag.',
    campaign: 'Ein Auftrag der Kartografengilde oder ein Handel mit einer eigenwilligen Fee.'
  },
  {
    id: 'offended-gorge', name: 'Die beleidigte Schlucht', kind: 'Beobachtung', icon: '≋',
    desc: 'Ein steinerner Wächter hält ein Echo für seinen Schüler.',
    difficulty: 'Leicht', duration: '5–10 Minuten',
    task: 'In einer Schlucht bewacht eine steinerne Fratze einen Steg. Sie behauptet: „Mein unsichtbarer Schüler übernimmt jedes neue Losungswort sofort. Doch stets lässt er mich zuerst sprechen. Zeigt mir, ob er auch selbst ein Gespräch beginnen kann.“\nAls ihr „Hallo!“ ruft, kommt kurz darauf „Hallo!“ zurück. Die Fratze hält ihren Schüler für ein eigenständiges Wesen. Mit welchem einfachen Versuch könnt ihr ihre Behauptung prüfen?',
    hint: 'Ein eigenständiger Gesprächspartner müsste auch einmal selbst anfangen können.',
    solution: 'Alle, auch die Fratze, schweigen und warten. Ohne vorausgehenden Ruf folgt keine Antwort: Der vermeintliche Schüler ist ein Echo. Im Spiel akzeptiert die Fratze diesen Versuch; Schweigen allein wäre außerhalb dieser Szene kein strenger Beweis.',
    materials: 'Keine; die Spielleitung wiederholt Rufe mit kurzer Verzögerung.',
    campaign: 'Ein Bergpass, eine sprechende Brücke oder die Prüfung eines etwas eitlen Erdgeists.'
  },
  {
    id: 'uninvited-guest', name: 'Der Gast ohne Einladung', kind: 'Wortspiel', icon: '◷',
    desc: 'Ein unsichtbarer Gast verändert jedes Wiedersehen.',
    difficulty: 'Leicht', duration: '5–10 Minuten',
    task: 'Ein Uhrmacher hat seine letzte Arbeit in einer Schatulle verschlossen. Auf dem Deckel steht: „Der gesuchte Gast kommt zu jeder Feier, steht auf keiner Gästeliste und bleibt auf keinem Gruppenbild sichtbar. Trotzdem sorgt er dafür, dass dasselbe Gruppenbild beim nächsten Treffen anders aussieht.“\nWelches Wort öffnet die Schatulle?',
    hint: 'Achtet auf die Menschen auf den Bildern.',
    solution: 'Zeit: Sie lässt die Menschen zwischen den Treffen altern. „Altern“ oder eine entsprechend begründete Antwort ebenfalls gelten lassen.',
    materials: 'Die Inschrift; optional zwei Porträts derselben Menschen in unterschiedlichem Alter.',
    campaign: 'Das Erbe eines Uhrmachers oder die Werkstatt einer Chronomantin.'
  },
  {
    id: 'twelve-compartments', name: 'Die zwölf Fächer', kind: 'Reihenfolge', icon: '▦',
    desc: 'Ein botanischer Schrank folgt einer vertrauten Ordnung.',
    difficulty: 'Leicht', duration: '5–10 Minuten',
    task: 'Ein botanischer Schrank besitzt zwölf Fächer. Ihre Beschriftungen lauten:\nJ – F – M – A – M – J – J – A – S – O – ? – ?\nDie Gärtnerin sagt: „Meine Ordnung beginnt mitten im Winter. Setzt die beiden fehlenden Zeichen ein.“',
    hint: 'Die Pflanzen werden nach ihrem Pflegezeitpunkt sortiert.',
    solution: 'N und D, für November und Dezember. Die Zeichen sind die Anfangsbuchstaben der zwölf Monate. Bei einem eigenen Weltkalender die ganze Reihe entsprechend anpassen.',
    materials: 'Die Buchstabenreihe als Handout.',
    campaign: 'Ein Gewächshaus oder Kräuterlager. Die Aufgabe setzt deutsche Monatsnamen voraus.'
  },
  {
    id: 'wind-birds', name: 'Die vier Windvögel', kind: 'Reihenfolge', icon: '♫',
    desc: 'Vier bronzene Vögel öffnen mit einer Tonfolge eine Luke.',
    difficulty: 'Mittel', duration: '5–10 Minuten',
    task: 'Vier bronzene Vögel sitzen auf einem Geländer. Drückt man ihre Schwänze herunter, pfeifen sie: Rabe = tiefster Ton, Reiher = zweittiefster Ton, Falke = zweithöchster Ton, Zaunkönig = höchster Ton.\nAn einer verriegelten Luke steht: „Beginne beim kleinsten Sänger. Falle bis ganz nach unten. Steige eine Stufe. Kehre zum Anfang zurück.“\nWelche vier Vögel müssen nacheinander pfeifen?',
    hint: '„Oben“ und „unten“ beziehen sich auf die Tonhöhe. Der kleinste Vogel ist der Zaunkönig.',
    solution: 'Zaunkönig → Rabe → Reiher → Zaunkönig: höchster Ton, tiefster Ton, eine Tonstufe höher, zurück zum Anfangston.',
    materials: 'Die vier Vogelnamen mit Tonhöhen. Tatsächliche Klänge sind optional.',
    campaign: 'Ein Lufttempel, eine mechanische Voliere oder ein verlassener Glockenturm.'
  },
  {
    id: 'night-bowls', name: 'Die Schalen der Nacht', kind: 'Logik', icon: '☾',
    desc: 'Zwei Schalen sollen im Dunkeln gleich viele Sonnen tragen.',
    difficulty: 'Schwer', duration: '10–20 Minuten',
    task: 'In einem vollkommen dunklen Raum liegen zwanzig flache Plättchen. Jedes trägt auf einer Seite eine Sonne, auf der anderen einen Mond. Genau sieben Sonnen zeigen nach oben.\nIhr könnt die Seiten weder sehen noch ertasten. Ihr dürft Plättchen abzählen, auf zwei Schalen verteilen und umdrehen.\nWie erreicht ihr sicher, dass auf beiden Schalen gleich viele Sonnen nach oben zeigen? Die Schalen müssen nicht gleich viele Plättchen enthalten.',
    hint: 'Beginnt damit, genau sieben Plättchen abzutrennen.',
    solution: 'Beliebige sieben Plättchen abtrennen und jedes davon einmal umdrehen. Enthielt diese Gruppe vorher x Sonnen, bleiben in der anderen Gruppe 7 − x Sonnen. Die kleine Gruppe hatte 7 − x Monde; nach dem Umdrehen hat auch sie 7 − x Sonnen.',
    materials: 'Optional zwanzig Münzen oder doppelseitige Papierplättchen und zwei Schalen.',
    campaign: 'Eine Mondpriesterprüfung oder ein Schatzgewölbe ohne Licht.'
  },
  {
    id: 'alchemist-order', name: 'Die Bestellung des Alchemisten', kind: 'Logik', icon: '⚗',
    desc: 'Drei Farben und drei Inhalte ergeben eine eindeutige Bestellung.',
    difficulty: 'Mittel', duration: '5–10 Minuten',
    task: 'Drei Flaschen stehen links, mittig und rechts. Jede hat eine andere Farbe — rot, blau oder grün — und enthält etwas anderes: Heiltrank, Schlaftrank oder Wasser.\nAuf dem Bestellzettel steht:\n• Die grüne Flasche steht ganz rechts.\n• Die rote Flasche enthält den Schlaftrank.\n• Der Heiltrank steht unmittelbar links neben der grünen Flasche.\nWelche Flasche enthält das Wasser?',
    hint: 'Bestimmt zuerst den Platz des Heiltranks. Welche Farbe kann diese Flasche nicht haben?',
    solution: 'Die grüne Flasche rechts enthält Wasser. Der Heiltrank steht mittig. Er kann nicht in Rot sein, da Rot den Schlaftrank enthält; also ist die mittlere Flasche blau. Links steht Rot mit Schlaftrank, rechts bleibt Grün mit Wasser.',
    materials: 'Drei Flaschenkarten in Rot, Blau und Grün.',
    campaign: 'Ein Alchemistenladen oder das Vorratsregal einer Heilerin.'
  },
  {
    id: 'three-suns', name: 'Das Fenster der drei Sonnen', kind: 'Experiment', icon: '☼',
    desc: 'Drei Lichtfarben und ein gelbes Sonnensiegel.',
    difficulty: 'Leicht', duration: '5–10 Minuten',
    task: 'In einer Sternwarte beleuchten drei magische Lampen dieselbe weiße Wand: eine rot, eine grün und eine blau. Jede lässt sich einzeln einschalten.\nDaneben befindet sich ein versiegeltes Sonnenzeichen. Eine Notiz erklärt: „Unsere Farben sind Licht. Rot und Grün ergeben gemeinsam Gelb. Alle drei Lampen ergeben Weiß.“\nDas Siegel verlangt ausdrücklich gelbes Licht. Welche Lampen schaltet ihr ein?',
    hint: 'Die dritte Lampe verbessert das Ergebnis nicht.',
    solution: 'Rot und Grün einschalten, Blau ausschalten. Es geht um die additive Mischung von Licht, nicht um Malfarben.',
    materials: 'Drei beschriftete Lampenkarten; echte Lampen sind nicht nötig.',
    campaign: 'Eine Sternwarte oder ein Heiligtum der Sonne.'
  },
  {
    id: 'ferryman-calendar', name: 'Der Kalender des Fährmanns', kind: 'Logik', icon: '▤',
    desc: 'Eine Fahrkarte nennt einen ungewöhnlichen Abfahrtstag.',
    difficulty: 'Leicht', duration: '5–10 Minuten',
    task: 'Ein Fährmann benutzt einen gewöhnlichen Kalender mit zwölf Monaten. Es ist ausdrücklich kein Schaltjahr. Auf seiner Fahrkarte steht: „Abfahrt am 32. Tag des Jahres.“\nAm Anleger gibt es zwei beschriftete Drehräder: eines für den Tag im Monat und eines für den Monat. Welches Datum stellt ihr ein?',
    hint: 'Der Januar hat 31 Tage.',
    solution: '1. Februar. Nach den 31 Januartagen folgt als 32. Jahrestag der erste Februartag.',
    materials: 'Die Fahrkarte; optional ein Kalender.',
    campaign: 'Eine Geisterfähre oder ein zeitversetzter Hafen. Die Welt muss den üblichen Kalender verwenden.'
  }
];

export const STORY_BY_ID = Object.fromEntries(STORY_PUZZLES.map(p => [p.id, p]));
