import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || 'VOTRE_CLE_API';
const ARTICLES_PER_RUN = parseInt(process.env.ARTICLES_PER_RUN || '50'); // Nombre d'articles par exécution
const TIME_SLOT = process.env.TIME_SLOT || 'morning'; // morning, noon, evening

// Initialiser le client Claude
const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
});

// Charger les communes
const dataPath = join(__dirname, '..', 'src', 'data', 'communes.json');
const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
const communes = data.communes;

console.log(`🚀 Génération de contenu SEO - ${TIME_SLOT}`);
console.log(`📊 ${communes.length} communes au total`);
console.log(`🎯 Génération de ${ARTICLES_PER_RUN} articles\n`);

// Fonction pour générer un article SEO via Claude
async function generateArticle(commune, timeSlot) {
  const prompt = `Tu es un expert SEO spécialisé en plomberie. Génère un article de blog optimisé SEO pour un plombier intervenant à ${commune.name} (${commune.department.name}).

CONTEXTE:
- Commune: ${commune.name}
- Population: ${commune.population} habitants
- Type: ${commune.type || 'urbain'}
- Départment: ${commune.department.name}

OBJECTIF SEO:
- Positionner la page sur "${commune.name} + plombier/plomberie"
- Créer du contenu unique et utile
- Intégrer naturellement les mots-clés locaux
- Apporter de la valeur aux lecteurs

MOMENT DE PUBLICATION: ${timeSlot === 'morning' ? 'Matin (8h-10h)' : timeSlot === 'noon' ? 'Midi (12h-14h)' : 'Soir (18h-20h)'}

Génère un article au format JSON avec cette structure exacte:
{
  "title": "Titre accrocheur et optimisé SEO (max 60 caractères)",
  "excerpt": "Résumé court et impactant (max 160 caractères)",
  "content": "Contenu complet de l'article en HTML (500-700 mots). Utilise des <h3>, <p>, <ul>, <li>. Parle de problèmes locaux de plomberie, conseils pratiques, prévention, etc.",
  "keywords": ["mot-clé 1", "mot-clé 2", "mot-clé 3", "mot-clé 4", "mot-clé 5"],
  "category": "Conseils" ou "Actualités" ou "Dépannage" ou "Prévention"
}

IMPORTANT:
- Mentionne ${commune.name} au moins 3 fois naturellement
- Utilise un ton professionnel mais accessible
- Inclus des conseils pratiques actionnables
- Évite le contenu générique, sois spécifique à la commune
- Varie les sujets: fuites, débouchage, chauffage, installation, prévention, etc.

Réponds UNIQUEMENT avec le JSON, sans markdown ni explication.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parser le JSON
    const articleData = JSON.parse(content);

    // Ajouter des métadonnées
    return {
      id: `${commune.slug}-${Date.now()}`,
      communeSlug: commune.slug,
      communeName: commune.name,
      ...articleData,
      publishedAt: new Date().toISOString(),
      timeSlot: timeSlot,
      generatedBy: 'Claude API'
    };

  } catch (error) {
    console.error(`❌ Erreur génération article pour ${commune.name}:`, error.message);
    return null;
  }
}

// Fonction pour sauvegarder un article
function saveArticle(commune, article) {
  const blogDir = join(__dirname, '..', 'src', 'data', 'blog');
  const filePath = join(blogDir, `${commune.slug}.json`);

  let articles = [];

  // Charger les articles existants
  if (existsSync(filePath)) {
    const existing = readFileSync(filePath, 'utf-8');
    articles = JSON.parse(existing);
  }

  // Ajouter le nouvel article
  articles.unshift(article);

  // Garder seulement les 10 derniers articles
  articles = articles.slice(0, 10);

  // Sauvegarder
  writeFileSync(filePath, JSON.stringify(articles, null, 2), 'utf-8');
}

// Fonction principale
async function main() {
  const startTime = Date.now();
  let generated = 0;
  let errors = 0;

  // Déterminer quelles communes traiter (on fait une rotation)
  const batchSize = ARTICLES_PER_RUN;
  const offset = getOffsetForTimeSlot(TIME_SLOT);
  const communesToProcess = communes.slice(offset, offset + batchSize);

  console.log(`📝 Traitement de ${communesToProcess.length} communes (offset: ${offset})\n`);

  for (const commune of communesToProcess) {
    try {
      console.log(`⏳ Génération pour ${commune.name}...`);

      const article = await generateArticle(commune, TIME_SLOT);

      if (article) {
        saveArticle(commune, article);
        generated++;
        console.log(`✅ ${commune.name} - "${article.title}"`);
      } else {
        errors++;
      }

      // Pause pour respecter les rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`❌ ${commune.name}:`, error.message);
      errors++;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n✨ Génération terminée en ${duration}s`);
  console.log(`✅ ${generated} articles générés`);
  console.log(`❌ ${errors} erreurs\n`);

  // Estimer le coût
  const estimatedCost = (generated * 0.003).toFixed(2); // ~$0.003 par article
  console.log(`💰 Coût estimé: $${estimatedCost}\n`);
}

// Fonction pour déterminer l'offset en fonction du time slot
function getOffsetForTimeSlot(timeSlot) {
  const totalCommunes = communes.length;
  const batchSize = ARTICLES_PER_RUN;

  // Rotation: chaque time slot traite un segment différent
  const slotsPerDay = 3;
  const currentDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

  let slotIndex = 0;
  if (timeSlot === 'morning') slotIndex = 0;
  else if (timeSlot === 'noon') slotIndex = 1;
  else if (timeSlot === 'evening') slotIndex = 2;

  const totalSlots = Math.ceil(totalCommunes / batchSize);
  const currentSlot = (currentDay * slotsPerDay + slotIndex) % totalSlots;

  return currentSlot * batchSize;
}

// Exécuter
main().catch(console.error);
