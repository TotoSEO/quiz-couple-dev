import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'questions-pour-mieux-se-connaitre-en-couple',
  title: "60 questions pour mieux vous connaître, même si vous croyez tout savoir",
  metaTitle: "Mieux se connaître en couple : 60 questions à se poser à deux",
  metaDescription: "Après des années ensemble, on croit avoir fait le tour. Erreur ! 60 questions à vous poser à deux pour vérifier... et vous redécouvrir au passage.",
  featuredImage: '/blog/questions-pour-mieux-se-connaitre-en-couple.webp',
  featuredImageAlt: "Couple assis dos à dos avec des points d'interrogation et des cœurs au-dessus d'eux",
  publishedAt: '2026-10-10T13:37:00+02:00',
  author: AUTHORS['thomas'],
  excerpt: "Le jour où on arrête de se poser des questions, on n'a pas fini de se découvrir... on a juste arrêté de chercher.",
  introduction: `<p>Fais l'expérience un jour : demande à un couple installé depuis dix ans s'ils se connaissent par cœur. Ils diront oui, évidemment. Puis pose-leur trois questions un peu précises, le rêve qu'il a abandonné, la peur qu'elle ne dit jamais, ce que chacun croit que l'autre pense de lui... et regarde les visages. Il y a toujours une surprise. Toujours !</p>
<p><strong>Parce qu'on ne finit jamais de connaître quelqu'un. On arrête juste de chercher, et c'est très différent.</strong> La bonne nouvelle, c'est que la curiosité, ça se rallume : il suffit de reposer des vraies questions, et d'écouter les réponses comme au premier jour.</p>
<p>Ces 60 questions se posent À DEUX : chacun répond à chaque question, à tour de rôle. C'est la règle du jeu, et c'est elle qui change tout... parce qu'on découvre autant en répondant qu'en écoutant. Cinq thèmes, du passé à l'avenir. Installez-vous bien.</p>`,
  quickSummary: [
    "60 questions à se poser À DEUX : chacun répond, à tour de rôle.",
    "Cinq thèmes : vos racines, votre quotidien, vos profondeurs, votre couple, vos envies.",
    "La règle d'or : la réponse de l'autre ne se commente pas, elle se creuse.",
    "Comptez les surprises en route... c'est votre score de redécouverte.",
    "Dix questions par soirée suffisent. Le jeu doit durer, pas s'épuiser.",
  ],
  sections: [
    {
      id: 'vos-racines',
      title: "Vos racines : d'où vous venez chacun (1-12)",
      content: `<p>On commence par le passé, parce que c'est là que se cachent les plus grosses surprises... même après des années.</p>
<ol>
<li>C'est quoi ton tout premier souvenir heureux ?</li>
<li>Qu'est-ce que tu faisais à 10 ans quand tu étais vraiment toi ?</li>
<li>Quelle habitude de ta famille tu as reproduite sans t'en rendre compte ?</li>
<li>Et laquelle tu as fuie volontairement ?</li>
<li>Qui t'a le plus marqué en dehors de tes parents ?</li>
<li>C'est quoi la bêtise d'enfance que tu n'as jamais avouée ?</li>
<li>Quel moment de ton adolescence t'a construit ?</li>
<li>Qu'est-ce que tu aurais aimé qu'on te dise plus tôt ?</li>
<li>C'était quoi, ton premier chagrin d'amour, et qu'est-ce qu'il t'a laissé ?</li>
<li>De quoi tu es le plus fier dans ton parcours, avant nous ?</li>
<li>Quelle version de toi d'avant j'aurais adoré connaître ?</li>
<li>Et quelle version de toi d'avant tu préfères que je n'aie pas connue ?</li>
</ol>`,
    },
    {
      id: 'votre-quotidien',
      title: "Votre présent : ce que vous vivez au quotidien (13-24)",
      content: `<p>Le quotidien, on croit le partager... mais chacun le vit de son côté. Vérification.</p>
<ol start="13">
<li>C'est quoi ton moment préféré de nos journées ordinaires ?</li>
<li>Qu'est-ce qui te pèse en ce moment, même petit ?</li>
<li>De quoi tu as besoin après une mauvaise journée : parler, silence, ou câlin ?</li>
<li>Qu'est-ce que tu fais quand je ne suis pas là, que je ne soupçonne pas ?</li>
<li>C'est quoi ta vraie relation avec ton travail, en ce moment ?</li>
<li>Qu'est-ce qui te réjouit dans les semaines qui viennent ?</li>
<li>Tu dirais que tu dors bien, en vrai ?</li>
<li>Qu'est-ce qui te manque dans ta vie actuelle, indépendamment de nous ?</li>
<li>C'est quoi ton équilibre idéal entre temps ensemble et temps à toi ?</li>
<li>Quelle amitié compte le plus pour toi en ce moment ?</li>
<li>Qu'est-ce que tu aimerais que je remarque plus souvent ?</li>
<li>Si demain était une journée parfaitement ordinaire mais réussie... elle ressemblerait à quoi ?</li>
</ol>`,
    },
    {
      id: 'vos-profondeurs',
      title: "Vos profondeurs : ce qu'on ne demande jamais (25-36)",
      content: `<p>La série des grandes conversations. Un thème par soirée, pas plus... et laissez les réponses respirer.</p>
<ol start="25">
<li>De quoi as-tu peur que tu ne dis jamais à voix haute ?</li>
<li>Qu'est-ce que tu crois que je pense de toi... et qui est peut-être faux ?</li>
<li>C'est quoi ta définition d'une vie réussie, la tienne, pas celle des autres ?</li>
<li>Sur quoi as-tu changé d'avis ces cinq dernières années ?</li>
<li>Qu'est-ce qui te fait te sentir vivant, vraiment ?</li>
<li>C'est quoi la blessure qui t'a le plus appris ?</li>
<li>Qu'est-ce que tu n'as jamais osé demander à personne ?</li>
<li>Devant quoi tu te sens impuissant, et comment tu vis avec ?</li>
<li>Qu'est-ce que tu voudrais que je comprenne de toi sans explication ?</li>
<li>Quel rêve as-tu rangé dans un tiroir, et il y est toujours ?</li>
<li>Qu'est-ce qui te ferait pleurer de joie, sincèrement ?</li>
<li>Si tu pouvais poser une seule question à ta vie... ce serait laquelle ?</li>
</ol>
<aside class="blog-tip-box">
<p class="blog-tip-box-title">📌 La règle qui protège cette série</p>
<p>Ce que l'autre confie ici ne ressort JAMAIS en dispute. Jamais. C'est le contrat implicite des vraies conversations : si une confidence devient une munition, c'était la dernière. Protégez ce que vous récoltez là... c'est le trésor du jeu.</p>
</aside>`,
    },
    {
      id: 'votre-couple',
      title: "Votre couple, vu de l'intérieur (37-48)",
      content: `<p>Maintenant qu'on est échauffés... parlons de vous. Ces questions font le point sans faire le procès, et c'est tout leur art.</p>
<ol start="37">
<li>C'est quoi notre plus belle réussite, à nous deux ?</li>
<li>Quel moment de notre histoire tu revivrais tel quel ?</li>
<li>Qu'est-ce qui t'a fait rester, dans les moments moins faciles ?</li>
<li>C'est quoi ma façon de t'aimer que tu préfères ?</li>
<li>Et celle qui te manque un peu, parfois ?</li>
<li>Qu'est-ce qu'on fait mieux que la plupart des couples, à ton avis ?</li>
<li>Et qu'est-ce qu'on pourrait clairement améliorer ?</li>
<li>De quoi tu es fier quand tu parles de nous aux autres ?</li>
<li>C'est quoi le rituel à nous que tu ne veux jamais perdre ?</li>
<li>Quelle dispute, avec le recul, était complètement absurde ?</li>
<li>Qu'est-ce que notre couple t'a appris sur toi ?</li>
<li>Si notre histoire était un livre, on en serait à quel chapitre ?</li>
</ol>`,
    },
    {
      id: 'vos-envies',
      title: "Vos envies et la suite (49-60)",
      content: `<p>On finit tournés vers l'avant. Ces douze questions dessinent la suite... et elles réservent souvent les plus belles surprises du jeu.</p>
<ol start="49">
<li>Qu'est-ce que tu as envie qu'on ose, qu'on n'a jamais osé ?</li>
<li>C'est quoi ton fantasme de voyage, même irréaliste ?</li>
<li>Qu'est-ce que tu voudrais apprendre, et si on l'apprenait ensemble ?</li>
<li>Notre vie dans cinq ans, dessine-la moi en trente secondes.</li>
<li>Qu'est-ce qu'on devrait faire moins, tous les deux ?</li>
<li>Et qu'est-ce qu'on devrait faire plus ?</li>
<li>C'est quoi le projet qui te ferait dire « allez, on y va » ?</li>
<li>Qu'est-ce que tu attends de nous pour l'année qui vient ?</li>
<li>Quelle tradition on devrait inventer, rien qu'à nous ?</li>
<li>Qu'est-ce que tu veux qu'on se promette, là, maintenant ?</li>
<li>C'est quoi la prochaine grande conversation qu'on doit avoir ?</li>
<li>Et la question 61... c'est laquelle ? À toi de l'inventer.</li>
</ol>`,
    },
    {
      id: 'transformer-l-essai',
      title: "Et maintenant, transformez l'essai",
      content: `<p>Si vous avez joué le jeu jusqu'ici, vous avez récolté des surprises, c'est garanti. Gardez le réflexe : dix questions par soirée, une fois par mois, et votre couple ne retombera jamais dans le pilote automatique. C'est exactement le même principe que les grandes soirées de <a href="/questions-couple/">questions pour couple</a>... l'habitude en plus.</p>
<p>Il reste un truc amusant à faire avec tout ce que vous venez d'apprendre. Vous croyez avoir bien écouté l'autre ? Vraiment bien ?</p>
<div><table><thead><tr><th>Le territoire</th><th>Ce qu'on y trouve</th></tr></thead><tbody>
<tr><td>Vos racines</td><td>Ce qui a fabriqué ses réflexes, bien avant toi</td></tr>
<tr><td>Votre quotidien</td><td>Les petites choses qui pèsent et qu'on ne dit pas</td></tr>
<tr><td>Vos profondeurs</td><td>Les peurs et les fiertés qui ne sortent jamais seules</td></tr>
<tr><td>Votre couple</td><td>Votre histoire, racontée par l'autre</td></tr>
<tr><td>Vos envies</td><td>Ce que chacun espère encore, et n'a jamais formulé</td></tr>
</tbody></table></div>
<div class="blog-cta">
<p class="blog-cta-titre">Prouvez que vous avez écouté</p>
<p class="blog-cta-texte">Le quiz « qui connaît le mieux l'autre » transforme vos découvertes en défi : chacun répond, on compare, et on voit qui a vraiment fait attention pendant toutes ces conversations. Revanche autorisée le mois prochain.</p>
<a class="blog-cta-btn" href="/quiz-qui-connait-mieux-partenaire/">Lancer le défi</a>
<p class="blog-cta-note">Gratuit &middot; Sans inscription &middot; À jouer à deux</p>
</div>
<p>Et si ces soirées de questions deviennent votre rituel préféré, il y a de quoi tenir des mois : les <a href="/blog/questions-a-poser-a-son-copain/">100 questions côté copain</a> côté elle, les <a href="/blog/questions-a-poser-a-sa-copine/">questions à poser à sa copine</a> côté lui... et le niveau au-dessus quand vous serez prêts, mais ça, vous le découvrirez tout seuls.</p>
<a href="/blog/questions-intimes-couple/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lire aussi</span><span class="blog-read-also-title">65 questions intimes à poser à son copain, des plus douces aux plus osées</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
