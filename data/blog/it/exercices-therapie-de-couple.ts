import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "esercizi-terapia-di-coppia",
  title: "10 esercizi di terapia di coppia da fare a casa",
  metaTitle: "Esercizi di terapia di coppia: 10 da fare a casa",
  metaDescription: "Dieci esercizi di terapia di coppia da fare a casa: parlare senza interrompersi, la pausa di venti minuti, l'inizio morbido, l'appuntamento della settimana.",
  featuredImage: "/blog/exercices-therapie-de-couple.webp",
  featuredImageAlt: "I due personaggi di Quiz Couple ai due lati di un tavolo di cucina, una clessidra e due tazze tra loro",
  publishedAt: "2027-01-10T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "Dieci esercizi che i terapeuti di coppia danno da fare tra una seduta e l'altra, spiegati passo dopo passo per farli a casa, con o senza terapia.",
  introduction: `<p>Gli esercizi di terapia di coppia sono cose da fare in due, a casa vostra, per imparare a parlarvi in un altro modo. I terapeuti li danno tra una seduta e l'altra, perché è a casa che la coppia cambia, non nello studio. E <strong>la maggior parte si può fare senza terapia</strong>, a patto di essere in due a voler provare.</p>
<p>Eccone dieci, tra i più usati, con il modo di farli. Cominciate da uno solo. Quello che vi parla di più, o quello che vi fa più paura, spesso è lo stesso.</p>`,
  quickSummary: [
    "Gli esercizi più efficaci sono semplicissimi: parlare a turno, riformulare, dirsi una cosa positiva al giorno.",
    "La pausa di venti minuti durante un litigio viene dal metodo Gottman: oltre un certo livello di stress non si sente più niente.",
    "Il modo di cominciare una conversazione difficile decide spesso come finisce: si allena come un gesto sportivo.",
    "Un appuntamento fisso ogni settimana, solo per parlare della coppia, evita che gli argomenti si accumulino fino all'esplosione.",
    "Un esercizio fatto due volte non serve a niente. Scegline uno, tienilo per tre settimane, e solo dopo aggiungine un altro.",
  ],
  sections: [
    {
      id: "i-10-esercizi",
      title: "I 10 esercizi",
      content: `<ol class="blog-liste-reperes">
<li><a href="#parlare-a-turno">Parlare a turno, e riformulare</a></li>
<li><a href="#la-pausa-di-venti-minuti">La pausa di venti minuti</a></li>
<li><a href="#l-inizio-morbido">L'inizio morbido</a></li>
<li><a href="#una-cosa-al-giorno">Una cosa apprezzata al giorno</a></li>
<li><a href="#la-conversazione-di-decompressione">La conversazione di decompressione</a></li>
<li><a href="#il-rito-del-ritorno">Il rito del ritorno a casa</a></li>
<li><a href="#le-domande">Le domande che non ci si fa più</a></li>
<li><a href="#l-appuntamento-della-settimana">L'appuntamento della settimana</a></li>
<li><a href="#le-frasi-che-disinnescano">Le frasi che disinnescano</a></li>
<li><a href="#la-richiesta-della-settimana">La richiesta della settimana</a></li>
</ol>`,
    },
    {
      id: "parlare-a-turno",
      title: "1. Parlare a turno, e riformulare",
      content: `<p>È l'esercizio di base, quello che quasi tutti i terapeuti fanno fare fin dalla prima seduta. Scegliete un argomento che fa litigare, non il peggiore, uno medio. Uno parla per tre o cinque minuti, senza essere interrotto. Non una parola, non un sospiro, non un "sì ma". Poi <strong>l'altro riformula quello che ha capito</strong>, con parole sue: "se ho capito bene, quello che ti ha ferita è che non abbia avvisato". Il primo conferma o corregge. E solo dopo si scambiano i ruoli.</p>
<p>Sembra una sciocchezza, ed è tremendamente difficile. La prima volta vi interromperete dopo quaranta secondi. E scoprirete che spesso rispondevate a una frase che l'altro non aveva detto. I terapeuti che usano la tecnica di chi parla e chi ascolta a turno la applicano dagli anni Novanta, proprio perché rompe questo riflesso.</p>`,
    },
    {
      id: "la-pausa-di-venti-minuti",
      title: "2. La pausa di venti minuti",
      content: `<p>Quando un litigio sale, il corpo lo segue: il cuore accelera, le mani si irrigidiscono, e da un certo punto in poi non si sente più quello che dice l'altro, ci si limita a difendersi. John Gottman l'ha misurato nel suo laboratorio mettendo dei sensori a coppie che litigavano. <strong>Oltre un certo ritmo cardiaco, discutere non serve più a niente.</strong></p>
<p>L'esercizio: concordate a freddo una parola o un gesto che vuol dire "pausa". Quando uno dei due lo fa, la discussione si ferma, senza discutere. Ognuno va per conto suo per almeno venti minuti, e fa qualcosa di diverso dal rimuginare: camminare, leggere, mettere in ordine. Poi riprendete, e il più delle volte la conversazione è diventata possibile. Quello che non funziona è andarsene sbattendo la porta senza dire quando si torna: per l'altro non è una pausa, è un abbandono.</p>`,
      tip: "La pausa funziona solo se chi la chiede torna. Dite subito \"ne riparliamo tra mezz'ora\" o \"stasera dopo cena\". Una pausa senza orario di ritorno è una fuga.",
    },
    {
      id: "l-inizio-morbido",
      title: "3. L'inizio morbido",
      content: `<p>Nelle sue osservazioni, Gottman ha notato che il modo in cui comincia una conversazione prevede molto bene come finisce: una discussione che si apre con un attacco finisce quasi sempre male, anche se uno dei due poi si sforza.</p>
<p>L'esercizio consiste nell'allenare la prima frase come si allena un gesto nello sport. La forma che funziona è sempre la stessa: <strong>cosa provo, a proposito di cosa, e di cosa ho bisogno</strong>. "Mi sento sola quando torni e vai dritto al telefono. Avrei bisogno di dieci minuti con te prima." Confrontalo con "sei di nuovo al telefono, ovviamente". L'argomento è lo stesso; il seguito non lo sarà.</p>
<p>Allenatevi a freddo, su argomenti che non fanno ancora litigare, perché la forma diventi un riflesso il giorno in cui conta.</p>`,
    },
    {
      id: "una-cosa-al-giorno",
      title: "4. Una cosa apprezzata al giorno",
      content: `<p>Le coppie che stanno bene si dicono molte più cose positive che negative, anche quando litigano. Quelle che stanno male hanno perso l'abitudine: dopo qualche anno non si nota più quello che l'altro fa bene, solo quello che dimentica.</p>
<p>L'esercizio è semplicissimo: ogni giorno, ognuno dice all'altro una cosa che ha apprezzato. Piccola. "Grazie per aver preso il pane", "mi è piaciuto che tu abbia chiamato mia madre", "eri divertente stasera". Niente "ma" dopo. Fatelo per tre settimane, e vedrete che ricomincerete a guardare l'altro in un altro modo, perché la sera cercate qualcosa da dire.</p>`,
    },
    {
      id: "la-conversazione-di-decompressione",
      title: "5. La conversazione di decompressione",
      content: `<p>Ancora un esercizio del metodo Gottman, e uno dei più facili da mettere in pratica. Ogni giorno, per quindici o venti minuti, ognuno racconta cosa l'ha stressato nella giornata. Il lavoro, il traffico, un collega, i figli. Con una regola: <strong>l'altro ascolta e sostiene, non dà consigli</strong>. Niente "bastava dirgli che...". Solo "che palle", "ti capisco", "ha fatto davvero così?".</p>
<p>Cambia due cose. Primo, lo stress di fuori non ricade più sulla coppia. Secondo, ricominciate a raccontarvi la vita, cosa che molte coppie hanno smesso di fare senza accorgersene. Se siete al punto di parlare solo di organizzazione, è da qui che bisogna cominciare, molto prima di chiedersi <a href="/it/blog/quando-fare-terapia-di-coppia/">se è ora di andare da qualcuno</a>.</p>`,
    },
    {
      id: "il-rito-del-ritorno",
      title: "6. Il rito del ritorno a casa",
      content: `<p>Il momento in cui vi ritrovate la sera dice molto di una coppia. Un "ciao" senza alzare gli occhi dallo schermo, o due minuti di attenzione vera?</p>
<p>L'esercizio: quando uno rientra, l'altro si ferma, viene, e vi prendete due minuti. Un bacio che dura più di un secondo, una domanda sulla giornata, e basta. Gottman raccomanda addirittura un bacio di sei secondi, abbastanza lungo da non poterlo dare pensando ad altro. Fa sorridere, ma provate: sei secondi sono lunghi, e cambiano il tono di tutta la serata.</p>`,
    },
    {
      id: "le-domande",
      title: "7. Le domande che non ci si fa più",
      content: `<p>Dopo qualche anno si crede di sapere tutto dell'altro, e si smette di chiedere. Solo che l'altro cambia: le sue voglie, le sue paure, quello che sogna di fare tra cinque anni. Molte coppie si ritrovano in seduta a scoprire cose che ignoravano completamente.</p>
<p>L'esercizio: una volta a settimana, una domanda vera, di cui non conoscete la risposta. "Di cosa sei andato fiero quest'anno?", "di cosa hai paura in questo periodo?", "cosa cambieresti dei nostri weekend?". Il sito ne ha centinaia, ordinate per tema, nella pagina delle <a href="/it/domande-coppia/">domande da farsi in coppia</a>, con un'estrazione a caso per chi non sa da dove cominciare.</p>`,
    },
    {
      id: "l-appuntamento-della-settimana",
      title: "8. L'appuntamento della settimana",
      content: `<p>Molti litigi esplodono perché gli argomenti si sono accumulati per tre settimane senza che se ne parlasse. L'esercizio, che alcuni terapeuti chiamano la "riunione di coppia", consiste nel bloccare <strong>uno spazio fisso ogni settimana, mezz'ora, solo per parlare della coppia</strong>. Non della logistica, della coppia: cosa è andato bene questa settimana, cosa si è inceppato, cosa si vorrebbe per quella che viene.</p>
<p>Non è molto romantico, detto così. Ma le coppie che lo fanno parlano dei loro problemi quando sono piccoli, ed è proprio questo che evita che diventino grossi. E niente vieta di proseguire con una cena.</p>`,
    },
    {
      id: "le-frasi-che-disinnescano",
      title: "9. Le frasi che disinnescano",
      content: `<p>In tutti i litigi ci sono momenti in cui uno dei due prova qualcosa per calmare le acque: una battuta, un "aspetta, mi sono spiegato male", una mano sul braccio. Gottman li chiama tentativi di riparazione, e ha notato che quello che distingue le coppie solide non è che litigano meno, è che <strong>questi tentativi vengono sentiti</strong>.</p>
<p>L'esercizio si fa a freddo, in due. Ognuno dice all'altro cosa lo aiuta, nel pieno di un litigio, a calmarsi. Per uno è sentirsi dire "ti amo, anche adesso". Per l'altro è che si riconosca una piccola parte di torto. Segnatele. E la prossima volta che sale, usatele. Le prime due volte sembra artificiale, poi diventa naturale.</p>`,
    },
    {
      id: "la-richiesta-della-settimana",
      title: "10. La richiesta della settimana",
      content: `<p>Molti rimproveri sono richieste mai fatte. Ce la si prende con l'altro perché non indovina, quando non gli si è detto niente. L'esercizio: ogni settimana, ognuno fa all'altro <strong>una richiesta precisa, fattibile e positiva</strong>. Non "sii più presente", ma "vorrei che cenassimo senza telefono martedì e giovedì". Non "smettila di brontolare", ma "vorrei che mi dicessi una cosa che ti è piaciuta della mia giornata".</p>
<p>L'altro ha il diritto di negoziare. Ma se dice sì, lo fa. Dopo un mese avrete cambiato quattro piccole cose a testa, e spesso è più di quanto avrebbe dato una grande conversazione su "noi due".</p>`,
    },
    {
      id: "da-dove-cominciare",
      title: "Da dove cominciare, e quando non basta",
      content: `<p>Non tutti insieme. Scegliete un esercizio, uno solo, e tenetelo per tre settimane prima di aggiungerne un altro. I primi due della lista sono buoni punti di partenza se litigate molto; il quarto e il quinto se vi siete allontanati senza litigare.</p>
<p>Se non sapete su cosa si inceppa la vostra coppia, c'è un modo per vederlo nero su bianco: il sito propone una <a href="/it/valutazione-di-coppia/" data-bilan-src="article-therapie">valutazione di coppia in cento domande, ognuno sul proprio telefono</a>, il cui rapporto mostra ambito per ambito dove siete d'accordo e dove no. Permette di scegliere l'esercizio che serve, invece di andare a caso.</p>
<p>E ci sono situazioni in cui gli esercizi non bastano: quando uno dei due non vuole farli, quando c'è stato un tradimento, quando ogni tentativo finisce in litigio. Non è un fallimento, è il segno che un terzo sarebbe utile. <a href="/it/blog/terapia-di-coppia/">La guida alla terapia di coppia</a> spiega come funziona e come trovarne una. E se siete in piena tempesta, ci sono prima <a href="/it/blog/crisi-di-coppia-cosa-fare/">i passi da fare quando la coppia è in crisi</a>.</p>
<a href="/it/blog/terapia-di-coppia/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Leggi anche</span><span class="blog-read-also-title">Terapia di coppia: come funziona, quanto costa e da dove cominciare</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
