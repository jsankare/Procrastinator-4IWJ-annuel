// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

const host = process.env.NUXT_HOST || "0.0.0.0";
const port = process.env.NUXT_PORT ? Number(process.env.NUXT_PORT) : 3000;

/**
 * Configure Nuxt + Vite for development inside Docker/behind Traefik.
 * - Bind Nuxt to 0.0.0.0 so Traefik / other containers can reach it
 * - Expose Vite dev server on 0.0.0.0 and configure HMR so the browser can connect
 * - watch.usePolling can help with bind-mounted files on some platforms
 */
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  // Our app source lives under ./app (pages, components, assets, etc.)
  srcDir: "app",
  // Keep server (Nitro) directory at project root ./server so /api/* routes are picked up
  serverDir: "server",

  // Ensure Nitro / Nuxt server binds to the container network
  server: {
    host,
    port,
  },

  css: ["@/assets/css/tailwind.css"],

  vite: {
    // Vite options targeted for containerized dev
    server: {
      // Expose Vite to the Docker network so Traefik / host can proxy requests
      host: "0.0.0.0",
      port: 5173,
      // HMR must be reachable from the browser. Using `localhost` here works
      // when Traefik/proxy maps requests from host machine to the container.
      hmr: {
        host: "localhost",
        protocol: "ws",
        port: 5173,
      },
      // Helpful in some bind-mount setups (e.g. Docker on Linux/macOS)
      watch: {
        usePolling: true,
      },
    },
    plugins: [tailwindcss()],
  },

  modules: ["@nuxt/eslint", "@nuxt/image", "@nuxt/scripts", "@nuxt/ui"],

  // Optional: expose useful runtime config (example)
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost",
    },
  },
});
