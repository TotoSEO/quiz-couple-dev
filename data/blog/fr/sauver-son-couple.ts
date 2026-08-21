import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'sauver-son-couple',
  title: "Comment sauver son couple : les étapes quand tout semble perdu",
  metaTitle: "Comment sauver son couple : 6 étapes quand tout semble perdu",
  metaDescription: "Tu sens que ton couple s'effondre ? Voici les étapes concrètes pour sauver ta relation, ou savoir quand il vaut mieux lâcher prise. Guide complet.",
  featuredImage: '/blog/sauver-son-couple.svg',
  featuredImageAlt: "Couple assis côte à côte en train de discuter pour sauver leur relation",
  publishedAt: '2026-05-26',
  author: AUTHORS['thomas'],
  excerpt: "Sauver son couple ne veut pas dire s'accrocher à tout prix. C'est comprendre ce qui s'est cassé, décider si ça vaut le coup d'être réparé, et faire le travail à deux, vraiment à deux.",
  introduction: `<p>Tu sens que ça se délite. Les silences sont plus longs que les conversations. Quand vous parlez, ça tourne à la dispute ou au reproche déguisé. Tu ne sais plus si tu l'aimes ou si tu as juste peur de partir. Et le pire, c'est que tu ne sais même plus depuis quand c'est comme ça.</p>
<p>Si tu es sur cet article, c'est probablement que tu as tapé quelque chose comme "comment sauver son couple" dans un moment de lucidité douloureuse. <strong>Ce réflexe-là dit quelque chose d'important : tu n'as pas encore lâché.</strong> Et c'est déjà un point de départ.</p>
<p>Mais sauver son couple, ce n'est pas s'accrocher à tout prix. Ce n'est pas non plus une recette miracle en cinq étapes. C'est un processus honnête, parfois brutal, qui demande de regarder en face ce qui s'est cassé, ce qui peut être réparé, et ce qui ne le peut plus. Cet article est là pour t'accompagner dans cette réflexion, sans te vendre de faux espoir.</p>`,
  quickSummary: [
    "Les signes de danger : silence émotionnel, mépris, vie parallèle, perte d'envie de se battre.",
    "Les couples ne se perdent pas d'un coup. La routine, les non-dits et le ressentiment accumulé font le travail lentement.",
    "Les ultimatums, le score-keeping et l'évitement sont les erreurs les plus fréquentes, et les plus destructrices.",
    "Sauver son couple passe par la communication vulnérable, pas par les grands gestes.",
    "Parfois, la meilleure chose à faire pour soi, c'est d'accepter que la relation est terminée.",
  ],
  sections: [
    {
      id: 'signes-couple-en-danger',
      title: "Les signes que ton couple est en danger",
      content: `<div><table><thead><tr><th>Le signe</th><th>Ce que ça révèle vraiment</th><th>Gravité</th></tr></thead><tbody>
<tr><td>Vous ne parlez plus de rien d'important</td><td>La connexion émotionnelle s'est éteinte. Vous cohabitez.</td><td>Fort</td></tr>
<tr><td>Les disputes tournent toujours autour des mêmes sujets</td><td>Un problème de fond n'a jamais été résolu. Il ressort sans cesse.</td><td>Fort</td></tr>
<tr><td>Tu ressens du mépris ou tu en reçois</td><td>Le mépris est le prédicteur n°1 de rupture selon la recherche.</td><td>Très fort</td></tr>
<tr><td>Tu fantasmes une vie sans l'autre</td><td>Tu as commencé à faire ton deuil émotionnel.</td><td>Fort</td></tr>
<tr><td>Le contact physique a disparu</td><td>L'intimité suit la connexion émotionnelle. Quand l'une meurt, l'autre aussi.</td><td>Fort</td></tr>
<tr><td>Tu n'as plus envie de te battre</td><td>L'indifférence a remplacé la colère. C'est souvent pire.</td><td>Très fort</td></tr>
<tr><td>Vous vivez des vies parallèles</td><td>Le couple est devenu une colocation avec un bail émotionnel.</td><td>Fort</td></tr>
<tr><td>Tu te confies à tout le monde sauf à ton/ta partenaire</td><td>La confiance relationnelle est brisée.</td><td>Très fort</td></tr>
</tbody></table></div>
<p>Si tu te reconnais dans trois de ces lignes ou plus, ce n'est pas de la parano. <strong>C'est un signal que ta relation a besoin d'attention, maintenant, pas dans six mois.</strong> Tu peux compléter cette lecture en faisant un <a href="/tester-son-couple/">test de couple</a> pour avoir une vue d'ensemble plus claire.</p>`,
      subsections: [
        {
          id: 'indifference-vs-colere',
          title: "L'indifférence est plus dangereuse que la colère",
          content: `<p>On croit souvent que les disputes sont le signe que ça va mal. En réalité, <strong>c'est quand on arrête de se disputer que c'est le plus inquiétant.</strong> La colère, aussi désagréable soit-elle, prouve qu'il y a encore de l'énergie investie dans la relation. Tu te bats parce que tu veux que ça change.</p>
<p>L'indifférence, c'est autre chose. C'est quand tu entends un truc qui t'aurait fait bondir il y a six mois, et que là, tu hausses les épaules. Quand tu n'as même plus envie de corriger, d'expliquer, de réclamer. Tu as lâché. Et souvent, c'est là que l'autre commence à paniquer, quand il réalise que tu ne réagis plus.</p>`,
        },
        {
          id: 'mepris-signal-critique',
          title: "Le mépris : le signal le plus critique",
          content: `<p>Le psychologue John Gottman, après des décennies de recherche sur les couples, a identifié le mépris comme <strong>le prédicteur le plus fiable de divorce</strong>. Le mépris, c'est lever les yeux au ciel quand l'autre parle. C'est le sarcasme méchant. C'est cette sensation que l'autre te considère comme inférieur(e), stupide, ou insignifiant(e).</p>
<p>Ce n'est pas une mauvaise passe. C'est un poison relationnel. Si le mépris est installé dans votre quotidien, dans un sens ou dans l'autre, il faut le prendre au sérieux. Ce n'est pas quelque chose qui se règle en "faisant des efforts". Ça demande un vrai travail, souvent accompagné.</p>`,
        },
        {
          id: 'erosion-confiance',
          title: "L'érosion silencieuse de la confiance",
          content: `<p>La confiance ne se brise pas toujours d'un coup. Parfois, elle s'effrite. Une promesse non tenue par-ci, un mensonge "pour éviter le conflit" par-là, des choses importantes jamais suivies d'effet. Chaque micro-trahison dépose une couche de méfiance.</p>
<p>Au bout d'un moment, tu ne crois plus ce que l'autre te dit. Pas parce qu'il ment sur tout, mais parce que tu as appris que ses mots et ses actes ne correspondent pas toujours. Et sans confiance, <strong>la relation tourne à vide</strong>. Si tu ressens ce décalage, <a href="/test-confiance-couple/">évaluer le niveau de confiance dans ton couple</a> peut t'aider à poser des mots sur ce que tu vis.</p>`,
        },
      ],
    },
    {
      id: 'pourquoi-les-couples-se-perdent',
      title: "Pourquoi les couples se perdent",
      content: `<p>Les couples ne se brisent pas en un jour. Il n'y a presque jamais un événement unique qui explique tout. C'est une accumulation, un glissement progressif, une succession de micro-renoncements qui finissent par créer un fossé. Comprendre les mécanismes, c'est le premier pas pour ne plus les subir.</p>

<p>Reste à savoir si le glissement est encore réversible. Un <a href="/test-est-ce-la-fin-de-mon-couple/">questionnaire qui pèse chaque signe selon sa gravité et situe la relation sur huit paliers</a> répond plus honnêtement à cette question que l'humeur du jour où on se la pose.</p>`,
      subsections: [
        {
          id: 'routine-tue-desir',
          title: "La routine qui étouffe le désir et la connexion",
          content: `<p>La routine en elle-même n'est pas un problème. Elle peut même être rassurante. Ce qui tue le couple, c'est <strong>la routine sans intention</strong>. Quand les jours se ressemblent tous, que les soirées sont Netflix + téléphone + dodo, que les week-ends sont des listes de courses et de corvées, sans jamais un moment où vous vous regardez vraiment.</p>
<p>Le désir, l'envie, la curiosité pour l'autre, ça ne meurt pas tout seul. Ça meurt quand on arrête de le nourrir. Quand la relation devient un pilotage automatique et que personne ne reprend les commandes. Tu te retrouves un jour à réaliser que tu vis avec quelqu'un que tu ne connais plus vraiment.</p>`,
        },
        {
          id: 'communication-qui-s-eteint',
          title: "La communication qui s'éteint",
          content: `<p>Au début, vous parliez de tout. Vos rêves, vos peurs, vos journées, vos envies. Puis les conversations se sont réduites à la logistique : qui récupère les enfants, qu'est-ce qu'on mange, tu as payé la facture.</p>
<p><strong>La communication émotionnelle est le système sanguin d'un couple.</strong> Quand elle s'arrête, tout le reste commence à mourir. Et le piège, c'est que personne ne décide consciemment d'arrêter de communiquer. Ça se fait par petites étapes : un sujet sensible évité, une remarque ravalée, une conversation difficile repoussée à "plus tard", un "plus tard" qui ne vient jamais.</p>`,
        },
        {
          id: 'ressentiment-non-dit',
          title: "Le ressentiment accumulé : le tueur silencieux",
          content: `<p>Le ressentiment, c'est la colère qu'on n'a pas exprimée et qui fermente. Chaque frustration avalée, chaque besoin ignoré, chaque sacrifice non reconnu, tout ça s'empile. Et un jour, ça déborde. Souvent pour un truc insignifiant, une chaussette par terre, un retard de dix minutes, un ton un peu sec.</p>
<p>L'autre ne comprend pas. "Mais pourquoi tu réagis comme ça pour si peu ?" Parce que ce n'est pas "si peu". C'est six mois, un an, trois ans de choses non dites qui explosent d'un coup. <strong>Le ressentiment détruit plus de couples que l'infidélité.</strong> Parce qu'il avance masqué et qu'on ne le voit que quand il est déjà trop tard. Si tu sens que cette accumulation est en train de se produire, <a href="/questions-couple/">prendre le temps de résoudre les problèmes de fond</a> est urgent.</p>`,
        },
      ],
    },
    {
      id: 'erreurs-qui-aggravent',
      title: "Les erreurs qui aggravent tout",
      content: `<p>Quand on sent son couple en danger, le réflexe est de faire quelque chose. N'importe quoi. Le problème, c'est que certaines réactions instinctives ne font qu'empirer la situation. Voici les pièges les plus courants.</p>`,
      subsections: [
        {
          id: 'ultimatums-menaces',
          title: "Les ultimatums et les menaces de rupture",
          content: `<p>"Si tu ne changes pas, je pars." Cette phrase, tu l'as peut-être déjà dite. Ou entendue. Et sur le moment, elle peut sembler nécessaire, une façon de montrer que c'est sérieux, que tu es à bout.</p>
<p>Sauf que <strong>les ultimatums ne créent jamais du changement durable</strong>. Ils créent de la peur. Et un changement motivé par la peur de perdre l'autre, ça tient deux semaines. Ensuite, les vieux réflexes reviennent, et la prochaine fois que tu poses un ultimatum, il a moins de poids. Jusqu'au jour où l'autre dit "très bien, pars".</p>
<p>L'ultimatum est l'aveu qu'on ne sait plus communiquer autrement. Ce n'est pas un outil de construction, c'est une arme de destruction. Si tu en es là, le vrai message à transmettre n'est pas "change ou je pars", mais "je souffre et j'ai besoin qu'on trouve une solution ensemble".</p>`,
        },
        {
          id: 'score-keeping',
          title: "Le score-keeping : tenir les comptes de tout",
          content: `<p>"Moi j'ai fait ci, toi tu n'as jamais fait ça." "La dernière fois, c'est moi qui…" <strong>Tenir les comptes dans un couple, c'est transformer une relation en tribunal.</strong> Et dans un tribunal, il y a un gagnant et un perdant. Ce n'est pas comme ça qu'on reconstruit quoi que ce soit.</p>
<p>Le score-keeping vient souvent d'un sentiment d'injustice légitime. Tu as l'impression de donner plus que l'autre, et tu veux que ce soit reconnu. C'est compréhensible. Mais la méthode est toxique, parce qu'elle met l'autre sur la défensive et transforme chaque discussion en compétition de qui a le plus souffert.</p>
<p>Ce qui fonctionne mieux : exprimer le besoin derrière. "J'ai besoin de sentir que toi aussi tu t'investis" est plus productif que "moi j'ai fait X, Y et Z pendant que toi tu ne faisais rien".</p>`,
        },
        {
          id: 'evitement-problemes',
          title: "L'évitement : faire comme si tout allait bien",
          content: `<p>C'est le piège inverse. Au lieu de se battre, on fuit. On évite les sujets qui fâchent. On fait bonne figure. On se dit que "ça va passer". On remplit le silence avec des activités, des sorties, des projets, tout sauf la conversation qui fait peur.</p>
<p><strong>L'évitement est un anesthésiant, pas un remède.</strong> Il engourdit la douleur temporairement, mais le problème continue de grossir en dessous. Et plus tu attends, plus la conversation sera difficile quand elle finira par avoir lieu, parce qu'elle finit toujours par avoir lieu, volontairement ou par explosion.</p>
<p>Si tu évites parce que tu as peur de la réaction de l'autre, c'est un signal en soi. Dans un <a href="/test-couple-sain/">couple sain</a>, tu devrais pouvoir exprimer un malaise sans craindre de représailles. Si ce n'est pas le cas, la question n'est pas "comment aborder le sujet", mais "pourquoi est-ce que j'ai peur de parler à la personne qui est censée être mon allié(e)".</p>`,
        },
      ],
    },
    {
      id: 'etapes-sauver-couple',
      title: "Les étapes concrètes pour sauver son couple",
      content: `<p>Si les deux personnes sont prêtes à essayer, vraiment essayer, pas juste le dire, il y a des choses qui fonctionnent. Ce ne sont pas des astuces magiques. C'est du travail. Mais c'est du travail qui peut tout changer.</p>`,
      subsections: [
        {
          id: 'communication-vulnerable',
          title: "Réapprendre la communication vulnérable",
          content: `<p>La clé n'est pas de "mieux communiquer" au sens technique. C'est d'oser dire ce qui fait peur. <strong>"J'ai peur que tu ne m'aimes plus." "Je me sens seul(e) à côté de toi." "J'ai l'impression qu'on s'est perdu."</strong> Ces phrases-là, elles coûtent. Mais elles ouvrent des portes que les reproches ne feront jamais qu'enfoncer.</p>
<p>La communication vulnérable, c'est parler depuis la blessure, pas depuis la colère. C'est dire "je souffre" plutôt que "tu me fais souffrir". La différence est subtile mais énorme : la première phrase invite l'autre à se rapprocher, la seconde le pousse à se défendre.</p>
<p>Pour que ça marche, il faut un cadre. Choisir un moment calme. Couper les distractions. Écouter vraiment, pas juste attendre son tour pour répondre. Et accepter que ce que l'autre va dire puisse être difficile à entendre. Comprendre <a href="/test-langage-amour-couple/">le langage amoureux de ton/ta partenaire</a> peut aussi débloquer des malentendus profonds.</p>`,
        },
        {
          id: 'vulnerabilite-force',
          title: "Choisir la vulnérabilité plutôt que la fierté",
          content: `<p>Dans un couple en crise, la fierté est l'ennemi numéro un. "C'est à lui de faire le premier pas." "Je ne vais pas m'excuser alors que c'est elle qui a tort." <strong>La fierté protège l'ego, mais elle assassine la relation.</strong></p>
<p>Être vulnérable, ce n'est pas être faible. C'est être suffisamment fort(e) pour dire : "Je tiens à nous et je suis prêt(e) à baisser la garde pour qu'on avance." Ce n'est pas donner raison à l'autre. C'est montrer que la relation compte plus que le besoin d'avoir raison.</p>
<p>Et oui, il y a un risque. L'autre peut ne pas répondre à cette ouverture. Il peut la piétiner. Mais si tu ne prends pas ce risque, vous restez deux personnes retranchées derrière vos murs, à attendre que l'autre cède. Et personne ne cède. Et le couple meurt.</p>`,
        },
        {
          id: 'temps-qualite-intentionnel',
          title: "Recréer du temps de qualité intentionnel",
          content: `<p>Pas du temps ensemble. Du <strong>temps de qualité</strong>. La différence est énorme. Être assis sur le même canapé en scrollant chacun son téléphone, ce n'est pas du temps de qualité. C'est de la coprésence.</p>
<p>Ce qui reconstruit un couple, c'est des moments où vous êtes vraiment l'un avec l'autre. Une balade sans téléphone. Un dîner où vous vous posez des vraies questions. Une activité nouvelle qui vous sort de votre routine. Même trente minutes par jour de connexion réelle valent plus que tout un week-end de cohabitation silencieuse.</p>
<p>L'idée n'est pas de "faire comme avant". On ne revient pas en arrière. C'est de construire quelque chose de nouveau ensemble. De se redécouvrir tels que vous êtes maintenant, pas tels que vous étiez il y a trois ans.</p>`,
        },
      ],
    },
    {
      id: 'quand-se-faire-aider',
      title: "Quand faut-il se faire aider ?",
      content: `<p>Il y a un moment où la bonne volonté ne suffit plus. Où les mêmes conversations tournent en boucle. Où vous avez tout essayé, ou l'impression d'avoir tout essayé, et que rien ne bouge. C'est là que l'aide extérieure entre en jeu.</p>`,
      subsections: [
        {
          id: 'therapie-de-couple',
          title: "La thérapie de couple : pas un aveu d'échec",
          content: `<p>Beaucoup de gens pensent que la thérapie de couple, c'est le dernier recours avant la rupture. <strong>C'est exactement l'inverse.</strong> Plus tu y vas tôt, plus elle est efficace. Les couples qui attendent d'être au bord du gouffre rendent le travail du thérapeute infiniment plus difficile.</p>
<p>Un bon thérapeute de couple ne prend pas parti. Il ne va pas te dire qui a raison et qui a tort. Son rôle, c'est de créer un espace sécurisé où chacun peut s'exprimer, et de vous aider à identifier les schémas qui vous bloquent : le reproche-retrait, l'escalade symétrique, l'évitement mutuel.</p>
<p>Les approches qui ont fait leurs preuves : la <strong>thérapie EFT</strong> (Emotionally Focused Therapy), la <strong>méthode Gottman</strong>, les <strong>TCC de couple</strong>. Le plus important n'est pas l'étiquette, c'est de trouver un(e) thérapeute avec qui vous vous sentez tous les deux en confiance.</p>`,
        },
        {
          id: 'quand-consulter',
          title: "Les signaux qu'il est temps de consulter",
          content: `<p>Tu te demandes si c'est "assez grave" pour consulter ? Voici quelques repères. Si les mêmes problèmes reviennent depuis plus de six mois sans amélioration. Si les disputes deviennent destructrices : cris, insultes, murs de silence de plusieurs jours. Si l'un de vous a complètement décroché émotionnellement. Si un événement majeur a secoué le couple (<a href="/blog/pardonner-une-infidelite/">infidélité</a>, deuil, crise professionnelle) et que vous n'arrivez pas à le traverser ensemble.</p>
<p><strong>La règle simple : si tu te poses la question, c'est probablement que c'est le bon moment.</strong> Personne n'a jamais regretté d'avoir consulté trop tôt. Beaucoup regrettent d'avoir consulté trop tard.</p>`,
        },
        {
          id: 'quand-un-seul-veut',
          title: "Quand un seul des deux veut y aller",
          content: `<p>C'est la situation la plus frustrante. Tu es prêt(e) à faire le travail, et l'autre refuse. "Je n'ai pas besoin d'un psy." "Ça ne sert à rien." "C'est notre problème, on le règle entre nous." Sauf que vous ne le réglez pas entre vous. C'est précisément pour ça que tu veux consulter.</p>
<p>Tu ne peux pas forcer l'autre. Mais tu peux y aller seul(e). Un travail individuel sur tes schémas relationnels, tes réactions, tes besoins, ça a de la valeur en soi. Et parfois, quand l'un des deux commence à changer sa façon de communiquer, ça crée un effet d'entraînement. L'autre suit, pas toujours, mais souvent.</p>
<p>Et si l'autre ne suit vraiment pas ? Si après des mois d'effort de ta part, rien ne bouge ? Alors tu auras au moins la clarté de savoir que tu as <a href="/blog/copain-ne-fait-pas-effort/">fait ta part</a>. Et que la suite de l'histoire dépend d'une décision, pas d'un regret.</p>`,
        },
      ],
    },
    {
      id: 'quand-ne-plus-sauver',
      title: "Quand sauver son couple n'est plus la bonne option",
      content: `<p>C'est la partie la plus difficile de cet article. Et la plus nécessaire. Parce que parfois, le courage n'est pas de rester. <strong>C'est de reconnaître que c'est fini.</strong></p>`,
      subsections: [
        {
          id: 'limites-non-negociables',
          title: "Les limites non négociables",
          content: `<p>Il y a des situations où la question n'est plus "comment sauver mon couple" mais "comment me protéger". La violence, physique, verbale, psychologique. La manipulation constante. L'infidélité répétée sans aucune remise en question. Le mépris systématique. L'<a href="/blog/dependance-affective/">attachement qui ressemble plus à de la dépendance</a> qu'à de l'amour.</p>
<p>Dans ces cas-là, sauver le couple ne doit pas se faire au prix de ta santé mentale, de ta dignité, de ta sécurité. Il y a des <a href="/blog/choses-pas-accepter-couple/">choses qu'on ne devrait jamais accepter</a> dans une relation, même au nom de l'amour. Surtout au nom de l'amour.</p>`,
        },
        {
          id: 'rester-mauvaises-raisons',
          title: "Rester pour les mauvaises raisons",
          content: `<p>La peur de la solitude. La culpabilité. Les enfants. La pression familiale. Le regard des autres. Les années investies. L'habitude. Ce sont des raisons de rester. Mais <strong>ce ne sont pas des raisons de couple</strong>. Ce sont des raisons de confort ou de peur.</p>
<p>Rester parce que tu as peur de partir, ce n'est pas sauver son couple. C'est s'enfermer dans quelque chose qui te fait du mal en le déguisant en choix. Et pendant ce temps, tu perds les années que tu pourrais passer à construire quelque chose de sain, avec quelqu'un d'autre ou avec toi-même.</p>
<p>La question honnête : si tu retirais la peur et la culpabilité de l'équation, est-ce que tu choisirais encore cette relation ? Si la réponse est non, tu sais ce qu'il te reste à faire. Même si c'est terrifiant.</p>`,
        },
        {
          id: 'partir-aussi-acte-amour',
          title: "Partir peut aussi être un acte d'amour",
          content: `<p>On présente toujours la rupture comme un échec. Comme si la durée d'une relation en mesurait la valeur. Mais certaines relations ont donné tout ce qu'elles avaient à donner. <strong>Les reconnaître, c'est respecter ce qu'elles ont été sans s'obliger à ce qu'elles continuent.</strong></p>
<p>Partir, ça peut être un acte d'amour envers toi-même. Mais aussi envers l'autre. Libérer quelqu'un d'une relation qui ne fonctionne plus, c'est lui donner la possibilité de trouver quelqu'un avec qui ça fonctionnera. Ce n'est pas cruel. C'est honnête.</p>
<p>Et si tu hésites encore, fais un état des lieux lucide. Pose-toi les bonnes questions. <a href="/tester-son-couple/">Évalue où en est vraiment ton couple.</a> Non pas pour qu'un test décide à ta place, mais pour t'aider à organiser ce que tu ressens déjà.</p>`,
        },
      ],
    },
    {
      id: 'conclusion',
      title: "Ce qu'il faut retenir",
      content: `<p>Sauver son couple, c'est possible. Mais pas dans toutes les situations, et pas à n'importe quel prix. Ce qui fait la différence, c'est la lucidité : voir les problèmes tels qu'ils sont, pas tels qu'on voudrait qu'ils soient. Et surtout, être deux à vouloir faire le travail.</p>
<p><strong>Un couple ne se sauve pas seul(e).</strong> Tu peux initier le changement, ouvrir la porte, tendre la main. Mais si l'autre reste de l'autre côté sans bouger, ta main finira par se fatiguer. Et ce n'est la faute de personne, c'est juste la réalité d'une relation qui demande deux personnes engagées.</p>
<p>Quelle que soit l'issue, rappelle-toi que poser la question "est-ce que ce couple vaut la peine d'être sauvé ?" est déjà un acte de courage. Parce que la réponse, dans un sens comme dans l'autre, change tout.</p>
<a href="/blog/dependance-affective/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lire aussi</span><span class="blog-read-also-title">Dépendance affective : quand aimer devient un besoin vital</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
