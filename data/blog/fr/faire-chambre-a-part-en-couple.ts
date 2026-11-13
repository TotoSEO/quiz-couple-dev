import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'faire-chambre-a-part-en-couple',
  title: "Faire chambre à part : sur Quiz Couple, 60 % sont contre",
  metaTitle: "Faire chambre à part : 60 % des votants sont contre",
  metaDescription: "Dormir dans des chambres séparées quand on en a besoin ? Sur Quiz Couple, 769 votes : 60 % sont contre. Et 69 % refusent même quand l'autre ronfle.",
  featuredImage: '/blog/faire-chambre-a-part-en-couple.webp',
  featuredImageAlt: "Un lit double dont une moitié est défaite et l'autre intacte",
  publishedAt: '2026-11-22T08:30:00+01:00',
  author: AUTHORS['thomas'],
  excerpt: "Dormir à part quand on dort mal : sur notre jeu, 769 votes sont arrivés et 60 % sont contre. Même le ronflement ne fait pas changer d'avis.",
  introduction: `<p>Faire chambre à part quand on dort mal, est-ce une bonne idée ? Dans notre jeu « Pour ou contre », la proposition « Dormir dans des chambres séparées quand on en a besoin » a reçu 769 votes. <strong>60 % sont contre</strong>.</p>
<p>Même le ronflement ne change pas grand-chose. Quand l'un des deux ronfle, 69 % refusent encore de dormir à part.</p>`,
  quickSummary: [
    "60 % des votes sont contre « Dormir dans des chambres séparées quand on en a besoin » (769 votes).",
    "Quand l'un des deux ronfle, 69 % refusent encore la chambre à part (557 votes).",
    "33 % seulement veulent chacun leur couette dans le même lit.",
    "71 % ont leur côté du lit, et il n'est pas négociable.",
  ],
  sections: [
    {
      id: 'chambres-separees',
      title: "Chambres séparées : 40 % pour, 60 % contre",
      content: `<p>La proposition dit bien « quand on en a besoin ». Il ne s'agit donc pas de dormir à part toutes les nuits. Malgré ça, <strong>458 votes sur 769 sont contre</strong>. C'est l'un des <a href="/quiz-pour-contre-couple/">60 sujets sur lesquels les couples tranchent</a> dans ce jeu.</p>
<div class="blog-sondage">
<p class="blog-sondage-titre">Pour ou contre</p>
<div class="blog-sondage-item">
<p class="blog-sondage-question">Dormir dans des chambres séparées quand on en a besoin</p>
<div class="blog-sondage-barre" role="img" aria-label="40 % pour, 60 % contre"><span style="width:40%"></span><span style="width:60%"></span></div>
<p class="blog-sondage-camps"><span><strong>40 %</strong> pour</span><span><strong>60 %</strong> contre</span></p>
<p class="blog-sondage-votes">769 votes</p>
</div>
</div>
<p>Les pages en français sont un peu plus ouvertes à l'idée, avec 44 % de pour (358 votes). En espagnol, c'est 35 % (229 votes).</p>`,
    },
    {
      id: 'quand-l-autre-ronfle',
      title: "Même quand l'autre ronfle, 69 % disent non",
      content: `<p>Dans notre deuxième jeu, on répond par oui ou par non à <a href="/jeu-oui-non-couple/">des situations de tous les jours</a>. L'une d'elles est « Dormir dans des chambres séparées quand l'un des deux ronfle ». Sur 557 votes, <strong>31 % seulement répondent oui</strong>.</p>
<div class="blog-sondage">
<p class="blog-sondage-titre">Oui ou non</p>
<div class="blog-sondage-item">
<p class="blog-sondage-question">Dormir dans des chambres séparées quand l'un des deux ronfle</p>
<div class="blog-sondage-barre" role="img" aria-label="31 % oui, 69 % non"><span style="width:31%"></span><span style="width:69%"></span></div>
<p class="blog-sondage-camps"><span><strong>31 %</strong> oui</span><span><strong>69 %</strong> non</span></p>
<p class="blog-sondage-votes">557 votes</p>
</div>
</div>
<p>Les deux couettes ne convainquent pas davantage. « Avoir chacun sa couette dans le même lit » reçoit 33 % de oui sur 543 votes.</p>`,
    },
    {
      id: 'le-lit-commun-a-ses-regles',
      title: "Le lit commun a quand même ses règles",
      content: `<div class="blog-chiffres">
<p class="blog-chiffres-titre">Le sommeil à deux, en chiffres</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">71 %</span>ont leur côté du lit, non négociable (553 votes)</li>
<li><span class="blog-chiffres-nombre">34 %</span>se couchent à la même heure tous les soirs (563 votes)</li>
<li><span class="blog-chiffres-nombre">33 %</span>veulent chacun leur couette (543 votes)</li>
<li><span class="blog-chiffres-nombre">31 %</span>dorment à part quand l'autre ronfle (557 votes)</li>
</ul>
</div>
<p>Dormir ensemble ne veut pas dire tout faire pareil. 71 % des votants ont leur côté du lit, et il n'est pas négociable. Et seulement 34 % tiennent à se coucher à la même heure tous les soirs.</p>
<p>Chaque couple a <a href="/quel-type-de-couple-etes-vous/">sa façon de vivre à deux</a>, et le sommeil en fait partie. Si l'un des deux dort mal depuis des mois, le mieux est d'en parler comme d'un problème de sommeil. Dormir à part quelques nuits ne veut pas dire qu'on s'aime moins.</p>`,
    },
    {
      id: 'd-ou-viennent-ces-chiffres',
      title: "D'où viennent ces chiffres ?",
      content: `<p>Ce sont les votes des visiteurs de Quiz Couple sur nos deux jeux de vote, entre le 13 août et le 13 novembre 2026. Chaque question a reçu entre 543 et 769 votes, toutes langues réunies, et un même appareil ne peut voter qu'une fois par question.</p>
<p>Ce n'est pas un sondage sur toute la population. Ces chiffres montrent ce que répondent les personnes qui jouent sur notre site, seules ou en couple. Les votes continuent d'arriver, alors les pourcentages peuvent encore bouger de quelques points.</p>
<p class="blog-sources"><strong>Sources :</strong> votes enregistrés sur Quiz Couple du 13 août au 13 novembre 2026 (jeux « Pour ou contre » et « Oui ou non »), relevés le 13 novembre 2026.</p>
<p class="blog-sources"><strong>Image :</strong> photo générée pour cet article.</p>`,
    },
  ],
};

export default article;
