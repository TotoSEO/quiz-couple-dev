# Septième lot : vingt-trois reels, mars.
from usine import *

CANAPE = dict(y=318, taille=210, pose='assis')


def SUR_CANAPE(nom, x, **k):
    d = dict(CANAPE)
    d.update(k)
    return fixe(nom, x, **d)


reel('ani-331', 'les deux', "nous deux au changement d'heure", lieu='matin', plans=[
    plan(4, "Le matin, le lit ; les deux se réveillent, regardent l'horloge au mur, puis le téléphone : pas la même heure ; ils se regardent, confus, deux points d'interrogation.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='dodo'), E(0.8, pose='debout', bras='aucun', pattes='aucune', expression='content'), E(2.0, expression='confus', signes=['question'])),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo'), E(1.0, pose='debout', bras='aucun', pattes='aucune', expression='content'), E(2.2, expression='confus', signes=['question']))],
         meubles=['lit_fond'], objets=[O('horloge', 545, 85, 0.7), O('telephone', 248, 290, 0.5, de=0.8)], textes=[TITRE("nous deux au changement d'heure")]),
    plan(4, "En haut s'écrit « on a gagné ou perdu une heure ? » ; lui compte sur ses pattes, concentré ; elle compte dans l'autre sens ; ils arrivent à deux réponses différentes et se disputent.",
         [perso('lui', AU_LIT(248, expression='concentre', signes=['points']), E(1.6, bras='pointe', expression='determine'), E(2.8, expression='colere')),
          perso('elle', AU_LIT(394, expression='pensif', signes=['points']), E(1.8, bras='pointe', expression='determine', vers=-1), E(2.8, expression='colere'))],
         meubles=['lit_fond'], objets=[O('horloge', 545, 85, 0.7)], textes=[DIT('« on a gagné ou perdu une heure ? »', de=0.3)]),
    plan(4.5, "Ils abandonnent, se rallongent tous les deux et se rendorment, par sécurité, des z ; l'horloge et le téléphone ne sont toujours pas d'accord ; un petit cœur.",
         [perso('lui', AU_LIT(248, expression='colere'), E(0.8, expression='blase'), E(1.6, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('elle', AU_LIT(394, expression='colere'), E(0.8, expression='blase'), E(1.8, pose='allonge', expression='dodo', signes=['zzz']))],
         meubles=['lit_fond'], objets=[O('horloge', 545, 85, 0.7), O('telephone', 150, 345, 0.5), O('coeur', 320, 200, 0.35, de=2.6, flotte=True)]),
])

reel('ani-332', 'les deux', 'nous deux quand on se trompe de côté pour le bisou', lieu='tendresse', plans=[
    plan(3.5, "Les deux face à face, contents ; ils se penchent pour un bisou, tous les deux du même côté ; leurs têtes se cognent ; deux points d'exclamation.",
         [perso('lui', E(0, x=290, expression='content'), E(1.0, pose='penche_d', expression='bisou'), E(1.8, expression='surpris', signes=['exclamation'])),
          perso('elle', E(0, x=400, expression='content'), E(1.0, pose='penche_d', expression='bisou', x=390), E(1.8, expression='surpris', signes=['exclamation']))],
         textes=[TITRE('nous deux quand on se trompe de côté pour le bisou')], sons=[{'nom': 'boing', 'a': 1.6}]),
    plan(4, "Ils se redressent, rient, réessaient : de l'autre côté, tous les deux encore ; encore un choc ; ils se frottent le front, blasés ; troisième essai : pareil ; ils abandonnent, dos à dos.",
         [perso('lui', E(0, x=290, pose='debout', expression='rire'), E(0.8, pose='penche_g', expression='bisou'), E(1.4, expression='surpris', signes=['exclamation']), E(2.0, pose='debout', expression='blase', bras='tete'), E(2.8, pose='penche_d', expression='bisou'), E(3.2, expression='exaspere', signes=['veine'])),
          perso('elle', E(0, x=400, pose='debout', expression='rire'), E(0.8, pose='penche_g', expression='bisou'), E(1.4, expression='surpris', signes=['exclamation']), E(2.0, pose='debout', expression='blase', bras='tete'), E(2.8, pose='penche_d', expression='bisou'), E(3.2, expression='exaspere', signes=['veine']))],
         sons=[{'nom': 'boing', 'a': 1.2}, {'nom': 'boing', 'a': 3.1}]),
    plan(4.5, "Elle prend sa tête à deux pattes, la tient bien droite, et pose le bisou d'un coup ; il reste figé, les yeux en cœur ; elle, fière, les pattes sur les hanches ; des cœurs.",
         [perso('elle', E(0, x=400, expression='determine'), E(0.8, bras='joues', x=390), E(1.6, pose='penche_g', expression='bisou'), E(2.6, pose='debout', expression='fier', bras='hanches', signes=['etincelles'])),
          perso('lui', E(0, x=290, expression='exaspere'), E(0.8, expression='surpris'), E(1.8, expression='transi', signes=['coeurs']))],
         objets=COEURS(345, 140, de=2.0), sons=[{'nom': 'pop', 'a': 1.7}]),
])

reel('ani-333', 'elle', 'toi quand ta personne a le hoquet', lieu='maison', plans=[
    plan(4, "Lui au milieu, tranquille ; il sursaute d'un coup, un petit bond, un point d'exclamation ; puis encore ; puis encore ; elle, à droite, le regarde, puis rit.",
         [perso('lui', E(0, x=290, expression='content'), E(0.8, y=355, expression='surpris', signes=['exclamation']), E(1.0, y=380), E(2.0, y=355, signes=['exclamation']), E(2.2, y=380), E(3.2, y=355, signes=['exclamation']), E(3.4, y=380, expression='exaspere')),
          perso('elle', E(0, x=470, expression='content'), E(2.4, expression='rire'))],
         textes=[TITRE('toi quand ta personne a le hoquet')], sons=[{'nom': 'pop', 'a': 0.8}, {'nom': 'pop', 'a': 2.0}, {'nom': 'pop', 'a': 3.2}]),
    plan(4, "Elle a une idée, une ampoule : elle se place derrière lui, l'air de rien, l'auréole ; il sursaute encore ; elle surgit avec une tête de diable et des cornes ; il hurle de peur, les yeux en croix.",
         [perso('elle', E(0, x=470, expression='idee', signes=['ampoule']), E(0.8, x=420, expression='ange', signes=['halo']), E(2.2, x=380, expression='diable', signes=['cornes'], bras='leves')),
          perso('lui', E(0, x=290, expression='exaspere'), E(1.2, y=355, signes=['exclamation']), E(1.4, y=380), E(2.4, expression='panique', signes=['sueurs', 'rayons'], pose='tremble'), E(3.2, pose='debout', expression='ko'))],
         sons=[{'nom': 'pop', 'a': 1.2}, {'nom': 'tonnerre', 'a': 2.3}]),
    plan(4.5, "Le hoquet de lui est parti ; elle, très fière, les pattes sur les hanches ; d'un coup c'est elle qui sursaute, un point d'exclamation ; puis encore ; lui, blasé, la regarde faire des petits bonds.",
         [perso('lui', E(0, x=290, expression='soulage'), E(1.4, expression='content', bras='pouce'), E(2.8, expression='narquois', vers=1)),
          perso('elle', E(0, x=400, expression='fier', bras='hanches', signes=['etincelles']), E(1.6, y=355, expression='surpris', signes=['exclamation'], bras='bas'), E(1.8, y=380), E(2.8, y=355, signes=['exclamation']), E(3.0, y=380, expression='exaspere'), E(4.0, y=355, signes=['exclamation']), E(4.2, y=380))],
         sons=[{'nom': 'pop', 'a': 1.6}, {'nom': 'pop', 'a': 2.8}, {'nom': 'pop', 'a': 4.0}]),
])

reel('ani-334', 'elle', "toi quand ta personne s'endort sur ton épaule dans le bus", lieu='dehors', son='tendre', plans=[
    plan(4, "Un banc, comme dans un bus ; les deux assis, elle pique du nez, puis pose la tête sur son épaule et s'endort, des z ; lui, content, puis il regarde dehors : c'est son arrêt.",
         [perso('lui', E(0, x=290, y=340, taille=220, pose='assis', expression='content'), E(2.6, expression='surpris', vers=1, signes=['exclamation'])),
          perso('elle', E(0, x=400, y=340, taille=220, pose='assis', expression='fatigue'), E(1.2, x=380, pose='penche_g', expression='dodo', signes=['zzz']))],
         objets=[O('banc', 345, 340, 1.6, derriere=True), O('fenetre', 540, 170, 1.2, derriere=True)], textes=[TITRE("toi quand ta personne s'endort sur ton épaule dans le bus")], ambiance='moteur'),
    plan(4, "Il hésite, une goutte de sueur, regarde la porte, la regarde elle ; il n'ose pas bouger ; la porte se referme ; il reste assis, résigné, bien droit, les bras le long du corps.",
         [perso('lui', E(0, x=290, y=340, taille=220, pose='assis', expression='nerveux', signes=['sueur'], vers=1), E(1.2, vers=-1, expression='hesite'), E(2.4, expression='blase'), E(3.2, expression='zen')),
          perso('elle', E(0, x=380, y=340, taille=220, pose='penche_g', expression='dodo', signes=['zzz']))],
         objets=[O('banc', 345, 340, 1.6, derriere=True), O('fenetre', 540, 170, 1.2, derriere=True), O('porte', 100, 230, 1.5, derriere=True)], ambiance='moteur', sons=[{'nom': 'portiere', 'a': 2.2}]),
    plan(4.5, "« 3 arrêts plus tard » en bas. Toujours assis, elle dort toujours sur son épaule ; lui regarde défiler la fenêtre, puis la regarde elle, et sourit, les yeux doux ; un petit cœur ; il n'est pas pressé.",
         [perso('lui', E(0, x=290, y=340, taille=220, pose='assis', expression='zen'), E(1.6, expression='amour', vers=1)),
          perso('elle', E(0, x=380, y=340, taille=220, pose='penche_g', expression='dodo', signes=['zzz']))],
         objets=[O('banc', 345, 340, 1.6, derriere=True), O('fenetre', 540, 170, 1.2, derriere=True), O('coeur', 340, 180, 0.35, de=2.0, flotte=True)], textes=[BAS('3 arrêts plus tard')], ambiance='moteur'),
])

reel('ani-335', 'lui', 'toi quand ta personne préfère le chat', lieu='maison', plans=[
    plan(4, "Le canapé ; elle, le chat sur les genoux, le caresse, les yeux en cœur ; lui arrive de la droite, content, veut s'asseoir ; elle lui fait signe de ne pas déranger le chat.",
         [SUR_CANAPE('elle', 300, expression='amour', signes=['coeurs'], bras='tend_d'),
          perso('lui', E(0.3, x=820, y=380, angle=-90, pose='marche', expression='content'), E(1.8, x=500, pose='debout'), E(2.2, angle=0), E(3.0, expression='surpris'))],
         meubles=['canape_fond'], objets=[O('chat', 360, 280, 0.6)], textes=[TITRE('toi quand ta personne préfère le chat')]),
    plan(4, "Il s'assoit tout au bord ; elle parle au chat, pas à lui ; il devient jaloux, les yeux plissés, puis boude, les bras croisés ; le chat le regarde, l'air de rien.",
         [perso('lui', E(0, x=500, expression='surpris'), E(0.6, x=480, y=318, taille=210, pose='assis', expression='attend'), E(1.8, expression='jaloux'), E(3.0, expression='boude', bras='croises', vers=1)),
          perso('elle', E(0, x=300, y=318, taille=210, pose='assis', expression='amour', bras='tend_d'), E(2.0, expression='chante', signes=['coeurs']))],
         meubles=['canape_fond'], objets=[O('chat', 360, 280, 0.6)]),
    plan(4.5, "Il se glisse entre elle et le chat, pose sa tête sur ses genoux à elle, et fait le chat ; elle rit, et le caresse aussi ; le chat, vexé, va s'asseoir sur la tête de lui ; des cœurs.",
         [perso('lui', E(0, x=480, y=318, taille=210, pose='assis', expression='boude'), E(0.8, x=390, y=250, taille=170, pose='allonge', expression='supplie'), E(2.6, expression='zen')),
          perso('elle', E(0, x=300, y=318, taille=210, pose='assis', expression='chante'), E(1.4, expression='rire'), E(2.2, bras='tend_d', expression='amour'))],
         meubles=['canape_fond'], objets=[O('chat', 360, 280, 0.6, a=0.8), O('chat', 420, 320, 0.6, de=0.8, etapes=[{'a': 0.8, 'x': 420}, {'a': 2.0, 'x': 420}, {'a': 2.8, 'x': 390, 'y': 150}]), O('coeur', 330, 110, 0.35, de=3.0, flotte=True)]),
])

reel('ani-336', 'lui', 'toi quand ta personne veut un bisou dans la rue', lieu='dehors', plans=[
    plan(4, "Dehors, un banc, un arbre ; les deux marchent ; elle s'arrête, se tourne vers lui, la bouche en cœur ; il regarde à gauche, à droite, gêné, les joues rouges.",
         [perso('elle', E(0, x=-140, angle=90, pose='marche', expression='content'), E(1.6, x=380, pose='debout'), E(2.0, angle=0, expression='bisou', pose='penche_g')),
          perso('lui', E(0, x=-260, angle=90, pose='marche', expression='content'), E(1.6, x=260, pose='debout'), E(2.0, angle=0, expression='gene', signes=['rougeur_pleine']), E(2.6, vers=-1), E(3.2, vers=1))],
         objets=[O('banc', 560, 335, 1.2, derriere=True), O('arbre', 515, 255, 1.3, derriere=True)], textes=[TITRE('toi quand ta personne veut un bisou dans la rue')], ambiance='circulation'),
    plan(4, "Elle attend, la bouche en cœur, les yeux fermés ; il hésite, des sueurs, regarde encore autour ; personne ; il se penche très vite et pose un bisou éclair ; puis se redresse, tout raide.",
         [perso('elle', E(0, x=380, expression='bisou', pose='penche_g'), E(2.8, expression='content', pose='debout'), E(3.4, expression='rire')),
          perso('lui', E(0, x=260, expression='nerveux', signes=['sueurs'], vers=-1), E(1.2, vers=1), E(2.0, pose='penche_d', expression='bisou'), E(2.5, pose='debout', expression='honte', signes=['rougeur_pleine'], bras='bas'))],
         objets=[O('banc', 560, 335, 1.2, derriere=True), O('arbre', 515, 255, 1.3, derriere=True), O('coeur', 320, 200, 0.3, de=2.1, a=3.0, flotte=True)], ambiance='circulation', sons=[{'nom': 'pop', 'a': 2.1}]),
    plan(4.5, "Elle rit, lui prend la patte ; il se cache derrière elle, tout petit, la tête qui dépasse à peine, mort de honte ; elle marche fièrement avec lui collé dans son dos ; ils sortent du cadre.",
         [perso('elle', E(0, x=380, expression='rire', bras='tend_g'), E(1.4, x=380, angle=90, pose='marche', expression='fier'), E(4.0, x=820)),
          perso('lui', E(0, x=260, expression='honte', signes=['rougeur_pleine']), E(0.8, x=300, taille=200, pose='boule'), E(1.4, x=300, angle=90, pose='marche', expression='honte'), E(4.0, x=740))],
         objets=[O('banc', 560, 335, 1.2, derriere=True), O('arbre', 515, 255, 1.3, derriere=True)], ambiance='circulation'),
])

reel('ani-337', 'les deux', 'nous deux quand on a dit « ce soir on parle pas boulot »', lieu='canapé', plans=[
    plan(4, "Le canapé ; les deux assis, décidés, le pouce levé ; en haut s'écrit « ce soir, pas un mot de boulot » ; ils sourient, zen ; puis le silence.",
         [SUR_CANAPE('lui', 226, expression='determine', bras='pouce'), SUR_CANAPE('elle', 414, expression='determine', bras='pouce')],
         meubles=['canape_fond'], textes=[TITRE('nous deux quand on a dit « ce soir on parle pas boulot »', a=1.6), DIT('« ce soir, pas un mot de boulot »', de=1.8)]),
    plan(4, "« 2 min plus tard » en bas. Le silence ; lui ouvre la bouche, elle lève la patte : non ; elle ouvre la bouche, il lève la patte : non ; ils se taisent, les joues gonflées, les yeux qui roulent.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='zen'), E(0.6, expression='idee'), E(1.0, expression='boude', bras='croises'), E(2.0, bras='tend_d', expression='chut'), E(3.0, expression='ennui', bras='bas')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='zen'), E(0.8, bras='tend_g', expression='chut'), E(1.4, bras='bas'), E(1.8, expression='idee'), E(2.2, expression='boude', bras='croises'), E(3.0, expression='ennui', bras='bas'))],
         meubles=['canape_fond'], textes=[BAS('2 min plus tard')]),
    plan(4.5, "Elle se penche vers lui, le doigt sur la bouche ; en haut : « juste un truc, après j'arrête » ; il hoche la tête, soulagé ; les deux parlent boulot en chuchotant, penchés l'un vers l'autre, ravis.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='ennui'), E(0.6, x=380, pose='penche_g', expression='chut', bras='bouche'), E(2.0, expression='joie', bras='leves')),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='ennui'), E(1.2, expression='soulage'), E(2.0, x=260, pose='penche_d', expression='joie'), E(3.2, expression='choque', bras='joues'))],
         meubles=['canape_fond'], textes=[DIT('« juste un truc, après j\'arrête »', de=0.8)]),
])

reel('ani-338', 'elle', 'toi quand ta personne a pris toute la salle de bain', lieu='matin', plans=[
    plan(4, "Un rebord de lavabo : à gauche, une brosse à dents, celle de lui, toute seule ; à droite, une brosse, une bougie, des lunettes, une fleur, un pot ; il arrive, sa brosse à la patte, et cherche une place.",
         [perso('lui', entre(220, 0, 1.6, pose='marche', expression='content', bras='tient'), E(2.4, expression='perplexe', signes=['question'], vers=1))],
         objets=[O('brosse', 420, 300, 0.5), O('bougie', 470, 300, 0.5), O('lunettes', 520, 300, 0.5), O('fleur', 560, 300, 0.45), O('plante', 370, 300, 0.5)], textes=[TITRE('toi quand ta personne a pris toute la salle de bain')]),
    plan(4, "Il pousse un objet d'un doigt pour se faire une place ; elle arrive derrière lui, les bras croisés, le regard noir ; il remet l'objet, l'auréole, et recule d'un pas.",
         [perso('lui', E(0, x=220, expression='determine', bras='tend_d'), E(1.6, expression='surpris', vers=1), E(2.2, bras='tend_d', expression='ange', signes=['halo']), E(3.0, x=150, bras='tient')),
          perso('elle', entre(520, 0.8, 2.0, depuis='droite', expression='suspicieux', bras='croises'), E(2.6, expression='furieux', signes=['veine']))],
         objets=[O('brosse', 420, 300, 0.5, etapes=[{'a': 0, 'x': 420}, {'a': 0.8, 'x': 300}, {'a': 2.2, 'x': 300}, {'a': 2.8, 'x': 420}]), O('bougie', 470, 300, 0.5), O('lunettes', 520, 300, 0.5), O('fleur', 560, 300, 0.45), O('plante', 370, 300, 0.5)]),
    plan(4.5, "Il range sa brosse à dents sur sa propre tête, entre les oreilles, et sort fièrement par la gauche ; elle, bouche bée, puis morte de rire ; le rebord reste à elle.",
         [perso('lui', E(0, x=150, expression='pensif', signes=['points']), E(0.8, expression='idee', signes=['ampoule']), E(1.4, bras='tete'), E(2.0, bras='bas', expression='fier', signes=['etincelles']), E(2.6, x=150, angle=-90, pose='marche'), E(4.2, x=-140)),
          perso('elle', E(0, x=520, expression='furieux'), E(2.0, expression='bouche_bee'), E(3.0, expression='mort_de_rire', pose='debout'))],
         objets=[O('brosse', 150, 300, 0.5, a=1.4), O('brosse', 150, 150, 0.45, de=1.4, etapes=[{'a': 2.6, 'x': 150}, {'a': 4.2, 'x': -140}]), O('bougie', 470, 300, 0.5), O('lunettes', 520, 300, 0.5), O('fleur', 560, 300, 0.45), O('plante', 370, 300, 0.5)]),
])

reel('ani-339', 'elle', 'toi quand ta personne a « une petite question » à 23 h', lieu='nuit', plans=[
    plan(4, "La nuit, la lune ; le lit ; lui vient de fermer les yeux, apaisé ; elle, assise, pensive, se tourne vers lui ; en haut s'écrit « tu me vois comment dans dix ans ? » ; il rouvre un œil.",
         [perso('lui', E(0, x=248, y=346, taille=200, pose='allonge', expression='zen'), E(2.6, expression='surpris', pose='allonge')),
          perso('elle', AU_LIT(394, expression='pensif', signes=['points']), E(1.4, vers=-1, expression='curieux'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)], textes=[TITRE('toi quand ta personne a « une petite question » à 23 h', a=1.6), DIT('« tu me vois comment dans dix ans ? »', de=1.8)]),
    plan(4, "Il se redresse, confus, puis panique : des sueurs, des petits points, les yeux qui tournent ; elle attend, tranquille, le menton dans la patte ; il ouvre la bouche, la referme.",
         [perso('lui', AU_LIT(248, expression='confus', signes=['question']), E(1.0, expression='nerveux', signes=['sueurs']), E(2.0, expression='panique', signes=['sueurs', 'points']), E(3.2, expression='hesite')),
          perso('elle', AU_LIT(394, expression='attend', bras='menton', vers=-1))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7)]),
    plan(4.5, "« 3 h du matin » en bas. Elle dort profondément, des z, elle a oublié ; lui, assis dans le lit, les yeux grands ouverts, réfléchit encore, des petits points ; la lune le regarde.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('lui', AU_LIT(248, expression='pensif', signes=['points']), E(2.0, expression='attend'), E(3.2, expression='pensif', signes=['points', 'sueur']))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('pensee', 230, 120, 1.4, de=0.4), O('question', 230, 115, 0.5, de=0.8)], textes=[BAS('3 h du matin')]),
])

reel('ani-340', 'elle', 'toi quand ta personne cherche son téléphone', lieu='téléphone', plans=[
    plan(4, "Elle, au milieu, le téléphone collé à l'oreille, en pleine conversation, cherche partout autour d'elle, paniquée ; en haut s'écrit « je trouve plus mon téléphone !! » ; lui, à droite, la regarde.",
         [perso('elle', E(0, x=290, expression='joie', bras='oreille'), E(1.2, expression='inquiet'), E(2.0, expression='panique', signes=['sueurs'])),
          perso('lui', E(0, x=480, expression='content'), E(2.4, expression='perplexe', vers=-1))],
         objets=[O('telephone', 335, 215, 0.45)], textes=[TITRE('toi quand ta personne cherche son téléphone', a=1.4), DIT('« je trouve plus mon téléphone !! »', de=1.6)]),
    plan(4, "Elle soulève un coussin, regarde sous le canapé, court d'un bord à l'autre, toujours le téléphone à l'oreille ; lui, les bras croisés, un sourire en coin, la laisse chercher.",
         [perso('elle', E(0, x=290, expression='panique', bras='oreille'), E(0.6, x=290, angle=-90, pose='court'), E(1.4, x=120, pose='debout'), E(1.7, angle=90, pose='court'), E(2.8, x=380, pose='debout'), E(3.1, angle=0, bras='oreille', expression='panique')),
          perso('lui', E(0, x=480, expression='perplexe', vers=-1), E(1.6, expression='narquois', bras='croises'))],
         meubles=['canape_fond'], objets=[O('telephone', 335, 215, 0.45, etapes=[{'a': 0.6, 'x': 335}, {'a': 1.4, 'x': 160}, {'a': 1.7, 'x': 160}, {'a': 2.8, 'x': 425}]), O('coussin', 150, 290, 0.8, de=0.8, a=1.6)]),
    plan(4.5, "Il s'approche, pointe du doigt l'oreille d'elle ; elle le regarde, confuse, touche son oreille : le téléphone ; elle se fige, puis se cache le visage, morte de honte ; il rit, puis l'embrasse sur le front.",
         [perso('lui', E(0, x=480, expression='narquois'), marche(480, 440, 0.4, 1.0, expression='content'), E(1.4, bras='pointe', vers=-1), E(2.8, expression='rire'), E(3.6, pose='penche_g', expression='bisou')),
          perso('elle', E(0, x=380, expression='panique', bras='oreille'), E(1.6, expression='confus', signes=['question']), E(2.2, expression='choque', signes=['exclamation']), E(2.8, expression='honte', bras='visage', signes=['rougeur_pleine']))],
         meubles=['canape_fond'], objets=[O('telephone', 425, 215, 0.45, a=2.8), O('telephone', 440, 350, 0.45, de=2.8), O('coeur', 400, 170, 0.3, de=3.8, flotte=True)]),
])

reel('ani-341', 'lui', 'toi quand ta personne dit « c\'est rien, t\'inquiète »', lieu='tendresse', son='tendre', plans=[
    plan(4, "Elle, assise par terre à droite, une petite larme, regarde ses pattes ; lui arrive, s'inquiète ; en haut s'écrit « c'est rien, t'inquiète » ; il reste là, sans savoir quoi faire.",
         [perso('elle', E(0, x=450, pose='assis', expression='triste', signes=['larme'])),
          perso('lui', entre(250, 0.2, 1.6, pose='marche', expression='content'), E(2.0, expression='inquiet', vers=1), E(3.2, expression='hesite'))],
         textes=[TITRE('toi quand ta personne dit « c\'est rien, t\'inquiète »', a=1.8), DIT('« c\'est rien, t\'inquiète »', de=2.0)]),
    plan(4, "Il ne dit rien, vient s'asseoir à côté d'elle, pas trop près ; puis il pose une patte sur son dos ; elle ne bouge pas ; il attend ; elle finit par se laisser aller contre lui.",
         [perso('lui', E(0, x=250, expression='hesite'), E(0.6, x=330, pose='assis', expression='desole'), E(1.8, bras='tend_d', expression='content'), E(3.2, expression='calin')),
          perso('elle', E(0, x=450, pose='assis', expression='triste', signes=['larme']), E(2.6, x=420, pose='penche_g', expression='triste'))]),
    plan(4.5, "Les deux assis par terre, elle contre lui, les yeux fermés ; il ne demande rien ; un petit cœur monte ; au bout d'un moment elle sourit un peu, et lui aussi.",
         [perso('lui', E(0, x=330, pose='assis', expression='calin', bras='tend_d'), E(3.0, expression='content')),
          perso('elle', E(0, x=420, pose='penche_g', expression='triste'), E(2.4, expression='content'), E(3.6, expression='amour'))],
         objets=[O('coeur', 375, 200, 0.35, de=1.4, flotte=True)]),
])

reel('ani-342', 'les deux', 'nous deux et la promesse de regarder la suite ensemble', lieu='canapé', plans=[
    plan(4, "Les deux face à face, la patte levée, solennels ; en haut s'écrit « promis, on regarde la suite ensemble » ; ils se serrent la patte ; chacun part de son côté, l'auréole.",
         [perso('lui', E(0, x=270, expression='determine', bras='leve_d'), E(1.6, bras='tend_d', expression='fier'), E(2.4, bras='bas', expression='ange', signes=['halo']), sort(270, 2.8, 3.9, vers='gauche', pose='marche', expression='ange')),
          perso('elle', E(0, x=450, expression='determine', bras='leve_d'), E(1.6, bras='tend_g', expression='fier'), E(2.4, bras='bas', expression='ange', signes=['halo']), sort(450, 2.8, 3.9, vers='droite', pose='marche', expression='ange'))],
         textes=[TITRE('nous deux et la promesse de regarder la suite ensemble', a=1.4), DIT('« promis, on regarde la suite ensemble »', de=1.6)]),
    plan(4, "« la nuit » en bas. La lune ; le canapé, la télé éteinte ; lui arrive de la gauche sur la pointe des pattes, le doigt sur la bouche ; elle arrive de la droite pareil ; ils ne se voient pas encore.",
         [perso('lui', E(0.2, x=-140, angle=90, pose='marche', expression='chut', bras='bouche'), E(2.2, x=200, pose='debout'), E(2.6, angle=0)),
          perso('elle', E(0.4, x=820, angle=-90, pose='marche', expression='chut', bras='bouche'), E(2.4, x=450, pose='debout'), E(2.8, angle=0))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('lune', 560, 90, 0.5)], textes=[BAS('la nuit')]),
    plan(4.5, "Ils tendent la patte vers la télé en même temps, se voient, se figent, deux points d'exclamation ; un silence ; puis ils éclatent de rire et s'installent ensemble, sous le plaid, la télé allumée.",
         [perso('lui', E(0, x=200, expression='chut', bras='tend_d'), E(0.8, expression='surpris', vers=1, signes=['exclamation']), E(2.0, expression='rire'), E(2.8, x=270, y=318, taille=210, pose='assis', expression='joie')),
          perso('elle', E(0, x=450, expression='chut', bras='tend_g'), E(0.8, expression='surpris', vers=-1, signes=['exclamation']), E(2.0, expression='rire'), E(2.8, x=370, y=318, taille=210, pose='assis', expression='joie'))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('lune', 560, 90, 0.5), O('couverture', 320, 318, 2.4, de=3.0), O('coeur', 320, 230, 0.3, de=3.6, flotte=True)]),
])

reel('ani-343', 'lui', 'toi quand ta personne a « fini » la vaisselle', lieu='maison', plans=[
    plan(4, "Cinq tasses sales alignées à droite ; lui en lave une, concentré, la pose à gauche, bien propre, et s'essuie le front, fier ; en haut s'écrit « c'est bon, j'ai fait la vaisselle ».",
         [perso('lui', E(0, x=300, expression='concentre', bras='tient'), E(1.4, bras='tend_g', expression='effort', signes=['sueur']), E(2.4, bras='hanches', expression='fier', signes=['etincelles']))],
         objets=[O('tasse', 300, 300, 0.5, a=1.4), O('tasse', 130, 345, 0.5, de=1.4), O('tasse', 440, 345, 0.5), O('tasse', 490, 345, 0.5), O('tasse', 540, 345, 0.5), O('tasse', 590, 345, 0.5)],
         textes=[TITRE('toi quand ta personne a « fini » la vaisselle', a=1.8), DIT('« c\'est bon, j\'ai fait la vaisselle »', de=2.0)]),
    plan(4, "Elle arrive de la gauche, regarde la tasse propre, puis les cinq tasses sales, puis lui ; elle lève un sourcil ; lui lève le pouce, très content de lui ; elle est blasée.",
         [perso('elle', entre(200, 0, 1.4, pose='marche', expression='content'), E(1.8, vers=-1, expression='curieux'), E(2.4, vers=1, expression='perplexe'), E(3.2, expression='blase')),
          perso('lui', E(0, x=300, expression='fier', bras='hanches'), E(2.6, bras='pouce', expression='content'))],
         objets=[O('tasse', 130, 345, 0.5), O('tasse', 440, 345, 0.5), O('tasse', 490, 345, 0.5), O('tasse', 540, 345, 0.5), O('tasse', 590, 345, 0.5)]),
    plan(4.5, "Elle pousse les cinq tasses sales vers lui d'un seul geste ; elles glissent toutes jusqu'à ses pattes ; il les regarde, la regarde, soupire, et reprend l'éponge, blasé ; elle part, les pattes sur les hanches.",
         [perso('elle', E(0, x=200, expression='blase'), marche(200, 400, 0.4, 1.4, expression='determine'), E(1.8, bras='tend_g', expression='narquois'), E(2.6, bras='hanches', expression='fier'), sort(400, 3.2, 4.4, vers='gauche', pose='marche', expression='fier')),
          perso('lui', E(0, x=300, expression='content', bras='pouce'), E(2.2, expression='surpris', vers=1), E(3.2, expression='blase', bras='tient'))],
         objets=[O('tasse', 130, 345, 0.5), O('tasse', 440, 345, 0.5, etapes=[{'a': 1.8, 'x': 440}, {'a': 2.4, 'x': 250}]), O('tasse', 490, 345, 0.5, etapes=[{'a': 1.8, 'x': 490}, {'a': 2.4, 'x': 290}]), O('tasse', 540, 345, 0.5, etapes=[{'a': 1.8, 'x': 540}, {'a': 2.4, 'x': 330}]), O('tasse', 590, 345, 0.5, etapes=[{'a': 1.8, 'x': 590}, {'a': 2.4, 'x': 370}])],
         sons=[{'nom': 'glisse', 'a': 1.9}]),
])

reel('ani-344', 'elle', 'toi quand ta personne veut monter sur tes épaules au concert', lieu='dehors', plans=[
    plan(4, "Un concert : des notes, des étoiles, la nuit ; les deux dansent, ravis ; elle se dresse sur la pointe des pattes pour voir, n'y arrive pas, et le regarde, suppliante.",
         [perso('lui', E(0, x=330, pose='danse', expression='joie', signes=['notes'])),
          perso('elle', E(0, x=460, pose='danse', expression='joie'), E(1.4, pose='etire', expression='effort'), E(2.6, pose='debout', expression='supplie', bras='priere', vers=-1))],
         objets=[O('etoiles', 150, 90, 0.7), O('musique', 520, 110, 0.6, de=0.3, flotte=True), O('musique', 200, 160, 0.5, de=1.0, flotte=True)], textes=[TITRE('toi quand ta personne veut monter sur tes épaules au concert')], ambiance='brouhaha'),
    plan(4, "Il se baisse, elle grimpe, et le voilà avec elle assise sur ses épaules, les bras en l'air, ravie, qui voit tout ; lui, en dessous, tient bon, les pattes levées, souriant.",
         [perso('lui', E(0, x=330, expression='content'), E(0.6, pose='assis', expression='determine'), E(1.6, pose='debout', bras='leves', taille=270, expression='effort')),
          perso('elle', E(0, x=460, expression='joie'), E(1.6, x=332, y=258, taille=150, pose='assis', expression='emerveille', bras='leves', signes=['etincelles']))],
         objets=[O('etoiles', 150, 90, 0.7), O('musique', 520, 110, 0.6, de=0.3, flotte=True), O('musique', 180, 200, 0.5, de=1.2, flotte=True)], ambiance='brouhaha'),
    plan(4.5, "« 2 h plus tard » en bas. Elle, toujours sur ses épaules, chante, les bras en l'air ; lui, en dessous, les pattes qui tremblent, des sueurs, les yeux en croix, tient encore ; il tient toujours.",
         [perso('lui', E(0, x=330, bras='leves', taille=270, expression='effort', signes=['sueurs'], pose='tremble'), E(2.4, expression='ko', signes=['tourbillon', 'sueurs'])),
          perso('elle', E(0, x=332, y=258, taille=150, pose='assis', expression='chante', bras='leves', signes=['notes']))],
         objets=[O('etoiles', 150, 90, 0.7), O('musique', 520, 110, 0.6, de=0.3, flotte=True), O('musique', 160, 190, 0.5, de=1.4, flotte=True)], textes=[BAS('2 h plus tard')], ambiance='brouhaha'),
])

reel('ani-345', 'lui', 'toi quand ta personne essaie de te réveiller en douceur', lieu='matin', plans=[
    plan(4, "Le matin, le lit ; elle dort profondément, des z ; lui, debout à côté, chuchote, lui tapote l'épaule doucement ; rien ; il lui fait un bisou sur le front ; rien.",
         [perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz'])),
          perso('lui', E(0, x=250, expression='chut', bras='bouche'), E(1.0, bras='tend_d', expression='content'), E(2.2, x=300, pose='penche_d', expression='bisou'), E(3.2, pose='debout', expression='perplexe', signes=['question']))],
         meubles=['lit_fond'], objets=[O('horloge', 545, 85, 0.7)], textes=[TITRE('toi quand ta personne essaie de te réveiller en douceur')]),
    plan(4, "Il ouvre la fenêtre, un oiseau chante ; rien ; il lui caresse la tête ; rien ; il lui prend la patte et la secoue un peu ; elle grogne et se retourne, toujours endormie ; il regarde l'horloge.",
         [perso('lui', E(0, x=300, expression='content', bras='tend_d'), E(1.2, expression='hesite'), E(2.0, bras='tend_d', expression='effort'), E(3.0, expression='nerveux', vers=1, signes=['sueur'])),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo', signes=['zzz']), E(2.4, x=430, expression='boude', pose='allonge'))],
         meubles=['lit_fond'], objets=[O('horloge', 545, 85, 0.7), O('oiseau', 560, 180, 0.5, de=0.6, a=2.0)], sons=[{'nom': 'oiseau', 'a': 0.7}]),
    plan(4.5, "Il prend une grande inspiration, et hurle ; en haut s'écrit « DEBOUT !!! » en grand ; elle bondit hors du lit, les yeux ronds, les cheveux dressés, furieuse ; il recule, l'auréole, et pointe l'horloge.",
         [perso('lui', E(0, x=300, expression='determine'), E(0.8, expression='furieux', bras='leves', signes=['flammes']), E(2.0, x=200, expression='ange', signes=['halo'], bras='pointe', vers=1)),
          perso('elle', E(0, x=430, y=346, taille=200, pose='allonge', expression='dodo'), E(1.0, pose='saut', y=300, expression='panique', signes=['exclamation', 'rayons']), E(1.6, y=346, pose='debout', bras='aucun', pattes='aucune', expression='furieux', signes=['veine']))],
         meubles=['lit_fond'], objets=[O('horloge', 545, 85, 0.7)], textes=[DIT('« DEBOUT !!! »', de=0.8)], sons=[{'nom': 'saut', 'a': 1.0}]),
])

reel('ani-346', 'elle', 'toi quand ta personne te fait un câlin par-derrière', lieu='tendresse', son='tendre', plans=[
    plan(4, "Lui, de dos à moitié, lave une tasse, concentré ; elle arrive sur la pointe des pattes, le doigt sur la bouche, et vient l'enlacer par-derrière, les yeux fermés.",
         [fixe('lui', 300, expression='concentre', bras='tient'),
          perso('elle', E(0.2, x=820, angle=-90, pose='marche', expression='chut', bras='bouche'), E(1.8, x=420, pose='debout'), E(2.1, angle=0, pose='penche_g', expression='calin', bras='tend_g', x=400))],
         objets=[O('tasse', 300, 300, 0.5)], textes=[TITRE('toi quand ta personne te fait un câlin par-derrière')]),
    plan(4, "Il sursaute, la tasse lui échappe et tombe ; il reste figé, surpris ; puis il comprend, sourit, et pose ses pattes sur les siennes ; des petits cœurs montent.",
         [perso('lui', E(0, x=300, expression='surpris', signes=['exclamation'], bras='bas'), E(1.4, expression='content'), E(2.4, expression='amour', bras='tend_d')),
          perso('elle', E(0, x=400, pose='penche_g', expression='calin', bras='tend_g'), E(1.0, expression='surpris'), E(2.0, expression='calin'))],
         objets=[O('tasse', 300, 300, 0.5, etapes=[{'a': 0, 'y': 300}, {'a': 0.4, 'y': 355}])] + COEURS(350, 140, de=2.4), sons=[{'nom': 'splat', 'a': 0.4}]),
    plan(4.5, "Ils restent comme ça, elle collée dans son dos, les yeux fermés ; la tasse par terre, cassée ; il regarde la tasse, puis hausse les épaules : tant pis ; elle sourit contre son dos.",
         [perso('lui', E(0, x=300, expression='amour', bras='tend_d'), E(1.6, vers=-1, expression='blase'), E(2.6, expression='content'), E(3.4, expression='zen')),
          perso('elle', E(0, x=400, pose='penche_g', expression='calin', bras='tend_g'), E(3.0, expression='content'))],
         objets=[O('tasse', 300, 355, 0.5), O('coeur', 360, 160, 0.35, de=3.2, flotte=True)]),
])

reel('ani-347', 'lui', 'toi quand ta personne dit « on fait un tour » à 22 h', lieu='dehors', plans=[
    plan(4, "La nuit, la lune, un arbre ; elle, bonnet sur la tête, ravie, tire lui par la patte vers la droite ; lui suit en traînant, pas convaincu, en pyjama sous sa veste.",
         [perso('elle', E(0, x=-140, angle=90, pose='marche', expression='joie', bras='tend_g'), E(2.0, x=330, pose='debout'), E(2.4, angle=0, expression='emerveille')),
          perso('lui', E(0, x=-260, angle=90, pose='marche', expression='blase', bras='tend_d'), E(2.0, x=210, pose='debout'), E(2.4, angle=0, expression='fatigue'))],
         objets=[O('lune', 545, 85, 0.7), O('arbre', 515, 255, 1.3, derriere=True), O('bonnet', 330, 165, 0.9, etapes=[{'a': 0, 'x': -140}, {'a': 2.0, 'x': 330}])], textes=[TITRE('toi quand ta personne dit « on fait un tour » à 22 h')], ambiance='grillons'),
    plan(4, "Elle regarde les étoiles, les bras ouverts, émerveillée ; lui regarde ses pattes, puis le ciel, puis grelotte, des frissons ; il se colle à elle pour avoir chaud ; elle lui donne son bonnet.",
         [perso('elle', E(0, x=330, expression='emerveille', bras='leves'), E(2.0, vers=-1, expression='rire'), E(2.8, bras='tend_g', expression='content')),
          perso('lui', E(0, x=210, expression='fatigue'), E(1.0, expression='froid', signes=['frissons'], pose='tremble'), E(2.0, x=260, pose='debout', expression='supplie'), E(3.2, expression='content'))],
         objets=[O('lune', 545, 85, 0.7), O('etoiles', 150, 90, 0.6), O('arbre', 515, 255, 1.3, derriere=True), O('bonnet', 330, 165, 0.9, etapes=[{'a': 2.8, 'x': 330}, {'a': 3.2, 'x': 260}])], ambiance='grillons'),
    plan(4.5, "Les deux assis sur un banc sous la lune, serrés, lui avec le bonnet ; elle pose la tête sur son épaule ; il regarde enfin les étoiles, et sourit ; un petit cœur ; il avait tort, c'était bien.",
         [perso('lui', E(0, x=290, y=340, taille=220, pose='assis', expression='content'), E(2.0, expression='amour')),
          perso('elle', E(0, x=400, y=340, taille=220, pose='assis', expression='zen'), E(1.2, x=380, pose='penche_g'))],
         objets=[O('lune', 545, 85, 0.7), O('etoiles', 150, 90, 0.6), O('banc', 345, 340, 1.6, derriere=True), O('bonnet', 290, 165, 0.9), O('coeur', 345, 190, 0.35, de=2.4, flotte=True)], ambiance='grillons'),
])

reel('ani-348', 'elle', 'toi quand ta personne te lève pour un lever de soleil', lieu='saisons', son='tendre', plans=[
    plan(4, "La nuit encore, le lit ; lui, déjà habillé, bonnet, secoue elle qui dort ; en haut s'écrit « viens voir, dépêche » ; elle grogne, furieuse, et se cache sous l'oreiller.",
         [perso('lui', E(0, x=250, expression='joie', bras='tend_d', signes=['etincelles'])),
          perso('elle', E(0, x=394, y=346, taille=200, pose='allonge', expression='dodo'), E(1.6, expression='furieux', pose='allonge', signes=['veine']), E(2.6, bras='tete'))],
         meubles=['lit_fond'], objets=[O('lune', 545, 85, 0.7), O('bonnet', 250, 165, 0.9), O('oreiller', 394, 230, 1.0, de=2.6)], textes=[TITRE('toi quand ta personne te lève pour un lever de soleil', a=1.6), DIT('« viens voir, dépêche »', de=1.8)]),
    plan(4, "Dehors, un banc, le ciel encore sombre ; elle, emmitouflée, les yeux fermés, boude, les bras croisés ; lui, à côté, attend, les yeux vers l'horizon ; le soleil commence à monter.",
         [perso('elle', E(0, x=400, y=340, taille=220, pose='assis', expression='boude', bras='croises', signes=['frissons'])),
          perso('lui', E(0, x=290, y=340, taille=220, pose='assis', expression='attend', vers=1), E(2.4, expression='emerveille'))],
         objets=[O('banc', 345, 340, 1.6, derriere=True), O('echarpe', 400, 300, 0.9), O('bonnet', 290, 160, 0.9), O('soleil', 560, 330, 0.8, derriere=True, etapes=[{'a': 0, 'y': 330}, {'a': 4, 'y': 200}])], ambiance='oiseaux'),
    plan(4.5, "Le soleil monte, le ciel se remplit d'étoiles de lumière ; elle ouvre un œil, puis les deux, bouche bée, puis émerveillée ; elle lui prend la patte sans rien dire ; un cœur ; il avait raison.",
         [perso('elle', E(0, x=400, y=340, taille=220, pose='assis', expression='boude', bras='croises'), E(0.8, expression='surpris', vers=1), E(1.8, expression='bouche_bee', bras='bas'), E(2.8, expression='emerveille', signes=['etincelles'], bras='tend_g')),
          perso('lui', E(0, x=290, y=340, taille=220, pose='assis', expression='emerveille'), E(3.0, bras='tend_d', expression='amour'))],
         objets=[O('banc', 345, 340, 1.6, derriere=True), O('bonnet', 290, 160, 0.9), O('soleil', 560, 200, 0.9, derriere=True, etapes=[{'a': 0, 'y': 200}, {'a': 4.5, 'y': 110}]), O('etincelles', 480, 150, 0.6, de=1.0, a=3.0), O('coeur', 345, 190, 0.35, de=3.4, flotte=True)], ambiance='oiseaux'),
])

reel('ani-349', 'lui', 'toi quand ta personne fait semblant d\'être fâchée', lieu='dispute', plans=[
    plan(4, "Lui, à gauche, boude, les bras croisés, tourné vers le bord, un nuage noir trop bien dessiné ; elle, à droite, le regarde, pas dupe, un sourire en coin.",
         [fixe('lui', 260, expression='boude', bras='croises', vers=-1, signes=['nuage_noir']),
          perso('elle', E(0, x=450, expression='content'), E(1.8, expression='narquois', vers=-1))],
         textes=[TITRE('toi quand ta personne fait semblant d\'être fâchée')]),
    plan(4, "Elle s'approche à pas de loup, et lui chatouille les côtes ; il résiste, les joues gonflées, tremble, puis craque et éclate de rire ; il se reprend aussitôt et boude encore.",
         [perso('elle', E(0, x=450, expression='malicieux'), marche(450, 360, 0.4, 1.0, expression='malicieux', tourne=False), E(1.2, angle=0, bras='tend_g'), E(3.4, expression='rire')),
          perso('lui', E(0, x=260, expression='boude', bras='croises', signes=['nuage_noir']), E(1.4, pose='tremble', expression='effort', signes=['nuage_noir']), E(2.2, pose='debout', expression='mort_de_rire'), E(3.2, expression='boude', bras='croises', vers=-1))]),
    plan(4.5, "Elle recommence ; il craque encore, mort de rire ; il reboude ; elle recommence ; à la fin il abandonne, l'attrape, et c'est elle qu'il chatouille ; elle se tord de rire ; le nuage a disparu.",
         [perso('elle', E(0, x=360, expression='rire', bras='tend_g'), E(1.4, bras='bas', expression='joie'), E(2.4, expression='mort_de_rire', pose='penche_g', signes=['larmes']), E(3.6, pose='tombe', expression='pleure_de_joie')),
          perso('lui', E(0, x=260, expression='boude', bras='croises'), E(0.6, expression='mort_de_rire', bras='bas'), E(1.4, expression='boude', bras='croises'), E(2.0, x=290, expression='malicieux', bras='tend_d'), E(3.2, expression='rire'))],
         objets=[O('coeur', 330, 150, 0.35, de=3.6, flotte=True)]),
])

reel('ani-350', 'les deux', 'nous deux devant un truc de notre enfance', lieu='canapé', plans=[
    plan(4, "Le canapé, la télé ; les deux zappent, blasés ; d'un coup une musique, une émission d'avant : les deux se figent, les yeux ronds, puis les yeux qui brillent, nostalgiques.",
         [SUR_CANAPE('lui', 226, expression='blase', bras='tient'), perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='ennui'), E(1.8, expression='surpris', signes=['exclamation']), E(2.8, expression='nostalgique', signes=['etincelles']))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('manette', 226, 290, 0.5), O('musique', 320, 100, 0.5, de=1.6, flotte=True)], textes=[TITRE('nous deux devant un truc de notre enfance')]),
    plan(4, "Ils chantent le générique ensemble, les bras levés, des notes partout, se regardent, rient ; ils connaissent toutes les paroles ; la télécommande est oubliée.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='chante', signes=['notes'], bras='leves'), E(2.0, vers=1, expression='rire')),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='chante', signes=['notes'], bras='leves'), E(2.0, vers=-1, expression='rire'))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('musique', 150, 120, 0.6, de=0.2, flotte=True), O('musique', 500, 100, 0.6, de=0.8, flotte=True), O('manette', 560, 350, 0.5)]),
    plan(4.5, "Les deux debout devant la télé, dansent la chorégraphie du générique, exactement en même temps, concentrés, puis morts de rire ; ils se laissent retomber sur le canapé, l'un sur l'autre ; un cœur.",
         [perso('lui', E(0, x=250, pose='danse', expression='concentre', signes=['notes']), E(1.6, expression='rire'), E(2.8, x=270, y=318, taille=210, pose='assis', expression='joie')),
          perso('elle', E(0, x=420, pose='danse', expression='concentre', signes=['notes']), E(1.6, expression='rire'), E(2.8, x=370, y=318, taille=210, pose='penche_g', expression='joie'))],
         meubles=['canape_fond'], objets=[O('tele', 320, 150, 0.8), O('musique', 160, 120, 0.6, de=0.2, flotte=True), O('coeur', 320, 230, 0.35, de=3.2, flotte=True)], sons=[{'nom': 'coussin', 'a': 2.8}]),
])

reel('ani-351', 'elle', 'toi quand ta personne lit ton horoscope', lieu='canapé', plans=[
    plan(4, "Le canapé ; elle, le téléphone à la patte, lit à voix haute, très sérieuse ; lui, à côté, lève les yeux au ciel ; en haut s'écrit « aujourd'hui, ton signe doit éviter les disputes ».",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='concentre', bras='tient'), E(2.4, vers=-1, expression='determine')),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='blase'), E(1.6, expression='exaspere'))],
         meubles=['canape_fond'], objets=[O('telephone', 414, 290, 0.5)], textes=[TITRE('toi quand ta personne lit ton horoscope', a=1.4), DIT('« aujourd\'hui, ton signe doit éviter les disputes »', de=1.6)]),
    plan(4, "Il ouvre la bouche pour protester ; elle lève un sourcil ; il réfléchit, des petits points ; il referme la bouche ; l'auréole apparaît au-dessus de sa tête ; il sourit, très sage.",
         [perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='colere', bras='pointe'), E(1.0, expression='pensif', signes=['points'], bras='bas'), E(2.2, expression='ange', signes=['halo'])),
          perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='determine', vers=-1), E(1.4, expression='narquois'))],
         meubles=['canape_fond'], objets=[O('telephone', 414, 290, 0.5)]),
    plan(4.5, "Elle continue de lire : « ... et doit faire la vaisselle pour l'harmonie du foyer » ; il se tourne vers elle, bouche bée ; elle garde son sérieux, puis craque ; il lui jette le coussin, en riant.",
         [perso('elle', E(0, x=414, y=318, taille=210, pose='assis', expression='concentre', bras='tient'), E(2.2, expression='chante', signes=['halo']), E(3.0, expression='rire')),
          perso('lui', E(0, x=226, y=318, taille=210, pose='assis', expression='ange'), E(1.6, expression='bouche_bee'), E(2.8, expression='rire', bras='tend_d'))],
         meubles=['canape_fond'], objets=[O('telephone', 414, 290, 0.5), O('coussin', 150, 290, 0.8, de=2.6, etapes=[{'a': 2.6, 'x': 150}, {'a': 3.2, 'x': 420, 'y': 220}])], textes=[DIT('« ... et doit faire la vaisselle pour l\'harmonie du foyer »', de=0.3)], sons=[{'nom': 'coussin', 'a': 3.2}]),
])

reel('ani-352', 'lui', 'toi quand ta personne t\'appelle depuis l\'autre pièce', lieu='maison', plans=[
    plan(4, "Une porte au milieu ; lui, à gauche, assis par terre, tranquille, un livre ; en haut s'écrit « tu peux venir ? » ; il se lève, passe la porte vers la droite ; puis « non, rien » ; il revient.",
         [perso('lui', E(0, x=200, pose='assis', expression='zen', bras='tient'), E(0.8, pose='debout', expression='content', bras='bas'), E(1.0, x=200, angle=90, pose='marche'), E(2.0, x=470, pose='debout'), E(2.4, angle=-90, pose='marche', expression='blase'), E(3.4, x=200, pose='debout'), E(3.7, angle=0))],
         objets=[O('porte', 340, 230, 1.6, derriere=True), O('livre', 200, 300, 0.6, a=0.8), O('livre', 130, 350, 0.6, de=0.8)], textes=[TITRE('toi quand ta personne t\'appelle depuis l\'autre pièce', a=0.6), DIT('« tu peux venir ? »', de=0.8, a=2.1), DIT('« non, rien »', de=2.3)]),
    plan(4, "Il se rassoit ; en haut : « viens voir ! » ; il se relève, repasse la porte en courant ; « c'est bon, j'ai trouvé » ; il revient, une veine sur le front ; il se rassoit ; « tu peux... » ; il se relève.",
         [perso('lui', E(0, x=200, pose='assis', expression='blase'), E(0.6, pose='debout', expression='exaspere'), E(0.8, x=200, angle=90, pose='court'), E(1.6, x=470, pose='debout'), E(1.9, angle=-90, pose='court', expression='furieux', signes=['veine']), E(2.7, x=200, pose='debout'), E(3.0, angle=0, pose='assis'), E(3.6, pose='debout', expression='exaspere'))],
         objets=[O('porte', 340, 230, 1.6, derriere=True), O('livre', 130, 350, 0.6)], textes=[DIT('« viens voir ! »', de=0.2, a=1.6), DIT('« c\'est bon, j\'ai trouvé »', de=1.8, a=3.3), DIT('« tu peux... »', de=3.5)]),
    plan(4.5, "Il revient avec un coussin, s'assoit par terre juste dans l'embrasure de la porte, entre les deux pièces, blasé, le livre sur les genoux ; elle passe la tête, surprise ; il lève le pouce sans la regarder.",
         [perso('lui', E(0, x=200, expression='exaspere'), E(0.6, expression='idee', signes=['ampoule']), E(1.0, bras='tient'), marche(200, 340, 1.4, 2.2, expression='determine', tourne=False), E(2.4, angle=0, pose='assis', expression='blase', bras='tient'), E(3.6, bras='pouce')),
          perso('elle', E(3.0, x=520, expression='surpris', vers=-1, signes=['question']))],
         objets=[O('porte', 340, 230, 1.6, derriere=True), O('coussin', 200, 300, 0.8, de=1.0, etapes=[{'a': 1.4, 'x': 200}, {'a': 2.2, 'x': 340}, {'a': 2.4, 'x': 340, 'y': 360}]), O('livre', 340, 300, 0.6, de=2.6)]),
])

reel('ani-353', 'elle', 'toi quand ta personne garde les cartons « au cas où »', lieu='maison', plans=[
    plan(4, "Lui, à gauche, pousse un carton vers la porte pour le jeter, décidé ; elle arrive de la droite en courant, le prend, le serre contre elle, choquée ; en haut : « ça peut servir ».",
         [perso('lui', E(0, x=150, angle=90, pose='pousse', expression='determine'), E(1.6, x=330, pose='debout'), E(2.0, angle=0, expression='surpris')),
          perso('elle', entre(480, 0.6, 1.8, depuis='droite', pose='court', expression='panique'), E(2.2, bras='tend_g', expression='choque'), E(2.8, bras='tient', expression='supplie'))],
         objets=[O('porte', 600, 230, 1.6, derriere=True), O('caisse', 230, 345, 1.0, etapes=[{'a': 0, 'x': 230}, {'a': 1.6, 'x': 410}, {'a': 2.2, 'x': 410}, {'a': 2.8, 'x': 480, 'y': 300}])],
         textes=[TITRE('toi quand ta personne garde les cartons « au cas où »', a=1.8), DIT('« ça peut servir »', de=2.0)]),
    plan(4, "Il en prend un autre ; elle le récupère ; un autre ; elle le récupère ; les cartons s'empilent derrière elle, de plus en plus haut ; lui, les bras ballants, blasé.",
         [perso('lui', E(0, x=330, expression='blase', bras='tend_d'), E(1.2, bras='bas'), E(2.0, bras='tend_d'), E(3.0, bras='bas', expression='exaspere')),
          perso('elle', E(0, x=480, expression='determine', bras='tend_g'), E(1.2, bras='tient'), E(2.0, bras='tend_g'), E(3.0, bras='hanches', expression='fier'))],
         objets=[O('porte', 600, 230, 1.6, derriere=True), O('caisse', 560, 345, 1.0), O('caisse', 330, 300, 1.0, de=0, etapes=[{'a': 0, 'x': 330}, {'a': 1.0, 'x': 560, 'y': 250}]), O('caisse', 330, 300, 1.0, de=1.6, etapes=[{'a': 1.6, 'x': 330}, {'a': 2.6, 'x': 560, 'y': 155}])]),
    plan(4.5, "« 1 mois plus tard » en bas. Le salon est plein de cartons ; les deux assis chacun dans un carton, comme dans des fauteuils, le téléphone à la patte, contents ; elle lève le pouce : elle avait raison.",
         [perso('lui', E(0, x=250, y=350, taille=170, pose='boule', expression='content', bras='tient')),
          perso('elle', E(0, x=430, y=350, taille=170, pose='boule', expression='fier', bras='tient'), E(2.4, bras='pouce', signes=['etincelles']))],
         objets=[O('caisse', 250, 355, 1.1), O('caisse', 430, 355, 1.1), O('caisse', 120, 345, 0.9, derriere=True), O('caisse', 560, 345, 0.9, derriere=True), O('caisse', 340, 250, 0.8, derriere=True), O('caisse', 560, 250, 0.8, derriere=True)], textes=[BAS('1 mois plus tard')]),
])
