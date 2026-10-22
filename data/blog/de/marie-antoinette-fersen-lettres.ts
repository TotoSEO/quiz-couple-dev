import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'marie-antoinette-fersen-briefe',
  title: "Marie Antoinette und Fersen: Was Röntgenstrahlen unter den geschwärzten Zeilen ihrer Briefe fanden",
  metaTitle: "Marie Antoinette und Fersen: geschwärzte Briefe mit Röntgenstrahlen gelesen",
  metaDescription: "Stellen in den Briefen zwischen Marie Antoinette und Axel von Fersen waren mit Tinte geschwärzt. Forscher haben sie mit Röntgenstrahlen gelesen: Das stand darunter, und so erfuhr man, wer sie versteckt hat.",
  featuredImage: '/blog/marie-antoinette-fersen-lettres.webp',
  featuredImageAlt: "Marie Antoinette, gemalt von Élisabeth Vigée Le Brun 1783, neben dem Porträt Axel von Fersens von Carl Fredrik von Breda",
  publishedAt: '2026-10-22T16:30:00+02:00',
  author: AUTHORS['thomas'],
  excerpt: "Über ein Jahrhundert lang waren ganze Zeilen ihrer Briefe unleserlich. Französische Forscher haben sie mit Röntgenstrahlen gelesen, und jetzt weiß man, wer sie geschwärzt hat.",
  introduction: `<p>Marie Antoinette und der schwedische Graf Axel von Fersen haben sich während der Französischen Revolution heimlich geschrieben, als die königliche Familie im Pariser Tuilerienpalast unter Bewachung lebte. Ein Teil dieser Briefe liegt seit 1982 im französischen Nationalarchiv. Das Problem: Manche Wörter, manchmal ganze Zeilen, sind mit dicker Tinte übermalt. Sehr lange konnte niemand lesen, was darunter stand.</p>
<p>2021 hat ein französisches Forscherteam einen guten Teil dieser Stellen mit Röntgenstrahlen lesbar gemacht. Darunter stehen Dinge wie „ma tendre amie“ (meine zärtliche Freundin) oder „vous que j'aime“ (Sie, die ich liebe)... und man weiß jetzt ziemlich genau, wer zur Feder gegriffen hat, um sie zu verstecken. Hier steht, was unter der Tinte war und was es über die beiden verrät.</p>`,
  quickSummary: [
    "Das französische Nationalarchiv besitzt seit 1982 einen Teil der Briefe, die Marie Antoinette und Fersen 1791 und 1792 gewechselt haben.",
    "Fünfzehn dieser Briefe haben geschwärzte Stellen, von ein paar Wörtern bis zu ein paar Zeilen.",
    "2021 haben Forscher des Centre de recherche sur la conservation acht davon mit Röntgenfluoreszenz gelesen.",
    "Unter der Tinte steht zum Beispiel „ma tendre amie“, „vous que j'aime“ oder „non pas sans vous“.",
    "Nach der verwendeten Tinte zu urteilen, hat höchstwahrscheinlich Fersen selbst die Briefe geschwärzt.",
  ],
  sections: [
    {
      id: 'wer-war-fersen',
      title: "Wer war Axel von Fersen?",
      content: `<p>Hans Axel von Fersen war ein schwedischer Graf, geboren 1755, im selben Jahr wie Marie Antoinette. Er lernte sie 1774 auf einem Maskenball der Oper kennen, als beide 18 Jahre alt waren. Königin war sie damals noch nicht: Ludwig XV. starb ein paar Monate später.</p>
<p>Ein paar Jahre danach kam er nach Frankreich zurück, wurde ein fester Gast am Hof und zog dann in den Amerikanischen Unabhängigkeitskrieg. In die Geschichtsbücher brachte ihn aber vor allem der Juni 1791. Er war es, der die Flucht der königlichen Familie organisierte, die mit der Festnahme in Varennes endete. Er begleitete sie bis Bondy, kurz hinter Paris, und ließ sie dann ohne ihn weiterfahren.</p>
<p>Nach Varennes wurden König und Königin in die Tuilerien zurückgebracht und streng bewacht. Fersen, der wegen seiner Rolle bei der Flucht in Frankreich unerwünscht war, lebte meist in Brüssel. Sehen konnten sie sich nicht mehr, also schrieben sie sich. Nur ein einziges Mal kam er heimlich zurück in die Tuilerien, im Februar 1792. Es war das letzte Mal, dass sie sich sahen: Marie Antoinette wurde am 16. Oktober 1793 hingerichtet.</p>`,
    },
    {
      id: 'heimlich-geschriebene-briefe',
      title: "Heimlich geschriebene Briefe",
      content: `<p>Zwischen Ende Juni 1791 und Ende Juni 1792 schrieben sich die beiden mit großer Vorsicht. Laut Anne Michelin, einer der Forscherinnen, die an diesen Briefen gearbeitet haben, benutzten sie Geheimtinte (eine unsichtbare Tinte, die man erst sichtbar machen muss) und verschlüsselte Stellen. Die Schwärzungen kamen erst später dazu.</p>
<p>Fersen hob alles auf. Er archivierte die Briefe der Königin, aber auch die Entwürfe seiner eigenen Briefe an sie, und er schrieb manche wichtigen Briefe ab, was damals üblich war. Deshalb ist der Großteil der erhaltenen Briefe in seiner Handschrift, selbst wenn der Text von Marie Antoinette stammt.</p>
<p>Diese Papiere blieben in Fersens Familie, bis das französische Nationalarchiv 1982 einen Teil davon kaufte. Darunter sind 21 Briefe von Marie Antoinette an Fersen, 7 davon geschwärzt, und 27 Briefe von Fersen an Marie Antoinette, 8 davon geschwärzt. Macht 15 Briefe, in denen jemand ein paar Wörter, manchmal ein paar Zeilen, so dick mit Tinte übermalt hat, dass nichts mehr zu lesen war.</p>
<p>Veröffentlicht wurden die Briefe im 19. Jahrhundert von einem Großneffen Fersens, natürlich ohne die versteckten Stellen. Seitdem fragten sich Historiker, was darunter stand: politische Geheimnisse oder der Beweis für eine Liebesgeschichte.</p>`,
    },
    {
      id: 'wie-man-unter-tinte-liest',
      title: "Wie man ein Wort unter einem Tintenfleck liest",
      content: `<p>Die Arbeit hat das Centre de recherche sur la conservation (CRC) gemacht, ein Labor des französischen Naturkundemuseums, des CNRS und des französischen Kulturministeriums. Die Studie erschien im Oktober 2021 in der Fachzeitschrift <em>Science Advances</em>, geschrieben von Anne Michelin, Fabien Pottier und Christine Andraud.</p>
<p>Die Grundidee ist eigentlich einfach. Damals schrieb man mit Eisengallustinte, einer Tinte auf Eisenbasis. Aber von einem Fässchen zum nächsten enthält diese Tinte nicht genau dieselben Metalle: ein bisschen mehr Kupfer in dem einen, ein bisschen mehr Zink in dem anderen. Wenn die Tinte des Textes und die Tinte der Schwärzung nicht gleich zusammengesetzt sind, kann man sie theoretisch auseinanderhalten.</p>
<p>Dafür haben die Forscher die Röntgenfluoreszenz genutzt. Man schickt Röntgenstrahlen auf das Papier, und jedes Metall sendet sein eigenes Signal zurück. Tastet man das Blatt Punkt für Punkt ab, bekommt man eine Karte für Kupfer, eine für Zink, eine für Eisen und so weiter. Und auf einer dieser Karten tauchen die Buchstaben wieder auf, wenn die versteckte Tinte ein Metall enthält, das die Schwärzung nicht hat.</p>
<p>Das brauchte ganz schön Geduld: 95 Tage am Scanner für rund hundert geschwärzte Zeilen! Und es hat nicht überall geklappt. Von den 15 geschwärzten Briefen konnten 8 gelesen werden. Bei den anderen 7 hat keine der Methoden den Text zurückgeholt, sie bleiben bisher unleserlich.</p>`,
    },
    {
      id: 'was-unter-der-tinte-stand',
      title: "Was unter der Tinte stand",
      content: `<p>In den wiedergefundenen Stellen geht es vor allem um Liebe. Hier einige davon, wie die Studie sie veröffentlicht hat, in der französischen Schreibweise der Zeit:</p>
<ul>
<li><strong>„ma tendre amie“ (meine zärtliche Freundin):</strong> in einem Brief von Fersen vom 13. Oktober 1791.</li>
<li><strong>„vous que j'aime et aimeroi jusqu'a mon...“ (Sie, die ich liebe und lieben werde bis zu meinem...):</strong> in einem Brief von Marie Antoinette vom 7. Dezember 1791. Das Ende des Satzes fehlt.</li>
<li><strong>„pour le bonheur de tous trois“ (für das Glück von uns dreien):</strong> im selben Brief, etwas weiter unten.</li>
<li><strong>„non pas sans vous“ (nicht ohne Sie):</strong> in einem Brief von Marie Antoinette vom 4. Januar 1792.</li>
</ul>
<p>Anne Michelin fasst das Vokabular der versteckten Stellen mit ein paar Wörtern zusammen, die immer wieder vorkommen: „Geliebter“, „zärtlicher Freund“, „anbeten“, „wahnsinnig“. Von Staatsgeheimnissen keine Spur!</p>
<p>Die Auszüge, die das Team abgeschrieben hat, zeigen den Ton. Am 26. September 1791 schreibt Marie Antoinette, dass sie geweint hat, als sie erfuhr, dass er den Winter in Brüssel verbringen wollte, statt nach Hause zu seiner Familie zu fahren, und sie bittet ihn, ihretwegen nicht auf seine Eltern zu verzichten: „Comptez, mon bien aimé, que mon coeur sent bien tout ce que vous faites pour moi, mais ceci seroit trop exiger“ (Seien Sie sicher, mein Geliebter, dass mein Herz alles spürt, was Sie für mich tun, aber das wäre zu viel verlangt). Zwei Wochen später schreibt Fersen: „sans vous il n'est point de bonheur pour moi l'univers n'est rien sans vous“ (ohne Sie gibt es kein Glück für mich, das Universum ist nichts ohne Sie), und etwas weiter: „vous voir, vous aimer et vous consoler c'est tout ce que je désire“ (Sie sehen, Sie lieben und Sie trösten, mehr wünsche ich mir nicht).</p>`,
    },
    {
      id: 'wer-hat-die-briefe-geschwaerzt',
      title: "Wer hat die Briefe geschwärzt?",
      content: `<p>Lange galt Fersens Großneffe als Hauptverdächtiger, derjenige, der die Briefe veröffentlicht hat. Das klang plausibel: ein Nachfahre, der die Ehre der Königin und die seiner Familie schützen will, bevor er die Briefe öffentlich macht.</p>
<p>Die Analyse der Tinte erzählt etwas anderes. Die Tinte der Schwärzungen ist fast immer genauso zusammengesetzt wie die Tinte, mit der Fersen seine Entwürfe schrieb und die Briefe der Königin abschrieb. Auf einem der Briefe steht sogar eine Stelle in seiner Handschrift, direkt über einer geschwärzten Stelle, mit der Tinte der Schwärzung. Für die Forscher sieht es also so aus, als hätte Fersen diese Wörter selbst versteckt.</p>
<p>Warum er das getan hat, weiß man nicht. Vielleicht aus persönlichen Gründen, vielleicht aus politischen: Möglicherweise wollte er die Briefe nutzen können, um die königliche Familie zu verteidigen, ohne die Ehre der Königin und seine eigene zu gefährden.</p>`,
    },
    {
      id: 'haben-sie-sich-geliebt',
      title: "Haben sie sich also geliebt?",
      content: `<p>Das ist DIE Frage, die sich alle seit zwei Jahrhunderten stellen, und die Antwort der Forscher bleibt vorsichtig. Die wiedergefundenen Stellen zeigen eine innige Beziehung, was auf Fersens Seite noch nie schwarz auf weiß belegt war. Aber Anne Michelin sagt es selbst: Diese Stellen „erlauben es nicht, die wahre Natur ihrer Gefühle endgültig zu klären“.</p>
<p>Sicher sagen kann man, dass sie unglaublich aneinander hingen und Risiken eingingen, um weiter schreiben zu können. Alles andere, eine Liebesgeschichte im heutigen Sinn oder eine leidenschaftliche Freundschaft, liest jeder auf seine Weise. So oder so war es ein Gefühl, das sie bis zum Schluss <a href="/de/liebt-er-sie-mich-heimlich-test/">geheim halten</a> mussten.</p>
<p>Fersen hat nie geheiratet. Er starb am 20. Juni 1810 in Stockholm, von einer Menschenmenge während des Trauerzugs für einen Prinzen getötet. Der 20. Juni war auch der Tag, an dem er neunzehn Jahre zuvor die königliche Familie aus Paris geschmuggelt hatte.</p>`,
    },
    {
      id: 'liebe-auf-distanz',
      title: "Liebe auf Distanz, 1791 und heute",
      content: `<p>Beim Lesen dieser Auszüge ist man überrascht, wie sehr sie dem ähneln, was sich getrennt lebende Menschen heute schreiben. Sie macht sich Sorgen, dass er ihretwegen auf seine Familie verzichtet, er antwortet, dass er nichts anderes braucht, als sie zu sehen. Nur dass ein Brief tagelang unterwegs war und ein einziger abgefangener Brief sehr teuer werden konnte.</p>
<p>Paare, die <a href="/de/fernbeziehung-quiz/">weit voneinander entfernt leben</a>, kennen das gut, in einer viel sanfteren Version: Alles läuft über Worte, und jede Nachricht zählt ein bisschen mehr als sonst.</p>
<p class="blog-sources"><strong>Quellen:</strong> Anne Michelin, Fabien Pottier und Christine Andraud, „2D macro-XRF to reveal redacted sections of French queen Marie-Antoinette secret correspondence with Swedish count Axel von Fersen“, <em>Science Advances</em>, Oktober 2021 (<a href="https://doi.org/10.1126/sciadv.abg4266" rel="noopener" target="_blank">zur Studie</a>); Anne Michelin, „La correspondance de Marie-Antoinette aux rayons X“, <em>The Conversation</em>, Januar 2022 (<a href="https://theconversation.com/la-correspondance-de-marie-antoinette-aux-rayons-x-173766" rel="noopener" target="_blank">zum Artikel, auf Französisch</a>).</p>
<p class="blog-sources"><strong>Bild:</strong> <em>Marie Antoinette mit der Rose</em>, Élisabeth Vigée Le Brun, 1783, Schloss Versailles; Porträt Axel von Fersens, Carl Fredrik von Breda, um 1800, Östergötland-Museum. Gemeinfrei.</p>`,
    },
  ],
};

export default article;
