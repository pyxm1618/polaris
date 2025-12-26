/**
 * 向导完整保存
 * POST /api/wizard/save
 * 
 * 将用户完成的目标拆解完整保存到数据库
 */

import { db } from '../../utils/db'
import { getUserId } from '../../utils/session'

export default defineEventHandler(async (event) => {
    const { northStar, goals, projects, tasks } = await readBody(event)

    if (!northStar || !goals || !projects || !tasks) {
        throw createError({
            statusCode: 400,
            message: '缺少必需参数'
        })
    }

    // 获取当前用户ID
    const userId = getUserId(event)

    try {
        const now = Math.floor(Date.now() / 1000)

        // 1. 保存北极星
        const northStarId = crypto.randomUUID()
        await db.execute({
            sql: 'INSERT INTO north_stars (id, user_id, title, year, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            args: [northStarId, userId, northStar.title, northStar.year || new Date().getFullYear(), now, now]
        })

        // 2. 保存目标
        const goalIds: Record<string, string> = {}
        for (const goal of goals) {
            const goalId = crypto.randomUUID()
            goalIds[goal.tempId || goal.title] = goalId

            await db.execute({
                sql: 'INSERT INTO goals (id, user_id, north_star_id, title, target_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                args: [goalId, userId, northStarId, goal.title, goal.targetDate, 'active', now]
            })
        }

        // 3. 保存项目 + 关联
        const projectIds: Record<string, string> = {}
        for (const project of projects) {
            const projectId = crypto.randomUUID()
            projectIds[project.tempId || project.name] = projectId

            await db.execute({
                sql: `INSERT INTO projects (id, user_id, name, primary_domain, description, status, total_estimated_hours, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [projectId, userId, project.name, project.primaryDomain, project.description || '', 'active', 0, now, now]
            })

            // 关联目标-项目
            if (project.goalIds && Array.isArray(project.goalIds)) {
                for (const tempGoalId of project.goalIds) {
                    const realGoalId = goalIds[tempGoalId]
                    if (realGoalId) {
                        await db.execute({
                            sql: 'INSERT INTO goal_project_relations (goal_id, project_id, created_at) VALUES (?, ?, ?)',
                            args: [realGoalId, projectId, now]
                        })
                    }
                }
            }
        }

        // 4. 保存任务
        for (const task of tasks) {
            const realProjectId = projectIds[task.projectId]
            if (!realProjectId) continue

            await db.execute({
                sql: `INSERT INTO tasks (id, project_id, user_id, name, domain, estimated_hours, sequence_order, status, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    crypto.randomUUID(),
                    realProjectId,
                    userId,
                    task.name,
                    task.domain || null,
                    task.estimatedHours || 1,
                    task.sequenceOrder || 0,
                    'todo',
                    now
                ]
            })
        }

        // 5. 删除草稿
        await db.execute({
            sql: 'DELETE FROM wizard_drafts WHERE user_id = ?',
            args: [userId]
        })

        return { success: true, northStarId }
    } catch (error) {
        console.error('[Wizard Save Error]', error instanceof Error ? error.message : error)
        console.error('[Wizard Save Error Stack]', error instanceof Error ? error.stack : '')
        throw createError({
            statusCode: 500,
            message: error instanceof Error ? `保存失败: ${error.message}` : '保存失败'
        })
    }
})
