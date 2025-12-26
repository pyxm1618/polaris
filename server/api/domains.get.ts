/**
 * 获取域列表（含预设+自定义）
 * GET /api/domains
 */

import { db } from '../utils/db'

// 预设域定义
const PRESET_DOMAINS = [
    { name: '产品设计', description: '需求分析、原型设计、UI/UX', color: '#8B5CF6', domain: 'product_design' },
    { name: '技术研发', description: '前端开发、后端开发、数据库', color: '#3B82F6', domain: 'dev' },
    { name: '测试', description: '单元测试、集成测试、性能测试', color: '#10B981', domain: 'test' },
    { name: '运营推广', description: '内容运营、用户增长、数据分析', color: '#F59E0B', domain: 'growth' },
    { name: '学习知识', description: '技术学习、行业研究', color: '#EF4444', domain: 'learning' },
    { name: '数据分析', description: '数据采集、分析报告', color: '#6366F1', domain: 'data_analysis' },
    { name: '休闲娱乐', description: '放松、兴趣爱好', color: '#EC4899', domain: 'leisure' }
]

export default defineEventHandler(async (event) => {
    // TODO: 从Clerk获取user_id
    const userId = 'temp_user_id'

    try {
        // 获取用户自定义域
        const result = await db.execute({
            sql: 'SELECT * FROM domains WHERE user_id = ? AND is_preset = 0 ORDER BY created_at ASC',
            args: [userId]
        })

        const customDomains = result.rows.map((row: any) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            color: row.color,
            domain: (row.name || '').toString().toLowerCase().replace(/\s+/g, '_'),
            isPreset: false
        }))

        // 合并预设域和自定义域
        return {
            domains: [
                ...PRESET_DOMAINS.map(d => ({ ...d, isPreset: true })),
                ...customDomains
            ]
        }
    } catch (error) {
        console.error('[Get Domains Error]', error)
        throw createError({
            statusCode: 500,
            message: '获取域列表失败'
        })
    }
})
