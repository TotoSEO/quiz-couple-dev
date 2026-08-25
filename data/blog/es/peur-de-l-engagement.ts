import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'miedo-al-compromiso',
  title: "El miedo al compromiso: lo que se esconde detrás (y cómo avanzar)",
  metaTitle: "Miedo al compromiso: causas, señales y cómo desbloquearlo",
  metaDescription: "¿Lleva dos años diciendo que «no está preparado»? ¿O eres tú quien se bloquea? El miedo al compromiso descifrado: sus causas reales, sus señales... y cómo salir de ahí.",
  featuredImage: '/blog/peur-de-l-engagement.webp',
  featuredImageAlt: "Persona dudando ante una puerta abierta en forma de corazón, con una maleta en la mano",
  publishedAt: '2026-12-08T08:31:00+01:00',
  author: AUTHORS['thomas'],
  excerpt: "El miedo al compromiso casi nunca es miedo a la otra persona. Es miedo a lo que uno cree que va a perder comprometiéndose... y eso cambia todo el problema.",
  introduction: `<p>«No estoy preparado.» Tres palabras que pueden mantener una relación en suspenso durante años. No preparado para oficializar, no preparado para irse a vivir juntos, no preparado para proyectarse. Y enfrente alguien espera, entre la paciencia y el desgaste, haciéndose la pregunta de verdad: ¿el problema soy yo, o es él?</p>
<p>Respuesta corta: ninguno de los dos, la mayoría de las veces. <strong>El miedo al compromiso casi nunca es miedo a la otra persona: es miedo a lo que uno cree que va a perder comprometiéndose.</strong> Su libertad, su identidad, sus opciones... o un miedo aún más antiguo, el de repetir un naufragio que se vio demasiado de cerca.</p>
<p>Este artículo se dirige a las dos personas del problema: quien se bloquea y quien espera. Las causas reales, las señales que distinguen el miedo del simple desinterés... y las palancas para avanzar, en un sentido o en otro. Porque quedarse años en el entremedio es la peor opción para todo el mundo.</p>`,
  quickSummary: [
    "El miedo al compromiso es miedo a perder (libertad, identidad, opciones)... no miedo a la otra persona.",
    "Sus raíces clásicas: el naufragio parental, las heridas de un ex, el apego evitativo, el mito de la elección perfecta.",
    "La prueba de verdad: ¿miedo o desinterés? El miedo avanza a pasitos, el desinterés no avanza nunca.",
    "El miedo al compromiso no se cura suprimiendo el compromiso... sino troceándolo.",
    "Para quien espera: un plazo razonable se concede, un plazo infinito se rechaza.",
  ],
  sections: [
    {
      id: 'las-causas-reales',
      title: "Lo que se esconde detrás del miedo al compromiso",
      content: `<p>«Fobia al compromiso», la expresión hace sonreír... pero el mecanismo es serio, y casi siempre tiene una de estas cuatro raíces.</p>`,
      subsections: [
        {
          id: 'el-naufragio-visto-de-cerca',
          title: "El naufragio visto de cerca",
          content: `<p>Crecer entre los escombros de una pareja parental, un divorcio en guerra, un matrimonio muerto viviente, deja una ecuación grabada: compromiso = trampa. Quien se bloquea no huye del amor... huye de la repetición de un desastre del que conoce cada detalle. A menudo lo dice incluso con estas palabras: «no quiero que acabemos como mis padres».</p>`,
        },
        {
          id: 'las-cicatrices-de-un-ex',
          title: "Las cicatrices que dejó un ex",
          content: `<p>Una traición, una ruptura brutal, una relación de control... y el sistema concluye: nunca más indefenso. El compromiso se convierte en una exposición al fuego y la distancia en una armadura. Es un miedo que se respeta... y que se cura, porque una armadura permanente es una prisión con temporizador.</p>`,
        },
        {
          id: 'el-apego-evitativo',
          title: "El apego evitativo",
          content: `<p>La raíz más frecuente: ese estilo de apego para el que la cercanía misma dispara la alarma. Si el enfriamiento llega en CADA etapa superada, con una necesidad de espacio no negociable y una incomodidad ante las emociones, el tema va más allá del compromiso: es el retrato tipo del <a href="/es/blog/apego-evitativo-en-el-amor/">apego evitativo en el amor</a>, y aclara todo lo demás.</p>`,
        },
        {
          id: 'el-mito-de-la-eleccion-perfecta',
          title: "El mito de la elección perfecta",
          content: `<p>Versión moderna, alimentada por la cultura del match ilimitado: comprometerse es renunciar a todas las demás opciones... ¿y si LA persona adecuada fuera la siguiente? Ese vértigo no es miedo al compromiso en sentido estricto, es una incapacidad de elegir, mantenida viva por la ilusión de que existe una elección perfecta. Pista: la gente feliz en pareja no encontró la elección perfecta. Dejó de buscarla.</p>
<div><table><thead><tr><th>La causa</th><th>Lo que hace creer</th><th>Lo que la afloja</th></tr></thead><tbody>
<tr><td><strong>El naufragio visto de cerca</strong></td><td>Comprometerse siempre acaba mal</td><td>Separar su historia de la vuestra</td></tr>
<tr><td><strong>Las cicatrices de un ex</strong></td><td>Va a repetirse exactamente igual</td><td>Nombrar lo que no tiene nada que ver esta vez</td></tr>
<tr><td><strong>El apego evitativo</strong></td><td>Vincularse es perderse</td><td>Quedarse cinco minutos más, cada vez</td></tr>
<tr><td><strong>El mito de la elección perfecta</strong></td><td>Hay algo mejor en otra parte, seguro</td><td>Trocear el compromiso en pasos pequeños reales</td></tr>
</tbody></table></div>`,
        },
      ],
    },
    {
      id: 'miedo-o-desinteres',
      title: "La prueba definitiva: ¿miedo al compromiso... o desinterés educado?",
      content: `<p>Esta es LA pregunta para quien espera, así que resolvámosla con franqueza. «No estoy preparado» puede significar dos cosas muy distintas: «tengo miedo» o «contigo no, pero no quiero decirlo». Así se distinguen.</p>
<div class="blog-verdict">
<div class="blog-verdict-col blog-verdict-col--oui">
<p class="blog-verdict-titre"><span aria-hidden="true">👍</span> El miedo (esto se trabaja)</p>
<ul>
<li>Avanza, despacio, pero avanza: pasitos reales a lo largo de los meses</li>
<li>El bloqueo le hace sufrir a él también... y lo dice</li>
<li>Habla de su miedo, de su historia, de sus padres</li>
<li>El resto de la relación está invertido: presencia, planes cortos, constancia</li>
<li>Acepta hablarlo, aunque sea con torpeza</li>
</ul>
</div>
<div class="blog-verdict-col blog-verdict-col--non">
<p class="blog-verdict-titre"><span aria-hidden="true">🚩</span> El desinterés disfrazado</p>
<ul>
<li>Cero pasos adelante, nunca, en nada... desde el principio</li>
<li>El bloqueo solo le molesta cuando amenazas con irte</li>
<li>«No estoy preparado» sin una palabra más, año tras año</li>
<li>La implicación es mínima en todo: llevas la relación tú sola</li>
<li>El tema está prohibido: sacarlo es «meter presión»</li>
</ul>
</div>
</div>
<p>Y un tercer caso merece nombrarse: el «no estoy preparado» estratégico, que mantiene a alguien a mano sin dar nada. Si la negativa a comprometerse viene con frío y calor calculado, con pruebas, con un control de tu disponibilidad, no estás ante un miedo, estás ante una gestión de existencias. Los <a href="/es/blog/senales-relacion-toxica/">marcadores de una relación tóxica</a> te ayudarán a distinguir.</p>`,
    },
    {
      id: 'avanzar-cuando-el-miedo-es-tuyo',
      title: "Avanzar cuando el miedo es el tuyo",
      content: `<p>Si eres tú quien se bloquea, aquí está el programa que funciona... y no empieza por «salta al vacío».</p>`,
      subsections: [
        {
          id: 'trocea-el-compromiso',
          title: "Trocea el compromiso",
          content: `<p>El miedo al compromiso casi siempre es miedo al paquete completo: la boda, la casa, los hijos, para siempre, tragado de golpe. ¡Nadie traga eso de golpe! Trocéalo: el siguiente paso, solo el siguiente. Un fin de semana reservado con dos meses de antelación. Un cajón en su casa. Luego un mes de vacaciones juntos. Cada paso dado sin catástrofe recalibra el sistema... exactamente como con todos los miedos.</p>`,
        },
        {
          id: 'separa-la-historia-antigua-del-presente',
          title: "Separa la historia antigua del presente",
          content: `<p>Escribe negro sobre blanco de qué tienes miedo DE VERDAD: ¿acabar como tus padres? ¿revivir a tu ex? ¿perder qué, exactamente? Luego mira tu relación actual y busca las pruebas de que ese escenario se está preparando en ella. En la gran mayoría de los casos descubrirás que tu miedo tiene veinte años más que tu pareja: no tienes miedo de esta historia, tienes miedo de una historia que ya terminó. Esa constatación, por sí sola, desbloquea mucho.</p>`,
        },
        {
          id: 'di-donde-estas',
          title: "Decir dónde estás",
          content: `<p>Lo peor para el otro no es tu lentitud, es tu silencio. «Tengo miedo, sé de dónde viene, y este es el paso que me siento capaz de dar este trimestre»: esa frase salva parejas. Convierte una espera sin fin en un camino con etapas. Si no puedes decirla, quizá la respuesta de la tabla de arriba no sea la que crees... y la honestidad, también ahí, vale más que el entremedio.</p>`,
        },
      ],
    },
    {
      id: 'esperar-o-irse',
      title: "Y si eres tú quien espera: ¿cuánto tiempo?",
      content: `<p>Hablemos por fin con quien tiene paciencia, porque la paciencia también tiene reglas.</p>
<p>Un plazo razonable se concede: el miedo al compromiso sincero merece tiempo y pasos pequeños. Pero un plazo infinito se rechaza, y este es el criterio: <strong>puedes esperar a alguien que avanza despacio; no debes esperar a alguien que no avanza.</strong> La diferencia se mide en actos a lo largo de seis a doce meses, nunca en promesas. Fíjate, para ti misma, qué necesitas ver moverse y para cuándo... y respeta tu propio plazo. Sin ultimátum teatral: los ultimátums hacen avanzar a los estrategas y entrar en pánico a los fóbicos, ¡lo contrario de lo que se busca!</p>
<p>Y mientras esperas, protégete de la trampa clásica: poner TU vida en suspenso. Sigue con tus proyectos, tus amistades, tu movimiento. Primero porque tu vida se lo merece. Y luego porque, ironía de la mecánica: nada tranquiliza más a un fóbico del compromiso que una pareja que tiene vida propia... y nada le alarma más que una pareja de la que se ha convertido en el único proyecto.</p>
<div class="blog-cta">
<p class="blog-cta-titre">¿Dónde estáis de verdad, los dos?</p>
<p class="blog-cta-texte">Una serie de preguntas hace balance de vuestra relación: la implicación real de cada uno, los pasos dados, la dirección. Suficiente para sustituir las impresiones por una foto serena, antes de las grandes decisiones.</p>
<a class="blog-cta-btn" href="/es/test-compatibilidad-pareja/">Hacer balance en pareja</a>
<p class="blog-cta-note">Gratis &middot; Sin registro &middot; Resultado inmediato</p>
</div>
<p>Una última cosa, para los dos lados del problema. El compromiso da miedo porque se toma por una pérdida de libertad... mientras que las parejas que duran cuentan todas lo contrario: la seguridad del vínculo es precisamente lo que les permitió atreverse a más, fuera y dentro. La libertad no es lo que se abandona al comprometerse. Es, bastante a menudo... lo que se gana. Y el día en que irse a vivir juntos sea una pregunta real en vez de una angustia, sabréis planteárosla bien: las <a href="/es/blog/preguntas-sobre-el-futuro-pareja/">preguntas de futuro que hacerse en pareja</a> están hechas exactamente para eso.</p>
<a href="/es/blog/apego-evitativo-en-el-amor/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Leer también</span><span class="blog-read-also-title">El apego evitativo en el amor: querer de lejos, huir de cerca</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
