import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'compte-commun-couple-votes',
  title: "Compte commun : 73 % votent pour, mais 87 % gardent un compte perso",
  metaTitle: "Compte commun : 73 % pour, 87 % gardent un compte perso",
  metaDescription: "Sur Quiz Couple, 773 votes : 73 % sont pour le compte commun. Mais 87 % veulent garder un compte perso, et 86 % refusent de se faire rembourser un café.",
  featuredImage: '/blog/compte-commun-couple-votes.webp',
  featuredImageAlt: "Un grand bocal de pièces entre deux tirelires, une rose et une violette",
  publishedAt: '2026-11-25T08:30:00+01:00',
  author: AUTHORS['thomas'],
  excerpt: "Faut-il un compte commun quand on est en couple ? Sur notre jeu, 73 % votent pour. Mais 87 % veulent aussi garder un compte perso.",
  introduction: `<p>Faut-il ouvrir un compte commun quand on est en couple ? Sur Quiz Couple, la proposition « Avoir un compte bancaire commun » a reçu 773 votes, et <strong>73 % sont pour</strong>.</p>
<p>Mais nos votants ne mettent pas tout en commun. 87 % veulent garder un compte perso à côté.</p>`,
  quickSummary: [
    "73 % des votes sont pour le compte commun et 27 % sont contre (773 votes).",
    "87 % gardent un compte perso en plus du compte commun (550 votes).",
    "77 % se disent combien ils gagnent, au centime près.",
    "86 % refusent de se faire rembourser un café payé pour l'autre.",
  ],
  sections: [
    {
      id: 'compte-commun',
      title: "Compte commun : 73 % pour, 27 % contre",
      content: `<p>La question est posée dans nos deux jeux de vote, et les deux donnent presque le même chiffre. Dans le jeu où <a href="/quiz-pour-contre-couple/">les couples votent pour ou contre</a>, le compte commun reçoit 73 % de pour. Dans l'autre, il reçoit 75 % de oui sur 550 votes.</p>
<div class="blog-sondage">
<p class="blog-sondage-titre">Pour ou contre</p>
<div class="blog-sondage-item">
<p class="blog-sondage-question">Avoir un compte bancaire commun</p>
<div class="blog-sondage-barre" role="img" aria-label="73 % pour, 27 % contre"><span style="width:73%"></span><span style="width:27%"></span></div>
<p class="blog-sondage-camps"><span><strong>73 %</strong> pour</span><span><strong>27 %</strong> contre</span></p>
<p class="blog-sondage-votes">773 votes</p>
</div>
</div>
<p>Les pages en italien sont plus partagées. Le compte commun y reçoit 60 % de pour dans un jeu (100 votes) et 56 % de oui dans l'autre (146 votes).</p>`,
    },
    {
      id: 'compte-perso',
      title: "87 % gardent un compte perso en plus",
      content: `<p>À la situation « Garder chacun un compte perso en plus du compte commun », <strong>87 % répondent oui</strong>. Et 84 % sont pour « garder une partie de son argent pour soi ».</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">L'argent dans le couple, en chiffres</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">87 %</span>gardent un compte perso (550 votes)</li>
<li><span class="blog-chiffres-nombre">84 %</span>gardent une partie de leur argent pour eux (751 votes)</li>
<li><span class="blog-chiffres-nombre">77 %</span>se disent leur salaire au centime près (548 votes)</li>
<li><span class="blog-chiffres-nombre">42 %</span>sont pour tout partager à 50/50 (743 votes)</li>
</ul>
</div>
<p>Le modèle préféré de nos votants est donc assez clair : un compte pour les dépenses du couple, et un compte chacun pour le reste. Garder un compte à soi ne veut pas dire cacher ses revenus, puisque 77 % se disent combien ils gagnent au centime près.</p>`,
    },
    {
      id: 'rembourser-un-cafe',
      title: "Se faire rembourser un café : 86 % disent non",
      content: `<p>Il y a une chose que presque personne n'accepte : compter les petites sommes. « Se faire rembourser un café payé pour l'autre » fait partie des <a href="/jeu-oui-non-couple/">120 situations auxquelles on répond par oui ou par non</a>, et 86 % répondent non.</p>
<div class="blog-sondage">
<p class="blog-sondage-titre">Oui ou non</p>
<div class="blog-sondage-item">
<p class="blog-sondage-question">Se faire rembourser un café payé pour l'autre</p>
<div class="blog-sondage-barre" role="img" aria-label="14 % oui, 86 % non"><span style="width:14%"></span><span style="width:86%"></span></div>
<p class="blog-sondage-camps"><span><strong>14 %</strong> oui</span><span><strong>86 %</strong> non</span></p>
<p class="blog-sondage-votes">540 votes</p>
</div>
</div>
<p>Le partage strict ne fait pas l'unanimité non plus. « Tout faire à 50/50 dans le couple » ne reçoit que 42 % de pour. Et 57 % sont d'accord pour payer les vacances au prorata des salaires.</p>
<p>L'argent, c'est aussi une affaire de décisions. Dans beaucoup de couples, on finit par se demander <a href="/test-qui-porte-la-culotte/">qui décide des grosses dépenses</a>. Et si vous hésitez encore, le mieux est de comparer <a href="/blog/compte-commun-ou-compte-separe/">ce que chaque formule change au quotidien</a>.</p>`,
    },
    {
      id: 'd-ou-viennent-ces-chiffres',
      title: "D'où viennent ces chiffres ?",
      content: `<p>Les chiffres de cet article viennent des votes enregistrés sur Quiz Couple entre le 13 août et le 13 novembre 2026, dans nos deux jeux de vote. Selon la question, il y a entre 500 et 773 votes, toutes langues réunies. Un appareil ne vote qu'une fois par question.</p>
<p>Nos votants ne représentent pas toute la population : ce sont des personnes qui jouent sur un site de quiz pour couples. Il faut donc lire ces pourcentages comme l'avis de nos joueurs. Ils peuvent encore bouger de quelques points, parce que les votes continuent.</p>
<p class="blog-sources"><strong>Sources :</strong> votes enregistrés sur Quiz Couple du 13 août au 13 novembre 2026 (jeux « Pour ou contre » et « Oui ou non »), relevés le 13 novembre 2026.</p>
<p class="blog-sources"><strong>Image :</strong> photo générée pour cet article.</p>`,
    },
  ],
};

export default article;
