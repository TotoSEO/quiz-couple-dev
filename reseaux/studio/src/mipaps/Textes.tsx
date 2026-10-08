// Les textes des mipaps : un message en Shantell Sans, posé en entier ou
// mot à mot. La taille suit la longueur : un mot seul se lit en grand.
import React from 'react';
import { entree } from '../charte/animation';
import { FPS, TEMPO } from '../charte/charte';
import { PAS_MOT } from './plan';

export const classeTaille = (texte: string) => (texte.length <= 30 ? ' is-grand' : texte.length <= 70 ? '' : ' is-petit');

export const Mots: React.FC<{ texte: string; f: number; debut: number; motAMot?: boolean }> = ({ texte, f, debut, motAMot }) => {
  if (!motAMot) return <>{texte}</>;
  const mots = texte.trim().split(/\s+/);
  return (
    <>
      {mots.map((m, i) => (
        <React.Fragment key={i}>
          <span style={{ display: 'inline-block', ...entree(f, debut + Math.round(i * PAS_MOT * FPS), TEMPO.court, 14) }}>{m}</span>
          {i < mots.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </>
  );
};
