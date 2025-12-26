import { createClient } from '@libsql/client'

const config = useRuntimeConfig()

export const db = createClient({
    url: process.env.TURSO_DB_URL || 'file:local.db',
    authToken: process.env.TURSO_DB_TOKEN
})
