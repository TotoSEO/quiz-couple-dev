# Deuxième lot : vingt-cinq reels, novembre.
from usine import *


reel('ani-213', 'lui', 'toi quand ta personne dit « encore 5 min » le matin', lieu='matin', plans=[
    plan(4, "Le lit, le réveil sonne, une horloge en haut à droite ; elle se redresse d'un coup, les yeux ronds, puis fatiguée ; lui dort allongé, des z ; en haut s'écrit « encore 5 min ».",
         [perso('elle', AU_LIT(394, expression='dodo'), E(0.5, expression='surpris', signes=['exclamation']), E(1.6, expression='fatigue', vers=-1)),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']), E(2.4, expression='baille'), E(3.0, expression='dodo', signes=['zzz']))],
         meubles=['lit_fond'], objets=[O('horloge', 545, 85, 0.7)], textes=[TITRE('toi quand ta personne dit « encore 5 min » le matin', a=2.2), DIT('« encore 5 min »', de=2.4)], sons=[{'nom': 'reveil', 'a': 0.2}]),
    plan(3.5, "« 20 min plus tard » en bas. Elle sort du lit par la droite, se lève, blasée ; lui n'a pas bougé, toujours allongé, une bulle au nez.",
         [perso('elle', AU_LIT(394, expression='blase'), E(1.2, x=560, y=380, taille=250, pose='debout', bras='bas', pattes='debout', expression='blase')),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz', 'bulle_nez']))],
         meubles=['lit_fond'], objets=[O('horloge', 545, 85, 0.7)], textes=[BAS('20 min plus tard')]),
    plan(4.5, "« 1 h plus tard » en bas. Elle, debout à droite, habillée, une tasse à la patte, blasée ; lui dort toujours ; d'un coup il se redresse, panique, des rayons autour de lui : il est en retard.",
         [perso('elle', E(0, x=540, expression='blase', bras='tient'), E(3.2, expression='narquois', vers=-1)),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']), E(2.6, pose='debout', bras='aucun', pattes='aucune', expression='panique', signes=['rayons']))],
         meubles=['lit_fond'], objets=[O('horloge', 545, 85, 0.7), O('tasse', 540, 300, 0.5)], textes=[BAS('1 h plus tard')], sons=[{'nom': 'boing', 'a': 2.6}]),
])

reel('ani-214', 'elle', 'toi quand ta personne te raconte sa journée', lieu='canapé', plans=[
    plan(4, "Le canapé ; elle à droite raconte, les bras qui s'agitent, joyeuse puis en colère puis morte de rire ; lui à gauche écoute, tourné vers elle, attentif.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='joie', bras='leves'), E(1.3, expression='colere', bras='tend_g'), E(2.6, expression='rire', bras='leves')),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='ecoute', vers=1))],
         meubles=['canape_fond'], textes=[TITRE('toi quand ta personne te raconte sa journée')]),
    plan(4, "« 20 min plus tard » en bas. Elle raconte encore, choquée puis surprise puis joyeuse ; lui écoute toujours, puis attend, puis fatigue, les yeux qui tombent.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='choque', bras='joues'), E(1.3, expression='surpris', bras='tend_g'), E(2.6, expression='joie', bras='leves')),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='ecoute', vers=1), E(1.5, expression='attend'), E(3.0, expression='fatigue'))],
         meubles=['canape_fond'], textes=[BAS('20 min plus tard')]),
    plan(4.5, "« 1 h plus tard » en bas. Elle raconte toujours ; lui a les yeux en spirale, hypnotisé ; elle s'arrête, le regarde, le pousse d'une patte ; il sursaute et fait oui de la tête, tout content.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='joie', bras='leves'), E(1.8, expression='perplexe', vers=-1, bras='bas'), E(2.6, bras='tend_g'), E(3.6, expression='blase')),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='hypnotise', signes=['tourbillon']), E(2.9, expression='surpris', signes=['exclamation']), E(3.5, expression='content', bras='pouce'))],
         meubles=['canape_fond'], textes=[BAS('1 h plus tard')]),
])

reel('ani-215', 'lui', 'toi quand ta personne cherche ses clés', lieu='maison', plans=[
    plan(4, "Lui traverse la pièce en courant dans un sens puis dans l'autre, paniqué, des gouttes de sueur ; elle, debout à droite, le regarde passer, blasée.",
         [perso('lui', E(0, x=200, angle=90, pose='court', expression='panique', signes=['sueurs']), E(1.4, x=520), E(1.7, x=520, angle=-90, pose='court'), E(3.2, x=200, pose='debout'), E(3.6, angle=0)),
          fixe('elle', 470, expression='blase')],
         textes=[TITRE('toi quand ta personne cherche ses clés')]),
    plan(4, "En haut : « t'as pas vu mes clés ? ». Il soulève un coussin, regarde dessous, inquiet ; rien ; il se gratte la tête ; elle, les bras croisés, regarde sa patte à lui, puis pointe du doigt.",
         [perso('lui', E(0, x=200, expression='inquiet', bras='leves'), E(1.6, expression='confus', bras='tete', signes=['question']), E(3.0, expression='surpris', vers=1)),
          perso('elle', E(0, x=470, expression='blase', bras='croises'), E(2.2, expression='narquois'), E(2.8, bras='pointe', vers=-1))],
         objets=[O('coussin', 200, 190, 0.9, a=1.6), O('coussin', 120, 350, 0.9, de=1.6)], textes=[DIT("« t'as pas vu mes clés ? »")]),
    plan(4, "Il baisse les yeux : les clés sont dans son autre patte depuis le début ; il devient tout rouge, gêné, une goutte de sueur ; elle rit, puis hausse les épaules, tendre.",
         [perso('lui', E(0, x=200, expression='surpris', bras='tient', vers=-1), E(1.2, expression='gene', signes=['sueur', 'rougeur_pleine']), E(3.0, expression='timide')),
          perso('elle', E(0, x=470, expression='narquois', bras='pointe', vers=-1), E(1.4, expression='rire', bras='bas'), E(3.0, expression='amour'))],
         objets=[O('cle', 200, 300, 0.5), O('coussin', 120, 350, 0.9), O('coeur', 440, 170, 0.35, de=3.2, flotte=True)]),
])

reel('ani-216', 'elle', 'toi quand ta personne tire le plaid', lieu='canapé', plans=[
    plan(3.5, "Le canapé, les deux assis sous le même plaid, contents, bien au chaud ; elle regarde vers lui en coin, l'air de rien, malicieuse.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='content')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='content'), E(2.0, expression='malicieux', vers=-1))],
         meubles=['canape_fond'], objets=[O('couverture', 320, 318, 2.6)], textes=[TITRE('toi quand ta personne tire le plaid')]),
    plan(4, "Elle tire le plaid vers elle d'un coup ; lui se retrouve découvert, surpris, puis grelotte, des frissons ; il tire à son tour, elle se retrouve découverte et boude.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='malicieux'), E(1.4, expression='zen'), E(2.6, expression='boude', signes=['frissons'])),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='content'), E(0.8, expression='surpris', signes=['exclamation']), E(1.6, expression='froid', signes=['frissons']), E(2.6, expression='fier'))],
         meubles=['canape_fond'], objets=[O('couverture', 320, 318, 2.6, etapes=[{'a': 0.3, 'x': 320}, {'a': 0.8, 'x': 440}, {'a': 2.2, 'x': 440}, {'a': 2.7, 'x': 210}])]),
    plan(4.5, "Elle grimpe sur ses genoux et s'installe sous le plaid avec lui, contente ; lui, d'abord écrasé, puis content ; le plaid revient au milieu, des cœurs montent.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='fier'), E(1.4, expression='bouche_bee'), E(2.6, expression='content')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='boude', signes=['frissons']), E(0.6, expression='determine'), E(1.4, x=250, y=250, taille=160, expression='content'))],
         meubles=['canape_fond'], objets=[O('couverture', 210, 318, 2.6, etapes=[{'a': 1.0, 'x': 210}, {'a': 1.6, 'x': 260}]), O('coeur', 290, 110, 0.4, de=2.8, flotte=True)]),
])

reel('ani-217', 'lui', "nous deux quand on marche pas à la même vitesse", lieu='dehors', plans=[
    plan(4, "Dehors, un arbre à droite ; les deux entrent par la gauche en marchant main dans la main, au même pas, contents ; ils arrivent au milieu.",
         [perso('lui', E(0, x=-140, angle=90, pose='marche', expression='content', bras='tend_g'), E(2.2, x=380, pose='debout'), E(2.6, angle=0)),
          perso('elle', E(0, x=-260, angle=90, pose='marche', expression='joie', bras='tend_d'), E(2.2, x=260, pose='debout'), E(2.6, angle=0))],
         objets=[O('arbre', 515, 255, 1.3, derriere=True)], textes=[TITRE("nous deux quand on marche pas à la même vitesse")]),
    plan(4, "Il repart à grands pas vers la droite, décidé ; elle essaie de suivre en courant, essoufflée, puis s'arrête, plante les pattes et croise les bras ; il sort du cadre sans la voir.",
         [perso('lui', E(0, x=380, angle=90, pose='marche', expression='determine'), E(2.6, x=820)),
          perso('elle', E(0, x=260, angle=90, pose='court', expression='essouffle', signes=['sueur']), E(1.6, x=380, pose='debout', expression='agace'), E(2.0, angle=0, bras='croises'))],
         objets=[O('arbre', 515, 255, 1.3, derriere=True)]),
    plan(4.5, "Il revient par la droite en courant, désolé ; elle, assise par terre, boude ; il se baisse, la prend sur son dos, et repart en marchant avec elle perchée dessus, contente.",
         [perso('elle', E(0, x=380, pose='assis', expression='boude', bras='croises'), E(2.2, x=330, y=258, taille=150, pose='assis', expression='content', bras='bas'), E(2.8, x=330), E(4.4, x=640)),
          perso('lui', entre(330, 0, 1.4, depuis='droite', expression='desole'), E(2.0, bras='leves', expression='content', taille=270), E(2.8, x=330, angle=90, pose='marche'), E(4.4, x=640))],
         objets=[O('arbre', 515, 255, 1.3, derriere=True), O('coeur', 420, 110, 0.35, de=2.6, flotte=True)]),
])

reel('ani-218', 'lui', "toi quand ta personne demande « j'suis belle ? »", lieu='sortir', plans=[
    plan(4, "Elle à gauche dans un nouveau pull, timide, prend la pose ; lui à droite, le nez dans son téléphone, content, ne lève pas les yeux ; en haut s'écrit « j'suis belle ? ».",
         [perso('elle', E(0, x=280, expression='timide'), E(2.2, expression='content', bras='hanches')),
          perso('lui', E(0, x=470, expression='content', bras='tient'))],
         objets=[O('pull', 280, 300, 1.2), O('telephone', 470, 300, 0.55)], textes=[TITRE("toi quand ta personne demande « j'suis belle ? »", a=2.0), DIT("« j'suis belle ? »", de=2.2)]),
    plan(4, "Il lève les yeux, surpris, réfléchit, des petits points, puis lève le pouce, content de lui ; elle attend, puis devient blasée, les bras ballants.",
         [perso('lui', E(0, x=470, expression='surpris', vers=-1, bras='bas'), E(1.0, expression='pensif', signes=['points']), E(2.2, expression='content', bras='pouce')),
          perso('elle', E(0, x=280, expression='attend', bras='hanches'), E(2.8, expression='blase', bras='bas'))],
         objets=[O('pull', 280, 300, 1.2)]),
    plan(4.5, "Elle se détourne et boude ; il comprend, panique, court jusqu'à elle et la serre dans ses bras ; elle fait la tête encore une seconde, puis fond ; des cœurs.",
         [perso('elle', E(0, x=280, expression='boude', vers=1, bras='croises'), E(2.4, expression='narquois'), E(3.4, expression='transi', bras='tend_d', pose='penche_d')),
          perso('lui', E(0, x=470, expression='panique', signes=['sueurs']), marche(470, 390, 0.8, 1.8, pose='court', expression='desole', tourne=False), E(2.0, angle=0, bras='tend_g', pose='penche_g', expression='calin'))],
         objets=[O('pull', 280, 300, 1.2)] + COEURS(335, 150, de=3.0)),
])

reel('ani-219', 'lui', 'toi quand ta personne ronfle', lieu='nuit', plans=[
    plan(4, "La nuit, la lune ; le lit ; lui dort allongé à gauche, et des notes de musique sortent de lui à chaque ronflement ; elle, assise à droite, les yeux ouverts, attend, puis s'agace.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['bulle_nez'])),
          perso('elle', AU_LIT(394, expression='attend'), E(2.0, expression='agace', vers=-1))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('musique', 200, 200, 0.5, de=0.4, a=1.4, flotte=True), O('musique', 220, 190, 0.5, de=1.8, a=2.8, flotte=True), O('musique', 200, 200, 0.5, de=3.2, flotte=True)],
         textes=[TITRE('toi quand ta personne ronfle')]),
    plan(4, "Elle se met l'oreiller sur la tête, les pattes dessus ; les notes continuent ; elle le pousse d'un coup, il roule sur le côté sans se réveiller ; silence ; elle souffle, soulagée.",
         [perso('elle', AU_LIT(394, expression='exaspere', signes=['veine']), E(0.8, bras='tete'), E(2.0, bras='tend_g', expression='colere'), E(3.0, expression='soulage', bras='aucun')),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['bulle_nez']), E(2.2, x=180, signes=['zzz']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('oreiller', 394, 215, 1.0, de=0.8, a=2.0), O('musique', 200, 200, 0.5, de=0.3, a=1.3, flotte=True)], sons=[{'nom': 'coussin', 'a': 0.8}]),
    plan(4.5, "« 2 min plus tard » en bas. Elle s'est rallongée, apaisée ; une note repart de lui, puis deux ; elle rouvre un œil, blasée, et remet l'oreiller sur sa tête.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='zen'), E(1.8, pose='debout', bras='aucun', pattes='aucune', expression='blase', vers=-1), E(3.0, bras='tete', expression='exaspere')),
          perso('lui', E(0, x=180, y=346, taille=200, pose='allonge', expression='dodo', signes=['bulle_nez']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('musique', 140, 200, 0.5, de=1.2, flotte=True), O('musique', 170, 180, 0.5, de=2.2, flotte=True), O('oreiller', 394, 215, 1.0, de=3.0)],
         textes=[BAS('2 min plus tard')], sons=[{'nom': 'coussin', 'a': 3.0}]),
])

reel('ani-220', 'les deux', 'nous deux quand on doit choisir un film', lieu='canapé', plans=[
    plan(4, "Le canapé, la télé en haut ; lui a une idée, une ampoule ; elle fait la grimace, dégoûtée ; elle a une idée à son tour ; lui fait la grimace.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='idee', signes=['ampoule']), E(1.2, expression='content'), E(2.6, expression='degoute')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='content'), E(1.2, expression='degoute'), E(2.4, expression='idee', signes=['ampoule']))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8)], textes=[TITRE('nous deux quand on doit choisir un film')]),
    plan(4, "« 1 h plus tard » en bas. Les deux fatigués, la tête dans les pattes ; lui propose encore, sans conviction ; elle fait non ; elle propose ; il fait non ; les deux soupirent.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='fatigue', bras='visage'), E(1.2, expression='hesite', bras='bas'), E(2.4, expression='decu')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='fatigue', bras='visage'), E(1.2, expression='decu', bras='bas'), E(2.4, expression='hesite'), E(3.2, expression='fatigue'))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8)], textes=[BAS('1 h plus tard')]),
    plan(4.5, "« 2 h plus tard » en bas. La télé montre toujours le menu ; les deux dorment l'un contre l'autre au milieu du canapé, des z ; un petit cœur monte ; rien n'a été choisi.",
         [perso('lui', E(0, x=270, y=318, taille=210, pose='assis', expression='dodo', signes=['zzz'])),
          perso('elle', E(0, x=370, y=318, taille=210, pose='assis', expression='dodo'))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('coeur', 320, 230, 0.35, de=1.5, flotte=True)], textes=[BAS('2 h plus tard')]),
])

reel('ani-221', 'elle', 'toi quand ta personne fait un cauchemar', lieu='nuit', son='tendre', plans=[
    plan(4, "La nuit, la lune ; le lit ; les deux dorment ; elle tremble dans son sommeil, des gouttes de sueur, puis se réveille d'un coup, les yeux ronds, apeurée ; lui dort.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo'), E(1.0, expression='peur', pose='allonge', signes=['sueurs', 'tremblement']), E(2.4, pose='debout', bras='aucun', pattes='aucune', expression='panique')),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], textes=[TITRE('toi quand ta personne fait un cauchemar')]),
    plan(4, "Elle regarde autour d'elle, inquiète, puis glisse vers lui et le pousse ; il se réveille, confus, un point d'interrogation, puis la voit et s'inquiète ; il se redresse et lui ouvre les bras.",
         [perso('elle', AU_LIT(394, expression='inquiet'), E(1.2, x=330), E(2.0, expression='triste', signes=['larme'])),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']), E(1.5, pose='debout', bras='aucun', pattes='aucune', expression='confus', signes=['question']), E(2.4, expression='inquiet', vers=1), E(3.2, bras='leves', expression='calin'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)]),
    plan(4.5, "Elle se blottit contre lui, les deux assis dans le lit, le câlin, les yeux fermés ; des cœurs montent ; au bout d'un moment il se rendort assis, le menton sur sa tête à elle, et elle sourit.",
         [perso('lui', E(0, x=260, y=346, taille=200, pose='debout', bras='tend_d', pattes='aucune', expression='calin'), E(3.2, expression='dodo', signes=['zzz'])),
          perso('elle', E(0, x=350, y=346, taille=190, pose='debout', bras='tend_g', pattes='aucune', expression='calin'), E(2.2, expression='content'), E(3.6, expression='amour'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)] + COEURS(305, 140, de=0.6)),
])

reel('ani-222', 'elle', "toi quand tu demandes « ça va ? » et qu'elle dit « oui. »", lieu='dispute', plans=[
    plan(4.5, "Elle à droite, tournée vers le bord, les bras croisés, un nuage noir, boude ; lui à gauche s'inquiète ; en haut s'écrit « ça va ? » puis « oui. » ; le nuage ne bouge pas.",
         [fixe('elle', 450, expression='boude', bras='croises', vers=1, signes=['nuage_noir']),
          perso('lui', E(0, x=270, expression='inquiet'), E(3.4, expression='perplexe', signes=['question']))],
         textes=[TITRE("toi quand tu demandes « ça va ? » et qu'elle dit « oui. »", a=1.6), DIT('« ça va ? »', de=1.8, a=2.9), DIT('« oui. »', de=3.1)]),
    plan(4, "Il réfléchit, des petits points, hésite, puis s'approche d'elle à petits pas et s'arrête juste à côté, timide ; elle boude toujours, vexée, sans le regarder.",
         [perso('lui', E(0, x=270, expression='pensif', signes=['points']), E(1.0, expression='hesite'), marche(270, 360, 1.4, 2.4, expression='timide'), E(3.2, expression='timide')),
          perso('elle', E(0, x=450, expression='boude', bras='croises', vers=1, signes=['nuage_noir']), E(2.4, expression='vexe'))]),
    plan(4.5, "Il ne dit rien et reste là ; elle, toujours fâchée, se laisse aller contre son épaule sans le regarder, les bras croisés, et le nuage noir rétrécit ; il sourit, un petit cœur.",
         [perso('lui', E(0, x=360, expression='timide'), E(2.0, expression='content', bras='tend_d'), E(3.4, expression='amour')),
          perso('elle', E(0, x=450, expression='vexe', bras='croises', vers=1, signes=['nuage_noir']), E(1.4, x=440, pose='penche_g', expression='boude'), E(3.0, signes=[]))],
         objets=[O('coeur', 400, 150, 0.35, de=3.4, flotte=True)]),
])

reel('ani-223', 'elle', 'toi quand ta personne dit « bon, je te laisse »', lieu='téléphone', plans=[
    plan(4, "Chacun de son côté de l'écran, loin l'un de l'autre, le téléphone à la patte, ils rient ; en haut s'écrit « bon, je te laisse » ; personne ne raccroche.",
         [perso('elle', E(0, x=190, expression='rire', bras='tient'), E(2.4, expression='content')),
          perso('lui', E(0, x=480, expression='content', bras='tient'), E(1.4, expression='rire'))],
         objets=[O('telephone', 190, 300, 0.55), O('telephone', 480, 300, 0.55)], textes=[TITRE('toi quand ta personne dit « bon, je te laisse »', a=2.0), DIT('« bon, je te laisse »', de=2.2)]),
    plan(4, "« 10 min plus tard » en bas. Toujours au téléphone, les deux ; elle raconte, joyeuse ; il rit ; elle rit ; il raconte à son tour, les bras qui s'agitent.",
         [perso('elle', E(0, x=190, expression='joie', bras='tient'), E(1.4, expression='rire'), E(2.8, expression='ecoute')),
          perso('lui', E(0, x=480, expression='rire', bras='tient'), E(2.6, expression='joie', bras='leves'))],
         objets=[O('telephone', 190, 300, 0.55), O('telephone', 480, 300, 0.55)], textes=[BAS('10 min plus tard')]),
    plan(4.5, "« 1 h plus tard » en bas. Elle s'est endormie allongée, le téléphone encore à côté d'elle, des z ; lui parle encore, content, puis s'arrête, surpris du silence, et sourit, tendre ; il garde la ligne.",
         [perso('elle', E(0, x=190, y=380, taille=250, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('lui', E(0, x=480, expression='content', bras='tient'), E(2.0, expression='surpris'), E(3.0, expression='amour'))],
         objets=[O('telephone', 100, 330, 0.5), O('telephone', 480, 300, 0.55), O('coeur', 530, 170, 0.35, de=3.2, flotte=True)], textes=[BAS('1 h plus tard')]),
])

reel('ani-224', 'lui', 'nous deux quand on range la maison', lieu='maison', plans=[
    plan(4, "Elle pousse un gros carton de la gauche vers la droite, en plein effort, des gouttes de sueur ; lui, assis par terre à droite, le téléphone à la patte, content, ne bouge pas.",
         [perso('elle', E(0, x=120, angle=90, pose='pousse', expression='effort', signes=['sueurs']), E(2.8, x=330, pose='debout'), E(3.2, angle=0)),
          fixe('lui', 500, pose='assis', expression='content', bras='tient')],
         objets=[O('caisse', 200, 330, 1.1, etapes=[{'a': 0, 'x': 200}, {'a': 2.8, 'x': 410}]), O('telephone', 500, 300, 0.55)], textes=[TITRE('nous deux quand on range la maison')]),
    plan(4, "Elle le fusille du regard, une veine sur le front ; il lève les yeux, surpris, pose le téléphone, se lève d'un bond, décidé, et pointe le carton : il supervise.",
         [perso('elle', E(0, x=330, expression='furieux', signes=['veine'], vers=1), E(2.8, expression='blase')),
          perso('lui', E(0, x=500, pose='assis', expression='content', bras='tient'), E(0.8, expression='surpris', bras='bas'), E(1.6, pose='debout', expression='determine', bras='hanches'), E(2.6, bras='pointe', expression='fier', vers=-1))],
         objets=[O('caisse', 410, 330, 1.1), O('telephone', 500, 300, 0.55, a=0.8), O('telephone', 560, 350, 0.5, de=0.8)]),
    plan(4.5, "Elle soulève le carton au-dessus de sa tête et l'emporte vers la gauche ; lui s'assoit sur le carton suivant, content, et la regarde faire ; elle sort du cadre, blasée.",
         [perso('elle', E(0, x=330, pose='porte_haut', bras='porte_haut', expression='effort'), E(1.0, x=330, angle=-90, pose='marche'), E(3.4, x=-140)),
          perso('lui', E(0, x=500, expression='fier', bras='pointe', vers=-1), E(1.2, x=480, y=330, pose='assis', expression='content', bras='bas'), E(3.4, bras='pouce'))],
         objets=[O('caisse', 330, 110, 1.0, etapes=[{'a': 0, 'x': 330}, {'a': 1.0, 'x': 330}, {'a': 3.4, 'x': -140}]), O('caisse', 480, 345, 1.1, derriere=True)]),
])

reel('ani-225', 'les deux', 'nous deux le dimanche', lieu='lit', plans=[
    plan(3.5, "« 10 h » en bas. Le lit, les deux dorment allongés côte à côte, des z partout ; rien ne bouge, à part une bulle au nez.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz', 'bulle_nez'])),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']))],
         meubles=['lit_fond'], textes=[TITRE('nous deux le dimanche', a=1.8), BAS('10 h', de=2.0)]),
    plan(4, "« midi » en bas. Lui se réveille, bâille, se redresse, regarde l'heure sur son téléphone, puis la regarde dormir, et se rallonge contre elle, zen.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo'), E(0.6, expression='baille'), E(1.4, pose='debout', bras='tient', pattes='aucune', expression='content'), E(2.4, expression='amour', vers=1, bras='aucun'), E(3.2, pose='allonge', expression='zen', x=290)),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']))],
         meubles=['lit_fond'], objets=[O('telephone', 248, 290, 0.5, de=1.4, a=2.4)], textes=[BAS('midi')]),
    plan(4.5, "« 16 h » en bas. Les deux assis dans le lit, chacun son téléphone, contents, collés l'un à l'autre ; elle pose la tête contre lui ; un petit cœur ; personne n'est sorti du lit.",
         [perso('lui', AU_LIT(270, expression='content')),
          perso('elle', AU_LIT(380, expression='content'), E(2.2, x=360, pose='penche_g', expression='amour'))],
         meubles=['lit_fond'], objets=[O('telephone', 270, 290, 0.5), O('telephone', 380, 290, 0.5, a=2.2), O('coeur', 325, 170, 0.4, de=2.6, flotte=True)], textes=[BAS('16 h')]),
])

reel('ani-226', 'elle', 'toi quand ta personne te regarde dormir', lieu='nuit', plans=[
    plan(4, "La nuit, la lune ; le lit ; lui dort allongé, la bouche ouverte, une bulle au nez ; elle, assise à côté, le regarde avec des cœurs dans les yeux.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['bulle_nez', 'zzz'])),
          perso('elle', AU_LIT(394, expression='amour', vers=-1), E(2.4, expression='malicieux'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('coeur', 420, 170, 0.35, de=0.8, a=2.4, flotte=True)], textes=[TITRE('toi quand ta personne te regarde dormir')]),
    plan(3.5, "Elle sort son téléphone, le cadre, et prend une photo de lui en train de dormir ; un petit flash ; il bouge un peu, elle se fige, l'air de rien, l'auréole au-dessus de la tête.",
         [perso('elle', AU_LIT(394, expression='malicieux', bras='tient'), E(1.6, expression='ange', signes=['halo'])),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['bulle_nez']), E(1.4, expression='baille'), E(2.2, expression='dodo', signes=['zzz']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('telephone', 394, 290, 0.5, a=1.6), O('etincelles', 330, 240, 0.5, de=1.2, a=1.6)], sons=[{'nom': 'tape', 'a': 1.2}]),
    plan(4.5, "« le lendemain » en bas. Debout, elle lui montre son téléphone, fière : la photo est son nouveau fond d'écran ; lui la découvre, bouche bée, puis mort de honte, en boule ; elle rit.",
         [perso('elle', E(0, x=290, expression='fier', bras='tend_d'), E(2.4, expression='rire')),
          perso('lui', E(0, x=470, expression='curieux', vers=-1), E(1.2, expression='bouche_bee'), E(2.4, expression='honte', pose='boule'))],
         objets=[O('telephone', 375, 300, 0.6)], textes=[BAS('le lendemain')]),
])

reel('ani-227', 'elle', 'toi quand ta personne fait les boutiques', lieu='sortir', plans=[
    plan(4, "Lui debout à droite, un sac à la patte, content ; elle entre par la gauche avec un sac, radieuse, le lui tend, et repart par la gauche en courant.",
         [fixe('lui', 470, expression='content', bras='tient'),
          perso('elle', entre(300, 0, 1.4, pose='court', expression='joie', bras='tient'), E(2.0, bras='tend_d'), sort(300, 2.6, 3.8, vers='gauche', expression='joie'))],
         objets=[O('sac', 470, 300, 0.7), O('sac', 300, 300, 0.7, a=2.0), O('sac', 390, 300, 0.7, de=2.0, a=2.6), O('sac', 410, 340, 0.7, de=2.6)], textes=[TITRE('toi quand ta personne fait les boutiques')]),
    plan(4, "« 1 h plus tard » en bas. Lui, assis par terre entre les sacs, attend, puis s'ennuie, puis pique du nez ; elle revient encore avec un sac, le pose, et repart.",
         [perso('lui', E(0, x=470, pose='assis', expression='attend'), E(1.4, expression='ennui'), E(2.8, expression='fatigue')),
          perso('elle', entre(300, 0.4, 1.6, pose='court', expression='joie', bras='tient'), sort(300, 2.4, 3.6, vers='gauche', expression='joie'))],
         objets=[O('sac', 410, 340, 0.7), O('sac', 540, 340, 0.7), O('sac', 300, 300, 0.7, de=0.4, a=2.4), O('sac', 360, 345, 0.7, de=2.4)], textes=[BAS('1 h plus tard')]),
    plan(4.5, "« 3 h plus tard » en bas. Lui, debout, les bras chargés de sacs et un sac sur la tête, blasé ; elle marche devant lui vers la droite avec une petite fleur, ravie ; il la suit en traînant.",
         [perso('elle', E(0, x=250, expression='joie', bras='tient'), E(1.0, x=250, angle=90, pose='marche'), E(3.6, x=820)),
          perso('lui', E(0, x=430, expression='blase', bras='leves'), E(1.6, x=430, angle=90, pose='marche'), E(4.2, x=820))],
         objets=[O('fleur', 250, 300, 0.5, etapes=[{'a': 1.0, 'x': 250}, {'a': 3.6, 'x': 820}]), O('sac', 360, 240, 0.7, etapes=[{'a': 1.6, 'x': 360}, {'a': 4.2, 'x': 750}]), O('sac', 500, 240, 0.7, etapes=[{'a': 1.6, 'x': 500}, {'a': 4.2, 'x': 890}]), O('sac', 430, 120, 0.7, etapes=[{'a': 1.6, 'x': 430}, {'a': 4.2, 'x': 820}])],
         textes=[BAS('3 h plus tard')]),
])

reel('ani-228', 'lui', 'toi quand ta personne dit « je gère »', lieu='maison', plans=[
    plan(4, "Une lampe penchée à gauche ; lui arrive, fier, les pattes sur les hanches, devant la lampe ; elle, à droite, le regarde faire, perplexe.",
         [perso('lui', entre(270, 0, 1.4, pose='marche', expression='fier'), E(2.0, bras='hanches', expression='fier', signes=['etincelles'])),
          fixe('elle', 470, expression='perplexe', vers=-1)],
         objets=[O('lampe', 160, 300, 1.2)], textes=[TITRE('toi quand ta personne dit « je gère »')]),
    plan(4, "Il attrape la lampe, force, concentré ; la lampe lui échappe et tombe par terre avec un bruit ; il reste figé, gêné, une goutte de sueur ; elle est blasée.",
         [perso('lui', E(0, x=270, expression='concentre', bras='tend_g', signes=['sueur']), E(1.4, expression='effort'), E(2.4, expression='gene', bras='bas', signes=['sueur'])),
          perso('elle', E(0, x=470, expression='perplexe', vers=-1), E(2.4, expression='blase'))],
         objets=[O('lampe', 160, 300, 1.2, etapes=[{'a': 0, 'y': 300}, {'a': 1.6, 'y': 300}, {'a': 2.2, 'y': 345}])], sons=[{'nom': 'splat', 'a': 2.2}]),
    plan(4.5, "Elle vient, le pousse doucement, ramasse la lampe, la pose droite d'un geste, et repart les pattes sur les hanches ; il reste là, bouche bée, puis applaudit.",
         [perso('elle', E(0, x=470, expression='blase'), marche(470, 200, 0.4, 1.6, expression='determine'), E(2.6, bras='hanches', expression='fier')),
          perso('lui', E(0, x=270, expression='gene', signes=['sueur']), E(1.4, x=330, expression='surpris'), E(2.8, expression='bouche_bee'), E(3.6, expression='bravo', bras='applaudit'))],
         objets=[O('lampe', 160, 345, 1.2, etapes=[{'a': 0, 'y': 345}, {'a': 2.0, 'y': 345}, {'a': 2.5, 'y': 300}])]),
])

reel('ani-229', 'elle', 'toi quand ta personne a les mains gelées', lieu='dehors', plans=[
    plan(4, "Dehors, des flocons ; elle à gauche grelotte, les bras croisés, des frissons ; lui à droite, écharpe autour du cou, tout content, ne se doute de rien.",
         [perso('elle', E(0, x=270, expression='froid', bras='croises', signes=['frissons']), E(2.4, expression='malicieux', vers=1)),
          fixe('lui', 450, expression='content')],
         objets=[O('echarpe', 450, 290, 0.9), O('flocon', 150, 130, 0.35, de=0.3, flotte=True), O('flocon', 520, 180, 0.3, de=0.9, flotte=True)], textes=[TITRE('toi quand ta personne a les mains gelées')]),
    plan(4, "Elle s'approche, l'air de rien, et lui glisse les deux pattes dans le cou sous l'écharpe ; il ouvre des yeux ronds, bondit sur place, puis grelotte à son tour.",
         [perso('elle', E(0, x=270, expression='malicieux'), E(1.0, x=360, bras='tend_d', expression='content')),
          perso('lui', E(0, x=450, expression='content'), E(1.2, expression='choque', signes=['exclamation']), E(1.6, y=320, expression='panique'), E(2.0, y=380, expression='froid', signes=['frissons']))],
         objets=[O('echarpe', 450, 290, 0.9), O('flocon', 150, 130, 0.35, flotte=True)], sons=[{'nom': 'boing', 'a': 1.6}]),
    plan(4.5, "Elle garde les pattes au chaud sur lui, zen, les yeux fermés ; lui tremble, des flocons autour, puis se résigne et la serre contre lui ; un petit cœur monte.",
         [perso('elle', E(0, x=360, expression='zen', bras='tend_d')),
          perso('lui', E(0, x=450, expression='froid', pose='tremble', signes=['frissons', 'flocons']), E(2.0, expression='blase', pose='debout'), E(3.0, expression='amour', bras='tend_g', pose='penche_g'))],
         objets=[O('echarpe', 450, 290, 0.9), O('coeur', 405, 160, 0.4, de=3.2, flotte=True)]),
])

reel('ani-230', 'lui', 'toi quand ta personne rentre tard et veut pas te réveiller', lieu='nuit', plans=[
    plan(4, "La nuit, la lune ; le lit ; elle dort allongée à droite ; lui entre par la gauche sur la pointe des pattes, le doigt sur la bouche, très concentré.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('lui', E(0.3, x=-140, angle=90, pose='marche', expression='chut'), E(2.6, x=150, pose='debout'), E(3.0, angle=0, bras='bouche'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], textes=[TITRE('toi quand ta personne rentre tard et veut pas te réveiller')]),
    plan(3.5, "Il avance encore d'un pas et marche sur une chaussette qui traîne ; il glisse, tombe de tout son long avec un grand bruit, les yeux en croix.",
         [perso('lui', E(0, x=150, expression='chut', bras='bouche'), E(0.8, x=150, angle=90, pose='marche'), E(1.6, x=200, pose='debout'), E(1.9, pose='tombe', expression='panique', angle=0), E(2.4, pose='allonge', expression='ko', signes=['tourbillon'])),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']), E(2.6, pose='debout', bras='aucun', pattes='aucune', expression='furieux', signes=['veine']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('chaussettes', 220, 365, 0.5, derriere=True)], sons=[{'nom': 'splat', 'a': 2.2}]),
    plan(4.5, "Il reste par terre, immobile, l'auréole au-dessus de la tête, l'air de rien ; elle le regarde depuis le lit, furieuse, puis blasée, puis se recouche en lui tournant le dos.",
         [perso('lui', E(0, x=200, pose='allonge', expression='ange', signes=['halo'])),
          perso('elle', AU_LIT(394, expression='furieux', signes=['veine'], vers=-1), E(1.6, expression='blase'), E(3.0, pose='allonge', expression='boude', x=420))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('chaussettes', 220, 365, 0.5, derriere=True)]),
])

reel('ani-231', 'les deux', 'nous deux quand on dit « on y va » chez des amis', lieu='amis', plans=[
    plan(4, "Debout tous les deux à droite, près de la porte, les clés à la patte, prêts à partir, contents ; en haut s'écrit « bon, on y va ».",
         [fixe('lui', 290, expression='content', bras='tient'), fixe('elle', 450, expression='content')],
         objets=[O('porte', 560, 230, 1.6, derriere=True), O('cle', 290, 300, 0.5)], textes=[TITRE('nous deux quand on dit « on y va » chez des amis', a=2.0), DIT('« bon, on y va »', de=2.2)]),
    plan(4, "« 1 h plus tard » en bas. Toujours debout au même endroit, ils rient, ils racontent, les bras qui s'agitent ; personne n'a bougé d'un pas.",
         [perso('lui', E(0, x=290, expression='rire', bras='tient'), E(1.4, expression='joie', bras='leves'), E(2.8, expression='rire')),
          perso('elle', E(0, x=450, expression='joie', bras='leves'), E(1.4, expression='rire'), E(2.8, expression='choque', bras='joues'))],
         objets=[O('porte', 560, 230, 1.6, derriere=True), O('cle', 290, 300, 0.5, a=1.4)], textes=[BAS('1 h plus tard')]),
    plan(4.5, "« 2 h plus tard » en bas. Lui s'est assis par terre contre la porte et dort, des z ; elle raconte encore, radieuse ; elle baisse les yeux sur lui, puis s'assoit à côté et continue.",
         [perso('lui', E(0, x=480, pose='assis', expression='dodo', signes=['zzz'])),
          perso('elle', E(0, x=290, expression='joie', bras='leves'), E(1.8, expression='surpris', vers=1, bras='bas'), E(2.6, x=330, pose='assis', expression='joie', bras='leves'))],
         objets=[O('porte', 560, 230, 1.6, derriere=True)], textes=[BAS('2 h plus tard')]),
])

reel('ani-232', 'lui', 'toi quand ta personne a une nouvelle série', lieu='canapé', plans=[
    plan(4, "Le canapé, la télé ; lui seul, assis au milieu, hypnotisé par l'écran, les yeux en spirale ; elle entre par la droite, s'assoit à côté de lui, contente ; il ne bouge pas.",
         [fixe('lui', 300, y=318, taille=210, pose='assis', expression='hypnotise', signes=['tourbillon']),
          perso('elle', E(0.3, x=820, y=380, angle=-90, pose='marche', expression='content'), E(1.8, x=470, pose='debout'), E(2.2, angle=0), E(2.6, x=440, y=318, taille=210, pose='assis'))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8)], textes=[TITRE('toi quand ta personne a une nouvelle série')]),
    plan(4, "Elle lui parle, les bras qui bougent ; rien ; elle agite une patte devant ses yeux ; rien ; elle pose la tête sur son épaule ; rien ; il est toujours hypnotisé.",
         [perso('elle', E(0, x=440, y=318, taille=210, pose='assis', expression='joie', bras='leves'), E(1.2, expression='perplexe', bras='coucou'), E(2.4, x=400, pose='penche_g', expression='boude', bras='bas')),
          perso('lui', E(0, x=300, y=318, taille=210, pose='assis', expression='hypnotise', signes=['tourbillon']))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8)]),
    plan(4.5, "Elle abandonne, regarde l'écran à son tour, d'abord blasée, puis curieuse, puis les yeux en spirale elle aussi ; les deux hypnotisés, collés, devant la télé.",
         [perso('elle', E(0, x=400, y=318, taille=210, pose='assis', expression='blase'), E(1.4, expression='curieux'), E(2.8, expression='hypnotise', signes=['tourbillon'])),
          perso('lui', E(0, x=300, y=318, taille=210, pose='assis', expression='hypnotise', signes=['tourbillon']))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8)]),
])

reel('ani-233', 'lui', 'toi quand ta personne veut un bisou au réveil', lieu='matin', plans=[
    plan(4, "Le lit, le matin ; lui se penche vers elle, la bouche en cœur, pour un bisou ; elle fait la grimace, dégoûtée, et le repousse d'une patte.",
         [perso('lui', AU_LIT(260, expression='content'), E(1.0, expression='bisou', pose='penche_d', x=290)),
          perso('elle', AU_LIT(394, expression='content'), E(1.6, expression='degoute', bras='tend_g'))],
         meubles=['lit_fond'], textes=[TITRE('toi quand ta personne veut un bisou au réveil')]),
    plan(4, "Il est tout triste ; elle pointe la brosse à dents posée à côté ; il comprend, se lève et sort du lit par la gauche, en traînant.",
         [perso('lui', AU_LIT(290, expression='triste'), E(1.6, expression='decu'), E(2.2, x=140, y=380, taille=250, pose='debout', bras='bas', pattes='debout', expression='decu'), sort(140, 2.6, 3.8, vers='gauche', pose='marche', expression='decu')),
          perso('elle', AU_LIT(394, expression='blase'), E(0.8, bras='pointe', vers=-1, expression='content'))],
         meubles=['lit_fond'], objets=[O('brosse', 540, 300, 0.6)]),
    plan(4.5, "Il revient par la gauche, radieux, la brosse à dents encore à la patte, et saute dans le lit ; elle rit ; il se penche, elle fond, bisou ; des cœurs.",
         [perso('lui', entre(150, 0, 1.2, pose='court', expression='joie', bras='tient', tourne=False), E(1.4, x=260, y=346, taille=200, pose='debout', bras='aucun', pattes='aucune', angle=0), E(2.4, x=290, expression='bisou', pose='penche_d')),
          perso('elle', AU_LIT(394, expression='content'), E(1.4, expression='rire'), E(2.8, expression='transi'))],
         meubles=['lit_fond'], objets=[O('brosse', 150, 300, 0.6, a=1.4)] + COEURS(340, 150, de=3.0), sons=[{'nom': 'boing', 'a': 1.3}]),
])

reel('ani-234', 'lui', 'toi quand ta personne laisse traîner ses affaires', lieu='maison', plans=[
    plan(4, "Lui entre par la gauche, content, laisse tomber un pull par terre en passant, puis une chaussette ; elle, à droite, les ramasse derrière lui et les met dans un carton.",
         [perso('lui', entre(300, 0, 1.6, pose='marche', expression='content')),
          perso('elle', E(0, x=470, expression='blase'), E(1.8, bras='tend_g', expression='agace'))],
         objets=[O('caisse', 540, 330, 1.0), O('pull', 120, 350, 0.8, de=0.6, etapes=[{'a': 1.8, 'x': 120}, {'a': 2.4, 'x': 540, 'y': 300}, {'a': 2.6, 'y': 330}]), O('chaussettes', 220, 360, 0.5, de=1.2, etapes=[{'a': 2.6, 'x': 220}, {'a': 3.2, 'x': 540, 'y': 300}])],
         textes=[TITRE('toi quand ta personne laisse traîner ses affaires')]),
    plan(4, "Il se retourne, s'assoit par terre, et pose son écharpe à côté de lui, puis son bonnet ; elle, la veine qui bat, les ramasse encore et les jette dans le carton.",
         [perso('lui', E(0, x=300, expression='content'), E(0.8, pose='assis', expression='zen')),
          perso('elle', E(0, x=470, expression='agace'), E(1.6, expression='furieux', signes=['veine'], bras='tend_g'), E(3.0, expression='exaspere'))],
         objets=[O('caisse', 540, 330, 1.0), O('echarpe', 200, 350, 0.7, de=0.9, etapes=[{'a': 2.0, 'x': 200}, {'a': 2.6, 'x': 540, 'y': 300}]), O('bonnet', 390, 350, 0.7, de=1.4, etapes=[{'a': 2.8, 'x': 390}, {'a': 3.4, 'x': 540, 'y': 300}])]),
    plan(4.5, "Elle le soulève lui aussi, le porte jusqu'au carton et l'y dépose ; il dépasse du carton, surpris puis content ; elle s'essuie les pattes, fière, les pattes sur les hanches.",
         [perso('elle', E(0, x=470, expression='determine'), E(0.6, x=330, bras='leves'), E(1.8, x=460), E(2.6, x=380, bras='hanches', expression='fier')),
          perso('lui', E(0, x=300, pose='assis', expression='zen'), E(0.8, x=330, y=250, taille=150, pose='assis', expression='surpris', signes=['exclamation']), E(1.8, x=540, y=250), E(2.4, x=540, y=330, taille=160, pose='boule', expression='content'))],
         objets=[O('caisse', 540, 345, 1.1)]),
])

reel('ani-235', 'elle', 'toi quand ta personne te fait porter les courses', lieu='dehors', plans=[
    plan(4, "Dehors ; lui à droite, un sac dans chaque patte, content ; elle entre par la gauche avec deux sacs, lui en tend un, puis l'autre ; il les prend, les bras levés.",
         [perso('lui', E(0, x=450, expression='content', bras='tient'), E(2.4, bras='leves', expression='surpris')),
          perso('elle', entre(290, 0, 1.4, pose='marche', expression='content', bras='tient'), E(2.0, bras='tend_d'), E(3.0, bras='bas', expression='joie'))],
         objets=[O('sac', 450, 300, 0.7), O('sac', 290, 300, 0.7, a=2.0), O('sac', 380, 240, 0.7, de=2.0, a=2.4), O('sac', 380, 240, 0.7, de=2.4), O('sac', 520, 240, 0.7, de=2.4)], textes=[TITRE('toi quand ta personne te fait porter les courses')]),
    plan(4, "Lui tremble sous les sacs, en plein effort, des gouttes de sueur ; elle, les pattes libres, cueille une petite plante en pot au passage, ravie, et la lui pose sur la tête.",
         [perso('lui', E(0, x=450, expression='effort', bras='leves', signes=['sueurs']), E(1.2, pose='tremble', expression='effort', signes=['sueurs', 'tremblement']), E(3.0, expression='blase', pose='debout')),
          perso('elle', E(0, x=290, expression='joie'), E(1.0, bras='tient'), E(2.2, x=370, bras='tend_d', expression='malicieux'))],
         objets=[O('sac', 380, 240, 0.7), O('sac', 520, 240, 0.7), O('plante', 290, 300, 0.6, de=1.0, etapes=[{'a': 2.2, 'x': 290}, {'a': 2.8, 'x': 450, 'y': 120}])]),
    plan(4.5, "Il marche vers la droite, chargé des sacs et de la plante sur la tête, blasé ; elle marche devant lui, légère, les pattes vides, et se retourne pour lui envoyer un cœur.",
         [perso('elle', E(0, x=250, expression='joie'), E(0.6, x=250, angle=90, pose='marche'), E(3.2, x=820)),
          perso('lui', E(0, x=450, expression='blase', bras='leves'), E(1.2, x=450, angle=90, pose='marche'), E(4.2, x=820))],
         objets=[O('sac', 380, 240, 0.7, etapes=[{'a': 1.2, 'x': 380}, {'a': 4.2, 'x': 750}]), O('sac', 520, 240, 0.7, etapes=[{'a': 1.2, 'x': 520}, {'a': 4.2, 'x': 890}]), O('plante', 450, 120, 0.6, etapes=[{'a': 1.2, 'x': 450}, {'a': 4.2, 'x': 820}]), O('coeur', 330, 180, 0.35, de=2.0, a=3.2, flotte=True)]),
])

reel('ani-236', 'les deux', 'nous deux quand on dit « demain on va courir »', lieu='sport', plans=[
    plan(3.5, "Les deux debout, décidés, les pattes sur les hanches, des étincelles, prêts à tout ; en haut s'écrit « demain, 7 h, on court ».",
         [fixe('lui', 270, expression='determine', bras='hanches', signes=['etincelles']), fixe('elle', 450, expression='determine', bras='hanches', signes=['etincelles'])],
         textes=[TITRE('nous deux quand on dit « demain on va courir »', a=1.6), DIT('« demain, 7 h, on court »', de=1.8)]),
    plan(4.5, "« le lendemain, 7 h » en bas. Le lit, le réveil sonne ; les deux se redressent, les yeux ronds ; ils se regardent ; ils se rallongent en même temps et se rendorment.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo'), E(0.5, pose='debout', bras='aucun', pattes='aucune', expression='surpris'), E(1.6, vers=1, expression='hesite'), E(2.6, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo'), E(0.5, pose='debout', bras='aucun', pattes='aucune', expression='surpris'), E(1.6, vers=-1, expression='hesite'), E(2.6, pose='allonge', expression='dodo', signes=['zzz']))],
         meubles=['lit_fond'], objets=[O('horloge', 545, 85, 0.7)], textes=[BAS('le lendemain, 7 h')], sons=[{'nom': 'reveil', 'a': 0.2}]),
    plan(4, "« la semaine suivante » en bas. Debout, décidés, les pattes sur les hanches, les étincelles ; puis ils se regardent, hésitent, et se tournent vers le lit derrière eux.",
         [perso('lui', E(0, x=270, expression='determine', bras='hanches', signes=['etincelles']), E(1.8, expression='hesite', vers=1, bras='bas'), E(3.0, expression='malicieux')),
          perso('elle', E(0, x=450, expression='determine', bras='hanches', signes=['etincelles']), E(1.8, expression='hesite', vers=-1, bras='bas'), E(3.0, expression='malicieux'))],
         textes=[BAS('la semaine suivante')]),
])

reel('ani-237', 'elle', 'toi quand ta personne attend un colis', lieu='maison', plans=[
    plan(4, "La porte à droite ; elle fait les cent pas devant, regarde l'horloge, attend ; la sonnette retentit, elle sprinte vers la porte, ouvre : rien, déçue.",
         [perso('elle', E(0, x=250, expression='attend'), E(1.2, x=250, angle=90, pose='sprint', expression='joie'), E(2.0, x=470, pose='debout'), E(2.4, angle=0, expression='decu')),
          fixe('lui', 150, pose='assis', expression='blase', bras='tient')],
         objets=[O('porte', 560, 230, 1.6, derriere=True), O('telephone', 150, 300, 0.55), O('horloge', 320, 90, 0.7)], textes=[TITRE('toi quand ta personne attend un colis')], sons=[{'nom': 'sonnette', 'a': 1.1}]),
    plan(4, "« le lendemain » en bas. Elle attend encore devant la porte, puis s'assoit par terre, puis se couche en boule devant la porte ; lui lui apporte un coussin, désolé.",
         [perso('elle', E(0, x=470, expression='attend'), E(1.2, pose='assis', expression='ennui'), E(2.6, pose='boule', expression='deprime', signes=['nuage_noir'])),
          perso('lui', E(0, x=150, pose='assis', expression='blase'), marche(150, 330, 1.4, 2.8, expression='desole', bras='tient'), E(3.4, bras='tend_d'))],
         objets=[O('porte', 560, 230, 1.6, derriere=True), O('coussin', 150, 300, 0.8, de=1.4, etapes=[{'a': 1.4, 'x': 150}, {'a': 2.8, 'x': 330}, {'a': 3.6, 'x': 420, 'y': 350}])], textes=[BAS('le lendemain')]),
    plan(4.5, "La sonnette ; elle bondit, ouvre, et un gros carton est là ; elle saute de joie, le serre dans ses bras avec des cœurs ; lui, derrière, applaudit, puis attend son câlin à lui.",
         [perso('elle', E(0, x=470, pose='boule', expression='deprime'), E(0.5, pose='saut', expression='joie', signes=['etincelles']), E(1.0, pose='debout', expression='emerveille'), E(2.0, x=500, bras='tend_d', expression='amour', pose='penche_d')),
          perso('lui', E(0, x=330, expression='content', bras='tend_d'), E(1.6, expression='bravo', bras='applaudit'), E(3.2, expression='attend', bras='bas'), E(4.0, expression='supplie', bras='priere'))],
         objets=[O('porte', 560, 230, 1.6, derriere=True), O('caisse', 580, 340, 1.1, de=0.7), O('coeur', 540, 170, 0.4, de=2.2, flotte=True)], sons=[{'nom': 'sonnette', 'a': 0.3}, {'nom': 'saut', 'a': 0.5}]),
])
