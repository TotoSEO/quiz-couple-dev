// Le Chrome qui imprime les rapports. Sur GitHub Actions, le Chrome stable
// déjà installé sur la machine (channel « chrome ») ; ailleurs, celui donné
// par BILAN_CHROME, sinon celui de Playwright s'il est là.

import fs from 'node:fs';
import { chromium } from 'playwright-core';

const LOCAUX = [
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
];

export async function lancer() {
  const options = { headless: true, args: ['--font-render-hinting=none', '--disable-gpu'] };
  if (process.env.BILAN_CHROME) return chromium.launch({ ...options, executablePath: process.env.BILAN_CHROME });
  const local = LOCAUX.find((p) => fs.existsSync(p));
  if (local && !process.env.GITHUB_ACTIONS) return chromium.launch({ ...options, executablePath: local });
  return chromium.launch({ ...options, channel: 'chrome' });
}
