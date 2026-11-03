import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "presupuesto-en-pareja",
  title: "Presupuesto en pareja: el método sencillo para hacer un presupuesto a dos, y cumplirlo",
  metaTitle: "Presupuesto en pareja: hacerlo a dos y cumplirlo",
  metaDescription: "Presupuesto en pareja: el método en cinco pasos, un ejemplo con 3.000 € al mes, la regla 50/30/20, el fondo de emergencia y la cita mensual.",
  featuredImage: "/blog/budget-couple.webp",
  featuredImageAlt: "Los dos personajes de Quiz Couple delante de una gran hoja de cálculo puesta en una mesa, una calculadora y unos sobres",
  publishedAt: "2027-02-27T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "Un presupuesto a dos lleva una hora la primera vez y veinte minutos al mes después. El método en cinco pasos, un ejemplo para una pareja con 3.000 €, la regla 50/30/20, las herramientas, y qué hacer cuando le prestas dinero a tu pareja.",
  introduction: `<p>Un presupuesto en pareja no es una tabla de limitaciones. <strong>Es saber adónde va el dinero a dos, para no tener que adivinar, ni reprocharse nada, ni privarse de nada por nada.</strong> Las parejas que tienen uno discuten menos por dinero, no porque tengan más, sino porque saben lo que queda.</p>
<p>Aquí tienes el método en cinco pasos, un ejemplo con cifras para una pareja con 3.000 € al mes, la regla 50/30/20, las herramientas que funcionan, el fondo de emergencia, y la cita que hace que todo eso se mantenga.</p>`,
  quickSummary: [
    "Cinco pasos: los ingresos, los gastos fijos, los gastos que varían, el ahorro, y un dinero de bolsillo para cada uno. Una hora la primera vez, veinte minutos al mes después.",
    "La regla 50/30/20 da un orden de magnitud: la mitad para lo imprescindible, un tercio para los caprichos, un quinto para el ahorro. Una referencia, no una ley.",
    "Los gastos anuales (IRPF, IBI, seguros, vacaciones, regalos) se dividen entre doce y se apartan cada mes: son los que hacen saltar los presupuestos.",
    "Un fondo de emergencia de tres meses de gastos, antes de cualquier otro proyecto, quita el miedo que alimenta la mayoría de las discusiones por dinero.",
    "El presupuesto se revisa entre los dos, una vez al mes, en una fecha fija. Un presupuesto que no se mira es una hoja de cálculo más.",
  ],
  sections: [
    {
      id: "por-que-un-presupuesto",
      title: "Por qué un presupuesto a dos lo cambia todo",
      content: `<p>Sin presupuesto, cada gasto es una negociación. ¿Podemos permitirnos este restaurante? ¿Las vacaciones son razonables? ¿Por qué has comprado eso? Y como nadie sabe lo que queda, cada uno responde con su instinto: el ahorrador dice que no, el gastador dice que sí, y vuelta a empezar.</p>
<p><strong>Con un presupuesto, la pregunta cambia: ya no se pregunta « ¿podemos? », se mira la línea.</strong> Quedan 140 € en ocio este mes, así que sí al restaurante, no al fin de semana. Nadie ha cedido, nadie ha prohibido nada. El presupuesto ha decidido, y lo escribisteis juntos. Por eso la guía sobre <a href="/es/blog/dinero-y-pareja/">el dinero en la pareja</a> lo llama la herramienta que lo calma todo.</p>`,
    },
    {
      id: "el-metodo",
      title: "El método en cinco pasos",
      content: `<ol>
<li><strong>Los ingresos:</strong> los dos sueldos netos, las ayudas, los ingresos regulares. Las pagas extra se prorratean en doce meses. Se obtiene lo que entra cada mes.</li>
<li><strong>Los gastos fijos:</strong> el alquiler o la hipoteca, la comunidad, la luz, internet, los móviles, los seguros, las suscripciones, el transporte, la guardería. Todo lo que cae igual cada mes. Coged los tres últimos extractos: va más rápido que adivinar.</li>
<li><strong>Los gastos que varían:</strong> la compra, la gasolina, las salidas, la ropa, la salud. Haced la media de los tres últimos meses, y añadid una doceava parte de todo lo que cae una vez al año: la declaración, el IBI, el seguro del coche, las vacaciones, los regalos de Navidad, la revisión. Esta línea es la que hace saltar los presupuestos, porque se olvida.</li>
<li><strong>El ahorro:</strong> una cantidad fija, transferida el día de la nómina, antes de todo lo demás. Si sale « de lo que quede », nunca queda nada.</li>
<li><strong>El dinero de bolsillo:</strong> una cantidad para cada uno, la misma o proporcional a los ingresos, en una cuenta propia, sin justificación. Es la línea que hace que el gastador acepte el presupuesto, y es la que más se olvida.</li>
</ol>
<p>Si al final los gastos superan a los ingresos, no se empieza recortando los placeres: se miran los fijos. Una suscripción de más, un seguro nunca renegociado, una tarifa de móvil de hace cinco años suman a menudo más que todos los cafés del mes.</p>`,
    },
    {
      id: "un-ejemplo",
      title: "Un ejemplo para una pareja con 3.000 € al mes",
      content: `<p>Dos personas, 1.300 y 1.700 € netos, un alquiler en ciudad, sin hijos. Esto es lo que da un presupuesto que se sostiene:</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">Un mes con 3.000 €, a dos</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">1.500 €</span>de gastos fijos: alquiler y comunidad 900, luz e internet 150, seguros 80, móviles 40, transporte 120, suscripciones 40, y 170 apartados para la declaración, el IBI y el seguro del coche del año</li>
<li><span class="blog-chiffres-nombre">800 €</span>de gastos que varían: compra 450, salidas y restaurantes 170, ropa y salud 80, y 100 apartados cada mes para las vacaciones</li>
<li><span class="blog-chiffres-nombre">400 €</span>de ahorro, transferidos el día de la nómina, primero para el fondo de emergencia</li>
<li><span class="blog-chiffres-nombre">300 €</span>de dinero de bolsillo, 130 para uno y 170 para el otro, en proporción a los ingresos, sin justificación</li>
</ul>
</div>
<p>Y cómo alimenta cada uno esas líneas es la cuestión de <a href="/es/blog/como-repartir-los-gastos-en-pareja/">cómo repartir los gastos en pareja</a>: aquí, en proporción, el 43 % para uno y el 57 % para el otro, con dos transferencias automáticas a la cuenta conjunta. Si lo ponéis todo en común, la cuestión no se plantea, y <a href="/es/blog/cuenta-conjunta-o-cuentas-separadas/">cuenta conjunta o cuentas separadas</a> dice cuál va con qué presupuesto.</p>`,
    },
    {
      id: "la-regla-50-30-20",
      title: "La regla 50/30/20, para saber si es razonable",
      content: `<p>Para comprobar que vuestro presupuesto no cojea, una referencia conocida: <strong>la mitad de los ingresos para lo imprescindible</strong> (vivienda, compra, transporte, seguros, salud), <strong>el treinta por ciento para los caprichos</strong> (salidas, vacaciones, ropa, suscripciones, dinero de bolsillo), <strong>el veinte por ciento para el ahorro</strong> y la devolución de deudas.</p>
<p>En el ejemplo de arriba, lo imprescindible supone alrededor del 65 %, los caprichos el 20 % y el ahorro el 15 %: pesado en vivienda, como la mayoría de las parejas en ciudad, y se corrige subiendo el ahorro en cuanto se mueve un sueldo. No es una ley. Una pareja con un alquiler alto en Madrid o Barcelona estará en el 60 % de imprescindible, una pareja propietaria sin hipoteca en el 40 %. Lo que dice la regla es dónde mirar cuando no cuadra.</p>`,
      tip: "El fondo de emergencia primero: tres meses de gastos, en una cuenta disponible, antes de cualquier proyecto. Es lo que quita el miedo que alimenta la mayoría de las discusiones por dinero, porque un imprevisto deja de ser una catástrofe.",
    },
    {
      id: "las-herramientas",
      title: "Las herramientas: hoja de cálculo, app o sobres",
      content: `<ul>
<li><strong>La hoja de cálculo compartida:</strong> una columna por mes, una línea por partida, accesible a los dos en el móvil. Gratis, flexible, y es lo que la mayoría de las parejas acaban usando.</li>
<li><strong>La app de presupuesto:</strong> lee vuestras cuentas y clasifica los gastos sola. Práctica para ver adónde se va el dinero, menos para decidir entre los dos: enseña, no discute.</li>
<li><strong>Los sobres:</strong> el método antiguo, en efectivo o en subcuentas: un sobre para la compra, uno para salir, uno para las vacaciones. Cuando el sobre está vacío, se para. Es el método que mejor funciona con los gastadores, porque hace visible el límite.</li>
</ul>
<p>Y un punto que vale por todas las herramientas: <strong>la cita</strong>. Veinte minutos al mes, en una fecha fija, el primer domingo por ejemplo, con el presupuesto delante. Se mira lo que se ha pasado, lo que llega el mes que viene, y cada uno dice lo que le preocupa. Un presupuesto que no se mira entre los dos es una hoja de cálculo más. El artículo sobre <a href="/es/blog/hablar-de-dinero-en-pareja/">cómo hablar de dinero en pareja</a> explica cómo fijar esa cita sin que se convierta en una obligación.</p>`,
    },
    {
      id: "prestar-dinero-a-tu-pareja",
      title: "Prestar dinero a tu pareja",
      content: `<p>Pasa en muchas parejas que mantienen cuentas separadas: uno le adelanta una cantidad grande al otro, para un coche, una entrada, una deuda de antes. Y acaba mal más a menudo de lo que se cree, no porque el otro no lo devuelva, sino porque nadie dijo si era un préstamo o un regalo.</p>
<p>Dos reglas. La primera: <strong>decidlo, en una frase, el mismo día</strong>. « Te presto 3.000 €, me los devuelves cuando puedas » no es lo mismo que « te echo una mano », y las dos son aceptables si se sabe cuál es. La segunda, por encima de unos cientos de euros y si no estáis casados: <strong>un papel</strong>, un reconocimiento de deuda con fecha y firma, con la cantidad y el ritmo de devolución. Parece frío entre dos personas que se quieren. Es sobre todo lo que permite no pensar más en ello, y no convertirlo en una discusión dentro de dos años. La guía sobre <a href="/es/blog/dinero-y-pareja/">el dinero en la pareja</a> recuerda lo que dice la ley, o no dice, para las parejas no casadas.</p>
<p>Para saber si veis el ahorro de la misma manera, una prioridad absoluta para uno y « hay que disfrutar » para el otro, la <a href="/es/evaluacion-de-pareja/" data-bilan-src="article-argent">evaluación de pareja, cada uno en su móvil</a>, le hace la pregunta a cada uno, junto con la de qué haríais con 1.000 € caídos del cielo. Las dos respuestas una al lado de la otra son a menudo el punto de partida del primer presupuesto.</p>
<a href="/es/blog/dinero-y-pareja/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lee también</span><span class="blog-read-also-title">Dinero y pareja: cómo gestionar el dinero a dos sin que acabe en discusión</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
