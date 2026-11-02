import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'pierre-en-marie-curie-liefdesverhaal',
  title: "Na de dood van Pierre bleef Marie Curie hem schrijven: het liefdesverhaal van de Curies",
  metaTitle: "Pierre en Marie Curie: het liefdesverhaal achter het radium",
  metaDescription: "Een bruiloft zonder witte jurk, twee fietsen als huwelijksreis, het radium en het ongeluk van 1906: het liefdesverhaal van Pierre en Marie Curie.",
  featuredImage: '/blog/pierre-marie-curie-histoire-amour.webp',
  featuredImageAlt: "Pierre en Marie Curie in hun laboratorium, hij staand en zij zittend voor hun instrumenten, met links een collega",
  publishedAt: '2026-11-02',
  modifiedAt: '2026-11-02',
  author: AUTHORS['thomas'],
  excerpt: "Na het ongeluk van Pierre in 1906 hield Marie Curie een dagboek bij dat ze rechtstreeks aan hem richtte. Dit is hun verhaal, van hun ontmoeting in 1894 tot het Panthéon.",
  introduction: `<p>Marie Curie kennen we vooral van haar twee Nobelprijzen. Minder bekend is dat ze met Pierre Curie <strong>een echt liefdesverhaal</strong> beleefde, dat iets meer dan tien jaar duurde en in 1906 ineens ophield, in een Parijse straat.</p>
<p>Ze deden alles samen, het werk inbegrepen. En toen Pierre stierf, bleef Marie tegen hem praten... in een dagboek dat ze aan hem richtte.</p>`,
  quickSummary: [
    "Maria Skłodowska en Pierre Curie ontmoeten elkaar in 1894 in Parijs en trouwen in juli 1895.",
    "Geen witte jurk en geen trouwringen: een donkerblauwe jurk die ze daarna in het laboratorium droeg, en twee fietsen voor de huwelijksreis.",
    "Samen ontdekken ze in 1898 polonium en radium, en in 1903 krijgen ze de Nobelprijs voor natuurkunde.",
    "Na de dood van Pierre, in april 1906, houdt Marie een dagboek bij dat ze aan hem richt, en neemt ze zijn colleges aan de Sorbonne over.",
  ],
  sections: [
    {
      id: 'hoe-ze-elkaar-leerden-kennen',
      title: "Hoe Marie en Pierre elkaar leerden kennen",
      content: `<p>In 1891 verlaat Maria Skłodowska Warschau om in Parijs te studeren, aan de Sorbonne.</p>
<p>In het voorjaar van 1894 zoekt ze een laboratorium voor onderzoek naar het magnetisme van staal. Een Poolse hoogleraar die in Parijs op bezoek is, Józef Kowalski, stelt haar voor aan iemand die haar zou kunnen helpen: <strong>Pierre Curie, een natuurkundige die acht jaar ouder is</strong> en lesgeeft aan de École de physique et de chimie, de Parijse school voor natuurkunde en scheikunde.</p>
<p>Die zomer gaat Maria met vakantie naar Polen, zonder te weten of ze naar Frankrijk terugkomt. Pierre schrijft haar, meerdere keren, om haar over te halen in Parijs te promoveren.</p>
<blockquote><p>“... het leven naast elkaar doorbrengen, gehypnotiseerd door onze dromen: uw vaderlandse droom, onze humanitaire droom en onze wetenschappelijke droom.”<br><small>Pierre Curie aan Maria Skłodowska, zomer 1894 (vertaald uit het Frans)</small></p></blockquote>
<p>In de herfst komt ze terug naar Parijs. De zomer daarop trouwen ze.</p>`,
    },
    {
      id: 'bruiloft-zonder-witte-jurk',
      title: "Een bruiloft zonder witte jurk",
      content: `<p>Het huwelijk vindt plaats op 26 juli 1895, op het gemeentehuis van Sceaux. <strong>Geen kerk, geen trouwringen</strong>: een burgerlijk huwelijk, met de familie en een paar vrienden.</p>
<p>Ook geen witte jurk. Marie kiest een eenvoudige donkerblauwe jurk die ze elke dag weer kan dragen. En dat doet ze ook: ze draagt hem daarna jarenlang in het laboratorium.</p>
<figure class="blog-portrait"><img src="/blog/pierre-marie-curie-1895.webp" alt="Foto van Pierre en Marie Curie in 1895, naast elkaar staand, zij houdt zijn arm vast" width="620" height="826" loading="lazy"><figcaption>Pierre en Marie Curie in 1895, het jaar van hun huwelijk.</figcaption></figure>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">🚲 De huwelijksreis</p>
<p>Van het geld dat ze als huwelijkscadeau krijgen, kopen ze <strong>twee fietsen</strong>. Dat is hun huwelijksreis: fietstochten over kleine landweggetjes, in de zomer van 1895.</p>
</aside>`,
    },
    {
      id: 'het-radium-samen-ontdekt',
      title: "Het radium, een ontdekking met z’n tweeën",
      content: `<p>Voor haar proefschrift kiest Marie een gloednieuw onderwerp: de straling die uranium uitzendt, in 1896 ontdekt door Henri Becquerel. Als ze ertsen meet, merkt ze dat sommige veel meer straling uitzenden dan het uranium alleen kan verklaren. Er zit dus iets anders in.</p>
<p>Pierre vindt het spoor zo veelbelovend dat hij <strong>zijn eigen onderzoek naar kristallen opzijzet</strong> om met haar samen te werken. In 1898 maken ze twee nieuwe elementen bekend: in juli het polonium, genoemd naar Polen, het land van Marie, en in december het radium.</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">De Curies in cijfers</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">11</span>jaar getrouwd, of bijna</li>
<li><span class="blog-chiffres-nombre">2</span>elementen samen ontdekt in 1898</li>
<li><span class="blog-chiffres-nombre">5</span>Nobelprijzen in de familie Curie</li>
<li><span class="blog-chiffres-nombre">1e</span>vrouwelijke hoogleraar aan de Sorbonne: Marie, in 1908</li>
</ul>
</div>
<p>Intussen is in september 1897 hun eerste dochter geboren, Irène. Ze werken in een vochtige loods van de École de physique et de chimie, en Marie zal later vertellen over de heel gelukkige werkdagen die ze daar, ondanks alles, hebben doorgebracht.</p>`,
    },
    {
      id: 'de-nobelprijs-van-1903',
      title: "De Nobelprijs van 1903, en Pierre die zich ermee bemoeit",
      content: `<p>In 1903 noemen de Franse wetenschappers die namen voordragen voor de Nobelprijs voor natuurkunde Henri Becquerel en Pierre Curie. <strong>Marie staat niet op de lijst.</strong></p>
<p>Pierre hoort het van een lid van de Zweedse Academie, en hij antwoordt: als men aan hem denkt voor de prijs, wil hij dat het samen met Madame Curie is, voor hun gezamenlijke onderzoek. Uiteindelijk wordt ze samen met hen bekroond, en wordt ze de <strong>eerste vrouw die een Nobelprijs krijgt</strong>.</p>
<p>Dat zegt nogal wat over hun relatie. Pierre <a href="/nl/gezonde-relatie-test/">behandelt haar als zijn gelijke</a>, in een tijd waarin een vrouwelijke wetenschapper al snel voor de assistente van haar man werd aangezien.</p>`,
    },
    {
      id: '19-april-1906',
      title: "19 april 1906",
      content: `<p>Die donderdag regent het hard in Parijs. Pierre steekt gehaast een straat over bij de Pont Neuf en komt onder de wielen van een <strong>door paarden getrokken kar</strong>, beladen met militaire uniformen. Hij is op slag dood. Hij was 46.</p>
<p>Marie is 38 en heeft twee dochters: Irène van 8, en Ève van 16 maanden.</p>
<p>Elf dagen later begint ze een <strong>dagboek dat ze rechtstreeks aan Pierre richt</strong>, alsof ze tegen hem praat. Ze schrijft dat ze een foto van zichzelf in zijn kist heeft gelegd: het portret van de vrouw die hij als levensgezellin had gekozen. Daarna vertelt ze hem over haar dagen, over wat haar wordt aangeboden, over wat ze voelt. In mei schrijft ze hem dat ze zijn leerstoel aan de Sorbonne mag overnemen, en dat ze niet meer van de zon of van bloemen houdt.</p>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">💡 Goed om te weten</p>
<p>Op 5 november 1906 geeft Marie haar eerste college aan de Sorbonne, in de plaats van Pierre. De zaal zit vol nieuwsgierigen en journalisten, die een eerbetoon aan Pierre verwachten. <strong>Ze houdt geen toespraak</strong>: ze begint meteen aan haar college, over de vooruitgang van de natuurkunde in de tien jaar daarvoor. Twee jaar later wordt ze de eerste vrouw die tot hoogleraar aan de Sorbonne wordt benoemd.</p>
</aside>`,
    },
    {
      id: 'samen-in-het-pantheon',
      title: "Samen in het Panthéon",
      content: `<p>In 1911 krijgt Marie in haar eentje een tweede Nobelprijs, dit keer voor scheikunde. Ze sterft in 1934 en wordt in Sceaux begraven, naast Pierre.</p>
<p>In 1995 worden hun stoffelijke resten samen naar het Panthéon overgebracht. Marie is <strong>de eerste vrouw die daar om haar eigen verdiensten een plaats krijgt</strong>.</p>
<p>Hun dochter Irène is trouwens dezelfde weg gegaan. Met haar man, Frédéric Joliot, kreeg ze in 1935 de Nobelprijs voor scheikunde. Weer een stel onderzoekers!</p>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">💌 En vandaag?</p>
<p>Je hoeft geen scheikundig element te ontdekken: veel stellen hebben elkaar gevonden dankzij <a href="/nl/hoeveel-hebben-we-gemeen/">een gedeelde passie</a>, en houden die als iets wat alleen van hen is.</p>
</aside>
<a href="/nl/blog/marie-antoinette-fersen-brieven/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lees ook</span><span class="blog-read-also-title">Marie-Antoinette en Fersen: wat röntgenstralen onthulden onder de doorhalingen in hun brieven</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>
<a href="/nl/blog/juliette-drouet-victor-hugo-brieven/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lees ook</span><span class="blog-read-also-title">Juliette Drouet schreef 22.000 liefdesbrieven aan Victor Hugo: hun verhaal</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>
<p class="blog-sources"><strong>Bronnen:</strong> Institut Curie, pagina’s over de geschiedenis van Pierre en Marie Curie (<a href="https://curie.fr/" rel="noopener" target="_blank">curie.fr</a>, in het Frans); American Institute of Physics, ‘Marie Curie and the Science of Radioactivity’ (<a href="https://history.aip.org/exhibits/curie/" rel="noopener" target="_blank">bekijk de tentoonstelling, in het Engels</a>); Université PSL, online tentoonstelling ‘Marie Curie, 1867-1934’ (<a href="https://explore.psl.eu/en/discover/virtual-exhibits/marie-curie-1867-1934/trials-tribulations-and-consecration-1906-1919" rel="noopener" target="_blank">explore.psl.eu</a>).</p>
<p class="blog-sources"><strong>Afbeeldingen:</strong> Pierre en Marie Curie in hun laboratorium, foto, Wellcome Collection, CC BY 4.0, bijgesneden; Pierre en Marie Curie in 1895, foto, publiek domein.</p>`,
    },
  ],
};

export default article;
