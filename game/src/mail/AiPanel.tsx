import { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { ym } from './styles';

const PROMPT_BANK: Array<{ keywords: string[]; subject: string; body: string }> = [
  {
    keywords: ['geburtstag', 'gratulier', 'wunsch'],
    subject: 'Alles Gute zum Geburtstag!',
    body: 'Liebe/r …,\n\nich wünsche dir von Herzen alles Gute zu deinem Geburtstag! Möge das neue Jahr voller Freude, Gesundheit und schöner Momente sein. Lass uns bald feiern!\n\nLiebe Grüße',
  },
  {
    keywords: ['treffen', 'kaffee', 'zeit'],
    subject: 'Lust auf Kaffee diese Woche?',
    body: 'Hey,\n\nwann hast du diese Woche mal Zeit für einen Kaffee? Bei mir geht Dienstag oder Donnerstag am besten. Sag einfach Bescheid!\n\nLG',
  },
  {
    keywords: ['krank', 'besserung', 'wünsch'],
    subject: 'Gute Besserung!',
    body: 'Hey,\n\nhab gehört dass du krank bist — das tut mir leid. Ich wünsche dir gute Besserung, ruh dich aus und melde dich, wenn du was brauchst!',
  },
  {
    keywords: ['meeting', 'termin', 'besprechung', 'sitzung'],
    subject: 'Termin-Vorschlag',
    body: 'Hallo,\n\nwollen wir uns diese Woche kurz abstimmen? Mir würde Mittwoch um 14 Uhr oder Donnerstag um 10 Uhr passen. Was funktioniert bei dir am besten?',
  },
  {
    keywords: ['danke', 'bedanken', 'hilfe'],
    subject: 'Danke für deine Hilfe',
    body: 'Hey,\n\nich wollte mich nochmal herzlich bei dir bedanken — ohne deine Hilfe hätte ich das nicht so schnell geschafft. Du bist ein Schatz!\n\nLiebe Grüße',
  },
  {
    keywords: ['urlaub', 'reise', 'ferien'],
    subject: 'Urlaubspläne',
    body: 'Hi,\n\nkurze Frage: hast du eigentlich schon Pläne für den Sommerurlaub? Wir überlegen noch und tauschen gerne Ideen. Wo soll es bei dir hingehen?',
  },
  {
    keywords: ['schule', 'uni', 'klausur', 'hausaufgabe', 'projekt'],
    subject: 'Kurze Frage',
    body: 'Hey,\n\nich sitze gerade an dem Projekt und komme an einer Stelle nicht weiter. Hast du am Wochenende kurz Zeit, da mal drüberzuschauen? Wäre mega!\n\nDanke dir',
  },
  {
    keywords: ['entschuld', 'sorry', 'verzeih'],
    subject: 'Sorry nochmal',
    body: 'Hey,\n\nes tut mir wirklich leid wegen gestern. Das hätte ich besser machen sollen. Können wir das klären?',
  },
  {
    keywords: ['job', 'bewerb', 'stelle', 'arbeit'],
    subject: 'Bewerbung als …',
    body: 'Sehr geehrte/r …,\n\nmit großem Interesse habe ich Ihre Stellenausschreibung gelesen und bewerbe mich hiermit um die ausgeschriebene Position. Meine Erfahrungen und Fähigkeiten passen gut zu Ihrem Anforderungsprofil.\n\nÜber eine Einladung zu einem persönlichen Gespräch freue ich mich sehr.\n\nMit freundlichen Grüßen',
  },
  {
    keywords: ['absage', 'interview', 'vorstellungsgespräch'],
    subject: 'Absage Vorstellungsgespräch',
    body: 'Sehr geehrte/r …,\n\nvielen Dank für die Einladung zum Vorstellungsgespräch. Leider muss ich aus terminlichen Gründen absagen und bitte um Verständnis. Ich hoffe auf eine zukünftige Gelegenheit.\n\nMit freundlichen Grüßen',
  },
  {
    keywords: ['kündig', 'aufhör', 'raus', 'arbeite nicht mehr'],
    subject: 'Kündigung meines Arbeitsverhältnisses',
    body: 'Sehr geehrte/r …,\n\nhiermit kündige ich mein Arbeitsverhältnis fristgerecht zum … . Ich bedanke mich für die gute Zusammenarbeit und stehe für eine ordnungsgemäße Übergabe zur Verfügung.\n\nMit freundlichen Grüßen',
  },
  {
    keywords: ['kino', 'film', 'movie'],
    subject: 'Lust auf Kino am Wochenende?',
    body: 'Hey,\n\nder neue Film läuft seit Donnerstag im Kino — hast du Bock am Wochenende? Samstag um 20 Uhr wäre perfekt!\n\nLass mich wissen, ob es klappt!',
  },
  {
    keywords: ['party', 'feier', 'geburtstagsparty'],
    subject: 'Du bist eingeladen!',
    body: 'Hey,\n\nich lade dich herzlich zu meiner Party am Samstag ein! Ab 19 Uhr bei mir zuhause. Bring gute Laune mit!\n\nIch freue mich auf dich!',
  },
  {
    keywords: ['hochzeit', 'heirat', 'trauung'],
    subject: 'Herzlichen Glückwunsch zur Hochzeit!',
    body: 'Liebe/r …,\n\nzu eurer Hochzeit möchte ich euch von Herzen gratulieren! Möge eure gemeinsame Zukunft voller Liebe, Glück und unvergesslicher Momente sein.\n\nAlles Liebe!',
  },
  {
    keywords: ['baby', 'geboren', 'nachwuchs', 'kind'],
    subject: 'Willkommen kleiner Erdenbürger!',
    body: 'Liebe/r …,\n\nherzlichen Glückwunsch zum Nachwuchs! Möge das kleine Wunder euer Leben mit ganz viel Freude, Liebe und schlaflosen Nächten bereichern. 😄\n\nAlles Gute euch dreien!',
  },
  {
    keywords: ['praktik', 'praktikum', 'einarbeit'],
    subject: 'Praktikumsanfrage',
    body: 'Sehr geehrte/r …,\n\nmein Name ist … und ich studiere … an der Universität …. Ich interessiere mich sehr für ein Praktikum in Ihrem Unternehmen im Zeitraum von … bis … . \n\nWäre es möglich, dass ich mich kurz persönlich vorstelle?\n\nMit freundlichen Grüßen',
  },
  {
    keywords: ['miete', 'wohnung', 'umzug', 'vermieter'],
    subject: 'Anfrage zur Mietminderung',
    body: 'Sehr geehrte/r …,\n\nich wende mich an Sie bezüglich der Mietminderung für die Wohnung in der …-Straße. Aufgrund der anhaltenden Beeinträchtigungen durch … bitte ich um eine angemessene Reduzierung der Miete.\n\nMit freundlichen Grüßen',
  },
  {
    keywords: ['rechnung', 'mahnung', 'zahlung'],
    subject: 'Zahlungserinnerung',
    body: 'Sehr geehrte/r …,\n\nleider haben wir bis heute noch keinen Zahlungseingang für Rechnung Nr. … feststellen können. Wir bitten Sie, den ausstehenden Betrag von … € bis zum … zu begleichen.\n\nMit freundlichen Grüßen',
  },
  {
    keywords: ['beschwer', 'ärger', 'reklamation', 'kaputt'],
    subject: 'Reklamation',
    body: 'Sehr geehrte/r …,\n\nam … habe ich bei Ihnen … bestellt. Leider ist das Produkt defekt / entspricht nicht der Beschreibung. Ich bitte Sie um umgehende Klärung — entweder Ersatzlieferung oder Rückerstattung.\n\nMit freundlichen Grüßen',
  },
  {
    keywords: ['vermieter', 'nachbar', 'laut', 'ruhmöglich'],
    subject: 'Beschwerde über Lärmbelästigung',
    body: 'Sehr geehrte/r …,\n\nich möchte Sie höflich auf die anhaltende Lärmbelästigung durch die Wohnung über mir / neben mir aufmerksam machen. In den letzten Wochen kam es wiederholt zu lautem … auch nach 22 Uhr.\n\nIch bitte Sie, das Gespräch mit dem Mieter zu suchen.\n\nMit freundlichen Grüßen',
  },
  {
    keywords: ['mitarbeit', 'kollege', 'team'],
    subject: 'Kurze Frage zur Zusammenarbeit',
    body: 'Hey,\n\nkurze Frage zum aktuellen Projekt: hast du schon die neuen Mockups gesehen? Ich würde das gerne heute Nachmittag mit dir durchgehen.\n\nWann passt es dir?\n\nDanke und Grüße',
  },
  {
    keywords: ['homeoffice', 'mobiles arbeiten', 'remote'],
    subject: 'Anfrage Homeoffice',
    body: 'Hallo,\n\nich würde gerne regelmäßig an zwei Tagen pro Woche aus dem Homeoffice arbeiten. Damit liessen sich meine Fahrten deutlich reduzieren und ich könnte konzentrierter an Projekten arbeiten.\n\nWäre das grundsätzlich möglich?\n\nBeste Grüße',
  },
  {
    keywords: ['verlänger', 'vertrag', 'abo'],
    subject: 'Vertragsverlängerung anfragen',
    body: 'Sehr geehrte/r …,\n\nunser Vertrag läuft am … aus. Wir würden gerne zu den aktuellen Konditionen verlängern. Bitte teilen Sie mir die nötigen Schritte mit.\n\nMit freundlichen Grüßen',
  },
  {
    keywords: ['konflikt', 'streit', 'problem', 'ärger'],
    subject: 'Wir müssen reden',
    body: 'Hey,\n\nich würde gerne in Ruhe mit dir über das, was letzte Woche passiert ist, sprechen. Ich glaube, es gibt ein Missverständnis und ich möchte das gerne klären.\n\nHast du am Wochenende Zeit für ein Telefonat?\n\nLG',
  },
  {
    keywords: ['lob', 'kompliment', 'anerkennung', 'gut gemacht'],
    subject: 'Wollte dir mal was sagen',
    body: 'Hey,\n\nich wollte dir mal kurz sagen, dass ich richtig beeindruckt bin von dem, was du in letzter Zeit abgeliefert hast. Das war starke Arbeit — danke dafür!\n\nMacht echt Spaß mit dir im Team.',
  },
  {
    keywords: ['witz', 'meme', 'lustig'],
    subject: 'Hast du das gesehen? 😄',
    body: 'Hey,\n\nich bin gerade über das hier gestolpert und musste sofort an dich denken: [Link]\n\nViel Spaß damit! 😂',
  },
  {
    keywords: ['geburtstag vergessen', 'nachträglich', 'verspätet'],
    subject: 'Sorry, dass ich zu spät bin …',
    body: 'Hey,\n\nich bin total erschrocken — ich hab deinen Geburtstag verpasst! Das tut mir wahnsinnig leid, ich hatte so viel um die Ohren. Ich wünsche dir nachträglich alles Gute und lade dich auf einen Kaffee ein, um das wiedergutzumachen.\n\nSorry nochmal!',
  },
  {
    keywords: ['frag', 'hilfe', 'frage'],
    subject: 'Kurze Frage',
    body: 'Hey,\n\nhast du kurz Zeit für eine Frage? Ich bräuchte mal deinen Rat zu …\n\nDanke dir!',
  },
  {
    keywords: ['mitbewohner', 'wg', 'wohnung', 'mieter'],
    subject: 'WG-Zimmer zu vermieten',
    body: 'Hi,\n\nunser Mitbewohner ist ausgezogen und wir suchen ab dem 1. nächsten Monat eine/n Nachfolger/in für das freie Zimmer in unserer 4er-WG. Super Lage, nette Leute, helle Wohnung. Bei Interesse schicke ich gerne mehr Fotos!\n\nLiebe Grüße',
  },
  {
    keywords: ['mitarbeiter', 'kollege', 'anstellung', 'einstellung'],
    subject: 'Rückmeldung zu deiner Bewerbung',
    body: 'Hallo,\n\nvielen Dank für deine Bewerbung. Wir haben uns intensiv mit deinem Profil beschäftigt. Leider müssen wir dir mitteilen, dass wir uns für einen anderen Kandidaten entschieden haben. Wir wünschen dir beruflich alles Gute.\n\nMit freundlichen Grüßen',
  },
  {
    keywords: ['zusage', 'angebot', 'vertrag', 'stelle angenommen'],
    subject: 'Annahme des Jobangebots',
    body: 'Sehr geehrte/r …,\n\nvielen Dank für das tolle Jobangebot. Ich freue mich sehr und nehme die Position mit Wirkung zum … an. Ich freue mich auf die Zusammenarbeit und darauf, das Team kennenzulernen.\n\nMit freundlichen Grüßen',
  },
  {
    keywords: ['verhandl', 'gehalt', 'verdienst'],
    subject: 'Gehaltsverhandlung',
    body: 'Hallo,\n\nvielen Dank für das Angebot. Die Position reizt mich sehr, allerdings liegt das angebotene Gehalt unter meinen Erwartungen. Wäre eine Anpassung auf … € brutto/Jahr möglich? Ich bin überzeugt, dass ich mit meiner Erfahrung einen entsprechenden Mehrwert liefere.\n\nBeste Grüße',
  },
  {
    keywords: ['pizza', 'bestell', 'essen'],
    subject: 'Pizza-Bestellung heute Abend?',
    body: 'Hey,\n\nich würde heute Abend Pizza bestellen — hast du Bock mitzumachen? Gegen 19 Uhr bei dem neuen Italiener um die Ecke. Was willst du drauf?',
  },
  {
    keywords: ['studium', 'bewerb', 'uni', 'master'],
    subject: 'Bewerbung um einen Studienplatz',
    body: 'Sehr geehrte Damen und Herren,\n\nhiermit bewerbe ich mich um einen Studienplatz im Master-Studiengang … an Ihrer Universität zum Wintersemester 20../20.. . Mein abgeschlossenes Bachelor-Studium in … und meine Praxiserfahrungen bilden eine solide Grundlage.\n\nÜber eine Einladung zum Auswahlgespräch freue ich mich.\n\nMit freundlichen Grüßen',
  },
  {
    keywords: ['warnung', 'vorfall', 'sicherheit', 'unfall'],
    subject: 'Vorfall-Meldung',
    body: 'Hallo,\n\nich möchte einen Vorfall vom … melden. Es ging um … . Die beteiligten Personen waren … . Ich bitte dich, das zur Kenntnis zu nehmen und ggf. weitere Schritte einzuleiten.\n\nDanke dir!',
  },
  {
    keywords: ['meldung', 'krank', 'arbeitsunfähig', 'attest'],
    subject: 'Krankmeldung',
    body: 'Hallo,\n\nich bin leider seit gestern krank und kann nicht zur Arbeit kommen. Ein ärztliches Attest reiche ich nach. Bitte informiere das Team.\n\nIch melde mich, sobald es mir besser geht.',
  },
  {
    keywords: ['urlaubsantrag', 'urlaub', 'frei nehmen', 'abwesenheit'],
    subject: 'Urlaubsantrag',
    body: 'Hallo,\n\nich möchte gerne vom … bis zum … Urlaub nehmen. Es sind noch … Tage Resturlaub vorhanden. Bitte gib mir Bescheid, ob das passt.\n\nVielen Dank und Grüße',
  },
  {
    keywords: ['gehaltsabrechnung', 'lohn', 'gehalt', 'abrechnung'],
    subject: 'Frage zur Gehaltsabrechnung',
    body: 'Hallo,\n\nich habe eine Frage zu meiner aktuellen Gehaltsabrechnung. Der Betrag auf Position … weicht von meiner Erwartung ab. Können wir das kurz klären?\n\nVielen Dank im Voraus!',
  },
  {
    keywords: ['präsentation', 'vortrag', 'folien'],
    subject: 'Präsentation für Meeting',
    body: 'Hallo zusammen,\n\nanbei die Folien für unser Meeting am … . Bitte schaut sie euch vorab an, damit wir die Zeit im Meeting produktiv nutzen können. Für Fragen stehe ich vorab zur Verfügung.\n\nBeste Grüße',
  },
  {
    keywords: ['glückwunsch', 'beförder', 'job bekommen', 'bestanden'],
    subject: 'Herzlichen Glückwunsch!',
    body: 'Hey,\n\nich habe gerade erfahren, dass du … — herzlichen Glückwunsch! Das hast du dir absolut verdient. Ich freue mich riesig für dich!\n\nLass uns bald auf deinen Erfolg anstoßen!',
  },
  {
    keywords: ['trennung', 'schluss', 'ende', 'liebeskummer'],
    subject: 'Eine persönliche Nachricht',
    body: 'Hey,\n\nmir ist es wichtig, dass du es von mir erfährst. Ich habe in letzter Zeit viel nachgedacht und bin zu dem Schluss gekommen, dass wir getrennte Wege gehen sollten. Das war keine leichte Entscheidung. Ich wünsche dir alles Gute für deinen weiteren Weg.',
  },
  {
    keywords: ['versöhn', 'wieder gut', 'verzeihen'],
    subject: 'Können wir nochmal von vorne anfangen?',
    body: 'Hey,\n\nich habe in den letzten Tagen viel über uns nachgedacht. Mir ist klar geworden, dass ich einen Fehler gemacht habe und es tut mir aufrichtig leid. Ich vermisse dich und würde mich freuen, wenn wir uns treffen und reden könnten.\n\nBitte gib mir eine Chance.',
  },
  {
    keywords: ['einkauf', 'einkaufen', 'supermarkt'],
    subject: 'Einkaufsliste',
    body: 'Hi,\n\nkönntest du heute bitte einkaufen gehen? Wir brauchen:\n\n- Milch\n- Brot\n- Eier\n- Gemüse (Tomaten, Paprika)\n- Kaffee\n- Klopapier\n\nDanke dir!',
  },
  {
    keywords: ['reinigung', 'putzen', 'sauber'],
    subject: 'Putzplan diese Woche',
    body: 'Hi,\n\nich habe den Putzplan für diese Woche aktualisiert. Du bist am Mittwoch und Samstag dran (Bad + Küche). Sag Bescheid, falls du tauschen willst.\n\nDanke!',
  },
  {
    keywords: ['eltern', 'vater', 'mutter', 'papa', 'mama'],
    subject: 'Wann kommst du zu Besuch?',
    body: 'Hallo Schatz,\n\nwir vermissen dich! Wann hast du Zeit, uns mal wieder zu besuchen? Wir könnten am Wochenende zusammen kochen. Sag einfach Bescheid, wann es passt.\n\nWir freuen uns auf dich!\n\nLiebe Grüße',
  },
  {
    keywords: ['oma', 'opi', 'großeltern', 'oma geburtstag'],
    subject: 'Oma vermisst dich!',
    body: 'Hallo Schatz,\n\nOma lässt ausrichten, dass sie dich vermisst. Wann kommst du das nächste Mal vorbei? Sie hat extra Kuchen gebacken und freut sich riesig auf dich.\n\nEine Umarmung von ihr,\n\nOpa und Oma',
  },
  {
    keywords: ['haustier', 'hund', 'katze', 'tierarzt'],
    subject: 'Termin beim Tierarzt',
    body: 'Hi,\n\nunser Hund / unsere Katze muss nächste Woche zur Impfung. Können wir am … um … Uhr zum Tierarzt? Du müsstest mitkommen, weil ich das Auto brauche.\n\nDanke dir!',
  },
  {
    keywords: ['geburtstagsparty', 'einlad', 'feier'],
    subject: 'Einladung zur Geburtstagsparty',
    body: 'Hey,\n\ndu bist herzlich zu meiner Geburtstagsparty am … eingeladen! Wir starten um … Uhr bei mir zuhause. Bring gute Laune und ggf. eine Kleinigkeit fürs Buffet mit.\n\nIch freue mich auf dich!',
  },
  {
    keywords: ['danke für geschenk', 'bedanken geschenk', 'präsent'],
    subject: 'Danke für das tolle Geschenk!',
    body: 'Hey,\n\nvielen vielen Dank für das wundervolle Geschenk! Es ist genau das, was ich wollte, und ich habe mich riesig gefreut. Du bist ein Schatz!\n\nLiebste Grüße',
  },
  {
    keywords: ['hausaufgaben', 'lernplan', 'prüfungsvorbereitung'],
    subject: 'Lernplan für die Prüfung',
    body: 'Hey,\n\nich mache mir gerade einen Lernplan für die Prüfung in … am … . Hättest du Bock, dass wir uns die Woche vorher ein paar Mal treffen und gemeinsam lernen? Ich finde, zu zweit geht das viel besser als allein.\n\nSag Bescheid!',
  },
  {
    keywords: ['streit klären', 'missverständnis', 'unklar'],
    subject: 'Kurze Klärung',
    body: 'Hey,\n\nich glaube, da ist letzte Woche etwas zwischen uns schief gelaufen. Lass uns das bitte kurz klären, damit kein unnötiger Streit entsteht. Wann hast du kurz Zeit für einen Anruf?\n\nDanke dir!',
  },
  {
    keywords: ['liebesbrief', 'gefühle', 'verliebt'],
    subject: 'Ich muss dir was sagen',
    body: 'Hey,\n\nich war in den letzten Wochen unsicher, ob ich es dir sagen soll, aber ich will ehrlich zu dir sein: ich habe mich in dich verliebt. Nicht als Freund, sondern richtig. Du bist jemand ganz Besonderes und ich wollte dir das endlich sagen.\n\nWas denkst du?',
  },
  {
    keywords: ['reisegruppe', 'mitreisen', 'gemeinsam reisen'],
    subject: 'Reiseplanung',
    body: 'Hey,\n\nkurze Frage: planst du dieses Jahr eigentlich noch eine Reise? Ich überlege, im September nach … zu fliegen und suche noch Mitreisende. Hättest du Lust?\n\nLass uns mal telefonieren!',
  },
  {
    keywords: ['kondolenz', 'beileid', 'verstorben', 'trauer'],
    subject: 'Mein aufrichtiges Beileid',
    body: 'Liebe/r …,\n\nmit tiefer Betroffenheit habe ich vom Tod von … erfahren. Ich kann mir kaum vorstellen, wie es dir jetzt geht. Mein aufrichtiges Beileid und meine Gedanken sind bei dir und deiner Familie.\n\nWenn du irgendetwas brauchst — ich bin für dich da.',
  },
  {
    keywords: ['feedback', 'rückmeldung', 'meinung'],
    subject: 'Würdest du mir kurz Feedback geben?',
    body: 'Hey,\n\nich habe gerade … fertig gemacht und würde gerne wissen, was du davon hältst. Hättest du 5 Minuten, um kurz drüberzuschauen? Deine Meinung ist mir wichtig.\n\nDanke dir!',
  },
  {
    keywords: ['such etwas', 'suche', 'empfehlung'],
    subject: 'Hast du eine Empfehlung?',
    body: 'Hey,\n\nich bin auf der Suche nach … . Hast du damit Erfahrung und kannst mir etwas empfehlen? Ich freue mich über jeden Tipp!\n\nDanke dir!',
  },
  {
    keywords: ['warn', 'vorsicht', 'achtung'],
    subject: 'Wichtige Info',
    body: 'Hi,\n\nich wollte dich kurz auf etwas hinweisen: … . Pass da bitte auf, ich denke das ist wichtig.\n\nSag Bescheid, falls du mehr Infos brauchst.',
  },
  {
    keywords: ['kurs', 'workshop', 'lernen', 'bildung'],
    subject: 'Kurs-Empfehlung',
    body: 'Hi,\n\nich habe gerade einen super Online-Kurs zu … entdeckt. Dauert nur 4 Wochen und kostet 49€. Würde das gern zusammen machen, dann können wir uns gegenseitig motivieren. Lust?\n\nHier der Link: …',
  },
  {
    keywords: ['fehler', 'korrektur', 'falsch'],
    subject: 'Kleiner Fehler in der Mail',
    body: 'Hey,\n\nsorry, kurze Korrektur zu meiner letzten Mail: … . Hatte mich vertippt. Bitte entschuldige die Verwirrung.\n\nDanke für dein Verständnis!',
  },
  {
    keywords: ['eilt', 'dringend', 'wichtig', 'schnell'],
    subject: 'Dringend — bitte zeitnah melden',
    body: 'Hey,\n\nwenn du das liest, melde dich bitte kurz. Es geht um … und ich brauche zeitnah deine Rückmeldung. Danke dir!\n\nLG',
  },
  {
    keywords: ['abendessen', 'kochen', 'essen gehen'],
    subject: 'Gemeinsames Abendessen?',
    body: 'Hey,\n\nwas hast du morgen Abend vor? Lass uns zusammen was kochen oder essen gehen! Ich hätte Lust auf … . Sag Bescheid, wann es bei dir passt!',
  },
  {
    keywords: ['beleidigt', 'verletzt', 'traurig'],
    subject: 'Bin gerade etwas geknickt',
    body: 'Hey,\n\nich bin gerade ein bisschen traurig wegen gestern. Ich würde das gerne in Ruhe mit dir besprechen. Hast du morgen Abend kurz Zeit für einen Spaziergang?\n\nLiebe Grüße',
  },
  {
    keywords: ['wlan-passwort', 'passwort', 'zugang', 'router'],
    subject: 'WLAN-Zugang',
    body: 'Hallo,\n\ndu hast nach den WLAN-Zugangsdaten gefragt:\n\nNetzwerk: …\nPasswort: …\n\nViel Spaß!',
  },
  {
    keywords: ['rauswurf', 'kündigung wohnung', 'wohnung verloren'],
    subject: 'Wichtige Info zur Wohnung',
    body: 'Hallo,\n\nunser Vermieter hat uns mitgeteilt, dass … . Wir müssen daher leider bis spätestens … ausziehen. Lass uns kurz besprechen, wie wir weitermachen.\n\nDanke für dein Verständnis.',
  },
  {
    keywords: ['handyrechnung', 'mobilfunk', 'tarif'],
    subject: 'Handytarif-Wechsel',
    body: 'Hallo,\n\nich überlege, von meinem aktuellen Anbieter zu wechseln. Hast du schon mal mit … Erfahrungen gemacht? Die haben gerade ein gutes Angebot mit 50GB für 14,99€/Monat. Lohnt sich das?\n\nDanke für deinen Tipp!',
  },
  {
    keywords: ['erinner', 'denk dran', 'vergiss nicht'],
    subject: 'Kleine Erinnerung',
    body: 'Hey,\n\nnur eine kleine Erinnerung: morgen ist … und wir hatten ausgemacht, dass … . Bitte nicht vergessen!\n\nDanke dir!',
  },
  {
    keywords: ['aufgaben', 'agenda', 'themen', 'todos'],
    subject: 'Agenda für unser Treffen',
    body: 'Hallo zusammen,\n\nfür unser Treffen am … schlage ich folgende Agenda vor:\n\n1. Stand der offenen Punkte\n2. Aktuelle Themen\n3. Nächste Schritte\n4. Verschiedenes\n\nFalls ihr weitere Punkte habt, gerne ergänzen.\n\nBeste Grüße',
  },
];

const FALLBACK = {
  subject: 'Kurze Nachricht',
  body: 'Hallo,\n\nich wollte dir kurz schreiben. Hast du heute Abend Zeit für einen kurzen Austausch? Wäre super!\n\nLiebe Grüße',
};

type Props = {
  onApply: (subj: string, body: string) => void;
  onClose: () => void;
};

export default function AiPanel({ onApply, onClose }: Props) {
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);

  const generate = () => {
    if (!prompt.trim()) return;
    setBusy(true);
    setResult(null);
    setTimeout(() => {
      const lower = prompt.toLowerCase();
      const hit = PROMPT_BANK.find(item => item.keywords.some(k => lower.includes(k)));
      setResult(hit ? { subject: hit.subject, body: hit.body } : FALLBACK);
      setBusy(false);
    }, 700);
  };

  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        backgroundColor: ym.surface,
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        boxShadow: '0 -8px 24px rgba(0,0,0,0.15)',
        padding: 16,
        zIndex: 30,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ background: ym.ai, padding: 6, borderRadius: 8, display: 'flex' }}>
          <Sparkles size={16} color="white" />
        </div>
        <div style={{ fontWeight: 600, color: ym.text, flex: 1 }}>KI-Assistent</div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
          <X size={20} color={ym.textMuted} />
        </button>
      </div>

      <div style={{ fontSize: 13, color: ym.textMuted }}>
        Worüber soll die Mail gehen? Ich schreibe Betreff und Text für dich.
      </div>

      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder='z.B. „Geburtstag gratulieren" oder „Kaffee diese Woche"'
        style={{
          width: '100%', padding: '10px 12px',
          border: `1px solid ${ym.border}`, borderRadius: 10,
          fontSize: 15, outline: 'none', boxSizing: 'border-box',
          background: ym.bg, color: ym.text,
        }}
      />

            <button
              onClick={generate}
              disabled={!prompt.trim() || busy}
              style={{
                padding: '10px 16px',
                background: ym.ai,
                color: ym.white,
                border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 600,
                cursor: prompt.trim() && !busy ? 'pointer' : 'not-allowed',
                opacity: prompt.trim() && !busy ? 1 : 0.6,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
        {busy ? <Loader2 size={16} className="ym-spin" /> : <Sparkles size={16} />}
        {busy ? 'Generiere…' : '✨ Generieren'}
      </button>

      {result && (
        <div style={{ background: ym.aiSoft, borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 12, color: ym.ai, fontWeight: 600, marginBottom: 4 }}>VORSCHLAG</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: ym.text, marginBottom: 6 }}>{result.subject}</div>
          <div style={{ fontSize: 14, color: ym.text, whiteSpace: 'pre-wrap', marginBottom: 10 }}>{result.body}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onApply(result.subject, result.body)}
              style={{ flex: 1, padding: '8px 12px', background: ym.ai, color: ym.white, border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Übernehmen
            </button>
            <button
              onClick={generate}
              style={{ padding: '8px 12px', background: ym.surface, color: ym.ai, border: `1px solid ${ym.ai}`, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Nochmal
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes ym-spin { from { transform: rotate(0); } to { transform: rotate(360deg); } } .ym-spin { animation: ym-spin 0.8s linear infinite; }`}</style>
    </div>
  );
}
