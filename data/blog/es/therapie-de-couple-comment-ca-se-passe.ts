import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "como-es-una-terapia-de-pareja",
  title: "¿Cómo es una terapia de pareja? De la primera llamada a la última sesión",
  metaTitle: "Cómo es una terapia de pareja: sesión a sesión",
  metaDescription: "Cómo es una terapia de pareja: la primera cita, lo que pregunta el terapeuta, cada cuánto se va, los ejercicios entre sesiones y cómo termina.",
  featuredImage: "/blog/therapie-de-couple-comment-ca-se-passe.webp",
  featuredImageAlt: "Los dos personajes de Quiz Couple sentados juntos en un sofá, con un reloj de arena y un cuaderno abierto en la mesita",
  publishedAt: "2026-12-29T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "La primera llamada, la primera sesión, lo que pregunta el terapeuta, cada cuánto se vuelve y cómo termina: una terapia de pareja contada en orden.",
  introduction: `<p>Una terapia de pareja se hace en sesiones de una hora más o menos, los dos juntos, frente a un terapeuta que hace preguntas, frena las discusiones cuando se desmadran y os pone cosas para probar entre cita y cita. La primera sesión sirve sobre todo para contar. Las siguientes, para cambiar la forma en que os habláis.</p>
<p>Así es como va, en orden, desde la primera llamada hasta el día en que ya no necesitáis ir.</p>`,
  quickSummary: [
    "La primera sesión sirve para contar vuestra historia y lo que os trae; ese día el terapeuta no da su opinión.",
    "Una sesión dura de 45 minutos a hora y media, más o menos cada dos o tres semanas.",
    "El terapeuta no busca culpables: mira cómo reacciona cada uno al otro, y frena las escaladas.",
    "Algunos terapeutas ven también a cada uno por separado una vez, al principio, para oír lo que no se dice delante del otro.",
    "Entre sesiones hay ejercicios. Ahí es donde cambia la pareja, no solo en la consulta.",
    "Una terapia dura de tres meses a un año. Termina cuando conseguís hacer solos lo que hacíais en la sesión.",
  ],
  sections: [
    {
      id: "la-primera-llamada",
      title: "La primera llamada",
      content: `<p>Todo empieza con un mensaje o una llamada, casi siempre del que más ganas tiene de ir. El terapeuta suele preguntar dos o tres cosas: cuánto tiempo lleváis juntos, qué os trae en una frase, y si vais a ir los dos. Son cinco minutos. También te dirá su tarifa y cuánto dura una sesión.</p>
<p>Un detalle que importa: <strong>la mayoría de los terapeutas quieren ver a la pareja junta desde la primera vez</strong>. Si vas solo a la primera sesión, algunos consideran que te conviertes en «su» paciente y que ya no podrán recibir a la pareja de forma neutral. A otros les da igual. Pregúntalo por teléfono, así se evitan malentendidos.</p>
<p>Si no sabes a quién acudir, la <a href="/es/blog/terapia-de-pareja/">guía sobre la terapia de pareja</a> explica la diferencia entre psicólogo, psicoterapeuta y terapeuta de pareja, y lo que hay que mirar antes de pedir cita.</p>`,
    },
    {
      id: "la-primera-sesion",
      title: "La primera sesión: se cuenta",
      content: `<p>Estáis sentados uno al lado del otro, o en dos sillones girados hacia el terapeuta. Casi siempre empieza con la misma pregunta: «¿Qué os trae por aquí?». Y ahí pasan dos cosas. O uno de los dos habla diez minutos y el otro se calla, o os cortáis a los treinta segundos. En los dos casos, el terapeuta ya está aprendiendo mucho de vosotros.</p>
<p>Luego va hacia atrás en el tiempo. Cómo os conocisteis, qué os gustó del otro, en qué momento empezó a torcerse. <strong>No es curiosidad:</strong> una pareja que cuenta cómo se conoció sonriendo no está en el mismo sitio que una pareja que ni se acuerda de por qué se juntó. De hecho, los terapeutas formados en el método Gottman hacen una entrevista de este tipo, muy pautada, sobre la historia de la pareja.</p>
<p>También pregunta qué espera cada uno de la terapia. Y pasa que las respuestas no coinciden: uno quiere salvar la pareja, el otro quiere «ver si todavía es posible». El terapeuta lo anota, sin juzgar, porque a menudo ese es el verdadero punto de partida.</p>
<p>Al final de esa primera hora, no habéis resuelto nada. Es normal. Os vais con una segunda cita, y muchas veces con una pequeña tarea, del estilo «de aquí a entonces, apuntad los momentos en que la cosa va bien».</p>`,
      tip: "Mucha gente tiene miedo de que la «juzguen» en la primera sesión. En la práctica, el terapeuta se pasa la hora escuchando y haciendo preguntas. Si diera su opinión el primer día, sería más bien mala señal.",
    },
    {
      id: "las-sesiones-individuales",
      title: "A veces, una sesión cada uno por su lado",
      content: `<p>Después del primer encuentro, algunos terapeutas ven a cada miembro de la pareja a solas, una vez. Eso permite oír lo que no se dice delante del otro: una aventura en curso, las ganas de irse, un miedo del que uno se avergüenza.</p>
<p>Casi siempre se aplican dos reglas. Primera: <strong>lo que se dice en la sesión individual no se le repite al otro</strong>. Segunda, y menos conocida: muchos terapeutas se niegan a «cargar» con un secreto que haría imposible la terapia, por ejemplo una infidelidad que continúa. En ese caso, le piden a la persona que lo cuente ella misma, o dejan de atender a la pareja. Lo avisan desde el principio, para que cada uno sepa a qué atenerse.</p>`,
    },
    {
      id: "una-sesion-normal",
      title: "Cómo es una sesión normal",
      content: `<p>A partir de la segunda o la tercera sesión, el trabajo cambia de naturaleza. Muchas veces llegáis con algo que ha pasado esa semana, una discusión en el coche, una comida familiar que acabó mal, y <strong>el terapeuta os la hace repetir a cámara lenta</strong>.</p>
<p>Le pregunta a uno qué sintió en el momento exacto en que el otro dijo tal frase. Le pregunta al otro qué había querido decir. Y ahí, casi siempre, se descubre que los dos no estaban en la misma escena. Ella oyó «nunca haces nada», él creía haber dicho «me habría gustado que me echaras una mano esta noche».</p>
<p>Cuando la conversación se va otra vez a los reproches, corta. Sin brusquedad, pero corta: «Ahora mismo te estás defendiendo. ¿Puedes repetir solo lo que has entendido de lo que ella acaba de decir?». Repetir, esperar a que el otro confirme, y luego contestar. <strong>Es lento, y es a propósito.</strong> En casa vais cien veces más rápido, y precisamente por eso descarrila.</p>
<p>Según la corriente del terapeuta, el acento cambia. En la terapia focalizada en las emociones, busca lo que hay debajo del enfado, muchas veces el miedo a dejar de importarle al otro, y hace que la pareja recorra ese círculo en el que uno persigue y el otro se cierra. Con el método Gottman se trabaja más la forma concreta de empezar una conversación difícil, de reconciliarse después, y de mostrar consideración en el día a día. En los dos casos, el objetivo es el mismo: <strong>que lleguéis a hacerlo sin él</strong>.</p>`,
    },
    {
      id: "el-ritmo",
      title: "Cada cuánto, y durante cuánto tiempo",
      content: `<p>Una sesión dura entre 45 minutos y hora y media, más que una sesión individual porque hay dos personas a las que escuchar. El ritmo habitual es <strong>una sesión cada dos o tres semanas</strong>: lo bastante cerca para no perder el hilo, lo bastante separadas para que os dé tiempo a probar cosas entre medias.</p>
<p>Al principio, sobre todo si la cosa está muy mal, algunos proponen una sesión por semana. Hacia el final, se espacian a una al mes, y luego se para. Una terapia de pareja completa suele ser de diez a veinte sesiones, es decir, de tres meses a un año. Lo que cuesta en total está detallado en el artículo sobre <a href="/es/blog/terapia-de-pareja-precio/">el precio de una terapia de pareja</a>.</p>
<p>Y están las sesiones «sueltas»: parejas que terminaron su terapia y vuelven una vez, dos años después, porque hay un tema concreto que se ha atascado. Es frecuente, y más bien buena señal.</p>`,
    },
    {
      id: "entre-sesiones",
      title: "Entre sesiones: los ejercicios",
      content: `<p>Casi todos los terapeutas ponen algo para hacer en casa. Puede ser muy sencillo: deciros cada noche una cosa que os ha gustado del otro, dedicar veinte minutos al día a contaros la jornada sin dar consejos, o apuntar los momentos en que la discusión estuvo a punto de estallar y qué lo evitó.</p>
<p><strong>Ahí es donde cambia la pareja.</strong> Una hora cada dos semanas no basta; lo que cuenta es lo que hacéis los otros trece días. Las parejas que hacen los ejercicios avanzan mucho más rápido que las que vienen «solo a hablar». Y si tenéis ganas de empezar antes incluso de tener cita, hay <a href="/es/blog/ejercicios-terapia-de-pareja/">una decena de ejercicios de terapia de pareja para hacer en casa</a>, con la forma de hacerlos.</p>`,
    },
    {
      id: "como-termina",
      title: "Cómo termina",
      content: `<p>No hay ceremonia de cierre. Un día llegáis a la sesión y no tenéis gran cosa que contar, porque la discusión de la semana la habéis resuelto solos, usando lo que habéis aprendido. El terapeuta propone entonces espaciar, y luego parar, dejando la puerta abierta.</p>
<p>También hay terapias que terminan en separación. No es raro, y no es un fracaso: una pareja que se deja hablándose, habiendo entendido lo que no funcionó, se deja infinitamente mejor que una pareja que se va dando un portazo. Algunos terapeutas acompañan de hecho esa etapa, sobre todo cuando hay hijos.</p>
<p>Y si todavía no has llegado a pedir cita, si primero te preguntas en qué punto estáis, la web ofrece <a href="/es/evaluacion-de-pareja/" data-bilan-src="article-therapie">una evaluación de pareja de cien preguntas, cada uno en su móvil</a>, que compara vuestras respuestas punto por punto. No es una terapia, pero da una idea muy precisa de lo que tendríais que hablar.</p>
<a href="/es/blog/terapia-de-pareja/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lee también</span><span class="blog-read-also-title">Terapia de pareja: cómo funciona, cuánto cuesta y por dónde empezar</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
