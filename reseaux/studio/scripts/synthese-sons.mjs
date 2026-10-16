// Les bruitages du bonhomme bâton, synthétisés ici même : des whooshs, une
// lame qu'on tire, des zaps, un bourdon électrique, des boums, une
// explosion, un grondement, des battements d'ailes, un sol qui craque, des
// éclats, un flash, une montée, le drone d'un ralenti, une réception, et
// depuis le format rêvé un aboiement, le cristal qui éclate et l'enclume. Pas
// de voix. Aucune bibliothèque : des oscillateurs, du bruit, des filtres et
// des enveloppes écrits en quelques lignes, puis le ffmpeg de Remotion
// encode en MP3. Les fichiers (public/sons/sy-<nom>.mp3, 20 à 60 Ko) sont
// dans le dépôt, avec le manifeste public/sons/synthese.json que Son.tsx lit.
//   node scripts/synthese-sons.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ici = path.dirname(fileURLToPath(import.meta.url));
const dossier = path.join(ici, '..', 'public', 'sons');
const SR = 48000;

// ── Outils ─────────────────────────────────────────────────────────────

const tampon = (secondes) => new Float32Array(Math.round(secondes * SR));
let graine = 12345;
const alea = () => {
  graine = (graine * 1664525 + 1013904223) >>> 0;
  return graine / 4294967296;
};
const bruit = () => alea() * 2 - 1;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;

// Filtre passe-bande RBJ, coefficients recalculés quand la fréquence bouge.
const passeBande = (q = 1.4) => {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x, f) => {
    const w = (2 * Math.PI * clamp(f, 20, 20000)) / SR;
    const al = Math.sin(w) / (2 * q);
    const b0 = al, b1 = 0, b2 = -al;
    const a0 = 1 + al, a1 = -2 * Math.cos(w), a2 = 1 - al;
    const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
};
const passeBas = () => {
  let y = 0;
  return (x, f) => {
    const a = 1 - Math.exp((-2 * Math.PI * clamp(f, 10, 20000)) / SR);
    y += a * (x - y);
    return y;
  };
};
const passeHaut = () => {
  const pb = passeBas();
  return (x, f) => x - pb(x, f);
};
// enveloppe : montée linéaire sur « a » s, puis décroissance exponentielle de constante « d »
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));
const fondu = (buf, debut = 0.004, fin = 0.02) => {
  const n1 = Math.round(debut * SR);
  const n2 = Math.round(fin * SR);
  for (let i = 0; i < n1; i++) buf[i] *= i / n1;
  for (let i = 0; i < n2; i++) buf[buf.length - 1 - i] *= i / n2;
  return buf;
};
const normaliser = (buf, crete = 0.89) => {
  let max = 1e-6;
  for (const v of buf) max = Math.max(max, Math.abs(v));
  for (let i = 0; i < buf.length; i++) buf[i] *= crete / max;
  return buf;
};
const melanger = (...bufs) => {
  const n = Math.max(...bufs.map((b) => b.length));
  const out = new Float32Array(n);
  for (const b of bufs) for (let i = 0; i < b.length; i++) out[i] += b[i];
  return out;
};
const sinus = (phase) => Math.sin(2 * Math.PI * phase);
const scie = (phase) => 2 * (phase - Math.floor(phase + 0.5));

// ── Les sons ───────────────────────────────────────────────────────────

const whoosh = (duree, f0, f1, f2, q = 1.6) => {
  const b = tampon(duree);
  const pb = passeBande(q);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const u = t / duree;
    const f = u < 0.45 ? lerp(f0, f1, u / 0.45) : lerp(f1, f2, (u - 0.45) / 0.55);
    b[i] = pb(bruit(), f) * Math.sin(Math.PI * Math.min(1, u * 1.15)) ** 1.6;
  }
  return normaliser(fondu(b));
};

const whooshLong = () => {
  const d = 1.15;
  const b = tampon(d);
  const pb = passeBande(1.2);
  const bas = passeBas();
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const u = t / d;
    const f = lerp(220, 3200, u ** 1.4);
    const e = Math.sin(Math.PI * u) ** 1.2;
    b[i] = pb(bruit(), f) * e * 0.9 + bas(bruit(), 90) * e * 2.2 + sinus(t * 58) * 0.08 * e;
  }
  return normaliser(fondu(b, 0.01, 0.06));
};

const shing = () => {
  const d = 0.75;
  const b = tampon(d);
  const partiels = [2200, 3700, 5900, 8300, 11800];
  const ph = partiels.map(() => alea());
  const ph2 = passeBande(2.5);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    let v = 0;
    partiels.forEach((f, k) => {
      v += sinus(f * t + ph[k]) * Math.exp(-t / (0.28 - k * 0.04)) * (0.7 - k * 0.1);
    });
    const u = t / 0.14;
    const gratte = u < 1 ? ph2(bruit(), lerp(2600, 9000, u)) * Math.sin(Math.PI * u) * 1.6 : 0;
    b[i] = v * env(t, 0.003, 0.3) + gratte;
  }
  return normaliser(fondu(b));
};

const rentre = () => {
  const d = 0.42;
  const b = tampon(d);
  const pb = passeBande(2.2);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const u = t / 0.2;
    const gratte = u < 1 ? pb(bruit(), lerp(9000, 2400, u)) * Math.sin(Math.PI * u) : 0;
    const t2 = t - 0.2;
    const thud = t2 >= 0 ? sinus(lerp(190, 90, Math.min(1, t2 / 0.1)) * t2) * env(t2, 0.003, 0.06) : 0;
    b[i] = gratte + thud * 1.4;
  }
  return normaliser(fondu(b));
};

const zap = (variante) => {
  const d = 0.32;
  const b = tampon(d);
  const ph = passeHaut();
  const porteuse = variante ? 72 : 96;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const m = (sinus(t * porteuse) > 0.2 ? 1 : 0.15) * (alea() < 0.03 ? 2.5 : 1);
    const chirp = t < 0.09 ? sinus(lerp(3200, 500, t / 0.09) * t) * (1 - t / 0.09) * 0.8 : 0;
    b[i] = ph(bruit(), 1400) * m * env(t, 0.004, 0.14) + chirp;
  }
  return normaliser(fondu(b));
};

const bourdon = () => {
  const d = 2.4;
  const b = tampon(d);
  const pb = passeBas();
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const v = scie(t * 110) * 0.6 + scie(t * 110.7) * 0.4 + scie(t * 165.3) * 0.35 + sinus(t * 55) * 0.5;
    const crepite = alea() < 0.002 ? bruit() * 2 : 0;
    b[i] = pb(v, 900) * (1 - 0.2 * (0.5 + 0.5 * sinus(t * 7))) + crepite * 0.3;
  }
  // bouclable : les 60 dernières ms fondues sur les 60 premières
  const n = Math.round(0.06 * SR);
  for (let i = 0; i < n; i++) {
    const u = i / n;
    b[i] = b[i] * u + b[b.length - n + i] * (1 - u);
  }
  return normaliser(b.subarray(0, b.length - n));
};

const boum = (court) => {
  const d = court ? 0.32 : 0.62;
  const b = tampon(d);
  const pb = passeBas();
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const f = court ? lerp(130, 48, Math.min(1, t / 0.12)) : lerp(150, 36, Math.min(1, t / 0.35));
    b[i] = sinus(f * t) * env(t, 0.004, court ? 0.09 : 0.2) * 1.4 + pb(bruit(), 420) * env(t, 0.002, 0.03) * 1.5;
  }
  return normaliser(fondu(b, 0.002, 0.04));
};

const explosion = () => {
  const d = 1.7;
  const b = tampon(d);
  const pb = passeBas();
  let brun = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    brun = clamp(brun + bruit() * 0.08, -1, 1);
    const souffle = pb(brun * 3, lerp(900, 260, Math.min(1, t / 0.6))) * env(t, 0.008, 0.48);
    const sub = sinus(lerp(70, 40, Math.min(1, t / 0.3)) * t) * env(t, 0.004, 0.42);
    const crac = t < 0.03 ? bruit() * (1 - t / 0.03) * 1.2 : 0;
    b[i] = souffle + sub * 1.1 + crac;
  }
  return normaliser(fondu(b, 0.002, 0.12));
};

const grondement = () => {
  const d = 1.35;
  const b = tampon(d);
  const pb = passeBas();
  const pbd = passeBande(1.1);
  let phase = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const f = 48 + 6 * sinus(t * 5.2) + bruit() * 3;
    phase += f / SR;
    const voix = (scie(phase) * 0.7 + scie(phase * 2.01) * 0.3) * (0.8 + 0.2 * sinus(t * 11));
    const souffle = pbd(bruit(), 520) * (0.5 + 0.5 * sinus(t * 11)) * 0.5;
    const e = Math.min(1, t / 0.22) * Math.min(1, (d - t) / 0.35);
    b[i] = (pb(voix, 520) + souffle) * e;
  }
  return normaliser(fondu(b, 0.01, 0.05));
};

const ailes = (lent) => {
  const d = lent ? 0.62 : 0.48;
  const b = tampon(d);
  const pb = passeBande(0.9);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const u = t / d;
    const e = u < 0.35 ? (u / 0.35) ** 2 : ((1 - u) / 0.65) ** 1.3;
    b[i] = pb(bruit(), lerp(180, 620, Math.sin(Math.PI * u))) * e;
  }
  return normaliser(fondu(b));
};

const craque = () => {
  const d = 0.4;
  const b = tampon(d);
  const pb = passeBas();
  let prochain = 0.0;
  let ecart = 0.045;
  const clics = [];
  while (prochain < 0.3 && clics.length < 12) {
    clics.push(prochain);
    prochain += ecart;
    ecart = Math.max(0.012, ecart * 0.82);
  }
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    let v = 0;
    for (const c of clics) {
      const u = t - c;
      if (u >= 0 && u < 0.006) v += bruit() * (1 - u / 0.006);
    }
    b[i] = pb(v, 3000) * 1.2 + sinus(lerp(110, 50, Math.min(1, t / 0.2)) * t) * env(t, 0.004, 0.12) * 0.8;
  }
  return normaliser(fondu(b));
};

const eclats = () => {
  const d = 0.95;
  const b = tampon(d);
  const tinks = Array.from({ length: 11 }, () => ({ t: alea() * 0.75, f: 2400 + alea() * 3400, ph: alea() }));
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    let v = 0;
    for (const k of tinks) {
      const u = t - k.t;
      if (u >= 0) v += sinus(k.f * u + k.ph) * Math.exp(-u / 0.055) * 0.5;
    }
    b[i] = v;
  }
  return normaliser(fondu(b));
};

const flash = () => {
  const d = 0.55;
  const b = tampon(d);
  const ph = passeHaut();
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    b[i] = sinus(lerp(4200, 1100, Math.min(1, t / 0.3)) * t) * env(t, 0.003, 0.16) + ph(bruit(), 4000) * env(t, 0.002, 0.02) * 1.2;
  }
  return normaliser(fondu(b));
};

const monte = () => {
  const d = 1.25;
  const b = tampon(d);
  const pb = passeBande(1.3);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const u = t / d;
    b[i] = pb(bruit(), lerp(280, 4200, u ** 1.6)) * (0.15 + 0.85 * u ** 1.4) * Math.min(1, (d - t) / 0.02);
  }
  return normaliser(fondu(b, 0.02, 0.008));
};

const ralenti = () => {
  const d = 2.7;
  const b = tampon(d);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const e = Math.min(1, t / 0.18) * Math.min(1, (d - t) / 0.45);
    b[i] = (sinus(t * 48) * 0.7 + sinus(t * 72.2) * 0.35 + sinus(t * 96.1) * 0.12) * (0.7 + 0.3 * sinus(t * 2.1)) * e;
  }
  return normaliser(fondu(b, 0.02, 0.1));
};

const atterrit = (lourd) => {
  const d = 0.28;
  const b = tampon(d);
  const pb = passeBas();
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    b[i] = sinus(lerp(lourd ? 100 : 85, 42, Math.min(1, t / 0.08)) * t) * env(t, 0.003, 0.07) * 1.3 + pb(bruit(), 800) * env(t, 0.002, 0.03);
  }
  return normaliser(fondu(b, 0.002, 0.03));
};


// Un aboiement de dessin animé (la meute du jardin) : un « wouf » bref, une
// note qui tombe de 420 à 160 Hz, deux harmoniques, du souffle, et l'attaque
// sèche d'une petite gueule ; la variante est un petit chien, plus aigu.
const aboie = (petit) => {
  const d = petit ? 0.17 : 0.22;
  const b = tampon(d);
  const pb = passeBande(1.1);
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    const u = t / d;
    const f = lerp(petit ? 640 : 420, petit ? 260 : 160, Math.min(1, u * 1.6));
    ph += f / SR;
    const voix = sinus(ph) * 0.7 + sinus(ph * 2.01) * 0.35 + sinus(ph * 3.02) * 0.12;
    const forme = env(t, 0.006, 0.055) * (1 - 0.3 * Math.sin(u * Math.PI * 6) * (u > 0.4 ? 1 : 0));
    b[i] = voix * forme + pb(bruit(), f * 3.5) * env(t, 0.003, 0.03) * 0.8;
  }
  return normaliser(fondu(b, 0.003, 0.03));
};

// Le cristal qui éclate (le diamant brisé en mille morceaux) : une gerbe de
// tintements très aigus aux hauteurs inharmoniques, chacun avec sa petite
// attaque, sur un souffle brillant qui retombe.
const cristal = () => {
  const d = 1.4;
  const b = tampon(d);
  const ph = passeHaut();
  const notes = [2093, 2637, 3136, 3729, 4186, 4978, 5588, 6272, 7040, 7902];
  const depart = notes.map((_, k) => 0.02 + hasardSon(k) * 0.35);
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    let v = ph(bruit(), 4000) * env(t, 0.004, 0.09) * 0.9;
    notes.forEach((f, k) => {
      const tt = t - depart[k];
      if (tt < 0) return;
      v += sinus(f * tt) * env(tt, 0.002, 0.22 + 0.08 * (k % 3)) * 0.22 * (1 - k * 0.04);
    });
    b[i] = v;
  }
  return normaliser(fondu(b, 0.002, 0.2));
};
const hasardSon = (k) => {
  const s = Math.sin(k * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// Le marteau sur l'enclume (la bague qu'on forge) : un choc sourd et deux
// partiels métalliques qui sonnent, l'un à 1 900 Hz, l'autre à 3 100 Hz.
const enclume = () => {
  const d = 0.6;
  const b = tampon(d);
  const pb = passeBas();
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    b[i] = pb(bruit(), 900) * env(t, 0.002, 0.03) * 1.2 + sinus(t * 1900) * env(t, 0.002, 0.16) * 0.5 + sinus(t * 3140) * env(t, 0.002, 0.12) * 0.3 + sinus(lerp(160, 70, Math.min(1, t / 0.05)) * t) * env(t, 0.002, 0.05) * 0.8;
  }
  return normaliser(fondu(b, 0.002, 0.08));
};

const SONS = [
  { nom: 'whoosh', titre: 'Whoosh court', fabrique: () => whoosh(0.42, 420, 2600, 700) },
  { nom: 'whoosh-2', titre: 'Whoosh court, plus grave', fabrique: () => whoosh(0.48, 260, 1900, 500, 1.3) },
  { nom: 'whoosh-3', titre: 'Whoosh court, plus aigu', fabrique: () => whoosh(0.36, 600, 3400, 900, 1.9) },
  { nom: 'whoosh-long', titre: 'Long whoosh qui monte (un bond)', fabrique: whooshLong },
  { nom: 'shing', titre: "Lame qu'on tire", fabrique: shing },
  { nom: 'rentre', titre: "Lame qu'on rentre", fabrique: rentre },
  { nom: 'zap', titre: 'Zap électrique', fabrique: () => zap(0) },
  { nom: 'zap-2', titre: 'Zap électrique, plus grave', fabrique: () => zap(1) },
  { nom: 'bourdon', titre: 'Bourdon électrique (boucle)', fabrique: bourdon },
  { nom: 'boum', titre: 'Boum sourd', fabrique: () => boum(false) },
  { nom: 'coup', titre: 'Coup sourd, court', fabrique: () => boum(true) },
  { nom: 'explosion', titre: 'Explosion grave', fabrique: explosion },
  { nom: 'grondement', titre: 'Grondement de dragon', fabrique: grondement },
  { nom: 'ailes', titre: "Battement d'ailes", fabrique: () => ailes(false) },
  { nom: 'ailes-2', titre: "Battement d'ailes, plus lent", fabrique: () => ailes(true) },
  { nom: 'craque', titre: 'Le sol qui craque', fabrique: craque },
  { nom: 'eclats', titre: 'Éclats qui retombent', fabrique: eclats },
  { nom: 'flash', titre: 'Flash', fabrique: flash },
  { nom: 'monte', titre: 'Montée (riser)', fabrique: monte },
  { nom: 'ralenti', titre: "Drone d'un ralenti", fabrique: ralenti },
  { nom: 'atterrit', titre: 'Réception au sol', fabrique: () => atterrit(false) },
  { nom: 'atterrit-2', titre: 'Réception au sol, plus lourde', fabrique: () => atterrit(true) },
  { nom: 'aboie', titre: 'Aboiement de dessin animé', fabrique: () => aboie(false) },
  { nom: 'aboie-2', titre: 'Aboiement de dessin animé, petit chien', fabrique: () => aboie(true) },
  { nom: 'cristal', titre: 'Cristal qui éclate', fabrique: cristal },
  { nom: 'enclume', titre: "Marteau sur l'enclume", fabrique: enclume },
];

// ── WAV puis MP3 ───────────────────────────────────────────────────────

const wav = (buf) => {
  const n = buf.length;
  const out = Buffer.alloc(44 + n * 2);
  out.write('RIFF', 0);
  out.writeUInt32LE(36 + n * 2, 4);
  out.write('WAVE', 8);
  out.write('fmt ', 12);
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20);
  out.writeUInt16LE(1, 22);
  out.writeUInt32LE(SR, 24);
  out.writeUInt32LE(SR * 2, 28);
  out.writeUInt16LE(2, 32);
  out.writeUInt16LE(16, 34);
  out.write('data', 36);
  out.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) out.writeInt16LE(Math.round(clamp(buf[i], -1, 1) * 32767), 44 + i * 2);
  return out;
};

const outils = path.dirname(createRequire(import.meta.url).resolve(`@remotion/compositor-${process.platform}-${process.arch}${process.platform === 'linux' ? '-gnu' : ''}/package.json`));
const env2 = { ...process.env, LD_LIBRARY_PATH: outils };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'synthese-'));
const manifeste = { note: 'Bruitages synthétisés par scripts/synthese-sons.mjs (aucune bibliothèque, aucune voix), pour le bonhomme bâton : public/sons/sy-<nom>.mp3, dans le dépôt. Les noms suffixés -2, -3 sont les variantes tirées au sort par le studio (VARIANTES, Son.tsx).', sons: [] };
for (const s of SONS) {
  graine = 4242 + SONS.indexOf(s) * 977;
  const buf = s.fabrique();
  const entree = path.join(tmp, `${s.nom}.wav`);
  fs.writeFileSync(entree, wav(buf));
  const sortie = path.join(dossier, `sy-${s.nom}.mp3`);
  execFileSync(path.join(outils, 'ffmpeg'), ['-v', 'error', '-y', '-i', entree, '-codec:a', 'libmp3lame', '-q:a', '3', sortie], { env: env2 });
  manifeste.sons.push({ nom: s.nom, titre: s.titre, duree: Math.round((buf.length / SR) * 100) / 100 });
  console.log(`${s.nom}: ${(buf.length / SR).toFixed(2)} s, ${Math.round(fs.statSync(sortie).size / 1024)} Ko`);
}
fs.rmSync(tmp, { recursive: true, force: true });
fs.writeFileSync(path.join(dossier, 'synthese.json'), JSON.stringify(manifeste, null, 2) + '\n');
console.log(`${SONS.length} sons écrits dans ${dossier}`);
