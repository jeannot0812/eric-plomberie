import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataPath = join(__dirname, '..', 'src', 'data', 'communes.json');
const outputPath = join(__dirname, '..', 'urls.txt');

console.log('📄 Génération de toutes les URLs...\n');

// Lire les données des communes
const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
const communes = data.communes;

const domain = 'eric-plomberie.fr';

// Générer toutes les URLs
const urls = communes.map(commune =>
  `https://${domain}/${commune.slug}`
);

// Ajouter les pages principales
const mainPages = [
  `https://${domain}/`,
  `https://${domain}/services`,
  `https://${domain}/contact`,
];

const allUrls = [...mainPages, ...urls];

// Sauvegarder dans un fichier texte
writeFileSync(outputPath, allUrls.join('\n'), 'utf-8');

console.log(`✅ ${allUrls.length} URLs générées!`);
console.log(`📁 Fichier: urls.txt`);
console.log(`\nPremières URLs:\n${allUrls.slice(0, 10).join('\n')}\n...`);
