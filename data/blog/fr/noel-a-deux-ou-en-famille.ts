import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'noel-a-deux-ou-en-famille',
  title: "Noël rien qu'à deux : 56 % des votants sont pour",
  metaTitle: "Noël rien qu'à deux : 56 % des votants sont pour",
  metaDescription: "Passer Noël uniquement à deux ? Sur Quiz Couple, 751 votes : 56 % sont pour. Et 79 % refusent de passer tous les Noëls dans la même belle-famille.",
  featuredImage: '/blog/noel-a-deux-ou-en-famille.webp',
  featuredImageAlt: "Une petite table dressée pour deux devant un sapin de Noël illuminé",
  publishedAt: '2026-12-01T08:30:00+01:00',
  author: AUTHORS['thomas'],
  excerpt: "Passer Noël à deux, sans la famille : sur notre jeu, 751 votes sont arrivés et 56 % sont pour. En français, c'est presque moitié-moitié.",
  introduction: `<p>Passer Noël rien qu'à deux, sans la famille : pour ou contre ? Sur Quiz Couple, 751 votes sont arrivés sur cette proposition. <strong>56 % sont pour</strong>.</p>
<p>Sur les pages en français, c'est presque moitié-moitié. Et presque tout le monde est d'accord sur un point : il n'est pas question de passer tous les Noëls dans la même belle-famille.</p>`,
  quickSummary: [
    "56 % des votes sont pour passer Noël uniquement à deux et 44 % sont contre (751 votes).",
    "Sur les pages en français, c'est 49 % de pour (355 votes).",
    "79 % refusent de passer tous les Noëls dans la même belle-famille (533 votes).",
    "69 % sont d'accord pour faire un cadeau commun plutôt que deux cadeaux.",
  ],
  sections: [
    {
      id: 'noel-a-deux',
      title: "Noël à deux : 56 % pour, 44 % contre",
      content: `<p>La proposition du jeu est « Passer Noël uniquement tous les deux ». Le couple en discute puis il vote. C'est l'une des <a href="/quiz-pour-contre-couple/">60 propositions à trancher à deux</a>. 423 votes sur 751 sont pour.</p>
<div class="blog-sondage">
<p class="blog-sondage-titre">Pour ou contre</p>
<div class="blog-sondage-item">
<p class="blog-sondage-question">Passer Noël uniquement tous les deux</p>
<div class="blog-sondage-barre" role="img" aria-label="56 % pour, 44 % contre"><span style="width:56%"></span><span style="width:44%"></span></div>
<p class="blog-sondage-camps"><span><strong>56 %</strong> pour</span><span><strong>44 %</strong> contre</span></p>
<p class="blog-sondage-votes">751 votes</p>
</div>
</div>
<p>Le résultat change beaucoup selon la langue. Sur les pages en français, le pour est à 49 % (355 votes). En espagnol, il monte à 67 % (222 votes).</p>`,
    },
    {
      id: 'la-belle-famille',
      title: "Tous les Noëls dans la même belle-famille : 79 % disent non",
      content: `<p>Notre deuxième jeu propose <a href="/jeu-oui-non-couple/">des situations de couple une par une</a> et on y répond par oui ou par non. À « Passer tous les Noëls dans la même belle-famille », <strong>79 % répondent non</strong> sur 533 votes.</p>
<div class="blog-sondage">
<p class="blog-sondage-titre">Oui ou non</p>
<div class="blog-sondage-item">
<p class="blog-sondage-question">Passer tous les Noëls dans la même belle-famille</p>
<div class="blog-sondage-barre" role="img" aria-label="21 % oui, 79 % non"><span style="width:21%"></span><span style="width:79%"></span></div>
<p class="blog-sondage-camps"><span><strong>21 %</strong> oui</span><span><strong>79 %</strong> non</span></p>
<p class="blog-sondage-votes">533 votes</p>
</div>
</div>
<p>La famille n'est pas rejetée pour autant. 68 % sont d'accord pour « inviter les deux familles au complet pour les fêtes ». Ce que les votants refusent, c'est que ce soit toujours chez les mêmes.</p>`,
    },
    {
      id: 'cadeaux-et-pere-noel',
      title: "Cadeaux et Père Noël : les autres votes",
      content: `<div class="blog-chiffres">
<p class="blog-chiffres-titre">Noël en couple, en chiffres</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">69 %</span>font un cadeau commun plutôt que deux (544 votes)</li>
<li><span class="blog-chiffres-nombre">68 %</span>invitent les deux familles au complet (530 votes)</li>
<li><span class="blog-chiffres-nombre">21 %</span>acceptent tous les Noëls dans la même belle-famille (533 votes)</li>
<li><span class="blog-chiffres-nombre">20 %</span>disent aux enfants que le Père Noël n'existe pas (555 votes)</li>
</ul>
</div>
<p>Deux autres votes parlent de Noël. 69 % sont d'accord pour faire un cadeau commun plutôt que deux cadeaux. Et 20 % seulement diraient aux enfants dès le début que le Père Noël n'existe pas.</p>
<p>Si vous n'êtes pas d'accord pour cette année, vous pouvez alterner d'une année sur l'autre. En attendant, vous pouvez toujours vérifier <a href="/test-liste-des-enfants-sages/">lequel a été le plus sage cette année</a>.</p>`,
    },
    {
      id: 'd-ou-viennent-ces-chiffres',
      title: "D'où viennent ces chiffres ?",
      content: `<p>Ce sont les votes des visiteurs de Quiz Couple sur nos deux jeux de vote, entre le 13 août et le 13 novembre 2026. Chaque question a reçu entre 530 et 751 votes, toutes langues réunies, et un même appareil ne peut voter qu'une fois par question.</p>
<p>Ce n'est pas un sondage sur toute la population. Ces chiffres montrent ce que répondent les personnes qui jouent sur notre site, seules ou en couple. Les votes continuent d'arriver, alors les pourcentages peuvent encore bouger de quelques points.</p>
<p class="blog-sources"><strong>Sources :</strong> votes enregistrés sur Quiz Couple du 13 août au 13 novembre 2026 (jeux « Pour ou contre » et « Oui ou non »), relevés le 13 novembre 2026.</p>
<p class="blog-sources"><strong>Image :</strong> photo générée pour cet article.</p>`,
    },
  ],
};

export default article;
