/**
 * 草稿管理 - 删除向导草稿
 * DELETE /api/wizard/draft
 */

import { db } from '../../utils/db'
import { getUserId } from '../../utils/session'

export default defineEventHandler(async (event) => {
    // 获取真实用户ID
    const userId = getUserId(event)

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
