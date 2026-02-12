/**
 * Utilitaires pour générer du contenu unique par commune
 * Stratégie anti-duplicate content
 */

interface Commune {
  id: string;
  name: string;
  slug: string;
  postalCodes: string[];
  department: {
    code: string;
    name: string;
  };
  population: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  neighbors: string[];
  landmarks: string[];
  type: 'urban' | 'suburban' | 'rural';
}

/**
 * Génère un titre H1 unique basé sur la population
 */
export function getHeroTitle(commune: Commune): string {
  if (commune.population > 100000) {
    return `Plombier d'Urgence 24/7 à ${commune.name} - Intervention en 30min`;
  } else if (commune.population > 20000) {
    return `Votre Plombier à ${commune.name} - Dépannage et Installation`;
  } else {
    return `Plombier de Proximité à ${commune.name} - Service Personnalisé`;
  }
}

/**
 * Génère une meta description unique
 */
export function getMetaDescription(commune: Commune): string {
  const postalCode = commune.postalCodes[0] || '';
  return `Plombier professionnel à ${commune.name} (${postalCode}, ${commune.department.name}). Intervention rapide 30min. Dépannage urgence 24/7, fuite d'eau, débouchage. Devis gratuit ☎️ 01 XX XX XX XX`;
}

/**
 * Génère un titre de page complet
 */
export function getPageTitle(commune: Commune): string {
  const postalCode = commune.postalCodes[0] || '';
  return `Plombier ${commune.name} (${postalCode}) - Dépannage Urgence 24/7 | RDP`;
}

/**
 * Génère une description de service adaptée au type de commune
 */
export function getServiceDescription(commune: Commune, serviceType: string): string {
  const isUrban = commune.type === 'urban';

  const descriptions: Record<string, { urban: string; suburban: string }> = {
    'general': {
      urban: `Spécialiste de la plomberie en immeuble à ${commune.name}. Nous intervenons sur les immeubles anciens, haussmanniens et modernes.`,
      suburban: `Expert en plomberie de maison individuelle et pavillon à ${commune.name}. Intervention rapide sur tous types d'habitations.`
    },
    'fuite': {
      urban: `Détection et réparation de fuites d'eau dans les immeubles de ${commune.name}. Caméra thermique et intervention sans casse.`,
      suburban: `Recherche de fuites pour maisons et pavillons à ${commune.name}. Expertise jardin, piscine et assainissement.`
    }
  };

  return isUrban ? descriptions[serviceType].urban : descriptions[serviceType].suburban;
}

/**
 * Génère un message de social proof basé sur la population
 */
export function getSocialProof(commune: Commune): string {
  if (commune.population > 50000) {
    const thousands = Math.floor(commune.population / 1000);
    return `Plus de ${thousands}k habitants nous font confiance à ${commune.name}`;
  } else if (commune.population > 10000) {
    return `Service de confiance pour les ${commune.population.toLocaleString('fr-FR')} habitants de ${commune.name}`;
  } else {
    return `Service de proximité pour tous les habitants de ${commune.name}`;
  }
}

/**
 * Génère une description de zone d'intervention avec landmarks
 */
export function getServiceAreaText(commune: Commune): string {
  const landmarks = commune.landmarks.slice(0, 2);
  if (landmarks.length > 0) {
    return `Nous intervenons rapidement dans tout ${commune.name}, notamment près de ${landmarks.join(', ')}, et dans tous les quartiers environnants.`;
  }
  return `Nous intervenons rapidement dans tout ${commune.name} et ses environs.`;
}

/**
 * Sélectionne les témoignages à afficher (rotation déterministe)
 */
export function getTestimonials(communeId: string, testimonials: any[], count: number = 3): any[] {
  // Rotation déterministe basée sur l'ID de la commune
  const seed = parseInt(communeId.slice(-3)) || 0;
  const rotated = [...testimonials];

  // Rotation simple
  for (let i = 0; i < seed % testimonials.length; i++) {
    const item = rotated.shift();
    if (item) rotated.push(item);
  }

  return rotated.slice(0, count);
}

/**
 * Génère des keywords uniques par commune
 */
export function getKeywords(commune: Commune): string {
  const postalCodes = commune.postalCodes.slice(0, 3);
  const keywords = [
    `plombier ${commune.name}`,
    ...postalCodes.map(code => `plombier ${code}`),
    `dépannage plomberie ${commune.name}`,
    `fuite eau ${commune.name}`,
    `plombier urgence ${commune.name}`
  ];
  return keywords.join(', ');
}

/**
 * Sélectionne les FAQs adaptées au type de commune
 */
export function getRelevantFAQs(commune: Commune, faqData: any): any[] {
  const general = faqData.general || [];
  const typeSpecific = faqData[commune.type] || [];

  return [...general.slice(0, 5), ...typeSpecific.slice(0, 2)];
}

/**
 * Génère un texte unique pour la section "Pourquoi nous choisir"
 */
export function getWhyChooseUsText(commune: Commune): { title: string; items: string[] } {
  const isUrban = commune.type === 'urban';

  const title = isUrban
    ? `Pourquoi choisir nos services de plomberie à ${commune.name} ?`
    : `Votre plombier de confiance à ${commune.name}`;

  const commonItems = [
    'Disponibles 24h/24 et 7j/7 pour vos urgences',
    'Intervention rapide en 30 minutes',
    'Devis gratuit et transparent',
    'Artisans qualifiés et assurés',
    'Garantie sur toutes nos interventions'
  ];

  const urbanItems = [
    'Spécialistes des immeubles haussmanniens',
    'Expertise en copropriété',
    ...commonItems
  ];

  const suburbanItems = [
    'Experts maisons individuelles',
    'Connaissance du terrain local',
    ...commonItems
  ];

  return {
    title,
    items: isUrban ? urbanItems.slice(0, 6) : suburbanItems.slice(0, 6)
  };
}
