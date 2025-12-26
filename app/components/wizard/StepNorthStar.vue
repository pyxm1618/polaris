<template>
  <div class="step-container">
    <!-- Phase 1: Structured Input -->
    <div v-if="!showGoals" class="input-phase">
      <div class="glass-card main-card flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden">
        
        <!-- Decoration Background -->
        <div class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div class="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]"></div>
          <div class="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px]"></div>
        </div>

        <div class="z-10 w-full max-w-4xl flex flex-col items-center gap-12">
          
          <!-- 1. Top Tabs: Goal Type -->
          <div class="w-full flex flex-col items-center gap-4">
            <h2 class="text-xl font-medium text-slate-300">2025年，你的核心目标是？</h2>
            <GoalTypeSelector v-model="goalType" />
          </div>

            <!-- Hero Input: Target Value -->
          <div class="w-full" v-if="goalType">
            <div class="relative w-full max-w-2xl mx-auto group">
              <!-- Label Hint -->
              <div class="text-center text-slate-500 text-sm mb-2 uppercase tracking-widest font-medium">请输入目标数字</div>

              <!-- Input Field -->
              <input 
                v-model="targetValue"
                type="text" 
                class="hero-input"
                placeholder="0"
              />
              
              <!-- Unit Suffix (Absolute Positioned via CSS) -->
              <span class="hero-unit" :class="{ 'has-value': targetValue.length > 0 }">
                {{ targetUnit }}
              </span>

              <!-- Decorative Underline -->
               <div class="absolute bottom-4 left-1/4 right-1/4 h-[1px] bg-slate-700/50 group-hover:bg-slate-600/80 transition-colors"></div>
            </div>

            <!-- Context Helper / Hint -->
            <p v-if="targetHint" class="text-center mt-2 text-slate-400 font-light tracking-wide text-sm opacity-80">
               {{ targetHint }}
            </p>
          </div>

                <!-- 3. Bottom Section: Pathways & Context -->
          <div class="w-full flex flex-col items-center gap-12" v-if="targetValue">
             
             <!-- Pathway Selection -->
             <div class="w-full flex flex-col items-center gap-6 animate-fade-in-up">
                <label class="text-sm text-slate-500 uppercase tracking-widest font-medium opacity-80">实现路径 (多选)</label>
                <PathwaySelector v-model="pathways" :goal-type="goalType" />
             </div>

             <!-- Additional Details (Optional) -->
             <div class="w-full max-w-lg animate-fade-in-up" style="animation-delay: 0.1s">
                <div class="flex justify-center">
                  <input 
                    v-model="additionalDetails"
                    type="text"
                    class="details-input-simple"
                    placeholder="💡 补充一点细节？(例如：专注海外市场与 Nuxt)" 
                    style="margin-bottom: 1rem;" 
                  />
                </div>
             </div>

             <!-- Action Button -->
             <div class="flex justify-center pb-8 animate-fade-in-up" style="animation-delay: 0.2s">
                <button 
                  class="btn btn-primary btn-xl rounded-full px-16 py-5 text-xl shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:shadow-[0_0_50px_rgba(59,130,246,0.4)] transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 min-w-[240px]" 
                  :disabled="!canProceed || loading"
                  @click="analyzeNorthStar"
                >
                  <span v-if="loading" class="animate-pulse">✨ AI 思考中...</span>
                  <span v-else>开始规划</span>
                </button>
             </div>
          </div>

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

/* Hero Input Styles */
.hero-input {
  width: 100%;
  background: transparent;
  border: none;
  font-size: 5rem;
  font-weight: 700;
  text-align: center;
  color: white;
  padding: 1rem 4rem; /* Leave space for unit */
  outline: none;
  font-family: var(--font-sans);
  line-height: 1.1;
}

.hero-input::placeholder {
  color: rgba(255, 255, 255, 0.1);
}

.hero-unit {
  position: absolute;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 500;
  transition: all 0.3s ease;
}

.hero-unit.has-value {
  color: #60a5fa;
  opacity: 1;
}

/* Details Input Styles (Simple) */
.details-input-simple {
  width: 100%;
  max-width: 28rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem 0.5rem;
  text-align: center;
  color: #cbd5e1; /* slate-300 */
  font-size: 0.95rem;
  transition: all 0.3s ease;
  outline: none;
}

.details-input-simple::placeholder {
  color: rgba(255, 255, 255, 0.25);
  transition: color 0.3s;
}

.details-input-simple:focus {
  border-bottom-color: #60a5fa;
  background: rgba(255, 255, 255, 0.02);
}

.details-input-simple:focus::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Utility Overrides for this component */
.main-card {
  padding: 2rem;
  border: none; /* Clean look */
  background: transparent;
  box-shadow: none;
}

.btn-xl {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* Goals Phase existing styles... */
.goals-phase {
  text-align: center;
}
/* ... keep other necessary styles ... */


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
