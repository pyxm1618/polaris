/**
 * AI接口 - 场景6: 项目推荐
 * POST /api/wizard/ai/recommend-projects
 * 
 * 分析目标内容，推荐最相关的现有项目
 */

export default defineEventHandler(async (event) => {
    const { goalTitle, existingProjects } = await readBody(event)

    if (!goalTitle || !existingProjects) {
        throw createError({
            statusCode: 400,
            message: '缺少必需参数: goalTitle, existingProjects'
        })
    }

    // 如果没有现有项目，直接返回空数组
    if (!Array.isArray(existingProjects) || existingProjects.length === 0) {
        return { recommendations: [] }
    }

    const glm = useGLM()

    const userMessage = `
[Input Context]
- 目标标题: "${goalTitle}"
- 用户已有项目列表: ${JSON.stringify(existingProjects)}

[Instruction]
1. 分析目标与每个项目的语义相关性。
2. 返回最相关的前3个项目（如不足3个则返回全部相关的）。
3. 为每个推荐给出简短的关联理由。
4. 如果没有任何相关项目，返回空数组。
  `.trim()

    const systemPrompt = `${SYSTEM_PROMPT_BASE}

Task: 分析目标内容，推荐最相关的现有项目。

Output Format: JSON
{
  "recommendations": [
    {
      "project_id": "xxx",
      "relevance_score": 0.85,
      "reason": "该项目的XX功能可直接支撑本目标"
    }
  ]
}`

    try {
        const result = await glm.callJSON<{
            recommendations: Array<{
                project_id: string
                relevance_score: number
                reason: string
            }>
        }>(userMessage, { systemPrompt })

        return result
    } catch (error) {
        console.error('[AI Recommend Projects Error]', error)
        throw createError({
            statusCode: 500,
            message: 'AI处理失败，请重试'
        })
    }
})
