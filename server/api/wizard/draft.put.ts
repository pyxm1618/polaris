/**
 * 草稿管理 - 保存/更新向导草稿
 * PUT /api/wizard/draft
 */

import { db } from '../../utils/db'
import { getUserId } from '../../utils/session'

export default defineEventHandler(async (event) => {
    const { currentStep, data } = await readBody(event)

    if (!currentStep || !data) {
        throw createError({
            statusCode: 400,
            message: '缺少必需参数: currentStep, data'
        })
    }

    // 获取真实用户ID
    const userId = getUserId(event)

    try {
        const now = Math.floor(Date.now() / 1000)
        const dataJson = JSON.stringify(data)

        // SQLite的UPSERT语法
        await db.execute({
            sql: `
        INSERT INTO wizard_drafts (id, user_id, current_step, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          current_step = excluded.current_step,
          data = excluded.data,
          updated_at = excluded.updated_at
      `,
            args: [
                crypto.randomUUID(),
                userId,
                currentStep,
                dataJson,
                now,
                now
            ]
        })

        return { success: true }
    } catch (error) {
        console.error('[Save Draft Error]', error)
        throw createError({
            statusCode: 500,
            message: '保存草稿失败'
        })
    }
})
