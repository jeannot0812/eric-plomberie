/**
 * Script pour ajouter les 20 arrondissements de Paris
 */

const fs = require('fs');
const path = require('path');

// Coordonnées GPS approximatives du centre de chaque arrondissement
const arrondissementsData = [
  { num: 1, lat: 48.8606, lng: 2.3376, landmarks: ["Louvre", "Palais Royal"] },
  { num: 2, lat: 48.8693, lng: 2.3417, landmarks: ["Bourse", "Opéra Comique"] },
  { num: 3, lat: 48.8630, lng: 2.3633, landmarks: ["Marais", "Place des Vosges"] },
  { num: 4, lat: 48.8540, lng: 2.3590, landmarks: ["Notre-Dame", "Île de la Cité"] },
  { num: 5, lat: 48.8462, lng: 2.3514, landmarks: ["Panthéon", "Jardin des Plantes"] },
  { num: 6, lat: 48.8500, lng: 2.3308, landmarks: ["Saint-Germain-des-Prés", "Luxembourg"] },
  { num: 7, lat: 48.8568, lng: 2.3106, landmarks: ["Tour Eiffel", "Invalides"] },
  { num: 8, lat: 48.8737, lng: 2.3117, landmarks: ["Champs-Élysées", "Arc de Triomphe"] },
  { num: 9, lat: 48.8768, lng: 2.3387, landmarks: ["Opéra Garnier", "Galeries Lafayette"] },
  { num: 10, lat: 48.8760, lng: 2.3617, landmarks: ["Gare du Nord", "Gare de l'Est"] },
  { num: 11, lat: 48.8594, lng: 2.3803, landmarks: ["Bastille", "Place de la République"] },
  { num: 12, lat: 48.8412, lng: 2.3885, landmarks: ["Gare de Lyon", "Bercy"] },
  { num: 13, lat: 48.8322, lng: 2.3561, landmarks: ["Bibliothèque Nationale", "Place d'Italie"] },
  { num: 14, lat: 48.8339, lng: 2.3270, landmarks: ["Montparnasse", "Catacombes"] },
  { num: 15, lat: 48.8421, lng: 2.2965, landmarks: ["Tour Montparnasse", "Parc André Citroën"] },
  { num: 16, lat: 48.8637, lng: 2.2769, landmarks: ["Trocadéro", "Bois de Boulogne"] },
  { num: 17, lat: 48.8873, lng: 2.3147, landmarks: ["Batignolles", "Parc Monceau"] },
  { num: 18, lat: 48.8927, lng: 2.3447, landmarks: ["Montmartre", "Sacré-Cœur"] },
  { num: 19, lat: 48.8838, lng: 2.3820, landmarks: ["Buttes-Chaumont", "La Villette"] },
  { num: 20, lat: 48.8648, lng: 2.3988, landmarks: ["Père Lachaise", "Belleville"] }
];

// Voisins de chaque arrondissement (IDs)
const neighbors = {
  1: ["75102", "75104", "75106", "75107", "75108"],
  2: ["75101", "75103", "75109", "75110"],
  3: ["75102", "75104", "75110", "75111"],
  4: ["75101", "75103", "75105", "75106", "75111", "75112"],
  5: ["75104", "75106", "75112", "75113", "75114"],
  6: ["75101", "75104", "75105", "75107", "75114", "75115"],
  7: ["75101", "75106", "75108", "75115", "75116"],
  8: ["75101", "75107", "75109", "75116", "75117"],
  9: ["75102", "75108", "75110", "75117", "75118"],
  10: ["75102", "75103", "75109", "75111", "75118", "75119"],
  11: ["75103", "75104", "75110", "75112", "75119", "75120"],
  12: ["75104", "75105", "75111", "75113", "75120"],
  13: ["75105", "75112", "75114"],
  14: ["75105", "75106", "75113", "75115"],
  15: ["75106", "75107", "75114", "75116"],
  16: ["75107", "75108", "75115", "75117"],
  17: ["75108", "75109", "75116", "75118"],
  18: ["75109", "75110", "75117", "75119"],
  19: ["75110", "75111", "75118", "75120"],
  20: ["75111", "75112", "75119"]
};

// Lire le fichier communes.json
const communesPath = path.join(__dirname, '..', 'src', 'data', 'communes.json');
const data = JSON.parse(fs.readFileSync(communesPath, 'utf8'));

// Retirer l'ancienne entrée Paris
const parisIndex = data.communes.findIndex(c => c.id === '75056');
if (parisIndex !== -1) {
  data.communes.splice(parisIndex, 1);
  console.log('✓ Ancienne entrée Paris supprimée');
}

// Créer les 20 arrondissements
const newArrondissements = arrondissementsData.map(arr => {
  const num = arr.num;
  const postalCode = `750${num.toString().padStart(2, '0')}`;
  const id = `751${num.toString().padStart(2, '0')}`;

  // Nom de l'arrondissement
  let name;
  if (num === 1) name = "Paris 1er";
  else name = `Paris ${num}${num === 1 ? 'er' : 'e'}`;

  return {
    id: id,
    name: name,
    slug: `paris-${num}${num === 1 ? 'er' : 'e'}`,
    postalCodes: [postalCode],
    department: {
      code: "75",
      name: "Paris"
    },
    population: Math.floor(2103778 / 20), // Population divisée par 20
    coordinates: {
      lat: arr.lat,
      lng: arr.lng
    },
    neighbors: neighbors[num] || [],
    landmarks: arr.landmarks,
    type: "urban"
  };
});

// Ajouter les arrondissements au fichier
data.communes.push(...newArrondissements);

// Trier par ID pour garder une structure organisée
data.communes.sort((a, b) => a.id.localeCompare(b.id));

// Sauvegarder
fs.writeFileSync(communesPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`✓ ${newArrondissements.length} arrondissements de Paris ajoutés`);
console.log(`✓ Total de communes : ${data.communes.length}`);
console.log('\nArrondissements créés :');
newArrondissements.forEach(arr => {
  console.log(`  - ${arr.name} (${arr.postalCodes[0]})`);
});
