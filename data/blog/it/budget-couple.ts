import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "budget-di-coppia",
  title: "Budget di coppia: il metodo semplice per fare un budget in due, e rispettarlo",
  metaTitle: "Budget di coppia: fare un budget in due e rispettarlo",
  metaDescription: "Fare un budget di coppia: il metodo in cinque passi, un esempio per una coppia con 3.200 € al mese, la regola 50/30/20, gli strumenti e il fondo di emergenza.",
  featuredImage: "/blog/budget-couple.webp",
  featuredImageAlt: "I due personaggi di Quiz Couple davanti a un grande foglio di calcolo su un tavolo, una calcolatrice e delle buste",
  publishedAt: "2027-02-27T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "Un budget in due richiede un'ora la prima volta e venti minuti al mese dopo. Il metodo in cinque passi, un esempio per una coppia con 3.200 €, la regola 50/30/20, gli strumenti, e cosa fare quando si prestano soldi al partner.",
  introduction: `<p>Un budget di coppia non è una tabella di vincoli. <strong>È sapere dove vanno i soldi in due, per non dover più indovinare, rimproverarsi, né privarsi per niente.</strong> Le coppie che ne hanno uno litigano meno per i soldi, non perché ne abbiano di più, ma perché sanno cosa resta.</p>
<p>Ecco il metodo in cinque passi, un esempio in cifre per una coppia con 3.200 € al mese, la regola 50/30/20, gli strumenti che funzionano, il fondo di emergenza, e l'appuntamento che fa reggere tutto questo.</p>`,
  quickSummary: [
    "Cinque passi: le entrate, le spese fisse, le spese che variano, il risparmio, e una paghetta per ciascuno. Un'ora la prima volta, venti minuti al mese dopo.",
    "La regola 50/30/20 dà un ordine di grandezza: la metà per l'indispensabile, un terzo per i desideri, un quinto per il risparmio. Un riferimento, non una legge.",
    "Le spese annuali (conguagli, assicurazioni, vacanze, regali) si dividono per dodici e si mettono da parte ogni mese: sono loro a far saltare i budget.",
    "Un fondo di emergenza di tre mesi di spese, prima di qualsiasi altro progetto, toglie la paura che alimenta la maggior parte dei litigi per soldi.",
    "Il budget si rivede in due, una volta al mese, a data fissa. Un budget che non si guarda è un foglio di calcolo in più.",
  ],
  sections: [
    {
      id: "perche-un-budget",
      title: "Perché un budget in due cambia tutto",
      content: `<p>Senza budget, ogni spesa è una trattativa. Possiamo permetterci questo ristorante? Le vacanze sono ragionevoli? Perché hai comprato quello? E siccome nessuno sa cosa resta, ognuno risponde con l'istinto: il risparmiatore dice no, lo spendaccione dice sì, e si ricomincia.</p>
<p><strong>Con un budget, la domanda cambia: non ci si chiede più « possiamo? », si guarda la riga.</strong> Restano 140 € nel tempo libero questo mese, quindi sì al ristorante, no al weekend. Nessuno ha ceduto, nessuno ha vietato. Ha deciso il budget, e l'avete scritto insieme. È il motivo per cui la guida sui <a href="/it/blog/soldi-e-coppia/">soldi nella coppia</a> lo chiama lo strumento che calma tutto.</p>`,
    },
    {
      id: "il-metodo",
      title: "Il metodo in cinque passi",
      content: `<ol>
<li><strong>Le entrate:</strong> i due stipendi netti, gli assegni, le entrate regolari. La tredicesima e i premi si spalmano su dodici mesi. Si ottiene quello che entra ogni mese.</li>
<li><strong>Le spese fisse:</strong> l'affitto o il mutuo, il condominio, la luce, internet, i cellulari, le assicurazioni, gli abbonamenti, i trasporti, l'asilo. Tutto quello che scade uguale ogni mese. Prendete gli ultimi tre estratti conto: fa prima che indovinare.</li>
<li><strong>Le spese che variano:</strong> la spesa, la benzina, le uscite, i vestiti, la salute. Fate la media degli ultimi tre mesi, e aggiungete un dodicesimo di tutto quello che scade una volta all'anno: conguagli, assicurazione auto, bollo, vacanze, regali di Natale, il tagliando. È questa riga a far saltare i budget, perché la si dimentica.</li>
<li><strong>Il risparmio:</strong> una cifra fissa, trasferita il giorno dello stipendio, prima di tutto il resto. Se viene « da quello che resta », non resta mai niente.</li>
<li><strong>La paghetta:</strong> una cifra per ciascuno, uguale o proporzionale ai redditi, su un conto proprio, senza giustificazione. È la riga che fa accettare il budget allo spendaccione, ed è quella che si dimentica di più.</li>
</ol>
<p>Se alla fine le spese superano le entrate, non si comincia tagliando i piaceri: si guardano le fisse. Un abbonamento di troppo, un'assicurazione mai rinegoziata, una tariffa del cellulare di cinque anni fa fanno spesso più di tutti i caffè del mese.</p>`,
    },
    {
      id: "un-esempio",
      title: "Un esempio per una coppia con 3.200 € al mese",
      content: `<p>Due persone, 1.400 e 1.800 € netti, un affitto in città, niente figli. Ecco cosa dà un budget che regge:</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">Un mese con 3.200 €, in due</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">1.600 €</span>di spese fisse: affitto e condominio 950, luce, gas e internet 170, assicurazioni 80, cellulari 40, trasporti 150, abbonamenti 40, e 170 accantonati per assicurazione auto, bollo e conguagli dell'anno</li>
<li><span class="blog-chiffres-nombre">850 €</span>di spese che variano: spesa 480, uscite e ristoranti 180, vestiti e salute 90, e 100 messi da parte ogni mese per le vacanze</li>
<li><span class="blog-chiffres-nombre">430 €</span>di risparmio, trasferiti il giorno dello stipendio, prima di tutto per il fondo di emergenza</li>
<li><span class="blog-chiffres-nombre">320 €</span>di paghetta, 140 per uno e 180 per l'altro, in proporzione ai redditi, senza giustificazione</li>
</ul>
</div>
<p>E come ognuno alimenta queste righe è la questione di <a href="/it/blog/come-dividere-le-spese-in-coppia/">come dividere le spese in coppia</a>: qui, in proporzione, il 44 % per uno e il 56 % per l'altro, con due bonifici automatici verso il conto comune. Se mettete tutto in comune, la questione non si pone, e <a href="/it/blog/conto-cointestato-o-conti-separati/">conto cointestato o conti separati</a> dice quale va con quale budget.</p>`,
    },
    {
      id: "la-regola-50-30-20",
      title: "La regola 50/30/20, per sapere se è ragionevole",
      content: `<p>Per verificare che il vostro budget non sia sbilenco, un riferimento noto: <strong>la metà delle entrate per l'indispensabile</strong> (casa, spesa, trasporti, assicurazioni, salute), <strong>il trenta per cento per i desideri</strong> (uscite, vacanze, vestiti, abbonamenti, paghetta), <strong>il venti per cento per il risparmio</strong> e il rimborso dei debiti.</p>
<p>Nell'esempio qui sopra, l'indispensabile fa circa il 65 %, i desideri il 20 % e il risparmio il 15 %: pesante sulla casa, come la maggior parte delle coppie in città, e si corregge alzando il risparmio appena uno stipendio si muove. Non è una legge. Una coppia con un affitto alto a Milano sarà al 60 % di indispensabile, una coppia proprietaria senza mutuo al 40 %. Quello che la regola dice è dove guardare quando non torna.</p>`,
      tip: "Il fondo di emergenza prima di tutto: tre mesi di spese, su un conto disponibile, prima di qualsiasi progetto. È quello che toglie la paura che alimenta la maggior parte dei litigi per soldi, perché un imprevisto non è più una catastrofe.",
    },
    {
      id: "gli-strumenti",
      title: "Gli strumenti: foglio di calcolo, app o buste",
      content: `<ul>
<li><strong>Il foglio di calcolo condiviso:</strong> una colonna per mese, una riga per voce, accessibile a tutti e due sul telefono. Gratis, flessibile, ed è quello che la maggior parte delle coppie finisce per usare.</li>
<li><strong>L'app di budget:</strong> legge i vostri conti e classifica le spese da sola. Comoda per vedere dove vanno i soldi, meno per decidere in due: mostra, non discute.</li>
<li><strong>Le buste:</strong> il vecchio metodo, in contanti o in sottoconti: una busta spesa, una uscite, una vacanze. Quando la busta è vuota, ci si ferma. È il metodo che funziona meglio per gli spendaccioni, perché rende visibile il limite.</li>
</ul>
<p>E un punto che vale per tutti gli strumenti: <strong>l'appuntamento</strong>. Venti minuti al mese, a data fissa, la prima domenica per esempio, con il budget sotto gli occhi. Si guarda cosa ha sforato, cosa arriva il mese prossimo, e ognuno dice cosa lo preoccupa. Un budget che non si guarda in due è un foglio di calcolo in più. L'articolo su <a href="/it/blog/parlare-di-soldi-in-coppia/">come parlare di soldi in coppia</a> spiega come fissare quell'appuntamento senza che diventi una seccatura.</p>`,
    },
    {
      id: "prestare-soldi-al-partner",
      title: "Prestare soldi al partner",
      content: `<p>Succede in molte coppie che tengono conti separati: uno anticipa una grossa cifra all'altro, per una macchina, un anticipo, un debito di prima. E finisce male più spesso di quanto si creda, non perché l'altro non restituisca, ma perché nessuno ha detto se era un prestito o un regalo.</p>
<p>Due regole. La prima: <strong>ditelo, in una frase, il giorno stesso</strong>. « Ti presto 3.000 €, me li restituisci quando puoi » non è la stessa cosa di « ti do una mano », e tutte e due sono accettabili se si sa quale delle due è. La seconda, oltre qualche centinaio di euro e se non siete sposati: <strong>un pezzo di carta</strong>, un riconoscimento di debito datato e firmato, con la cifra e il ritmo di restituzione. Sembra freddo tra due persone che si amano. È soprattutto quello che permette di non pensarci più, e di non farne un litigio tra due anni. La guida sui <a href="/it/blog/soldi-e-coppia/">soldi nella coppia</a> ricorda cosa dice la legge, o non dice, per le coppie non sposate.</p>
<p>Per sapere se vedete il risparmio allo stesso modo, una priorità assoluta per uno e « bisogna godersela » per l'altro, la <a href="/it/valutazione-di-coppia/" data-bilan-src="article-argent">valutazione di coppia, ognuno sul proprio telefono</a>, fa la domanda a ciascuno, insieme a quella su cosa fareste con 1.000 € piovuti dal cielo. Le due risposte fianco a fianco sono spesso il punto di partenza del primo budget.</p>
<a href="/it/blog/soldi-e-coppia/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Leggi anche</span><span class="blog-read-also-title">Soldi e coppia: come gestire i soldi in due senza che finisca in litigio</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
