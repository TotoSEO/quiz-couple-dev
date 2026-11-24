// I legami tra i vostri due temi. Un testo a due parla alla coppia («voi»):
// {v:masc|femm} accorda questo «voi», al femminile se sono due donne. In
// una coppia incrociata, {{x}} è la persona del primo pianeta (il Sole di x
// e la Luna di y), {x:masc|femm} e {y:masc|femm} i suoi accordi. Mai
// «a {{x}}» né «a {{y}}»: davanti a un nome in A ci vorrebbe «ad». La prima
// frase di ogni testo serve anche da riassunto (punti di forza e sfide):
// deve capirsi da sola.
export default {
  'soleil-soleil': {
    conjonction: "I vostri due Soli sono vicinissimi: siete dello stesso segno, o quasi. Vi capite senza dovervi spiegare tutto, perché avete gli stessi riflessi e gli stessi desideri. Il rischio è somigliarvi così tanto da sommare i vostri difetti invece di bilanciarli. Due {v:testardi|testarde} restano {v:testardi|testarde} anche insieme! Lasciatevi ognuno un po' di spazio, per non pestarvi i piedi.",
    sextile: "I vostri due Soli vanno d'accordo. Avete caratteri diversi, ma si completano facilmente: quando uno propone qualcosa, l'altro ha voglia di seguirlo. Vi fate crescere a vicenda senza forzarvi, e i vostri amici spesso vi trovano molto {v:affiatati|affiatate}. È una base facile, da curare con progetti comuni.",
    carre: "I vostri due Soli si scontrano. Avete modi molto diversi di vivere e di decidere, e ognuno tiene al suo. Questo porta discussioni, soprattutto sulle decisioni importanti, ma anche una coppia che non si addormenta mai. Molte coppie solide hanno questa quadratura: chiede a ognuno di fare degli sforzi. La cosa più utile è accettare che ognuno ha il suo modo di fare, e che l'altro non lo cambierà del tutto.",
    trigone: "I vostri due Soli sono in armonia. Condividete lo stesso modo di vedere la vita, e questo rende la quotidianità facile e piacevole. Vi siete {v:trovati|trovate} bene insieme fin dall'inizio, come se vi conosceste da sempre. L'unica trappola è la facilità: una coppia in cui va tutto bene può dimenticarsi di sorprendersi.",
    opposition: "I vostri due Soli si guardano in faccia, dai due estremi dello zodiaco. Siete {v:opposti|opposte}, e spesso è proprio questo che vi ha {v:attratti|attratte} all'inizio: ognuno trova nell'altro quello che gli manca. Nella quotidianità queste differenze a volte tirano ognuno dalla sua parte, e bisogna imparare a negoziare. Quando funziona, formate una squadra molto completa, in cui ognuno compensa quello che manca all'altro.",
    meme: "I vostri due Soli non formano un aspetto preciso, ma sono nello stesso elemento. Avete la stessa energia di fondo e vi capite senza sforzo sull'essenziale. Le vostre differenze stanno nel modo di fare, quasi mai nella sostanza.",
    allie: "I vostri due Soli sono in elementi che vanno d'accordo, come il fuoco e l'aria, o la terra e l'acqua. Uno alimenta l'altro: i vostri caratteri sono diversi, ma si stimolano invece di ostacolarsi. È una base piuttosto facile.",
    contraste: "I vostri due Soli sono in elementi che si contrastano, come il fuoco e l'acqua, o l'aria e la terra. Non avete lo stesso ritmo né le stesse priorità, e a volte bisogna tradurre quello che l'altro vuole dire. Chiede sforzi, ma vi insegna anche molto l'uno dell'altro.",
  },
  'lune-lune': {
    conjonction: "Le vostre due Lune sono insieme: sentite le cose allo stesso modo. Avete bisogno delle stesse cose per stare bene, e sapete d'istinto come consolare l'altro. In astrologia è uno dei legami più dolci che ci siano. Attenzione solo ai giorni in cui state male nello stesso momento, perché allora non c'è nessuno a rassicurare l'altro.",
    sextile: "Le vostre due Lune vanno d'accordo. Le vostre emozioni non funzionano allo stesso modo, ma si rispondono: quando uno ha bisogno di conforto, l'altro trova abbastanza facilmente i gesti giusti. State bene insieme in casa, nei piccoli momenti di ogni giorno.",
    carre: "Le vostre due Lune si scontrano. Non avete bisogno delle stesse cose per stare bene, e quello che rassicura uno può infastidire l'altro. Per esempio, uno vuole parlare subito quando l'altro ha bisogno di tranquillità. I malintesi nascono spesso da qui, non da una mancanza d'amore. La cosa più utile è dirvi chiaramente quello che vi fa bene, invece di aspettare che l'altro lo indovini.",
    trigone: "Le vostre due Lune sono in armonia. State bene insieme senza sforzo, e in casa l'atmosfera è spesso dolce e naturale. Capite l'umore dell'altro con uno sguardo. In astrologia è uno dei segni migliori per una vita insieme che dura.",
    opposition: "Le vostre due Lune si guardano in faccia. I vostri bisogni emotivi sono opposti: forse uno ha bisogno di vicinanza quando l'altro ha bisogno di aria. Potete darvi molto, perché ognuno ha quello che manca all'altro, purché lo accettiate invece di rimproverarvelo. Con un po' di pazienza, questo faccia a faccia diventa un equilibrio.",
    meme: "Le vostre due Lune sono nello stesso elemento, senza un aspetto preciso. Le vostre emozioni parlano la stessa lingua: spesso reagite allo stesso modo alle buone e alle cattive notizie.",
    allie: "Le vostre due Lune sono in elementi alleati. I vostri bisogni sono diversi, ma si combinano bene, e vi rassicurate a vicenda abbastanza facilmente.",
    contraste: "Le vostre due Lune sono in elementi che si contrastano. Quello che rassicura uno non rassicura per forza l'altro, e bisogna imparare i bisogni di ciascuno. Niente di impossibile, ma bisogna parlarne.",
  },
  'venus-venus': {
    conjonction: "Le vostre due Venere sono insieme: amate allo stesso modo. Avete gli stessi gusti e la stessa idea di una bella serata a due. Vi fate piacere senza pensarci, perché quello che piace a uno piace anche all'altro. È un legame molto tenero, che rende piacevole la vita di coppia.",
    sextile: "Le vostre due Venere vanno d'accordo. I vostri modi di amare sono diversi, ma si completano, e vi fate scoprire cose nuove. Trovate facilmente programmi e momenti che vi piacciono.",
    carre: "Le vostre due Venere si scontrano: non amate allo stesso modo. Potete avere l'impressione di non essere {v:amati|amate} come vorreste, anche se l'amore c'è. Per esempio, uno dimostra il suo amore con i regali, mentre l'altro si aspetta soprattutto tempo insieme. La cosa più semplice è dirvi cosa vi tocca, per smettere di non capirvi.",
    trigone: "Le vostre due Venere sono in armonia. Avete gusti simili e lo stesso modo di dimostrare il vostro amore, e questo evita molti malintesi. Per scegliere un regalo, un'uscita o un viaggio, siete spesso d'accordo. È un legame che rende l'amore semplice e dolce.",
    opposition: "Le vostre due Venere si guardano in faccia. Avete gusti opposti, e spesso è proprio questo che vi ha {v:attratti|attratte}. Nella quotidianità bisogna negoziare: a uno piace uscire quando l'altro preferisce restare a casa, per esempio. Vissuta bene, questa differenza vi apre a cose che non avreste mai provato.",
    meme: "Le vostre due Venere sono nello stesso elemento. Anche senza un aspetto preciso tra loro, i vostri gusti si somigliano abbastanza perché spesso abbiate voglia delle stesse cose.",
    allie: "Le vostre due Venere sono in elementi alleati. Non amate esattamente allo stesso modo, ma i vostri modi di amare si capiscono bene.",
    contraste: "Le vostre due Venere sono in elementi che si contrastano. I vostri modi di amare sono molto diversi, ed è meglio dirvi cosa vi piace che indovinarlo.",
  },
  'mars-mars': {
    conjonction: "I vostri due Marte sono insieme: avete la stessa energia e lo stesso ritmo. Questo dà un'attrazione forte e la voglia di fare tantissime cose insieme. Il rovescio è che vi arrabbiate anche nello stesso momento, e le vostre liti possono salire in fretta. Uno sport o un progetto comune è un buon modo per sfogare tutta questa energia.",
    sextile: "I vostri due Marte vanno d'accordo. Avete ritmi diversi ma compatibili, e sapete andare avanti insieme senza pestarvi i piedi. Le vostre liti sono rare e si sistemano abbastanza in fretta.",
    carre: "I vostri due Marte si scontrano. Non avete lo stesso modo di agire né di arrabbiarvi, e i piccoli attriti di ogni giorno possono salire in fretta. Allo stesso tempo, questa quadratura dà molta scintilla al desiderio, e le vostre riconciliazioni sono spesso intense. Imparate a fare una pausa quando la cosa si scalda, prima di dire cose di cui vi pentireste.",
    trigone: "I vostri due Marte sono in armonia. Avete la stessa energia e sapete andare avanti insieme, che sia per un trasloco o per una serata improvvisata. Il desiderio scorre, senza complicazioni. Le vostre liti sono rare e brevi.",
    opposition: "I vostri due Marte si guardano in faccia. L'attrazione è forte, ma le vostre energie si scontrano: quando uno vuole andare a sinistra, l'altro vuole andare a destra. Questo faccia a faccia tiene vivo il desiderio, purché non trasformiate ogni disaccordo in un braccio di ferro.",
    meme: "I vostri due Marte sono nello stesso elemento. Avete un'energia simile, e vi capite abbastanza bene sul ritmo da dare alla vostra vita.",
    allie: "I vostri due Marte sono in elementi alleati. Le vostre energie sono diverse, ma si stimolano, e sapete agire insieme.",
    contraste: "I vostri due Marte sono in elementi che si contrastano. Non avete lo stesso ritmo, e quello che motiva uno può frenare l'altro. Bisogna trovare un passo comune, senza che uno imponga il suo all'altro.",
  },
  'mercure-mercure': {
    conjonction: "I vostri due Mercurio sono insieme: pensate allo stesso modo. Vi capite al volo, a volte finite le frasi l'uno dell'altro e potete parlare per ore. È uno dei segni migliori per comunicare bene. Attenzione solo a non girare sempre intorno alle stesse idee.",
    sextile: "I vostri due Mercurio vanno d'accordo. Non pensate allo stesso modo, ma amate parlare e imparate l'uno dall'altro. Le conversazioni sono facili, e spesso divertenti.",
    carre: "I vostri due Mercurio si scontrano. Non ragionate allo stesso modo, e una parola di uno può essere capita male dall'altro. Le vostre liti nascono spesso da una frase fraintesa più che da un vero disaccordo. Prendete l'abitudine di riformulare: «Se ho capito bene, vuoi dire che…»",
    trigone: "I vostri due Mercurio sono in armonia. Parlate la stessa lingua, in senso letterale e figurato: le idee circolano facilmente tra voi, e sapete risolvere un problema parlandone. Le lunghe conversazioni sono uno dei grandi piaceri della vostra coppia.",
    opposition: "I vostri due Mercurio si guardano in faccia. Spesso vedete le cose da due punti di vista opposti, e questo dà discussioni animate. È arricchente quando ognuno ascolta l'altro, e stancante quando ognuno vuole avere ragione. Dite ogni tanto «non hai tutti i torti»: cambia tutto.",
    meme: "I vostri due Mercurio sono nello stesso elemento. Avete un modo di pensare simile, e vi capite in fretta.",
    allie: "I vostri due Mercurio sono in elementi alleati. Non pensate allo stesso modo, ma le vostre idee si completano bene.",
    contraste: "I vostri due Mercurio sono in elementi che si contrastano. Non ragionate allo stesso modo, e a volte bisogna prendersi il tempo di spiegarsi bene.",
  },
  'soleil-lune': {
    conjonction: "Il Sole di {{x}} è sulla Luna di {{y}}: in astrologia è il legame delle coppie che durano. {{y}} si sente {y:capito|capita} e {y:rassicurato|rassicurata} da quello che {{x}} è nel profondo, e {{x}} si sente {x:accettato|accettata} così com'è. Vi sentite a casa l'uno con l'altro, ed è una cosa rara.",
    sextile: "Il Sole di {{x}} e la Luna di {{y}} vanno d'accordo. Quello che {{x}} è nel profondo fa stare bene {{y}}, che si sente a suo agio al suo fianco. È un legame dolce, che aiuta la coppia a durare.",
    carre: "Il Sole di {{x}} e la Luna di {{y}} si scontrano. Quello che {{x}} fa con naturalezza può ferire {{y}} senza che {{x}} se ne accorga, e {{y}} può avere l'impressione di non essere {y:capito|capita}. Non è una mancanza d'amore, ma due ritmi diversi. Prendetevi il tempo di spiegarvi quello che vi tocca.",
    trigone: "Il Sole di {{x}} e la Luna di {{y}} sono in armonia: è un ottimo segno per la vita insieme. {{y}} si sente bene con {{x}} in modo naturale, e {{x}} trova in {{y}} un sostegno che non chiede niente in cambio. Formate una squadra in cui ognuno ha il suo posto.",
    opposition: "Il Sole di {{x}} e la Luna di {{y}} si guardano in faccia. In astrologia è un'attrazione molto forte, quella di due metà che si completano. Chiede equilibrio: {{x}} deve fare attenzione alle emozioni di {{y}}, e {{y}} deve lasciare che {{x}} sia {x:sé stesso|sé stessa}.",
  },
  'venus-mars': {
    conjonction: "La Venere di {{x}} e il Marte di {{y}} sono vicinissimi: è l'aspetto dell'attrazione fisica per eccellenza. {{y}} è {y:attratto|attratta} da quello che {{x}} trasmette, e {{x}} adora il modo in cui {{y}} {x:lo|la} desidera. Tra voi la seduzione non si spegne facilmente.",
    sextile: "La Venere di {{x}} e il Marte di {{y}} vanno d'accordo. L'attrazione c'è, dolce e facile, e sapete sedurvi senza forzare. È un legame che mantiene viva l'intesa fisica nel tempo.",
    carre: "La Venere di {{x}} e il Marte di {{y}} si scontrano, e volano scintille. L'attrazione è forte, un po' elettrica, con liti che spesso finiscono in riconciliazione. {{x}} può trovare {{y}} troppo impaziente, e {{y}} può trovare {{x}} troppo {x:complicato|complicata}. Parlate senza tabù di quello che vi va.",
    trigone: "La Venere di {{x}} e il Marte di {{y}} sono in armonia. Vi attraete in modo naturale, e i vostri desideri si incontrano facilmente. Il desiderio è semplice e tenero, e dura.",
    opposition: "La Venere di {{x}} e il Marte di {{y}} si guardano in faccia: è un'attrazione forte, fatta di contrasti. {{y}} ha voglia di sedurre {{x}}, che adora essere {x:sedotto|sedotta}, e questo gioco può durare a lungo. Attenzione solo a non trasformarlo in una lotta di potere.",
    meme: "La Venere di {{x}} e il Marte di {{y}} non formano un aspetto preciso, ma sono nello stesso elemento. I vostri desideri si capiscono: quello che {{x}} ama è spesso proprio quello che {{y}} ha voglia di dare.",
    allie: "La Venere di {{x}} e il Marte di {{y}} sono in elementi alleati. L'attrazione è reale senza essere esplosiva, e cresce con la fiducia.",
    contraste: "La Venere di {{x}} e il Marte di {{y}} sono in elementi che si contrastano. I vostri modi di desiderare non si somigliano, e bisogna imparare quello che piace all'altro. È parlandone che il desiderio trova la sua strada.",
  },
  'lune-venus': {
    conjonction: "La Luna di {{x}} e la Venere di {{y}} sono insieme: è uno dei legami più teneri. Il modo di amare di {{y}} è proprio quello di cui {{x}} ha bisogno per sentirsi {x:amato|amata}. Gli abbracci e le piccole attenzioni di {{y}} colpiscono sempre nel segno.",
    sextile: "La Luna di {{x}} e la Venere di {{y}} vanno d'accordo. {{y}} sa come far stare bene {{x}}, con gesti semplici e una tenerezza naturale.",
    carre: "La Luna di {{x}} e la Venere di {{y}} si scontrano. {{y}} dimostra il suo amore in un modo che non sempre rassicura {{x}}, e {{x}} può sentirsi {x:incompreso|incompresa} senza sapere perché. La cosa più semplice è che {{x}} dica chiaramente cosa {x:lo|la} fa sentire al sicuro.",
    trigone: "La Luna di {{x}} e la Venere di {{y}} sono in armonia. {{x}} si sente {x:amato|amata} come ha bisogno, e {{y}} adora prendersi cura di {{x}}. È una tenerezza facile, che fa bene nella vita di tutti i giorni.",
    opposition: "La Luna di {{x}} e la Venere di {{y}} si guardano in faccia. Vi attraete, ma i vostri bisogni di tenerezza non sono gli stessi: {{x}} si aspetta una forma d'amore a cui {{y}} non sempre pensa. Dicendovelo, troverete facilmente una via di mezzo.",
  },
  'soleil-venus': {
    conjonction: "Il Sole di {{x}} e la Venere di {{y}} sono insieme: {{y}} ama {{x}} per quello che è nel profondo. È il legame dell'ammirazione e del colpo di fulmine. {{x}} si sente {x:valorizzato|valorizzata}, e {{y}} trova in {{x}} esattamente quello che {y:gli|le} fa perdere la testa.",
    sextile: "Il Sole di {{x}} e la Venere di {{y}} vanno d'accordo. {{y}} ama la personalità di {{x}}, e passate volentieri del tempo insieme. È un legame di complicità semplice e piacevole.",
    carre: "Il Sole di {{x}} e la Venere di {{y}} si scontrano. {{y}} è {y:attratto|attratta} da {{x}}, ma alcuni lati del carattere di {{x}} l'infastidiscono. Bisogna accettare che l'altro non cambierà in tutto, e dirselo con umorismo più che con rimproveri.",
    trigone: "Il Sole di {{x}} e la Venere di {{y}} sono in armonia. {{y}} ammira {{x}} senza sforzo, e {{x}} si sente {x:amato|amata} per quello che è. La vostra complicità è naturale, e spesso vi piacciono le stesse cose.",
    opposition: "Il Sole di {{x}} e la Venere di {{y}} si guardano in faccia. L'attrazione è forte, fatta di differenze: {{y}} è {y:sedotto|sedotta} da quello che {{x}} ha di diverso. Nella quotidianità bisogna accettare queste differenze senza cercare di cancellarle.",
  },
  'mercure-lune': {
    conjonction: "Il Mercurio di {{x}} e la Luna di {{y}} sono insieme: le parole di {{x}} arrivano dritte al cuore di {{y}}. {{y}} si sente {y:ascoltato|ascoltata} e {y:capito|capita}, e potete parlare di tutto, anche di quello che fa male.",
    sextile: "Il Mercurio di {{x}} e la Luna di {{y}} vanno d'accordo. {{x}} sa trovare le parole che rassicurano {{y}}, e le conversazioni di ogni giorno sono facili.",
    carre: "Il Mercurio di {{x}} e la Luna di {{y}} si scontrano. {{x}} può dire le cose in un modo che ferisce {{y}} senza volerlo, e {{y}} può reagire con le emozioni dove {{x}} si aspettava la logica. Prima di una conversazione importante, scegliete bene il momento e il tono.",
    trigone: "Il Mercurio di {{x}} e la Luna di {{y}} sono in armonia. {{x}} capisce quello che {{y}} prova e sa parlarne con dolcezza. Le piccole chiacchierate della sera fanno molto bene alla vostra coppia.",
    opposition: "Il Mercurio di {{x}} e la Luna di {{y}} si guardano in faccia. {{x}} ragiona quando {{y}} sente, e le vostre conversazioni possono diventare un dialogo tra sordi. Ascoltate prima quello che prova l'altro, e cercate le soluzioni solo dopo.",
  },
};
