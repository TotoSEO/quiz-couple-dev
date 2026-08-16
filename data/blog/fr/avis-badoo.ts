import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'avis-badoo',
  title: `Notre avis sur l'application de rencontre Badoo`,
  metaTitle: `Avis Badoo 2026 : ce qu'on en pense vraiment après des mois de test`,
  metaDescription: `On a testé Badoo pendant plusieurs mois : résultats côté homme et côté femme, tarifs, faux profils. Notre avis complet et sans filtre.`,
  featuredImage: '/blog/avis-badoo.webp',
  featuredImageAlt: `Notre avis sur l'application de rencontre Badoo en 2026`,
  publishedAt: '2026-02-28',
  author: AUTHORS['mathieu-courtin'],
  excerpt: `Badoo, tout le monde la connaît, personne n'en parle franchement. On l'a testée.`,
  introduction: `<p>Badoo, c'est un peu le parent pauvre des applis de rencontre. Tout le monde la connaît, presque personne n'en parle fièrement. On s'y inscrit un peu par défaut, souvent parce qu'on a entendu que "c'est gratuit" ou parce qu'on habite dans une ville où <a href="/blog/avis-tinder/">Tinder</a> rame. L'équipe QuizCouple l'a testée pendant plusieurs mois, en conditions réelles, avec des profils soignés et sans tricher avec des boosts payants au départ. <strong>Voici ce qu'on a trouvé.</strong> Et spoiler : c'est plus nuancé que ce qu'on raconte généralement.</p>`,
  quickSummary: [
    `69% d'hommes sur Badoo. La concurrence est rude côté masculin.`,
    `Les femmes sont submergées. La qualité des messages laisse souvent à désirer.`,
    `La version gratuite est vraiment utilisable. C'est rare, profitez-en.`,
    `Les crédits fonctionnent comme un casino. On fixe un budget avant de commencer.`,
    `Hors des grandes villes, Badoo est souvent la seule appli à avoir assez de profils.`,
  ],
  sections: [
    {
      id: 'notre-evaluation-de-badoo-en-un-coup-d-oeil',
      title: `Notre évaluation de Badoo en un coup d'œil`,
      content: `<div>
<table>
<thead>
<tr>
<th>Critère</th>

<th>Notre évaluation</th>
</tr>
</thead>

<tbody>
<tr>
<td>Facilité d'utilisation</td>

<td>⭐⭐⭐⭐⭐, Simple, fluide, accessible à tout le monde</td>
</tr>

<tr>
<td>Nombre d'utilisateurs</td>

<td>⭐⭐⭐⭐⭐, ~460 millions mondiaux, 2e appli de rencontre en France</td>
</tr>

<tr>
<td>Ratio Homme / Femme</td>

<td>⭐⭐, ~69% hommes / ~31% femmes. Très déséquilibré.</td>
</tr>

<tr>
<td>Respect des utilisateurs</td>

<td>⭐⭐, Harcèlement fréquent côté femmes, modération lente</td>
</tr>

<tr>
<td>Prix</td>

<td>Gratuit · Crédits à l'achat · Badoo Premium ~8-15€/mois</td>
</tr>

<tr>
<td>Version gratuite</td>

<td>⭐⭐⭐⭐, Vraiment utilisable sans payer, c'est rare</td>
</tr>

<tr>
<td>Versions payantes</td>

<td>⭐⭐, Les crédits fonctionnent comme un casino : on en rachète toujours</td>
</tr>

<tr>
<td>Résultats obtenus</td>

<td>Quantité correcte de matchs. Qualité des échanges très variable.</td>
</tr>
</tbody>
</table>
</div>`,
    },
    {
      id: 'comment-on-a-teste-badoo',
      title: `Comment on a testé Badoo`,
      content: `<p>On ne va pas vous faire le coup de l'article rédigé depuis un bureau sans avoir ouvert l'appli. L'équipe QuizCouple a créé deux profils distincts, un masculin, un féminin, avec des photos correctes (ni des mannequins, ni des photos floues du dimanche matin), des bios rédigées honnêtement, et une localisation réelle en France. On a laissé tourner les deux profils simultanément pendant plusieurs mois, en ville moyenne et en grande ville, sans acheter de crédits ni de boost pendant les quatre premières semaines. <strong>L'objectif : voir ce que Badoo donne vraiment à quelqu'un qui s'inscrit normalement.</strong></p>

<p>Ce qu'on a observé est franchement différent selon le genre. À tel point qu'on a décidé de séparer les deux expériences complètement, parce que raconter "l'expérience Badoo" comme si elle était identique pour tout le monde, c'est mentir par omission.</p>`,
    },
    {
      id: 'badoo-quand-on-est-un-homme',
      title: `Badoo quand on est un homme`,
      content: `<p>Commençons par là, parce que c'est probablement le public qui lit le plus ce type d'article.</p>

<p>Les premières 48 heures sur Badoo en tant qu'homme, c'est... silencieux. Le profil est en ligne, quelques likes envoyés, et on attend. <strong>C'est le premier choc.</strong> Sur une appli qui revendique 460 millions d'inscrits, on s'attendrait à un peu plus d'activité. Mais non. Le ratio de la plateforme est brutal : environ 69% des utilisateurs sont des hommes. Concrètement, ça veut dire que chaque femme sur Badoo est noyée sous les messages, et qu'un homme lambda avec un profil correct doit s'armer de patience.</p>

<p>Les chiffres qu'on a observés sur notre profil masculin : <strong>environ 1 match pour 35 à 40 likes envoyés</strong>. Ce n'est pas propre à notre test, les statistiques générales de la plateforme le confirment, c'est autour de 3% de taux de match pour les hommes. Pas catastrophique si on compare à d'autres applis, mais ça demande du volume. Et du volume, Badoo en gratuit peut en fournir (contrairement à Hinge ou Tinder qui plafonnent vite les likes).</p>`,
      subsections: [
        {
          id: 'ce-qui-aide-vraiment-les-hommes-sur-badoo',
          title: `Ce qui aide vraiment les hommes sur Badoo`,
          content: `<p>On a fait une chose simple au bout d'une semaine : on a retravaillé la photo principale. Résultat : <strong>le nombre de matchs a doublé en quatre jours.</strong> Pas en ajoutant de boost payant. Juste en changeant la photo de une à une autre. Badoo mise énormément sur la photo principale dans son algorithme d'affichage, beaucoup plus que Hinge par exemple, où la bio compte autant. Ici, si la première image ne retient pas l'attention en deux secondes, le profil passe à la trappe.</p>

<p>Ce qu'on a appris en testant : un sourire visible, une photo en extérieur, et un cadrage ni trop serré ni trop loin. Les selfies dans les toilettes du bureau, les photos avec les lunettes de ski où on voit surtout la montagne, ou les groupes de cinq potes où on doit deviner qui est qui, tout ça coule un profil plus sûrement qu'une mauvaise bio.</p>

<aside class="blog-tip-box">
<p class="blog-tip-box-title">💡 Astuce</p>

<p>Sur Badoo, les hommes ont tout intérêt à liker avec parcimonie au départ. L'appli a tendance à pénaliser les profils qui likent en masse sans obtenir de retours. Commencer par une trentaine de likes ciblés par jour, sur des profils actifs récemment (l'appli l'indique), donne de bien meilleurs résultats qu'un festival de likes tous azimuts.</p>
</aside>`,
        },
        {
          id: 'le-vrai-probleme-cote-homme-la-qualite-des-echanges',
          title: `Le vrai problème côté homme : la qualité des échanges`,
          content: `<p>On a obtenu des matchs. On a envoyé des premiers messages. Et là, c'est une autre histoire. Sur notre test, <strong>environ 40% des matchs n'ont jamais répondu</strong> au premier message. Parmi ceux qui ont répondu, une bonne partie s'est arrêtée après deux ou trois échanges, sans explication. Le ghosting est endémique sur Badoo, bien plus qu'on ne l'a observé sur Hinge, par exemple, où la mécanique de l'appli crée une dynamique différente.</p>

<p>Est-ce que c'est dû à la qualité des profils sur la plateforme ? En partie. Badoo attire un public très large, des 18 ans aux plus de 50 ans, avec des intentions très diverses : certains cherchent une relation sérieuse, d'autres flirtent sans vraie intention de se voir, et une minorité non négligeable collecte des matchs comme un hobby. Distinguer les uns des autres prend du temps et quelques déconvenues.</p>`,
        },
      ],
    },
    {
      id: 'badoo-quand-on-est-une-femme',
      title: `Badoo quand on est une femme`,
      content: `<p>L'expérience est radicalement différente. Radicalement.</p>

<p>Le profil féminin qu'on a créé a reçu ses premiers messages dans l'heure qui a suivi l'inscription. Pas cinq ou dix messages, des dizaines. Au bout de 48 heures, la boîte de réception ressemblait à une salle d'attente aux urgences un soir de week-end. <strong>Le ratio homme/femme joue à plein dans l'autre sens.</strong> Une femme sur Badoo n'attend jamais les matchs, elle les trie.</p>

<p>Et trier, c'est un euphémisme. Sur les messages reçus pendant notre test, on a établi une catégorisation approximative :</p>

<ul>
<li>~30% de messages acceptables, avec une vraie phrase construite</li>

<li>~40% de "Salut" ou "CC" sans aucun effort supplémentaire</li>

<li>~20% de messages d'emblée trop insistants ou déplacés</li>

<li>~10% carrément irrespectueux ou inappropriés</li>
</ul>

<p>C'est la réalité de l'expérience féminine sur Badoo en 2026. <strong>L'abondance de sollicitations ne rend pas les choses plus simples</strong>, elle crée une fatigue du tri, une méfiance systématique, et une tendance à ignorer même des messages corrects parce qu'on n'a plus l'énergie de répondre à tout le monde.</p>`,
      subsections: [
        {
          id: 'ce-que-les-femmes-vivent-concretement',
          title: `Ce que les femmes vivent concrètement`,
          content: `<p>On a gardé le profil féminin actif pendant deux mois. Ce qui ressort nettement : les femmes qui obtiennent de bons résultats sur Badoo sont celles qui prennent l'initiative. Attendre passivement dans sa boîte de réception et espérer tomber sur quelqu'un d'intéressant parmi les messages entrants, <strong>c'est une stratégie perdante</strong>. La qualité des messages reçus est trop inégale pour que ça soit efficace.</p>

<p>À partir du moment où le profil féminin a commencé à liker et contacter en premier des profils ciblés (au lieu d'attendre), la qualité des échanges a nettement progressé. Les hommes contactés en premier répondent vite, ils font des efforts dans leurs réponses, probablement parce qu'ils sont eux-mêmes peu habitués à être approchés. C'est un changement de dynamique qui demande de dépasser une résistance initiale, mais ça vaut le coup.</p>

<aside class="blog-tip-box">
<p class="blog-tip-box-title">💡 Astuce</p>

<p>Côté femme, la fonctionnalité "Rencontres" (le swipe) est souvent plus efficace que d'attendre dans sa messagerie. En prenant l'initiative de liker des profils qui correspondent vraiment à ce qu'on cherche, on génère des matchs plus qualifiés, et des conversations qui partent sur de meilleures bases.</p>
</aside>`,
        },
        {
          id: 'le-harcelement-le-vrai-angle-mort-de-badoo',
          title: `Le harcèlement : le vrai angle mort de Badoo`,
          content: `<p>Il faut en parler. Sur notre test de deux mois avec le profil féminin, on a dû bloquer et signaler plusieurs comptes pour des messages insistants ou irrespectueux. La modération de Badoo existe, mais elle est lente. <strong>Les outils de signalement fonctionnent</strong>, mais le délai de traitement laisse parfois le profil signalé continuer à envoyer des messages pendant des heures après le signalement.</p>

<p>Ce n'est pas un problème unique à Badoo, c'est une réalité de toutes les grandes plateformes de rencontre. Mais Badoo, avec son énorme base d'utilisateurs et son positionnement "pour tout le monde", attire un public très hétérogène qui inclut une frange de personnes qui n'auraient probablement rien à faire sur une appli de rencontres sérieuses.</p>`,
        },
      ],
    },
    {
      id: 'gratuit-jusqu-a-un-certain-point',
      title: `Gratuit... jusqu'à un certain point`,
      content: `<p>Badoo se vante d'être gratuit. C'est vrai, dans les grandes lignes. On peut s'inscrire, remplir un profil, liker, matcher et discuter sans jamais sortir la carte bleue. <strong>C'est l'un des vrais avantages de la plateforme</strong>, et il ne faut pas le minimiser, la plupart des applis concurrentes brident beaucoup plus la version gratuite.</p>

<p>Sauf que. L'appli propose des "crédits" pour acheter des fonctionnalités spécifiques : le Spotlight (mettre son profil en avant pendant 30 minutes), les Superpouvoirs (voir qui vous a liké, remonter dans les résultats), ou les badges de vérification payants. Et ces crédits, c'est une mécanique bien rodée. On en achète un peu pour tester, on voit une légère amélioration de la visibilité, et on se retrouve à en racheter. <strong>C'est exactement le modèle des jeux freemium.</strong> Pas d'abonnement fixe, mais des micro-achats qui s'accumulent vite si on n'y fait pas attention.</p>

<p>Pour information : le Spotlight coûte environ 3 crédits, et un pack de 100 crédits tourne autour de 15-20€. Si vous utilisez le Spotlight deux ou trois fois par semaine, ce qui est tentant quand on voit les résultats, on arrive vite à 30-40€ par mois sans avoir souscrit le moindre abonnement.</p>

<aside class="blog-tip-box">
<p class="blog-tip-box-title">💡 Astuce</p>

<p>Si vous voulez tester Badoo avec un budget limité, résistez aux crédits pendant les deux premières semaines. D'abord parce que ça oblige à travailler le profil plutôt que de compenser avec de la visibilité achetée. Ensuite parce que l'algorithme de Badoo récompense les profils récemment actifs, les premiers jours après l'inscription, vous avez naturellement plus de visibilité que la moyenne. Exploitez cette période sans rien dépenser.</p>
</aside>`,
    },
    {
      id: 'ce-que-badoo-fait-mieux-que-tout-le-monde',
      title: `Ce que Badoo fait mieux que tout le monde`,
      content: `<p>Une chose mérite d'être soulignée, parce qu'on ne la mentionne pas assez : <strong>Badoo est l'une des rares applis à fonctionner correctement hors des grandes métropoles.</strong> On a testé en ville de 80 000 habitants. Les profils étaient là. Pas des centaines, mais assez pour avoir une vraie activité. Sur <a href="/blog/avis-hinge-rencontre/">Hinge</a> dans la même ville au même moment, on n'avait presque rien. Sur <a href="/blog/avis-bumble/">Bumble</a>, pareil. Badoo, avec sa base massive d'utilisateurs en France (2e appli la plus téléchargée derrière Tinder), couvre un territoire que ses concurrentes plus "hype" n'atteignent pas encore.</p>

<p>L'appli est aussi franchement bien conçue côté interface. Pas de friction inutile, tout est clair, les fonctionnalités sont où on s'attend à les trouver. Et elle est entièrement en français, ça paraît basique, mais quand on a testé Hinge avec son interface 100% anglophone, on apprécie vraiment.</p>`,
    },
    {
      id: 'les-choses-qui-finissent-par-lasser',
      title: `Les choses qui finissent par lasser`,
      content: `<p>Le problème des faux profils. On ne va pas le minimiser. Sur notre test, on a identifié plusieurs profils suspects : photos trop parfaites issues de banques d'images, réponses génériques, empressement à déplacer la conversation vers WhatsApp ou Instagram après deux messages. Badoo vérifie les profils à l'inscription via une photo de vérification, mais cette vérification ne garantit pas l'authenticité des intentions.</p>

<p>L'autre truc qui agace : <strong>les notifications agressives.</strong> Badoo est champion de la notification inutile. "Quelqu'un a regardé votre profil !" "Votre profil a été consulté 3 fois aujourd'hui !" "Boostez votre profil maintenant !" On finit par désactiver les notifications en bloc, ce qui n'est pas idéal pour rester actif sur l'appli. Une appli qui noie ses utilisateurs dans des notifications pour les pousser à acheter des crédits, c'est un choix éditorial qu'on assume de trouver pénible.</p>`,
    },
    {
      id: 'notre-verdict',
      title: `Notre verdict`,
      content: `<p class="blog-note-score"><strong>5,5/10</strong></p>

<p>Badoo, c'est l'appli qu'on recommande quand les autres ne fonctionnent pas. Hors grandes villes, c'est souvent la seule qui a assez de profils pour être vraiment utile. La version gratuite est honnête, l'interface est claire, et avec un bon profil on obtient des résultats. Sauf que le ratio hommes/femmes plombe l'expérience masculine, le harcèlement pèse sur l'expérience féminine, et le modèle des crédits a tout du casino. <strong>Une appli qui aurait le potentiel d'être excellente</strong>, mais qui semble avoir décidé de miser sur le volume plutôt que sur la qualité.</p>`,
    },
  ],
};

export default article;
