import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "partage-des-depenses-en-couple",
  title: "Partage des dépenses en couple : moitié-moitié, au prorata ou sans compter ?",
  metaTitle: "Partage des dépenses en couple : moitié-moitié ou prorata ?",
  metaDescription: "Le partage des dépenses en couple : moitié-moitié, au prorata des revenus ou sans compter, qui paie quoi, le calcul pas à pas, et les dépenses qu'on oublie.",
  featuredImage: "/blog/partage-des-depenses-en-couple.webp",
  featuredImageAlt: "Les deux personnages de Quiz Couple de part et d'autre d'une balance, des pièces sur chaque plateau, la balance penchée",
  publishedAt: "2027-02-17T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "Moitié-moitié paraît juste, et ne l'est que si vous gagnez pareil. Les trois méthodes de partage des dépenses en couple, le calcul au prorata avec un exemple, qui paie quoi, et les dépenses qu'on oublie toujours.",
  introduction: `<p>Le partage des dépenses en couple se règle presque toujours de la même façon au début : moitié-moitié, parce que c'est simple et que ça a l'air juste. <strong>Ça l'est tant que vous gagnez à peu près la même chose. Dès que l'un gagne nettement plus, moitié-moitié devient la méthode la plus injuste des trois.</strong></p>
<p>Voici les trois méthodes avec un exemple chiffré, ce qu'on met dans les dépenses communes et ce qu'on laisse dehors, le calcul au prorata pas à pas, et les dépenses qu'on oublie dans le partage.</p>`,
  quickSummary: [
    "Trois méthodes : moitié-moitié, au prorata des revenus, ou sans compter avec tout en commun. La première est juste à revenus égaux, la deuxième dès qu'ils diffèrent.",
    "Au prorata, chacun paie les dépenses communes dans la proportion de ce qu'il gagne : à 2 000 et 3 000 € de revenus, c'est 40 % et 60 %.",
    "Les dépenses communes, c'est ce qui sert aux deux : loyer, charges, courses, enfants, vacances à deux. Le téléphone, les vêtements et les sorties avec ses amis restent à chacun.",
    "Une appli de partage de dépenses règle les restaurants et les week-ends ; pour le loyer et les courses, un compte commun alimenté au prorata est plus simple.",
    "Le partage ne s'arrête pas aux euros : le temps passé à gérer, cuisiner, s'occuper des enfants compte aussi, et c'est souvent lui qui déséquilibre.",
  ],
  sections: [
    {
      id: "les-trois-methodes",
      title: "Les trois méthodes, avec le même exemple",
      content: `<p>Prenons un couple qui gagne 5 000 € par mois à deux : 2 000 € pour l'un, 3 000 € pour l'autre, et 2 500 € de dépenses communes (loyer, charges, courses, assurances, abonnements). Voilà ce que donne chaque méthode :</p>
<ul>
<li><strong>Moitié-moitié :</strong> 1 250 € chacun. Celui qui gagne 2 000 € garde 750 € pour tout le reste ; celui qui gagne 3 000 € en garde 1 750. Le premier compte chaque sortie, le second part en week-end. C'est la méthode qui fabrique le plus de disputes d'argent, et personne ne comprend pourquoi, puisque « c'est équitable ».</li>
<li><strong>Au prorata des revenus :</strong> le premier gagne 40 % des revenus du couple, il paie 40 % des dépenses communes, soit 1 000 € ; le second paie 60 %, soit 1 500 €. Il reste 1 000 € au premier et 1 500 € au second : chacun garde la même part de son salaire, la moitié. C'est la méthode qu'on recommande dès que les revenus diffèrent.</li>
<li><strong>Sans compter, tout en commun :</strong> les 5 000 € tombent sur un seul compte, qui paie tout, et il reste 2 500 € pour le reste, à deux. Personne ne calcule. C'est la méthode de près de deux couples sur trois en France, et elle suppose d'avoir réglé la question du <a href="/blog/compte-commun-ou-compte-separe/">compte commun ou séparé</a> avant.</li>
</ul>
<p>Il existe une quatrième voie, un peu entre les deux : celui qui gagne le plus paie plus, sans calculer au pourcentage près. Le loyer pour l'un, les courses pour l'autre, et on ajuste quand ça penche trop. Ça marche dans les couples qui se font confiance et qui n'aiment pas les tableurs.</p>`,
    },
    {
      id: "qui-paie-quoi",
      title: "Qui paie quoi : ce qui est commun, et ce qui ne l'est pas",
      content: `<p>La vraie difficulté n'est pas le pourcentage, c'est la liste. Ce qui entre dans les dépenses communes, et ce qui reste à chacun. Voici ce que font la plupart des couples :</p>
<ul>
<li><strong>Commun :</strong> le loyer ou le crédit, les charges, l'électricité, internet, les courses, les assurances du logement, les enfants (garde, école, vêtements, activités), les vacances à deux, les restaurants à deux, les cadeaux faits ensemble, la voiture si elle sert aux deux.</li>
<li><strong>À chacun :</strong> le téléphone, les vêtements, le sport, les sorties avec ses amis, les cadeaux à sa propre famille, les dettes d'avant le couple, les loisirs que l'autre ne partage pas.</li>
<li><strong>À discuter :</strong> la voiture qui sert surtout à l'un, les frais de santé, l'aide à ses parents, le chien que l'un a voulu, les abonnements que l'un utilise seul.</li>
</ul>
<p>La troisième liste est celle qui compte. Chaque couple la tranche à sa façon, et le seul mauvais choix est de ne pas en parler. Si vous ne savez pas comment amener le sujet, l'article sur <a href="/blog/parler-d-argent-en-couple/">la façon de parler d'argent en couple</a> donne les questions dans l'ordre.</p>`,
    },
    {
      id: "le-calcul-au-prorata",
      title: "Le calcul au prorata, pas à pas",
      content: `<p>Ça prend cinq minutes, une fois par an ou quand un salaire change :</p>
<ol>
<li><strong>Additionnez vos deux revenus nets</strong> mensuels, primes lissées comprises. Exemple : 2 000 + 3 000 = 5 000 €.</li>
<li><strong>Calculez la part de chacun :</strong> 2 000 / 5 000 = 40 % ; 3 000 / 5 000 = 60 %.</li>
<li><strong>Listez les dépenses communes</strong> d'un mois normal, et ajoutez un douzième des dépenses annuelles (impôts, assurance voiture, vacances). Exemple : 2 500 €.</li>
<li><strong>Appliquez la part :</strong> 40 % de 2 500 = 1 000 € ; 60 % de 2 500 = 1 500 €.</li>
<li><strong>Mettez en place un virement automatique</strong> de chacun vers le compte commun, le lendemain de la paie. Et on n'y pense plus.</li>
</ol>
<p>Un cas fréquent : les dépenses communes sont plus hautes que ce que celui qui gagne le moins peut suivre, même au prorata, parce que le logement a été choisi sur le salaire du plus aisé. Dans ce cas, soit on baisse les dépenses, soit celui qui gagne le plus prend une part supérieure à son pourcentage, et on le dit clairement, pour que ce ne soit pas une faveur silencieuse qui se paie plus tard. L'article <a href="/blog/mon-conjoint-gagne-plus-que-moi/">mon conjoint gagne plus que moi</a> parle de ce qui se joue à ce moment-là.</p>`,
      tip: "Revoyez le prorata à chaque changement : augmentation, temps partiel, chômage, congé parental. Un partage calculé il y a trois ans sur des salaires qui ont changé est la source la plus discrète de rancune dans un couple.",
    },
    {
      id: "les-outils",
      title: "Les outils : appli, compte commun ou cahier",
      content: `<p>Pour les dépenses du quotidien à deux (un restaurant, les courses du week-end, un billet de train), <strong>une appli de partage de dépenses</strong> fait très bien le travail : chacun note ce qu'il a payé, l'appli dit qui doit combien à qui à la fin du mois, et on se rembourse en un virement. On peut y régler un pourcentage pour que le partage se fasse au prorata tout seul. C'est l'outil des couples qui gardent des comptes séparés.</p>
<p>Pour le loyer, les charges et tout ce qui tombe tous les mois, l'appli devient vite pénible. Un <strong>compte commun alimenté par deux virements automatiques</strong>, calculés au prorata, est plus simple : tout part de là, et personne ne doit rien à personne.</p>
<p>Et certains couples font tout ça sur un cahier ou un tableur partagé, une fois par mois. L'outil compte moins que l'habitude de regarder ensemble. C'est l'un des points de l'article sur <a href="/blog/budget-couple/">le budget en couple</a>.</p>`,
    },
    {
      id: "ce-qu-on-oublie",
      title: "Ce qu'on oublie dans le partage",
      content: `<p>Le partage des dépenses se fait en euros, et c'est là qu'il triche. Parce qu'un couple ne partage pas que des factures : il partage du temps. Faire les courses, cuisiner, gérer les papiers, prendre les rendez-vous, rester à la maison avec un enfant malade. <strong>Si l'un paie 60 % des dépenses et que l'autre fait 80 % du reste, le partage n'est pas à 60/40.</strong></p>
<p>C'est souvent là que se niche le sentiment d'injustice qu'un tableur ne montre pas, et c'est ce qui se cache derrière beaucoup de disputes qui ont l'air de parler d'argent. Quand vous faites vos comptes, mettez aussi sur la table qui fait quoi, et combien de temps ça prend. Le dossier sur <a href="/blog/argent-et-couple/">l'argent dans le couple</a> y revient, et l'<a href="/evaluation-de-couple/" data-bilan-src="article-argent">évaluation de couple, à faire chacun sur son téléphone</a>, pose les deux questions l'une à côté de l'autre : comment les dépenses se partagent, selon vous, et qui gère le plus l'argent, les factures et les papiers. Les deux réponses, mises côte à côte, en disent long.</p>
<a href="/blog/argent-et-couple/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lire aussi</span><span class="blog-read-also-title">Argent et couple : comment gérer l'argent à deux sans que ça finisse en dispute</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
