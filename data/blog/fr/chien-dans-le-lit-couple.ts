import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'chien-dans-le-lit-couple',
  title: "Le chien dans le lit : 69 % de non en français, 60 % de oui en espagnol",
  metaTitle: "Le chien dans le lit : 69 % de non en français",
  metaDescription: "Laisser le chien dormir dans le lit ? Sur Quiz Couple, 559 votes : 69 % de non sur les pages en français, mais 60 % de oui en espagnol et 59 % en italien.",
  featuredImage: '/blog/chien-dans-le-lit-couple.webp',
  featuredImageAlt: "Un petit chien endormi au milieu d'un lit double, entre deux oreillers",
  publishedAt: '2026-11-28T08:30:00+01:00',
  author: AUTHORS['thomas'],
  excerpt: "Laisser le chien dormir dans le lit : sur notre jeu, les pages en français votent non à 69 %. En espagnol et en italien, c'est le oui qui gagne.",
  introduction: `<p>Est-ce qu'on laisse le chien dormir dans le lit ? Sur Quiz Couple, 559 votes sont arrivés et la réponse dépend de la langue. Sur les pages en français, <strong>69 % répondent non</strong>. En espagnol et en italien, c'est le oui qui gagne avec environ 60 %.</p>
<p>Toutes langues réunies, le vote est coupé en deux : 48 % de oui et 52 % de non.</p>`,
  quickSummary: [
    "Toutes langues réunies : 48 % de oui et 52 % de non (559 votes).",
    "Sur les pages en français, 69 % répondent non (208 votes).",
    "En espagnol, 60 % répondent oui (140 votes), et 59 % en italien (155 votes).",
    "88 % des votants veulent un animal de compagnie.",
  ],
  sections: [
    {
      id: 'le-vote',
      title: "Le chien dans le lit : 48 % de oui, 52 % de non",
      content: `<p>Le jeu propose la situation « Laisser le chien dormir dans le lit » et chacun répond par oui ou par non. Elle fait partie des <a href="/jeu-oui-non-couple/">120 situations de la vie à deux</a> du jeu. Sur 559 votes, 270 disent oui et 289 disent non.</p>
<div class="blog-sondage">
<p class="blog-sondage-titre">Oui ou non</p>
<div class="blog-sondage-item">
<p class="blog-sondage-question">Laisser le chien dormir dans le lit</p>
<div class="blog-sondage-barre" role="img" aria-label="48 % oui, 52 % non"><span style="width:48%"></span><span style="width:52%"></span></div>
<p class="blog-sondage-camps"><span><strong>48 %</strong> oui</span><span><strong>52 %</strong> non</span></p>
<p class="blog-sondage-votes">559 votes</p>
</div>
</div>`,
    },
    {
      id: 'selon-la-langue',
      title: "En français c'est non, en espagnol et en italien c'est oui",
      content: `<div class="blog-chiffres">
<p class="blog-chiffres-titre">Le oui, langue par langue</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">31 %</span>sur les pages en français (208 votes)</li>
<li><span class="blog-chiffres-nombre">60 %</span>sur les pages en espagnol (140 votes)</li>
<li><span class="blog-chiffres-nombre">59 %</span>sur les pages en italien (155 votes)</li>
<li><span class="blog-chiffres-nombre">52 %</span>sur les pages en anglais (50 votes)</li>
</ul>
</div>
<p>L'écart est grand et il ne vient pas de la traduction : la phrase veut dire la même chose dans les quatre langues.</p>
<p>On retrouve d'ailleurs la même différence dans un autre de nos jeux, celui des <a href="/dilemmes-couple/">dilemmes à trancher à deux</a>. L'un d'eux propose d'adopter l'animal parfait, à condition qu'il dorme entre vous toutes les nuits. En français, 39 % acceptent (284 votes). En espagnol, c'est 60 % (181 votes).</p>`,
    },
    {
      id: 'les-animaux',
      title: "Pour le reste, nos votants gâtent leurs animaux",
      content: `<p>Sur les animaux en général, il n'y a pas de débat. 88 % des votants veulent un animal de compagnie. 73 % paieraient une opération à mille euros pour le chat et 64 % fêtent l'anniversaire de l'animal avec un gâteau.</p>
<p>Si vous n'êtes pas d'accord sur le lit, le mieux est de décider avant l'arrivée du chien. Une fois qu'il a pris l'habitude, c'est plus difficile de revenir en arrière. Et si vous n'avez pas encore de chien, vous pouvez commencer par chercher <a href="/test-quel-chien-est-fait-pour-nous/">quel chien irait avec votre vie à deux</a>.</p>`,
    },
    {
      id: 'd-ou-viennent-ces-chiffres',
      title: "D'où viennent ces chiffres ?",
      content: `<p>Nous avons compté les votes de nos jeux entre le 9 août et le 13 novembre 2026. Chaque question citée ici a reçu entre 526 et 655 votes, toutes langues réunies. Le jeu n'accepte qu'un vote par appareil et par question.</p>
<p>Ce n'est pas un sondage représentatif. Les personnes qui votent sont celles qui jouent sur Quiz Couple, seules ou à deux, et rien ne dit qu'elles ressemblent à tous les couples. Comme les votes continuent d'arriver, les chiffres peuvent bouger un peu.</p>
<p class="blog-sources"><strong>Sources :</strong> votes enregistrés sur Quiz Couple du 9 août au 13 novembre 2026 (jeux « Oui ou non » et « Dilemmes de couple »), relevés le 13 novembre 2026.</p>
<p class="blog-sources"><strong>Image :</strong> photo générée pour cet article.</p>`,
    },
  ],
};

export default article;
