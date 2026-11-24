// The names and headings of the report, in English. The other languages
// write their own pronouns with the agreement syntax ({he|she}, {his|her}):
// {{il}} and {{lui}} only exist in French. The sign and planet names are
// the ones the English pages of the site use.
export default {
  signes: {
    belier: { nom: 'Aries', en: 'in Aries' },
    taureau: { nom: 'Taurus', en: 'in Taurus' },
    gemeaux: { nom: 'Gemini', en: 'in Gemini' },
    cancer: { nom: 'Cancer', en: 'in Cancer' },
    lion: { nom: 'Leo', en: 'in Leo' },
    vierge: { nom: 'Virgo', en: 'in Virgo' },
    balance: { nom: 'Libra', en: 'in Libra' },
    scorpion: { nom: 'Scorpio', en: 'in Scorpio' },
    sagittaire: { nom: 'Sagittarius', en: 'in Sagittarius' },
    capricorne: { nom: 'Capricorn', en: 'in Capricorn' },
    verseau: { nom: 'Aquarius', en: 'in Aquarius' },
    poissons: { nom: 'Pisces', en: 'in Pisces' },
  },
  // `le` and `Le` follow a name ("Lea's Venus"), so they have no article.
  planetes: {
    soleil: { nom: 'Sun', le: 'Sun', Le: 'Sun', il: 'it' },
    lune: { nom: 'Moon', le: 'Moon', Le: 'Moon', il: 'it' },
    mercure: { nom: 'Mercury', le: 'Mercury', Le: 'Mercury', il: 'it' },
    venus: { nom: 'Venus', le: 'Venus', Le: 'Venus', il: 'it' },
    mars: { nom: 'Mars', le: 'Mars', Le: 'Mars', il: 'it' },
  },
  aspects: {
    conjonction: { nom: 'Conjunction' },
    sextile: { nom: 'Sextile' },
    carre: { nom: 'Square' },
    trigone: { nom: 'Trine' },
    opposition: { nom: 'Opposition' },
  },
  relations: {
    meme: 'Same element',
    allie: 'Friendly elements',
    contraste: 'Clashing elements',
  },
  ui: {
    titrePersonne: '{{p}}, {{planete}} {{en}}',
    doute: "{{p}}'s {{Planete}} changed sign on the day {he|she} was born. Without the time of birth, we use its position at noon, {{ici}}. If {{p}} was born early in the morning or late in the evening, it may have been {{en}}.",
    doutePlus: 'If it was {{en}}',
    lienAspect: '{{planetes}}',
    lienRelation: '{{planetes}}',
    croiseAspect: "{{x}}'s {{P1}} and {{y}}'s {{p2}}",
    croiseRelation: "{{x}}'s {{P1}} and {{y}}'s {{p2}}",
    atoutMeme: '{{planetes}}',
    atoutCroise: "{{x}}'s {{P1}} and {{y}}'s {{p2}}",
    chapitres: {
      soleil: {
        titre: 'Who you are deep down',
        intro: "In astrology, the Sun shows who a person is deep down, and what they need to feel good about themselves. It's the sign everyone knows, the one from the horoscope column. In a couple, it shows what each of you brings, and what you'd like the other to see in you.",
        vos: 'Your two Suns',
      },
      lune: {
        titre: 'Your emotions',
        intro: "The Moon is about emotions: what reassures you, what hurts, how you react after a bad day. It changes sign every two and a half days, so two people born in the same month almost never have the same one. In a couple, it tells you how to comfort each other.",
        vos: 'Your two Moons',
      },
      venus: {
        titre: 'How you love',
        intro: "Venus is how you love: what attracts you, how you show your love and what you expect in return. When someone says \"he never shows me he loves me\", it's often because the two Venuses don't speak the same language.",
        vos: 'Your two Venuses',
      },
      mars: {
        titre: 'Your desire and your arguments',
        intro: "Mars is about desire and energy, and also anger. It shows how each of you makes the first move, what turns you on and how you argue. Two Mars that get along often mean a couple who rarely fights and makes up fast.",
        vos: 'Your two Mars',
      },
      mercure: {
        titre: 'How you talk to each other',
        intro: "Mercury is about how you think and talk: working through a problem, writing a text, listening to each other. A lot of arguments come less from what is said than from how it's said, and that's exactly what Mercury looks at.",
        vos: 'Your two Mercurys',
      },
      liens: {
        titre: 'What connects you',
        intro: "Here, we put your two charts side by side: a planet of one of you facing a planet of the other. It's the part astrologers look at first in a couple, because that's where attraction and tenderness show up, and also what rubs.",
      },
    },
    fin: [
      "That's your shared sky. Keep in mind that it's a game: astrology doesn't predict anything, and no planet decides for you whether your relationship works.",
      "This report is mostly a way to talk about yourselves. Reread the parts that made you smile, and the ones that made you frown: that's often where there's something to say to each other.",
    ],
  },
};
