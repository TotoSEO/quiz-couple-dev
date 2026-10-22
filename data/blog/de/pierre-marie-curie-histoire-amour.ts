import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'pierre-marie-curie-liebesgeschichte',
  title: "Nach Pierres Tod schrieb Marie Curie ihm weiter: die Liebesgeschichte der Curies",
  metaTitle: "Pierre und Marie Curie: ihre Liebesgeschichte, von 1894 bis ins Panthéon",
  metaDescription: "Ein Kennenlernen 1894, eine Hochzeit ohne weißes Kleid, zwei Fahrräder für die Flitterwochen, das Radium und der Unfall von 1906. Die Liebesgeschichte von Pierre und Marie Curie.",
  featuredImage: '/blog/pierre-marie-curie-histoire-amour.webp',
  featuredImageAlt: "Pierre und Marie Curie in ihrem Labor, stehend und sitzend an ihren Instrumenten, links ein Kollege",
  publishedAt: '2026-10-23T08:10:00+02:00',
  author: AUTHORS['thomas'],
  excerpt: "Nach Pierres Unfall 1906 führte Marie Curie ein Tagebuch, das sie direkt an ihn richtete. Hier ist ihre Geschichte, vom Kennenlernen 1894 bis ins Panthéon.",
  introduction: `<p>Marie Curie kennt man vor allem wegen ihrer zwei Nobelpreise. Weniger bekannt ist, dass sie mit Pierre Curie <strong>eine echte Liebesgeschichte</strong> erlebt hat. Sie dauerte etwas mehr als zehn Jahre und endete ganz plötzlich, 1906, auf einer Straße in Paris.</p>
<p>Sie haben alles zusammen gemacht, die Arbeit eingeschlossen. Und als Pierre starb, hat Marie weiter mit ihm geredet... in einem Tagebuch, das sie an ihn schrieb.</p>`,
  quickSummary: [
    "Maria Skłodowska und Pierre Curie lernen sich 1894 in Paris kennen und heiraten im Juli 1895.",
    "Kein weißes Kleid und keine Ringe: ein dunkelblaues Kostüm, das sie später im Labor trägt, und zwei Fahrräder für die Flitterwochen.",
    "Zusammen entdecken sie 1898 Polonium und Radium und bekommen 1903 den Nobelpreis für Physik.",
    "Nach Pierres Tod im April 1906 führt Marie ein Tagebuch, das an ihn gerichtet ist, und übernimmt seine Vorlesung an der Sorbonne.",
  ],
  sections: [
    {
      id: 'wie-sie-sich-kennenlernten',
      title: "Wie sich Marie und Pierre kennengelernt haben",
      content: `<p>1891 verlässt Maria Skłodowska Warschau, um in Paris an der Sorbonne zu studieren.</p>
<p>Im Frühjahr 1894 sucht sie ein Labor für eine Arbeit über den Magnetismus von Stahl. Ein polnischer Professor, der gerade in Paris ist, Józef Kowalski, stellt ihr jemanden vor, der ihr helfen könnte: <strong>Pierre Curie, einen Physiker, acht Jahre älter als sie</strong>, der an der Pariser Hochschule für Physik und Chemie unterrichtet.</p>
<p>Im Sommer darauf fährt Maria in den Ferien nach Polen und weiß nicht, ob sie nach Frankreich zurückkommt. Pierre schreibt ihr, mehrmals, um sie zu überzeugen, für ihre Doktorarbeit nach Paris zurückzukommen.</p>
<blockquote><p>„... passer la vie l'un près de l'autre, hypnotisés dans nos rêves : votre rêve patriotique, notre rêve humanitaire et notre rêve scientifique“ (... das Leben nebeneinander zu verbringen, gebannt von unseren Träumen: Ihrem patriotischen Traum, unserem humanitären Traum und unserem wissenschaftlichen Traum)<br><small>Pierre Curie an Maria Skłodowska, Sommer 1894</small></p></blockquote>
<p>Im Herbst kommt sie zurück nach Paris. Im Sommer danach heiraten sie.</p>`,
    },
    {
      id: 'eine-hochzeit-ohne-weisses-kleid',
      title: "Eine Hochzeit ohne weißes Kleid",
      content: `<p>Die Hochzeit findet am 26. Juli 1895 im Rathaus von Sceaux statt, gleich bei Paris. <strong>Keine Kirche, keine Ringe</strong>: eine standesamtliche Trauung, mit der Familie und ein paar Freunden.</p>
<p>Ein weißes Kleid gibt es auch nicht. Marie wählt ein schlichtes dunkelblaues Kostüm, das sie jeden Tag wieder anziehen kann. Und genau das macht sie: Sie trägt es danach jahrelang im Labor.</p>
<figure class="blog-portrait"><img src="/blog/pierre-marie-curie-1895.webp" alt="Fotografie von Pierre und Marie Curie im Jahr 1895, nebeneinander stehend, sie hält seinen Arm" width="620" height="826" loading="lazy"><figcaption>Pierre und Marie Curie 1895, im Jahr ihrer Hochzeit.</figcaption></figure>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">🚲 Die Flitterwochen</p>
<p>Von dem Geld, das sie zur Hochzeit geschenkt bekommen, kaufen sie sich <strong>zwei Fahrräder</strong>. Das sind ihre Flitterwochen: Radtouren über kleine Landstraßen, im Sommer 1895.</p>
</aside>`,
    },
    {
      id: 'radium-eine-entdeckung-zu-zweit',
      title: "Radium, eine Entdeckung zu zweit",
      content: `<p>Für ihre Doktorarbeit wählt Marie ein ganz neues Thema: die Strahlen, die Uran aussendet und die Henri Becquerel 1896 entdeckt hatte. Beim Messen verschiedener Mineralien merkt sie, dass manche viel mehr Strahlung abgeben, als das Uran allein erklären kann. Da muss also noch etwas anderes drin sein.</p>
<p>Pierre findet die Spur so vielversprechend, dass er <strong>seine eigene Forschung</strong> über Kristalle <strong>zur Seite legt</strong>, um mit ihr zu arbeiten. 1898 geben sie zwei neue Elemente bekannt: im Juli das Polonium, benannt nach Maries Heimat Polen, und im Dezember das Radium.</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">Die Curies in Zahlen</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">11</span>Ehejahre, oder fast</li>
<li><span class="blog-chiffres-nombre">2</span>Elemente, 1898 gemeinsam entdeckt</li>
<li><span class="blog-chiffres-nombre">5</span>Nobelpreise in der Familie Curie</li>
<li><span class="blog-chiffres-nombre">1.</span>Professorin an der Sorbonne: Marie, 1908</li>
</ul>
</div>
<p>In der Zwischenzeit kommt im September 1897 ihre erste Tochter Irène zur Welt. Sie arbeiten in einem feuchten Schuppen der Hochschule für Physik und Chemie, und Marie erzählte später, wie glücklich diese Arbeitstage dort trotz allem waren.</p>`,
    },
    {
      id: 'der-nobelpreis-1903',
      title: "Der Nobelpreis von 1903, und Pierre mischt sich ein",
      content: `<p>1903 schlagen die französischen Wissenschaftler, die Kandidaten für den Physik-Nobelpreis nennen, Henri Becquerel und Pierre Curie vor. <strong>Marie steht nicht auf der Liste.</strong></p>
<p>Pierre erfährt davon durch ein Mitglied der Schwedischen Akademie, und er antwortet: Wenn man ihn für den Preis in Betracht zieht, dann bitte zusammen mit Madame Curie, für ihre gemeinsame Forschung. Am Ende wird sie mit ihnen ausgezeichnet und ist damit die <strong>erste Frau, die einen Nobelpreis bekommt</strong>.</p>
<p>Das sagt einiges über die beiden aus. Pierre <a href="/de/gesunde-beziehung-test/">behandelt sie auf Augenhöhe</a>, in einer Zeit, in der man eine Wissenschaftlerin schnell für die Assistentin ihres Mannes hielt.</p>`,
    },
    {
      id: 'der-19-april-1906',
      title: "Der 19. April 1906",
      content: `<p>An diesem Donnerstag regnet es in Strömen in Paris. Pierre überquert in Eile eine Straße in der Nähe des Pont-Neuf und gerät unter die Räder eines <strong>Pferdefuhrwerks</strong>, das mit Militäruniformen beladen ist. Er ist sofort tot. Er war 46 Jahre alt.</p>
<p>Marie ist 38 und hat zwei Töchter: Irène, 8 Jahre, und Ève, 16 Monate.</p>
<p>Elf Tage später beginnt sie ein <strong>Tagebuch, das sie direkt an Pierre richtet</strong>, und sie duzt ihn darin. Sie schreibt, dass sie ein Foto von sich in seinen Sarg gelegt hat: das Bild der Frau, die er sich als Gefährtin ausgesucht hatte. Danach erzählt sie ihm von ihren Tagen, von dem, was man ihr anbietet, von dem, was sie fühlt. Im Mai schreibt sie ihm, dass man ihr seinen Lehrstuhl an der Sorbonne angeboten hat und dass sie weder die Sonne noch die Blumen mehr mag.</p>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">💡 Gut zu wissen</p>
<p>Am 5. November 1906 hält Marie ihre erste Vorlesung an der Sorbonne, an Pierres Stelle. Der Saal ist voller Neugieriger und Journalisten, die eine Würdigung von Pierre erwarten. <strong>Sie hält keine Rede</strong>: Sie beginnt direkt mit der Vorlesung, über die Fortschritte der Physik in den letzten zehn Jahren. Zwei Jahre später wird sie die erste Frau, die an der Sorbonne zur Professorin ernannt wird.</p>
</aside>`,
    },
    {
      id: 'zusammen-im-pantheon',
      title: "Zusammen im Panthéon",
      content: `<p>1911 bekommt Marie allein einen zweiten Nobelpreis, diesmal für Chemie. Sie stirbt 1934 und wird in Sceaux begraben, neben Pierre.</p>
<p>1995 werden die beiden zusammen ins Pariser Panthéon überführt. Marie ist <strong>die erste Frau, die dort für ihre eigenen Verdienste beigesetzt wird</strong>.</p>
<p>Ihre Tochter Irène ist übrigens denselben Weg gegangen. Mit ihrem Mann Frédéric Joliot bekam sie 1935 den Nobelpreis für Chemie. Noch ein Forscherpaar!</p>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">💌 Und heute?</p>
<p>Man muss dafür kein chemisches Element entdecken: Viele Paare haben sich über <a href="/de/gemeinsamkeiten-test-paare/">eine gemeinsame Leidenschaft</a> gefunden und behalten sie als etwas, das nur ihnen gehört.</p>
</aside>
<a href="/de/blog/marie-antoinette-fersen-briefe/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Auch lesen</span><span class="blog-read-also-title">Marie Antoinette und Fersen: geschwärzte Briefe mit Röntgenstrahlen gelesen</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>
<a href="/de/blog/juliette-drouet-victor-hugo-briefe/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Auch lesen</span><span class="blog-read-also-title">Juliette Drouet und Victor Hugo: 50 Jahre Liebe und 22.000 Briefe</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>
<p class="blog-sources"><strong>Quellen:</strong> Institut Curie, Seiten zur Geschichte von Pierre und Marie Curie (<a href="https://curie.fr/" rel="noopener" target="_blank">curie.fr</a>, auf Französisch); American Institute of Physics, „Marie Curie and the Science of Radioactivity“ (<a href="https://history.aip.org/exhibits/curie/" rel="noopener" target="_blank">zur Ausstellung, auf Englisch</a>); Universität PSL, virtuelle Ausstellung „Marie Curie, 1867-1934“ (<a href="https://explore.psl.eu/en/discover/virtual-exhibits/marie-curie-1867-1934/trials-tribulations-and-consecration-1906-1919" rel="noopener" target="_blank">explore.psl.eu</a>).</p>
<p class="blog-sources"><strong>Bilder:</strong> Pierre und Marie Curie in ihrem Labor, Fotografie, Wellcome Collection, CC BY 4.0, zugeschnitten; Pierre und Marie Curie 1895, Fotografie, gemeinfrei.</p>`,
    },
  ],
};

export default article;
