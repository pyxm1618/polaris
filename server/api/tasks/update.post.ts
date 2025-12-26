import { defineEventHandler, readBody } from 'h3'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { id, status } = body

    if (!id || !status) {
        throw createError({ statusCode: 400, message: 'ID and Status are required' })
    }

    const now = Math.floor(Date.now() / 1000)

    await db.execute({
        sql: `UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?`,
        args: [status, now, id]
    })

    return { success: true }
})
