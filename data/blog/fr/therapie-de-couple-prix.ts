import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "therapie-de-couple-prix",
  title: "Thérapie de couple : le prix d'une séance, ce qui est remboursé, et comment payer moins",
  metaTitle: "Thérapie de couple : prix d'une séance et remboursement",
  metaDescription: "Le prix d'une thérapie de couple en France : de 60 à 120 € la séance, ce que la Sécu et les mutuelles remboursent, et les solutions moins chères qui existent.",
  featuredImage: "/blog/therapie-de-couple-prix.webp",
  featuredImageAlt: "Les deux personnages de Quiz Couple devant une tirelire en forme de cœur, quelques pièces posées à côté sur une table",
  publishedAt: "2026-12-31T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "Une séance de thérapie de couple coûte entre 60 et 120 € en France, et elle n'est presque jamais remboursée. Voici les vrais chiffres, et les façons de payer moins.",
  introduction: `<p>Une thérapie de couple coûte <strong>entre 60 et 120 € la séance</strong> en France, un peu plus à Paris, un peu moins en visio. Sur un suivi de six mois, ça représente dix à quinze séances, donc à peu près 600 à 1 800 €. Et dans la plupart des cas, rien n'est remboursé par la Sécurité sociale.</p>
<p>Voici le détail des prix, ce que ta mutuelle peut prendre en charge, et les solutions moins chères quand le budget ne suit pas.</p>`,
  quickSummary: [
    "Une séance de thérapie de couple coûte de 60 à 120 € en France, de 80 à 150 € à Paris, un peu moins en visio.",
    "Elle dure de 45 minutes à 1 h 30, et on y va à peu près toutes les deux ou trois semaines.",
    "La Sécurité sociale ne rembourse pas les psychologues, et le dispositif Mon soutien psy ne couvre que les séances individuelles.",
    "Certaines mutuelles remboursent quelques séances par an : regarde la ligne « psychologue » ou « médecines douces » de ton contrat.",
    "Les centres de planification, les associations familiales et les écoles de thérapie proposent des consultations de couple à prix réduit.",
  ],
  sections: [
    {
      id: "le-prix-d-une-seance",
      title: "Le prix d'une séance de thérapie de couple",
      content: `<p>Les tarifs ne sont pas encadrés, chaque praticien fixe le sien. Mais en regardant ce qui se pratique, on retombe presque toujours dans les mêmes fourchettes :</p>
<ul>
<li><strong>En ville moyenne ou à la campagne :</strong> de 60 à 90 € la séance.</li>
<li><strong>Dans une grande ville :</strong> de 80 à 120 €.</li>
<li><strong>À Paris :</strong> de 80 à 150 €, parfois plus chez des thérapeutes très demandés.</li>
<li><strong>En visio :</strong> souvent 10 à 20 € de moins qu'en cabinet, chez le même praticien.</li>
</ul>
<p>Pourquoi plus cher qu'une séance individuelle ? Parce qu'elle est plus longue. Une séance de couple dure <strong>de 45 minutes à 1 h 30</strong>, le temps d'écouter deux personnes au lieu d'une. Rapporté à l'heure, ce n'est pas si différent.</p>
<p>Le type de professionnel joue aussi. Un psychologue ou un psychothérapeute facture en général plus qu'un conseiller conjugal et familial, dont les tarifs tournent plutôt autour de 50 à 80 €. Ça ne veut pas dire que l'un vaut mieux que l'autre : ce que chacun fait est expliqué dans <a href="/blog/therapie-de-couple/">le dossier sur la thérapie de couple</a>.</p>`,
    },
    {
      id: "le-cout-total",
      title: "Le coût total d'une thérapie",
      content: `<p>Une thérapie de couple, ce n'est pas une séance, c'est une série. On y va toutes les deux ou trois semaines, et ça dure de trois mois à un an. Voici à quoi t'attendre :</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">Ce que ça coûte, au total</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">90 €</span>la séance, en moyenne, en France</li>
<li><span class="blog-chiffres-nombre">10 à 20</span>séances pour une thérapie complète</li>
<li><span class="blog-chiffres-nombre">900 à 1 800 €</span>sur l'ensemble du suivi</li>
<li><span class="blog-chiffres-nombre">0 €</span>remboursés par la Sécurité sociale, dans la plupart des cas</li>
</ul>
</div>
<p>Ça fait une somme. Mais ramené au mois, sur six mois, ça fait 150 à 300 € par couple, soit 75 à 150 € chacun. Beaucoup de couples dépensent ça en sorties ou en abonnements sans y penser. Et ça reste très loin de ce que coûte une séparation, entre le déménagement, le deuxième loyer et, s'il y a mariage, la procédure.</p>
<p>Le déroulé d'un suivi, du premier appel à la dernière séance, est raconté dans l'article <a href="/blog/therapie-de-couple-comment-ca-se-passe/">comment se passe une thérapie de couple</a>.</p>`,
    },
    {
      id: "securite-sociale",
      title: "Ce que rembourse la Sécurité sociale",
      content: `<p>Presque rien, et il vaut mieux le savoir avant.</p>
<p>Les psychologues et les psychothérapeutes ne sont pas conventionnés : <strong>leurs séances ne sont pas remboursées par l'Assurance maladie</strong>. Le dispositif Mon soutien psy, qui prend en charge des séances chez un psychologue partenaire, concerne les séances individuelles, pas les séances de couple. Si l'un de vous deux a besoin d'un suivi personnel en plus, ça peut servir pour cette partie-là, mais pas pour la thérapie à deux.</p>
<p>Le seul professionnel dont les consultations sont remboursées, c'est le psychiatre, parce que c'est un médecin. Mais très peu de psychiatres font de la thérapie de couple, et une séance à deux ne rentre pas dans le cadre d'une consultation médicale classique. Ce n'est pas une piste à compter dans ton budget.</p>`,
      tip: "Les conditions de Mon soutien psy changent régulièrement (nombre de séances, montant, besoin ou non d'une ordonnance). Avant de compter dessus, regarde la page du dispositif sur le site de l'Assurance maladie.",
    },
    {
      id: "la-mutuelle",
      title: "Ce que ta mutuelle peut prendre en charge",
      content: `<p>C'est là qu'il y a quelque chose à récupérer. <strong>De plus en plus de mutuelles remboursent quelques séances de psychologue par an</strong>, en général sous la forme d'un forfait : par exemple trois, quatre ou six séances, avec un plafond par séance.</p>
<p>Le piège, c'est que la ligne s'appelle rarement « thérapie de couple ». Cherche plutôt :</p>
<ul>
<li><strong>« Psychologue » ou « psychothérapie » :</strong> le forfait le plus courant.</li>
<li><strong>« Médecines douces » ou « pratiques complémentaires » :</strong> certaines mutuelles y rangent les psychologues, avec l'ostéopathe et l'acupuncteur.</li>
<li><strong>« Consultations non remboursées par la Sécurité sociale » :</strong> un forfait global, à répartir comme tu veux.</li>
</ul>
<p>Deux choses à vérifier : si la mutuelle exige que le praticien soit psychologue diplômé (un conseiller conjugal ne passerait pas), et si elle demande une facture au nom d'un seul des deux. Dans ce cas, demandez au thérapeute une facture par personne, chacun avec sa mutuelle : deux forfaits au lieu d'un.</p>`,
    },
    {
      id: "payer-moins-cher",
      title: "Les solutions moins chères",
      content: `<p>Si le budget bloque, il existe plusieurs façons de consulter pour beaucoup moins, parfois gratuitement.</p>
<ul>
<li><strong>Les centres de planification et d'éducation familiale :</strong> ils proposent des entretiens de conseil conjugal, souvent gratuits ou à tarif très réduit. Renseigne-toi auprès de ton département.</li>
<li><strong>Les associations familiales :</strong> plusieurs réseaux proposent du conseil conjugal avec une participation selon les revenus, parfois de l'ordre de 20 à 40 € la séance.</li>
<li><strong>Les écoles de thérapie :</strong> des thérapeutes en fin de formation reçoivent des couples sous la supervision d'un professionnel, à prix réduit. La qualité est en général très bonne, justement parce qu'ils sont supervisés.</li>
<li><strong>La visio :</strong> moins chère chez le même praticien, et elle ouvre à des thérapeutes installés dans des villes où les tarifs sont plus bas. Ce qu'il faut vérifier avant est dans l'article sur <a href="/blog/therapie-de-couple-en-ligne/">la thérapie de couple en ligne</a>.</li>
<li><strong>Le tarif adapté :</strong> beaucoup de thérapeutes baissent leur prix pour les étudiants, les demandeurs d'emploi ou les couples à petit budget. Il faut le demander, ils ne l'affichent pas toujours.</li>
</ul>
<p>Une dernière piste, qui ne remplace pas une thérapie mais qui coûte bien moins cher : faire le point à deux avant de consulter. Le site propose une <a href="/evaluation-de-couple/" data-bilan-src="article-therapie">évaluation de couple de cent questions, chacun de son côté</a>, avec un rapport qui montre où vous êtes d'accord et où vous ne l'êtes pas. Pour certains couples, ça suffit à relancer la discussion. Pour d'autres, ça permet d'arriver chez le thérapeute en sachant déjà de quoi parler, et de gagner deux ou trois séances.</p>`,
    },
    {
      id: "est-ce-que-ca-vaut-le-prix",
      title: "Est-ce que ça vaut le prix ?",
      content: `<p>Difficile de répondre à la place de quelqu'un. Mais deux choses aident à décider.</p>
<p>D'abord, ce que disent les études : d'après une revue de la recherche publiée en 2012, <strong>environ sept couples sur dix vont mieux à la fin d'une thérapie</strong>. Ce n'est pas une garantie, c'est une probabilité, et elle est plutôt bonne.</p>
<p>Ensuite, le moment. Une thérapie commencée quand les disputes tournent en rond depuis six mois coûte moins cher, en séances et en énergie, qu'une thérapie commencée quand l'un des deux a déjà un pied dehors. Les signes qui disent que c'est le moment sont dans l'article sur <a href="/blog/quand-faire-une-therapie-de-couple/">quand faire une thérapie de couple</a>. Plus on attend, plus c'est long... et plus c'est cher.</p>
<a href="/blog/therapie-de-couple/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lire aussi</span><span class="blog-read-also-title">Thérapie de couple : comment ça se passe, ce que ça coûte, et par où commencer</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
