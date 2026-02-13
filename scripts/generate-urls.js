import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lire le fichier communes.json
const communesPath = path.join(__dirname, '../src/data/communes.json');
const communes = JSON.parse(fs.readFileSync(communesPath, 'utf-8'));

// URL de base du site
const baseUrl = 'https://reparation-de-plomberie-steel.vercel.app';

// Créer la liste des URLs
const urls = [];

// Ajouter les pages principales
urls.push(baseUrl); // Homepage
urls.push(`${baseUrl}/mentions-legales`);

// Ajouter toutes les pages de communes
communes.communes.forEach(commune => {
  urls.push(`${baseUrl}/communes/${commune.slug}`);
});

// Générer le contenu du fichier
const urlsContent = urls.join('\n');

// Écrire dans urls-list.txt à la racine
const outputPath = path.join(__dirname, '../urls-list.txt');
fs.writeFileSync(outputPath, urlsContent, 'utf-8');

console.log(`✅ Fichier généré : ${outputPath}`);
console.log(`📊 Total URLs : ${urls.length}`);
console.log(`   - Homepage : 1`);
console.log(`   - Mentions légales : 1`);
console.log(`   - Communes : ${communes.communes.length}`);
