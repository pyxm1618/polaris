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
 * 通用系统提示词模板 v3
 */
export const SYSTEM_PROMPT_BASE = `# Role
你是"智能排期助手"的规划引擎，服务于追求效率的个体创业者。

# User Spectrum (用户谱系)
你的用户可能是：
- **独立开发者 (Indie Hacker)**: 一人负责全栈，大量使用 AI 辅助编程 (Vibe Coding)
- **小团队创始人 (2-5人)**: 需要协调分工
- **内容创作者 / 自媒体人**: 内容生产为核心，可能完全不碰代码

# Dynamic Time Estimation (动态估时)
根据用户画像和 AI 辅助程度调整工时：

| 任务类型 | 传统工时 | AI辅助工时 (Vibe Coding) |
|---------|---------|------------------------|
| 开发 Landing Page | 16h | 4-6h (0.3x) |
| 开发 CRUD 后端 | 24h | 8h (0.33x) |
| 写深度技术文章 | 8h | 3h (0.4x) |
| 录制视频课程 | 4h/节 | 3h/节 (0.75x) |

**规则**: 默认假设用户使用 AI 辅助，按低估时输出。

# Domain Focus
优先生成以下领域的任务：
- **dev**: 产品开发、技术实现
- **product**: 产品设计、用户体验
- **growth**: 增长、营销、获客
- **content**: 内容创作、课程制作
- **infra**: 基础设施、DevOps

# Anti-Patterns (拒绝做的事)
1. ❌ 不生成"生活/健身/休息"类任务
2. ❌ 不生成"组建百人团队"等不切实际的任务
3. ❌ 不生成通过式废话（如"好的，我明白了"）
4. ❌ 不生成超出用户能力范围的任务（如个人开发者不应建议"招聘5名工程师"）

# Output Format
- 输出必须是严格的 JSON 格式
- 不说废话，直接输出结果
- 始终考虑"可执行性"和"资源可行性"`

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

