import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: '5-lenguajes-del-amor',
  title: "Los 5 lenguajes del amor: por qué os queréis sin entenderos",
  metaTitle: "Los 5 lenguajes del amor explicados (y cómo usarlos)",
  metaDescription: "Él te trae regalos, tú querías tiempo. Tú le haces cumplidos, él quería gestos... Los 5 lenguajes del amor explicados, con el manual de uso que cambia una pareja.",
  featuredImage: '/blog/5-langages-de-l-amour.webp',
  featuredImageAlt: "Cinco burbujas de colores que simbolizan los cinco lenguajes del amor alrededor de una pareja",
  publishedAt: '2026-12-15',
  author: AUTHORS['thomas'],
  excerpt: "El drama de muchas parejas no es la falta de amor... es un problema de traducción. Cada uno habla su idioma y nadie tiene el diccionario.",
  introduction: `<p>Aquí va una escena que quizá hayas vivido. Él llega con un regalo, orgullosísimo... y tú, en el fondo, habrías preferido que llegara antes, sin más. O al revés: tú le repites que le quieres, le haces cumplidos... y él apenas parece oírlo, cuando un simple abrazo le habría llenado. Cada uno da, sinceramente. Y cada uno tiene la impresión de recibir... al lado.</p>
<p><strong>Es exactamente el problema que el concepto de los 5 lenguajes del amor sacó a la luz: no todos expresamos el amor de la misma manera, y damos espontáneamente en NUESTRO idioma... no en el del otro.</strong> La idea viene del consejero conyugal estadounidense Gary Chapman, en los años noventa, y si dio la vuelta al mundo es porque describe algo que todas las parejas reconocen al instante.</p>
<p>Así que hagamos el recorrido completo: los 5 lenguajes uno por uno, cómo identificar el tuyo y el suyo (los dos se adivinan más fácilmente de lo que parece), los malentendidos clásicos... y el manual de uso concreto, porque es ahí donde el concepto se vuelve mágico. O no, la verdad: también hablaremos de sus límites, honestamente.</p>`,
  quickSummary: [
    "Los 5 lenguajes: las palabras, el tiempo de calidad, los actos de servicio, los regalos, el contacto físico.",
    "Damos espontáneamente en NUESTRO idioma... y medimos el amor recibido también en nuestro idioma.",
    "El malentendido clásico: dos personas que dan mucho y que se sienten cada una poco querida.",
    "Tu lenguaje se adivina en lo que más te duele... y en lo que reprochas más a menudo.",
    "Hablar el idioma del otro es un aprendizaje, no un don: se trabaja de forma muy concreta.",
  ],
  sections: [
    {
      id: 'los-5-lenguajes-uno-por-uno',
      title: "Los 5 lenguajes, uno por uno",
      content: `<p><strong>1. Las palabras de afirmación.</strong> Los «te quiero», los cumplidos, los ánimos, las palabras bonitas. Para este perfil, el amor que no se dice solo existe a medias. Su combustible: oírlo. Su herida: las críticas, que golpean diez veces más fuerte que la media, y los silencios, que suenan a desamor.</p>
<p><strong>2. El tiempo de calidad.</strong> No solo estar juntos: estar juntos DE VERDAD. Una conversación sin móvil, un paseo a dos, una atención plena. Este perfil mide el amor en presencia real. Su herida: la pantalla mientras habla, los «sí, sí» distraídos, los años de vida común sin un solo cara a cara auténtico.</p>
<p><strong>3. Los actos de servicio.</strong> El amor en actos: el café preparado, el coche arreglado, el papeleo resuelto, la cena esperando. «Deja, ya me encargo yo» es su declaración de amor. Su herida: cargar solo con todo y descubrir que sus mil gestos pasan por funcionamiento normal... no por amor.</p>
<p><strong>4. Los regalos.</strong> Cuidado con el malentendido: ¡no es materialismo! El regalo cuenta como prueba de pensamiento: «pensó en mí, sin mí». La flor recogida vale tanto como la joya. Su herida: los cumpleaños olvidados, los regalos sin atención (la tarjeta regalo de última hora), el «ya no nos hacemos regalos».</p>
<p><strong>5. El contacto físico.</strong> La mano cogida, el abrazo de la noche, el hombro tocado al pasar, la cercanía de los cuerpos, mucho más allá de la sexualidad. Este perfil se siente querido por la piel. Su herida: la cama de dos territorios, las semanas sin un gesto, la ternura convertida en protocolo.</p>
<div><table><thead><tr><th>El lenguaje</th><th>Lo que lo llena</th><th>Lo que lo vacía</th></tr></thead><tbody>
<tr><td><strong>Palabras de afirmación</strong></td><td>Un cumplido sincero, un «estoy orgulloso de ti» en el momento justo</td><td>La crítica y el silencio que suena a desamor</td></tr>
<tr><td><strong>Tiempo de calidad</strong></td><td>Una hora sin pantallas, una conversación de verdad</td><td>El «sí, sí» distraído, la presencia sin atención</td></tr>
<tr><td><strong>Actos de servicio</strong></td><td>«Deja, ya me encargo yo»</td><td>Cargar solo y que se tome por funcionamiento normal</td></tr>
<tr><td><strong>Regalos</strong></td><td>La prueba de que se ha pensado en él sin él</td><td>La fecha olvidada, el regalo elegido en treinta segundos</td></tr>
<tr><td><strong>Contacto físico</strong></td><td>La mano cogida, el hombro tocado al pasar</td><td>Las semanas sin un gesto, la ternura vuelta protocolo</td></tr>
</tbody></table></div>`,
    },
    {
      id: 'encontrar-tu-lenguaje',
      title: "Cómo identificar tu lenguaje (y el suyo)",
      content: `<p>El reflejo clásico es decirse «yo soy un poco de todo»... ¡y es cierto, a todo el mundo le gustan los cinco! Pero hay una jerarquía, y dos detectores la revelan sin fallo.</p>`,
      subsections: [
        {
          id: 'detector-1-lo-que-mas-te-duele',
          title: "Detector n.º 1: lo que más te duele",
          content: `<p>El lenguaje dominante se detecta menos en lo que da gusto que en lo que HACE DAÑO cuando falta. Rebusca en tus rencores recurrentes: «nunca me dice que...» (palabras), «ya no pasamos tiempo...» (tiempo), «aquí lo hago todo yo...» (servicio), «se ha vuelto a olvidar de...» (regalos), «ya no nos tocamos...» (contacto). Tu reproche preferido es tu lenguaje pidiendo comida a gritos.</p>`,
        },
        {
          id: 'detector-2-lo-que-das',
          title: "Detector n.º 2: lo que das espontáneamente",
          content: `<p>Por defecto ofrecemos lo que nos gustaría recibir. Quien hace cumplidos sin parar habla «palabras». Quien organiza fines de semana habla «tiempo». Quien arregla, prepara, gestiona, habla «servicio». Mira lo que más te da tu pareja: no es lo que cree que quieres. Es SU lengua materna la que te habla... y eso ya es una declaración.</p>
<p>Haz el ejercicio para los dos, ahora, mentalmente: tu top 2, su top 2. Si no tenéis ningún lenguaje en común, ¡probablemente acabes de entender diez años de malentendidos! Y si quieres una medida más serena que la intuición, el <a href="/es/test-lenguaje-amor-pareja/">test de los lenguajes del amor</a> establece tu perfil completo, lenguaje por lenguaje... para hacer cada uno por su lado, evidentemente.</p>
<aside class="blog-tip-box">
<p class="blog-tip-box-title">📌 El malentendido más frecuente de las parejas</p>
<p>Dos personas que se quieren mucho, que dan mucho... y que se sienten cada una poco querida. Él multiplica los servicios (su idioma), ella espera palabras (el suyo): él se agota, ella se seca, ¡y cada uno piensa que da más de lo que recibe! No es un problema de amor, es un problema de cambio de divisa: cada uno paga en una moneda que el otro no convierte.</p>
</aside>`,
        },
      ],
    },
    {
      id: 'el-manual-de-uso',
      title: "El manual de uso: hablar un idioma que no es el tuyo",
      content: `<p>Aquí es donde el concepto pasa de «test simpático» a «herramienta que cambia una pareja». Tres reglas hacen todo el trabajo.</p>`,
      subsections: [
        {
          id: 'regla-1-dar-en-el-idioma-del-otro',
          title: "Regla 1: se da en el idioma del OTRO",
          content: `<p>Parece obvio, ¡y es antinatural! Si tu lenguaje es «servicio», ofrecer palabras te parecerá artificial, casi incómodo. Normal: estás hablando una lengua extranjera. Hazlo igualmente, con torpeza si hace falta. Un «estoy orgulloso de ti» cojo en el idioma del otro vale más que diez gestos perfectos en el tuyo.</p>`,
        },
        {
          id: 'regla-2-traducir-lo-que-se-recibe',
          title: "Regla 2: se traduce lo que se recibe",
          content: `<p>En el otro sentido, aprende a convertir: cuando se pasa el fin de semana arreglando tu coche, TRADUCE. No es «prefiere bricolar antes que pasar tiempo conmigo»... es «te quiero» en lenguaje servicio. La traducción no sustituye a tus necesidades, pero cambia todo el clima: descubres que eres más querida de lo que creías, solo que en un idioma que no leías.</p>`,
        },
        {
          id: 'regla-3-pedir-sin-verguenza',
          title: "Regla 3: se pide sin vergüenza",
          content: `<p>«Si quieres darme una alegría, dime cosas, es una tontería pero es lo mío.» ¡Esa frase no le quita NINGÚN valor a las palabras que vendrán después, al contrario de la leyenda! El mito del «si me quisiera, lo sabría» ha matado más parejas que las incompatibilidades reales. Nadie adivina una lengua extranjera: se enseña.</p>
<p>Y un truco de ritmo para terminar: elegid cada uno UN gesto por semana en el idioma del otro, uno solo, pero deliberado. Al cabo de un mes el efecto ya está ahí. Es el mismo principio que las <a href="/es/blog/preguntas-para-conoceros-mejor/">preguntas para conoceros mejor</a>: la regularidad modesta gana al gran gesto.</p>`,
        },
      ],
    },
    {
      id: 'los-limites-del-concepto',
      title: "Los límites del concepto (porque los tiene)",
      content: `<p>Seamos completos: los 5 lenguajes son una herramienta estupenda... y no una ciencia exacta. El concepto viene del asesoramiento conyugal, no de la investigación académica, y los estudios recientes matizan dos puntos: los «lenguajes» no son categorías estancas (todo el mundo necesita un poco de los cinco, y la jerarquía se mueve según las etapas)... y hablar el idioma del otro mejora las parejas, sí, pero no más que estar globalmente atento a sus necesidades. Dicho de otro modo: la magia no está en la tipología, está en la atención.</p>
<p>Y una advertencia que cuenta: los lenguajes del amor explican los malentendidos entre gente de buena fe... NUNCA excusan los desequilibrios de fondo. «Los servicios no son mi lenguaje» no es un motivo para no tocar jamás una sartén. Y si tú das en todos los idiomas mientras enfrente no llega nada en ninguno... eso ya no es un problema de traducción. Es un problema de implicación, y se mira de frente.</p>
<div class="blog-cta">
<p class="blog-cta-titre">Descubrid vuestros dos lenguajes, esta noche</p>
<p class="blog-cta-texte">El test establece tu perfil completo en los cinco lenguajes, con tu dominante y tu punto ciego. Hacedlo cada uno por vuestro lado, comparad... y regalaos la conversación más útil del mes.</p>
<a class="blog-cta-btn" href="/es/test-lenguaje-amor-pareja/">Descubrir mi lenguaje</a>
<p class="blog-cta-note">Gratis &middot; Sin registro &middot; Resultado inmediato</p>
</div>
<p>Porque eso es, en el fondo, el verdadero regalo del concepto: no las etiquetas... la conversación que provoca. Aquella en la que cada uno explica cómo quiere y cómo se siente querido. Muchas parejas nunca han tenido esa conversación. ¡Ahora tenéis la excusa perfecta!</p>
<a href="/es/blog/preguntas-para-conoceros-mejor/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Leer también</span><span class="blog-read-also-title">60 preguntas para conoceros mejor, aunque creáis saberlo todo</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
