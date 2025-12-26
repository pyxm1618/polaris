import { clerkPlugin } from 'vue-clerk'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
    const runtimeConfig = useRuntimeConfig()

    nuxtApp.vueApp.use(clerkPlugin, {
        publishableKey: runtimeConfig.public.clerkPublishableKey,
        options: {
            appearance: {
                variables: {
                    colorPrimary: '#4f46e5',
                    colorText: 'white',
                    colorBackground: '#1e293b',
                    colorInputBackground: '#334155',
                    colorInputText: 'white',
                }
            }
        }
    })
})
