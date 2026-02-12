# 🚀 Système de Génération Automatique de Contenu SEO

## 📋 Vue d'ensemble

Ce système génère automatiquement **3 articles SEO par jour** pour chacune des **1 285 pages** du site, soit **3 855 articles/jour** pour maximiser le référencement Google.

### Objectifs
- **Positionner chaque page** en 1ère position Google sur "plombier + ville"
- **Contenu unique** pour éviter le duplicate content
- **Publication automatique** 3x/jour (matin, midi, soir)
- **Coût maîtrisé** : ~$10-20/jour avec Claude API

---

## 🏗️ Architecture

### 1. Frontend (Astro)
- **Component**: `src/components/sections/BlogSEO.astro`
- Chargement dynamique des articles via JavaScript
- Affiche les 3 articles les plus récents par commune
- Skeleton loading pendant le chargement

### 2. API Backend (Astro Endpoints)
- **Endpoint**: `src/pages/api/blog/[commune].json.ts`
- Récupère les articles depuis JSON
- Cache 5 minutes pour optimiser les performances

### 3. Données
- **Stockage**: `src/data/blog/{commune-slug}.json`
- Format JSON avec historique (max 10 articles/commune)
- Chaque fichier = tous les articles d'une commune

### 4. Génération (Claude API)
- **Script**: `scripts/generate-seo-content.mjs`
- Utilise Claude Sonnet 4 pour générer du contenu unique
- Rotation intelligente : chaque time slot traite un segment différent
- Cost-effective : ~$0.003/article

### 5. Automation (GitHub Actions)
- **Workflow**: `.github/workflows/generate-seo-content.yml`
- **Horaires** : 8h, 12h, 18h (heure Paris)
- Auto-commit et push des nouveaux articles

---

## 📊 Flux de Données

```
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions (cron: 8h, 12h, 18h)                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────────────────┐
│  Script: generate-seo-content.mjs                       │
│  - Charge 50 communes (rotation)                        │
│  - Appelle Claude API pour chaque commune               │
│  - Génère 1 article unique et optimisé SEO              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────────────────┐
│  Sauvegarde: src/data/blog/{commune}.json               │
│  - Ajoute le nouvel article                             │
│  - Garde les 10 derniers                                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────────────────┐
│  Git commit + push                                       │
│  - Auto-commit par GitHub Actions                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────────────────┐
│  Vercel auto-rebuild (optionnel)                        │
│  - Nouveau déploiement automatique                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────────────────┐
│  Frontend: BlogSEO.astro                                │
│  - Charge dynamiquement les 3 derniers articles         │
│  - API: /api/blog/{commune}.json                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Configuration

### 1. Ajouter la clé API Claude dans GitHub Secrets

1. Va sur GitHub → Ton repo → **Settings** → **Secrets and variables** → **Actions**
2. Clique sur **New repository secret**
3. Nom : `CLAUDE_API_KEY`
4. Valeur : Ta clé API Anthropic (ex: `sk-ant-api03-...`)

### 2. Variables d'environnement (optionnelles)

Tu peux personnaliser dans le workflow `.github/workflows/generate-seo-content.yml` :

```yaml
env:
  ARTICLES_PER_RUN: '50'    # Nombre d'articles par exécution (défaut: 50)
  TIME_SLOT: 'morning'      # morning, noon, ou evening
```

---

## 📝 Format des Articles

Chaque article généré suit cette structure :

```json
{
  "id": "paris-1er-1234567890",
  "communeSlug": "paris-1er",
  "communeName": "Paris 1er",
  "title": "Comment prévenir les fuites d'eau à Paris 1er ?",
  "excerpt": "Découvrez nos conseils d'experts pour éviter les problèmes de plomberie dans le 1er arrondissement.",
  "content": "<h3>Les causes fréquentes...</h3><p>...</p>",
  "keywords": [
    "plombier paris 1er",
    "fuite eau paris",
    "prévention plomberie",
    "dépannage urgence 75001",
    "artisan plombier"
  ],
  "category": "Prévention",
  "publishedAt": "2026-02-12T08:15:00.000Z",
  "timeSlot": "morning",
  "generatedBy": "Claude API"
}
```

---

## 🚦 Lancement Manuel

### Test local (1 article)

```bash
# Définir ta clé API
export CLAUDE_API_KEY="sk-ant-api03-..."

# Générer 1 article de test
export ARTICLES_PER_RUN=1
export TIME_SLOT=morning

# Lancer le script
node scripts/generate-seo-content.mjs
```

### Lancer via GitHub Actions (manuel)

1. Va sur GitHub → **Actions**
2. Sélectionne **Génération de Contenu SEO Automatique**
3. Clique sur **Run workflow**
4. Configure :
   - **Articles count** : 50 (ou moins pour tester)
   - **Time slot** : morning/noon/evening

---

## 📈 Rotation & Couverture

Le système utilise une **rotation intelligente** pour couvrir toutes les communes :

- **1 285 communes** au total
- **50 articles/exécution** (personnalisable)
- **3 exécutions/jour** = 150 articles/jour
- **Couverture complète** : 1285 ÷ 150 = ~9 jours pour tout couvrir
- **Ensuite recommence** la rotation

### Calcul de l'offset
```javascript
// Exemple : Jour 1, matin (slot 0)
offset = 0 × 50 = 0 → communes [0-49]

// Exemple : Jour 1, midi (slot 1)
offset = 1 × 50 = 50 → communes [50-99]

// Exemple : Jour 1, soir (slot 2)
offset = 2 × 50 = 100 → communes [100-149]

// Exemple : Jour 2, matin (slot 3)
offset = 3 × 50 = 150 → communes [150-199]
```

---

## 💰 Coûts Estimés

### Avec ARTICLES_PER_RUN=50 (défaut)

| Métrique | Valeur |
|----------|--------|
| **Articles/jour** | 150 (50 × 3 exécutions) |
| **Coût/article** | ~$0.003 |
| **Coût/jour** | ~$0.45 |
| **Coût/mois** | ~$13.50 |

### Si tu veux TOUT générer 3x/jour (mode ultra-agressif)

**⚠️ ATTENTION : Très coûteux !**

```yaml
ARTICLES_PER_RUN: '1285'  # Toutes les communes
```

| Métrique | Valeur |
|----------|--------|
| **Articles/jour** | 3 855 (1285 × 3) |
| **Coût/jour** | ~$11.50 |
| **Coût/mois** | ~$345 |

**Recommandation** : Commence avec `ARTICLES_PER_RUN=50` et ajuste selon les résultats SEO.

---

## 🎯 Stratégie SEO

### Pourquoi 3x/jour ?

1. **Fraîcheur du contenu** : Google privilégie les sites actifs
2. **Indexation rapide** : Plus de crawls Google
3. **Long-tail keywords** : Chaque article cible des variations de mots-clés
4. **E-E-A-T** : Démontre l'expertise et l'actualité

### Optimisations intégrées

- ✅ **Titre SEO** : Max 60 caractères, keyword principal
- ✅ **Meta description** : Max 160 caractères
- ✅ **Mots-clés locaux** : Ville mentionnée 3+ fois
- ✅ **Contenu unique** : Claude génère du contenu différent à chaque fois
- ✅ **HTML structuré** : `<h3>`, `<p>`, `<ul>`, `<li>`
- ✅ **Catégorisation** : Conseils, Actualités, Dépannage, Prévention
- ✅ **Variation thématique** : Fuites, débouchage, chauffage, installation...

---

## 📊 Monitoring & Analytics

### Vérifier la génération

```bash
# Voir combien de communes ont des articles
ls -l src/data/blog/ | wc -l

# Voir le dernier article généré pour Paris 1er
cat src/data/blog/paris-1er.json | head -50

# Vérifier les erreurs GitHub Actions
# → GitHub.com → Actions → Voir les logs
```

### Suivre les performances SEO

1. **Google Search Console**
   - Soumettre les nouvelles URLs
   - Suivre les impressions/clics par ville

2. **Google Analytics**
   - Trafic par page commune
   - Temps passé sur page
   - Taux de rebond

3. **Outils externes**
   - Ahrefs : Positions par mot-clé
   - SEMrush : Évolution du trafic
   - Screaming Frog : Crawl complet

---

## 🐛 Troubleshooting

### Erreur : "CLAUDE_API_KEY not found"
→ Ajoute le secret dans GitHub Settings → Secrets

### Erreur : "Rate limit exceeded"
→ Ajoute un délai entre les appels dans le script :
```javascript
await new Promise(resolve => setTimeout(resolve, 2000)); // 2s au lieu de 1s
```

### Erreur : "Build failed - Cannot read JSON"
→ Vérifie que les fichiers JSON sont valides :
```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('src/data/blog/paris-1er.json')))"
```

### Les articles ne s'affichent pas
1. Vérifie que l'API endpoint fonctionne : `/api/blog/paris-1er.json`
2. Regarde la console navigateur pour les erreurs JS
3. Vérifie que le fichier JSON existe dans `src/data/blog/`

---

## 🔄 Migration vers Supabase (Optionnel)

Si tu veux passer à une vraie base de données (au lieu de JSON) :

### 1. Créer un compte Supabase (gratuit)
https://supabase.com

### 2. Créer la table `articles`

```sql
CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  commune_slug TEXT NOT NULL,
  commune_name TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  category TEXT NOT NULL,
  published_at TIMESTAMP NOT NULL,
  time_slot TEXT NOT NULL,
  generated_by TEXT NOT NULL
);

CREATE INDEX idx_commune_slug ON articles(commune_slug);
CREATE INDEX idx_published_at ON articles(published_at DESC);
```

### 3. Modifier le script de génération

Remplacer `writeFileSync` par un insert Supabase :

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Sauvegarder l'article
const { error } = await supabase
  .from('articles')
  .insert([article]);
```

---

## 📚 Ressources

- **Claude API Docs** : https://docs.anthropic.com
- **Astro Endpoints** : https://docs.astro.build/en/core-concepts/endpoints/
- **GitHub Actions Cron** : https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule

---

## ✅ Checklist de mise en production

- [ ] Ajouter `CLAUDE_API_KEY` dans GitHub Secrets
- [ ] Tester la génération locale (1 article)
- [ ] Lancer manuellement via GitHub Actions (50 articles)
- [ ] Vérifier que les articles s'affichent sur le site
- [ ] Configurer Google Search Console
- [ ] Soumettre le sitemap mis à jour
- [ ] Activer les workflows cron (automatique à 8h, 12h, 18h)
- [ ] Suivre les performances SEO semaine 1
- [ ] Ajuster `ARTICLES_PER_RUN` selon budget

---

## 🎉 Résultat attendu

Après **1 mois** de génération automatique :

- **~4 500 articles SEO** publiés (150/jour × 30 jours)
- **Toutes les communes** ont du contenu frais multiple
- **Indexation Google** massive
- **Positionnement amélioré** sur les recherches locales
- **Trafic organique** en croissance

🚀 **Let's dominate Google local search !**
