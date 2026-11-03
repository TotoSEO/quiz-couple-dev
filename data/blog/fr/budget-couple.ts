import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "budget-couple",
  title: "Budget couple : la méthode simple pour faire un budget à deux, et s'y tenir",
  metaTitle: "Budget couple : faire un budget à deux et s'y tenir",
  metaDescription: "Budget couple : la méthode en cinq étapes, un exemple à 3 500 € par mois, la règle 50/30/20, les outils, l'épargne de précaution et le rendez-vous mensuel.",
  featuredImage: "/blog/budget-couple.webp",
  featuredImageAlt: "Les deux personnages de Quiz Couple devant une grande feuille de calcul posée sur une table, une calculatrice et des enveloppes",
  publishedAt: "2027-02-27T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "Un budget à deux prend une heure la première fois et vingt minutes par mois ensuite. La méthode en cinq étapes, un exemple pour un couple à 3 500 €, la règle 50/30/20, les outils, et ce qu'on fait quand on prête de l'argent à son conjoint.",
  introduction: `<p>Un budget couple, ce n'est pas un tableau de contraintes. <strong>C'est savoir où va l'argent à deux, pour ne plus avoir à deviner, à se reprocher ni à se priver pour rien.</strong> Les couples qui en ont un se disputent moins pour l'argent, pas parce qu'ils en ont plus, mais parce qu'ils savent ce qu'il en reste.</p>
<p>Voici la méthode en cinq étapes, un exemple chiffré pour un couple à 3 500 € par mois, la règle 50/30/20, les outils qui marchent, l'épargne de précaution, et le rendez-vous qui fait tenir tout ça.</p>`,
  quickSummary: [
    "Cinq étapes : les revenus, les dépenses fixes, les dépenses qui varient, l'épargne, et un argent de poche chacun. Une heure la première fois, vingt minutes par mois ensuite.",
    "La règle 50/30/20 donne un ordre de grandeur : la moitié pour l'indispensable, un tiers pour les envies, un cinquième pour l'épargne. Un repère, pas une loi.",
    "Les dépenses annuelles (impôts, assurance, vacances, cadeaux) se divisent par douze et se mettent de côté chaque mois : c'est elles qui font sauter les budgets.",
    "Une épargne de précaution de trois mois de dépenses, avant tout autre projet, enlève la peur qui alimente la plupart des disputes d'argent.",
    "Le budget se revoit à deux, une fois par mois, à date fixe. Un budget qu'on ne regarde pas est un tableur de plus.",
  ],
  sections: [
    {
      id: "pourquoi-un-budget",
      title: "Pourquoi un budget à deux change tout",
      content: `<p>Sans budget, chaque dépense est une négociation. Est-ce qu'on peut se payer ce restaurant ? Est-ce que les vacances sont raisonnables ? Pourquoi tu as acheté ça ? Et comme personne ne sait ce qu'il reste, chacun répond avec son instinct : l'économe dit non, le dépensier dit oui, et c'est reparti.</p>
<p><strong>Avec un budget, la question change : on ne demande plus « est-ce qu'on peut ? », on regarde la ligne.</strong> Il reste 140 € dans les loisirs ce mois-ci, donc oui pour le restaurant, non pour le week-end. Personne n'a cédé, personne n'a interdit. Le budget a décidé, et vous l'avez écrit ensemble. C'est la raison pour laquelle le dossier sur <a href="/blog/argent-et-couple/">l'argent dans le couple</a> en fait l'outil qui calme tout.</p>`,
    },
    {
      id: "la-methode",
      title: "La méthode en cinq étapes",
      content: `<ol>
<li><strong>Les revenus :</strong> les deux salaires nets, les aides, les revenus réguliers. Les primes et le treizième mois se lissent sur douze mois. On obtient ce qui entre chaque mois.</li>
<li><strong>Les dépenses fixes :</strong> le loyer ou le crédit, les charges, l'électricité, internet, les téléphones, les assurances, les abonnements, les transports, la garde des enfants. Tout ce qui tombe pareil chaque mois. Prenez les trois derniers relevés : ça va plus vite que de deviner.</li>
<li><strong>Les dépenses qui varient :</strong> les courses, l'essence, les sorties, les vêtements, la santé. Faites la moyenne des trois derniers mois, et ajoutez un douzième de tout ce qui tombe une fois par an : impôts, assurance voiture, vacances, cadeaux de Noël, la révision. C'est cette ligne qui fait sauter les budgets, parce qu'on l'oublie.</li>
<li><strong>L'épargne :</strong> une somme fixe, virée le jour de la paie, avant tout le reste. Si elle vient « avec ce qui reste », il ne reste jamais rien.</li>
<li><strong>L'argent de poche :</strong> une somme pour chacun, la même ou proportionnelle aux revenus, sur un compte à soi, sans justification. C'est la ligne qui fait accepter le budget au dépensier, et c'est elle qu'on oublie le plus.</li>
</ol>
<p>Si à la fin les dépenses dépassent les revenus, on ne commence pas par couper les plaisirs : on regarde les fixes. Un abonnement de trop, une assurance jamais renégociée, un forfait téléphone d'il y a cinq ans font souvent plus que tous les cafés du mois.</p>`,
    },
    {
      id: "un-exemple",
      title: "Un exemple pour un couple à 3 500 € par mois",
      content: `<p>Deux personnes, 1 500 et 2 000 € nets, un loyer en ville, pas d'enfant. Voilà ce que donne un budget qui tient :</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">Un mois à 3 500 €, à deux</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">1 750 €</span>de dépenses fixes : loyer et charges 1 100, énergie et internet 150, assurances 100, téléphones 40, transports 160, abonnements 50, et 150 mis de côté pour les impôts et l'assurance voiture de l'année</li>
<li><span class="blog-chiffres-nombre">900 €</span>de dépenses qui varient : courses 500, sorties et restaurants 200, vêtements et santé 100, et 100 mis de côté chaque mois pour les vacances</li>
<li><span class="blog-chiffres-nombre">500 €</span>d'épargne, virés le jour de la paie, d'abord pour la réserve de précaution</li>
<li><span class="blog-chiffres-nombre">350 €</span>d'argent de poche, 150 pour l'un et 200 pour l'autre, au prorata des revenus, sans justification</li>
</ul>
</div>
<p>Et comment chacun alimente ces lignes, c'est la question du <a href="/blog/partage-des-depenses-en-couple/">partage des dépenses en couple</a> : ici, au prorata, 43 % pour l'un et 57 % pour l'autre, par deux virements automatiques vers le compte commun. Si vous mettez tout en commun, la question ne se pose pas, et le <a href="/blog/compte-commun-ou-compte-separe/">compte commun ou séparé</a> dit lequel va avec quel budget.</p>`,
    },
    {
      id: "la-regle-50-30-20",
      title: "La règle 50/30/20, pour savoir si c'est raisonnable",
      content: `<p>Pour vérifier que votre budget n'est pas bancal, un repère connu : <strong>la moitié des revenus pour l'indispensable</strong> (logement, courses, transports, assurances, santé), <strong>trente pour cent pour les envies</strong> (sorties, vacances, vêtements, abonnements, argent de poche), <strong>vingt pour cent pour l'épargne</strong> et le remboursement des dettes.</p>
<p>Dans l'exemple ci-dessus, l'indispensable fait environ 65 %, les envies 20 % et l'épargne 15 % : lourd sur le logement, comme la plupart des couples en ville, et ça se corrige en montant l'épargne dès qu'un salaire bouge. Ce n'est pas une loi. Un couple avec un gros loyer à Paris sera à 60 % d'indispensable, un couple propriétaire sans crédit à 40 %. Ce que la règle dit, c'est où regarder quand ça ne rentre pas.</p>`,
      tip: "L'épargne de précaution d'abord : trois mois de dépenses, sur un livret disponible, avant tout projet. C'est elle qui enlève la peur qui alimente la plupart des disputes d'argent, parce qu'un imprévu n'est plus une catastrophe.",
    },
    {
      id: "les-outils",
      title: "Les outils : tableur, appli ou enveloppes",
      content: `<ul>
<li><strong>Le tableur partagé :</strong> une colonne par mois, une ligne par poste, accessible aux deux sur le téléphone. Gratuit, souple, et c'est ce que la plupart des couples finissent par utiliser.</li>
<li><strong>L'appli de budget :</strong> elle lit vos comptes et classe les dépenses toute seule. Pratique pour voir où part l'argent, moins pour décider à deux : elle montre, elle ne discute pas.</li>
<li><strong>Les enveloppes :</strong> la vieille méthode, en liquide ou en sous-comptes : une enveloppe courses, une sorties, une vacances. Quand l'enveloppe est vide, on arrête. C'est la méthode qui marche le mieux pour les dépensiers, parce qu'elle rend la limite visible.</li>
</ul>
<p>Et un point qui vaut tous les outils : <strong>le rendez-vous</strong>. Vingt minutes par mois, à date fixe, le premier dimanche par exemple, avec le budget sous les yeux. On regarde ce qui a dépassé, ce qui arrive le mois prochain, et chacun dit ce qui le préoccupe. Un budget qu'on ne regarde pas à deux est un tableur de plus. L'article sur <a href="/blog/parler-d-argent-en-couple/">la façon de parler d'argent en couple</a> explique comment poser ce rendez-vous sans qu'il devienne une corvée.</p>`,
    },
    {
      id: "preter-a-son-conjoint",
      title: "Prêter de l'argent à son conjoint",
      content: `<p>Ça arrive dans beaucoup de couples qui gardent des comptes séparés : l'un avance une grosse somme à l'autre, pour une voiture, un apport, une dette d'avant. Et ça finit mal plus souvent qu'on ne croit, non pas parce que l'autre ne rembourse pas, mais parce que personne n'a dit si c'était un prêt ou un cadeau.</p>
<p>Deux règles. La première : <strong>dites-le, en une phrase, le jour même</strong>. « Je te prête 3 000 €, tu me les rends quand tu peux » n'est pas la même chose que « je t'aide », et les deux sont acceptables si on sait laquelle c'est. La seconde, au-delà de quelques centaines d'euros et si vous n'êtes pas mariés : <strong>un papier</strong>, une reconnaissance de dette datée et signée, avec la somme et le rythme de remboursement. Ça paraît froid entre deux personnes qui s'aiment. C'est surtout ce qui permet de ne plus y penser, et de ne pas en faire une dispute dans deux ans. Le dossier sur <a href="/blog/argent-et-couple/">l'argent dans le couple</a> rappelle ce que la loi dit, ou ne dit pas, pour les couples non mariés.</p>
<p>Pour savoir si vous voyez l'épargne de la même façon, une priorité absolue pour l'un et « il faut profiter » pour l'autre, l'<a href="/evaluation-de-couple/" data-bilan-src="article-argent">évaluation de couple, à faire chacun sur son téléphone</a>, pose la question à chacun, avec celle de ce que vous feriez de 1 000 € tombés du ciel. Les deux réponses côte à côte, c'est souvent le point de départ du premier budget.</p>
<a href="/blog/argent-et-couple/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lire aussi</span><span class="blog-read-also-title">Argent et couple : comment gérer l'argent à deux sans que ça finisse en dispute</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
