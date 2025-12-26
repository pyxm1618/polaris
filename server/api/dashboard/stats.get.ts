/**
 * Dashboard 统计信息
 * GET /api/dashboard/stats
 * 
 * 返回北极星指标、年度倒计时、总体进度统计
 */

import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    // TODO: 获取真实用户ID
    const userId = 'temp_user_id'

    try {
        // 1. 获取最新的北极星指标
        const { rows: northStars } = await db.execute({
            sql: 'SELECT * FROM north_stars WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            args: [userId]
        })
        const northStar = northStars[0] || null

        // 2. 统计数据
        // 总目标数
        const { rows: goalStats } = await db.execute({
            sql: 'SELECT COUNT(*) as count FROM goals WHERE user_id = ? AND status = "active"',
            args: [userId]
        })

        // 总项目数
        const { rows: projectStats } = await db.execute({
            sql: 'SELECT COUNT(*) as count FROM projects WHERE user_id = ? AND status = "active"',
            args: [userId]
        })

        // 任务统计 (总数, 已完成)
        const { rows: taskStats } = await db.execute({
            sql: `
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed,
                     SUM(estimated_hours) as total_hours
                FROM tasks 
                WHERE user_id = ?
            `,
            args: [userId]
        })

        // 3. 计算年度倒计时
        const now = new Date()
        const currentYear = now.getFullYear()
        const endOfYear = new Date(currentYear, 11, 31)
        const daysLeft = Math.ceil((endOfYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const totalDays = 365 + (currentYear % 4 === 0 ? 1 : 0) // 简单闰年判断
        const yearProgress = Math.round(((totalDays - daysLeft) / totalDays) * 100)

        return {
            northStar: northStar ? {
                title: northStar.title,
                year: northStar.year
            } : null,
            stats: {
                totalGoals: Number(goalStats[0]?.count || 0),
                totalProjects: Number(projectStats[0]?.count || 0),
                totalTasks: Number(taskStats[0]?.total || 0),
                completedTasks: Number(taskStats[0]?.completed || 0),
                totalHours: Number(taskStats[0]?.total_hours || 0)
            },
            time: {
                daysLeft,
                yearProgress
            }
        }

    } catch (error) {
        console.error('[Dashboard Stats Error]', error)
        throw createError({
            statusCode: 500,
            message: '获取统计信息失败'
        })
    }
})
