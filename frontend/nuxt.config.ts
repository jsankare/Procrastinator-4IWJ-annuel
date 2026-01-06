// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

const host = process.env.NUXT_HOST || "0.0.0.0";
const port = process.env.NUXT_PORT ? Number(process.env.NUXT_PORT) : 3000;

/**
 * Configure Nuxt for Docker + Caddy setup
 * - Bind Nuxt to 0.0.0.0 so Caddy can reach it
 * - Enable HMR for development
 * - Let Caddy handle all the routing complexities
 */
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },

    // Our app source lives under ./app (pages, components, assets, etc.)
    srcDir: "app",
    serverDir: "server",

    devServer: {
        host,
        port,
    },

    css: ["@/assets/css/tailwind.css"],

    vite: {
        server: {
            hmr: {
                host: "localhost",
                protocol: "ws",
                port: 5173,
            },
            watch: {
                usePolling: true,
            },
        },
        plugins: [tailwindcss()],
    },

    modules: ["@pinia/nuxt", "@nuxt/eslint", "@nuxt/image", "@nuxt/scripts", "@nuxt/ui", "@nuxtjs/sitemap", "@nuxtjs/robots", '@nuxt/test-utils/module',],

    site: {
        url: process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost",
        name: "Procrastinator",
    },

    sitemap: {
        exclude: [
            "/admin/**",
            "/profile",
            "/setup-2fa",
            "/verify-2fa",
            "/workspace/**",
            "/invite/**",
        ],
    },

    robots: {
        disallow: [
            "/admin",
            "/profile",
            "/setup-2fa",
            "/verify-2fa",
            "/workspace",
            "/invite",
        ],
    },

    app: {
        head: {
            charset: "utf-8",
            viewport: "width=device-width, initial-scale=1",
            title: "Procrastinator - Gestionnaire de Tâches et Productivité",
            meta: [
                { name: "description", content: "Application de gestion de tâches avec workspaces collaboratifs et suivi de productivité." },
                { name: "theme-color", content: "#6366f1" },
                // Open Graph
                { property: "og:type", content: "website" },
                { property: "og:site_name", content: "Procrastinator" },
                { property: "og:locale", content: "fr_FR" },
                // Twitter
                { name: "twitter:card", content: "summary_large_image" },
            ],
            link: [
                { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
            ],
        },
    },

    runtimeConfig: {
        public: {
            // Default to empty string for relative requests (proxied by Nuxt or Caddy)
            // This fixes the Drag & Drop regression by ensuring requests go through the correct proxy
            apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || "",
        },
    },

    // Development proxy for local services
    nitro: {
        devProxy: {
            "/api/tasks": {
                target: "http://localhost:3003",
                changeOrigin: true,
            },
            "/api/auth": {
                target: "http://localhost:3001",
                changeOrigin: true,
            },
            "/api/workspaces": {
                target: "http://localhost:3002",
                changeOrigin: true,
            },
        },
    },

    build: {
        transpile: ['pinia'],
    },
});
