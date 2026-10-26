# Quatrième lot : vingt-cinq reels, janvier.
from usine import *

CANAPE = dict(y=318, taille=210, pose='assis')


def SUR_CANAPE(nom, x, **k):
    d = dict(CANAPE)
    d.update(k)
    return fixe(nom, x, **d)


reel('ani-258', 'lui', 'toi quand ta personne chante sous la douche', lieu='matin', plans=[
    plan(4, "Une porte fermée à gauche ; des notes de musique en sortent, de plus en plus grosses ; elle, assise par terre à droite avec une tasse, lève les yeux, blasée.",
         [perso('elle', E(0, x=450, pose='assis', expression='blase', bras='tient'), E(2.4, expression='exaspere', vers=-1))],
         objets=[O('porte', 110, 230, 1.6, derriere=True), O('tasse', 450, 300, 0.5), O('musique', 200, 160, 0.5, de=0.4, a=1.6, flotte=True), O('musique', 230, 120, 0.7, de=1.4, a=2.8, flotte=True), O('musique', 190, 180, 0.9, de=2.6, flotte=True)],
         textes=[TITRE('toi quand ta personne chante sous la douche')]),
    plan(4, "Les notes continuent, encore plus grosses ; elle pose la tasse, se bouche les oreilles, puis rit malgré elle ; puis sa patte bat la mesure ; elle se lève.",
         [perso('elle', E(0, x=450, pose='assis', expression='exaspere', bras='oreilles_bouchees'), E(1.4, expression='rire', bras='bas'), E(2.6, pose='debout', expression='content', signes=['notes']))],
         objets=[O('porte', 110, 230, 1.6, derriere=True), O('tasse', 520, 350, 0.5), O('musique', 210, 150, 0.9, de=0.2, a=1.8, flotte=True), O('musique', 240, 110, 1.0, de=1.6, flotte=True)]),
    plan(4.5, "Elle danse dans le couloir devant la porte, en chantant à son tour, des notes partout ; la porte s'ouvre : lui, de la mousse sur la tête, chante avec elle ; ils dansent tous les deux.",
         [perso('elle', E(0, x=400, pose='danse', expression='chante', signes=['notes']), E(2.6, x=430)),
          perso('lui', E(2.0, x=150, expression='chante', pose='danse', signes=['notes', 'bulles']))],
         objets=[O('porte', 70, 230, 1.6, derriere=True), O('musique', 300, 120, 0.8, de=0.3, flotte=True), O('musique', 520, 150, 0.6, de=1.0, flotte=True), O('musique', 230, 170, 0.6, de=2.4, flotte=True)], sons=[{'nom': 'porte', 'a': 2.0}]),
])

reel('ani-259', 'elle', 'toi quand ta personne ouvre la fenêtre en plein hiver', lieu='maison', plans=[
    plan(4, "Lui à droite, rouge, de la vapeur au-dessus de la tête, a trop chaud ; il ouvre la fenêtre derrière lui, soulagé ; des flocons entrent ; elle, à gauche sous un plaid, lève les yeux.",
         [perso('lui', E(0, x=450, expression='chaud', signes=['vapeur']), E(1.2, bras='tend_d', expression='effort'), E(2.0, expression='soulage', bras='bas')),
          perso('elle', E(0, x=230, expression='content'), E(2.6, expression='surpris', vers=1))],
         objets=[O('fenetre', 560, 170, 1.3, derriere=True), O('couverture', 230, 300, 1.8), O('flocon', 540, 200, 0.3, de=2.2, flotte=True), O('flocon', 500, 140, 0.25, de=2.8, flotte=True)],
         textes=[TITRE('toi quand ta personne ouvre la fenêtre en plein hiver')]),
    plan(4, "Elle grelotte, des frissons, des flocons jusqu'à elle ; elle enfile un bonnet, puis une écharpe, puis se roule en boule dans le plaid ; lui, en t-shirt, respire à pleins poumons, ravi.",
         [perso('elle', E(0, x=230, expression='froid', signes=['frissons']), E(1.2, bras='tete'), E(2.0, bras='bas', expression='froid', signes=['frissons', 'flocons']), E(2.8, pose='boule', taille=230)),
          perso('lui', E(0, x=450, expression='zen'), E(2.2, expression='joie', bras='leves'))],
         objets=[O('fenetre', 560, 170, 1.3, derriere=True), O('bonnet', 230, 150, 0.9, de=1.2), O('echarpe', 230, 290, 0.9, de=2.0), O('couverture', 230, 300, 1.8), O('flocon', 300, 160, 0.3, de=0.4, flotte=True), O('flocon', 400, 220, 0.3, de=1.0, flotte=True)]),
    plan(4.5, "Il se retourne enfin vers elle : une boule de plaid avec un bonnet, deux yeux qui dépassent, des flocons dessus ; il ferme la fenêtre, gêné, et vient se glisser dans le plaid avec elle.",
         [perso('elle', E(0, x=230, pose='boule', taille=230, expression='froid', signes=['frissons', 'flocons']), E(3.4, expression='content')),
          perso('lui', E(0, x=450, expression='joie'), E(0.8, expression='surpris', vers=-1), E(1.6, expression='gene', bras='tend_d', signes=['sueur']), marche(450, 320, 2.2, 3.0, expression='desole'), E(3.4, pose='penche_g', expression='calin', bras='tend_g'))],
         objets=[O('fenetre', 560, 170, 1.3, derriere=True), O('bonnet', 230, 150, 0.9), O('couverture', 260, 300, 2.2), O('coeur', 290, 150, 0.4, de=3.6, flotte=True)]),
])

reel('ani-260', 'les deux', 'nous deux le lundi matin', lieu='matin', plans=[
    plan(4, "« lundi, 7 h » en bas. Les deux près de la porte, un sac chacun, les yeux cernés, un nuage noir au-dessus de chaque tête ; ils se regardent, puis la porte, puis sortent en traînant.",
         [perso('lui', E(0, x=270, expression='deprime', signes=['nuage_noir'], bras='tient'), E(1.6, vers=1), sort(270, 2.2, 3.8, vers='droite', pose='marche', expression='deprime')),
          perso('elle', E(0, x=430, expression='deprime', signes=['nuage_noir'], bras='tient'), E(1.6, vers=-1), sort(430, 2.4, 3.6, vers='droite', pose='marche', expression='deprime'))],
         objets=[O('porte', 600, 230, 1.6, derriere=True), O('sac', 270, 300, 0.7, etapes=[{'a': 2.2, 'x': 270}, {'a': 3.8, 'x': 820}]), O('sac', 430, 300, 0.7, etapes=[{'a': 2.4, 'x': 430}, {'a': 3.6, 'x': 820}])],
         textes=[TITRE('nous deux le lundi matin', a=1.8), BAS('lundi, 7 h', de=2.0)]),
    plan(4, "« vendredi, 18 h » en bas. Les deux entrent par la droite en courant, jettent les sacs, et dansent au milieu, des notes, des étincelles, radieux.",
         [perso('lui', entre(270, 0, 1.4, depuis='droite', expression='joie', tourne=False), E(1.6, angle=0, pose='danse', expression='joie', signes=['notes'])),
          perso('elle', entre(430, 0.2, 1.6, depuis='droite', expression='joie', tourne=False), E(1.8, angle=0, pose='danse', expression='joie', signes=['etincelles']))],
         objets=[O('porte', 600, 230, 1.6, derriere=True), O('sac', 560, 350, 0.7, de=1.4), O('sac', 120, 350, 0.7, de=1.6), O('musique', 350, 130, 0.6, de=1.8, flotte=True)], textes=[BAS('vendredi, 18 h')]),
    plan(4.5, "« vendredi, 20 h » en bas. Le canapé ; les deux affalés dessous le plaid, endormis, des z ; les sacs par terre ; la soirée du vendredi, c'est ça.",
         [SUR_CANAPE('lui', 270, expression='dodo', signes=['zzz']), SUR_CANAPE('elle', 370, expression='dodo', signes=['zzz'])],
         meubles=['canape_fond'], objets=[O('couverture', 320, 318, 2.6), O('sac', 100, 350, 0.7), O('coeur', 320, 160, 0.35, de=2.0, flotte=True)], textes=[BAS('vendredi, 20 h')]),
])

reel('ani-261', 'elle', 'toi quand ta personne dit « c\'est pas grave »', lieu='dispute', plans=[
    plan(4, "Lui à gauche, désolé, les pattes jointes ; elle à droite, le sourire un peu figé ; en haut s'écrit « c'est pas grave » ; il souffle, soulagé ; un petit nuage apparaît au-dessus d'elle.",
         [perso('lui', E(0, x=270, expression='desole', bras='priere'), E(2.6, expression='soulage', bras='bas')),
          perso('elle', E(0, x=450, expression='content'), E(2.8, expression='blase'))],
         objets=[O('nuage', 450, 130, 0.4, de=3.0)], textes=[TITRE('toi quand ta personne dit « c\'est pas grave »', a=1.6), DIT('« c\'est pas grave »', de=1.8)]),
    plan(4, "« 5 min plus tard » en bas. Le nuage au-dessus d'elle grossit, grossit ; elle boude, les bras croisés ; lui le remarque, inquiet, puis panique à mesure que le nuage prend toute la place.",
         [perso('elle', E(0, x=450, expression='blase'), E(1.0, expression='boude', bras='croises'), E(2.6, expression='furieux', signes=['veine'])),
          perso('lui', E(0, x=270, expression='content'), E(1.2, expression='inquiet', vers=1), E(2.6, expression='panique', signes=['sueurs']))],
         objets=[O('nuage', 450, 130, 0.5, etapes=[{'a': 0, 'echelle': 0.5}, {'a': 1.5, 'echelle': 1.0}, {'a': 3.5, 'echelle': 1.8}])], textes=[BAS('5 min plus tard')]),
    plan(4.5, "Le nuage est énorme, il pleut dessous ; elle boude dessous, trempée ; lui arrive avec un parapluie, le tient au-dessus d'elle, et attend, désolé ; elle finit par sourire en coin.",
         [perso('elle', E(0, x=450, expression='furieux', bras='croises'), E(2.8, expression='narquois', vers=-1), E(3.8, expression='content')),
          perso('lui', E(0, x=270, expression='panique'), marche(270, 350, 0.6, 1.4, expression='desole'), E(1.8, bras='tend_haut_d', expression='desole'))],
         objets=[O('nuage', 450, 110, 1.8), O('pluie', 450, 200, 0.9, de=0.2), O('parapluie', 430, 230, 2.0, de=1.8)]),
])

reel('ani-262', 'lui', 'toi quand ta personne a une nouvelle passion', lieu='maison', plans=[
    plan(4, "Lui entre par la gauche, radieux, une plante en pot dans les pattes, et la pose au milieu ; elle, à droite, trouve ça mignon, un petit cœur.",
         [perso('lui', entre(260, 0, 1.6, pose='marche', expression='joie', bras='tient'), E(2.4, bras='bas', expression='fier', signes=['etincelles'])),
          perso('elle', E(0, x=470, expression='content'), E(2.6, expression='amour'))],
         objets=[O('plante', 260, 300, 0.7, etapes=[{'a': 1.6, 'x': 260}, {'a': 2.4, 'x': 340, 'y': 345}]), O('coeur', 500, 190, 0.35, de=2.8, flotte=True)], textes=[TITRE('toi quand ta personne a une nouvelle passion')]),
    plan(4, "« 1 semaine plus tard » en bas. Il entre encore, avec deux plantes cette fois, les pose à côté de la première ; elle, perplexe, un point d'interrogation.",
         [perso('lui', entre(260, 0, 1.6, pose='marche', expression='joie', bras='leves'), E(2.4, bras='bas', expression='emerveille')),
          perso('elle', E(0, x=470, expression='content'), E(2.4, expression='perplexe', signes=['question']))],
         objets=[O('plante', 340, 345, 0.7), O('plante', 180, 250, 0.7, de=0, etapes=[{'a': 1.6, 'x': 180}, {'a': 2.4, 'x': 130, 'y': 345}]), O('plante', 330, 250, 0.7, de=0, etapes=[{'a': 1.6, 'x': 330}, {'a': 2.4, 'x': 420, 'y': 345}])],
         textes=[BAS('1 semaine plus tard')]),
    plan(4.5, "« 1 mois plus tard » en bas. Des plantes partout, elle est coincée entre deux pots, blasée, une feuille sur la tête ; lui, au milieu de sa jungle, arrose, émerveillé, des cœurs autour.",
         [perso('elle', E(0, x=520, expression='blase', taille=220), E(2.4, expression='exaspere')),
          perso('lui', E(0, x=280, expression='emerveille', bras='tient', signes=['coeurs']), E(2.0, bras='tend_d'))],
         objets=[O('plante', 130, 345, 0.9), O('plante', 400, 345, 0.8), O('plante', 200, 200, 0.6), O('plante', 460, 230, 0.6), O('plante', 560, 345, 0.7), O('plante', 330, 330, 0.5, derriere=True)],
         textes=[BAS('1 mois plus tard')]),
])

reel('ani-263', 'elle', 'toi quand ta personne a vu la fin de la série sans toi', lieu='canapé', plans=[
    plan(4, "Le canapé, la télé ; elle, l'air innocent, l'auréole au-dessus de la tête ; lui lance l'épisode, content ; elle regarde ailleurs, siffle.",
         [SUR_CANAPE('lui', 226, expression='content', bras='tient'),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='ange', signes=['halo']), E(2.2, expression='chante', vers=1))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8)], textes=[TITRE('toi quand ta personne a vu la fin de la série sans toi')]),
    plan(4, "Il la regarde, suspicieux ; elle fait l'innocente, puis craque, honteuse, les pattes sur le visage ; il comprend, choqué, un point d'exclamation, puis furieux, une veine.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='suspicieux', vers=1), E(2.0, expression='choque', signes=['exclamation']), E(3.0, expression='furieux', signes=['veine'])),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='ange', signes=['halo']), E(1.4, expression='honte', bras='visage'))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8)]),
    plan(4.5, "Elle veut se faire pardonner et commence à raconter ; il se bouche les oreilles et chante fort, la la la, les yeux fermés ; elle rit et lui met la main sur la bouche ; un petit cœur.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='desole', bras='priere'), E(1.2, bras='leves', expression='joie'), E(2.6, expression='rire', x=370, bras='tend_g')),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='furieux'), E(1.0, expression='chante', bras='oreilles_bouchees', signes=['notes']), E(3.4, expression='content', bras='bas'))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('coeur', 300, 170, 0.35, de=3.6, flotte=True)]),
])

reel('ani-264', 'les deux', 'nous deux quand ça sonne à la porte', lieu='maison', plans=[
    plan(4, "Le canapé, les deux assis, contents ; la sonnette retentit ; les deux ferment les yeux en même temps et font semblant de dormir, des z un peu trop gros.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='content'), E(1.2, expression='surpris'), E(1.8, expression='dodo', signes=['zzz'])),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='content'), E(1.2, expression='surpris'), E(1.8, expression='dodo', signes=['zzz']))],
         meubles=['canape_fond'], textes=[TITRE('nous deux quand ça sonne à la porte')], sons=[{'nom': 'sonnette', 'a': 1.0}]),
    plan(4, "Ça sonne encore ; lui ouvre un œil en coin ; elle ouvre un œil en coin ; ils se voient ; ils referment les yeux tous les deux, encore plus endormis ; ça sonne encore.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='dodo', signes=['zzz']), E(1.0, expression='suspicieux', vers=1), E(2.0, expression='dodo', signes=['zzz'])),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='dodo', signes=['zzz']), E(1.2, expression='suspicieux', vers=-1), E(2.0, expression='dodo', signes=['zzz']))],
         meubles=['canape_fond'], sons=[{'nom': 'sonnette', 'a': 0.4}, {'nom': 'sonnette', 'a': 3.2}]),
    plan(4.5, "Elle le pousse d'un coup du canapé ; il tombe par terre, surpris ; elle se rendort aussitôt, l'auréole au-dessus de la tête ; il se relève, blasé, et va ouvrir en traînant.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='dodo'), E(0.6, expression='malicieux', bras='tend_g'), E(1.6, expression='dodo', signes=['halo', 'zzz'], bras='bas')),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='dodo'), E(0.8, x=150, y=380, taille=250, pose='tombe', expression='surpris'), E(1.4, pose='allonge', expression='ko'), E(2.4, pose='debout', expression='blase', angle=90), E(2.6, pose='marche'), E(4.2, x=-140))],
         meubles=['canape_fond'], sons=[{'nom': 'splat', 'a': 1.0}, {'nom': 'sonnette', 'a': 2.0}]),
])

reel('ani-265', 'lui', 'toi quand ta personne ramène une fleur sans raison', lieu='tendresse', son='tendre', plans=[
    plan(4, "Elle à droite, assise par terre avec un livre, tranquille ; lui entre par la gauche, les pattes derrière le dos, l'air malicieux, et s'arrête devant elle.",
         [fixe('elle', 450, pose='assis', expression='zen', bras='tient'),
          perso('lui', entre(280, 0.2, 1.8, pose='marche', expression='malicieux'), E(2.4, expression='timide'))],
         objets=[O('livre', 450, 300, 0.6), O('fleur', 200, 330, 0.5, derriere=True, de=1.8)], textes=[TITRE('toi quand ta personne ramène une fleur sans raison')]),
    plan(4, "Elle lève les yeux, curieuse ; il sort la fleur de derrière son dos, tout timide, et la lui tend ; elle reste bouche bée, puis ses yeux deviennent des cœurs.",
         [perso('lui', E(0, x=280, expression='timide'), E(1.0, bras='tend_d', expression='gene', signes=['rougeur_pleine'])),
          perso('elle', E(0, x=450, pose='assis', expression='curieux', vers=-1), E(1.6, expression='bouche_bee', bras='bas'), E(2.8, expression='amour', signes=['coeurs']))],
         objets=[O('livre', 520, 350, 0.6), O('fleur', 360, 300, 0.5, de=1.0)]),
    plan(4.5, "Elle se lève d'un bond, lui saute au cou, la fleur à la patte ; câlin, des cœurs partout ; elle pleure de joie ; lui, un peu étouffé, sourit, gêné et content.",
         [perso('elle', E(0, x=450, pose='assis', expression='amour'), E(0.6, pose='saut', expression='joie', x=430), E(1.2, x=400, pose='penche_g', bras='tend_g', expression='pleure_de_joie')),
          perso('lui', E(0, x=280, expression='gene', bras='tend_d'), E(1.2, x=290, pose='penche_d', expression='calin'), E(3.2, expression='content', signes=['rougeur_pleine']))],
         objets=[O('fleur', 450, 300, 0.5, etapes=[{'a': 0, 'x': 450}, {'a': 1.2, 'x': 470, 'y': 290}])] + COEURS(345, 140, de=1.6), sons=[{'nom': 'saut', 'a': 0.6}]),
])

reel('ani-266', 'lui', 'toi quand ta personne dit « faut qu\'on parle »', lieu='dispute', plans=[
    plan(4, "Lui au milieu, tranquille, le téléphone à la patte ; elle arrive de la droite, sérieuse ; en haut s'écrit « faut qu'on parle » ; il se fige, les yeux vides.",
         [perso('lui', E(0, x=290, expression='content', bras='tient'), E(2.4, expression='panique', bras='bas', signes=['sueurs'])),
          perso('elle', entre(450, 0.2, 1.6, depuis='droite', expression='determine'))],
         objets=[O('telephone', 290, 300, 0.55, a=2.4), O('telephone', 230, 360, 0.5, de=2.4)], textes=[TITRE('toi quand ta personne dit « faut qu\'on parle »', a=1.8), DIT('« faut qu\'on parle »', de=2.0)], sons=[{'nom': 'splat', 'a': 2.5}]),
    plan(4, "Il passe en revue toute sa vie : panique, sueurs, tremblements, les yeux en spirale ; il se met en boule ; elle réfléchit encore à la formulation, les petits points.",
         [perso('lui', E(0, x=290, expression='panique', signes=['sueurs']), E(1.0, pose='tremble', expression='peur', signes=['sueurs', 'tremblement']), E(2.2, pose='boule', expression='etourdi', signes=['tourbillon'])),
          perso('elle', E(0, x=450, expression='pensif', signes=['points']), E(2.6, expression='idee', signes=['ampoule']))]),
    plan(4.5, "En haut s'écrit la suite : « ... pour les vacances » ; il relève la tête, surpris, puis respire enfin, soulagé, et s'étale de tout son long, K.-O. de soulagement ; elle, perplexe.",
         [perso('lui', E(0, x=290, pose='boule', expression='peur'), E(1.4, pose='debout', expression='surpris'), E(2.2, expression='soulage'), E(3.0, pose='allonge', expression='ko', signes=['sueur'])),
          perso('elle', E(0, x=450, expression='content'), E(2.6, expression='perplexe', signes=['question']))],
         textes=[DIT('« ... pour les vacances »', de=0.4)]),
])

reel('ani-267', 'elle', 'toi quand ta personne se lève tôt et toi non', lieu='matin', plans=[
    plan(4, "Le lit, le matin tôt, une horloge ; lui se lève plein d'énergie, saute du lit, allume la lampe ; elle, allongée, se cache les yeux, et grogne.",
         [perso('lui', AU_LIT(248, expression='energique'), E(0.8, x=150, y=380, taille=250, pose='saut', bras='leves', pattes='debout'), E(1.4, pose='debout', expression='joie'), E(2.2, bras='tend_d')),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']), E(2.4, bras='visage', expression='exaspere'))],
         meubles=['lit_fond'], objets=[O('horloge', 545, 85, 0.7), O('lampe', 90, 240, 1.0, de=2.4)], textes=[TITRE('toi quand ta personne se lève tôt et toi non')], sons=[{'nom': 'saut', 'a': 0.8}]),
    plan(4, "Il traverse la pièce en sifflant, une tasse à la patte, ouvre la fenêtre, chante ; elle enfonce la tête sous l'oreiller, une veine qui bat.",
         [perso('lui', E(0, x=150, expression='chante', signes=['notes'], bras='tient'), E(0.4, x=150, angle=90, pose='marche'), E(2.0, x=520, pose='debout'), E(2.4, angle=0, expression='joie', bras='leves')),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='exaspere', signes=['veine']), E(1.6, bras='tete'))],
         meubles=['lit_fond'], objets=[O('horloge', 545, 85, 0.7), O('tasse', 150, 300, 0.5, etapes=[{'a': 0.4, 'x': 150}, {'a': 2.0, 'x': 520}]), O('oreiller', 394, 230, 1.0, de=1.6), O('musique', 230, 170, 0.5, de=0.3, a=1.6, flotte=True)]),
    plan(4.5, "Il repasse près du lit ; une patte sort de sous l'oreiller, l'attrape et le tire dans le lit ; il tombe à côté d'elle, surpris, puis se rendort aussitôt ; elle sourit sous l'oreiller.",
         [perso('lui', E(0, x=520, expression='joie'), E(0.4, x=520, angle=-90, pose='marche'), E(1.6, x=330, pose='debout'), E(1.9, x=290, y=346, taille=200, pose='allonge', expression='surpris', angle=0, bras='bas'), E(3.2, expression='dodo', signes=['zzz'])),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='exaspere'), E(1.2, bras='tend_g', expression='malicieux'), E(2.6, bras='bas', expression='content'))],
         meubles=['lit_fond'], objets=[O('horloge', 545, 85, 0.7), O('oreiller', 394, 230, 1.0, de=0, a=1.2), O('coeur', 340, 190, 0.35, de=3.4, flotte=True)], sons=[{'nom': 'boing', 'a': 1.9}]),
])

reel('ani-268', 'lui', 'toi quand ta personne a trop chaud, puis trop froid', lieu='lit', plans=[
    plan(4, "Le lit ; elle, allongée, a trop chaud, de la vapeur, repousse le plaid ; lui, à côté, le ramasse et le plie, gentil ; elle se met à grelotter, des frissons.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='chaud', signes=['vapeur']), E(1.0, bras='tend_g'), E(2.4, expression='froid', signes=['frissons'], bras='bas')),
          perso('lui', AU_LIT(248, expression='content'), E(1.4, bras='tend_d'), E(2.0, bras='aucun'))],
         meubles=['lit_fond'], objets=[O('couverture', 394, 330, 1.4, etapes=[{'a': 1.0, 'x': 394}, {'a': 1.6, 'x': 150, 'y': 250}])], textes=[TITRE('toi quand ta personne a trop chaud, puis trop froid')]),
    plan(4, "Il remet le plaid sur elle ; elle a trop chaud, de la vapeur ; il le retire ; elle a trop froid, des flocons ; il le remet ; de plus en plus vite ; il transpire.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='froid', signes=['frissons']), E(0.8, expression='chaud', signes=['vapeur']), E(1.6, expression='froid', signes=['frissons', 'flocons']), E(2.4, expression='chaud', signes=['vapeur']), E(3.2, expression='froid', signes=['frissons'])),
          perso('lui', AU_LIT(248, expression='content', bras='tend_d'), E(1.2, expression='nerveux', signes=['sueur']), E(2.4, expression='panique', signes=['sueurs']))],
         meubles=['lit_fond'], objets=[O('couverture', 394, 330, 1.4, etapes=[{'a': 0, 'x': 394, 'y': 330}, {'a': 0.8, 'x': 150, 'y': 250}, {'a': 1.6, 'x': 394, 'y': 330}, {'a': 2.4, 'x': 150, 'y': 250}, {'a': 3.2, 'x': 394, 'y': 330}])]),
    plan(4.5, "Lui est K.-O., allongé en travers du lit, les yeux en croix, le plaid sur la tête ; elle, assise, enfin bien, zen, lui tapote la tête ; un petit cœur.",
         [perso('lui', E(0, x=280, y=346, taille=200, pose='allonge', expression='ko', signes=['tourbillon'])),
          perso('elle', AU_LIT(420, expression='zen'), E(2.0, bras='tend_g', expression='content', vers=-1), E(3.4, expression='amour'))],
         meubles=['lit_fond'], objets=[O('couverture', 230, 290, 1.2), O('coeur', 380, 190, 0.35, de=3.6, flotte=True)]),
])

reel('ani-269', 'elle', 'toi quand ta personne dit « j\'ai pas sommeil » à 2 h', lieu='nuit', plans=[
    plan(4, "La nuit, la lune ; le lit ; elle dort allongée ; lui, assis, les yeux grands ouverts, plein d'énergie, les bras levés ; en haut s'écrit « j'ai pas sommeil ».",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']), E(2.8, expression='exaspere', pose='allonge', signes=['veine'])),
          perso('lui', AU_LIT(248, expression='energique'), E(1.6, bras='leves', expression='joie'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], textes=[TITRE('toi quand ta personne dit « j\'ai pas sommeil » à 2 h', a=1.4), DIT('« j\'ai pas sommeil »', de=1.6)]),
    plan(4, "Il parle, des petits points, il a des idées, une ampoule ; elle se met l'oreiller sur la tête ; il parle encore ; elle lui tourne le dos ; il parle toujours.",
         [perso('lui', AU_LIT(248, expression='joie', signes=['points']), E(1.2, expression='idee', signes=['ampoule']), E(2.6, expression='chante', signes=['points'])),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='exaspere'), E(0.8, bras='tete'), E(2.2, x=440, bras='bas', expression='boude'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('oreiller', 394, 230, 1.0, de=0.8, a=2.2)]),
    plan(4.5, "« 3 min plus tard » en bas. Il s'est endormi d'un coup, allongé, la bouche ouverte, il ronfle ; elle, maintenant, a les yeux grands ouverts, blasée, puis furieuse ; la lune la regarde.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz', 'bulle_nez'])),
          perso('elle', E(0, x=440, y=346, taille=200, pose='allonge', expression='boude'), E(1.0, pose='debout', bras='aucun', pattes='aucune', expression='blase', vers=-1), E(2.8, expression='furieux', signes=['veine']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('musique', 200, 200, 0.5, de=0.6, a=1.8, flotte=True), O('musique', 220, 190, 0.5, de=2.4, flotte=True)], textes=[BAS('3 min plus tard')]),
])

reel('ani-270', 'elle', 'toi quand ta personne te tient la main en dormant', lieu='nuit', son='tendre', plans=[
    plan(4, "La nuit, la lune ; le lit ; les deux dorment, elle lui tient la patte dans son sommeil ; il se réveille, les yeux ronds : il a envie de se lever.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz'], bras='tend_g')),
          perso('lui', E(0, x=270, y=346, taille=200, pose='allonge', expression='dodo', bras='tend_d'), E(1.6, expression='surpris', pose='allonge'), E(2.6, expression='nerveux', signes=['sueur']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], textes=[TITRE('toi quand ta personne te tient la main en dormant')]),
    plan(4, "Il essaie de retirer sa patte tout doucement ; elle serre plus fort en dormant ; il tire un peu ; elle se rapproche, collée ; il abandonne, résigné, des gouttes de sueur.",
         [perso('lui', E(0, x=270, y=346, taille=200, pose='allonge', expression='nerveux', bras='tend_d'), E(1.0, x=240, expression='effort', signes=['sueur']), E(2.2, x=260, expression='blase')),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo', bras='tend_g', signes=['zzz']), E(1.2, x=380), E(2.0, x=340, expression='content', pose='allonge'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)]),
    plan(4.5, "« 1 h plus tard » en bas. Il n'a pas bougé, la patte toujours dans la sienne, les yeux grands ouverts, résigné ; il la regarde, et son regard change : des cœurs ; il se rendort en souriant.",
         [perso('lui', E(0, x=260, y=346, taille=200, pose='allonge', expression='blase', bras='tend_d'), E(1.6, expression='amour', vers=1, signes=['coeurs']), E(3.4, expression='dodo', signes=['zzz'])),
          perso('elle', E(0, x=340, y=346, taille=200, pose='allonge', expression='dodo', bras='tend_g', signes=['zzz']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('coeur', 300, 190, 0.4, de=1.8, flotte=True)], textes=[BAS('1 h plus tard')]),
])

reel('ani-271', 'elle', 'toi quand ta personne t\'envoie des vidéos toute la journée', lieu='téléphone', plans=[
    plan(4, "Lui au travail, assis devant son ordinateur, concentré ; son téléphone vibre à côté, un point d'exclamation ; il regarde, rit, revient à l'écran ; ça vibre encore.",
         [perso('lui', E(0, x=300, pose='assis', expression='concentre', taille=230), E(1.2, expression='rire', vers=1), E(2.2, expression='concentre'), E(3.2, expression='rire', vers=1))],
         objets=[O('ordinateur', 300, 330, 1.0), O('telephone', 470, 345, 0.5), O('exclamation', 500, 280, 0.45, de=1.0, a=2.0), O('exclamation', 500, 280, 0.45, de=3.0)],
         textes=[TITRE('toi quand ta personne t\'envoie des vidéos toute la journée')], sons=[{'nom': 'notification', 'a': 1.0}, {'nom': 'notification', 'a': 3.0}]),
    plan(4, "« 14 h » en bas. Il essaie de travailler ; ça vibre, ça vibre, ça vibre ; il rit de plus en plus, les larmes aux yeux, le téléphone à la patte, l'ordinateur oublié.",
         [perso('lui', E(0, x=300, pose='assis', expression='concentre', taille=230), E(0.8, expression='rire', bras='tient'), E(2.0, expression='mort_de_rire', pose='assis'), E(3.0, expression='pleure_de_joie'))],
         objets=[O('ordinateur', 300, 330, 1.0, a=0.8), O('ordinateur', 140, 350, 0.8, de=0.8), O('telephone', 300, 300, 0.5, de=0.8), O('exclamation', 350, 230, 0.45, de=0.4, a=1.0), O('exclamation', 350, 230, 0.45, de=1.6, a=2.2)],
         textes=[BAS('14 h')], sons=[{'nom': 'notification', 'a': 0.4}, {'nom': 'notification', 'a': 1.6}, {'nom': 'notification', 'a': 2.8}]),
    plan(4.5, "« 18 h » en bas. Elle, chez elle, assise sur le canapé, le téléphone à la patte, fière, des étincelles ; lui rentre par la droite, mort de rire, et s'effondre à côté d'elle, K.-O.",
         [SUR_CANAPE('elle', 414, expression='fier', bras='tient', signes=['etincelles']),
          perso('lui', E(0.2, x=820, y=380, angle=-90, pose='marche', expression='rire'), E(1.8, x=300, pose='debout'), E(2.1, x=226, y=318, taille=210, pose='assis', expression='ko', angle=0, signes=['tourbillon']))],
         meubles=['canape_fond'], objets=[O('telephone', 414, 290, 0.5)], textes=[BAS('18 h')]),
])

reel('ani-272', 'lui', 'toi quand ta personne « repose juste ses yeux »', lieu='canapé', plans=[
    plan(4, "Le canapé, la télé ; lui, les yeux fermés, la tête qui penche ; elle, à côté, le regarde, narquoise ; en haut s'écrit « tu dors ? » puis « non, je repose mes yeux ».",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='dodo'), E(2.0, expression='content'), E(3.2, expression='dodo')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='narquois', vers=-1))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8)], textes=[TITRE('toi quand ta personne « repose juste ses yeux »', a=1.2), DIT('« tu dors ? »', de=1.4, a=2.4), DIT('« non, je repose mes yeux »', de=2.6)]),
    plan(4, "Il penche de plus en plus, la bouche ouverte, des z, puis une note de ronflement ; elle sourit, pose son téléphone, et le regarde dormir.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='dodo'), E(1.0, x=250, pose='penche_d', signes=['zzz']), E(2.4, signes=['zzz', 'bulle_nez'])),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='narquois', vers=-1), E(2.0, expression='amour'))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('musique', 190, 190, 0.5, de=2.4, flotte=True)]),
    plan(4.5, "Elle attrape le plaid, le pose doucement sur lui, éteint la télé, et se blottit contre lui ; il dort toujours, les yeux « juste reposés » ; des petits cœurs.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='amour'), E(0.8, bras='tend_g'), E(2.0, x=350, pose='penche_g', expression='content', bras='bas')),
          perso('lui', E(0, x=250, y=318, taille=210, pose='penche_d', expression='dodo', signes=['zzz']))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8, a=1.6), O('couverture', 290, 318, 2.4, de=1.0)] + COEURS(300, 140, de=2.4)),
])

reel('ani-273', 'lui', 'toi quand ta personne veut danser dans le salon', lieu='tendresse', son='tendre', plans=[
    plan(4, "Elle, au milieu, danse, des notes autour d'elle, radieuse ; lui, à droite, assis par terre avec son téléphone, refuse d'un geste, gêné.",
         [fixe('elle', 290, pose='danse', expression='joie', signes=['notes']),
          perso('lui', E(0, x=480, pose='assis', expression='content', bras='tient'), E(1.6, expression='gene', bras='bas', vers=-1), E(2.6, bras='croises', expression='timide'))],
         objets=[O('telephone', 480, 300, 0.5, a=1.6), O('musique', 200, 140, 0.6, de=0.3, flotte=True), O('musique', 380, 120, 0.5, de=1.0, flotte=True)], textes=[TITRE('toi quand ta personne veut danser dans le salon')]),
    plan(4, "Elle vient le chercher, le tire par les pattes ; il se lève en tremblant, tout raide, les joues rouges ; elle le fait tourner ; il se détend un peu, puis rit.",
         [perso('elle', E(0, x=290, expression='joie'), marche(290, 420, 0.3, 1.0, expression='malicieux', tourne=False), E(1.2, angle=0, bras='tend_d'), E(2.2, x=380, pose='danse', expression='joie', bras='bas')),
          perso('lui', E(0, x=480, pose='assis', expression='timide'), E(1.4, pose='tremble', expression='gene', signes=['rougeur_pleine']), E(2.4, pose='danse', expression='timide'), E(3.4, expression='rire'))],
         objets=[O('musique', 250, 140, 0.6, de=0.3, flotte=True), O('musique', 520, 160, 0.5, de=1.4, flotte=True)]),
    plan(4.5, "Les deux dansent, collés, les yeux fermés, des notes et des cœurs ; il lui marche sur la patte ; elle fait une grimace, puis rit ; ils continuent, un peu moins vite.",
         [perso('lui', E(0, x=300, pose='danse', expression='content', bras='tend_d'), E(2.0, expression='gene', signes=['sueur']), E(3.2, expression='rire')),
          perso('elle', E(0, x=400, pose='danse', expression='amour', bras='tend_g'), E(1.8, expression='choque', signes=['exclamation']), E(2.6, expression='rire'))],
         objets=[O('musique', 220, 130, 0.6, de=0.2, flotte=True), O('musique', 500, 150, 0.5, de=0.8, flotte=True)] + COEURS(350, 140, de=0.6, n=2), sons=[{'nom': 'splat', 'a': 1.8}]),
])

reel('ani-274', 'elle', 'toi quand ta personne prépare la valise pour deux', lieu='sortir', plans=[
    plan(4, "Une valise ouverte au milieu ; elle fait des allers-retours en courant, un pull, un bonnet, un livre, une écharpe : tout rentre dans la valise ; lui arrive avec une seule chaussette.",
         [perso('elle', E(0, x=120, angle=90, pose='court', expression='determine', bras='tient'), E(1.0, x=300, pose='debout'), E(1.3, x=300, angle=-90, pose='court'), E(2.2, x=120, pose='debout'), E(2.5, angle=90, pose='court'), E(3.4, x=300, pose='debout'), E(3.7, angle=0)),
          perso('lui', entre(500, 1.8, 3.2, depuis='droite', pose='marche', expression='content', bras='tient'))],
         objets=[O('valise', 330, 345, 1.3), O('pull', 120, 300, 0.6, de=0, a=1.0), O('bonnet', 120, 300, 0.6, de=2.2, a=3.4), O('chaussettes', 500, 300, 0.5, de=1.8)], textes=[TITRE('toi quand ta personne prépare la valise pour deux')]),
    plan(4, "Elle appuie sur la valise à deux pattes, en plein effort, ça ne ferme pas ; elle saute dessus ; ça ne ferme toujours pas ; lui regarde, sa chaussette à la patte.",
         [perso('elle', E(0, x=300, expression='effort', bras='tend_d', signes=['sueurs']), E(1.2, pose='saut', y=330, expression='determine'), E(1.8, y=380, pose='debout', expression='effort', bras='tend_d'), E(3.0, expression='exaspere', signes=['veine'])),
          perso('lui', E(0, x=500, expression='content', bras='tient'), E(2.0, expression='pensif', signes=['points']))],
         objets=[O('valise', 330, 345, 1.3), O('chaussettes', 500, 300, 0.5)], sons=[{'nom': 'saut', 'a': 1.2}, {'nom': 'coussin', 'a': 1.8}]),
    plan(4.5, "Lui vient s'asseoir sur la valise, tout content, et elle ferme d'un coup ; il reste assis dessus, fier, la chaussette à la patte ; elle, les pattes sur les hanches, hausse les épaules et sourit.",
         [perso('lui', E(0, x=500, expression='idee', signes=['ampoule']), marche(500, 340, 0.6, 1.4, expression='determine'), E(1.8, x=330, y=300, pose='assis', expression='fier', bras='tient', taille=230)),
          perso('elle', E(0, x=300, expression='exaspere'), E(1.4, x=200, expression='surpris'), E(2.6, bras='hanches', expression='rire'))],
         objets=[O('valise', 330, 345, 1.3), O('chaussettes', 330, 260, 0.5, de=1.8), O('etincelles', 330, 230, 0.5, de=2.0, a=3.0)], sons=[{'nom': 'pose', 'a': 1.8}]),
])

reel('ani-275', 'lui', 'toi quand ta personne te fait un massage « 2 min »', lieu='tendresse', plans=[
    plan(4, "Elle assise par terre, de dos à moitié, les épaules qui tombent, fatiguée ; lui derrière elle, les pattes sur ses épaules, masse, appliqué ; elle ferme les yeux, zen.",
         [perso('elle', E(0, x=360, pose='assis', expression='fatigue', taille=230), E(1.2, expression='zen')),
          perso('lui', E(0, x=250, expression='concentre', bras='tend_d'), E(2.4, expression='content'))],
         textes=[TITRE('toi quand ta personne te fait un massage « 2 min »')]),
    plan(4, "« 30 s plus tard » en bas. Il masse plus mollement, bâille, regarde l'heure ; elle ouvre un œil, soupçonneuse ; il reprend à fond, fatigué, en sueur.",
         [perso('lui', E(0, x=250, expression='content', bras='tend_d'), E(0.8, expression='baille'), E(1.8, expression='fatigue'), E(2.6, expression='effort', signes=['sueur'])),
          perso('elle', E(0, x=360, pose='assis', expression='zen', taille=230), E(2.0, expression='suspicieux', vers=-1), E(3.0, expression='zen'))],
         objets=[O('horloge', 540, 110, 0.7)], textes=[BAS('30 s plus tard')]),
    plan(4.5, "« 2 min plus tard » en bas. Il s'est endormi debout, la tête posée sur son épaule à elle, des z ; elle, les yeux ouverts, blasée ; puis elle sourit et ne bouge plus pour ne pas le réveiller.",
         [perso('lui', E(0, x=270, pose='penche_d', expression='dodo', signes=['zzz'], bras='tend_d')),
          perso('elle', E(0, x=360, pose='assis', expression='blase', taille=230, vers=-1), E(2.2, expression='amour'))],
         objets=[O('horloge', 540, 110, 0.7), O('coeur', 400, 170, 0.35, de=2.6, flotte=True)], textes=[BAS('2 min plus tard')]),
])

reel('ani-276', 'elle', 'toi quand ta personne répond « ok. »', lieu='téléphone', plans=[
    plan(4, "Lui au milieu, le téléphone à la patte, content ; il lit la réponse ; en haut s'écrit « ok. » ; son visage se décompose, les yeux ronds, une goutte de sueur.",
         [perso('lui', E(0, x=320, expression='content', bras='tient'), E(2.0, expression='surpris'), E(2.8, expression='nerveux', signes=['sueur']))],
         objets=[O('telephone', 320, 300, 0.55)], textes=[TITRE('toi quand ta personne répond « ok. »', a=1.6), DIT('« ok. »', de=1.8)]),
    plan(4, "Il relit, panique, fait les cent pas en courant d'un bord à l'autre, le téléphone à la patte, des sueurs, puis se met en boule : qu'est-ce qu'il a fait ?",
         [perso('lui', E(0, x=320, expression='panique', bras='tient', signes=['sueurs']), E(0.6, x=320, angle=90, pose='court'), E(1.4, x=520, pose='debout'), E(1.7, angle=-90, pose='court'), E(2.6, x=180, pose='debout'), E(2.9, angle=0, pose='boule', expression='peur', signes=['sueurs', 'question']))],
         objets=[O('telephone', 320, 300, 0.55, a=0.6), O('question', 180, 160, 0.5, de=3.0)]),
    plan(4.5, "Elle, de son côté, assise par terre, les deux pattes prises par un carton qu'elle porte, le téléphone coincé contre l'oreille, tranquille, sourit ; en haut : « pardon, j'avais les mains prises ».",
         [perso('elle', E(0, x=330, pose='porte_haut', bras='porte_haut', expression='content'), E(2.2, expression='rire'))],
         objets=[O('caisse', 330, 110, 1.0), O('telephone', 400, 280, 0.5)], textes=[DIT('« pardon, j\'avais les mains prises »', de=0.6)]),
])

reel('ani-277', 'les deux', 'nous deux quand on veut rentrer d\'une soirée', lieu='amis', plans=[
    plan(4, "Une soirée, des notes de musique, des étoiles ; lui à gauche, elle à droite, loin l'un de l'autre, chacun sourit poliment à quelqu'un qu'on ne voit pas ; leurs regards se croisent.",
         [perso('lui', E(0, x=170, expression='content'), E(2.0, expression='blase', vers=1)), perso('elle', E(0, x=520, expression='content'), E(2.2, expression='blase', vers=-1))],
         objets=[O('musique', 320, 120, 0.6, de=0.2, flotte=True), O('etoiles', 150, 110, 0.5), O('musique', 480, 170, 0.5, de=0.9, flotte=True)], textes=[TITRE('nous deux quand on veut rentrer d\'une soirée')]),
    plan(4, "Un petit signe de tête de lui ; un petit signe de tête d'elle ; sans un mot, chacun recule à petits pas vers le bord, le doigt sur la bouche, l'auréole au-dessus de la tête.",
         [perso('lui', E(0, x=170, expression='suspicieux', vers=1), E(0.8, expression='chut', bras='bouche', signes=['halo']), E(1.4, x=170, angle=-90, pose='marche'), E(3.6, x=-140)),
          perso('elle', E(0, x=520, expression='suspicieux', vers=-1), E(1.0, expression='chut', bras='bouche', signes=['halo']), E(1.6, x=520, angle=90, pose='marche'), E(3.8, x=820))],
         objets=[O('musique', 320, 120, 0.6, de=0.2, flotte=True)]),
    plan(4.5, "« 20 min plus tard » en bas. Le canapé, chez eux, en pyjama, sous le plaid, chacun sa tasse, les yeux fermés de bonheur ; des cœurs ; la meilleure partie de la soirée.",
         [SUR_CANAPE('lui', 226, expression='zen', bras='tient'), SUR_CANAPE('elle', 414, expression='zen', bras='tient')],
         meubles=['canape_fond'], objets=[O('couverture', 320, 318, 2.6), O('tasse', 226, 290, 0.5), O('tasse', 414, 290, 0.5)] + COEURS(320, 140, de=0.8), textes=[BAS('20 min plus tard')]),
])

reel('ani-278', 'lui', 'toi quand ta personne te garde la place au chaud', lieu='nuit', son='tendre', plans=[
    plan(4, "La nuit, la lune ; le lit ; elle se lève de son côté en traînant, sort par la droite ; lui, réveillé à moitié, la regarde partir.",
         [perso('elle', AU_LIT(394, expression='fatigue'), E(0.8, x=560, y=380, taille=250, pose='debout', bras='bas', pattes='debout', angle=90), E(1.0, pose='marche'), E(2.4, x=820)),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo'), E(1.6, expression='fatigue', pose='allonge', vers=1))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], textes=[TITRE('toi quand ta personne te garde la place au chaud')]),
    plan(4, "Il roule de son côté à elle, s'y installe, les yeux fermés, de la vapeur ; puis il entend la porte, roule à sa place à lui, et fait semblant de dormir, l'auréole.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='fatigue'), E(1.0, x=394, expression='zen', signes=['vapeur']), E(2.6, x=248, expression='dodo', signes=['halo']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], sons=[{'nom': 'porte', 'a': 2.3}]),
    plan(4.5, "Elle revient par la droite, grelottante, se recouche : son côté est tout chaud ; elle s'étonne, regarde lui qui « dort », comprend, et fond ; un cœur ; il sourit les yeux fermés.",
         [perso('elle', E(0.2, x=820, angle=-90, pose='marche', expression='froid', signes=['frissons']), E(1.4, x=560, pose='debout'), E(1.6, x=394, y=346, taille=200, bras='aucun', pattes='aucune', angle=0), E(2.2, expression='surpris', signes=['vapeur']), E(3.0, expression='amour', vers=-1)),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['halo']), E(3.4, expression='content'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('coeur', 320, 190, 0.4, de=3.2, flotte=True)]),
])

reel('ani-279', 'les deux', 'nous deux devant nos photos du début', lieu='tendresse', son='tendre', plans=[
    plan(4, "Le canapé ; les deux penchés sur le même téléphone, émus, les yeux brillants ; elle fait défiler ; un petit cœur monte.",
         [SUR_CANAPE('lui', 260, expression='emu', vers=1), SUR_CANAPE('elle', 380, expression='emu', bras='tient')],
         meubles=['canape_fond'], objets=[O('telephone', 330, 290, 0.6), O('coeur', 320, 170, 0.35, de=1.6, flotte=True)], textes=[TITRE('nous deux devant nos photos du début')]),
    plan(4, "Une photo les fait éclater de rire ; une autre les fait rougir ; une autre encore : ils se cachent les yeux tous les deux, morts de honte.",
         [perso('lui', E(0, x=260, y=318, taille=210, pose='assis', expression='rire'), E(1.4, expression='timide', signes=['rougeur_pleine']), E(2.6, expression='honte', bras='visage', pose='assis')),
          perso('elle', E(0, x=380, y=318, taille=210, pose='assis', expression='rire', bras='tient'), E(1.4, expression='timide', signes=['rougeur_pleine']), E(2.6, expression='honte', bras='visage', pose='assis'))],
         meubles=['canape_fond'], objets=[O('telephone', 330, 290, 0.6, a=2.6), O('telephone', 330, 345, 0.6, de=2.6)]),
    plan(4.5, "Ils se regardent, les mêmes qu'avant ; il lui prend la patte ; elle pose la tête sur son épaule ; ils regardent la dernière photo, nostalgiques ; des cœurs ; puis elle propose d'en refaire une.",
         [perso('lui', E(0, x=260, y=318, taille=210, pose='assis', expression='nostalgique', vers=1), E(1.0, bras='tend_d', expression='amour')),
          perso('elle', E(0, x=380, y=318, taille=210, pose='assis', expression='nostalgique', vers=-1), E(1.4, x=350, pose='penche_g', expression='amour'), E(3.2, expression='idee', signes=['ampoule'], bras='tient'))],
         meubles=['canape_fond'], objets=[O('telephone', 350, 290, 0.6, de=3.2)] + COEURS(305, 140, de=1.6)),
])

reel('ani-280', 'elle', 'toi quand ta personne entend un bruit la nuit', lieu='nuit', plans=[
    plan(4, "La nuit, la lune ; le lit ; elle se redresse d'un coup, les yeux ronds, apeurée, un point d'exclamation ; lui dort ; elle le secoue ; il grogne.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo'), E(0.6, pose='debout', bras='aucun', pattes='aucune', expression='peur', signes=['exclamation', 'sueurs']), E(2.0, bras='tend_g')),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']), E(2.6, expression='exaspere', pose='allonge'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], textes=[TITRE('toi quand ta personne entend un bruit la nuit')], sons=[{'nom': 'tape', 'a': 0.4}]),
    plan(4, "Elle le pousse hors du lit du côté gauche ; il se lève en traînant, prend la lampe, et avance vers la gauche en tremblant, pas rassuré ; elle, sous l'oreiller, ne regarde plus.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='exaspere'), E(0.8, x=130, y=380, taille=250, pose='debout', bras='tient', pattes='debout', expression='fatigue'), E(1.6, pose='tremble', expression='peur', signes=['sueurs']), E(2.2, x=130, angle=-90, pose='marche'), E(3.8, x=-140)),
          perso('elle', AU_LIT(394, expression='peur', bras='tend_g'), E(1.4, bras='tete', expression='panique'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('lampe', 130, 300, 0.8, de=0.8, etapes=[{'a': 2.2, 'x': 130}, {'a': 3.8, 'x': -140}]), O('oreiller', 394, 230, 1.0, de=1.4)]),
    plan(4.5, "Il revient par la gauche, blasé, le chat dans les bras : c'était lui ; il le pose sur le lit ; elle sort de sous l'oreiller, honteuse, puis rit ; le chat s'installe entre eux ; un cœur.",
         [perso('lui', entre(180, 0.2, 1.6, pose='marche', expression='blase', bras='tient'), E(2.2, x=248, y=346, taille=200, pose='debout', bras='aucun', pattes='aucune', expression='content', angle=0)),
          perso('elle', AU_LIT(394, expression='panique', bras='tete'), E(2.0, bras='aucun', expression='honte', signes=['rougeur_pleine']), E(3.4, expression='rire'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('chat', 180, 300, 0.6, de=0.2, etapes=[{'a': 1.6, 'x': 180}, {'a': 2.2, 'x': 320, 'y': 335}]), O('oreiller', 394, 230, 1.0, a=2.0), O('coeur', 320, 200, 0.35, de=3.6, flotte=True)]),
])

reel('ani-281', 'les deux', 'nous deux quand on se croise à 3 h dans le couloir', lieu='nuit', son='tendre', plans=[
    plan(4, "La nuit, un couloir, une porte à chaque bout ; lui sort de la gauche en traînant, les yeux fermés ; elle sort de la droite pareil ; ils avancent l'un vers l'autre sans se voir.",
         [perso('lui', E(0, x=-140, angle=90, pose='marche', expression='dodo'), E(2.4, x=280, pose='debout')),
          perso('elle', E(0.2, x=820, angle=-90, pose='marche', expression='dodo'), E(2.6, x=410, pose='debout'))],
         objets=[O('lune', 320, 85, 0.6), O('porte', 60, 230, 1.6, derriere=True), O('porte', 580, 230, 1.6, derriere=True)], textes=[TITRE('nous deux quand on se croise à 3 h dans le couloir')]),
    plan(4, "Ils se rentrent dedans ; les deux sursautent, les yeux ronds, deux points d'exclamation ; ils se reconnaissent, soulagés ; ils rient tout bas, encore à moitié endormis.",
         [perso('lui', E(0, x=280, expression='dodo'), E(0.4, expression='surpris', signes=['exclamation'], angle=0), E(1.6, expression='soulage'), E(2.6, expression='rire')),
          perso('elle', E(0, x=410, expression='dodo'), E(0.4, expression='surpris', signes=['exclamation'], angle=0), E(1.6, expression='soulage'), E(2.6, expression='rire'))],
         objets=[O('lune', 320, 85, 0.6), O('porte', 60, 230, 1.6, derriere=True), O('porte', 580, 230, 1.6, derriere=True)], sons=[{'nom': 'boing', 'a': 0.3}]),
    plan(4.5, "Un câlin au milieu du couloir, les yeux fermés, un petit cœur ; puis chacun repart de son côté en traînant, elle vers la gauche, lui vers la droite : ils ont échangé.",
         [perso('lui', E(0, x=290, pose='penche_d', bras='tend_d', expression='calin'), E(1.6, pose='debout', bras='bas', expression='dodo'), E(1.9, x=290, angle=90, pose='marche'), E(4.2, x=820)),
          perso('elle', E(0, x=400, pose='penche_g', bras='tend_g', expression='calin'), E(1.6, pose='debout', bras='bas', expression='dodo'), E(1.9, x=400, angle=-90, pose='marche'), E(4.2, x=-140))],
         objets=[O('lune', 320, 85, 0.6), O('porte', 60, 230, 1.6, derriere=True), O('porte', 580, 230, 1.6, derriere=True), O('coeur', 345, 160, 0.4, de=0.4, a=1.8, flotte=True)]),
])

reel('ani-282', 'lui', 'toi quand ta personne te fait essayer son nouveau sport', lieu='sport', plans=[
    plan(4, "Elle, au milieu, s'étire de toute sa hauteur, zen, les bras au ciel, parfaitement droite ; lui arrive de la droite, curieux, et se place à côté d'elle pour faire pareil.",
         [fixe('elle', 270, pose='etire', bras='leves', expression='zen'),
          perso('lui', entre(450, 0.2, 1.6, depuis='droite', expression='curieux'), E(2.4, pose='etire', bras='leves', expression='concentre'))],
         textes=[TITRE('toi quand ta personne te fait essayer son nouveau sport')]),
    plan(4, "Elle se penche d'un côté, tranquille ; il se penche aussi, en forçant, les sueurs ; elle se penche de l'autre côté ; il tremble de partout, les yeux plissés.",
         [perso('elle', E(0, x=270, pose='penche_g', bras='leves', expression='zen'), E(2.0, pose='penche_d')),
          perso('lui', E(0, x=450, pose='penche_g', bras='leves', expression='effort', signes=['sueurs']), E(2.0, pose='penche_d'), E(2.6, pose='tremble', expression='effort', signes=['sueurs', 'tremblement']))]),
    plan(4.5, "Elle finit en boule, zen, parfaite ; lui perd l'équilibre, bascule et s'étale de tout son long, les yeux en croix ; elle rouvre un œil, soupire, et vient se coucher à côté de lui : fin de séance.",
         [perso('elle', E(0, x=270, pose='boule', expression='zen'), E(2.2, expression='blase', vers=1), E(3.2, x=330, pose='allonge', expression='content')),
          perso('lui', E(0, x=450, pose='tremble', expression='effort', signes=['tremblement']), E(1.0, pose='tombe', expression='panique'), E(1.6, pose='allonge', expression='ko', signes=['tourbillon']))],
         sons=[{'nom': 'splat', 'a': 1.5}]),
])
