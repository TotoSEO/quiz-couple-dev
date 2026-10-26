import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'disputes-couple',
  title: "Disputes de couple : comment bien se disputer, et quand ça devient un problème",
  metaTitle: "Disputes de couple : comment bien se disputer",
  metaDescription: "Se disputer en couple est normal, ce qui compte c'est comment : dispute saine ou toxique, les quatre erreurs, la méthode DESC, et quand il faut s'inquiéter.",
  featuredImage: '/blog/disputes-couple.webp',
  featuredImageAlt: "Table de café vide avec deux tasses et deux chaises rapprochées face à face, dans la lumière du matin",
  publishedAt: '2026-05-26',
  modifiedAt: '2026-10-26',
  author: AUTHORS['thomas'],
  excerpt: "Les disputes ne sont pas le signe que ça va mal. C'est la façon de se disputer qui fait la différence entre un couple qui avance et un couple qui s'use.",
  introduction: `<p>Personne ne nous apprend à se disputer. Du coup, on crie, on accuse, on ressort le passé, on claque une porte, et le lendemain rien n'est réglé : on s'excuse vaguement, on fait comme si de rien n'était, et on attend la prochaine fois.</p>
<p>Si tu es là, c'est sûrement que les disputes dans ton couple te préoccupent : trop fréquentes, trop violentes, ou qui ne servent à rien. Ou alors vous ne vous disputez jamais, et ça t'inquiète aussi. Les deux posent question. Voici ce qui distingue une dispute qui fait avancer d'une dispute qui abîme, les erreurs qu'on fait tous, une méthode simple pour que ça serve à quelque chose, et les signes qui disent que ce n'est plus une question de communication.</p>`,
  quickSummary: [
    "Se disputer est normal : un couple qui ne se dispute jamais est souvent un couple où quelqu'un a renoncé à parler.",
    "La différence entre une dispute saine et une dispute toxique, c'est le respect, même en colère.",
    "Les quatre erreurs qui aggravent tout : crier, le mur du silence, ressortir le passé, menacer de rompre.",
    "La méthode DESC : décrire, exprimer, spécifier, conséquences. Simple, et ça marche si on joue le jeu.",
    "Quand les mêmes disputes tournent en boucle depuis des mois, ou que tu as peur d'en déclencher une, il faut se faire aider.",
  ],
  sections: [
    {
      id: 'pourquoi-disputes-normales',
      title: "Pourquoi se disputer est normal, et même utile",
      content: `<p>Tu te disputes avec qui ? Pas avec les gens qui te sont indifférents. Tu te disputes avec les personnes qui comptent, sur des sujets qui comptent. Deux personnes qui partagent un quotidien, un compte en banque et des projets, c'est évident qu'il y a des frictions. John Gottman, qui a observé des couples pendant des décennies, l'a montré : ce n'est pas le nombre de disputes qui annonce une rupture, c'est la façon dont elles se passent. Des couples qui se disputent souvent, mais avec respect, durent plus longtemps que des couples qui évitent tout conflit.</p>
<p>Parce qu'un couple qui ne se dispute jamais, c'est rarement un couple d'accord sur tout. C'est souvent un couple où l'un des deux a compris que parler ne servait à rien, et qui avale ses frustrations en silence. Ça ressemble à de la paix, et ça finit par une explosion, ou par quelqu'un qui part sans prévenir parce que ça fait des mois qu'il a décroché. Si vous ne vous disputez jamais, pose-toi la question : est-ce que c'est parce que vous êtes vraiment d'accord, ou parce que l'un de vous a arrêté d'essayer ?</p>
<p>Une bonne dispute, ça existe : tu dis un besoin, tu poses une limite, tu comprends un peu mieux comment l'autre voit les choses, et vous trouvez un terrain d'entente, même imparfait. Après, on se sent soulagé, pas parce qu'on a gagné, mais parce que quelque chose a bougé.</p>`,
    },
    {
      id: 'disputes-saines-vs-toxiques',
      title: "Dispute saine ou dispute toxique : la différence",
      content: `<p>Toutes les disputes ne se valent pas, et la frontière est plus nette qu'on ne croit.</p>
<table><thead><tr><th>Dispute saine</th><th>Dispute toxique</th></tr></thead><tbody>
<tr><td>On parle du problème précis</td><td>On attaque la personne</td></tr>
<tr><td>« Ça m'a blessé quand tu as fait ça »</td><td>« Tu es toujours comme ça, t'es nul(le) »</td></tr>
<tr><td>On écoute la réponse de l'autre</td><td>On coupe la parole pour avoir raison</td></tr>
<tr><td>On cherche une solution ensemble</td><td>On cherche à gagner</td></tr>
<tr><td>On reste sur le sujet du jour</td><td>On ressort tout le passé</td></tr>
<tr><td>On fait une pause si ça monte trop</td><td>On pousse jusqu'à l'explosion</td></tr>
<tr><td>On se réconcilie en ayant avancé</td><td>On se réconcilie sans rien résoudre</td></tr>
<tr><td>Le respect reste, même dans la colère</td><td>Les insultes et le mépris sortent</td></tr>
</tbody></table>
<p>Tu peux être en colère, hausser le ton, être exaspéré. Mais le respect de l'autre ne disparaît pas parce que tu es énervé : pas d'insultes, pas de mépris, pas de phrase faite pour blesser, du genre « de toute façon t'es comme ta mère ». La dispute se règle, les mots restent. Si tu sens que tu vas dire quelque chose que tu regretteras, sors de la pièce cinq minutes. Et si c'est l'autre qui franchit cette ligne régulièrement, ce n'est plus une dispute, c'est <a href="/blog/choses-pas-accepter-couple/">quelque chose qu'on n'a pas à accepter</a>.</p>
<p>Le changement le plus dur à faire, c'est d'arrêter de vouloir gagner. Dans un couple, quand l'un gagne et l'autre perd, les deux perdent : tu as eu le dernier mot, mais l'autre se sent humilié, et le fossé s'est élargi.</p>`,
    },
    {
      id: 'erreurs-classiques',
      title: "Les quatre erreurs qui aggravent tout",
      content: `<p>On fait tous les mêmes bêtises. Pas par méchanceté, par réflexe.</p>
<p><strong>Crier :</strong> quand tu cries, tu ne communiques plus, tu intimides. Le cerveau de l'autre passe en mode défense, il ne retient rien de ce que tu dis, et vous finissez épuisés sans avoir avancé d'un centimètre. Si ta voix monte, c'est le signal que l'émotion a pris le dessus : c'est le moment de faire une pause, pas de monter d'un cran.</p>
<p><strong>Le mur du silence :</strong> se fermer, quitter la pièce sans un mot, ignorer l'autre pendant des heures ou des jours. Les chercheurs appellent ça le stonewalling, et c'est l'un des comportements qui prédisent le mieux une rupture. Il y a une différence entre « j'ai besoin d'une heure pour me calmer, on en reparle après » et disparaître deux jours : le premier est une pause, le second une punition.</p>
<p><strong>Ressortir le passé :</strong> « et la fois où tu avais oublié mon anniversaire… ». Ça dit à l'autre que rien n'est jamais vraiment pardonné, que chaque erreur est stockée pour servir d'arme plus tard. Résultat, il arrête de s'excuser sincèrement, puisque ça ne sert à rien. Une dispute porte sur un sujet, maintenant. Un vieux problème jamais réglé mérite sa propre conversation.</p>
<p><strong>Menacer de rompre :</strong> « si c'est comme ça, on se sépare ». Même sans le penser, tu utilises la relation elle-même comme arme, et à force, soit l'autre finit par te prendre au mot, soit il arrête de te croire. Si tu penses vraiment à la rupture, ça se dit à froid, pas en pleine dispute. Si tu ne le penses pas, arrête de le dire.</p>`,
    },
    {
      id: 'methode-dispute-constructive',
      title: "Comment bien se disputer : la méthode DESC",
      content: `<p>Maintenant qu'on sait ce qu'il ne faut pas faire, voici ce qui marche. C'est inspiré de la communication non violente, mais adapté à la vraie vie, parce que quand tu es énervé, tu n'as pas envie d'ouvrir un manuel.</p>
<p><strong>D, décrire la situation :</strong> sans interpréter ni accuser. « Hier soir, tu es rentré à 22 h sans me prévenir », au lieu de « tu te fous complètement de moi ».</p>
<p><strong>E, exprimer ce que tu ressens :</strong> avec « je ». « Je me suis senti inquiet et pas respecté », au lieu de « tu es irrespectueux ». La première phrase ouvre une discussion, la seconde déclenche une défense.</p>
<p><strong>S, spécifier ce que tu attends :</strong> du concret. Pas « fais des efforts », ça ne veut rien dire. Plutôt « la prochaine fois, envoie-moi un message si tu rentres après 21 h ».</p>
<p><strong>C, les conséquences positives :</strong> ce que ça changera pour vous deux. « Comme ça, je ne m'inquiète pas, et tu rentres dans une maison calme. » Ce n'est pas un caprice, c'est une demande qui sert le couple.</p>
<p>Ça a l'air simple, et ça l'est. Mais ça demande un effort, parce que le réflexe en conflit, c'est d'accuser, pas de décrire.</p>
<p>Le mieux, c'est de poser quelques règles quand tout va bien, pas en pleine dispute. Celles qui servent dans beaucoup de couples :</p>
<ul>
<li><strong>Pas d'insultes, jamais :</strong> c'est la seule règle qui ne se discute pas.</li>
<li><strong>Le droit au temps mort :</strong> chacun peut demander une pause de vingt minutes, et l'autre la respecte sans discuter.</li>
<li><strong>Pas devant les enfants :</strong> si vous en avez.</li>
<li><strong>On ne se couche pas sans avoir désamorcé :</strong> pas forcément tout réglé, mais au moins « on s'aime, on en reparle demain ».</li>
<li><strong>Une dispute, un sujet :</strong> si un autre sujet surgit, on le note pour plus tard.</li>
</ul>
<p>Et la partie que tout le monde zappe : écouter. Pendant une dispute, on est tellement occupé à préparer sa réplique qu'on n'entend pas ce que l'autre dit. Reformuler, « si je comprends bien, tu te sens mis de côté quand je décide sans te consulter ? », prend trois secondes et change toute la dynamique : l'autre se sent entendu, la tension baisse. Surtout quand ce qu'il dit te paraît injuste. Écoute d'abord, reformule, et seulement ensuite donne ta version. Dans cet ordre.</p>`,
    },
    {
      id: 'sujets-frequents',
      title: "Les sujets qui reviennent dans tous les couples",
      content: `<p>On se dispute rarement sur des choses imprévisibles. Les mêmes sujets reviennent partout, et les connaître, c'est déjà savoir que ton couple n'est pas « pire » que les autres.</p>
<p><strong>L'argent :</strong> le sujet numéro un, toutes études confondues, et ce n'est presque jamais une question d'argent : c'est une question de priorités et de contrôle. L'un veut épargner, l'autre profiter ; l'un trouve que l'autre dépense trop, l'autre se sent surveillé. Ça se règle en en parlant à froid, chiffres sur la table, en décidant ce qui est commun et ce qui est perso, pas quand la facture vient d'arriver.</p>
<p><strong>Les tâches ménagères et la charge mentale :</strong> et honnêtement, en tant que mec, je sais qu'on est souvent en tort sur ce sujet, pas par mauvaise volonté, mais parce qu'on ne voit pas ce qu'on ne fait pas. Quand ta partenaire dit « tu ne fais jamais rien à la maison », elle ne parle pas que du ménage : elle dit qu'elle <a href="/blog/charge-mentale-couple/">pense à tout, planifie tout et rappelle tout</a>, et qu'elle est épuisée. Fais une liste honnête de qui fait quoi, pas de ce que tu crois faire, de ce que tu fais. Le résultat est souvent éclairant.</p>
<p><strong>La jalousie :</strong> un peu, c'est humain. Quand ça devient un sujet de dispute récurrent, c'est rarement un problème de comportement, c'est <a href="/test-confiance-couple/">un problème de confiance</a>, soit parce qu'elle a été cassée, soit parce qu'une insécurité personnelle n'a rien à voir avec ce que l'autre fait. Dans les deux cas, crier plus fort ou poser plus d'interdits ne règle rien.</p>
<p><strong>La famille et la belle-famille :</strong> ta mère a un avis sur tout, sa sœur s'invite tous les week-ends. Ces disputes sont parmi les plus explosives, parce qu'elles touchent à la loyauté. La règle qui évite la plupart des dégâts : chacun gère sa propre famille. Si ta mère pose un problème à ta partenaire, c'est à toi de poser la limite, pas à elle de se battre seule contre ta famille.</p>`,
    },
    {
      id: 'quand-disputes-vrai-probleme',
      title: "Quand les disputes deviennent un vrai problème",
      content: `<p>Tout ce qui précède suppose que les disputes restent gérables. Parfois, elles ne le sont plus, et ça se voit :</p>
<ul>
<li><strong>Toujours les mêmes sujets, jamais de solution :</strong> vous tournez en boucle depuis des mois.</li>
<li><strong>Tout dégénère :</strong> chaque petite friction finit en explosion, impossible de discuter calmement de quoi que ce soit.</li>
<li><strong>Le mépris s'est installé :</strong> soupirs, yeux au ciel, sarcasme permanent. Quand le mépris remplace la frustration, le respect a disparu.</li>
<li><strong>Tu as peur de déclencher une dispute :</strong> tu marches sur des œufs, tu te censures. Ce n'est plus une relation, c'est de la survie.</li>
</ul>
<p>Si tu te reconnais dans plusieurs de ces points, prends du recul et regarde si <a href="/test-couple-toxique/">on est dans le pénible ou dans le toxique</a>. Et consulter un thérapeute de couple n'est pas « le début de la fin » : c'est comme aller chez le médecin quand on est malade. Le bon moment, c'est avant que la situation soit désespérée, pas quand tu as déjà un pied dehors.</p>
<p>Une dernière chose, sans détour : une dispute ne justifie jamais la violence, ni physique, ni verbale, ni psychologique. Si ton ou ta partenaire te frappe, te menace, casse des objets, t'insulte à répétition ou te fait vivre dans la peur, ce n'est pas un problème de communication, c'est de la violence conjugale, et « c'est toi qui m'as poussé à bout » est la phrase classique de celui qui frappe. Le 3919 est le numéro d'aide aux victimes, gratuit et confidentiel, tous les jours.</p>
<a href="/blog/sauver-son-couple/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lire aussi</span><span class="blog-read-also-title">Comment sauver son couple quand tout semble perdu</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
