// La coppia nel suo insieme: il profilo, i sei ambiti, gli elementi e le
// domande da farsi. Questi testi parlano alla coppia: {v:masc|femm} accorda
// il «voi», al femminile se sono due donne. Le domande le fa uno all'altro
// («tu»).
export default {
  profil: {
    flamme: {
      nom: "La Fiamma",
      accroche: "Tanta tenerezza, e tante scintille.",
      texte: [
        "Il vostro cielo ha le due cose tra cui quasi tutte le coppie devono scegliere: un'intesa facile e un'attrazione vera. Vi capite senza grande sforzo, eppure continuate a sorprendervi. È il profilo delle coppie che sembrano innamorate anche dopo anni, quelle che si guardano al ristorante chiedendosi come facciano.",
        "La vostra forza è questo equilibrio. Quando scoppia una lite, la tenerezza che vi unisce la calma in fretta. E quando si installa la routine, l'attrazione torna a scuotervi un po'.",
        "La vostra trappola è l'intensità. Tra voi tutto è forte, la gioia come le ferite, e una frase senza importanza può prendere proporzioni enormi. Mantenete l'abitudine di dirvi le cose presto, prima che prendano troppo spazio.",
      ],
    },
    havre: {
      nom: "Il Rifugio",
      accroche: "Una coppia in cui si sta bene.",
      texte: [
        "Il vostro cielo è dolce. I vostri pianeti si capiscono senza spingersi, e avete il raro talento di farvi del bene a vicenda. Da voi la casa è un rifugio: la sera si torna con sollievo, ci si racconta la giornata, ci si riposa.",
        "La vostra forza è la pace che vi date. Sapete rassicurarvi, sostenervi nei momenti difficili e perdonarvi i piccoli errori. Molte coppie vi invidiano questa serenità.",
        "La vostra trappola è la routine. Quando va tutto bene, a volte ci si dimentica di coltivare il desiderio. Programmate cose nuove, un weekend altrove o un'attività che non avete mai provato, per conservare un po' di scintilla.",
      ],
    },
    aimants: {
      nom: "Le Calamite",
      accroche: "Tra voi niente è tiepido.",
      texte: [
        "Il vostro cielo è pieno di scintille. I vostri pianeti si cercano, si scontrano e si attraggono, ed è questo che rende la vostra coppia così viva. L'attrazione è forte, e non vi annoiate mai.",
        "La vostra forza è questa energia. Vi spingete ad andare avanti, osate dirvi le cose, e le vostre riconciliazioni spesso valgono la lite che c'è stata prima.",
        "La vostra trappola sono i conflitti che si susseguono. Quando ognuno tira dalla sua parte, la tensione finisce per logorare la coppia. Imparate a fare una pausa prima che la cosa salga, e tenetevi momenti tranquilli, senza niente in gioco, solo per stare bene insieme.",
      ],
    },
    explorateurs: {
      nom: "Gli Esploratori",
      accroche: "La vostra coppia la inventate voi.",
      texte: [
        "Il vostro cielo non vi dà il lavoro già fatto. I vostri pianeti non formano grandi armonie né grandi tensioni: i vostri temi si parlano poco, e niente vi spinge in una direzione più che in un'altra.",
        "Sembra meno romantico, ma è una fortuna. La vostra coppia non poggia su un'evidenza che viene dal cielo, poggia su quello che decidete di costruire. Ognuno conserva la sua personalità, e imparate continuamente l'uno dall'altro.",
        "La vostra trappola è allontanarvi senza accorgervene, perché niente vi avvicina da solo. Create i vostri rituali: un appuntamento ogni settimana, una passione comune, un progetto insieme. Sono queste abitudini ad avvicinarvi.",
      ],
    },
  },
  domaines: {
    tendresse: {
      nom: "Tenerezza",
      haut: "Sapete prendervi cura l'uno dell'altro. Le vostre Lune e le vostre Venere si capiscono bene: sapete di cosa ha bisogno l'altro per sentirsi {v:amato|amata}, e glielo date senza pensarci.",
      moyen: "La tenerezza c'è, con qualche differenza da addomesticare. Non dimostrate l'affetto allo stesso modo, e a volte uno aspetta un gesto a cui l'altro non pensa.",
      bas: "È l'ambito in cui i vostri temi si capiscono meno. I vostri modi di amare e di rassicurare sono molto diversi, e rischiate di non incontrarvi senza volerlo. Ditevi cosa vi fa bene: è quello che cambierà di più le cose.",
    },
    desir: {
      nom: "Desiderio",
      haut: "L'attrazione tra voi è forte. Le vostre Venere e i vostri Marte si rispondono, e il desiderio ha tutte le carte in regola per restare vivo nel tempo.",
      moyen: "L'attrazione è reale, con alti e bassi. Le vostre voglie non vanno sempre allo stesso ritmo, ed è meglio parlarne che lasciare che uno aspetti.",
      bas: "Sulla carta, i vostri desideri non si somigliano molto. Non vuol dire che manchi l'attrazione, ma che bisogna coltivarla, con sorprese, novità e tanto dialogo su quello che vi piace.",
    },
    dialogue: {
      nom: "Dialogo",
      haut: "Vi parlate con facilità. I vostri Mercurio si capiscono, e sapete discutere di un problema senza che finisca in lite.",
      moyen: "Il dialogo funziona, purché facciate un po' di attenzione. Non pensate allo stesso modo, e una frase a volte può essere capita male.",
      bas: "È l'ambito che chiede più attenzione. Non pensate e non parlate allo stesso modo, e i malintesi possono accumularsi. Prendete l'abitudine di ripetere quello che l'altro ha detto prima di rispondere.",
    },
    complicite: {
      nom: "Complicità",
      haut: "Siete davvero complici. I vostri Soli e le vostre Venere si capiscono: vi piacciono le stesse cose, ridete delle stesse battute e siete {v:orgogliosi l'uno dell'altro|orgogliose l'una dell'altra}.",
      moyen: "La complicità c'è, ma non è automatica. Avete gusti diversi, e a volte bisogna fare un passo verso l'attività preferita dell'altro.",
      bas: "I vostri gusti e i vostri desideri sono piuttosto lontani. Non è un problema in sé: ognuno può conservare le sue passioni. L'importante è trovare due o tre cose da condividere davvero.",
    },
    quotidien: {
      nom: "Quotidianità",
      haut: "La quotidianità scorre facilmente tra voi. Avete un ritmo simile, e le piccole cose della vita insieme, come la spesa o gli orari, si sistemano senza drammi.",
      moyen: "La quotidianità chiede qualche aggiustamento. I vostri ritmi non sono gli stessi, e a volte bisogna negoziare chi fa cosa.",
      bas: "È nella quotidianità che le vostre differenze si sentono di più. I vostri ritmi e i vostri modi di fare non si somigliano, e i piccoli attriti possono accumularsi. Mettetevi d'accordo sull'organizzazione prima che diventi un motivo di lite.",
    },
    duree: {
      nom: "Durata",
      haut: "Il vostro cielo ha tutto per durare. I vostri Soli e le vostre Lune si rispondono, e avete le basi di una relazione solida, di quelle che attraversano gli anni.",
      moyen: "Avete buone basi per durare, con qualche punto su cui lavorare. Come in tutte le coppie, a fare la differenza sarà il modo in cui attraverserete i momenti difficili.",
      bas: "Su questo punto il vostro cielo non vi aiuta molto: i vostri temi hanno ritmi diversi, e quello che rassicura uno non rassicura per forza l'altro. Molte coppie durano con un cielo come il vostro, parlandosi e scegliendosi ogni giorno.",
    },
  },
  elementsCouple: {
    dominant: {
      feu: "Il fuoco domina il vostro cielo a due. Siete una coppia di slancio e di entusiasmo: amate muovervi, provare cose nuove e ridere di gusto. L'energia non manca mai, la pazienza un po' di più.",
      terre: "La terra domina il vostro cielo a due. Siete una coppia solida, con i piedi per terra: amate costruire, organizzarvi e godervi le cose semplici. Insieme vi sentite al sicuro.",
      air: "L'aria domina il vostro cielo a due. Siete una coppia di idee e di conversazioni: amate parlare, uscire e vedere gente. La vostra complicità passa molto dalle parole.",
      eau: "L'acqua domina il vostro cielo a due. Siete una coppia di emozioni: sentite molto, spesso vi capite senza parlare, e la tenerezza conta tantissimo per voi.",
    },
    // Due elementi alla pari in testa (chiavi in ordine alfabetico).
    duo: {
      air_feu: "Il fuoco e l'aria si dividono il vostro cielo a due. Sono due elementi che vanno d'accordo: avete slancio, idee e voglia di muovervi. La vostra coppia va veloce, a volte senza prendersi il tempo di respirare.",
      feu_terre: "Il fuoco e la terra si dividono il vostro cielo a due. Il fuoco porta lo slancio, la terra la pazienza: sapete sognare e costruire allo stesso tempo, purché non tiriate ognuno dalla sua parte.",
      eau_feu: "Il fuoco e l'acqua si dividono il vostro cielo a due. Avete allo stesso tempo passione e tante emozioni, e questo dà una coppia intensa, che vive tutto con forza.",
      air_terre: "La terra e l'aria si dividono il vostro cielo a due. Avete la testa piena di idee e i piedi per terra per realizzarle, purché ascoltiate anche quello che pensa l'altro.",
      eau_terre: "La terra e l'acqua si dividono il vostro cielo a due. Sono due elementi che vanno d'accordo: siete una coppia dolce e solida, che ama le comodità e le cose che durano.",
      air_eau: "L'aria e l'acqua si dividono il vostro cielo a due. Avete allo stesso tempo la testa e il cuore, tante conversazioni e tante emozioni, e a volte bisogna tradurre quello che prova l'altro.",
    },
    equilibre: "Il vostro cielo a due è molto equilibrato: nessun elemento domina davvero. Avete un po' di tutto, slancio, senso pratico, idee ed emozioni, ed è una vera forza per adattarvi a quello che vi porterà la vita.",
    manque: {
      feu: "Nei vostri pianeti non c'è fuoco. Ricordatevi di lanciarvi ogni tanto in qualcosa di spontaneo, come una fuga improvvisata o un'attività un po' folle. Risveglia la coppia.",
      terre: "Nei vostri pianeti non c'è terra. Il lato pratico non è il vostro forte: i soldi, l'organizzazione e i progetti a lungo termine ci guadagnano se li mettete per iscritto.",
      air: "Nei vostri pianeti non c'è aria. Tendete a tenervi le cose dentro. Prendete l'abitudine di parlarne, e di uscire insieme a vedere gente.",
      eau: "Nei vostri pianeti non c'è acqua. Tra voi le emozioni non si dicono sempre facilmente: prendetevi il tempo di chiedervi come sta davvero l'altro.",
    },
  },
  // Due domande per ambito per ciò che chiede attenzione, e una terza per
  // l'ambito più forte.
  questions: {
    tendresse: [
      "Che cosa ti fa sentire di più che ti amo?",
      "Quando hai avuto una brutta giornata, cosa vorresti che facessi?",
      "Qual è il gesto più tenero che ho avuto per te?",
    ],
    desir: [
      "Che cosa ti fa venire voglia di me?",
      "C'è qualcosa che vorresti provare con me e che non hai mai osato dirmi?",
      "Quale momento della nostra storia ti fa ancora venire la pelle d'oca?",
    ],
    dialogue: [
      "C'è un argomento di cui non osi parlarmi?",
      "Quando litighiamo, cosa faccio che ti aiuta, e cosa peggiora le cose?",
      "Quale conversazione della nostra storia ricordi meglio?",
    ],
    complicite: [
      "Che cosa ti piacerebbe che facessimo insieme più spesso?",
      "Quale tua passione ti piacerebbe farmi scoprire?",
      "Qual è il tuo ricordo più bello con me?",
    ],
    quotidien: [
      "Che cosa ti dà più fastidio nel modo in cui ci organizziamo in casa?",
      "Se potessi cambiare una sola cosa della nostra quotidianità, quale sarebbe?",
      "Quale nostra piccola abitudine non vorresti perdere per niente al mondo?",
    ],
    duree: [
      "Dove ci vedi tra cinque anni?",
      "Che cosa ti fa paura del nostro futuro?",
      "Che cosa ti fa venire voglia di passare la vita con me?",
    ],
  },
};
