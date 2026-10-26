# La fabrique des reels des mipaps (26 octobre 2026) : des scènes écrites à la
# main en Python compact, et d'ici sortent les posts JSON de l'atelier
# (reseaux/mipaps/atelier/posts/<jour>-<créneau>.json) et les sujets de la
# banque (sujets.json, série ani-2xx). Les règles mécaniques du moteur
# (reseaux/studio/src/mipaps/mouvement.ts, reseaux/automates/lib/mipaps.mjs)
# sont respectées par les aides : un personnage qui marche part de profil,
# s'arrête debout puis se tourne d'un petit saut ; un texte à la fois par
# place ; dix à quarante secondes.
#
#   python3 usine.py <dossier des posts> [--banque]   (écrit les posts, et la banque si demandé)
import json, os, sys, datetime, re, importlib

SOL = 380
REELS = []
APPELS_ROTATION = {
    'elle': ['tague-la', 'envoie ça à la personne qui fait ça', 'envoie-lui ça', 'tague la personne qui fait ça', 'tu fais ça aussi ?'],
    'lui': ['tague-le', 'envoie ça à la personne qui fait ça', 'envoie-lui ça', 'tague la personne qui fait ça', 'tu fais ça aussi ?'],
    'les deux': ["vous aussi ou c'est que nous ?", 'envoie ça à ta personne', 'tague ta personne', 'envoie ça sans rien dire', "c'est qui chez vous ?"],
}
TAGS = ['#lesmipaps', '#couple', '#amour', '#humour', '#couplegoals', '#amoureux', '#dessin', '#mignon', '#relation']


def E(a, **k):
    d = {'a': a}
    d.update({x: v for x, v in k.items() if v is not None})
    return d


def _plat(items):
    for it in items:
        if isinstance(it, list):
            yield from _plat(it)
        else:
            yield it


def perso(nom, *etapes, marqueur=None):
    # les aides (entre, sort, marche) ajoutent la rotation d'après la course : on range dans l'ordre du temps
    p = {'perso': nom, 'etapes': sorted(_plat(etapes), key=lambda e: e['a'])}
    if marqueur:
        p['marqueur'] = marqueur
    return p


def fixe(nom, x, y=SOL, taille=250, **k):
    """Un personnage posé là dès le début du plan."""
    return perso(nom, E(0, x=x, y=y, taille=taille, **k))


def entre(x_fin, t0=0.0, t1=1.8, depuis='gauche', pose='court', expression='content', y=SOL, taille=250, tourne=True, **k):
    """Les étapes d'une entrée : depuis le bord, de profil, arrêt debout, puis la rotation vers nous."""
    x0 = -140 if depuis == 'gauche' else 820
    angle = 90 if depuis == 'gauche' else -90
    etapes = [E(t0, x=x0, y=y, taille=taille, angle=angle, pose=pose, expression=expression, **k), E(t1, x=x_fin, pose='debout')]
    if tourne:
        etapes.append(E(round(t1 + 0.45, 2), angle=0))
    return etapes


def sort(x_dep, t0, t1, vers='droite', pose='court', expression=None, **k):
    """Les étapes d'une sortie par un bord, pour un personnage déjà posé."""
    angle = 90 if vers == 'droite' else -90
    xf = 820 if vers == 'droite' else -140
    return [E(t0, x=x_dep, angle=angle, pose=pose, expression=expression, **k), E(t1, x=xf)]


def marche(x_dep, x_fin, t0, t1, pose='marche', expression=None, tourne=True, **k):
    """Un déplacement de profil entre deux points de la scène, puis face à nous."""
    angle = 90 if x_fin > x_dep else -90
    etapes = [E(t0, x=x_dep, angle=angle, pose=pose, expression=expression, **k), E(t1, x=x_fin, pose='debout')]
    if tourne:
        etapes.append(E(round(t1 + 0.45, 2), angle=0))
    return etapes


# Dans le lit, assis : y 346, taille 200, sans bras ni pattes (le drap les cache) ; une surcharge remplace.
LIT = dict(y=346, taille=200, pose='debout', bras='aucun', pattes='aucune')


def AU_LIT(x, a=0, **k):
    d = dict(LIT)
    d.update(k)
    return E(a, x=x, **d)


def O(nom, x, y, echelle=1, de=None, a=None, flotte=None, derriere=None, etapes=None):
    o = {'objet': nom, 'x': x, 'y': y, 'echelle': echelle}
    for cle, v in (('de', de), ('a', a), ('flotte', flotte), ('derriere', derriere), ('etapes', etapes)):
        if v is not None:
            o[cle] = v
    return o


def COEURS(x=345, y=150, de=0.5, n=3):
    """Trois petits cœurs qui flottent au-dessus d'un câlin."""
    c = [O('coeur', x, y, 0.5, de=de, flotte=True), O('coeur', x - 95, y + 40, 0.32, de=round(de + 0.5, 2), flotte=True), O('coeur', x + 95, y + 50, 0.36, de=round(de + 0.9, 2), flotte=True)]
    return c[:n]


def T(texte, de=0.2, a=None, place=None, style=None, mot_a_mot=None):
    t = {'texte': texte, 'de': de}
    if a is not None:
        t['a'] = a
    if place:
        t['place'] = place
    if style:
        t['style'] = style
    if mot_a_mot:
        t['motAMot'] = True
    return t


def TITRE(texte, de=0.2, a=None):
    """Le texte du premier plan : la situation, dite au lecteur ; en grand (style titre, trois lignes
    de 80 px) jusqu'à 46 signes, sinon en message (quatre lignes de 66 px, 60 signes au plus)."""
    return T(texte, de=de, a=a, place='haut', style='titre' if len(texte) <= 46 else 'message')


def BAS(texte, de=0.2, a=None):
    """Une ligne en bas : le temps qui passe (« 1 h plus tard »), 40 signes au plus."""
    return T(texte, de=de, a=a, place='bas')


def DIT(texte, de=0.3, a=None, mot_a_mot=None):
    """Ce qui se dit pour de vrai, entre guillemets, en haut."""
    return T(texte, de=de, a=a, place='haut', style='message', mot_a_mot=mot_a_mot)


def plan(duree, description, persos, objets=None, textes=None, meubles=None, transition=None, sons=None, zoom=None, ambiance=None):
    p = {'duree': duree, 'description': description, 'persos': persos}
    if meubles:
        p['meubles'] = meubles
    if objets:
        p['objets'] = objets
    if textes:
        p['textes'] = textes
    if sons:
        p['sons'] = sons
    if ambiance:
        p['ambiance'] = ambiance
    if zoom:
        p['zoom'] = zoom
    if transition:
        p['transition'] = transition
    return p


def reel(id, qui, titre, plans, lieu='', son='drole', appel=None, tags=None, jour=None, creneau=None, idee=None):
    REELS.append({'id': id, 'qui': qui, 'titre': titre, 'plans': plans, 'lieu': lieu, 'son': son, 'appel': appel, 'tags': tags, 'jour': jour, 'creneau': creneau, 'idee': idee})


# ---- les créneaux ouverts de la grille des mipaps : chaque matin, et le samedi soir
def creneaux(debut, fin):
    d = datetime.date.fromisoformat(debut)
    f = datetime.date.fromisoformat(fin)
    out = []
    while d <= f:
        out.append((d.isoformat(), 'matin'))
        if d.isoweekday() == 6:
            out.append((d.isoformat(), 'soir'))
        d += datetime.timedelta(days=1)
    return out


def verifier_reel(r):
    f = []
    total = sum(p['duree'] for p in r['plans'])
    if not 10 <= total <= 40:
        f.append(f"durée {total} s")
    for i, p in enumerate(r['plans'], 1):
        if not 1.5 <= p['duree'] <= 15:
            f.append(f"plan {i} : durée {p['duree']}")
        if len(p['description']) < 60:
            f.append(f"plan {i} : description trop courte")
        if not p['persos']:
            f.append(f"plan {i} : aucun personnage")
        for t in p.get('textes', []):
            L = 40 if t.get('place') == 'bas' else 60 if t.get('style') == 'titre' else 100
            if len(t['texte']) > L:
                f.append(f"plan {i} : texte trop long ({len(t['texte'])} > {L}) : {t['texte']}")
            if re.search(r'\b\d{1,2}\s?h\s?(?!00\b|30\b)\d{2}\b', t['texte']):
                f.append(f"plan {i} : heure à la minute près : {t['texte']}")
            if t['texte'].rstrip().endswith('<3'):
                f.append(f"plan {i} : « <3 » en fin de texte")
        for pe in p['persos']:
            if 'x' not in pe['etapes'][0]:
                f.append(f"plan {i} : {pe['perso']} sans x à la première étape")
            prev = -1
            for e in pe['etapes']:
                if e['a'] < prev or e['a'] > p['duree']:
                    f.append(f"plan {i} : {pe['perso']} étape hors du temps ({e['a']})")
                prev = e['a']
    if not any(p.get('textes') for p in r['plans']):
        f.append('aucun texte')
    if len(r['titre']) > 60:
        f.append(f"titre de {len(r['titre'])} signes")
    return f


def post_de(r, jour, creneau, appel):
    desc = ' | '.join(p['description'] for p in r['plans'])
    idee = r['idee'] or f"{r['titre']} | {desc}"
    recette = {'gabarit': 'mipaps-reel', 'langue': 'fr', 'theme': 'light', 'idee': idee, 'son': {'ambiance': r['son']}, 'plans': r['plans']}
    tags = r['tags'] or ['#lesmipaps', '#couple', '#amour', '#humour']
    return {
        'jour': jour, 'creneau': creneau, 'format': 'reel', 'gabarit': 'mipaps-reel', 'categorie': 'mipaps-anime',
        'sujet': r['id'], 'idee_id': None,
        'variantes': {'fr': {'recette': recette, 'legende': appel, 'hashtags': tags}},
    }


# les sujets des posts déjà publiés avant le 27 octobre 2026 (ils restent dans la banque, sans « retire »)
PRIS = set()


def fabriquer(dossier, debut='2026-10-27', fin='2027-03-31', banque=None, ecrire_banque=False):
    for n in os.listdir(dossier):
        if n.endswith('.json') and n < debut:
            try:
                PRIS.add(json.load(open(os.path.join(dossier, n), encoding='utf-8')).get('sujet'))
            except Exception:
                pass
    os.makedirs(dossier, exist_ok=True)
    slots = creneaux(debut, fin)
    dates = {(r['jour'], r['creneau']): r for r in REELS if r['jour']}
    libres = [r for r in REELS if not r['jour']]
    ids = [r['id'] for r in REELS]
    assert len(ids) == len(set(ids)), 'identifiants en double'
    fautes = {r['id']: verifier_reel(r) for r in REELS}
    fautes = {k: v for k, v in fautes.items() if v}
    if fautes:
        for k, v in fautes.items():
            print('FAUTE', k, '; '.join(v))
        raise SystemExit(1)
    ecrits = []
    compteur = {'elle': 0, 'lui': 0, 'les deux': 0}
    i = 0
    for jour, creneau in slots:
        r = dates.get((jour, creneau))
        if not r:
            if i >= len(libres):
                break
            r = libres[i]
            i += 1
        q = r['qui'] if r['qui'] in APPELS_ROTATION else 'les deux'
        rot = APPELS_ROTATION[q]
        appel = r['appel'] or rot[compteur[q] % len(rot)]
        compteur[q] += 1
        p = post_de(r, jour, creneau, appel)
        with open(os.path.join(dossier, f'{jour}-{creneau}.json'), 'w', encoding='utf-8') as fh:
            json.dump(p, fh, ensure_ascii=False, indent=2)
            fh.write('\n')
        ecrits.append((jour, creneau, r['id'], r['qui'], r['lieu']))
    restes = libres[i:]
    print(f"{len(ecrits)} posts écrits ({ecrits[0][0]} → {ecrits[-1][0]}), {len(restes)} reels sans créneau, {len(slots) - len(ecrits)} créneaux vides")
    qui = {}
    for e in ecrits:
        qui[e[3]] = qui.get(e[3], 0) + 1
    lieux = {}
    for e in ecrits:
        lieux[e[4]] = lieux.get(e[4], 0) + 1
    print('qui :', qui)
    print('lieux :', dict(sorted(lieux.items(), key=lambda x: -x[1])))
    if ecrire_banque and banque:
        S = json.load(open(banque, encoding='utf-8'))
        anciens = [s for s in S['mipaps-anime'] if not re.match(r'ani-[2-9]\d\d$', s['id'])]
        # les sujets d'avant que personne n'a pris (frites, pizza, livreur...) ne se prennent plus
        for s_ in anciens:
            if not s_.get('retire') and s_['id'] not in PRIS:
                s_['retire'] = '2026-10-26'
        nouveaux = []
        for r in REELS:
            if r['jour']:
                continue  # un sujet daté est déjà dans saison.sujets
            desc = ' | '.join(p['description'] for p in r['plans'])
            nouveaux.append({'id': r['id'], 'qui': r['qui'], 'lieu': r['lieu'], 'idee': f"{r['titre']} | {desc}"})
        S['mipaps-anime'] = anciens + nouveaux
        with open(banque, 'w', encoding='utf-8') as fh:
            json.dump(S, fh, ensure_ascii=False, indent=2)
            fh.write('\n')
        print(f"banque : {len(nouveaux)} sujets ani-2xx et ani-3xx écrits, {len(anciens)} anciens gardés dont {sum(1 for x in anciens if x.get('retire'))} retirés")
    return ecrits


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    dossier = args[0] if args else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'posts')
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    for nom in sorted(n[:-3] for n in os.listdir(os.path.dirname(os.path.abspath(__file__))) if re.match(r'reels_\w+\.py$', n)):
        importlib.import_module(nom)
    # la banque de l'atelier, à côté du dossier de la fabrique (reseaux/mipaps/atelier/sujets.json)
    banque = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'sujets.json')
    if not os.path.exists(banque):
        banque = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'reseaux', 'mipaps', 'atelier', 'sujets.json')
    if not os.path.exists(banque):
        banque = '/home/user/quiz-couple-dev/reseaux/mipaps/atelier/sujets.json'
    # les modules de reels importent « usine » : la liste REELS qu'ils remplissent est celle de ce module-là, pas celle de __main__
    import usine as U
    U.fabriquer(dossier, banque=banque, ecrire_banque='--banque' in sys.argv)
