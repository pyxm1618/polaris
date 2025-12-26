import { defineEventHandler, readBody } from 'h3'
import { db } from '../../utils/db'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { userId, northStar, milestones, domains } = body

    if (!userId) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // 1. Create Level 1 Goal (North Star)
    const goalId = randomUUID()
    await db.execute({
        sql: `INSERT INTO goals (id, user_id, title, year, status, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [goalId, userId, northStar, 2026, 'active', Math.floor(Date.now() / 1000)]
    })

    // 2. Create Level 2 Milestones
    for (let i = 0; i < milestones.length; i++) {
        const ms = milestones[i]
        if (!ms.title) continue

        await db.execute({
            sql: `INSERT INTO milestones (id, goal_id, user_id, title, quarter, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [randomUUID(), goalId, userId, ms.title, i + 1, 'pending', Math.floor(Date.now() / 1000)]
        })
    }

    // 3. Save Selected Domains (We map them for the user preferences, here we assume saving to a 'domains' table)
    // Check if domains already exist for user, if not create them
    for (const domain of domains) {
        // Ideally we check existence first or use INSERT OR IGNORE if ID is unique per user+domain
        // implementation simplification: Just insert for now
        await db.execute({
            sql: `INSERT INTO domains (id, user_id, name, icon, color, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
            args: [randomUUID(), userId, domain.name, 'icon-placeholder', domain.color, Math.floor(Date.now() / 1000)]
        })
    }

    return { success: true, goalId }
})
