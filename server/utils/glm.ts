/**
 * DeepSeek API 封装类（OpenAI兼容格式）
 * 用于目标拆解模块的AI辅助功能
 */

interface ChatMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
}

interface ChatResponse {
    choices: Array<{
        message: {
            content: string
        }
    }>
}

interface CallOptions {
    systemPrompt?: string
    temperature?: number
    maxTokens?: number
}

/**
 * 通用系统提示词模板
 */
export const SYSTEM_PROMPT_BASE = `Role: 你是"独立开发者智能排期助手"的规划引擎，不仅是AI，更是用户的战略参谋长。
Tone: 专业、简洁、富有同理心。像一个经验丰富的高级技术合伙人。
Context: 用户是单兵作战的独立开发者，资源有限（时间/精力），需要将模糊愿景转化为可落地的行动。
Constraint: 
1. 输出必须是严格的 JSON 格式（除非特定对话场景）。
2. 不说废话，不使用通过式语句（如"好的，我明白了"）。
3. 始终考虑"可执行性"和"资源可行性"。`

export class GLMClient {
    private apiKey: string
    private baseURL = 'https://api.deepseek.com/v1/chat/completions'
    private model = 'deepseek-chat'

    constructor() {
        const config = useRuntimeConfig()
        this.apiKey = config.deepseekApiKey || config.glmApiKey || process.env.DEEPSEEK_API_KEY || process.env.GLM_API_KEY || ''

        if (!this.apiKey) {
            throw new Error('DEEPSEEK_API_KEY is not configured')
        }
    }

    /**
     * 调用 DeepSeek API
     */
    async call(
        userMessage: string,
        options: CallOptions = {}
    ): Promise<string> {
        const {
            systemPrompt = SYSTEM_PROMPT_BASE,
            temperature = 0.7,
            maxTokens = 2000
        } = options

        const messages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ]

        try {
            const response = await $fetch<ChatResponse>(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: {
                    model: this.model,
                    messages,
                    temperature,
                    max_tokens: maxTokens
                }
            })

            return response.choices[0]?.message?.content || ''
        } catch (error) {
            console.error('[DeepSeek API Error]', error)
            throw createError({
                statusCode: 500,
                message: 'DeepSeek API调用失败'
            })
        }
    }

    /**
     * 调用并解析JSON响应
     */
    async callJSON<T = any>(
        userMessage: string,
        options: CallOptions = {}
    ): Promise<T> {
        const content = await this.call(userMessage, options)

        try {
            // 尝试提取JSON（可能被markdown包裹）
            const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                content.match(/```\n?([\s\S]*?)\n?```/)

            const jsonStr = jsonMatch ? jsonMatch[1] : content
            return JSON.parse(jsonStr.trim())
        } catch (error) {
            console.error('[DeepSeek JSON Parse Error]', content)
            throw createError({
                statusCode: 500,
                message: 'DeepSeek返回格式错误，无法解析JSON'
            })
        }
    }

    /**
     * 带重试机制的调用
     */
    async callWithRetry<T = string>(
        userMessage: string,
        options: CallOptions = {},
        maxRetries = 2
    ): Promise<T> {
        let lastError: Error | null = null

        for (let i = 0; i <= maxRetries; i++) {
            try {
                if (options.temperature !== undefined || typeof ({} as T) !== 'string') {
                    return await this.callJSON<T>(userMessage, options)
                } else {
                    return await this.call(userMessage, options) as T
                }
            } catch (error) {
                lastError = error as Error
                if (i < maxRetries) {
                    // 指数退避：等待 2^i 秒
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
                }
            }
        }

        throw lastError
    }
}

/**
 * 单例实例
 */
let glmInstance: GLMClient | null = null

export function useGLM(): GLMClient {
    if (!glmInstance) {
        glmInstance = new GLMClient()
    }
    return glmInstance
}

