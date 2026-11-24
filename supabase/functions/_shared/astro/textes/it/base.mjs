// I nomi e i titoli del report, in italiano (con il «voi» per la coppia,
// come il resto del sito). I pronomi si scrivono con la sintassi
// dell'accordo ({lui|lei}, {lo|la}, {gli|le}): {{il}} e {{lui}} esistono
// solo in francese. I nomi dei segni sono quelli delle pagine italiane del
// sito. Le stringhe sono tra virgolette doppie, per gli apostrofi.
export default {
  signes: {
    belier: { nom: "Ariete", en: "in Ariete" },
    taureau: { nom: "Toro", en: "in Toro" },
    gemeaux: { nom: "Gemelli", en: "in Gemelli" },
    cancer: { nom: "Cancro", en: "in Cancro" },
    lion: { nom: "Leone", en: "in Leone" },
    vierge: { nom: "Vergine", en: "in Vergine" },
    balance: { nom: "Bilancia", en: "in Bilancia" },
    scorpion: { nom: "Scorpione", en: "in Scorpione" },
    sagittaire: { nom: "Sagittario", en: "in Sagittario" },
    capricorne: { nom: "Capricorno", en: "in Capricorno" },
    verseau: { nom: "Acquario", en: "in Acquario" },
    poissons: { nom: "Pesci", en: "in Pesci" },
  },
  // `le` serve in «la Venere di Giulia», `Le` a inizio frase.
  planetes: {
    soleil: { nom: "Sole", le: "il Sole", Le: "Il Sole", il: "lui" },
    lune: { nom: "Luna", le: "la Luna", Le: "La Luna", il: "lei" },
    mercure: { nom: "Mercurio", le: "il Mercurio", Le: "Il Mercurio", il: "lui" },
    venus: { nom: "Venere", le: "la Venere", Le: "La Venere", il: "lei" },
    mars: { nom: "Marte", le: "il Marte", Le: "Il Marte", il: "lui" },
  },
  aspects: {
    conjonction: { nom: "Congiunzione" },
    sextile: { nom: "Sestile" },
    carre: { nom: "Quadratura" },
    trigone: { nom: "Trigono" },
    opposition: { nom: "Opposizione" },
  },
  relations: {
    meme: "Stesso elemento",
    allie: "Elementi alleati",
    contraste: "Elementi opposti",
  },
  ui: {
    titrePersonne: "{{p}}, {{planete}} {{en}}",
    doute: "{{Planete}} di {{p}} ha cambiato segno il giorno della sua nascita. Senza l'ora, prendiamo la sua posizione a mezzogiorno, cioè {{ici}}. Se {{p}} è {nato|nata} presto la mattina o tardi la sera, {{planete}} potrebbe anche essere {{en}}.",
    doutePlus: "Se {{planete}} fosse {{en}}",
    lienAspect: "{{planetes}}",
    lienRelation: "{{planetes}}",
    croiseAspect: "{{P1}} di {{x}} e {{p2}} di {{y}}",
    croiseRelation: "{{P1}} di {{x}} e {{p2}} di {{y}}",
    atoutMeme: "{{planetes}}",
    atoutCroise: "{{P1}} di {{x}} e {{p2}} di {{y}}",
    chapitres: {
      soleil: {
        titre: "Chi siete nel profondo",
        intro: "In astrologia, il Sole dice com'è una persona nel profondo e di cosa ha bisogno per stare bene con sé stessa. È il segno che conoscono tutti, quello dell'oroscopo sul giornale. In una coppia, mostra cosa porta ognuno e cosa vorrebbe vedere riconosciuto dall'altro.",
        vos: "I vostri due Soli",
      },
      lune: {
        titre: "Le vostre emozioni",
        intro: "La Luna parla delle emozioni: cosa rassicura, cosa ferisce, come si reagisce dopo una brutta giornata. Cambia segno ogni due giorni e mezzo, quindi due persone nate nello stesso mese non hanno quasi mai la stessa. In una coppia, è lei a dire come consolare l'altro.",
        vos: "Le vostre due Lune",
      },
      venus: {
        titre: "Il vostro modo di amare",
        intro: "Venere è il modo di amare: cosa seduce, come si dimostra il proprio amore e cosa ci si aspetta in cambio. Quando qualcuno dice «non mi dimostra mai che mi ama», spesso le due Venere non parlano la stessa lingua.",
        vos: "Le vostre due Venere",
      },
      mars: {
        titre: "Il vostro desiderio e i vostri litigi",
        intro: "Marte parla del desiderio e dell'energia, e anche della rabbia. Dice come ognuno fa il primo passo, cosa lo attrae e come litiga. Quando i due Marte si intendono, spesso è una coppia che litiga poco e fa pace in fretta.",
        vos: "I vostri due Marte",
      },
      mercure: {
        titre: "Il vostro modo di parlarvi",
        intro: "Mercurio parla del modo di pensare e di parlare: discutere di un problema, scrivere un messaggio, ascoltare l'altro. Molti litigi nascono meno da quello che si dice che da come lo si dice, ed è proprio questo che guarda Mercurio.",
        vos: "I vostri due Mercurio",
      },
      liens: {
        titre: "Cosa vi unisce",
        intro: "Qui incrociamo i vostri due temi: un pianeta dell'uno di fronte a un pianeta dell'altro. È la parte che gli astrologi guardano per prima in una coppia, perché lì si vedono l'attrazione e la tenerezza, e anche quello che stride.",
      },
    },
    fin: [
      "Questo è il vostro cielo a due. Ricordate che è un gioco: l'astrologia non predice niente, e nessun pianeta decide al posto vostro se la vostra coppia funziona.",
      "Questo report serve soprattutto a parlare di voi. Rileggete le parti che vi hanno fatto sorridere, e quelle che vi hanno fatto storcere il naso: spesso è proprio lì che c'è qualcosa da dirsi.",
    ],
  },
};
