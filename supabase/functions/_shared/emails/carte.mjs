// La carte des e-mails envoyés par Resend : ceux de l'évaluation de couple
// (rapport, lien personnel, rapport prêt, rappel, reprise ; bilan/courriel.mjs)
// et la confirmation de l'e-book (ebook-verify). C'est la maquette des e-mails
// du parcours Brevo (emails/gabarit.html, Claude Design, 24 octobre 2026),
// sans les encarts « À voir aussi » ni Instagram : ce sont des messages sur
// une démarche en cours, pas des nouvelles du site. Thomas, le même soir :
// « tu peux redesigner comme pour les mails marketing les mails d'envois de
// pdf et tout aussi ? comme ça on uniformise les mails ».
//
// JavaScript pur : testé en Node, utilisé par les fonctions (Deno).

export const SITE = 'https://quiz-couple.com';
const IMAGES = SITE + '/email/';

// L'éditeur, en bas de chaque message : le nom de la boîte et le site, rien
// de plus (Thomas, 20 octobre 2026 : « on peut juste mettre le nom de la boîte
// et du site »). L'identité complète du vendeur (forme, adresse, SIRET),
// que la loi veut sur un support durable au moment de la confirmation du
// contrat (L221-13 et L221-5), est écrite en dernière page du rapport PDF
// (`EDITEUR` de bilan/document.mjs), et sur les mentions légales et les CGV
// du site, dont l'e-mail du rapport donne le lien.
export const EDITEUR = 'Quiz Couple · Visibilitea · quiz-couple.com';

export function remplir(texte, valeurs) {
  return String(texte).replace(/\{(\w+)\}/g, (tout, cle) => (cle in valeurs ? String(valeurs[cle]) : tout));
}

// En français, l'espace avant « : ; ! ? » et après « « » est insécable : sans
// elle, un téléphone envoie les deux-points seuls en début de ligne.
export function insec(s, lang) {
  // Un montant ne se sépare pas de son symbole, dans toutes les langues.
  const x = String(s).replace(/(\d) ([€%])/g, '$1 $2');
  return lang === 'fr' ? x.replace(/ ([:;!?»])/g, ' $1').replace(/« /g, '« ') : x;
}

export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Les couleurs et les polices de la maquette (emails/gabarit.html).
const M = {
  encre: '#2b1722', violet: '#6834b2', rose: '#b12559', rosePale: '#fae6ec', roseVif: '#e06c92',
  doux: '#785e6c', fond: '#fcf6f3', blanc: '#fffffe', bord: '#f0e0e6', bouton: '#804db3', lavande: '#ede6f4',
  police: '-apple-system,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif',
  ronde: 'ui-rounded,-apple-system,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif',
};

// Après échappement : **gras**.
const gras = (s, lang) => esc(insec(s, lang)).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const sansGras = (s) => String(s).replace(/\*\*/g, '');

// La vague entre l'en-tête rose et la carte blanche (huit demi-cercles).
const VAGUE = (() => {
  const haut = `<td width="12.500%" bgcolor="${M.blanc}" style="background-color:${M.blanc};"><div style="height:12px;background-color:${M.rosePale};"><div style="height:12px;background-color:${M.blanc};border-radius:12px 12px 0 0;border-radius:50% 50% 0 0/100% 100% 0 0;">&#8202;</div></div><div style="height:12px;">&#8202;</div></td>`;
  const bas = `<td width="12.500%" bgcolor="${M.rosePale}" style="background-color:${M.rosePale};"><div style="height:12px;">&#8202;</div><div style="height:12px;background-color:${M.blanc};"><div style="height:12px;background-color:${M.rosePale};border-radius:0 0 12px 12px;border-radius:0 0 50% 50%/0 0 100% 100%;">&#8202;</div></div></td>`;
  return `<!--[if !mso]><!--><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed;font-size:0;line-height:0;"><tr>${(haut + bas).repeat(4)}</tr></table><!--<![endif]-->`;
})();

// Le gros bouton violet, centré, pleine largeur sur téléphone ; plus serré
// dans la petite carte d'une évaluation (`serre`), où il tient sur une ligne
// à 390 px.
const boutonHtml = (texte, url, serre) => {
  const pad = serre ? '14px 20px' : '16px 36px';
  return `<table role="presentation" class="btn-t" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;"><tr>
<td align="center" bgcolor="${M.bouton}" style="background-color:${M.bouton};border-radius:999px;mso-padding-alt:${pad};"><a href="${esc(url)}" target="_blank" class="btn-a" style="display:inline-block;padding:${pad};font-family:${M.ronde};font-size:17px;line-height:22px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;mso-padding-alt:0;">${esc(texte)}</a></td>
</tr></table>`;
};

// L'adresse du lien en clair, sous un bouton : pour la recopier sur un autre
// appareil, ou quand une messagerie bloque le bouton.
const brutHtml = (url) => `<div style="padding-top:10px;font-family:${M.police};font-size:12px;line-height:17px;color:${M.doux};word-break:break-all;">${esc(url)}</div>`;

// Les options, toutes facultatives sauf lang, sujet, titre, signature et pied :
//   bonjour, alt     la bulle des deux personnages et le texte de l'image ;
//   avant            le texte d'aperçu, sous le sujet dans la boîte ;
//   phrase           la phrase sous le titre ;
//   barre            { pct, texte } : une barre de progression ;
//   puces            des coches courtes, **gras** compris ;
//   citation         une phrase en citation ;
//   ticket           { barre, prix, phrase } : le prix (barré pendant une réduction) ;
//   bouton, url      le bouton ; brut : l'adresse en clair dessous ;
//   lien2            { texte, url } : un second lien, sous le bouton ;
//   blocs            [{ libelle, bouton, url }] : un bouton par évaluation, à
//                    la place du bouton seul (un lien perdu pour plusieurs) ;
//   note             une pastille sous le bouton ;
//   seul             une petite ligne sous la signature ;
//   legal            { texte, lien } : un paragraphe du pied, où l'adresse
//                    `lien` devient un lien ;
//   arret, arretUrl  le lien pour ne plus rien recevoir.
export function carte(o) {
  const { lang, sujet, avant, bonjour, alt, titre, phrase, barre, puces, citation, ticket, bouton, url, brut, lien2, blocs, note, seul, signature, pied, legal, arret, arretUrl } = o;
  const px = 'padding-left:40px;padding-right:40px;';
  const liste = puces && puces.length ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:4px 0 6px;">${puces.map((x) =>
    `<tr><td width="34" valign="top" style="width:34px;padding:1px 0 12px;"><div style="width:24px;height:24px;border-radius:12px;background-color:${M.rosePale};color:${M.rose};font-family:${M.police};font-size:14px;line-height:24px;font-weight:800;text-align:center;">&#10003;</div></td>` +
    `<td valign="top" style="padding:0 0 12px;font-family:${M.police};font-size:17px;line-height:25px;color:${M.encre};">${gras(x, lang)}</td></tr>`).join('')}</table>` : '';
  const jauge = barre ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:2px 0 18px;"><tr>` +
    `<td width="${barre.pct}%" height="12" bgcolor="${M.bouton}" style="width:${barre.pct}%;height:12px;background-color:${M.bouton};border-radius:6px 0 0 6px;font-size:0;line-height:0;">&#8202;</td>` +
    `<td height="12" bgcolor="${M.lavande}" style="height:12px;background-color:${M.lavande};border-radius:0 6px 6px 0;font-size:0;line-height:0;">&#8202;</td>` +
    `<td width="64" align="right" style="width:64px;padding-left:10px;font-family:${M.ronde};font-size:15px;line-height:18px;font-weight:800;color:${M.violet};white-space:nowrap;">${esc(barre.texte)}</td></tr></table>` : '';
  const cite = citation ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:6px 0 4px;"><tr><td style="border-left:4px solid ${M.roseVif};padding:4px 0 4px 16px;font-family:${M.police};font-size:16px;line-height:24px;font-style:italic;color:${M.encre};">${esc(insec(citation, lang))}</td></tr></table>` : '';
  const prix = ticket ? `<tr><td class="px" style="padding:20px 40px 4px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
<td width="12" valign="middle" bgcolor="${M.roseVif}" style="width:12px;background-color:${M.roseVif};border-radius:18px 0 0 18px;"><!--[if !mso]><!--><div style="width:12px;height:24px;background-color:${M.blanc};border-radius:0 12px 12px 0;font-size:0;line-height:0;">&#8202;</div><!--<![endif]--></td>
<td width="42%" align="center" valign="middle" bgcolor="${M.roseVif}" style="background-color:${M.roseVif};padding:16px 8px 16px 2px;font-family:${M.ronde};">${ticket.barre ? `<div style="font-size:16px;line-height:20px;font-weight:700;color:#2a1e36;text-decoration:line-through;">${esc(ticket.barre)}</div>` : ''}<div class="prix-big" style="font-size:38px;line-height:44px;font-weight:800;letter-spacing:-0.5px;color:#2a1e36;">${esc(ticket.prix)}</div></td>
<td valign="middle" bgcolor="${M.rosePale}" style="background-color:${M.rosePale};border-left:3px dashed ${M.blanc};padding:16px 14px 16px 18px;font-family:${M.police};font-size:15px;line-height:21px;font-weight:700;color:${M.encre};">${esc(insec(ticket.phrase, lang))}</td>
<td width="12" valign="middle" bgcolor="${M.rosePale}" style="width:12px;background-color:${M.rosePale};border-radius:0 18px 18px 0;"><!--[if !mso]><!--><div style="width:12px;height:24px;background-color:${M.blanc};border-radius:12px 0 0 12px;font-size:0;line-height:0;">&#8202;</div><!--<![endif]--></td>
</tr></table></td></tr>` : '';
  // Un bouton par évaluation, chacun dans sa petite carte avec son nom.
  const cartes = blocs && blocs.length ? blocs.map((b) => `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 14px;"><tr>
<td bgcolor="${M.fond}" style="background-color:${M.fond};border:1px solid ${M.bord};border-radius:22px;padding:18px 20px;">
<div style="padding:0 0 12px;font-family:${M.ronde};font-size:18px;line-height:23px;font-weight:800;color:${M.encre};">${esc(insec(b.libelle, lang))}</div>
${boutonHtml(b.bouton, b.url, true)}${brutHtml(b.url)}
</td></tr></table>`).join('') : '';
  const action = cartes
    ? `<tr><td class="px" style="padding:12px 40px 0;">${cartes}</td></tr>`
    : bouton ? `<tr><td class="px" align="center" style="padding:26px 40px 0;">
${boutonHtml(bouton, url)}${brut ? brutHtml(url) : ''}${lien2 ? `<div style="padding-top:16px;font-family:${M.ronde};font-size:16px;line-height:22px;font-weight:700;"><a href="${esc(lien2.url)}" target="_blank" style="color:${M.violet};text-decoration:underline;">${esc(insec(lien2.texte, lang))}</a></div>` : ''}</td></tr>` : '';
  const legalHtml = legal ? (() => {
    let h = esc(insec(legal.texte, lang));
    if (legal.lien) h = h.split(esc(legal.lien)).join(`<a href="${esc(legal.lien)}" target="_blank" style="color:${M.violet};text-decoration:underline;">${esc(legal.lien)}</a>`);
    return `<div style="padding:10px 0 0;font-size:12px;line-height:18px;">${h}</div>`;
  })() : '';
  const html = `<!DOCTYPE html>
<html lang="${esc(lang)}" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(sujet)}</title>
<style>
:root{color-scheme:light dark;supported-color-schemes:light dark;}
body{margin:0;padding:0;width:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}
a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important;}
@media screen and (max-width:620px){
.page-pad{padding:14px 8px 28px!important;}
.px{padding-left:24px!important;padding-right:24px!important;}
.h1{font-size:25px!important;line-height:31px!important;}
.btn-t{width:100%!important;}
.btn-a{display:block!important;}
.duo{width:132px!important;height:89px!important;}
.duo-td{width:140px!important;}
.bulle{font-size:17px!important;line-height:22px!important;padding:11px 15px!important;}
.prix-big{font-size:32px!important;line-height:38px!important;}
}
</style>
</head>
<body style="margin:0;padding:0;width:100%;background-color:${M.fond};">
<div lang="${esc(lang)}" dir="ltr" style="background-color:${M.fond};">
${avant ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${esc(avant)}${'&nbsp;&#847;&zwnj;'.repeat(30)}</div>` : ''}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${M.fond}" style="background-color:${M.fond};"><tr>
<td align="center" class="page-pad" style="padding:24px 16px 40px;">
<!--[if mso]><table role="presentation" width="600" align="center" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;margin:0 auto;">
<tr><td style="padding:0 6px 16px;font-family:${M.ronde};font-size:21px;line-height:24px;font-weight:800;letter-spacing:-0.2px;"><a href="${esc(SITE + '/' + (lang === 'fr' ? '' : lang + '/'))}" target="_blank" style="text-decoration:none;"><span style="color:${M.rose};">Quiz</span><span style="color:${M.violet};"> Couple</span></a></td></tr>
<tr><td bgcolor="${M.blanc}" style="background-color:${M.blanc};border:1px solid ${M.bord};border-radius:32px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr><td bgcolor="${M.rosePale}" style="background-color:${M.rosePale};border-radius:31px 31px 0 0;padding:26px 20px 0;">
<table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;"><tr>
<td class="duo-td" width="190" valign="bottom" style="width:190px;"><img class="duo" src="${IMAGES}mascottes-coucou.png" width="180" height="122" alt="${esc(alt || '')}" style="display:block;width:180px;height:122px;border:0;font-family:${M.police};font-size:14px;line-height:20px;color:${M.rose};"></td>
<td valign="middle" style="padding:0 0 40px 2px;"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
<td class="bulle" bgcolor="${M.blanc}" style="background-color:${M.blanc};border:2px solid #4a3540;border-radius:22px 22px 22px 4px;padding:13px 20px;font-family:${M.ronde};font-size:19px;line-height:24px;font-weight:800;color:${M.rose};">${esc(insec(bonjour || '', lang))}</td>
</tr></table></td>
</tr></table>
</td></tr>
<tr><td style="padding:0;font-size:0;line-height:0;">${VAGUE}</td></tr>
<tr><td class="px" style="padding:26px 40px 16px;"><h1 class="h1" style="margin:0;font-family:${M.ronde};font-size:30px;line-height:36px;font-weight:800;letter-spacing:-0.3px;color:${M.encre};">${esc(insec(titre, lang))}</h1></td></tr>
<tr><td class="px" style="${px}padding-bottom:4px;font-family:${M.police};font-size:17px;line-height:27px;color:${M.encre};">
${phrase ? `<p style="margin:0 0 16px;">${esc(insec(phrase, lang))}</p>` : ''}${jauge}${liste}${cite}
</td></tr>
${prix}
${action}
${note ? `<tr><td class="px" align="center" style="padding:14px 40px 0;"><span style="display:inline-block;padding:8px 16px;border:1px solid ${M.bord};border-radius:18px;background-color:${M.fond};font-family:${M.police};font-size:14px;line-height:20px;color:${M.doux};">${esc(insec(note, lang))}</span></td></tr>` : ''}
<tr><td class="px" style="padding:30px 40px 0;"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
<td style="padding:0 8px 0 0;"><div style="width:8px;height:8px;border-radius:8px;background-color:${M.roseVif};font-size:0;line-height:0;">&#8202;</div></td>
<td style="padding:0 8px 0 0;"><div style="width:8px;height:8px;border-radius:8px;background-color:${M.bouton};font-size:0;line-height:0;">&#8202;</div></td>
<td style="padding:0;"><div style="width:8px;height:8px;border-radius:8px;background-color:${M.roseVif};font-size:0;line-height:0;">&#8202;</div></td>
</tr></table></td></tr>
<tr><td class="px" style="padding:14px 40px ${seul ? '14px' : '34px'};font-family:${M.police};font-size:16px;line-height:24px;font-weight:600;color:${M.encre};">${signature.map((x) => esc(insec(x, lang))).join('<br>')}</td></tr>
${seul ? `<tr><td class="px" style="padding:0 40px 30px;font-family:${M.police};font-size:14px;line-height:20px;color:${M.doux};">${esc(insec(seul, lang))}</td></tr>` : ''}
</table>
</td></tr>
<tr><td align="center" class="px" style="padding:22px 28px 0;font-family:${M.police};font-size:13px;line-height:19px;color:${M.doux};">
${esc(insec(pied, lang))}${legalHtml}
<div style="padding-top:10px;">${esc(EDITEUR)}</div>
${arret && arretUrl ? `<div style="padding-top:8px;"><a href="${esc(arretUrl)}" target="_blank" style="color:${M.violet};text-decoration:underline;">${esc(arret)}</a></div>` : ''}
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</div>
</body>
</html>`;
  return html;
}

// Le texte brut, à côté du HTML : même ordre, sans mise en forme.
export function texteCarte(o) {
  const { lang, bonjour, titre, phrase, barre, puces, citation, ticket, bouton, url, lien2, blocs, note, seul, signature, pied, legal, arret, arretUrl } = o;
  const dp = lang === 'fr' ? ' : ' : ': ';
  return (bonjour ? [insec(bonjour, lang), ''] : []).concat([titre, ''])
    .concat(phrase ? [phrase] : [])
    .concat(barre ? [barre.texte] : [])
    .concat([''])
    .concat((puces || []).map((x) => '- ' + sansGras(x)))
    .concat(puces && puces.length ? [''] : [])
    .concat(citation ? [citation, ''] : [])
    .concat(ticket ? [(ticket.barre ? ticket.barre + ' → ' : '') + ticket.prix + ' · ' + ticket.phrase, ''] : [])
    .concat(blocs && blocs.length
      ? blocs.flatMap((b) => [b.libelle + dp + b.url, ''])
      : bouton ? [bouton + dp + url].concat(lien2 ? [lien2.texte + dp + lien2.url] : []).concat(['']) : [])
    .concat(note ? [note, ''] : [])
    .concat(signature)
    .concat(seul ? ['', seul] : [])
    .concat(['', '--', pied])
    .concat(legal ? [legal.texte] : [])
    .concat(arret && arretUrl ? [arret + dp + arretUrl] : [])
    .concat([EDITEUR])
    .join('\n');
}
