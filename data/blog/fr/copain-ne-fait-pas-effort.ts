import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'copain-ne-fait-pas-effort',
  title: "Mon copain ne fait pas d'effort : ce que ça veut dire et quoi faire",
  metaTitle: "Mon copain ne fait pas d'effort : que faire ?",
  metaDescription: "Tu fais tout, lui rien ou presque. Pourquoi certains hommes arrêtent de faire des efforts, comment le reconnaître et quoi faire concrètement.",
  featuredImage: '',
  featuredImageAlt: "Table dressée pour deux, un couvert soigné avec bougie et fleurs, l'autre place laissée vide",
  publishedAt: '2026-03-08',
  author: AUTHORS['thomas'],
  excerpt: "Le déséquilibre d'effort dans un couple est l'une des causes les plus fréquentes de rupture, précisément parce qu'il s'installe progressivement et qu'on a tendance à s'y adapter.",
  introduction: `<p>Tu organises, tu anticipes, tu penses à tout. Les sorties, les cadeaux, les moments ensemble, <a href="/blog/questions-a-poser-a-son-copain/">les discussions importantes</a>. Et lui, il est là, il répond quand tu proposes, il participe quand tu insistes, mais rien ne vient vraiment de lui. Tu as l'impression de <a href="/test-couple-sain/">porter la relation à bout de bras</a> depuis un moment, et tu commences à te demander si c'est normal, si tu demandes trop, ou si quelque chose ne va pas vraiment.</p>
<p>Ce n'est pas toi qui exagères. <strong>Le déséquilibre d'effort dans un couple est l'une des causes les plus fréquentes de rupture, précisément parce qu'il s'installe progressivement et qu'on a tendance à s'y adapter avant de réaliser à quel point il pèse.</strong> Cet article est là pour mettre des mots sur ce que tu ressens, comprendre ce qui se passe vraiment, et décider quoi en faire.</p>`,
  quickSummary: [
    "Le déséquilibre d'effort s'installe progressivement et s'aggrave si on ne l'adresse pas.",
    "Il existe plusieurs raisons : effet \"acquis\", incompréhension de tes besoins, baisse d'investissement émotionnel, ou façon de fonctionner ancrée.",
    "Non, tu ne demandes pas trop. Vouloir que ton partenaire pense à toi spontanément est un besoin relationnel normal.",
    "Comment en parler : parler de ce que tu ressens toi, être précise sur ce que tu attends, choisir le bon moment.",
    "Ce qui peut changer avec une conversation honnête, et ce qui ne changera pas sans travail profond de sa part.",
  ],
  sections: [
    {
      id: 'signaux-en-un-coup-d-oeil',
      title: "Les signaux en un coup d'œil",
      content: `<div><table><thead><tr><th>Ce que tu observes</th><th>Ce que ça peut vouloir dire</th></tr></thead><tbody>
<tr><td>C'est toujours toi qui proposes des choses à faire</td><td>Il attend, il ne crée pas. La relation repose sur toi.</td></tr>
<tr><td>Il oublie les dates importantes</td><td>Tu n'es pas une priorité dans son organisation mentale.</td></tr>
<tr><td>Les efforts s'arrêtent après la phase de séduction</td><td>Il faisait des efforts pour te conquérir, pas pour la relation.</td></tr>
<tr><td>Il ne cherche pas à te faire plaisir spontanément</td><td>L'attention consciente a disparu. Ce n'est pas de la malveillance, mais c'est réel.</td></tr>
<tr><td>Quand tu en parles, il promet, mais rien ne change</td><td>Il entend le message mais ne ressentit pas l'urgence d'agir.</td></tr>
<tr><td>Tu te sens seule dans la relation</td><td>La présence physique ne remplace pas l'investissement émotionnel.</td></tr>
<tr><td>Il fait des efforts pour ses amis, son travail, mais pas pour toi</td><td>La capacité est là. La motivation, non.</td></tr>
</tbody></table></div>`,
    },
    {
      id: 'pourquoi-les-hommes-arretent',
      title: "Pourquoi les hommes arrêtent de faire des efforts",
      content: `<p>La première chose à comprendre, c'est que "il ne fait pas d'effort" recouvre des réalités très différentes selon les situations. Il y a plusieurs raisons possibles, et elles n'ont pas toutes la même implication pour toi.</p>`,
      subsections: [
        {
          id: 'effet-acquis',
          title: "L'effet \"acquis\"",
          content: `<p>C'est le cas le plus fréquent et, d'une certaine façon, le plus banal. Au début d'une relation, les deux partenaires sont en mode séduction : on fait attention, on prévoit, on cherche à plaire. Puis la relation s'installe, la sécurité s'installe avec elle, et l'effort conscient disparaît progressivement. Pas par indifférence, mais par confort. Le problème, c'est que ce relâchement est souvent asymétrique : toi tu continues, lui il se laisse porter. <strong>Il ne t'a pas moins, il a juste arrêté de le montrer.</strong> C'est réel comme problème, même si ce n'est pas la même chose que de l'indifférence délibérée.</p>`,
        },
        {
          id: 'il-ne-realise-pas',
          title: "Il ne réalise pas ce que tu fais",
          content: `<p>Beaucoup d'hommes n'ont pas conscience de la charge invisible que leur partenaire porte. Les anniversaires retenus, les réservations faites, les attentions planifiées, les discussions initiées, tout ça passe souvent inaperçu parce que ça fonctionne, justement. Quand quelqu'un gère bien les choses, l'autre ne voit pas le travail derrière. Ce n'est pas une excuse, c'est un mécanisme qu'il faut connaître pour savoir comment en parler.</p>`,
        },
        {
          id: 'il-ne-sait-pas',
          title: "Il ne sait pas ce que \"faire des efforts\" veut dire pour toi",
          content: `<p>Les <a href="/test-langage-amour-couple/">langages de l'amour</a> ne sont pas universels. Lui pense peut-être qu'il fait des efforts : il est fidèle, il est là, il ne se plaint pas, il apporte sa stabilité. Toi, tu as besoin d'attentions concrètes, de moments planifiés, de gestes qui montrent qu'il pense à toi en dehors de quand vous êtes ensemble. Ces deux visions sont compatibles, mais seulement si elles sont exprimées clairement. Un couple peut fonctionner longtemps avec ce malentendu sans que l'un ou l'autre comprenne vraiment ce qui manque à l'autre.</p>`,
        },
        {
          id: 'il-a-perdu-l-envie',
          title: "Il a perdu l'envie, sans forcément s'en rendre compte",
          content: `<p>C'est la version plus difficile à entendre. Parfois le manque d'effort n'est pas un oubli ou une incompréhension, c'est le signe que son investissement émotionnel dans la relation a baissé. Pas forcément qu'il veut partir, mais que quelque chose s'est éteint sans qu'il l'ait verbalisé, peut-être même sans qu'il l'ait conscientisé lui-même. Ce cas-là mérite une vraie conversation, pas un énième rappel sur les dates d'anniversaire.</p>`,
        },
        {
          id: 'sa-facon-de-fonctionner',
          title: "C'est sa façon de fonctionner, dans toutes ses relations",
          content: `<p>Certains hommes n'ont jamais appris à exprimer leur investissement par des actes concrets. Pas de modèle familial en ce sens, pas d'habitude culturelle, pas de réflexe développé. C'est différent du manque d'envie, mais ça produit le même résultat pour toi. La différence, c'est que dans ce cas, le changement est possible mais il demande un travail réel de sa part, pas juste de la bonne volonté ponctuelle.</p>`,
        },
      ],
    },
    {
      id: 'tu-ne-demandes-pas-trop',
      title: "Non, tu ne demandes pas trop",
      content: `<p>C'est souvent la première chose qu'on se dit dans cette situation : "peut-être que j'attends trop, peut-être que je suis trop exigeante". C'est une pensée naturelle, et elle dit quelque chose d'important sur toi, que tu te remettes en question avant d'accuser. Mais dans la majorité des cas, les femmes qui se posent cette question ne demandent pas trop. Elles demandent ce qui est raisonnable dans une <a href="/blog/choses-pas-accepter-couple/">relation adulte et équilibrée</a>.</p>
<p>Vouloir que ton partenaire pense à toi de temps en temps sans que tu le lui aies demandé, vouloir qu'il prenne des initiatives, vouloir sentir que tu comptes dans ses pensées en dehors de quand tu es physiquement devant lui, <strong>ce sont des besoins relationnels normaux, pas des caprices.</strong> La question n'est pas de savoir si tu as le droit de les avoir. La question est de savoir si lui est capable de les satisfaire, et s'il en a envie.</p>
<p>Il y a une différence entre un homme qui ne sait pas encore comment te montrer qu'il tient à toi, et un homme qui sait mais ne le fait pas. Et entre les deux, il y a une conversation à avoir.</p>`,
    },
    {
      id: 'comment-en-parler',
      title: "Comment lui en parler sans que ça parte en dispute",
      content: `<p>Beaucoup de femmes essaient d'abord de se taire, en espérant que l'absence de nouvelles fasse réagir. Ça se comprend, sauf que <a href="/blog/homme-qu-on-ignore/">ce qu'un homme ressent quand on l'ignore</a> ressemble plus souvent à de la confusion qu'à une prise de conscience. La conversation reste le chemin le plus court.</p>
<p>La plupart des conversations sur ce sujet finissent mal parce qu'elles commencent mal. "Tu ne fais jamais rien" déclenche une défense immédiate. "Tu ne t'investis pas dans cette relation" sonne comme une accusation à laquelle il va répondre par une contre-attaque ou un silence. Ce n'est pas qu'il a tort de se sentir attaqué, c'est que le format ne crée pas les conditions pour qu'il entende vraiment ce que tu dis.</p>
<p>Ce qui marche mieux : parler de ce que tu ressens toi, pas de ce qu'il fait ou ne fait pas. "Je me sens seule dans notre organisation commune depuis quelque temps" atterrit différemment que "Tu ne fais jamais d'efforts". Ce n'est pas une technique de manipulation, c'est juste que la première phrase ouvre une conversation et la seconde ouvre un procès.</p>
<p>Quelques points concrets pour que ça se passe mieux :</p>
<p>Choisis un moment calme, pas après une frustration fraîche. Une conversation entamée au moment où tu viens de tout organiser seule pour la troisième fois de suite a peu de chances de se passer sereinement. Attends un moment où vous êtes bien tous les deux.</p>
<p>Sois précise sur ce que tu attends. "Faire des efforts" c'est vague. "J'aimerais que tu proposes qu'on sorte ensemble une fois par semaine, que tu te souvienne de mon rendez-vous important de jeudi et que tu me le demandes après" c'est actionnable. Plus c'est concret, plus il peut répondre à quelque chose de réel.</p>
<p>Écoute sa réponse vraiment. Il a peut-être une vision très différente de ce qu'il pense apporter à la relation. Pas pour valider cette vision si elle ne te convient pas, mais pour comprendre d'où il part avant de décider quoi faire.</p>`,
    },
    {
      id: 'ce-qui-peut-changer',
      title: "Ce qui peut changer et ce qui ne changera probablement pas",
      content: `<p>C'est la partie que beaucoup d'articles évitent, parce qu'elle est moins confortable. Voilà ce qu'on observe en pratique.</p>
<p><strong>Ce qui peut changer avec une vraie conversation :</strong> les oublis par inattention, le manque de conscience de ce que tu gères, les comportements liés à une incompréhension de tes besoins. Beaucoup d'hommes, quand ils comprennent réellement ce qui manque (pas juste qu'ils ont "merdé"), sont capables d'ajuster. Pas parfaitement, pas du jour au lendemain, mais vraiment.</p>
<p><strong>Ce qui change rarement sans travail profond de sa part :</strong> le manque d'investissement émotionnel de base, les comportements qui existent dans toutes ses relations et pas seulement avec toi, la tendance à promettre sans agir. Ces choses-là peuvent évoluer, mais elles demandent qu'il identifie lui-même le problème et décide d'y travailler. Tu ne peux pas faire ce chemin à sa place.</p>
<p><strong>Ce qui ne change pas :</strong> quelqu'un qui ne voit pas le problème, qui minimise systématiquement ce que tu exprimes, qui fait des efforts pendant deux semaines puis revient exactement au même point. <a href="/blog/red-flags-homme/">Ce pattern répété</a> n'est pas un manque de savoir-faire, c'est un manque de motivation réelle. Et ça, aucune conversation ne le change si l'envie n'est pas là de son côté.</p>`,
    },
    {
      id: 'la-vraie-question',
      title: "La vraie question à se poser",
      content: `<p>Au fond, "mon copain ne fait pas d'effort" cache souvent une question plus profonde : est-ce qu'il m'aime vraiment, est-ce qu'il tient à cette relation autant que moi ? C'est une question légitime, et elle mérite une réponse honnête.</p>
<p>Un homme qui tient vraiment à quelqu'un cherche naturellement à lui montrer. Pas de façon extravagante, pas constamment, mais il y a quelque chose. Une attention spontanée de temps en temps. Un effort pour une chose qui compte pour elle. La mémoire de ce qu'elle aime. Si tout ça est absent depuis longtemps et qu'après en avoir parlé rien ne bouge, la question n'est plus "comment lui faire comprendre", elle devient "est-ce que je veux continuer à <a href="/test-couple-toxique/">porter cette relation seule</a>".</p>
<p>Ce n'est pas une question facile. Mais c'est la bonne.</p>`,
    },
  ],
  readAlso: {
    slug: 'red-flags-homme',
    title: "Les Red flags chez un Homme",
  },
};

export default article;
