import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'ragazzo-non-si-impegna',
  title: "Il mio ragazzo non si impegna: cosa significa e cosa fare",
  metaTitle: "Il mio ragazzo non si impegna: cosa fare",
  metaDescription: "Fai tutto tu, lui niente. O quasi. Perché certi uomini smettono di impegnarsi, come riconoscerlo, cosa significa e cosa fare concretamente.",
  featuredImage: '',
  featuredImageAlt: "Tavola apparecchiata per due, un coperto curato con candela e fiori, l'altro posto lasciato vuoto",
  publishedAt: '2026-03-08',
  author: AUTHORS['thomas'],
  excerpt: "Lo squilibrio di impegno in una coppia è una delle cause più frequenti di rottura, proprio perché si installa progressivamente e tendiamo ad adattarci prima di renderci conto di quanto pesi.",
  introduction: `<p>Organizzi tu, anticipi tu, pensi a tutto tu. Le uscite, i regali, i momenti insieme, le conversazioni importanti. E lui è lì, risponde quando proponi, partecipa quando insisti, ma niente viene davvero da lui. Hai la sensazione di <a href="/it/test-relazione-sana/">portare la relazione sulle spalle</a> da un po', e inizi a chiederti se è normale, se chiedi troppo, o se qualcosa non va davvero.</p>
<p>Non sei tu che esageri. <strong>Lo squilibrio di impegno in una coppia è una delle cause più frequenti di rottura, proprio perché si installa progressivamente e tendiamo ad adattarci prima di renderci conto di quanto pesi.</strong> Questo articolo è qui per mettere parole su quello che senti, capire cosa sta succedendo davvero, e decidere cosa fare.</p>`,
  quickSummary: [
    "Lo squilibrio di impegno si installa progressivamente e peggiora se non viene affrontato.",
    "Esistono diverse ragioni: effetto \"conquistato\", incomprensione dei tuoi bisogni, calo dell'investimento emotivo, o modo di funzionare radicato.",
    "No, non chiedi troppo. Volere che il tuo partner pensi a te spontaneamente è un bisogno relazionale normale.",
    "Come parlargliene: parlare di quello che senti tu, essere precisa su quello che ti aspetti, scegliere il momento giusto.",
    "Cosa può cambiare con una conversazione onesta, e cosa non cambierà senza un lavoro profondo da parte sua.",
  ],
  sections: [
    {
      id: 'segnali-in-sintesi',
      title: "I segnali in sintesi",
      content: `<div><table><thead><tr><th>Quello che osservi</th><th>Quello che può significare</th></tr></thead><tbody>
<tr><td>Sei sempre tu a proporre cose da fare</td><td>Lui aspetta, non crea. La relazione si regge su di te.</td></tr>
<tr><td>Dimentica le date importanti</td><td>Non sei una priorità nella sua organizzazione mentale.</td></tr>
<tr><td>L'impegno si è fermato dopo la fase di conquista</td><td>Si impegnava per conquistarti, non per la relazione.</td></tr>
<tr><td>Non cerca di farti del bene in modo spontaneo</td><td>L'attenzione consapevole è scomparsa. Non è cattiveria, ma è reale.</td></tr>
<tr><td>Quando gliene parli, promette, ma niente cambia</td><td>Sente il messaggio ma non sente l'urgenza di agire.</td></tr>
<tr><td>Ti senti sola nella relazione</td><td>La presenza fisica non sostituisce l'investimento emotivo.</td></tr>
<tr><td>Si impegna per gli amici e il lavoro, ma non per te</td><td>La capacità c'è. La motivazione no.</td></tr>
</tbody></table></div>`,
    },
    {
      id: 'perche-gli-uomini-smettono',
      title: "Perché gli uomini smettono di impegnarsi",
      content: `<p>La prima cosa da capire è che "non si impegna" copre realtà molto diverse a seconda della situazione. Ci sono diverse ragioni possibili, e non tutte hanno le stesse implicazioni per te.</p>`,
      subsections: [
        {
          id: 'effetto-conquistato',
          title: "L'effetto \"conquistato\"",
          content: `<p>È il caso più frequente e, in un certo senso, il più banale. All'inizio di una relazione, entrambi i partner sono in modalità conquista: si fa attenzione, si pianifica, si cerca di piacere. Poi la relazione si stabilizza, la sicurezza arriva con lei, e l'impegno consapevole scompare progressivamente. Non per indifferenza, ma per comodità. Il problema è che questo allentamento è spesso asimmetrico: tu continui, lui si lascia trasportare. <strong>Non ti vuole meno, ha solo smesso di mostrarlo.</strong> È un problema reale anche se non è la stessa cosa dell'indifferenza deliberata.</p>`,
        },
        {
          id: 'non-si-rende-conto',
          title: "Non si rende conto di quello che fai",
          content: `<p>Molti uomini non sono consapevoli del carico invisibile che porta la loro partner. Gli anniversari ricordati, le prenotazioni fatte, le attenzioni pianificate, le conversazioni avviate, tutto questo passa spesso inosservato proprio perché funziona. Quando qualcuno gestisce bene le cose, l'altro non vede il lavoro dietro. Non è una scusa, è un meccanismo che vale la pena conoscere per sapere come parlarne.</p>`,
        },
        {
          id: 'non-sa-cosa-significa',
          title: "Non sa cosa significa \"impegnarsi\" per te",
          content: `<p>I linguaggi dell'amore non sono universali. Lui forse pensa di impegnarsi: è fedele, è presente, non si lamenta, porta stabilità. Tu hai bisogno di attenzioni concrete, di momenti pianificati, di gesti che mostrino che pensa a te al di fuori di quando siete insieme. Queste due visioni sono compatibili, ma solo se vengono espresse chiaramente. Una coppia può andare avanti a lungo con questo malinteso senza che nessuno dei due capisca davvero cosa manca all'altro.</p>`,
        },
        {
          id: 'ha-perso-la-voglia',
          title: "Ha perso la voglia, senza necessariamente rendersene conto",
          content: `<p>Questa è la versione più difficile da sentire. A volte la mancanza di impegno non è una svista né un malinteso, è il segnale che il suo investimento emotivo nella relazione è calato. Non necessariamente che voglia andarsene, ma che qualcosa si è spento senza che l'abbia verbalizzato, forse senza che l'abbia nemmeno interiorizzato lui stesso. Questo caso merita una vera conversazione, non l'ennesimo promemoria sulle date di anniversario.</p>`,
        },
        {
          id: 'il-suo-modo-di-funzionare',
          title: "È il suo modo di funzionare, in tutte le sue relazioni",
          content: `<p>Certi uomini non hanno mai imparato a esprimere il loro coinvolgimento attraverso atti concreti. Nessun modello familiare in quel senso, nessuna abitudine culturale sviluppata, nessun riflesso costruito. È diverso dalla mancanza di voglia, ma produce lo stesso risultato per te. La differenza è che in questo caso il cambiamento è possibile, ma richiede un lavoro reale da parte sua, non solo buona volontà occasionale.</p>`,
        },
      ],
    },
    {
      id: 'non-chiedi-troppo',
      title: "No, non chiedi troppo",
      content: `<p>È spesso la prima cosa che ci diciamo in questa situazione: "forse mi aspetto troppo, forse sono troppo esigente". È un pensiero naturale, e dice qualcosa di importante su di te, che ti metti in discussione prima di accusare. Ma nella grande maggioranza dei casi, le donne che si fanno questa domanda non chiedono troppo. Chiedono quello che è ragionevole in una <a href="/it/blog/cose-non-accettare-coppia/">relazione adulta ed equilibrata</a>.</p>
<p>Voler che il tuo partner pensi a te di tanto in tanto senza che tu glielo abbia chiesto, voler che prenda iniziative, voler sentire che conti nei suoi pensieri al di fuori di quando sei fisicamente davanti a lui, <strong>sono bisogni relazionali normali, non capricci.</strong> La domanda non è se hai il diritto di averli. La domanda è se lui è capace di soddisfarli, e se lo vuole fare.</p>
<p>C'è una differenza tra un uomo che non sa ancora come mostrarti che ci tiene, e un uomo che lo sa ma non lo fa. E tra i due c'è una conversazione da avere.</p>`,
    },
    {
      id: 'come-parlargliene',
      title: "Come parlargliene senza che diventi una lite",
      content: `<p>La maggior parte delle conversazioni su questo argomento finiscono male perché iniziano male. "Non fai mai niente" scatena una difesa immediata. "Non ti impegni in questa relazione" suona come un'accusa a cui risponderà con un contrattacco o con il silenzio. Non è che abbia torto a sentirsi attaccato, è che il formato non crea le condizioni perché senta davvero quello che stai dicendo.</p>
<p>Cosa funziona meglio: parlare di quello che senti tu, non di quello che lui fa o non fa. "Mi sono sentita sola nella nostra organizzazione comune ultimamente" atterra diversamente da "non ti impegni mai". Non è una tecnica di manipolazione, semplicemente la prima frase apre una conversazione e la seconda apre un processo.</p>
<p>Alcuni punti concreti per far sì che vada meglio:</p>
<p>Scegli un momento tranquillo, non subito dopo una frustrazione fresca. Una conversazione iniziata nel momento in cui hai appena organizzato tutto da sola per la terza volta di fila ha poche possibilità di andare serenamente. Aspetta un momento in cui state bene entrambi.</p>
<p>Sii precisa su quello che ti aspetti. "Impegnarsi" è vago. "Mi piacerebbe che tu proponessi di uscire insieme una volta a settimana, che ti ricordassi del mio appuntamento importante di giovedì e me ne chiedessi dopo" è attuabile. Più è concreto, più può rispondere a qualcosa di reale.</p>
<p>Ascolta davvero la sua risposta. Forse ha una visione molto diversa di quello che pensa di portare alla relazione. Non per validare quella visione se non ti va bene, ma per capire da dove parte prima di decidere cosa fare.</p>`,
    },
    {
      id: 'cosa-puo-cambiare',
      title: "Cosa può cambiare e cosa probabilmente non cambierà",
      content: `<p>È la parte che molti articoli evitano perché è meno comoda. Ecco quello che si osserva in pratica.</p>
<p><strong>Cosa può cambiare con una vera conversazione:</strong> le dimenticanze per disattenzione, la mancanza di consapevolezza di quello che gestisci, i comportamenti legati a un malinteso sui tuoi bisogni. Molti uomini, quando capiscono davvero cosa manca (non solo che "hanno combinato un casino"), sono capaci di aggiustarsi. Non perfettamente, non dall'oggi al domani, ma davvero.</p>
<p><strong>Cosa cambia raramente senza un lavoro profondo da parte sua:</strong> la mancanza di base di investimento emotivo, i comportamenti che esistono in tutte le sue relazioni e non solo con te, la tendenza a promettere senza agire. Queste cose possono evolversi, ma richiedono che lui identifichi il problema da solo e decida di lavorarci. Non puoi fare quel percorso al posto suo.</p>
<p><strong>Cosa non cambia:</strong> qualcuno che non vede il problema, che minimizza sistematicamente quello che esprimi, che si impegna per due settimane e poi torna esattamente allo stesso punto. <a href="/it/blog/red-flag-in-un-uomo/">Quel pattern ripetuto</a> non è mancanza di competenza, è mancanza di motivazione reale. E questo non lo cambia nessuna conversazione se la voglia non c'è dalla sua parte.</p>`,
    },
    {
      id: 'la-vera-domanda',
      title: "La vera domanda da farsi",
      content: `<p>In fondo, "il mio ragazzo non si impegna" nasconde spesso una domanda più profonda: mi ama davvero, tiene a questa relazione quanto me? È una domanda legittima, e merita una risposta onesta.</p>
<p>Un uomo che tiene davvero a qualcuno cerca naturalmente di mostrarlo. Non in modo stravagante, non continuamente, ma c'è qualcosa. Un'attenzione spontanea di tanto in tanto. Uno sforzo per qualcosa che conta per lei. Il ricordo di quello che le piace. Se tutto questo è assente da molto tempo e dopo averne parlato niente si muove, la domanda non è più "come farglielo capire", ma diventa "voglio continuare a <a href="/it/test-relazione-tossica/">portare questa relazione da sola</a>".</p>
<p>Non è una domanda facile. Ma è quella giusta.</p>`,
    },
  ],
  readAlso: {
    slug: 'red-flag-in-un-uomo',
    title: "Red flag in un uomo",
  },
};

export default article;
