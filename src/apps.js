// L'ordre du tableau EST l'ordre du voyage. Ajouter une nouvelle création en tête.
// image et video : chemins relatifs à index.html. Les deux sont facultatifs.
export const apps = [
  { id:'iris', name:'Iris', device:'iphone', status:'soon', tagline:'Un jeu contrôlé par le regard.', subtitle:'Une nouvelle façon de jouer', description:'Des lueurs flottent dans le noir, et chacune attend son iris. Les regarder droit dessus les chasse : pour les guider, il faut poser les yeux à côté. La caméra TrueDepth estime la direction de votre regard, et tout est calculé sur l’appareil. Douze chapitres, 82 niveaux. Iris est un jeu ; il ne promet aucun effet de santé.', technologies:['SwiftUI','ARKit','Eye tracking'], color:'#d1dbaa', symbol:'◉', chapter:'Le jardin des possibles', image:null, video:null, link:'/iris/' },
  { id:'tidy-buddy', name:'Tidy Buddy', device:'iphone', status:'available', tagline:'Moins de désordre. Plus de légèreté.', subtitle:'Le quotidien, en plus léger', description:'Un compagnon bienveillant pour retrouver un intérieur serein. De petites routines, des objectifs à votre rythme et la satisfaction de faire de la place pour ce qui compte.', technologies:['SwiftUI','SwiftData','WidgetKit'], color:'#e8c1a7', symbol:'✳', chapter:'La clairière des petits rituels', image:'assets/cinematic/TiddyBuddy.jpg', video:null, link:null },
  { id:'gramgramtv', name:'GramGramTV', device:'tv', status:'available', tagline:'Les souvenirs méritent un grand écran.', subtitle:'Votre famille au premier rang', description:'Vos plus beaux souvenirs prennent vie dans le salon. Une galerie familiale pensée pour la télévision, avec des albums partagés et une navigation toute simple.', technologies:['tvOS','SwiftUI','CloudKit'], color:'#c8dace', symbol:'▧', chapter:'Le lagon des souvenirs', image:'assets/cinematic/gramgramtv-home.jpg', video:null, link:null },
  { id:'appverdict', name:'AppVerdict', device:'iphone', status:'development', tagline:'Vos prochaines découvertes commencent ici.', subtitle:'Le bon regard sur les apps', description:'Découvrez, comparez et gardez les applications qui vous ressemblent. AppVerdict réunit une sélection soignée et des avis clairs pour trouver vos prochains indispensables.', technologies:['SwiftUI','StoreKit'], color:'#cbc5df', symbol:'✧', chapter:'L’observatoire des idées', image:'assets/cinematic/AppVerdict.jpeg', video:null, link:null },
  { id:'myapp-hub', name:'MyApp Hub', device:'mac', status:'available', tagline:'Toutes vos idées ont trouvé leur place.', subtitle:'Votre atelier numérique', description:'Un espace paisible pour les développeurs indépendants. Retrouvez vos projets, leurs étapes et vos idées dans un atelier natif, conçu pour le Mac.', technologies:['macOS','SwiftUI','SwiftData'], color:'#bdd8d1', symbol:'⌘', chapter:'L’atelier au bord du monde', image:null, video:null, link:null },
  { id:'pausa', name:'Pausa', device:'ipad', status:'development', tagline:'Un peu de silence. Beaucoup d’inspiration.', subtitle:'Un carnet pour ralentir', description:'Un carnet contemplatif pour écrire, dessiner et rassembler vos inspirations. Une toile généreuse, des couleurs délicates et le plaisir de prendre son temps avec Apple Pencil.', technologies:['iPadOS','PencilKit','SwiftUI'], color:'#e3d5b3', symbol:'≈', chapter:'L’île des premières inspirations', image:null, video:null, link:null }
];
export const deviceNames = { iphone:'iPhone', ipad:'iPad', mac:'Mac', tv:'Apple TV', appletv:'Apple TV' };
export function validateApps(items) {
  if (!Array.isArray(items)) throw new TypeError('Le catalogue doit être un tableau.');
  const ids = new Set();
  return items.map((app, index) => {
    if (!app.name || !deviceNames[app.device]) throw new Error(`Application ${index + 1} : nom ou appareil invalide.`);
    const id = app.id || `app-${index}`;
    if(ids.has(id)) throw new Error(`Identifiant dupliqué : ${id}`);
    ids.add(id);
    return { color:'#d1dbaa', symbol:'✧', chapter:'Un nouvel horizon', tagline:'Une nouvelle création.', description:'', technologies:[], status:'development', ...app, id };
  });
}
