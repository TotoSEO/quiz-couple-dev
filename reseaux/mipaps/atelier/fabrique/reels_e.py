# Cinquième lot : vingt-trois reels, février.
from usine import *

CANAPE = dict(y=318, taille=210, pose='assis')


def SUR_CANAPE(nom, x, **k):
    d = dict(CANAPE)
    d.update(k)
    return fixe(nom, x, **d)


reel('ani-283', 'elle', 'toi quand ta personne te pique ton oreiller', lieu='lit', plans=[
    plan(4, "La nuit, le lit ; lui dort, la tête sur son oreiller ; elle, à côté, n'en a plus, tâtonne à côté d'elle, surprise, puis regarde l'oreiller de lui, malicieuse.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('elle', AU_LIT(394, expression='surpris'), E(1.2, bras='tend_d', expression='perplexe', signes=['question']), E(2.6, expression='malicieux', vers=-1))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('oreiller', 250, 265, 0.9, derriere=True)], textes=[TITRE('toi quand ta personne te pique ton oreiller')]),
    plan(4, "Elle tire doucement l'oreiller de sous sa tête ; il glisse, sa tête tombe, il se réveille à moitié, confus ; elle s'installe dessus, zen ; il reprend l'oreiller d'un coup.",
         [perso('elle', AU_LIT(394, expression='malicieux'), E(0.4, bras='tend_g'), E(1.4, expression='zen', bras='aucun'), E(3.0, expression='choque', signes=['exclamation'])),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo'), E(1.2, expression='confus', signes=['question']), E(2.4, bras='tend_d', expression='determine'), E(3.2, expression='dodo', bras='bas'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('oreiller', 250, 265, 0.9, derriere=True, etapes=[{'a': 0.4, 'x': 250}, {'a': 1.4, 'x': 394}, {'a': 2.4, 'x': 394}, {'a': 3.0, 'x': 250}])]),
    plan(4.5, "« 1 h plus tard » en bas. Ils dorment tous les deux la tête sur le même oreiller, au milieu du lit, collés ; des z ; un petit cœur ; plus personne ne se bat.",
         [perso('lui', E(0, x=290, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('elle', E(0, x=360, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('oreiller', 325, 265, 1.0, derriere=True), O('coeur', 325, 190, 0.35, de=2.0, flotte=True)], textes=[BAS('1 h plus tard')]),
])

reel('ani-284', 'lui', 'toi quand ta personne demande « tu penses à quoi ? »', lieu='tendresse', plans=[
    plan(4, "Le canapé ; lui, le regard dans le vide, pensif, des petits points ; elle le regarde, curieuse, puis la question s'écrit en haut : « tu penses à quoi ? » ; il sursaute.",
         [SUR_CANAPE('lui', 226, expression='pensif', signes=['points']),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='curieux', vers=-1))],
         meubles=['canape_fond'], textes=[TITRE('toi quand ta personne demande « tu penses à quoi ? »', a=1.8), DIT('« tu penses à quoi ? »', de=2.0)]),
    plan(4, "Il répond, l'air de rien ; en haut : « à rien » ; elle plisse les yeux, soupçonneuse ; il sourit, l'auréole au-dessus de la tête ; elle le fixe.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='surpris'), E(0.8, expression='ange', signes=['halo'])),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='curieux', vers=-1), E(1.6, expression='suspicieux'))],
         meubles=['canape_fond'], textes=[DIT('« à rien »', de=0.4)]),
    plan(4.5, "Une bulle de pensée apparaît au-dessus de lui, avec dedans une manette de jeu, puis une deuxième ; elle regarde la bulle, blasée ; il n'a rien remarqué, tout content.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='content', signes=['halo']), E(2.8, expression='reveur')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='suspicieux', vers=-1), E(1.8, expression='blase'), E(3.4, expression='exaspere'))],
         meubles=['canape_fond'], objets=[O('pensee', 300, 120, 1.6, de=0.6), O('manette', 300, 115, 0.6, de=1.2), O('manette', 340, 100, 0.4, de=2.4)]),
])

reel('ani-285', 'elle', 'toi quand ta personne parle à la télé', lieu='canapé', plans=[
    plan(4, "Le canapé, la télé ; elle, penchée en avant, pointe l'écran, énervée, et crie ; en haut : « mais non, pas là ! » ; lui, à côté, blasé, les bras croisés.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='colere', bras='pointe'), E(2.4, expression='furieux', bras='leves')),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='blase', bras='croises'))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8)], textes=[TITRE('toi quand ta personne parle à la télé', a=1.6), DIT('« mais non, pas là ! »', de=1.8)]),
    plan(4, "Elle continue, choquée, les pattes sur les joues, puis suppliante vers l'écran ; lui se bouche les oreilles, puis regarde l'écran lui aussi, de plus en plus pris.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='choque', bras='joues'), E(1.4, expression='supplie', bras='priere'), E(2.8, expression='peur')),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='exaspere', bras='oreilles_bouchees'), E(1.6, expression='curieux', bras='bas'), E(2.8, expression='inquiet'))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8)]),
    plan(4.5, "Les deux debout devant la télé, hurlent à l'écran ensemble, les bras levés, furieux, une veine chacun ; en haut : « mais ouvre la porte !!! » ; puis ils se rassoient, essoufflés.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='peur'), E(0.6, x=400, y=380, taille=250, pose='debout', expression='furieux', bras='leves', signes=['veine'])),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='inquiet'), E(0.9, x=240, y=380, taille=250, pose='debout', expression='furieux', bras='leves', signes=['veine']))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8)], textes=[DIT('« mais ouvre la porte !!! »', de=1.2)]),
])

reel('ani-286', 'lui', 'toi quand ta personne t\'apporte le café au lit', lieu='matin', son='tendre', plans=[
    plan(4, "Le matin, le lit ; elle dort ; lui entre par la gauche sur la pointe des pattes, une tasse fumante à la patte, le doigt sur la bouche, très concentré pour ne rien renverser.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('lui', E(0.2, x=-140, angle=90, pose='marche', expression='concentre', bras='tient'), E(2.4, x=180, pose='debout'), E(2.8, angle=0, expression='chut', bras='tient'))],
         meubles=['lit_fond'], objets=[O('tasse', 180, 300, 0.5, de=0.2)], textes=[TITRE('toi quand ta personne t\'apporte le café au lit')]),
    plan(4, "Il s'approche du lit, la tasse tendue ; elle ouvre un œil, voit la tasse, et ses yeux deviennent des cœurs ; elle se redresse, ravie, les pattes tendues.",
         [perso('lui', E(0, x=180, expression='chut', bras='tient'), marche(180, 300, 0.4, 1.2, expression='content', tourne=False), E(1.4, angle=0, bras='tend_d')),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo'), E(1.6, pose='debout', bras='aucun', pattes='aucune', expression='surpris'), E(2.4, expression='amour', signes=['coeurs'], bras='tend_g'))],
         meubles=['lit_fond'], objets=[O('tasse', 180, 300, 0.5, etapes=[{'a': 0.4, 'x': 180}, {'a': 1.2, 'x': 300}, {'a': 1.4, 'x': 360, 'y': 290}])]),
    plan(4.5, "Au moment de la prendre, la tasse bascule ; le café se renverse sur le drap ; les deux figés, bouche bée, une goutte de sueur ; puis ils éclatent de rire ; un cœur quand même.",
         [perso('lui', E(0, x=300, expression='content', bras='tend_d'), E(1.0, expression='bouche_bee', signes=['sueur']), E(2.6, expression='rire')),
          perso('elle', AU_LIT(394, expression='amour', bras='tend_g'), E(1.0, expression='bouche_bee', signes=['sueur']), E(2.6, expression='rire'))],
         meubles=['lit_fond'], objets=[O('tasse', 360, 290, 0.5, a=0.8), O('tasse', 380, 350, 0.5, de=0.8), O('coeur', 340, 180, 0.35, de=3.0, flotte=True)], sons=[{'nom': 'splat', 'a': 0.8}]),
])

reel('ani-287', 'les deux', 'nous deux quand on dit « on sort ce soir »', lieu='sortir', plans=[
    plan(4, "Les deux debout, prêts, un sac, les clés, décidés, des étincelles ; en haut s'écrit « on sort ce soir ! » ; puis ils regardent le canapé.",
         [perso('lui', E(0, x=270, expression='determine', bras='tient', signes=['etincelles']), E(2.6, expression='hesite', vers=1)),
          perso('elle', E(0, x=450, expression='joie', bras='tient', signes=['etincelles']), E(2.8, expression='hesite', vers=-1))],
         objets=[O('cle', 270, 300, 0.5), O('sac', 450, 300, 0.7)], textes=[TITRE('nous deux quand on dit « on sort ce soir »', a=1.4), DIT('« on sort ce soir ! »', de=1.6)]),
    plan(4, "« juste 5 min sur le canapé » en bas. Les deux assis sur le canapé, encore habillés pour sortir, le sac et les clés sur les genoux ; ils se détendent ; les étincelles s'éteignent.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='content', bras='tient'), E(2.0, expression='zen')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='content', bras='tient'), E(2.4, expression='zen'))],
         meubles=['canape_fond'], objets=[O('cle', 226, 290, 0.5), O('sac', 414, 290, 0.7)], textes=[BAS('juste 5 min sur le canapé')]),
    plan(4.5, "« 22 h » en bas. Le canapé ; les deux en pyjama sous le plaid, endormis l'un sur l'autre, des z ; le sac et les clés par terre ; des petits cœurs.",
         [SUR_CANAPE('lui', 270, expression='dodo', signes=['zzz']), perso('elle', E(0, x=360, y=318, taille=210, pose='penche_g', expression='dodo', signes=['zzz']))],
         meubles=['canape_fond'], objets=[O('couverture', 320, 318, 2.6), O('cle', 110, 365, 0.5), O('sac', 560, 350, 0.7), O('coeur', 320, 160, 0.35, de=2.0, flotte=True)], textes=[BAS('22 h')]),
])

reel('ani-288', 'elle', 'toi quand ta personne t\'offre un truc qu\'elle voulait', lieu='tendresse', plans=[
    plan(4, "Elle entre par la gauche avec un cadeau, fière, et le tend à lui, qui attend à droite, surpris puis émerveillé ; il le prend.",
         [perso('elle', entre(290, 0, 1.6, pose='marche', expression='fier', bras='tient'), E(2.2, bras='tend_d')),
          perso('lui', E(0, x=450, expression='content'), E(1.8, expression='surpris'), E(2.8, expression='emerveille', bras='tient'))],
         objets=[O('cadeau', 290, 300, 0.7, etapes=[{'a': 1.6, 'x': 290}, {'a': 2.2, 'x': 370}, {'a': 2.8, 'x': 450}])], textes=[TITRE('toi quand ta personne t\'offre un truc qu\'elle voulait')]),
    plan(4, "Il ouvre : une bougie parfumée ; il reste perplexe, un point d'interrogation ; elle, les yeux qui brillent, la regarde, la bougie, pas lui ; elle tend déjà les pattes.",
         [perso('lui', E(0, x=450, expression='emerveille', bras='tient'), E(1.2, expression='perplexe', signes=['question']), E(2.8, expression='blase', vers=-1)),
          perso('elle', E(0, x=290, expression='content'), E(1.4, expression='emerveille', signes=['etincelles']), E(2.6, bras='tend_d', expression='supplie'))],
         objets=[O('cadeau', 450, 300, 0.7, a=1.2), O('bougie', 450, 300, 0.7, de=1.2)]),
    plan(4.5, "Elle a pris la bougie, l'a posée sur le canapé, s'est installée devant, zen, les yeux fermés, ravie ; lui, debout, tient la boîte vide, résigné, puis hausse les épaules et sourit.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='zen', signes=['etincelles'])),
          perso('lui', E(0, x=200, expression='blase', bras='tient'), E(2.4, expression='content'), E(3.4, expression='amour', vers=1))],
         meubles=['canape_fond'], objets=[O('bougie', 300, 290, 0.6), O('cadeau', 200, 300, 0.7), O('coeur', 240, 170, 0.35, de=3.6, flotte=True)]),
])

reel('ani-289', 'lui', 'toi quand ta personne teste des surnoms', lieu='tendresse', plans=[
    plan(4, "Les deux face à face, tranquilles ; elle, contente, essaie ; en haut s'écrit « mon chou » ; il hausse un sourcil ; puis « mon lapin » ; il est blasé.",
         [perso('lui', E(0, x=450, expression='content'), E(2.0, expression='perplexe'), E(3.2, expression='blase')),
          perso('elle', E(0, x=270, expression='content'), E(2.8, expression='malicieux'))],
         textes=[TITRE('toi quand ta personne teste des surnoms', a=1.6), DIT('« mon chou »', de=1.8, a=2.9), DIT('« mon lapin »', de=3.1)]),
    plan(4, "En haut : « ma crevette » ; il se cache le visage, mort de honte ; « mon caramel mou » ; il se met en boule ; elle rit, ravie, les pattes sur les hanches.",
         [perso('lui', E(0, x=450, expression='gene', bras='visage', signes=['rougeur_pleine']), E(2.0, pose='boule', expression='honte')),
          perso('elle', E(0, x=270, expression='rire'), E(2.4, bras='hanches', expression='fier'))],
         textes=[DIT('« ma crevette »', de=0.3, a=1.9), DIT('« mon caramel mou »', de=2.1)]),
    plan(4.5, "Il se relève, respire, et tente à son tour ; en haut s'écrit « mon pingouin » ; elle se fige, bouche bée ; il est très fier ; elle se met en boule à son tour, morte de honte.",
         [perso('lui', E(0, x=450, pose='boule', expression='honte'), E(0.8, pose='debout', expression='determine'), E(2.0, expression='fier', signes=['etincelles'])),
          perso('elle', E(0, x=270, expression='fier', bras='hanches'), E(1.8, expression='bouche_bee', bras='bas'), E(3.0, pose='boule', expression='honte', signes=['rougeur_pleine']))],
         textes=[DIT('« mon pingouin »', de=1.4)]),
])

reel('ani-290', 'les deux', 'nous deux quand on le dit en même temps', lieu='tendresse', son='tendre', plans=[
    plan(4, "Le canapé, les deux côte à côte, tranquilles, chacun regarde devant soi ; ils ouvrent la bouche en même temps ; en haut s'écrit « je t'aime » ; les deux se figent.",
         [SUR_CANAPE('lui', 226, expression='content'), SUR_CANAPE('elle', 414, expression='content')],
         meubles=['canape_fond'], textes=[TITRE('nous deux quand on le dit en même temps', a=1.6), DIT('« je t\'aime »', de=1.8)]),
    plan(3.5, "Ils se tournent l'un vers l'autre, surpris, deux points d'exclamation ; puis ils rougissent tous les deux ; puis ils éclatent de rire.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='surpris', vers=1, signes=['exclamation']), E(1.2, expression='timide', signes=['rougeur_pleine']), E(2.4, expression='rire')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='surpris', vers=-1, signes=['exclamation']), E(1.2, expression='timide', signes=['rougeur_pleine']), E(2.4, expression='rire'))],
         meubles=['canape_fond']),
    plan(4.5, "Câlin au milieu du canapé, les yeux fermés, des cœurs partout ; ils redisent la phrase ensemble, en haut, mot à mot, et rient encore.",
         [perso('lui', E(0, x=280, y=318, taille=210, pose='penche_d', expression='calin', bras='tend_d')),
          perso('elle', E(0, x=370, y=318, taille=210, pose='penche_g', expression='calin', bras='tend_g'))],
         meubles=['canape_fond'], objets=COEURS(325, 140, de=0.5), textes=[DIT('« je t\'aime »', de=1.6, mot_a_mot=True)]),
])

reel('ani-291', 'les deux', 'nous deux sous la pluie sans parapluie', lieu='dehors', plans=[
    plan(4, "Dehors, un arbre ; les deux marchent tranquillement vers la droite ; un nuage arrive, la pluie tombe d'un coup ; ils s'arrêtent, les yeux ronds, trempés.",
         [perso('lui', E(0, x=-140, angle=90, pose='marche', expression='content'), E(1.8, x=280, pose='debout'), E(2.2, angle=0, expression='choque', signes=['exclamation'])),
          perso('elle', E(0, x=-260, angle=90, pose='marche', expression='joie'), E(1.8, x=160, pose='debout'), E(2.2, angle=0, expression='choque', signes=['exclamation']))],
         objets=[O('arbre', 515, 255, 1.3, derriere=True), O('nuage', 300, 70, 1.0, de=1.6), O('pluie', 300, 170, 1.0, de=2.0), O('pluie', 150, 190, 0.8, de=2.2)],
         textes=[TITRE('nous deux sous la pluie sans parapluie')], ambiance='pluie'),
    plan(4, "Ils sprintent vers l'arbre, elle devant, lui derrière, paniqués, des gouttes partout ; ils se serrent sous l'arbre, trempés, les frissons.",
         [perso('elle', E(0, x=160, angle=90, pose='sprint', expression='panique'), E(1.4, x=470, pose='debout'), E(1.8, angle=0, expression='froid', signes=['frissons'])),
          perso('lui', E(0, x=280, angle=90, pose='sprint', expression='panique', signes=['sueurs']), E(1.6, x=560, pose='debout'), E(2.0, angle=0, expression='froid', signes=['frissons']))],
         objets=[O('arbre', 515, 255, 1.3, derriere=True), O('nuage', 300, 70, 1.0), O('pluie', 250, 190, 1.0), O('pluie', 120, 170, 0.8)], ambiance='pluie'),
    plan(4.5, "Sous l'arbre, serrés, ils se regardent, trempés, les cheveux plaqués ; ils éclatent de rire ; câlin sous la pluie, des cœurs ; la pluie continue, ils s'en fichent.",
         [perso('elle', E(0, x=470, expression='froid', signes=['frissons']), E(1.0, expression='rire'), E(2.2, pose='penche_d', bras='tend_d', expression='calin', x=480)),
          perso('lui', E(0, x=560, expression='froid', signes=['frissons']), E(1.2, expression='rire'), E(2.2, pose='penche_g', bras='tend_g', expression='calin', x=560))],
         objets=[O('arbre', 515, 255, 1.3, derriere=True), O('nuage', 300, 70, 1.0), O('pluie', 220, 190, 1.0), O('pluie', 110, 170, 0.8)] + COEURS(520, 130, de=2.6, n=2), ambiance='pluie'),
])

reel('ani-292', 'lui', 'toi quand ta personne joue avec ta fleur', lieu='tendresse', plans=[
    plan(4, "Le canapé ; elle lit, tranquille ; lui, à côté, tend la patte et touche la fleur sur son oreille ; elle ne dit rien ; il recommence ; elle lève les yeux, blasée.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='zen', bras='tient'), E(2.4, expression='blase', vers=-1)),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='content'), E(0.8, x=270, bras='tend_d', expression='malicieux'), E(1.8, bras='bas'), E(2.4, bras='tend_d'))],
         meubles=['canape_fond'], objets=[O('livre', 414, 290, 0.6)], textes=[TITRE('toi quand ta personne joue avec ta fleur')]),
    plan(4, "Il touche encore la fleur ; elle s'agace, une veine ; il recommence, l'air de rien, l'auréole ; elle ferme le livre d'un coup et le fixe ; il sourit.",
         [perso('lui', E(0, x=270, y=318, taille=210, pose='assis', expression='malicieux', bras='tend_d'), E(1.2, bras='bas', expression='ange', signes=['halo']), E(2.2, bras='tend_d'), E(3.2, expression='content', bras='bas')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='blase', bras='tient'), E(1.0, expression='agace', signes=['veine']), E(2.6, expression='furieux', bras='bas'))],
         meubles=['canape_fond'], objets=[O('livre', 414, 290, 0.6, a=2.6), O('livre', 540, 350, 0.6, de=2.6)]),
    plan(4.5, "Elle retire la fleur de son oreille et la pose sur l'oreille de lui ; il reste figé, puis prend la pose, très fier ; elle rit ; il garde la fleur ; des petits cœurs.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='furieux'), E(0.6, bras='tend_g', expression='malicieux'), E(2.2, expression='rire', bras='bas')),
          perso('lui', E(0, x=270, y=318, taille=210, pose='assis', expression='content'), E(1.4, expression='surpris'), E(2.4, expression='fier', signes=['etincelles']))],
         meubles=['canape_fond'], objets=[O('fleur', 300, 180, 0.4, de=1.4), O('coeur', 340, 120, 0.35, de=3.0, flotte=True)]),
])

reel('ani-293', 'elle', 'toi quand ta personne fait des bisous bruyants', lieu='tendresse', plans=[
    plan(4, "Lui au milieu, tranquille ; elle arrive de la droite, lui fait un gros bisou sur la joue, puis un autre, puis un autre ; il est gêné, tout rouge.",
         [perso('lui', E(0, x=300, expression='content'), E(1.8, expression='gene', signes=['rougeur_pleine']), E(3.0, expression='timide')),
          perso('elle', entre(410, 0, 1.2, depuis='droite', expression='joie', tourne=False), E(1.4, angle=0, pose='penche_g', expression='bisou'), E(2.2, pose='debout', expression='joie'), E(2.8, pose='penche_g', expression='bisou'))],
         objets=[O('coeur', 350, 190, 0.3, de=1.5, a=2.5, flotte=True), O('coeur', 350, 190, 0.3, de=2.9, flotte=True)], textes=[TITRE('toi quand ta personne fait des bisous bruyants')], sons=[{'nom': 'pop', 'a': 1.5}, {'nom': 'pop', 'a': 2.9}]),
    plan(4, "Encore un bisou, encore un ; il se laisse faire, les yeux fermés, puis commence à sourire ; elle ne s'arrête plus ; des cœurs partout.",
         [perso('lui', E(0, x=300, expression='timide', signes=['rougeur_pleine']), E(1.6, expression='content'), E(2.8, expression='amour')),
          perso('elle', E(0, x=410, pose='penche_g', expression='bisou'), E(0.8, pose='debout', expression='joie'), E(1.4, pose='penche_g', expression='bisou'), E(2.2, pose='debout'), E(2.8, pose='penche_g', expression='bisou'))],
         objets=COEURS(355, 150, de=0.4), sons=[{'nom': 'pop', 'a': 0.2}, {'nom': 'pop', 'a': 1.5}, {'nom': 'pop', 'a': 2.9}]),
    plan(4.5, "Il se retourne et lui rend tous ses bisous d'un coup, joue, front, joue, joue ; elle, submergée, les yeux en croix, tombe en arrière, K.-O. de bisous ; il est très fier.",
         [perso('lui', E(0, x=300, expression='amour'), E(0.6, expression='malicieux'), E(1.0, pose='penche_d', expression='bisou'), E(1.6, pose='debout'), E(2.0, pose='penche_d', expression='bisou'), E(2.6, pose='debout', expression='fier', signes=['etincelles'])),
          perso('elle', E(0, x=410, expression='joie'), E(1.0, expression='surpris'), E(2.0, expression='etourdi', signes=['tourbillon']), E(2.8, pose='allonge', expression='ko', x=440))],
         objets=COEURS(355, 140, de=1.0), sons=[{'nom': 'pop', 'a': 1.1}, {'nom': 'pop', 'a': 2.1}, {'nom': 'splat', 'a': 2.8}]),
])

reel('ani-295', 'lui', 'toi quand ta personne marche pieds nus sur un truc', lieu='maison', plans=[
    plan(4, "Lui traverse la pièce en marchant tranquillement vers la droite ; une clé traîne par terre ; il marche dessus, hurle en silence, la patte en l'air, les yeux en croix ; elle, à droite, sursaute.",
         [perso('lui', E(0, x=-140, angle=90, pose='marche', expression='content'), E(1.6, x=300, pose='debout'), E(1.8, angle=0, expression='panique', signes=['exclamation', 'rayons'], pose='tremble')),
          perso('elle', E(0, x=500, expression='content'), E(2.0, expression='surpris', vers=-1))],
         objets=[O('cle', 290, 368, 0.5, derriere=True)], textes=[TITRE('toi quand ta personne marche pieds nus sur un truc')], sons=[{'nom': 'splat', 'a': 1.7}]),
    plan(4, "Il sautille sur une patte, en larmes, puis se laisse tomber par terre, la patte dans les pattes, en pleurant ; elle accourt, inquiète, puis se retient de rire.",
         [perso('lui', E(0, x=300, pose='saut', expression='pleure', signes=['larmes']), E(0.6, y=380, pose='tremble'), E(1.4, pose='assis', expression='sanglote', bras='tient', signes=['fontaines'])),
          perso('elle', E(0, x=500, expression='surpris'), marche(500, 400, 0.4, 1.2, pose='court', expression='inquiet'), E(2.4, expression='rire', bras='bouche'))],
         objets=[O('cle', 290, 368, 0.5, derriere=True)], sons=[{'nom': 'saut', 'a': 0.1}]),
    plan(4.5, "Elle le soulève à bout de bras, lui assis sur ses pattes levées, tout penaud, la clé à la patte ; elle l'emporte vers la droite, décidée, comme un blessé de guerre ; il fait le malade.",
         [perso('elle', E(0, x=400, expression='determine', bras='leves', taille=270), E(1.2, x=400, angle=90, pose='marche'), E(4.0, x=820)),
          perso('lui', E(0, x=402, y=258, taille=150, pose='assis', expression='malade', bras='tient'), E(1.2, x=402), E(4.0, x=822))],
         objets=[O('cle', 430, 240, 0.4, etapes=[{'a': 1.2, 'x': 430}, {'a': 4.0, 'x': 850}])]),
])

reel('ani-296', 'elle', 'toi quand ta personne t\'explique sa série', lieu='canapé', plans=[
    plan(4, "Le canapé ; elle, passionnée, explique, les bras qui dessinent des choses en l'air ; lui écoute, poli, puis fronce les sourcils ; un point d'interrogation.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='joie', bras='leves'), E(1.4, bras='tend_g', expression='choque'), E(2.8, bras='leves', expression='determine')),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='ecoute', vers=1), E(2.2, expression='perplexe', signes=['question']))],
         meubles=['canape_fond'], textes=[TITRE('toi quand ta personne t\'explique sa série')]),
    plan(4, "Elle continue, des petits points partout, une ampoule, encore une idée ; lui est perdu, les yeux en spirale, puis une bulle de pensée au-dessus de lui : un gros point d'interrogation.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='idee', signes=['ampoule'], bras='leves'), E(1.6, expression='rire', bras='joues'), E(2.8, expression='colere', bras='pointe')),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='confus', signes=['points']), E(1.6, expression='hypnotise', signes=['tourbillon']))],
         meubles=['canape_fond'], objets=[O('pensee', 200, 120, 1.4, de=2.0), O('question', 200, 115, 0.6, de=2.4)]),
    plan(4.5, "« 40 min plus tard » en bas. Elle explique toujours ; la bulle de pensée de lui montre maintenant un lit et des z : il dort les yeux ouverts ; elle s'en rend compte, soupire, puis sourit.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='joie', bras='leves'), E(2.2, expression='blase', vers=-1, bras='bas'), E(3.4, expression='amour')),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='hypnotise', signes=['zzz']))],
         meubles=['canape_fond'], objets=[O('pensee', 200, 120, 1.4), O('lit', 200, 120, 0.6), O('zzz', 240, 90, 0.4, de=0.5, flotte=True)], textes=[BAS('40 min plus tard')]),
])

reel('ani-297', 'les deux', 'nous deux quand on dit « on range demain »', lieu='maison', plans=[
    plan(4, "Le salon, un pull et un coussin par terre ; les deux sur le canapé, détendus ; en haut s'écrit « on range demain » ; ils trinquent du regard, l'auréole.",
         [SUR_CANAPE('lui', 226, expression='content'), SUR_CANAPE('elle', 414, expression='content')],
         meubles=['canape_fond'], objets=[O('pull', 110, 350, 0.8), O('coussin', 560, 350, 0.8)], textes=[TITRE('nous deux quand on dit « on range demain »', a=1.6), DIT('« on range demain »', de=1.8)]),
    plan(4, "« le lendemain » en bas. Le pull, le coussin, un sac, une écharpe par terre en plus ; les deux sur le canapé, toujours détendus, l'auréole un peu moins droite ; en haut : « demain ».",
         [SUR_CANAPE('lui', 226, expression='zen', signes=['halo']), SUR_CANAPE('elle', 414, expression='zen', signes=['halo'])],
         meubles=['canape_fond'], objets=[O('pull', 110, 350, 0.8), O('coussin', 560, 350, 0.8), O('sac', 160, 340, 0.7), O('echarpe', 520, 300, 0.8)], textes=[BAS('le lendemain'), DIT('« demain »', de=1.4)]),
    plan(4.5, "« 1 semaine plus tard » en bas. Le salon est une montagne : pull, coussin, sac, écharpe, bonnet, chaussettes ; les deux assis au sommet du tas, zen, les yeux fermés, un petit cœur.",
         [perso('lui', E(0, x=270, y=300, taille=200, pose='assis', expression='zen')), perso('elle', E(0, x=380, y=300, taille=200, pose='assis', expression='zen'))],
         objets=[O('pull', 180, 350, 1.0, derriere=True), O('coussin', 460, 350, 1.0, derriere=True), O('sac', 320, 360, 0.9, derriere=True), O('echarpe', 240, 370, 0.9, derriere=True), O('bonnet', 420, 370, 0.8, derriere=True), O('coeur', 325, 150, 0.35, de=2.0, flotte=True)], textes=[BAS('1 semaine plus tard')]),
])

reel('ani-298', 'elle', 'toi quand ta personne « gère les billets »', lieu='sortir', plans=[
    plan(4, "Une gare, un banc ; les deux arrivent par la gauche avec une valise, elle devant, fière, un billet à la patte ; en haut s'écrit « t'inquiète, je gère ».",
         [perso('elle', entre(300, 0, 1.6, pose='marche', expression='fier', bras='tient')),
          perso('lui', entre(460, 0.2, 1.8, pose='marche', expression='content', bras='tient'))],
         objets=[O('banc', 560, 330, 1.4, derriere=True), O('ticket', 300, 300, 0.5, de=0), O('valise', 460, 310, 0.9, de=0)], textes=[TITRE('toi quand ta personne « gère les billets »', a=1.6), DIT('« t\'inquiète, je gère »', de=1.8)]),
    plan(4, "Elle regarde le billet de près ; son visage change : surprise, puis choc, puis panique, une goutte de sueur ; lui, derrière, n'a rien vu, regarde l'horloge.",
         [perso('elle', E(0, x=300, expression='content', bras='tient'), E(1.0, expression='surpris'), E(1.8, expression='choque', signes=['exclamation']), E(2.6, expression='panique', signes=['sueurs'])),
          perso('lui', E(0, x=460, expression='content', bras='tient'), E(2.0, vers=1, expression='attend'))],
         objets=[O('banc', 560, 330, 1.4, derriere=True), O('ticket', 300, 300, 0.5), O('valise', 460, 310, 0.9), O('horloge', 540, 100, 0.7)]),
    plan(4.5, "En haut : « c'était hier. » ; lui se fige, bouche bée ; puis les deux assis sur le banc, la valise entre eux, blasés, regardent passer le vide ; elle lui tend le billet, désolée ; il rit.",
         [perso('elle', E(0, x=300, expression='panique', bras='tient'), E(1.6, x=480, y=330, taille=220, pose='assis', expression='desole')),
          perso('lui', E(0, x=460, expression='attend'), E(0.8, expression='bouche_bee'), E(1.6, x=600, y=330, taille=220, pose='assis', expression='blase'), E(3.4, expression='rire'))],
         objets=[O('banc', 540, 330, 1.6, derriere=True), O('valise', 540, 350, 0.9, de=1.6), O('ticket', 300, 300, 0.5, a=1.6), O('horloge', 150, 100, 0.7)], textes=[DIT('« c\'était hier. »', de=0.3)]),
])

reel('ani-299', 'lui', 'toi quand ta personne a rêvé que tu lui faisais un truc', lieu='nuit', plans=[
    plan(4, "Le matin, le lit ; elle se réveille d'un coup, furieuse, une veine, et le fusille du regard ; lui, qui dort tranquillement, se réveille sous le regard, confus.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo'), E(0.8, pose='debout', bras='aucun', pattes='aucune', expression='furieux', signes=['veine'], vers=-1)),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']), E(2.2, pose='debout', bras='aucun', pattes='aucune', expression='confus', signes=['question']))],
         meubles=['lit_fond'], textes=[TITRE('toi quand ta personne a rêvé que tu lui faisais un truc')]),
    plan(4, "En haut : « t'as oublié mon anniversaire. dans mon rêve. » ; il ouvre des yeux ronds, puis lève les pattes, innocent ; elle lui tourne le dos et boude, le nuage noir.",
         [perso('lui', AU_LIT(248, expression='surpris', signes=['exclamation']), E(1.8, bras='leves', expression='desole'), E(3.0, expression='supplie', bras='priere')),
          perso('elle', AU_LIT(394, expression='furieux', vers=-1), E(2.0, x=430, expression='boude', vers=1, signes=['nuage_noir']))],
         meubles=['lit_fond'], textes=[DIT('« t\'as oublié mon anniversaire. dans mon rêve. »', de=0.3)]),
    plan(4.5, "« le soir » en bas. Elle, sur le canapé, boude encore, les bras croisés ; lui arrive avec une fleur et un gâteau imaginaire de pardon : juste la fleur ; elle rit, le pardonne ; un cœur.",
         [SUR_CANAPE('elle', 414, expression='boude', bras='croises'),
          perso('lui', entre(260, 0.2, 1.6, pose='marche', expression='desole', bras='tient'), E(2.2, bras='tend_d', expression='supplie'))],
         meubles=['canape_fond'], objets=[O('fleur', 260, 300, 0.5, de=0.2, etapes=[{'a': 1.6, 'x': 260}, {'a': 2.2, 'x': 340}])], textes=[BAS('le soir')]),
])

reel('ani-300', 'les deux', 'nous deux quand on monte un meuble', lieu='maison', plans=[
    plan(4, "Un gros carton ouvert au milieu, une lampe en pièces ; les deux à genoux devant, concentrés, une notice à la patte ; ils se regardent, confiants, le pouce levé.",
         [perso('lui', E(0, x=240, pose='assis', expression='concentre', bras='tient'), E(2.4, expression='content', bras='pouce')),
          perso('elle', E(0, x=440, pose='assis', expression='concentre'), E(2.6, expression='content', bras='pouce'))],
         objets=[O('caisse', 340, 345, 1.1), O('lettre', 240, 300, 0.5, a=2.4)], textes=[TITRE('nous deux quand on monte un meuble')]),
    plan(4, "« 1 h plus tard » en bas. Lui tient un morceau, elle un autre ; ils ne vont pas ensemble ; il s'énerve, elle s'énerve ; ils finissent dos à dos, furieux, les bras croisés, un nuage chacun.",
         [perso('lui', E(0, x=240, pose='assis', expression='effort', bras='tient', signes=['sueur']), E(1.2, expression='colere'), E(2.4, pose='debout', x=230, expression='furieux', bras='croises', vers=-1, signes=['nuage_noir'])),
          perso('elle', E(0, x=440, pose='assis', expression='effort', bras='tient', signes=['sueur']), E(1.4, expression='colere'), E(2.6, pose='debout', x=430, expression='furieux', bras='croises', vers=1, signes=['nuage_noir']))],
         objets=[O('caisse', 340, 345, 1.1), O('lampe', 330, 300, 0.7, a=2.4), O('lampe', 330, 350, 0.7, de=2.4)], textes=[BAS('1 h plus tard')]),
    plan(4.5, "« 3 h plus tard » en bas. La lampe est montée, debout, un peu de travers ; les deux devant, épuisés, fiers, en sueur, le bras autour de l'autre ; la lampe penche, tombe ; ils ne bougent plus.",
         [perso('lui', E(0, x=250, expression='fier', bras='tend_d', signes=['sueur']), E(3.2, expression='blase')),
          perso('elle', E(0, x=400, expression='fier', bras='tend_g', signes=['sueur']), E(3.2, expression='blase'))],
         objets=[O('lampe', 520, 290, 1.3, etapes=[{'a': 0, 'y': 290}, {'a': 2.6, 'y': 290}, {'a': 3.1, 'y': 345}])], textes=[BAS('3 h plus tard')], sons=[{'nom': 'splat', 'a': 3.1}]),
])

reel('ani-301', 'elle', 'toi quand ta personne te vole ta place sur le canapé', lieu='canapé', plans=[
    plan(4, "Le canapé ; lui, bien installé à sa place à gauche, se lève pour aller boire, content, sort par la gauche ; elle, à droite, le suit des yeux, malicieuse.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='content'), E(1.0, x=200, y=380, taille=250, pose='debout', angle=-90), E(1.2, pose='marche'), E(2.8, x=-140)),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='content'), E(2.0, expression='malicieux', vers=-1))],
         meubles=['canape_fond'], textes=[TITRE('toi quand ta personne te vole ta place sur le canapé')]),
    plan(4, "Elle glisse sur le canapé jusqu'à sa place à lui, tout au chaud, et s'installe, zen, les yeux fermés, l'auréole ; il revient par la gauche, s'arrête, bouche bée.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='malicieux'), E(1.0, x=226, expression='zen', signes=['halo'])),
          perso('lui', entre(140, 1.8, 3.0, pose='marche', expression='content', tourne=False), E(3.2, angle=0, expression='bouche_bee'))],
         meubles=['canape_fond']),
    plan(4.5, "Il la regarde, réfléchit, puis s'assoit sur ses genoux, de tout son poids, tout content ; elle, écrasée dessous, les yeux en croix ; il prend la télécommande, l'air de rien.",
         [perso('lui', E(0, x=140, expression='pensif', signes=['points']), E(0.8, expression='malicieux'), E(1.4, x=230, y=250, taille=190, pose='assis', expression='content', signes=['halo'])),
          perso('elle', E(0, x=226, y=318, taille=210, pose='assis', expression='zen'), E(1.6, expression='ko', signes=['tourbillon']))],
         meubles=['canape_fond'], objets=[O('manette', 300, 240, 0.5, de=2.6)], sons=[{'nom': 'coussin', 'a': 1.4}]),
])

reel('ani-302', 'les deux', 'nous deux quand le chat décide de l\'heure du réveil', lieu='matin', plans=[
    plan(4, "Le lit, le matin tôt ; les deux dorment ; le chat est assis sur lui et le fixe ; une horloge ; le chat tapote sa tête ; lui grogne sans ouvrir les yeux.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']), E(2.2, expression='exaspere', pose='allonge')),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']))],
         meubles=['lit_fond'], objets=[O('horloge', 545, 85, 0.7), O('chat', 250, 290, 0.6)], textes=[TITRE('nous deux quand le chat décide de l\'heure du réveil')]),
    plan(4, "Le chat passe sur elle et s'assoit sur sa tête ; elle se réveille, les yeux ronds ; les deux se regardent, puis regardent l'horloge, puis le chat : 6 h.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo'), E(1.2, expression='surpris', pose='allonge', signes=['exclamation']), E(2.4, pose='debout', bras='aucun', pattes='aucune', expression='blase', vers=-1)),
          perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='exaspere'), E(2.4, pose='debout', bras='aucun', pattes='aucune', expression='blase', vers=1))],
         meubles=['lit_fond'], objets=[O('horloge', 545, 85, 0.7), O('chat', 250, 290, 0.6, etapes=[{'a': 0, 'x': 250}, {'a': 0.8, 'x': 394, 'y': 240}])], textes=[BAS('6 h', de=2.6)]),
    plan(4.5, "« 10 min plus tard » en bas. Les deux debout, en pyjama, les yeux cernés, une tasse chacun, blasés ; dans le lit derrière eux, le chat dort, étalé au milieu, des z ; un petit cœur quand même.",
         [perso('lui', E(0, x=150, expression='fatigue', bras='tient')), perso('elle', E(0, x=540, expression='fatigue', bras='tient'), E(3.0, expression='amour', vers=-1))],
         meubles=['lit_fond'], objets=[O('tasse', 150, 300, 0.5), O('tasse', 540, 300, 0.5), O('chat', 320, 330, 0.9), O('zzz', 370, 280, 0.4, de=0.6, flotte=True), O('coeur', 320, 200, 0.35, de=3.2, flotte=True)], textes=[BAS('10 min plus tard')]),
])

reel('ani-303', 'elle', 'toi quand ta personne t\'écrit depuis la pièce d\'à côté', lieu='téléphone', plans=[
    plan(4, "Une porte au milieu ; lui à gauche sur le canapé, le téléphone à la patte ; elle à droite, de l'autre côté de la porte, assise par terre avec le sien ; le téléphone d'elle vibre.",
         [SUR_CANAPE('lui', 180, expression='content', bras='tient'), perso('elle', E(0, x=500, pose='assis', expression='content', bras='tient'), E(2.2, expression='surpris', signes=['exclamation']))],
         meubles=['canape_fond'], objets=[O('porte', 340, 230, 1.6, derriere=True), O('telephone', 180, 290, 0.5), O('telephone', 500, 300, 0.5)], textes=[TITRE('toi quand ta personne t\'écrit depuis la pièce d\'à côté')], sons=[{'nom': 'notification', 'a': 2.0}]),
    plan(4, "En haut s'écrit le message : « tu me manques » ; elle lit, perplexe, regarde la porte, puis rit ; lui, de son côté, attend la réponse, le téléphone devant les yeux.",
         [perso('elle', E(0, x=500, pose='assis', expression='perplexe', bras='tient'), E(1.2, vers=-1, expression='surpris'), E(2.4, expression='rire')),
          perso('lui', E(0, x=180, y=318, taille=210, pose='assis', expression='attend', bras='tient'), E(2.6, expression='supplie'))],
         meubles=['canape_fond'], objets=[O('porte', 340, 230, 1.6, derriere=True), O('telephone', 180, 290, 0.5), O('telephone', 500, 300, 0.5)], textes=[DIT('« tu me manques »', de=0.3)]),
    plan(4.5, "Elle se lève, passe la porte, et vient s'asseoir sur lui, le téléphone encore à la patte ; il est ravi ; elle lui montre l'écran : elle a répondu « moi aussi » ; des cœurs.",
         [perso('elle', E(0, x=500, pose='assis', expression='rire'), E(0.6, x=500, pose='debout', angle=-90), E(0.8, pose='marche'), E(2.0, x=250, pose='debout'), E(2.3, x=200, y=250, taille=160, pose='assis', expression='content', angle=0, bras='tient')),
          perso('lui', E(0, x=180, y=318, taille=210, pose='assis', expression='supplie', bras='tient'), E(2.3, expression='joie', bras='bas'), E(3.4, expression='amour'))],
         meubles=['canape_fond'], objets=[O('porte', 340, 230, 1.6, derriere=True), O('telephone', 200, 230, 0.5, de=2.3)] + COEURS(220, 110, de=2.8), sons=[{'nom': 'porte', 'a': 1.0}]),
])

reel('ani-304', 'elle', 'toi quand ta personne dit « devine quoi »', lieu='tendresse', son='tendre', plans=[
    plan(4, "Lui à gauche, tranquille ; elle entre par la droite, en courant, les yeux qui brillent ; en haut s'écrit « devine quoi » ; il se redresse, curieux, puis inquiet.",
         [perso('lui', E(0, x=270, expression='content'), E(2.2, expression='curieux'), E(3.2, expression='inquiet', signes=['sueur'])),
          perso('elle', entre(450, 0, 1.4, depuis='droite', pose='court', expression='joie', signes=['etincelles']))],
         textes=[TITRE('toi quand ta personne dit « devine quoi »', a=1.6), DIT('« devine quoi »', de=1.8)]),
    plan(4, "Il réfléchit à toute vitesse, des petits points, une goutte de sueur, les pires scénarios dans une bulle : un point d'interrogation, un point d'exclamation ; elle attend, ravie, et le laisse mariner.",
         [perso('lui', E(0, x=270, expression='pensif', signes=['points']), E(1.4, expression='peur', signes=['sueurs']), E(2.6, expression='panique')),
          perso('elle', E(0, x=450, expression='joie', bras='bas'), E(2.0, expression='malicieux', bras='hanches'))],
         objets=[O('pensee', 230, 120, 1.4, de=0.6), O('question', 215, 115, 0.5, de=1.0, a=2.0), O('exclamation', 245, 115, 0.5, de=2.0)]),
    plan(4.5, "En haut s'écrit : « rien. je voulais te voir faire cette tête. » ; il reste bouche bée, puis blasé ; elle, morte de rire ; il finit par sourire et l'attrape pour un câlin ; un cœur.",
         [perso('lui', E(0, x=270, expression='panique'), E(1.4, expression='bouche_bee'), E(2.2, expression='blase'), E(3.2, x=290, pose='penche_d', bras='tend_d', expression='calin')),
          perso('elle', E(0, x=450, expression='rire'), E(2.2, expression='mort_de_rire', pose='debout'), E(3.2, x=400, pose='penche_g', bras='tend_g', expression='joie'))],
         objets=[O('coeur', 345, 150, 0.4, de=3.4, flotte=True)], textes=[DIT('« rien. je voulais te voir faire cette tête. »', de=0.3)]),
])

reel('ani-305', 'les deux', 'nous deux quand on dit « pas de téléphone ce soir »', lieu='maison', plans=[
    plan(4, "Les deux debout, décidés, posent chacun leur téléphone dans un carton au milieu, solennels ; ils se serrent la patte ; en haut s'écrit « pas de téléphone ce soir ».",
         [perso('lui', E(0, x=270, expression='determine', bras='tient'), E(1.0, bras='tend_d'), E(2.4, bras='tend_d', expression='fier')),
          perso('elle', E(0, x=450, expression='determine', bras='tient'), E(1.2, bras='tend_g'), E(2.4, bras='tend_g', expression='fier'))],
         objets=[O('caisse', 360, 345, 1.0), O('telephone', 270, 300, 0.5, etapes=[{'a': 0, 'x': 270}, {'a': 1.0, 'x': 360, 'y': 300}], a=1.4), O('telephone', 450, 300, 0.5, etapes=[{'a': 0, 'x': 450}, {'a': 1.2, 'x': 360, 'y': 300}], a=1.6)],
         textes=[TITRE('nous deux quand on dit « pas de téléphone ce soir »', a=1.6), DIT('« pas de téléphone ce soir »', de=1.8)]),
    plan(4, "« 10 min plus tard » en bas. Les deux sur le canapé, les pattes sur les genoux, le regard fixé sur le carton ; des gouttes de sueur ; ils tremblent un peu ; personne ne parle.",
         [SUR_CANAPE('lui', 226, expression='nerveux', signes=['sueur']), SUR_CANAPE('elle', 414, expression='nerveux', signes=['sueur'])],
         meubles=['canape_fond'], objets=[O('caisse', 320, 345, 1.0)], textes=[BAS('10 min plus tard')]),
    plan(4.5, "« 20 min plus tard » en bas. Les deux allongés par terre de chaque côté du carton, la tête contre le carton, déprimés, un nuage noir ; puis ils se voient, rient, et se font un câlin par-dessus le carton.",
         [perso('lui', E(0, x=230, pose='allonge', expression='deprime', signes=['nuage_noir']), E(1.8, pose='debout', expression='rire'), E(2.8, x=290, pose='penche_d', bras='tend_d', expression='calin')),
          perso('elle', E(0, x=460, pose='allonge', expression='deprime', signes=['nuage_noir']), E(1.8, pose='debout', expression='rire'), E(2.8, x=400, pose='penche_g', bras='tend_g', expression='calin'))],
         objets=[O('caisse', 345, 345, 1.0, derriere=True), O('coeur', 345, 150, 0.4, de=3.2, flotte=True)], textes=[BAS('20 min plus tard')]),
])

reel('ani-306', 'lui', 'toi quand ta personne laisse la lumière allumée partout', lieu='maison', plans=[
    plan(4, "Trois lampes allumées dans la pièce ; lui passe au milieu, content, en allume une quatrième en passant ; elle, derrière lui, en éteint une, puis une autre, blasée.",
         [perso('lui', entre(300, 0, 1.4, pose='marche', expression='content'), E(2.0, bras='tend_d', expression='joie')),
          perso('elle', E(0, x=520, expression='blase'), E(1.4, bras='tend_g'), E(2.6, bras='bas', expression='agace'))],
         objets=[O('lampe', 110, 300, 0.9), O('lampe', 450, 300, 0.9, a=1.6), O('lampe', 580, 300, 0.9, a=2.6), O('lampe', 240, 300, 0.9, de=2.0)], textes=[TITRE('toi quand ta personne laisse la lumière allumée partout')]),
    plan(4, "Il revient, rallume les deux lampes qu'elle a éteintes, l'air de rien, l'auréole ; elle le suit, les éteint, une veine qui bat ; il en rallume une ; elle l'éteint ; de plus en plus vite.",
         [perso('lui', E(0, x=300, expression='ange', signes=['halo']), E(0.6, bras='tend_d'), E(1.6, bras='bas'), E(2.4, bras='tend_d'), E(3.2, bras='bas')),
          perso('elle', E(0, x=520, expression='agace', signes=['veine']), E(1.0, bras='tend_g'), E(2.0, bras='bas', expression='furieux'), E(2.8, bras='tend_g'))],
         objets=[O('lampe', 110, 300, 0.9), O('lampe', 240, 300, 0.9), O('lampe', 450, 300, 0.9, de=0.6, a=1.2), O('lampe', 450, 300, 0.9, de=2.4, a=3.0), O('lampe', 580, 300, 0.9, de=0.8, a=1.4)]),
    plan(4.5, "Elle ramasse toutes les lampes dans un carton, l'une après l'autre, et sort du cadre avec le carton ; lui reste seul dans le noir, debout, une bougie à la patte, tout penaud.",
         [perso('elle', E(0, x=520, expression='determine'), E(0.6, bras='tend_g'), E(1.6, x=330, bras='porte_haut', pose='porte_haut'), E(2.0, x=330, angle=90, pose='marche'), E(4.0, x=820)),
          perso('lui', E(0, x=300, expression='surpris'), E(2.6, expression='honte', bras='tient', signes=['rougeur_pleine']))],
         objets=[O('lampe', 110, 300, 0.9, a=0.8), O('lampe', 240, 300, 0.9, a=1.2), O('caisse', 330, 110, 1.0, de=1.6, etapes=[{'a': 2.0, 'x': 330}, {'a': 4.0, 'x': 820}]), O('bougie', 300, 300, 0.5, de=2.6)]),
])
