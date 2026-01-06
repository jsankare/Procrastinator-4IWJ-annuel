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