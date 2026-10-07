# Sons du studio

Bruitages tirés des packs « Interface Sounds », « Digital Audio », « RPG
Audio » et « Impact Sounds » de Kenney (www.kenney.nl), licence Creative
Commons Zero (CC0) : usage commercial libre, sans attribution obligatoire.

| Fichier | Son d'origine |
|---|---|
| `apparition.ogg` | maximize_006 |
| `reponse.ogg` | pluck_001 |
| `bulle.ogg` | drop_002 |
| `tic.ogg` | tick_004 |
| `revelation.ogg` | confirmation_002 |
| `joie.ogg` | confirmation_004 |
| `intro.ogg` | question_001 |
| `fin.ogg` | confirmation_001 |
| `signature.ogg` | glass_002 |
| `pop.ogg` | Interface, drop_003 |
| `zoom.ogg` | Interface, maximize_003 |
| `glisse.ogg` | Interface, minimize_003 |
| `coeur.ogg` | Interface, glass_004 |
| `bisou.ogg` | Interface, pluck_002 |
| `tictac.ogg` | Interface, tick_002 |
| `saut.ogg` | Digital Audio, phaseJump2 |
| `froissement.ogg` | RPG Audio, cloth2 |
| `porte.ogg` | RPG Audio, doorOpen_1 |
| `pas.ogg` | Impact Sounds, footstep_carpet_001 |

Variantes (tirées au sort par le studio, `VARIANTES` dans `Son.tsx`) :

| Fichier | Son d'origine |
|---|---|
| `pop-2.ogg`, `pop-3.ogg` | Interface, drop_001, drop_004 |
| `saut-2.ogg`, `saut-3.ogg` | Digital Audio, phaseJump1, phaseJump4 |
| `pas-2.ogg`, `pas-3.ogg`, `pas-4.ogg` | Impact Sounds, footstep_carpet_002, _003, _000 |
| `coeur-2.ogg`, `coeur-3.ogg` | Interface, glass_001, glass_006 |
| `bulle-2.ogg`, `bulle-3.ogg` | Interface, select_006, select_008 |
| `glisse-2.ogg`, `glisse-3.ogg` | Interface, minimize_005, minimize_008 |
| `froissement-2.ogg` à `-4.ogg` | RPG Audio, cloth1, cloth3, cloth4 |
| `zoom-2.ogg` | Interface, maximize_008 |
| `bisou-2.ogg` | Interface, pluck_001 |
| `joie-2.ogg` | Interface, confirmation_003 |

Pour changer un son, on remplace le fichier en gardant son nom : les
gabarits n'y font référence que par ce nom. Depuis le 7 octobre 2026, les
reels partent sans musique (Thomas ajoute un son tendance dans l'appli) :
les bruitages sont donc doux (volumes de 0,10 à 0,24) et le rendu ne les
remonte pas.

## Mixkit (depuis le 7 octobre 2026)

Réactions des mascottes, sons d'objets et de lieux, ambiances des décors :
[Mixkit](https://mixkit.co/free-sound-effects/), Mixkit Sound Effects Free
License (https://mixkit.co/license/) : usage libre dans une vidéo, commercial
et réseaux sociaux compris, sans attribution ; le fichier ne se redistribue
pas seul, donc aucun n'est dans le dépôt. `scripts/sons.mjs` les télécharge
(`assets.mixkit.co/active_storage/sfx/<id>/<id>-preview.mp3`) et les prépare
dans `mx-<nom>.mp3` (MP3 : le ffmpeg livré avec Remotion n'encode pas le
Vorbis) : une réaction perd son silence de tête et crête à -1 dBTP, une
ambiance est coupée à 45 s, ramenée à -23 LUFS et fondue aux deux bouts. La
liste vit dans `bibliotheque.json` ; le workflow de rendu garde les fichiers
en cache. Un son qui recevrait une réclamation sort de la liste.

| Fichier | Son d'origine (identifiant Mixkit) | Type |
|---|---|---|
| `mx-pleure.mp3` | Lost kid sobbing (474) | réaction |
| `mx-pleure-2.mp3` | Creature sobbing in fear (464) | réaction |
| `mx-pleure-3.mp3` | Cartoon animal crying in pain (2) | réaction |
| `mx-rire.mp3` | Cartoon giggle (743) | réaction |
| `mx-rire-2.mp3` | Funny Giggling (2885) | réaction |
| `mx-rire-3.mp3` | Small cartoon character laughing (739) | réaction |
| `mx-cri.mp3` | Cartoon panic squeak (1010) | réaction |
| `mx-cri-2.mp3` | Vocal female pain scream (2202) | réaction |
| `mx-sursaut.mp3` | Cartoon surprise gasp (967) | réaction |
| `mx-sursaut-2.mp3` | Female surprised gasp (968) | réaction |
| `mx-sursaut-3.mp3` | Male astonished gasp (966) | réaction |
| `mx-ronfle.mp3` | Man strong snore (2478) | réaction |
| `mx-baille.mp3` | Cartoon vocal yawn (2268) | réaction |
| `mx-baille-2.mp3` | Yawn of adult man (2267) | réaction |
| `mx-soupir.mp3` | Deep child breathing and exhaling (2238) | réaction |
| `mx-soupir-2.mp3` | Person blows (2660) | réaction |
| `mx-grogne.mp3` | Angry cartoon kitty meow (94) | réaction |
| `mx-grogne-2.mp3` | Male waking up growl (1913) | réaction |
| `mx-croque.mp3` | Chewing something crunchy (2244) | réaction |
| `mx-croque-2.mp3` | Hungry man eating (2252) | réaction |
| `mx-aspire.mp3` | Soft slurp (3207) | réaction |
| `mx-aspire-2.mp3` | Mouth sipping a hot small drink (153) | réaction |
| `mx-miam.mp3` | Human male enjoy humm (129) | réaction |
| `mx-eternue.mp3` | Cartoon character cute sneeze (2210) | réaction |
| `mx-eternue-2.mp3` | Cartoon character sneeze (2209) | réaction |
| `mx-aie.mp3` | Ow exclamation of pain (2204) | réaction |
| `mx-aie-2.mp3` | Ah woman exclamation of pain (2205) | réaction |
| `mx-applaudit.mp3` | Animated small group applause (523) | réaction |
| `mx-smack.mp3` | Little cute kiss (2192) | réaction |
| `mx-smack-2.mp3` | Little double kiss (2189) | réaction |
| `mx-smack-3.mp3` | Quick funny kiss (2193) | réaction |
| `mx-boing.mp3` | Boing hit sound (2894) | réaction |
| `mx-splat.mp3` | Funny cartoon fast splat (2889) | réaction |
| `mx-trombone.mp3` | Trombone disappoint (744) | réaction |
| `mx-tambour.mp3` | Drum joke accent (579) | réaction |
| `mx-notification.mp3` | Message pop alert (2354) | réaction |
| `mx-notification-2.mp3` | Bubble pop up alert notification (2357) | réaction |
| `mx-notification-3.mp3` | Dry pop up notification alert (2356) | réaction |
| `mx-sonne.mp3` | Office telephone ring (1350) | réaction |
| `mx-reveil.mp3` | Classic short alarm (993) | réaction |
| `mx-reveil-2.mp3` | Alarm tone (996) | réaction |
| `mx-pose.mp3` | Dish placed in a wood table (2933) | réaction |
| `mx-pose-2.mp3` | Bowl put in table (2934) | réaction |
| `mx-tinte.mp3` | Wine glass clink (2936) | réaction |
| `mx-tinte-2.mp3` | A couple of glasses clink (154) | réaction |
| `mx-portiere.mp3` | Car door slam (1564) | réaction |
| `mx-clochette.mp3` | Store door bell ring (934) | réaction |
| `mx-sonnette.mp3` | Doorbell single press (333) | réaction |
| `mx-klaxon.mp3` | Small car horn (717) | réaction |
| `mx-klaxon-2.mp3` | Car horn (718) | réaction |
| `mx-demarre.mp3` | Short car ignition (1541) | réaction |
| `mx-pas-herbe.mp3` | Grass step (1920) | réaction |
| `mx-pas-herbe-2.mp3` | Heavy grass step (1922) | réaction |
| `mx-oiseau.mp3` | Double little bird chirp (21) | réaction |
| `mx-oiseau-2.mp3` | Little bird calling chirp (23) | réaction |
| `mx-oiseau-3.mp3` | Melodic songbird chirp (67) | réaction |
| `mx-grillon.mp3` | Small cricket screech (1781) | réaction |
| `mx-grillon-2.mp3` | Single cricket screech (1780) | réaction |
| `mx-hibou.mp3` | Owl shriek (2479) | réaction |
| `mx-tonnerre.mp3` | Distant thunder storm explosion (1292) | réaction |
| `mx-tonnerre-2.mp3` | Mid strength single thunder (1298) | réaction |
| `mx-battement.mp3` | Human single heart beat (490) | réaction |
| `mx-coussin.mp3` | Pillow soft hit (1897) | réaction |
| `mx-coussin-2.mp3` | Pillow hard hit (1896) | réaction |
| `mx-tape.mp3` | Smartphone typing (1393) | réaction |
| `mx-oiseaux.mp3` | Birds in forest loop (1239) | ambiance |
| `mx-foret.mp3` | Forest with birds singing (1235) | ambiance |
| `mx-grillons.mp3` | Summer night crickets loop (1789) | ambiance |
| `mx-circulation.mp3` | Urban city sounds and light car traffic (369) | ambiance |
| `mx-rue-nuit.mp3` | City traffic background ambience (2930) | ambiance |
| `mx-vagues.mp3` | Sea waves with birds loop (1185) | ambiance |
| `mx-brouhaha.mp3` | Restaurant crowd talking ambience (444) | ambiance |
| `mx-pluie.mp3` | Light rain loop (1253) | ambiance |
| `mx-vent.mp3` | Wind in the forest (1237) | ambiance |
| `mx-moteur.mp3` | Low drone engine hum (2745) | ambiance |
| `mx-cinema.mp3` | Antique movie projector hum (1443) | ambiance |
| `mx-feu.mp3` | Campfire crackles (1330) | ambiance |
| `mx-horloge.mp3` | Wall clock tick tock (1060) | ambiance |
