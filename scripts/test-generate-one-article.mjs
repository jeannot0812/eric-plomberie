import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || 'VOTRE_CLE_API';

// Initialiser le client Claude
const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
});

// Charger les communes
const dataPath = join(__dirname, '..', 'src', 'data', 'communes.json');
const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
const communes = data.communes;

// Prendre Paris 1er pour le test
const commune = communes.find(c => c.slug === 'paris-1er') || communes[0];

console.log('🧪 Test de génération d\'article SEO');
console.log(`📍 Commune: ${commune.name}\n`);

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
    console.log('⏳ Génération en cours avec Claude API...\n');

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
    console.error(`❌ Erreur:`, error.message);
    return null;
  }
}

// Fonction pour sauvegarder un article
function saveArticle(commune, article) {
  const blogDir = join(__dirname, '..', 'src', 'data', 'blog');

  // Créer le dossier si nécessaire
  if (!existsSync(blogDir)) {
    mkdirSync(blogDir, { recursive: true });
  }

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

  console.log(`✅ Sauvegardé dans: ${filePath}\n`);
}

// Exécuter
async function main() {
  const article = await generateArticle(commune, 'morning');

  if (article) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📰 ARTICLE GÉNÉRÉ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📌 Titre: ${article.title}`);
    console.log(`📝 Excerpt: ${article.excerpt}`);
    console.log(`🏷️  Catégorie: ${article.category}`);
    console.log(`🔑 Keywords: ${article.keywords.join(', ')}`);
    console.log(`📅 Publié: ${new Date(article.publishedAt).toLocaleString('fr-FR')}`);
    console.log(`\n💾 ID: ${article.id}\n`);

    // Afficher un extrait du contenu
    const contentPreview = article.content.substring(0, 200).replace(/<[^>]*>/g, '');
    console.log(`📄 Contenu (extrait):\n${contentPreview}...\n`);

    saveArticle(commune, article);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Test réussi !');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('👉 Visualise l\'article sur: http://localhost:4323/communes/paris-1er');
    console.log('👉 API endpoint: http://localhost:4323/api/blog/paris-1er.json\n');
  } else {
    console.log('❌ Échec de la génération\n');
  }
}

main().catch(console.error);
