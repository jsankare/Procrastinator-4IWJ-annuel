# Procrastinator

Application de gestion de tâches basée sur une architecture microservices.

## Architecture

### Structure du projet
- **Frontend** : Application Nuxt v4 avec TypeScript et Vue 3
- **Backend** : Microservices Node.js avec Express et TypeScript
- **Infrastructure** : Docker containers avec Traefik comme reverse proxy
- **Monorepo** : Géré avec pnpm workspaces

### Services
- **auth-service** : Gestion de l'authentification et des utilisateurs
- **Autres services** : task-service, gamification-service, collaboration-service, notification-service (à venir)

### Technologies
- **Frontend** : Nuxt v4, Vue 3, TypeScript, @nuxt/ui
- **Backend** : Node.js, Express, TypeScript, Helmet, CORS
- **Base de données** : À définir
- **Infrastructure** : Docker, Traefik, pnpm

## Fonctionnalités prévues
- Authentification et gestion des utilisateurs
- Gestion des tâches et projets
- Système de gamification
- Collaboration en temps réel
- Notifications

## Installation

### Prérequis
- Node.js (version 22+)
- pnpm
- Docker et Docker Compose

### Configuration initiale
1. Cloner le projet
2. Installer pnpm globalement :
   ```bash
   npm install -g pnpm
   ```
3. Installer les dépendances :
   ```bash
   pnpm install
   ```
4. Lancer l'environnement de développement :
   ```bash
   pnpm dev
   ```

## Développement
Le projet utilise Docker pour l'environnement de développement avec hot-reload sur tous les services.

### Commandes utiles
- `pnpm dev` : Lance tous les services via Docker
- `pnpm dev-down` : Arrête et supprime les containers Docker
- `pnpm -r build` : Build tous les packages
- `pnpm -r clean` : Nettoie tous les packages