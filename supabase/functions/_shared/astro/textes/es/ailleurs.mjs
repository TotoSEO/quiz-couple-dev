// Los signos chinos y los caminos de vida. Los retratos hablan de una
// persona ({{p}}, {él|ella}), las relaciones hablan a la pareja.
export default {
  chinois: {
    titres: {
      trine: 'El mismo triángulo',
      harmonie: 'Amigos secretos',
      meme: 'El mismo animal',
      neutre: 'Ni aliados ni rivales',
      nuisance: 'Una pareja que se desgasta',
      opposition: 'Cara a cara',
    },
    relations: {
      trine: 'En la astrología china, vuestros dos animales forman parte del mismo triángulo de afinidad, el lazo más buscado para una pareja. Avanzáis al mismo ritmo y queréis más o menos lo mismo de la vida. Las decisiones importantes se toman sin pulsos, y sentís que estáis del mismo lado.',
      harmonie: 'Vuestros dos animales forman una de las seis parejas de «amigos secretos» de la astrología china. Sois muy {v:distintos|distintas}, pero cada uno le aporta al otro lo que le falta, y eso ocurre casi sin pensarlo. Es un lazo discreto y sólido.',
      meme: 'Habéis nacido bajo el mismo animal chino. Os entendéis rápido, porque tenéis el mismo temperamento, con las mismas virtudes y los mismos defectos. Cuidado con no devolveros como un espejo lo que no os gusta de {v:vosotros mismos|vosotras mismas}.',
      neutre: 'Vuestros dos animales no tienen ni una afinidad especial ni una tensión marcada en la tradición china. Nada os empuja el uno hacia el otro, y nada os separa tampoco: vuestro entendimiento depende de {v:vosotros|vosotras}, mucho más que de vuestros signos.',
      nuisance: 'Vuestros dos animales forman una de las seis parejas que la tradición china llama «de daño». No es una incompatibilidad, sino pequeñas molestias que vuelven una y otra vez. El remedio es sencillo: deciros pronto lo que os molesta, antes de que se acumule.',
      opposition: 'Vuestros dos animales están cara a cara en la rueda china, a seis signos de distancia. Es el eje más tenso de la astrología china, y muchas veces el más atractivo al principio. Vuestras diferencias os gustan y os cansan a la vez, y cada uno tiene que aceptar que el otro no funciona como él.',
    },
    elements: {
      meme: 'También compartís el mismo elemento chino: tenéis la misma forma de avanzar en la vida.',
      nourrit: 'Vuestros elementos chinos se alimentan, como la madera alimenta el fuego. Uno le da impulso al otro, y sois más {v:fuertes|fuertes} {v:juntos|juntas}.',
      controle: 'Vuestros elementos chinos se controlan, como el agua apaga el fuego. Uno tiende a frenar al otro, a veces por su bien, a veces demasiado. Dejad a cada uno el sitio para avanzar a su ritmo.',
    },
    animaux: {
      rat: '{{p}} es del signo de la Rata. En el amor, es {vivo|viva} y {listo|lista}, y siempre tiene en mente un plan para salir. Le importan muchísimo su familia y la gente que quiere, aunque a veces se preocupe demasiado por el dinero o por el futuro.',
      buffle: '{{p}} es del signo del Buey. En el amor, construye despacio pero sobre seguro, y se puede contar con {él|ella} sin reservas. No le van mucho las sorpresas. Su ternura es discreta: se ve en lo que hace por el otro, casi nunca en las grandes palabras.',
      tigre: '{{p}} es del signo del Tigre. En el amor, le gustan las historias intensas y tiene el valor de sus sentimientos. Lleva fatal que le den órdenes, y necesita libertad para seguir siendo {feliz|feliz}. Con {él|ella}, la vida casi nunca es aburrida.',
      lapin: '{{p}} es del signo del Conejo, al que también llaman el Gato. En el amor, es {dulce|dulce} y {delicado|delicada}, y los conflictos {lo|la} cansan pronto. Necesita un hogar tranquilo para estar a gusto, y sabe mejor que nadie hacer que una casa sea agradable.',
      dragon: '{{p}} es del signo del Dragón. Tiene carisma y ambición, y en el amor le gusta impresionar. Da mucho, pero también espera mucho, y nada le aburre más que una relación del montón.',
      serpent: '{{p}} es del signo de la Serpiente. En el amor, es {misterioso|misteriosa} y lo piensa mucho antes de comprometerse. Su intuición rara vez se equivoca. Puede ponerse {celoso|celosa} cuando se siente {amenazado|amenazada}, pero es de una gran fidelidad.',
      cheval: '{{p}} es del signo del Caballo. Se enamora rápido y con entusiasmo. Necesita movimiento y espacio, y una relación demasiado asfixiante {lo|la} hace huir. Con {él|ella}, hacen falta planes y aire libre.',
      chevre: '{{p}} es del signo de la Cabra. En el amor, es {tierno|tierna} y necesita sentirse {protegido|protegida}. Le gustan las cosas bonitas, la música y las noches tranquilas en casa, y a menudo tiene una verdadera vena artística.',
      singe: '{{p}} es del signo del Mono. En el amor, es {divertido|divertida} y tiene mucha imaginación. Le encanta sorprender al otro, y se aburre pronto si a la relación le falta juego. Sus bromas suelen ser su manera de decir que alguien le importa.',
      coq: '{{p}} es del signo del Gallo. En el amor, es {franco|franca} y le gusta que las cosas estén claras. Cuida los detalles, de su ropa a las fechas importantes, y demuestra su amor siendo {fiable|fiable}. Tiene su orgullo, y las críticas le afectan más de lo que deja ver.',
      chien: '{{p}} es del signo del Perro. En el amor, la confianza va antes que nada. Es {leal|leal} y {protector|protectora}, y defiende a su pareja contra viento y marea. Una vez que ha entregado su corazón, no lo recupera fácilmente.',
      cochon: '{{p}} es del signo del Cerdo. En el amor, es {generoso|generosa} y {sincero|sincera}, y le encantan los placeres sencillos compartidos, una buena comida o quedarse en la cama el domingo por la mañana. Perdona con facilidad, a veces demasiada.',
    },
  },
  vie: {
    nombres: {
      1: 'El camino de vida de {{p}} es el 1, el de los pioneros. En el amor, le gusta tomar la iniciativa y avanzar. Necesita una pareja que respete su independencia.',
      2: 'El camino de vida de {{p}} es el 2, el número del vínculo. Está {hecho|hecha} para la vida en pareja: escucha, apoya y suaviza las cosas. Necesita sentirse {querido|querida} y útil para estar a gusto.',
      3: 'El camino de vida de {{p}} es el 3, el de la alegría y la palabra. En el amor, aporta ligereza, humor e ideas. Necesita una pareja en la que se ría y se hable.',
      4: 'El camino de vida de {{p}} es el 4, el de los constructores. En el amor, es {fiable|fiable} y {trabajador|trabajadora}, y construye a largo plazo. Necesita estabilidad y proyectos concretos.',
      5: 'El camino de vida de {{p}} es el 5, el de la libertad. En el amor, necesita cambios, viajes y novedades. Una relación demasiado rutinaria {lo|la} aburre pronto.',
      6: 'El camino de vida de {{p}} es el 6, el número del amor y de la familia. Cuida de los demás, pone armonía en todas partes y tiene sentido de la responsabilidad. La pareja y el hogar cuentan muchísimo para {él|ella}.',
      7: 'El camino de vida de {{p}} es el 7, el de la reflexión. En el amor, necesita profundidad, conversaciones con sentido y momentos a solas para recargar las pilas.',
      8: 'El camino de vida de {{p}} es el 8, el de la ambición. En el amor, es {fuerte|fuerte} y {protector|protectora}, y le gusta construir una vida cómoda. Tiene que cuidar de guardar tiempo para la pareja.',
      9: 'El camino de vida de {{p}} es el 9, el de la generosidad. En el amor, da mucho, piensa en los demás y sueña con un ideal. Necesita una pareja que comparta sus valores.',
      11: 'El camino de vida de {{p}} es el 11, un número maestro, el de la intuición. En el amor, es muy {sensible|sensible} e {inspirado|inspirada}, y nota las cosas antes de que se digan.',
      22: 'El camino de vida de {{p}} es el 22, un número maestro, el de los grandes proyectos. En el amor, mira lejos y quiere construir algo sólido, que dure.',
      33: 'El camino de vida de {{p}} es el 33, un número maestro muy raro, el de la entrega. En el amor, da muchísimo, a veces hasta olvidarse de sí {mismo|misma}.',
    },
    accord: {
      haut: 'Vuestros caminos de vida encajan muy bien: en numerología, vuestros dos números van en la misma dirección y se apoyan.',
      moyen: 'Vuestros caminos de vida se llevan bien, con diferencias que os enriquecen.',
      bas: 'Vuestros caminos de vida son bastante distintos: no avanzáis al mismo ritmo, y hay que respetar el del otro.',
    },
  },
};
