import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "argent-et-couple",
  title: "Argent et couple : comment gérer l'argent à deux sans que ça finisse en dispute",
  metaTitle: "Argent et couple : gérer l'argent à deux sans se fâcher",
  metaDescription: "Argent et couple : pourquoi c'est le sujet qui fâche le plus, les trois façons de gérer l'argent à deux, le partage des dépenses et ce qui casse la confiance.",
  featuredImage: "/blog/argent-et-couple.webp",
  featuredImageAlt: "Les deux personnages de Quiz Couple assis à une table devant une tirelire, des pièces et une feuille de calcul",
  publishedAt: "2027-02-14T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "L'argent est le sujet de dispute qui pèse le plus sur un couple, et celui dont on parle le moins. Les trois façons de gérer l'argent à deux, comment partager les dépenses, en parler, faire un budget, et ce qui casse la confiance.",
  introduction: `<p>L'argent dans le couple, ce n'est pas une question de montant. Des couples qui gagnent peu s'entendent très bien dessus, et des couples à l'aise s'y déchirent. <strong>C'est une question de règles : qui paie quoi, qu'est-ce qui est à nous, qu'est-ce qui reste à chacun, et comment on en parle.</strong> Tant que ces règles ne sont pas dites, chacun suit les siennes, et c'est là que ça coince.</p>
<p>Ce dossier explique pourquoi l'argent fâche plus que le reste, décrit les trois façons de gérer l'argent à deux, et renvoie vers huit articles : le compte commun, le partage des dépenses, la façon d'en parler, l'écart de salaire, le conjoint qui dépense trop, les disputes, le budget et l'infidélité financière.</p>`,
  quickSummary: [
    "Les désaccords d'argent sont le meilleur prédicteur de divorce parmi tous les sujets de dispute, devant les tâches, la belle-famille et le sexe, sur plus de 4 500 couples suivis pendant cinq ans.",
    "Il y a trois façons de gérer l'argent à deux : tout en commun, un compte commun pour le couple et le reste à chacun, ou chacun son argent. Aucune n'est la bonne, mais une seule est choisie à deux.",
    "Près de deux couples sur trois mettent tout en commun en France, et les plus jeunes de moins en moins.",
    "Ce qui fâche n'est presque jamais la somme : c'est ce qu'elle veut dire, le pouvoir, la sécurité, le respect de ce que chacun apporte.",
    "La règle qui évite le plus de disputes : une somme à partir de laquelle on prévient l'autre avant d'acheter, et un argent de poche que personne ne contrôle.",
  ],
  sections: [
    {
      id: "le-dossier",
      title: "Le dossier, article par article",
      content: `<p>Cette page fait le tour du sujet. Chaque question a aussi son article, plus détaillé, si tu veux aller directement à ce qui vous concerne :</p>
<ol class="blog-liste-reperes">
<li><a href="/blog/compte-commun-ou-compte-separe/">Compte commun ou compte séparé : quelle solution choisir</a></li>
<li><a href="/blog/partage-des-depenses-en-couple/">Le partage des dépenses en couple : moitié-moitié ou au prorata</a></li>
<li><a href="/blog/parler-d-argent-en-couple/">Parler d'argent en couple sans que ça tourne mal</a></li>
<li><a href="/blog/mon-conjoint-gagne-plus-que-moi/">Mon conjoint gagne plus que moi : vivre l'écart de salaire</a></li>
<li><a href="/blog/mon-conjoint-depense-trop/">Mon conjoint dépense trop, ou trop peu</a></li>
<li><a href="/blog/disputes-d-argent-dans-le-couple/">Les disputes d'argent dans le couple</a></li>
<li><a href="/blog/budget-couple/">Faire un budget à deux</a></li>
<li><a href="/blog/infidelite-financiere/">L'infidélité financière : cacher de l'argent à son conjoint</a></li>
</ol>`,
    },
    {
      id: "pourquoi-l-argent-fache",
      title: "Pourquoi l'argent fâche plus que le reste",
      content: `<p>On se dispute pour le ménage, pour la belle-famille, pour le temps passé ensemble. Mais les disputes d'argent ne sont pas des disputes comme les autres, et ce n'est pas une impression.</p>
<p>En 2012, trois chercheurs américains ont repris les données de plus de 4 500 couples interrogés deux fois à cinq ans d'écart. Ils ont regardé quels sujets de désaccord, au premier entretien, annonçaient un divorce au second. <strong>Les désaccords d'argent arrivaient en tête, devant les tâches ménagères, la belle-famille, le temps passé ensemble et le sexe</strong>, chez les hommes comme chez les femmes, quel que soit le niveau de revenu. Une autre étude, qui avait fait tenir un journal pendant quinze jours à une centaine de couples, a trouvé que les disputes d'argent duraient plus longtemps, revenaient plus souvent et se réglaient moins que les autres.</p>
<p>La raison, c'est que l'argent ne parle jamais que d'argent. Un achat non prévu, c'est « tu ne me respectes pas ». Un compte séparé, c'est « tu ne me fais pas confiance ». Un salaire plus bas, c'est « je compte moins ». Derrière chaque chiffre, il y a la sécurité, le pouvoir, la liberté et ce qu'on a vu faire chez ses parents. C'est pour ça qu'on ne règle pas une dispute d'argent avec une calculette, et c'est tout l'objet de l'article sur <a href="/blog/disputes-d-argent-dans-le-couple/">les disputes d'argent dans le couple</a>.</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">L'argent dans le couple, en chiffres</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">n° 1</span>les désaccords d'argent, premier prédicteur de divorce parmi les sujets de dispute, sur 4 500 couples</li>
<li><span class="blog-chiffres-nombre">2 sur 3</span>couples mettent tous leurs revenus en commun en France, d'après l'Insee</li>
<li><span class="blog-chiffres-nombre">4 sur 10</span>personnes vivant avec un compte commun ont déjà caché un achat, une dette ou un compte, dans une enquête américaine</li>
<li><span class="blog-chiffres-nombre">42 %</span>l'écart moyen de revenu entre une femme en couple et son conjoint, toujours d'après l'Insee</li>
</ul>
</div>`,
    },
    {
      id: "les-trois-facons",
      title: "Les trois façons de gérer l'argent à deux",
      content: `<p>Il n'y en a pas trente-six. Tous les couples du monde sont dans l'une de ces trois cases, ou entre deux :</p>
<ul>
<li><strong>Tout en commun :</strong> les deux salaires tombent sur le même compte, et tout part de là, le loyer comme le café. C'est le choix de près de deux couples sur trois en France, surtout les couples mariés et ceux qui ont des enfants. Simple, solidaire, mais chaque dépense est visible par l'autre, et celui qui gagne moins peut se sentir surveillé.</li>
<li><strong>Un compte commun pour le couple, le reste à chacun :</strong> chacun verse une part sur un compte qui paie le loyer, les courses, les enfants, et garde son compte pour ses dépenses à lui. C'est la formule qui monte, surtout chez les moins de quarante ans, parce qu'elle garde une part d'indépendance sans faire les comptes au centime.</li>
<li><strong>Chacun son argent :</strong> pas de compte commun, on partage les factures en les payant à tour de rôle ou en se remboursant. Fréquent au début, quand on ne vit pas ensemble, et chez ceux qui ont déjà connu une séparation. Ça marche tant que les revenus sont proches et qu'il n'y a pas d'enfant.</li>
</ul>
<p>Laquelle est la bonne ? Celle que vous avez choisie à deux. Une expérience menée sur 230 couples récemment mariés ou fiancés a tiré au sort qui ouvrait un compte commun et qui gardait des comptes séparés : au bout de deux ans, <strong>ceux qui avaient tout mis en commun se disaient plus satisfaits de leur relation</strong>, et les autres avaient vu leur satisfaction baisser comme c'est la règle dans les premières années. Mais l'effet venait moins du compte que de ce qu'il oblige à faire : parler des dépenses, décider ensemble. Tout ça est détaillé, avantages et pièges compris, dans l'article <a href="/blog/compte-commun-ou-compte-separe/">compte commun ou compte séparé</a>.</p>`,
    },
    {
      id: "qui-paie-quoi",
      title: "Qui paie quoi : moitié-moitié ou au prorata",
      content: `<p>Dès qu'on ne met pas tout en commun, il faut décider comment on partage. Et le réflexe, c'est moitié-moitié. C'est juste quand les deux gagnent la même chose, et ça ne l'est plus du tout quand l'un gagne 1 800 € et l'autre 3 200 € : à la fin du mois, le premier n'a plus rien pour lui et le second part en week-end.</p>
<p>La solution la plus répandue chez les couples qui ont réfléchi à la question, c'est <strong>le partage au prorata des revenus</strong> : si tu gagnes 40 % des revenus du couple, tu paies 40 % des dépenses communes. Chacun garde la même proportion de son salaire pour lui. L'article sur <a href="/blog/partage-des-depenses-en-couple/">le partage des dépenses en couple</a> fait le calcul pas à pas, avec ce qu'on met dans le pot commun et ce qu'on laisse dehors.</p>
<p>Et quand l'un gagne beaucoup plus que l'autre, ce n'est pas qu'une question de calcul : c'est aussi une question de place, celui qui paie plus ayant vite fait de décider plus. <a href="/blog/mon-conjoint-gagne-plus-que-moi/">Mon conjoint gagne plus que moi</a> parle de ce que ça change, dans un sens comme dans l'autre.</p>`,
      tip: "La règle qui évite le plus de disputes dans un couple, d'après les conseillers conjugaux comme d'après les gens eux-mêmes : une somme à partir de laquelle on prévient l'autre avant d'acheter (100 €, 300 €, à vous de voir), et en dessous, chacun fait ce qu'il veut sans se justifier.",
    },
    {
      id: "en-parler",
      title: "En parler avant que ça explose",
      content: `<p>Le problème n'est pas que les couples se disputent pour l'argent. C'est qu'ils n'en parlent qu'au moment de se disputer. Entre deux disputes, silence : on ne sait pas ce que gagne l'autre à l'euro près, on ne sait pas ce qu'il a de côté, on ne sait pas ce qui l'inquiète.</p>
<p>La plupart des couples qui s'en sortent bien ont une habitude toute bête : <strong>un moment pour parler d'argent, à froid, une fois par mois</strong>. Pas au moment où le relevé tombe, pas le soir d'un gros achat. Un dimanche, avec un café, les chiffres sur la table. Ce qu'on se dit à ce moment-là, comment aborder un sujet qui gêne, et les questions à se poser avant d'emménager, d'avoir un enfant ou d'acheter, c'est l'article sur <a href="/blog/parler-d-argent-en-couple/">la façon de parler d'argent en couple</a>. Si vous ne savez pas par où commencer, les <a href="/questions-couple/">questions à se poser en couple</a> en ont une série sur l'argent et l'avenir.</p>
<p>Et si l'un des deux dépense sans compter pendant que l'autre économise chaque euro, la conversation est encore plus nécessaire, et plus délicate. Une étude sur plus de mille personnes mariées a montré que les économes ont tendance à épouser des dépensiers, et que plus l'écart est grand entre les deux, plus le couple se dispute pour l'argent. <a href="/blog/mon-conjoint-depense-trop/">Mon conjoint dépense trop, ou trop peu</a> explique comment on fait vivre ensemble ces deux rapports à l'argent.</p>`,
    },
    {
      id: "le-budget",
      title: "Le budget, l'outil qui calme tout",
      content: `<p>On imagine le budget comme une contrainte. C'est l'inverse : <strong>un couple qui sait où va son argent se dispute moins, parce qu'il n'a plus besoin de deviner</strong>. On ne se demande plus si on peut partir en vacances, on regarde la ligne vacances. On ne se reproche plus un achat, on regarde ce qui reste dans la ligne loisirs.</p>
<p>Faire un budget à deux prend une heure la première fois et vingt minutes par mois ensuite : les revenus, les dépenses fixes, les dépenses qui varient, l'épargne, et un argent de poche pour chacun que personne ne contrôle. La méthode, avec un exemple chiffré pour un couple à 3 500 € par mois, est dans l'article sur <a href="/blog/budget-couple/">le budget en couple</a>.</p>`,
    },
    {
      id: "ce-qui-casse-la-confiance",
      title: "Ce qui casse la confiance",
      content: `<p>Il y a une chose que même les couples qui gèrent bien leur argent n'ont pas prévue : le mensonge. Un achat caché, une dette qu'on n'a pas dite, un compte dont l'autre ignore l'existence, de l'argent prêté à sa famille sans en parler. Dans une enquête américaine, <strong>quatre personnes sur dix vivant avec un compte commun reconnaissaient en avoir déjà caché une</strong>. On appelle ça l'infidélité financière, et pour la personne qui le découvre, ça fait le même effet qu'une tromperie : ce n'est pas la somme qui blesse, c'est le mensonge.</p>
<p>Ce qui relève du jardin secret (un compte perso dont l'autre connaît l'existence) et ce qui relève du mensonge, comment on réagit quand on découvre, et comment on l'avoue quand c'est soi, c'est l'article sur <a href="/blog/infidelite-financiere/">l'infidélité financière</a>.</p>`,
    },
    {
      id: "ce-que-dit-la-loi",
      title: "Ce que dit la loi, en une minute",
      content: `<p>Beaucoup de couples croient que vivre ensemble suffit à partager. Non. En France, tout dépend du statut :</p>
<ul>
<li><strong>Mariés sans contrat :</strong> ce que chacun gagne pendant le mariage est commun, ce qu'on avait avant et ce qu'on hérite reste à soi. C'est la communauté réduite aux acquêts.</li>
<li><strong>Pacsés :</strong> depuis 2007, chacun garde ce qu'il achète, sauf ce qu'on achète à deux, qui est à moitié chacun. On peut choisir l'indivision dans la convention.</li>
<li><strong>En concubinage :</strong> rien. Chacun est propriétaire de ce qu'il a payé, et de ce qui est à son nom. Un appartement acheté ensemble appartient à chacun dans la proportion écrite chez le notaire, pas dans la proportion de ce qu'il a réellement payé.</li>
</ul>
<p>Deux détails qui comptent : mariés ou pacsés, vous êtes solidaires des dettes du ménage (le loyer, les courses, l'école), même si un seul a signé. Et un compte joint engage les deux titulaires : si l'un le met à découvert, la banque peut se tourner vers l'autre. Ces règles méritent d'être connues avant de signer un bail à deux, et le <a href="/test-habiter-vivre-ensemble/">test pour savoir si vous êtes prêts à emménager ensemble</a> pose justement la question de l'argent.</p>`,
    },
    {
      id: "par-ou-commencer",
      title: "Par où commencer",
      content: `<p>Si vous n'avez jamais parlé d'argent, ne commencez pas par un tableur. Commencez par une seule question, chacun de son côté, puis comparez : <strong>« Pour toi, idéalement, l'argent dans le couple c'est tout en commun, un compte pour le couple et le reste à chacun, ou chacun son argent ? »</strong> La plupart des couples découvrent qu'ils n'ont pas la même réponse, et qu'ils ne se l'étaient jamais demandé.</p>
<p>C'est l'une des cent questions de l'<a href="/evaluation-de-couple/" data-bilan-src="article-argent">évaluation de couple, à faire chacun sur son téléphone</a> : tout un domaine y est consacré à l'argent, le partage des dépenses, l'épargne, les achats sans prévenir, l'aide à la famille, et le rapport montre question par question où vous êtes d'accord et où vous ne l'êtes pas, sans que personne n'ait eu à lancer le sujet. Beaucoup de couples y trouvent la conversation d'argent qu'ils repoussaient depuis des années.</p>
<p>Et si le sujet est déjà devenu une dispute qui revient toutes les semaines, ce n'est plus une question de méthode. L'article sur <a href="/blog/therapie-de-couple/">la thérapie de couple</a> explique comment un tiers aide à en sortir, et l'argent est l'un des premiers motifs pour lesquels les couples poussent la porte.</p>`,
    },
  ],
};

export default article;
