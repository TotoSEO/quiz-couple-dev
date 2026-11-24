// Los doce meses que vienen. {{venus}}, {{mars}} y {{jupiter}} reciben el
// signo por el que pasa el planeta ese mes («en Tauro»). Los textos de un
// mismo tono se turnan de un mes a otro.
export default {
  mois: {
    titres: {
      tendre: 'Un mes tierno',
      passion: 'Un mes de fuego',
      elan: 'Un mes con buen viento',
      malentendus: 'Cuidado con los malentendidos',
      turbulences: 'Un mes movido',
      calme: 'Un mes tranquilo',
    },
    tendre: [
      'Venus está {{venus}} y suaviza vuestro cielo. Es el mes ideal para las palabras bonitas, las noches en casa y los pequeños detalles que se olvidan el resto del año.',
      'Con Venus {{venus}}, la ternura está presente. Aprovechad para daros caprichos, hacer un pequeño regalo sin motivo o recuperar una costumbre que habíais perdido.',
      'Venus {{venus}} os acerca. Las tensiones se calman con más facilidad, y es un buen momento para hacer las paces si algo se había quedado pendiente.',
      'Un mes dulce, con Venus {{venus}}. Tomaos tiempo para estar {v:juntos|juntas}, sin móvil, solo por el gusto de estarlo.',
    ],
    passion: [
      'Marte está {{mars}} y enciende vuestro cielo. El deseo sube, y la energía también: es un mes para las sorpresas y los antojos repentinos.',
      'Con Marte {{mars}}, la atracción es fuerte. Aprovechad esa energía para salir de la rutina, y cuidado con las discusiones, que también pueden encenderse rápido.',
      'Marte {{mars}} despierta vuestras ganas. Un fin de semana improvisado o una noche fuera de lo normal: a este mes le gusta la audacia.',
      'Un mes de fuego, con Marte {{mars}}. El deseo está ahí; la paciencia, un poco menos. Contad hasta diez antes de responder en caliente.',
    ],
    elan: [
      'Júpiter, el planeta de la suerte, está {{jupiter}} y sonríe a vuestras cartas. Es un buen mes para lanzar un proyecto a dos, un viaje o una decisión que ibais retrasando.',
      'Con Júpiter {{jupiter}}, el optimismo está de vuestro lado. Las buenas noticias llegan con más facilidad, y os apetece pensar a lo grande.',
      'Júpiter {{jupiter}} os da impulso. Hablad de vuestros sueños de futuro y haced planes: a este mes le gustan los proyectos.',
    ],
    malentendus: [
      'Mercurio retrocede buena parte del mes: en astrología, es el momento de los malentendidos y de los mensajes mal entendidos. Releed antes de enviar, y no toméis grandes decisiones a lo loco.',
      'Mercurio retrógrado enreda un poco la comunicación. Es un mes para volver sobre viejas conversaciones más que para abrir otras nuevas, y para concederos el beneficio de la duda.',
      'Con Mercurio retrocediendo, las palabras pueden ir más allá de lo que se piensa este mes. Si una frase os hace daño, preguntad qué quería decir el otro antes de reaccionar.',
    ],
    turbulences: [
      'El cielo está un poco revuelto para {v:vosotros|vosotras} este mes: el cansancio y los pequeños roces pueden ocupar sitio. No dejéis que nada se acumule, y guardad momentos tranquilos para estar {v:juntos|juntas}.',
      'Un mes en el que vuestros humores pueden chocar. No es el momento de las grandes conversaciones: mejor la dulzura, y dejad para más adelante los temas delicados.',
      'Los planetas os sacuden un poco. Nada grave, pero un poco de paciencia por ambas partes os ahorrará muchas discusiones inútiles.',
    ],
    calme: [
      'Un mes tranquilo, sin grandes movimientos en vuestro cielo. Aprovechad para respirar, y para regalaros un momento sencillo, solo por el gusto.',
      'Nada especial en el cielo este mes: vuestra pareja avanza a su ritmo. Muchas veces es en estos meses cuando más se construye, sin darse cuenta.',
      'Un mes en calma, ideal para las pequeñas costumbres que sientan bien, como una cena sin pantallas o un paseo el domingo.',
      'El cielo os deja {v:tranquilos|tranquilas} este mes. Ninguna gran ola en el horizonte: es el momento de cuidar vuestro día a día.',
    ],
    notes: {
      mercure: 'Mercurio retrógrado del {{du}} al {{au}}',
      venus: 'Venus retrógrada del {{du}} al {{au}}',
      mars: 'Marte retrógrado del {{du}} al {{au}}',
      anniversaire: 'Cumpleaños de {{p}}',
    },
    // Se añade al texto cuando el planeta del mes toca sobre todo a uno de
    // los dos.
    vedette: {
      tendre: 'Este mes, Venus toca sobre todo la carta de {{p}}.',
      passion: 'Este mes, Marte despierta sobre todo la carta de {{p}}.',
      elan: 'Este mes, Júpiter abre puertas sobre todo a {{p}}.',
    },
  },
};
