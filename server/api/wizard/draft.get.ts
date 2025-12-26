/**
 * 草稿管理 - 获取当前用户的向导草稿
 * GET /api/wizard/draft
 */

import { db } from '../../utils/db'
import { getUserId } from '../../utils/session'

export default defineEventHandler(async (event) => {
    // 获取真实用户ID
    const userId = getUserId(event)

    try {
        const result = await db.execute({
            sql: 'SELECT * FROM wizard_drafts WHERE user_id = ? LIMIT 1',
            args: [userId]
        })

        if (result.rows.length === 0) {
            return { draft: null }
        }

        const draft = result.rows[0]

        return {
            draft: {
                id: draft.id,
                currentStep: draft.current_step,
                data: JSON.parse(draft.data as string),
                updatedAt: draft.updated_at
            }
        }
    } catch (error) {
        console.error('[Get Draft Error]', error)
        throw createError({
            statusCode: 500,
            message: '获取草稿失败'
        })
    }
})
