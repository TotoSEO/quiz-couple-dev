import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "mon-conjoint-gagne-plus-que-moi",
  title: "Mon conjoint gagne plus que moi : comment vivre l'écart de salaire dans le couple",
  metaTitle: "Mon conjoint gagne plus que moi : vivre l'écart de salaire",
  metaDescription: "Mon conjoint gagne plus que moi : pourquoi l'écart de salaire est la norme, ce qu'il fait au couple, et les règles pour que l'argent ne devienne pas du pouvoir.",
  featuredImage: "/blog/mon-conjoint-gagne-plus-que-moi.webp",
  featuredImageAlt: "Les deux personnages de Quiz Couple sur deux piles de pièces de hauteurs différentes, se tenant la main",
  publishedAt: "2027-02-21T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "Dans trois couples sur quatre, l'un gagne nettement plus que l'autre. Ce que l'écart de salaire fait à celui qui gagne moins, ce qui change quand c'est elle qui gagne plus, et les règles qui empêchent l'argent de devenir du pouvoir.",
  introduction: `<p>Mon conjoint gagne plus que moi : c'est la situation de la plupart des couples, et pourtant on la vit souvent comme une anomalie à cacher. <strong>L'écart de salaire n'est pas un problème en soi. Il le devient quand il se transforme en autre chose : en dette, en pouvoir, en silence.</strong></p>
<p>Voici pourquoi l'écart est la norme, ce qu'il fait à celui qui gagne moins et à celui qui gagne plus, ce qui change quand c'est la femme qui gagne le plus, et les quatre règles qui permettent de le vivre sans qu'il pèse.</p>`,
  quickSummary: [
    "En France, trois femmes en couple sur quatre gagnent moins que leur conjoint, et l'écart moyen est de 42 % : l'écart de salaire est la règle, pas l'exception.",
    "Ce qui pèse n'est pas l'écart, c'est ce qu'on en fait : celui qui gagne plus qui décide plus, celui qui gagne moins qui demande la permission.",
    "Quand c'est elle qui gagne plus, les couples sont en moyenne moins satisfaits et elle fait plus de ménage, d'après une étude sur des milliers de couples américains : une vieille idée qui a la vie dure.",
    "Quatre règles : partager au prorata, un argent personnel pour chacun, les décisions à deux quel que soit l'apport, et compter le travail qui n'est pas payé.",
    "L'écart se discute à voix haute : un partage calculé une fois et jamais revu est la source la plus discrète de rancune.",
  ],
  sections: [
    {
      id: "l-ecart-est-la-norme",
      title: "L'écart de salaire est la norme",
      content: `<p>On s'imagine que les couples gagnent à peu près la même chose, et que l'écart est une exception un peu gênante. Les chiffres disent le contraire. <strong>D'après l'Insee, trois femmes en couple sur quatre gagnent moins que leur conjoint</strong>, et l'écart moyen de revenu entre une femme et son conjoint est de 42 %. Dans un couple sur quatre, c'est elle qui gagne le plus, et la proportion monte doucement d'une génération à l'autre.</p>
<p>Les raisons sont connues : des métiers payés différemment, du temps partiel qui concerne surtout les femmes, des carrières ralenties par les enfants, et une tendance encore nette à former des couples où l'homme est un peu plus âgé et un peu plus avancé. Rien de tout ça ne dit quoi que ce soit de la valeur de chacun. Mais ça dit une chose utile : si vous vivez un écart de salaire, vous n'avez rien raté. C'est la situation de départ de la plupart des couples, et le dossier sur <a href="/blog/argent-et-couple/">l'argent dans le couple</a> en fait l'une des questions centrales.</p>`,
    },
    {
      id: "ce-que-ca-fait",
      title: "Ce que ça fait, des deux côtés",
      content: `<p>Celui qui gagne moins le sait, et il le ressent à des moments précis : au restaurant quand l'addition arrive, au moment de proposer des vacances qu'il ne pourrait pas se payer seul, quand il veut un achat pour lui et qu'il compte dans sa tête. <strong>Il se sent redevable, et il commence à demander la permission sans que personne ne la lui ait imposée.</strong> Au bout de quelques années, il ne propose plus rien, il attend.</p>
<p>Celui qui gagne plus ressent autre chose, qu'il dit rarement : le poids. Si l'un des deux perd son travail, c'est lui qui tiendra. Si on achète, c'est son salaire qui fait le crédit. Et parfois, sans le vouloir, il glisse vers « c'est moi qui paie, donc je décide » : la voiture, le quartier, les vacances. Pas par méchanceté. Parce que celui qui finance se sent légitime à choisir, et que l'autre ne dit rien.</p>
<p>C'est là que l'écart de salaire devient un problème de couple : quand l'argent se transforme en pouvoir. Le mécanisme est silencieux, il s'installe en deux ans, et il explique une bonne part des <a href="/blog/disputes-d-argent-dans-le-couple/">disputes d'argent dans le couple</a> qui ont l'air de parler d'un achat alors qu'elles parlent de place.</p>`,
    },
    {
      id: "quand-c-est-elle",
      title: "Quand c'est elle qui gagne plus",
      content: `<p>Un couple sur quatre, et pourtant c'est celui dont on parle le moins. Trois économistes américains ont regardé ce qui se passe dans les couples où la femme gagne plus que l'homme, sur des milliers de ménages suivis pendant des années. Les résultats, publiés en 2015, ne sont pas flatteurs : <strong>ces couples se disaient en moyenne moins satisfaits, divorçaient plus souvent, et la femme y faisait plus de tâches ménagères que dans les autres couples</strong>, comme pour compenser. Les chercheurs ont même observé que les couples où elle serait susceptible de gagner plus se forment moins souvent, et que certaines femmes réduisent leur temps de travail pour ne pas dépasser leur conjoint.</p>
<p>Ce n'est pas une fatalité, c'est une vieille idée qui a la vie dure : celle que l'homme doit « faire vivre » le foyer. Elle n'est plus dite à voix haute, mais elle agit encore, chez lui comme chez elle, et chez la belle-famille qui fait une remarque à Noël. La seule façon de la neutraliser, c'est de la nommer : « est-ce que ça te gêne que je gagne plus ? », posé une fois, franchement, vaut mieux que dix ans de petites compensations silencieuses.</p>
<p>Et si lui, de son côté, a l'impression de compter moins, l'article sur <a href="/blog/parler-d-argent-en-couple/">la façon de parler d'argent en couple</a> donne les mots pour le dire sans que ça devienne un reproche.</p>`,
      tip: "Revoyez le partage à chaque changement de salaire, dans les deux sens : une augmentation de l'un, un temps partiel de l'autre, un congé parental. L'écart qui pèse le plus est celui qu'on a calculé il y a trois ans et jamais rediscuté.",
    },
    {
      id: "les-quatre-regles",
      title: "Les quatre règles qui empêchent l'argent de devenir du pouvoir",
      content: `<ul>
<li><strong>Partager au prorata :</strong> chacun paie les dépenses communes dans la proportion de ce qu'il gagne. À 2 000 et 3 500 €, c'est 36 % et 64 %. Comme ça, chacun garde la même part de son salaire pour lui, et personne ne finit le mois à sec pendant que l'autre part en week-end. Le calcul est dans l'article sur <a href="/blog/partage-des-depenses-en-couple/">le partage des dépenses en couple</a>.</li>
<li><strong>Un argent personnel pour chacun, que l'autre ne contrôle pas :</strong> une somme par mois, la même pour les deux ou proportionnelle, qu'on dépense sans justification. C'est la règle qui protège le plus celui qui gagne moins : il n'a plus à demander.</li>
<li><strong>Les décisions à deux, quel que soit l'apport :</strong> le logement, la voiture, les vacances, l'école des enfants se décident à voix égales. Celui qui paie plus ne décide pas plus. Ça se dit à voix haute, une fois, et ça se rappelle quand ça glisse.</li>
<li><strong>Compter ce qui n'est pas payé :</strong> si l'un gagne moins parce qu'il a réduit son temps de travail pour les enfants, ou parce qu'il porte la maison, son apport n'est pas de 36 %. Il est de 36 % en euros, plus des heures que l'autre n'a pas à faire. Un couple qui ne compte que les euros se trompe sur le partage.</li>
</ul>
<p>La dernière règle est celle qu'on oublie, et c'est la plus importante. Beaucoup de couples qui pensent avoir un problème d'écart de salaire ont en fait un problème de répartition du reste, et c'est le temps, pas l'argent, qui crée la rancune.</p>`,
    },
    {
      id: "en-parler",
      title: "En parler, une fois, franchement",
      content: `<p>L'écart de salaire se vit bien dans les couples qui en parlent, et mal dans ceux qui le contournent. Une seule conversation suffit souvent, à condition d'y poser les bonnes questions : est-ce que ça te gêne que je gagne plus, ou moins ? Est-ce que tu as l'impression de demander la permission ? Est-ce que tu as l'impression de porter tout seul ? Qu'est-ce qu'on ferait si l'écart s'inversait ?</p>
<p>Si vous ne savez pas comment lancer ça, l'<a href="/evaluation-de-couple/" data-bilan-src="article-argent">évaluation de couple, à faire chacun sur son téléphone</a>, pose la question du partage des dépenses parmi ses cent (moitié-moitié, selon ce que chacun gagne, celui qui gagne le plus paie plus sans calculer, ou on ne compte pas) et celle de qui gère l'argent du couple. Le rapport montre où vous avez répondu pareil et où non, et c'est souvent plus facile de partir de là que d'un « il faut qu'on parle ».</p>
<a href="/blog/argent-et-couple/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lire aussi</span><span class="blog-read-also-title">Argent et couple : comment gérer l'argent à deux sans que ça finisse en dispute</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
