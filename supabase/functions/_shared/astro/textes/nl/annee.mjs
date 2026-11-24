// De komende twaalf maanden. {{venus}}, {{mars}} en {{jupiter}} krijgen het
// teken waar de planeet die maand doorheen gaat (‘in Stier’). De teksten met
// dezelfde toon wisselen elkaar van maand tot maand af.
export default {
  mois: {
    titres: {
      tendre: "Een tedere maand",
      passion: "Een vurige maand",
      elan: "Een maand met de wind in de rug",
      malentendus: "Pas op voor misverstanden",
      turbulences: "Een woelige maand",
      calme: "Een rustige maand",
    },
    tendre: [
      "Venus staat {{venus}} en maakt jullie hemel zachter. Het is de ideale maand voor lieve woorden, avonden thuis en de kleine attenties die je de rest van het jaar vergeet.",
      "Met Venus {{venus}} is de tederheid er. Maak er gebruik van om elkaar te verwennen, zomaar een klein cadeautje te geven of een gewoonte op te pakken die jullie kwijt waren.",
      "Venus {{venus}} brengt jullie dichter bij elkaar. Spanningen zakken makkelijker, en het is een goed moment om het bij te leggen als er iets was blijven hangen.",
      "Een zachte maand, met Venus {{venus}}. Neem tijd voor elkaar, zonder telefoon, gewoon voor het plezier van samen zijn.",
    ],
    passion: [
      "Mars staat {{mars}} en zet jullie hemel in vuur en vlam. Het verlangen stijgt, en de energie ook: het is een maand voor verrassingen en plotselinge ingevingen.",
      "Met Mars {{mars}} is de aantrekking sterk. Gebruik die energie om uit de sleur te breken, en let op ruzies, die ook snel kunnen oplaaien.",
      "Mars {{mars}} wekt jullie zin op. Een weekend op het laatste moment of een avond die anders is dan anders: deze maand houdt van durf.",
      "Een vurige maand, met Mars {{mars}}. Het verlangen is er, het geduld iets minder. Tel tot tien voordat je in het heetst van de strijd reageert.",
    ],
    elan: [
      "Jupiter, de planeet van het geluk, staat {{jupiter}} en lacht jullie plannen toe. Het is een goede maand om samen een project te starten, een reis te boeken of een beslissing te nemen die jullie steeds uitstelden.",
      "Met Jupiter {{jupiter}} staat het optimisme aan jullie kant. Goed nieuws komt makkelijker, en jullie hebben zin om groot te denken.",
      "Jupiter {{jupiter}} geeft jullie vaart. Praat over jullie dromen voor de toekomst en maak plannen: deze maand houdt van projecten.",
    ],
    malentendus: [
      "Mercurius gaat een groot deel van de maand achteruit: in de astrologie is dat de tijd van misverstanden en verkeerd begrepen berichtjes. Lees alles nog eens voordat je het verstuurt, en neem geen grote beslissingen in een opwelling.",
      "Mercurius retrograde brengt de communicatie een beetje in de war. Het is een maand om terug te komen op oude gesprekken in plaats van nieuwe te beginnen, en om elkaar het voordeel van de twijfel te geven.",
      "Met Mercurius retrograde kunnen woorden deze maand verder gaan dan de bedoeling. Als een zin je raakt, vraag dan wat de ander bedoelde voordat je reageert.",
    ],
    turbulences: [
      "Deze maand is de hemel wat onrustig voor jullie: vermoeidheid en kleine wrijvingen kunnen ruimte innemen. Laat niets ophopen, en houd rustige momenten vrij om samen door te brengen.",
      "Een maand waarin jullie stemmingen kunnen botsen. Het is niet het moment voor grote discussies: kies liever voor zachtheid, en bewaar gevoelige onderwerpen voor later.",
      "De planeten schudden jullie een beetje door elkaar. Niets ernstigs, maar een beetje geduld van beide kanten bespaart jullie veel nutteloze ruzies.",
    ],
    calme: [
      "Een rustige maand, zonder grote bewegingen in jullie hemel. Maak er gebruik van om op adem te komen, en gun jezelf een eenvoudig moment, gewoon voor het plezier.",
      "Niets bijzonders in de hemel deze maand: jullie relatie gaat in haar eigen tempo verder. Vaak bouw je juist in zulke maanden het meest op, zonder het te merken.",
      "Een kalme maand, ideaal voor de kleine gewoonten die goeddoen, zoals een etentje zonder schermen of een wandeling op zondag.",
      "Deze maand laat de hemel jullie met rust. Geen grote golven aan de horizon: het is het moment om goed voor jullie dagelijks leven te zorgen.",
    ],
    notes: {
      mercure: "Mercurius retrograde van {{du}} tot {{au}}",
      venus: "Venus retrograde van {{du}} tot {{au}}",
      mars: "Mars retrograde van {{du}} tot {{au}}",
      anniversaire: "Verjaardag van {{p}}",
    },
    // Komt bij de tekst als de planeet van de maand vooral een van de twee
    // raakt.
    vedette: {
      tendre: "Deze maand raakt Venus vooral de horoscoop van {{p}}.",
      passion: "Deze maand maakt Mars vooral de horoscoop van {{p}} wakker.",
      elan: "Deze maand opent Jupiter vooral deuren in de horoscoop van {{p}}.",
    },
  },
};
