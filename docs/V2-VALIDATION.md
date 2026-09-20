# V2 — validation et inventaire

## Résultats

- `npm test` : **4/4 tests de données réussis**.
- `npx playwright test` : **12/12 tests navigateur réussis**.
- `npm run test:visual:v2` : captures desktop, Apple TV, Mac, iPad, iPhone et repli V1 ; **aucune erreur JavaScript ni erreur console pendant le fonctionnement normal**.
- Les captures finales ont été ouvertes et examinées, après une deuxième itération sur le panorama, les supports, la diffusion lumineuse et l’écran Iris.
- Chrome headless sur ce Mac, viewport 1440 × 1000 : 85 intervalles `requestAnimationFrame` après stabilisation, médiane **16,7 ms**, 95e percentile **16,8 ms**, soit une cadence proche de 60 images/s dans ces conditions. Mesure courte, pas une garantie sur tous les GPU. Valeurs brutes : `tests/screenshots/v2/timings.json`.
- Formats contrôlés : 1440 × 1000, 1366 × 768, 768 × 1024, 390 × 844 et 844 × 390. Les formats mobiles sont émulés dans Chrome, sans prétendre à une validation physique Safari/iOS.

## Scénarios testés

| Cas | Résultat |
|---|---|
| Six applications et quatre types d’appareils | Navigation et fiches opérationnelles |
| Scroll, clavier, accès direct, retour au début | Opérationnels |
| Catalogue de trente applications | Ordre, navigation et fiche de la dernière entrée corrects |
| Vidéo WebM réelle | Autoplay muet, pause en quittant, reprise au retour |
| `prefers-reduced-motion` | Navigation utilisable, animations décoratives arrêtées |
| V2 avec assets locaux valides | Activation et affichage sans erreur |
| `?quality=basic` | Monde V1, navigation et fiches préservés |
| Image critique invalide | Retour V1 sans bloquer le catalogue |
| Module cinématique qui échoue à l’import | Moteur V1 et interactions disponibles |
| Navigateur annonçant deux processeurs logiques | V1, aucun téléchargement d’asset cinématique |
| Perte et restauration réelles de WebGL | Catalogue de secours, puis V1 et navigation |
| WebGL indisponible au démarrage | Catalogue HTML de secours original |
| Portrait/paysage | Bouton Découvrir dans le viewport, pas de débordement horizontal |

## Comparaison artistique

La référence a été inspectée avant tout changement visuel. Contrairement à la V1, l’horizon n’est plus vide et les reliefs ne se limitent plus à des collines lisses. Les couches lointaines contiennent montagnes, ciel, nuages, architecture et reflets. Les plans intermédiaires apportent falaises, cascades et jardins. Le chemin et les plateformes passent au-dessus d’un vide marqué, avec des reflets de coucher du soleil et des bordures lumineuses. Le traitement concerne donc le monde complet et non uniquement les stations.

Compromis détaillés dans `V2-ART-DIRECTION.md` : monde 3D/2,5D guidé, falaises réutilisées, cascades et brume simulées, reflets d’environnement et non ray tracing, cinq écrans applicatifs encore illustrés par Canvas.

## Fichiers modifiés

- `src/world.js` — branchement dynamique de la couche V2, conservation/restauration des objets V1, rendu et nettoyage.
- `src/devices.js` — remplacement facultatif et réversible du seul écran de démonstration, sans priorité sur les médias du catalogue.
- `styles.css` — palette V2, contrastes, typographie et variantes responsives conditionnelles.
- `package.json`, `package-lock.json` — version 2.0.0 et commande de captures V2 ; aucune nouvelle dépendance.
- `README.md` — lancement, fonctionnement de l’enrichissement, repli et documents associés.
- `tests/screenshots/macbook.png` — régénéré par le test responsive existant.

## Fichiers créés

### Moteur

- `src/cinematic.js`
- `src/cinematic-bloom.js`
- `src/world-v1.js` — copie de référence de la V1 avant modification.

### Assets

- `assets/cinematic/valley-original.png`
- `assets/cinematic/valley.jpg`
- `assets/cinematic/cliff-garden.png`
- `assets/cinematic/iris-screen-original.png`
- `assets/cinematic/iris-screen.jpg` — essai JPEG conservé, non utilisé.
- `assets/cinematic/README.md`

### Harness et captures

- `tests/cinematic.spec.js`
- `tests/cinematic-visual.mjs`
- `tests/screenshots/v2/desktop.png`
- `tests/screenshots/v2/mobile.png`
- `tests/screenshots/v2/tv.png`
- `tests/screenshots/v2/mac.png`
- `tests/screenshots/v2/ipad.png`
- `tests/screenshots/v2/fallback.png`
- `tests/screenshots/v2/timings.json`

### Documentation

- `docs/V2-ART-DIRECTION.md`
- `docs/V2-ASSET-PROMPTS.md`
- `docs/V2-VALIDATION.md`

`test-results/` contient également les résultats temporaires générés par Playwright. `src/apps.js`, le routage des interactions dans `src/main.js`, les écrans Canvas d’origine, le serveur local, la bibliothèque Three.js et l’image de référence sont conservés sans modification dans cette V2.
