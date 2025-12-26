<template>
  <div class="step-container">
    <div class="split-layout">
      <!-- Left: Goals List -->
      <div class="goals-panel glass-panel">
        <h3 class="panel-title">本季度目标</h3>
        <p class="panel-desc">选择目标，为它配置支撑项目</p>
        
        <div class="goals-list">
          <div 
            v-for="goal in wizardStore.draft?.goals" 
            :key="goal.tempId"
            class="goal-item"
            :class="{ active: activeGoalId === goal.tempId }"
            @click="activeGoalId = goal.tempId"
          >
            <div class="goal-content">
              <span class="goal-title">{{ goal.title }}</span>
              <span class="project-count" :class="{ empty: getGoalProjectCount(goal.tempId) === 0 }">
                {{ getGoalProjectCount(goal.tempId) }}个项目
              </span>
            </div>
            <div class="active-indicator"></div>
          </div>
        </div>
      </div>

      <!-- Right: Projects Wall -->
      <div class="projects-panel">
        <div class="panel-header">
          <h3 class="panel-title">
            {{ activeGoalId ? '关联项目' : '所有项目' }}
          </h3>
          
          <div class="add-project-wrapper">
            <button class="btn btn-primary btn-sm" @click="showAddMenu = !showAddMenu">
              + 添加支撑项目
            </button>
            
            <div v-if="showAddMenu" class="dropdown-menu glass-card">
              <div class="menu-item" @click="handleAIRecommend">
                <span class="icon">✨</span>
                <div class="text">
                  <div class="title">AI 智能推荐</div>
                  <div class="desc">基于目标自动匹配</div>
                </div>
              </div>
              <div class="menu-item" @click="showSearchModal = true; showAddMenu = false">
                <span class="icon">🔍</span>
                <div class="text">
                  <div class="title">从项目库选择</div>
                  <div class="desc">复用已有项目</div>
                </div>
              </div>
              <div class="menu-item" @click="showCreateModal = true; showAddMenu = false">
                <span class="icon">📝</span>
                <div class="text">
                  <div class="title">创建新项目</div>
                  <div class="desc">空白项目开始</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="projects-grid">
          <!-- Projects List -->
          <div 
            v-for="project in filteredProjects" 
            :key="project.tempId"
            class="project-card glass-card"
          >
            <div class="card-header">
              <span class="domain-tag" :style="{ backgroundColor: getDomainColor(project.primaryDomain) }">
                {{ getDomainName(project.primaryDomain) }}
              </span>
              <button class="remove-btn" @click.stop="removeProject(project.tempId)">×</button>
            </div>
            <h4 class="project-name">{{ project.name }}</h4>
            <p class="project-desc">{{ project.description || '暂无描述' }}</p>
            
            <div v-if="activeGoalId" class="link-action">
              <label class="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  :checked="project.goalIds.includes(activeGoalId)"
                  @change="toggleLink(project.tempId)"
                >
                <span class="checkmark"></span>
                <span class="label-text">关联此目标</span>
              </label>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredProjects.length === 0" class="empty-state">
            <div class="empty-icon">📂</div>
            <p>暂无关联项目，点击右上方添加</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <CreateProjectModal 
      :show="showCreateModal"
      @confirm="handleCreateProject"
      @cancel="showCreateModal = false"
    />

    <SearchProjectModal
      :show="showSearchModal"
      @select="handleSelectProject"
      @cancel="showSearchModal = false"
    />
    
    <div class="actions-footer">
      <button class="btn btn-secondary" @click="wizardStore.prevStep()">
        ← 上一步
      </button>
      <button class="btn btn-primary btn-lg" @click="validateAndNext">
        下一步 →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWizardStore } from '~/stores/wizard'
import CreateProjectModal from './CreateProjectModal.vue'
import SearchProjectModal from './SearchProjectModal.vue'

const wizardStore = useWizardStore()
const activeGoalId = ref<string | null>(null)
const showAddMenu = ref(false)
const showSearchModal = ref(false)
const showCreateModal = ref(false)

// Initialize: Set active goal to first one
onMounted(() => {
  if (wizardStore.draft?.goals?.length) {
    activeGoalId.value = wizardStore.draft.goals[0].tempId
  }
})

const filteredProjects = computed(() => {
  if (!wizardStore.draft) return []
  // If activeGoalId is set, show all projects? Or just linked ones?
  // User Requirement: "Click Goal -> Highlight Linked". Usually shows ALL projects, highlighting links.
  // But easier UI: Show ALL projects always, and show checkboxes to link/unlink for current goal.
  return wizardStore.draft.projects
})

const getGoalProjectCount = (goalId: string) => {
  return wizardStore.draft?.projects.filter((p: any) => p.goalIds.includes(goalId)).length || 0
}

const getDomainColor = (domain: string) => {
  // Mock colors
  const colors: Record<string, string> = {
    product_design: '#8B5CF6',
    dev: '#3B82F6',
    growth: '#F59E0B',
    learning: '#EF4444',
    other: '#6B7280'
  }
  return colors[domain] || colors.other
}

const getDomainName = (domain: string) => {
  const names: Record<string, string> = {
    product_design: '产品',
    dev: '研发',
    growth: '运营',
    learning: '学习'
  }
  return names[domain] || '其他'
}

const handleAIRecommend = async () => {
  showAddMenu.value = false
  if (!activeGoalId.value) return alert('请先选择一个目标')

  const goal = wizardStore.draft?.goals.find((g: any) => g.tempId === activeGoalId.value)
  if (!goal) return

  // Call API (Mock for now, will implement real call)
  // const { recommendations } = await $fetch('/api/wizard/ai/recommend-projects', ...)
  
  // For now, let's create a Mock AI Project
  const newProject = {
    tempId: crypto.randomUUID(),
    name: `AI推荐项目 (${goal.title.slice(0, 5)}...)`,
    primaryDomain: 'dev',
    description: '由AI根据目标自动生成的建议项目',
    goalIds: [activeGoalId.value]
  }
  
  wizardStore.draft?.projects.push(newProject)
  await wizardStore.saveDraft()
}

const handleCreateProject = async (data: any) => {
  showCreateModal.value = false
  
  const newProject = {
    tempId: crypto.randomUUID(),
    name: data.name,
    primaryDomain: data.primaryDomain,
    description: data.description,
    goalIds: activeGoalId.value ? [activeGoalId.value] : []
  }
  
  wizardStore.draft?.projects.push(newProject)
  await wizardStore.saveDraft()
}

const handleSelectProject = async (project: any) => {
  showSearchModal.value = false
  
  // Check if already added
  const exists = wizardStore.draft?.projects.find((p: any) => p.name === project.name) // Simple check
  if (exists) {
    if (activeGoalId.value && !exists.goalIds.includes(activeGoalId.value)) {
      exists.goalIds.push(activeGoalId.value)
      await wizardStore.saveDraft()
      alert('已关联已有项目')
    } else {
      alert('该项目已在列表中')
    }
    return
  }

  const newProject = {
    tempId: crypto.randomUUID(),
    name: project.name,
    primaryDomain: project.primaryDomain || 'other',
    description: project.description,
    goalIds: activeGoalId.value ? [activeGoalId.value] : []
  }
  
  wizardStore.draft?.projects.push(newProject)
  await wizardStore.saveDraft()
}

const toggleLink = (projectId: string) => {
  if (!activeGoalId.value || !wizardStore.draft) return

  const project = wizardStore.draft.projects.find((p: any) => p.tempId === projectId)
  if (!project) return

  const idx = project.goalIds.indexOf(activeGoalId.value)
  if (idx > -1) {
    project.goalIds.splice(idx, 1)
  } else {
    project.goalIds.push(activeGoalId.value)
  }
  wizardStore.saveDraft()
}

const removeProject = (projectId: string) => {
  if (!confirm('确定移除该项目吗？') || !wizardStore.draft) return
  const idx = wizardStore.draft.projects.findIndex((p: any) => p.tempId === projectId)
  if (idx > -1) {
    wizardStore.draft.projects.splice(idx, 1)
    wizardStore.saveDraft()
  }
}

const validateAndNext = async () => {
  // Check if every goal has at least one project
  const unlinkedGoals = wizardStore.draft?.goals.filter((g: any) => getGoalProjectCount(g.tempId) === 0)
  
  if (unlinkedGoals && unlinkedGoals.length > 0) {
    if (!confirm(`有 ${unlinkedGoals.length} 个目标未关联任何项目，是否继续？`)) {
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
  height: calc(100vh - 200px); /* Adjust for header/footer */
  display: flex;
  flex-direction: column;
}

.split-layout {
  display: flex;
  gap: 2rem;
  flex: 1;
  min-height: 0; /* Important for scroll */
}

/* Left Panel */
.goals-panel {
  flex: 0 0 300px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.panel-title {
  font-size: 1.25rem;
  color: white;
  margin-bottom: 0.5rem;
}

.panel-desc {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 1.5rem;
}

.goals-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.goal-item {
  position: relative;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.goal-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.goal-item.active {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

.active-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: #667eea;
  border-radius: 0 4px 4px 0;
  transition: height 0.2s ease;
}

.goal-item.active .active-indicator {
  height: 60%;
}

.goal-title {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.project-count {
  font-size: 0.75rem;
  color: #10B981;
}

.project-count.empty {
  color: rgba(255, 255, 255, 0.4);
}

/* Right Panel */
.projects-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative;
}

.add-project-wrapper {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  width: 280px;
  z-index: 100;
  padding: 0.5rem;
  background: rgba(30, 30, 40, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.menu-item .icon {
  font-size: 1.5rem;
}

.menu-item .title {
  font-weight: 500;
  color: white;
}

.menu-item .desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.project-card {
  padding: 1.25rem;
  position: relative;
  transition: all 0.3s ease;
}

.project-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.domain-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  color: white;
  text-transform: capitalize;
}

.remove-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.remove-btn:hover {
  color: #EF4444;
}

.project-name {
  font-size: 1.1rem;
  color: white;
  margin-bottom: 0.5rem;
}

.project-desc {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 1rem;
}

.link-action {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 0.75rem;
}

/* Checkbox Style */
.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-wrapper input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 18px;
  width: 18px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-wrapper:hover .checkmark {
  background-color: rgba(255, 255, 255, 0.2);
}

.checkbox-wrapper input:checked ~ .checkmark {
  background-color: #667eea;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-wrapper input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-wrapper .checkmark:after {
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.label-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.checkbox-wrapper input:checked ~ .label-text {
  color: white;
}

/* Footer */
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

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 0;
  color: rgba(255, 255, 255, 0.3);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}
</style>
