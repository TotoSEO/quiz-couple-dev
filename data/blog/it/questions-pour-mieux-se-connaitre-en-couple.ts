import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'domande-per-conoscersi-meglio',
  title: "60 domande per conoscervi meglio, anche se credete di sapere tutto",
  metaTitle: "Conoscersi meglio in coppia: 60 domande da farsi in due",
  metaDescription: "Dopo anni insieme si crede di aver visto tutto. Errore! 60 domande da farvi in due per verificarlo... e riscoprirvi lungo la strada.",
  featuredImage: '/blog/questions-pour-mieux-se-connaitre-en-couple.webp',
  featuredImageAlt: "Coppia seduta schiena contro schiena con punti interrogativi e cuori sopra di loro",
  publishedAt: '2026-10-10T13:37:00+02:00',
  author: AUTHORS['thomas'],
  excerpt: "Non si finisce mai di scoprirsi, si smette solo di cercare. Queste 60 domande fanno ripartire la ricerca, in due.",
  introduction: `<p>Fai l'esperimento un giorno: chiedi a una coppia insieme da dieci anni se si conoscono a memoria. Diranno di sì, ovviamente. Poi fai loro tre domande un po' precise, il sogno che lui ha abbandonato, la paura che lei non dice mai, cosa ciascuno crede che l'altro pensi di lui... e guarda le facce. C'è sempre una sorpresa. Sempre!</p>
<p><strong>Perché non si finisce mai di conoscere qualcuno. Si smette solo di cercare, ed è molto diverso.</strong> La buona notizia è che la curiosità si riaccende: basta rifare domande vere e ascoltare le risposte come il primo giorno.</p>
<p>Queste 60 domande si fanno IN DUE: ciascuno risponde a ogni domanda, a turno. È la regola del gioco, ed è lei a cambiare tutto, perché si scopre tanto rispondendo quanto ascoltando. Cinque temi, dal passato al futuro. Mettetevi comodi.</p>`,
  quickSummary: [
    "60 domande da farsi IN DUE: ciascuno risponde, a turno.",
    "Cinque temi: le vostre radici, il vostro quotidiano, le vostre profondità, la vostra coppia, i vostri desideri.",
    "La regola d'oro: la risposta dell'altro non si commenta, si approfondisce.",
    "Contate le sorprese lungo la strada... è il vostro punteggio di riscoperta.",
    "Dieci domande a serata bastano. Il gioco deve durare, non esaurirsi.",
  ],
  sections: [
    {
      id: 'le-vostre-radici',
      title: "Le vostre radici: da dove venite ciascuno (1-12)",
      content: `<p>Si comincia dal passato, perché è lì che si nascondono le sorprese più grosse... anche dopo anni.</p>
<ol>
<li>Qual è il tuo primissimo ricordo felice?</li>
<li>Cosa facevi a 10 anni quando eri davvero te stesso?</li>
<li>Quale abitudine della tua famiglia hai riprodotto senza accorgertene?</li>
<li>E da quale sei fuggito di proposito?</li>
<li>Chi ti ha segnato di più a parte i tuoi genitori?</li>
<li>Qual è la marachella d'infanzia che non hai mai confessato?</li>
<li>Quale momento della tua adolescenza ti ha costruito?</li>
<li>Cosa avresti voluto che ti dicessero prima?</li>
<li>Qual è stata la tua prima delusione d'amore, e cosa ti ha lasciato?</li>
<li>Di cosa sei più fiero del tuo percorso, prima di noi?</li>
<li>Quale versione di te di prima avrei adorato conoscere?</li>
<li>E quale versione di te di prima preferisci che non abbia conosciuto?</li>
</ol>`,
    },
    {
      id: 'il-vostro-quotidiano',
      title: "Il vostro presente: la vostra vita di tutti i giorni (13-24)",
      content: `<p>Il quotidiano si crede di condividerlo, ma ciascuno lo vive dal suo lato. Verifica.</p>
<ol start="13">
<li>Qual è il tuo momento preferito delle nostre giornate normali?</li>
<li>Cosa ti pesa in questo momento, anche una piccola cosa?</li>
<li>Di cosa hai bisogno dopo una brutta giornata: parlare, silenzio o un abbraccio?</li>
<li>Cosa fai quando non ci sono che io non sospetto?</li>
<li>Qual è il tuo vero rapporto col lavoro, in questo periodo?</li>
<li>Cosa ti fa piacere delle settimane che arrivano?</li>
<li>Diresti che dormi bene, davvero?</li>
<li>Cosa ti manca nella tua vita attuale, a prescindere da noi?</li>
<li>Qual è il tuo equilibrio ideale tra tempo insieme e tempo per te?</li>
<li>Quale amicizia conta di più per te in questo momento?</li>
<li>Cosa vorresti che notassi più spesso?</li>
<li>Se domani fosse una giornata perfettamente ordinaria ma riuscita, come sarebbe?</li>
</ol>`,
    },
    {
      id: 'le-vostre-profondita',
      title: "Le vostre profondità: quello che non si chiede mai (25-36)",
      content: `<p>La serie delle grandi conversazioni. Un tema a serata, non di più... e lasciate respirare le risposte.</p>
<ol start="25">
<li>Di cosa hai paura e non dici mai ad alta voce?</li>
<li>Cosa credi che io pensi di te... e che forse è falso?</li>
<li>Qual è la tua definizione di una vita riuscita, la tua, non quella degli altri?</li>
<li>Su cosa hai cambiato idea in questi cinque anni?</li>
<li>Cosa ti fa sentire vivo, davvero?</li>
<li>Qual è la ferita che ti ha insegnato di più?</li>
<li>Cosa non hai mai osato chiedere a nessuno?</li>
<li>Davanti a cosa ti senti impotente, e come ci convivi?</li>
<li>Cosa vorresti che capissi di te senza spiegazioni?</li>
<li>Quale sogno hai messo in un cassetto, e ci è ancora?</li>
<li>Cosa ti farebbe piangere di gioia, sinceramente?</li>
<li>Se potessi fare una sola domanda alla tua vita... quale sarebbe?</li>
</ol>
<aside class="blog-tip-box">
<p class="blog-tip-box-title">📌 La regola che protegge questa serie</p>
<p>Quello che l'altro confida qui non riesce MAI durante un litigio. Mai. È il contratto implicito delle conversazioni vere: se una confidenza diventa una munizione, era l'ultima. Proteggete quello che raccogliete qui... è il tesoro del gioco.</p>
</aside>`,
    },
    {
      id: 'la-vostra-coppia',
      title: "La vostra coppia, vista dall'interno (37-48)",
      content: `<p>Ora che siamo riscaldati... parliamo di voi. Queste domande fanno il punto senza fare il processo, ed è tutta la loro arte.</p>
<ol start="37">
<li>Qual è il nostro risultato più bello, noi due?</li>
<li>Quale momento della nostra storia rivivresti tale e quale?</li>
<li>Cosa ti ha fatto restare, nei momenti meno facili?</li>
<li>Qual è il mio modo di amarti che preferisci?</li>
<li>E quale ti manca un po', a volte?</li>
<li>Cosa facciamo meglio della maggior parte delle coppie, secondo te?</li>
<li>E cosa potremmo chiaramente migliorare?</li>
<li>Di cosa sei fiero quando parli di noi agli altri?</li>
<li>Qual è il rituale nostro che non vuoi perdere mai?</li>
<li>Quale litigio, col senno di poi, era completamente assurdo?</li>
<li>Cosa ti ha insegnato su di te la nostra coppia?</li>
<li>Se la nostra storia fosse un libro, a quale capitolo saremmo?</li>
</ol>`,
    },
    {
      id: 'i-vostri-desideri',
      title: "I vostri desideri e il seguito (49-60)",
      content: `<p>Finiamo rivolti in avanti. Queste dodici domande disegnano il seguito... e spesso riservano le sorprese più belle del gioco.</p>
<ol start="49">
<li>Cosa hai voglia che osiamo, che non abbiamo mai osato?</li>
<li>Qual è la tua fantasia di viaggio, anche irrealistica?</li>
<li>Cosa vorresti imparare, e se lo imparassimo insieme?</li>
<li>La nostra vita tra cinque anni, disegnamela in trenta secondi.</li>
<li>Cosa dovremmo fare di meno, tutti e due?</li>
<li>E cosa dovremmo fare di più?</li>
<li>Qual è il progetto che ti farebbe dire «dai, si parte»?</li>
<li>Cosa ti aspetti da noi per l'anno che viene?</li>
<li>Quale tradizione dovremmo inventare, solo nostra?</li>
<li>Cosa vuoi che ci promettiamo, qui, adesso?</li>
<li>Qual è la prossima grande conversazione che dobbiamo avere?</li>
<li>E la domanda 61... qual è? Tocca a te inventarla.</li>
</ol>`,
    },
    {
      id: 'trasformare-la-prova',
      title: "E adesso, trasformate la prova",
      content: `<p>Se avete giocato fin qui, avete raccolto delle sorprese, garantito. Tenete il riflesso: dieci domande a serata, una volta al mese, e la vostra coppia non ricadrà mai nel pilota automatico. È esattamente lo stesso principio delle grandi serate di <a href="/it/domande-coppia/">domande per coppie</a>... con l'abitudine in più.</p>
<p>Resta una cosa divertente da fare con tutto quello che avete appena imparato. Credete di aver ascoltato bene l'altro? Davvero bene?</p>
<div><table><thead><tr><th>Il territorio</th><th>Cosa ci si trova</th></tr></thead><tbody>
<tr><td>Le vostre radici</td><td>Ciò che ha fabbricato i suoi riflessi, molto prima di te</td></tr>
<tr><td>Il vostro quotidiano</td><td>Le piccole cose che pesano e non si dicono</td></tr>
<tr><td>Le vostre profondità</td><td>Le paure e gli orgogli che non escono mai da soli</td></tr>
<tr><td>La vostra coppia</td><td>La vostra storia, raccontata dall'altro</td></tr>
<tr><td>I vostri desideri</td><td>Quello che ciascuno spera ancora e non ha mai formulato</td></tr>
</tbody></table></div>
<div class="blog-cta">
<p class="blog-cta-titre">Dimostrate di aver ascoltato</p>
<p class="blog-cta-texte">Il quiz «chi conosce meglio l'altro» trasforma le vostre scoperte in una sfida: ciascuno risponde, si confronta, e si vede chi ha davvero fatto attenzione durante tutte quelle conversazioni. Rivincita ammessa il mese prossimo.</p>
<a class="blog-cta-btn" href="/it/quiz-chi-conosce-meglio-partner/">Lanciare la sfida</a>
<p class="blog-cta-note">Gratis &middot; Senza registrazione &middot; Da giocare in due</p>
</div>
<p>E se queste serate di domande diventano il vostro rituale preferito, c'è di che tenere per mesi: le <a href="/it/blog/domande-da-fare-al-tuo-ragazzo/">100 domande lato lui</a> per lei, le <a href="/it/blog/domande-da-fare-alla-tua-ragazza/">domande da fare alla tua ragazza</a> per lui... e il livello sopra quando sarete pronti, ma quello lo scoprirete da soli.</p>
<a href="/it/blog/domande-intime-di-coppia/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Leggi anche</span><span class="blog-read-also-title">65 domande intime da fare al tuo partner, dalle più dolci alle più osate</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
