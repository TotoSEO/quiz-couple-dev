# Huitième lot : vingt-deux reels, fin mars.
from usine import *

CANAPE = dict(y=318, taille=210, pose='assis')


def SUR_CANAPE(nom, x, **k):
    d = dict(CANAPE)
    d.update(k)
    return fixe(nom, x, **d)


reel('ani-354', 'elle', 'toi quand ta personne te pique tes chaussettes', lieu='matin', plans=[
    plan(4, "Le matin ; lui, une chaussette à la patte, cherche l'autre partout, perplexe, soulève un coussin ; elle, assise sur le canapé, l'air innocent, l'auréole, les pattes bien cachées sous elle.",
         [perso('lui', E(0, x=250, expression='perplexe', bras='tient', signes=['question']), E(1.2, bras='leves', expression='inquiet'), E(2.4, bras='tient', expression='confus')),
          SUR_CANAPE('elle', 414, expression='ange', signes=['halo'])],
         meubles=['canape_fond'], objets=[O('chaussettes', 250, 300, 0.5), O('coussin', 150, 190, 0.8, de=1.2, a=2.4), O('coussin', 120, 350, 0.8, de=2.4)], textes=[TITRE('toi quand ta personne te pique tes chaussettes')]),
    plan(4, "Il se retourne vers elle ; elle siffle ; il baisse les yeux : ses deux chaussettes à lui sont à ses pattes à elle, bien trop grandes ; il ouvre des yeux ronds ; elle hausse les épaules, ravie.",
         [perso('lui', E(0, x=250, expression='confus'), E(0.8, vers=1, expression='suspicieux'), E(1.8, expression='choque', signes=['exclamation']), E(3.0, expression='blase')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='chante', signes=['halo']), E(1.4, expression='malicieux'), E(2.6, expression='joie', bras='hanches'))],
         meubles=['canape_fond'], objets=[O('chaussettes', 390, 360, 0.5, de=1.8), O('chaussettes', 440, 360, 0.5, de=1.8), O('chaussettes', 250, 300, 0.5)]),
    plan(4.5, "Ils finissent assis côte à côte sur le canapé, une chaussette chacun : une à lui, une à elle, dépareillées ; ils regardent leurs pattes, puis se regardent, et rient ; un petit cœur.",
         [SUR_CANAPE('lui', 270, expression='content'), perso('elle', E(0, x=380, y=318, taille=210, pose='assis', expression='content'), E(2.0, expression='rire', vers=-1), E(3.2, pose='penche_g', x=370, expression='amour'))],
         meubles=['canape_fond'], objets=[O('chaussettes', 250, 360, 0.5), O('chaussettes', 400, 360, 0.5), O('coeur', 325, 170, 0.35, de=3.2, flotte=True)]),
])

reel('ani-355', 'les deux', 'nous deux quand on veut un câlin et qu\'il fait trop chaud', lieu='saisons', plans=[
    plan(4, "Un grand soleil, le premier jour chaud ; les deux, rouges, de la vapeur au-dessus de la tête, se regardent, un peu tristes ; ils voudraient un câlin ; ils s'approchent prudemment.",
         [perso('lui', E(0, x=230, expression='chaud', signes=['vapeur']), E(1.6, expression='triste', vers=1), marche(230, 290, 2.4, 3.0, expression='content', tourne=False), E(3.2, angle=0)),
          perso('elle', E(0, x=470, expression='chaud', signes=['vapeur']), E(1.6, expression='triste', vers=-1), marche(470, 400, 2.4, 3.0, expression='content', tourne=False), E(3.2, angle=0))],
         objets=[O('soleil', 540, 80, 1.0)], textes=[TITRE('nous deux quand on veut un câlin et qu\'il fait trop chaud')]),
    plan(3.5, "Câlin ; une seconde de bonheur, des cœurs ; puis la vapeur monte d'un coup, les deux deviennent tout rouges, les yeux en croix, et se lâchent en même temps.",
         [perso('lui', E(0, x=290, pose='penche_d', bras='tend_d', expression='calin'), E(1.4, expression='chaud', signes=['vapeur', 'rougeur_pleine']), E(2.4, pose='debout', bras='bas', expression='ko', x=240)),
          perso('elle', E(0, x=400, pose='penche_g', bras='tend_g', expression='calin'), E(1.4, expression='chaud', signes=['vapeur', 'rougeur_pleine']), E(2.4, pose='debout', bras='bas', expression='ko', x=450))],
         objets=[O('soleil', 540, 80, 1.0)] + COEURS(345, 140, de=0.3, n=2)),
    plan(4.5, "Ils s'assoient par terre, loin l'un de l'autre, de chaque côté de l'écran, et se tendent la patte à distance : le bout des pattes se touche, et c'est tout ; un petit cœur au milieu ; le soleil tape.",
         [perso('lui', E(0, x=200, pose='assis', expression='blase', signes=['vapeur']), E(1.4, bras='tend_d', expression='content')),
          perso('elle', E(0, x=440, pose='assis', expression='blase', signes=['vapeur']), E(1.8, bras='tend_g', expression='content'))],
         objets=[O('soleil', 540, 80, 1.0), O('coeur', 320, 300, 0.3, de=2.4, flotte=True)]),
])

reel('ani-356', 'lui', 'toi quand ta personne te réveille pour dire « je t\'aime »', lieu='nuit', son='tendre', plans=[
    plan(4, "La nuit, la lune ; le lit ; lui dort allongé ; elle, réveillée, le regarde avec des cœurs dans les yeux, puis le secoue doucement ; il grogne, les yeux fermés.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']), E(2.8, expression='exaspere', pose='allonge')),
          perso('elle', AU_LIT(394, expression='amour', vers=-1, signes=['coeurs']), E(2.0, bras='tend_g'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], textes=[TITRE('toi quand ta personne te réveille pour dire « je t\'aime »')]),
    plan(4, "Il ouvre un œil, blasé ; en haut s'écrit « je t'aime » ; il reste figé, puis fond, les yeux en cœur ; elle sourit, satisfaite, et se rallonge aussitôt.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='blase'), E(1.4, expression='surpris', pose='allonge'), E(2.2, pose='debout', bras='aucun', pattes='aucune', expression='amour', signes=['coeurs'])),
          perso('elle', AU_LIT(394, expression='content'), E(2.6, pose='allonge', expression='zen'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('coeur', 320, 190, 0.35, de=2.4, flotte=True)], textes=[DIT('« je t\'aime »', de=0.6)]),
    plan(4.5, "« 2 min plus tard » en bas. Elle dort profondément, des z ; lui, assis dans le lit, tout content, n'arrive plus à dormir, les cœurs toujours dans les yeux ; il la regarde ; la lune aussi.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('lui', AU_LIT(248, expression='amour', signes=['coeurs']), E(2.0, expression='content', vers=1), E(3.4, expression='amour'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('coeur', 300, 190, 0.3, de=1.0, flotte=True)], textes=[BAS('2 min plus tard')]),
])

reel('ani-357', 'les deux', 'nous deux quand il faut se lever pour éteindre la lumière', lieu='canapé', plans=[
    plan(4, "Le soir, le canapé, une lampe allumée à droite ; les deux affalés sous le plaid, zen ; ils regardent la lampe, puis se regardent ; personne ne bouge.",
         [SUR_CANAPE('lui', 226, expression='zen'), SUR_CANAPE('elle', 414, expression='zen')],
         meubles=['canape_fond'], objets=[O('couverture', 320, 318, 2.6), O('lampe', 590, 300, 1.0)], textes=[TITRE('nous deux quand il faut se lever pour éteindre la lumière')]),
    plan(4, "En haut s'écrit « vas-y toi » ; lui fait non ; elle fait non ; ils se fixent, les yeux plissés ; ils ferment les yeux tous les deux, faux endormis, l'auréole.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='suspicieux', vers=1), E(1.4, expression='determine'), E(2.6, expression='dodo', signes=['halo'])),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='suspicieux', vers=-1), E(1.4, expression='determine'), E(2.6, expression='dodo', signes=['halo']))],
         meubles=['canape_fond'], objets=[O('couverture', 320, 318, 2.6), O('lampe', 590, 300, 1.0)], textes=[DIT('« vas-y toi »', de=0.3)]),
    plan(4.5, "Elle rouvre un œil, attrape le coussin et le lance ; il vole jusqu'à la lampe, la lampe tombe, le noir ; les deux, très fiers, le pouce levé dans le noir ; un petit cœur.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='dodo'), E(0.6, expression='malicieux', bras='tend_g'), E(2.2, expression='fier', bras='pouce')),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='dodo'), E(1.8, expression='surpris'), E(2.4, expression='fier', bras='pouce'))],
         meubles=['canape_fond'], objets=[O('couverture', 320, 318, 2.6), O('coussin', 470, 290, 0.8, de=0.6, etapes=[{'a': 0.6, 'x': 470}, {'a': 1.4, 'x': 590, 'y': 290}]), O('lampe', 590, 300, 1.0, etapes=[{'a': 0, 'y': 300}, {'a': 1.4, 'y': 300}, {'a': 1.9, 'y': 350}]), O('coeur', 320, 150, 0.35, de=3.0, flotte=True)], sons=[{'nom': 'splat', 'a': 1.9}]),
])

reel('ani-358', 'elle', 'toi quand ta personne t\'embrasse avec son rouge à lèvres', lieu='sortir', plans=[
    plan(4, "Le matin, près de la porte ; lui est prêt à partir, le sac à la patte ; elle lui fait un bisou sur la joue, puis sur l'autre, puis sur le front ; il part, tout content ; des petits cœurs.",
         [perso('lui', E(0, x=300, expression='content', bras='tient'), E(2.6, expression='joie', signes=['rougeur_pleine'])),
          perso('elle', E(0, x=430, expression='amour'), E(0.8, pose='penche_g', expression='bisou'), E(1.4, pose='debout'), E(1.8, pose='penche_g', expression='bisou'), E(2.4, pose='debout', expression='joie'))],
         objets=[O('porte', 600, 230, 1.6, derriere=True), O('sac', 300, 300, 0.7), O('coeur', 360, 200, 0.3, de=1.0, flotte=True), O('coeur', 380, 170, 0.3, de=2.0, flotte=True)], textes=[TITRE('toi quand ta personne t\'embrasse avec son rouge à lèvres')], sons=[{'nom': 'pop', 'a': 0.9}, {'nom': 'pop', 'a': 1.9}]),
    plan(4, "Dehors, dans la rue ; lui marche fièrement, des étincelles, sans se douter de rien ; il croise un reflet dans une fenêtre, s'arrête, se regarde : des cœurs roses partout sur la figure.",
         [perso('lui', E(0, x=-140, angle=90, pose='marche', expression='fier', signes=['etincelles'], bras='tient'), E(1.8, x=330, pose='debout'), E(2.2, angle=0, expression='content'), E(2.8, vers=1, expression='surpris'), E(3.4, expression='choque', signes=['exclamation', 'coeurs']))],
         objets=[O('arbre', 515, 255, 1.3, derriere=True), O('fenetre', 540, 180, 1.2, derriere=True), O('sac', 330, 300, 0.7, etapes=[{'a': 0, 'x': -140}, {'a': 1.8, 'x': 330}])], ambiance='circulation'),
    plan(4.5, "Il frotte sa joue à toute vitesse, rouge de honte, une goutte de sueur ; de retour à la maison, elle l'attend, l'air innocent, l'auréole, et lui en fait un autre ; il abandonne et sourit.",
         [perso('lui', E(0, x=300, expression='honte', bras='joue', signes=['rougeur_pleine', 'sueur']), E(2.0, bras='bas', expression='exaspere', vers=1), E(3.4, expression='content', signes=['rougeur_pleine'])),
          perso('elle', E(0, x=430, expression='ange', signes=['halo']), E(2.4, pose='penche_g', expression='bisou'), E(3.2, pose='debout', expression='rire'))],
         objets=[O('porte', 600, 230, 1.6, derriere=True), O('coeur', 360, 190, 0.3, de=2.6, flotte=True)], sons=[{'nom': 'pop', 'a': 2.5}]),
])

reel('ani-359', 'lui', 'toi quand ta personne te laisse la fenêtre dans le train', lieu='dehors', son='tendre', plans=[
    plan(4, "Un banc comme dans un train, une fenêtre à droite ; les deux arrivent ; lui s'écarte et lui laisse la place près de la fenêtre, galant ; elle, ravie, s'assoit et regarde dehors, émerveillée.",
         [perso('elle', entre(430, 0, 1.4, pose='marche', expression='content', tourne=False), E(1.6, angle=0, x=430, y=340, taille=220, pose='assis', expression='emerveille', vers=1)),
          perso('lui', entre(300, 0.3, 1.8, pose='marche', expression='content', tourne=False), E(2.0, angle=0, bras='tend_d', expression='fier'), E(2.6, x=290, y=340, taille=220, pose='assis', bras='bas'))],
         objets=[O('banc', 360, 340, 1.6, derriere=True), O('fenetre', 560, 170, 1.3, derriere=True)], textes=[TITRE('toi quand ta personne te laisse la fenêtre dans le train')], ambiance='moteur'),
    plan(4, "« 2 min plus tard » en bas. Elle s'est endormie contre la vitre, des z ; lui, de son côté, essaie de regarder dehors par-dessus elle, se penche, se tord le cou, puis renonce.",
         [perso('elle', E(0, x=430, y=340, taille=220, pose='assis', expression='dodo', signes=['zzz'])),
          perso('lui', E(0, x=290, y=340, taille=220, pose='assis', expression='content', vers=1), E(1.0, pose='penche_d', x=320, expression='curieux'), E(2.2, pose='etire', expression='effort'), E(3.2, pose='assis', x=290, expression='blase'))],
         objets=[O('banc', 360, 340, 1.6, derriere=True), O('fenetre', 560, 170, 1.3, derriere=True)], textes=[BAS('2 min plus tard')], ambiance='moteur'),
    plan(4.5, "Il la regarde dormir contre la vitre, et ça lui va très bien ; il sourit, pose son bras autour d'elle ; un petit cœur ; dehors, un oiseau passe, et il est le seul à le voir.",
         [perso('lui', E(0, x=290, y=340, taille=220, pose='assis', expression='blase'), E(1.2, expression='amour', vers=1), E(2.0, bras='tend_d', expression='content')),
          perso('elle', E(0, x=430, y=340, taille=220, pose='assis', expression='dodo', signes=['zzz']))],
         objets=[O('banc', 360, 340, 1.6, derriere=True), O('fenetre', 560, 170, 1.3, derriere=True), O('oiseau', 560, 160, 0.4, de=2.8, etapes=[{'a': 2.8, 'x': 590}, {'a': 4.4, 'x': 520}]), O('coeur', 360, 190, 0.35, de=2.2, flotte=True)], ambiance='moteur'),
])

reel('ani-360', 'lui', 'toi quand ta personne passe « 5 min » au magasin de brico', lieu='sortir', plans=[
    plan(4, "Devant une porte de magasin ; lui entre en courant, les yeux qui brillent ; en haut s'écrit « juste 5 min » ; elle, dehors, s'assoit sur le banc, confiante, le téléphone à la patte.",
         [perso('lui', E(0, x=200, expression='emerveille', signes=['etincelles']), E(0.8, x=200, angle=90, pose='court'), E(2.0, x=820)),
          perso('elle', E(0, x=400, expression='content'), E(1.6, x=420, y=340, taille=220, pose='assis', bras='tient'))],
         objets=[O('porte', 600, 230, 1.6, derriere=True), O('banc', 420, 340, 1.4, derriere=True), O('telephone', 420, 290, 0.5, de=1.6)], textes=[TITRE('toi quand ta personne passe « 5 min » au magasin de brico', a=1.4), DIT('« juste 5 min »', de=1.6)]),
    plan(4, "« 1 h plus tard » en bas. Elle, sur le banc, s'ennuie, puis pique du nez, puis dort allongée sur le banc ; il ressort une seconde, radieux, une lampe à la patte, et repart dedans.",
         [perso('elle', E(0, x=420, y=340, taille=220, pose='assis', expression='ennui'), E(1.2, expression='fatigue'), E(2.4, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('lui', E(0.6, x=820, angle=-90, pose='court', expression='joie', bras='tient'), E(1.6, x=560, pose='debout'), E(2.0, angle=0, expression='emerveille', signes=['etincelles']), E(2.6, angle=90, pose='court'), E(3.4, x=820))],
         objets=[O('porte', 600, 230, 1.6, derriere=True), O('banc', 420, 340, 1.4, derriere=True), O('lampe', 560, 300, 0.8, de=0.6, etapes=[{'a': 0.6, 'x': 820}, {'a': 1.6, 'x': 560}, {'a': 2.6, 'x': 560}, {'a': 3.4, 'x': 820}])], textes=[BAS('1 h plus tard')]),
    plan(4.5, "« 3 h plus tard » en bas. Il ressort avec trois cartons empilés, une lampe, une plante, fier comme tout ; elle se réveille, regarde la pile, et pointe l'heure sur son téléphone ; il fait l'innocent.",
         [perso('lui', entre(300, 0, 1.8, depuis='droite', pose='marche', expression='fier', bras='porte_haut'), E(2.4, signes=['etincelles']), E(3.6, expression='ange', signes=['halo'])),
          perso('elle', E(0, x=420, y=340, taille=220, pose='allonge', expression='dodo'), E(1.4, pose='assis', expression='surpris'), E(2.4, expression='blase', bras='tient'), E(3.2, bras='pointe', expression='narquois'))],
         objets=[O('porte', 600, 230, 1.6, derriere=True), O('banc', 420, 340, 1.4, derriere=True), O('caisse', 300, 110, 0.9, etapes=[{'a': 0, 'x': 820}, {'a': 1.8, 'x': 300}]), O('plante', 300, 40, 0.6, etapes=[{'a': 0, 'x': 820}, {'a': 1.8, 'x': 300}]), O('lampe', 200, 300, 0.8, de=1.8), O('telephone', 420, 290, 0.5, de=2.4)], textes=[BAS('3 h plus tard')]),
])

reel('ani-361', 'les deux', 'nous deux en mode karaoké dans la cuisine', lieu='maison', plans=[
    plan(4, "La maison ; elle, une brosse à la patte en guise de micro, chante à tue-tête, des notes partout ; lui arrive, surpris, puis attrape une tasse comme micro et la rejoint.",
         [perso('elle', E(0, x=300, expression='chante', bras='tient', signes=['notes'])),
          perso('lui', entre(460, 0.4, 1.6, depuis='droite', expression='surpris'), E(2.2, expression='joie', bras='tient', signes=['notes']))],
         objets=[O('brosse', 300, 290, 0.5), O('tasse', 460, 300, 0.5, de=2.2), O('musique', 200, 130, 0.6, de=0.3, flotte=True), O('musique', 520, 120, 0.5, de=1.2, flotte=True)], textes=[TITRE('nous deux en mode karaoké dans la cuisine')]),
    plan(4, "Les deux chantent et dansent, face à face, dos à dos, en se donnant la réplique, des notes énormes, les yeux fermés, à fond ; le refrain : ils se pointent du doigt.",
         [perso('lui', E(0, x=440, pose='danse', expression='chante', bras='tient', signes=['notes']), E(1.4, bras='pointe', vers=-1), E(2.6, pose='penche_g', bras='tient')),
          perso('elle', E(0, x=280, pose='danse', expression='chante', bras='tient', signes=['notes']), E(1.4, bras='pointe', vers=1), E(2.6, pose='penche_d', bras='tient'))],
         objets=[O('brosse', 280, 290, 0.5), O('tasse', 440, 300, 0.5), O('musique', 180, 110, 0.8, de=0.2, flotte=True), O('musique', 360, 90, 0.7, de=0.8, flotte=True), O('musique', 540, 130, 0.8, de=1.4, flotte=True)]),
    plan(4.5, "Trois coups frappés au mur, derrière eux ; les deux se figent, la brosse et la tasse en l'air ; ils se regardent, honteux, et finissent la chanson en chuchotant, penchés l'un vers l'autre, le doigt sur la bouche.",
         [perso('lui', E(0, x=440, pose='danse', expression='chante', bras='tient'), E(0.8, pose='debout', expression='surpris', signes=['exclamation']), E(1.8, expression='honte', signes=['rougeur_pleine']), E(2.8, x=400, pose='penche_g', expression='chut', bras='bouche')),
          perso('elle', E(0, x=280, pose='danse', expression='chante', bras='tient'), E(0.8, pose='debout', expression='surpris', signes=['exclamation']), E(1.8, expression='honte', signes=['rougeur_pleine']), E(2.8, x=300, pose='penche_d', expression='chut', bras='bouche'))],
         objets=[O('brosse', 280, 290, 0.5, a=2.8), O('tasse', 440, 300, 0.5, a=2.8), O('musique', 350, 120, 0.3, de=3.2, flotte=True)], sons=[{'nom': 'tape', 'a': 0.3}, {'nom': 'tape', 'a': 0.55}, {'nom': 'tape', 'a': 0.8}]),
])

reel('ani-362', 'les deux', 'nous deux quand on est têtus tous les deux', lieu='dispute', plans=[
    plan(4, "Les deux face à face, décidés, les bras croisés, le regard noir ; en haut s'écrit « c'est toi qui t'excuses » ; aucun des deux ne bouge d'un millimètre.",
         [fixe('lui', 260, expression='determine', bras='croises'), fixe('elle', 420, expression='determine', bras='croises')],
         textes=[TITRE('nous deux quand on est têtus tous les deux', a=1.6), DIT('« c\'est toi qui t\'excuses »', de=1.8)]),
    plan(4, "« 1 h plus tard » en bas. Toujours debout face à face, les bras croisés ; ils ont faim, ils bâillent, les yeux qui tombent ; mais personne ne bouge ; une horloge tourne.",
         [perso('lui', E(0, x=260, expression='determine', bras='croises'), E(1.2, expression='baille'), E(2.4, expression='fatigue', bras='croises')),
          perso('elle', E(0, x=420, expression='determine', bras='croises'), E(1.6, expression='baille'), E(2.8, expression='fatigue', bras='croises'))],
         objets=[O('horloge', 540, 100, 0.7)], textes=[BAS('1 h plus tard')]),
    plan(4.5, "« 3 h plus tard » en bas. Les deux dorment debout, face à face, les bras toujours croisés, appuyés l'un contre l'autre front contre front, des z ; un petit cœur ; personne ne s'est excusé.",
         [perso('lui', E(0, x=290, pose='penche_d', expression='dodo', bras='croises', signes=['zzz'])),
          perso('elle', E(0, x=400, pose='penche_g', expression='dodo', bras='croises', signes=['zzz']))],
         objets=[O('horloge', 540, 100, 0.7), O('coeur', 345, 150, 0.35, de=2.0, flotte=True)], textes=[BAS('3 h plus tard')]),
])

reel('ani-363', 'lui', 'toi quand ta personne dit « tu dors sur le canapé ce soir »', lieu='dispute', son='tendre', plans=[
    plan(4, "Le soir, la chambre ; elle, furieuse, pointe la porte ; lui, tout triste, un oreiller sous le bras, sort en traînant par la droite ; en haut s'écrit « tu dors sur le canapé ».",
         [perso('elle', AU_LIT(394, expression='furieux', bras='pointe', signes=['veine'], vers=1)),
          perso('lui', E(0, x=200, expression='triste', bras='tient'), E(1.4, x=200, angle=90, pose='marche'), E(3.4, x=820))],
         meubles=['lit_fond'], objets=[O('oreiller', 200, 290, 0.8, etapes=[{'a': 1.4, 'x': 200}, {'a': 3.4, 'x': 820}])], textes=[TITRE('toi quand ta personne dit « tu dors sur le canapé ce soir »', a=1.4), DIT('« tu dors sur le canapé »', de=1.6)]),
    plan(4, "La nuit, la lune ; le canapé ; lui, recroquevillé dessus, grelotte, l'oreiller sous la tête, un nuage noir ; dans la chambre à côté, elle, dans le lit, boude, puis se sent triste, puis regarde la porte.",
         [perso('lui', E(0, x=300, y=318, taille=200, pose='boule', expression='froid', signes=['frissons', 'nuage_noir']), E(2.4, expression='triste'))],
         meubles=['canape_fond'], objets=[O('lune', 560, 90, 0.5), O('oreiller', 200, 300, 0.8), O('porte', 60, 230, 1.5, derriere=True)]),
    plan(4.5, "« 2 h plus tard » en bas. Elle arrive sur la pointe des pattes avec le plaid, le pose sur lui, et se glisse sur le canapé contre lui ; il ouvre un œil, surpris ; elle boude encore, mais reste ; un petit cœur.",
         [perso('lui', E(0, x=300, y=318, taille=200, pose='boule', expression='triste'), E(2.4, expression='surpris', pose='assis', taille=210, x=270), E(3.4, expression='amour')),
          perso('elle', E(0.2, x=-140, angle=90, pose='marche', expression='boude', bras='tient'), E(1.6, x=180, pose='debout'), E(2.0, angle=0, bras='tend_d'), E(2.6, x=360, y=318, taille=210, pose='penche_g', expression='boude', bras='bas'), E(3.8, expression='content'))],
         meubles=['canape_fond'], objets=[O('lune', 560, 90, 0.5), O('porte', 60, 230, 1.5, derriere=True), O('couverture', 180, 300, 1.4, de=0.2, etapes=[{'a': 0.2, 'x': -140}, {'a': 1.6, 'x': 180}, {'a': 2.4, 'x': 310, 'y': 318}], derriere=False), O('coeur', 320, 170, 0.35, de=4.0, flotte=True)], textes=[BAS('2 h plus tard')]),
])

reel('ani-364', 'les deux', 'nous deux quand les invités sont partis', lieu='amis', plans=[
    plan(4, "La porte à droite se referme ; les deux, debout, font encore coucou de la patte, le sourire parfait, l'auréole ; la porte claque ; leurs sourires tombent d'un coup.",
         [perso('lui', E(0, x=270, expression='content', bras='coucou', signes=['halo']), E(2.2, expression='fatigue', bras='bas')),
          perso('elle', E(0, x=430, expression='content', bras='coucou', signes=['halo']), E(2.2, expression='fatigue', bras='bas'))],
         objets=[O('porte', 600, 230, 1.6, derriere=True), O('coussin', 120, 350, 0.8), O('tasse', 180, 345, 0.5), O('tasse', 520, 345, 0.5)], textes=[TITRE('nous deux quand les invités sont partis')], sons=[{'nom': 'porte', 'a': 2.0}]),
    plan(4, "Ils se laissent tomber par terre, l'un après l'autre, au milieu des tasses et des coussins, les yeux en croix, K.-O. ; elle lève une patte : « on range demain » s'écrit en haut.",
         [perso('lui', E(0, x=270, expression='fatigue'), E(0.6, pose='tombe', expression='ko'), E(1.2, pose='allonge', expression='ko', signes=['tourbillon'])),
          perso('elle', E(0, x=430, expression='fatigue'), E(1.0, pose='tombe', expression='ko'), E(1.6, pose='allonge', expression='ko', signes=['tourbillon']), E(2.8, bras='leve_d'))],
         objets=[O('porte', 600, 230, 1.6, derriere=True), O('coussin', 120, 350, 0.8), O('tasse', 180, 345, 0.5), O('tasse', 520, 345, 0.5)], textes=[DIT('« on range demain »', de=3.0)], sons=[{'nom': 'splat', 'a': 1.1}, {'nom': 'splat', 'a': 1.5}]),
    plan(4.5, "Ils dorment par terre, l'un contre l'autre, au milieu du salon, un coussin partagé sous la tête, des z ; la lune à la fenêtre ; un petit cœur ; la vaisselle attendra.",
         [perso('lui', E(0, x=290, pose='allonge', expression='dodo', signes=['zzz'])), perso('elle', E(0, x=380, pose='allonge', expression='dodo', signes=['zzz']))],
         objets=[O('lune', 560, 90, 0.5), O('coussin', 335, 330, 0.9, derriere=True), O('tasse', 180, 345, 0.5), O('tasse', 520, 345, 0.5), O('coeur', 335, 210, 0.35, de=2.0, flotte=True)]),
])

reel('ani-366', 'les deux', 'nous deux sur le canapé-lit chez des amis', lieu='amis', plans=[
    plan(4, "La nuit, la lune ; un canapé, pas un lit ; les deux essaient de s'y allonger ensemble : lui d'abord, puis elle par-dessus ; ça ne rentre pas ; deux points d'exclamation.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='fatigue'), E(0.8, x=300, pose='allonge', expression='zen'), E(2.4, expression='surpris', signes=['exclamation'], pose='allonge')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='fatigue'), E(1.4, x=330, y=250, taille=170, pose='allonge', expression='content'), E(2.4, expression='surpris', signes=['exclamation']))],
         meubles=['canape_fond'], objets=[O('lune', 560, 90, 0.5)], textes=[TITRE('nous deux sur le canapé-lit chez des amis')]),
    plan(4, "Ils essaient autrement : tête-bêche, elle à gauche, lui à droite, les pattes dans la figure de l'autre ; non ; assis tous les deux, la tête en arrière ; non ; lui par terre, elle sur le canapé ; non plus.",
         [perso('elle', E(0, x=250, y=318, taille=200, pose='allonge', expression='exaspere'), E(1.4, x=414, pose='assis', taille=210, expression='fatigue'), E(2.8, x=330, pose='allonge', taille=200, expression='blase')),
          perso('lui', E(0, x=400, y=318, taille=200, pose='allonge', expression='exaspere'), E(1.4, x=226, pose='assis', taille=210, expression='fatigue'), E(2.8, x=250, y=380, taille=250, pose='allonge', expression='boude'))],
         meubles=['canape_fond'], objets=[O('lune', 560, 90, 0.5)]),
    plan(4.5, "« 3 h du matin » en bas. Ils ont fini par trouver : lui allongé sur le canapé, elle allongée sur lui, pile en équilibre, les yeux fermés, des z ; un petit cœur ; ça tient, à peu près.",
         [perso('lui', E(0, x=300, y=318, taille=210, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('elle', E(0, x=310, y=250, taille=170, pose='allonge', expression='dodo', signes=['zzz']), E(2.0, x=320), E(3.4, x=305))],
         meubles=['canape_fond'], objets=[O('lune', 560, 90, 0.5), O('coeur', 320, 130, 0.35, de=2.0, flotte=True)], textes=[BAS('3 h du matin')]),
])

reel('ani-367', 'les deux', 'nous deux quand on essaie de parler sérieusement', lieu='canapé', plans=[
    plan(4, "Le canapé ; les deux assis bien droits, face à face, très sérieux ; en haut s'écrit « bon. on parle. » ; lui prend une grande inspiration ; elle hoche la tête, grave.",
         [SUR_CANAPE('lui', 260, expression='determine', vers=1), SUR_CANAPE('elle', 380, expression='determine', vers=-1)],
         meubles=['canape_fond'], textes=[TITRE('nous deux quand on essaie de parler sérieusement', a=1.6), DIT('« bon, on parle »', de=1.8)]),
    plan(4, "Il commence, sérieux ; elle le regarde ; sa bouche à elle tremble ; elle pouffe ; il fronce les sourcils ; elle se retient, les pattes sur la bouche ; il craque à son tour.",
         [perso('lui', E(0, x=260, y=318, taille=210, pose='assis', expression='determine', bras='tend_d'), E(1.6, expression='agace'), E(3.0, expression='rire')),
          perso('elle', E(0, x=380, y=318, taille=210, pose='assis', expression='determine'), E(0.8, expression='hesite'), E(1.4, expression='rire', bras='bouche'), E(2.4, expression='mort_de_rire', pose='assis'))],
         meubles=['canape_fond']),
    plan(4.5, "Les deux morts de rire, pliés en deux ; ils reprennent leur sérieux, bien droits, en même temps ; une seconde ; et ils repartent en fou rire, l'un sur l'autre ; un petit cœur ; la conversation attendra.",
         [perso('lui', E(0, x=260, y=318, taille=210, pose='assis', expression='mort_de_rire'), E(1.4, expression='determine'), E(2.4, expression='rire', pose='penche_d', x=280)),
          perso('elle', E(0, x=380, y=318, taille=210, pose='assis', expression='mort_de_rire'), E(1.4, expression='determine'), E(2.4, expression='pleure_de_joie', pose='penche_g', x=370))],
         meubles=['canape_fond'], objets=[O('coeur', 325, 150, 0.35, de=3.0, flotte=True)]),
])

reel('ani-369', 'elle', 'toi quand ta personne te garde une place', lieu='tendresse', son='tendre', plans=[
    plan(4, "Le canapé ; elle, assise, une patte posée sur la place d'à côté, la garde ; lui est parti chercher quelque chose ; le chat arrive et vise la place ; elle le repousse, gentiment.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='content', bras='tend_g'), E(2.0, expression='suspicieux', vers=-1), E(2.8, expression='determine'))],
         meubles=['canape_fond'], objets=[O('chat', 150, 345, 0.6, de=1.2, etapes=[{'a': 1.2, 'x': 150}, {'a': 2.4, 'x': 250, 'y': 300}, {'a': 3.2, 'x': 150, 'y': 345}])], textes=[TITRE('toi quand ta personne te garde une place')]),
    plan(4, "Le chat revient à la charge, par l'autre côté ; elle le repousse encore, sans lâcher la place ; le chat, vexé, s'assoit par terre et la fixe ; elle tient bon, la patte toujours posée.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='determine', bras='tend_g'), E(1.4, expression='exaspere'), E(2.8, expression='fier', signes=['etincelles']))],
         meubles=['canape_fond'], objets=[O('chat', 150, 345, 0.6, etapes=[{'a': 0, 'x': 150}, {'a': 1.0, 'x': 260, 'y': 300}, {'a': 1.8, 'x': 150, 'y': 345}])]),
    plan(4.5, "Il revient avec deux tasses, voit la place gardée, et fond ; il s'assoit, elle retire sa patte pile à ce moment-là ; le chat monte sur ses genoux à lui, et tout le monde est content ; un cœur.",
         [perso('lui', entre(150, 0, 1.4, pose='marche', expression='content', bras='tient'), E(1.8, expression='amour', signes=['coeurs']), E(2.4, x=226, y=318, taille=210, pose='assis', expression='content')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='fier', bras='tend_g'), E(2.4, bras='bas', expression='amour'))],
         meubles=['canape_fond'], objets=[O('tasse', 150, 300, 0.5, etapes=[{'a': 1.4, 'x': 150}, {'a': 2.4, 'x': 226, 'y': 290}]), O('tasse', 180, 300, 0.5, etapes=[{'a': 1.4, 'x': 180}, {'a': 2.4, 'x': 414, 'y': 290}]), O('chat', 150, 345, 0.6, etapes=[{'a': 2.4, 'x': 150}, {'a': 3.4, 'x': 226, 'y': 290}]), O('coeur', 320, 160, 0.35, de=3.6, flotte=True)]),
])

reel('ani-370', 'les deux', 'nous deux quand on a la même idée en même temps', lieu='tendresse', plans=[
    plan(4, "Le canapé, un dimanche, les deux s'ennuient ; d'un coup, une ampoule au-dessus de chaque tête, exactement au même moment ; ils se tournent l'un vers l'autre, les yeux ronds.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='ennui'), E(1.8, expression='idee', signes=['ampoule']), E(2.6, expression='surpris', vers=1)),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='ennui'), E(1.8, expression='idee', signes=['ampoule']), E(2.6, expression='surpris', vers=-1))],
         meubles=['canape_fond'], textes=[TITRE('nous deux quand on a la même idée en même temps')], sons=[{'nom': 'tinte', 'a': 1.8}]),
    plan(3.5, "Ils se pointent du doigt en même temps, la bouche ouverte ; ils rient ; ils se lèvent d'un bond ; pas besoin de le dire.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='joie', bras='pointe', vers=1), E(1.2, expression='rire'), E(2.2, x=250, y=380, taille=250, pose='saut', bras='leves')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='joie', bras='pointe', vers=-1), E(1.2, expression='rire'), E(2.2, x=400, y=380, taille=250, pose='saut', bras='leves'))],
         meubles=['canape_fond'], sons=[{'nom': 'saut', 'a': 2.2}]),
    plan(4.5, "Ils attrapent le sac et les clés et sortent en courant par la droite, main dans la main, radieux ; des cœurs derrière eux ; la porte claque ; le canapé est vide.",
         [perso('lui', E(0, x=250, expression='joie', bras='tient'), E(0.6, x=250, angle=90, pose='court'), E(2.4, x=820)),
          perso('elle', E(0, x=400, expression='joie', bras='tient'), E(0.8, x=400, angle=90, pose='court'), E(2.4, x=820))],
         meubles=['canape_fond'], objets=[O('cle', 250, 300, 0.5, etapes=[{'a': 0.6, 'x': 250}, {'a': 2.4, 'x': 820}]), O('sac', 400, 300, 0.7, etapes=[{'a': 0.8, 'x': 400}, {'a': 2.4, 'x': 820}]), O('coeur', 320, 200, 0.35, de=1.4, flotte=True), O('coeur', 420, 170, 0.3, de=2.0, flotte=True)], sons=[{'nom': 'porte', 'a': 2.6}]),
])

reel('ani-371', 'lui', 'toi quand ta personne te montre comment plier les serviettes', lieu='maison', plans=[
    plan(4, "Lui, fier, plie un plaid n'importe comment et le pose sur la pile, les pattes sur les hanches ; elle arrive, regarde la pile, et s'arrête net, choquée, une goutte de sueur.",
         [perso('lui', E(0, x=270, expression='concentre', bras='tient'), E(1.4, bras='tend_d'), E(2.0, bras='hanches', expression='fier', signes=['etincelles'])),
          perso('elle', entre(480, 0.8, 2.2, depuis='droite', expression='content'), E(2.8, expression='choque', signes=['sueur'], vers=-1))],
         objets=[O('couverture', 270, 300, 1.0, etapes=[{'a': 0, 'x': 270}, {'a': 1.4, 'x': 150, 'y': 320}]), O('couverture', 150, 350, 1.0, derriere=True)], textes=[TITRE('toi quand ta personne te montre comment plier les serviettes')]),
    plan(4, "Elle défait le plaid, le replie en quatre gestes précis, très concentrée, et le repose, parfait ; lui regarde, bouche bée, puis prend des notes dans sa tête, des petits points.",
         [perso('elle', E(0, x=480, expression='determine'), marche(480, 260, 0.4, 1.2, expression='determine'), E(1.6, bras='tient', expression='concentre'), E(2.6, bras='tend_g', expression='fier', signes=['etincelles'])),
          perso('lui', E(0, x=270, expression='fier'), E(1.0, x=400, expression='bouche_bee'), E(2.6, expression='pensif', signes=['points']))],
         objets=[O('couverture', 150, 320, 1.0, a=1.6), O('couverture', 260, 300, 1.0, de=1.6, a=2.6), O('couverture', 150, 320, 1.0, de=2.6), O('couverture', 150, 350, 1.0, derriere=True)]),
    plan(4.5, "Il réessaie, la langue sortie, très appliqué ; il pose son plaid sur la pile : tout de travers ; elle sourit, lui tapote la tête, et le replie derrière lui pendant qu'il va chercher le suivant, tout fier.",
         [perso('lui', E(0, x=400, expression='concentre', bras='tient', signes=['sueur']), E(1.2, bras='tend_g'), E(1.8, bras='hanches', expression='fier'), sort(400, 2.6, 3.8, vers='droite', pose='marche', expression='fier')),
          perso('elle', E(0, x=260, expression='content'), E(1.8, bras='tend_d', expression='amour'), E(2.8, bras='tient', expression='concentre'), E(3.8, expression='blase'))],
         objets=[O('couverture', 400, 300, 1.0, etapes=[{'a': 0, 'x': 400}, {'a': 1.2, 'x': 150, 'y': 290}], a=2.8), O('couverture', 150, 320, 1.0), O('couverture', 150, 350, 1.0, derriere=True), O('couverture', 260, 300, 1.0, de=2.8), O('coeur', 300, 170, 0.3, de=2.0, a=3.0, flotte=True)]),
])

reel('ani-372', 'elle', 'toi quand ta personne te réveille en éternuant', lieu='nuit', plans=[
    plan(4, "La nuit, la lune ; le lit ; les deux dorment ; lui fronce le nez dans son sommeil, inspire, inspire ; puis éternue d'un coup, un bond, un point d'exclamation ; elle se réveille en sursaut.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']), E(1.4, expression='hesite', pose='allonge'), E(2.2, pose='debout', bras='aucun', pattes='aucune', y=320, expression='choque', signes=['exclamation']), E(2.5, y=346, expression='soulage')),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']), E(2.4, pose='debout', bras='aucun', pattes='aucune', expression='panique', signes=['exclamation', 'sueurs']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], textes=[TITRE('toi quand ta personne te réveille en éternuant')], sons=[{'nom': 'boing', 'a': 2.2}]),
    plan(4, "Elle le fusille du regard, une veine ; il s'excuse, désolé, les pattes jointes ; elle se recouche en boudant ; il se recouche aussi ; une seconde ; son nez refronce ; il inspire.",
         [perso('elle', AU_LIT(394, expression='furieux', signes=['veine'], vers=-1), E(1.6, pose='allonge', expression='boude', x=420), E(3.4, expression='suspicieux')),
          perso('lui', AU_LIT(248, expression='desole', bras='priere'), E(1.8, pose='allonge', expression='zen', bras='bas'), E(3.0, expression='hesite', pose='allonge'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)]),
    plan(4.5, "Avant qu'il éternue, elle lui plaque l'oreiller sur la figure ; un éternuement étouffé, l'oreiller saute ; elle le garde sur lui, zen, les yeux fermés ; il reste dessous, résigné ; un petit cœur quand même.",
         [perso('elle', E(0, x=420, y=346, taille=200, pose='allonge', expression='suspicieux'), E(0.6, pose='debout', bras='tend_g', pattes='aucune', expression='determine'), E(2.0, expression='zen')),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='hesite'), E(1.2, pose='allonge', expression='surpris'), E(2.6, expression='blase'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('oreiller', 250, 270, 1.0, de=0.6, etapes=[{'a': 1.0, 'y': 270}, {'a': 1.2, 'y': 240}, {'a': 1.5, 'y': 270}]), O('coeur', 330, 190, 0.3, de=3.4, flotte=True)], sons=[{'nom': 'coussin', 'a': 0.7}, {'nom': 'boing', 'a': 1.2}]),
])

reel('ani-373', 'lui', 'toi quand ta personne demande ce que tu veux pour ton anniv', lieu='tendresse', plans=[
    plan(4, "Le canapé ; elle, le téléphone à la patte, lui demande ; en haut s'écrit « tu veux quoi pour ton anniversaire ? » ; lui réfléchit une demi-seconde ; « rien » ; elle est blasée.",
         [SUR_CANAPE('elle', 414, expression='curieux', bras='tient', vers=-1), perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='content'), E(2.2, expression='pensif', signes=['points']), E(3.0, expression='zen'))],
         meubles=['canape_fond'], objets=[O('telephone', 414, 290, 0.5)], textes=[TITRE('toi quand ta personne demande ce que tu veux pour ton anniv', a=1.4), DIT('« tu veux quoi pour ton anniversaire ? »', de=1.6, a=2.9), DIT('« rien »', de=3.1)]),
    plan(4, "Elle insiste, les bras levés ; il hausse les épaules, sincère, l'auréole ; elle le pointe du doigt, méfiante ; il lève le pouce : vraiment rien.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='exaspere', bras='leves'), E(1.6, expression='suspicieux', bras='pointe', vers=-1)),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='ange', signes=['halo']), E(2.4, bras='pouce', expression='content'))],
         meubles=['canape_fond']),
    plan(4.5, "« 10 min plus tard » en bas. Il revient avec une lettre pliée en deux, longue comme le bras, et la lui tend, très fier, des étincelles ; elle déplie, déplie, déplie ; la liste touche le sol ; elle est bouche bée.",
         [perso('lui', entre(226, 0, 1.4, pose='marche', expression='fier', bras='tient', signes=['etincelles']), E(2.0, bras='tend_d')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='attend'), E(2.0, bras='tient', expression='curieux'), E(3.0, expression='bouche_bee'))],
         meubles=['canape_fond'], objets=[O('lettre', 226, 300, 0.6, etapes=[{'a': 1.4, 'x': 226}, {'a': 2.0, 'x': 320}], a=2.6), O('lettre', 414, 290, 0.6, de=2.6, etapes=[{'a': 2.6, 'echelle': 0.6}, {'a': 3.4, 'echelle': 1.2, 'y': 330}])], textes=[BAS('10 min plus tard')]),
])

reel('ani-374', 'lui', 'toi quand ta personne réclame un bisou à chaque passage', lieu='tendresse', plans=[
    plan(4, "Le salon ; elle, assise sur le canapé ; lui traverse la pièce de gauche à droite avec une tasse ; au passage elle tend la joue ; il s'arrête, bisou, et continue ; un petit cœur.",
         [SUR_CANAPE('elle', 414, expression='content'),
          perso('lui', E(0, x=-140, angle=90, pose='marche', expression='content', bras='tient'), E(1.4, x=330, pose='debout'), E(1.7, angle=0, pose='penche_d', expression='bisou'), E(2.2, pose='debout'), E(2.5, angle=90, pose='marche'), E(3.8, x=820))],
         meubles=['canape_fond'], objets=[O('tasse', 330, 300, 0.5, etapes=[{'a': 0, 'x': -140}, {'a': 1.4, 'x': 330}, {'a': 2.5, 'x': 330}, {'a': 3.8, 'x': 820}]), O('coeur', 370, 200, 0.3, de=1.8, a=2.6, flotte=True)], textes=[TITRE('toi quand ta personne réclame un bisou à chaque passage')], sons=[{'nom': 'pop', 'a': 1.8}]),
    plan(4, "Il repasse dans l'autre sens : elle tend la joue ; bisou ; il repasse : la joue ; bisou ; il repasse encore, plus vite, il court presque ; la joue ; bisou ; il commence à fatiguer.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='content'), E(0.8, expression='amour'), E(2.0, expression='joie')),
          perso('lui', E(0, x=820, angle=-90, pose='marche', expression='content'), E(0.8, x=330, pose='debout'), E(1.0, angle=0, pose='penche_d', expression='bisou'), E(1.3, pose='debout', angle=-90), E(1.4, pose='court'), E(2.0, x=-140), E(2.2, x=-140, angle=90, pose='court', expression='fatigue'), E(3.0, x=330, pose='debout'), E(3.2, angle=0, pose='penche_d', expression='bisou'), E(3.6, pose='debout', expression='essouffle', signes=['sueur']))],
         meubles=['canape_fond'], objets=[O('coeur', 370, 200, 0.3, de=1.1, a=1.9, flotte=True), O('coeur', 370, 200, 0.3, de=3.3, flotte=True)], sons=[{'nom': 'pop', 'a': 1.1}, {'nom': 'pop', 'a': 3.3}]),
    plan(4.5, "« 20 passages plus tard » en bas. Il rampe à plat ventre pour traverser le salon sans qu'elle le voie ; elle, sans lever les yeux, tend la joue vers le bas ; il soupire, se redresse, bisou ; elle sourit.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='content', bras='tient'), E(2.0, pose='penche_g', x=390, expression='amour'), E(3.8, expression='joie')),
          perso('lui', E(0, x=-140, pose='rampe', expression='concentre', signes=['sueur']), E(1.8, x=300), E(2.6, expression='blase'), E(3.2, pose='debout', expression='exaspere'), E(3.6, pose='penche_d', expression='bisou'))],
         meubles=['canape_fond'], objets=[O('telephone', 414, 290, 0.5, a=2.0), O('coeur', 370, 200, 0.3, de=3.7, flotte=True)], textes=[BAS('20 passages plus tard')], sons=[{'nom': 'pop', 'a': 3.7}]),
])

reel('ani-375', 'lui', 'toi quand ta personne te laisse dormir le dimanche', lieu='matin', son='tendre', plans=[
    plan(4, "Le matin, le lit ; elle dort profondément, des z ; lui, debout, le doigt sur la bouche, sort du cadre sur la pointe des pattes ; la porte se ferme sans bruit.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('lui', E(0, x=200, expression='chut', bras='bouche'), E(1.0, x=200, angle=-90, pose='marche'), E(2.8, x=-140))],
         meubles=['lit_fond'], textes=[TITRE('toi quand ta personne te laisse dormir le dimanche')]),
    plan(4, "Le salon ; lui range un coussin au ralenti, pose une tasse sans bruit, plie le plaid en retenant son souffle, et marche sur la pointe des pattes pour ne pas faire craquer le sol ; une goutte de sueur.",
         [perso('lui', E(0, x=150, expression='concentre', bras='tient', signes=['sueur']), E(0.6, x=150, angle=90, pose='marche'), E(1.6, x=330, pose='debout'), E(1.9, angle=0, bras='tend_d', expression='chut'), E(2.8, bras='tient', expression='concentre'), E(3.4, bras='tend_g'))],
         meubles=['canape_fond'], objets=[O('coussin', 150, 300, 0.8, etapes=[{'a': 0.6, 'x': 150}, {'a': 1.6, 'x': 330}, {'a': 2.2, 'x': 480, 'y': 290}]), O('tasse', 120, 345, 0.5, a=2.8), O('tasse', 330, 300, 0.5, de=2.8, etapes=[{'a': 3.4, 'x': 330}, {'a': 3.9, 'x': 560, 'y': 345}])]),
    plan(4.5, "« midi » en bas. Elle se réveille, s'étire, et trouve le salon impeccable, une tasse fumante posée près d'elle, et lui qui dort sur le canapé, épuisé, des z ; elle sourit, les yeux en cœur.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='dodo', signes=['zzz'])),
          perso('elle', E(0.6, x=820, angle=-90, pose='marche', expression='baille'), E(2.0, x=480, pose='debout'), E(2.4, angle=0, expression='surpris'), E(3.2, expression='amour', signes=['coeurs']))],
         meubles=['canape_fond'], objets=[O('tasse', 480, 300, 0.5, de=0), O('coussin', 560, 290, 0.8), O('coeur', 320, 170, 0.35, de=3.4, flotte=True)], textes=[BAS('midi')]),
])

reel('ani-376', 'les deux', 'nous deux quand on range enfin les décos de Noël', lieu='maison', plans=[
    plan(4, "Le salon, fin mars, un soleil à la fenêtre ; une étoile de Noël encore accrochée, une bougie, des étincelles qui pendent ; les deux sur le canapé regardent l'étoile, blasés ; « demain » s'écrit en haut.",
         [SUR_CANAPE('lui', 226, expression='blase', vers=1), SUR_CANAPE('elle', 414, expression='blase', vers=-1)],
         meubles=['canape_fond'], objets=[O('soleil', 120, 80, 0.7), O('etoile', 540, 100, 0.8), O('etincelles', 500, 160, 0.5), O('bougie', 560, 290, 0.6)], textes=[TITRE('nous deux quand on range enfin les décos de Noël', a=1.6), DIT('« demain »', de=1.8)]),
    plan(4, "« une semaine plus tard » en bas. L'étoile est toujours là ; les deux debout dessous, un carton à la patte, décidés ; lui tend la patte vers l'étoile ; elle l'arrête : elle est jolie, non ?",
         [perso('lui', E(0, x=300, expression='determine', bras='tient'), E(1.4, bras='tend_d', expression='effort'), E(2.6, expression='surpris', vers=1)),
          perso('elle', E(0, x=470, expression='determine'), E(2.0, bras='tend_g', expression='hesite'), E(3.0, expression='timide'))],
         objets=[O('soleil', 120, 80, 0.7), O('etoile', 540, 100, 0.8), O('etincelles', 500, 160, 0.5), O('caisse', 300, 345, 1.0)], textes=[BAS('une semaine plus tard')]),
    plan(4.5, "« en avril » en bas. L'étoile est toujours accrochée ; les deux sur le canapé, en t-shirt, un ventilateur imaginaire, contents, lèvent les yeux vers elle ; en haut : « on la laisse pour l'année prochaine » ; un cœur.",
         [SUR_CANAPE('lui', 226, expression='content', vers=1), SUR_CANAPE('elle', 414, expression='content', vers=-1)],
         meubles=['canape_fond'], objets=[O('soleil', 120, 80, 0.9), O('etoile', 540, 100, 0.8), O('etincelles', 500, 160, 0.5), O('coeur', 320, 170, 0.35, de=3.0, flotte=True)], textes=[BAS('en avril'), DIT('« on la laisse pour l\'année prochaine »', de=1.4)]),
])

reel('ani-377', 'les deux', 'nous deux quand il fait enfin jour à 19 h', lieu='saisons', son='tendre', plans=[
    plan(4, "« 19 h » en bas. Les deux à la fenêtre, le soleil encore haut dehors ; ils se regardent, émerveillés, les yeux qui brillent : il fait encore jour.",
         [perso('lui', E(0, x=270, expression='surpris', vers=1), E(1.4, expression='emerveille', signes=['etincelles'])), perso('elle', E(0, x=430, expression='surpris', vers=-1), E(1.4, expression='emerveille', signes=['etincelles']))],
         objets=[O('fenetre', 350, 150, 1.6, derriere=True), O('soleil', 390, 130, 0.5, derriere=True)], textes=[TITRE('nous deux quand il fait enfin jour à 19 h', a=1.8), BAS('19 h', de=2.0)]),
    plan(4, "« 20 h » en bas. Dehors, sur un banc, sans manteau, les deux assis au soleil, zen, les yeux fermés ; des oiseaux ; elle pose la tête sur son épaule ; un petit cœur.",
         [perso('lui', E(0, x=290, y=340, taille=220, pose='assis', expression='zen')),
          perso('elle', E(0, x=400, y=340, taille=220, pose='assis', expression='zen'), E(1.8, x=380, pose='penche_g', expression='amour'))],
         objets=[O('banc', 345, 340, 1.6, derriere=True), O('soleil', 540, 100, 0.8), O('arbre', 515, 255, 1.3, derriere=True), O('oiseau', 150, 120, 0.4, de=0.8, etapes=[{'a': 0.8, 'x': 150}, {'a': 3.6, 'x': 420, 'y': 100}]), O('coeur', 345, 190, 0.3, de=2.4, flotte=True)], textes=[BAS('20 h')], ambiance='oiseaux'),
    plan(4.5, "« 21 h » en bas. Le soleil se couche enfin, la lune pointe ; les deux toujours sur le banc, un peu frais maintenant, des frissons, serrés l'un contre l'autre ; ils ne rentrent pas ; des étoiles apparaissent.",
         [perso('lui', E(0, x=290, y=340, taille=220, pose='assis', expression='content'), E(1.6, expression='froid', signes=['frissons']), E(2.8, x=310, expression='amour')),
          perso('elle', E(0, x=380, y=340, taille=220, pose='penche_g', expression='amour'), E(1.6, expression='froid', signes=['frissons']), E(2.8, x=370, expression='content'))],
         objets=[O('banc', 345, 340, 1.6, derriere=True), O('soleil', 540, 100, 0.8, etapes=[{'a': 0, 'y': 100}, {'a': 3.0, 'y': 330}], a=3.0), O('lune', 150, 90, 0.6, de=2.6), O('etoiles', 500, 110, 0.6, de=3.2), O('arbre', 515, 255, 1.3, derriere=True)], textes=[BAS('21 h')], ambiance='grillons'),
])
