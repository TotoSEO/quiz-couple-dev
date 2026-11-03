import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "dinero-y-pareja",
  title: "Dinero y pareja: cómo gestionar el dinero a dos sin que acabe en discusión",
  metaTitle: "Dinero y pareja: gestionar el dinero a dos sin discutir",
  metaDescription: "Dinero y pareja: por qué es el tema que más discusiones provoca, las tres formas de gestionar el dinero a dos, el reparto de gastos y lo que rompe la confianza.",
  featuredImage: "/blog/argent-et-couple.webp",
  featuredImageAlt: "Los dos personajes de Quiz Couple sentados a una mesa delante de una hucha, unas monedas y una hoja de cálculo",
  publishedAt: "2027-02-14T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "El dinero es el tema de discusión que más pesa en una pareja, y del que menos se habla. Las tres formas de gestionar el dinero a dos, cómo repartir los gastos, hablarlo, hacer un presupuesto, y lo que rompe la confianza.",
  introduction: `<p>El dinero en la pareja no es una cuestión de cantidad. Hay parejas que ganan poco y se entienden muy bien con él, y parejas desahogadas que se destrozan por él. <strong>Es una cuestión de reglas: quién paga qué, qué es de los dos, qué se queda cada uno, y cómo se habla de ello.</strong> Mientras esas reglas no se digan, cada uno sigue las suyas, y ahí es donde se atasca.</p>
<p>Esta guía explica por qué el dinero provoca más discusiones que cualquier otra cosa, describe las tres formas de gestionar el dinero a dos, y remite a ocho artículos: la cuenta conjunta, el reparto de gastos, cómo hablarlo, la diferencia de sueldo, la pareja que gasta demasiado, las discusiones, el presupuesto y la infidelidad financiera.</p>`,
  quickSummary: [
    "Los desacuerdos por dinero son el mejor predictor de divorcio entre todos los temas de discusión, por delante de las tareas, la familia política y el sexo, en un estudio con más de 4.500 parejas seguidas durante cinco años.",
    "Hay tres formas de gestionar el dinero a dos: todo en común, una cuenta conjunta para la pareja y el resto para cada uno, o cada uno su dinero. Ninguna es la buena, pero solo una se elige entre los dos.",
    "Lo que provoca la discusión casi nunca es la cantidad: es lo que significa, el poder, la seguridad, el respeto por lo que aporta cada uno.",
    "La regla que evita más discusiones: una cantidad a partir de la cual se avisa al otro antes de comprar, y un dinero de bolsillo que nadie controla.",
    "Si el dinero se ha convertido en una discusión semanal, ya no es cuestión de método: hay otra cosa que se dirime en ese terreno.",
  ],
  sections: [
    {
      id: "la-guia",
      title: "La guía, artículo por artículo",
      content: `<p>Esta página recorre todo el tema. Cada cuestión tiene además su artículo, más detallado, si quieres ir directamente a lo que os toca:</p>
<ol class="blog-liste-reperes">
<li><a href="/es/blog/cuenta-conjunta-o-cuentas-separadas/">Cuenta conjunta o cuentas separadas: qué elegir</a></li>
<li><a href="/es/blog/como-repartir-los-gastos-en-pareja/">Cómo repartir los gastos en pareja: a medias o en proporción</a></li>
<li><a href="/es/blog/hablar-de-dinero-en-pareja/">Hablar de dinero en pareja sin que acabe mal</a></li>
<li><a href="/es/blog/mi-pareja-gana-mas-que-yo/">Mi pareja gana más que yo: vivir con la diferencia de sueldo</a></li>
<li><a href="/es/blog/mi-pareja-gasta-demasiado/">Mi pareja gasta demasiado, o demasiado poco</a></li>
<li><a href="/es/blog/discusiones-por-dinero-en-pareja/">Las discusiones por dinero en pareja</a></li>
<li><a href="/es/blog/presupuesto-en-pareja/">Hacer un presupuesto a dos</a></li>
<li><a href="/es/blog/infidelidad-financiera/">La infidelidad financiera: ocultar dinero a tu pareja</a></li>
</ol>`,
    },
    {
      id: "por-que-el-dinero-enfada-mas",
      title: "Por qué el dinero provoca más discusiones que el resto",
      content: `<p>Se discute por las tareas, por la familia política, por el tiempo que se pasa juntos. Pero las discusiones por dinero no son discusiones como las demás, y no es una impresión.</p>
<p>En 2012, tres investigadores estadounidenses retomaron los datos de más de 4.500 parejas entrevistadas dos veces con cinco años de diferencia. Miraron qué temas de desacuerdo, en la primera entrevista, anunciaban un divorcio en la segunda. <strong>Los desacuerdos por dinero iban en cabeza, por delante de las tareas, la familia política, el tiempo juntos y el sexo</strong>, tanto en hombres como en mujeres, fuera cual fuera el nivel de ingresos. Otro estudio, que hizo llevar un diario durante quince días a un centenar de parejas, encontró que las discusiones por dinero duraban más, volvían más a menudo y se resolvían menos que las otras.</p>
<p>La razón es que el dinero nunca habla solo de dinero. Una compra no prevista es « no me respetas ». Una cuenta separada es « no confías en mí ». Un sueldo más bajo es « yo cuento menos ». Detrás de cada cifra están la seguridad, el poder, la libertad y lo que se vio hacer en casa de los padres. Por eso una discusión por dinero no se arregla con una calculadora, y de eso trata el artículo sobre <a href="/es/blog/discusiones-por-dinero-en-pareja/">las discusiones por dinero en pareja</a>.</p>
<div class="blog-chiffres">
<p class="blog-chiffres-titre">El dinero en la pareja, en cifras</p>
<ul class="blog-chiffres-grille">
<li><span class="blog-chiffres-nombre">n.º 1</span>los desacuerdos por dinero, primer predictor de divorcio entre los temas de discusión, en 4.500 parejas</li>
<li><span class="blog-chiffres-nombre">4 de cada 10</span>personas con las finanzas en común han ocultado alguna vez una compra, una deuda o una cuenta, en una encuesta estadounidense</li>
<li><span class="blog-chiffres-nombre">230 parejas</span>sorteadas entre cuenta conjunta y cuentas separadas: dos años después, las de la cuenta conjunta estaban más satisfechas</li>
<li><span class="blog-chiffres-nombre">15 días</span>de diario en un centenar de parejas: las discusiones por dinero fueron las más largas y las menos resueltas</li>
</ul>
</div>`,
    },
    {
      id: "las-tres-formas",
      title: "Las tres formas de gestionar el dinero a dos",
      content: `<p>No hay treinta y seis. Todas las parejas del mundo están en una de estas tres casillas, o entre dos:</p>
<ul>
<li><strong>Todo en común:</strong> los dos sueldos caen en la misma cuenta, y todo sale de ahí, el alquiler igual que el café. Es la opción de la mayoría de las parejas casadas y de las que tienen hijos. Sencilla, solidaria, pero cada gasto es visible para el otro, y el que gana menos puede acabar sintiéndose vigilado.</li>
<li><strong>Una cuenta conjunta para la pareja, el resto para cada uno:</strong> cada uno ingresa una parte en una cuenta que paga el alquiler, la compra, los hijos, y conserva su cuenta para sus gastos propios. Es la fórmula que más crece, sobre todo entre los menores de cuarenta, porque mantiene una parte de independencia sin hacer cuentas al céntimo.</li>
<li><strong>Cada uno su dinero:</strong> sin cuenta conjunta, se reparten las facturas pagándolas por turnos o devolviéndose el dinero. Frecuente al principio, cuando no se vive juntos, y entre quienes ya han pasado por una separación. Funciona mientras los ingresos sean parecidos y no haya hijos.</li>
</ul>
<p>¿Cuál es la buena? La que hayáis elegido entre los dos. Un experimento con 230 parejas recién casadas o prometidas sorteó quién abría una cuenta conjunta y quién mantenía cuentas separadas: al cabo de dos años, <strong>las que lo habían puesto todo en común se decían más satisfechas con su relación</strong>, y las demás habían visto bajar su satisfacción, como suele pasar en los primeros años. Pero el efecto venía menos de la cuenta que de lo que obliga a hacer: hablar de los gastos, decidir juntos. Todo eso está detallado, ventajas y trampas incluidas, en el artículo <a href="/es/blog/cuenta-conjunta-o-cuentas-separadas/">cuenta conjunta o cuentas separadas</a>.</p>`,
    },
    {
      id: "quien-paga-que",
      title: "Quién paga qué: a medias o en proporción",
      content: `<p>En cuanto no se pone todo en común, hay que decidir cómo se reparte. Y el reflejo es a medias. Es justo cuando los dos ganan lo mismo, y deja de serlo del todo cuando uno gana 1.600 € y el otro 2.400 €: a final de mes, el primero no tiene nada para él y el segundo se va de fin de semana.</p>
<p>La solución más extendida entre las parejas que se lo han pensado es <strong>el reparto en proporción a los ingresos</strong>: si ganas el 40 % de los ingresos de la pareja, pagas el 40 % de los gastos comunes. Cada uno se queda con la misma proporción de su sueldo. El artículo sobre <a href="/es/blog/como-repartir-los-gastos-en-pareja/">cómo repartir los gastos en pareja</a> hace el cálculo paso a paso, con lo que entra en el bote común y lo que se queda fuera.</p>
<p>Y cuando uno gana mucho más que el otro, no es solo cuestión de cálculo: también es cuestión de lugar, porque el que paga más enseguida acaba decidiendo más. <a href="/es/blog/mi-pareja-gana-mas-que-yo/">Mi pareja gana más que yo</a> habla de lo que eso cambia, en un sentido y en el otro.</p>`,
      tip: "La regla que más discusiones evita en una pareja, según los terapeutas de pareja y según la gente misma: una cantidad a partir de la cual se avisa al otro antes de comprar (100 €, 300 €, vosotros decidís), y por debajo, cada uno hace lo que quiere sin justificarse.",
    },
    {
      id: "hablarlo",
      title: "Hablarlo antes de que explote",
      content: `<p>El problema no es que las parejas discutan por dinero. Es que solo hablan de él cuando discuten. Entre dos discusiones, silencio: no se sabe cuánto gana el otro al euro, no se sabe cuánto tiene ahorrado, no se sabe qué le preocupa.</p>
<p>La mayoría de las parejas a las que les va bien tienen una costumbre muy tonta: <strong>un momento para hablar de dinero, en frío, una vez al mes</strong>. No cuando llega el extracto, no la noche de una compra grande. Un domingo, con un café, las cifras sobre la mesa. Lo que se dice en ese momento, cómo abordar un tema que incomoda, y las preguntas que hay que hacerse antes de irse a vivir juntos, tener un hijo o comprar, es el artículo sobre <a href="/es/blog/hablar-de-dinero-en-pareja/">cómo hablar de dinero en pareja</a>. Si no sabéis por dónde empezar, las <a href="/es/preguntas-pareja/">preguntas para hacerse en pareja</a> tienen una serie sobre el dinero y el futuro.</p>
<p>Y si uno de los dos gasta sin mirar mientras el otro ahorra cada euro, la conversación es aún más necesaria, y más delicada. Un estudio con más de mil personas casadas mostró que los ahorradores tienden a casarse con gastadores, y que cuanto mayor es la diferencia entre los dos, más discute la pareja por dinero. <a href="/es/blog/mi-pareja-gasta-demasiado/">Mi pareja gasta demasiado, o demasiado poco</a> explica cómo conviven esas dos relaciones con el dinero.</p>`,
    },
    {
      id: "el-presupuesto",
      title: "El presupuesto, la herramienta que lo calma todo",
      content: `<p>Uno se imagina el presupuesto como una limitación. Es lo contrario: <strong>una pareja que sabe adónde va su dinero discute menos, porque ya no tiene que adivinar</strong>. Ya no se pregunta si puede irse de vacaciones, mira la línea de vacaciones. Ya no se reprocha una compra, mira lo que queda en la línea de ocio.</p>
<p>Hacer un presupuesto a dos lleva una hora la primera vez y veinte minutos al mes después: los ingresos, los gastos fijos, los que varían, el ahorro, y un dinero de bolsillo para cada uno que nadie controla. El método, con un ejemplo con cifras para una pareja con 3.000 € al mes, está en el artículo sobre <a href="/es/blog/presupuesto-en-pareja/">el presupuesto en pareja</a>.</p>`,
    },
    {
      id: "lo-que-rompe-la-confianza",
      title: "Lo que rompe la confianza",
      content: `<p>Hay una cosa que ni siquiera las parejas que gestionan bien su dinero han previsto: la mentira. Una compra escondida, una deuda que no se ha dicho, una cuenta cuya existencia el otro ignora, dinero prestado a la familia sin decir nada. En una encuesta estadounidense, <strong>cuatro de cada diez personas con las finanzas en común reconocían haber escondido alguna</strong>. Se llama infidelidad financiera, y a la persona que lo descubre le hace el mismo efecto que un engaño: no es la cantidad lo que duele, es la mentira.</p>
<p>Qué cuenta como jardín secreto (una cuenta propia que el otro sabe que existe) y qué cuenta como mentira, cómo se reacciona cuando se descubre, y cómo se confiesa cuando eres tú, es el artículo sobre <a href="/es/blog/infidelidad-financiera/">la infidelidad financiera</a>.</p>`,
    },
    {
      id: "lo-que-dice-la-ley",
      title: "Lo que dice la ley, en un minuto",
      content: `<p>Muchas parejas creen que vivir juntos basta para compartir. No. En España, todo depende de la situación:</p>
<ul>
<li><strong>Casados sin capitulaciones:</strong> en la mayor parte del país, el régimen es el de gananciales: lo que gana cada uno durante el matrimonio es de los dos, y lo que se tenía antes o se hereda sigue siendo propio. En Cataluña y Baleares, el régimen por defecto es la separación de bienes.</li>
<li><strong>Pareja de hecho:</strong> nada automático sobre el dinero. Cada uno es dueño de lo que ha pagado y de lo que está a su nombre, salvo lo que firméis en un pacto.</li>
<li><strong>Sin papeles:</strong> lo mismo. Un piso comprado juntos es de cada uno en la proporción escrita en la escritura, no en la proporción de lo que haya pagado cada uno en realidad.</li>
</ul>
<p>Dos detalles que cuentan: una cuenta conjunta indistinta permite a cualquiera de los dos sacar todo el dinero, y un descubierto compromete a los dos titulares. Conviene conocer estas reglas antes de firmar un alquiler a dos, y el <a href="/es/test-vivir-juntos-pareja/">test para saber si estáis preparados para iros a vivir juntos</a> plantea justamente la pregunta del dinero.</p>`,
    },
    {
      id: "por-donde-empezar",
      title: "Por dónde empezar",
      content: `<p>Si nunca habéis hablado de dinero, no empecéis por una hoja de cálculo. Empezad por una sola pregunta, cada uno por su lado, y luego comparad: <strong>« Para ti, idealmente, el dinero en la pareja es todo en común, una cuenta para la pareja y el resto para cada uno, o cada uno su dinero? »</strong> La mayoría de las parejas descubren que no tienen la misma respuesta, y que nunca se lo habían preguntado.</p>
<p>Es una de las cien preguntas de la <a href="/es/evaluacion-de-pareja/" data-bilan-src="article-argent">evaluación de pareja, cada uno en su móvil</a>: todo un ámbito está dedicado al dinero, el reparto de gastos, el ahorro, las compras sin avisar, la ayuda a la familia, y el informe muestra pregunta por pregunta dónde estáis de acuerdo y dónde no, sin que nadie haya tenido que sacar el tema. Muchas parejas encuentran ahí la conversación sobre dinero que llevaban años aplazando.</p>
<p>Y si el tema ya se ha convertido en una discusión que vuelve cada semana, ya no es cuestión de método. El artículo sobre <a href="/es/blog/terapia-de-pareja/">la terapia de pareja</a> explica cómo ayuda un tercero a salir de ahí, y el dinero es uno de los primeros motivos por los que las parejas llaman a la puerta.</p>`,
    },
  ],
};

export default article;
