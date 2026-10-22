import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'maria-antonieta-fersen-cartas',
  title: "María Antonieta y Fersen: lo que los rayos X revelaron bajo los tachones de sus cartas",
  metaTitle: "María Antonieta y Fersen: sus cartas tachadas, leídas con rayos X",
  metaDescription: "Algunos pasajes de las cartas entre María Antonieta y Axel von Fersen estaban cubiertos de tinta. Unos investigadores los leyeron con rayos X: esto es lo que escondían y quién los tachó.",
  featuredImage: '/blog/marie-antoinette-fersen-lettres.webp',
  featuredImageAlt: "María Antonieta pintada por Élisabeth Vigée Le Brun en 1783, junto al retrato de Axel von Fersen de Carl Fredrik von Breda",
  publishedAt: '2026-10-22T16:30:00+02:00',
  author: AUTHORS['thomas'],
  excerpt: "Durante más de un siglo, líneas enteras de sus cartas eran ilegibles. Unos investigadores franceses las leyeron con rayos X, y ahora sabemos quién las había tachado.",
  introduction: `<p>María Antonieta y el conde sueco Axel von Fersen se escribieron a escondidas durante la Revolución francesa, cuando la familia real vivía vigilada en el palacio de las Tullerías, en París. Una parte de esas cartas se conserva en los Archivos Nacionales de Francia desde 1982. El problema es que algunas palabras, y a veces líneas enteras, están cubiertas de tinta. Durante muchísimo tiempo, nadie pudo leer lo que había debajo.</p>
<p>En 2021, un equipo de investigadores franceses consiguió leer buena parte de esos pasajes gracias a los rayos X. Debajo aparecen cosas como «ma tendre amie» (mi tierna amiga) o «vous que j'aime» (usted, a quien amo)... y ahora sabemos, más o menos, quién cogió la pluma para esconderlas. Esto es lo que había bajo los tachones, y lo que nos cuenta de estos dos.</p>`,
  quickSummary: [
    "Los Archivos Nacionales de Francia conservan desde 1982 una parte de las cartas que María Antonieta y Fersen se escribieron entre 1791 y 1792.",
    "Quince de esas cartas tienen pasajes cubiertos de tinta, desde unas pocas palabras hasta varias líneas.",
    "En 2021, investigadores del Centre de recherche sur la conservation leyeron ocho gracias a la fluorescencia de rayos X.",
    "Bajo la tinta se lee, por ejemplo, «ma tendre amie», «vous que j'aime» o «non pas sans vous».",
    "Por la tinta utilizada, lo más probable es que fuera el propio Fersen quien tachó las cartas.",
  ],
  sections: [
    {
      id: 'quien-era-fersen',
      title: "¿Quién era Axel von Fersen?",
      content: `<p>Hans Axel von Fersen era un conde sueco nacido en 1755, el mismo año que María Antonieta. La conoció en 1774, en un baile de máscaras de la Ópera, cuando los dos tenían 18 años. Ella todavía no era reina: Luis XV murió unos meses después.</p>
<p>Volvió a Francia unos años más tarde, se convirtió en un habitual de la corte y luego se fue a combatir a América durante la guerra de Independencia. Pero lo que de verdad le hizo entrar en la historia fue junio de 1791. Fue él quien organizó la huida de la familia real, la que terminó con su detención en Varennes. Los acompañó hasta Bondy, a la salida de París, y luego los dejó seguir sin él.</p>
<p>Después de Varennes, el rey y la reina fueron devueltos a las Tullerías y vigilados de cerca. Fersen, mal visto en Francia por su papel en la huida, vivía sobre todo en Bruselas. Ya no podían verse, así que se escribían. Volvió una sola vez a escondidas a las Tullerías, en febrero de 1792. Fue la última vez que se vieron: María Antonieta fue guillotinada el 16 de octubre de 1793.</p>`,
    },
    {
      id: 'cartas-escritas-a-escondidas',
      title: "Cartas escritas a escondidas",
      content: `<p>Entre finales de junio de 1791 y finales de junio de 1792, los dos se escribieron con muchas precauciones. Según Anne Michelin, una de las investigadoras que trabajaron sobre estas cartas, usaron tinta invisible (una tinta que no se ve hasta que se revela) y pasajes cifrados. Los tachones se hicieron después.</p>
<p>Fersen lo guardaba todo. Archivaba las cartas de la reina, pero también los borradores de las que él le enviaba, y copiaba algunas cartas importantes, algo muy habitual en la época. Por eso la mayoría de las cartas conservadas están escritas de su puño y letra, incluso cuando el texto es de María Antonieta.</p>
<p>Esos papeles se quedaron en la familia de Fersen hasta 1982, cuando los Archivos Nacionales compraron una parte. Hay 21 cartas de María Antonieta a Fersen, 7 de ellas tachadas, y 27 cartas de Fersen a María Antonieta, 8 de ellas tachadas. En total, 15 cartas en las que alguien cubrió unas palabras, a veces unas líneas, con una tinta tan espesa que ya no se podía leer nada.</p>
<p>Las cartas se publicaron en el siglo XIX gracias a un sobrino nieto de Fersen, sin los pasajes ocultos, claro. Desde entonces, los historiadores se preguntaban qué había debajo: secretos políticos o la prueba de una historia de amor.</p>`,
    },
    {
      id: 'como-se-lee-bajo-un-tachon',
      title: "Cómo se lee una palabra bajo un tachón",
      content: `<p>El trabajo lo hizo el Centre de recherche sur la conservation (CRC), un laboratorio que depende del Museo Nacional de Historia Natural de Francia, del CNRS y del Ministerio de Cultura francés. El estudio se publicó en octubre de 2021 en la revista <em>Science Advances</em>, firmado por Anne Michelin, Fabien Pottier y Christine Andraud.</p>
<p>La idea de partida es bastante sencilla. En aquella época se escribía con tinta ferrogálica, una tinta hecha a base de hierro. Pero de un frasco a otro, esa tinta no lleva exactamente los mismos metales: un poco más de cobre en uno, un poco más de zinc en otro. Si la tinta del texto y la del tachón no tienen la misma composición, en teoría se pueden separar.</p>
<p>Para eso, los investigadores usaron la fluorescencia de rayos X. Se envían rayos X sobre el papel, y cada metal devuelve una señal propia. Al recorrer la hoja punto por punto, se obtiene un mapa del cobre, un mapa del zinc, un mapa del hierro, etc. Y en uno de esos mapas, cuando la tinta escondida lleva un metal que el tachón no tiene, las letras vuelven a aparecer.</p>
<p>Hizo falta mucha paciencia: ¡95 jornadas de escáner para un centenar de líneas tachadas! Y no funcionó en todas partes. De las 15 cartas tachadas, se pudieron leer 8. En las otras 7, ninguno de los métodos permitió recuperar el texto, y de momento siguen siendo ilegibles.</p>`,
    },
    {
      id: 'lo-que-escondian-los-tachones',
      title: "Lo que escondían los tachones",
      content: `<p>Los pasajes recuperados hablan sobre todo de amor. Estos son algunos de los que publicó el estudio, con la ortografía francesa de la época:</p>
<ul>
<li><strong>«ma tendre amie» (mi tierna amiga):</strong> en una carta de Fersen del 13 de octubre de 1791.</li>
<li><strong>«vous que j'aime et aimeroi jusqu'a mon...» (usted, a quien amo y amaré hasta mi...):</strong> en una carta de María Antonieta del 7 de diciembre de 1791. Falta el final de la frase.</li>
<li><strong>«pour le bonheur de tous trois» (por la felicidad de los tres):</strong> en la misma carta, un poco más adelante.</li>
<li><strong>«non pas sans vous» (no sin usted):</strong> en una carta de María Antonieta del 4 de enero de 1792.</li>
</ul>
<p>Anne Michelin resume el vocabulario de los pasajes ocultos con unas pocas palabras que se repiten: «bien amado», «tierno amigo», «adorar», «con locura». ¡Nada de secretos de Estado!</p>
<p>Los fragmentos que transcribió el equipo dan una idea del tono. El 26 de septiembre de 1791, María Antonieta le escribe que ha llorado al saber que pensaba pasar el invierno en Bruselas en lugar de volver a ver a su familia, y le pide que no renuncie a ver a sus padres por ella: «Comptez, mon bien aimé, que mon coeur sent bien tout ce que vous faites pour moi, mais ceci seroit trop exiger» (Tenga por seguro, mi bien amado, que mi corazón siente todo lo que hace usted por mí, pero esto sería exigir demasiado). Dos semanas después, Fersen le escribe: «sans vous il n'est point de bonheur pour moi l'univers n'est rien sans vous» (sin usted no hay felicidad para mí, el universo no es nada sin usted), y un poco más adelante, «vous voir, vous aimer et vous consoler c'est tout ce que je désire» (verla, amarla y consolarla es todo lo que deseo).</p>`,
    },
    {
      id: 'quien-tacho-las-cartas',
      title: "¿Quién tachó las cartas?",
      content: `<p>Durante mucho tiempo, el principal sospechoso fue el sobrino nieto de Fersen, el que publicó la correspondencia. Tenía sentido: un descendiente que quiere proteger el honor de la reina, y el de su familia, antes de hacer públicas las cartas.</p>
<p>Los análisis de la tinta cuentan otra cosa. La tinta de los tachones tiene casi siempre la misma composición que la que usaba Fersen para escribir sus borradores y para copiar las cartas de la reina. En una de las cartas hay incluso un pasaje añadido de su puño y letra, justo encima de un pasaje tachado, con la tinta del tachón. Así que, para los investigadores, parece que fue el propio Fersen quien escondió esas palabras.</p>
<p>Por qué lo hizo, no se sabe. Pudo ser por motivos sentimentales o por motivos políticos: quizá quería poder usar esas cartas para defender a la familia real, protegiendo a la vez el honor de la reina y el suyo propio.</p>`,
    },
    {
      id: 'entonces-se-amaban',
      title: "Entonces, ¿se amaban?",
      content: `<p>Es LA pregunta que todo el mundo se hace desde hace dos siglos, y la respuesta de los investigadores sigue siendo prudente. Los pasajes recuperados muestran una relación íntima, algo que nunca se había demostrado por escrito del lado de Fersen. Pero la propia Anne Michelin lo dice: estos pasajes «no permiten zanjar de forma definitiva la verdadera naturaleza de sus sentimientos».</p>
<p>Lo que sí se puede decir sin equivocarse es que se tenían muchísimo cariño y que corrían riesgos para seguir escribiéndose. Para lo demás, una historia de amor tal como la entendemos hoy o una amistad apasionada, cada uno lo leerá a su manera. En los dos casos, fue un sentimiento que tuvieron que <a href="/es/test-me-quiere-en-secreto/">mantener en secreto</a> hasta el final.</p>
<p>Fersen nunca se casó. Murió el 20 de junio de 1810 en Estocolmo, asesinado por la multitud durante el cortejo fúnebre de un príncipe. El 20 de junio era también el día en que, diecinueve años antes, había sacado a la familia real de París.</p>`,
    },
    {
      id: 'quererse-de-lejos',
      title: "Quererse de lejos, en 1791 y hoy",
      content: `<p>Al leer estos fragmentos, sorprende lo mucho que se parecen a lo que se escriben hoy las personas que viven separadas. Ella se preocupa de que él renuncie a su familia por ella, él le contesta que no necesita nada más que verla. Solo que una carta tardaba días en llegar, y una sola carta interceptada podía salir muy cara.</p>
<p>Las parejas que <a href="/es/quiz-pareja-distancia/">viven lejos la una de la otra</a> conocen bien esa sensación, en una versión mucho más suave: todo pasa por las palabras, y cada mensaje cuenta un poco más de lo normal.</p>
<p class="blog-sources"><strong>Fuentes:</strong> Anne Michelin, Fabien Pottier y Christine Andraud, «2D macro-XRF to reveal redacted sections of French queen Marie-Antoinette secret correspondence with Swedish count Axel von Fersen», <em>Science Advances</em>, octubre de 2021 (<a href="https://doi.org/10.1126/sciadv.abg4266" rel="noopener" target="_blank">leer el estudio</a>); Anne Michelin, «La correspondance de Marie-Antoinette aux rayons X», <em>The Conversation</em>, enero de 2022 (<a href="https://theconversation.com/la-correspondance-de-marie-antoinette-aux-rayons-x-173766" rel="noopener" target="_blank">leer el artículo, en francés</a>).</p>
<p class="blog-sources"><strong>Imagen:</strong> <em>María Antonieta con una rosa</em>, Élisabeth Vigée Le Brun, 1783, palacio de Versalles; retrato de Axel von Fersen, Carl Fredrik von Breda, hacia 1800, museo de Östergötland. Dominio público.</p>`,
    },
  ],
};

export default article;
