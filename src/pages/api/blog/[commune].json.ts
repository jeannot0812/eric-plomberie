import type { APIRoute } from 'astro';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const GET: APIRoute = async ({ params }) => {
  const { commune } = params;

  if (!commune) {
    return new Response(JSON.stringify({ error: 'Commune manquante' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Chemin vers le fichier JSON des articles
    const articlesPath = join(process.cwd(), 'src', 'data', 'blog', `${commune}.json`);

    // Vérifier si le fichier existe
    if (!existsSync(articlesPath)) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache 5 minutes
        }
      });
    }

    // Lire les articles
    const articlesData = readFileSync(articlesPath, 'utf-8');
    const articles = JSON.parse(articlesData);

    // Trier par date de publication (plus récent en premier)
    const sortedArticles = articles
      .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 3); // Prendre les 3 plus récents

    return new Response(JSON.stringify(sortedArticles), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache 5 minutes
      }
    });

  } catch (error) {
    console.error('Erreur lecture articles:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Générer les routes statiques pour toutes les communes
export async function getStaticPaths() {
  // Import dynamique pour éviter les erreurs de build
  const communesData = await import('../../../data/communes.json');
  const communes = communesData.default.communes;

  return communes.map((commune: any) => ({
    params: { commune: commune.slug }
  }));
}
