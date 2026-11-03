import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "idees-de-rendez-vous-amoureux",
  title: "50 idées de rendez-vous amoureux, de la sortie gratuite au grand soir",
  metaTitle: "Idées de rendez-vous amoureux : 50 idées, gratuites ou pas",
  metaDescription: "Cinquante idées de rendez-vous amoureux : sorties gratuites, dates à petit budget, idées actives, originales, et les grands soirs. Avec ce qui fait un bon date.",
  featuredImage: "/blog/idees-de-rendez-vous-amoureux.webp",
  featuredImageAlt: "Les deux personnages de Quiz Couple à vélo l'un derrière l'autre sur un chemin, un panier de pique-nique à l'arrière",
  publishedAt: "2027-02-01T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "Cinquante idées de rendez-vous amoureux, classées par budget et par humeur : gratuites, pas chères, actives, originales, et les grands soirs. Et la règle qui fait qu'un date marche.",
  introduction: `<p>Une idée de rendez-vous amoureux, ce n'est pas forcément un restaurant. <strong>C'est un moment décidé à l'avance, à deux, différent de d'habitude</strong>. Un mardi à la patinoire compte autant qu'un samedi aux chandelles, et souvent plus, parce qu'on s'en souvient.</p>
<p>En voici cinquante, classées par budget et par envie, des sorties gratuites aux grands soirs, avec la règle simple qui fait qu'un rendez-vous rallume quelque chose au lieu de tomber à plat.</p>`,
  quickSummary: [
    "Un bon rendez-vous a trois ingrédients : c'est prévu, c'est à deux sans téléphone, et c'est différent de la semaine.",
    "Les couples qui se réservent un vrai moment à deux chaque semaine ont environ trois fois et demie plus de chances de se dire très heureux ensemble.",
    "Les sorties où on fait quelque chose de nouveau et d'un peu physique (danser, grimper, pédaler) rapprochent plus qu'un dîner, d'après les travaux d'Arthur Aron.",
    "Gratuit marche aussi bien que cher : une balade de nuit, un marché, un musée le premier dimanche du mois.",
    "L'erreur la plus fréquente : attendre d'avoir « le temps ». Le rendez-vous se bloque dans l'agenda, comme le reste.",
  ],
  sections: [
    {
      id: "la-regle",
      title: "Ce qui fait un bon rendez-vous amoureux",
      content: `<p>Avant la liste, une règle, parce que la même idée peut être un très bon moment ou une corvée selon la façon de s'y prendre. <strong>Un rendez-vous amoureux, c'est prévu, c'est à deux, et c'est différent.</strong></p>
<ul>
<li><strong>Prévu :</strong> une date dans l'agenda, pas « un de ces jours ». Une étude de l'université de Virginie sur plus de 1 600 couples mariés a trouvé que ceux qui avaient un vrai moment en tête-à-tête au moins une fois par semaine avaient environ trois fois et demie plus de chances de se dire très heureux ensemble. Pas une fois par mois quand ça tombe : une fois par semaine, décidé.</li>
<li><strong>À deux :</strong> sans les enfants, sans les amis, sans les téléphones. Un dîner où chacun regarde son écran n'est pas un rendez-vous, c'est un dîner.</li>
<li><strong>Différent :</strong> pas le restaurant de toujours ni la série du soir. Le cerveau ne se réveille que devant ce qu'il ne connaît pas, c'est toute l'idée du dossier sur <a href="/blog/raviver-la-flamme-dans-son-couple/">la façon de raviver la flamme dans son couple</a>.</li>
</ul>
<p>Et un dernier point, le plus utile : alternez qui organise. Une semaine toi, une semaine l'autre, sans se concerter. Chacun découvre ce que l'autre a choisi, et la surprise fait la moitié du plaisir.</p>`,
    },
    {
      id: "gratuits",
      title: "Dix rendez-vous gratuits",
      content: `<ul>
<li><strong>La balade de nuit :</strong> votre quartier après 22 h, quand tout est fermé. On ne le reconnaît pas.</li>
<li><strong>Le musée gratuit :</strong> le premier dimanche du mois dans la plupart des musées nationaux, et les musées municipaux toute l'année.</li>
<li><strong>Le marché sans liste :</strong> on achète ce qui fait envie, et on cuisine ce qu'on a trouvé.</li>
<li><strong>Le lever de soleil :</strong> un thermos, une couverture, un point haut. Une fois par an au moins.</li>
<li><strong>Le pique-nique du soir :</strong> dans un parc, un jardin public, au bord de l'eau, avec ce qu'il y a dans le frigo.</li>
<li><strong>La bibliothèque :</strong> chacun choisit un livre pour l'autre, et on se le raconte la semaine d'après.</li>
<li><strong>Le concert gratuit :</strong> les kiosques, les fêtes de la musique, les répétitions ouvertes des conservatoires.</li>
<li><strong>La visite de sa ville en touriste :</strong> l'office du tourisme, un plan, et les trois monuments devant lesquels vous passez sans jamais entrer.</li>
<li><strong>Le ciel :</strong> une nuit d'août pour les étoiles filantes, loin des lumières, allongés dans l'herbe.</li>
<li><strong>Le retour au premier lieu :</strong> le banc, le café, le quai où vous vous êtes vus la première fois. On y retourne, et on se raconte.</li>
</ul>`,
    },
    {
      id: "petit-budget",
      title: "Dix rendez-vous à moins de 30 €",
      content: `<ul>
<li><strong>Le cinéma du mardi :</strong> tarif réduit presque partout, et un film qu'aucun des deux n'aurait choisi seul.</li>
<li><strong>Le petit-déjeuner dehors :</strong> un café et des viennoiseries en terrasse, un samedi, avant que la ville se réveille.</li>
<li><strong>La patinoire :</strong> on tombe, on rit, on se tient. Le meilleur rapport fou rire sur euro.</li>
<li><strong>Le bar à jeux :</strong> deux boissons et un jeu de société qu'on ne connaît pas. Il y en a dans toutes les grandes villes.</li>
<li><strong>Le karaoké :</strong> une salle privée pour deux, une heure, et personne ne juge.</li>
<li><strong>Le food truck :</strong> deux plats de rue mangés sur un muret, les pieds dans le vide.</li>
<li><strong>La piscine en nocturne :</strong> beaucoup de piscines ouvrent tard un soir par semaine, et c'est vide.</li>
<li><strong>La friperie :</strong> chacun habille l'autre pour 15 €, et on sort comme ça.</li>
<li><strong>Le minigolf :</strong> ridicule, compétitif, parfait.</li>
<li><strong>La dégustation :</strong> trois fromages ou trois bières qu'on ne connaît pas, à la maison, avec des notes sur dix.</li>
</ul>`,
    },
    {
      id: "actifs",
      title: "Dix rendez-vous actifs, pour faire du neuf ensemble",
      content: `<p>Ceux-là sont les plus efficaces, et ce n'est pas une impression. En 2000, le psychologue Arthur Aron a montré que des couples qui faisaient ensemble une activité nouvelle et un peu physique, même sept minutes, se disaient ensuite plus satisfaits de leur relation. <strong>Ce qui compte, c'est que vous soyez débutants tous les deux.</strong></p>
<ul>
<li><strong>Le cours de danse :</strong> rock, salsa, tango, peu importe. On se marche dessus, et on se tient.</li>
<li><strong>L'escalade en salle :</strong> l'un grimpe, l'autre assure. Difficile de faire plus « je te fais confiance ».</li>
<li><strong>La randonnée avec un sommet :</strong> un but, une montée, un sandwich en haut.</li>
<li><strong>Le vélo jusqu'à un endroit où vous n'êtes jamais allés :</strong> trente kilomètres, un village, un café, et retour.</li>
<li><strong>Le cours de cuisine :</strong> ou une recette compliquée à la maison, avec une vidéo et beaucoup de farine.</li>
<li><strong>L'escape game :</strong> une heure à résoudre des énigmes à deux. On découvre qui panique et qui réfléchit.</li>
<li><strong>Le canoë ou le paddle :</strong> l'été, sur une rivière calme. Quelqu'un finira dans l'eau.</li>
<li><strong>L'accrobranche :</strong> la peur partagée rapproche, c'est prouvé, et il y a des arbres.</li>
<li><strong>Le bowling :</strong> ou le billard, ou les fléchettes. Un sport de bar, avec un score.</li>
<li><strong>Le laser game :</strong> à deux contre des inconnus, ou l'un contre l'autre. Les deux marchent.</li>
</ul>`,
      tip: "Si l'un des deux est très fort dans l'activité, elle perd son effet : ce n'est plus de la découverte, c'est une leçon. Choisis quelque chose où vous êtes nuls tous les deux.",
    },
    {
      id: "originaux",
      title: "Dix rendez-vous originaux",
      content: `<ul>
<li><strong>Le rendez-vous à l'aveugle :</strong> l'un des deux organise tout, l'autre ne sait rien jusqu'au dernier moment, même pas comment s'habiller.</li>
<li><strong>Le train au hasard :</strong> à la gare, le premier train régional qui part, descente à la troisième gare, et on explore.</li>
<li><strong>La soirée d'une autre décennie :</strong> musique, film et plat des années 80, ou 50, ou 2000.</li>
<li><strong>Le pile ou face :</strong> à chaque carrefour, la pièce décide. On finit là où on finit.</li>
<li><strong>Le rendez-vous comme au premier jour :</strong> vous arrivez séparément au bar, vous faites comme si vous ne vous connaissiez pas, et vous vous draguez.</li>
<li><strong>Le cours de poterie, de peinture ou de céramique :</strong> on repart avec un objet moche et précieux.</li>
<li><strong>La nuit à l'hôtel de sa propre ville :</strong> une chambre à dix minutes de chez vous. Tout change quand ce n'est pas votre lit.</li>
<li><strong>L'observatoire ou le planétarium :</strong> dans la plupart des grandes villes, et presque personne n'y va.</li>
<li><strong>Le marché aux puces avec un budget de 10 € :</strong> chacun trouve un cadeau pour l'autre, et on les ouvre au café d'à côté.</li>
<li><strong>La lettre lue à voix haute :</strong> chacun écrit une lettre à l'autre pendant la semaine, et on se les lit un soir, quelque part de beau.</li>
</ul>`,
    },
    {
      id: "grands-soirs",
      title: "Cinq grands soirs",
      content: `<p>Pour les anniversaires, les retrouvailles, ou simplement parce que ça fait longtemps :</p>
<ul>
<li><strong>Le restaurant dont on parle depuis des mois :</strong> celui qu'on « se fera un jour ». Réserve, c'est tout.</li>
<li><strong>Le concert ou le spectacle :</strong> l'artiste que l'autre adore, les places prises trois mois avant, le secret gardé jusqu'au soir.</li>
<li><strong>La nuit insolite :</strong> cabane dans les arbres, bulle, péniche, roulotte. Il y en a à une heure de chez vous.</li>
<li><strong>Le week-end à deux :</strong> pas forcément loin ni cher, le <a href="/blog/week-end-en-amoureux-pas-cher/">week-end en amoureux sans se ruiner</a> est à portée de tout le monde.</li>
<li><strong>Le rendez-vous d'il y a dix ans :</strong> refaire, à l'identique, votre premier vrai rendez-vous. Même lieu, même plat si possible, et comparer.</li>
</ul>`,
    },
    {
      id: "a-la-maison",
      title: "Et quand on ne peut pas sortir",
      content: `<p>Les enfants, la fatigue, le compte en banque, la pluie : il y a des semaines où sortir n'est pas possible. Ce n'est pas une raison pour laisser tomber le rendez-vous. Il se fait à la maison, avec les mêmes règles : une heure de début, pas d'écran, et une idée, pas le plateau télé de tous les soirs. Il y a vingt-cinq façons de faire dans l'article sur <a href="/blog/soiree-en-amoureux-a-la-maison/">la soirée en amoureux à la maison</a>, et pour les mois où il fait nuit à 17 h, les <a href="/blog/activites-couple-hiver/">activités de couple en hiver</a> ont les leurs.</p>
<p>Un dernier conseil, le plus important : ne cherche pas l'idée parfaite. Le rendez-vous raté parce qu'il pleuvait, le restaurant fermé, le film nul, ce sont ceux dont on se souvient. Ce qui compte, c'est que ce soit prévu, et que vous y alliez. Et si vous voulez savoir ce que l'autre aimerait, au lieu de deviner, le site propose <a href="/tu-preferes-couple-quiz/">un jeu de « tu préfères » à faire à deux</a> : vous y apprendrez en dix minutes qu'il préfère la montagne et vous la mer.</p>
<a href="/blog/raviver-la-flamme-dans-son-couple/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lire aussi</span><span class="blog-read-also-title">Raviver la flamme dans son couple : ce qui marche, et par où commencer</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
