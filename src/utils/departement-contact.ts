import departementsConfig from '../data/departements-config.json';

export interface DepartementContact {
  name: string;
  phone: string;
  phoneDisplay: string;
  email: string;
}

/**
 * Récupère les informations de contact pour un département donné
 */
export function getContactByDepartement(departementCode: string): DepartementContact {
  const config = departementsConfig[departementCode as keyof typeof departementsConfig];

  if (!config) {
    // Fallback sur Paris si département inconnu
    return departementsConfig['75'];
  }

  return config;
}

/**
 * Récupère tous les départements
 */
export function getAllDepartements() {
  return Object.entries(departementsConfig).map(([code, data]) => ({
    code,
    ...data
  }));
}
