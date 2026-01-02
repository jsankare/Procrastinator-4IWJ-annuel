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

    server: {
        host,
        port,
    },

    css: ["@/assets/css/tailwind.css"],

    vite: {
        server: {
            host: "0.0.0.0",
            port: 5173, // Vite dev server port
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

    modules: ["@nuxt/eslint", "@nuxt/image", "@nuxt/scripts", "@nuxt/ui"],

    runtimeConfig: {
        public: {
            apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost",
        },
    },
});
