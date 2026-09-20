# ProdX0x — Un monde d’applications · V2 cinématique

Prototype indépendant enrichi : vallée monumentale au coucher du soleil, falaises fleuries, cascades, brume et passerelle suspendue. Les six créations restent de vrais appareils 3D parcourus par une caméra mobile. Aucun compte, aucune compilation, aucun service externe à l’exécution. Three.js r170 et les assets artistiques sont inclus localement. Le catalogue, les médias et les interactions de la V1 sont conservés.

## Lancer

Node.js 18 ou ultérieur est nécessaire. Aucune installation de dépendances n’est nécessaire pour consulter le prototype.

```sh
cd "/Volumes/Steve Pro BlackSSD/Dev/ProdX0x-Wonderland-3D/prodx0x-wonderland-prototype"
npm start
```

Ouvrir **http://localhost:4173**. Garder le terminal ouvert. `Ctrl+C` arrête le serveur.
Si le port est occupé : `PORT=4174 npm start`, puis http://localhost:4174.
Ne pas ouvrir index.html directement en file:// : les modules JavaScript nécessitent un serveur HTTP.

## Couche cinématique et repli

La V1 est créée immédiatement par `src/world.js`. Le module `src/cinematic.js` est ensuite importé dynamiquement ; une erreur d’import ne bloque pas le moteur. Deux assets locaux sont nécessaires à l’enrichissement : `assets/cinematic/valley.jpg` et `cliff-garden.png`. La scène enrichie n’est activée qu’après leur chargement réussi, dans un délai maximal de dix secondes. Avant cela, la V1 reste utilisable.

La V2 associe un panorama lointain, des îlots détourés positionnés à plusieurs profondeurs, des cascades animées, de la brume, de l’eau avec reflet d’environnement et des structures 3D. Les matériaux et l’éclairage du chemin existant sont adaptés au coucher du soleil. Le halo sélectif de `src/cinematic-bloom.js` est réservé au desktop disposant du rendu HDR requis ; son absence ne désactive pas le reste de la V2.

L’écran artistique d’Iris est facultatif, chargé après l’environnement, et ne remplace jamais un média défini par l’utilisateur dans `src/apps.js`. La génération Canvas reste disponible.

**Repli V1** si un asset critique ou le module V2 est indisponible, si la taille maximale de texture est inférieure à 2048, si le navigateur annonce au plus deux processeurs logiques ou si son économie de données est activée. La restauration d’un contexte WebGL perdu revient aussi vers la V1. Sans WebGL, le catalogue HTML d’origine reste disponible.

- V2 automatique : http://localhost:4173/
- V1 explicite : http://localhost:4173/?quality=basic
- V2 sans halo HDR : http://localhost:4173/?bloom=off

Le fichier `src/world-v1.js` conserve une copie de la logique visuelle avant intervention. Le repli actif utilise directement les objets V1 conservés dans la scène, sans rechargement ni réinitialisation du voyage.

Les détails de la comparaison sont dans [docs/V2-ART-DIRECTION.md](docs/V2-ART-DIRECTION.md), les tests et l’inventaire dans [docs/V2-VALIDATION.md](docs/V2-VALIDATION.md), les prompts dans [docs/V2-ASSET-PROMPTS.md](docs/V2-ASSET-PROMPTS.md).

## Voyager

- Molette, trackpad ou swipe vertical : avancer et reculer dans le paysage.
- Flèches, Page précédente/suivante et Espace : étape précédente/suivante.
- Home/End : première/dernière création.
- Points en bas ou « Les créations » : accès direct avec déplacement continu.
- « Découvrir » : présentation détaillée. Échap ferme la fiche ou le catalogue.
- En fin de parcours, le bouton en bas à gauche revient au début.

## Ajouter une application

Modifier **src/apps.js**. La première entrée du tableau est la première rencontrée. Ajouter la dernière création **en tête du tableau** : la passerelle, la durée du voyage, la navigation et les appareils s’adaptent au nombre d’entrées. Aucun tri par date ne remplace votre ordre.

```js
{
  id: 'ma-nouvelle-app',          // identifiant unique, facultatif
  name: 'Ma nouvelle app',
  device: 'iphone',              // iphone | ipad | mac | tv (ou appletv)
  status: 'development',         // development | available
  tagline: 'Une belle idée, devenue réalité.',
  subtitle: 'Le petit texte sous le nom',
  description: 'La présentation complète, visible dans la fiche.',
  technologies: ['SwiftUI', 'CloudKit'],
  color: '#d1dbaa',
  symbol: '✧',
  chapter: 'Un nouveau jardin',
  image: 'assets/ma-capture.jpg', // facultatif ; null = écran Canvas
  video: 'assets/ma-video.mp4',   // facultatif ; MP4 ou WebM
  link: null                    // ou https://… vers votre page
}
```

Les captures et vidéos remplissent l’écran avec un recadrage centré et une découpe aux coins de l’appareil. Préférer un média portrait pour iPhone/iPad, paysage pour Mac/Apple TV. Le smartphone de démonstration utilise un écran proche de 9:19,5 ; le Mac/TV, 16:10.

Les vidéos sont créées à l’approche de l’étape active, muettes, en boucle et `playsInline`. Elles se mettent en pause en quittant l’étape et quand l’onglet est caché. Une image sert de poster si fournie. Si le navigateur refuse l’autoplay, le poster ou l’écran généré reste visible et un geste utilisateur permet une nouvelle tentative. Un média absent conserve l’illustration générée. Des médias distants doivent autoriser CORS ; préférer les fichiers dans assets/.

## Conception et performances

- Caméra perspective réellement déplacée dans les coordonnées du monde ; courbes horizontales et variations d’altitude ; interpolation indépendante de la fréquence d’affichage.
- Géométrie de passerelle continue, eau animée par shader, reliefs, brume, arbres stylisés, arches et îlots.
- Appareils avec épaisseur, cadre, verre, boutons, Dynamic Island, clavier et support selon le type.
- Cadrage spécifique portrait mobile ; échelles adaptées aux appareils larges ; DPR limité à 1,5 mobile et 1,75 desktop.
- Géométries détaillées et textures des appareils conservées seulement à proximité (les étapes lointaines sont libérées). La structure légère du paysage est générée depuis le catalogue.
- Images chargées à proximité ; vidéos seulement à l’étape principale ; rendu suspendu en onglet masqué.
- `prefers-reduced-motion` supprime le flottement, l’animation de l’eau et les transitions CSS. Le voyage reste piloté par l’utilisateur ; les sauts de navigation n’utilisent pas le scroll animé.
- Catalogue utilisable si WebGL n’est pas disponible. HTML sémantique, boutons nommés, focus visible, dialogue natif et navigation au clavier.

Ce prototype emploie des reflets d’environnement et des ombres de contact simulées. Il ne prétend pas reproduire un rendu photographique avec réflexions temps réel. Les contenus et statuts présentés sont fictifs. Aucun lien App Store n’est inventé.

## Tests

```sh
npm test                 # validation des données, ordre, 30 entrées, erreurs
npm run test:browser     # serveur lancé + Google Chrome installé
npm run test:visual      # captures générales
npm run test:visual:v2   # captures V2 + V1, mesure de cadence
```

Playwright est une dépendance de développement uniquement. Après copie sur un autre Mac, `npm ci` installe les outils de test, sans être nécessaire pour lancer la page. Les tests vidéo fabriquent un court WebM de test dans le navigateur ; il n’est ni téléchargé ni publié.

Captures V2 : `tests/screenshots/v2/` (desktop, mobile, TV, Mac, iPad, repli V1 et mesure de cadence).

Captures initiales / générales : `tests/screenshots/desktop.png`, `mobile.png`, `tv.png`, `macbook.png`, `mac.png`, `ipad.png`.
Les tailles mobiles/tablettes sont émulées dans Chrome ; elles ne remplacent pas une validation sur un appareil iOS/Safari physique.

## Fichiers

- `index.html` — structure et éléments accessibles.
- `styles.css` — direction typographique, interface, responsive, mouvement réduit.
- `src/apps.js` — catalogue et validation.
- `src/main.js` — navigation, synchronisation du scroll, fiches et catalogue.
- `src/world.js` — paysage, caméra, passerelle, lumière et gestion des ressources.
- `src/devices.js` — fabrication des appareils et cycle de vie des médias.
- `src/screens.js` — illustrations Canvas et recadrage des textures.
- `src/three.module.js` — Three.js r170, bibliothèque incluse.
- `assets/README.md` — emplacement et consignes des futurs médias.
- `server.mjs` — serveur HTTP local, dont les requêtes partielles pour les vidéos.
- `package.json`, `package-lock.json` — commandes et dépendances de test.
- `playwright.config.js` — configuration de Chrome pour les tests.
- `tests/catalog.test.mjs` — tests des données.
- `tests/journey.spec.js` — tests d’intégration dans le navigateur.
- `tests/visual-check.mjs` — génération des captures.
- `tests/screenshots/*.png` — captures produites pendant la vérification.
- `THREE-LICENSE.txt` — licence de la bibliothèque.
- `.gitignore` — exclusions des dépendances et résultats temporaires.
- `README.md` — ce guide.

`node_modules/` et `test-results/` sont des dossiers générés par les outils, entièrement internes à ce prototype.

Les fichiers ajoutés et modifiés pour la V2 sont listés précisément dans `docs/V2-VALIDATION.md`.
