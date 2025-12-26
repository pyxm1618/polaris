<template>
  <div class="step-container">
    <div class="layout-wrapper">
      <!-- Left Sidebar: Project List -->
      <div class="projects-sidebar glass-panel">
        <h3 class="sidebar-title">项目列表</h3>
        <div class="project-list">
          <div 
            v-for="project in wizardStore.draft?.projects" 
            :key="project.tempId"
            class="project-item"
            :class="{ active: activeProjectId === project.tempId }"
            @click="activeProjectId = project.tempId"
          >
            <div class="project-icon">{{ getDomainIcon(project.primaryDomain) }}</div>
            <div class="project-info">
              <span class="name">{{ project.name }}</span>
              <span class="task-count">{{ getProjectTaskCount(project.tempId) }} 任务</span>
            </div>
            <div v-if="getProjectTaskCount(project.tempId) === 0" class="warning-dot"></div>
          </div>
        </div>
      </div>

      <!-- Main Content: Task Editor -->
      <div class="editor-panel glass-panel">
        <div v-if="activeProject" class="project-view">
          <div class="editor-header">
            <div class="header-info">
              <span class="domain-tag">{{ getDomainName(activeProject.primaryDomain) }}</span>
              <h2>{{ activeProject.name }}</h2>
            </div>
            <div class="header-actions">
              <button class="btn btn-sm btn-secondary" @click="handleManualAdd">
                + 手动添加
              </button>
              <button 
                class="btn btn-sm btn-magic" 
                @click="showGenerateModal = true"
              >
                ✨ AI 拆解
              </button>
            </div>
          </div>

          <!-- Task List -->
          <div class="task-list-wrapper">
            <div v-if="projectTasks.length === 0" class="empty-state">
              <div class="empty-content">
                <span class="empty-icon">📝</span>
                <h3>还没有任务</h3>
                <p>使用 AI 快速拆解，或手动添加任务</p>
                <button class="btn btn-primary" @click="showGenerateModal = true">
                  开始 AI 拆解
                </button>
              </div>
            </div>

            <div v-else class="task-list">
              <div 
                v-for="(task, index) in projectTasks" 
                :key="task.tempId || index"
                class="task-item"
              >
                <div class="drag-handle">⋮⋮</div>
                <input 
                  v-model="task.name"
                  class="task-input name-input"
                  placeholder="任务名称"
                />
                
                <select v-model="task.domain" class="task-select domain-select">
                  <option v-for="d in domains" :key="d.value" :value="d.value">
                    {{ d.label }}
                  </option>
                </select>

                <div class="hours-input-wrapper">
                  <input 
                    v-model.number="task.estimatedHours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    class="task-input hours-input"
                  />
                  <span class="unit">h</span>
                </div>

                <button class="delete-btn" @click="removeTask(task)">×</button>
              </div>
            </div>
          </div>
          
          <div class="editor-footer">
            <p class="stats">
              共 {{ projectTasks.length }} 个任务，预计工时: {{ totalHours }}h
            </p>
          </div>
        </div>

        <div v-else class="no-selection">
          <p>请选择左侧项目开始拆解</p>
        </div>
      </div>
    </div>

    <div class="actions-footer">
       <button class="btn btn-secondary" @click="wizardStore.prevStep()">
        ← 上一步
      </button>
      <button class="btn btn-primary btn-lg" @click="validateAndNext">
        完成拆解，下一步 →
      </button>
    </div>

    <!-- AI Generation Modal -->
    <TaskGenerateModal 
      v-if="showGenerateModal"
      :show="showGenerateModal"
      :project-name="activeProject?.name"
      @confirm="handleAIGenerate"
      @cancel="showGenerateModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useWizardStore } from '~/stores/wizard'
import TaskGenerateModal from './TaskGenerateModal.vue'

const wizardStore = useWizardStore()
const activeProjectId = ref<string | null>(null)
const showGenerateModal = ref(false)

const domains = [
  { label: '研发', value: 'dev' },
  { label: '产品', value: 'product_design' },
  { label: '设计', value: 'design' },
  { label: '测试', value: 'test' },
  { label: '运营', value: 'growth' },
  { label: '学习', value: 'learning' },
  { label: '其他', value: 'other' }
]

onMounted(() => {
  if (wizardStore.draft?.projects?.length) {
    activeProjectId.value = wizardStore.draft.projects[0].tempId
  }
})

const activeProject = computed(() => 
  wizardStore.draft?.projects.find((p: any) => p.tempId === activeProjectId.value)
)

const projectTasks = computed(() => {
  if (!activeProjectId.value || !wizardStore.draft) return []
  return wizardStore.draft.tasks.filter((t: any) => t.projectId === activeProjectId.value)
})

const totalHours = computed(() => {
  return projectTasks.value.reduce((sum: number, t: any) => sum + (Number(t.estimatedHours) || 0), 0)
})

const getProjectTaskCount = (projectId: string) => {
  return wizardStore.draft?.tasks.filter((t: any) => t.projectId === projectId).length || 0
}

const getDomainIcon = (domain: string) => {
  const map: Record<string, string> = {
    dev: '💻', product_design: '📱', growth: '📈', learning: '📚', other: '📂'
  }
  return map[domain] || '📂'
}

const getDomainName = (domain: string) => {
  const map: Record<string, string> = {
    dev: '研发', product_design: '产品', growth: '运营', learning: '学习'
  }
  return map[domain] || domain
}

const handleManualAdd = () => {
  if (!activeProjectId.value || !wizardStore.draft) return
  
  wizardStore.draft.tasks.push({
    projectId: activeProjectId.value,
    name: '',
    domain: activeProject.value?.primaryDomain || 'other',
    estimatedHours: 1,
    sequenceOrder: projectTasks.value.length
  })
}

const removeTask = (task: any) => {
  if (!wizardStore.draft) return
  const idx = wizardStore.draft.tasks.indexOf(task)
  if (idx > -1) {
    wizardStore.draft.tasks.splice(idx, 1)
  }
}

const handleAIGenerate = async (tasks: any[]) => {
  if (!activeProjectId.value || !wizardStore.draft) return
  showGenerateModal.value = false
  
  // Clear existing or Append? Let's append but warn implementation later.
  // For now, append.
  
  const newTasks = tasks.map((t, i) => ({
    projectId: activeProjectId.value!,
    name: t.name,
    domain: t.domain || 'dev',
    estimatedHours: t.estimated_hours || 1,
    sequenceOrder: projectTasks.value.length + i,
    rationale: t.rationale
  }))
  
  wizardStore.draft?.tasks.push(...newTasks)
  await wizardStore.saveDraft()
}

const validateAndNext = async () => {
  // Check if any project is empty
  const emptyProjects = wizardStore.draft?.projects.filter((p: any) => getProjectTaskCount(p.tempId) === 0)
  
  if (emptyProjects && emptyProjects.length > 0) {
    if (!confirm(`${emptyProjects.length} 个项目尚未拆解任务，确定要跳过吗？`)) {
      return
    }
  }
  
  await wizardStore.nextStep()
}
</script>

<style scoped>
.step-container {
  max-width: 1200px;
  margin: 0 auto;
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.layout-wrapper {
  display: flex;
  gap: 1.5rem;
  flex: 1;
  min-height: 0;
}

/* Sidebar */
.projects-sidebar {
  flex: 0 0 260px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.project-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.project-item {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  transition: all 0.2s ease;
  position: relative;
}

.project-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.project-item.active {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.project-icon {
  font-size: 1.25rem;
}

.project-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.project-info .name {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-info .task-count {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.warning-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #F59E0B;
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

/* Editor Panel */
.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

.project-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info h2 {
  margin: 0.25rem 0 0 0;
  font-size: 1.5rem;
  color: white;
}

.domain-tag {
  font-size: 0.75rem;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.875rem;
}

.btn-magic {
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  color: white;
  border: none;
}

/* Task List */
.task-list-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.1);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.task-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
}

.drag-handle {
  color: rgba(255, 255, 255, 0.2);
  cursor: grab;
  font-size: 1.2rem;
}

.task-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid transparent;
  color: white;
  padding: 0.25rem 0;
}

.task-input:focus {
  border-bottom-color: #667eea;
  outline: none;
}

.name-input {
  flex: 1;
  font-size: 1rem;
}

.task-select {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.8);
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.hours-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.hours-input {
  width: 40px;
  text-align: right;
  border: none;
}

.unit {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
}

.delete-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.2);
  padding: 0.25rem;
  cursor: pointer;
  font-size: 1.25rem;
}

.delete-btn:hover {
  color: #EF4444;
}

.editor-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(30, 30, 40, 0.5);
}

.stats {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  text-align: right;
}

/* Empty State */
.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-content {
  text-align: center;
  max-width: 300px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  display: block;
  opacity: 0.5;
}

.empty-content h3 {
  color: white;
  margin-bottom: 0.5rem;
}

.empty-content p {
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 2rem;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.actions-footer {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
}

.btn {
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
</style>
