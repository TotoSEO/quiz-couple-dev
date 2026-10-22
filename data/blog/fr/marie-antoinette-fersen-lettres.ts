import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'marie-antoinette-fersen-lettres',
  title: "Marie-Antoinette et Fersen : ce que les rayons X ont révélé sous les ratures de leurs lettres",
  metaTitle: "Marie-Antoinette et Fersen : leurs lettres raturées lues aux rayons X",
  metaDescription: "Des passages des lettres entre Marie-Antoinette et Axel de Fersen étaient recouverts d'encre. Des chercheurs les ont lus aux rayons X : voici ce qu'ils cachaient, et qui les avait raturés.",
  featuredImage: '/blog/marie-antoinette-fersen-lettres.webp',
  featuredImageAlt: "Marie-Antoinette peinte par Élisabeth Vigée Le Brun en 1783, à côté du portrait d'Axel de Fersen par Carl Fredrik von Breda",
  publishedAt: '2026-10-22T16:30:00+02:00',
  author: AUTHORS['thomas'],
  excerpt: "Pendant plus d'un siècle, des lignes entières de leurs lettres étaient illisibles. Des chercheurs français les ont lues aux rayons X, et on sait maintenant qui les avait cachées.",
  introduction: `<p>Marie-Antoinette et le comte suédois Axel de Fersen se sont écrit en cachette pendant la Révolution, à l'époque où la famille royale vivait sous surveillance aux Tuileries. Une partie de ces lettres est conservée aux Archives nationales depuis 1982. Le souci, c'est que des mots, et parfois des lignes entières, y sont recouverts d'encre. Pendant très longtemps, personne n'a pu lire ce qu'il y avait dessous.</p>
<p>En 2021, une équipe de chercheurs français a réussi à lire une bonne partie de ces passages grâce aux rayons X. On y trouve des « ma tendre amie », des « vous que j'aime »... et on sait maintenant, à peu près, qui avait pris la plume pour les cacher. Voici ce qu'il y avait sous les ratures, et ce que ça nous apprend sur ces deux-là.</p>`,
  quickSummary: [
    "Les Archives nationales conservent depuis 1982 une partie des lettres échangées entre Marie-Antoinette et Fersen entre 1791 et 1792.",
    "Quinze de ces lettres ont des passages recouverts d'encre, de quelques mots à quelques lignes.",
    "En 2021, des chercheurs du Centre de recherche sur la conservation en ont lu huit grâce à la fluorescence des rayons X.",
    "Sous les ratures, on lit par exemple « ma tendre amie », « vous que j'aime » ou « non pas sans vous ».",
    "D'après l'encre utilisée, c'est très probablement Fersen lui-même qui a raturé les lettres.",
  ],
  sections: [
    {
      id: 'qui-etait-fersen',
      title: "Qui était Axel de Fersen ?",
      content: `<p>Hans Axel de Fersen est un comte suédois né en 1755, la même année que Marie-Antoinette. Il la rencontre en 1774, à un bal masqué de l'Opéra, quand ils ont tous les deux 18 ans. Elle n'est pas encore reine à ce moment-là : Louis XV meurt quelques mois plus tard.</p>
<p>Il revient en France quelques années après, devient un habitué de la cour, puis part combattre en Amérique pendant la guerre d'Indépendance. Mais ce qui le fait vraiment entrer dans l'histoire, c'est juin 1791. C'est lui qui organise la fuite de la famille royale, celle qui se termine par l'arrestation à Varennes. Il les accompagne jusqu'à Bondy, à la sortie de Paris, puis les laisse continuer sans lui.</p>
<p>Après Varennes, le roi et la reine sont ramenés aux Tuileries et surveillés de près. Fersen, que son rôle dans la fuite rend indésirable en France, vit surtout à Bruxelles. Ils ne peuvent plus se voir, alors ils s'écrivent. Il reviendra une seule fois en cachette aux Tuileries, en février 1792. Ce sera la dernière fois qu'ils se voient : Marie-Antoinette est guillotinée le 16 octobre 1793.</p>`,
    },
    {
      id: 'des-lettres-ecrites-en-cachette',
      title: "Des lettres écrites en cachette",
      content: `<p>Entre fin juin 1791 et fin juin 1792, les deux s'écrivent avec beaucoup de précautions. D'après Anne Michelin, l'une des chercheuses qui ont travaillé sur ces lettres, ils ont utilisé de l'encre sympathique (une encre invisible, qu'on révèle ensuite) et des passages chiffrés. Les ratures, elles, ont été faites après coup.</p>
<p>Fersen gardait tout. Il archivait les lettres de la reine, mais aussi les brouillons de celles qu'il lui envoyait, et il recopiait certaines lettres importantes, ce qui se faisait beaucoup à l'époque. Du coup, la plupart des lettres conservées sont de sa main à lui, même quand le texte est celui de Marie-Antoinette.</p>
<p>Ces archives sont restées dans la famille de Fersen jusqu'en 1982, quand les Archives nationales en ont acheté une partie. On y trouve 21 lettres de Marie-Antoinette à Fersen, dont 7 raturées, et 27 lettres de Fersen à Marie-Antoinette, dont 8 raturées. Ça fait 15 lettres où quelqu'un a recouvert quelques mots, parfois quelques lignes, d'une encre bien épaisse pour qu'on ne puisse plus rien lire.</p>
<p>La correspondance avait été publiée au XIXe siècle par un petit-neveu de Fersen, sans les passages cachés, évidemment. Depuis, les historiens se demandaient ce qu'il y avait dessous : des secrets politiques, ou la preuve d'une histoire d'amour.</p>`,
    },
    {
      id: 'comment-lire-sous-une-rature',
      title: "Comment on lit un mot sous une rature",
      content: `<p>C'est le Centre de recherche sur la conservation (CRC), un laboratoire du Muséum national d'histoire naturelle, du CNRS et du ministère de la Culture, qui s'en est chargé. L'étude a été publiée en octobre 2021 dans la revue <em>Science Advances</em>, par Anne Michelin, Fabien Pottier et Christine Andraud.</p>
<p>L'idée de départ est plutôt simple. À l'époque, on écrivait avec de l'encre ferrogallique, une encre à base de fer. Mais d'une bouteille à l'autre, cette encre ne contient pas exactement les mêmes métaux : un peu plus de cuivre dans l'une, un peu plus de zinc dans l'autre. Si l'encre du texte et l'encre de la rature n'ont pas la même composition, on peut en théorie les séparer.</p>
<p>Pour ça, les chercheurs ont utilisé la fluorescence des rayons X. On envoie des rayons X sur le papier, et chaque métal renvoie un signal qui lui est propre. En balayant la feuille point par point, on obtient une carte du cuivre, une carte du zinc, une carte du fer, etc. Et sur l'une de ces cartes, quand l'encre cachée contient un métal que la rature n'a pas, les lettres réapparaissent.</p>
<p>Ça a demandé une sacrée patience : 95 journées de scanner pour une centaine de lignes raturées ! Et ça n'a pas marché partout. Sur les 15 lettres raturées, 8 ont pu être lues. Pour les 7 autres, aucune des méthodes n'a permis de retrouver le texte, et elles restent illisibles pour l'instant.</p>`,
    },
    {
      id: 'ce-que-cachaient-les-ratures',
      title: "Ce que cachaient les ratures",
      content: `<p>Les passages retrouvés parlent surtout d'amour. Voici quelques-uns de ceux que l'étude a publiés, avec l'orthographe de l'époque :</p>
<ul>
<li><strong>« ma tendre amie » :</strong> dans une lettre de Fersen du 13 octobre 1791.</li>
<li><strong>« vous que j'aime et aimeroi jusqu'a mon... » :</strong> dans une lettre de Marie-Antoinette du 7 décembre 1791. La fin de la phrase manque.</li>
<li><strong>« pour le bonheur de tous trois » :</strong> dans la même lettre, un peu plus loin.</li>
<li><strong>« non pas sans vous » :</strong> dans une lettre de Marie-Antoinette du 4 janvier 1792.</li>
</ul>
<p>Anne Michelin résume le vocabulaire des passages cachés par quelques mots qui reviennent : « bien-aimé », « tendre ami », « adorer », « à la folie ». On est loin des secrets d'État !</p>
<p>Les extraits que l'équipe a retranscrits donnent une idée du ton. Le 26 septembre 1791, Marie-Antoinette lui écrit qu'elle a pleuré en apprenant qu'il comptait passer l'hiver à Bruxelles plutôt que de rentrer voir sa famille, et elle lui demande de ne pas se priver de ses parents pour elle : « Comptez, mon bien aimé, que mon coeur sent bien tout ce que vous faites pour moi, mais ceci seroit trop exiger ». Deux semaines plus tard, Fersen lui écrit : « sans vous il n'est point de bonheur pour moi l'univers n'est rien sans vous », et un peu plus loin, « vous voir, vous aimer et vous consoler c'est tout ce que je désire ».</p>`,
    },
    {
      id: 'qui-a-rature-les-lettres',
      title: "Qui a raturé les lettres ?",
      content: `<p>Pendant longtemps, le suspect numéro un était le petit-neveu de Fersen, celui qui a publié la correspondance. L'hypothèse tenait la route : un descendant qui veut protéger l'honneur de la reine, et celui de sa famille, avant de rendre les lettres publiques.</p>
<p>Les analyses de l'encre racontent autre chose. L'encre des ratures a presque toujours la même composition que celle que Fersen utilisait pour écrire ses brouillons et pour recopier les lettres de la reine. Sur une des lettres, il y a même un passage ajouté de sa main, juste au-dessus d'un passage raturé, avec l'encre de la rature. Pour les chercheurs, il semble donc que ce soit Fersen lui-même qui ait caché ces mots.</p>
<p>Pourquoi il l'a fait, on ne le sait pas. Ça peut être pour des raisons sentimentales, ou pour des raisons politiques : il voulait peut-être pouvoir se servir de ces lettres pour défendre la famille royale, tout en protégeant l'honneur de la reine et le sien.</p>`,
    },
    {
      id: 'alors-ils-s-aimaient',
      title: "Alors, ils s'aimaient ?",
      content: `<p>C'est LA question que tout le monde se pose depuis deux siècles, et la réponse des chercheurs reste prudente. Les passages retrouvés montrent une relation intime, ce qui n'avait jamais été prouvé noir sur blanc du côté de Fersen. Mais Anne Michelin le dit elle-même : ces passages « ne permettent pas de trancher définitivement quant à la nature véritable de leurs sentiments ».</p>
<p>Ce qu'on peut dire sans se tromper, c'est qu'ils tenaient énormément l'un à l'autre et qu'ils prenaient des risques pour continuer à s'écrire. Pour le reste, histoire d'amour au sens où on l'entend aujourd'hui ou amitié passionnée, chacun le lira à sa façon. Dans les deux cas, c'est un sentiment qu'ils ont dû <a href="/test-m-aime-t-il-elle-en-secret/">garder secret</a> jusqu'au bout.</p>
<p>Fersen ne s'est jamais marié. Il est mort le 20 juin 1810 à Stockholm, tué par la foule pendant le cortège funèbre d'un prince. Le 20 juin, c'était aussi le jour où, dix-neuf ans plus tôt, il avait fait sortir la famille royale de Paris.</p>`,
    },
    {
      id: 's-aimer-de-loin',
      title: "S'aimer de loin, en 1791 comme aujourd'hui",
      content: `<p>En lisant ces extraits, on est surpris de voir à quel point ils ressemblent à ce que s'écrivent des gens séparés aujourd'hui. Elle s'inquiète qu'il se prive de sa famille pour elle, il lui répond qu'il n'a besoin de rien d'autre que de la voir. Sauf qu'une lettre mettait des jours à arriver, et qu'une seule lettre interceptée pouvait coûter très cher.</p>
<p>Les couples qui <a href="/quiz-couple-distance/">vivent loin l'un de l'autre</a> connaissent bien ça, en version beaucoup plus douce : tout passe par les mots, et chaque message compte un peu plus que d'habitude.</p>
<p class="blog-sources"><strong>Sources :</strong> Anne Michelin, Fabien Pottier et Christine Andraud, « 2D macro-XRF to reveal redacted sections of French queen Marie-Antoinette secret correspondence with Swedish count Axel von Fersen », <em>Science Advances</em>, octobre 2021 (<a href="https://doi.org/10.1126/sciadv.abg4266" rel="noopener" target="_blank">lire l'étude</a>) ; Anne Michelin, « La correspondance de Marie-Antoinette aux rayons X », <em>The Conversation</em>, janvier 2022 (<a href="https://theconversation.com/la-correspondance-de-marie-antoinette-aux-rayons-x-173766" rel="noopener" target="_blank">lire l'article</a>).</p>
<p class="blog-sources"><strong>Image :</strong> <em>Marie-Antoinette dit « à la Rose »</em>, Élisabeth Vigée Le Brun, 1783, château de Versailles ; portrait d'Axel de Fersen, Carl Fredrik von Breda, vers 1800, musée d'Östergötland. Domaine public.</p>`,
    },
  ],
};

export default article;
