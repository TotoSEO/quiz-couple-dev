// Die Namen und Überschriften des Berichts, auf Deutsch (mit „ihr“ für das
// Paar, wie der Rest der Website). Die Pronomen stehen in der
// Übereinstimmungs-Schreibweise ({er|sie}, {ihn|sie}, {sein|ihr}): {{il}} und
// {{lui}} gibt es nur auf Französisch. Die Sternzeichen heißen wie auf den
// deutschen Seiten der Website.
export default {
  signes: {
    belier: { nom: 'Widder', en: 'im Widder' },
    taureau: { nom: 'Stier', en: 'im Stier' },
    gemeaux: { nom: 'Zwillinge', en: 'in den Zwillingen' },
    cancer: { nom: 'Krebs', en: 'im Krebs' },
    lion: { nom: 'Löwe', en: 'im Löwen' },
    vierge: { nom: 'Jungfrau', en: 'in der Jungfrau' },
    balance: { nom: 'Waage', en: 'in der Waage' },
    scorpion: { nom: 'Skorpion', en: 'im Skorpion' },
    sagittaire: { nom: 'Schütze', en: 'im Schützen' },
    capricorne: { nom: 'Steinbock', en: 'im Steinbock' },
    verseau: { nom: 'Wassermann', en: 'im Wassermann' },
    poissons: { nom: 'Fische', en: 'in den Fischen' },
  },
  // `le` steht in „die Venus von Lena“, `Le` am Satzanfang.
  planetes: {
    soleil: { nom: 'Sonne', le: 'die Sonne', Le: 'Die Sonne', il: 'sie' },
    lune: { nom: 'Mond', le: 'der Mond', Le: 'Der Mond', il: 'er' },
    mercure: { nom: 'Merkur', le: 'der Merkur', Le: 'Der Merkur', il: 'er' },
    venus: { nom: 'Venus', le: 'die Venus', Le: 'Die Venus', il: 'sie' },
    mars: { nom: 'Mars', le: 'der Mars', Le: 'Der Mars', il: 'er' },
  },
  aspects: {
    conjonction: { nom: 'Konjunktion' },
    sextile: { nom: 'Sextil' },
    carre: { nom: 'Quadrat' },
    trigone: { nom: 'Trigon' },
    opposition: { nom: 'Opposition' },
  },
  relations: {
    meme: 'Gleiches Element',
    allie: 'Verbündete Elemente',
    contraste: 'Gegensätzliche Elemente',
  },
  ui: {
    titrePersonne: '{{p}}, {{planete}} {{en}}',
    doute: '{{Planete}} von {{p}} hat am Tag {seiner|ihrer} Geburt das Zeichen gewechselt. Ohne Geburtszeit rechnen wir mit dem Stand um 12 Uhr mittags, also {{ici}}. Wenn {{p}} früh am Morgen oder spät am Abend geboren wurde, kann {{planete}} auch {{en}} stehen.',
    doutePlus: 'Wenn {{planete}} {{en}} steht',
    lienAspect: '{{planetes}}',
    lienRelation: '{{planetes}}',
    croiseAspect: '{{P1}} von {{x}} und {{p2}} von {{y}}',
    croiseRelation: '{{P1}} von {{x}} und {{p2}} von {{y}}',
    atoutMeme: '{{planetes}}',
    atoutCroise: '{{P1}} von {{x}} und {{p2}} von {{y}}',
    chapitres: {
      soleil: {
        titre: 'Wer ihr im Grunde seid',
        intro: 'In der Astrologie zeigt die Sonne, wer ein Mensch im Grunde ist und was er braucht, um sich wohlzufühlen. Es ist das Zeichen, das alle kennen, das aus dem Horoskop in der Zeitung. In einer Beziehung zeigt sie, was jeder mitbringt und was er sich vom anderen anerkannt wünscht.',
        vos: 'Eure beiden Sonnen',
      },
      lune: {
        titre: 'Eure Gefühle',
        intro: 'Der Mond steht für die Gefühle: was beruhigt, was verletzt, wie man nach einem schlechten Tag reagiert. Er wechselt alle zweieinhalb Tage das Zeichen, deshalb haben zwei Menschen, die im selben Monat geboren sind, fast nie denselben. In einer Beziehung sagt er, wie man den anderen tröstet.',
        vos: 'Eure beiden Monde',
      },
      venus: {
        titre: 'Wie ihr liebt',
        intro: 'Venus ist die Art zu lieben: was einen anzieht, wie man seine Liebe zeigt und was man zurück erwartet. Wenn jemand sagt: „Er zeigt mir nie, dass er mich liebt“, dann sprechen die beiden Venus oft einfach nicht dieselbe Sprache.',
        vos: 'Eure beiden Venus',
      },
      mars: {
        titre: 'Euer Verlangen und eure Streits',
        intro: 'Mars steht für Verlangen und Energie, und auch für Wut. Er zeigt, wie jeder den ersten Schritt macht, was ihn reizt und wie er streitet. Wenn sich die beiden Mars verstehen, ist das oft ein Paar, das wenig streitet und sich schnell wieder versöhnt.',
        vos: 'Eure beiden Mars',
      },
      mercure: {
        titre: 'Wie ihr miteinander redet',
        intro: 'Merkur steht für die Art zu denken und zu reden: ein Problem besprechen, eine Nachricht schreiben, dem anderen zuhören. Viele Streits entstehen weniger durch das, was man sagt, als durch die Art, wie man es sagt, und genau das schaut sich Merkur an.',
        vos: 'Eure beiden Merkur',
      },
      liens: {
        titre: 'Was euch verbindet',
        intro: 'Hier legen wir eure beiden Horoskope übereinander: ein Planet des einen gegenüber einem Planeten des anderen. Diesen Teil schauen sich Astrologen bei einem Paar zuerst an, denn hier zeigen sich Anziehung und Zärtlichkeit, und auch das, was reibt.',
      },
    },
    fin: [
      'Das ist euer gemeinsamer Himmel. Denkt daran, dass es ein Spiel ist: Die Astrologie sagt nichts voraus, und kein Planet entscheidet für euch, ob eure Beziehung funktioniert.',
      'Dieser Bericht ist vor allem ein Anlass, über euch zu reden. Lest noch einmal die Stellen, die euch zum Lächeln gebracht haben, und die, bei denen ihr gestutzt habt: Oft gibt es genau dort etwas zu besprechen.',
    ],
  },
};
