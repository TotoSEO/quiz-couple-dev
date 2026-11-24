// Los nombres y los títulos del informe, en español (de España, con
// «vosotros», como el resto del sitio). Los pronombres se escriben con la
// sintaxis de concordancia ({él|ella}, {lo|la}): {{il}} y {{lui}} solo
// existen en francés. Los nombres de los signos son los de las páginas en
// español del sitio.
export default {
  signes: {
    belier: { nom: 'Aries', en: 'en Aries' },
    taureau: { nom: 'Tauro', en: 'en Tauro' },
    gemeaux: { nom: 'Géminis', en: 'en Géminis' },
    cancer: { nom: 'Cáncer', en: 'en Cáncer' },
    lion: { nom: 'Leo', en: 'en Leo' },
    vierge: { nom: 'Virgo', en: 'en Virgo' },
    balance: { nom: 'Libra', en: 'en Libra' },
    scorpion: { nom: 'Escorpio', en: 'en Escorpio' },
    sagittaire: { nom: 'Sagitario', en: 'en Sagitario' },
    capricorne: { nom: 'Capricornio', en: 'en Capricornio' },
    verseau: { nom: 'Acuario', en: 'en Acuario' },
    poissons: { nom: 'Piscis', en: 'en Piscis' },
  },
  // `le` sirve en «la Venus de Lucía».
  planetes: {
    soleil: { nom: 'Sol', le: 'el Sol', Le: 'El Sol', il: 'él' },
    lune: { nom: 'Luna', le: 'la Luna', Le: 'La Luna', il: 'ella' },
    mercure: { nom: 'Mercurio', le: 'el Mercurio', Le: 'El Mercurio', il: 'él' },
    venus: { nom: 'Venus', le: 'la Venus', Le: 'La Venus', il: 'ella' },
    mars: { nom: 'Marte', le: 'el Marte', Le: 'El Marte', il: 'él' },
  },
  aspects: {
    conjonction: { nom: 'Conjunción' },
    sextile: { nom: 'Sextil' },
    carre: { nom: 'Cuadratura' },
    trigone: { nom: 'Trígono' },
    opposition: { nom: 'Oposición' },
  },
  relations: {
    meme: 'Mismo elemento',
    allie: 'Elementos aliados',
    contraste: 'Elementos opuestos',
  },
  ui: {
    titrePersonne: '{{p}}, {{planete}} {{en}}',
    doute: '{{Planete}} de {{p}} cambió de signo el día en que nació. Sin la hora, tomamos su posición a mediodía, {{ici}}. Si {{p}} nació temprano por la mañana o tarde por la noche, también podría estar {{en}}.',
    doutePlus: 'Si estaba {{en}}',
    lienAspect: '{{planetes}}',
    lienRelation: '{{planetes}}',
    croiseAspect: '{{P1}} de {{x}} y {{p2}} de {{y}}',
    croiseRelation: '{{P1}} de {{x}} y {{p2}} de {{y}}',
    atoutMeme: '{{planetes}}',
    atoutCroise: '{{P1}} de {{x}} y {{p2}} de {{y}}',
    chapitres: {
      soleil: {
        titre: 'Lo que sois en el fondo',
        intro: 'En astrología, el Sol dice cómo es una persona en el fondo y qué necesita para sentirse a gusto consigo misma. Es el signo que todo el mundo conoce, el del horóscopo del periódico. En una pareja, muestra lo que aporta cada uno y lo que le gustaría que el otro reconociera en él.',
        vos: 'Vuestros dos Soles',
      },
      lune: {
        titre: 'Vuestras emociones',
        intro: 'La Luna habla de las emociones: lo que tranquiliza, lo que hace daño, cómo reacciona uno después de un mal día. Cambia de signo cada dos días y medio, así que dos personas nacidas el mismo mes casi nunca tienen la misma. En una pareja, es ella la que dice cómo consolar al otro.',
        vos: 'Vuestras dos Lunas',
      },
      venus: {
        titre: 'Vuestra forma de querer',
        intro: 'Venus es la forma de querer: lo que seduce, cómo demuestra uno su amor y qué espera a cambio. Cuando alguien dice «nunca me demuestra que me quiere», muchas veces es que las dos Venus no hablan el mismo idioma.',
        vos: 'Vuestras dos Venus',
      },
      mars: {
        titre: 'Vuestro deseo y vuestras discusiones',
        intro: 'Marte habla del deseo y de la energía, y también del enfado. Dice cómo da cada uno el primer paso, qué le atrae y cómo discute. Cuando los dos Marte se entienden, suele ser una pareja que discute poco y hace las paces rápido.',
        vos: 'Vuestros dos Marte',
      },
      mercure: {
        titre: 'Vuestra forma de hablaros',
        intro: 'Mercurio habla de la forma de pensar y de hablar: comentar un problema, escribir un mensaje, escuchar al otro. Muchas discusiones vienen menos de lo que se dice que de cómo se dice, y eso es justo lo que mira Mercurio.',
        vos: 'Vuestros dos Mercurio',
      },
      liens: {
        titre: 'Lo que os une',
        intro: 'Aquí cruzamos vuestras dos cartas: un planeta de uno frente a un planeta del otro. Es la parte que los astrólogos miran primero en una pareja, porque ahí se ven la atracción y la ternura, y también lo que roza.',
      },
    },
    fin: [
      'Este es vuestro cielo a dos. Recordad que es un juego: la astrología no predice nada, y ningún planeta decide por {v:vosotros|vosotras} si vuestra pareja funciona.',
      'Este informe sirve sobre todo para hablar de {v:vosotros|vosotras}. Releed las partes que os han hecho sonreír, y las que os han chirriado: muchas veces es ahí donde hay algo que deciros.',
    ],
  },
};
