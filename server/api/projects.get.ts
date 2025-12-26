/**
 * 获取项目列表
 * GET /api/projects?search=keyword
 */

import { db } from '../utils/db'
import { getUserId } from '../utils/session'

export default defineEventHandler(async (event) => {
    // 获取真实用户ID
    const userId = getUserId(event)

    const query = getQuery(event)
    const search = query.search as string | undefined

    try {
        let sql = 'SELECT * FROM projects WHERE user_id = ? AND status != ?'
        const args: any[] = [userId, 'archived']

        if (search) {
            sql += ' AND (name LIKE ? OR description LIKE ?)'
            args.push(`%${search}%`, `%${search}%`)
        }

        sql += ' ORDER BY created_at DESC'

        const result = await db.execute({ sql, args })

        return {
            projects: result.rows.map((row: any) => ({
                id: row.id,
                name: row.name,
                primaryDomain: row.primary_domain,
                description: row.description,
                totalEstimatedHours: row.total_estimated_hours,
                status: row.status,
                createdAt: row.created_at
            }))
        }
    } catch (error) {
        console.error('[Get Projects Error]', error)
        throw createError({
            statusCode: 500,
            message: '获取项目列表失败'
        })
    }
})
