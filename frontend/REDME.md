# Microgrid Monitoring Dashboard - Frontend

Dashboard React interactif pour la surveillance et l'analyse des données de microgrid en temps réel.

## 🚀 Fonctionnalités

### 📊 Visualisation des KPIs
- **Cartes KPI dynamiques** avec indicateurs de statut
- **Jauges interactives** pour l'autonomie et les métriques électriques
- **Alertes visuelles** pour les seuils critiques
- **Mise à jour en temps réel** toutes les 60 secondes

### 📈 Graphiques Interactifs
- **Graphiques de production** par source d'énergie (Battery, PV, FC)
- **Analyse consommation vs production** avec bilan énergétique
- **Distribution de puissance** avec métriques de performance
- **Métriques électriques** (tension, fréquence) avec seuils de qualité

### 🔍 Filtres Avancés
- **Sélection de période personnalisée**
- **Plages rapides prédéfinies** (aujourd'hui, hier, 7 jours, etc.)
- **Interface pliable** pour économiser l'espace
- **Persistance des filtres** pendant la session

### ⚡ Fonctionnalités Temps Réel
- **Rafraîchissement automatique** configurable
- **Indicateurs de connexion** et statut API
- **Gestion d'erreurs** avec retry automatique
- **Optimisations de performance**

## 📁 Structure du Projet

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/           # Composants React
│   │   ├── KPICards.js      # Cartes des KPIs
│   │   ├── ProductionChart.js # Graphiques de production
│   │   ├── ConsumptionChart.js # Graphiques de consommation
│   │   ├── PowerDistributionChart.js # Distribution de puissance
│   │   ├── ElectricalMetrics.js # Métriques électriques
│   │   ├── FilterPanel.js   # Panneau de filtres
│   │   ├── Header.js        # En-tête du dashboard
│   │   └── index.js         # Export des composants
│   ├── hooks/               # Hooks personnalisés
│   │   └── useDashboardData.js # Gestion des données
│   ├── utils/               # Utilitaires
│   │   └── apiConfig.js     # Configuration API
│   ├── App.js               # Composant principal
│   ├── App.css              # Styles globaux
│   └── index.js             # Point d'entrée
├── package.json
├── Dockerfile
└── README.md
```
```
frontend/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── KPICards.js          ✅ Créé
│   │   ├── ProductionChart.js    ✅ Existant
│   │   ├── ConsumptionChart.js   ✅ Existant  
│   │   ├── PowerDistributionChart.js ✅ Existant
│   │   ├── ElectricalMetrics.js  ✅ Existant
│   │   ├── FilterPanel.js        ✅ Complété
│   │   ├── Header.js             ✅ Existant
│   │   └── index.js              ✅ Existant
│   ├── hooks/
│   │   └── useDashboardData.js   ✅ Existant
│   ├── utils/
│   │   └── apiConfig.js          ✅ Créé (remplace api.js)
│   ├── App.js                    ✅ Existant
│   ├── App.css                   ✅ Existant
│   └── index.js                  ✅ Créé
├── package.json                  ✅ Créé
├── Dockerfile                    ✅ Existant
└── README.md                     ✅ Existant
```

## 🛠️ Installation et Développement

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation
```bash
cd frontend
npm install
```

### Développement Local
```bash
npm start
```
L'application sera disponible sur `http://localhost:3000`

### Build de Production
```bash
npm run build
```

## 🔗 APIs Utilisées

### Endpoints Django
- **GET** `/api/metrics/` - KPIs calculés avec filtres optionnels
- **GET** `/api/ingestion/data/` - Données temporelles brutes
- **GET** `/api/health/` - Vérification de santé

### Paramètres de Requête
```javascript
{
  start_date: "2024-01-01T00:00:00",  // ISO datetime
  end_date: "2024-01-02T23:59:59",    // ISO datetime
  limit: 1000                          // Limite pour données temporelles
}
```

## 📊 KPIs Affichés

| KPI | Description | Unité | Seuils |
|-----|-------------|-------|---------|
| Consommation Totale | Énergie consommée | kWh | - |
| Production Totale | Énergie produite | kWh | - |
| Taux d'Autonomie | Couverture locale | % | 🟢 >90%, 🟡 70-90%, 🔴 <70% |
| Pertes/Déficit | Énergie non couverte | kWh | 🟢 <5, 🟡 5-15, 🔴 >15 |
| Pic Consommation | Maximum instantané | kW | - |
| Pic Production | Maximum instantané | kW | - |
| Sources Renouvelables | Battery + PV / Total | % | 🟢 >80%, 🟡 50-80%, 🔴 <50% |
| Tension Moyenne | Voltage AC | V | 🟢 360-440V |
| Fréquence Moyenne | Fréquence AC | Hz | 🟢 49.5-50.5Hz |

## 🎨 Technologies Utilisées

### Core
- **React 18** - Framework frontend
- **Plotly.js** - Graphiques interactifs
- **CSS3** - Styles et animations

### Fonctionnalités
- **React Hooks** - Gestion d'état moderne
- **Fetch API** - Requêtes HTTP
- **CSS Grid/Flexbox** - Layouts responsives
- **CSS Variables** - Thème cohérent

## 🏗️ Déploiement Docker

### Build de l'Image
```bash
docker build -t microgrid-frontend .
```

### Avec Docker Compose
```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    volumes:
      - frontend_build:/usr/share/nginx/html
    restart: unless-stopped
```

## 📱 Design Responsive

- **Desktop** : Grille complète avec tous les graphiques
- **Tablet** : Adaptation des colonnes et espacement
- **Mobile** : Vue empilée avec composants optimisés

## 🔧 Configuration

### Variables d'Environnement
```env
REACT_APP_API_URL=http://localhost:8000/api  # URL de l'API Django
```

### Personnalisation des Intervalles
```javascript
// Dans App.js
const refreshInterval = 60000; // 60 secondes
const dataLimit = 1000; // Limite de points de données
```

## 🐛 Gestion des Erreurs

### Types d'Erreurs Gérées
- **Erreurs de connexion** - Retry automatique
- **Timeouts** - Configuration par endpoint
- **Erreurs HTTP** - Messages utilisateur explicites
- **Données manquantes** - Fallbacks et placeholders

### Debugging
```javascript
// Activer les logs détaillés
localStorage.setItem('debug', 'true');
```

## 🚀 Optimisations de Performance

- **Lazy loading** des composants lourds
- **Memoization** des calculs coûteux
- **Debouncing** des requêtes fréquentes
- **Cache** des données statiques
- **Compression** des assets

## 📈 Métriques de Performance

### Lighthouse Score Cible
- **Performance** : >90
- **Accessibility** : >95
- **Best Practices** : >90
- **SEO** : >85

### Bundle Size
- **Taille initiale** : <500KB gzipped
- **Taille totale** : <2MB

## 🔒 Sécurité

- **Validation** des données entrantes
- **Sanitization** des affichages
- **Headers de sécurité** via Nginx
- **HTTPS** en production

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous license MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Développé avec ❤️ pour la surveillance intelligente des microgrids**