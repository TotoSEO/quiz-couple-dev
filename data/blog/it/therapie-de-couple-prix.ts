import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "terapia-di-coppia-costo",
  title: "Terapia di coppia: quanto costa una seduta, chi paga e come spendere meno",
  metaTitle: "Terapia di coppia: costo a seduta e rimborsi",
  metaDescription: "Quanto costa una terapia di coppia in Italia: 70-120 € a seduta, cosa coprono SSN e consultori, la detrazione fiscale e le soluzioni meno care che esistono.",
  featuredImage: "/blog/therapie-de-couple-prix.webp",
  featuredImageAlt: "I due personaggi di Quiz Couple davanti a un salvadanaio a forma di cuore, accanto qualche moneta su un tavolo",
  publishedAt: "2026-12-31T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "Una seduta di terapia di coppia costa in Italia dai 70 ai 120 €, e il Servizio sanitario non la copre. Ecco le cifre vere, e i modi per spendere meno.",
  introduction: `<p>Una terapia di coppia costa in Italia <strong>tra i 70 e i 120 € a seduta</strong>, un po' di più nelle grandi città, un po' meno in videochiamata. Su sei mesi fanno dalle dieci alle quindici sedute, quindi all'incirca dai 700 ai 1 800 €. E nella grande maggioranza dei casi il Servizio sanitario nazionale non ne rimborsa niente.</p>
<p>Ecco i prezzi nel dettaglio, cosa coprono il SSN e i consultori, e le soluzioni meno care quando il budget non basta.</p>`,
  quickSummary: [
    "Una seduta di terapia di coppia costa in Italia dai 70 ai 120 €, fino a 150 € a Milano o a Roma, un po' meno in videochiamata.",
    "Dura dai 45 ai 90 minuti, e ci si va più o meno ogni due o tre settimane.",
    "Il Servizio sanitario nazionale non copre la terapia di coppia: non c'è una malattia da curare, ma una relazione da chiarire.",
    "I consultori familiari pubblici offrono consulenze di coppia gratuite o con un ticket, con qualche settimana di attesa.",
    "Le scuole di specializzazione e i terapeuti con tariffe agevolate costano molto meno: basta chiedere.",
  ],
  sections: [
    {
      id: "il-prezzo-di-una-seduta",
      title: "Il prezzo di una seduta di terapia di coppia",
      content: `<p>Le tariffe sono libere, ogni terapeuta fissa la sua. Ma se si guarda a cosa viene chiesto, si ricade quasi sempre nelle stesse fasce:</p>
<ul>
<li><strong>In una città media o in provincia:</strong> dai 70 ai 90 € a seduta.</li>
<li><strong>In una grande città:</strong> dai 90 ai 120 €.</li>
<li><strong>A Milano o a Roma:</strong> dai 100 ai 150 €, anche di più per i terapeuti più richiesti.</li>
<li><strong>In videochiamata:</strong> spesso 10 o 20 € in meno rispetto allo studio, con lo stesso terapeuta.</li>
</ul>
<p>Perché più cara di una seduta individuale? Perché è più lunga. Una seduta di coppia dura <strong>dai 45 ai 90 minuti</strong>, il tempo che serve per ascoltare due persone invece di una. Riportata all'ora, la differenza non è così grande.</p>
<p>Conta anche il tipo di professionista. Uno psicoterapeuta chiede in genere più di un consulente di coppia, le cui tariffe stanno piuttosto tra i 50 e gli 80 €. Non vuol dire che uno sia meglio dell'altro: cosa fa ognuno lo spiega <a href="/it/blog/terapia-di-coppia/">la guida alla terapia di coppia</a>.</p>`,
    },
    {
      id: "il-costo-totale",
      title: "Il costo totale di una terapia",
      content: `<p>Una terapia di coppia non è una seduta, è una serie. Ci si va ogni due o tre settimane, e dura da tre mesi a un anno. Ecco con cosa devi fare i conti:</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">Quanto costa in tutto</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">90 €</span>a seduta, in media, in Italia</li>
<li><span class="blog-chiffres-nombre">da 10 a 20</span>sedute per una terapia completa</li>
<li><span class="blog-chiffres-nombre">900-1 800 €</span>sull'intero percorso</li>
<li><span class="blog-chiffres-nombre">0 €</span>di rimborso dal Servizio sanitario nazionale</li>
</ul>
</div>
<p>È una cifra. Ma riportata al mese, su sei mesi, fa dai 150 ai 300 € a coppia, cioè dai 75 ai 150 € a testa. Molte coppie li spendono in uscite o in abbonamenti senza pensarci. E resta molto lontana da quello che costa una separazione, tra trasloco, secondo affitto e, se si è sposati, la procedura.</p>
<p>Come si svolge un percorso, dalla prima telefonata all'ultima seduta, lo racconta l'articolo su <a href="/it/blog/come-funziona-la-terapia-di-coppia/">come funziona una terapia di coppia</a>.</p>`,
    },
    {
      id: "ssn-e-detrazioni",
      title: "Cosa copre il Servizio sanitario, e cosa si scarica",
      content: `<p>Il SSN non copre la terapia di coppia, ed è meglio saperlo prima.</p>
<p>La psicoterapia nel pubblico esiste, ma per una persona e per una diagnosi: depressione, disturbi d'ansia, un lutto che non passa. <strong>I problemi di coppia non sono una malattia</strong>, e il bonus psicologo, quando c'è, copre solo le sedute individuali. Se uno di voi due ha bisogno anche di un percorso personale, quello può passare dal pubblico o dal bonus, ma non le sedute in due.</p>
<p>Una cosa invece si può fare: <strong>le sedute da uno psicologo o psicoterapeuta iscritto all'albo sono in genere detraibili al 19 % come spese sanitarie</strong>, se pagate in modo tracciabile e con fattura. Su 1 200 € di terapia fanno circa 230 € che tornano indietro con la dichiarazione dei redditi. Chiedi al terapeuta se è iscritto all'albo e se emette fattura sanitaria: non tutti i consulenti di coppia lo sono.</p>`,
      tip: "Se uno di voi due ha bisogno anche di un percorso individuale (ansia, depressione), quello può passare dal consultorio, dal CPS o dal bonus psicologo, anche se le attese sono lunghe. Alleggerisce il totale, anche se non copre le sedute di coppia.",
    },
    {
      id: "i-consultori",
      title: "I consultori familiari: quasi gratis, e spesso molto buoni",
      content: `<p>Qui l'Italia ha qualcosa che in molti paesi non c'è. <strong>I consultori familiari pubblici</strong>, quelli della ASL, offrono consulenze di coppia gratuite o con un ticket, con psicologi formati che vedono coppie in tutte le situazioni. Accanto a loro ci sono i consultori privati accreditati, spesso di ispirazione cattolica, che ricevono chiunque a tariffe simboliche.</p>
<p>Il rovescio della medaglia: qualche settimana di attesa, a volte di più, a seconda della città. E il numero di sedute è in genere limitato. Per una coppia che non può permettersi un terapeuta privato, resta comunque la prima strada che proverei.</p>
<p>Per trovarli basta cercare "consultorio familiare" con il nome della tua città, o chiedere al medico di base.</p>`,
    },
    {
      id: "spendere-meno",
      title: "Le soluzioni meno care",
      content: `<p>Se il problema è il budget, ci sono diversi modi per farsi aiutare spendendo molto meno.</p>
<ul>
<li><strong>I consultori:</strong> vedi sopra, gratuiti o con ticket.</li>
<li><strong>Le scuole di specializzazione:</strong> gli psicoterapeuti in formazione ricevono coppie sotto la supervisione di un professionista esperto, a tariffe ridotte. La qualità è di solito molto buona, proprio perché sono supervisionati.</li>
<li><strong>Le tariffe agevolate:</strong> molti terapeuti abbassano il prezzo per studenti, disoccupati o coppie con un reddito basso. Bisogna chiederlo, non lo scrivono sempre.</li>
<li><strong>La videochiamata:</strong> meno cara con lo stesso terapeuta, e apre a terapeuti di città con tariffe più basse. Cosa controllare prima è nell'articolo sulla <a href="/it/blog/terapia-di-coppia-online/">terapia di coppia online</a>.</li>
<li><strong>I gruppi e i weekend per coppie:</strong> alcuni terapeuti organizzano incontri per più coppie insieme, molto meno cari a coppia delle sedute individuali.</li>
</ul>
<p>Un'ultima strada, che non sostituisce una terapia ma costa molto meno: fare il punto in due prima di andarci. Il sito propone una <a href="/it/valutazione-di-coppia/" data-bilan-src="article-therapie">valutazione di coppia in cento domande, ognuno per conto suo</a>, con un rapporto che mostra dove siete d'accordo e dove no. Ad alcune coppie basta per ricominciare a parlarsi. Ad altre serve per arrivare dal terapeuta sapendo già di cosa vogliono parlare, e risparmiare due o tre sedute.</p>`,
    },
    {
      id: "ne-vale-la-pena",
      title: "Vale il prezzo?",
      content: `<p>Difficile rispondere al posto di qualcun altro. Ma due cose aiutano a decidere.</p>
<p>Primo, cosa dicono gli studi: secondo una rassegna pubblicata nel 2012, <strong>circa sette coppie su dieci stanno meglio alla fine di una terapia</strong>. Non è una garanzia, è una probabilità, e piuttosto buona.</p>
<p>Secondo, il momento. Una terapia che comincia quando i litigi girano a vuoto da sei mesi costa meno, in sedute e in energie, di una che comincia quando uno dei due ha già un piede fuori. I segnali che è ora sono nell'articolo su <a href="/it/blog/quando-fare-terapia-di-coppia/">quando fare una terapia di coppia</a>. Più si aspetta, più dura... e più costa.</p>
<a href="/it/blog/terapia-di-coppia/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Leggi anche</span><span class="blog-read-also-title">Terapia di coppia: come funziona, quanto costa e da dove cominciare</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
