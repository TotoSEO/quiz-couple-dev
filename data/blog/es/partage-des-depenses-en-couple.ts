import type { BlogArticleData } from '@/types/blog';
import { AUTHORS } from '@/data/blog/authors';

const article: BlogArticleData = {
  slug: "como-repartir-los-gastos-en-pareja",
  title: "Cómo repartir los gastos en pareja: ¿a medias, en proporción o sin contar?",
  metaTitle: "Repartir los gastos en pareja: ¿a medias o en proporción?",
  metaDescription: "Cómo repartir los gastos en pareja: a medias, en proporción a los ingresos o sin contar, quién paga qué, el cálculo paso a paso, y los gastos que se olvidan.",
  featuredImage: "/blog/partage-des-depenses-en-couple.webp",
  featuredImageAlt: "Los dos personajes de Quiz Couple a cada lado de una balanza, monedas en cada platillo, la balanza inclinada",
  publishedAt: "2027-02-17T08:30:00+01:00",
  author: AUTHORS['thomas'],
  excerpt: "A medias parece justo, y solo lo es si ganáis lo mismo. Las tres formas de repartir los gastos en pareja, el cálculo en proporción con un ejemplo, quién paga qué, y los gastos que siempre se olvidan.",
  introduction: `<p>El reparto de los gastos en pareja se resuelve casi siempre igual al principio: a medias, porque es sencillo y parece justo. <strong>Lo es mientras ganéis más o menos lo mismo. En cuanto uno gana claramente más, a medias se convierte en el más injusto de los tres métodos.</strong></p>
<p>Aquí tienes los tres métodos con un ejemplo con cifras, lo que entra en los gastos comunes y lo que se queda fuera, el cálculo en proporción paso a paso, y los gastos que se olvidan en el reparto.</p>`,
  quickSummary: [
    "Tres métodos: a medias, en proporción a los ingresos, o sin contar con todo en común. El primero es justo con ingresos iguales, el segundo en cuanto difieren.",
    "En proporción, cada uno paga los gastos comunes según lo que gana: con 1.600 y 2.400 € de ingresos, es el 40 % y el 60 %.",
    "Los gastos comunes son lo que sirve a los dos: alquiler, suministros, compra, hijos, vacaciones a dos. El móvil, la ropa y las salidas con los amigos propios se quedan en cada uno.",
    "Una app para repartir gastos resuelve los restaurantes y los fines de semana; para el alquiler y la compra, una cuenta conjunta alimentada en proporción es más sencilla.",
    "El reparto no se queda en los euros: el tiempo que se pasa gestionando, cocinando, cuidando de los niños también cuenta, y a menudo es lo que desequilibra.",
  ],
  sections: [
    {
      id: "los-tres-metodos",
      title: "Los tres métodos, con el mismo ejemplo",
      content: `<p>Tomemos una pareja que gana 4.000 € al mes entre los dos: 1.600 € uno, 2.400 € el otro, y 2.000 € de gastos comunes (alquiler, suministros, compra, seguros, suscripciones). Esto es lo que da cada método:</p>
<ul>
<li><strong>A medias:</strong> 1.000 € cada uno. El que gana 1.600 € se queda con 600 € para todo lo demás; el que gana 2.400 € se queda con 1.400. El primero cuenta cada salida, el segundo se va de fin de semana. Es el método que más discusiones por dinero fabrica, y nadie entiende por qué, puesto que « es equitativo ».</li>
<li><strong>En proporción a los ingresos:</strong> el primero gana el 40 % de los ingresos de la pareja, paga el 40 % de los gastos comunes, o sea 800 €; el segundo paga el 60 %, o sea 1.200 €. Le quedan 800 € al primero y 1.200 € al segundo: cada uno conserva la misma parte de su sueldo, la mitad. Es el método que se recomienda en cuanto los ingresos difieren.</li>
<li><strong>Sin contar, todo en común:</strong> los 4.000 € caen en una sola cuenta, que lo paga todo, y quedan 2.000 € para el resto, a dos. Nadie calcula. Es el método de la mayoría de las parejas casadas, y supone haber resuelto antes la cuestión de la <a href="/es/blog/cuenta-conjunta-o-cuentas-separadas/">cuenta conjunta o cuentas separadas</a>.</li>
</ul>
<p>Existe una cuarta vía, a medio camino: el que gana más paga más, sin calcular al porcentaje. El alquiler para uno, la compra para el otro, y se ajusta cuando se inclina demasiado. Funciona en las parejas que se fían una de otra y a las que no les gustan las hojas de cálculo.</p>`,
    },
    {
      id: "quien-paga-que",
      title: "Quién paga qué: lo que es común, y lo que no",
      content: `<p>La verdadera dificultad no es el porcentaje, es la lista. Lo que entra en los gastos comunes, y lo que se queda en cada uno. Esto es lo que hacen la mayoría de las parejas:</p>
<ul>
<li><strong>Común:</strong> el alquiler o la hipoteca, la comunidad, la luz, internet, la compra, el seguro de la casa, los hijos (guardería, colegio, ropa, actividades), las vacaciones a dos, los restaurantes a dos, los regalos que se hacen juntos, el coche si lo usan los dos.</li>
<li><strong>De cada uno:</strong> el móvil, la ropa, el deporte, las salidas con los amigos propios, los regalos a la propia familia, las deudas de antes de la pareja, las aficiones que el otro no comparte.</li>
<li><strong>A discutir:</strong> el coche que usa sobre todo uno, los gastos de salud, la ayuda a los padres, el perro que quiso uno, las suscripciones que solo usa uno.</li>
</ul>
<p>La tercera lista es la que cuenta. Cada pareja la zanja a su manera, y la única mala decisión es no hablarlo. Si no sabéis cómo sacar el tema, el artículo sobre <a href="/es/blog/hablar-de-dinero-en-pareja/">cómo hablar de dinero en pareja</a> da las preguntas en orden.</p>`,
    },
    {
      id: "el-calculo-en-proporcion",
      title: "El cálculo en proporción, paso a paso",
      content: `<p>Lleva cinco minutos, una vez al año o cuando cambia un sueldo:</p>
<ol>
<li><strong>Sumad vuestros dos ingresos netos</strong> mensuales, pagas extra prorrateadas. Ejemplo: 1.600 + 2.400 = 4.000 €.</li>
<li><strong>Calculad la parte de cada uno:</strong> 1.600 / 4.000 = 40 %; 2.400 / 4.000 = 60 %.</li>
<li><strong>Haced la lista de los gastos comunes</strong> de un mes normal, y añadid una doceava parte de los gastos anuales (IRPF, IBI, seguro del coche, vacaciones). Ejemplo: 2.000 €.</li>
<li><strong>Aplicad la parte:</strong> 40 % de 2.000 = 800 €; 60 % de 2.000 = 1.200 €.</li>
<li><strong>Poned una transferencia automática</strong> de cada uno a la cuenta conjunta, el día después de la nómina. Y no se piensa más.</li>
</ol>
<p>Un caso frecuente: los gastos comunes son más altos de lo que el que gana menos puede seguir, incluso en proporción, porque la vivienda se eligió con el sueldo del más desahogado. En ese caso, o se bajan los gastos, o el que gana más asume una parte por encima de su porcentaje, y se dice claramente, para que no sea un favor silencioso que se paga más tarde. El artículo <a href="/es/blog/mi-pareja-gana-mas-que-yo/">mi pareja gana más que yo</a> habla de lo que se juega en ese momento.</p>`,
      tip: "Revisad la proporción con cada cambio: una subida, una reducción de jornada, el paro, una baja por paternidad o maternidad. Un reparto calculado hace tres años sobre sueldos que han cambiado es la fuente más discreta de rencor en una pareja.",
    },
    {
      id: "las-herramientas",
      title: "Las herramientas: app, cuenta conjunta o cuaderno",
      content: `<p>Para los gastos del día a día en pareja (un restaurante, la compra del fin de semana, un billete de tren), <strong>una app para repartir gastos</strong> hace muy bien el trabajo: cada uno anota lo que ha pagado, la app dice quién debe cuánto a quién a final de mes, y se salda con una transferencia. Se puede fijar un porcentaje para que el reparto se haga en proporción solo. Es la herramienta de las parejas que mantienen cuentas separadas.</p>
<p>Para el alquiler, los suministros y todo lo que cae cada mes, la app se vuelve pesada enseguida. Una <strong>cuenta conjunta alimentada por dos transferencias automáticas</strong>, calculadas en proporción, es más sencilla: todo sale de ahí, y nadie le debe nada a nadie.</p>
<p>Y algunas parejas hacen todo esto en un cuaderno o una hoja de cálculo compartida, una vez al mes. La herramienta cuenta menos que la costumbre de mirar juntos. Es uno de los puntos del artículo sobre <a href="/es/blog/presupuesto-en-pareja/">el presupuesto en pareja</a>.</p>`,
    },
    {
      id: "lo-que-se-olvida",
      title: "Lo que se olvida en el reparto",
      content: `<p>El reparto de gastos se hace en euros, y ahí es donde hace trampa. Porque una pareja no comparte solo facturas: comparte tiempo. Hacer la compra, cocinar, gestionar los papeles, pedir las citas, quedarse en casa con un niño enfermo. <strong>Si uno paga el 60 % de los gastos y el otro hace el 80 % del resto, el reparto no es 60/40.</strong></p>
<p>Ahí es donde se esconde a menudo la sensación de injusticia que una hoja de cálculo no muestra, y es lo que hay detrás de muchas discusiones que parecen hablar de dinero. Cuando hagáis las cuentas, poned también sobre la mesa quién hace qué, y cuánto tiempo lleva. La guía sobre <a href="/es/blog/dinero-y-pareja/">el dinero en la pareja</a> vuelve sobre ello, y la <a href="/es/evaluacion-de-pareja/" data-bilan-src="article-argent">evaluación de pareja, cada uno en su móvil</a>, hace las dos preguntas una al lado de la otra: cómo se reparten los gastos, según vosotros, y quién gestiona más el dinero, las facturas y los papeles. Las dos respuestas, puestas juntas, dicen mucho.</p>
<a href="/es/blog/dinero-y-pareja/" class="blog-read-also"><span class="blog-read-also-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span><span class="blog-read-also-content"><span class="blog-read-also-label">Lee también</span><span class="blog-read-also-title">Dinero y pareja: cómo gestionar el dinero a dos sin que acabe en discusión</span></span><svg class="blog-read-also-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></a>`,
    },
  ],
};

export default article;
