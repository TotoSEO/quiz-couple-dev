# Premier lot : douze reels, un par type de scène, pour vérifier le dessin.
from usine import *

# ---- le lit : elle prend toute la place
reel('ani-201', 'elle', 'toi quand ta personne prend toute la place dans le lit', lieu='lit', plans=[
    plan(4, "Le lit vu de trois quarts, les deux assis dedans côte à côte, contents ; vers une seconde et demie ils ferment les yeux et s'endorment chacun de son côté, bien rangés.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='debout', bras='aucun', pattes='aucune', expression='content'), E(1.6, expression='dodo', signes=['zzz'])),
          perso('elle', E(0, x=394, y=346, taille=200, pose='debout', bras='aucun', pattes='aucune', expression='content'), E(1.9, expression='dodo'))],
         meubles=['lit_fond'], textes=[TITRE('toi quand ta personne prend toute la place dans le lit')]),
    plan(4, "« 1 h plus tard » en bas. Elle glisse vers lui en dormant, puis s'allonge en travers du lit ; lui, poussé, se réveille gêné, une goutte de sueur, et finit en boule tout au bord.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='debout', bras='aucun', pattes='aucune', expression='dodo'), E(1.0, x=330), E(2.2, x=310, pose='allonge', signes=['zzz'])),
          perso('lui', E(0, x=248, y=346, taille=200, pose='debout', bras='aucun', pattes='aucune', expression='dodo'), E(1.2, expression='gene', signes=['sueur']), E(2.2, x=160, taille=170, pose='boule', expression='blase'))],
         meubles=['lit_fond'], textes=[BAS('1 h plus tard')]),
    plan(4, "Elle dort en travers du lit, en étoile, la bouche ouverte ; lui en boule tout au bord, blasé, puis fatigué ; vers deux secondes et demie il la regarde et fond, un petit cœur monte.",
         [perso('elle', E(0, x=320, y=346, taille=210, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('lui', E(0, x=150, y=346, taille=160, pose='boule', expression='blase'), E(1.4, expression='fatigue'), E(2.5, expression='amour', vers=1))],
         meubles=['lit_fond'], objets=[O('coeur', 175, 190, 0.4, de=2.7, flotte=True)]),
])

# ---- le canapé : il s'installe
reel('ani-202', 'lui', "toi quand ta personne s'installe sur le canapé", lieu='canapé', plans=[
    plan(3.5, "Le canapé, les deux assis chacun à sa place, contents ; vers une seconde et demie il ferme les yeux, zen, et commence à se laisser aller.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='content'), E(1.5, expression='zen')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='content'))],
         meubles=['canape_fond'], textes=[TITRE("toi quand ta personne s'installe sur le canapé")]),
    plan(4, "« 5 min plus tard » en bas. Il s'allonge de tout son long sur le canapé, zen ; elle, surprise, se fait pousser jusqu'au bord, et reste blasée sur l'accoudoir.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='zen'), E(1.0, x=290, pose='allonge')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='content'), E(1.2, expression='surpris', signes=['exclamation']), E(2.0, x=500, taille=190, expression='blase', bras='croises'))],
         meubles=['canape_fond'], textes=[BAS('5 min plus tard')]),
    plan(4.5, "Il dort allongé sur tout le canapé ; elle, blasée au bord, regarde, puis vient s'allonger par-dessus lui, contente ; des cœurs montent, lui sourit sans ouvrir les yeux.",
         [perso('lui', E(0, x=300, y=318, taille=210, pose='allonge', expression='dodo', signes=['zzz']), E(3.2, expression='content')),
          perso('elle', E(0, x=500, y=318, taille=190, pose='assis', expression='blase', bras='croises'), E(1.0, expression='malicieux'), E(2.2, x=310, y=250, taille=170, pose='allonge', expression='content', bras='bas'))],
         meubles=['canape_fond'], objets=COEURS(320, 120, de=2.8)),
])

# ---- le téléphone : « t'as vu mon message ? »
reel('ani-203', 'lui', "toi quand ta personne dit « t'as vu mon message ? »", lieu='téléphone', plans=[
    plan(4, "Lui au milieu gauche, le téléphone à la patte, les yeux dedans, content ; elle arrive de la droite d'un pas décidé, s'arrête à côté de lui, se tourne vers nous et attend, les bras croisés.",
         [fixe('lui', 290, expression='content', bras='tient'),
          perso('elle', entre(450, 0, 1.6, depuis='droite', expression='determine'), E(2.3, expression='attend', bras='croises'))],
         objets=[O('telephone', 290, 300, 0.55)], textes=[TITRE("toi quand ta personne dit « t'as vu mon message ? »")]),
    plan(4, "Elle passe de l'attente à l'agacement puis à la colère, une veine sur le front ; lui lève les yeux, surpris, puis gêné, une patte derrière la tête, une goutte de sueur. En haut : « j'allais répondre ».",
         [perso('elle', E(0, x=450, expression='attend', bras='croises'), E(1.0, expression='agace'), E(2.2, expression='colere', signes=['veine'])),
          perso('lui', E(0, x=290, expression='content', bras='tient'), E(1.3, expression='surpris', bras='bas'), E(2.4, expression='gene', bras='tete', signes=['sueur']))],
         objets=[O('telephone', 290, 300, 0.55, a=1.3)], textes=[DIT("« j'allais répondre »", de=1.5)]),
    plan(4.5, "Il supplie, les pattes jointes ; elle boude, tournée vers le bord ; alors il reprend son téléphone et tape ; le téléphone d'elle vibre à côté d'elle, elle le regarde, blasée : il lui a répondu par message.",
         [perso('lui', E(0, x=290, expression='supplie', bras='priere'), E(1.4, expression='idee', signes=['ampoule']), E(2.0, expression='concentre', bras='tient')),
          perso('elle', E(0, x=450, expression='boude', vers=1), E(3.0, expression='blase', vers=-1))],
         objets=[O('telephone', 290, 300, 0.55, de=2.0), O('telephone', 450, 300, 0.55, de=2.9), O('exclamation', 500, 215, 0.5, de=2.9, a=3.9)],
         sons=[{'nom': 'notification', 'a': 2.9}]),
])

# ---- les pieds gelés
reel('ani-204', 'elle', 'toi quand ta personne a les pieds gelés', lieu='lit', plans=[
    plan(3.5, "Le lit, les deux assis dedans ; lui zen, les yeux fermés ; elle, à droite, grelotte, des frissons autour d'elle, et regarde vers lui avec une idée en tête.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='debout', bras='aucun', pattes='aucune', expression='zen')),
          perso('elle', E(0, x=394, y=346, taille=200, pose='debout', bras='aucun', pattes='aucune', expression='froid', signes=['frissons']), E(2.0, expression='malicieux', vers=-1))],
         meubles=['lit_fond'], textes=[TITRE('toi quand ta personne a les pieds gelés')]),
    plan(4, "Elle glisse vers lui sous les draps, l'air de rien ; lui ouvre des yeux ronds, un point d'exclamation, puis panique et fait un bond dans le lit, retombe, les frissons passent sur lui.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='debout', bras='aucun', pattes='aucune', expression='malicieux'), E(1.2, x=300, expression='content')),
          perso('lui', E(0, x=248, y=346, taille=200, pose='debout', bras='aucun', pattes='aucune', expression='zen'), E(1.3, expression='choque', signes=['exclamation']), E(2.0, y=290, expression='panique'), E(2.4, y=346, expression='froid', signes=['frissons']))],
         meubles=['lit_fond'], sons=[{'nom': 'boing', 'a': 2.0}]),
    plan(4.5, "Elle, collée à lui, zen et réchauffée ; lui, gelé, des flocons autour, puis il la regarde et fond quand même ; un petit cœur monte entre eux.",
         [perso('elle', E(0, x=330, y=346, taille=200, pose='debout', bras='aucun', pattes='aucune', expression='zen')),
          perso('lui', E(0, x=230, y=346, taille=200, pose='debout', bras='aucun', pattes='aucune', expression='froid', signes=['frissons', 'flocons']), E(2.6, expression='amour', vers=1, signes=['flocons']))],
         meubles=['lit_fond'], objets=[O('flocon', 170, 200, 0.4, de=0.3, flotte=True), O('coeur', 290, 180, 0.4, de=2.8, flotte=True)]),
])

# ---- « je suis prête »
reel('ani-205', 'elle', 'toi quand ta personne dit « je suis prête »', lieu='sortir', plans=[
    plan(4, "Lui à droite, les clés à la patte, prêt à partir, content ; elle entre par la gauche en marchant, fière, et s'arrête au milieu gauche, face à nous.",
         [fixe('lui', 450, expression='content', bras='tient'),
          perso('elle', entre(290, 0.2, 1.8, pose='marche', expression='fier'))],
         objets=[O('cle', 450, 300, 0.5)], textes=[TITRE('toi quand ta personne dit « je suis prête »')]),
    plan(4, "En haut : « j'ai juste les chaussures à mettre ». Elle a une idée, une ampoule, et repart par la gauche en courant ; lui, blasé, finit par s'asseoir par terre et attend.",
         [perso('elle', E(0, x=290, expression='idee', signes=['ampoule']), sort(290, 1.0, 2.2, vers='gauche', expression='determine')),
          perso('lui', E(0, x=450, expression='content', bras='tient'), E(1.6, expression='blase', bras='bas'), E(2.6, pose='assis', expression='attend'))],
         objets=[O('cle', 450, 300, 0.5, a=1.6)], textes=[DIT("« j'ai juste les chaussures à mettre »")]),
    plan(4.5, "« 20 min plus tard » en bas. Lui dort assis par terre ; elle revient par la gauche, radieuse, dans une autre tenue, un sac à la patte, et s'arrête devant lui ; il ne bouge pas.",
         [perso('lui', E(0, x=450, pose='assis', expression='dodo', signes=['zzz'])),
          perso('elle', entre(290, 0.8, 2.4, pose='marche', expression='joie', bras='tient'), E(3.4, expression='perplexe', vers=1))],
         objets=[O('pull', 290, 300, 1.2, de=0.8), O('sac', 330, 330, 0.6, de=0.8)], textes=[BAS('20 min plus tard')]),
])

# ---- fâchés pour un truc nul
reel('ani-206', 'les deux', "nous deux quand on s'est fâchés pour un truc nul", lieu='dispute', plans=[
    plan(4, "Dos à dos au milieu, les bras croisés, un petit nuage noir au-dessus de chacun ; personne ne bouge, les yeux plissés, chacun regarde son bord.",
         [fixe('lui', 230, expression='boude', bras='croises', pose='penche_g', vers=-1, signes=['nuage_noir'], taille=260),
          fixe('elle', 410, expression='boude', bras='croises', pose='penche_d', vers=1, signes=['nuage_noir'], taille=260)],
         textes=[TITRE("nous deux quand on s'est fâchés pour un truc nul")]),
    plan(4, "« 2 min plus tard » en bas. Toujours dos à dos ; elle jette un œil en coin vers lui, puis fait l'indifférente ; lui devient triste, puis jette un œil en coin lui aussi.",
         [perso('lui', E(0, x=230, expression='boude', bras='croises', pose='penche_g', vers=-1, taille=260), E(1.6, expression='triste'), E(2.8, expression='suspicieux', vers=1)),
          perso('elle', E(0, x=410, expression='boude', bras='croises', pose='penche_d', vers=1, taille=260), E(0.8, expression='suspicieux', vers=-1), E(2.0, expression='blase', vers=1))],
         textes=[BAS('2 min plus tard')]),
    plan(4.5, "Toujours dos à dos, les deux boudent encore ; mais une patte de chacun se tend derrière le dos, vers l'autre, et les deux pattes se trouvent ; un petit cœur monte entre eux.",
         [perso('lui', E(0, x=230, expression='boude', bras='croises', pose='penche_g', vers=-1, taille=260), E(1.2, bras='tend_d', expression='timide')),
          perso('elle', E(0, x=410, expression='boude', bras='croises', pose='penche_d', vers=1, taille=260), E(1.8, bras='tend_g', expression='timide'), E(3.0, expression='content'))],
         objets=[O('coeur', 320, 300, 0.3, de=2.2, flotte=True)]),
])

# ---- s'endormir direct
reel('ani-207', 'lui', "toi quand ta personne s'endort direct", lieu='lit', plans=[
    plan(4, "Le lit, les deux assis dedans, contents, ils viennent de dire bonne nuit ; lui bâille, et s'endort d'un coup, allongé, des z ; elle le regarde, surprise.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='debout', bras='aucun', pattes='aucune', expression='content'), E(1.3, expression='baille'), E(2.2, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('elle', E(0, x=394, y=346, taille=200, pose='debout', bras='aucun', pattes='aucune', expression='content'), E(2.5, expression='surpris', vers=-1))],
         meubles=['lit_fond'], textes=[TITRE("toi quand ta personne s'endort direct")]),
    plan(4, "En haut : « t'es sérieux ? ». Elle, assise dans le lit, passe de surprise à blasée, puis pensive, des petits points, puis s'ennuie ; lui dort sans bouger.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='debout', bras='aucun', pattes='aucune', expression='surpris', vers=-1), E(1.0, expression='blase'), E(2.0, expression='pensif', signes=['points']), E(3.0, expression='ennui')),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']))],
         meubles=['lit_fond'], textes=[DIT("« t'es sérieux ? »")]),
    plan(4.5, "« 2 h plus tard » en bas. Elle, les yeux grands ouverts dans la lumière de son téléphone ; lui roule vers elle en dormant et s'étale de son côté ; elle le regarde et fond, un petit cœur.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='debout', bras='aucun', pattes='aucune', expression='hypnotise'), E(3.0, expression='amour', vers=-1)),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']), E(1.4, x=330))],
         meubles=['lit_fond'], objets=[O('telephone', 394, 290, 0.5, a=3.0), O('coeur', 360, 190, 0.4, de=3.2, flotte=True)], textes=[BAS('2 h plus tard')]),
])

# ---- dehors sans veste
reel('ani-208', 'lui', 'toi quand ta personne refuse de mettre une veste', lieu='dehors', plans=[
    plan(4, "Dehors, un petit nuage en haut à droite ; elle à gauche, bonnet sur la tête et écharpe autour du cou, contente ; lui à droite, en t-shirt, les pattes sur les hanches, cool.",
         [fixe('elle', 270, expression='content'), fixe('lui', 450, expression='cool', bras='hanches')],
         objets=[O('nuage', 530, 80, 0.8), O('bonnet', 270, 165, 0.9), O('echarpe', 270, 290, 0.9)], textes=[TITRE('toi quand ta personne refuse de mettre une veste')]),
    plan(4, "« 5 min plus tard » en bas. Des flocons tombent ; lui se met à trembler, des frissons, puis supplie en se tournant vers elle, les pattes jointes ; elle le regarde en coin, narquoise.",
         [perso('lui', E(0, x=450, expression='cool', bras='hanches'), E(0.6, expression='froid', pose='tremble', signes=['frissons'], bras='croises'), E(2.2, expression='supplie', bras='priere', vers=-1, pose='debout')),
          perso('elle', E(0, x=270, expression='content'), E(1.6, expression='narquois', vers=1))],
         objets=[O('bonnet', 270, 165, 0.9), O('echarpe', 270, 290, 0.9), O('flocon', 380, 120, 0.35, de=0.3, flotte=True), O('flocon', 540, 200, 0.3, de=0.8, flotte=True), O('flocon', 150, 230, 0.3, de=1.2, flotte=True)],
         textes=[BAS('5 min plus tard')]),
    plan(4.5, "Les deux serrés l'un contre l'autre au milieu, la même écharpe enroulée autour des deux cous ; lui a le bonnet, elle sourit ; les flocons continuent, un petit cœur monte.",
         [perso('elle', E(0, x=290, expression='content'), E(2.0, expression='amour')),
          perso('lui', E(0, x=400, expression='froid', signes=['frissons']), E(1.6, expression='timide'), E(3.0, expression='content'))],
         objets=[O('echarpe', 345, 290, 1.7, de=0.4), O('bonnet', 400, 165, 0.9, de=0.4), O('flocon', 160, 150, 0.3, de=0.5, flotte=True), O('flocon', 520, 110, 0.35, de=1.0, flotte=True), O('coeur', 345, 160, 0.4, de=2.4, flotte=True)]),
])

# ---- une journée nulle
reel('ani-209', 'elle', "toi quand ta personne rentre d'une journée nulle", lieu='retrouvailles', plans=[
    plan(4, "Lui au milieu droit, content, il attend ; elle entre par la gauche en traînant les pattes, un nuage noir au-dessus de la tête, déprimée, et s'arrête loin de lui.",
         [fixe('lui', 450, expression='content'),
          perso('elle', entre(230, 0.3, 2.4, pose='marche', expression='deprime', signes=['nuage_noir']))],
         textes=[TITRE("toi quand ta personne rentre d'une journée nulle")]),
    plan(4, "Il la voit, s'inquiète, ouvre grand les bras ; elle marche jusqu'à lui et se laisse tomber dans ses bras ; câlin, les yeux fermés ; le nuage noir s'en va, des cœurs montent.",
         [perso('lui', E(0, x=450, expression='inquiet'), E(0.8, bras='leves'), E(2.0, x=400, bras='tend_g', pose='penche_g', expression='calin')),
          perso('elle', E(0, x=230, expression='deprime', signes=['nuage_noir']), marche(230, 290, 0.8, 1.9, tourne=False, expression='triste', signes=['nuage_noir']), E(2.0, bras='tend_d', pose='penche_d', expression='calin', signes=[], angle=0))],
         objets=COEURS(345, 150, de=2.4)),
    plan(4.5, "Il la soulève à bout de bras, elle assise sur ses pattes levées, étonnée puis ravie ; il l'emporte vers la droite en marchant, elle au-dessus de lui ; ils sortent du cadre ensemble.",
         [perso('lui', E(0, x=320, taille=270, expression='determine', bras='leves'), E(1.2, x=320, angle=90, pose='marche', expression='content'), E(3.6, x=820)),
          perso('elle', E(0, x=322, y=258, taille=150, pose='assis', expression='surpris'), E(0.8, expression='emerveille'), E(1.2, x=322), E(3.6, x=822))],
         objets=[O('coeur', 420, 120, 0.4, de=0.6, flotte=True)]),
])

# ---- la vidéo à montrer
reel('ani-210', 'elle', 'toi quand ta personne te montre une vidéo', lieu='téléphone', plans=[
    plan(4, "Elle à gauche, le téléphone à la patte, morte de rire devant son écran ; lui à droite, content, s'approche d'un pas pour voir ; elle lui tend le téléphone.",
         [perso('elle', E(0, x=280, expression='rire', bras='tient'), E(1.5, expression='mort_de_rire', pose='debout', bras='tient'), E(2.6, bras='tend_d', expression='joie')),
          perso('lui', E(0, x=470, expression='content'), E(2.2, x=440, expression='curieux', vers=-1))],
         objets=[O('telephone', 280, 300, 0.55, a=2.6), O('telephone', 365, 300, 0.55, de=2.6)], textes=[TITRE('toi quand ta personne te montre une vidéo')]),
    plan(4, "Il regarde la vidéo, attend que ça devienne drôle, reste blasé, puis fait un sourire poli ; elle, à côté, pleure de rire, les larmes aux yeux, et le regarde pour vérifier qu'il rit.",
         [perso('lui', E(0, x=440, expression='attend', vers=-1), E(1.3, expression='blase'), E(2.5, expression='content')),
          perso('elle', E(0, x=280, expression='pleure_de_joie', bras='tend_d'), E(2.0, vers=1, expression='joie'))],
         objets=[O('telephone', 365, 300, 0.55)]),
    plan(4.5, "Elle a une nouvelle idée, une ampoule : encore une vidéo ; lui s'ennuie, puis tombe K.-O. par terre, les yeux en croix, un tourbillon ; elle rit de plus belle avec le téléphone.",
         [perso('elle', E(0, x=280, expression='idee', signes=['ampoule'], bras='tient'), E(1.2, expression='rire'), E(3.0, expression='mort_de_rire', pose='debout', bras='tient')),
          perso('lui', E(0, x=440, expression='ennui'), E(1.6, expression='etourdi', signes=['tourbillon']), E(2.4, pose='allonge', expression='ko'))],
         objets=[O('telephone', 280, 300, 0.55)]),
])

# ---- « ça ou ça ? »
reel('ani-211', 'elle', 'toi quand ta personne demande « ça ou ça ? »', lieu='sortir', plans=[
    plan(4, "Elle au milieu gauche, hésitante, un pull dans chaque patte, un à gauche et un à droite ; lui à droite, content, puis il regarde les deux pulls, curieux.",
         [perso('elle', E(0, x=280, expression='hesite', bras='leves')), perso('lui', E(0, x=470, expression='content'), E(1.8, expression='curieux', vers=-1))],
         objets=[O('pull', 180, 220, 0.9), O('pull', 380, 220, 0.9)], textes=[TITRE('toi quand ta personne demande « ça ou ça ? »')]),
    plan(4, "Il réfléchit, des petits points, puis pointe franchement le pull de gauche, fier de lui ; elle regarde le pull de gauche, puis celui de droite, perplexe.",
         [perso('lui', E(0, x=470, expression='pensif', signes=['points'], vers=-1), E(1.6, expression='fier', bras='pointe', pose='debout')),
          perso('elle', E(0, x=280, expression='hesite', bras='leves'), E(2.4, expression='perplexe'))],
         objets=[O('pull', 180, 220, 0.9), O('pull', 380, 220, 0.9)]),
    plan(4.5, "Elle enfile le pull de droite, celui qu'il n'a pas choisi, et prend la pose, fière ; lui, les bras ballants, bouche bée, puis blasé ; elle lui fait un clin d'œil.",
         [perso('elle', E(0, x=280, expression='content', bras='leves'), E(1.0, bras='bas', expression='fier'), E(3.2, expression='clin', vers=1)),
          perso('lui', E(0, x=470, expression='fier', bras='pointe'), E(1.2, bras='bas', expression='bouche_bee'), E(2.6, expression='blase'))],
         objets=[O('pull', 180, 220, 0.9), O('pull', 380, 220, 0.9, a=1.0), O('pull', 280, 300, 1.2, de=1.0)]),
])

# ---- « tu dors ? »
reel('ani-212', 'elle', 'toi quand ta personne demande « tu dors ? » en pleine nuit', lieu='nuit', plans=[
    plan(4, "La nuit, une lune en haut à droite ; le lit ; lui dort allongé à gauche, des z ; elle, assise à droite, les yeux grands ouverts, attend, puis réfléchit, des petits points.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('elle', E(0, x=394, y=346, taille=200, pose='debout', bras='aucun', pattes='aucune', expression='attend'), E(1.8, expression='pensif', signes=['points']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], textes=[TITRE('toi quand ta personne demande « tu dors ? » en pleine nuit')]),
    plan(4, "Elle regarde vers lui, malicieuse, glisse jusqu'à lui et le pousse ; en haut s'écrit « tu dors ? » ; il se redresse d'un coup, les yeux ronds, un point d'exclamation.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='debout', bras='aucun', pattes='aucune', expression='pensif', vers=-1), E(0.8, expression='malicieux'), E(1.8, x=330)),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']), E(2.1, pose='debout', bras='aucun', pattes='aucune', expression='surpris', signes=['exclamation']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], textes=[DIT('« tu dors ? »', de=1.9)]),
    plan(4.5, "Lui, redressé dans le lit, blasé, bien réveillé ; elle s'est rallongée de son côté et dort déjà, des z ; il la regarde, s'ennuie, puis sourit malgré lui ; un petit cœur.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='debout', bras='aucun', pattes='aucune', expression='blase'), E(1.6, expression='ennui', vers=1), E(3.0, expression='amour')),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('coeur', 300, 190, 0.4, de=3.2, flotte=True)]),
])
