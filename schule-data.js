/* Weinschule – Inhalte. Bei 'mc' steht die richtige Antwort immer an erster Stelle (wird beim Anzeigen gemischt).
   Typen: mc (Auswahl), pair (4 Paare zuordnen), temp (Temperatur per Regler, ok = [von, bis] °C). */
const RANKS = [
  { name: 'Lehrling', min: 0 },
  { name: 'Kellerknecht', min: 200 },
  { name: 'Kellermeister', min: 600 },
  { name: 'Sommelier', min: 1200 }
];

const SCHOOL = [
  { id: 'rebsorten', title: 'Rebsorten', sub: 'Pinot, Mencía, Garnacha & Co.', color: '#8C1D47', lessons: [
    { id: 'reb-1', title: 'Rote Klassiker', qs: [
      { t: 'mc', q: 'Welche Rebsorte heißt in Deutschland Spätburgunder?', a: ['Pinot Noir', 'Cabernet Sauvignon', 'Merlot', 'Syrah'], x: 'Spätburgunder ist Pinot Noir. Seine Heimat ist das Burgund.' },
      { t: 'mc', q: 'Welche Rebsorte ist das Aushängeschild Argentiniens?', a: ['Malbec', 'Carmenère', 'Zinfandel', 'Pinotage'], x: 'Malbec stammt aus Südwestfrankreich (Cahors), richtig groß wurde er in Mendoza.' },
      { t: 'mc', q: 'Welche dieser Trauben bringt typischerweise am meisten Tannin?', a: ['Cabernet Sauvignon', 'Pinot Noir', 'Gamay', 'Garnacha'], x: 'Kleine, dickschalige Beeren – viel Gerbstoff. Pinot Noir und Gamay sind dünnschalig.' },
      { t: 'pair', q: 'Welche Rebsorte gehört wohin?', pairs: [['Pinot Noir', 'Burgund'], ['Cabernet Sauvignon', 'Bordeaux'], ['Tempranillo', 'Rioja'], ['Nebbiolo', 'Piemont']], x: 'Die vier klassischen Heimaten. Nebbiolo ist die Traube von Barolo und Barbaresco.' }
    ] },
    { id: 'reb-2', title: 'Spaniens Rote', qs: [
      { t: 'mc', q: 'Mencía ist die rote Hauptsorte im …', a: ['Bierzo', 'Priorat', 'Jerez', 'Rías Baixas'], x: 'Mencía prägt das Bierzo und die Ribeira Sacra – frische rote Frucht, feine Würze.' },
      { t: 'mc', q: 'Wie heißt Garnacha in Frankreich?', a: ['Grenache', 'Carignan', 'Cinsault', 'Mourvèdre'], x: 'Garnacha = Grenache. In Südfrankreich ist sie die Basis vieler Cuvées, z. B. in Châteauneuf-du-Pape.' },
      { t: 'mc', q: 'Welche Rebsorte prägt die Rioja?', a: ['Tempranillo', 'Mencía', 'Monastrell', 'Bobal'], x: 'Tempranillo ist das Rückgrat der Rioja, oft ergänzt durch Garnacha – so auch beim Lindes.' },
      { t: 'mc', q: 'Alicante Bouschet ist eine Färbertraube. Was heißt das?', a: ['Auch ihr Fruchtfleisch ist rot', 'Sie wird nur für Rosé genutzt', 'Sie färbt die Fässer', 'Sie wächst nur in Alicante'], x: 'Bei den meisten roten Trauben ist nur die Schale rot. Färbertrauben haben auch rotes Fruchtfleisch.' }
    ] },
    { id: 'reb-3', title: 'Weiße Klassiker', qs: [
      { t: 'mc', q: 'Aus welcher Rebsorte ist Chablis?', a: ['Chardonnay', 'Sauvignon Blanc', 'Riesling', 'Chenin Blanc'], x: 'Chablis ist immer Chardonnay – hier besonders straff und mineralisch.' },
      { t: 'mc', q: 'Godello kommt vor allem aus …', a: ['Nordwestspanien', 'Südtirol', 'dem Elsass', 'der Pfalz'], x: 'Godello wächst in Valdeorras, Bierzo und Galicien – fast ausgestorben, heute ein Star.' },
      { t: 'mc', q: 'Aus welcher Traube wird Fino Sherry gemacht?', a: ['Palomino Fino', 'Airén', 'Verdejo', 'Albariño'], x: 'Palomino Fino ist die Sherry-Traube. Barbadillos Patinegro ist ein stiller Wein aus genau dieser Traube.' },
      { t: 'pair', q: 'Welcher Duft ist typisch?', pairs: [['Sauvignon Blanc', 'Stachelbeere, Gras'], ['Riesling', 'Pfirsich, Zitrus'], ['Gewürztraminer', 'Rose, Litschi'], ['Chardonnay (Holz)', 'Butter, Vanille']], x: 'Die Butter- und Vanilletöne beim Chardonnay kommen vom Holzfass und vom biologischen Säureabbau.' }
    ] },
    { id: 'reb-4', title: 'Namen & Familien', qs: [
      { t: 'mc', q: 'Grauburgunder heißt international …', a: ['Pinot Gris', 'Pinot Blanc', 'Grüner Veltliner', 'Silvaner'], x: 'Grauburgunder = Pinot Gris (in Italien Pinot Grigio). Weißburgunder ist Pinot Blanc.' },
      { t: 'mc', q: 'Blaufränkisch heißt in Deutschland …', a: ['Lemberger', 'Trollinger', 'Dornfelder', 'Portugieser'], x: 'In Württemberg heißt er Lemberger. Der Kirchweingarten von Dorli Muhr ist reiner Blaufränkisch.' },
      { t: 'mc', q: 'Zweigelt ist eine Kreuzung aus …', a: ['Blaufränkisch und St. Laurent', 'Pinot Noir und Gamay', 'Merlot und Cabernet', 'Riesling und Silvaner'], x: 'Gezüchtet 1922 von Fritz Zweigelt – heute Österreichs meistgepflanzte rote Sorte.' },
      { t: 'mc', q: 'Shiraz und Syrah sind …', a: ['dieselbe Rebsorte', 'Eltern und Kind', 'zwei verschiedene Sorten', 'die rote und die weiße Variante'], x: 'Gleiche Traube, zwei Namen: Syrah an der Rhône, Shiraz vor allem in Australien.' }
    ] },
    { id: 'reb-5', title: 'Wer bin ich?', qs: [
      { t: 'mc', q: 'Hell in der Farbe, Kirsche, Erdbeere, Waldboden, feines Tannin – welche Rebsorte?', a: ['Pinot Noir', 'Malbec', 'Syrah', 'Cabernet Sauvignon'], x: 'Das klassische Pinot-Bild: transparent, rotfruchtig, erdig, zart.' },
      { t: 'mc', q: 'Tiefdunkel, Pflaume, Veilchen, samtig – typisch für …', a: ['Malbec', 'Gamay', 'Pinot Noir', 'Trollinger'], x: 'Veilchen und dunkle Pflaume sind die Malbec-Signatur.' },
      { t: 'mc', q: 'Schwarze Johannisbeere, Zeder, ein Hauch Paprika, kräftig – typisch für …', a: ['Cabernet Sauvignon', 'Garnacha', 'Pinot Noir', 'Zweigelt'], x: 'Cassis und Zeder sind Cabernet pur, die grüne Paprika-Note kommt aus der Traube selbst.' },
      { t: 'mc', q: 'Pfeffer, Brombeere, Rauch, schwarze Oliven – typisch für …', a: ['Syrah', 'Merlot', 'Pinot Noir', 'Gamay'], x: 'Schwarzer Pfeffer ist das Erkennungszeichen von Syrah, besonders aus kühleren Lagen.' }
    ] }
  ] },

  { id: 'regionen', title: 'Regionen', sub: 'Woher deine Weine kommen', color: '#C99A55', lessons: [
    { id: 'reg-1', title: 'Nordwestspanien', regions: ['ribeira-sacra', 'bierzo'], qs: [
      { t: 'mc', q: 'Was ist besonders an den Weinbergen der Ribeira Sacra?', a: ['Extrem steile Terrassen über Flüssen', 'Flache Kalkebenen', 'Vulkanboden am Meer', 'Weinberge unter Meereshöhe'], x: 'Viele Lagen sind so steil, dass alles von Hand gelesen wird – Weinbau als Kraftsport.' },
      { t: 'mc', q: 'Welche Flusstäler prägen die Ribeira Sacra?', a: ['Sil und Miño', 'Duero und Ebro', 'Rhône und Saône', 'Mosel und Saar'], x: 'Die Terrassen ziehen sich die Schluchten von Sil und Miño hinauf.' },
      { t: 'mc', q: 'In welcher spanischen Region liegt das Bierzo?', a: ['Kastilien und León', 'Katalonien', 'Andalusien', 'Valencia'], x: 'Bierzo gehört zur Provinz León, direkt an der Grenze zu Galicien.' },
      { t: 'mc', q: 'Welcher Boden prägt viele Weine aus Bierzo und Ribeira Sacra?', a: ['Schiefer', 'Kreide', 'Sand', 'Löss'], x: 'Schiefer (dazu Granit und Lehm) gibt den Mencías ihre kühle, steinige Würze.' }
    ] },
    { id: 'reg-2', title: 'Rioja, Navarra, Jerez, Teneriffa', regions: ['rioja', 'navarra', 'jerez', 'teneriffa'], qs: [
      { t: 'mc', q: 'Rioja Alavesa liegt im …', a: ['Baskenland', 'Katalonien', 'Aragón', 'Andalusien'], x: 'Die Alavesa gehört zur baskischen Provinz Álava – kühler und höher als der Rest der Rioja.' },
      { t: 'mc', q: 'Was gibt Fino Sherry seinen typischen Geschmack?', a: ['Eine Hefeschicht (Flor) auf dem Wein', 'Zugesetzter Zucker', 'Rauch aus dem Fass', 'Lange Gärung auf den Schalen'], x: 'Die Flor schützt den Wein vor Luft und gibt die typischen Noten von Mandel und Brotteig.' },
      { t: 'mc', q: 'Worauf wachsen viele Reben auf Teneriffa?', a: ['Vulkanboden', 'Kreide', 'Schiefer', 'Muschelkalk'], x: 'Vulkanasche und Lava geben den Weinen der Kanaren ihre rauchige, salzige Art.' },
      { t: 'mc', q: 'Warum gibt es auf den Kanaren so viele uralte, wurzelechte Reben?', a: ['Die Reblaus kam nie dorthin', 'Es gibt dort keinen Winter', 'Die Reben werden jedes Jahr ersetzt', 'Sie wachsen unter Glas'], x: 'Die Reblaus hat im 19. Jh. fast ganz Europa vernichtet – die Kanaren blieben verschont.' }
    ] },
    { id: 'reg-3', title: 'Deutschland & Österreich', regions: ['pfalz', 'rheingau', 'carnuntum'], qs: [
      { t: 'mc', q: 'Was bedeutet „GG“ auf deutschen Etiketten?', a: ['Großes Gewächs – trockener Wein aus Spitzenlage', 'Gutes Gewächs', 'Gold-Gewinner', 'Grand Grand Cru'], x: 'GG ist die Spitze beim VDP: trocken, aus einer „Großen Lage“ – wie der Kalmit von Kranz.' },
      { t: 'mc', q: 'Der Rheingau ist vor allem berühmt für …', a: ['Riesling', 'Dornfelder', 'Müller-Thurgau', 'Silvaner'], x: 'Riesling macht den Großteil der Rheingauer Rebfläche aus.' },
      { t: 'mc', q: 'Wo liegt Carnuntum?', a: ['Östlich von Wien Richtung Bratislava', 'In der Steiermark', 'Am Bodensee', 'In Südtirol'], x: 'Zwischen Donau und Leithagebirge – Heimat von Dorli Muhr und starkem Blaufränkisch.' },
      { t: 'mc', q: 'Die Pfalz ist …', a: ['eines der größten Weinbaugebiete Deutschlands', 'das kleinste Gebiet Deutschlands', 'nur für Süßwein bekannt', 'ein Teil von Franken'], x: 'Die Pfalz ist nach Rheinhessen das zweitgrößte Anbaugebiet.' }
    ] },
    { id: 'reg-4', title: 'Frankreich', regions: ['chablis', 'corbieres'], qs: [
      { t: 'mc', q: 'Chablis gehört zu welcher Region?', a: ['Burgund', 'Bordeaux', 'Loire', 'Elsass'], x: 'Chablis ist der nördlichste Teil des Burgunds.' },
      { t: 'mc', q: 'Welcher Boden ist typisch für Chablis?', a: ['Kimmeridge-Kalk mit Austernfossilien', 'Vulkangestein', 'Granit', 'Sand'], x: 'Uralter Meeresboden – daher die Austern-Kombination, die man zu Chablis immer empfiehlt.' },
      { t: 'mc', q: 'Corbières liegt …', a: ['im Languedoc in Südfrankreich', 'im Burgund', 'im Elsass', 'in Bordeaux'], x: 'Wild, warm, garrigue-duftend – zwischen Narbonne und Carcassonne.' },
      { t: 'mc', q: 'Was ist ein Premier Cru in Chablis?', a: ['Eine eingestufte, bessere Lage', 'Der erste Wein des Jahrgangs', 'Wein aus der ersten Pressung', 'Ein Rosé'], x: 'Reihenfolge: Petit Chablis, Chablis, Premier Cru, Grand Cru.' }
    ] },
    { id: 'reg-5', title: 'Neue Welt', regions: ['mendoza', 'sonoma'], qs: [
      { t: 'mc', q: 'Warum ist die Höhe der Weinberge in Mendoza ein Vorteil?', a: ['Kühle Nächte halten die Säure frisch', 'Es regnet mehr', 'Es gibt weniger Sonne', 'Es gibt nie Frost'], x: 'Heiße Tage, kalte Nächte: reife Frucht und trotzdem Frische.' },
      { t: 'mc', q: 'Mendoza liegt am Fuß der …', a: ['Anden', 'Rocky Mountains', 'Alpen', 'Pyrenäen'], x: 'Bewässert wird mit Schmelzwasser aus den Anden – sonst wäre es dort fast Wüste.' },
      { t: 'mc', q: 'Sonoma liegt in …', a: ['Kalifornien', 'Oregon', 'Chile', 'Australien'], x: 'Sonoma ist der Nachbar des Napa Valley nördlich von San Francisco.' },
      { t: 'mc', q: 'Was kühlt die Weinberge in Sonoma?', a: ['Nebel und Wind vom Pazifik', 'Gletscher', 'Ein großer See', 'Schnee im Sommer'], x: 'Der Morgennebel vom Pazifik bremst die Hitze – gut für Säure und Eleganz.' }
    ] }
  ] },

  { id: 'struktur', title: 'Struktur', sub: 'Säure, Tannin, Körper, Abgang', color: '#5E8A4C', lessons: [
    { id: 'str-1', title: 'Säure', qs: [
      { t: 'mc', q: 'Woran merkst du viel Säure?', a: ['Das Wasser läuft im Mund zusammen', 'Der Mund wird pelzig', 'Es brennt im Hals', 'Der Wein schmeckt süß'], x: 'Säure regt den Speichel an. Pelzig ist Tannin, Brennen ist Alkohol.' },
      { t: 'mc', q: 'Welcher dieser Weine hat typischerweise die meiste Säure?', a: ['Riesling', 'Viognier', 'Garnacha', 'Pinotage'], x: 'Riesling hält seine Säure auch bei voller Reife – darum altert er so gut.' },
      { t: 'mc', q: 'Was passiert mit der Säure in heißen Jahren?', a: ['Sie sinkt eher', 'Sie steigt stark', 'Sie bleibt immer gleich', 'Sie wird zu Tannin'], x: 'Hitze baut Säure in den Trauben ab – die Weine werden runder, aber oft weniger frisch.' },
      { t: 'mc', q: 'Säure im Wein wirkt am Tisch wie …', a: ['ein Spritzer Zitrone', 'ein Löffel Zucker', 'ein Stück Butter', 'eine Prise Salz'], x: 'Sie macht Essen frischer und Lust auf den nächsten Bissen.' }
    ] },
    { id: 'str-2', title: 'Tannin', qs: [
      { t: 'mc', q: 'Woher kommt Tannin vor allem?', a: ['Aus Schalen, Kernen und Holz', 'Aus der Säure', 'Aus dem Alkohol', 'Aus der Hefe'], x: 'Je länger der Most auf den Schalen liegt und je mehr neues Holz, desto mehr Tannin.' },
      { t: 'mc', q: 'Warum haben Weißweine meist kaum Tannin?', a: ['Sie gären ohne die Schalen', 'Weiße Trauben haben keine Kerne', 'Sie reifen nie im Holz', 'Tannin ist immer rot'], x: 'Weiße Trauben werden vor der Gärung gepresst. Ausnahme: Orange Wine wie der Naranjo – der gärt mit Schalen.' },
      { t: 'mc', q: 'Was macht Tannin mit Eiweiß, z. B. vom Steak?', a: ['Es bindet sich daran – der Wein wirkt weicher', 'Nichts', 'Es macht den Wein süßer', 'Es macht das Fleisch zäh'], x: 'Darum wirkt ein strenger Roter zum Steak plötzlich rund.' },
      { t: 'mc', q: 'Was passiert mit Tannin, wenn ein Wein lange reift?', a: ['Es wird weicher und feiner', 'Es wird immer härter', 'Es verschwindet sofort', 'Es wird zu Säure'], x: 'Tannine verbinden sich mit der Zeit und fallen teils als Depot aus.' }
    ] },
    { id: 'str-3', title: 'Körper & Alkohol', qs: [
      { t: 'mc', q: 'Was trägt am meisten zum Körper eines Weins bei?', a: ['Alkohol', 'Säure', 'Kohlensäure', 'Wasser'], x: 'Alkohol und Extrakt machen den Wein schwer. Säure wirkt eher schlank.' },
      { t: 'mc', q: 'Ein leichter Körper fühlt sich an wie …', a: ['Magermilch', 'Sahne', 'Honig', 'Öl'], x: 'Das Milch-Bild hilft: Magermilch leicht, Vollmilch mittel, Sahne voll.' },
      { t: 'mc', q: 'Wovon hängen die „Kirchenfenster“ am Glas vor allem ab?', a: ['Vom Alkohol', 'Vom Alter', 'Von der Säure', 'Von der Qualität'], x: 'Mehr Alkohol, deutlichere Schlieren. Über Qualität sagen sie nichts.' },
      { t: 'mc', q: 'Ein voller, kräftiger Wein kommt eher aus …', a: ['warmem Klima', 'kühlem Klima', 'Gegenden mit viel Regen', 'schattigen Nordhängen'], x: 'Mehr Sonne, mehr Zucker, mehr Alkohol – mehr Körper.' }
    ] },
    { id: 'str-4', title: 'Abgang & Balance', qs: [
      { t: 'mc', q: 'Wie misst du den Abgang?', a: ['Sekunden zählen, wie lange der Geschmack bleibt', 'Farbe am Glasrand ansehen', 'Am Korken riechen', 'Kirchenfenster zählen'], x: 'Schlucken, dann zählen, solange Frucht und Würze bleiben.' },
      { t: 'mc', q: 'Ab etwa wie vielen Sekunden gilt ein Abgang als lang?', a: ['über 15', 'über 2', 'über 60', 'über 5'], x: 'Faustregel: unter 5 kurz, 5–15 mittel, über 15 lang.' },
      { t: 'mc', q: 'Was meint man mit „Balance“?', a: ['Frucht, Säure, Tannin und Alkohol passen zusammen', 'Gleich viel Rot und Weiß', 'Gleich viel Zucker und Säure', 'Der Wein ist genau 10 Jahre alt'], x: 'Nichts sticht unangenehm heraus – das ist oft wichtiger als Kraft.' },
      { t: 'mc', q: 'Ein Wein brennt im Abgang. Woran liegt das meist?', a: ['Zu viel spürbarer Alkohol', 'Zu viel Säure', 'Zu wenig Tannin', 'Zu kalt serviert'], x: 'Oft hilft es schon, ihn etwas kühler zu trinken.' }
    ] },
    { id: 'str-5', title: 'Luft & Zeit', qs: [
      { t: 'mc', q: 'Warum verändert sich ein Wein nach dem Öffnen?', a: ['Sauerstoff löst Aromen und macht Tannin weicher', 'Er gärt nach', 'Er verliert Alkohol', 'Der Korken färbt ab'], x: 'Genau das beobachtest du mit deinen Proben über die Zeit.' },
      { t: 'mc', q: 'Ein junger Wein riecht nach Streichholz oder faulem Ei. Was hilft oft?', a: ['Luft – karaffieren oder schwenken', 'Eiswürfel', 'Zucker', 'Sofort wegschütten'], x: 'Das ist Reduktion: entsteht ohne Luft im Fass oder in der Flasche und verfliegt meist mit Sauerstoff.' },
      { t: 'mc', q: 'Welcher Wein profitiert meist am meisten vom Dekantieren?', a: ['Junger, kräftiger Rotwein', 'Leichter Rosé', 'Junger Prosecco', 'Fino Sherry'], x: 'Viel Tannin und verschlossene Frucht – genau da hilft Luft.' },
      { t: 'mc', q: 'Ein sehr alter Wein wird nach 30 Min immer flacher. Was ist los?', a: ['Er zerfällt an der Luft', 'Er braucht noch mehr Luft', 'Der Korken war zu kurz', 'Das Glas war falsch'], x: 'Alte Weine sind fragil. Lieber zügig trinken statt lange belüften.' }
    ] }
  ] },

  { id: 'service', title: 'Service', sub: 'Temperatur, Dekantieren, Glas', color: '#4A6A8C', lessons: [
    { id: 'ser-1', title: 'Temperatur Rot', qs: [
      { t: 'temp', q: 'Bei wie viel Grad servierst du einen kräftigen Rotwein wie Malbec?', ok: [16, 18], x: '16–18 °C. Zimmertemperatur (21–23 °C) ist zu warm – dann drängt der Alkohol vor.' },
      { t: 'temp', q: 'Und einen eleganten Pinot Noir oder Mencía?', ok: [14, 16], x: '14–16 °C. Leichtere Rote mögen es etwas kühler, die Frucht bleibt frischer.' },
      { t: 'mc', q: 'Was passiert, wenn Rotwein zu warm ist?', a: ['Alkohol drängt vor, er wirkt schwer', 'Er wird spritzig', 'Das Tannin verschwindet', 'Er schmeckt saurer'], x: 'Wärme betont Alkohol und Süße – der Wein wirkt plump.' },
      { t: 'mc', q: 'Dein Rotwein hat 22 °C. Was tun?', a: ['15–20 Minuten in den Kühlschrank', 'Eiswürfel rein', 'Sofort trinken', 'In die Sonne stellen'], x: 'Kurz kühlen bringt ihn auf Trinktemperatur – kein Frevel.' }
    ] },
    { id: 'ser-2', title: 'Temperatur Weiß & Rosé', qs: [
      { t: 'temp', q: 'Bei wie viel Grad servierst du einen guten Chablis?', ok: [9, 12], x: 'Etwa 9–12 °C. Große, gereifte Weiße eher am oberen Ende.' },
      { t: 'temp', q: 'Und einen Fino Sherry?', ok: [7, 10], x: 'Fino gut gekühlt, etwa 7–9 °C – wie einen frischen Weißwein.' },
      { t: 'temp', q: 'Ein trockener Rosé?', ok: [8, 12], x: 'Rund 8–12 °C. Eiskalt verliert er seine Frucht.' },
      { t: 'mc', q: 'Was passiert, wenn Weißwein zu kalt ist?', a: ['Aromen und Geschmack werden gedämpft', 'Er wird süßer', 'Er bekommt Tannin', 'Er oxidiert'], x: 'Im Glas wärmt er sich ohnehin – lieber etwas zu kalt starten als zu warm.' }
    ] },
    { id: 'ser-3', title: 'Dekantieren', qs: [
      { t: 'mc', q: 'Warum dekantiert man alte Rotweine?', a: ['Um das Depot abzutrennen', 'Damit sie wärmer werden', 'Um die Säure zu senken', 'Damit sie mehr Tannin bekommen'], x: 'Die Flasche vorher aufrecht stellen, dann langsam umgießen – vor einer Kerze sieht man den Satz.' },
      { t: 'mc', q: 'Wie lange dekantierst du einen jungen, kräftigen Rotwein grob?', a: ['30–90 Minuten', '5 Sekunden', '2 Tage', 'Gar nicht'], x: 'Die Weinkarte in der App sagt dir pro Flasche, wie lange.' },
      { t: 'mc', q: 'Was ist der Unterschied zwischen Dekantieren und Karaffieren?', a: ['Dekantieren trennt vom Depot, Karaffieren gibt vor allem Luft', 'Es gibt keinen', 'Karaffieren ist nur für Weißwein', 'Dekantieren ist nur für Sherry'], x: 'Im Alltag wird beides oft gleich benutzt – gemeint ist meistens: Luft dran lassen.' },
      { t: 'mc', q: 'Kein Dekanter zur Hand. Was hilft auch?', a: ['Ins große Glas einschenken und schwenken', 'Die Flasche schütteln', 'Den Wein erwärmen', 'Den Wein einfrieren'], x: 'Nur den Korken ziehen bringt kaum etwas – die Oberfläche im Flaschenhals ist zu klein.' }
    ] },
    { id: 'ser-4', title: 'Gläser', qs: [
      { t: 'mc', q: 'Wofür ist das große, bauchige Burgunderglas gedacht?', a: ['Feine, aromatische Rote wie Pinot Noir', 'Sekt', 'Sherry', 'Süßwein'], x: 'Viel Oberfläche für die Aromen, die Nase steckt mittendrin.' },
      { t: 'mc', q: 'Welches Glas für Cabernet oder Malbec?', a: ['Bordeauxglas – hoch, etwas schmaler', 'Sektflöte', 'Kleines Sherryglas', 'Becher'], x: 'Die Form lenkt den Wein so, dass Tannin und Frucht ausgewogen wirken.' },
      { t: 'mc', q: 'Wie voll schenkst du ein Rotweinglas?', a: ['Bis zur breitesten Stelle oder darunter', 'Bis zum Rand', 'Nur einen Fingerhut', 'Egal'], x: 'Darüber kannst du nicht mehr schwenken, und die Aromen haben keinen Platz.' },
      { t: 'mc', q: 'Warum hält man das Glas am Stiel?', a: ['Die Hand wärmt den Wein nicht', 'Es ist stabiler', 'Damit es klingt', 'Reine Etikette'], x: 'Und das Glas bleibt sauber, du siehst die Farbe.' }
    ] },
    { id: 'ser-5', title: 'Die offene Flasche', qs: [
      { t: 'mc', q: 'Wie hält sich ein offener Rotwein am besten?', a: ['Verschlossen im Kühlschrank', 'Offen auf dem Tisch', 'Am Fenster', 'Im Gefrierfach'], x: 'Kälte bremst die Oxidation. Vor dem Trinken etwas temperieren.' },
      { t: 'mc', q: 'Wie lange ist ein offener, kräftiger Rotwein meist gut?', a: ['2–4 Tage', '2 Stunden', '3 Wochen', '1 Jahr'], x: 'Kräftige, junge Weine halten oft länger – manche werden am Tag 2 sogar besser.' },
      { t: 'mc', q: 'Der Wein riecht nach nassem Karton oder muffigem Keller. Was ist das?', a: ['Korkfehler', 'Normale Reife', 'Zu viel Tannin', 'Zu viel Säure'], x: 'TCA aus dem Korken – leider nicht zu retten. Flasche aufheben und beim Händler melden.' },
      { t: 'mc', q: 'Warum ist dein Ritual (Probe beim Öffnen, nach 1–2 h, am Tag 2) so sinnvoll?', a: ['Du lernst, wie ein Wein auf Luft reagiert', 'Er wird dadurch wärmer', 'Er wird süßer', 'Es ist nicht sinnvoll'], x: 'So erkennst du mit der Zeit, welche Weine Luft brauchen – und wann sie am besten sind.' }
    ] }
  ] },

  { id: 'etikett', title: 'Etikett lesen', sub: 'Lage, Prädikat, Vino de Villa', color: '#7A6A5A', lessons: [
    { id: 'eti-1', title: 'Deutschland', qs: [
      { t: 'mc', q: 'Die VDP-Pyramide von unten nach oben:', a: ['Gutswein, Ortswein, Erste Lage, Große Lage', 'Große Lage, Ortswein, Gutswein, Erste Lage', 'Ortswein, Gutswein, Große Lage, Erste Lage', 'Erste Lage, Gutswein, Ortswein, Große Lage'], x: 'Je enger die Herkunft, desto höher die Stufe. Trocken aus Großer Lage = GG.' },
      { t: 'mc', q: 'Was bedeutet „Erste Lage“ beim VDP?', a: ['Eine sehr gute Einzellage', 'Der erste Weinberg des Guts', 'Die erste Pressung', 'Ein Rosé'], x: 'Die Stufe direkt unter der Großen Lage.' },
      { t: 'mc', q: 'Was ist eine Spätlese?', a: ['Ein Prädikat für reifere Trauben mit mehr Zucker', 'Ein Wein, den man spät trinkt', 'Immer ein Rotwein', 'Ein alkoholfreier Wein'], x: 'Spätlese kann trocken oder süß sein – das Prädikat sagt nur etwas über die Reife bei der Lese.' },
      { t: 'mc', q: '„Trocken“ heißt in Deutschland in der Regel höchstens …', a: ['9 g Restzucker pro Liter', '0 g Restzucker', '30 g Restzucker', '50 g Restzucker'], x: 'Bis 4 g/l immer trocken, bis 9 g/l wenn genug Säure dagegenhält.' }
    ] },
    { id: 'eti-2', title: 'Spanien', qs: [
      { t: 'mc', q: 'Was bedeutet „Vino de Villa“ wie beim Valtuille?', a: ['Wein aus einem bestimmten Ort', 'Hauswein einer Villa', 'Einfacher Tafelwein', 'Ein Rosé'], x: 'Im Bierzo gibt es eine Herkunftspyramide wie im Burgund: Region, Ort, Einzellage.' },
      { t: 'mc', q: 'Was heißt „Crianza“ in der Rioja?', a: ['Mindestens 2 Jahre gereift, davon 1 im Fass', 'Junger Wein ohne Holz', 'Süßwein', 'Mindestens 5 Jahre gereift'], x: 'Danach kommen Reserva (3 Jahre) und Gran Reserva (5 Jahre).' },
      { t: 'mc', q: 'Was ist ein „Gran Reserva“?', a: ['Die längste gesetzliche Reifestufe', 'Ein Rosé', 'Ein Wein aus großen Flaschen', 'Der erste Wein des Jahres'], x: 'In der Rioja mindestens 5 Jahre Reife, davon mindestens 2 im Fass.' },
      { t: 'mc', q: '„Viñedo Singular“ bezeichnet …', a: ['eine besondere Einzellage', 'einen Hauswein', 'eine Rebsorte', 'ein Fass'], x: 'Die höchste Herkunftsstufe für einzelne Weinberge in Spanien.' }
    ] },
    { id: 'eti-3', title: 'Frankreich', qs: [
      { t: 'mc', q: 'Was garantiert „AOC/AOP“?', a: ['Herkunft und Regeln für Rebsorten und Anbau', 'Bio-Anbau', 'Einen Mindestpreis', 'Eine Medaille'], x: 'Es ist ein Herkunftsversprechen, keine Qualitätsmedaille.' },
      { t: 'mc', q: 'Welche Stufe ist in Burgund die höchste?', a: ['Grand Cru', 'Premier Cru', 'Village', 'Bourgogne'], x: 'Nur rund 1–2 % der burgundischen Weine sind Grand Cru.' },
      { t: 'mc', q: 'Was bedeutet „Mis en bouteille au domaine“?', a: ['Auf dem Weingut abgefüllt', 'Im Fass gereift', 'Aus alten Reben', 'Biologisch erzeugt'], x: 'Ein Zeichen, dass das Weingut selbst abgefüllt hat und nicht ein Händler.' },
      { t: 'mc', q: 'Was steht bei französischen Weinen oft NICHT auf dem Etikett?', a: ['Die Rebsorte', 'Die Herkunft', 'Der Jahrgang', 'Der Alkoholgehalt'], x: 'In Frankreich zählt die Herkunft. Dass Chablis Chardonnay ist, muss man wissen.' }
    ] },
    { id: 'eti-4', title: 'Allgemein', qs: [
      { t: 'mc', q: 'Was bedeutet „Alte Reben“ / „Vieilles Vignes“?', a: ['Alte Rebstöcke – meist weniger Ertrag, mehr Konzentration', 'Ein alter Wein', 'Ein alter Keller', 'Ein altes Fass'], x: 'Wie alt „alt“ ist, ist meist nicht gesetzlich festgelegt.' },
      { t: 'mc', q: 'Der Jahrgang auf dem Etikett ist …', a: ['das Jahr der Lese', 'das Jahr der Abfüllung', 'das Jahr des Verkaufs', 'das Gründungsjahr'], x: 'Ein 2019er wurde 2019 gelesen – abgefüllt oft erst Jahre später.' },
      { t: 'mc', q: 'Was heißt „unfiltriert“?', a: ['Ohne Filtration abgefüllt – Depot möglich', 'Ohne Alkohol', 'Ohne Sulfite', 'Ohne Holz'], x: 'Ein Satz in der Flasche ist dann kein Fehler.' },
      { t: 'mc', q: 'Was bedeutet „13,5 % vol“?', a: ['Den Alkoholgehalt', 'Den Zuckergehalt', 'Die Säure', 'Den Anteil der Hauptrebsorte'], x: 'Ein Hinweis auf Körper und Kraft – und auf die richtige Trinktemperatur.' }
    ] }
  ] },

  { id: 'essen', title: 'Essen & Wein', sub: 'Was passt zu was – und warum', color: '#E07A3F', lessons: [
    { id: 'ess-1', title: 'Grundregeln', qs: [
      { t: 'mc', q: 'Kräftiges Essen braucht …', a: ['einen kräftigen Wein', 'einen leichten Wein', 'einen süßen Wein', 'Schaumwein'], x: 'Gleiches Gewicht – sonst geht einer von beiden unter.' },
      { t: 'mc', q: 'Welche Regel gilt bei Desserts?', a: ['Der Wein sollte mindestens so süß sein wie das Dessert', 'Trockener Wein passt immer', 'Süße ist egal', 'Immer Rotwein'], x: 'Sonst schmeckt der Wein dünn und sauer.' },
      { t: 'mc', q: 'Was macht Säure im Wein mit fettem Essen?', a: ['Sie schneidet durch das Fett und erfrischt', 'Sie macht es fetter', 'Sie macht es süßer', 'Nichts'], x: 'Darum passen Riesling oder Chablis so gut zu Butter und Sahne.' },
      { t: 'mc', q: 'Was passiert mit scharfem Essen und alkoholreichem Wein?', a: ['Die Schärfe wird stärker', 'Die Schärfe verschwindet', 'Der Wein wird süßer', 'Nichts'], x: 'Zu Scharfem lieber wenig Alkohol und etwas Restsüße.' }
    ] },
    { id: 'ess-2', title: 'Fleisch & Grill', qs: [
      { t: 'mc', q: 'Zum gegrillten Rib-Eye passt am besten …', a: ['ein kräftiger Roter mit Tannin wie Malbec', 'ein leichter Riesling', 'ein süßer Moscato', 'ein Fino'], x: 'Fett und Röstaromen vertragen Kraft und Gerbstoff.' },
      { t: 'mc', q: 'Lamm mit Kräutern – ein Klassiker ist …', a: ['Syrah oder Grenache aus dem Süden', 'Moscato', 'Müller-Thurgau', 'Prosecco'], x: 'Würze trifft Würze: Rosmarin und Thymian lieben südliche Rote.' },
      { t: 'mc', q: 'Ente oder Wild – welcher Klassiker?', a: ['Pinot Noir', 'Prosecco', 'Grüner Veltliner', 'Moscato'], x: 'Die Frucht und Säure im Pinot passen zu dunklem, aromatischem Fleisch.' },
      { t: 'mc', q: 'Warum passt Tannin gut zu Steak?', a: ['Fett und Eiweiß machen das Tannin weicher', 'Steak ist süß', 'Tannin würzt das Fleisch', 'Es passt gar nicht'], x: 'Der Wein wirkt runder, das Fleisch saftiger.' }
    ] },
    { id: 'ess-3', title: 'Fisch & Gemüse', qs: [
      { t: 'mc', q: 'Zu Austern ist ein Klassiker …', a: ['Chablis', 'Malbec', 'Amarone', 'Portwein'], x: 'Salzig, frisch, mineralisch – passt wie gemacht.' },
      { t: 'mc', q: 'Rotwein zu Fisch – wann geht das gut?', a: ['Leichter Roter mit wenig Tannin zu kräftigem Fisch wie Thunfisch', 'Nie', 'Kräftiger Cabernet zu Seezunge', 'Nur zu Sahnesauce'], x: 'Viel Tannin mit Fisch kann metallisch schmecken – leichte Rote gehen gut.' },
      { t: 'mc', q: 'Fino Sherry passt besonders zu …', a: ['Jamón, Mandeln, Oliven', 'Schokoladenkuchen', 'Rinderbraten', 'Obstsalat'], x: 'Salzige Tapas und Fino sind in Andalusien Pflicht.' },
      { t: 'mc', q: 'Spargel mit Hollandaise – welcher Wein?', a: ['Trockener Silvaner oder Weißburgunder', 'Kräftiger Malbec', 'Portwein', 'Tanniniger Cabernet'], x: 'Spargel ist heikel – milde, cremige Weiße sind am sichersten.' }
    ] },
    { id: 'ess-4', title: 'Käse', qs: [
      { t: 'mc', q: 'Blauschimmelkäse und …', a: ['Süßwein wie Sauternes oder Portwein', 'leichter Rosé', 'Prosecco', 'Pinot Grigio'], x: 'Salz trifft Süße – einer der besten Kontraste überhaupt.' },
      { t: 'mc', q: 'Ziegenkäse – ein Klassiker ist …', a: ['Sauvignon Blanc', 'Cabernet Sauvignon', 'Portwein', 'Amarone'], x: 'Sancerre und Crottin de Chavignol stammen aus derselben Gegend.' },
      { t: 'mc', q: 'Warum passt Weißwein oft besser zu Käse als Rotwein?', a: ['Säure passt zum Fett, Tannin wirkt mit Käse oft bitter', 'Käse ist immer weiß', 'Rotwein ist zu kalt', 'Es ist nur Tradition'], x: 'Ausnahme: gereifte Rote zu hartem, würzigem Käse.' },
      { t: 'mc', q: 'Gereifter Hartkäse wie Comté passt gut zu …', a: ['Chardonnay mit etwas Reife', 'süßem Moscato', 'leichtem Lambrusco', 'Retsina'], x: 'Nussige Töne im Käse und im Wein finden sich.' }
    ] },
    { id: 'ess-5', title: 'Alltagsküche', qs: [
      { t: 'mc', q: 'Zu Pizza mit Tomatensauce passt …', a: ['ein Roter mit frischer Säure', 'ein süßer Riesling', 'Portwein', 'ein schwerer Amarone'], x: 'Tomate hat viel Säure – der Wein braucht selbst genug davon.' },
      { t: 'mc', q: 'Warum braucht Tomatensauce einen säurereichen Wein?', a: ['Sonst wirkt der Wein neben der Tomate flach', 'Tomate ist süß', 'Wegen der Farbe', 'Braucht sie nicht'], x: 'Säure im Essen lässt Wein mit wenig Säure müde schmecken.' },
      { t: 'mc', q: 'Pilzrisotto – welcher Wein?', a: ['Pinot Noir oder gereifter Chardonnay', 'Moscato', 'süßer Rosé-Sekt', 'Portwein'], x: 'Waldboden zu Waldboden: erdige Töne im Wein lieben Pilze.' },
      { t: 'mc', q: 'Schokolade und trockener Rotwein?', a: ['Schwierig – Schokolade lässt trockenen Wein bitter wirken', 'Passt immer perfekt', 'Nur mit Weißwein', 'Ist egal'], x: 'Zu dunkler Schokolade lieber Port oder einen süßen Roten.' }
    ] }
  ] }
];

/* Mini-Lektionen nach einer Probe – je nach deinen Reglern */
const MINIS = [
  { id: 'luft', when: (p, n) => n >= 2, kicker: 'Luft & Zeit', title: 'Hat er sich verändert? Das macht die Luft.', text: 'Sauerstoff lässt verschlossene Aromen frei und macht Tannin weicher. Vergleich mal Probe 1 mit jetzt – genau das ist dein Ritual.',
    q: { q: 'Was passiert mit Tannin meist an der Luft?', a: ['Es wird weicher', 'Es wird härter', 'Es wird süß', 'Nichts'] } },
  { id: 'tannin-hoch', dim: 'tannin', when: (p) => p.tannin >= 4, kicker: 'Struktur', title: 'Das Pelzige eben – das war Tannin.', text: 'Tannin ist Gerbstoff. Er macht Zunge und Zahnfleisch trocken, wie starker Schwarztee. Mit Luft wird er oft weicher – achte bei der nächsten Probe darauf.',
    q: { q: 'Woher kommt Tannin vor allem?', a: ['Aus Schalen, Kernen und Holz', 'Aus der Säure', 'Aus dem Alkohol'] } },
  { id: 'saeure-hoch', dim: 'saeure', when: (p) => p.saeure >= 4, kicker: 'Struktur', title: 'Das Wasser im Mund eben – das war Säure.', text: 'Säure regt den Speichel an und hält den Wein frisch. Sie ist der Grund, warum ein Wein zum Essen „Lust auf mehr“ macht.',
    q: { q: 'Wozu passt ein Wein mit viel Säure besonders?', a: ['Zu fettem oder gebratenem Essen', 'Zu Schokolade', 'Zu süßem Dessert'] } },
  { id: 'koerper-voll', dim: 'koerper', when: (p) => p.koerper >= 4, kicker: 'Struktur', title: 'Schwer im Mund – das ist Körper.', text: 'Wie viel Gewicht ein Wein auf der Zunge hat. Leicht wie Magermilch, voll wie Sahne. Vor allem Alkohol und Extrakt machen ihn voll.',
    q: { q: 'Was trägt am meisten zum Körper bei?', a: ['Alkohol', 'Säure', 'Kohlensäure'] } },
  { id: 'abgang-lang', dim: 'abgang', when: (p) => p.abgang >= 4, kicker: 'Struktur', title: 'Er bleibt lange – ein langer Abgang.', text: 'Der Abgang ist, wie lange Geschmack nach dem Schlucken bleibt. Ein langer Abgang ist eines der klarsten Zeichen für Qualität.',
    q: { q: 'Ab etwa wann gilt ein Abgang als lang?', a: ['Über 15 Sekunden', 'Über 2 Sekunden', 'Über eine Minute'] } },
  { id: 'tannin-fein', dim: 'tannin', when: (p, n, w) => w && w.color === 'rot' && p.tannin <= 2, kicker: 'Struktur', title: 'Samtig statt pelzig – feines Tannin.', text: 'Wenig oder sehr feines Tannin ist typisch für Pinot, Garnacha oder gereifte Weine. Mit den Jahren werden Tannine runder.',
    q: { q: 'Was passiert mit Tannin, wenn ein Wein reift?', a: ['Es wird feiner und weicher', 'Es wird härter', 'Es wird mehr'] } }
];
