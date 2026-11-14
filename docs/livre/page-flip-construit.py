# Recompile static-site/js/vendor/page-flip.js depuis les sources du paquet
# npm page-flip 2.0.7 (StPageFlip, licence MIT), avec les retouches décrites
# dans docs/livre/page-flip.md. Il s'arrête si un passage à remplacer n'est
# pas trouvé une seule fois.
#
#   npm pack page-flip@2.0.7 && tar xzf page-flip-2.0.7.tgz   (donne package/src)
#   npm install esbuild@0.24.0                                 (dans un dossier à part)
#   python3 docs/livre/page-flip-construit.py <dossier package/src> <chemin d'esbuild>
import os, re, shutil, subprocess, sys
import tempfile
if len(sys.argv) != 3:
    sys.exit('usage : page-flip-construit.py <dossier package/src> <chemin d\'esbuild>')
SRC, ESBUILD = sys.argv[1], sys.argv[2]
DST = os.path.join(tempfile.mkdtemp(prefix='page-flip-'), 'src')
shutil.copytree(SRC, DST)

def remplace(fichier, avant, apres, n=1):
    p = os.path.join(DST, fichier)
    s = open(p, encoding='utf-8').read()
    c = s.count(avant)
    if c != n:
        sys.exit(f'{fichier} : {c} occurrence(s) au lieu de {n} pour {avant[:60]!r}')
    open(p, 'w', encoding='utf-8').write(s.replace(avant, apres))

# 1. Render : la boucle à la demande.
remplace('Render/Render.ts', '''    public start(): void {
        this.update();

        const loop = (timer: number): void => {
            this.render(timer);
            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }''', '''    private enMarche = false;
    private auRepos = 0;

    public start(): void {
        this.update();
        this.reveiller();
    }

    /**
     * Relance la boucle de dessin si elle s'est arrêtée (Quiz Couple : dans
     * l'original, elle tournait sans fin, même livre immobile).
     */
    public reveiller(): void {
        this.auRepos = 0;
        if (this.enMarche) return;
        this.enMarche = true;
        // L'horloge de l'animation repart de maintenant : arrêtée, la boucle
        // avait gardé l'instant de sa dernière image.
        this.timer = performance.now();

        const loop = (timer: number): void => {
            try {
                this.render(timer);
            } catch (e) {
                this.animation = null;
                this.enMarche = false;
                throw e;
            }
            const auRepos = this.animation === null && (this.app.getState() as string) === 'read';
            if (auRepos && ++this.auRepos > 2) {
                this.enMarche = false;
                return;
            }
            if (!auRepos) this.auRepos = 0;
            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }''')
remplace('Render/Render.ts', '''        this.finishAnimation(); // finish the previous animation process

        this.animation = {''', '''        this.finishAnimation(); // finish the previous animation process
        this.reveiller();

        this.animation = {''')
remplace('Render/Render.ts', '''    public update(): void {
        this.boundsRect = null;''', '''    public update(): void {
        this.reveiller();
        this.boundsRect = null;''')

# 1 bis. Au réveil, l'horodatage de la première image (le début de l'image)
# peut précéder performance.now() : l'indice de l'image de l'animation était
# alors négatif, et la boucle plantait (« frames[t] is not a function »).
remplace('Render/Render.ts', """            const frameIndex = Math.round(
                (timer - this.animation.startedAt) / this.animation.durationFrame
            );""", """            const frameIndex = Math.max(
                0,
                Math.round((timer - this.animation.startedAt) / this.animation.durationFrame)
            );""")

# 2. PageFlip : chaque appel de l'extérieur réveille la boucle.
remplace('PageFlip.ts', "import './Style/stPageFlip.css';\n", '')
for nom in ['turnToPrevPage(): void {', 'turnToNextPage(): void {', 'turnToPage(page: number): void {',
            'flipNext(corner: FlipCorner = FlipCorner.TOP): void {', 'flipPrev(corner: FlipCorner = FlipCorner.TOP): void {',
            'flip(page: number, corner: FlipCorner = FlipCorner.TOP): void {',
            'startUserTouch(pos: Point): void {', 'userMove(pos: Point, isTouch: boolean): void {',
            'userStop(pos: Point, isSwipe = false): void {', 'updateFromHtml(items: NodeListOf<HTMLElement> | HTMLElement[]): void {']:
    remplace('PageFlip.ts', 'public ' + nom, 'public ' + nom + '\n        if (this.render) this.render.reveiller();')

# 3. Flip : une page qui tourne accélère puis ralentit, et dans un tour
# complet son coin se soulève en chemin (l'original allait en ligne droite,
# à vitesse constante). Un geste lâché ralentit jusqu'à l'arrêt.
remplace('Flip/Flip.ts', """        this.animateFlippingTo(
            { x: rect.pageWidth - topMargins, y: yStart },
            { x: -rect.pageWidth, y: yDest },
            true
        );""", """        this.animateFlippingTo(
            { x: rect.pageWidth - topMargins, y: yStart },
            { x: -rect.pageWidth, y: yDest },
            true,
            true,
            'tour'
        );""")
remplace('Flip/Flip.ts', """    private animateFlippingTo(
        start: Point,
        dest: Point,
        isTurned: boolean,
        needReset = true
    ): void {
        const points = Helper.GetCordsFromTwoPoint(start, dest);""", """    private animateFlippingTo(
        start: Point,
        dest: Point,
        isTurned: boolean,
        needReset = true,
        mouvement = 'lacher'
    ): void {
        const longueur = Math.max(
            1,
            Math.round(Math.max(Math.abs(start.x - dest.x), Math.abs(start.y - dest.y)))
        );
        const tour = mouvement === 'tour';
        const leve = tour
            ? this.getBoundsRect().height *
              0.14 *
              (this.calc && this.calc.getCorner() === FlipCorner.TOP ? 1 : -1)
            : 0;
        const points: Point[] = [];
        for (let i = 0; i <= longueur; i++) {
            const t = i / longueur;
            const e = tour ? 0.5 - Math.cos(Math.PI * t) / 2 : 1 - Math.pow(1 - t, 3);
            points.push({
                x: start.x + (dest.x - start.x) * e,
                y: start.y + (dest.y - start.y) * e + leve * Math.sin(Math.PI * e),
            });
        }""")

# 4. Un geste rapide (un glissé lancé) tourne la page même s'il n'a pas
# passé la reliure : stopMove(tourner) et userStop(pos, isSwipe, tourner).
remplace('Flip/Flip.ts', """    public stopMove(): void {
        if (this.calc === null) return;

        const pos = this.calc.getPosition();
        const rect = this.getBoundsRect();

        const y = this.calc.getCorner() === FlipCorner.BOTTOM ? rect.height : 0;

        if (pos.x <= 0) this.animateFlippingTo(pos, { x: -rect.pageWidth, y }, true);""", """    public stopMove(tourner?: boolean): void {
        if (this.calc === null) return;

        const pos = this.calc.getPosition();
        const rect = this.getBoundsRect();

        const y = this.calc.getCorner() === FlipCorner.BOTTOM ? rect.height : 0;

        if (typeof tourner === 'boolean' ? tourner : pos.x <= 0)
            this.animateFlippingTo(pos, { x: -rect.pageWidth, y }, true);""")
remplace('PageFlip.ts', 'public userStop(pos: Point, isSwipe = false): void {', 'public userStop(pos: Point, isSwipe = false, tourner?: boolean): void {')
remplace('PageFlip.ts', 'else this.flipController.stopMove();', 'else this.flipController.stopMove(tourner);')

open(os.path.join(DST, 'index.ts'), 'w').write("export { PageFlip } from './PageFlip';\n")
banniere = ('/*! page-flip 2.0.7 (StPageFlip) | MIT License | Copyright (c) 2020 Nodlik | '
            'https://github.com/Nodlik/StPageFlip | Quiz Couple : boucle de dessin arrêtée au repos '
            '(docs/livre/page-flip.md) */')
sortie = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'static-site', 'js', 'vendor', 'page-flip.js')
subprocess.run([ESBUILD, os.path.join(DST, 'index.ts'),
                '--bundle', '--format=iife', '--global-name=St', '--minify', '--target=es2017',
                '--legal-comments=none', '--banner:js=' + banniere, '--outfile=' + sortie], check=True)
print(os.path.getsize(sortie), 'octets')
