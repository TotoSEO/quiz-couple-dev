import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "come-dividere-le-spese-in-coppia",
  title: "Come dividere le spese in coppia: a metà, in proporzione o senza contare?",
  metaTitle: "Come dividere le spese in coppia: a metà o in proporzione?",
  metaDescription: "Come dividere le spese in coppia: a metà, in proporzione ai redditi o senza contare, chi paga cosa, il calcolo con un esempio, e le spese che si dimenticano.",
  featuredImage: "/blog/partage-des-depenses-en-couple.webp",
  featuredImageAlt: "I due personaggi di Quiz Couple ai due lati di una bilancia, monete su ogni piatto, la bilancia inclinata",
  publishedAt: "2027-02-17T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "A metà sembra giusto, e lo è solo se guadagnate lo stesso. I tre metodi per dividere le spese in coppia, il calcolo in proporzione con un esempio, chi paga cosa, e le spese che si dimenticano sempre.",
  introduction: `<p>La divisione delle spese in coppia si risolve quasi sempre allo stesso modo all'inizio: a metà, perché è semplice e sembra giusto. <strong>Lo è finché guadagnate più o meno lo stesso. Appena uno guadagna nettamente di più, a metà diventa il più ingiusto dei tre metodi.</strong></p>
<p>Ecco i tre metodi con un esempio in cifre, cosa si mette nelle spese comuni e cosa si lascia fuori, il calcolo in proporzione passo per passo, e le spese che si dimenticano nella divisione.</p>`,
  quickSummary: [
    "Tre metodi: a metà, in proporzione ai redditi, o senza contare con tutto in comune. Il primo è giusto con redditi uguali, il secondo appena sono diversi.",
    "In proporzione, ognuno paga le spese comuni nella proporzione di quello che guadagna: con 1.800 e 2.700 € di reddito, è il 40 % e il 60 %.",
    "Le spese comuni sono quello che serve a tutti e due: affitto, bollette, spesa, figli, vacanze in due. Il cellulare, i vestiti e le uscite con i propri amici restano a ciascuno.",
    "Un'app per dividere le spese risolve i ristoranti e i weekend; per l'affitto e la spesa, un conto comune alimentato in proporzione è più semplice.",
    "La divisione non si ferma agli euro: il tempo passato a gestire, cucinare, occuparsi dei figli conta anche lui, ed è spesso quello che sbilancia.",
  ],
  sections: [
    {
      id: "i-tre-metodi",
      title: "I tre metodi, con lo stesso esempio",
      content: `<p>Prendiamo una coppia che guadagna 4.500 € al mese in due: 1.800 € uno, 2.700 € l'altro, e 2.250 € di spese comuni (affitto, condominio, spesa, assicurazioni, abbonamenti). Ecco cosa dà ogni metodo:</p>
<ul>
<li><strong>A metà:</strong> 1.125 € ciascuno. Chi guadagna 1.800 € tiene 675 € per tutto il resto; chi guadagna 2.700 € ne tiene 1.575. Il primo conta ogni uscita, il secondo parte per il weekend. È il metodo che fabbrica più litigi per soldi, e nessuno capisce perché, visto che « è equo ».</li>
<li><strong>In proporzione ai redditi:</strong> il primo guadagna il 40 % dei redditi della coppia, paga il 40 % delle spese comuni, cioè 900 €; il secondo paga il 60 %, cioè 1.350 €. Restano 900 € al primo e 1.350 € al secondo: ognuno tiene la stessa parte del suo stipendio, la metà. È il metodo che si consiglia appena i redditi sono diversi.</li>
<li><strong>Senza contare, tutto in comune:</strong> i 4.500 € arrivano su un solo conto, che paga tutto, e restano 2.250 € per il resto, in due. Nessuno calcola. È il metodo della maggior parte delle coppie sposate, e presuppone di aver risolto prima la questione del <a href="/it/blog/conto-cointestato-o-conti-separati/">conto cointestato o conti separati</a>.</li>
</ul>
<p>Esiste una quarta via, a metà strada: chi guadagna di più paga di più, senza calcolare al punto percentuale. L'affitto per uno, la spesa per l'altro, e si aggiusta quando pende troppo. Funziona nelle coppie che si fidano e a cui non piacciono i fogli di calcolo.</p>`,
    },
    {
      id: "chi-paga-cosa",
      title: "Chi paga cosa: cosa è comune, e cosa no",
      content: `<p>La vera difficoltà non è la percentuale, è la lista. Cosa entra nelle spese comuni, e cosa resta a ciascuno. Ecco cosa fa la maggior parte delle coppie:</p>
<ul>
<li><strong>Comune:</strong> l'affitto o il mutuo, il condominio, la luce, internet, la spesa, l'assicurazione della casa, i figli (asilo, scuola, vestiti, attività), le vacanze in due, i ristoranti in due, i regali fatti insieme, la macchina se serve a tutti e due.</li>
<li><strong>A ciascuno:</strong> il cellulare, i vestiti, lo sport, le uscite con i propri amici, i regali alla propria famiglia, i debiti di prima della coppia, gli hobby che l'altro non condivide.</li>
<li><strong>Da discutere:</strong> la macchina che usa soprattutto uno, le spese mediche, l'aiuto ai genitori, il cane che ha voluto uno, gli abbonamenti che usa solo uno.</li>
</ul>
<p>La terza lista è quella che conta. Ogni coppia la decide a modo suo, e l'unica scelta sbagliata è non parlarne. Se non sapete come tirare fuori l'argomento, l'articolo su <a href="/it/blog/parlare-di-soldi-in-coppia/">come parlare di soldi in coppia</a> dà le domande in ordine.</p>`,
    },
    {
      id: "il-calcolo-in-proporzione",
      title: "Il calcolo in proporzione, passo per passo",
      content: `<p>Ci vogliono cinque minuti, una volta all'anno o quando cambia uno stipendio:</p>
<ol>
<li><strong>Sommate i vostri due redditi netti</strong> mensili, tredicesima spalmata sull'anno. Esempio: 1.800 + 2.700 = 4.500 €.</li>
<li><strong>Calcolate la parte di ciascuno:</strong> 1.800 / 4.500 = 40 %; 2.700 / 4.500 = 60 %.</li>
<li><strong>Fate la lista delle spese comuni</strong> di un mese normale, e aggiungete un dodicesimo delle spese annuali (assicurazione auto, bollo, conguagli, vacanze). Esempio: 2.250 €.</li>
<li><strong>Applicate la parte:</strong> 40 % di 2.250 = 900 €; 60 % di 2.250 = 1.350 €.</li>
<li><strong>Impostate un bonifico automatico</strong> da ciascuno verso il conto comune, il giorno dopo lo stipendio. E non ci si pensa più.</li>
</ol>
<p>Un caso frequente: le spese comuni sono più alte di quello che chi guadagna meno può seguire, anche in proporzione, perché la casa è stata scelta sullo stipendio del più agiato. In quel caso, o si abbassano le spese, o chi guadagna di più si prende una parte superiore alla sua percentuale, e lo si dice chiaramente, perché non sia un favore silenzioso che si paga più tardi. L'articolo <a href="/it/blog/il-mio-partner-guadagna-piu-di-me/">il mio partner guadagna più di me</a> parla di quello che si gioca in quel momento.</p>`,
      tip: "Rivedete la proporzione a ogni cambiamento: aumento, part time, disoccupazione, congedo parentale. Una divisione calcolata tre anni fa su stipendi che sono cambiati è la fonte più discreta di rancore in una coppia.",
    },
    {
      id: "gli-strumenti",
      title: "Gli strumenti: app, conto comune o quaderno",
      content: `<p>Per le spese quotidiane in due (un ristorante, la spesa del weekend, un biglietto del treno), <strong>un'app per dividere le spese</strong> fa benissimo il lavoro: ognuno segna quello che ha pagato, l'app dice chi deve quanto a chi a fine mese, e ci si salda con un bonifico. Si può impostare una percentuale perché la divisione avvenga in proporzione da sola. È lo strumento delle coppie che tengono conti separati.</p>
<p>Per l'affitto, le bollette e tutto quello che scade ogni mese, l'app diventa presto pesante. Un <strong>conto comune alimentato da due bonifici automatici</strong>, calcolati in proporzione, è più semplice: tutto parte da lì, e nessuno deve niente a nessuno.</p>
<p>E alcune coppie fanno tutto questo su un quaderno o un foglio di calcolo condiviso, una volta al mese. Lo strumento conta meno dell'abitudine di guardare insieme. È uno dei punti dell'articolo sul <a href="/it/blog/budget-di-coppia/">budget di coppia</a>.</p>`,
    },
    {
      id: "quello-che-si-dimentica",
      title: "Quello che si dimentica nella divisione",
      content: `<p>La divisione delle spese si fa in euro, ed è lì che imbroglia. Perché una coppia non condivide solo bollette: condivide tempo. Fare la spesa, cucinare, gestire le scartoffie, prendere gli appuntamenti, restare a casa con un bambino malato. <strong>Se uno paga il 60 % delle spese e l'altro fa l'80 % del resto, la divisione non è 60/40.</strong></p>
<p>È spesso lì che si annida il senso di ingiustizia che un foglio di calcolo non mostra, ed è quello che si nasconde dietro molti litigi che sembrano parlare di soldi. Quando fate i conti, mettete sul tavolo anche chi fa cosa, e quanto tempo ci vuole. La guida sui <a href="/it/blog/soldi-e-coppia/">soldi nella coppia</a> ci torna, e la <a href="/it/valutazione-di-coppia/" data-bilan-src="article-argent">valutazione di coppia, ognuno sul proprio telefono</a>, fa le due domande una accanto all'altra: come si dividono le spese, secondo voi, e chi gestisce di più i soldi, le bollette e le scartoffie. Le due risposte, messe fianco a fianco, dicono molto.</p>
<a href="/it/blog/soldi-e-coppia/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Leggi anche</span><span class="blog-read-also-title">Soldi e coppia: come gestire i soldi in due senza che finisca in litigio</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
