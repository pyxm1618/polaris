// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: [
    '~/assets/css/main.css'
  ],
  modules: [
    '@pinia/nuxt',
    // We will add clerk here later
  ],
  runtimeConfig: {
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    glmApiKey: process.env.GLM_API_KEY,
    public: {
      clerkPublishableKey: process.env.NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    }
  }
})
