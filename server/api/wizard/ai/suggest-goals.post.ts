import { z } from 'zod'

/**
 * AI接口 - 场景2: 目标建议 (重构版)
 * POST /api/wizard/ai/suggest-goals
 * 
 * 接收结构化输入 -> 推断用户画像 -> 生成季度目标
 */

const InputSchema = z.object({
    goalType: z.enum(['revenue', 'product', 'influence', 'growth']),
    targetValue: z.string(),
    pathways: z.array(z.string()),
    additionalContext: z.string().optional()
})

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const result = InputSchema.safeParse(body)

    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: '参数校验失败',
            data: result.error.errors
        })
    }

    const { goalType, targetValue, pathways, additionalContext } = result.data
    const glm = useGLM()

    const userMessage = `
[Input Context]
- 目标类型: ${goalType}
- 量化目标: ${targetValue}
- 选定路径: ${pathways.join(', ')}
- 补充信息: "${additionalContext || '无'}"

[Instruction]
1. User Profile Inference:
   - 根据路径(pathways)推断用户身份(inferred_profile)。
   - 例如: 含[saas/dev] -> "独立开发者"; 含[content] -> "内容创作者"。
   
2. Goal Generation:
   - 生成 2-4 个关键季度目标。
   - 目标必须适配推断出的身份（开发者关注产品/技术，创作者关注内容/流量）。
   - 必须包含明确的时间节点 (Q1/Q2/...).

3. Output Requirements:
   - 返回严格 JSON。
`.trim()

    const systemPrompt = `${SYSTEM_PROMPT_BASE}

Task: 基于结构化输入，推断用户画像并拆解年度目标。

Output Format Example:
{
  "inferred_profile": "独立开发者",
  "suggestions": [
    {
      "title": "Q1: 完成MVP核心功能开发",
      "target_date_quarter": "Q1",
      "reason": "基于SaaS路径，优先验证产品核心价值"
    }
  ]
}`

    try {
        const result = await glm.callJSON<{
            inferred_profile: string
            suggestions: Array<{
                title: string
                target_date_quarter: string
                reason: string
            }>
        }>(userMessage, { systemPrompt })

        return result
    } catch (error) {
        console.error('[AI Suggest Goals Error]', error)
        throw createError({
            statusCode: 500,
            message: 'AI处理失败，请重试'
        })
    }
})
