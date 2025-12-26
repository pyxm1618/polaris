import { defineEventHandler } from 'h3'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    // Hardcoded for MVP as we don't have full auth context in non-browser request easily without cookie parsing
    // In a real app we'd get userId from session. For now, we trust the client or use a fixed one if testing.
    // Getting userId from query for MVP simplicity or use a default one since we generated data for 'demo-user' or similar.
    // Let's grab the latest goal for simplicity.

    // 1. Fetch Active North Star
    const northStarResult = await db.execute(`
    SELECT * FROM goals 
    WHERE status = 'active' 
    ORDER BY created_at DESC 
    LIMIT 1
  `)

    const northStar = northStarResult.rows[0]

    if (!northStar) {
        return {
            northStar: null,
            milestones: [],
            todayTasks: []
        }
    }

    // 2. Fetch Milestones for this Goal
    const milestonesResult = await db.execute({
        sql: `SELECT * FROM milestones WHERE goal_id = ? ORDER BY quarter ASC`,
        args: [northStar.id]
    })

    // 3. Fetch Tasks for Today (Mocking 'today' logic or just fetching all active tasks for MVP)
    // In a real app: WHERE due_date = current_date
    // Here just fetch pending tasks linked to this goal's milestones
    const tasksResult = await db.execute({
        sql: `
      SELECT t.*, d.name as domain_name, d.color as domain_color 
      FROM tasks t
      LEFT JOIN domains d ON t.domain_id = d.id
      WHERE t.status != 'completed'
      ORDER BY t.created_at DESC
      LIMIT 10
    `,
        args: []
    })

    return {
        northStar,
        milestones: milestonesResult.rows,
        todayTasks: tasksResult.rows
    }
})
