import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'pierre-marie-curie-histoire-amour',
  title: "Après la mort de Pierre, Marie Curie a continué de lui écrire : l'histoire d'amour des Curie",
  metaTitle: "Pierre et Marie Curie : leur histoire d'amour, de 1894 au Panthéon",
  metaDescription: "Une rencontre en 1894, un mariage sans robe blanche, deux vélos pour le voyage de noces, le radium, puis l'accident de 1906. L'histoire d'amour de Pierre et Marie Curie.",
  featuredImage: '/blog/pierre-marie-curie-histoire-amour.webp',
  featuredImageAlt: "Pierre et Marie Curie dans leur laboratoire, debout et assise devant leurs instruments, avec un collègue à gauche",
  publishedAt: '2026-10-23T08:10:00+02:00',
  author: AUTHORS['thomas'],
  excerpt: "Après l'accident de Pierre en 1906, Marie Curie a tenu un journal qu'elle lui adressait directement. Voici leur histoire, de leur rencontre en 1894 jusqu'au Panthéon.",
  introduction: `<p>On connaît surtout Marie Curie pour ses deux prix Nobel. On sait moins qu'elle a vécu avec Pierre Curie <strong>une vraie histoire d'amour</strong>, qui a duré un peu plus de dix ans et s'est arrêtée d'un coup, en 1906, dans une rue de Paris.</p>
<p>Ils ont tout fait ensemble, le travail compris. Et quand Pierre est mort, Marie a continué de lui parler... dans un journal qu'elle lui écrivait.</p>`,
  quickSummary: [
    "Maria Skłodowska et Pierre Curie se rencontrent à Paris en 1894 et se marient en juillet 1895.",
    "Pas de robe blanche ni d'alliances : une tenue bleu foncé qu'elle portera ensuite au laboratoire, et deux vélos pour le voyage de noces.",
    "Ensemble, ils découvrent le polonium et le radium en 1898, et reçoivent le prix Nobel de physique en 1903.",
    "Après la mort de Pierre, en avril 1906, Marie tient un journal qu'elle lui adresse et reprend son cours à la Sorbonne.",
  ],
  sections: [
    {
      id: 'comment-ils-se-sont-rencontres',
      title: "Comment Marie et Pierre se sont rencontrés",
      content: `<p>En 1891, Maria Skłodowska quitte Varsovie pour faire ses études à Paris, à la Sorbonne.</p>
<p>Au printemps 1894, elle cherche un laboratoire pour un travail sur le magnétisme des aciers. Un professeur polonais de passage à Paris, Józef Kowalski, lui présente quelqu'un qui pourrait l'aider : <strong>Pierre Curie, un physicien de huit ans son aîné</strong>, qui enseigne à l'École de physique et de chimie de la ville de Paris.</p>
<p>L'été suivant, Maria rentre en Pologne pour les vacances, sans savoir si elle reviendra en France. Pierre lui écrit, plusieurs fois, pour la convaincre de revenir faire son doctorat à Paris.</p>
<blockquote><p>« ... passer la vie l'un près de l'autre, hypnotisés dans nos rêves : votre rêve patriotique, notre rêve humanitaire et notre rêve scientifique. »<br><small>Pierre Curie à Maria Skłodowska, été 1894</small></p></blockquote>
<p>Elle revient à Paris à l'automne. Ils se marient l'été d'après.</p>`,
    },
    {
      id: 'un-mariage-sans-robe-blanche',
      title: "Un mariage sans robe blanche",
      content: `<p>Le mariage a lieu le 26 juillet 1895, à la mairie de Sceaux. <strong>Pas d'église, pas d'alliances</strong> : un mariage civil, avec la famille et quelques amis.</p>
<p>Pas de robe blanche non plus. Marie choisit une tenue bleu foncé, simple, qu'elle pourra remettre tous les jours. Et c'est ce qu'elle fait : elle la portera ensuite au laboratoire pendant des années.</p>
<figure class="blog-portrait"><img src="/blog/pierre-marie-curie-1895.webp" alt="Photographie de Pierre et Marie Curie en 1895, debout côte à côte, elle lui tient le bras" width="620" height="826" loading="lazy"><figcaption>Pierre et Marie Curie en 1895, l'année de leur mariage.</figcaption></figure>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">🚲 Le voyage de noces</p>
<p>Avec l'argent reçu en cadeau de mariage, ils s'achètent <strong>deux bicyclettes</strong>. Leur voyage de noces, c'est ça : des balades à vélo sur les petites routes de campagne, pendant l'été 1895.</p>
</aside>`,
    },
    {
      id: 'le-radium-une-decouverte-a-deux',
      title: "Le radium, une découverte à deux",
      content: `<p>Pour sa thèse, Marie choisit un sujet tout neuf : les rayons que dégage l'uranium, découverts par Henri Becquerel en 1896. En mesurant des minerais, elle remarque que certains en émettent bien plus que ce que l'uranium seul peut expliquer. Il y a donc autre chose dedans.</p>
<p>Pierre trouve la piste si prometteuse qu'il <strong>met de côté ses propres recherches</strong>, sur les cristaux, pour travailler avec elle. En 1898, ils annoncent deux nouveaux éléments : le polonium en juillet, nommé d'après la Pologne de Marie, puis le radium en décembre.</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">Les Curie en chiffres</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">11</span>ans de mariage, ou presque</li>
<li><span class="blog-chiffres-nombre">2</span>éléments découverts ensemble en 1898</li>
<li><span class="blog-chiffres-nombre">5</span>prix Nobel dans la famille Curie</li>
<li><span class="blog-chiffres-nombre">1re</span>femme professeure à la Sorbonne : Marie, en 1908</li>
</ul>
</div>
<p>Entre-temps, leur première fille, Irène, est née en septembre 1897. Ils travaillent dans un hangar humide de l'École de physique et de chimie, et Marie parlera plus tard des journées de travail si heureuses qu'ils y ont passées, malgré tout.</p>`,
    },
    {
      id: 'le-nobel-de-1903',
      title: "Le prix Nobel de 1903, et Pierre qui s'en mêle",
      content: `<p>En 1903, les savants français qui proposent des noms pour le prix Nobel de physique citent Henri Becquerel et Pierre Curie. <strong>Marie n'est pas sur la liste.</strong></p>
<p>Pierre l'apprend par un membre de l'Académie suédoise, et il lui répond : si on pense à lui pour le prix, il tient à ce que ce soit avec Madame Curie, pour leurs recherches communes. Elle est finalement récompensée avec eux, et devient la <strong>première femme à recevoir un prix Nobel</strong>.</p>
<p>Ça dit pas mal de choses sur leur couple. Pierre la <a href="/test-couple-sain/">traite d'égal à égal</a>, à une époque où une femme scientifique passait facilement pour l'assistante de son mari.</p>`,
    },
    {
      id: 'le-19-avril-1906',
      title: "Le 19 avril 1906",
      content: `<p>Ce jeudi-là, il pleut fort sur Paris. Pierre traverse une rue près du Pont-Neuf, en se dépêchant, et passe sous les roues d'un <strong>chariot tiré par des chevaux</strong>, chargé d'uniformes militaires. Il meurt sur le coup. Il avait 46 ans.</p>
<p>Marie a 38 ans et deux filles : Irène, 8 ans, et Ève, 16 mois.</p>
<p>Onze jours plus tard, elle commence un <strong>journal qu'elle adresse directement à Pierre</strong>, en le tutoyant. Elle y raconte qu'elle a glissé une photo d'elle dans son cercueil : le portrait de la femme qu'il avait choisie pour compagne. Puis elle lui raconte ses journées, ce qu'on lui propose, ce qu'elle ressent. En mai, elle lui écrit qu'on lui a offert de reprendre sa chaire à la Sorbonne, et qu'elle n'aime plus ni le soleil ni les fleurs.</p>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">💡 Bon à savoir</p>
<p>Le 5 novembre 1906, Marie donne son premier cours à la Sorbonne, à la place de Pierre. La salle est pleine de curieux et de journalistes, qui attendent un hommage à Pierre. <strong>Elle ne fait aucun discours</strong> : elle commence directement son cours, sur les progrès de la physique des dix dernières années. Deux ans plus tard, elle devient la première femme nommée professeure à la Sorbonne.</p>
</aside>`,
    },
    {
      id: 'ensemble-au-pantheon',
      title: "Ensemble au Panthéon",
      content: `<p>En 1911, Marie reçoit seule un second prix Nobel, de chimie cette fois. Elle meurt en 1934 et elle est enterrée à Sceaux, à côté de Pierre.</p>
<p>En 1995, leurs restes sont transférés ensemble au Panthéon. Marie est <strong>la première femme à y entrer pour ses propres mérites</strong>.</p>
<p>Leur fille Irène a d'ailleurs suivi le même chemin. Avec son mari, Frédéric Joliot, elle a reçu le prix Nobel de chimie en 1935. Encore un couple de chercheurs !</p>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">💌 Et aujourd'hui ?</p>
<p>Pas besoin de découvrir un élément chimique pour ça : beaucoup de couples se sont trouvés grâce à <a href="/test-points-communs-couples/">une passion en commun</a>, et la gardent comme un terrain rien qu'à eux.</p>
</aside>
<a href="/blog/marie-antoinette-fersen-lettres/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lire aussi</span><span class="blog-read-also-title">Marie-Antoinette et Fersen : leurs lettres raturées lues aux rayons X</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>
<a href="/blog/juliette-drouet-victor-hugo-lettres/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lire aussi</span><span class="blog-read-also-title">Juliette Drouet et Victor Hugo : 50 ans d'amour et 22 000 lettres</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>
<p class="blog-sources"><strong>Sources :</strong> Institut Curie, pages sur l'histoire de Pierre et Marie Curie (<a href="https://curie.fr/" rel="noopener" target="_blank">curie.fr</a>) ; American Institute of Physics, « Marie Curie and the Science of Radioactivity » (<a href="https://history.aip.org/exhibits/curie/" rel="noopener" target="_blank">lire l'exposition, en anglais</a>) ; Université PSL, exposition virtuelle « Marie Curie, 1867-1934 » (<a href="https://explore.psl.eu/en/discover/virtual-exhibits/marie-curie-1867-1934/trials-tribulations-and-consecration-1906-1919" rel="noopener" target="_blank">explore.psl.eu</a>).</p>
<p class="blog-sources"><strong>Images :</strong> Pierre et Marie Curie dans leur laboratoire, photographie, Wellcome Collection, CC BY 4.0, recadrée ; Pierre et Marie Curie en 1895, photographie, domaine public.</p>`,
    },
  ],
};

export default article;
