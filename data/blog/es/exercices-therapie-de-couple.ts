import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "ejercicios-terapia-de-pareja",
  title: "10 ejercicios de terapia de pareja para hacer en casa",
  metaTitle: "Ejercicios de terapia de pareja: 10 para hacer en casa",
  metaDescription: "Diez ejercicios de terapia de pareja para hacer en casa: hablar sin interrumpir, la pausa de veinte minutos, el arranque suave y la reunión semanal.",
  featuredImage: "/blog/exercices-therapie-de-couple.webp",
  featuredImageAlt: "Los dos personajes de Quiz Couple a cada lado de una mesa de cocina, con un reloj de arena y dos tazas entre ellos",
  publishedAt: "2027-01-10T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "Diez ejercicios que los terapeutas de pareja mandan entre sesión y sesión, explicados paso a paso para hacerlos en casa, con o sin terapia.",
  introduction: `<p>Los ejercicios de terapia de pareja son cosas para hacer entre los dos, en casa, para aprender a hablaros de otra manera. Los terapeutas los mandan entre sesiones, porque la pareja cambia en casa, no en la consulta. Y <strong>la mayoría se pueden hacer sin terapia</strong>, siempre que los dos queráis probar.</p>
<p>Aquí tienes diez, entre los más usados, con la forma de hacerlos. Empezad por uno solo. El que más os suene, o el que más miedo os dé: suele ser el mismo.</p>`,
  quickSummary: [
    "Los ejercicios más eficaces son muy sencillos: hablar por turnos, repetir lo entendido, decir una cosa positiva al día.",
    "La pausa de veinte minutos en plena discusión viene del método Gottman: a partir de cierto nivel de estrés, ya no se oye nada.",
    "La forma de empezar una conversación difícil decide muchas veces su final: se entrena como un gesto deportivo.",
    "Una cita fija cada semana, solo para hablar de la pareja, evita que los temas se acumulen hasta estallar.",
    "Un ejercicio hecho dos veces no sirve de nada. Elige uno, mantenlo tres semanas, y solo después añade otro.",
  ],
  sections: [
    {
      id: "los-10-ejercicios",
      title: "Los 10 ejercicios",
      content: `<ol class="blog-liste-reperes">
<li><a href="#hablar-por-turnos">Hablar por turnos, y repetir lo entendido</a></li>
<li><a href="#la-pausa-de-veinte-minutos">La pausa de veinte minutos</a></li>
<li><a href="#el-arranque-suave">El arranque suave</a></li>
<li><a href="#una-cosa-al-dia">Una cosa que te ha gustado, cada día</a></li>
<li><a href="#la-conversacion-para-descomprimir">La conversación para descomprimir</a></li>
<li><a href="#el-reencuentro">El ritual del reencuentro</a></li>
<li><a href="#las-preguntas">Las preguntas que ya no os hacéis</a></li>
<li><a href="#la-reunion-semanal">La reunión de la semana</a></li>
<li><a href="#las-frases-que-desactivan">Las frases que desactivan</a></li>
<li><a href="#la-peticion-de-la-semana">La petición de la semana</a></li>
</ol>`,
    },
    {
      id: "hablar-por-turnos",
      title: "1. Hablar por turnos, y repetir lo entendido",
      content: `<p>Es el ejercicio de base, el que casi todos los terapeutas mandan desde la primera sesión. Elegid un tema que os enfade, no el peor, uno mediano. Uno habla durante tres a cinco minutos, sin que lo interrumpan. Ni una palabra, ni un suspiro, ni un «ya, pero». Después, <strong>el otro repite lo que ha entendido</strong>, con sus palabras: «si lo he entendido bien, lo que te dolió fue que no avisara». El primero confirma o corrige. Y solo entonces se cambian los papeles.</p>
<p>Parece una tontería, y es tremendamente difícil. La primera vez os vais a cortar a los cuarenta segundos. Y vais a descubrir que muchas veces contestabais a una frase que el otro no había dicho. Los terapeutas que usan la técnica del hablante y el oyente la aplican desde los años noventa, precisamente porque rompe ese reflejo.</p>`,
    },
    {
      id: "la-pausa-de-veinte-minutos",
      title: "2. La pausa de veinte minutos",
      content: `<p>Cuando una discusión sube, el cuerpo la sigue: el corazón se acelera, las manos se crispan, y a partir de cierto punto ya no se oye lo que dice el otro, solo se defiende uno. John Gottman lo midió en su laboratorio poniendo sensores a parejas en plena discusión. <strong>A partir de cierto ritmo cardiaco, discutir ya no sirve de nada.</strong></p>
<p>El ejercicio: acordad en frío una palabra o un gesto que signifique «pausa». Cuando uno de los dos lo hace, la discusión se para, sin discutirlo. Cada uno se va por su lado al menos veinte minutos, y hace otra cosa que darle vueltas: andar, leer, ordenar. Luego lo retomáis, y la mayoría de las veces la conversación ya es posible. Lo que no funciona es irse dando un portazo sin decir cuándo se vuelve: para el otro, eso no es una pausa, es un abandono.</p>`,
      tip: "La pausa solo funciona si el que la pide vuelve. Di enseguida «lo hablamos en media hora» o «esta noche después de cenar». Una pausa sin hora de vuelta es una huida.",
    },
    {
      id: "el-arranque-suave",
      title: "3. El arranque suave",
      content: `<p>En sus observaciones, Gottman se dio cuenta de que la forma en que empieza una conversación predice muy bien cómo termina: una discusión que se abre con un ataque acaba casi siempre mal, aunque uno de los dos se esfuerce después.</p>
<p>El ejercicio consiste en trabajar la primera frase como se trabaja un gesto en el deporte. La forma que funciona es siempre la misma: <strong>lo que siento, a propósito de qué, y lo que necesito</strong>. «Me siento sola cuando llegas y vas directo al móvil. Necesitaría diez minutos contigo antes.» Compáralo con «otra vez con el móvil, cómo no». El tema es el mismo; lo que viene después, no.</p>
<p>Entrenadlo en frío, con temas que todavía no enfaden, para que la forma se vuelva un reflejo el día que cuente.</p>`,
    },
    {
      id: "una-cosa-al-dia",
      title: "4. Una cosa que te ha gustado, cada día",
      content: `<p>Las parejas que van bien se dicen muchas más cosas positivas que negativas, incluso cuando discuten. Las que van mal han perdido la costumbre: al cabo de unos años, ya no se nota lo que el otro hace bien, solo lo que olvida.</p>
<p>El ejercicio es de lo más sencillo: cada día, cada uno le dice al otro una cosa que le ha gustado. Pequeña. «Gracias por traer el pan», «me gustó que llamaras a mi madre», «estuviste gracioso esta noche». Sin «pero» detrás. Hacedlo tres semanas, y veréis que volvéis a mirar al otro de otra manera, porque buscáis algo que decir por la noche.</p>`,
    },
    {
      id: "la-conversacion-para-descomprimir",
      title: "5. La conversación para descomprimir",
      content: `<p>Otro ejercicio del método Gottman, y uno de los más fáciles de poner en marcha. Cada día, durante quince o veinte minutos, cada uno cuenta lo que le ha estresado en su jornada. El trabajo, el transporte, un compañero, los niños. Con una regla: <strong>el otro escucha y apoya, no da consejos</strong>. Nada de «pues haberle dicho que...». Solo «qué rollo», «te entiendo», «¿en serio hizo eso?».</p>
<p>Eso cambia dos cosas. Primero, el estrés de fuera ya no cae sobre la pareja. Segundo, volvéis a contaros la vida, algo que muchas parejas han dejado de hacer sin darse cuenta. Si estáis en el punto de hablar solo de la organización, es por ahí por donde hay que empezar, mucho antes de preguntarse <a href="/es/blog/cuando-ir-a-terapia-de-pareja/">si es hora de consultar</a>.</p>`,
    },
    {
      id: "el-reencuentro",
      title: "6. El ritual del reencuentro",
      content: `<p>El momento en que os reencontráis por la tarde dice mucho de una pareja. ¿Un «hola» sin levantar la vista de la pantalla, o dos minutos de atención de verdad?</p>
<p>El ejercicio: cuando uno llega, el otro para, se acerca, y os dais dos minutos. Un beso que dure más de un segundo, una pregunta sobre el día, y ya. Gottman recomienda incluso un beso de seis segundos, lo bastante largo como para no poder darlo pensando en otra cosa. Hace sonreír, pero probadlo: seis segundos es mucho, y cambia el tono de toda la tarde.</p>`,
    },
    {
      id: "las-preguntas",
      title: "7. Las preguntas que ya no os hacéis",
      content: `<p>Al cabo de unos años, uno cree que lo sabe todo del otro, y deja de preguntar. Solo que el otro cambia: lo que le apetece, lo que teme, lo que sueña con hacer dentro de cinco años. Muchas parejas se descubren en sesión enterándose de cosas que ignoraban por completo.</p>
<p>El ejercicio: una vez a la semana, una pregunta de verdad, cuya respuesta no conozcas. «¿De qué te has sentido orgulloso este año?», «¿qué te da miedo ahora mismo?», «¿qué cambiarías de nuestros fines de semana?». La web tiene cientos, ordenadas por tema, en la página de <a href="/es/preguntas-pareja/">preguntas para hacerse en pareja</a>, con un sorteo para los que no saben por dónde empezar.</p>`,
    },
    {
      id: "la-reunion-semanal",
      title: "8. La reunión de la semana",
      content: `<p>Muchas discusiones estallan porque los temas se han ido acumulando tres semanas sin hablarlos. El ejercicio, que algunos terapeutas llaman la «reunión de pareja», consiste en reservar <strong>un hueco fijo cada semana, media hora, solo para hablar de la pareja</strong>. No de la logística, de la pareja: lo que ha ido bien esta semana, lo que se ha atascado, lo que os gustaría para la semana que viene.</p>
<p>No es muy romántico, dicho así. Pero las parejas que lo hacen hablan de sus problemas cuando son pequeños, y eso es precisamente lo que evita que se hagan grandes. Y nada impide encadenarlo con una cena.</p>`,
    },
    {
      id: "las-frases-que-desactivan",
      title: "9. Las frases que desactivan",
      content: `<p>En todas las discusiones hay momentos en que uno de los dos intenta algo para calmar las cosas: una broma, un «espera, me he explicado mal», una mano en el brazo. Gottman las llama tentativas de reparación, y se dio cuenta de que lo que distingue a las parejas sólidas no es que discutan menos, sino que <strong>esas tentativas se escuchan</strong>.</p>
<p>El ejercicio se hace en frío, entre los dos. Cada uno le dice al otro lo que le ayuda, en plena discusión, a bajar. Para uno, es que le digan «te quiero, incluso ahora». Para el otro, es que el otro reconozca una pequeña parte de culpa. Apuntadlas. Y la próxima vez que suba, usadlas. Parece artificial las dos primeras veces, y luego se vuelve natural.</p>`,
    },
    {
      id: "la-peticion-de-la-semana",
      title: "10. La petición de la semana",
      content: `<p>Muchos reproches son peticiones que nunca se han hecho. Le echamos en cara al otro que no adivine, cuando no le hemos dicho nada. El ejercicio: cada semana, cada uno le hace al otro <strong>una petición concreta, factible y en positivo</strong>. No «sé más presente», sino «me gustaría que cenáramos sin móviles el martes y el jueves». No «deja de quejarte», sino «me gustaría que me dijeras una cosa que te ha gustado de mi día».</p>
<p>El otro tiene derecho a negociar. Pero si dice que sí, lo hace. Al cabo de un mes, habréis cambiado cuatro pequeñas cosas cada uno, y eso es muchas veces más de lo que habría dado una gran conversación sobre «nosotros».</p>`,
    },
    {
      id: "por-donde-empezar",
      title: "Por dónde empezar, y cuándo no basta",
      content: `<p>No todos a la vez. Elegid un ejercicio, uno solo, y mantenedlo tres semanas antes de añadir otro. Los dos primeros de la lista son buenos puntos de partida si discutís mucho; el cuarto y el quinto, si os habéis alejado sin discutir.</p>
<p>Si no sabéis en qué se atasca vuestra pareja, hay una forma de verlo en blanco y negro: la web ofrece una <a href="/es/evaluacion-de-pareja/" data-bilan-src="article-therapie">evaluación de pareja de cien preguntas, cada uno en su móvil</a>, cuyo informe enseña ámbito por ámbito dónde estáis de acuerdo y dónde no. Eso permite elegir el ejercicio que sirve, en vez de ir a ciegas.</p>
<p>Y hay situaciones en las que los ejercicios no bastan: cuando uno de los dos no quiere hacerlos, cuando ha habido una infidelidad, cuando cada intento acaba en discusión. No es un fracaso, es la señal de que un tercero ayudaría. La <a href="/es/blog/terapia-de-pareja/">guía sobre la terapia de pareja</a> explica cómo funciona y cómo encontrar una. Y si estáis en plena tormenta, está primero <a href="/es/blog/crisis-de-pareja-que-hacer/">qué hacer cuando la pareja está en crisis</a>.</p>
<a href="/es/blog/terapia-de-pareja/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lee también</span><span class="blog-read-also-title">Terapia de pareja: cómo funciona, cuánto cuesta y por dónde empezar</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
