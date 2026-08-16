import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'discusiones-pareja-vacaciones',
  title: `Vacaciones: una pareja de cada tres discute en la carretera, y empezó antes de salir`,
  metaTitle: `Discusiones de pareja en vacaciones: cifras y causas reales`,
  metaDescription: `El 28 % de las parejas vive el viaje de vacaciones con tensión y el 47 % de las mujeres ya ha discutido por la organización.`,
  featuredImage: '/blog/disputes-couple-vacances.webp',
  featuredImageAlt: `Maletero abierto al borde de una carretera de campo, maletas a medio cargar, dos sombras que se dan la espalda`,
  publishedAt: '2026-08-12',
  author: AUTHORS['lucie-courtin'],
  excerpt: `Se supone que las vacaciones reparan la pareja. En las encuestas, sobre todo sacan a la superficie lo que ya iba mal. Estas son las cifras reales y el momento exacto en que se tuerce.`,
  introduction: `<p>Empecemos por la cifra, que es lo que te ha hecho hacer clic: <strong>el 28 % de las personas en pareja declara que el viaje de vacaciones es un momento tenso</strong>, según una encuesta de OpinionWay realizada para Direct Assurance entre 1 016 personas en mayo de 2025. La prensa lo redondeó a «una pareja de cada tres», y no es abusivo.</p>

<p>Solo que esa cifra describe el coche. No describe el principio de la historia. Porque otra encuesta, también francesa, muestra que <strong>la discusión empezó muchas veces varias semanas antes, en la preparación</strong>: el 47 % de las mujeres en pareja y el 38 % de los hombres dicen haber discutido ya con su pareja por la organización de las vacaciones.</p>

<p>Así que no, ¡no hay que anular nada! Pero sí merece la pena saber por dónde se rompe, porque casi nunca es por donde se cree.</p>`,
  quickSummary: [
    `El 28 % de las personas en pareja vive con tensión el viaje de vacaciones, y en el 83 % de los trayectos conduce una sola persona.`,
    `El 47 % de las mujeres y el 38 % de los hombres ya han discutido por la organización de las vacaciones, antes incluso de salir.`,
    `El detonante número uno no es el destino: es el desequilibrio en la preparación, citado por el 40 % de las mujeres.`,
    `Una vez allí, el 49 % cree que compartir espacio aumenta las discusiones… mientras el 73 % se considera facilísimo de llevar.`,
    `Pasarse del presupuesto viene justo después, y afecta al 30 % de las parejas.`,
    `Lo que más apacigua no es comunicarse mejor, sino organizar tiempo por separado: unas dos horas al día.`,
  ],
  sections: [
    {
      id: 'la-respuesta-corta',
      title: `Por qué las vacaciones sacan lo que ya estaba ahí`,
      content: `<p>Las parejas no discuten porque se vayan de vacaciones. <strong>Discuten porque las vacaciones eliminan de golpe las tres cosas que tapaban el problema el resto del año</strong>: el trabajo, los horarios desfasados y las habitaciones separadas.</p>

<p>Durante once meses, dos personas que no se entienden demasiado bien en la organización pueden convivir perfectamente: cada uno gestiona su día, os cruzáis por la noche, no hay tiempo de hablarlo. En vacaciones ese colchón desaparece. Estáis juntos dieciséis horas al día, en un espacio más pequeño que vuestra casa, con decisiones que tomar cada dos horas.</p>

<p>Por eso las vacaciones no crean los problemas: los hacen visibles, muy rápido y todos a la vez.</p>`,
    },
    {
      id: 'las-cifras',
      title: `Las 6 cifras, en el orden en que llega la discusión`,
      content: `<p>La cronología importa más que los porcentajes por separado. Así se desarrolla, de mayo hasta la segunda semana en el destino.</p>

<ol>
<li><p><strong>47 % de las mujeres, 38 % de los hombres:</strong> la proporción de personas que ya han discutido con su pareja por la organización de las vacaciones. Es el primer punto de fricción, y llega antes de la reserva.</p></li>

<li><p><strong>El 66 % de las mujeres dice hacer más</strong> que su pareja en la preparación, y un 43 % dice «mucho más». Enfrente, el 53 % de los hombres cree haber participado a partes iguales, frente a solo el 27 % de las mujeres. No es un desacuerdo sobre las vacaciones, es un desacuerdo sobre lo que ha pasado.</p></li>

<li><p><strong>30 %:</strong> la proporción de parejas que discute por pasarse del presupuesto. Una cifra estable, y la única que se arregla de verdad con una hoja de cálculo.</p></li>

<li><p><strong>El 28 % vive el trayecto con tensión.</strong> La elección del itinerario y el estilo de conducción encabezan los motivos, muy por delante del cansancio o de los hijos.</p></li>

<li><p><strong>83 %:</strong> la proporción de trayectos en los que conduce una sola persona de principio a fin, casi siempre un hombre. Alrededor de una mujer de cada tres dice preferir no coger el volante por miedo a los comentarios de su pareja.</p></li>

<li><p><strong>49 %:</strong> ya en el destino, casi una persona de cada dos cree que compartir espacio con sus compañeros de viaje aumenta la probabilidad de discutir.</p></li>
</ol>

<aside class="blog-tip-box">
<p class="blog-tip-box-title">📌 Conviene saberlo</p>
<p>Ninguna de estas cifras mide lo mismo, y ahí está justamente el interés. No hablamos de una pareja que discute una vez: hablamos de cuatro momentos distintos, en mayo, en junio, en la autopista y al tercer día de apartamento. Una pareja puede superar los tres primeros sin problema y estallar en el cuarto.</p>
</aside>`,
    },
    {
      id: 'no-es-el-destino',
      title: `El detonante casi nunca es el destino`,
      content: `<p>Es el malentendido más frecuente, y sale caro: mientras se busque el problema en la elección del hotel, no se encuentra.</p>`,
      subsections: [
        {
          id: 'el-destino-llega-cuarto',
          title: `El destino solo llega en cuarto lugar`,
          content: `<p>Se cree que se discute porque uno quería playa y el otro montaña… pero en la encuesta del IFOP, el desacuerdo sobre el destino solo afecta al <strong>26 % de las personas entrevistadas</strong>, hombres y mujeres juntos. Es real, pero llega muy por detrás.</p>

<p>El motivo número uno, citado por el <strong>40 % de las mujeres</strong>, es la falta de implicación de la pareja. No «elegiste mal el sitio», sino «lo he hecho todo yo sola».</p>`,
        },
        {
          id: 'una-tarea-visible-contra-diez-invisibles',
          title: `Una tarea muy visible contra diez que no se ven`,
          content: `<p>Cuando se mira el detalle de las tareas se entiende por qué acaba saliendo. En las vacaciones familiares, son ellas quienes declaran mayoritariamente arrancar la organización (56 % frente a 31 %), reservar el alojamiento (48 % frente a 26 %), preparar las comidas allí (54 % frente a 24 %) y hacer la maleta de los niños, cerca del 80 % frente a un 10 % aproximadamente. Ellos conducen: 58 % frente a 18 %.</p>

<p>Conducir se ve. Haber pensado en la cartilla médica y en los zapatos de repuesto, no. Ese es exactamente el terreno en el que un desacuerdo que nunca se dice acaba saliendo por un asunto minúsculo, normalmente el peaje o el GPS.</p>`,
        },
      ],
    },
    {
      id: 'la-paradoja',
      title: `La paradoja que explica todo lo demás`,
      content: `<p>Esta es la estadística más divertida de todo el expediente, y probablemente la más útil.</p>

<p>En una encuesta realizada en marzo de 2026 por Talker Research entre 2 000 estadounidenses que viajan con sus allegados, <strong>el 73 % de los entrevistados se considera el compañero de viaje ideal</strong>. Fácil de llevar, flexible, nunca un problema.</p>

<p>En la misma encuesta, <strong>el 49 % cree que compartir espacio aumenta las discusiones</strong>.</p>

<p>Las dos cifras no pueden ser ciertas a la vez. Si casi tres personas de cada cuatro son perfectas, ¿de dónde salen las discusiones? Los autores lo llaman la brecha de compatibilidad en viaje: cada uno mide su propia flexibilidad por sus intenciones, y la del otro por sus comportamientos.</p>

<div class="blog-verdict">
<div class="blog-verdict-col blog-verdict-col--oui">
<p class="blog-verdict-titre"><span aria-hidden="true">👍</span> Los detonantes reales</p>
<ul>
<li><strong>El desequilibrio en la preparación</strong>, citado por el 40 % de las mujeres como primer motivo.</li>
<li><strong>El presupuesto que se desborda</strong>, el 30 % de las parejas.</li>
<li><strong>La falta de espacio personal</strong>, una vez en el destino.</li>
<li><strong>El ritmo</strong>: uno quiere cinco visitas al día, el otro quiere dormir.</li>
</ul>
</div>
<div class="blog-verdict-col blog-verdict-col--non">
<p class="blog-verdict-titre"><span aria-hidden="true">👎</span> Lo que se acusa sin razón</p>
<ul>
<li><strong>El destino</strong>, implicado solo en el 26 % de los casos.</li>
<li><strong>El tiempo que hace</strong>, que sirve sobre todo de pretexto a una tensión ya presente.</li>
<li><strong>El país elegido</strong>: ninguna encuesta seria demuestra que un destino haga discutir más que otro.</li>
<li><strong>El hecho de irse</strong>: el problema no es el viaje, es lo que el viaje revela.</li>
</ul>
</div>
</div>`,
    },
    {
      id: 'lo-que-desactiva',
      title: `Lo que lo desactiva, y no es «comunicarse mejor»`,
      content: `<p>La respuesta habitual a este tipo de artículo es «hablad». Solo que las cifras apuntan a otra cosa, y bastante más fácil de aplicar.</p>`,
      subsections: [
        {
          id: 'dos-horas-al-dia-por-separado',
          title: `Dos horas al día cada uno por su lado`,
          content: `<p>En la encuesta de Talker Research, el 77 % de los entrevistados dice que disponer de espacio personal calma las tensiones, y el 68 % que el tiempo a solas les hace sentirse <em>más</em> cerca de su grupo de viaje. La necesidad mediana ronda las dos horas al día.</p>

<p>Dos horas no es una habitación separada ni un viaje aparte: es un café mientras el otro duerme la siesta. Y va previsto de antemano, porque si no nunca se coge.</p>`,
        },
        {
          id: 'novedad-en-vez-de-comodidad',
          title: `Novedad en vez de comodidad`,
          content: `<p>Un estudio publicado en 2024 en <em>Annals of Tourism Research Empirical Insights</em> siguió a 238 personas en pareja y después a 102 parejas que viajaban realmente juntas. Los investigadores midieron la cantidad de experiencias nuevas, interesantes o algo exigentes vividas durante la estancia.</p>

<p>Resultado: cuantas más había, mayores eran la pasión, la satisfacción con la relación y la intimidad física <em>después</em> de volver. Y el efecto no dependía de la antigüedad de la pareja, de un año a más de treinta.</p>`,
        },
        {
          id: 'dos-listas-escritas',
          title: `Dos listas escritas, no un «ayúdame»`,
          content: `<p>«Ayúdame» deja la tarea de repartir a quien ya la lleva: todavía hay que decidir qué delegar, explicarlo y luego comprobarlo. Dos listas separadas, escritas, con un nombre delante de cada línea, eliminan ese paso invisible.</p>

<p>Y para el trayecto, la solución es casi tonta: ocupar al copiloto. Cuando sube la tensión en el coche, <strong>el 40 % de las parejas opta por el silencio</strong>, que no arregla nada e instala dos horas de frío hasta la siguiente área de servicio.</p>`,
        },
      ],
    },
    {
      id: 'con-hijos',
      title: `Con hijos, la ecuación cambia`,
      content: `<p>Esta es la parte en la que la mayoría de los artículos se inventa una cifra. Voy a hacer lo contrario.</p>`,
      subsections: [
        {
          id: 'lo-que-no-se-puede-afirmar',
          title: `Lo que ninguna encuesta seria permite afirmar`,
          content: `<p>No he encontrado ningún dato fiable que permita escribir «el X % de las parejas con hijos discute frente al Y % sin hijos». Las cifras que circulan salen de sondeos comerciales sin metodología publicada, y prefiero dejar la casilla vacía.</p>

<p>Lo mismo con los destinos: nada demuestra que un país haga discutir más que otro. Si lees eso en algún sitio, ¡pregunta por el tamaño de la muestra!</p>`,
        },
        {
          id: 'lo-que-si-esta-documentado',
          title: `Lo que sí está documentado: la carga se desplaza`,
          content: `<p>La maleta de los niños, el botiquín, la elección de ropa adecuada y las actividades recaen en las mujeres en el 75 a 86 % de los casos según la tarea. No es una discusión en sí, es el depósito del que la discusión va a tirar.</p>

<p>Y en el alojamiento, la necesidad cambia de naturaleza: el 70 % de los padres que viajan con sus hijos considera imprescindibles varias habitaciones, frente al 58 % del conjunto de viajeros. No es lujo, es la única forma de recuperar las dos horas de las que hablábamos antes.</p>

<p>Si el tema vuelve idéntico cada año, no son las vacaciones lo que falla: es <a href="/es/test-parentalidad-pareja/">el reparto de la carga parental</a> el resto del año, que sencillamente se vuelve imposible de ignorar cuando estáis encerrados a cuatro en cuarenta metros cuadrados.</p>`,
        },
      ],
    },
    {
      id: 'preguntas-frecuentes',
      title: `Lo que las parejas preguntan antes de reservar`,
      content: `<p><strong>¿Discutir en vacaciones es mala señal?</strong><br>
No, no en sí mismo. Lo que cuenta es el tema y el final. Una discusión por el GPS que se acaba en el área de servicio no tiene nada que ver con una discusión sobre la implicación que vuelve cada verano desde hace seis años. La segunda habla del resto del año.</p>

<p><strong>¿Hay que irse cada uno por su lado?</strong><br>
No es una tontería, y no es reconocer un fracaso. Pero antes de llegar ahí, la opción más barata es mantener el mismo viaje e insertarle tiempo por separado. La diferencia entre dos personas que se ahogan y dos personas que están bien suele ser de dos horas al día.</p>

<p><strong>¿Cómo saber si queremos las mismas vacaciones?</strong><br>
Respondiendo cada uno por su lado antes de hablarlo, en lugar de negociar en voz alta. Comparar respuestas escritas desactiva mucho: deja de ser tú contra el otro y pasa a ser los dos frente a <a href="/es/test-puntos-comunes-pareja/">vuestros puntos en común reales</a>, medidos en lugar de supuestos.</p>

<p><strong>¿Y si las vacaciones acabaron realmente mal?</strong><br>
Una semana difícil no dice gran cosa. Una semana difícil que se parece a los once meses anteriores, sí. En ese caso la pregunta útil no es «por qué discutimos en Cerdeña», sino <a href="/es/test-relacion-sana/">qué hace que una relación sea vivible en el día a día</a>.</p>

<p><strong>¿Por dónde empezar antes del próximo viaje?</strong><br>
Por una conversación que no vaya de logística. Suena al revés, pero la mayoría de las tensiones de julio se preparan en marzo, cuando nadie dice nada. Preguntarle al otro qué espera del viaje evita descubrir al llegar que uno quería descansar y el otro verlo todo.</p>`,
    },
    {
      id: 'para-terminar',
      title: `Tres cosas que arreglar antes de cerrar el maletero`,
      content: `<p>No hay pareja que no discuta nunca en vacaciones, y no hay destino mágico. Lo que hay es un encadenamiento bastante previsible: una preparación desequilibrada, un trayecto donde decide una sola persona y un alojamiento donde nadie tiene un rincón propio.</p>

<p><strong>La buena noticia</strong> es que los tres se corrigen antes de salir, en una esquina de la mesa, en veinte minutos. Lo que no se corrige allí, en cambio, es el reproche que arrastras desde marzo. Ese hay que sacarlo antes de cerrar el maletero.</p>


<aside class="blog-tip-box">
<p class="blog-tip-box-title">📚 Las fuentes citadas</p>
<p>Sondeo de <a href="https://www.direct-assurance.fr/newsroom" target="_blank" rel="noopener">OpinionWay para Direct Assurance</a>, 1 016 personas de 18 años o más, 6 y 7 de mayo de 2025. Encuesta del <a href="https://www.voyageavecnous.fr/etude-ifop-charge-mentale-femmes-vacances/" target="_blank" rel="noopener">IFOP para Voyage avec Nous</a>, 1 099 personas en pareja, del 22 al 24 de junio de 2022. Estudio de <a href="https://talkerresearch.com/the-vacation-compatibility-gap/" target="_blank" rel="noopener">Talker Research para Club Wyndham</a>, 2 000 estadounidenses que viajan con sus allegados, del 5 al 11 de marzo de 2026. Investigación universitaria de <a href="https://www.sciencedirect.com/science/article/pii/S266695792400003X" target="_blank" rel="noopener">Coffey, Shahvali, Kerstetter y Aron</a>, <em>Annals of Tourism Research Empirical Insights</em>, 2024.</p>
</aside>`,
    },
  ],
};

export default article;
