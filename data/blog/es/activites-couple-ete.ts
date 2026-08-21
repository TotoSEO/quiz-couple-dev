import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: 'actividades-en-pareja-verano',
  title: "10 actividades para hacer en pareja este verano",
  metaTitle: "Actividades en pareja en verano: 10 ideas simples y baratas",
  metaDescription: "Diez actividades en pareja en verano que rompen con las salidas de siempre: mercado sin lista, baño en el río, noche al aire libre, fotos analógicas...",
  featuredImage: '/blog/activites-couple-ete.webp',
  featuredImageAlt: "Pícnic de verano al atardecer con dos limonadas, una cesta de mimbre y una bicicleta apoyada en un árbol",
  publishedAt: '2026-07-29',
  author: AUTHORS['thomas'],
  excerpt: "¿Verano, tiempo libre y cero ideas? Aquí tienes diez actividades sencillas, baratas y probadas en pareja que rompen con las salidas de siempre y crean recuerdos de verdad.",
  introduction: `<p>En verano tenemos tiempo, luz hasta las 22h y... a menudo cero ideas. Así que repetimos la misma terraza, la misma película, el mismo paseo alrededor del mismo parque. Y sin embargo, <strong>las mejores actividades en pareja en verano casi nunca son las que cuestan caro ni las que requieren tres semanas de preparación.</strong> Son cosas sencillas, a veces hasta un poco tontas, que simplemente nunca hacemos. Aquí van diez, probadas y aprobadas en casa.</p>`,
  quickSummary: [
    "Las mejores actividades de verano en pareja rara vez son las más caras ni las más organizadas.",
    "Redescubrir tu propia ciudad (comercios, museos, monumentos) no cuesta casi nada y funciona sorprendentemente bien.",
    "Un mantel, unas patatas fritas y tres horas en la hierba valen a menudo más que una salida planeada con un mes de antelación.",
    "Las limitaciones crean el recuerdo: 27 fotos como máximo, un itinerario decidido a cara o cruz, un mercado sin lista de la compra.",
    "Prevé la logística (agua, horarios, tiempo) pero no el desarrollo: es la improvisación lo que hace memorable el día.",
  ],
  sections: [
    {
      id: 'que-faire-en-couple-en-ete',
      title: "¿Qué hacer en pareja en verano? 10 ideas",
      content: `<p><strong>Las 10 actividades que te proponemos:</strong></p>
<ol>
<li>Probar los comercios de tu ciudad en los que nunca has entrado</li>
<li>Poner un mantel en la hierba y no hacer nada más</li>
<li>Hacer de turista en tu propia ciudad: museos, monumentos, piedras viejas</li>
<li>Seguir un río en bici hasta encontrar un sitio para bañarse</li>
<li>Levantarse antes que el sol y desayunar al aire libre</li>
<li>Una cámara desechable, 27 fotos, un solo día</li>
<li>El mercado sin lista y luego cocinar lo que hayas encontrado</li>
<li>El día a cara o cruz: la moneda decide el itinerario</li>
<li>Dormir al aire libre sin irse de vacaciones</li>
<li>La noche de preguntas, fuera, cuando aún hace bueno</li>
</ol>`,
      subsections: [
        {
          id: 'commerces-jamais-testes',
          title: "1. Probar los comercios de tu ciudad en los que nunca has entrado",
          content: `<div class="blog-img-wrap"><img src="/blog/activites-couple-ete-1-commerces.webp" alt="Escaparate de una pastelería artesanal con luz dorada, tartas de fruta y dos vasos de café sobre una mesa de bistró" width="1536" height="1024" loading="lazy"></div>
<p>Tómate treinta segundos y cuenta: ¿a cuántos restaurantes distintos vas de verdad? ¿Tres? ¿Cuatro? Vivimos en una ciudad durante años, pasamos cada día por delante de la misma pastelería, el mismo café, el mismo puesto de comida callejera, y nunca entramos. Decimos "habría que probarlo" y volvemos al bar de siempre.</p>
<p>La idea es reservar una tarde entera con <strong>una única regla: solo sitios en los que nunca has estado.</strong> Un ejemplo de recorrido que funciona muy bien:</p>
<ul>
<li><strong>15h</strong>: una pastelería, esa por la que pasas todo el tiempo. Un pastel cada uno y os intercambiáis la mitad.</li>
<li><strong>15h45</strong>: un café, pero no el de al lado. Camina diez minutos para encontrar uno nuevo.</li>
<li><strong>16h30</strong>: un paseo, sin destino, por un barrio que nunca cruzas.</li>
<li><strong>18h30</strong>: comida callejera. El kebab raro, el camión de bao, la pequeña cantina tailandesa de seis mesas.</li>
</ul>
<p>El presupuesto ronda los 25 a 35 € para dos, y vuelves a casa con dos o tres direcciones que se convertirán en tus nuevas costumbres. <strong>Es, sinceramente, la actividad más rentable de esta lista.</strong></p>`,
        },
        {
          id: 'nappe-dans-l-herbe',
          title: "2. Poner un mantel en la hierba y no hacer nada más",
          content: `<div class="blog-img-wrap"><img src="/blog/activites-couple-ete-2-nappe.webp" alt="Vista cenital de un mantel de cuadros sobre la hierba soleada con un libro abierto, un altavoz, una bolsa de patatas fritas y una botella de refresco" width="1536" height="1024" loading="lazy"></div>
<p>Esta, todo el mundo ve a otros hacerla y nadie la hace. Nos cruzamos con esa gente tumbada en un parque, pensamos "ah, qué bien"... y nos volvemos a casa.</p>
<p>Así que pruébala, de verdad. Coge un mantel (o una sábana vieja, también vale) y llévate:</p>
<ul>
<li>Una bolsa de patatas fritas y unas chucherías, no vamos a fingir que nos gustan las crudités</li>
<li>Una botella de refresco bien fría, o agua con gas si eres sensato</li>
<li>Un libro cada uno</li>
<li>Un altavoz pequeño, a volumen bajo por respeto a los vecinos de césped</li>
<li>Crema solar, porque te duermes y lo lamentas</li>
</ul>
<p><strong>Sin programa, sin hora de fin.</strong> Vais a leer veinte minutos, charlar, dormitar, redescubrir que el silencio en pareja es agradable cuando no resulta incómodo. Si el ambiente se vuelve hablador, un <a href="/es/quiz-pareja-divertido/">quiz un poco tonto para jugar en voz alta</a> alarga muy bien el momento. Te garantizamos que esas dos o tres horas estarán entre las mejores de tu verano.</p>`,
        },
        {
          id: 'touriste-chez-vous',
          title: "3. Hacer de turista en tu propia ciudad: museos, monumentos, piedras viejas",
          content: `<div class="blog-img-wrap"><img src="/blog/activites-couple-ete-3-touriste.webp" alt="Vista panorámica de los tejados de teja de un casco antiguo europeo desde la plataforma de la torre de una catedral" width="1536" height="1024" loading="lazy"></div>
<p>Cuando nos vamos de vacaciones, lo hacemos todo: la catedral, el museo de historia, el mirador, la visita guiada de las 14h. ¿Y en casa? Nada. A veces vivimos a quince minutos a pie de un monumento que viene a ver el mundo entero, y nunca hemos subido.</p>
<p>Con Mathieu vivimos siete años en Estrasburgo antes de subir a lo alto de la catedral. <strong>¡Siete años!</strong> Pasábamos por delante cada semana. El día que por fin lo hicimos, tardamos veinte minutos en bajar porque no éramos capaces de irnos.</p>
<p>Algunas pistas concretas: el museo municipal (a menudo gratis o por menos de 6 €), el mirador más alto abierto al público, una visita guiada del centro histórico por la oficina de turismo, o las jornadas de puertas abiertas del patrimonio. En muchas ciudades, los museos públicos son gratuitos un domingo al mes: infórmate, lo cambia todo con un presupuesto ajustado.</p>
<p>El verdadero beneficio no es cultural, está en otra parte: <strong>vas a mirar tu propia ciudad como si acabaras de llegar.</strong> Y eso devuelve algo de asombro a una rutina que ya no tiene mucho.</p>`,
        },
        {
          id: 'riviere-a-velo',
          title: "4. Seguir un río en bici hasta encontrar un sitio para bañarse",
          content: `<div class="blog-img-wrap"><img src="/blog/activites-couple-ete-4-riviere-velo.webp" alt="Dos bicicletas apoyadas en un árbol a orillas de un río tranquilo con una pequeña playa de guijarros y agua clara" width="1536" height="1024" loading="lazy"></div>
<p>Olvida los lagos conocidos y las zonas recreativas abarrotadas donde pagas 8 € de entrada para poner tu toalla pegada a la de otro. Coge las bicis, encuentra un río o un canal, y remóntalo. Ya está.</p>
<p>Tras una hora de pedaleo tranquilo, casi siempre acabarás dando con algo: una pequeña playa de guijarros, un brazo de agua en calma, un viejo pontón de madera. Estos sitios existen en todas partes, solo que no están en ningún mapa y nadie habla de ellos. <strong>Es justo lo que los hace buenos.</strong></p>
<p>Dos precauciones, porque nos importas: <strong>estos baños no están vigilados</strong>, así que comprueba la profundidad antes de saltar y desconfía de las corrientes, aunque la superficie parezca tranquila. Y fíjate en la señalización, algunas zonas están prohibidas por buenas razones (presa río arriba, navegación, calidad del agua).</p>
<p>Llévate una toalla, agua, y deja los móviles en la mochila. No los volverás a encender.</p>`,
        },
        {
          id: 'lever-de-soleil',
          title: "5. Levantarse antes que el sol y desayunar al aire libre",
          content: `<div class="blog-img-wrap"><img src="/blog/activites-couple-ete-5-lever-soleil.webp" alt="Termo y dos tazas de esmalte sobre una manta de lana en lo alto de una colina frente al amanecer sobre el campo con niebla" width="1536" height="1024" loading="lazy"></div>
<p>Todo el mundo mira la puesta de sol. Casi nadie mira el amanecer. Y sin embargo es el mismo espectáculo, más tranquilo, con una luz que no verás de ninguna otra forma... y una ciudad completamente vacía.</p>
<p>El truco es <strong>prepararlo todo la víspera</strong>: termo de café, bollería comprada la noche anterior, manta, alarma puesta. Por la mañana no tienes nada que decidir, te levantas y sales. Apunta a un punto algo elevado: una colina, un puente, una azotea accesible, un claro al borde de un campo.</p>
<p>Sí, en verano eso significa levantarse hacia las 5h. Es el precio. Y también es lo que hace especial el momento: <strong>sois dos haciendo algo que nadie más hace a esa hora.</strong> Estaréis de vuelta a las 8h, tendréis todavía el día entero por delante, y ya tendréis una historia que contar.</p>`,
        },
        {
          id: 'appareil-photo-jetable',
          title: "6. Una cámara desechable, 27 fotos, un solo día",
          content: `<div class="blog-img-wrap"><img src="/blog/activites-couple-ete-6-appareil-jetable.webp" alt="Primer plano de una cámara desechable sostenida frente a un parque de verano desenfocado a contraluz" width="1536" height="1024" loading="lazy"></div>
<p>Una desechable cuesta entre 12 y 20 €. Veintisiete fotos, ni una más. <strong>Sin pantalla, sin retoque, sin "espera, la repetimos".</strong></p>
<p>Las reglas que aplicamos:</p>
<ul>
<li>Un día entero, una sola cámara, os la vais pasando por turnos</li>
<li>Nadie dice "posa", las fotos robadas son siempre las mejores</li>
<li>Prohibido contar cuántas quedan después de la décima</li>
<li>Las dos últimas fotos se reservan para el final del día, pase lo que pase</li>
</ul>
<p>Después viene la parte que nos encanta: <strong>los diez días de espera antes del revelado.</strong> Has olvidado la mitad de las tomas, no sabes cuáles han salido bien, y el día que recoges las copias, revives la jornada una segunda vez. De 27, habrá 8 movidas, 5 fallidas y 3 que enmarcarás.</p>
<p>Compáralo con las 400 fotos de tu carrete que no volverás a abrir jamás.</p>`,
        },
        {
          id: 'marche-sans-liste',
          title: "7. El mercado sin lista y luego cocinar lo que hayas encontrado",
          content: `<div class="blog-img-wrap"><img src="/blog/activites-couple-ete-7-marche.webp" alt="Mesa de madera cubierta de productos frescos del mercado: higos, tomates, cerezas, hierbas y un pan rústico" width="1536" height="1024" loading="lazy"></div>
<p>Dirígete al mercado un sábado por la mañana, sin idea de menú. La regla: <strong>cada uno elige tres productos, sin consultar al otro</strong>, y habrá que usarlo todo en la comida del mediodía.</p>
<p>Es un gran revelador, por cierto. Vas a descubrir que tu pareja compra cosas que tú nunca habrías cogido, y que hay que negociar para convertir eso en un plato con sentido. <strong>Las mejores comidas nacen de estas limitaciones absurdas.</strong></p>
<p>Mathieu volvió un día con higos, chorizo y un queso de cabra fresco. Pensé que estaba perdido de antemano. Lo repetimos cada semana desde entonces.</p>
<p>Calcula de 20 a 30 € para dos, y prevé comer fuera: en un balcón, en un jardín, o incluso en la mesa de camping desplegada en el patio. Variante veraniega si estáis motivados: una recogida en una granja por la mañana (fresas, cerezas, albaricoques según la temporada), y transformáis la cosecha en mermelada o en tarta por la tarde.</p>`,
        },
        {
          id: 'journee-pile-ou-face',
          title: "8. El día a cara o cruz: la moneda decide el itinerario",
          content: `<div class="blog-img-wrap"><img src="/blog/activites-couple-ete-8-pile-ou-face.webp" alt="Carretera rural desierta que se bifurca en dos direcciones entre campos de verano, una moneda apoyada en un salpicadero en primer plano" width="1536" height="1024" loading="lazy"></div>
<p>El principio es idiota y justo por eso funciona. Sales de casa, a pie o en coche, y en cada cruce lanzas una moneda. <strong>Cara, vas a la izquierda. Cruz, vas a la derecha.</strong></p>
<p>Fija dos límites antes de salir: una duración máxima (45 minutos de trayecto, por ejemplo) y una regla de repliegue si te topas con un callejón sin salida o una vía rápida. Al llegar al final, te paras donde estés. Comes en el primer sitio decente, caminas un poco, y vuelves.</p>
<p>¿Qué produce esto? Descubres pueblos, carreteras de campo y lugares que nunca habrías elegido a propósito. Y sobre todo, <strong>ya nadie carga con la responsabilidad de "encontrar una buena idea".</strong> Decide la moneda, así que nadie puede decepcionarse por la elección del otro. Ese detalle vale más de lo que parece.</p>`,
        },
        {
          id: 'dormir-dehors',
          title: "9. Dormir al aire libre sin irse de vacaciones",
          content: `<div class="blog-img-wrap"><img src="/blog/activites-couple-ete-9-dormir-dehors.webp" alt="Colchón con un edredón grueso y almohadas montado en una terraza de jardín bajo guirnaldas de luces y un cielo estrellado" width="1536" height="1024" loading="lazy"></div>
<p>Una noche al aire libre no exige irse a acampar a 300 km. Un jardín, una terraza, un balcón lo bastante ancho, un patio: es de sobra.</p>
<p>Lo que hace falta de verdad:</p>
<ul>
<li>Un colchón hinchable o dos esterillas gruesas, el suelo es más duro de lo que crees</li>
<li>Un edredón, porque hace 14 °C a las 4h de la madrugada incluso en julio</li>
<li>Una lona o una esterilla debajo, el rocío lo atraviesa todo</li>
<li>Una mosquitera o citronela, si no la noche será corta</li>
<li>Cero pantallas</li>
</ul>
<p>Vais a hablar hasta las 2 de la madrugada. Es mecánico: tumbados uno al lado del otro en la oscuridad, sin tele, sin notificaciones, la conversación se va a otra parte. <strong>Suelen ser las charlas más sinceras del año.</strong> Y si tenéis el cielo despejado, estad atentos a las Perseidas alrededor del 12 de agosto: es el pico anual de estrellas fugaces y se ve desde casi todo el hemisferio norte.</p>`,
        },
        {
          id: 'soiree-questions',
          title: "10. La noche de preguntas, fuera, cuando aún hace bueno",
          content: `<div class="blog-img-wrap"><img src="/blog/activites-couple-ete-10-soiree-questions.webp" alt="Dos sillas enfrentadas en un pequeño balcón al anochecer con dos copas, guirnaldas de luces y los tejados de la ciudad al fondo" width="1536" height="1024" loading="lazy"></div>
<p>Son las 21h30, todavía hace 24 °C, estáis en el balcón o en el jardín. <strong>Es el mejor momento del verano para hablar de cosas de las que nunca habláis.</strong></p>
<p>El formato que funciona: una bebida, dos sillas enfrentadas, y una serie de <a href="/es/preguntas-pareja/">preguntas algo más profundas que las del día a día</a>. Os turnáis, cada uno responde con sinceridad, y sobre todo <strong>nadie comenta la respuesta del otro antes de que termine.</strong> Esa última regla lo cambia todo.</p>
<p>Si el ambiente es más ligero, tirad de unos <a href="/es/quiz-preferirias-pareja/">"¿qué prefieres?" completamente absurdos</a> y dejad que la conversación derive sola. Hemos notado que en una hora casi siempre acaba virando hacia lo serio sin que nadie lo haya decidido.</p>
<p>Una hora de esto vale por tres noches delante de una serie. Y no cuesta nada.</p>`,
        },
      ],
    },
    {
      id: 'comment-choisir',
      title: "Cómo elegir la que te encaja hoy",
      content: `<p>Todo depende del tiempo que tengas por delante, del presupuesto del mes y de tu nivel de energía. Aquí tienes el resumen para decidir en treinta segundos.</p>
<div><table><thead><tr><th>Actividad</th><th>Duración</th><th>Presupuesto</th><th>Ideal si...</th></tr></thead><tbody>
<tr><td><strong>Comercios nunca probados</strong></td><td>4 a 5 h</td><td>€€</td><td>Tienes una tarde y ganas de comer</td></tr>
<tr><td><strong>Mantel en la hierba</strong></td><td>2 a 3 h</td><td>€</td><td>Estás cansado pero no quieres quedarte en casa</td></tr>
<tr><td><strong>Turista en tu ciudad</strong></td><td>3 a 4 h</td><td>€</td><td>Llueve o hace demasiado calor para estar fuera</td></tr>
<tr><td><strong>Río en bici</strong></td><td>Todo el día</td><td>Gratis</td><td>Hace más de 28 °C y estás en forma</td></tr>
<tr><td><strong>Amanecer</strong></td><td>3 h</td><td>€</td><td>Quieres un recuerdo marcante sin dedicarle todo el día</td></tr>
<tr><td><strong>Cámara desechable</strong></td><td>Todo el día</td><td>€€</td><td>Ya tienes un plan y quieres documentarlo</td></tr>
<tr><td><strong>Mercado sin lista</strong></td><td>Una mañana</td><td>€€</td><td>Os gusta cocinar en pareja</td></tr>
<tr><td><strong>Día a cara o cruz</strong></td><td>Todo el día</td><td>€€</td><td>Ninguno de los dos consigue decidir</td></tr>
<tr><td><strong>Noche al aire libre</strong></td><td>Una noche</td><td>Gratis</td><td>Tienes jardín, terraza o un balcón grande</td></tr>
<tr><td><strong>Noche de preguntas</strong></td><td>1 a 2 h</td><td>Gratis</td><td>Tenéis la sensación de que ya no os habláis</td></tr>
</tbody></table></div>
<p>Un pequeño consejo de método: <strong>no elijas la actividad más impresionante, elige la que corresponde a tu energía real del día.</strong> Un mantel logrado en un parque vale infinitamente más que una excursión abandonada a los veinte minutos porque nadie tenía ganas de verdad. Y si buscas algo concreto, la página que recopila <a href="/es/actividades-en-pareja-cerca/">lo que existe cerca de ti</a> te dará puntos de partida según tu zona.</p>`,
    },
    {
      id: 'les-4-erreurs',
      title: "Los 4 errores que convierten una buena idea en un día echado a perder",
      content: `<p><strong>Planificar de más.</strong> Un desarrollo cronometrado a la media hora es la garantía de que el mínimo retraso se convierta en fuente de tensión. Prevé la logística (agua, horarios de apertura, tiempo), nunca el desarrollo.</p>
<p><strong>Salir a las peores horas.</strong> Entre las 12h y las 16h en julio, todo es más pesado: el calor, las colas, el cansancio. Desplaza tus salidas a primera hora de la mañana o al final de la tarde, la diferencia en el ambiente general es enorme.</p>
<p><strong>Tener el móvil en la mano.</strong> No hace falta dejarlo en casa. Ponlo en modo avión y sácalo solo para las fotos. Una pareja que hace scroll uno al lado del otro sobre una manta no es una actividad, son dos soledades.</p>
<p><strong>Esperar "el momento adecuado".</strong> Es el error más común y más caro. Lo dejamos para el finde siguiente, luego para el otro, y a finales de agosto no hemos hecho nada. El momento adecuado es el próximo sábado.</p>
<p>Una señal que no conviene ignorar, además: si vuestras salidas acaban siempre en pura logística ("¿cuándo salimos?", "¿has cogido las llaves?") y nunca en otra cosa, no es un problema de actividad. Suele ser el síntoma de un intercambio que se ha empobrecido sin que nadie se haya dado cuenta, y eso se trabaja aparte.</p>`,
    },
    {
      id: 'un-des-deux-n-a-envie-de-rien',
      title: "¿Y si a uno de los dos no le apetece nada?",
      content: `<p>Pasa, y no es forzosamente grave. Pero vale la pena entender por qué antes de forzar.</p>
<p>En la mayoría de los casos, el "no me apetece" no va sobre la actividad en sí. Va sobre el esfuerzo de salir, de prepararse, de gestionar. Cuando alguien está reventado por su trabajo, una propuesta de cinco etapas parece una carga más, no un descanso. <strong>La reacción adecuada no es insistir, es bajar el nivel de exigencia:</strong> el mantel en el parque y la noche de preguntas piden quince minutos de preparación, no más.</p>
<p>Segunda pista, menos agradable pero real: a veces sencillamente no queréis las mismas cosas. Uno quiere movimiento, el otro quiere calma, y cada salida se convierte en una negociación disfrazada. No hay nada anormal en ello, siempre que se nombre. <strong>Alternar con franqueza</strong> (hoy es tu idea, la próxima vez la mía, y el otro no protesta) resuelve el 80 % del problema.</p>
<p>Y si tienes la impresión de proponer cosas siempre fuera de lugar, comprueba <a href="/es/quiz-quien-conoce-mejor-pareja/">hasta qué punto conoces de verdad sus gustos</a>. Los resultados a veces escuecen... y son muy instructivos.</p>
<p>Nos costó tiempo aceptarlo, con Mathieu: <strong>una buena actividad de pareja no es la que queda más bonita en foto. Es aquella en la que los dos estamos contentos de estar ahí.</strong></p>
<p>Coge una de la lista. Solo una. Hazla este fin de semana, sin esperar la ventana perfecta que no llegará. Y si te gusta, probablemente se convertirá en vuestra cosa.</p>`,
    },
  ],
};

export default article;
