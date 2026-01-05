import { defineNuxtPlugin } from "#app";
import VueMatomo from "vue-matomo";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  nuxtApp.vueApp.use(VueMatomo, {
    host: config.public.matomoHost || "http://localhost:8080",
    siteId: config.public.matomoSiteId || 1,
    router: nuxtApp.$router,
    enableLinkTracking: true,
    requireConsent: false,
    trackInitialView: true,
    disableCookies: false,
    requireCookieConsent: false,
  });
});
