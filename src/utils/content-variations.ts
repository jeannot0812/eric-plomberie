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

interface DepartementContact {
  phone: string;
  phoneDisplay: string;
  email: string;
}

/**
 * Génère un titre H1 unique basé sur la population
 */
export function getHeroTitle(commune: Commune): string {
  if (commune.population > 100000) {
    return `Plombier Basé à ${commune.name} - Artisan Local`;
  } else if (commune.population > 20000) {
    return `Votre Plombier Local à ${commune.name}`;
  } else {
    return `Artisan Plombier Installé à ${commune.name}`;
  }
}

/**
 * Génère une meta description unique
 */
export function getMetaDescription(commune: Commune, contact: DepartementContact): string {
  const postalCode = commune.postalCodes[0] || '';
  return `Artisan plombier basé à ${commune.name} (${postalCode}). Intervention locale et rapide dans votre commune. Ouvert 7h30-18h, urgence 24/7. Devis gratuit ☎️ ${contact.phoneDisplay}`;
}

/**
 * Génère un titre de page complet
 */
export function getPageTitle(commune: Commune, contact?: DepartementContact): string {
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
    return `Votre artisan plombier de confiance installé à ${commune.name}`;
  } else if (commune.population > 10000) {
    return `Plombier local basé à ${commune.name} - Service de proximité`;
  } else {
    return `Artisan plombier de ${commune.name} au service des habitants`;
  }
}

/**
 * Génère une description de zone d'intervention avec landmarks
 */
export function getServiceAreaText(commune: Commune): string {
  const landmarks = commune.landmarks.slice(0, 2);
  if (landmarks.length > 0) {
    return `Installé à ${commune.name}, nous connaissons parfaitement votre commune. Intervention rapide près de ${landmarks.join(', ')} et dans tous les quartiers de ${commune.name}.`;
  }
  return `Basé à ${commune.name}, nous sommes votre plombier de proximité. Intervention rapide dans toute la commune et ses alentours immédiats.`;
}

/**
 * Sélectionne les témoignages à afficher (rotation déterministe)
 * Les locations sont remplacées par les villes voisines
 */
export function getTestimonials(communeId: string, testimonials: any[], neighborNames: string[] = [], count: number = 3): any[] {
  // Rotation déterministe basée sur l'ID de la commune
  const seed = parseInt(communeId.slice(-3)) || 0;
  const rotated = [...testimonials];

  // Rotation simple
  for (let i = 0; i < seed % testimonials.length; i++) {
    const item = rotated.shift();
    if (item) rotated.push(item);
  }

  // Sélectionner les témoignages
  const selected = rotated.slice(0, count);

  // Remplacer les locations par les villes voisines
  if (neighborNames.length > 0) {
    return selected.map((testimonial, index) => ({
      ...testimonial,
      location: neighborNames[index % neighborNames.length]
    }));
  }

  return selected;
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

  const title = `Votre artisan plombier basé à ${commune.name}`;

  const commonItems = [
    `Installé à ${commune.name} - connaissance parfaite du secteur`,
    'Horaires : 7h30-18h du lundi au samedi',
    'Service d\'urgence 24/7 disponible si besoin',
    'Intervention rapide dans votre commune',
    'Devis gratuit et transparent',
    'Artisan qualifié et assuré'
  ];

  const urbanItems = [
    `Basé à ${commune.name}, votre plombier de proximité`,
    'Spécialiste des immeubles et copropriétés',
    ...commonItems.slice(1)
  ];

  const suburbanItems = [
    `Installé à ${commune.name}, intervention locale`,
    'Expert des maisons individuelles et pavillons',
    ...commonItems.slice(1)
  ];

  return {
    title,
    items: isUrban ? urbanItems.slice(0, 6) : suburbanItems.slice(0, 6)
  };
}
