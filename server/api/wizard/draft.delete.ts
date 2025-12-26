/**
 * 草稿管理 - 删除向导草稿
 * DELETE /api/wizard/draft
 */

import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    // TODO: 从Clerk获取user_id
    const userId = 'temp_user_id' // 临时使用，待集成Clerk后替换

    try {
        await db.execute({
            sql: 'DELETE FROM wizard_drafts WHERE user_id = ?',
            args: [userId]
        })

        return { success: true }
    } catch (error) {
        console.error('[Delete Draft Error]', error)
        throw createError({
            statusCode: 500,
            message: '删除草稿失败'
        })
    }
})
