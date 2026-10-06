import React from 'react';
import { Composition, Still } from 'remotion';
import { FPS } from './charte/charte';
import { typographier } from './charte/libelles';
import { Bruitages, Musique } from './charte/Son';
import { Citation } from './gabarits/Citation';
import { QuizChrono } from './gabarits/QuizChrono';
import { ImageFixe } from './gabarits/ImageFixe';
import { PageCarrousel } from './gabarits/Carrousel';
import { planifier, type Plan } from './plan';
import type { RecetteFixe, RecetteReel } from './recette';
import exempleCitation from '../recettes/exemples/citation.json';
import exempleImage from '../recettes/exemples/image.json';

type PropsReel = { recette: RecetteReel; plan?: Plan; verification?: boolean };
type PropsImage = { recette: RecetteFixe; page?: number; verification?: boolean };

const Reel: React.FC<PropsReel> = ({ recette: brute, plan, verification }) => {
  const recette = typographier(brute, brute.langue);
  const p = plan ?? planifier(recette);
  return (
    <>
      {recette.gabarit === 'citation' ? (
        <Citation recette={recette} plan={p} verification={verification} />
      ) : (
        <QuizChrono recette={recette} plan={p} verification={verification} />
      )}
      {!verification && (
        <>
          <Musique fichier={p.musique} debut={recette.musiqueDebut} duree={p.duree} sons={p.sons} />
          <Bruitages sons={p.sons} />
        </>
      )}
    </>
  );
};

const Image: React.FC<PropsImage> = ({ recette: brute, page = 0, verification }) => {
  const recette = typographier(brute, brute.langue);
  return recette.gabarit === 'image' ? (
    <ImageFixe recette={recette} verification={verification} />
  ) : (
    <PageCarrousel recette={recette} page={page} verification={verification} />
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
    <Still
      id="image"
      component={Image}
      width={1080}
      height={1350}
      defaultProps={{ recette: exempleImage as RecetteFixe, page: 0 } as PropsImage}
    />
  </>
);
