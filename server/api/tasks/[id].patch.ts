/**
 * 更新任务状态
 * PATCH /api/tasks/:id
 */

import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    // TODO: 获取真实用户ID
    const userId = 'temp_user_id'
    const taskId = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!taskId) {
        throw createError({ statusCode: 400, message: 'Missing Task ID' })
    }

    try {
        // 构建更新语句
        const updates: string[] = []
        const args: any[] = []

        if (body.status !== undefined) {
            updates.push('status = ?')
            args.push(body.status)
        }

        if (body.name !== undefined) {
            updates.push('name = ?')
            args.push(body.name)
        }

        if (body.estimatedHours !== undefined) {
            updates.push('estimated_hours = ?')
            args.push(body.estimatedHours)
        }

        if (updates.length === 0) {
            return { success: true }
        }

        // Add updated_at
        updates.push('updated_at = ?')
        args.push(Math.floor(Date.now() / 1000))

        // WHERE clause
        args.push(taskId)
        args.push(userId)

        const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`

        const result = await db.execute({
            sql,
            args
        })

        if (result.rowsAffected === 0) {
            throw createError({ statusCode: 404, message: 'Task not found' })
        }

        return { success: true }

    } catch (error: any) {
        console.error('[Update Task Error]', error)
        if (error.statusCode === 404) throw error
        throw createError({
            statusCode: 500,
            message: '更新任务失败'
        })
    }
})
