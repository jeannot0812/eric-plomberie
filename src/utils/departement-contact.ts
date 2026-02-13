import departementsConfig from '../data/departements-config.json';

export interface DepartementContact {
  name: string;
  phone: string;
  phoneDisplay: string;
  email: string;
}

/**
 * Récupère les valeurs par défaut
 */
export function getDefaultContact() {
  const defaultConfig = departementsConfig['default' as keyof typeof departementsConfig];
  return defaultConfig as any;
}

/**
 * Récupère les informations de contact pour un département donné
 * Fusionne les valeurs par défaut avec les surcharges spécifiques au département
 */
export function getContactByDepartement(departementCode: string): DepartementContact {
  const defaultConfig = getDefaultContact();
  const deptConfig = departementsConfig[departementCode as keyof typeof departementsConfig];

  if (!deptConfig) {
    // Fallback sur Paris si département inconnu
    const parisConfig = departementsConfig['75' as keyof typeof departementsConfig];
    return {
      ...defaultConfig,
      ...parisConfig
    } as DepartementContact;
  }

  // Fusionner les valeurs par défaut avec les valeurs spécifiques du département
  return {
    ...defaultConfig,
    ...deptConfig
  } as DepartementContact;
}

/**
 * Récupère tous les départements (sans "default")
 */
export function getAllDepartements() {
  const defaultConfig = getDefaultContact();

  return Object.entries(departementsConfig)
    .filter(([code]) => code !== 'default')
    .map(([code, data]) => ({
      code,
      ...defaultConfig,
      ...data
    }));
}
