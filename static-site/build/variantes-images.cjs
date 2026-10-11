// Variantes réduites des images, à produire une fois à l'ajout d'une image.
//
// Les cartes de l'accueil s'affichent à 260 px sur un téléphone et les
// couvertures du blog à 356 px, mais un écran x3 réclame trois fois plus de
// pixels : sans variante assez proche, il tirait l'original (1200 px pour
// une image de tête, 1536 px et 132 Ko en moyenne pour une couverture).
// Largeurs choisies pour les téléphones x3 : 880 couvre une carte jusqu'à un
// écran de 430 px, 1080 une couverture jusqu'à 360 px ; 720 sert les écrans
// x2 et le bureau.
//
//   public/quiz/featured/<nom>.webp  →  720/<nom>.webp, 880/<nom>.webp
//   public/blog/<nom>.webp           →  720/<nom>.webp, 1080/<nom>.webp
//
// Qualité WebP 80, celle des variantes 720 d'origine. Une variante n'est
// produite que si l'original est plus large qu'elle, et seulement si elle
// manque (--refaire pour tout refaire). Les pages ne la déclarent dans leur
// srcset que si le fichier existe (srcsetImage, generate.js) : une image
// sans variante garde son seul original, rien ne casse.
//
// La construction du site n'a besoin d'aucun outil d'image, sharp ne sert
// qu'ici et n'est pas une dépendance du site :
//   cd /tmp && npm i sharp@0.33.5 && cd -
//   NODE_PATH=/tmp/node_modules node static-site/build/variantes-images.cjs

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.resolve(__dirname, '../../public');
const FAMILLES = [
  { dossier: path.join(PUBLIC_DIR, 'quiz', 'featured'), largeurs: [720, 880] },
  { dossier: path.join(PUBLIC_DIR, 'blog'), largeurs: [720, 1080] },
];
const QUALITE = 80;
const refaire = process.argv.includes('--refaire');

(async () => {
  let faites = 0, deja = 0;
  for (const { dossier, largeurs } of FAMILLES) {
    const fichiers = fs.readdirSync(dossier).filter((f) => f.endsWith('.webp')).sort();
    for (const f of fichiers) {
      const original = path.join(dossier, f);
      const { width } = await sharp(original).metadata();
      for (const w of largeurs) {
        if (!width || w >= width) continue;
        const cible = path.join(dossier, String(w), f);
        if (!refaire && fs.existsSync(cible)) { deja++; continue; }
        fs.mkdirSync(path.dirname(cible), { recursive: true });
        await sharp(original).resize({ width: w }).webp({ quality: QUALITE, effort: 6 }).toFile(cible);
        faites++;
        console.log(`${path.relative(PUBLIC_DIR, cible)}  ${Math.round(fs.statSync(cible).size / 1024)} Ko`);
      }
    }
  }
  console.log(`${faites} variante(s) produite(s), ${deja} déjà présente(s).`);
})().catch((e) => { console.error(e); process.exit(1); });
