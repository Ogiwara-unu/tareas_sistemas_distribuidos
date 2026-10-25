// https://nuxt.com/docs/api/configuration/nuxt-config
// El frontend se genera como SPA estática (`nuxt generate`) y se publica en Netlify.
// El servicio REST vive en netlify/functions (Netlify Functions), no en Nuxt/Nitro.
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/fonts'],
  fonts: {
    experimental: { processCSSVariables: true },
    families: [
      { name: 'Space Grotesk', provider: 'google', weights: [500, 600, 700], styles: ['normal', 'italic'] },
      { name: 'Plus Jakarta Sans', provider: 'google', weights: [400, 500, 600, 700] }
    ]
  },
  nitro: {
    preset: 'static'
  }
})
