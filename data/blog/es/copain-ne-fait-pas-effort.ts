import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'novio-no-hace-esfuerzo',
  title: "Mi novio no hace ningún esfuerzo: qué significa y qué hacer",
  metaTitle: "Mi novio no hace ningún esfuerzo: qué hacer de verdad",
  metaDescription: "Haces todo tú, él nada. O casi. Por qué algunos hombres dejan de esforzarse, cómo reconocerlo, qué significa y qué hacer concretamente.",
  featuredImage: '',
  featuredImageAlt: "Mesa puesta para dos, un cubierto preparado con esmero con vela y flores, el otro sitio vacío",
  publishedAt: '2026-03-08',
  author: AUTHORS['thomas'],
  excerpt: "El desequilibrio de esfuerzo en una pareja es una de las causas más frecuentes de ruptura, precisamente porque se instala progresivamente y tendemos a adaptarnos antes de darnos cuenta de cuánto pesa.",
  introduction: `<p>Tú organizas, tú anticipas, tú piensas en todo. Las salidas, los regalos, los momentos juntos, las conversaciones importantes. Y él está ahí, responde cuando propones, participa cuando insistes, pero nada viene realmente de su parte. Tienes la sensación de <a href="/es/test-relacion-sana/">llevar la relación a cuestas</a> desde hace un tiempo, y empiezas a preguntarte si es normal, si pides demasiado, o si algo no va bien de verdad.</p>
<p>No eres tú quien exagera. <strong>El desequilibrio de esfuerzo en una pareja es una de las causas más frecuentes de ruptura, precisamente porque se instala progresivamente y tendemos a adaptarnos antes de darnos cuenta de cuánto pesa.</strong> Este artículo está aquí para poner palabras a lo que sientes, entender qué está pasando realmente, y decidir qué hacer.</p>`,
  quickSummary: [
    "El desequilibrio de esfuerzo se instala progresivamente y empeora si no se aborda.",
    "Existen varias razones: efecto \"conquistado\", incomprensión de tus necesidades, bajada de inversión emocional, o forma de funcionar arraigada.",
    "No, no pides demasiado. Querer que tu pareja piense en ti espontáneamente es una necesidad relacional normal.",
    "Cómo hablarlo: hablar de lo que sientes tú, ser concreta sobre lo que esperas, elegir el momento adecuado.",
    "Lo que puede cambiar con una conversación honesta, y lo que no cambiará sin trabajo profundo de su parte.",
  ],
  sections: [
    {
      id: 'senales-de-un-vistazo',
      title: "Las señales de un vistazo",
      content: `<div><table><thead><tr><th>Lo que observas</th><th>Lo que puede significar</th></tr></thead><tbody>
<tr><td>Siempre eres tú quien propone planes</td><td>Él espera, no crea. La relación descansa sobre ti.</td></tr>
<tr><td>Se olvida de las fechas importantes</td><td>No eres una prioridad en su organización mental.</td></tr>
<tr><td>Los esfuerzos se acabaron después de la fase de conquista</td><td>Se esforzaba para conquistarte, no para mantener la relación.</td></tr>
<tr><td>No busca hacerte feliz de forma espontánea</td><td>La atención consciente ha desaparecido. No es maldad, pero es real.</td></tr>
<tr><td>Cuando se lo dices, promete, pero nada cambia</td><td>Escucha el mensaje pero no siente urgencia de actuar.</td></tr>
<tr><td>Te sientes sola en la relación</td><td>La presencia física no reemplaza la inversión emocional.</td></tr>
<tr><td>Se esfuerza por sus amigos y su trabajo, pero no por ti</td><td>La capacidad existe. La motivación, no.</td></tr>
</tbody></table></div>`,
    },
    {
      id: 'por-que-dejan-de-esforzarse',
      title: "Por qué los hombres dejan de esforzarse",
      content: `<p>Lo primero que hay que entender es que "no hace ningún esfuerzo" abarca realidades muy distintas según la situación. Hay varias razones posibles, y no todas tienen las mismas implicaciones para ti.</p>`,
      subsections: [
        {
          id: 'efecto-conquistado',
          title: "El efecto \"conquistado\"",
          content: `<p>Es el caso más frecuente y, de cierta manera, el más común. Al principio de una relación, los dos están en modo conquista: se presta atención, se planifica, se busca agradar. Luego la relación se asienta, la seguridad llega con ella, y el esfuerzo consciente desaparece poco a poco. No por indiferencia, sino por comodidad. El problema es que este relajamiento suele ser asimétrico: tú continúas, él se deja llevar. <strong>No te quiere menos, simplemente ha dejado de mostrarlo.</strong> Es un problema real aunque no sea lo mismo que la indiferencia deliberada.</p>`,
        },
        {
          id: 'no-se-da-cuenta',
          title: "No se da cuenta de lo que haces",
          content: `<p>Muchos hombres no son conscientes de la carga invisible que lleva su pareja. Los aniversarios recordados, las reservas hechas, los detalles planificados, las conversaciones iniciadas, todo eso pasa desapercibido precisamente porque funciona. Cuando alguien gestiona bien las cosas, el otro no ve el trabajo detrás. No es una excusa, es un mecanismo que conviene conocer para saber cómo hablarlo.</p>`,
        },
        {
          id: 'no-sabe-que-significa',
          title: "No sabe lo que \"esforzarse\" significa para ti",
          content: `<p>Los lenguajes del amor no son universales. Él quizás cree que se esfuerza: es fiel, está presente, no se queja, aporta estabilidad. Tú necesitas atenciones concretas, momentos planificados, gestos que demuestren que piensa en ti fuera de cuando estáis juntos. Estas dos visiones son compatibles, pero solo si se expresan claramente. Una pareja puede funcionar mucho tiempo con este malentendido sin que ninguno entienda realmente qué le falta al otro.</p>`,
        },
        {
          id: 'ha-perdido-las-ganas',
          title: "Ha perdido las ganas, sin darse cuenta necesariamente",
          content: `<p>Esta es la versión más difícil de escuchar. A veces la falta de esfuerzo no es un descuido ni un malentendido, sino la señal de que su inversión emocional en la relación ha bajado. No necesariamente que quiera irse, sino que algo se ha apagado sin que lo haya verbalizado, quizás incluso sin que lo haya interiorizado él mismo. Este caso merece una conversación de verdad, no un enésimo recordatorio sobre fechas de aniversario.</p>`,
        },
        {
          id: 'su-forma-de-funcionar',
          title: "Es su forma de funcionar, en todas sus relaciones",
          content: `<p>Algunos hombres nunca han aprendido a expresar su implicación a través de actos concretos. Sin modelo familiar en ese sentido, sin hábito cultural, sin reflejo desarrollado. Es distinto a la falta de ganas, pero produce el mismo resultado para ti. La diferencia está en que en este caso el cambio es posible, pero requiere un trabajo real de su parte, no solo buena voluntad puntual.</p>`,
        },
      ],
    },
    {
      id: 'no-pides-demasiado',
      title: "No, no pides demasiado",
      content: `<p>Esto es lo primero que solemos decirnos en esta situación: "quizás espero demasiado, quizás soy demasiado exigente". Es un pensamiento natural, y dice algo importante sobre ti, que te cuestiones antes de acusar. Pero en la gran mayoría de los casos, las mujeres que se hacen esta pregunta no piden demasiado. Piden lo que es razonable en una <a href="/es/blog/cosas-no-aceptar-pareja/">relación adulta y equilibrada</a>.</p>
<p>Querer que tu pareja piense en ti de vez en cuando sin que se lo hayas pedido, querer que tome iniciativas, querer sentir que importas en sus pensamientos fuera de cuando estás físicamente delante de él, <strong>son necesidades relacionales normales, no caprichos.</strong> La pregunta no es si tienes derecho a tenerlas. La pregunta es si él es capaz de satisfacerlas, y si quiere hacerlo.</p>
<p>Hay una diferencia entre un hombre que todavía no sabe cómo demostrarte que le importas, y un hombre que lo sabe pero no lo hace. Y entre los dos, hay una conversación pendiente.</p>`,
    },
    {
      id: 'como-hablarlo',
      title: "Cómo hablarlo sin que acabe en discusión",
      content: `<p>La mayoría de las conversaciones sobre este tema acaban mal porque empiezan mal. "Nunca haces nada" desencadena una defensa inmediata. "No te implicas en esta relación" suena como una acusación a la que va a responder con un contraataque o con silencio. No es que esté equivocado al sentirse atacado, es que el formato no crea las condiciones para que escuche de verdad lo que dices.</p>
<p>Lo que funciona mejor: hablar de lo que sientes tú, no de lo que él hace o no hace. "Me he sentido sola en nuestra organización común últimamente" aterriza diferente a "nunca te esfuerzas". No es una técnica de manipulación, simplemente la primera frase abre una conversación y la segunda abre un juicio.</p>
<p>Algunos puntos concretos para que vaya mejor:</p>
<p>Elige un momento tranquilo, no justo después de una frustración reciente. Una conversación iniciada cuando acabas de organizarlo todo sola por tercera vez seguida tiene pocas posibilidades de ir bien. Espera un momento en el que estéis bien los dos.</p>
<p>Sé concreta sobre lo que esperas. "Esforzarse" es vago. "Me gustaría que propusieras salir juntos una vez a la semana, que te acordaras de mi cita importante del jueves y me preguntaras después" es accionable. Cuanto más concreto, más puede responder a algo real.</p>
<p>Escucha su respuesta de verdad. Quizás tiene una visión muy diferente de lo que cree aportar a la relación. No para validar esa visión si no te conviene, sino para entender de dónde parte antes de decidir qué hacer.</p>`,
    },
    {
      id: 'lo-que-puede-cambiar',
      title: "Lo que puede cambiar y lo que probablemente no",
      content: `<p>Es la parte que muchos artículos evitan porque es menos cómoda. Esto es lo que se observa en la práctica.</p>
<p><strong>Lo que puede cambiar con una conversación real:</strong> los olvidos por descuido, la falta de conciencia de lo que gestionas, los comportamientos ligados a un malentendido sobre tus necesidades. Muchos hombres, cuando entienden realmente qué falta (no solo que "la han liado"), son capaces de ajustarse. No perfectamente, no de un día para otro, pero de verdad.</p>
<p><strong>Lo que raramente cambia sin un trabajo profundo de su parte:</strong> la falta básica de inversión emocional, los comportamientos que existen en todas sus relaciones y no solo contigo, la tendencia a prometer sin actuar. Estas cosas pueden evolucionar, pero requieren que él identifique el problema por sí mismo y decida trabajarlo. No puedes hacer ese camino en su lugar.</p>
<p><strong>Lo que no cambia:</strong> alguien que no ve el problema, que minimiza sistemáticamente lo que expresas, que se esfuerza dos semanas y luego vuelve exactamente al mismo punto. <a href="/es/blog/red-flags-en-un-hombre/">Ese patrón repetido</a> no es falta de habilidad, es falta de motivación real. Y eso no lo cambia ninguna conversación si las ganas no están de su lado.</p>`,
    },
    {
      id: 'la-verdadera-pregunta',
      title: "La verdadera pregunta que hacerse",
      content: `<p>En el fondo, "mi novio no hace ningún esfuerzo" esconde a menudo una pregunta más profunda: ¿me quiere de verdad, le importa esta relación tanto como a mí? Es una pregunta legítima, y merece una respuesta honesta.</p>
<p>Un hombre que realmente se preocupa por alguien busca naturalmente cómo demostrarlo. No de forma extravagante, no constantemente, pero hay algo. Una atención espontánea de vez en cuando. Un esfuerzo por algo que le importa a ella. El recuerdo de lo que le gusta. Si todo eso lleva mucho tiempo ausente y después de hablarlo nada se mueve, la pregunta ya no es "cómo hacérselo entender", sino "¿quiero seguir <a href="/es/test-relacion-toxica/">cargando esta relación sola</a>".</p>
<p>No es una pregunta fácil. Pero es la correcta.</p>`,
    },
  ],
  readAlso: {
    slug: 'red-flags-en-un-hombre',
    title: "Red flags en un hombre",
  },
};

export default article;
