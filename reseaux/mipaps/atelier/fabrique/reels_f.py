# Sixième lot : vingt-trois reels, fin février et mars.
from usine import *

CANAPE = dict(y=318, taille=210, pose='assis')


def SUR_CANAPE(nom, x, **k):
    d = dict(CANAPE)
    d.update(k)
    return fixe(nom, x, **d)


reel('ani-307', 'elle', 'toi quand ta personne veut la télécommande', lieu='canapé', plans=[
    plan(4, "Le canapé, la télé ; la télécommande est posée juste à côté de lui, à gauche ; elle, tout à droite, la regarde, puis le regarde, suppliante, la patte tendue ; il ne bouge pas, zen.",
         [SUR_CANAPE('lui', 226, expression='zen'),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='content'), E(1.0, expression='supplie', bras='tend_g', vers=-1), E(2.6, expression='boude'))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('manette', 150, 290, 0.5)], textes=[TITRE('toi quand ta personne veut la télécommande')]),
    plan(4, "Elle s'étire de tout son long vers la télécommande, la patte tendue, en plein effort, des sueurs ; il lui manque un rien ; lui regarde la télé, l'air de ne rien voir, l'auréole.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='determine'), E(0.8, x=350, pose='penche_g', bras='tend_g', expression='effort', signes=['sueurs']), E(2.4, expression='exaspere', signes=['veine'])),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='zen'), E(1.6, expression='ange', signes=['halo']))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('manette', 150, 290, 0.5)]),
    plan(4.5, "Elle lui passe carrément par-dessus, le corps en travers de lui, attrape la télécommande et se rassoit de l'autre côté, fière ; lui, écrasé au passage, les yeux en croix, puis blasé.",
         [perso('elle', E(0, x=350, y=318, taille=210, pose='penche_g', expression='determine'), E(0.8, x=240, y=240, taille=180, pose='allonge', expression='effort'), E(1.8, x=130, y=318, taille=210, pose='assis', expression='fier', bras='tient', signes=['etincelles'])),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='ange'), E(0.9, expression='ko', signes=['tourbillon']), E(2.8, expression='blase'))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('manette', 150, 290, 0.5, a=1.8), O('manette', 130, 290, 0.5, de=1.8)]),
])

reel('ani-308', 'elle', 'toi quand ta personne te dit « t\'es belle » au réveil', lieu='matin', son='tendre', plans=[
    plan(4, "Le matin, le lit ; elle se réveille, fatiguée, les yeux à moitié fermés, une bulle au nez ; lui, à côté, déjà réveillé, la regarde avec des cœurs dans les yeux ; en haut : « t'es belle ».",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo'), E(0.8, pose='debout', bras='aucun', pattes='aucune', expression='fatigue', signes=['bulle_nez'])),
          perso('lui', AU_LIT(248, expression='amour', vers=1, signes=['coeurs']))],
         meubles=['lit_fond'], textes=[TITRE('toi quand ta personne te dit « t\'es belle » au réveil', a=1.8), DIT('« t\'es belle »', de=2.0)]),
    plan(4, "Elle, surprise, puis touchée, les joues roses ; elle attrape son téléphone pour se regarder ; son visage se fige : choc, un point d'exclamation ; elle regarde lui, puis l'écran, puis lui.",
         [perso('elle', AU_LIT(394, expression='surpris'), E(0.8, expression='timide', signes=['rougeur_pleine']), E(1.6, bras='tient', expression='curieux'), E(2.4, expression='choque', signes=['exclamation']), E(3.2, vers=-1, expression='perplexe')),
          perso('lui', AU_LIT(248, expression='amour', vers=1))],
         meubles=['lit_fond'], objets=[O('telephone', 394, 290, 0.5, de=1.6)]),
    plan(4.5, "Elle lui montre l'écran, la mine défaite ; il regarde, et ses yeux restent des cœurs ; elle éclate de rire, lui jette l'oreiller dessus, et vient se blottir contre lui ; des cœurs.",
         [perso('elle', AU_LIT(394, expression='blase', bras='tend_g'), E(1.2, expression='rire', bras='aucun'), E(2.4, x=330, pose='penche_g', expression='amour')),
          perso('lui', AU_LIT(248, expression='amour', vers=1, signes=['coeurs']), E(1.6, expression='surpris'), E(2.4, expression='calin'))],
         meubles=['lit_fond'], objets=[O('telephone', 360, 290, 0.5, a=1.2), O('oreiller', 300, 260, 0.9, de=1.4, a=2.2)] + COEURS(300, 150, de=2.8), sons=[{'nom': 'coussin', 'a': 1.6}]),
])

reel('ani-309', 'lui', 'toi quand ta personne refuse de demander le chemin', lieu='dehors', plans=[
    plan(4, "Dehors, un panneau fléché ; lui marche d'un pas décidé vers la droite, elle le suit ; il s'arrête, regarde autour, repart dans l'autre sens, toujours décidé ; elle le suit, blasée.",
         [perso('lui', E(0, x=-140, angle=90, pose='marche', expression='determine'), E(1.4, x=380, pose='debout'), E(1.7, angle=-90, pose='marche'), E(3.2, x=160, pose='debout'), E(3.5, angle=0)),
          perso('elle', E(0, x=-260, angle=90, pose='marche', expression='content'), E(1.4, x=260, pose='debout'), E(1.9, angle=-90, pose='marche', expression='blase'), E(3.2, x=40, pose='debout'), E(3.5, angle=0))],
         objets=[O('panneau_fleche', 540, 260, 1.4, derriere=True)], textes=[TITRE('toi quand ta personne refuse de demander le chemin')]),
    plan(4, "« 20 min plus tard » en bas. Ils repassent devant le même panneau ; elle le pointe du doigt ; lui fait non de la tête, fier, et repart dans un troisième sens ; elle s'assoit par terre.",
         [perso('lui', E(0, x=160, expression='determine', bras='hanches'), E(1.2, expression='fier', signes=['etincelles']), E(1.6, x=160, angle=90, pose='marche'), E(3.2, x=600, pose='debout')),
          perso('elle', E(0, x=40, expression='blase', bras='pointe'), E(1.4, expression='exaspere', signes=['veine']), E(2.4, pose='assis', expression='ennui', bras='bas'))],
         objets=[O('panneau_fleche', 540, 260, 1.4, derriere=True)], textes=[BAS('20 min plus tard')]),
    plan(4.5, "Elle se lève, lit le panneau, et part tranquillement dans la bonne direction, vers la gauche ; lui revient en courant, honteux, et la suit à petits pas, la tête basse.",
         [perso('elle', E(0, x=40, pose='assis', expression='ennui'), E(0.6, pose='debout', expression='determine'), E(1.0, x=40, angle=90, pose='marche'), E(2.0, x=300, pose='debout'), E(2.3, angle=-90, pose='marche', expression='content'), E(4.2, x=-140)),
          perso('lui', E(0, x=600, expression='determine'), E(1.6, expression='honte', signes=['rougeur_pleine']), E(2.0, x=600, angle=-90, pose='court'), E(3.2, x=200, pose='marche'), E(4.4, x=-140))],
         objets=[O('panneau_fleche', 540, 260, 1.4, derriere=True)]),
])

reel('ani-310', 'les deux', 'nous deux au premier rayon de soleil', lieu='saisons', son='tendre', plans=[
    plan(4, "Dehors, un banc, un arbre, un grand soleil ; les deux sortent en courant par la gauche, les bras levés, les yeux fermés de bonheur, et s'arrêtent face au soleil.",
         [perso('lui', E(0, x=-140, angle=90, pose='court', expression='joie', bras='leves'), E(1.6, x=260, pose='debout'), E(2.0, angle=0, expression='zen', bras='leves')),
          perso('elle', E(0.2, x=-140, angle=90, pose='court', expression='joie', bras='leves'), E(1.8, x=430, pose='debout'), E(2.2, angle=0, expression='zen', bras='leves'))],
         objets=[O('soleil', 540, 80, 0.9), O('arbre', 515, 255, 1.3, derriere=True), O('banc', 340, 340, 1.4, derriere=True)], textes=[TITRE('nous deux au premier rayon de soleil')], ambiance='oiseaux'),
    plan(4, "Assis sur le banc, les yeux fermés, le visage tourné vers le soleil, zen ; elle pose la tête sur son épaule ; un petit cœur ; un oiseau passe.",
         [perso('lui', E(0, x=290, y=340, taille=220, pose='assis', expression='zen')),
          perso('elle', E(0, x=400, y=340, taille=220, pose='assis', expression='zen'), E(2.0, x=380, pose='penche_g', expression='amour'))],
         objets=[O('soleil', 540, 80, 0.9), O('arbre', 515, 255, 1.3, derriere=True), O('banc', 345, 340, 1.6, derriere=True), O('oiseau', 150, 120, 0.5, de=1.0, etapes=[{'a': 1.0, 'x': 150}, {'a': 3.8, 'x': 450, 'y': 100}]), O('coeur', 345, 190, 0.35, de=2.4, flotte=True)], ambiance='oiseaux'),
    plan(4.5, "Un nuage arrive devant le soleil ; la pluie tombe ; les deux ouvrent un œil, regardent le ciel, blasés, puis se regardent ; ils restent là, sous la pluie, serrés ; c'est le premier beau jour quand même.",
         [perso('lui', E(0, x=290, y=340, taille=220, pose='assis', expression='zen'), E(1.6, expression='blase', vers=1), E(3.0, expression='content')),
          perso('elle', E(0, x=380, y=340, taille=220, pose='penche_g', expression='amour'), E(1.6, expression='blase', vers=-1), E(3.0, expression='rire'))],
         objets=[O('soleil', 540, 80, 0.9), O('nuage', 500, 80, 1.1, de=0.4, etapes=[{'a': 0.4, 'x': 700}, {'a': 1.2, 'x': 500}]), O('pluie', 345, 180, 1.0, de=1.4), O('arbre', 515, 255, 1.3, derriere=True), O('banc', 345, 340, 1.6, derriere=True), O('coeur', 345, 250, 0.3, de=3.4, flotte=True)], ambiance='pluie'),
])

reel('ani-311', 'les deux', 'nous deux quand on lance le ménage de printemps', lieu='maison', plans=[
    plan(4, "Un carton, un pull, un sac, une écharpe, un bonnet par terre ; les deux debout, décidés, les pattes sur les hanches ; en haut s'écrit « aujourd'hui on fait tout ».",
         [fixe('lui', 250, expression='determine', bras='hanches', signes=['etincelles']), fixe('elle', 430, expression='determine', bras='hanches', signes=['etincelles'])],
         objets=[O('caisse', 120, 345, 1.0), O('pull', 340, 360, 0.7), O('sac', 560, 345, 0.7), O('echarpe', 480, 365, 0.7)], textes=[TITRE('nous deux quand on lance le ménage de printemps', a=1.6), DIT('« aujourd\'hui on fait tout »', de=1.8)]),
    plan(4, "« 20 min plus tard » en bas. Elle trouve une vieille lettre dans le carton et s'assoit pour la lire, émue ; il vient voir, s'assoit à côté ; ils lisent ensemble, les yeux brillants.",
         [perso('elle', E(0, x=430, expression='concentre', bras='tend_g'), E(0.8, x=200, pose='assis', expression='emu', bras='tient')),
          perso('lui', E(0, x=250, expression='effort', bras='tient'), E(1.4, expression='curieux', vers=-1), E(2.0, x=320, pose='assis', expression='emu', bras='bas'))],
         objets=[O('caisse', 120, 345, 1.0), O('lettre', 200, 300, 0.5, de=0.8), O('pull', 340, 360, 0.7, a=1.4), O('pull', 250, 300, 0.7, de=0, a=1.4), O('sac', 560, 345, 0.7), O('echarpe', 480, 365, 0.7)], textes=[BAS('20 min plus tard')]),
    plan(4.5, "« 3 h plus tard » en bas. Rien n'a bougé : le pull, le sac, l'écharpe sont toujours par terre ; les deux assis au milieu, entourés de lettres et de photos, morts de rire ; un petit cœur.",
         [perso('lui', E(0, x=270, pose='assis', expression='rire', bras='tient'), E(2.4, expression='emu')),
          perso('elle', E(0, x=400, pose='assis', expression='mort_de_rire', bras='tient'), E(2.4, expression='amour'))],
         objets=[O('caisse', 120, 345, 1.0), O('pull', 500, 360, 0.7), O('sac', 560, 300, 0.7), O('lettre', 270, 300, 0.5), O('lettre', 400, 300, 0.5), O('coeur', 335, 170, 0.35, de=2.8, flotte=True)], textes=[BAS('3 h plus tard')]),
])

reel('ani-312', 'lui', 'toi quand ta personne raconte un ragot sur quelqu\'un', lieu='canapé', plans=[
    plan(4, "Le canapé ; elle, penchée vers lui, raconte tout bas, le doigt sur la bouche, choquée, des petits points partout ; lui écoute, les yeux ronds.",
         [perso('elle', E(0, x=400, y=318, taille=210, pose='assis', expression='chut', bras='bouche', vers=-1), E(1.4, expression='choque', bras='joues'), E(2.8, expression='malicieux', signes=['points'])),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='ecoute', vers=1), E(2.0, expression='surpris'))],
         meubles=['canape_fond'], textes=[TITRE('toi quand ta personne raconte un ragot sur quelqu\'un')]),
    plan(4, "Elle continue, scandalisée, puis morte de rire ; lui fait de grands yeux, hoche la tête, choqué lui aussi, très impliqué ; un point d'interrogation apparaît discrètement au-dessus de lui.",
         [perso('elle', E(0, x=400, y=318, taille=210, pose='assis', expression='furieux', bras='leves'), E(1.6, expression='rire', bras='joues'), E(3.0, expression='choque')),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='choque', signes=['exclamation']), E(1.6, expression='bravo', bras='applaudit'), E(2.6, expression='confus', signes=['question']))],
         meubles=['canape_fond']),
    plan(4.5, "Elle finit, satisfaite, et attend sa réaction ; il hésite, puis demande ; en haut s'écrit « ... et c'est qui, déjà ? » ; elle se fige, une veine, et lui jette le coussin dessus.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='hesite'), E(2.8, expression='peur', bras='visage')),
          perso('elle', E(0, x=400, y=318, taille=210, pose='assis', expression='fier'), E(1.6, expression='bouche_bee'), E(2.4, expression='furieux', signes=['veine'], bras='tend_g'))],
         meubles=['canape_fond'], objets=[O('coussin', 460, 290, 0.8, a=2.4), O('coussin', 460, 290, 0.8, de=2.4, etapes=[{'a': 2.4, 'x': 460}, {'a': 2.9, 'x': 240, 'y': 220}])], textes=[DIT('« ... et c\'est qui, déjà ? »', de=0.6)], sons=[{'nom': 'coussin', 'a': 2.9}]),
])

reel('ani-313', 'lui', 'toi quand tu veux te lever sans réveiller ta personne', lieu='nuit', plans=[
    plan(4, "La nuit, la lune ; le lit ; elle dort, à moitié sur lui ; lui, les yeux grands ouverts, a envie de se lever ; il regarde la porte, puis elle, puis réfléchit, des petits points.",
         [perso('elle', E(0, x=330, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('lui', AU_LIT(260, expression='attend'), E(1.2, expression='pensif', signes=['points']), E(2.6, expression='determine'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], textes=[TITRE('toi quand tu veux te lever sans réveiller ta personne')]),
    plan(4, "Il rampe hors du lit au ralenti, à plat ventre, centimètre par centimètre, une goutte de sueur, le doigt sur la bouche ; elle bouge dans son sommeil ; il se fige, l'auréole.",
         [perso('lui', E(0, x=260, y=346, taille=200, pose='rampe', expression='concentre', signes=['sueur']), E(2.0, x=150, y=380, taille=240), E(2.4, expression='ange', signes=['halo'], pose='rampe'), E(3.4, x=100)),
          perso('elle', E(0, x=330, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']), E(2.2, x=350), E(3.0, signes=['zzz']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)]),
    plan(4.5, "Il est presque à la porte, toujours à plat ventre ; elle, dans le lit, ouvre un œil, le regarde ramper, blasée ; en haut : « tu fais quoi ? » ; il se fige, puis fait semblant de dormir par terre.",
         [perso('lui', E(0, x=100, pose='rampe', expression='concentre'), E(1.2, x=70), E(2.4, expression='surpris', signes=['exclamation']), E(3.2, pose='allonge', expression='dodo', signes=['zzz', 'halo'])),
          perso('elle', E(0, x=350, y=346, taille=200, pose='allonge', expression='dodo'), E(1.6, pose='debout', bras='aucun', pattes='aucune', expression='blase', vers=-1))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('porte', 40, 230, 1.6, derriere=True)], textes=[DIT('« tu fais quoi ? »', de=2.0)]),
])

reel('ani-314', 'elle', 'toi quand ta personne regarde un film d\'horreur', lieu='canapé', plans=[
    plan(4, "Le canapé, la télé, la lumière éteinte, la lune à la fenêtre ; lui regarde l'écran, captivé ; elle, à côté, se cache déjà derrière le coussin, les yeux qui dépassent.",
         [SUR_CANAPE('lui', 226, expression='curieux'),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='inquiet'), E(1.4, expression='peur', bras='tient'))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('lune', 560, 90, 0.5), O('coussin', 414, 290, 0.9, de=1.4)], textes=[TITRE('toi quand ta personne regarde un film d\'horreur')]),
    plan(4, "Un sursaut à l'écran : elle bondit derrière lui et se cache dans son dos, tremblante ; lui, surpris, puis fier de la protéger, bombe le torse.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='peur', bras='tient'), E(0.8, expression='panique', signes=['exclamation']), E(1.4, x=280, y=300, taille=160, pose='boule', expression='peur', signes=['tremblement'])),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='curieux'), E(1.2, expression='surpris'), E(2.4, expression='fier', bras='hanches', signes=['etincelles']))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('lune', 560, 90, 0.5), O('coussin', 480, 340, 0.9)], sons=[{'nom': 'tonnerre', 'a': 0.7}]),
    plan(4.5, "Un deuxième sursaut : cette fois c'est lui qui hurle en silence, les yeux en croix ; les deux finissent sous le plaid, seuls les yeux dehors, serrés, tremblants, devant l'écran qu'ils regardent quand même.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='fier', bras='hanches'), E(0.8, expression='panique', signes=['exclamation', 'sueurs'], bras='bas'), E(1.6, x=280, expression='peur', pose='boule', taille=190)),
          perso('elle', E(0, x=280, y=300, taille=160, pose='boule', expression='peur'), E(1.6, x=370, y=318, taille=190, expression='peur', signes=['tremblement']))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('lune', 560, 90, 0.5), O('couverture', 325, 300, 2.6, de=1.8)], sons=[{'nom': 'tonnerre', 'a': 0.6}]),
])

reel('ani-315', 'lui', 'toi quand ta personne dit « je ronfle pas »', lieu='nuit', plans=[
    plan(4, "Le matin, le lit ; elle, les yeux cernés, le pointe du doigt ; lui, outré, les pattes sur les hanches ; en haut s'écrit « je ronfle pas ! » ; elle lève les yeux au ciel.",
         [perso('elle', AU_LIT(394, expression='fatigue', bras='pointe', vers=-1), E(2.8, expression='blase')),
          perso('lui', AU_LIT(248, expression='vexe'), E(1.4, expression='furieux', signes=['veine']))],
         meubles=['lit_fond'], textes=[TITRE('toi quand ta personne dit « je ronfle pas »', a=1.6), DIT('« je ronfle pas ! »', de=1.8)]),
    plan(4, "« la nuit suivante » en bas. La lune ; il dort, des notes de musique énormes sortent de lui ; elle, réveillée, sort son téléphone et enregistre, un petit sourire en coin.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['bulle_nez'])),
          perso('elle', AU_LIT(394, expression='exaspere'), E(1.2, expression='malicieux', bras='tient'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('musique', 200, 200, 0.7, de=0.3, a=1.5, flotte=True), O('musique', 230, 170, 0.9, de=1.4, a=2.6, flotte=True), O('musique', 190, 190, 0.8, de=2.5, flotte=True), O('telephone', 394, 290, 0.5, de=1.2)],
         textes=[BAS('la nuit suivante')]),
    plan(4.5, "« le matin » en bas. Elle lui tend le téléphone, le son à fond : des notes sortent de l'écran ; il écoute, bouche bée, puis rouge, puis mort de honte, en boule ; elle, très fière.",
         [perso('elle', E(0, x=430, expression='fier', bras='tend_g', signes=['etincelles'])),
          perso('lui', E(0, x=250, expression='curieux'), E(1.2, expression='bouche_bee'), E(2.2, expression='gene', signes=['rougeur_pleine']), E(3.2, pose='boule', expression='honte'))],
         objets=[O('telephone', 350, 300, 0.6), O('musique', 350, 230, 0.5, de=0.5, a=1.5, flotte=True), O('musique', 330, 210, 0.6, de=1.4, a=2.6, flotte=True)], textes=[BAS('le matin')]),
])

reel('ani-316', 'les deux', 'nous deux quand on a « bien fermé la porte »', lieu='sortir', plans=[
    plan(4, "La porte à droite ; les deux sortent, elle devant avec la valise, lui derrière avec les clés ; il tire la porte, la secoue, vérifie, content ; ils partent vers la gauche.",
         [perso('elle', E(0, x=400, expression='content', bras='tient'), E(1.2, x=400, angle=-90, pose='marche'), E(3.0, x=-140)),
          perso('lui', E(0, x=520, expression='concentre', bras='tend_d'), E(1.0, expression='content', bras='tient'), E(1.6, x=520, angle=-90, pose='marche'), E(3.6, x=-140))],
         objets=[O('porte', 600, 230, 1.6, derriere=True), O('valise', 400, 310, 0.9, etapes=[{'a': 1.2, 'x': 400}, {'a': 3.0, 'x': -140}]), O('cle', 520, 300, 0.5, etapes=[{'a': 1.6, 'x': 520}, {'a': 3.6, 'x': -140}])],
         textes=[TITRE('nous deux quand on a « bien fermé la porte »')], sons=[{'nom': 'porte', 'a': 0.4}, {'nom': 'porte', 'a': 0.8}]),
    plan(4, "« au bout de la rue » en bas. Ils marchent ; elle s'arrête net, les yeux ronds ; en haut : « t'as fermé ? » ; lui s'arrête aussi, sûr de lui, puis moins sûr, une goutte de sueur.",
         [perso('elle', E(0, x=-140, angle=90, pose='marche', expression='content', bras='tient'), E(1.4, x=260, pose='debout'), E(1.8, angle=0, expression='surpris', signes=['exclamation'])),
          perso('lui', E(0, x=-260, angle=90, pose='marche', expression='content'), E(1.4, x=140, pose='debout'), E(1.8, angle=0, expression='fier'), E(2.8, expression='nerveux', signes=['sueur']), E(3.4, expression='panique'))],
         objets=[O('arbre', 515, 255, 1.3, derriere=True), O('valise', 260, 310, 0.9, etapes=[{'a': 0, 'x': -140}, {'a': 1.4, 'x': 260}])], textes=[BAS('au bout de la rue'), DIT('« t\'as fermé ? »', de=2.0)]),
    plan(4.5, "Les deux repartent en sprint vers la droite, la valise qui traîne ; devant la porte : elle est fermée ; lui, les pattes sur les hanches, triomphant ; elle, essoufflée, le fusille du regard.",
         [perso('lui', E(0, x=140, angle=90, pose='sprint', expression='panique'), E(1.6, x=460, pose='debout'), E(2.0, angle=0, expression='concentre', bras='tend_d'), E(2.8, expression='triomphe', bras='hanches', signes=['etincelles'])),
          perso('elle', E(0, x=260, angle=90, pose='sprint', expression='panique', bras='tient'), E(1.8, x=340, pose='debout'), E(2.2, angle=0, expression='essouffle', signes=['sueurs']), E(3.2, expression='furieux', signes=['veine']))],
         objets=[O('porte', 600, 230, 1.6, derriere=True), O('valise', 340, 310, 0.9, etapes=[{'a': 0, 'x': 260}, {'a': 1.8, 'x': 340}])], sons=[{'nom': 'porte', 'a': 2.2}]),
])

reel('ani-317', 'lui', 'toi quand ta personne a la musique à fond dans son casque', lieu='canapé', son='tendre', plans=[
    plan(4, "Le canapé ; lui, le casque sur les oreilles, chante à tue-tête sans s'entendre, des notes partout ; elle, à côté, lit, blasée, se bouche une oreille.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='chante', signes=['notes']), E(2.0, expression='joie', bras='leves')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='blase', bras='tient'), E(1.6, expression='exaspere', bras='oreilles_bouchees'))],
         meubles=['canape_fond'], objets=[O('casque', 226, 160, 0.9), O('livre', 414, 290, 0.6, a=1.6), O('musique', 300, 120, 0.6, de=0.3, flotte=True), O('musique', 150, 170, 0.5, de=1.0, flotte=True)],
         textes=[TITRE('toi quand ta personne a la musique à fond dans son casque')]),
    plan(4, "Elle se glisse jusqu'à lui et tire un côté du casque vers son oreille ; il sursaute, surpris ; elle écoute ; son visage change : elle aime ; elle se colle à lui pour écouter.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='exaspere'), E(0.8, x=320, bras='tend_g', expression='malicieux'), E(2.0, expression='surpris'), E(2.8, expression='emerveille', signes=['etincelles'])),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='joie'), E(1.2, expression='surpris', signes=['exclamation']), E(2.4, expression='content', vers=1))],
         meubles=['canape_fond'], objets=[O('casque', 270, 160, 0.9, etapes=[{'a': 0, 'x': 226}, {'a': 1.0, 'x': 270}]), O('musique', 300, 100, 0.6, de=0.3, flotte=True)]),
    plan(4.5, "Les deux têtes collées sous le même casque, les yeux fermés, ils chantent ensemble sans s'entendre, des notes partout, et balancent en rythme ; un cœur monte.",
         [perso('lui', E(0, x=270, y=318, taille=210, pose='assis', expression='chante', signes=['notes']), E(1.2, pose='penche_d'), E(2.4, pose='assis'), E(3.6, pose='penche_d')),
          perso('elle', E(0, x=350, y=318, taille=210, pose='assis', expression='chante', signes=['notes']), E(1.2, pose='penche_g'), E(2.4, pose='assis'), E(3.6, pose='penche_g'))],
         meubles=['canape_fond'], objets=[O('casque', 310, 160, 1.1), O('musique', 200, 130, 0.6, de=0.3, flotte=True), O('musique', 440, 120, 0.5, de=1.0, flotte=True), O('coeur', 310, 90, 0.35, de=2.0, flotte=True)]),
])

reel('ani-318', 'elle', 'toi quand ta personne demande « et si j\'étais un ver ? »', lieu='tendresse', plans=[
    plan(4.5, "Le lit, le soir ; elle, très sérieuse, se tourne vers lui ; en haut s'écrit la question : « tu m'aimerais si j'étais un ver ? » ; lui, qui allait dormir, ouvre un œil, confus.",
         [perso('elle', AU_LIT(394, expression='content'), E(1.0, expression='determine', vers=-1)),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo'), E(2.6, pose='debout', bras='aucun', pattes='aucune', expression='confus', signes=['question']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], textes=[TITRE('toi quand ta personne demande « et si j\'étais un ver ? »', a=1.4), DIT('« tu m\'aimerais si j\'étais un ver ? »', de=1.6)]),
    plan(4, "Il réfléchit, des petits points, sérieusement ; elle attend, les bras croisés ; il hésite, une goutte de sueur ; en haut s'écrit « ... oui ? » ; elle plisse les yeux.",
         [perso('lui', AU_LIT(248, expression='pensif', signes=['points']), E(1.4, expression='hesite', signes=['sueur']), E(3.2, expression='timide')),
          perso('elle', AU_LIT(394, expression='attend', bras='croises', vers=-1), E(3.2, expression='suspicieux'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], textes=[DIT('« hmm, oui ? »', de=2.4)]),
    plan(4.5, "En haut : « t'as hésité. » ; elle lui tourne le dos et boude, le nuage noir ; lui, paniqué, supplie, les pattes jointes ; il finit par lui faire un câlin par-derrière ; elle boude encore, mais sourit un peu.",
         [perso('elle', AU_LIT(394, expression='suspicieux'), E(0.8, x=430, expression='boude', vers=1, signes=['nuage_noir']), E(3.6, expression='narquois')),
          perso('lui', AU_LIT(248, expression='timide'), E(1.0, expression='panique', signes=['sueurs']), E(1.8, bras='priere', expression='supplie'), E(2.8, x=340, bras='tend_d', pose='penche_d', expression='calin'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('coeur', 390, 190, 0.3, de=3.6, flotte=True)], textes=[DIT('« t\'as hésité. »', de=0.3)]),
])

reel('ani-319', 'elle', 'toi quand ta personne lit par-dessus ton épaule', lieu='téléphone', plans=[
    plan(4, "Le canapé ; lui tape un message sur son téléphone, concentré ; elle arrive derrière lui, se penche, et lit par-dessus son épaule, curieuse, l'air de rien.",
         [SUR_CANAPE('lui', 300, expression='concentre', bras='tient'),
          perso('elle', E(0.3, x=820, y=380, angle=-90, pose='marche', expression='content'), E(1.6, x=470, pose='debout'), E(2.0, angle=0), E(2.4, x=420, y=318, taille=210, pose='penche_g', expression='curieux', vers=-1))],
         meubles=['canape_fond'], objets=[O('telephone', 300, 290, 0.5)], textes=[TITRE('toi quand ta personne lit par-dessus ton épaule')]),
    plan(4, "Il sent un regard, se tourne, elle regarde ailleurs en sifflant, l'auréole ; il reprend ; elle se repenche aussitôt ; il se retourne ; elle siffle ; de plus en plus vite.",
         [perso('lui', E(0, x=300, y=318, taille=210, pose='assis', expression='suspicieux', vers=1, bras='tient'), E(0.8, expression='concentre', vers=-1), E(1.8, expression='suspicieux', vers=1), E(2.6, expression='concentre', vers=-1), E(3.2, expression='exaspere', vers=1)),
          perso('elle', E(0, x=420, y=318, taille=210, pose='assis', expression='chante', signes=['halo']), E(0.8, pose='penche_g', expression='curieux'), E(1.8, pose='assis', expression='chante', signes=['halo']), E(2.6, pose='penche_g', expression='curieux'), E(3.2, pose='assis', expression='ange', signes=['halo']))],
         meubles=['canape_fond'], objets=[O('telephone', 300, 290, 0.5)]),
    plan(4.5, "Il tape une dernière phrase et lui tend le téléphone ; en haut s'écrit ce qu'il a écrit : « elle lit par-dessus mon épaule, là. » ; elle lit, se fige, bouche bée, puis lui jette le coussin.",
         [perso('lui', E(0, x=300, y=318, taille=210, pose='assis', expression='malicieux', bras='tient'), E(1.6, bras='tend_d', expression='fier'), E(3.6, expression='peur', bras='visage')),
          perso('elle', E(0, x=420, y=318, taille=210, pose='assis', expression='ange'), E(1.8, expression='curieux', vers=-1), E(2.6, expression='bouche_bee'), E(3.4, expression='furieux', bras='tend_g', signes=['veine']))],
         meubles=['canape_fond'], objets=[O('telephone', 360, 290, 0.5), O('coussin', 500, 290, 0.8, de=3.3, etapes=[{'a': 3.3, 'x': 500}, {'a': 3.9, 'x': 300, 'y': 220}])], textes=[DIT('« elle lit par-dessus mon épaule, là. »', de=0.4)], sons=[{'nom': 'coussin', 'a': 3.9}]),
])

reel('ani-320', 'les deux', 'nous deux quand on tombe malades en même temps', lieu='maison', plans=[
    plan(4, "Le lit ; les deux allongés, malades, le nez rouge, une boîte de mouchoirs entre eux ; ils se regardent, pitoyables ; chacun attend que l'autre se lève.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='malade', signes=['sueur']), E(2.0, vers=1, expression='supplie')),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='malade', signes=['sueur']), E(2.4, vers=-1, expression='supplie'))],
         meubles=['lit_fond'], objets=[O('mouchoirs', 320, 300, 0.6)], textes=[TITRE('nous deux quand on tombe malades en même temps')]),
    plan(4, "Il se redresse, décidé, pour aller chercher une tasse ; il retombe ; elle se redresse à son tour ; elle retombe ; ils se regardent, les yeux humides, deux fontaines de larmes.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='malade'), E(0.6, pose='debout', bras='aucun', pattes='aucune', expression='determine'), E(1.4, pose='allonge', expression='ko'), E(3.0, expression='sanglote', signes=['fontaines'])),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='malade'), E(1.8, pose='debout', bras='aucun', pattes='aucune', expression='determine'), E(2.4, pose='allonge', expression='ko'), E(3.2, expression='sanglote', signes=['fontaines']))],
         meubles=['lit_fond'], objets=[O('mouchoirs', 320, 300, 0.6)], sons=[{'nom': 'coussin', 'a': 1.4}, {'nom': 'coussin', 'a': 2.4}]),
    plan(4.5, "« 2 h plus tard » en bas. Les deux dorment collés au milieu du lit, le nez rouge, la boîte de mouchoirs sur la tête de lui, des z ; un petit cœur malgré tout.",
         [perso('lui', E(0, x=290, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('elle', E(0, x=360, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']))],
         meubles=['lit_fond'], objets=[O('mouchoirs', 290, 250, 0.6), O('coeur', 325, 190, 0.35, de=2.0, flotte=True)], textes=[BAS('2 h plus tard')]),
])

reel('ani-321', 'lui', 'toi quand c\'est toi qui es prête en premier', lieu='sortir', plans=[
    plan(4, "La porte à droite ; elle, prête, un sac à la patte, attend, les bras croisés ; lui passe en courant dans un sens avec une seule chaussette, puis dans l'autre sens avec le pull à moitié mis.",
         [perso('elle', E(0, x=500, expression='attend', bras='tient'), E(2.4, expression='blase')),
          perso('lui', E(0, x=-140, angle=90, pose='court', expression='panique'), E(1.4, x=380, pose='debout'), E(1.7, angle=-90, pose='court'), E(3.2, x=-140))],
         objets=[O('porte', 600, 230, 1.6, derriere=True), O('sac', 500, 300, 0.7), O('chaussettes', 240, 300, 0.5, etapes=[{'a': 0, 'x': -140}, {'a': 1.4, 'x': 380}, {'a': 1.7, 'x': 380}, {'a': 3.2, 'x': -140}])],
         textes=[TITRE('toi quand c\'est toi qui es prête en premier')]),
    plan(4, "« 10 min plus tard » en bas. Elle, assise par terre contre la porte, le téléphone à la patte ; lui repasse encore, les clés enfin, mais sans son bonnet ; il repart.",
         [perso('elle', E(0, x=500, pose='assis', expression='ennui', bras='tient')),
          perso('lui', E(0.3, x=-140, angle=90, pose='court', expression='concentre', bras='tient'), E(1.6, x=380, pose='debout'), E(2.0, angle=0, expression='surpris', signes=['exclamation']), E(2.4, angle=-90, pose='court'), E(3.6, x=-140))],
         objets=[O('porte', 600, 230, 1.6, derriere=True), O('telephone', 500, 300, 0.5), O('cle', 380, 300, 0.5, de=1.6, a=2.4)], textes=[BAS('10 min plus tard')]),
    plan(4.5, "« 20 min plus tard » en bas. Il arrive enfin, fier, bonnet, écharpe, clés ; elle se lève, le regarde de haut en bas, et pointe ses pattes : il a oublié ses chaussures ; il baisse les yeux.",
         [perso('lui', entre(330, 0, 1.6, pose='marche', expression='fier', bras='tient'), E(2.2, bras='hanches', signes=['etincelles']), E(3.4, expression='honte', vers=1, bras='bas', signes=['rougeur_pleine'])),
          perso('elle', E(0, x=500, pose='assis', expression='ennui'), E(1.6, pose='debout', expression='blase'), E(2.6, bras='pointe', expression='narquois', vers=-1))],
         objets=[O('porte', 600, 230, 1.6, derriere=True), O('bonnet', 330, 165, 0.9, de=0, etapes=[{'a': 0, 'x': -140}, {'a': 1.6, 'x': 330}]), O('cle', 330, 300, 0.5, de=0, etapes=[{'a': 0, 'x': -140}, {'a': 1.6, 'x': 330}])],
         textes=[BAS('20 min plus tard')]),
])

reel('ani-322', 'lui', 'toi quand ta personne refuse d\'aller chez le médecin', lieu='maison', plans=[
    plan(4, "Lui, malade, le nez rouge, sur le canapé, les mouchoirs ; elle, debout, pointe la porte ; il fait non de la tête, décidé ; en haut : « ça va passer tout seul ».",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='malade', signes=['sueur']), E(1.6, expression='determine', bras='croises')),
          perso('elle', E(0, x=480, expression='inquiet', bras='pointe'), E(2.6, expression='blase'))],
         meubles=['canape_fond'], objets=[O('mouchoirs', 330, 290, 0.6), O('porte', 600, 230, 1.6, derriere=True)], textes=[TITRE('toi quand ta personne refuse d\'aller chez le médecin', a=1.6), DIT('« ça va passer tout seul »', de=1.8)]),
    plan(4, "Elle le tire par la patte ; il se cramponne au canapé ; elle tire plus fort, en plein effort ; il glisse du canapé et se retrouve par terre, cramponné au coussin.",
         [perso('elle', E(0, x=480, expression='determine'), E(0.6, x=400, bras='tend_g', expression='effort', signes=['sueurs'])),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='peur', bras='tend_d'), E(1.4, x=250, y=380, taille=250, pose='allonge', expression='panique', bras='tient', signes=['sueurs']))],
         meubles=['canape_fond'], objets=[O('mouchoirs', 330, 290, 0.6, a=1.4), O('coussin', 190, 350, 0.8, de=1.4), O('porte', 600, 230, 1.6, derriere=True)], sons=[{'nom': 'glisse', 'a': 1.3}]),
    plan(4.5, "Elle le traîne par la patte jusqu'à la porte, lui à plat ventre qui glisse sur le sol, les yeux en croix, le coussin toujours serré ; ils sortent du cadre comme ça ; il a abandonné.",
         [perso('elle', E(0, x=400, expression='effort', bras='tend_g'), E(0.6, x=400, angle=90, pose='tire'), E(4.0, x=820)),
          perso('lui', E(0, x=250, pose='allonge', expression='ko', bras='tient', signes=['tourbillon']), E(0.6, x=250, pose='glisse', angle=90), E(4.0, x=680))],
         objets=[O('porte', 600, 230, 1.6, derriere=True), O('coussin', 250, 340, 0.8, etapes=[{'a': 0.6, 'x': 250}, {'a': 4.0, 'x': 680}])]),
])

reel('ani-323', 'les deux', 'nous deux quand on tente une sieste', lieu='canapé', plans=[
    plan(4, "Le canapé, l'après-midi, le soleil à la fenêtre ; les deux s'allongent l'un contre l'autre, ferment les yeux, zen ; des z commencent ; il bouge un peu ; elle bouge un peu.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='content'), E(0.8, x=270, pose='penche_d', expression='zen'), E(2.6, signes=['zzz'])),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='content'), E(0.8, x=370, pose='penche_g', expression='zen'), E(3.0, x=380))],
         meubles=['canape_fond'], objets=[O('soleil', 560, 90, 0.6)], textes=[TITRE('nous deux quand on tente une sieste')]),
    plan(4, "Il se tourne ; elle se retourne ; son bras à lui est coincé ; il le retire ; elle a froid ; elle tire le plaid ; il a chaud ; les deux rouvrent les yeux, exaspérés.",
         [perso('lui', E(0, x=270, y=318, taille=210, pose='penche_d', expression='zen'), E(0.8, pose='assis', expression='gene', bras='tend_d'), E(1.8, expression='chaud', signes=['vapeur'], bras='bas'), E(3.0, expression='exaspere')),
          perso('elle', E(0, x=380, y=318, taille=210, pose='penche_g', expression='zen'), E(0.8, pose='assis', expression='froid', signes=['frissons']), E(1.8, bras='tend_g'), E(3.0, expression='exaspere', bras='bas'))],
         meubles=['canape_fond'], objets=[O('soleil', 560, 90, 0.6), O('couverture', 320, 318, 2.4, de=1.6, etapes=[{'a': 1.6, 'x': 320}, {'a': 2.2, 'x': 420}])]),
    plan(4.5, "La sonnette, le téléphone, un oiseau à la fenêtre : tout sonne ; les deux, assis bien droits, les yeux grands ouverts, furieux, une veine chacun ; puis ils se regardent et rient ; sieste ratée.",
         [perso('lui', E(0, x=270, y=318, taille=210, pose='assis', expression='furieux', signes=['veine']), E(2.8, expression='rire', vers=1)),
          perso('elle', E(0, x=380, y=318, taille=210, pose='assis', expression='furieux', signes=['veine']), E(2.8, expression='rire', vers=-1))],
         meubles=['canape_fond'], objets=[O('soleil', 560, 90, 0.6), O('telephone', 150, 290, 0.5, de=0.8), O('exclamation', 150, 230, 0.4, de=1.0, a=2.0), O('oiseau', 540, 170, 0.5, de=1.6)], sons=[{'nom': 'sonnette', 'a': 0.2}, {'nom': 'sonne', 'a': 1.0}, {'nom': 'oiseau', 'a': 1.8}]),
])

reel('ani-324', 'elle', 'toi quand ta personne marche en téléphonant', lieu='téléphone', plans=[
    plan(4, "Lui au téléphone, content, marche de long en large dans la pièce, d'un bord à l'autre ; elle, assise sur le canapé, le suit des yeux, à gauche, à droite, à gauche.",
         [perso('lui', E(0, x=150, angle=90, pose='marche', expression='joie', bras='tient'), E(1.6, x=520, pose='debout'), E(1.9, angle=-90, pose='marche'), E(3.5, x=150, pose='debout'), E(3.8, angle=90, pose='marche')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='content', vers=1), E(1.6, vers=-1), E(3.5, vers=1))],
         meubles=['canape_fond'], objets=[O('telephone', 150, 300, 0.5, etapes=[{'a': 0, 'x': 150}, {'a': 1.6, 'x': 520}, {'a': 1.9, 'x': 520}, {'a': 3.5, 'x': 150}])],
         textes=[TITRE('toi quand ta personne marche en téléphonant')]),
    plan(4, "« 10 min plus tard » en bas. Il marche toujours, de plus en plus vite ; elle, les yeux qui suivent, commence à avoir le tournis, une spirale dans les yeux.",
         [perso('lui', E(0, x=150, angle=90, pose='court', expression='joie', bras='tient'), E(1.2, x=520, pose='debout'), E(1.4, angle=-90, pose='court'), E(2.6, x=150, pose='debout'), E(2.8, angle=90, pose='court'), E(4.0, x=520)),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='blase', vers=1), E(1.2, vers=-1), E(2.6, expression='etourdi', signes=['tourbillon'], vers=1))],
         meubles=['canape_fond'], objets=[O('telephone', 150, 300, 0.5, etapes=[{'a': 0, 'x': 150}, {'a': 1.2, 'x': 520}, {'a': 1.4, 'x': 520}, {'a': 2.6, 'x': 150}, {'a': 2.8, 'x': 150}, {'a': 4.0, 'x': 520}])], textes=[BAS('10 min plus tard')]),
    plan(4.5, "Elle a glissé du canapé et gît par terre, K.-O., les yeux en croix ; lui passe par-dessus elle en continuant de marcher et de parler, sans la voir ; puis il s'arrête, la regarde, perplexe.",
         [perso('elle', E(0, x=380, y=380, taille=250, pose='allonge', expression='ko', signes=['tourbillon'])),
          perso('lui', E(0, x=520, angle=-90, pose='marche', expression='joie', bras='tient'), E(1.8, x=200, pose='debout'), E(2.2, angle=0, expression='content'), E(3.0, expression='perplexe', vers=1, signes=['question']))],
         meubles=['canape_fond'], objets=[O('telephone', 520, 300, 0.5, etapes=[{'a': 0, 'x': 520}, {'a': 1.8, 'x': 200}])]),
])

reel('ani-326', 'elle', 'toi quand ta personne ramasse des cailloux', lieu='dehors', plans=[
    plan(4, "Dehors, un arbre ; les deux se promènent ; elle s'arrête, se baisse, ramasse un caillou, émerveillée, et le lui montre ; il hoche la tête, poli.",
         [perso('elle', E(0, x=-140, angle=90, pose='marche', expression='content'), E(1.6, x=260, pose='debout'), E(2.0, angle=0, expression='emerveille', bras='tient', signes=['etincelles'])),
          perso('lui', E(0, x=-260, angle=90, pose='marche', expression='content'), E(1.6, x=140, pose='debout'), E(2.0, angle=0, expression='content', vers=1), E(3.2, bras='pouce'))],
         objets=[O('arbre', 515, 255, 1.3, derriere=True), O('rocher', 260, 300, 0.35, de=2.0)], textes=[TITRE('toi quand ta personne ramasse des cailloux')]),
    plan(4, "« la balade suivante » en bas. Elle a les pattes pleines de cailloux, et lui en tend deux à porter ; il les prend, blasé ; elle en voit un autre plus loin et court dessus.",
         [perso('elle', E(0, x=260, expression='joie', bras='tient'), E(1.0, bras='tend_g'), E(2.0, expression='emerveille', signes=['etincelles'], vers=1), E(2.4, x=260, angle=90, pose='court'), E(3.6, x=520, pose='debout')),
          perso('lui', E(0, x=140, expression='content'), E(1.2, bras='tient', expression='blase'))],
         objets=[O('arbre', 515, 255, 1.3, derriere=True), O('rocher', 260, 300, 0.35, a=2.4), O('rocher', 140, 300, 0.3, de=1.2), O('rocher', 175, 290, 0.3, de=1.2), O('rocher', 530, 365, 0.35, derriere=True)], textes=[BAS('la balade suivante')]),
    plan(4.5, "« à la maison » en bas. Le salon : des cailloux partout par terre, sur le canapé, un sur la tête de lui ; elle, assise au milieu, les range, ravie ; lui marche sur un, saute sur une patte.",
         [perso('elle', E(0, x=300, pose='assis', expression='emerveille', bras='tient', signes=['etincelles'])),
          perso('lui', E(0, x=560, expression='blase'), E(1.0, x=560, angle=-90, pose='marche'), E(2.0, x=480, pose='debout'), E(2.2, pose='saut', expression='panique', signes=['exclamation'], angle=0), E(2.8, pose='tremble', expression='pleure', signes=['larmes']))],
         meubles=['canape_fond'], objets=[O('rocher', 150, 365, 0.4, derriere=True), O('rocher', 480, 368, 0.3, derriere=True), O('rocher', 300, 300, 0.4), O('rocher', 230, 290, 0.3), O('rocher', 410, 290, 0.35), O('rocher', 560, 290, 0.35, derriere=True)],
         textes=[BAS('à la maison')], sons=[{'nom': 'splat', 'a': 2.1}]),
])

reel('ani-327', 'elle', 'toi quand ta personne rit de ses propres blagues', lieu='tendresse', plans=[
    plan(4, "Les deux face à face ; elle raconte quelque chose, les bras qui s'agitent, et éclate de rire avant la fin, pliée en deux ; lui attend la chute, poli, un petit sourire.",
         [perso('elle', E(0, x=270, expression='joie', bras='leves'), E(1.2, expression='rire', bras='joues'), E(2.4, expression='mort_de_rire', pose='penche_d')),
          perso('lui', E(0, x=450, expression='content'), E(2.0, expression='attend'))],
         textes=[TITRE('toi quand ta personne rit de ses propres blagues')]),
    plan(4, "Elle essaie de finir, n'y arrive pas, pleure de rire, les larmes aux yeux, se tient le ventre ; lui, blasé, les bras croisés, puis sa bouche tremble : il commence à rire aussi.",
         [perso('elle', E(0, x=270, expression='pleure_de_joie', bras='joues'), E(1.4, expression='mort_de_rire', pose='penche_g'), E(2.8, pose='debout', expression='rire', bras='leves')),
          perso('lui', E(0, x=450, expression='blase', bras='croises'), E(1.6, expression='hesite'), E(2.8, expression='rire'))]),
    plan(4.5, "Les deux morts de rire, pliés en deux l'un sur l'autre, des larmes, sans savoir pourquoi ; elle essaie encore de finir ; il lui fait signe que non, ça ira ; des petits cœurs.",
         [perso('lui', E(0, x=290, expression='mort_de_rire', pose='penche_d'), E(2.4, bras='tend_d', expression='rire')),
          perso('elle', E(0, x=400, expression='pleure_de_joie', pose='penche_g'), E(2.0, expression='rire', bras='leves'), E(3.2, expression='mort_de_rire'))],
         objets=COEURS(345, 140, de=1.0)),
])

reel('ani-328', 'lui', 'toi quand ta personne bronze au premier rayon', lieu='saisons', plans=[
    plan(4, "Dehors, un grand soleil, un banc ; lui, allongé par terre, les lunettes de soleil, les bras derrière la tête, zen, comme en plein été ; elle arrive, en écharpe et bonnet, et grelotte.",
         [perso('lui', E(0, x=330, pose='allonge', expression='zen', taille=260)),
          perso('elle', entre(540, 0.3, 1.6, depuis='droite', expression='froid', signes=['frissons']), E(2.4, expression='perplexe', vers=-1, signes=['question']))],
         objets=[O('soleil', 120, 80, 0.9), O('banc', 560, 330, 1.2, derriere=True), O('lunettes', 300, 215, 0.6), O('bonnet', 540, 165, 0.9, de=0.3), O('echarpe', 540, 290, 0.9, de=0.3)], textes=[TITRE('toi quand ta personne bronze au premier rayon')], ambiance='oiseaux'),
    plan(4, "Elle s'assoit sur le banc, emmitouflée, les frissons ; lui, par terre, se retourne pour bronzer de l'autre côté, de la vapeur ; un oiseau se pose à côté de lui ; elle grelotte.",
         [perso('lui', E(0, x=330, pose='allonge', expression='zen', taille=260), E(1.6, x=360, expression='chaud', signes=['vapeur'])),
          perso('elle', E(0, x=540, expression='froid', signes=['frissons']), E(0.8, x=540, y=330, taille=220, pose='assis', bras='croises'))],
         objets=[O('soleil', 120, 80, 0.9), O('banc', 560, 330, 1.2, derriere=True), O('lunettes', 330, 215, 0.6, etapes=[{'a': 0, 'x': 300}, {'a': 1.6, 'x': 330}]), O('bonnet', 540, 150, 0.9), O('echarpe', 540, 290, 0.9), O('oiseau', 200, 350, 0.5, de=2.4)], ambiance='oiseaux'),
    plan(4.5, "« 1 h plus tard » en bas. Lui, toujours par terre, tout rouge, un coup de soleil, les lunettes de travers, blasé ; elle, sur le banc, lui tend l'écharpe pour qu'il se couvre ; il la prend, honteux.",
         [perso('lui', E(0, x=360, pose='allonge', expression='chaud', signes=['vapeur', 'rougeur_pleine']), E(1.6, pose='assis', expression='blase', signes=['rougeur_pleine']), E(3.2, expression='honte', bras='tient')),
          perso('elle', E(0, x=540, y=330, taille=220, pose='assis', expression='narquois', vers=-1), E(2.2, bras='tend_g', expression='content'))],
         objets=[O('soleil', 120, 80, 0.9), O('banc', 560, 330, 1.2, derriere=True), O('lunettes', 400, 260, 0.6, de=0, a=1.6), O('bonnet', 540, 150, 0.9), O('echarpe', 540, 290, 0.9, etapes=[{'a': 2.2, 'x': 540}, {'a': 3.2, 'x': 360, 'y': 300}])], textes=[BAS('1 h plus tard')], ambiance='oiseaux'),
])

reel('ani-329', 'lui', 'toi quand ta personne te laisse un petit mot', lieu='tendresse', son='tendre', plans=[
    plan(4, "Le matin, le lit ; elle dort encore ; lui, habillé, un sac à la patte, pose une lettre pliée sur l'oreiller à côté d'elle, le doigt sur la bouche, et sort sur la pointe des pattes.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('lui', E(0, x=200, expression='chut', bras='tient'), E(1.0, bras='tend_d'), E(1.6, bras='tient', expression='content'), E(2.0, x=200, angle=-90, pose='marche'), E(3.6, x=-140))],
         meubles=['lit_fond'], objets=[O('lettre', 250, 260, 0.5, de=1.0, derriere=True), O('sac', 200, 300, 0.7, etapes=[{'a': 2.0, 'x': 200}, {'a': 3.6, 'x': -140}])], textes=[TITRE('toi quand ta personne te laisse un petit mot')]),
    plan(4, "Elle se réveille, s'étire, voit la lettre sur l'oreiller, surprise ; elle la prend, la lit ; ses yeux s'embuent, puis deviennent des cœurs ; elle la serre contre elle.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo'), E(0.6, pose='debout', bras='aucun', pattes='aucune', expression='baille'), E(1.4, expression='surpris', vers=-1), E(2.0, bras='tient', expression='concentre'), E(2.8, expression='emu', signes=['larme']), E(3.4, expression='amour', signes=['coeurs']))],
         meubles=['lit_fond'], objets=[O('lettre', 250, 260, 0.5, derriere=True, a=2.0), O('lettre', 394, 290, 0.5, de=2.0)]),
    plan(4.5, "« toute la journée » en bas. Elle, dehors, au travail, dans la rue : la lettre toujours dans la patte, un petit sourire, des cœurs qui la suivent ; le soir, elle la glisse sous son oreiller.",
         [perso('elle', E(0, x=-140, angle=90, pose='marche', expression='content', bras='tient'), E(2.0, x=330, pose='debout'), E(2.4, angle=0, expression='amour', signes=['coeurs']))],
         objets=[O('lettre', 330, 300, 0.5, etapes=[{'a': 0, 'x': -140}, {'a': 2.0, 'x': 330}]), O('arbre', 515, 255, 1.3, derriere=True), O('coeur', 400, 170, 0.35, de=2.6, flotte=True), O('coeur', 260, 190, 0.3, de=3.2, flotte=True)], textes=[BAS('toute la journée')]),
])

reel('ani-330', 'les deux', 'nous deux quand le réveil sonne un dimanche', lieu='matin', plans=[
    plan(4, "Le lit, le matin ; le réveil sonne sur le téléphone ; les deux se redressent d'un coup, les yeux ronds, en panique, prêts à sauter du lit.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo'), E(0.6, pose='debout', bras='aucun', pattes='aucune', expression='panique', signes=['exclamation'])),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo'), E(0.7, pose='debout', bras='aucun', pattes='aucune', expression='panique', signes=['exclamation']))],
         meubles=['lit_fond'], objets=[O('telephone', 320, 290, 0.5), O('exclamation', 350, 230, 0.4, de=0.3, a=1.5)], textes=[TITRE('nous deux quand le réveil sonne un dimanche')], sons=[{'nom': 'reveil', 'a': 0.2}]),
    plan(3.5, "Ils se regardent ; ils regardent le téléphone ; ils regardent l'horloge au mur ; en bas s'écrit « dimanche » ; leur visage passe de la panique à la fureur, une veine chacun.",
         [perso('lui', AU_LIT(248, expression='panique', vers=1), E(1.0, vers=-1, expression='confus'), E(2.2, expression='furieux', signes=['veine'])),
          perso('elle', AU_LIT(394, expression='panique', vers=-1), E(1.0, vers=1, expression='confus'), E(2.2, expression='furieux', signes=['veine']))],
         meubles=['lit_fond'], objets=[O('telephone', 320, 290, 0.5), O('horloge', 545, 85, 0.7)], textes=[BAS('dimanche', de=1.2)]),
    plan(4.5, "Il attrape le téléphone et le jette par-dessus le lit ; il atterrit sur le coussin par terre ; les deux se rallongent en même temps, des z aussitôt ; un petit cœur.",
         [perso('lui', AU_LIT(248, expression='furieux', bras='tend_d'), E(1.2, pose='allonge', expression='dodo', bras='bas', signes=['zzz'])),
          perso('elle', AU_LIT(394, expression='furieux'), E(1.4, pose='allonge', expression='dodo', signes=['zzz']))],
         meubles=['lit_fond'], objets=[O('telephone', 320, 290, 0.5, etapes=[{'a': 0, 'x': 320}, {'a': 0.5, 'x': 110, 'y': 340}]), O('coussin', 110, 365, 0.8, derriere=True), O('coeur', 320, 200, 0.35, de=2.6, flotte=True)], sons=[{'nom': 'coussin', 'a': 0.5}]),
])
