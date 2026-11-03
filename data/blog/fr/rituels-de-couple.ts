import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "rituels-de-couple",
  title: "Rituels de couple : 30 petites habitudes qui font tenir un couple, d'après Gottman",
  metaTitle: "Rituels de couple : 30 habitudes qui font tenir un couple",
  metaDescription: "Rituels de couple : pourquoi ils comptent plus que les grandes surprises, trente idées du réveil au coucher et sur l'année, et ce qui les sépare de la routine.",
  featuredImage: "/blog/rituels-de-couple.webp",
  featuredImageAlt: "Les deux personnages de Quiz Couple à une table de cuisine le matin avec deux tasses fumantes, le soleil par la fenêtre",
  publishedAt: "2027-02-11T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "Le café du matin, le baiser de six secondes, la question du soir : les rituels de couple comptent plus que les grands gestes. Trente idées, du réveil à l'anniversaire, et la différence avec la routine.",
  introduction: `<p>Un rituel de couple, c'est une petite chose qui revient, toujours pareille, et qui fait qu'on se retrouve : le café du matin ensemble, le baiser en partant, la question du soir. <strong>Ça ne coûte rien, ça prend deux minutes, et d'après quarante ans d'observation de couples, c'est ce qui les fait tenir</strong>, bien plus que les grandes surprises.</p>
<p>Voici pourquoi ça marche, trente rituels du réveil au coucher et sur l'année, et la différence entre un rituel qui nourrit et une routine qui use.</p>`,
  quickSummary: [
    "John Gottman, qui a observé des milliers de couples, met les « rituels de connexion » parmi les premières choses qui distinguent les couples qui durent.",
    "Un rituel, c'est une habitude choisie et chargée de sens ; une routine, c'est une habitude subie. Le même café du matin peut être l'un ou l'autre.",
    "Les rituels les plus efficaces sont les plus courts : le baiser de six secondes, la question du soir, les vingt minutes où on se raconte sa journée.",
    "Un couple a besoin de rituels à trois échelles : la journée, la semaine, l'année.",
    "Il ne faut pas en avoir trente : trois qui tiennent valent mieux que dix abandonnés en janvier.",
  ],
  sections: [
    {
      id: "pourquoi-ca-marche",
      title: "Pourquoi les rituels comptent plus que les surprises",
      content: `<p>John Gottman observe des couples depuis quarante ans dans son laboratoire de Seattle, et il a fini par prédire, en regardant un couple quinze minutes, s'il serait encore ensemble six ans plus tard. Ce qu'il regarde, ce ne sont pas les vacances ni les cadeaux. Ce sont les petits moments : <strong>est-ce que les deux se tournent l'un vers l'autre, plusieurs fois par jour, pour un rien ?</strong> Un café apporté, une remarque sur la météo, un regard quand l'autre parle. Les couples qui tenaient répondaient à ces petits appels 86 fois sur 100. Ceux qui se séparaient, 33 fois sur 100.</p>
<p>Les rituels, c'est la façon de garantir ces moments. Gottman les appelle les rituels de connexion, et il les recommande à tous les couples qu'il reçoit : des choses qui reviennent à heure fixe, et qui obligent à se regarder. Une revue de cinquante ans de recherches sur les routines et les rituels familiaux, publiée en 2002 par la psychologue Barbara Fiese, va dans le même sens : les familles qui ont des rituels, repas, fêtes, habitudes du soir, ont des couples plus satisfaits et des enfants qui vont mieux.</p>
<p>Et il y a une raison plus simple. Une surprise, c'est une fois. Un rituel, c'est trois cents fois par an. À la fin de l'année, ce sont les trois cents fois qui ont fait le couple. C'est pour ça que le dossier sur <a href="/blog/raviver-la-flamme-dans-son-couple/">la façon de raviver la flamme dans son couple</a> les met avant les grands gestes.</p>`,
    },
    {
      id: "au-reveil",
      title: "Cinq rituels du matin",
      content: `<ul>
<li><strong>Le café ensemble :</strong> dix minutes, à table, avant les téléphones. C'est le rituel le plus répandu chez les couples qui durent, et le plus facile à perdre.</li>
<li><strong>Les trois mots :</strong> en se réveillant, chacun dit ce qu'il attend de sa journée en une phrase. Trente secondes, et vous savez où est l'autre.</li>
<li><strong>Le réveil sans écran :</strong> le téléphone ne se touche pas avant d'être levé et de s'être dit bonjour. Un réveil à l'ancienne y aide.</li>
<li><strong>Le petit-déjeuner du dimanche :</strong> le seul de la semaine qui dure, avec des choses qu'on ne mange pas en semaine.</li>
<li><strong>La marche du matin :</strong> vingt minutes dehors avant le travail, deux ou trois fois par semaine. Un rituel qui fait du bien au couple et au moral.</li>
</ul>`,
    },
    {
      id: "en-partant-et-en-rentrant",
      title: "Cinq rituels du départ et du retour",
      content: `<ul>
<li><strong>Le baiser de six secondes :</strong> c'est Gottman qui le recommande. Un baiser qui dure six secondes, en partant ou en rentrant. Assez long pour qu'il se passe quelque chose, assez court pour le faire tous les jours.</li>
<li><strong>La question du départ :</strong> « qu'est-ce que tu as de prévu aujourd'hui ? ». Ça permet le soir de demander comment s'est passée la réunion, au lieu de « ta journée ? ».</li>
<li><strong>Les vingt minutes du retour :</strong> Gottman encore : vingt minutes chaque soir où chacun raconte sa journée, et où l'autre écoute sans donner de conseil ni de solution. Juste écouter. Il appelle ça la conversation qui réduit le stress, et il la met au-dessus de tout.</li>
<li><strong>Le message de midi :</strong> un texto par jour, n'importe lequel, mais tous les jours.</li>
<li><strong>Le sas :</strong> dix minutes seul en rentrant, pour poser la journée, avant de se retrouver. Pour beaucoup de gens, c'est ce qui évite la dispute de 19 h.</li>
</ul>`,
      tip: "Le rituel du retour est le plus important de tous, parce que c'est là que les journées se touchent. Si vous n'en gardez qu'un, gardez les vingt minutes où on se raconte, sans écran et sans conseil.",
    },
    {
      id: "le-soir",
      title: "Cinq rituels du soir",
      content: `<ul>
<li><strong>Le dîner à table :</strong> sans écran, même quinze minutes. C'est le rituel que toutes les études sur les familles retrouvent.</li>
<li><strong>La question du soir :</strong> « qu'est-ce qui t'a fait plaisir aujourd'hui ? ». Une seule question, tous les soirs, au lit ou en faisant la vaisselle.</li>
<li><strong>La vaisselle à deux :</strong> l'un lave, l'autre essuie, et on parle. Dix minutes de conversation gratuites par jour.</li>
<li><strong>Le coucher ensemble :</strong> à la même heure, au moins quelques soirs par semaine. Les couples qui se couchent à des heures différentes se parlent moins, c'est mécanique.</li>
<li><strong>Le merci :</strong> avant de dormir, une chose pour laquelle on remercie l'autre, ce jour-là. « Merci d'avoir appelé le plombier. » C'est bête, et ça change les nuits.</li>
</ul>`,
    },
    {
      id: "la-semaine",
      title: "Cinq rituels de la semaine",
      content: `<ul>
<li><strong>Le rendez-vous hebdomadaire :</strong> un soir fixe, bloqué, à deux, dehors ou dedans. Les couples qui le tiennent ont environ trois fois et demie plus de chances de se dire très heureux ensemble, d'après une étude sur plus de 1 600 couples mariés. Les <a href="/blog/idees-de-rendez-vous-amoureux/">idées de rendez-vous amoureux</a> sont là pour les semaines sans idée.</li>
<li><strong>La balade du dimanche :</strong> le même chemin ou un nouveau, mais chaque dimanche, qu'il pleuve ou pas.</li>
<li><strong>Le point du dimanche soir :</strong> dix minutes avec l'agenda : qui fait quoi cette semaine, les enfants, les soirées. Ça évite les « tu ne m'avais pas dit ».</li>
<li><strong>Le soir chacun de son côté :</strong> un soir par semaine avec ses amis, son sport, ou seul. Ça donne de quoi se raconter.</li>
<li><strong>Le plat du vendredi :</strong> la pizza, les crêpes, le plateau de fromages : le même plat chaque vendredi, qui dit que la semaine est finie.</li>
</ul>`,
    },
    {
      id: "l-annee",
      title: "Cinq rituels de l'année",
      content: `<ul>
<li><strong>L'anniversaire de rencontre :</strong> fêté chaque année, même sans cadeau, en retournant à l'endroit du début quand c'est possible.</li>
<li><strong>Les noces :</strong> chaque année de mariage a son nom, coton, cuir, bois, et un cadeau qui va avec. <a href="/compteur-de-couple/">Le compteur de votre vie à deux</a> donne les prochaines dates à fêter, noces comprises.</li>
<li><strong>Le week-end de janvier :</strong> une nuit ailleurs, chaque année au même mois, pour parler de l'année qui vient.</li>
<li><strong>La lettre annuelle :</strong> chacun écrit à l'autre une fois par an, au Nouvel An ou à l'anniversaire, et on garde les lettres dans une boîte.</li>
<li><strong>La photo au même endroit :</strong> chaque année, la même pose devant la même porte ou le même arbre. Au bout de dix ans, c'est un trésor.</li>
</ul>`,
    },
    {
      id: "rituel-ou-routine",
      title: "Rituel ou routine : la différence",
      content: `<p>Le café du matin peut être un rituel ou une routine. C'est le même café. <strong>La différence, c'est qu'un rituel est choisi et qu'une routine est subie.</strong> Le rituel, on y tient, on le protège, on s'en veut quand on le saute. La routine, on la fait sans y penser, et on ne sait plus pourquoi.</p>
<p>Un rituel devient routine quand on arrête de le regarder : le café ensemble mais chacun sur son téléphone, la balade du dimanche en silence, le dîner devant la télé. Le remède n'est pas de supprimer le rituel, c'est d'y remettre de l'attention, et parfois de le changer un peu : un autre chemin, une autre question, une autre table. L'article sur <a href="/blog/routine-dans-le-couple/">la routine dans le couple</a> raconte comment la reconnaître et en sortir sans tout casser.</p>`,
    },
    {
      id: "creer-le-votre",
      title: "Comment créer le vôtre",
      content: `<p>Ne prends pas les trente. Prends-en trois : un du matin, un du soir, un de la semaine. Fais-les un mois. Ceux qui tiennent deviennent les vôtres ; ceux qui tombent n'étaient pas faits pour vous.</p>
<p>Et choisissez-les à deux. Un rituel imposé par l'un des deux devient une corvée pour l'autre. Le mieux est de demander : « qu'est-ce qui te manque dans nos journées ? ». La réponse est souvent un rituel qui existait au début et qui a disparu sans que personne ne décide. Si vous voulez voir plus largement où vous en êtes, sur le temps à deux comme sur le reste, le site propose une <a href="/evaluation-de-couple/" data-bilan-src="article-flamme">évaluation de couple en cent questions, chacun sur son téléphone</a>, dont le rapport a un domaine entier sur le temps que vous passez ensemble.</p>
<a href="/blog/raviver-la-flamme-dans-son-couple/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lire aussi</span><span class="blog-read-also-title">Raviver la flamme dans son couple : ce qui marche, et par où commencer</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
