// La pareja en conjunto: el perfil, los seis ámbitos, los elementos y las
// preguntas que haceros. Estos textos hablan a la pareja: {v:masc|fem}
// concuerda el «vosotros», en femenino si son dos mujeres.
export default {
  profil: {
    flamme: {
      nom: 'La Llama',
      accroche: 'Mucha ternura, y muchas chispas.',
      texte: [
        'Vuestro cielo tiene las dos cosas entre las que casi todas las parejas tienen que elegir: un entendimiento fácil y una atracción de verdad. Os entendéis sin mucho esfuerzo, y aun así seguís sorprendiéndoos. Es el perfil de las parejas que parecen enamoradas incluso después de años, esas que miras en un restaurante preguntándote cómo lo hacen.',
        'Vuestra fuerza es ese equilibrio. Cuando estalla una discusión, la ternura que os une la calma enseguida. Y cuando se instala la rutina, la atracción vuelve a sacudiros un poco.',
        'Vuestra trampa es la intensidad. Todo es fuerte entre {v:vosotros|vosotras}, la alegría y las heridas, y una frase sin importancia puede tomar proporciones enormes. Mantened la costumbre de deciros las cosas pronto, antes de que ocupen demasiado sitio.',
      ],
    },
    havre: {
      nom: 'El Refugio',
      accroche: 'Una pareja en la que se está a gusto.',
      texte: [
        'Vuestro cielo es dulce. Vuestros planetas se entienden sin empujarse, y tenéis el raro talento de haceros bien el uno al otro. En vuestra casa, el hogar es un refugio: se vuelve por la noche con alivio, se cuenta el día, se descansa.',
        'Vuestra fuerza es la paz que os dais. Sabéis tranquilizaros, apoyaros en los malos momentos y perdonaros los pequeños errores. Muchas parejas os envidian esa tranquilidad.',
        'Vuestra trampa es la rutina. Cuando todo va bien, a veces uno se olvida de cuidar las ganas. Planead cosas nuevas, un fin de semana en otro sitio o una actividad que ninguno de los dos haya probado nunca, para conservar un poco de chispa.',
      ],
    },
    aimants: {
      nom: 'Los Imanes',
      accroche: 'Entre {v:vosotros|vosotras} nada es tibio.',
      texte: [
        'Vuestro cielo está lleno de chispas. Vuestros planetas se buscan, se rozan y se atraen, y eso es lo que hace vuestra pareja tan viva. La atracción es fuerte, y nunca os aburrís.',
        'Vuestra fuerza es esa energía. Os empujáis a avanzar, os atrevéis a deciros las cosas, y vuestras reconciliaciones muchas veces valen la discusión que vino antes.',
        'Vuestra trampa son los conflictos que se encadenan. Cuando cada uno tira para su lado, la tensión acaba desgastando la pareja. Aprended a hacer una pausa antes de que la cosa suba, y guardad momentos tranquilos, sin nada en juego, solo para disfrutar el uno del otro.',
      ],
    },
    explorateurs: {
      nom: 'Los Exploradores',
      accroche: 'Vuestra pareja la inventáis {v:vosotros|vosotras}.',
      texte: [
        'Vuestro cielo no os da el trabajo hecho. Vuestros planetas no forman grandes armonías ni grandes tensiones: vuestras cartas se hablan poco, y nada os empuja en una dirección más que en otra.',
        'Parece menos romántico, pero es una suerte. Vuestra pareja no se apoya en algo evidente que viene del cielo, se apoya en lo que decidís construir. Cada uno conserva su personalidad, y aprendéis el uno del otro todo el tiempo.',
        'Vuestra trampa es alejaros sin daros cuenta, porque nada os acerca por sí solo. Cread vuestros propios rituales: una cita cada semana, una pasión compartida, un proyecto en común. Son esas costumbres las que os acercan.',
      ],
    },
  },
  domaines: {
    tendresse: {
      nom: 'Ternura',
      haut: 'Sabéis cuidaros el uno al otro. Vuestras Lunas y vuestras Venus se entienden bien: cada uno comprende lo que el otro necesita para sentirse querido, y se lo da sin pensarlo.',
      moyen: 'La ternura está ahí, con algunas diferencias que domar. No demostráis el cariño de la misma manera, y a veces uno espera un gesto en el que el otro no piensa.',
      bas: 'Es el ámbito en el que vuestras cartas se entienden menos. Vuestras formas de querer y de tranquilizar son muy distintas, y corréis el riesgo de no encontraros sin querer. Decíos lo que os sienta bien: es lo que más va a cambiar las cosas.',
    },
    desir: {
      nom: 'Deseo',
      haut: 'La atracción entre {v:vosotros|vosotras} es fuerte. Vuestras Venus y vuestros Marte se responden, y el deseo tiene todas las de seguir vivo con el tiempo.',
      moyen: 'La atracción es real, con altibajos. Vuestras ganas no siempre van al mismo ritmo, y mejor hablarlo que dejar a uno esperando.',
      bas: 'Sobre el papel, vuestros deseos no se parecen mucho. No quiere decir que falte atracción, sino que hay que cuidarla, con sorpresas, novedades y mucho diálogo sobre lo que os gusta.',
    },
    dialogue: {
      nom: 'Diálogo',
      haut: 'Os habláis con facilidad. Vuestros Mercurio se entienden, y sabéis comentar un problema sin que acabe en pelea.',
      moyen: 'El diálogo funciona, siempre que prestéis un poco de atención. No pensáis de la misma manera, y una frase puede entenderse mal a veces.',
      bas: 'Es el ámbito que más atención pide. No pensáis ni habláis de la misma manera, y los malentendidos pueden acumularse. Acostumbraos a repetir lo que ha dicho el otro antes de responder.',
    },
    complicite: {
      nom: 'Complicidad',
      haut: 'Sois cómplices de verdad. Vuestros Soles y vuestras Venus se entienden: os gustan las mismas cosas, os reís de las mismas bromas y estáis {v:orgullosos|orgullosas} el uno del otro.',
      moyen: 'La complicidad está ahí, sin ser automática. Tenéis gustos distintos, y a veces hay que dar un paso hacia la actividad favorita del otro.',
      bas: 'Vuestros gustos y vuestras ganas están bastante lejos. No es un problema en sí: cada uno puede conservar sus pasiones. Lo importante es encontrar dos o tres cosas que compartir de verdad.',
    },
    quotidien: {
      nom: 'Día a día',
      haut: 'El día a día fluye con facilidad entre {v:vosotros|vosotras}. Tenéis un ritmo parecido, y las pequeñas cosas de la vida en común, como la compra o los horarios, se arreglan sin dramas.',
      moyen: 'El día a día pide algunos ajustes. Vuestros ritmos no son los mismos, y a veces hay que negociar quién hace qué.',
      bas: 'Es en el día a día donde más se notan vuestras diferencias. Vuestros ritmos y vuestras formas de hacer no se parecen, y los pequeños roces pueden acumularse. Poneos de acuerdo en la organización antes de que se convierta en motivo de discusión.',
    },
    duree: {
      nom: 'Duración',
      haut: 'Vuestro cielo lo tiene todo para durar. Vuestros Soles y vuestras Lunas se responden, y tenéis las bases de una relación sólida, de las que atraviesan los años.',
      moyen: 'Tenéis buenas bases para durar, con algunos puntos que trabajar. Como en todas las parejas, lo que marcará la diferencia es cómo atraveséis los momentos difíciles.',
      bas: 'En este punto, vuestro cielo no os ayuda mucho: vuestras cartas tienen ritmos distintos, y lo que tranquiliza a uno no tranquiliza necesariamente al otro. Muchas parejas duran con un cielo como el vuestro, hablando y eligiéndose cada día.',
    },
  },
  elementsCouple: {
    dominant: {
      feu: 'El fuego domina vuestro cielo a dos. Sois una pareja de impulso y entusiasmo: os encanta moveros, probar cosas nuevas y reír a carcajadas. La energía nunca falta; la paciencia, un poco más.',
      terre: 'La tierra domina vuestro cielo a dos. Sois una pareja sólida, con los pies en el suelo: os gusta construir, organizaros y disfrutar de las cosas sencillas. Os sentís {v:seguros juntos|seguras juntas}.',
      air: 'El aire domina vuestro cielo a dos. Sois una pareja de ideas y conversaciones: os encanta hablar, salir y ver gente. Vuestra complicidad pasa mucho por las palabras.',
      eau: 'El agua domina vuestro cielo a dos. Sois una pareja de emociones: sentís mucho, muchas veces os entendéis sin hablar, y la ternura cuenta muchísimo para {v:vosotros|vosotras}.',
    },
    // Dos elementos empatados en cabeza (claves en orden alfabético).
    duo: {
      air_feu: 'El fuego y el aire se reparten vuestro cielo a dos. Son dos elementos que se llevan bien: tenéis impulso, ideas y ganas de moveros. Vuestra pareja avanza rápido, a veces sin tomarse tiempo para respirar.',
      feu_terre: 'El fuego y la tierra se reparten vuestro cielo a dos. Uno aporta el impulso, el otro la paciencia: sabéis soñar y construir a la vez, siempre que no tiréis cada uno para vuestro lado.',
      eau_feu: 'El fuego y el agua se reparten vuestro cielo a dos. Tenéis a la vez pasión y muchas emociones, y eso da una pareja intensa, que lo vive todo con fuerza.',
      air_terre: 'La tierra y el aire se reparten vuestro cielo a dos. Tenéis la cabeza llena de ideas, y los pies en el suelo para hacerlas realidad, siempre que escuchéis también lo que piensa el otro.',
      eau_terre: 'La tierra y el agua se reparten vuestro cielo a dos. Son dos elementos que se llevan bien: sois una pareja dulce y sólida, a la que le gusta la comodidad y las cosas que duran.',
      air_eau: 'El aire y el agua se reparten vuestro cielo a dos. Tenéis a la vez la cabeza y el corazón, muchas conversaciones y muchas emociones, lo que a veces pide traducir lo que siente el otro.',
    },
    equilibre: 'Vuestro cielo a dos está muy equilibrado: ningún elemento domina de verdad. Tenéis un poco de todo, impulso, sentido práctico, ideas y emociones, y es una fuerza real para adaptaros a lo que os traiga la vida.',
    manque: {
      feu: 'No hay fuego en vuestros planetas. Acordaos de lanzaros de vez en cuando a cosas espontáneas, como una escapada improvisada o una actividad un poco loca. Despierta a la pareja.',
      terre: 'No hay tierra en vuestros planetas. Lo práctico no es vuestro fuerte: el dinero, la organización y los proyectos a largo plazo ganan si los ponéis por escrito.',
      air: 'No hay aire en vuestros planetas. Tendéis a guardaros las cosas. Acostumbraos a hablarlas, y a salir {v:juntos|juntas} a ver gente.',
      eau: 'No hay agua en vuestros planetas. Las emociones no siempre se dicen con facilidad entre {v:vosotros|vosotras}: tomaos el tiempo de preguntaros cómo se siente el otro, de verdad.',
    },
  },
  // Dos preguntas por ámbito para lo que pide atención, y una tercera para
  // el ámbito más fuerte.
  questions: {
    tendresse: [
      '¿Qué es lo que más te hace sentir que te quiero?',
      'Cuando has tenido un mal día, ¿qué te gustaría que hiciera?',
      '¿Cuál es el gesto más tierno que he tenido contigo?',
    ],
    desir: [
      '¿Qué te hace tener ganas de mí?',
      '¿Hay algo que te gustaría que probáramos y que nunca te has atrevido a decirme?',
      '¿Qué momento de nuestra historia todavía te pone la piel de gallina?',
    ],
    dialogue: [
      '¿Hay algún tema del que no te atreves a hablarme?',
      'Cuando discutimos, ¿qué hago que te ayuda, y qué empeora las cosas?',
      '¿Qué conversación de nuestra historia recuerdas mejor?',
    ],
    complicite: [
      '¿Qué te gustaría que hiciéramos {v:juntos|juntas} más a menudo?',
      '¿Qué pasión tuya te gustaría que descubriera?',
      '¿Cuál es tu mejor recuerdo conmigo?',
    ],
    quotidien: [
      '¿Qué es lo que más te molesta de cómo nos organizamos en casa?',
      'Si pudieras cambiar una sola cosa de nuestro día a día, ¿cuál sería?',
      '¿Qué pequeña costumbre nuestra no querrías perder por nada del mundo?',
    ],
    duree: [
      '¿Dónde nos ves dentro de cinco años?',
      '¿Qué te da miedo de nuestro futuro?',
      '¿Qué te hace querer pasar tu vida conmigo?',
    ],
  },
};
