// De namen en titels van het rapport, in het Nederlands (met ‘jullie’ voor
// het stel en ‘je’ voor ieder, zoals de rest van de site). De
// voornaamwoorden staan in de overeenstemmingsschrijfwijze ({hij|zij},
// {hem|haar}, {zijn|haar}): {{il}} en {{lui}} bestaan alleen in het Frans.
// De namen van de tekens zijn die van de Nederlandse pagina's van de site.
// De teksten staan tussen dubbele aanhalingstekens, voor de apostrofs.
export default {
  signes: {
    belier: { nom: "Ram", en: "in Ram" },
    taureau: { nom: "Stier", en: "in Stier" },
    gemeaux: { nom: "Tweelingen", en: "in Tweelingen" },
    cancer: { nom: "Kreeft", en: "in Kreeft" },
    lion: { nom: "Leeuw", en: "in Leeuw" },
    vierge: { nom: "Maagd", en: "in Maagd" },
    balance: { nom: "Weegschaal", en: "in Weegschaal" },
    scorpion: { nom: "Schorpioen", en: "in Schorpioen" },
    sagittaire: { nom: "Boogschutter", en: "in Boogschutter" },
    capricorne: { nom: "Steenbok", en: "in Steenbok" },
    verseau: { nom: "Waterman", en: "in Waterman" },
    poissons: { nom: "Vissen", en: "in Vissen" },
  },
  // `le` staat in ‘de Venus van Sanne’, `Le` aan het begin van een zin.
  planetes: {
    soleil: { nom: "Zon", le: "de Zon", Le: "De Zon", il: "zij" },
    lune: { nom: "Maan", le: "de Maan", Le: "De Maan", il: "zij" },
    mercure: { nom: "Mercurius", le: "de Mercurius", Le: "De Mercurius", il: "hij" },
    venus: { nom: "Venus", le: "de Venus", Le: "De Venus", il: "zij" },
    mars: { nom: "Mars", le: "de Mars", Le: "De Mars", il: "hij" },
  },
  aspects: {
    conjonction: { nom: "Conjunctie" },
    sextile: { nom: "Sextiel" },
    carre: { nom: "Vierkant" },
    trigone: { nom: "Driehoek" },
    opposition: { nom: "Oppositie" },
  },
  relations: {
    meme: "Hetzelfde element",
    allie: "Bevriende elementen",
    contraste: "Tegengestelde elementen",
  },
  ui: {
    titrePersonne: "{{p}}, {{planete}} {{en}}",
    doute: "{{Planete}} van {{p}} veranderde van teken op de dag van {zijn|haar} geboorte. Zonder geboortetijd rekenen we met de stand om 12.00 uur 's middags, dus {{ici}}. Als {{p}} vroeg in de ochtend of laat op de avond geboren is, kan {{planete}} ook {{en}} staan.",
    doutePlus: "Als {{planete}} {{en}} staat",
    lienAspect: "{{planetes}}",
    lienRelation: "{{planetes}}",
    croiseAspect: "{{P1}} van {{x}} en {{p2}} van {{y}}",
    croiseRelation: "{{P1}} van {{x}} en {{p2}} van {{y}}",
    atoutMeme: "{{planetes}}",
    atoutCroise: "{{P1}} van {{x}} en {{p2}} van {{y}}",
    chapitres: {
      soleil: {
        titre: "Wie jullie in de kern zijn",
        intro: "In de astrologie laat de Zon zien wie iemand in de kern is en wat die nodig heeft om zich goed te voelen. Het is het teken dat iedereen kent, dat van de horoscoop in de krant. In een relatie laat de Zon zien wat ieder meebrengt en graag door de ander erkend ziet.",
        vos: "Jullie twee Zonnen",
      },
      lune: {
        titre: "Jullie gevoelens",
        intro: "De Maan gaat over gevoelens: wat geruststelt, wat pijn doet, hoe je reageert na een slechte dag. Ze verandert om de tweeënhalve dag van teken, dus twee mensen die in dezelfde maand geboren zijn, hebben bijna nooit dezelfde. In een relatie zegt de Maan hoe je de ander troost.",
        vos: "Jullie twee Manen",
      },
      venus: {
        titre: "Hoe jullie liefhebben",
        intro: "Venus is de manier van liefhebben: wat je aantrekt, hoe je je liefde toont en wat je terugverwacht. Als iemand zegt: “Hij laat nooit zien dat hij van me houdt”, spreken de twee Venusstanden vaak gewoon niet dezelfde taal.",
        vos: "Jullie twee Venusstanden",
      },
      mars: {
        titre: "Jullie verlangen en jullie ruzies",
        intro: "Mars gaat over verlangen en energie, en ook over boosheid. Mars laat zien hoe iemand de eerste stap zet, wat die aantrekt en hoe die ruziemaakt. Als de twee Marsstanden het goed met elkaar kunnen vinden, is het vaak een stel dat weinig ruzie heeft en het snel weer goedmaakt.",
        vos: "Jullie twee Marsstanden",
      },
      mercure: {
        titre: "Hoe jullie met elkaar praten",
        intro: "Mercurius gaat over de manier van denken en praten: een probleem bespreken, een bericht schrijven, naar de ander luisteren. Veel ruzies komen minder door wat je zegt dan door hoe je het zegt, en precies daar kijkt Mercurius naar.",
        vos: "Jullie twee Mercuriusstanden",
      },
      liens: {
        titre: "Wat jullie verbindt",
        intro: "Hier leggen we jullie twee horoscopen over elkaar: een planeet van de een tegenover een planeet van de ander. Dit deel bekijken astrologen bij een stel als eerste, want hier zie je de aantrekking en de tederheid, en ook wat schuurt.",
      },
    },
    fin: [
      "Dit is jullie gedeelde hemel. Onthoud dat het een spel is: de astrologie voorspelt niets, en geen enkele planeet beslist voor jullie of jullie relatie werkt.",
      "Dit rapport is vooral een aanleiding om over jullie te praten. Lees de stukken nog eens die jullie aan het glimlachen brachten, en die waarbij jullie fronsten: vaak valt daar iets te bespreken.",
    ],
  },
};
