/**
 * Auth Utility
 * Extracts User ID from headers or context
 */
import { H3Event } from 'h3'

export const getUserId = (event: H3Event): string | null => {
    // 1. Try to get from custom header (passed by frontend)
    const headerUserId = getHeader(event, 'x-user-id')
    if (headerUserId) {
        return headerUserId
    }

    // 2. TODO: If we had h3-clerk, proper check would be:
    // const { userId } = event.context.auth
    // if (userId) return userId

    // 3. Unauthenticated user: return null (standard practice)
    return null
}

