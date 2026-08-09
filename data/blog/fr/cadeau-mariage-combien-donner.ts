import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'cadeau-mariage-combien-donner',
  title: `Cadeau de mariage : combien donner, et comment s'y prendre`,
  metaTitle: `Cadeau de mariage : combien donner en 2026 ? Le barème`,
  metaDescription: `Combien donner pour un mariage en 2026 ? Le barème selon votre lien avec les mariés, les cas particuliers, et comment participer sans se prendre la tête.`,
  featuredImage: '/blog/cadeau-mariage.webp',
  featuredImageAlt: `Enveloppe de cadeau de mariage posée sur une table de réception avec des roses et deux coupes de champagne`,
  publishedAt: '2026-08-09',
  author: AUTHORS['lucie-courtin'],
  excerpt: `Le barème selon votre lien avec les mariés, les situations qui changent la donne, et la façon la plus simple de participer.`,
  introduction: `<p>Vous avez le carton d'invitation sur la table depuis trois semaines. La date approche, la tenue est réglée, et il reste cette question idiote que personne n'ose poser à voix haute : <strong>on met combien ?</strong></p>

<p>C'est une question idiote et c'est en même temps la plus stressante de toutes. Trop peu, on a peur de passer pour un radin. Trop, on se met dans le rouge pour un couple qu'on voit trois fois par an. Et personne ne vous donnera jamais le chiffre franchement, parce que « ça se fait pas » d'en parler.</p>

<p>Alors on va en parler. Voilà <strong>les fourchettes réelles</strong>, la règle simple qui règle la majorité des cas, ce qui doit vous faire monter ou descendre, et comment participer sans y passer trois jours.</p>`,
  quickSummary: [
    `La règle de base : votre participation couvre à peu près votre couvert, soit 80 à 120 € par personne en 2026.`,
    `Un bon ami donne en général entre 80 et 150 €, la famille proche entre 200 et 400 €.`,
    `Vous venez en couple ? On double le montant, mais on ne double pas forcément l'enveloppe si le budget ne suit pas.`,
    `Si vous dormez sur place, prenez le transport et l'hôtel en compte : ils font partie de ce que le mariage vous coûte.`,
    `La cagnotte en ligne a remplacé l'enveloppe dans la plupart des mariages, et c'est une bonne chose pour tout le monde.`,
    `Personne ne compte. Ce qui se remarque, c'est le mot dans la carte, pas le montant.`,
  ],
  sections: [
    {
      id: 'la-regle-qui-regle-80-des-cas',
      title: `La règle qui règle 80 % des cas`,
      content: `<p>Il existe une convention simple, que presque personne ne formule mais que tout le monde applique sans le savoir : <strong>votre participation couvre à peu près ce que votre présence coûte aux mariés.</strong></p>

<p>Concrètement, un couvert de mariage en France, avec le traiteur, le cocktail, les boissons et le reste, revient <strong>entre 80 et 120 € par personne</strong>. C'est votre plancher. En dessous, vous coûtez plus cher que vous ne donnez, ce qui n'est dramatique pour personne mais explique pourquoi les montants tournent tous autour de ces chiffres.</p>

<p>À partir de là, tout le reste est un ajustement : plus vous êtes proche des mariés, plus vous montez au-dessus de ce plancher. C'est aussi bête que ça.</p>

<aside class="blog-tip-box">
<p class="blog-tip-box-title">💡 À retenir</p>
<p>Cette règle est un repère, pas une facture. Si vous êtes étudiant, au chômage ou serré ce mois-ci, personne de sensé n'attend de vous que vous couvriez votre couvert. Un couple qui vous en voudrait pour ça a un problème plus grave qu'une enveloppe.</p>
</aside>`,
    },
    {
      id: 'le-bareme-selon-votre-lien-avec-les-maries',
      title: `Le barème selon votre lien avec les mariés`,
      content: `<p>Voici les fourchettes qu'on retrouve partout, et qui correspondent à ce qui se pratique réellement.</p>

<div>
<table>
<thead>
<tr>
<th>Votre lien avec les mariés</th>
<th>Montant courant</th>
</tr>
</thead>
<tbody>
<tr>
<td>Famille proche (parents, frères et sœurs)</td>
<td>200 à 400 €</td>
</tr>
<tr>
<td>Témoin, meilleur ami</td>
<td>150 à 300 €</td>
</tr>
<tr>
<td>Bon ami, cousin proche</td>
<td>80 à 150 €</td>
</tr>
<tr>
<td>Collègue, ami de longue date qu'on voit peu</td>
<td>50 à 100 €</td>
</tr>
<tr>
<td>Connaissance, plus-un d'un invité</td>
<td>40 à 80 €</td>
</tr>
</tbody>
</table>
</div>

<p><strong>Ces chiffres sont par personne.</strong> Et ils supposent un mariage classique, avec cérémonie et repas. Pour une fête plus simple, un buffet dans un jardin, une mairie suivie d'un verre, vous pouvez descendre sans arrière-pensée dans le bas de la fourchette.</p>`,
    },
    {
      id: 'ce-qui-fait-monter-ou-descendre-le-montant',
      title: `Ce qui fait monter ou descendre le montant`,
      content: `<p>Le barème donne une base. Ces quelques situations la déplacent, dans un sens ou dans l'autre.</p>`,
      subsections: [
        {
          id: 'vous-venez-a-deux',
          title: `Vous venez à deux`,
          content: `<p>Deux couverts, donc deux fois le budget en théorie. Dans les faits, beaucoup de couples donnent <strong>une fois et demie plutôt que deux fois</strong>, et personne ne s'en aperçoit. Si vous êtes deux bons amis, tabler sur 150 à 200 € pour le couple est parfaitement dans les clous.</p>`,
        },
        {
          id: 'vous-venez-avec-des-enfants',
          title: `Vous venez avec des enfants`,
          content: `<p>Les menus enfants coûtent nettement moins cher, souvent moitié moins. Comptez-les, mais pas au tarif adulte. Et si les mariés ont prévu une garde ou une animation pour les petits, un petit geste supplémentaire est toujours apprécié, ça leur a coûté quelque chose.</p>`,
        },
        {
          id: 'le-mariage-vous-coute-deja-cher',
          title: `Le mariage vous coûte déjà cher`,
          content: `<p>C'est le point que les gens oublient systématiquement. <strong>Un mariage à 600 km avec deux nuits d'hôtel, ça vous coûte facilement 400 € avant même l'enveloppe.</strong> Les mariés le savent. Ils savent parfaitement ce qu'ils vous demandent en vous invitant loin de chez vous.</p>

<p>Dans ce cas, descendre dans le bas de votre fourchette est non seulement acceptable, c'est logique. Votre déplacement fait partie de ce que vous investissez pour être là.</p>`,
        },
        {
          id: 'il-y-a-eu-un-evjf-un-evg-et-un-week-end',
          title: `Il y a eu un EVJF, un EVG et un week-end d'anniversaire`,
          content: `<p>Une année de mariage, ce n'est plus un événement, c'est un abonnement. Enterrement de vie de jeune fille ou de garçon, week-end d'intégration, brunch du lendemain : tout ça, vous l'avez déjà payé.</p>

<p><strong>Faites la somme de l'année, pas de la journée.</strong> Si vous avez déjà mis 350 € dans un week-end à Lisbonne pour l'EVJF, l'enveloppe du mariage peut être modeste sans que ça pose la moindre question.</p>`,
        },
      ],
    },
    {
      id: 'enveloppe-cagnotte-ou-liste-de-mariage',
      title: `Enveloppe, cagnotte ou liste de mariage ?`,
      content: `<p>Il y a dix ans, on donnait une enveloppe. Aujourd'hui, dans la majorité des mariages, <strong>les mariés ouvrent une cagnotte en ligne</strong> et le lien arrive avec le faire-part.</p>

<p>Et honnêtement, tant mieux. L'enveloppe posait trois problèmes que plus personne ne regrette : il fallait passer au distributeur la veille, quelqu'un devait garder une boîte pleine de liquide toute la soirée, et les mariés découvraient les montants un par un, ce qui est gênant pour tout le monde.</p>

<p><strong>S'il y a une cagnotte, utilisez-la.</strong> C'est ce que les mariés ont demandé, c'est plus simple pour eux, et ça vous évite de chercher un distributeur en costume à 18 h.</p>

<p><strong>S'il n'y a rien de précisé</strong>, l'enveloppe reste parfaitement correcte. Glissez-la dans une carte, avec un mot, et donnez-la à un témoin plutôt qu'aux mariés directement, ils ont mille choses à gérer ce jour-là.</p>

<div class="blog-cta">
<p class="blog-cta-titre">Vous organisez la cagnotte pour le groupe ?</p>
<p class="blog-cta-texte">Créer une cagnotte commune prend deux minutes, chacun met ce qu'il veut de son côté, et les mariés reçoivent un seul montant sans savoir qui a mis quoi. C'est ce qui règle le plus de gêne pour le moins d'effort.</p>
<a class="blog-cta-btn" href="https://c3po.link/Qkq3VF6M7a" target="_blank" rel="sponsored noopener">Créer une cagnotte de mariage</a>
<p class="blog-cta-note">Gratuit pour l'organisateur &middot; Sans commission sur les participants</p>
</div>`,
    },
    {
      id: 'comment-participer-sans-se-prendre-la-tete',
      title: `Comment participer sans se prendre la tête`,
      content: `<p>Le cas le plus courant, et le plus pénible à organiser : <strong>vous êtes une bande de huit et vous voulez donner ensemble.</strong> C'est là que ça part en vrille, avec les virements dans tous les sens, celui qui a avancé et qui n'ose pas relancer, et le tableur partagé que personne ne remplit.</p>

<p>La solution qui fonctionne tient en trois étapes.</p>

<ol>
<li><strong>Une personne ouvre la cagnotte</strong> et fixe une date limite, deux ou trois jours avant le mariage. Sans date, ça traîne jusqu'à la veille.</li>
<li><strong>Elle envoie le lien au groupe avec un montant indicatif</strong>, pas une obligation. « On vise 60 € chacun mais mettez ce que vous voulez » lève 90 % de la gêne.</li>
<li><strong>Chacun participe de son côté</strong>, sans que les autres voient qui a mis combien. C'est ce point précis qui change tout : personne ne se sent jugé.</li>
</ol>

<p>À l'arrivée, les mariés reçoivent un montant unique, avec un message du groupe. C'est plus lisible pour eux qu'un tas d'enveloppes, et bien plus agréable à recevoir.</p>

<aside class="blog-tip-box">
<p class="blog-tip-box-title">💡 Le détail qui compte</p>
<p>Vérifiez qu'il n'y a pas de frais prélevés sur ce que vous donnez. Certaines plateformes retiennent un pourcentage au passage, et vos 60 € n'arrivent pas entiers. Ce n'est jamais énorme, mais c'est dommage.</p>
</aside>`,
    },
    {
      id: 'les-erreurs-a-eviter',
      title: `Les erreurs à éviter`,
      content: `<p><strong>Demander aux autres invités ce qu'ils donnent :</strong> ça part d'une bonne intention et ça finit toujours mal. Vous n'avez pas le même budget, pas le même lien avec les mariés, et vous allez soit vous aligner sur trop haut, soit sur trop bas.</p>

<p><strong>Offrir un objet non demandé quand il y a une liste :</strong> s'ils ont pris le temps de faire une liste ou une cagnotte, c'est qu'ils ont réfléchi à ce dont ils ont besoin. Le saladier en verre soufflé auquel vous tenez tant finira dans un placard.</p>

<p><strong>Attendre le jour J pour donner :</strong> les mariés n'ont aucune envie de gérer des enveloppes et des paquets pendant leur propre fête. Donnez avant, ou passez par la cagnotte.</p>

<p><strong>Ne rien mettre du tout en pensant que ça ne se verra pas :</strong> ça ne se verra pas, c'est vrai. Mais si vous êtes vraiment à sec, un mot sincère écrit à la main vaut mieux qu'un silence. Personne ne compte les montants, tout le monde relit les cartes.</p>`,
    },
    {
      id: 'et-le-mot-dans-la-carte',
      title: `Et le mot dans la carte`,
      content: `<p>Puisqu'on y est. Le montant, ils l'oublieront en trois semaines. Le mot, ils le garderont.</p>

<p>Évitez les formules toutes faites, « tous nos vœux de bonheur » ne veut rien dire. <strong>Racontez plutôt un truc précis</strong> : le moment où vous avez compris que ces deux-là allaient finir ensemble, une phrase que l'un d'eux a dite sur l'autre, ce que vous leur souhaitez concrètement pour la suite. Trois lignes suffisent, si elles sont vraies.</p>

<p>Et si vous séchez complètement, une bonne question à se poser : qu'est-ce que ce couple fait que les autres ne font pas ? La réponse fait toujours un bon mot de carte.</p>

<a href="/test-couple-mariage/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Et vous ?</span><span class="blog-read-also-title">Le test « êtes-vous prêts pour le mariage »</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
    {
      id: 'en-resume',
      title: `En résumé`,
      content: `<p>Si vous êtes pressé et que vous voulez un chiffre : <strong>pour un bon ami, dans un mariage classique, 100 € par personne est le montant qui ne vous mettra jamais en difficulté</strong>, ni socialement ni financièrement. Montez si vous êtes de la famille ou témoin, descendez si le déplacement vous a déjà coûté cher ou si l'année a été chargée en événements.</p>

<p>Et rappelez-vous le principal : vous avez été invité parce qu'ils voulaient vous voir ce jour-là. Pas pour l'enveloppe.</p>

<div class="blog-cta">
<p class="blog-cta-titre">Vous vous y mettez à plusieurs ?</p>
<p class="blog-cta-texte">Une cagnotte commune, une date limite, un montant indicatif, et chacun participe de son côté. Les mariés reçoivent un seul montant et un message du groupe.</p>
<a class="blog-cta-btn" href="https://c3po.link/Qkq3VF6M7a" target="_blank" rel="sponsored noopener">Ouvrir une cagnotte</a>
<p class="blog-cta-note">Gratuit pour l'organisateur &middot; Sans commission sur les participants</p>
</div>

<p class="blog-affil-mention">Nous pouvons percevoir des commissions d'affiliation avec OnParticipe.</p>`,
    },
  ],
};

export default article;
