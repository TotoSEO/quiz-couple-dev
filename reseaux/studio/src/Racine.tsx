import React from 'react';
import { AbsoluteFill, Composition, Freeze, Still } from 'remotion';
import { FPS } from './charte/charte';
import { typographier } from './charte/libelles';
import { Ambiances, Bruitages, Musique } from './charte/Son';
import { Citation } from './gabarits/Citation';
import { Jeu } from './gabarits/QuizChrono';
import { Pov } from './gabarits/Pov';
import { ImageFixe } from './gabarits/ImageFixe';
import { PageCarrousel } from './gabarits/Carrousel';
import { Bd, PageBd } from './gabarits/Bd';
import { planifier, type Plan } from './plan';
import type { RecetteFixe, RecetteReel } from './recette';
import exempleCitation from '../recettes/exemples/citation.json';
import exempleImage from '../recettes/exemples/image.json';

type PropsReel = { recette: RecetteReel; plan?: Plan; verification?: boolean; silencieux?: boolean };
type PropsImage = { recette: RecetteFixe; page?: number; verification?: boolean };

const Reel: React.FC<PropsReel> = ({ recette: brute, plan, verification, silencieux }) => {
  const recette = typographier(brute, brute.langue);
  const p = plan ?? planifier(recette);
  return (
    <>
      {recette.gabarit === 'citation' && <Citation recette={recette} plan={p} verification={verification} />}
      {(recette.gabarit === 'quiz-chrono' || recette.gabarit === 'connais-tu' || recette.gabarit === 'tu-preferes') && (
        <Jeu recette={recette} plan={p} verification={verification} />
      )}
      {recette.gabarit === 'pov' && <Pov recette={recette} plan={p} verification={verification} />}
      {!verification && !silencieux && (
        <>
          {p.musique && <Musique fichier={p.musique} debut={recette.musiqueDebut} duree={p.duree} sons={p.sons} />}
          <Bruitages sons={p.sons} />
          {p.ambiances && p.ambiances.length > 0 && <Ambiances ambiances={p.ambiances} />}
        </>
      )}
    </>
  );
};

const Image: React.FC<PropsImage> = ({ recette: brute, page = 0, verification }) => {
  const recette = typographier(brute, brute.langue);
  if (recette.gabarit === 'image') return <ImageFixe recette={recette} verification={verification} />;
  // la BD : les quatre cases en grille, ou une case par page en carrousel
  if (recette.gabarit === 'bd') {
    return recette.sortie === 'carrousel' ? <PageBd recette={recette} page={page} verification={verification} /> : <Bd recette={recette} verification={verification} />;
  }
  return <PageCarrousel recette={recette} page={page} verification={verification} />;
};

// Planche de contrôle : plusieurs images d'un reel côte à côte, en petit,
// pour relire une animation d'un coup d'œil (scripts/planche.mjs).
type PropsPlanche = { recette: RecetteReel; images: number[]; colonnes: number };
const L_VIGNETTE = 270;
const Planche: React.FC<PropsPlanche> = ({ recette, images, colonnes }) => {
  const plan = planifier(typographier(recette, recette.langue));
  return (
    <AbsoluteFill style={{ background: '#777', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start', gap: 8, padding: 8, width: colonnes * (L_VIGNETTE + 8) + 8 }}>
      {images.map((n) => (
        <div key={n} style={{ position: 'relative', width: L_VIGNETTE, height: (L_VIGNETTE * 1920) / 1080 + 26, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 1080, height: 1920, transform: `scale(${L_VIGNETTE / 1080})`, transformOrigin: '0 0', overflow: 'hidden' }}>
            <Freeze frame={n}>
              <Reel recette={recette} plan={plan} verification={false} silencieux />
            </Freeze>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 26, font: '600 16px sans-serif', color: '#fff', textAlign: 'center' }}>
            {n} · {(n / FPS).toFixed(2)} s
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

export const Racine: React.FC = () => (
  <>
    <Composition
      id="reel"
      component={Reel}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={300}
      defaultProps={{ recette: exempleCitation as RecetteReel } as PropsReel}
      calculateMetadata={({ props }) => {
        const plan = planifier(props.recette);
        return { durationInFrames: plan.duree, props: { ...props, plan } };
      }}
    />
    {/* une composition et non une image fixe : useCurrentFrame est borné
        à la durée, il faut celle du reel pour que Freeze aille partout */}
    <Composition
      id="planche"
      component={Planche}
      fps={FPS}
      durationInFrames={300}
      width={6 * (L_VIGNETTE + 8) + 8}
      height={2 * ((L_VIGNETTE * 1920) / 1080 + 34) + 8}
      defaultProps={{ recette: exempleCitation as RecetteReel, images: [0], colonnes: 6 } as PropsPlanche}
      calculateMetadata={({ props }) => {
        const lignes = Math.ceil(props.images.length / props.colonnes);
        const duree = planifier(props.recette).duree;
        return { durationInFrames: duree, width: props.colonnes * (L_VIGNETTE + 8) + 8, height: lignes * ((L_VIGNETTE * 1920) / 1080 + 34) + 8 };
      }}
    />
    <Still
      id="image"
      component={Image}
      width={1080}
      height={1350}
      defaultProps={{ recette: exempleImage as RecetteFixe, page: 0 } as PropsImage}
    />
  </>
);
