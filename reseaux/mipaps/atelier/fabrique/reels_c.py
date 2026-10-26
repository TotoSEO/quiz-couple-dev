# Troisième lot : vingt reels de fin novembre et de décembre, et les cinq reels datés des fêtes.
from usine import *

CANAPE = dict(y=318, taille=210, pose='assis')


def SUR_CANAPE(nom, x, **k):
    d = dict(CANAPE)
    d.update(k)
    return fixe(nom, x, **d)


reel('ani-238', 'elle', 'toi quand ta personne te réveille parce qu\'il neige', lieu='saisons', son='tendre', plans=[
    plan(4, "La nuit, le lit ; lui dort allongé ; elle est debout à la fenêtre à droite, émerveillée, des flocons derrière la vitre ; elle se retourne vers lui, joyeuse, et court le secouer.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('elle', E(0, x=540, expression='emerveille', vers=1), E(1.4, expression='joie'), marche(540, 400, 1.8, 2.6, pose='court', expression='joie'), E(3.2, bras='tend_g'))],
         meubles=['lit_fond'], objets=[O('fenetre', 580, 170, 1.3, derriere=True), O('flocon', 560, 150, 0.3, de=0.3, flotte=True), O('flocon', 600, 200, 0.25, de=0.8, flotte=True)],
         textes=[TITRE('toi quand ta personne te réveille parce qu\'il neige')]),
    plan(4, "Il se redresse, confus, blasé ; elle le tire par la patte hors du lit ; il résiste, se laisse traîner, les yeux fermés ; elle l'emmène vers la droite en tirant.",
         [perso('lui', AU_LIT(248, expression='confus', signes=['question']), E(1.0, expression='blase'), E(1.8, x=330, y=380, taille=250, pose='debout', bras='tend_d', pattes='debout', expression='fatigue'), E(3.6, x=520)),
          perso('elle', E(0, x=400, expression='joie', bras='tend_g'), E(1.4, x=400, angle=90, pose='tire', expression='determine'), E(3.6, x=600))],
         meubles=['lit_fond'], objets=[O('fenetre', 580, 170, 1.3, derriere=True)]),
    plan(4.5, "Dehors, la nuit, la neige qui tombe ; elle, émerveillée, les bras ouverts sous les flocons ; lui, en pyjama, grelotte, des flocons sur la tête ; il la regarde et fond ; un cœur.",
         [perso('elle', E(0, x=280, expression='emerveille', bras='leves'), E(2.0, expression='joie', pose='danse')),
          perso('lui', E(0, x=450, expression='froid', pose='tremble', signes=['frissons', 'flocons']), E(2.6, expression='amour', vers=-1, pose='debout'))],
         objets=[O('lune', 545, 85, 0.7), O('flocon', 150, 130, 0.35, de=0.2, flotte=True), O('flocon', 330, 100, 0.3, de=0.6, flotte=True), O('flocon', 520, 180, 0.3, de=1.0, flotte=True), O('flocon', 220, 220, 0.25, de=1.4, flotte=True), O('coeur', 400, 150, 0.4, de=2.8, flotte=True)]),
])

reel('ani-239', 'elle', 'toi quand ta personne lit au lit avec la lumière', lieu='nuit', plans=[
    plan(4, "Le lit, la lampe allumée sur la table de nuit à droite ; elle, assise, un livre à la patte, concentrée ; lui à gauche, allongé, se cache les yeux, puis boude.",
         [perso('elle', AU_LIT(394, expression='concentre', bras='tient')),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='fatigue', bras='visage'), E(2.0, expression='boude'))],
         meubles=['lit_fond'], objets=[O('lampe', 580, 230, 1.0), O('livre', 394, 290, 0.6)], textes=[TITRE('toi quand ta personne lit au lit avec la lumière')]),
    plan(4, "Il s'exaspère, une veine ; elle le regarde, désolée, ferme le livre, éteint la lampe ; le noir ; lui soulagé, les yeux fermés, un petit sourire.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='exaspere', signes=['veine']), E(2.6, expression='soulage'), E(3.4, expression='dodo', signes=['zzz'])),
          perso('elle', AU_LIT(394, expression='concentre', bras='tient'), E(1.0, expression='desole', vers=-1), E(2.2, bras='tend_d'), E(2.8, bras='aucun', expression='content'))],
         meubles=['lit_fond'], objets=[O('lampe', 580, 230, 1.0, a=2.4), O('livre', 394, 290, 0.6, a=2.2)]),
    plan(4.5, "« 2 min plus tard » en bas. Elle sort son téléphone sous le drap, la lumière de l'écran sur son visage, hypnotisée ; lui rouvre un œil, blasé, et se met l'oreiller sur la tête.",
         [perso('elle', AU_LIT(394, expression='zen'), E(1.0, expression='malicieux'), E(1.6, bras='tient', expression='hypnotise')),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']), E(2.4, pose='debout', bras='aucun', pattes='aucune', expression='blase', vers=1), E(3.4, bras='tete', expression='exaspere'))],
         meubles=['lit_fond'], objets=[O('telephone', 394, 290, 0.5, de=1.6), O('oreiller', 248, 215, 1.0, de=3.4)], textes=[BAS('2 min plus tard')], sons=[{'nom': 'coussin', 'a': 3.4}]),
])

reel('ani-240', 'lui', 'toi quand ta personne est malade', lieu='maison', plans=[
    plan(4, "Le lit ; lui, allongé, malade, le nez rouge, une boîte de mouchoirs à côté, se plaint, pleure presque ; elle arrive de la droite avec une tasse fumante, inquiète.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='malade', signes=['sueur']), E(1.6, expression='sanglote', signes=['larmes'])),
          perso('elle', E(0.4, x=820, angle=-90, pose='marche', expression='inquiet', bras='tient'), E(2.2, x=500, pose='debout'), E(2.6, angle=0))],
         meubles=['lit_fond'], objets=[O('mouchoirs', 400, 330, 0.6), O('tasse', 500, 300, 0.5, de=0.4)], textes=[TITRE('toi quand ta personne est malade')]),
    plan(4, "Elle pose la tasse, lui tapote la tête, patiente ; il se plaint encore, supplie, veut un câlin ; elle lève les yeux au ciel, puis se penche et le serre, gentille.",
         [perso('elle', E(0, x=500, expression='zen', bras='tend_g'), E(1.4, expression='blase'), E(2.4, x=420, pose='penche_g', expression='calin', bras='tend_g')),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='malade'), E(1.0, pose='debout', bras='priere', pattes='aucune', expression='supplie'), E(2.6, x=300, expression='content', bras='aucun'))],
         meubles=['lit_fond'], objets=[O('mouchoirs', 400, 330, 0.6), O('tasse', 560, 300, 0.5)]),
    plan(4.5, "« le lendemain » en bas. Elle, allongée, malade à son tour, le nez rouge, les mouchoirs ; lui, debout, plein d'énergie, lui apporte une tasse, tout fier d'être guéri ; elle le fusille du regard.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='malade', signes=['sueur']), E(2.6, expression='furieux', vers=-1, signes=['veine'])),
          perso('lui', E(0.3, x=-140, angle=90, pose='marche', expression='energique', bras='tient'), E(1.8, x=150, pose='debout'), E(2.2, angle=0, expression='fier', signes=['etincelles']))],
         meubles=['lit_fond'], objets=[O('mouchoirs', 500, 330, 0.6), O('tasse', 150, 300, 0.5, de=0.3)], textes=[BAS('le lendemain')]),
])

reel('ani-241', 'lui', 'toi quand ta personne revient de son footing', lieu='sport', plans=[
    plan(4, "Elle, tranquille au milieu, lit un livre, zen ; lui entre par la gauche en courant, essoufflé, en sueur, radieux, et vient vers elle les bras ouverts pour un câlin.",
         [fixe('elle', 440, expression='zen', bras='tient'),
          perso('lui', entre(260, 0.2, 1.8, pose='court', expression='essouffle', signes=['sueurs'], tourne=False), E(2.0, angle=0, expression='joie', bras='leves', signes=['sueurs']))],
         objets=[O('livre', 440, 300, 0.6)], textes=[TITRE('toi quand ta personne revient de son footing')]),
    plan(4, "Elle lève les yeux, dégoûtée, se bouche le nez et s'enfuit par la droite ; il la poursuit en courant, tout content, les bras toujours ouverts.",
         [perso('elle', E(0, x=440, expression='degoute', bras='bouche'), sort(440, 0.8, 2.2, vers='droite', pose='sprint', expression='panique')),
          perso('lui', E(0, x=260, expression='joie', bras='leves', signes=['sueurs']), sort(260, 1.2, 3.0, vers='droite', pose='court', expression='joie'))],
         objets=[O('livre', 440, 360, 0.6, de=0.8)]),
    plan(4.5, "Il l'a rattrapée au milieu : câlin, lui ravi, les yeux fermés ; elle, écrasée dedans, les yeux en croix, la langue sortie, K.-O. ; des petits cœurs montent quand même.",
         [perso('lui', E(0, x=290, expression='calin', bras='tend_d', pose='penche_d', signes=['sueurs'])),
          perso('elle', E(0, x=400, expression='ko', pose='penche_g', bras='tend_g', signes=['tourbillon']), E(3.2, expression='blase'))],
         objets=COEURS(345, 150, de=0.8)),
])

reel('ani-242', 'lui', 'toi quand ta personne demande « combien tu m\'aimes ? »', lieu='tendresse', son='tendre', plans=[
    plan(4, "Les deux face à face ; elle, timide, pose la question ; en haut s'écrit « tu m'aimes ? » ; lui répond d'un hochement, content ; elle insiste : « combien ? ».",
         [fixe('elle', 270, expression='timide'), perso('lui', E(0, x=450, expression='content'), E(2.4, expression='pensif', signes=['points']))],
         textes=[TITRE('toi quand ta personne demande « combien tu m\'aimes ? »', a=1.4), DIT('« tu m\'aimes ? »', de=1.6, a=2.6), DIT('« combien ? »', de=2.8)]),
    plan(4, "Il écarte les bras un peu, timide ; elle fait la moue, pas convaincue ; il écarte plus grand, les bras tout ouverts ; elle hausse un sourcil, blasée.",
         [perso('lui', E(0, x=450, expression='timide', bras='tend'), E(1.6, bras='leves', expression='content'), E(3.0, expression='determine')),
          perso('elle', E(0, x=270, expression='attend'), E(1.2, expression='boude'), E(2.6, expression='blase'))]),
    plan(4.5, "Il s'étire de toute sa hauteur, les bras au ciel, tout entier tendu vers le plafond, les étincelles ; elle fond, les yeux en cœur, et vient se blottir contre lui ; des cœurs.",
         [perso('lui', E(0, x=450, expression='determine', bras='leves'), E(0.8, pose='etire', expression='effort', bras='leves', signes=['etincelles']), E(2.8, pose='debout', expression='calin', bras='tend_g')),
          perso('elle', E(0, x=270, expression='blase'), E(1.4, expression='transi'), marche(270, 360, 1.8, 2.6, expression='transi', tourne=False), E(2.8, angle=0, bras='tend_d', pose='penche_d', expression='amour'))],
         objets=COEURS(410, 130, de=3.0)),
])

reel('ani-243', 'les deux', 'nous deux quand on reçoit du monde', lieu='amis', plans=[
    plan(4, "La maison en désordre : un pull par terre, un coussin, un sac ; les deux affalés sur le canapé, blasés ; une horloge ; ils se regardent, les yeux ronds : les invités arrivent.",
         [SUR_CANAPE('lui', 226, expression='blase'), SUR_CANAPE('elle', 414, expression='blase'),
          ],
         meubles=['canape_fond'], objets=[O('pull', 110, 350, 0.8), O('coussin', 560, 350, 0.8), O('horloge', 320, 90, 0.7), O('exclamation', 226, 170, 0.5, de=2.4, a=3.2), O('exclamation', 414, 170, 0.5, de=2.4, a=3.2)],
         textes=[TITRE('nous deux quand on reçoit du monde')]),
    plan(4, "Panique : ils sprintent dans tous les sens, elle ramasse le pull, il attrape le coussin, ils se croisent, se cognent presque, tout disparaît dans un carton.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='panique'), E(0.4, x=440, y=380, taille=250, pose='debout', angle=-90), E(0.5, pose='sprint', expression='panique'), E(1.6, x=120, pose='debout'), E(1.9, angle=90, pose='sprint'), E(3.2, x=520, pose='debout'), E(3.5, angle=0)),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='panique'), E(0.4, x=200, y=380, taille=250, pose='debout', angle=90), E(0.5, pose='sprint', expression='panique', signes=['sueurs']), E(1.6, x=560, pose='debout'), E(1.9, angle=-90, pose='sprint'), E(3.2, x=160, pose='debout'), E(3.5, angle=0))],
         meubles=['canape_fond'], objets=[O('pull', 110, 350, 0.8, a=1.6), O('coussin', 560, 350, 0.8, a=1.6), O('caisse', 330, 345, 1.0, de=2.8)]),
    plan(4.5, "La sonnette ; les deux debout, bien droits devant la porte, l'auréole au-dessus de la tête, le sourire parfait, les pattes dans le dos, comme si rien ne s'était passé ; derrière, le carton déborde.",
         [perso('lui', E(0, x=270, expression='ange', signes=['halo'], bras='bas')), perso('elle', E(0, x=430, expression='ange', signes=['halo'], bras='bas'))],
         objets=[O('porte', 560, 230, 1.6, derriere=True), O('caisse', 120, 345, 1.0, derriere=True), O('pull', 120, 280, 0.6, derriere=True)], sons=[{'nom': 'sonnette', 'a': 0.3}]),
])

reel('ani-244', 'elle', 'toi quand ta personne fait un câlin trop long', lieu='tendresse', son='tendre', plans=[
    plan(4, "Les deux au milieu, câlin, les yeux fermés, des cœurs qui montent ; elle est contente, lui aussi ; le câlin ne s'arrête pas.",
         [fixe('lui', 290, expression='calin', bras='tend_d', pose='penche_d'), fixe('elle', 400, expression='calin', bras='tend_g', pose='penche_g')],
         objets=COEURS(345, 150, de=0.5), textes=[TITRE('toi quand ta personne fait un câlin trop long')]),
    plan(4, "« 5 min plus tard » en bas. Toujours le câlin ; lui n'a pas bougé, ravi ; elle ouvre un œil, attend, regarde l'heure derrière lui, puis s'ennuie.",
         [perso('lui', E(0, x=290, expression='calin', bras='tend_d', pose='penche_d')),
          perso('elle', E(0, x=400, expression='content', bras='tend_g', pose='penche_g'), E(1.0, expression='attend', vers=-1), E(2.6, expression='ennui'))],
         objets=[O('horloge', 540, 110, 0.7)], textes=[BAS('5 min plus tard')]),
    plan(4.5, "« 20 min plus tard » en bas. Toujours le câlin ; lui n'a toujours pas bougé ; elle s'est endormie debout dans ses bras, des z ; il la regarde et sourit, un petit cœur.",
         [perso('lui', E(0, x=290, expression='calin', bras='tend_d', pose='penche_d'), E(2.0, expression='amour', vers=1)),
          perso('elle', E(0, x=400, expression='dodo', bras='tend_g', pose='penche_g', signes=['zzz']))],
         objets=[O('horloge', 540, 110, 0.7), O('coeur', 330, 160, 0.4, de=2.4, flotte=True)], textes=[BAS('20 min plus tard')]),
])

reel('ani-245', 'elle', 'toi quand ta personne voit un chat', lieu='dehors', plans=[
    plan(4, "Dehors, un arbre ; les deux marchent main dans la main vers la droite ; un chat est assis au pied de l'arbre ; elle s'arrête net, émerveillée, et le montre du doigt.",
         [perso('lui', E(0, x=-140, angle=90, pose='marche', expression='content'), E(1.8, x=330, pose='debout'), E(2.2, angle=0)),
          perso('elle', E(0, x=-260, angle=90, pose='marche', expression='content'), E(1.8, x=210, pose='debout'), E(2.2, angle=0, expression='emerveille', bras='pointe', signes=['etincelles']))],
         objets=[O('arbre', 515, 255, 1.3, derriere=True), O('chat', 510, 345, 0.7)], textes=[TITRE('toi quand ta personne voit un chat')]),
    plan(4, "Elle s'accroupit près du chat, les yeux en cœur ; lui, debout, les bras croisés, blasé, attend ; elle lui tend le chat ; il fait non de la tête, pas convaincu.",
         [perso('elle', E(0, x=210, expression='emerveille'), marche(210, 420, 0.3, 1.4, expression='amour'), E(1.8, pose='assis', expression='amour', bras='tend_g'), E(3.0, bras='tend_d')),
          perso('lui', E(0, x=330, expression='blase', bras='croises'), E(3.2, expression='hesite'))],
         objets=[O('arbre', 515, 255, 1.3, derriere=True), O('chat', 510, 345, 0.7, etapes=[{'a': 2.8, 'x': 510}, {'a': 3.4, 'x': 380, 'y': 300}])]),
    plan(4.5, "Lui, debout, le chat dans les bras, d'abord gêné ; le chat se blottit ; il fond complètement, les yeux en cœur, des cœurs qui montent ; elle, derrière, prend une photo, ravie.",
         [perso('lui', E(0, x=330, expression='gene', bras='tient'), E(1.4, expression='transi'), E(2.6, expression='amour', signes=['coeurs'])),
          perso('elle', E(0, x=500, expression='rire'), E(1.8, bras='tient', expression='malicieux'))],
         objets=[O('arbre', 515, 255, 1.3, derriere=True), O('chat', 330, 300, 0.7), O('telephone', 500, 300, 0.5, de=1.8), O('coeur', 380, 140, 0.4, de=2.8, flotte=True)]),
])

reel('ani-246', 'lui', 'toi quand ta personne joue à la console', lieu='canapé', plans=[
    plan(4, "Le canapé, la télé ; lui, la manette à la patte, concentré, penché en avant ; elle s'assoit à côté, contente, et attend qu'il la regarde ; rien.",
         [SUR_CANAPE('lui', 226, expression='concentre', bras='tient'),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='content'), E(1.6, expression='attend', vers=-1), E(3.0, expression='blase'))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('manette', 226, 290, 0.6)], textes=[TITRE('toi quand ta personne joue à la console')]),
    plan(4, "Elle vient s'asseoir sur ses genoux, entre lui et l'écran ; il penche la tête pour voir l'écran à côté d'elle, toujours concentré ; elle s'exaspère.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='malicieux'), E(1.0, x=250, y=250, taille=160, expression='content'), E(2.4, expression='exaspere', signes=['veine'])),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='concentre', bras='tient'), E(1.4, pose='penche_g', x=200))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('manette', 200, 290, 0.6)]),
    plan(4.5, "Elle attrape la deuxième manette, s'assoit à côté, et joue ; en quelques secondes elle gagne, triomphante, les bras levés ; lui, la manette qui tombe, choqué.",
         [perso('elle', E(0, x=250, y=250, taille=160, pose='assis', expression='determine'), E(0.6, x=414, y=318, taille=210, bras='tient', expression='concentre'), E(2.8, expression='triomphe', bras='leves', signes=['etincelles'])),
          perso('lui', E(0, x=200, y=318, taille=210, pose='assis', expression='concentre', bras='tient'), E(2.8, expression='choque', bras='bas', signes=['exclamation']))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('manette', 200, 290, 0.6, a=2.8), O('manette', 200, 350, 0.6, de=2.8), O('manette', 414, 290, 0.6, de=0.6, a=2.8)], sons=[{'nom': 'splat', 'a': 2.8}]),
])

reel('ani-247', 'elle', 'toi quand le lit est froid en rentrant des toilettes', lieu='nuit', plans=[
    plan(4, "La nuit, la lune ; le lit ; lui dort à gauche ; elle se lève de son côté, à droite, en traînant, les yeux fermés, et sort par la droite.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('elle', AU_LIT(394, expression='fatigue'), E(0.8, x=560, y=380, taille=250, pose='debout', bras='bas', pattes='debout', angle=90), E(1.0, pose='marche'), E(2.4, x=820))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], textes=[TITRE('toi quand le lit est froid en rentrant des toilettes')]),
    plan(4, "Elle revient par la droite, se recouche de son côté : il est glacé ; elle grelotte, des frissons, des flocons ; elle regarde le côté de lui, bien chaud, malicieuse.",
         [perso('elle', E(0.2, x=820, angle=-90, pose='marche', expression='fatigue'), E(1.4, x=560, pose='debout'), E(1.6, x=394, y=346, taille=200, bras='aucun', pattes='aucune', angle=0), E(2.0, expression='froid', signes=['frissons', 'flocons']), E(3.2, expression='malicieux', vers=-1)),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)]),
    plan(4.5, "Elle le pousse de son côté chaud vers le côté froid et prend sa place ; il glisse en dormant, se réveille d'un coup, choqué, glacé, des flocons ; elle dort déjà, zen.",
         [perso('elle', AU_LIT(394, expression='malicieux'), E(0.4, bras='tend_g'), E(1.4, x=270, pose='allonge', expression='zen', bras='bas'), E(2.6, expression='dodo', signes=['zzz'])),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo'), E(1.4, x=420), E(2.0, pose='debout', bras='aucun', pattes='aucune', expression='choque', signes=['exclamation']), E(2.8, expression='froid', signes=['frissons', 'flocons']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('flocon', 480, 200, 0.3, de=2.9, flotte=True)]),
])

reel('ani-248', 'lui', 'toi quand ta personne parle en dormant', lieu='nuit', plans=[
    plan(4, "La nuit, la lune ; le lit ; lui dort allongé, la bouche qui bouge, des petits points sortent de lui ; elle, assise à côté, se réveille et l'écoute, perplexe.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['points'])),
          perso('elle', AU_LIT(394, expression='dodo'), E(1.4, expression='perplexe', vers=-1, signes=['question']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], textes=[TITRE('toi quand ta personne parle en dormant')]),
    plan(4, "En haut s'écrit ce qu'il marmonne : « non... pas les pingouins... » ; elle se retient de rire, les pattes sur la bouche ; il fronce les sourcils en dormant, inquiet.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['points']), E(1.8, expression='inquiet', pose='allonge', signes=['sueur'])),
          perso('elle', AU_LIT(394, expression='perplexe', vers=-1), E(1.4, expression='rire', bras='bouche'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], textes=[DIT('« non, pas les pingouins »', de=0.4)]),
    plan(4.5, "Elle se penche et lui répond tout bas, l'air sérieux ; en haut : « t'inquiète, je les ai chassés » ; il sourit dans son sommeil, apaisé ; elle se recouche, fière d'elle.",
         [perso('elle', AU_LIT(394, expression='malicieux', vers=-1), E(0.6, x=330, pose='penche_g', expression='chut'), E(2.6, x=394, pose='allonge', expression='fier', bras='bas')),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='inquiet'), E(1.8, expression='dodo', signes=['zzz']), E(2.4, expression='content'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], textes=[DIT('« t\'inquiète, je les ai chassés »', de=0.8)]),
])

reel('ani-249', 'lui', 'toi quand ta personne pleure devant un film', lieu='canapé', plans=[
    plan(4, "Le canapé, la télé ; elle pleure à chaudes larmes, les mouchoirs à côté ; lui, blasé, regarde l'écran, les bras croisés, puis la regarde, un peu inquiet.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='pleure', signes=['larmes']), E(2.0, expression='sanglote', signes=['fontaines'])),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='blase', bras='croises'), E(2.4, expression='inquiet', vers=1, bras='bas'))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('mouchoirs', 540, 330, 0.6)], textes=[TITRE('toi quand ta personne pleure devant un film')]),
    plan(4, "Il lui tend la boîte de mouchoirs, gentil ; elle se mouche, le remercie d'un sourire, et replonge dans le film ; lui regarde l'écran à son tour, curieux ; sa lèvre tremble.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='content', bras='tend_d'), E(1.6, expression='curieux', bras='bas'), E(3.0, expression='triste')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='sanglote'), E(1.2, expression='emu', bras='tient'), E(2.4, expression='pleure', bras='bas', signes=['larmes']))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('mouchoirs', 330, 300, 0.6, etapes=[{'a': 0, 'x': 330}, {'a': 1.0, 'x': 414}])]),
    plan(4.5, "Les deux pleurent à grosses larmes devant la télé, deux fontaines, lui encore plus fort qu'elle ; elle lui tend un mouchoir sans quitter l'écran des yeux ; il se mouche bruyamment.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='sanglote', signes=['fontaines']), E(3.0, bras='tient')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='pleure', signes=['larmes']), E(2.2, bras='tend_g'))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('mouchoirs', 414, 300, 0.6, etapes=[{'a': 2.2, 'x': 414}, {'a': 2.9, 'x': 240}])]),
])

reel('ani-250', 'les deux', 'nous deux pour le côté du lit', lieu='lit', plans=[
    plan(4, "Le lit vide ; les deux arrivent en même temps, lui par la gauche, elle par la droite, et se jettent sur le même côté, le droit ; ils se cognent, deux points d'exclamation.",
         [perso('lui', E(0.3, x=-140, angle=90, pose='court', expression='joie'), E(1.6, x=380, pose='debout'), E(1.9, x=394, y=346, taille=200, bras='aucun', pattes='aucune', angle=0, expression='surpris', signes=['exclamation'])),
          perso('elle', E(0.3, x=820, angle=-90, pose='court', expression='joie'), E(1.6, x=440, pose='debout'), E(1.9, x=420, y=346, taille=200, bras='aucun', pattes='aucune', angle=0, expression='surpris', signes=['exclamation']))],
         meubles=['lit_fond'], textes=[TITRE('nous deux pour le côté du lit')], sons=[{'nom': 'boing', 'a': 1.7}]),
    plan(4, "Collés sur le même côté, ils se regardent en chiens de faïence ; elle boude ; il boude ; elle le pousse un peu ; il ne bouge pas ; il la pousse ; elle ne bouge pas.",
         [perso('lui', AU_LIT(380, expression='boude', vers=1), E(1.2, expression='determine'), E(2.4, bras='tend_d')),
          perso('elle', AU_LIT(430, expression='boude', vers=-1), E(1.6, bras='tend_g', expression='determine'), E(3.0, expression='furieux', signes=['veine']))],
         meubles=['lit_fond']),
    plan(4.5, "« 1 h plus tard » en bas. Elle dort sur le côté droit, victorieuse, une étincelle ; lui dort en travers du pied du lit, replié, un oreiller sous la tête ; les deux dorment, des z.",
         [perso('elle', E(0, x=420, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz', 'etincelles'])),
          perso('lui', E(0, x=250, y=392, taille=160, pose='allonge', expression='dodo', signes=['zzz']))],
         meubles=['lit_fond'], objets=[O('oreiller', 150, 370, 0.7, derriere=True), O('coeur', 335, 180, 0.35, de=2.0, flotte=True)], textes=[BAS('1 h plus tard')]),
])

reel('ani-251', 'elle', 'toi quand ta personne travaille à la maison', lieu='maison', plans=[
    plan(4, "Elle assise par terre devant son ordinateur, concentrée ; lui arrive par la droite, content, s'arrête derrière elle et attend qu'elle le regarde ; rien.",
         [fixe('elle', 270, pose='assis', expression='concentre', taille=230),
          perso('lui', entre(470, 0.3, 1.8, depuis='droite', expression='content'), E(2.6, expression='attend', vers=-1))],
         objets=[O('ordinateur', 270, 330, 1.0)], textes=[TITRE('toi quand ta personne travaille à la maison')]),
    plan(4, "Il s'assoit à côté d'elle, supplie, les pattes jointes ; elle lève une patte sans le regarder : chut ; il se couche par terre à côté, tout triste, le menton au sol.",
         [perso('lui', E(0, x=470, expression='attend'), E(0.6, x=430, pose='assis', expression='supplie', bras='priere'), E(2.2, pose='allonge', expression='triste', taille=240)),
          perso('elle', E(0, x=270, pose='assis', expression='concentre', taille=230), E(1.4, expression='chut', bras='tend_d'), E(2.4, expression='concentre', bras='bas'))],
         objets=[O('ordinateur', 270, 330, 1.0)]),
    plan(4.5, "« 1 h plus tard » en bas. Elle ferme l'ordinateur, s'étire, se retourne : il s'est endormi par terre à côté d'elle, en boule, des z ; elle sourit, se couche contre lui ; un cœur.",
         [perso('elle', E(0, x=270, pose='assis', expression='concentre', taille=230), E(1.0, pose='etire', expression='fatigue', bras='leves'), E(2.0, pose='debout', expression='surpris', vers=1, bras='bas'), E(3.0, x=360, pose='allonge', expression='amour')),
          perso('lui', E(0, x=450, pose='boule', expression='dodo', signes=['zzz'], taille=230))],
         objets=[O('ordinateur', 270, 330, 1.0, a=1.0), O('ordinateur', 140, 350, 0.8, de=1.0), O('coeur', 400, 190, 0.4, de=3.2, flotte=True)], textes=[BAS('1 h plus tard')]),
])

reel('ani-252', 'lui', 'toi quand la salle de bain est occupée', lieu='matin', plans=[
    plan(4, "Une porte fermée à droite ; elle attend devant, pressée, se dandine d'une patte sur l'autre ; une horloge en haut ; elle frappe à la porte.",
         [perso('elle', E(0, x=400, expression='attend', pose='tremble'), E(1.6, expression='agace'), E(2.4, bras='tend_d', expression='exaspere'))],
         objets=[O('porte', 560, 230, 1.6, derriere=True), O('horloge', 150, 110, 0.7)], textes=[TITRE('toi quand la salle de bain est occupée')], sons=[{'nom': 'tape', 'a': 2.4}, {'nom': 'tape', 'a': 2.8}]),
    plan(4, "En haut : « j'arrive, 2 minutes ! ». Elle s'assoit par terre contre le mur, puis se couche, puis se relève, furieuse, une veine, et frappe encore plus fort.",
         [perso('elle', E(0, x=400, expression='blase'), E(0.8, pose='assis', expression='ennui'), E(1.8, pose='allonge', expression='deprime'), E(2.8, pose='debout', expression='furieux', signes=['veine'], bras='tend_d'))],
         objets=[O('porte', 560, 230, 1.6, derriere=True), O('horloge', 150, 110, 0.7)], textes=[DIT('« j\'arrive, 2 minutes ! »')], sons=[{'nom': 'tape', 'a': 3.0}, {'nom': 'tape', 'a': 3.3}]),
    plan(4.5, "La porte s'ouvre : lui est assis par terre dans la salle de bain, le téléphone à la patte, tout content, pas du tout prêt ; elle reste figée, bouche bée, puis le sort de là en le tirant.",
         [perso('lui', E(0.3, x=560, pose='assis', expression='content', bras='tient'), E(2.4, expression='surpris', bras='bas'), E(3.0, x=560, angle=-90, pose='glisse', expression='panique'), E(4.4, x=300)),
          perso('elle', E(0, x=400, expression='furieux', signes=['veine']), E(0.8, expression='bouche_bee'), E(2.2, expression='determine', bras='tend_d'), E(3.0, x=400, angle=-90, pose='tire'), E(4.4, x=150))],
         objets=[O('porte', 620, 230, 1.6, derriere=True), O('telephone', 560, 300, 0.55, de=0.3, a=3.0)], sons=[{'nom': 'porte', 'a': 0.2}]),
])

reel('ani-253', 'les deux', 'nous deux un soir de décembre', lieu='saisons', son='tendre', plans=[
    plan(4, "« 17 h » en bas. Les deux à la fenêtre, de dos à moitié, regardent dehors : il fait déjà nuit, la lune ; ils se retournent vers nous, blasés, en même temps.",
         [perso('lui', E(0, x=270, expression='blase', dos=True), E(2.0, dos=False, expression='blase')), perso('elle', E(0, x=430, expression='blase', dos=True), E(2.0, dos=False, expression='blase'))],
         objets=[O('fenetre', 350, 150, 1.6, derriere=True), O('lune', 380, 130, 0.5, derriere=True)], textes=[TITRE('nous deux un soir de décembre', a=1.8), BAS('17 h', de=2.0)]),
    plan(4, "« 18 h » en bas. Le canapé, les deux sous le plaid avec une tasse chacun, contents, bien au chaud ; elle pose la tête sur son épaule ; des petits cœurs.",
         [SUR_CANAPE('lui', 226, expression='content', bras='tient'),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='content', bras='tient'), E(2.2, x=380, pose='penche_g', expression='amour', bras='bas'))],
         meubles=['canape_fond'], objets=[O('couverture', 320, 318, 2.6), O('tasse', 226, 290, 0.5), O('tasse', 414, 290, 0.5, a=2.2), O('coeur', 320, 150, 0.4, de=2.6, flotte=True)], textes=[BAS('18 h')]),
    plan(4.5, "« 19 h » en bas. Le lit ; les deux déjà couchés, en pyjama, les yeux fermés, des z ; dehors la lune ; personne ne bouge, c'est l'hiver.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('coeur', 320, 200, 0.35, de=2.0, flotte=True)], textes=[BAS('19 h')]),
])

reel('ani-254', 'elle', 'toi quand ta personne a froid dans le lit', lieu='lit', plans=[
    plan(4, "Le lit, la nuit ; elle grelotte sous les draps, des frissons, en boule ; lui dort à côté, bien au chaud, de la vapeur au-dessus de lui.",
         [perso('elle', E(0, x=394, y=346, taille=190, pose='boule', expression='froid', signes=['frissons'])),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz', 'vapeur']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], textes=[TITRE('toi quand ta personne a froid dans le lit')]),
    plan(4, "Elle se colle à lui, puis passe par-dessus lui et se glisse entre lui et le bord : il est devenu son radiateur ; il se réveille à moitié, gêné, et se décale.",
         [perso('elle', E(0, x=394, y=346, taille=190, pose='boule', expression='froid', signes=['frissons']), E(1.0, x=300, pose='debout', bras='aucun', pattes='aucune', expression='malicieux'), E(2.0, x=200, y=320, taille=170), E(2.6, x=190, y=346, pose='boule', expression='zen')),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo'), E(1.6, expression='gene', signes=['sueur']), E(2.4, x=300))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)]),
    plan(4.5, "Elle dort collée contre lui, zen, les frissons partis ; lui a chaud, de la vapeur, essaie de pousser le drap d'une patte ; il la regarde, sourit, et la laisse ; un cœur.",
         [perso('elle', E(0, x=230, y=346, taille=190, pose='boule', expression='dodo', signes=['zzz'])),
          perso('lui', AU_LIT(330, expression='chaud', signes=['vapeur']), E(1.4, bras='tend_d', expression='effort'), E(2.6, bras='aucun', expression='amour', vers=-1))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('coeur', 280, 190, 0.4, de=2.8, flotte=True)]),
])

reel('ani-255', 'lui', 'toi quand ta personne a « juste une question »', lieu='téléphone', plans=[
    plan(4, "Lui au milieu, prêt à partir, un sac à la patte ; elle à droite l'appelle d'un signe ; en haut s'écrit « juste une question ». Il revient vers elle, content.",
         [perso('lui', E(0, x=250, expression='content', bras='tient'), marche(250, 340, 1.8, 2.6, expression='content')),
          perso('elle', E(0, x=470, expression='content', bras='coucou'), E(2.6, expression='pensif', signes=['points']))],
         objets=[O('sac', 250, 300, 0.7, etapes=[{'a': 1.8, 'x': 250}, {'a': 2.6, 'x': 340}])], textes=[TITRE('toi quand ta personne a « juste une question »', a=1.4), DIT('« juste une question »', de=1.6)]),
    plan(4, "« 20 min plus tard » en bas. Elle parle, les bras qui s'agitent, une idée après l'autre ; lui a posé le sac, écoute, puis regarde l'heure sur son téléphone, inquiet.",
         [perso('elle', E(0, x=470, expression='joie', bras='leves'), E(1.4, expression='idee', signes=['ampoule']), E(2.6, expression='choque', bras='joues')),
          perso('lui', E(0, x=340, expression='ecoute'), E(1.6, bras='tient', expression='inquiet', vers=-1), E(3.0, expression='nerveux', signes=['sueur']))],
         objets=[O('sac', 390, 350, 0.7), O('telephone', 340, 300, 0.5, de=1.6)], textes=[BAS('20 min plus tard')]),
    plan(4.5, "« 1 h plus tard » en bas. Lui est assis par terre, le sac sur les genoux, résigné ; elle parle encore, radieuse ; elle s'arrête enfin, le regarde : « bon, à ce soir ! », et l'embrasse.",
         [perso('lui', E(0, x=340, pose='assis', expression='blase', bras='tient'), E(3.2, expression='content')),
          perso('elle', E(0, x=470, expression='joie', bras='leves'), E(2.0, expression='content', bras='bas'), E(2.8, x=430, pose='penche_g', expression='bisou'))],
         objets=[O('sac', 340, 320, 0.7)], textes=[BAS('1 h plus tard'), DIT('« bon, à ce soir ! »', de=2.2)]),
])

reel('ani-256', 'elle', 'toi quand ta personne veut une photo de la neige', lieu='saisons', plans=[
    plan(4, "Dehors, la neige qui tombe, un arbre blanc ; lui, bonnet sur la tête, grelotte ; elle, le téléphone à la patte, émerveillée, le place devant l'arbre d'une poussée.",
         [perso('lui', E(0, x=330, expression='froid', signes=['frissons']), E(2.0, x=450, expression='blase')),
          perso('elle', E(0, x=200, expression='emerveille', bras='tient'), E(1.4, bras='tend_d', expression='determine'))],
         objets=[O('arbre', 515, 255, 1.3, derriere=True), O('bonnet', 330, 165, 0.9, etapes=[{'a': 0, 'x': 330}, {'a': 2.0, 'x': 450}]), O('telephone', 200, 300, 0.5), O('flocon', 150, 130, 0.35, de=0.2, flotte=True), O('flocon', 420, 110, 0.3, de=0.7, flotte=True)],
         textes=[TITRE('toi quand ta personne veut une photo de la neige')]),
    plan(4, "Elle cadre, il sourit poliment ; elle fait non de la tête, lui fait signe de reculer, encore, encore ; il recule jusqu'à l'arbre en grelottant ; elle n'est toujours pas contente.",
         [perso('elle', E(0, x=200, expression='concentre', bras='tient'), E(1.2, expression='perplexe', bras='coucou'), E(2.6, expression='hesite')),
          perso('lui', E(0, x=450, expression='content', signes=['frissons']), E(1.4, x=500), E(2.6, x=530, expression='exaspere', signes=['frissons', 'veine']))],
         objets=[O('arbre', 515, 255, 1.3, derriere=True), O('bonnet', 450, 165, 0.9, etapes=[{'a': 0, 'x': 450}, {'a': 1.4, 'x': 500}, {'a': 2.6, 'x': 530}]), O('telephone', 200, 300, 0.5), O('flocon', 300, 130, 0.35, de=0.2, flotte=True)]),
    plan(4.5, "« 40 photos plus tard » en bas. Lui est devenu un bonhomme de neige, immobile, couvert de flocons, les yeux en croix ; elle regarde son téléphone, enfin ravie : la photo est parfaite.",
         [perso('lui', E(0, x=530, expression='ko', pose='tremble', signes=['flocons', 'frissons']), E(2.0, pose='debout', expression='ko')),
          perso('elle', E(0, x=200, expression='concentre', bras='tient'), E(1.6, expression='emerveille', signes=['etincelles']), E(3.0, expression='joie', bras='leves'))],
         objets=[O('arbre', 515, 255, 1.3, derriere=True), O('neige', 530, 350, 1.2, derriere=True), O('bonnet', 530, 165, 0.9), O('telephone', 200, 300, 0.5, a=3.0), O('flocon', 480, 150, 0.3, de=0.2, flotte=True), O('flocon', 580, 220, 0.3, de=0.9, flotte=True)],
         textes=[BAS('40 photos plus tard')]),
])

reel('ani-257', 'lui', 'toi quand ta personne range « vite fait » avant de partir', lieu='sortir', plans=[
    plan(4, "Elle à droite, près de la porte, prête, les clés à la patte ; lui au milieu, sur le point de sortir, voit un coussin de travers et va le remettre ; elle lève les yeux au ciel.",
         [perso('elle', E(0, x=500, expression='content', bras='tient'), E(2.6, expression='blase')),
          perso('lui', E(0, x=300, expression='content'), E(1.0, expression='surpris', vers=-1), marche(300, 180, 1.4, 2.2, expression='determine'), E(2.8, bras='tend_g'))],
         objets=[O('porte', 580, 230, 1.6, derriere=True), O('cle', 500, 300, 0.5), O('coussin', 110, 340, 0.8)], textes=[TITRE('toi quand ta personne range « vite fait » avant de partir')]),
    plan(4, "« 10 min plus tard » en bas. Il passe un chiffon partout, la lampe, le carton, à fond, en sueur ; elle s'est assise par terre contre la porte et regarde son téléphone.",
         [perso('lui', E(0, x=180, expression='concentre', bras='tend_d', signes=['sueur']), marche(180, 400, 0.6, 1.6, pose='court', expression='concentre'), E(2.0, bras='tend_d', expression='effort'), marche(400, 250, 2.6, 3.4, pose='court', expression='concentre')),
          perso('elle', E(0, x=500, expression='blase'), E(0.8, pose='assis', expression='ennui', bras='tient'))],
         objets=[O('porte', 580, 230, 1.6, derriere=True), O('coussin', 110, 340, 0.8), O('lampe', 450, 300, 1.0), O('telephone', 500, 300, 0.5, de=0.8)], textes=[BAS('10 min plus tard')]),
    plan(4.5, "« 1 h plus tard » en bas. La maison est impeccable ; lui, fier, les pattes sur les hanches, des étincelles ; elle dort par terre contre la porte, les clés tombées à côté ; il la regarde, gêné.",
         [perso('lui', E(0, x=300, expression='fier', bras='hanches', signes=['etincelles']), E(2.2, expression='surpris', vers=1), E(3.2, expression='gene', bras='tete', signes=['sueur'])),
          perso('elle', E(0, x=500, pose='boule', expression='dodo', signes=['zzz']))],
         objets=[O('porte', 580, 230, 1.6, derriere=True), O('cle', 440, 365, 0.5), O('lampe', 450, 300, 1.0, a=0.1), O('etincelles', 150, 200, 0.5, de=0.3, a=1.5)], textes=[BAS('1 h plus tard')]),
])

# ---- les fêtes : sujets datés (saison.sujets), aux dates de la grille
reel('noel-001', 'les deux', 'nous deux le soir des films de Noël', lieu='canapé', son='noel', jour='2026-12-24', creneau='matin', plans=[
    plan(4, "Le canapé, la télé, des flocons à la fenêtre ; les deux sous le plaid, contents ; elle connaît le film par cœur et mime la scène avant qu'elle arrive ; lui rit.",
         [SUR_CANAPE('lui', 226, expression='content'),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='content'), E(1.2, expression='chante', bras='leves'), E(2.6, expression='emu', bras='joues'))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('couverture', 320, 318, 2.6), O('flocon', 560, 110, 0.35, de=0.3, flotte=True), O('flocon', 110, 130, 0.3, de=0.9, flotte=True)],
         textes=[TITRE('nous deux le soir des films de Noël')]),
    plan(4, "« à la moitié du film » en bas. Elle pleure d'émotion, les mouchoirs ; lui bâille, pique du nez, se redresse, pique du nez encore ; elle ne voit rien.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='emu'), E(1.4, expression='pleure', signes=['larmes'])),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='baille'), E(1.2, expression='fatigue'), E(2.0, expression='surpris'), E(3.0, expression='fatigue'))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('couverture', 320, 318, 2.6), O('mouchoirs', 540, 330, 0.6)], textes=[BAS('à la moitié du film')]),
    plan(4.5, "« la fin du film » en bas. Elle a tout le plaid enroulé autour d'elle, ravie, les yeux brillants ; lui dort debout, appuyé contre l'accoudoir, des z, sans plaid ; les flocons continuent.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='emerveille', signes=['etincelles'])),
          perso('lui', E(0, x=130, y=330, taille=220, pose='penche_g', expression='dodo', signes=['zzz']))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('couverture', 430, 318, 2.2), O('flocon', 560, 110, 0.35, de=0.3, flotte=True), O('coeur', 300, 220, 0.35, de=2.0, flotte=True)], textes=[BAS('la fin du film')]),
])

reel('noel-002', 'les deux', 'nous deux quand on avait dit « pas de cadeaux »', lieu='tendresse', son='noel', jour='2026-12-25', creneau='matin', plans=[
    plan(4, "Le matin de Noël, des flocons ; les deux face à face, les pattes derrière le dos, l'air de rien, l'auréole au-dessus de la tête ; chacun cache quelque chose.",
         [fixe('lui', 270, expression='ange', signes=['halo'], bras='bas'), fixe('elle', 450, expression='ange', signes=['halo'], bras='bas')],
         objets=[O('cadeau', 190, 330, 0.7, derriere=True), O('cadeau', 530, 330, 0.7, derriere=True), O('flocon', 150, 120, 0.35, de=0.3, flotte=True), O('flocon', 540, 150, 0.3, de=0.8, flotte=True)],
         textes=[TITRE('nous deux quand on avait dit « pas de cadeaux »')]),
    plan(4, "Il regarde en coin, elle regarde en coin ; il sort son cadeau de derrière son dos, timide ; au même moment elle sort le sien ; les deux figés, surpris, deux points d'exclamation.",
         [perso('lui', E(0, x=270, expression='suspicieux', vers=1, bras='bas'), E(1.2, expression='timide', bras='tient'), E(2.4, expression='surpris', signes=['exclamation'])),
          perso('elle', E(0, x=450, expression='suspicieux', vers=-1, bras='bas'), E(1.2, expression='timide', bras='tient'), E(2.4, expression='surpris', signes=['exclamation']))],
         objets=[O('cadeau', 270, 300, 0.7, de=1.2), O('cadeau', 450, 300, 0.7, de=1.2), O('flocon', 330, 120, 0.3, de=0.4, flotte=True)], textes=[DIT('« toi aussi ? »', de=2.6)]),
    plan(4.5, "Ils éclatent de rire, échangent les cadeaux, les ouvrent en même temps, émerveillés ; câlin au milieu, les deux cadeaux par terre, des cœurs et des flocons.",
         [perso('lui', E(0, x=270, expression='rire', bras='tient'), E(1.2, expression='emerveille'), E(2.4, x=290, expression='calin', bras='tend_d', pose='penche_d')),
          perso('elle', E(0, x=450, expression='rire', bras='tient'), E(1.2, expression='emerveille'), E(2.4, x=400, expression='calin', bras='tend_g', pose='penche_g'))],
         objets=[O('cadeau', 270, 300, 0.7, a=2.4), O('cadeau', 450, 300, 0.7, a=2.4), O('cadeau', 180, 345, 0.7, de=2.4)] + COEURS(345, 140, de=2.8)),
])

reel('noel-003', 'les deux', 'nous deux le lendemain de Noël chez la belle-famille', lieu='amis', son='noel', jour='2026-12-26', creneau='soir', plans=[
    plan(4, "Le canapé ; les deux affalés, K.-O., les yeux en croix, après deux jours de repas de famille ; un bonnet de travers, le plaid par terre ; rien ne bouge.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='ko', signes=['tourbillon'])),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='ko', signes=['tourbillon']))],
         meubles=['canape_fond'], objets=[O('bonnet', 226, 170, 0.8), O('couverture', 110, 360, 1.4, derriere=True)], textes=[TITRE('nous deux le lendemain de Noël chez la belle-famille')]),
    plan(4, "Le téléphone sonne sur la table ; les deux se redressent, les yeux ronds ; ils se regardent ; en haut s'écrit « on vous attend pour le déjeuner » ; panique.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='ko'), E(0.6, expression='surpris', signes=['exclamation']), E(2.6, expression='panique', signes=['sueurs'])),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='ko'), E(0.6, expression='surpris', signes=['exclamation']), E(2.6, expression='panique', signes=['sueurs']))],
         meubles=['canape_fond'], objets=[O('bonnet', 226, 170, 0.8), O('telephone', 320, 290, 0.55)], textes=[DIT('« on vous attend pour le déjeuner »', de=1.4)], sons=[{'nom': 'sonne', 'a': 0.3}, {'nom': 'sonne', 'a': 1.1}]),
    plan(4.5, "Les deux se cachent sous le plaid au milieu du canapé, seuls les yeux dépassent ; le téléphone sonne encore ; ils se serrent un peu plus ; le téléphone s'arrête ; deux petits cœurs.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='panique'), E(0.8, x=280, expression='peur', pose='boule', taille=190)),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='panique'), E(0.8, x=370, expression='peur', pose='boule', taille=190))],
         meubles=['canape_fond'], objets=[O('couverture', 325, 300, 2.6, de=1.0), O('telephone', 520, 290, 0.55), O('coeur', 325, 150, 0.4, de=3.2, flotte=True)], sons=[{'nom': 'sonne', 'a': 1.6}, {'nom': 'sonne', 'a': 2.4}]),
])

reel('nouvelan-001', 'les deux', 'nous deux le soir du réveillon', lieu='saisons', son='nouvel-an', jour='2026-12-31', creneau='matin', plans=[
    plan(4, "« 22 h » en bas. Les deux debout, sur leur trente et un, prêts à faire la fête, des étincelles, une horloge au mur ; ils dansent sur place, joyeux.",
         [fixe('lui', 270, expression='joie', pose='danse', signes=['etincelles']), fixe('elle', 450, expression='joie', pose='danse', signes=['etincelles'])],
         objets=[O('horloge', 540, 100, 0.7), O('etoiles', 150, 110, 0.6)], textes=[TITRE('nous deux le soir du réveillon', a=1.8), BAS('22 h', de=2.0)]),
    plan(4, "« 23 h » en bas. Assis au bord du canapé, ils regardent l'horloge, puis bâillent tous les deux, puis se regardent, puis regardent encore l'horloge.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='attend', vers=1), E(1.4, expression='baille'), E(2.6, expression='fatigue', vers=1)),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='attend', vers=1), E(1.8, expression='baille'), E(3.0, expression='fatigue', vers=-1))],
         meubles=['canape_fond'], objets=[O('horloge', 540, 100, 0.7)], textes=[BAS('23 h')]),
    plan(4.5, "« minuit » en bas. Des étoiles et des étincelles à la fenêtre ; sur le canapé, les deux dorment l'un sur l'autre sous le plaid, des z ; l'horloge marque minuit ; personne n'a vu.",
         [perso('lui', E(0, x=270, y=318, taille=210, pose='assis', expression='dodo', signes=['zzz'])),
          perso('elle', E(0, x=360, y=318, taille=210, pose='penche_g', expression='dodo', signes=['zzz']))],
         meubles=['canape_fond'], objets=[O('horloge', 540, 100, 0.7), O('couverture', 320, 318, 2.6), O('etoiles', 120, 110, 0.7, de=0.3), O('etincelles', 200, 160, 0.5, de=0.8, a=2.0), O('etincelles', 440, 180, 0.5, de=1.4, a=2.6)], textes=[BAS('minuit')]),
])

reel('nouvelan-002', 'les deux', 'nous deux et la résolution du 1er janvier', lieu='nuit', son='nouvel-an', jour='2027-01-01', creneau='matin', plans=[
    plan(4, "Le matin ; les deux debout, décidés, devant une lettre affichée ; en haut s'écrit la résolution : « cette année, on se couche tôt » ; ils se serrent la patte, solennels.",
         [perso('lui', E(0, x=270, expression='determine', bras='hanches'), E(2.4, bras='tend_d', expression='fier')),
          perso('elle', E(0, x=450, expression='determine', bras='hanches'), E(2.4, bras='tend_g', expression='fier'))],
         objets=[O('lettre', 360, 130, 0.9), O('etincelles', 360, 90, 0.4, de=2.6, a=3.6)], textes=[TITRE('nous deux et la résolution du 1er janvier', a=1.4), DIT('« cette année, on se couche tôt »', de=1.6)]),
    plan(4, "« le soir même » en bas. Le lit, la nuit, la lune ; les deux couchés, les yeux grands ouverts dans la lumière de leur téléphone, chacun le sien, hypnotisés.",
         [perso('lui', AU_LIT(248, expression='hypnotise', bras='tient')), perso('elle', AU_LIT(394, expression='hypnotise', bras='tient'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('telephone', 248, 290, 0.5), O('telephone', 394, 290, 0.5)], textes=[BAS('le soir même')]),
    plan(4.5, "« 2 h du matin » en bas. Toujours les deux téléphones allumés ; elle lui montre une vidéo, ils rient ; la lettre de la résolution est tombée par terre, froissée ; l'horloge a dépassé minuit depuis longtemps.",
         [perso('lui', AU_LIT(270, expression='hypnotise', bras='tient'), E(1.4, expression='rire', vers=1)), perso('elle', AU_LIT(380, expression='hypnotise', bras='tient'), E(1.0, bras='tend_g', expression='rire'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('telephone', 270, 290, 0.5), O('telephone', 330, 290, 0.5, de=1.0), O('lettre', 110, 365, 0.6, derriere=True), O('horloge', 150, 110, 0.6)], textes=[BAS('2 h du matin')]),
])
