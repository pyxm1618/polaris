import { defineEventHandler, readBody } from 'h3'
import { db } from '../../utils/db'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { title, userId } = body

    if (!title) {
        throw createError({ statusCode: 400, message: 'Title is required' })
    }

    // Hardcoded userId fallback similar to generate
    const uid = userId || 'demo-user'

    const taskId = randomUUID()
    const now = Math.floor(Date.now() / 1000)

    // Default domain for quick tasks: 'Unsorted' or null. 
    // For MVP let's leave domain_id null or maybe grab the 'Dev' domain if we wanted to be smart, but null is fine.

    await db.execute({
        sql: `INSERT INTO tasks (id, user_id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [taskId, uid, title, 'pending', now, now]
    })

    return { success: true, taskId }
})
