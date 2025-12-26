import { defineNuxtPlugin } from '#app'
import { useAuth } from 'vue-clerk'

export default defineNuxtPlugin((nuxtApp) => {
    // Intercept $fetch to add user ID header
    const { userId } = useAuth()

    const $originalFetch = globalThis.$fetch

    globalThis.$fetch = async (request, opts = {}) => {
        // If user is logged in, add header
        const currentUserId = userId.value

        if (currentUserId) {
            opts.headers = {
                ...opts.headers,
                'x-user-id': currentUserId
            }
        }

        return $originalFetch(request, opts)
    }
})
