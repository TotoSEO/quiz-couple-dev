import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "combien-de-temps-durent-les-fiancailles",
  title: "Combien de temps durent les fiançailles ? Et qui paie quoi, et qu'est-ce qu'on fait pendant",
  metaTitle: "Combien de temps durent les fiançailles ? Durée et qui paie",
  metaDescription: "Combien de temps durent les fiançailles : la durée la plus fréquente, pourquoi un an est le minimum confortable, qui paie quoi, et ce qu'on règle avant.",
  featuredImage: "/blog/combien-de-temps-durent-les-fiancailles.webp",
  featuredImageAlt: "Les deux personnages de Quiz Couple assis à une table couverte de listes et d'un grand sablier, le personnage rose coche une case",
  publishedAt: "2027-01-24T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "Un an à dix-huit mois le plus souvent, parfois moins, parfois beaucoup plus : la durée des fiançailles, qui paie le mariage, et ce qu'on règle pendant.",
  introduction: `<p>Les fiançailles durent <strong>le plus souvent entre un an et dix-huit mois</strong>, le temps de choisir une date, de réserver un lieu et de réunir les deux familles. Rien n'oblige à ce délai : certains se marient en trois mois, d'autres restent fiancés cinq ans.</p>
<p>Voici la durée la plus fréquente et pourquoi, ce qu'on fait pendant, qui paie quoi aujourd'hui, et les fiançailles qui s'éternisent.</p>`,
  quickSummary: [
    "La durée la plus fréquente est d'un an à dix-huit mois, parce que les lieux se réservent un an à l'avance et qu'un mariage demande du temps.",
    "Un mariage civil seul peut se faire en deux ou trois mois : il faut un dossier à la mairie et la publication des bans dix jours avant.",
    "Aujourd'hui, la plupart des couples paient leur mariage eux-mêmes, avec un coup de main des parents ; la tradition de la famille de la mariée qui paie tout est partie.",
    "Les fiançailles servent à régler ce qui compte : le budget, la liste des invités, le régime matrimonial, et les sujets d'avenir pas encore abordés.",
    "Des fiançailles qui durent plus de trois ans sans date disent quelque chose, et ça vaut la peine de le dire en clair.",
  ],
  sections: [
    {
      id: "la-duree-la-plus-frequente",
      title: "La durée la plus fréquente, et pourquoi",
      content: `<p>Un an à dix-huit mois. Ce n'est pas une règle, c'est une conséquence : <strong>les lieux qu'on aime se réservent un an à l'avance</strong>, surtout pour un samedi de mai à septembre, et il faut ensuite trouver le traiteur, le photographe, la robe, envoyer les invitations trois mois avant, et laisser aux gens le temps de poser leurs congés. Aux États-Unis, où ces chiffres sont mesurés chaque année par les grands sites de mariage, la durée moyenne tourne autour de quinze mois. En France, c'est à peu près pareil.</p>
<p>Il y a des fiançailles plus courtes. Un mariage civil seul, à la mairie, avec un déjeuner derrière, s'organise en deux ou trois mois : le dossier à déposer, les bans publiés dix jours avant, et c'est fait. Et il y a des fiançailles plus longues, par choix (on attend la fin des études, un achat, une naissance) ou par manque d'élan. On y revient plus bas.</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">Les fiançailles en chiffres</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">12 à 18 mois</span>la durée la plus fréquente</li>
<li><span class="blog-chiffres-nombre">2 à 3 mois</span>pour un mariage civil seul, dossier et bans compris</li>
<li><span class="blog-chiffres-nombre">10 jours</span>de publication des bans avant la cérémonie, au minimum</li>
<li><span class="blog-chiffres-nombre">1 an</span>d'avance pour réserver un lieu un samedi d'été</li>
</ul>
</div>`,
    },
    {
      id: "ce-qu-on-fait-pendant",
      title: "Ce qu'on fait pendant les fiançailles",
      content: `<p>Les fiançailles, ce n'est pas qu'organiser une fête. C'est aussi la période où un couple règle, souvent sans s'en rendre compte, des choses qu'il n'avait jamais abordées. Dans l'ordre à peu près :</p>
<ul>
<li><strong>Le budget :</strong> combien, qui met quoi, et ce qu'on ne fera pas. C'est le premier vrai sujet d'argent de beaucoup de couples, et il annonce les suivants.</li>
<li><strong>La liste des invités :</strong> cent personnes ou vingt, les collègues ou pas, l'oncle qu'on ne voit plus. C'est là que les deux familles entrent en scène.</li>
<li><strong>Le type de mariage :</strong> civil seul, religieux, laïque, à l'étranger. Et le nom : garder le sien, prendre celui de l'autre, les deux.</li>
<li><strong>Le régime matrimonial :</strong> sans rien faire, vous serez mariés sous la communauté réduite aux acquêts (ce que chacun gagne pendant le mariage est commun). La séparation de biens demande un contrat chez le notaire, avant le mariage. C'est moins romantique que le traiteur, et plus important.</li>
<li><strong>Les sujets d'avenir :</strong> les enfants, le travail, où vivre. Si vous ne les avez pas abordés avant la demande, c'est le moment, et <a href="/blog/questions-avenir-couple/">les questions à se poser sur l'avenir du couple</a> donnent une liste.</li>
</ul>
<p>Beaucoup de couples profitent aussi de cette période pour faire le point à deux. Le site propose une <a href="/evaluation-de-couple/" data-bilan-src="article-mariage">évaluation de couple en cent questions, chacun sur son téléphone</a>, dont le rapport montre domaine par domaine où vous voyez les choses pareil et où il reste des conversations à avoir. Mieux vaut les avoir fiancés que mariés.</p>`,
      tip: "La préparation au mariage proposée par les églises, et les ateliers pour couples de certaines associations, existent aussi pour les non-croyants sous d'autres formes. Quelques séances pour parler d'argent, d'enfants et de disputes avant le grand jour, c'est du temps bien placé.",
    },
    {
      id: "qui-paie-quoi",
      title: "Qui paie quoi ?",
      content: `<p>La tradition disait : la famille de la mariée paie la fête, la famille du marié paie les alliances, la bague et le voyage de noces. Cette tradition est morte, ou presque. <strong>Aujourd'hui, la plupart des couples paient leur mariage eux-mêmes</strong>, et les parents aident quand ils peuvent, en donnant une somme ou en prenant un poste en charge : le traiteur, la robe, le vin.</p>
<p>Ce qui marche bien, c'est de le dire tôt et clairement. Un dîner avec chaque famille, où l'on dit ce qu'on prévoit et ce que ça coûte, et où chacun dit ce qu'il peut faire, sans obligation. Ce qui marche mal, c'est de supposer : « ses parents vont payer, les miens ont payé le mariage de ma sœur ». Et une règle qui évite beaucoup de disputes : celui qui paie un poste ne décide pas de tout pour autant. Des parents qui paient le traiteur ne choisissent pas la liste des invités.</p>
<p>Côté invités, la question du cadeau se pose dans l'autre sens, et elle a son article : <a href="/blog/cadeau-mariage-combien-donner/">combien donner pour un mariage</a>, selon le lien avec les mariés. Une liste de mariage ou une cagnotte, annoncée sur le faire-part, évite les vingt-cinq saladiers.</p>`,
    },
    {
      id: "les-fiancailles-courtes",
      title: "Les fiançailles courtes",
      content: `<p>Se marier en trois mois, c'est possible, et parfois c'est ce qu'il y a de mieux : un couple qui vit ensemble depuis dix ans, une envie de simplicité, un parent malade qu'on veut voir à la cérémonie. Ce qu'il faut savoir : la mairie demande un dossier (pièces d'identité, justificatifs de domicile, actes de naissance de moins de trois mois, et un certificat de contrat de mariage s'il y en a un), puis publie les bans pendant dix jours. Compte trois à six semaines entre le dépôt et la date, selon la commune.</p>
<p>Pour la fête, on fait avec les disponibilités : un restaurant plutôt qu'un domaine, un repas plutôt qu'une soirée, trente personnes plutôt que cent cinquante. Et souvent, c'est très bien comme ça.</p>`,
    },
    {
      id: "les-fiancailles-qui-s-eternisent",
      title: "Les fiançailles qui s'éternisent",
      content: `<p>Et puis il y a les fiancés depuis quatre ans, sans date. Au début pour une bonne raison : les études, l'achat de la maison, le bébé. Puis la raison disparaît, et la date ne vient toujours pas. Au bout d'un moment, l'un des deux se demande si l'autre veut encore se marier, ou s'il a dit oui à la demande pour ne pas dire non.</p>
<p>Des fiançailles sans date pendant plus de deux ou trois ans, sans raison claire, disent quelque chose. Pas forcément que l'autre ne t'aime pas : parfois il a peur de la fête, de l'argent, des familles, et il préfère ne pas y penser. Mais ça mérite d'être dit en clair, un jour calme : « est-ce que tu veux toujours qu'on se marie, et quand ? ». Si la réponse est floue, l'article sur <a href="/blog/il-ne-veut-pas-se-marier/">ce qu'il y a derrière quelqu'un qui ne veut pas se marier</a> aide à comprendre ce qui bloque, et à décider quoi en faire.</p>
<p>Et si la réponse est claire, et que c'est juste l'organisation qui vous paralyse, revenez au mariage civil seul, avec un déjeuner. Beaucoup de couples qui ont repoussé pendant des années finissent par faire ça en deux mois, et regrettent seulement de ne pas l'avoir fait plus tôt.</p>
<a href="/blog/demande-en-mariage/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lire aussi</span><span class="blog-read-also-title">Demande en mariage : comment s'y prendre, quand la faire, et tout ce qui vient après</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
