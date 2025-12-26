import { defineEventHandler } from 'h3'
import { db } from '../../utils/db'
import { getUserId } from '../../utils/session'

export default defineEventHandler(async (event) => {
    const userId = getUserId(event)

    // 1. Fetch Active North Star
    const northStarResult = await db.execute({
        sql: `
            SELECT * FROM goals 
            WHERE status = 'active' AND user_id = ?
            ORDER BY created_at DESC 
            LIMIT 1
  `,
        args: [userId]
    })

    const northStar = northStarResult.rows[0]

    if (!northStar) {
        return {
            northStar: null,
            milestones: [],
            domains: []
        }
    }

    // 2. Fetch Milestones
    const milestonesResult = await db.execute({
        sql: `SELECT * FROM milestones WHERE goal_id = ? ORDER BY quarter ASC`,
        args: [northStar.id]
    })

    // 3. Fetch Domains (Assume linked to user, fetching all for now)
    // Ideally we link domains to goals if schema supports, but currently domains are per user
    const domainsResult = await db.execute({
        sql: `SELECT * FROM domains WHERE user_id = ?`,
        args: [northStar.user_id]
    })

    return {
        northStar,
        milestones: milestonesResult.rows,
        domains: domainsResult.rows
    }
})
