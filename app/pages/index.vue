<template>
  <div class="dashboard-container">
    <DashboardHeader :stats="stats" v-if="stats" />
    
    <div class="content-wrapper">
      <ProjectSidebar 
        :projects="projects" 
        :selected-project-id="selectedProjectId"
        @select="handleSelectProject"
      />
      
      <div class="task-list-panel">
        <div class="panel-header">
          <h2 class="panel-title">{{ currentViewTitle }}</h2>
          <div class="filter-tabs">
            <button 
              class="tab-btn" 
              :class="{ active: statusFilter === 'todo' }"
              @click="statusFilter = 'todo'"
            >
              待办
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: statusFilter === 'done' }"
              @click="statusFilter = 'done'"
            >
              已完成
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: statusFilter === 'all' }"
              @click="statusFilter = 'all'"
            >
              全部
            </button>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          加载中...
        </div>

        <div v-else-if="tasks.length === 0" class="empty-state">
          <div class="empty-icon">☕️</div>
          <p>当前列表没有任务</p>
          <SignedOut>
            <SignInButton mode="modal">
              <button class="btn btn-primary btn-sm">✨ 开启新规划</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <NuxtLink to="/wizard" class="btn btn-primary btn-sm">
              ✨ 开启新规划
            </NuxtLink>
          </SignedIn>
        </div>

        <div v-else class="tasks-container">
          <TaskItem 
            v-for="task in tasks" 
            :key="task.id" 
            :task="task" 
            @update="handleTaskUpdate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DashboardHeader from '~/components/dashboard/DashboardHeader.vue'
import ProjectSidebar from '~/components/dashboard/ProjectSidebar.vue'
import TaskItem from '~/components/dashboard/TaskItem.vue'
import { SignedIn, SignedOut, SignInButton } from 'vue-clerk'

// Data Refs
const stats = ref<any>(null)
const projects = ref<any[]>([])
const tasks = ref<any[]>([])
const loading = ref(true)

// Filters
const selectedProjectId = ref<string | null>(null)
const statusFilter = ref<'todo' | 'done' | 'all'>('todo')

// Computed
const currentViewTitle = computed(() => {
  if (!selectedProjectId.value) return 'All Tasks'
  const p = projects.value.find(p => p.id === selectedProjectId.value)
  return p ? p.name : 'Unknown Project'
})

// Validation for Hydration Mismatch: Initialize empty state
onMounted(async () => {
  await refreshData()
})

const refreshData = async () => {
  loading.value = true
  try {
    const [statsData, projectsData] = await Promise.all([
      $fetch('/api/dashboard/stats'),
      $fetch('/api/projects')
    ])
    
    stats.value = statsData
    projects.value = (projectsData as any).projects || []
    
    await fetchTasks()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const fetchTasks = async () => {
  try {
    const params: any = { status: statusFilter.value }
    if (selectedProjectId.value) params.projectId = selectedProjectId.value
    
    const { tasks: list } = await $fetch<{ tasks: any[] }>('/api/dashboard/tasks', { params })
    tasks.value = list
  } catch (error) {
    console.error(error)
  }
}

// Watch filters
watch([selectedProjectId, statusFilter], () => {
  fetchTasks()
})

const handleSelectProject = (id: string | null) => {
  selectedProjectId.value = id
}

// Handle task update from child
const handleTaskUpdate = (updatedTask: any) => {
  // Update local list
  const idx = tasks.value.findIndex(t => t.id === updatedTask.id)
  if (idx !== -1) {
    tasks.value[idx] = updatedTask
    
    // If filter is strict (todo/done), might need to remove
    if (statusFilter.value !== 'all' && updatedTask.status !== statusFilter.value) {
      tasks.value.splice(idx, 1)
    }
  }
  
  // Refresh stats (debounce ideally, but simple for now)
  refreshStats()
}

const refreshStats = async () => {
  try {
    stats.value = await $fetch('/api/dashboard/stats')
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 0;
  min-height: 100vh;
}

.content-wrapper {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.task-list-panel {
  flex: 1;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.panel-title {
  font-size: 1.5rem;
  color: white;
  margin: 0;
}

.filter-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.25rem;
  border-radius: 8px;
}

.tab-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  padding: 0.4rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 500;
}

.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 0;
  color: rgba(255, 255, 255, 0.4);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}


</style>
