// Les signes chinois et les chemins de vie. Les portraits parlent d'une
// personne ({{p}}, {{il}}, {masc|fém}), les relations s'adressent au couple.
export default {
  chinois: {
    titres: {
      trine: 'Le même triangle',
      harmonie: 'Amis secrets',
      meme: 'Le même animal',
      neutre: 'Ni alliés ni rivaux',
      nuisance: 'Une paire qui s\'use',
      opposition: 'Face à face',
    },
    relations: {
      trine: "Dans l'astrologie chinoise, vos deux animaux font partie du même triangle d'affinité, le lien le plus recherché pour un couple. Vous avancez au même rythme et vous voulez à peu près les mêmes choses de la vie. Les décisions importantes se prennent sans bras de fer, et vous vous sentez du même côté.",
      harmonie: "Vos deux animaux forment une des six paires d'« amis secrets » de l'astrologie chinoise. Vous êtes très différents, mais chacun apporte à l'autre ce qui lui manque, et ça se fait presque sans y penser. C'est un lien discret et solide.",
      meme: "Vous êtes {v:nés|nées} sous le même animal chinois. Vous vous comprenez vite, parce que vous avez le même tempérament, avec les mêmes qualités et les mêmes défauts. Attention à ne pas vous renvoyer en miroir ce que vous n'aimez pas chez vous.",
      neutre: "Vos deux animaux n'ont ni affinité particulière ni tension marquée dans la tradition chinoise. Rien ne vous pousse l'un vers l'autre, rien ne vous sépare non plus : votre entente dépend de vous, bien plus que de vos signes.",
      nuisance: "Vos deux animaux forment une des six paires que la tradition chinoise appelle « de nuisance ». Ce n'est pas une incompatibilité, plutôt de petits agacements qui reviennent. Le remède est simple : vous dire tôt ce qui vous agace, avant que ça s'accumule.",
      opposition: "Vos deux animaux sont face à face sur la roue chinoise, à six signes d'écart. C'est l'axe le plus tendu de l'astrologie chinoise, et souvent le plus attirant au début. Vos différences vous plaisent et vous fatiguent à la fois, et chacun doit accepter que l'autre ne fonctionne pas comme lui.",
    },
    elements: {
      meme: "Vous partagez aussi le même élément chinois : vous avez la même façon d'avancer dans la vie.",
      nourrit: "Vos éléments chinois se nourrissent, comme le bois nourrit le feu. L'un donne de l'élan à l'autre, et vous êtes plus {v:forts|fortes} ensemble.",
      controle: "Vos éléments chinois se contrôlent, comme l'eau éteint le feu. L'un a tendance à freiner l'autre, parfois pour son bien, parfois trop. Laissez à chacun la place d'avancer à son rythme.",
    },
    animaux: {
      rat: "{{p}} est du signe du Rat. En amour, {{il}} est {vif|vive} et {malin|maligne}, et {{il}} a toujours une idée de sortie en tête. {{Il}} tient énormément à sa famille et aux gens qu'{{il}} aime, quitte à s'inquiéter un peu trop pour l'argent ou pour l'avenir.",
      buffle: "{{p}} est du signe du Buffle. En amour, {{il}} construit lentement mais solidement, et on peut compter sur {{lui}} sans réserve. {{Il}} n'aime pas trop les surprises. Sa tendresse est discrète : elle se voit dans ce qu'{{il}} fait pour l'autre, rarement dans de grands mots.",
      tigre: "{{p}} est du signe du Tigre. En amour, {{il}} aime les histoires intenses et {{il}} a le courage de ses sentiments. {{Il}} supporte mal qu'on lui donne des ordres, et {{il}} a besoin de liberté pour rester {heureux|heureuse}. Avec {{lui}}, la vie est rarement ennuyeuse.",
      lapin: "{{p}} est du signe du Lapin, qu'on appelle aussi le Chat. En amour, {{il}} est {doux|douce} et {délicat|délicate}, et les conflits {le|la} fatiguent vite. {{Il}} a besoin d'un foyer paisible pour s'épanouir, et {{il}} sait mieux que personne rendre la maison agréable.",
      dragon: "{{p}} est du signe du Dragon. {{Il}} a du charisme et de l'ambition, et en amour {{il}} aime impressionner. {{Il}} donne beaucoup, mais {{il}} attend aussi beaucoup, et rien ne l'ennuie plus qu'une relation banale.",
      serpent: "{{p}} est du signe du Serpent. En amour, {{il}} est {mystérieux|mystérieuse} et réfléchit longtemps avant de s'engager. Son intuition {le|la} trompe rarement. {{Il}} peut se montrer {jaloux|jalouse} quand {{il}} se sent {menacé|menacée}, mais {{il}} est d'une grande fidélité.",
      cheval: "{{p}} est du signe du Cheval. {{Il}} tombe {amoureux|amoureuse} vite et avec enthousiasme. {{Il}} a besoin de mouvement et d'espace, et une relation trop étouffante {le|la} fait fuir. Avec {{lui}}, il faut des projets et du grand air.",
      chevre: "{{p}} est du signe de la Chèvre. En amour, {{il}} est tendre et {{il}} a besoin de se sentir {protégé|protégée}. {{Il}} aime les jolies choses, la musique et les soirées douces à la maison, et {{il}} a souvent une vraie fibre artistique.",
      singe: "{{p}} est du signe du Singe. En amour, {{il}} est drôle et plein{|e} d'imagination. {{Il}} adore surprendre l'autre, et {{il}} s'ennuie vite si la relation manque de jeu. Ses blagues sont souvent sa façon de dire qu'{{il}} tient à quelqu'un.",
      coq: "{{p}} est du signe du Coq. En amour, {{il}} est {franc|franche} et aime que les choses soient claires. {{Il}} soigne les détails, de sa tenue aux dates importantes, et {{il}} montre son amour en étant fiable. {{Il}} a sa fierté, et les critiques {le|la} touchent plus qu'{{il}} ne le montre.",
      chien: "{{p}} est du signe du Chien. En amour, la confiance passe avant tout. {{Il}} est {loyal|loyale} et {protecteur|protectrice}, et {{il}} défend son couple contre vents et marées. Une fois qu'{{il}} a donné son cœur, {{il}} ne le reprend pas facilement.",
      cochon: "{{p}} est du signe du Cochon. En amour, {{il}} est {généreux|généreuse} et sincère, et {{il}} aime les plaisirs simples partagés à deux, un bon repas ou une grasse matinée. {{Il}} pardonne facilement, parfois trop.",
    },
  },
  vie: {
    nombres: {
      1: "Le chemin de vie de {{p}} est le 1, celui des pionniers. En amour, {{il}} aime prendre des initiatives et avancer. {{Il}} a besoin d'un couple qui respecte son indépendance.",
      2: "Le chemin de vie de {{p}} est le 2, le nombre du lien. {{Il}} est {fait|faite} pour la vie à deux : {{il}} écoute, soutient et arrondit les angles. {{Il}} a besoin de se sentir {aimé|aimée} et utile pour s'épanouir.",
      3: "Le chemin de vie de {{p}} est le 3, celui de la joie et de la parole. En amour, {{il}} apporte de la légèreté, de l'humour et des idées. {{Il}} a besoin d'un couple où l'on rit et où l'on se parle.",
      4: "Le chemin de vie de {{p}} est le 4, celui des bâtisseurs. En amour, {{il}} est fiable et {travailleur|travailleuse}, et {{il}} construit sur la durée. {{Il}} a besoin de stabilité et de projets concrets.",
      5: "Le chemin de vie de {{p}} est le 5, celui de la liberté. En amour, {{il}} a besoin de changement, de voyages et de nouveauté. Une relation trop routinière l'ennuie vite.",
      6: "Le chemin de vie de {{p}} est le 6, le nombre de l'amour et de la famille. {{Il}} prend soin des autres, met de l'harmonie partout et a le sens des responsabilités. Le couple et le foyer comptent énormément pour {{lui}}.",
      7: "Le chemin de vie de {{p}} est le 7, celui de la réflexion. En amour, {{il}} a besoin de profondeur, de conversations qui ont du sens et de moments {seul|seule} pour se ressourcer.",
      8: "Le chemin de vie de {{p}} est le 8, celui de l'ambition. En amour, {{il}} est {fort|forte} et {protecteur|protectrice}, et {{il}} aime construire une vie confortable. {{Il}} doit veiller à garder du temps pour le couple.",
      9: "Le chemin de vie de {{p}} est le 9, celui de la générosité. En amour, {{il}} donne beaucoup, pense aux autres et rêve d'un idéal. {{Il}} a besoin d'un couple qui partage ses valeurs.",
      11: "Le chemin de vie de {{p}} est le 11, un nombre maître, celui de l'intuition. En amour, {{il}} est très sensible et {inspiré|inspirée}, et {{il}} sent les choses avant qu'elles soient dites.",
      22: "Le chemin de vie de {{p}} est le 22, un nombre maître, celui des grands projets. En amour, {{il}} voit loin et veut construire quelque chose de solide, qui dure.",
      33: "Le chemin de vie de {{p}} est le 33, un nombre maître très rare, celui du dévouement. En amour, {{il}} donne énormément, parfois au point de s'oublier.",
    },
    accord: {
      haut: "Vos chemins de vie s'accordent très bien : en numérologie, vos deux nombres vont dans le même sens et se soutiennent.",
      moyen: "Vos chemins de vie s'entendent bien, avec des différences qui vous enrichissent.",
      bas: "Vos chemins de vie sont assez différents : vous n'avancez pas au même rythme, et il faut respecter celui de l'autre.",
    },
  },
};
