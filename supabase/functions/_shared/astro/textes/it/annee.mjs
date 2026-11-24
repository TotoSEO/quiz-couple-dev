// I dodici mesi che vengono. {{venus}}, {{mars}} e {{jupiter}} ricevono il
// segno in cui passa il pianeta quel mese («in Toro»). I testi dello stesso
// tono si alternano da un mese all'altro. Le date passano per l'elisione
// («dall'8 febbraio», «all'11 marzo»: remplacer di rapport.mjs).
export default {
  mois: {
    titres: {
      tendre: "Un mese tenero",
      passion: "Un mese di fuoco",
      elan: "Un mese con il vento in poppa",
      malentendus: "Attenzione ai malintesi",
      turbulences: "Un mese movimentato",
      calme: "Un mese tranquillo",
    },
    tendre: [
      "Venere è {{venus}} e addolcisce il vostro cielo. È il mese ideale per le parole dolci, le serate a casa e le piccole attenzioni che si dimenticano il resto dell'anno.",
      "Con Venere {{venus}}, la tenerezza c'è. Approfittatene per coccolarvi, fare un piccolo regalo senza motivo o riprendere un'abitudine che avevate perso.",
      "Venere {{venus}} vi avvicina. Le tensioni si calmano più facilmente, ed è un buon momento per fare pace se qualcosa era rimasto in sospeso.",
      "Un mese dolce, con Venere {{venus}}. Prendetevi del tempo solo per la coppia, senza telefono, per il piacere di stare insieme.",
    ],
    passion: [
      "Marte è {{mars}} e accende il vostro cielo. Il desiderio sale, e anche l'energia: è un mese per le sorprese e le voglie improvvise.",
      "Con Marte {{mars}}, l'attrazione è forte. Approfittate di questa energia per uscire dalla routine, e attenzione alle liti, che possono accendersi in fretta anche loro.",
      "Marte {{mars}} risveglia le vostre voglie. Un weekend improvvisato o una serata fuori dal comune: questo mese ama l'audacia.",
      "Un mese di fuoco, con Marte {{mars}}. Il desiderio c'è, la pazienza un po' meno. Contate fino a dieci prima di rispondere a caldo.",
    ],
    elan: [
      "Giove, il pianeta della fortuna, è {{jupiter}} e sorride ai vostri progetti. È un buon mese per lanciare un progetto insieme, un viaggio o una decisione che rimandavate.",
      "Con Giove {{jupiter}}, l'ottimismo è dalla vostra parte. Le buone notizie arrivano più facilmente, e avete voglia di pensare in grande.",
      "Giove {{jupiter}} vi dà slancio. Parlate dei vostri sogni per il futuro e fate piani: questo mese ama i progetti.",
    ],
    malentendus: [
      "Mercurio torna indietro per buona parte del mese: in astrologia è il momento dei malintesi e dei messaggi capiti male. Rileggete prima di inviare, e non prendete grandi decisioni di fretta.",
      "Mercurio retrogrado confonde un po' la comunicazione. È un mese per tornare su vecchie conversazioni più che per aprirne di nuove, e per concedervi il beneficio del dubbio.",
      "Con Mercurio retrogrado, questo mese le parole possono andare oltre le intenzioni. Se una frase vi ferisce, chiedete cosa voleva dire l'altro prima di reagire.",
    ],
    turbulences: [
      "Questo mese il cielo è un po' agitato per voi: la stanchezza e i piccoli attriti possono prendere spazio. Non lasciate che si accumuli niente, e tenetevi dei momenti tranquilli da passare insieme.",
      "Un mese in cui i vostri umori possono scontrarsi. Non è il momento delle grandi discussioni: meglio la dolcezza, e rimandate a più tardi gli argomenti delicati.",
      "I pianeti vi scuotono un po'. Niente di grave, ma un po' di pazienza da entrambe le parti vi risparmierà molte liti inutili.",
    ],
    calme: [
      "Un mese tranquillo, senza grandi movimenti nel vostro cielo. Approfittatene per respirare, e per concedervi un momento semplice, solo per il piacere.",
      "Niente di speciale nel cielo questo mese: la vostra coppia va avanti al suo ritmo. Spesso è proprio in questi mesi che si costruisce di più, senza accorgersene.",
      "Un mese calmo, ideale per le piccole abitudini che fanno bene, come una cena senza schermi o una passeggiata la domenica.",
      "Questo mese il cielo vi lascia {v:tranquilli|tranquille}. Nessuna grande onda all'orizzonte: è il momento di prendervi cura della vostra quotidianità.",
    ],
    notes: {
      mercure: "Mercurio retrogrado dal {{du}} al {{au}}",
      venus: "Venere retrograda dal {{du}} al {{au}}",
      mars: "Marte retrogrado dal {{du}} al {{au}}",
      anniversaire: "Compleanno di {{p}}",
    },
    // Si aggiunge al testo quando il pianeta del mese tocca soprattutto uno
    // dei due.
    vedette: {
      tendre: "Questo mese, Venere tocca soprattutto il tema di {{p}}.",
      passion: "Questo mese, Marte risveglia soprattutto il tema di {{p}}.",
      elan: "Questo mese, Giove apre porte soprattutto nel tema di {{p}}.",
    },
  },
};
