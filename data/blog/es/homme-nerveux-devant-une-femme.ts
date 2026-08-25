import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'hombre-nervioso-delante-de-una-mujer',
  title: "Las señales que demuestran que un hombre está nervioso delante de una mujer",
  metaTitle: "Un hombre nervioso delante de una mujer: las 12 señales | Quiz Couple",
  metaDescription: "Las 12 señales que demuestran que un hombre está nervioso delante de ti, qué pasa en su cuerpo en ese momento, y qué hacer para relajarlo.",
  featuredImage: '/blog/homme-nerveux-devant-une-femme.webp',
  featuredImageAlt: "Chico joven que se frota la nuca con una sonrisa algo apurada, frente a una chica que le habla, una tarde de verano al aire libre",
  publishedAt: '2026-08-26T16:20:00+02:00',
  author: AUTHORS['thomas'],
  excerpt: "Se ríe demasiado fuerte, no consigue mirarte, lleva diez minutos girando el vaso. Aquí tienes las 12 señales, y lo que quieren decir.",
  introduction: `<p>Se ríe un poco demasiado fuerte. No consigue mirarte más de dos segundos. Lleva diez minutos girando el vaso entre las manos sin beber.</p>
<p>Aquí tienes las 12 señales que demuestran que un hombre está nervioso delante de ti, qué pasa en su cuerpo en ese momento, y qué hacer con todo eso.</p>`,
  quickSummary: [
    "Un hombre nervioso se delata sobre todo por las manos, la boca y la mirada.",
    "Apartar la mirada no es señal de mentira ni de desinterés: es su cerebro haciéndose sitio.",
    "El nerviosismo por sí solo no dice nada. Lo que dice algo es que se quede y siga la conversación.",
    "La peor reacción es hacérselo notar. La mejor es bajar el listón.",
    "Uno al lado del otro, andando o haciendo algo, el nerviosismo cae solo.",
  ],
  sections: [
    {
      id: 'les-signes',
      title: "Las 12 señales que delatan a un hombre nervioso",
      content: `<p>Ninguna de estas señales cuenta por sí sola. Cuando ves tres o cuatro a la vez es cuando ya no queda duda.</p>
<ol>
<li><strong>Traga saliva a menudo, y bebe mucho:</strong> traga cada treinta segundos, da otro sorbo cuando acaba de dar uno.</li>
<li><strong>No aguanta tu mirada:</strong> dos segundos, mira a otro lado, y vuelve. Va y viene todo el rato.</li>
<li><strong>Se toca la cara, el cuello, la nuca:</strong> se frota la nuca, se pasa la mano por el pelo, se pellizca la nariz. Casi siempre sin darse cuenta.</li>
<li><strong>Sus manos nunca están vacías:</strong> el vaso, el posavasos, las llaves, el móvil, la servilleta de papel que va reduciendo a confeti.</li>
<li><strong>Habla rápido, y habla mucho:</strong> encadena, no deja huecos, responde a preguntas que no has hecho.</li>
<li><strong>Se ríe cuando no hay nada gracioso:</strong> esa risita al final de la frase, la que no encaja con nada.</li>
<li><strong>Su voz sube un punto:</strong> un poco más aguda y un poco más tensa que cuando habla con sus amigos.</li>
<li><strong>Se pone rojo, a menudo a manchas:</strong> empieza en el cuello y sube hacia las orejas, y él lo sabe, lo cual no ayuda.</li>
<li><strong>Tiene las manos sudadas:</strong> lo pillas secándoselas discretamente en el vaquero antes de saludarte.</li>
<li><strong>Una pierna que tiembla, un pie que se mueve:</strong> sentado se ve enseguida. De pie, cambia de pie de apoyo cada diez segundos.</li>
<li><strong>Se corrige todo el rato:</strong> «bueno, quiero decir», «no, pero ya me entiendes», «perdona, me estoy explicando fatal».</li>
<li><strong>Mira el móvil cuando no ha pasado nada:</strong> sin notificación, sin llamada. Solo necesita una pausa de tres segundos.</li>
</ol>
<p>Te habrás fijado en que casi todo ocurre en tres sitios: las manos, la boca y la mirada. No es casualidad, y se explica bastante bien.</p>`,
      subsections: [
        {
          id: 'ce-qui-se-passe-dans-son-corps',
          title: "Qué pasa en su cuerpo en ese momento",
          content: `<p>Una situación que importa dispara la misma mecánica que un peligro. El cuerpo se pone en alerta, sube la adrenalina, el corazón se acelera y la sangre se va hacia los músculos. Es el sistema nervioso simpático el que toma el mando, y no distingue entre un oso y una mujer que le gusta.</p>
<p><strong>La boca.</strong> En alerta, la saliva cambia: se vuelve más espesa, y la boca da esa sensación desagradable de estar seca. De ahí que trague sin parar y que dé un sorbo cada dos minutos. Es también por eso que la voz se le tensa un poco.</p>
<p><strong>Las manos.</strong> Las glándulas sudoríparas de las palmas responden a las emociones, no solo al calor. Un estrés social basta para activarlas, y un hombre que lo sabe se pasará la noche secándose las manos. En cuanto a los gestos hacia la cara y el cuello, son gestos de calma: nos tocamos para tranquilizarnos, igual que nos frotamos los ojos cuando estamos cansados.</p>
<p><strong>La mirada.</strong> Esta merece explicación, porque casi siempre se interpreta al revés. En 1998, Arthur Glenberg y su equipo publicaron en <em>Memory &amp; Cognition</em> cinco experimentos sobre el hecho de apartar la mirada. Resultado: cuanto más difícil es la pregunta, más aparta la gente los ojos para responder. Y no es vergüenza, los investigadores comprobaron ese punto. Es útil: apartar la mirada corta parte de lo que llega de fuera y deja sitio para pensar.</p>
<p>Dicho de otra forma, cuando te habla y mira fijamente la barra, no es que te esté esquivando. Muchas veces es que está buscando qué decir, y tu cara le ocupa demasiado ancho de banda para conseguirlo mirándote.</p>
<p><strong>El rubor.</strong> Ese va aparte, porque no sirve para nada. Darwin le dedicó el último capítulo de <em>La expresión de las emociones en el hombre y en los animales</em>, en 1872, y lo llamaba «la más singular y la más humana de todas las expresiones». Ningún otro animal se ruboriza. Aparece en personas ciegas de nacimiento, así que no se aprende, y se dispara por un solo motivo: pensar en lo que los demás piensan de nosotros. Es la señal más honesta de la lista, precisamente porque es imposible de fabricar.</p>`,
        },
      ],
    },
    {
      id: 'est-ce-que-je-lui-plais',
      title: "¿Está nervioso porque le gusto?",
      content: `<p>Respuesta honesta: el nerviosismo por sí solo no prueba nada. Un hombre puede estar nervioso porque te encuentra guapa, pero también porque es tímido con todo el mundo, porque ha tenido un mal día, o porque no lleva bien los grupos.</p>
<p>Lo que informa es lo que hace <em>con</em> su nerviosismo. Así se distingue.</p>
<div><table><thead><tr><th>Lo que observas</th><th>Hacia dónde apunta</th></tr></thead><tbody>
<tr><td>Está nervioso, pero se queda y sigue la conversación</td><td>Le gustas. Tiene miedo de fallar, así que le importa acertar.</td></tr>
<tr><td>Está nervioso y lo acorta, mira hacia la salida</td><td>No está a gusto, y sobre todo quiere que acabe.</td></tr>
<tr><td>Está nervioso contigo y relajado con los demás</td><td>Eres tú. Míralo hablar con otra persona, la diferencia salta a la vista.</td></tr>
<tr><td>Es así con todo el mundo</td><td>Es su timidez, y no dice nada sobre ti.</td></tr>
<tr><td>Está nervioso y te hace preguntas sobre ti</td><td>Buena señal. Quiere conocerte a pesar de la incomodidad.</td></tr>
<tr><td>Está nervioso y habla sobre todo de él</td><td>Está gestionando su imagen más que interesándose por ti. A comprobar la próxima vez.</td></tr>
</tbody></table></div>
<p>Hay un último caso, y merece nombrarse. Un hombre muy nervioso puede cancelar en el último momento, no porque no tenga ganas, sino porque la presión se ha hecho demasiado grande. Si te pasa, <a href="/es/blog/cancela-en-el-ultimo-momento/">lo que hace en los minutos siguientes</a> te dirá mucho más que la cancelación en sí.</p>
<p>Y si quieres salir de dudas sin esperar, <a href="/es/test-me-quiere-en-secreto/">lo que hace cuando no se sabe observado</a> es mucho más elocuente que su forma de sujetar el vaso.</p>`,
    },
    {
      id: 'la-reaction-a-avoir',
      title: "Cómo reaccionar en esa situación, como mujer",
      content: `<p>Tienes tres opciones delante, y solo una es mala. Empezamos por esa.</p>`,
      subsections: [
        {
          id: 'ne-pas-le-faire-remarquer',
          title: "Sobre todo, no se lo hagas notar",
          content: `<p>«¿Estás bien, que te has puesto rojo?», «¿estás nervioso o qué?», «¡relájate!». Esas tres frases salen de buena intención y hacen exactamente lo contrario de lo que buscan.</p>
<p>El rubor, ya lo hemos visto, se dispara cuando pensamos en lo que los demás piensan de nosotros. Decirle que está rojo lo pone más rojo, mecánicamente. Igual con lo demás: nombrar su nerviosismo lo duplica, porque descubre que se nota.</p>
<p>Haz como si no hubieras visto nada. No se trata de fingir, solo de no ponerle el foco encima.</p>`,
        },
        {
          id: 'changer-de-position',
          title: "Cambia de posición en vez de cambiar de tema",
          content: `<p>Este es el consejo más eficaz de la página, y no lo da nadie. Cuando alguien está nervioso, buscamos por instinto otro tema de conversación. No funciona, porque el problema no es el tema, es el cara a cara.</p>
<p>Un cara a cara son dos personas que se miran, sin nada que ocupe las manos y sin escapatoria para los ojos. Es la configuración más dura que existe para alguien nervioso.</p>
<p>Así que cámbiala. Propón andar un poco. Id juntos a por las bebidas. Salid a tomar el aire. <strong>Uno al lado del otro, todo se vuelve más fácil:</strong> las manos tienen algo que hacer, los ojos pueden mirar al frente, y los silencios dejan de pesar. Muchas veces vas a ver a una persona completamente distinta cinco minutos después.</p>
<p>Si estáis atrapados en un cara a cara y no hay nada que hacer, dale preguntas fáciles de coger al vuelo. Hemos hecho una lista de <a href="/es/preguntas-primera-cita/">de qué hablar cuando os veis por primera vez</a>, empezando por lo muy ligero, y está pensada justo para eso.</p>`,
        },
        {
          id: 'jouer-de-sa-nervosite',
          title: "¡Juega con su nerviosismo para pillarlo (sin ser mala)!",
          content: `<p>Aquí llega la parte divertida. Su nerviosismo te da una ventaja, y tienes todo el derecho a usarla. La regla es sencilla: se pica, nunca se ridiculiza.</p>
<p>La diferencia está en quién se ríe. Si te ríes de él, es cruel y se cierra. Si te ríes con él, acabas de quitar presión a los dos, y es exactamente lo que necesitaba.</p>
<p>Algunos ejemplos que funcionan.</p>
<ul>
<li><strong>El falso reproche:</strong> «¿no me miras a propósito o te doy miedo?», dicho sonriendo. Nombras la cosa, pero en tono de juego, y le das la ocasión de responder «un poco las dos». Ahí ya está.</li>
<li><strong>El piropo disfrazado:</strong> «qué mono, estás haciendo trocitos la servilleta.» Se va a reír, va a parar, y habrá entendido que no te molesta.</li>
<li><strong>El reto tonto:</strong> «te apuesto a que no aguantas cinco segundos mirándome sin apartar la vista.» Conviertes lo que le bloquea en un juego, y un juego no da miedo.</li>
<li><strong>La sinceridad compartida:</strong> «te aviso, yo también estoy un poco nerviosa.» Ya no es el único nervioso, sois dos, y acabas de dividir la presión entre dos.</li>
</ul>
<p>Ese tono un poco pícaro y un poco directo es lo que hace caer a la mayoría de los hombres, mucho más que la cortesía perfecta. Una mujer que se atreve a bromear con él es una mujer que no le tiene miedo, y él lo nota al instante. Y muchas veces es de ese tipo de intercambio, un poco torpe y nada preparado, de donde nacen las buenas historias.</p>
<aside class="blog-tip-box">
<p class="blog-tip-box-title">📌 Nervioso no es un defecto, es información</p>
<p>Un hombre al que nada desestabiliza, que tiene la frase perfecta para todo desde la primera noche y que te cubre de halagos, no es necesariamente mejor. A veces es incluso el principio de un patrón que tiene nombre, el del <a href="/es/blog/love-bombing-senales/">que hace demasiado y demasiado rápido</a>. La torpeza es lo contrario de una mala señal: quiere decir que el momento le importa.</p>
</aside>`,
        },
      ],
    },
    {
      id: 'conseils-pour-le-detendre',
      title: "Algunos consejos para relajarlo",
      content: `<p>Nada complicado aquí, y no tienes que sostener la noche tú sola. Con estas cinco cosas suele bastar.</p>
<ul>
<li><strong>Habla un poco más despacio que él:</strong> el ritmo se contagia. Si él habla rápido y tú bajas el ritmo, él baja contigo en dos minutos, sin darse ni cuenta.</li>
<li><strong>Deja las preguntas grandes para más tarde:</strong> «¿cuál es tu mayor sueño?» en los primeros cinco minutos es inmanejable para alguien estresado. Empieza por preguntas de respuesta fácil.</li>
<li><strong>Acepta los silencios sin rellenarlos:</strong> si corres a tapar cada hueco, le enseñas que los huecos son un problema. Un silencio tranquilo de tres segundos lo relaja más que una frase más.</li>
<li><strong>Cuéntale algo tuyo, incluido algo que te salió mal:</strong> una anécdota un poco vergonzosa por tu parte, y entiende que no tiene que ser perfecto. Es la forma más rápida de bajar la presión.</li>
<li><strong>Dale una información clara al final:</strong> «me lo he pasado bien, lo repetimos.» Una frase, y deja de preguntarse si lo ha estropeado todo. Es el mejor regalo que puedes hacerle esa noche.</li>
</ul>
<p>Y si después de dos o tres veces sigue igual, ya no son nervios. El nerviosismo del principio se gasta rápido cuando la persona se siente segura, y si no se gasta, está pasando otra cosa.</p>
<a href="/es/blog/como-nacen-los-sentimientos-en-un-hombre/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Leer también</span><span class="blog-read-also-title">Cómo nacen los sentimientos en un hombre</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
    {
      id: 'faq',
      title: "Preguntas frecuentes",
      content: `<p><strong>¿Cómo sé si está nervioso o solo es tímido?</strong> Míralo con otras personas. Un tímido es así con todo el mundo. Un hombre nervioso por ti está relajado con los demás y se tensa cuando llegas tú.</p>
<p><strong>Un hombre nervioso delante de mí, ¿está enamorado?</strong> Enamorado no necesariamente, pero hay algo en juego. Está claro que no le eres indiferente, si no, no habría nada que estropear.</p>
<p><strong>¿Por qué evita mi mirada cuando le hablo?</strong> Casi siempre porque está buscando qué decir. Apartar los ojos deja sitio para pensar, está documentado. No es mentira ni desinterés.</p>
<p><strong>¿Por qué se ríe todo el rato conmigo?</strong> La risa es la forma más rápida de soltar tensión. Si se ríe cuando no hay nada gracioso, es descarga, no burla.</p>
<p><strong>¿Se le pasa con el tiempo?</strong> Sí, y bastante rápido. Cuenta con dos o tres encuentros. Más allá, si no se mueve nada, es algo más que simples nervios.</p>
<p><strong>¿Cómo distingo nerviosismo de incomodidad?</strong> El nervioso se queda y tira de la conversación. El que está incómodo acorta, mira a otro lado y encuentra una razón para irse.</p>
<p><strong>¿Un hombre seguro de sí mismo puede estar nervioso?</strong> Sí, y es de lo más frecuente. La seguridad en el trabajo o con los amigos no protege de nada cuando alguien te gusta de verdad.</p>
<p><strong>¿Puedo decirle que me he dado cuenta?</strong> Más adelante sí, y en tono de broma. En el momento no: decírselo solo añade presión.</p>`,
    },
  ],
};

export default article;
