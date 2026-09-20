# V2 — lecture de la référence et décisions

Référence examinée visuellement avant toute modification : `assets/reference-target.jpg`.
Comparaison initiale : `tests/screenshots/desktop.png` (V1).

## Ce qui fait la force de la référence

Le monde dépasse très largement le chemin. Des falaises abruptes et fortement érodées entourent une vallée immense. Plusieurs familles de reliefs se succèdent derrière les appareils, séparées par des nuages. Des cascades relient les terrasses et la vallée. Des architectures habitées, minuscules en comparaison du paysage, rendent l’échelle lisible. Les arbres en fleurs donnent une taille humaine au premier plan. Les ombres bleues et les contours dorés des plateformes créent un contraste chaud/froid. La lumière rasante traverse les nuages et se prolonge dans l’eau. Le ciel, les massifs lointains et les contrebas sont aussi travaillés que les stations.

La V1 possédait la caméra, le ruban continu et la bonne structure de données, mais des collines douces, une eau presque au niveau du sol, des arbres simplifiés et une palette uniforme. Ajouter quelques accessoires aux stations n’aurait pas corrigé cet écart.

## Réponse V2 sur l’ensemble du monde

1. Un panorama original, généré d’après la référence, dessine le ciel et une vallée entière : falaises, érosion, pentes arborées, cascades, montagnes, brumes, jardins architecturaux et lac réfléchissant. Aucun appareil ou texte de la référence n’est copié dans ce panorama.
2. Des îlots détourés à plusieurs distances sont placés dans les coordonnées du monde autour de toute la trajectoire. Leur parallaxe et leur occlusion évoluent avec la caméra. Leur échelle et leur orientation varient.
3. Des nappes de brume, des bandes d’eau animées et des pavillons géométriques ajoutent des couches indépendantes. La surface du lac est abaissée de 36,7 unités par rapport à la V1.
4. Le ruban existant devient une passerelle métallique suspendue avec une rive bronze et une lumière continue. Les stations reçoivent une façade métallique, des filets lumineux, des incrustations radiales et des supports évasés.
5. L’environnement photographique est utilisé pour les reflets. L’éclairage sépare le soleil chaud et le remplissage bleu. Un halo sélectif est composé sur desktop, sans dépendance de post-traitement externe.
6. L’écran fictif d’Iris bénéficie d’une illustration originale. Elle n’écrase jamais un champ image/video défini dans `src/apps.js`.
7. Les couleurs de l’interface passent à l’ivoire et à l’or seulement lorsque la V2 est prête.

## Itérations visuelles réalisées

- Première intégration : richesse et altitude nettement améliorées, mais panorama trop recadré ; une grande partie du ciel disparaissait. Les écrans pastel et les supports coniques noirs paraissaient déconnectés du paysage.
- Deuxième intégration : cadrage de tout le panorama, soleil lisible, profil des supports affiné, écran Iris enrichi et diffusion lumineuse sur les bordures.
- Finition : anticrénelage du rendu enrichi, conservation de l’alpha du média Iris (la conversion JPEG donnait des zones blanches), angle des téléphones ajusté pour révéler la tranche.

## Compromis et limites restantes

Il s’agit d’un monde hybride 3D / 2,5D, pas d’une reconstitution intégralement géométrique de la référence. Le panorama lointain accompagne la direction de vue ; les falaises détourées sont des plans, et non des volumes inspectables à 360°. Cette technique est adaptée à la caméra guidée actuelle. Une caméra libre exigerait des modèles complets et des vues supplémentaires.

Les cascades associent photographie et écoulement shader. La brume utilise des sprites, pas une simulation volumétrique. Les reflets sont basés sur l’environnement ; ce ne sont pas des réflexions ray-tracées des appareils. Les îlots sont réutilisés avec des variations : une production finale gagnerait à disposer de plusieurs assets de falaise et de scènes propres à chaque application. Les cinq autres captures applicatives restent les illustrations Canvas remplaçables de la V1.

Le rendu se rapproche nettement de la référence par son monde, son altitude, sa palette, sa densité et son éclairage, mais n’atteint pas la fidélité de chaque matériau, reflet et détail d’une image précalculée.
