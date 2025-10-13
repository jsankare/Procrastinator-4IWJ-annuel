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

## Développement
Le projet utilise Docker pour l'environnement de développement avec hot-reload sur tous les services.