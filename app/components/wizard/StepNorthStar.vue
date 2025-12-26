<template>
  <div class="step-container">
    <!-- Phase 1: Input North Star -->
    <div v-if="!showGoals" class="input-phase">
      <div class="glass-card main-card">
        <h2 class="step-title">你的 2026 北极星 (North Star) 🌟</h2>
        <p class="step-desc">如果不考虑现实限制，你今年最想达成的一件事是什么？</p>
        
        <div class="input-group">
          <textarea
            v-model="northStar"
            class="glass-input big-input"
            placeholder="例如：做一款月入$1000的独立产品..."
            rows="3"
            :disabled="loading"
            @keyup.enter.ctrl="analyzeNorthStar"
          ></textarea>
        </div>

        <!-- AI Thinking / Clarification -->
        <div v-if="loading || clarification" class="ai-interaction">
          <div v-if="loading" class="ai-thinking">
            <span class="pulse-icon">✨</span> AI正在思考...
          </div>
          
          <div v-else-if="clarification" class="ai-clarification">
            <div class="ai-bubble">
              <div class="ai-header">🤖 需要一点澄清</div>
              <p>{{ clarification }}</p>
            </div>
            
            <input 
              v-model="clarificationAnswer"
              class="glass-input answer-input"
              placeholder="回答AI的提问..."
              @keyup.enter="analyzeNorthStar"
              autoFocus
            />
          </div>
        </div>

        <div class="actions">
          <button 
            class="btn btn-primary btn-lg" 
            :disabled="!northStar.trim() || loading"
            @click="analyzeNorthStar"
          >
            {{ clarification ? '提交回答' : '下一步' }} →
          </button>
        </div>
      </div>
    </div>

    <!-- Phase 2: Select Goals -->
    <div v-else class="goals-phase">
      <div class="phase-header">
        <h2>为你拆解的季度目标</h2>
        <p>基于你的愿景，建议关注以下关键节点（可修改）</p>
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
          ← 修改愿景
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

const wizardStore = useWizardStore()
const toast = useToast()
const northStar = ref(wizardStore.draft?.northStar?.title || '')
const clarificationAnswer = ref('')
const loading = ref(false)
const clarification = ref<string | null>(null)
const showGoals = ref(false)

const suggestedGoals = ref<Array<{
  title: string
  target_date_quarter: string
  reason?: string
}>>([])

const selectedIndices = ref<number[]>([])

// 如果已有草稿，恢复数据
onMounted(() => {
  if (wizardStore.draft?.goals?.length) {
    suggestedGoals.value = wizardStore.draft.goals.map(g => ({
      title: g.title,
      target_date_quarter: 'Q1', // 简化处理，实际应解析date
      reason: g.reason
    }))
    selectedIndices.value = suggestedGoals.value.map((_, i) => i)
    showGoals.value = true
  }
})

const analyzeNorthStar = async () => {
  if (!northStar.value.trim()) return
  
  loading.value = true
  try {
    // 1. 如果还没有澄清过，先调用澄清接口
    if (!clarification.value) {
      const { is_ambiguous, clarification_question } = await $fetch('/api/wizard/ai/clarify', {
        method: 'POST',
        body: { northStar: northStar.value }
      })

      if (is_ambiguous && clarification_question) {
        clarification.value = clarification_question
        loading.value = false
        return
      }
    }

    // 2. 生成目标建议
    const { suggestions } = await $fetch('/api/wizard/ai/suggest-goals', {
      method: 'POST',
      body: { 
        northStar: northStar.value,
        clarification: clarificationAnswer.value
      }
    })

    suggestedGoals.value = suggestions
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
      title: northStar.value + (clarificationAnswer.value ? ` (${clarificationAnswer.value})` : ''),
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
</style>
