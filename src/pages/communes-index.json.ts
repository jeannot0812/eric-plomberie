import type { APIRoute } from 'astro';
import communesData from '../data/communes.json';

// Index compact pour la recherche de commune de la page d'accueil :
// [nom, slug, codes postaux]
export const GET: APIRoute = () => {
  const index = communesData.communes.map((c: any) => [c.name, c.slug, c.postalCodes.join(' ')]);
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' }
  });
};
