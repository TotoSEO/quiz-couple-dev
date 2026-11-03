import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "come-funziona-la-terapia-di-coppia",
  title: "Come funziona una terapia di coppia? Dalla prima telefonata all'ultima seduta",
  metaTitle: "Terapia di coppia: come funziona, seduta per seduta",
  metaDescription: "Come funziona una terapia di coppia: il primo appuntamento, cosa chiede il terapeuta, ogni quanto si va, gli esercizi tra una seduta e l'altra e come finisce.",
  featuredImage: "/blog/therapie-de-couple-comment-ca-se-passe.webp",
  featuredImageAlt: "I due personaggi di Quiz Couple seduti uno accanto all'altra su un divano, davanti a loro sul tavolino una clessidra e un quaderno aperto",
  publishedAt: "2026-12-29T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "La prima telefonata, la prima seduta, cosa chiede il terapeuta, ogni quanto si torna e come finisce: una terapia di coppia raccontata nell'ordine.",
  introduction: `<p>Una terapia di coppia si svolge in sedute di circa un'ora, in due, davanti a un terapeuta che fa domande, ferma i litigi quando degenerano e vi dà delle cose da provare tra un appuntamento e l'altro. La prima seduta serve soprattutto a raccontare. Quelle dopo servono a cambiare il modo in cui vi parlate.</p>
<p>Ecco come va, nell'ordine, dalla prima telefonata al giorno in cui non avrete più bisogno di andarci.</p>`,
  quickSummary: [
    "La prima seduta serve a raccontare la vostra storia e quello che vi porta lì; il terapeuta quel giorno non dà pareri.",
    "Una seduta dura dai 45 ai 90 minuti, più o meno ogni due o tre settimane.",
    "Il terapeuta non cerca un colpevole: guarda come ognuno reagisce all'altro e ferma le spirali.",
    "Alcuni terapeuti all'inizio vedono anche ognuno da solo, per sentire quello che non si dice davanti all'altro.",
    "Tra una seduta e l'altra ci sono degli esercizi. È lì che la coppia cambia, non solo nello studio.",
    "Una terapia dura da tre mesi a un anno. Finisce quando riuscite da soli a fare quello che facevate in seduta.",
  ],
  sections: [
    {
      id: "la-prima-telefonata",
      title: "La prima telefonata",
      content: `<p>Tutto parte da un messaggio o da una telefonata, quasi sempre di quello dei due che ha più voglia di andarci. Il terapeuta di solito chiede due o tre cose: da quanto state insieme, cosa vi porta da lui in una frase, e se venite in due. Dura cinque minuti. Vi dice anche la sua tariffa e la durata di una seduta.</p>
<p>Un dettaglio che conta: <strong>la maggior parte dei terapeuti vuole vedere la coppia insieme fin dalla prima seduta.</strong> Se al primo appuntamento vai da solo, alcuni ti considerano poi "il loro" paziente e non riescono più a ricevere la coppia in modo neutro. Altri non hanno problemi. Chiedilo al telefono, evita malintesi.</p>
<p>Se non sai a chi rivolgerti, <a href="/it/blog/terapia-di-coppia/">la guida alla terapia di coppia</a> spiega la differenza tra psicologo, psicoterapeuta e consulente di coppia, e cosa controllare prima dell'appuntamento.</p>`,
    },
    {
      id: "la-prima-seduta",
      title: "La prima seduta: raccontate",
      content: `<p>Siete seduti uno accanto all'altra, o su due poltrone girate verso il terapeuta. Lui comincia quasi sempre con la stessa domanda: "Cosa vi porta qui?". E a quel punto ci sono due possibilità. O uno parla per dieci minuti e l'altro sta zitto, oppure vi interrompete dopo trenta secondi. In entrambi i casi il terapeuta impara già parecchio su di voi.</p>
<p>Poi torna indietro nel tempo. Come vi siete conosciuti, cosa vi è piaciuto dell'altro, da quando ha cominciato a incepparsi. <strong>Non è curiosità:</strong> una coppia che racconta sorridendo come si è conosciuta non è nello stesso punto di una coppia che non si ricorda nemmeno più perché si è messa insieme. I terapeuti formati al metodo Gottman fanno addirittura un colloquio molto strutturato di questo tipo sulla storia della coppia.</p>
<p>Chiede anche cosa si aspetta ognuno dalla terapia. E capita che le risposte non siano uguali: uno vuole salvare la relazione, l'altro vuole "vedere se ha ancora senso". Il terapeuta se lo segna, senza giudicare, perché spesso è quello il vero punto di partenza.</p>
<p>Alla fine di questa prima ora non avete risolto niente. È normale. Uscite con un secondo appuntamento, e spesso con un piccolo compito, tipo "da qui a lì, segnatevi i momenti in cui va bene".</p>`,
      tip: "Molti hanno paura di essere \"giudicati\" alla prima seduta. In pratica il terapeuta passa l'ora ad ascoltare e a fare domande. Se desse il suo parere il primo giorno, sarebbe piuttosto un brutto segno.",
    },
    {
      id: "le-sedute-individuali",
      title: "A volte una seduta per ognuno da solo",
      content: `<p>Dopo il primo incontro, alcuni terapeuti vedono ogni partner una volta da solo. Così sentono quello che non si dice davanti all'altro: una relazione in corso, la voglia di andarsene, una paura di cui ci si vergogna.</p>
<p>Valgono quasi sempre due regole. Primo: <strong>quello che si dice nella seduta individuale non viene riferito all'altro.</strong> Secondo, ed è meno noto: molti terapeuti si rifiutano di "portare" un segreto che renderebbe impossibile la terapia, per esempio una relazione extraconiugale che continua. In quel caso chiedono alla persona di dirlo lei stessa, oppure interrompono l'accompagnamento della coppia. Lo annunciano fin dall'inizio, così ognuno sa come stanno le cose.</p>`,
    },
    {
      id: "una-seduta-normale",
      title: "Com'è una seduta normale",
      content: `<p>Dalla seconda o terza seduta il lavoro cambia natura. Spesso arrivate con qualcosa che è successo durante la settimana, un litigio in macchina, un pranzo di famiglia andato male, e <strong>il terapeuta vi fa rigiocare la scena al rallentatore</strong>.</p>
<p>Chiede a uno cosa ha provato nel momento in cui l'altro ha detto una certa frase. Chiede all'altro cosa intendeva dire. E poi, quasi ogni volta, viene fuori che non eravate nella stessa scena. Lei ha sentito "non fai mai niente", lui pensava di aver detto "stasera avrei voluto una mano".</p>
<p>Quando la conversazione scivola di nuovo nei rimproveri, lui interrompe. Non in modo brusco, ma interrompe: "In questo momento si sta difendendo. Può semplicemente ripetere quello che ha capito di ciò che lei ha appena detto?". Ripetere, aspettare che l'altro confermi, poi rispondere. <strong>È lento, ed è fatto apposta.</strong> A casa andate cento volte più veloci, ed è proprio per questo che deraglia.</p>
<p>A seconda dell'orientamento del terapeuta, l'accento è messo in punti diversi. Nella terapia focalizzata sulle emozioni cerca cosa c'è sotto la rabbia, spesso la paura di non contare più per l'altro, e guida la coppia intorno a quel cerchio in cui uno insiste e l'altro si chiude. Con il metodo Gottman si lavora di più sul modo concreto di aprire una conversazione difficile, di fare pace dopo e di mostrare apprezzamento nel quotidiano. In entrambi i casi l'obiettivo è lo stesso: <strong>che ci riusciate senza di lui</strong>.</p>`,
    },
    {
      id: "il-ritmo",
      title: "Con che ritmo, e per quanto",
      content: `<p>Una seduta dura tra i 45 e i 90 minuti, più di una seduta individuale, perché ascoltare due persone richiede tempo. Il ritmo abituale è <strong>una seduta ogni due o tre settimane</strong>: abbastanza vicine da non perdere il filo, abbastanza distanti da lasciarvi il tempo di provare delle cose nel frattempo.</p>
<p>All'inizio, soprattutto se le cose vanno molto male, alcuni propongono una seduta a settimana. Verso la fine si allunga a un mese, poi ci si ferma. Una terapia di coppia completa conta in genere dalle dieci alle venti sedute, cioè da tre mesi a un anno. Quanto costa sull'intera durata è nell'articolo sul <a href="/it/blog/terapia-di-coppia-costo/">costo di una terapia di coppia</a>.</p>
<p>E poi ci sono le sedute "al bisogno": coppie che hanno finito la loro terapia e tornano una volta due anni dopo, perché un argomento preciso si è incastrato. È frequente, ed è piuttosto un buon segno.</p>`,
    },
    {
      id: "tra-una-seduta-e-l-altra",
      title: "Tra una seduta e l'altra: gli esercizi",
      content: `<p>Quasi tutti i terapeuti danno qualcosa da fare a casa. Può essere semplicissimo: dirsi ogni sera una cosa che si è apprezzata dell'altro, raccontarsi la giornata per venti minuti senza dare consigli, oppure annotare i momenti in cui un litigio stava per partire e cosa l'ha evitato.</p>
<p><strong>È lì che la coppia cambia.</strong> Un'ora ogni due settimane non basta; conta quello che fate negli altri tredici giorni. Le coppie che fanno gli esercizi vanno avanti molto più in fretta di quelle che vengono "solo per parlare". E se avete voglia di cominciare prima ancora di avere un appuntamento, ci sono <a href="/it/blog/esercizi-terapia-di-coppia/">una decina di esercizi di terapia di coppia da fare a casa</a>, spiegati passo dopo passo.</p>`,
    },
    {
      id: "come-finisce",
      title: "Come finisce",
      content: `<p>Non c'è una cerimonia di chiusura. Un giorno arrivate in seduta e non avete molto da raccontare, perché il litigio della settimana l'avete sistemato da soli, con quello che avete imparato. Il terapeuta propone allora di distanziare gli appuntamenti, e poi di fermarsi, con la porta aperta.</p>
<p>Ci sono anche terapie che finiscono con una separazione. Non è raro, e non è un fallimento: una coppia che si lascia parlando, dopo aver capito cosa non ha funzionato, si lascia infinitamente meglio di una che sbatte la porta. Alcuni terapeuti accompagnano perfino questa fase, soprattutto quando ci sono dei figli.</p>
<p>E se non sei ancora al punto di prendere un appuntamento, se prima ti chiedi a che punto siete, il sito propone <a href="/it/valutazione-di-coppia/" data-bilan-src="article-therapie">una valutazione di coppia in cento domande, ognuno sul proprio telefono</a>, che confronta le vostre risposte punto per punto. Non è una terapia, ma dà un'idea molto precisa di cosa dovreste parlare.</p>
<a href="/it/blog/terapia-di-coppia/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Leggi anche</span><span class="blog-read-also-title">Terapia di coppia: come funziona, quanto costa e da dove cominciare</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
