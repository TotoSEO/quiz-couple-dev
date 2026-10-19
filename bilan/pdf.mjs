// Un rapport, de la donnée au PDF contrôlé : document HTML, contrôle de mise
// en page dans Chrome, impression A4, contrôle du PDF. Partagé par la
// fabrique (bilan/fabrique.mjs) et les exemples (bilan/exemples.mjs).

import { documentPdf, MARGES } from './document.mjs';
import { verifierMiseEnPage } from './mise-en-page.mjs';
import { controlerPdf } from './controle-pdf.mjs';

// navigateur : un chromium de playwright-core déjà lancé.
// Renvoie { pdf, pages, problemes, analyse }. Le PDF n'est bon que si
// `problemes` est vide.
export async function fabriquerPdf(navigateur, donnees) {
  const { html } = documentPdf(donnees);
  const contexte = await navigateur.newContext({ javaScriptEnabled: true });
  const page = await contexte.newPage();
  // Rien ne doit partir sur le réseau : tout est dans le document.
  await page.route('**/*', (route) => (route.request().url().startsWith('data:') ? route.continue() : route.abort()));
  try {
    await page.setContent(html, { waitUntil: 'load' });
    const problemes = await verifierMiseEnPage(page);
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true, tagged: true, outline: false });
    const controle = await controlerPdf(pdf, { marges: MARGES });
    return { pdf, pages: controle.pages, problemes: problemes.concat(controle.problemes) };
  } finally {
    await contexte.close();
  }
}
