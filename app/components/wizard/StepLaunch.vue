<template>
  <div class="step-container">
    <div class="launch-content" v-if="!saving && !success">
      <div class="overview-header">
        <h2 class="title">准备启航</h2>
        <p class="subtitle">回顾你的年度作战计划</p>
      </div>

      <div class="plan-summary glass-card">
        <div class="summary-item highlight">
          <div class="label">北极星指标</div>
          <div class="value">{{ wizardStore.draft?.northStar.title }}</div>
        </div>
        
        <div class="stats-row">
          <div class="stat">
            <div class="num">{{ wizardStore.draft?.goals.length }}</div>
            <div class="txt">关键目标</div>
          </div>
          <div class="divider"></div>
          <div class="stat">
            <div class="num">{{ wizardStore.draft?.projects.length }}</div>
            <div class="txt">核心项目</div>
          </div>
          <div class="divider"></div>
          <div class="stat">
            <div class="num">{{ wizardStore.draft?.tasks.length }}</div>
            <div class="txt">具体任务</div>
          </div>
        </div>

        <div class="preview-list">
          <div class="preview-title">项目预览</div>
          <div class="preview-chips">
            <span 
              v-for="p in wizardStore.draft?.projects" 
              :key="p.tempId"
              class="project-chip"
            >
              {{ p.name }}
            </span>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-secondary" @click="wizardStore.prevStep()">
          ←以此为据，再做调整
        </button>
        <button class="btn btn-primary btn-lg btn-launch" @click="handleLaunch">
          🚀 确认计划，正式启航
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="saving" class="state-container">
      <div class="loader"></div>
      <h3>正在构建你的指挥中心...</h3>
      <p>保存目标、项目与任务数据</p>
    </div>

    <!-- Success State -->
    <div v-else class="state-container success-state">
      <div class="success-icon">🎉</div>
      <h3>计划已创建！</h3>
      <p>你的年度征程正式开始。</p>
      <button class="btn btn-primary" @click="handleFinish">
        进入 Dashboard
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWizardStore } from '~/stores/wizard'
import { useRouter } from 'vue-router'

const wizardStore = useWizardStore()
const router = useRouter()
const toast = useToast()
const saving = ref(false)
const success = ref(false)

const handleLaunch = async () => {
  saving.value = true
  try {
    if (!wizardStore.draft) throw new Error('No draft data')

    await $fetch('/api/wizard/save', {
      method: 'POST',
      body: {
        northStar: wizardStore.draft.northStar,
        goals: wizardStore.draft.goals,
        projects: wizardStore.draft.projects,
        tasks: wizardStore.draft.tasks
      }
    })

    // Do NOT reset draft yet, wait for user to click "Go to Dashboard"
    // The server side draft is deleted by the API already.
    
    // Simulate minimal delay for UX
    setTimeout(() => {
      saving.value = false
      success.value = true
    }, 800)

  } catch (error) {
    console.error(error)
    toast.error('保存失败，请重试')
    saving.value = false
  }
}

const handleFinish = async () => {
  await router.push('/dashboard')
  // Reset draft after navigation completes to avoid flashing Step 1
  setTimeout(() => {
    wizardStore.resetDraft()
  }, 100)
}
</script>

<style scoped>
.step-container {
  max-width: 600px;
  margin: 0 auto;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.launch-content {
  width: 100%;
}

.overview-header {
  text-align: center;
  margin-bottom: 2rem;
}

.title {
  font-size: 2rem;
  color: white;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: rgba(255, 255, 255, 0.5);
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 3rem;
}

.summary-item.highlight {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-item .label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.5rem;
}

.summary-item .value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #a5b4fc;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 2rem;
}

.stat {
  text-align: center;
}

.stat .num {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat .txt {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.1);
}

.preview-list {
  text-align: center;
}

.preview-title {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 1rem;
}

.preview-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.project-chip {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 99px;
  color: rgba(255, 255, 255, 0.7);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.btn {
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
}

.btn-secondary:hover {
  color: rgba(255, 255, 255, 0.8);
}

.btn-launch {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);
}

.btn-launch:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(118, 75, 162, 0.4);
}

/* State Containers */
.state-container {
  text-align: center;
  animation: fadeIn 0.5s ease;
}

.loader {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 2rem;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.state-container h3 {
  color: white;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.state-container p {
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 2rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
</style>
