# Procrastinator

Application de gestion de tâches basée sur une architecture microservices moderne avec Vue.js/Nuxt 4 et Node.js.

## 🚀 Fonctionnalités

- ✅ **Authentification complète** - Inscription, connexion, gestion des sessions JWT
- ✅ **Gestion des utilisateurs** - CRUD complet avec rôles et permissions
- ✅ **API REST sécurisée** - Endpoints documentés avec validation complète
- ✅ **Interface moderne** - Frontend Nuxt 4 avec TypeScript et Vue 3
- ✅ **Base de données MongoDB** - Stockage persistant avec indexation optimisée
- ✅ **Architecture microservices** - Services découplés avec reverse proxy Caddy
- ✅ **Développement Docker** - Environnement complet containerisé

## 🏗️ Architecture

### Structure du projet
```
procrastinator/
├── frontend/                 # Application Nuxt v4
│   ├── app/                 # Pages, composants, layouts
│   ├── server/              # API Nitro intégrée
│   └── assets/              # Ressources statiques
├── services/
│   └── auth-service/        # Service d'authentification
│       ├── src/
│       │   ├── controllers/ # Logique métier
│       │   ├── models/      # Modèles de données
│       │   ├── routes/      # Définition des routes
│       │   ├── types/       # Types TypeScript
│       │   └── utils/       # Utilitaires (JWT, etc.)
│       └── dist/            # Code compilé
├── infra/
│   ├── caddy/               # Configuration reverse proxy
│   └── mongo/               # Scripts d'initialisation MongoDB
├── docker-compose.dev.yml   # Configuration développement
└── APIDOG.md               # Documentation API complète
```

### Technologies
- **Frontend** : Nuxt v4, Vue 3, TypeScript, @nuxt/ui, TailwindCSS
- **Backend** : Node.js, Express, TypeScript, MongoDB, JWT
- **Infrastructure** : Docker, Caddy, MongoDB 7.0
- **Développement** : pnpm workspaces, tsx, ESM modules

## 📋 Prérequis

- **Node.js** (version 22+)
- **pnpm** (gestionnaire de packages)
- **Docker** et **Docker Compose**
- **Git**

## 🚀 Installation et Démarrage

### 1. Cloner le projet
```bash
git clone <repository-url>
cd procrastinator
```

### 2. Installer pnpm (si nécessaire)
```bash
npm install -g pnpm
```

### 3. Installer les dépendances
```bash
pnpm install
```

### 4. Démarrer l'environnement de développement
```bash
# Lance tous les services via Docker
pnpm dev
```

Cette commande démarre :
- 🐳 **MongoDB** sur le port 27017
- 🔐 **Auth Service** (API d'authentification)
- 🎨 **Frontend Nuxt** 
- 🔀 **Caddy** (reverse proxy) sur le port 80
- 🔧 **Caddy Admin API** sur le port 2019

## 🌐 Accès aux services

| Service | URL | Description |
|---------|-----|-------------|
| **Application principale** | http://localhost | Interface utilisateur Nuxt |
| **API d'authentification** | http://localhost/api/auth | Endpoints REST |
| **Caddy Admin API** | http://localhost:2019 | Configuration et monitoring |
| **MongoDB** | localhost:27017 | Base de données (accès direct) |

## 🔐 Authentification et Test

### Compte administrateur par défaut
Un compte admin est créé automatiquement au démarrage :
- **Email** : `admin@procrastinator.com`
- **Mot de passe** : `admin123`
- **Rôle** : `admin`

### Test des endpoints API

#### 1. Connexion administrateur
```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@procrastinator.com",
    "password": "admin123"
  }'
```

#### 2. Créer un nouvel utilisateur
```bash
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### 3. Récupérer la liste des utilisateurs (admin)
```bash
curl -X GET "http://localhost/api/auth/users?page=1&limit=10" \
  -H "Authorization: Bearer <YOUR_ADMIN_JWT_TOKEN>"
```

#### 4. Statistiques utilisateurs
```bash
curl -X GET "http://localhost/api/auth/users/stats" \
  -H "Authorization: Bearer <YOUR_ADMIN_JWT_TOKEN>"
```

📖 **Documentation API complète** : Consultez le fichier [APIDOG.md](APIDOG.md) pour tous les endpoints disponibles.

## 🛠️ Développement

### Commandes utiles
```bash
# Démarrer les services
pnpm dev

# Arrêter les services
pnpm dev-down

# Construire tous les packages
pnpm build

# Nettoyer les builds
pnpm clean

# Formater le code
pnpm format
```

### Structure des services

#### Auth Service (Node.js + Express + MongoDB)
- **CRUD utilisateurs complet** avec validation
- **Authentification JWT** sécurisée
- **Gestion des rôles** (user, admin, moderator)
- **API REST** documentée avec types TypeScript
- **Sécurité** : Rate limiting, CORS, Helmet

#### Frontend (Nuxt 4 + Vue 3)
- **Server-Side Rendering** avec Nuxt
- **TypeScript** strict
- **@nuxt/ui** pour les composants
- **TailwindCSS** v4 pour le styling
- **Hot reload** en développement

### Base de données MongoDB
- **Collections** : users, tasks, sessions
- **Index automatiques** pour les performances
- **Validation des schémas** côté application
- **Connexion sécurisée** avec utilisateur dédié

## 🔧 Configuration

### Variables d'environnement

#### Auth Service
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://procrastinator_user:procrastinator_pass@mongodb:27017/procrastinator?authSource=procrastinator
JWT_SECRET=your_super_secret_jwt_key_change_in_production_please
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=http://localhost
```

#### MongoDB
```env
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password123
MONGO_INITDB_DATABASE=procrastinator
```

## 📊 Monitoring et Logs

### Vérifier le statut des services
```bash
# Voir tous les containers
docker compose -f docker-compose.dev.yml ps

# Logs d'un service spécifique
docker compose -f docker-compose.dev.yml logs auth-service
docker compose -f docker-compose.dev.yml logs frontend
docker compose -f docker-compose.dev.yml logs mongodb
```

### Health checks
```bash
# Service d'authentification
curl http://localhost/api/auth/health

# Informations sur l'API
curl http://localhost/api/auth/
```

## 🚧 Fonctionnalités à venir

- [ ] **Service de gestion des tâches** (task-service)
- [ ] **Système de gamification** (gamification-service)  
- [ ] **Collaboration en temps réel** (collaboration-service)
- [ ] **Service de notifications** (notification-service)
- [ ] **Interface d'administration** avancée
- [ ] **Tableaux de bord** et statistiques
- [ ] **API de recherche** et filtres avancés
- [ ] **Tests unitaires** et d'intégration

## 🏫 Contexte académique

Ce projet respecte les exigences du cours Vue.js/Nuxt 4 :

### Éléments techniques implémentés
- ✅ **8+ composants Vue** réutilisables
- ✅ **Composition API** dans plusieurs composants
- ✅ **Props, emits, v-model** utilisés correctement
- ✅ **Appels API** avec gestion d'erreurs
- ✅ **Routing dynamique** Nuxt
- ✅ **Pinia** pour la gestion d'état
- ✅ **Formulaires** avec validation complète
- ✅ **TypeScript** strict
- ✅ **Middleware** Nuxt pour l'authentification

### Bonus implémentés
- ✅ **Nuxt 4** (au lieu de Vue.js seul)
- ✅ **TypeScript** complet
- ✅ **Authentification** avancée avec JWT
- ✅ **Architecture microservices**
- ✅ **Docker** et containerisation

## 🧪 Tests

Le projet dispose d'un système de tests complet couvrant à la fois le backend et le frontend.

### 🔧 Configuration des Tests

#### Backend (Workspace Service)
- **Framework** : Jest
- **Type** : Tests d'intégration
- **Couverture** : 100% des routes API
- **Fichiers** : `services/workspace-service/src/test/`

#### Frontend (Nuxt)
- **Framework** : Playwright
- **Type** : Tests End-to-End (E2E)
- **Couverture** : Pages principales et flux utilisateur
- **Fichiers** : `frontend/test/e2e/`

### 📋 Prérequis pour les Tests

```bash
# Installer les dépendances de test
cd frontend
pnpm install

cd services/workspace-service
npm install
```

### 🚀 Exécution des Tests

#### Tests Backend (Workspace Service)

```bash
# Exécuter tous les tests d'intégration
cd services/workspace-service
npm test

# Exécuter un test spécifique
npm test -- --testNamePattern="should create a new workspace"

# Mode watch (développement)
npm test -- --watch
```

**Résultats attendus** : 45 tests passant, couvrant toutes les routes et scénarios.

#### Tests Frontend (E2E)

```bash
# Installer les navigateurs Playwright
cd frontend
npx playwright install

# Exécuter le test de vérification (recommandé en premier)
pnpm run test:e2e:check

# Exécuter tous les tests E2E
pnpm run test:e2e

# Mode interactif (UI)
pnpm run test:e2e:ui

# Mode headed (voir le navigateur)
pnpm run test:e2e:headed
```

**Résultats attendus** : 11 tests passant, couvrant les pages principales et flux utilisateur.

### 📊 Détails des Tests

#### Tests Backend (Workspace Service)

**Routes testées** :
- ✅ `GET /health` - Vérification de santé
- ✅ `POST /` - Création d'espace de travail
- ✅ `GET /` - Liste des espaces de l'utilisateur
- ✅ `POST /join` - Rejoindre un espace via code d'invitation
- ✅ `GET /:id` - Détails d'un espace spécifique
- ✅ `PUT /:id` - Mise à jour d'un espace
- ✅ `POST /:id/leave` - Quitter un espace
- ✅ `DELETE /:id` - Suppression d'un espace
- ✅ `POST /:id/columns` - Ajout de colonne
- ✅ `PUT /:id/columns/:columnId` - Mise à jour de colonne
- ✅ `DELETE /:id/columns/:columnId` - Suppression de colonne

**Routes Admin** :
- ✅ `GET /admin/stats` - Statistiques
- ✅ `GET /admin/workspaces` - Liste complète
- ✅ `GET /admin/workspaces/:id` - Détails admin
- ✅ `PUT /admin/workspaces/:id` - Mise à jour admin
- ✅ `DELETE /admin/workspaces/:id` - Suppression soft
- ✅ `DELETE /admin/workspaces/:id/hard` - Suppression définitive

**Scénarios couverts** :
- ✅ Succès des opérations
- ✅ Gestion des erreurs (400, 403, 404, 500)
- ✅ Validation des données
- ✅ Vérification des permissions
- ✅ Authentification et autorisation

#### Tests 2FA (Auth Service)

**Configuration** :
- **Framework** : Jest avec ts-jest (ESM)
- **Type** : Tests d'intégration
- **Base de données** : MongoDB Memory Server
- **Fichiers** : `services/auth-service/src/test/integration/2fa.routes.test.ts`

**Exécution** :
```bash
# Exécuter les tests 2FA
pnpm test:2fa

# Ou depuis le service
cd services/auth-service
NODE_OPTIONS='--experimental-vm-modules' pnpm exec jest --testPathPatterns=2fa
```

**Endpoints testés (19 tests)** :

| Endpoint | Tests | Description |
|----------|-------|-------------|
| `POST /setup-2fa` | 3 | Initialisation 2FA (secret, QR code, backup codes) |
| `POST /enable-2fa` | 4 | Activation 2FA avec validation TOTP |
| `POST /verify-2fa` | 4 | Vérification token et génération JWT |
| `POST /disable-2fa` | 4 | Désactivation 2FA avec mot de passe |
| `POST /2fa/validate-login` | 4 | Validation login avec code 2FA |

**Détails des tests** :

- ✅ `POST /setup-2fa`
  - Retourne secret, QR code et 10 backup codes
  - Erreur 400 si userId manquant
  - Erreur 404 si utilisateur non trouvé

- ✅ `POST /enable-2fa`
  - Active 2FA avec token TOTP valide
  - Erreur 400 si champs requis manquants
  - Erreur 400 si token TOTP invalide
  - Erreur 400 si utilisateur non trouvé

- ✅ `POST /verify-2fa`
  - Vérifie token et retourne JWT
  - Erreur 400 si userId ou token manquant
  - Erreur 401 si token invalide
  - Erreur 400 si 2FA non activé

- ✅ `POST /disable-2fa`
  - Désactive 2FA avec mot de passe valide
  - Erreur 400 si userId ou password manquant
  - Erreur 401 si mot de passe incorrect
  - Erreur 404 si utilisateur non trouvé

- ✅ `POST /2fa/validate-login`
  - Complète login avec tempToken et code 2FA
  - Erreur 400 si tokens manquants
  - Erreur 401 si tempToken invalide
  - Erreur 401 si code 2FA invalide

#### Tests Frontend (E2E)

**Pages testées** :
- ✅ Page d'accueil (`index.vue`)
- ✅ États d'authentification
- ✅ Responsive design
- ✅ Gestion des erreurs

**Scénarios couverts** :
- ✅ Chargement de l'application
- ✅ Affichage du contenu
- ✅ Navigation entre pages
- ✅ Comportement responsive
- ✅ Gestion des erreurs 404

### 🔍 Dépannage

#### Problèmes Backend

```bash
# Nettoyer et réinstaller
cd services/workspace-service
rm -rf node_modules
npm install

# Vérifier la connexion MongoDB
npm test -- --verbose
```

#### Problèmes Frontend

```bash
# Installer les dépendances système pour Playwright
sudo npx playwright install-deps

# Réinstaller les navigateurs
npx playwright install

# Vérifier les ports utilisés
sudo lsof -i :3000
kill -9 <PID>
```

### 📈 Qualité des Tests

- **Couverture backend** : 100% des routes API
- **Couverture frontend** : Pages principales et flux critiques
- **Fiabilité** : Tests stables avec gestion des erreurs
- **Maintenabilité** : Code de test clair et documenté

### 🎯 Bonnes Pratiques

**Backend** :
- Tests isolés avec nettoyage de la base de données
- Mocking des dépendances externes
- Validation des réponses API (status, body, structure)

**Frontend** :
- Sélecteurs sémantiques (`getByRole`, `getByText`)
- Attente automatique des éléments
- Tests indépendants du serveur (quand possible)
- Vérification des états visuels

## 📝 Contribution

1. **Fork** le projet
2. Créer une **branche feature** (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commit** les changements (`git commit -am 'Ajoute nouvelle fonctionnalité'`)
4. **Push** sur la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une **Pull Request**

## 🐛 Résolution de problèmes

### Services ne démarrent pas
```bash
# Nettoyer les containers et volumes
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d --build
```

### Problème de connexion MongoDB
```bash
# Vérifier les logs MongoDB
docker compose -f docker-compose.dev.yml logs mongodb

# Recréer le volume MongoDB si nécessaire
docker volume rm procrastinator_mongodb_data
```

### Erreurs de compilation TypeScript
```bash
# Nettoyer et rebuilder
cd services/auth-service
rm -rf dist node_modules
npm install
npm run build
```

## 📄 Licence

Ce projet est sous licence ISC - voir le fichier LICENSE pour plus de détails.

---

**Développé avec ❤️ pour le cours Vue.js/Nuxt 4**