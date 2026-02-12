/**
 * Script pour télécharger et enrichir les données des communes d'Île-de-France
 * Source : data.gouv.fr - Code Officiel Géographique
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Départements d'Île-de-France
const IDF_DEPARTMENTS = ['75', '77', '78', '91', '92', '93', '94', '95'];

/**
 * Télécharge les données des communes depuis data.gouv.fr
 */
async function fetchCOGData() {
  console.log('📡 Téléchargement des données COG...');

  // URL de l'API data.gouv.fr pour les communes
  const url = 'https://geo.api.gouv.fr/communes?fields=nom,code,codesPostaux,codeDepartement,codeRegion,population,centre&format=json&zone=metro';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`✅ ${data.length} communes récupérées`);
    return data;
  } catch (error) {
    console.error('❌ Erreur lors du téléchargement:', error.message);
    throw error;
  }
}

/**
 * Filtre uniquement les communes d'Île-de-France
 */
function filterIDFCommunes(communes) {
  const idfCommunes = communes.filter(c =>
    IDF_DEPARTMENTS.includes(c.codeDepartement)
  );
  console.log(`🏙️  ${idfCommunes.length} communes en Île-de-France`);
  return idfCommunes;
}

/**
 * Génère un slug URL-friendly
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Détermine le type de commune basé sur la population
 */
function getCommuneType(population) {
  if (population > 50000) return 'urban';
  if (population > 10000) return 'suburban';
  return 'rural';
}

/**
 * Récupère les landmarks pour une commune (données simplifiées)
 */
function getLandmarks(name, code) {
  // Landmarks principaux (à enrichir manuellement pour plus de détails)
  const landmarkData = {
    'Paris': ['Tour Eiffel', 'Notre-Dame', 'Arc de Triomphe'],
    'Versailles': ['Château de Versailles', 'Parc de Versailles'],
    'Saint-Denis': ['Basilique de Saint-Denis', 'Stade de France'],
    'Nanterre': ['La Défense', 'Université Paris Nanterre'],
    'Boulogne-Billancourt': ['Parc de Saint-Cloud', 'Seine Musicale'],
    'Montreuil': ['Parc des Beaumonts', 'Hôtel de Ville'],
    'Créteil': ['Hôtel de Ville', 'Lac de Créteil'],
    'Argenteuil': ['Basilique Saint-Denis', 'Parc d\'Argenteuil'],
  };

  return landmarkData[name] || [`Centre-ville de ${name}`, `Mairie de ${name}`];
}

/**
 * Calcule la distance entre deux points GPS (formule de Haversine)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Trouve les communes voisines (5-10 plus proches)
 */
function findNeighbors(commune, allCommunes, maxNeighbors = 8) {
  const distances = allCommunes
    .filter(c => c.code !== commune.code)
    .map(c => ({
      code: c.code,
      distance: calculateDistance(
        commune.centre.coordinates[1],
        commune.centre.coordinates[0],
        c.centre.coordinates[1],
        c.centre.coordinates[0]
      )
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxNeighbors);

  return distances.map(d => d.code);
}

/**
 * Enrichit les données d'une commune
 */
function enrichCommune(commune, allCommunes) {
  const departmentNames = {
    '75': 'Paris',
    '77': 'Seine-et-Marne',
    '78': 'Yvelines',
    '91': 'Essonne',
    '92': 'Hauts-de-Seine',
    '93': 'Seine-Saint-Denis',
    '94': 'Val-de-Marne',
    '95': 'Val-d\'Oise'
  };

  return {
    id: commune.code,
    name: commune.nom,
    slug: generateSlug(commune.nom),
    postalCodes: commune.codesPostaux || [],
    department: {
      code: commune.codeDepartement,
      name: departmentNames[commune.codeDepartement]
    },
    population: commune.population || 0,
    coordinates: {
      lat: commune.centre?.coordinates[1] || 48.8566,
      lng: commune.centre?.coordinates[0] || 2.3522
    },
    neighbors: findNeighbors(commune, allCommunes),
    landmarks: getLandmarks(commune.nom, commune.code),
    type: getCommuneType(commune.population || 0)
  };
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Démarrage du script de récupération des données...\n');

  try {
    // 1. Télécharger les données COG
    const allCommunes = await fetchCOGData();

    // 2. Filtrer les communes d'Île-de-France
    const idfCommunes = filterIDFCommunes(allCommunes);

    // 3. Enrichir chaque commune
    console.log('🔧 Enrichissement des données...');
    const enrichedCommunes = idfCommunes.map(commune =>
      enrichCommune(commune, idfCommunes)
    );

    // 4. Créer l'objet final
    const data = {
      metadata: {
        total: enrichedCommunes.length,
        lastUpdate: new Date().toISOString(),
        source: 'geo.api.gouv.fr',
        region: 'Île-de-France',
        departments: IDF_DEPARTMENTS
      },
      communes: enrichedCommunes
    };

    // 5. Sauvegarder dans src/data/communes.json
    const outputPath = path.join(__dirname, '../src/data/communes.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

    console.log(`\n✅ Fichier généré : ${outputPath}`);
    console.log(`📊 Total : ${enrichedCommunes.length} communes`);

    // Statistiques
    const stats = {
      urban: enrichedCommunes.filter(c => c.type === 'urban').length,
      suburban: enrichedCommunes.filter(c => c.type === 'suburban').length,
      rural: enrichedCommunes.filter(c => c.type === 'rural').length
    };

    console.log('\n📈 Statistiques :');
    console.log(`   - Urbaines : ${stats.urban}`);
    console.log(`   - Périurbaines : ${stats.suburban}`);
    console.log(`   - Rurales : ${stats.rural}`);

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécution
main();
