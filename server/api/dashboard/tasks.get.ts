/**
 * Dashboard 任务列表
 * GET /api/dashboard/tasks
 * 
 * 获取任务列表，支持筛选
 * Query Params:
 * - projectId: string (可选)
 * - status: 'todo' | 'done' | 'all' (默认 'todo')
 */

import { db } from '../../utils/db'
import { getUserId } from '../../utils/session'

export default defineEventHandler(async (event) => {
    // 获取真实用户ID
    const userId = getUserId(event)

    // 未登录用户：返回空数组
    if (!userId) {
        return { tasks: [] }
    }

    const query = getQuery(event)

    // Params
    const projectId = query.projectId as string
    const status = (query.status as string) || 'todo'

    try {
        let sql = `
            SELECT 
                t.id, t.name, t.status, t.estimated_hours, t.domain, t.sequence_order,
                p.id as project_id, p.name as project_name, p.primary_domain as project_domain
            FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            WHERE t.user_id = ?
        `
        const args: any[] = [userId]

        // Filters
        if (projectId) {
            sql += ' AND t.project_id = ?'
            args.push(projectId)
        }

        if (status !== 'all') {
            sql += ' AND t.status = ?'
            args.push(status)
        }

        // Sorting
        // 优先按 sequence_order 排序，其次是创建时间
        sql += ' ORDER BY t.status ASC, t.sequence_order ASC, t.created_at DESC'

        const { rows } = await db.execute({
            sql,
            args
        })

        return {
            tasks: rows.map((row: any) => ({
                id: row.id,
                name: row.name,
                status: row.status,
                estimatedHours: row.estimated_hours,
                domain: row.domain || row.project_domain, // fallback to project domain
                project: {
                    id: row.project_id,
                    name: row.project_name,
                    domain: row.project_domain
                }
            }))
        }

    } catch (error) {
        console.error('[Dashboard Tasks Error]', error)
        throw createError({
            statusCode: 500,
            message: '获取任务列表失败'
        })
    }
})

