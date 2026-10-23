import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'pierre-marie-curie-historia-amor',
  title: "Tras la muerte de Pierre, Marie Curie siguió escribiéndole: la historia de amor de los Curie",
  metaTitle: "Pierre y Marie Curie: su historia de amor, de 1894 al Panteón",
  metaDescription: "Un encuentro en 1894, una boda sin vestido blanco, dos bicicletas para la luna de miel, el radio y el accidente de 1906. La historia de amor de Pierre y Marie Curie.",
  featuredImage: '/blog/pierre-marie-curie-histoire-amour.webp',
  featuredImageAlt: "Pierre y Marie Curie en su laboratorio, de pie y sentada ante sus instrumentos, con un colega a la izquierda",
  publishedAt: '2026-10-23T08:10:00+02:00',
  author: AUTHORS['thomas'],
  excerpt: "Tras el accidente de Pierre en 1906, Marie Curie llevó un diario que le dirigía directamente a él. Esta es su historia, desde que se conocieron en 1894 hasta el Panteón.",
  introduction: `<p>A Marie Curie se la conoce sobre todo por sus dos premios Nobel. Se sabe menos que vivió con Pierre Curie <strong>una auténtica historia de amor</strong>, que duró algo más de diez años y se terminó de golpe, en 1906, en una calle de París.</p>
<p>Lo hicieron todo juntos, el trabajo incluido. Y cuando Pierre murió, Marie siguió hablándole... en un diario que le escribía.</p>`,
  quickSummary: [
    "Maria Skłodowska y Pierre Curie se conocen en París en 1894 y se casan en julio de 1895.",
    "Ni vestido blanco ni alianzas: un traje azul oscuro que después llevará en el laboratorio, y dos bicicletas para la luna de miel.",
    "Juntos descubren el polonio y el radio en 1898, y reciben el Nobel de Física en 1903.",
    "Tras la muerte de Pierre, en abril de 1906, Marie lleva un diario dirigido a él y se hace cargo de su curso en la Sorbona.",
  ],
  sections: [
    {
      id: 'como-se-conocieron',
      title: "Cómo se conocieron Marie y Pierre",
      content: `<p>En 1891, Maria Skłodowska deja Varsovia para estudiar en París, en la Sorbona.</p>
<p>En la primavera de 1894, busca un laboratorio para un trabajo sobre el magnetismo de los aceros. Un profesor polaco de paso por París, Józef Kowalski, le presenta a alguien que podría ayudarla: <strong>Pierre Curie, un físico ocho años mayor que ella</strong>, que da clases en la Escuela de Física y Química de la ciudad de París.</p>
<p>Ese verano, Maria vuelve a Polonia de vacaciones, sin saber si regresará a Francia. Pierre le escribe, varias veces, para convencerla de que vuelva a hacer su doctorado en París.</p>
<blockquote><p>«... passer la vie l'un près de l'autre, hypnotisés dans nos rêves : votre rêve patriotique, notre rêve humanitaire et notre rêve scientifique» (... pasar la vida el uno junto al otro, hipnotizados en nuestros sueños: su sueño patriótico, nuestro sueño humanitario y nuestro sueño científico)<br><small>Pierre Curie a Maria Skłodowska, verano de 1894</small></p></blockquote>
<p>Ella vuelve a París en otoño. Se casan el verano siguiente.</p>`,
    },
    {
      id: 'una-boda-sin-vestido-blanco',
      title: "Una boda sin vestido blanco",
      content: `<p>La boda se celebra el 26 de julio de 1895 en el ayuntamiento de Sceaux, a las afueras de París. <strong>Ni iglesia ni alianzas</strong>: una boda civil, con la familia y unos pocos amigos.</p>
<p>Tampoco hay vestido blanco. Marie elige un traje azul oscuro, sencillo, que pueda volver a ponerse cualquier día. Y eso es lo que hace: lo llevará después en el laboratorio durante años.</p>
<figure class="blog-portrait"><img src="/blog/pierre-marie-curie-1895.webp" alt="Fotografía de Pierre y Marie Curie en 1895, de pie uno al lado del otro, ella apoyada en su brazo" width="620" height="826" loading="lazy"><figcaption>Pierre y Marie Curie en 1895, el año de su boda.</figcaption></figure>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">🚲 La luna de miel</p>
<p>Con el dinero que les regalan por la boda, se compran <strong>dos bicicletas</strong>. Su luna de miel es eso: paseos en bici por carreteras pequeñas de campo, durante el verano de 1895.</p>
</aside>`,
    },
    {
      id: 'el-radio-un-descubrimiento-de-dos',
      title: "El radio, un descubrimiento de los dos",
      content: `<p>Para su tesis, Marie elige un tema nuevecito: los rayos que emite el uranio, descubiertos por Henri Becquerel en 1896. Midiendo distintos minerales, se da cuenta de que algunos emiten mucho más de lo que el uranio por sí solo puede explicar. O sea, que dentro hay otra cosa.</p>
<p>A Pierre la pista le parece tan prometedora que <strong>deja a un lado sus propias investigaciones</strong>, sobre los cristales, para trabajar con ella. En 1898 anuncian dos elementos nuevos: el polonio en julio, llamado así por Polonia, el país de Marie, y después el radio en diciembre.</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">Los Curie en cifras</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">11</span>años de matrimonio, o casi</li>
<li><span class="blog-chiffres-nombre">2</span>elementos descubiertos juntos en 1898</li>
<li><span class="blog-chiffres-nombre">5</span>premios Nobel en la familia Curie</li>
<li><span class="blog-chiffres-nombre">1.ª</span>mujer profesora en la Sorbona: Marie, en 1908</li>
</ul>
</div>
<p>Mientras tanto, su primera hija, Irène, nace en septiembre de 1897. Trabajan en un cobertizo húmedo de la Escuela de Física y Química, y Marie contará más tarde lo felices que fueron aquellos días de trabajo, a pesar de todo.</p>`,
    },
    {
      id: 'el-nobel-de-1903',
      title: "El Nobel de 1903, y Pierre que se mete por medio",
      content: `<p>En 1903, los científicos franceses que proponen nombres para el Nobel de Física citan a Henri Becquerel y a Pierre Curie. <strong>Marie no está en la lista.</strong></p>
<p>Pierre se entera por un miembro de la Academia sueca, y le contesta: si se está pensando en él para el premio, quiere que sea junto a Madame Curie, por sus investigaciones en común. Al final ella recibe el premio con ellos, y se convierte en la <strong>primera mujer en ganar un premio Nobel</strong>.</p>
<p>Eso dice bastante de su pareja. Pierre la <a href="/es/test-relacion-sana/">trata de igual a igual</a>, en una época en la que a una mujer científica se la tomaba fácilmente por la ayudante de su marido.</p>`,
    },
    {
      id: 'el-19-de-abril-de-1906',
      title: "El 19 de abril de 1906",
      content: `<p>Ese jueves llueve a cántaros en París. Pierre cruza deprisa una calle cerca del Pont-Neuf y cae bajo las ruedas de un <strong>carro tirado por caballos</strong>, cargado de uniformes militares. Muere en el acto. Tenía 46 años.</p>
<p>Marie tiene 38 años y dos hijas: Irène, de 8 años, y Ève, de 16 meses.</p>
<p>Once días después, empieza un <strong>diario que le dirige directamente a Pierre</strong>, tuteándolo. En él cuenta que metió una foto suya en su ataúd: el retrato de la mujer que él había elegido como compañera. Después le cuenta sus días, lo que le proponen, lo que siente. En mayo le escribe que le han ofrecido su cátedra en la Sorbona, y que ya no le gustan ni el sol ni las flores.</p>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">💡 Conviene saberlo</p>
<p>El 5 de noviembre de 1906, Marie da su primera clase en la Sorbona, en lugar de Pierre. La sala está llena de curiosos y periodistas, que esperan un homenaje a Pierre. <strong>No hace ningún discurso</strong>: empieza directamente la clase, sobre los avances de la física en los últimos diez años. Dos años después, se convierte en la primera mujer nombrada profesora en la Sorbona.</p>
</aside>`,
    },
    {
      id: 'juntos-en-el-panteon',
      title: "Juntos en el Panteón",
      content: `<p>En 1911, Marie recibe sola un segundo Nobel, esta vez de Química. Muere en 1934 y la entierran en Sceaux, al lado de Pierre.</p>
<p>En 1995, sus restos se trasladan juntos al Panteón de París. Marie es <strong>la primera mujer que entra allí por sus propios méritos</strong>.</p>
<p>Por cierto, su hija Irène siguió el mismo camino. Con su marido, Frédéric Joliot, recibió el Nobel de Química en 1935. ¡Otra pareja de investigadores!</p>
<aside class="blog-tip-box" role="note">
<p class="blog-tip-box-title">💌 ¿Y hoy?</p>
<p>No hace falta descubrir un elemento químico: muchas parejas se han encontrado gracias a <a href="/es/test-puntos-comunes-pareja/">una pasión en común</a>, y la guardan como un terreno solo suyo.</p>
</aside>
<a href="/es/blog/maria-antonieta-fersen-cartas/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Leer también</span><span class="blog-read-also-title">María Antonieta y Fersen: sus cartas tachadas, leídas con rayos X</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>
<a href="/es/blog/juliette-drouet-victor-hugo-cartas/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Leer también</span><span class="blog-read-also-title">Juliette Drouet y Victor Hugo: 50 años de amor y 22.000 cartas</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>
<p class="blog-sources"><strong>Fuentes:</strong> Institut Curie, páginas sobre la historia de Pierre y Marie Curie (<a href="https://curie.fr/" rel="noopener" target="_blank">curie.fr</a>, en francés); American Institute of Physics, «Marie Curie and the Science of Radioactivity» (<a href="https://history.aip.org/exhibits/curie/" rel="noopener" target="_blank">ver la exposición, en inglés</a>); Universidad PSL, exposición virtual «Marie Curie, 1867-1934» (<a href="https://explore.psl.eu/en/discover/virtual-exhibits/marie-curie-1867-1934/trials-tribulations-and-consecration-1906-1919" rel="noopener" target="_blank">explore.psl.eu</a>).</p>
<p class="blog-sources"><strong>Imágenes:</strong> Pierre y Marie Curie en su laboratorio, fotografía, Wellcome Collection, CC BY 4.0, recortada; Pierre y Marie Curie en 1895, fotografía, dominio público.</p>`,
    },
  ],
};

export default article;
