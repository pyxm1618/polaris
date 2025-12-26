<template>
  <div class="step-container">
    <div class="glass-card main-card">
      <div class="header">
        <h2 class="title">现实校验 (Reality Check)</h2>
        <p class="subtitle">让我们看看这个计划在现实中是否可行</p>
      </div>

      <div class="dashboard-grid">
        <!-- Total Load -->
        <div class="stat-card">
          <div class="label">总预估工时</div>
          <div class="value">{{ totalHours }}<span class="unit">h</span></div>
          <div class="sub">约 {{ (totalHours / 8).toFixed(1) }} 个标准人天</div>
        </div>

        <!-- Weekly Available -->
        <div class="stat-card interactive">
          <div class="label">每周投入时间</div>
          <div class="input-wrapper">
            <input 
              v-model.number="weeklyHours" 
              type="number" 
              class="glass-input"
              min="1"
              max="168"
            />
            <span class="unit">h</span>
          </div>
          <input 
            type="range" 
            v-model.number="weeklyHours" 
            min="5" 
            max="80" 
            step="5"
            class="range-slider"
          />
        </div>

        <!-- Projected Duration -->
        <div class="stat-card result" :class="feasibilityStatus">
          <div class="label">预计耗时</div>
          <div class="value">{{ durationWeeks }}<span class="unit">周</span></div>
          <div class="sub">约 {{ durationMonths }} 个月</div>
        </div>
      </div>

      <!-- Timeline Visualization -->
      <div class="timeline-section">
        <div class="timeline-header">
          <span>现在</span>
          <span class="target-date">预计完成: {{ projectedDate }}</span>
        </div>
        
        <div class="timeline-track">
          <div class="progress-bar" :style="{ width: '100%' }">
            <div 
              v-for="q in quarters" 
              :key="q.label"
              class="quarter-marker" 
              :style="{ left: q.percent + '%' }"
            >
              <div class="line"></div>
              <span class="text">{{ q.label }}</span>
            </div>
          </div>
        </div>

        <div class="feasibility-msg">
          <span class="icon">{{ feasibilityIcon }}</span>
          <span>{{ feasibilityMessage }}</span>
        </div>
      </div>

      <div class="actions">
         <button class="btn btn-secondary" @click="wizardStore.prevStep()">
          ← 调整任务
        </button>
        <button class="btn btn-primary btn-lg" @click="confirmAndNext">
          看起来可行，下一步 →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWizardStore } from '~/stores/wizard'

const wizardStore = useWizardStore()
const weeklyHours = ref(wizardStore.draft?.preferences.weeklyHoursLimit || 20)

// Watch changes and update store
watch(weeklyHours, (val) => {
  if (wizardStore.draft) {
    wizardStore.draft.preferences.weeklyHoursLimit = val
  }
})

const totalHours = computed(() => {
  if (!wizardStore.draft) return 0
  return wizardStore.draft.tasks.reduce((sum: number, t: any) => sum + (Number(t.estimatedHours) || 0), 0)
})

const durationWeeks = computed(() => {
  if (weeklyHours.value <= 0) return 0
  return Math.ceil(totalHours.value / weeklyHours.value)
})

const durationMonths = computed(() => (durationWeeks.value / 4.33).toFixed(1))

const projectedDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + durationWeeks.value * 7)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
})

// Feasibility Logic
const feasibilityStatus = computed(() => {
  const months = Number(durationMonths.value)
  if (months > 12) return 'impossible'
  if (months > 6) return 'hard'
  if (months > 3) return 'medium'
  return 'good'
})

const feasibilityIcon = computed(() => {
  const map = { impossible: '🔴', hard: '🟠', medium: '🟡', good: '🟢' }
  return map[feasibilityStatus.value]
})

const feasibilityMessage = computed(() => {
  const map = {
    impossible: '这是一个非常宏大的计划，建议分阶段执行或削减范围。',
    hard: '这需要持续半年的高强度投入，请确保你有足够的耐力。',
    medium: '这是一个适中的挑战，保持节奏可以按期完成。',
    good: '计划看起来非常稳健，你有很大机会提前完成！'
  }
  return map[feasibilityStatus.value]
})

// Timeline Visualization Mock
// In reality, this should calculate based on real time.
// For now, simple visual markers.
const quarters = computed(() => [
  { label: '3个月', percent: (13 / durationWeeks.value) * 100 > 100 ? 100 : (13 / durationWeeks.value) * 100 },
  { label: '6个月', percent: (26 / durationWeeks.value) * 100 > 100 ? 100 : (26 / durationWeeks.value) * 100 },
])

const confirmAndNext = async () => {
  if (feasibilityStatus.value === 'impossible') {
    if (!confirm('这个计划看起来极具挑战性，确定要继续吗？建议回到上一步削减任务。')) {
      return
    }
  }
  await wizardStore.nextStep()
}
</script>

<style scoped>
.step-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 0;
}

.main-card {
  padding: 3rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: white;
}

.subtitle {
  color: rgba(255, 255, 255, 0.5);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-card.interactive {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.2);
}

.stat-card.result.good { border-color: #10B981; background: rgba(16, 185, 129, 0.1); }
.stat-card.result.medium { border-color: #F59E0B; background: rgba(245, 158, 11, 0.1); }
.stat-card.result.hard { border-color: #F97316; background: rgba(249, 115, 22, 0.1); }
.stat-card.result.impossible { border-color: #EF4444; background: rgba(239, 68, 68, 0.1); }

.label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.5rem;
}

.value {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
  line-height: 1;
}

.unit {
  font-size: 1rem;
  margin-left: 0.25rem;
  font-weight: 500;
  opacity: 0.7;
}

.sub {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.input-wrapper {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.glass-input {
  width: 80px;
  background: transparent;
  border: none;
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
  text-align: right;
  padding: 0;
}

.glass-input:focus {
  outline: none;
}

.range-slider {
  width: 100%;
  accent-color: #667eea;
}

/* Timeline */
.timeline-section {
  margin-bottom: 3rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 2rem;
  border-radius: 16px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.timeline-track {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  position: relative;
  margin-bottom: 2rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  position: relative;
}

.quarter-marker {
  position: absolute;
  top: 0;
  bottom: -25px;
  width: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quarter-marker .line {
  height: 12px;
  width: 2px;
  background: rgba(255, 255, 255, 0.3);
  margin-bottom: 4px;
}

.quarter-marker .text {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
}

.feasibility-msg {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
}

.actions {
  display: flex;
  justify-content: space-between;
}

.btn {
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}
</style>
