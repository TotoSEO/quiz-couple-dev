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
  introduction: `<p>Pendant la Révolution, Marie-Antoinette et le comte suédois Axel de Fersen se sont écrit en cachette. Une partie de ces lettres est aux Archives nationales depuis 1982, mais des mots et parfois des lignes entières y sont <strong>recouverts d'encre</strong>. Pendant très longtemps, personne n'a pu lire ce qu'il y avait dessous.</p>
<p>En 2021, des chercheurs français y sont arrivés grâce aux rayons X. Voici ce qu'ils ont trouvé.</p>`,
  quickSummary: [
    "Quinze lettres entre Marie-Antoinette et Fersen, écrites en 1791 et 1792, ont des passages recouverts d'encre.",
    "En 2021, des chercheurs du Centre de recherche sur la conservation en ont relu huit grâce aux rayons X.",
    "Sous les ratures : « ma tendre amie », « vous que j'aime », « non pas sans vous »...",
    "D'après l'encre utilisée, c'est très probablement Fersen lui-même qui a raturé les lettres.",
  ],
  sections: [
    {
      id: 'qui-etait-fersen',
      title: "Qui était Axel de Fersen ?",
      content: `<p>Axel de Fersen est un comte suédois né en 1755, la même année que Marie-Antoinette.</p>
<p>Il la rencontre en 1774, à un bal masqué de l'Opéra, quand ils ont tous les deux 18 ans. Elle n'est pas encore reine. Il devient ensuite un habitué de la cour, part combattre en Amérique pendant la guerre d'Indépendance, puis revient. Et en juin 1791, <strong>c'est lui qui organise la fuite de la famille royale</strong>, celle qui finit par l'arrestation à Varennes. Il les accompagne jusqu'à Bondy, à la sortie de Paris, puis les laisse continuer sans lui.</p>
<p>Après Varennes, le roi et la reine sont surveillés de près aux Tuileries, et Fersen vit surtout à Bruxelles. Ils ne peuvent plus se voir, <strong>alors ils s'écrivent</strong>.</p>`,
    },
    {
      id: 'des-lettres-ecrites-en-cachette',
      title: "Des lettres écrites en cachette",
      content: `<p>De fin juin 1791 à fin juin 1792, ils prennent beaucoup de précautions : de l'encre sympathique (une encre invisible qu'on révèle ensuite), des passages chiffrés... Fersen, lui, garde tout. Il archive les lettres de la reine, les brouillons des siennes, et recopie certaines lettres importantes, ce qui se faisait beaucoup à l'époque. Du coup, <strong>la plupart des lettres conservées sont de sa main</strong>, même quand le texte est celui de Marie-Antoinette.</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">Les lettres en chiffres</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">48</span>lettres aux Archives nationales depuis 1982</li>
<li><span class="blog-chiffres-nombre">15</span>avec des passages recouverts d'encre</li>
<li><span class="blog-chiffres-nombre">8</span>qu'on a pu relire en 2021</li>
<li><span class="blog-chiffres-nombre">95</span>journées de scanner pour y arriver</li>
</ul>
</div>
<p>Les ratures vont de quelques mots à quelques lignes. La correspondance avait été publiée au XIXe siècle par un petit-neveu de Fersen, évidemment sans ces passages, et depuis, les historiens se demandaient ce qu'il y avait dessous.</p>`,
    },
    {
      id: 'comment-lire-sous-une-rature',
      title: "Comment on lit un mot sous une rature",
      content: `<p>Le travail a été fait par le Centre de recherche sur la conservation (CRC), qui dépend du Muséum national d'histoire naturelle, du CNRS et du ministère de la Culture. L'étude est parue en <strong>octobre 2021 dans la revue <em>Science Advances</em></strong>, signée Anne Michelin, Fabien Pottier et Christine Andraud.</p>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">💡 Bon à savoir</p>
<p>À l'époque, on écrit avec de l'<strong>encre ferrogallique</strong>, à base de fer. Mais d'une bouteille à l'autre, elle ne contient pas exactement les mêmes métaux : un peu plus de cuivre ici, de zinc là. Les chercheurs ont balayé les lettres aux rayons X, qui font « répondre » chaque métal. On obtient une carte du cuivre, une du zinc, etc., et quand l'encre cachée contient un métal que la rature n'a pas, <strong>les mots réapparaissent sur la carte</strong>.</p>
</aside>
<p>Ça n'a pas marché sur toutes les lettres. Sur les 15, <strong>7 restent illisibles</strong> : aucune des méthodes n'a permis de retrouver le texte.</p>`,
    },
    {
      id: 'ce-que-cachaient-les-ratures',
      title: "Ce que cachaient les ratures",
      content: `<p>Pas de secrets d'État : les passages retrouvés parlent d'amour. Quelques-uns de ceux que l'étude a publiés, avec l'orthographe de l'époque :</p>
<ul>
<li><strong>« ma tendre amie » :</strong> Fersen, 13 octobre 1791.</li>
<li><strong>« vous que j'aime et aimeroi jusqu'a mon... » :</strong> Marie-Antoinette, 7 décembre 1791. La fin de la phrase manque.</li>
<li><strong>« pour le bonheur de tous trois » :</strong> la même lettre, un peu plus loin.</li>
<li><strong>« non pas sans vous » :</strong> Marie-Antoinette, 4 janvier 1792.</li>
</ul>
<p>Anne Michelin, l'une des chercheuses, résume le vocabulaire des passages cachés en quatre mots : « bien-aimé », « tendre ami », « adorer », « à la folie ».</p>
<blockquote><p>« sans vous il n'est point de bonheur pour moi l'univers n'est rien sans vous »<br><small>Axel de Fersen à Marie-Antoinette, octobre 1791</small></p></blockquote>
<p>Les extraits retranscrits par l'équipe vont dans le même sens. Le 26 septembre 1791, la reine raconte qu'elle a pleuré en apprenant qu'il comptait passer l'hiver à Bruxelles plutôt que de rentrer voir sa famille. Elle lui demande de ne pas se priver de ses parents pour elle : <strong>« ceci seroit trop exiger »</strong>.</p>`,
    },
    {
      id: 'qui-a-rature-les-lettres',
      title: "Qui a raturé les lettres ?",
      content: `<p>On a longtemps soupçonné le petit-neveu de Fersen, celui qui a publié la correspondance : il aurait voulu protéger l'honneur de la reine, et celui de la famille.</p>
<p>L'encre raconte autre chose. Celle des ratures a presque toujours la même composition que l'encre de Fersen, celle de ses brouillons et de ses copies. Sur une lettre, il y a même un passage ajouté de sa main, juste au-dessus d'une rature, avec la même encre. Pour les chercheurs, <strong>il semble bien que ce soit Fersen lui-même qui ait caché ces mots</strong>.</p>
<p>Pourquoi ? On ne sait pas. Pour des raisons sentimentales, ou politiques : il voulait peut-être pouvoir se servir de ces lettres pour défendre la famille royale sans abîmer l'honneur de la reine, ni le sien.</p>`,
    },
    {
      id: 'alors-ils-s-aimaient',
      title: "Alors, ils s'aimaient ?",
      content: `<p>C'est LA question depuis deux siècles. Les passages retrouvés montrent une <strong>relation intime</strong>, ce qui n'avait jamais été prouvé noir sur blanc du côté de Fersen. Mais Anne Michelin reste prudente : ils « ne permettent pas de trancher définitivement quant à la nature véritable de leurs sentiments ».</p>
<p>Histoire d'amour ou amitié passionnée, chacun le lira à sa façon. Dans les deux cas, c'est un sentiment qu'ils ont dû <a href="/test-m-aime-t-il-elle-en-secret/">garder secret</a> jusqu'au bout. Ils ne se reverront qu'une fois, en cachette aux Tuileries, en février 1792. Marie-Antoinette est guillotinée le 16 octobre 1793.</p>
<p>Fersen ne s'est jamais marié. Il meurt le 20 juin 1810 à Stockholm, tué par la foule pendant le cortège funèbre d'un prince, <strong>dix-neuf ans jour pour jour après la fuite vers Varennes</strong>.</p>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">💌 Et aujourd'hui ?</p>
<p>Les couples qui <a href="/quiz-couple-distance/">vivent loin l'un de l'autre</a> connaissent ça, en beaucoup plus doux : quand on ne peut pas se voir, tout passe par les mots, et chaque message compte un peu plus que d'habitude.</p>
</aside>
<p class="blog-sources"><strong>Sources :</strong> Anne Michelin, Fabien Pottier et Christine Andraud, « 2D macro-XRF to reveal redacted sections of French queen Marie-Antoinette secret correspondence with Swedish count Axel von Fersen », <em>Science Advances</em>, octobre 2021 (<a href="https://doi.org/10.1126/sciadv.abg4266" rel="noopener" target="_blank">lire l'étude</a>) ; Anne Michelin, « La correspondance de Marie-Antoinette aux rayons X », <em>The Conversation</em>, janvier 2022 (<a href="https://theconversation.com/la-correspondance-de-marie-antoinette-aux-rayons-x-173766" rel="noopener" target="_blank">lire l'article</a>).</p>
<p class="blog-sources"><strong>Image :</strong> <em>Marie-Antoinette dit « à la Rose »</em>, Élisabeth Vigée Le Brun, 1783, château de Versailles ; portrait d'Axel de Fersen, Carl Fredrik von Breda, vers 1800, musée d'Östergötland. Domaine public.</p>`,
    },
  ],
};

export default article;
