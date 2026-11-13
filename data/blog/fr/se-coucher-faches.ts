import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'se-coucher-faches',
  title: "Se coucher fâchés : 83 % des votants préfèrent régler la dispute avant de dormir",
  metaTitle: "Se coucher fâchés : 83 % des votants disent non",
  metaDescription: "Faut-il régler une dispute avant de dormir ? Sur Quiz Couple, 534 votes : 83 % refusent de se coucher fâchés. Et 80 % se disent bonne nuit quand même.",
  featuredImage: '/blog/se-coucher-faches.webp',
  featuredImageAlt: "Un lit double vide la nuit, une lampe de chevet allumée d'un côté et éteinte de l'autre",
  publishedAt: '2026-12-04T08:30:00+01:00',
  author: AUTHORS['thomas'],
  excerpt: "Il ne faut jamais se coucher fâchés : sur notre jeu, 83 % des votants sont d'accord. Ils préfèrent régler la dispute le soir même.",
  introduction: `<p>« Il ne faut jamais se coucher fâchés » : nos votants sont d'accord avec le dicton. À la situation « Aller se coucher fâchés plutôt que vider le sac à minuit », 534 votes sont arrivés et <strong>83 % répondent non</strong>.</p>
<p>Ils préfèrent donc régler la dispute le soir même, quitte à se coucher tard.</p>`,
  quickSummary: [
    "83 % des votants refusent d'aller se coucher fâchés (534 votes).",
    "80 % se disent bonne nuit même quand ils sont fâchés (545 votes).",
    "12 % seulement acceptent de se disputer devant les enfants.",
    "D'après le psychologue John Gottman, le corps met une vingtaine de minutes à se calmer après une dispute.",
  ],
  sections: [
    {
      id: 'se-coucher-faches',
      title: "Se coucher fâchés : 17 % de oui, 83 % de non",
      content: `<p>Le jeu propose un choix clair : aller se coucher fâchés, ou vider son sac à minuit. Sur 534 votes, <strong>441 choisissent de vider leur sac</strong>. Cette situation fait partie des <a href="/jeu-oui-non-couple/">120 situations de couple</a> auxquelles on répond par oui ou par non.</p>
<div class="blog-sondage">
<p class="blog-sondage-titre">Oui ou non</p>
<div class="blog-sondage-item">
<p class="blog-sondage-question">Aller se coucher fâchés plutôt que vider le sac à minuit</p>
<div class="blog-sondage-barre" role="img" aria-label="17 % oui, 83 % non"><span style="width:17%"></span><span style="width:83%"></span></div>
<p class="blog-sondage-camps"><span><strong>17 %</strong> oui</span><span><strong>83 %</strong> non</span></p>
<p class="blog-sondage-votes">534 votes</p>
</div>
</div>`,
    },
    {
      id: 'bonne-nuit-meme-faches',
      title: "80 % se disent bonne nuit même fâchés",
      content: `<div class="blog-chiffres">
<p class="blog-chiffres-titre">Les disputes, en chiffres</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">80 %</span>se disent bonne nuit même fâchés (545 votes)</li>
<li><span class="blog-chiffres-nombre">90 %</span>se disent toutes les vérités, même celles qui fâchent (562 votes)</li>
<li><span class="blog-chiffres-nombre">28 %</span>comptent les points quand l'autre a tort (522 votes)</li>
<li><span class="blog-chiffres-nombre">12 %</span>se disputent devant les enfants (547 votes)</li>
</ul>
</div>
<p>Même quand la dispute n'est pas réglée, la plupart gardent un geste : 80 % se disent bonne nuit même fâchés.</p>
<p>Nos votants ne fuient pas les sujets qui fâchent, puisque 90 % veulent « se dire toutes les vérités ». Mais ils n'aiment pas les disputes qui s'installent. 28 % seulement comptent les points quand l'autre a tort, et 12 % acceptent de se disputer devant les enfants.</p>`,
    },
    {
      id: 'faut-il-tout-regler-avant-de-dormir',
      title: "Faut-il toujours tout régler avant de dormir ?",
      content: `<p>Ce n'est pas toujours la meilleure idée. À minuit, on est fatigué et on dit plus facilement des choses qu'on regrette. D'après le psychologue américain John Gottman, le corps met une vingtaine de minutes à se calmer quand une dispute s'emballe. Il conseille de faire une pause de cette durée, puis de reprendre la discussion au calme.</p>
<p>Vous pouvez donc garder l'esprit du dicton sans vous épuiser. Faites une pause, dites-vous bonne nuit, et reprenez le lendemain si le sujet est trop gros. La <a href="/blog/disputes-couple/">façon dont une dispute se passe</a> compte plus que l'heure à laquelle elle finit.</p>`,
    },
    {
      id: 'd-ou-viennent-ces-chiffres',
      title: "D'où viennent ces chiffres ?",
      content: `<p>Les chiffres de cet article viennent des votes enregistrés sur Quiz Couple entre le 13 août et le 13 novembre 2026, dans nos deux jeux de vote. Selon la question, il y a entre 522 et 562 votes, toutes langues réunies. Un appareil ne vote qu'une fois par question.</p>
<p>Nos votants ne représentent pas toute la population : ce sont des personnes qui jouent sur un site de quiz pour couples. Il faut donc lire ces pourcentages comme l'avis de nos joueurs. Ils peuvent encore bouger de quelques points, parce que les votes continuent.</p>
<p class="blog-sources"><strong>Sources :</strong> votes enregistrés sur Quiz Couple du 13 août au 13 novembre 2026 (jeux « Pour ou contre » et « Oui ou non »), relevés le 13 novembre 2026 ; The Gottman Institute, « Physiological Self-Soothing » (<a href="https://www.gottman.com/blog/weekend-homework-assignment-physiological-self-soothing/" rel="noopener" target="_blank">lire l'article, en anglais</a>).</p>
<p class="blog-sources"><strong>Image :</strong> photo générée pour cet article.</p>`,
    },
  ],
};

export default article;
