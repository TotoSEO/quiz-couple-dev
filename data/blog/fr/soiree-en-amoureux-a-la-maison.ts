import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "soiree-en-amoureux-a-la-maison",
  title: "Soirée en amoureux à la maison : 25 idées pour que ce ne soit pas un plateau télé de plus",
  metaTitle: "Soirée en amoureux à la maison : 25 idées",
  metaDescription: "Vingt-cinq idées de soirée en amoureux à la maison : dîners, jeux à deux, détente ou soirées créatives, et les trois règles qui changent tout.",
  featuredImage: "/blog/soiree-en-amoureux-a-la-maison.webp",
  featuredImageAlt: "Les deux personnages de Quiz Couple à une petite table avec deux bougies et deux assiettes, un rideau fermé derrière eux",
  publishedAt: "2027-02-03T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "Une soirée en amoureux à la maison, ce n'est pas le canapé de tous les soirs. Trois règles, et vingt-cinq idées : dîners, jeux, détente, soirées créatives, même quand les enfants dorment à côté.",
  introduction: `<p>Une soirée en amoureux à la maison, c'est tout sauf le canapé, la série et les téléphones. <strong>La différence avec un soir ordinaire, c'est une heure de début, une idée, et pas d'écran.</strong> Avec ces trois règles, le salon devient un endroit où il se passe quelque chose.</p>
<p>Voici les règles, puis vingt-cinq idées : des dîners, des jeux à deux, des soirées détente et des soirées créatives, y compris quand les enfants dorment dans la pièce d'à côté.</p>`,
  quickSummary: [
    "Ce qui transforme un soir en soirée : une heure de début décidée, une idée choisie, et les téléphones dans une autre pièce.",
    "Le dîner à la maison marche si c'est un repas qu'on ne fait jamais, pas les pâtes du mardi.",
    "Les jeux à deux sont la façon la plus sûre de parler d'autre chose que de la logistique : questions, dilemmes, « je n'ai jamais ».",
    "Une soirée détente (massage, bain, musique) demande d'être préparée comme une sortie, sinon elle finit devant un écran.",
    "Avec des enfants, la soirée commence à 21 h et dure une heure : c'est suffisant, à condition qu'elle soit prévue.",
  ],
  sections: [
    {
      id: "les-trois-regles",
      title: "Les trois règles qui changent tout",
      content: `<p>Ce qui fait qu'une soirée à la maison rallume quelque chose, ou pas, ne dépend pas de l'idée. Ça dépend de trois choses :</p>
<ul>
<li><strong>Une heure de début :</strong> « ce soir à 20 h 30 », pas « après le rangement ». Sans heure, la soirée n'a jamais lieu, parce qu'il y a toujours une dernière chose à faire.</li>
<li><strong>Une idée :</strong> décidée avant, par l'un des deux, à tour de rôle. Le plateau télé n'est pas une idée, c'est l'absence d'idée.</li>
<li><strong>Pas d'écran :</strong> les téléphones dans la chambre, la télé éteinte, sauf si le film est l'idée. Un écran allumé dans la pièce prend l'attention même quand on ne le regarde pas.</li>
</ul>
<p>C'est la même logique que pour un rendez-vous dehors : prévu, à deux, différent. L'article sur <a href="/blog/idees-de-rendez-vous-amoureux/">les idées de rendez-vous amoureux</a> explique pourquoi ça marche, chiffres à l'appui. À la maison, c'est juste plus facile de tricher, d'où les règles.</p>`,
    },
    {
      id: "les-diners",
      title: "Cinq dîners qui ne ressemblent pas au mardi",
      content: `<ul>
<li><strong>Le restaurant à la maison :</strong> une nappe, deux bougies, un menu écrit à la main, et un plat que vous ne faites jamais. L'un cuisine, l'autre sert, ou l'inverse.</li>
<li><strong>Le pays du soir :</strong> un pays tiré au sort, son plat, sa musique, et un verre de ce qu'on y boit. Le Mexique un jeudi de février fait beaucoup de bien.</li>
<li><strong>La fondue ou la raclette pour deux :</strong> ça dure deux heures, on se ressert, on parle. C'est le plat le plus lent qui existe, et c'est le but.</li>
<li><strong>Le pique-nique dans le salon :</strong> une couverture par terre, des choses à manger avec les doigts, et les coussins du canapé. Avec un enfant endormi à côté, c'est le dîner parfait.</li>
<li><strong>Le dessert d'abord :</strong> on commence par la pâtisserie, à 20 h, et on verra pour le reste. Casser l'ordre des choses, c'est déjà une soirée.</li>
</ul>`,
    },
    {
      id: "les-jeux",
      title: "Cinq soirées jeux à deux",
      content: `<p>C'est la catégorie la plus efficace pour parler d'autre chose que des enfants et des courses. Un jeu donne une raison de poser des questions qu'on ne pose plus.</p>
<ul>
<li><strong>Les questions :</strong> une liste, et on y répond à tour de rôle. Les <a href="/questions-couple/">questions à se poser en couple</a> en donnent plus de cent, par thème, du léger au sérieux.</li>
<li><strong>Le « je n'ai jamais » :</strong> on lève la main quand on l'a déjà fait, et on raconte. Vous apprendrez des choses après dix ans. Le site a <a href="/je-nai-jamais-jeu-couple/">un « je n'ai jamais » pour deux</a>, avec les phrases prêtes.</li>
<li><strong>Action ou vérité :</strong> la version adulte, celle où les actions se font dans le salon et où les vérités comptent. Le <a href="/jeu-action-ou-verite-couple/">jeu d'action ou vérité à deux</a> tire les cartes pour vous.</li>
<li><strong>Le jeu de société à deux :</strong> un jeu à deux joueurs, pas un jeu pour six joué à deux. Il y en a des dizaines, et un bar à jeux vous conseillera.</li>
<li><strong>Le quiz sur l'autre :</strong> « quel est mon plat préféré, ma peur, mon premier concert ? ». Celui qui se trompe le plus fait la vaisselle une semaine. Les jeux du site sont faits pour ça, et le hub des <a href="/jeux-de-couple/">jeux pour couples</a> les rassemble.</li>
</ul>`,
    },
    {
      id: "detente",
      title: "Cinq soirées détente",
      content: `<p>La soirée détente est la plus souvent ratée, parce qu'on croit qu'elle s'improvise. Elle se prépare comme une sortie, sinon elle finit devant une série.</p>
<ul>
<li><strong>Le massage à tour de rôle :</strong> vingt minutes chacun, avec une huile, une bougie, et une minuterie pour que ce soit juste. Pas besoin de savoir faire.</li>
<li><strong>Le bain ou la douche à deux :</strong> si la baignoire est trop petite, c'est encore mieux.</li>
<li><strong>La soirée musique :</strong> chacun fait une liste de dix chansons qui racontent quelque chose, et on les écoute, allongés, en expliquant pourquoi.</li>
<li><strong>La lecture à voix haute :</strong> un livre, un chapitre chacun, dans le lit. Ça endort, et c'est tendre.</li>
<li><strong>La séance de cinéma :</strong> le film comme idée, pas comme bruit de fond : choisi ensemble à l'avance, du pop-corn, les lumières éteintes, et les téléphones dans l'autre pièce. Un film vu comme ça n'a rien à voir avec un film subi.</li>
</ul>`,
      tip: "Fais le ménage avant, pas pendant. Une soirée qui commence par « attends, je range juste la cuisine » commence à 22 h 30 et finit au lit avec son téléphone. Range à 18 h, ou ne range pas.",
    },
    {
      id: "creatives",
      title: "Cinq soirées créatives",
      content: `<ul>
<li><strong>La liste des envies :</strong> chacun écrit vingt choses qu'il aimerait faire dans l'année, seul ou à deux, et on compare. Il en sortira des idées de week-end pour six mois.</li>
<li><strong>Les photos :</strong> on sort les vieilles photos, celles du téléphone comme celles des boîtes, et on se refait l'histoire. Deux heures passent en dix minutes.</li>
<li><strong>Le plan de la maison idéale :</strong> une feuille, un crayon, et la maison où vous vivrez dans dix ans. On apprend ce que l'autre veut.</li>
<li><strong>Le cocktail inventé :</strong> ce qu'il y a dans les placards, un shaker ou un bocal, et un nom pour la création. Notez la recette si elle est bonne.</li>
<li><strong>La lettre pour dans un an :</strong> chacun écrit à l'autre, on ferme les enveloppes, et on les ouvre le même soir l'année suivante. Un rituel qui commence par une soirée.</li>
</ul>`,
    },
    {
      id: "avec-les-enfants",
      title: "Quand les enfants dorment à côté",
      content: `<p>Avec des enfants, la soirée en amoureux commence à 21 h et dure une heure, parfois moins. <strong>Ça suffit, à condition que ce soit prévu.</strong> Le piège, c'est de se dire qu'une heure ne vaut pas la peine et de la passer sur le canapé avec les téléphones. Une heure de pique-nique dans le salon, de questions, ou de massage, vaut plus que trois heures de série.</p>
<p>Deux choses aident : préparer pendant la journée (la nappe, le jeu, la bougie), et dire aux enfants que c'est la soirée des parents, dès qu'ils ont l'âge de comprendre. Ils apprennent au passage que leurs parents forment un couple, et ça les rassure plus que ça ne les vexe.</p>
<p>Et si vous vous rendez compte, en cherchant une idée, que vous n'avez plus très envie de passer la soirée ensemble, ce n'est pas un problème de soirée. Le dossier sur <a href="/blog/raviver-la-flamme-dans-son-couple/">la façon de raviver la flamme dans son couple</a> commence par là, et le site propose une <a href="/evaluation-de-couple/" data-bilan-src="article-flamme">évaluation de couple en cent questions, chacun sur son téléphone</a>, pour voir où vous en êtes sans avoir à lancer la conversation.</p>
<a href="/blog/raviver-la-flamme-dans-son-couple/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lire aussi</span><span class="blog-read-also-title">Raviver la flamme dans son couple : ce qui marche, et par où commencer</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
