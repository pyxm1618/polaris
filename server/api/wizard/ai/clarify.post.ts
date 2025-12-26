/**
 * AI接口 - 场景1: 愿景澄清
 * POST /api/wizard/ai/clarify
 * 
 * 分析用户北极星是否模糊，如需澄清则提出问题
 */

export default defineEventHandler(async (event) => {
    const { northStar } = await readBody(event)

    if (!northStar || typeof northStar !== 'string') {
        throw createError({
            statusCode: 400,
            message: '缺少必需参数: northStar'
        })
    }

    const glm = useGLM()

    const userMessage = `
[User Input]
用户的北极星愿景: "${northStar}"

[Instruction]
如果愿景包含具体数字或明确产品，is_ambiguous为false。
如果愿景类似"这就去做"、"变富"，is_ambiguous为true。
问题必须直击核心，例如区分"收入来源"或"具体产品形态"。
  `.trim()

    const systemPrompt = `${SYSTEM_PROMPT_BASE}

Task: 分析用户的愿景，判断是否模糊。如果模糊，提出1个最关键的澄清问题。
Output Format: JSON
{
  "is_ambiguous": boolean,
  "clarification_question": string | null (不超过20字)
}`

    try {
        const result = await glm.callJSON<{
            is_ambiguous: boolean
            clarification_question: string | null
        }>(userMessage, { systemPrompt })

        return result
    } catch (error) {
        console.error('[AI Clarify Error]', error)
        throw createError({
            statusCode: 500,
            message: 'AI处理失败，请重试'
        })
    }
})
