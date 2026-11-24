// I segni cinesi e i cammini di vita. I ritratti parlano di una persona
// ({{p}}, {lui|lei}), i legami parlano alla coppia. I nomi sono quelli
// delle pagine italiane del sito (triangolo di affinità, amici segreti,
// cammino di vita).
export default {
  chinois: {
    titres: {
      trine: "Lo stesso triangolo",
      harmonie: "Amici segreti",
      meme: "Lo stesso animale",
      neutre: "Né alleati né rivali",
      nuisance: "Una coppia che si logora",
      opposition: "Faccia a faccia",
    },
    relations: {
      trine: "Nell'astrologia cinese, i vostri due animali fanno parte dello stesso triangolo di affinità, il legame più ricercato per una coppia. Andate avanti allo stesso ritmo e volete più o meno le stesse cose dalla vita. Le decisioni importanti si prendono senza bracci di ferro, e sentite di essere dalla stessa parte.",
      harmonie: "I vostri due animali formano una delle sei coppie di «amici segreti» dell'astrologia cinese. Siete molto {v:diversi|diverse}, ma ognuno porta all'altro quello che gli manca, quasi senza pensarci. È un legame discreto e solido.",
      meme: "Siete {v:nati|nate} sotto lo stesso animale cinese. Vi capite in fretta, perché avete lo stesso temperamento, con le stesse qualità e gli stessi difetti. Attenzione a non rimandarvi come uno specchio quello che non vi piace di {v:voi stessi|voi stesse}.",
      neutre: "I vostri due animali non hanno né un'affinità particolare né una tensione marcata nella tradizione cinese. Niente vi spinge l'uno verso l'altro, e niente vi separa: la vostra intesa dipende da voi molto più che dai vostri segni.",
      nuisance: "I vostri due animali formano una delle sei coppie che la tradizione cinese chiama «di danno». Non è un'incompatibilità, ma piccoli fastidi che tornano di continuo. Il rimedio è semplice: ditevi presto quello che vi disturba, prima che si accumuli.",
      opposition: "I vostri due animali sono uno di fronte all'altro sulla ruota cinese, a sei segni di distanza. È l'asse più teso dell'astrologia cinese, e spesso il più attraente all'inizio. Le vostre differenze vi piacciono e vi stancano allo stesso tempo, e ognuno deve accettare che l'altro funziona in un altro modo.",
    },
    elements: {
      meme: "Avete anche lo stesso elemento cinese: avete lo stesso modo di andare avanti nella vita.",
      nourrit: "I vostri elementi cinesi si nutrono, come il legno nutre il fuoco. Uno dà slancio all'altro, e insieme siete più forti.",
      controle: "I vostri elementi cinesi si controllano, come l'acqua spegne il fuoco. Uno tende a frenare l'altro, a volte per il suo bene, a volte troppo. Lasciate a ognuno lo spazio per andare avanti al suo ritmo.",
    },
    animaux: {
      rat: "{{p}} è del segno del Topo. In amore è vivace e {sveglio|sveglia}, e ha sempre in mente un'idea per uscire. La famiglia e le persone che ama contano moltissimo per {lui|lei}, anche se a volte si preoccupa troppo dei soldi o del futuro.",
      buffle: "{{p}} è del segno del Bufalo. In amore costruisce piano piano ma con sicurezza, e si può contare su di {lui|lei} senza riserve. Le sorprese non l'entusiasmano. La sua tenerezza è discreta: si vede in quello che fa per l'altro, quasi mai nelle grandi parole.",
      tigre: "{{p}} è del segno della Tigre. In amore ama le storie intense e ha il coraggio dei suoi sentimenti. Sopporta malissimo gli ordini, e ha bisogno di libertà per restare felice. Con {lui|lei}, la vita non è quasi mai noiosa.",
      lapin: "{{p}} è del segno del Coniglio, che si chiama anche Gatto. In amore è dolce e {delicato|delicata}, e i conflitti {lo|la} stancano in fretta. Ha bisogno di una casa tranquilla per stare bene, e sa rendere accogliente una casa come {nessun altro|nessun'altra}.",
      dragon: "{{p}} è del segno del Drago. Ha carisma e ambizione, e in amore ama fare colpo. Dà molto, ma si aspetta anche molto, e niente l'annoia più di una relazione qualunque.",
      serpent: "{{p}} è del segno del Serpente. In amore è {misterioso|misteriosa} e ci pensa a lungo prima di impegnarsi. La sua intuizione sbaglia di rado. Può diventare {geloso|gelosa} quando si sente {minacciato|minacciata}, ma è di una grande fedeltà.",
      cheval: "{{p}} è del segno del Cavallo. Si innamora in fretta e con entusiasmo. Ha bisogno di movimento e di spazio, e una relazione troppo soffocante {lo|la} fa scappare. Con {lui|lei} servono progetti e aria aperta.",
      chevre: "{{p}} è del segno della Capra. In amore è {tenero|tenera} e ha bisogno di sentirsi {protetto|protetta}. Ama le cose belle, la musica e le serate tranquille a casa, e spesso ha una vera vena artistica.",
      singe: "{{p}} è del segno della Scimmia. In amore è divertente e ha molta fantasia. Adora sorprendere l'altro, e si annoia in fretta se alla relazione manca il gioco. Le sue battute sono spesso il suo modo di dire che qualcuno {gli|le} sta a cuore.",
      coq: "{{p}} è del segno del Gallo. In amore è {franco|franca} e ama che le cose siano chiare. Cura i dettagli, dai vestiti alle date importanti, e dimostra il suo amore essendo affidabile. Ha il suo orgoglio, e le critiche {lo|la} toccano più di quanto lasci vedere.",
      chien: "{{p}} è del segno del Cane. In amore la fiducia viene prima di tutto. È leale e {protettivo|protettiva}, e difende la persona che ama contro tutto e tutti. Una volta che ha dato il suo cuore, non lo riprende facilmente.",
      cochon: "{{p}} è del segno del Maiale. In amore è {generoso|generosa} e {sincero|sincera}, e adora i piaceri semplici da condividere, come una buona cena o la domenica mattina a letto. Perdona facilmente, a volte troppo.",
    },
  },
  vie: {
    nombres: {
      1: "Il cammino di vita di {{p}} è l'1, quello dei pionieri. In amore ama prendere l'iniziativa e andare avanti. Ha bisogno di una coppia che rispetti la sua indipendenza.",
      2: "Il cammino di vita di {{p}} è il 2, il numero del legame. È {fatto|fatta} per la vita di coppia: ascolta, sostiene e smussa gli angoli. Ha bisogno di sentirsi {amato|amata} e utile per stare bene.",
      3: "Il cammino di vita di {{p}} è il 3, quello della gioia e della parola. In amore porta leggerezza, umorismo e idee. Ha bisogno di una coppia in cui si ride e si parla.",
      4: "Il cammino di vita di {{p}} è il 4, quello dei costruttori. In amore è affidabile e {lavoratore|lavoratrice}, e costruisce sul lungo periodo. Ha bisogno di stabilità e di progetti concreti.",
      5: "Il cammino di vita di {{p}} è il 5, quello della libertà. In amore ha bisogno di cambiamento, viaggi e novità. Una relazione troppo abitudinaria l'annoia in fretta.",
      6: "Il cammino di vita di {{p}} è il 6, il numero dell'amore e della famiglia. Si prende cura degli altri, porta armonia ovunque e ha il senso della responsabilità. La coppia e la casa contano moltissimo per {lui|lei}.",
      7: "Il cammino di vita di {{p}} è il 7, quello della riflessione. In amore ha bisogno di profondità, di conversazioni che abbiano un senso e di momenti da {solo|sola} per ricaricarsi.",
      8: "Il cammino di vita di {{p}} è l'8, quello dell'ambizione. In amore è forte e {protettivo|protettiva}, e ama costruire una vita comoda. Deve fare attenzione a tenere del tempo per la coppia.",
      9: "Il cammino di vita di {{p}} è il 9, quello della generosità. In amore dà molto, pensa agli altri e sogna un ideale. Ha bisogno di una coppia che condivida i suoi valori.",
      11: "Il cammino di vita di {{p}} è l'11, un numero maestro, quello dell'intuizione. In amore è molto sensibile e {ispirato|ispirata}, e sente le cose prima che vengano dette.",
      22: "Il cammino di vita di {{p}} è il 22, un numero maestro, quello dei grandi progetti. In amore guarda lontano e vuole costruire qualcosa di solido, che duri.",
      33: "Il cammino di vita di {{p}} è il 33, un numero maestro molto raro, quello della dedizione. In amore dà moltissimo, a volte fino a dimenticare sé {stesso|stessa}.",
    },
    accord: {
      haut: "I vostri cammini di vita si intendono molto bene: in numerologia, i vostri due numeri vanno nella stessa direzione e si sostengono.",
      moyen: "I vostri cammini di vita vanno d'accordo, con differenze che vi arricchiscono.",
      bas: "I vostri cammini di vita sono piuttosto diversi: non andate avanti allo stesso ritmo, e bisogna rispettare quello dell'altro.",
    },
  },
};
