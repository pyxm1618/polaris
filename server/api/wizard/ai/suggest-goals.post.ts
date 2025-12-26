/**
 * AI接口 - 场景2: 目标建议
 * POST /api/wizard/ai/suggest-goals
 * 
 * 基于北极星愿景，生成2-4个季度目标建议
 */

export default defineEventHandler(async (event) => {
    const { northStar, clarification } = await readBody(event)

    if (!northStar || typeof northStar !== 'string') {
        throw createError({
            statusCode: 400,
            message: '缺少必需参数: northStar'
        })
    }

    const glm = useGLM()

    const userMessage = `
[Input Context]
- 北极星: "${northStar}"
${clarification ? `- 澄清回复: "${clarification}"` : ''}

[Instruction]
1. 目标必须符合独立开发者场景（产品、增长、营收、影响力）。
2. 包含具体的时间锚点建议（如 Q1/Q2）。
3. 目标应具有挑战性但可实现。
4. 返回JSON数组，2-4个目标。
  `.trim()

    const systemPrompt = `${SYSTEM_PROMPT_BASE}

Task: 基于北极星愿景，拆解为2-4个关键的、可量化的季度目标(Objectives)。

Output Format: JSON
{
  "suggestions": [
    {
      "title": "目标标题 (如: 完成MVP开发与上线)",
      "target_date_quarter": "Q1",
      "reason": "简短推荐理由"
    }
  ]
}`

    try {
        const result = await glm.callJSON<{
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
