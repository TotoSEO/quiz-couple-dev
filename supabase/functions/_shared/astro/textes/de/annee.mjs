// Die zwölf kommenden Monate. {{venus}}, {{mars}} und {{jupiter}} bekommen
// das Zeichen, durch das der Planet in diesem Monat zieht („im Stier“). Die
// Texte desselben Tons wechseln sich von Monat zu Monat ab.
export default {
  mois: {
    titres: {
      tendre: 'Ein zärtlicher Monat',
      passion: 'Ein feuriger Monat',
      elan: 'Ein Monat mit Rückenwind',
      malentendus: 'Vorsicht vor Missverständnissen',
      turbulences: 'Ein bewegter Monat',
      calme: 'Ein ruhiger Monat',
    },
    tendre: [
      'Venus steht {{venus}} und macht euren Himmel sanfter. Das ist der ideale Monat für liebe Worte, Abende zu Hause und die kleinen Aufmerksamkeiten, die man den Rest des Jahres vergisst.',
      'Mit Venus {{venus}} ist die Zärtlichkeit da. Nutzt die Zeit, um euch etwas zu gönnen, ein kleines Geschenk ohne Anlass zu machen oder eine Gewohnheit wiederaufzunehmen, die ihr verloren hattet.',
      'Venus {{venus}} bringt euch näher. Spannungen legen sich leichter, und das ist ein guter Moment, um Frieden zu schließen, wenn etwas offen geblieben ist.',
      'Ein sanfter Monat, mit Venus {{venus}}. Nehmt euch Zeit für euch zu zweit, ohne Handy, nur aus Freude daran.',
    ],
    passion: [
      'Mars steht {{mars}} und entzündet euren Himmel. Das Verlangen steigt, und die Energie auch: Das ist ein Monat für Überraschungen und plötzliche Lust auf etwas Neues.',
      'Mit Mars {{mars}} ist die Anziehung stark. Nutzt diese Energie, um aus der Routine auszubrechen, und passt bei Streits auf, die ebenfalls schnell hochkochen können.',
      'Mars {{mars}} weckt eure Lust. Ein spontanes Wochenende oder ein ungewöhnlicher Abend: Dieser Monat liebt den Mut.',
      'Ein feuriger Monat, mit Mars {{mars}}. Das Verlangen ist da, die Geduld etwas weniger. Zählt bis zehn, bevor ihr im Eifer des Gefechts antwortet.',
    ],
    elan: [
      'Jupiter, der Planet des Glücks, steht {{jupiter}} und lächelt euren Plänen zu. Das ist ein guter Monat, um ein gemeinsames Projekt zu starten, eine Reise zu planen oder eine Entscheidung zu treffen, die ihr vor euch hergeschoben habt.',
      'Mit Jupiter {{jupiter}} ist der Optimismus auf eurer Seite. Gute Nachrichten kommen leichter, und ihr habt Lust, groß zu denken.',
      'Jupiter {{jupiter}} gibt euch Schwung. Redet über eure Zukunftsträume und macht Pläne: Dieser Monat mag Projekte.',
    ],
    malentendus: [
      'Merkur läuft einen großen Teil des Monats rückwärts: In der Astrologie ist das die Zeit der Missverständnisse und der falsch verstandenen Nachrichten. Lest noch einmal, bevor ihr etwas abschickt, und trefft keine großen Entscheidungen überstürzt.',
      'Der rückläufige Merkur bringt die Kommunikation ein bisschen durcheinander. Das ist ein Monat, um auf alte Gespräche zurückzukommen statt neue anzufangen, und um im Zweifel das Beste vom anderen anzunehmen.',
      'Mit dem rückläufigen Merkur kommen Worte in diesem Monat manchmal härter an, als sie gemeint sind. Wenn euch ein Satz verletzt, fragt erst nach, was der andere meinte, bevor ihr reagiert.',
    ],
    turbulences: [
      'Der Himmel ist in diesem Monat etwas unruhig für euch: Müdigkeit und kleine Reibereien können viel Raum einnehmen. Lasst nichts anstauen, und haltet euch ruhige Momente zu zweit frei.',
      'Ein Monat, in dem eure Launen aufeinanderprallen können. Das ist nicht die Zeit für große Gespräche: Setzt lieber auf Sanftheit und verschiebt die heiklen Themen auf später.',
      'Die Planeten rütteln euch ein bisschen durch. Nichts Schlimmes, aber ein bisschen Geduld auf beiden Seiten erspart euch viele unnötige Streits.',
    ],
    calme: [
      'Ein ruhiger Monat, ohne große Bewegungen an eurem Himmel. Nutzt ihn, um durchzuatmen und euch einen einfachen Moment zu gönnen, nur aus Freude daran.',
      'Nichts Besonderes am Himmel in diesem Monat: Eure Beziehung geht in ihrem eigenen Tempo voran. Oft sind es genau diese Monate, in denen man am meisten aufbaut, ohne es zu merken.',
      'Ein ruhiger Monat, ideal für kleine Gewohnheiten, die guttun, wie ein Abendessen ohne Bildschirme oder ein Spaziergang am Sonntag.',
      'Der Himmel lässt euch in diesem Monat in Ruhe. Keine große Welle am Horizont: Jetzt ist die Zeit, euren Alltag zu pflegen.',
    ],
    notes: {
      mercure: 'Merkur rückläufig vom {{du}} bis zum {{au}}',
      venus: 'Venus rückläufig vom {{du}} bis zum {{au}}',
      mars: 'Mars rückläufig vom {{du}} bis zum {{au}}',
      anniversaire: 'Geburtstag von {{p}}',
    },
    // Wird an den Text angehängt, wenn der Planet des Monats vor allem einen
    // der beiden berührt.
    vedette: {
      tendre: 'In diesem Monat berührt Venus vor allem das Horoskop von {{p}}.',
      passion: 'In diesem Monat weckt Mars vor allem das Horoskop von {{p}}.',
      elan: 'In diesem Monat öffnet Jupiter vor allem {{p}} Türen.',
    },
  },
};
