import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'pierre-marie-curie-storia-amore',
  title: "Dopo la morte di Pierre, Marie Curie ha continuato a scrivergli: la storia d'amore dei Curie",
  metaTitle: "Pierre e Marie Curie: la loro storia d'amore, dal 1894 al Pantheon",
  metaDescription: "Un incontro nel 1894, un matrimonio senza abito bianco, due biciclette per il viaggio di nozze, il radio e l'incidente del 1906. La storia d'amore di Pierre e Marie Curie.",
  featuredImage: '/blog/pierre-marie-curie-histoire-amour.webp',
  featuredImageAlt: "Pierre e Marie Curie nel loro laboratorio, in piedi e seduta davanti agli strumenti, con un collega a sinistra",
  publishedAt: '2026-10-23T08:10:00+02:00',
  author: AUTHORS['thomas'],
  excerpt: "Dopo l'incidente di Pierre nel 1906, Marie Curie ha tenuto un diario che indirizzava direttamente a lui. Ecco la loro storia, dal primo incontro nel 1894 fino al Pantheon.",
  introduction: `<p>Marie Curie la si conosce soprattutto per i suoi due premi Nobel. Si sa meno che con Pierre Curie ha vissuto <strong>una vera storia d'amore</strong>, durata poco più di dieci anni e finita all'improvviso, nel 1906, in una strada di Parigi.</p>
<p>Hanno fatto tutto insieme, lavoro compreso. E quando Pierre è morto, Marie ha continuato a parlargli... in un diario che gli scriveva.</p>`,
  quickSummary: [
    "Maria Skłodowska e Pierre Curie si conoscono a Parigi nel 1894 e si sposano nel luglio del 1895.",
    "Niente abito bianco né fedi: un completo blu scuro che poi porterà in laboratorio, e due biciclette per il viaggio di nozze.",
    "Insieme scoprono il polonio e il radio nel 1898 e ricevono il Nobel per la fisica nel 1903.",
    "Dopo la morte di Pierre, nell'aprile del 1906, Marie tiene un diario indirizzato a lui e prende il suo corso alla Sorbona.",
  ],
  sections: [
    {
      id: 'come-si-sono-conosciuti',
      title: "Come si sono conosciuti Marie e Pierre",
      content: `<p>Nel 1891 Maria Skłodowska lascia Varsavia per studiare a Parigi, alla Sorbona.</p>
<p>Nella primavera del 1894 cerca un laboratorio per un lavoro sul magnetismo degli acciai. Un professore polacco di passaggio a Parigi, Józef Kowalski, le presenta qualcuno che potrebbe aiutarla: <strong>Pierre Curie, un fisico di otto anni più grande di lei</strong>, che insegna alla Scuola di fisica e chimica della città di Parigi.</p>
<p>L'estate dopo, Maria torna in Polonia per le vacanze, senza sapere se rientrerà in Francia. Pierre le scrive, più volte, per convincerla a tornare e a fare il dottorato a Parigi.</p>
<blockquote><p>«... passer la vie l'un près de l'autre, hypnotisés dans nos rêves : votre rêve patriotique, notre rêve humanitaire et notre rêve scientifique» (... passare la vita l'uno accanto all'altra, ipnotizzati dai nostri sogni: il vostro sogno patriottico, il nostro sogno umanitario e il nostro sogno scientifico)<br><small>Pierre Curie a Maria Skłodowska, estate 1894</small></p></blockquote>
<p>In autunno lei torna a Parigi. Si sposano l'estate successiva.</p>`,
    },
    {
      id: 'un-matrimonio-senza-abito-bianco',
      title: "Un matrimonio senza abito bianco",
      content: `<p>Il matrimonio si celebra il 26 luglio 1895, nel municipio di Sceaux, alle porte di Parigi. <strong>Niente chiesa, niente fedi</strong>: un matrimonio civile, con la famiglia e qualche amico.</p>
<p>Niente abito bianco, nemmeno. Marie sceglie un completo blu scuro, semplice, da poter rimettere tutti i giorni. Ed è proprio quello che fa: lo porterà poi in laboratorio per anni.</p>
<figure class="blog-portrait"><img src="/blog/pierre-marie-curie-1895.webp" alt="Fotografia di Pierre e Marie Curie nel 1895, in piedi uno accanto all'altra, lei gli tiene il braccio" width="620" height="826" loading="lazy"><figcaption>Pierre e Marie Curie nel 1895, l'anno del loro matrimonio.</figcaption></figure>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">🚲 Il viaggio di nozze</p>
<p>Con i soldi ricevuti come regalo di nozze si comprano <strong>due biciclette</strong>. Il loro viaggio di nozze è questo: giri in bici per le stradine di campagna, durante l'estate del 1895.</p>
</aside>`,
    },
    {
      id: 'il-radio-una-scoperta-in-due',
      title: "Il radio, una scoperta in due",
      content: `<p>Per la tesi, Marie sceglie un argomento nuovissimo: i raggi emessi dall'uranio, scoperti da Henri Becquerel nel 1896. Misurando diversi minerali, si accorge che alcuni ne emettono molto più di quanto l'uranio da solo possa spiegare. Quindi dentro c'è qualcos'altro.</p>
<p>A Pierre la pista sembra così promettente che <strong>mette da parte le sue ricerche</strong>, sui cristalli, per lavorare con lei. Nel 1898 annunciano due nuovi elementi: il polonio a luglio, chiamato così per la Polonia di Marie, poi il radio a dicembre.</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">I Curie in cifre</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">11</span>anni di matrimonio, o quasi</li>
<li><span class="blog-chiffres-nombre">2</span>elementi scoperti insieme nel 1898</li>
<li><span class="blog-chiffres-nombre">5</span>premi Nobel nella famiglia Curie</li>
<li><span class="blog-chiffres-nombre">1ª</span>donna professoressa alla Sorbona: Marie, nel 1908</li>
</ul>
</div>
<p>Nel frattempo, nel settembre del 1897, nasce la loro prima figlia, Irène. Lavorano in un capannone umido della Scuola di fisica e chimica, e più tardi Marie racconterà quanto erano stati felici quei giorni di lavoro, nonostante tutto.</p>`,
    },
    {
      id: 'il-nobel-del-1903',
      title: "Il Nobel del 1903, e Pierre che ci mette bocca",
      content: `<p>Nel 1903 gli scienziati francesi che propongono i nomi per il Nobel per la fisica indicano Henri Becquerel e Pierre Curie. <strong>Marie non è nella lista.</strong></p>
<p>Pierre lo viene a sapere da un membro dell'Accademia svedese, e gli risponde: se si pensa a lui per il premio, vuole che sia insieme a Madame Curie, per le loro ricerche comuni. Alla fine lei viene premiata con loro, e diventa la <strong>prima donna a ricevere un premio Nobel</strong>.</p>
<p>Questo dice parecchio sulla loro coppia. Pierre la <a href="/it/test-relazione-sana/">tratta da pari a pari</a>, in un'epoca in cui una scienziata veniva facilmente presa per l'assistente del marito.</p>`,
    },
    {
      id: 'il-19-aprile-1906',
      title: "Il 19 aprile 1906",
      content: `<p>Quel giovedì piove a dirotto su Parigi. Pierre attraversa di corsa una strada vicino al Pont-Neuf e finisce sotto le ruote di un <strong>carro trainato da cavalli</strong>, carico di uniformi militari. Muore sul colpo. Aveva 46 anni.</p>
<p>Marie ha 38 anni e due figlie: Irène, di 8 anni, ed Ève, di 16 mesi.</p>
<p>Undici giorni dopo comincia un <strong>diario che indirizza direttamente a Pierre</strong>, dandogli del tu. Ci racconta di aver messo una sua foto nella bara di lui: il ritratto della donna che lui aveva scelto come compagna. Poi gli racconta le sue giornate, quello che le propongono, quello che prova. A maggio gli scrive che le hanno offerto la sua cattedra alla Sorbona, e che non ama più né il sole né i fiori.</p>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">💡 Buono a sapersi</p>
<p>Il 5 novembre 1906 Marie tiene la sua prima lezione alla Sorbona, al posto di Pierre. L'aula è piena di curiosi e giornalisti, che si aspettano un omaggio a Pierre. <strong>Lei non fa nessun discorso</strong>: comincia subito la lezione, sui progressi della fisica negli ultimi dieci anni. Due anni dopo diventa la prima donna nominata professoressa alla Sorbona.</p>
</aside>`,
    },
    {
      id: 'insieme-al-pantheon',
      title: "Insieme al Pantheon",
      content: `<p>Nel 1911 Marie riceve da sola un secondo Nobel, questa volta per la chimica. Muore nel 1934 e viene sepolta a Sceaux, accanto a Pierre.</p>
<p>Nel 1995 i loro resti vengono trasferiti insieme al Pantheon di Parigi. Marie è <strong>la prima donna a entrarci per i propri meriti</strong>.</p>
<p>La loro figlia Irène, tra l'altro, ha seguito la stessa strada. Con il marito, Frédéric Joliot, ha ricevuto il Nobel per la chimica nel 1935. Un'altra coppia di ricercatori!</p>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">💌 E oggi?</p>
<p>Non serve scoprire un elemento chimico: tante coppie si sono trovate grazie a <a href="/it/test-punti-comuni-coppia/">una passione in comune</a>, e la tengono come uno spazio tutto loro.</p>
</aside>
<a href="/it/blog/maria-antonietta-fersen-lettere/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Leggi anche</span><span class="blog-read-also-title">Maria Antonietta e Fersen: le lettere cancellate lette ai raggi X</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>
<a href="/it/blog/juliette-drouet-victor-hugo-lettere/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Leggi anche</span><span class="blog-read-also-title">Juliette Drouet e Victor Hugo: 50 anni d'amore e 22.000 lettere</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>
<p class="blog-sources"><strong>Fonti:</strong> Institut Curie, pagine sulla storia di Pierre e Marie Curie (<a href="https://curie.fr/" rel="noopener" target="_blank">curie.fr</a>, in francese); American Institute of Physics, «Marie Curie and the Science of Radioactivity» (<a href="https://history.aip.org/exhibits/curie/" rel="noopener" target="_blank">vedi la mostra, in inglese</a>); Università PSL, mostra virtuale «Marie Curie, 1867-1934» (<a href="https://explore.psl.eu/en/discover/virtual-exhibits/marie-curie-1867-1934/trials-tribulations-and-consecration-1906-1919" rel="noopener" target="_blank">explore.psl.eu</a>).</p>
<p class="blog-sources"><strong>Immagini:</strong> Pierre e Marie Curie nel loro laboratorio, fotografia, Wellcome Collection, CC BY 4.0, ritagliata; Pierre e Marie Curie nel 1895, fotografia, pubblico dominio.</p>`,
    },
  ],
};

export default article;
