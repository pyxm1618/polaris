/**
 * AI接口 - 场景3: 交付物转任务 (核心)
 * POST /api/wizard/ai/generate-tasks
 * 
 * 将项目交付物拆解为具体的开发任务列表
 */

export default defineEventHandler(async (event) => {
    const { projectName, deliverableType, features, granularity } = await readBody(event)

    if (!projectName || !deliverableType || !features || !granularity) {
        throw createError({
            statusCode: 400,
            message: '缺少必需参数: projectName, deliverableType, features, granularity'
        })
    }

    const glm = useGLM()

    const userMessage = `
[Input Context]
- 项目名称: "${projectName}"
- 交付物类型: "${deliverableType}"
- 包含功能模块: ${JSON.stringify(features)}
- 用户排期粒度偏好: "${granularity}"

[Instruction]
1. 粒度控制:
   - 若偏好"day": 任务粒度控制在 4-16 小时。
   - 若偏好"week": 任务粒度控制在 20-40 小时。
   - 若偏好"session": 任务粒度控制在 2-4 小时。
2. 覆盖完整流程: UI设计 -> 开发 -> 测试 -> 部署。
3. 估时(estimated_hours): 必须给出整数估值。
4. 域(domain): 从 [product_design, dev, test, growth, learning, data_analysis, other] 中选择。
5. 依赖推断: 逻辑上必须先做的任务排在前面。
  `.trim()

    const systemPrompt = `${SYSTEM_PROMPT_BASE}

Task: 将项目交付物拆解为具体的开发任务列表。

Output Format: JSON
{
  "tasks": [
    {
      "name": "任务名称",
      "domain": "dev",
      "estimated_hours": 8,
      "rationale": "为什么需要这个任务(可选)"
    }
  ]
}`

    try {
        const result = await glm.callJSON<{
            tasks: Array<{
                name: string
                domain: string
                estimated_hours: number
                rationale?: string
            }>
        }>(userMessage, { systemPrompt })

        return result
    } catch (error) {
        console.error('[AI Generate Tasks Error]', error)
        throw createError({
            statusCode: 500,
            message: 'AI处理失败，请重试'
        })
    }
})
