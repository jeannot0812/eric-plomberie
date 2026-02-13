import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { password, contacts } = data;

    // Vérifier le mot de passe
    if (password !== 'artisanplombier') {
      return new Response(JSON.stringify({ error: 'Mot de passe incorrect' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Récupérer les variables d'environnement
    const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
    const GITHUB_REPO = 'jeannot0812/eric-plomberie';

    if (!GITHUB_TOKEN) {
      return new Response(JSON.stringify({ error: 'Configuration manquante' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Préparer le contenu du fichier JSON
    const fileContent = JSON.stringify(contacts, null, 2);
    const base64Content = Buffer.from(fileContent).toString('base64');

    // Récupérer le SHA du fichier actuel (pour la mise à jour)
    const getFileResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/src/data/departements-config.json`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      }
    );

    let sha = '';
    if (getFileResponse.ok) {
      const fileData = await getFileResponse.json();
      sha = fileData.sha;
    }

    // Mettre à jour le fichier sur GitHub
    const updateResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/src/data/departements-config.json`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Mise à jour des contacts par département via admin\n\nCo-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>',
          content: base64Content,
          sha: sha || undefined,
          branch: 'master'
        })
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      console.error('GitHub API error:', error);
      return new Response(JSON.stringify({ error: 'Erreur lors de la mise à jour sur GitHub' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Modifications enregistrées! Le site sera redéployé dans 2-3 minutes.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
