// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['nitro-cloudflare-dev', '@nuxt/fonts'],
  fonts: {
    experimental: { processCSSVariables: true },
    families: [
      { name: 'Space Grotesk', provider: 'google', weights: [500, 600, 700], styles: ['normal', 'italic'] },
      { name: 'Plus Jakarta Sans', provider: 'google', weights: [400, 500, 600, 700] }
    ]
  },
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true
    }
  }
})
