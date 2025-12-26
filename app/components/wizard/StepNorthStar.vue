<template>
  <div class="step-container">
    <!-- Phase 1: Structured Input -->
    <div v-if="!showGoals" class="input-phase">
      <div class="glass-card main-card">
        <h2 class="step-title">你的 2026 北极星 (North Star) 🌟</h2>
        <p class="step-desc">让我们把模糊的愿景，变成清晰可执行的作战地图。</p>
        
        <div class="space-y-8 text-left">
          <!-- 1. Goal Type -->
          <div class="form-group">
            <label class="section-label">1. 今年最核心的追求是？</label>
            <GoalTypeSelector v-model="goalType" />
          </div>

          <!-- Target Value Input -->
          <div class="form-group" v-if="goalType">
            <div class="relative max-w-sm mx-auto">
              <input 
                v-model="targetValue"
                type="text" 
                class="glass-input w-full pr-12 text-center"
                :placeholder="targetPlaceholder"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">{{ targetUnit }}</span>
            </div>
            <p v-if="targetHint" class="text-sm text-blue-200/80 mt-3 text-center">💡 {{ targetHint }}</p>
          </div>

          <!-- 2. Pathway -->
          <div class="form-group" v-if="goalType">
            <label class="section-label">2. 计划靠什么实现？(多选)</label>
            <PathwaySelector 
              v-model="pathways" 
              :goal-type="goalType" 
            />
          </div>

          <!-- 3. Additional Context -->
          <div class="form-group" v-if="pathways.length > 0">
             <label class="section-label">3. 补充说明 (选填)</label>
             <textarea
              v-model="additionalDetails"
              class="glass-input w-full"
              rows="2"
              placeholder="例如：主要面向海外市场，准备使用 Nuxt 技术栈..."
             ></textarea>
          </div>
        </div>

        <!-- AI Thinking -->
        <div v-if="loading" class="ai-interaction">
          <div class="ai-thinking">
            <span class="pulse-icon">✨</span> 
            <span>正在分析你的画像与目标...</span>
          </div>
        </div>

        <div class="actions center mt-8">
          <button 
            class="btn btn-primary btn-lg" 
            :disabled="!canProceed || loading"
            @click="analyzeNorthStar"
          >
            开始拆解 →
          </button>
        </div>
      </div>
    </div>

    <!-- Phase 2: Select Goals -->
    <div v-else class="goals-phase">
      <div class="phase-header">
        <div class="profile-badge mb-4" v-if="inferredProfile">
           🤖 识别为: <span class="text-blue-300 font-bold">{{ inferredProfile }}</span>
        </div>
        <h2>为你拆解的季度目标</h2>
        <p>基于你的独立开发画像，我们建议关注以下关键节点</p>
      </div>

      <div class="goals-grid">
        <div 
          v-for="(goal, index) in suggestedGoals" 
          :key="index"
          class="goal-card glass-card"
          :class="{ selected: selectedIndices.includes(index) }"
          @click="toggleGoal(index)"
        >
          <div class="goal-header">
            <span class="quarter-badge">{{ goal.target_date_quarter }}</span>
            <input 
              v-model="goal.title"
              class="goal-title-input"
              @click.stop
            />
          </div>
          <p class="goal-reason">{{ goal.reason }}</p>
          <div class="check-icon">✓</div>
        </div>

        <!-- Add Custom Goal -->
        <div class="goal-card glass-card add-card" @click="addCustomGoal">
          <span class="plus-icon">+</span>
          <span>添加自定义目标</span>
        </div>
      </div>
      
      <div class="actions center">
        <button class="btn btn-secondary" @click="showGoals = false">
          ← 修改输入
        </button>
        <button class="btn btn-primary btn-lg" @click="confirmGoals">
          确认并继续 ({{ selectedIndices.length }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWizardStore } from '~/stores/wizard'
import GoalTypeSelector from './GoalTypeSelector.vue'
import PathwaySelector from './PathwaySelector.vue'

const wizardStore = useWizardStore()
const toast = useToast()

// Structured Inputs
const goalType = ref('revenue')
const targetValue = ref('')
const pathways = ref<string[]>([])
const additionalDetails = ref('')

// State
const loading = ref(false)
const showGoals = ref(false)
const inferredProfile = ref('') // AI推断的用户画像

const suggestedGoals = ref<Array<{
  title: string
  target_date_quarter: string
  reason?: string
}>>([])

const selectedIndices = ref<number[]>([])

// Placeholder Logic
const targetPlaceholder = computed(() => {
  const map: any = {
    revenue: '请输入目标金额 (万)',
    product: '请输入目标用户数',
    influence: '请输入目标粉丝数',
    growth: '例如: 从后端转AI'
  }
  return map[goalType.value] || '请输入目标'
})

const targetUnit = computed(() => {
  const map: any = { revenue: 'CNY', product: 'Users', influence: 'Fans', growth: '' }
  return map[goalType.value] || ''
})

const targetHint = computed(() => {
  const map: any = {
    revenue: '普通开发者: 20-50万 / 高手: 50-200万',
    product: 'MVP验证期: 100-1000 / 增长期: 1w+',
    influence: '垂直领域: 1w / 大众领域: 10w+',
    growth: null
  }
  return map[goalType.value] || null
})

const canProceed = computed(() => {
  return goalType.value && targetValue.value && pathways.value.length > 0
})

const analyzeNorthStar = async () => {
  if (!canProceed.value) return
  
  loading.value = true
  try {
    // 调用新的 API
    const response = await $fetch<{
      inferred_profile: string
      suggestions: any[]
    }>('/api/wizard/ai/suggest-goals', {
      method: 'POST',
      body: { 
        goalType: goalType.value,
        targetValue: targetValue.value,
        pathways: pathways.value,
        additionalContext: additionalDetails.value
      }
    })

    // AI 返回
    suggestedGoals.value = response.suggestions
    inferredProfile.value = response.inferred_profile || '独立开发者'
    selectedIndices.value = suggestedGoals.value.map((_: any, i: number) => i) // 默认全选
    showGoals.value = true

  } catch (error) {
    console.error(error)
    toast.error('AI思考超时，请重试')
  } finally {
    loading.value = false
  }
}

const toggleGoal = (index: number) => {
  if (selectedIndices.value.includes(index)) {
    selectedIndices.value = selectedIndices.value.filter(i => i !== index)
  } else {
    selectedIndices.value.push(index)
  }
}

const addCustomGoal = () => {
  suggestedGoals.value.push({
    title: '新目标...',
    target_date_quarter: 'Q4',
    reason: '用户自定义'
  })
  selectedIndices.value.push(suggestedGoals.value.length - 1)
}

const confirmGoals = async () => {
  if (selectedIndices.value.length === 0) {
    toast.warning('请至少选择一个目标')
    return
  }

  // 计算今年的年份
  const currentYear = new Date().getFullYear()

  // Update Store
  wizardStore.draft = {
    ...wizardStore.draft!,
    northStar: {
      title: `[${goalType.value}] ${targetValue.value} - by ${pathways.value.join(',')}`,
      year: currentYear
    },
    goals: selectedIndices.value.map((i: number) => {
      const g = suggestedGoals.value[i]
      if (!g) throw new Error('Goal data mismatch')
      
      return {
        tempId: crypto.randomUUID(),
        title: g.title,
        targetDate: calcDateFromQuarter(g.target_date_quarter, currentYear),
        reason: g.reason
      }
    }),
    projects: wizardStore.draft?.projects || [],
    tasks: wizardStore.draft?.tasks || [],
    preferences: wizardStore.draft?.preferences || {
      weeklyHoursLimit: 40,
      maxParallelProjects: 3,
      granularityPreference: 'day'
    }
  }

  await wizardStore.nextStep()
}

function calcDateFromQuarter(q: string, year: number): string {
  // Simple mapping: Q1 -> 03-31, etc.
  const map: Record<string, string> = {
    'Q1': '-03-31', 'Q2': '-06-30', 'Q3': '-09-30', 'Q4': '-12-31'
  }
  const suffix = map[q.toUpperCase()] || '-12-31'
  return `${year}${suffix}`
}
</script>

<style scoped>
.step-container {
  max-width: 900px;
  margin: 0 auto;
  animation: fade-in 0.5s ease;
}

.main-card {
  padding: 3rem;
  text-align: center;
}

.step-title {
  font-size: 2rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.step-desc {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 2rem;
}

.big-input {
  width: 100%;
  font-size: 1.25rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  transition: all 0.3s ease;
}

.big-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  outline: none;
}

.ai-interaction {
  margin: 2rem 0;
  min-height: 80px;
}

.ai-thinking {
  color: #a5b4fc;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.ai-clarification {
  text-align: left;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.ai-bubble {
  margin-bottom: 1rem;
}

.ai-header {
  font-size: 0.875rem;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.answer-input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

.actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-lg {
  padding: 1rem 3rem;
  font-size: 1.1rem;
}

/* Goals Phase */
.goals-phase {
  text-align: center;
}

.phase-header {
  margin-bottom: 3rem;
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.goal-card {
  padding: 1.5rem;
  text-align: left;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.goal-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.08);
}

.goal-card.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.15);
}

.goal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.quarter-badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.6rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
}

.goal-title-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid transparent;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  width: 100%;
  padding: 0.25rem 0;
}

.goal-title-input:focus {
  border-bottom-color: #667eea;
  outline: none;
}

.goal-reason {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}

.check-icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.goal-card.selected .check-icon {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-style: dashed;
  color: rgba(255, 255, 255, 0.5);
  min-height: 200px;
}

.add-card:hover {
  border-color: #667eea;
  color: #667eea;
}

.plus-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-label {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 1rem;
}

.profile-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  color: #a5b4fc;
}
</style>
