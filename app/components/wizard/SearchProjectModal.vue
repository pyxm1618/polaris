<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal-card">
        <div class="modal-header">
          <h3>从现有项目库选择</h3>
          <button class="close-btn" @click="$emit('cancel')">×</button>
        </div>

        <div class="modal-body">
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input 
              v-model="keyword"
              class="glass-input"
              placeholder="搜索项目名称..."
              autoFocus
              @input="handleSearch"
            />
          </div>

          <div v-if="loading" class="loading-state">
            加载中...
          </div>

          <div v-else-if="projects.length === 0" class="empty-state">
            <p>未找到相关项目</p>
          </div>

          <div v-else class="project-list">
            <div 
              v-for="project in projects" 
              :key="project.id"
              class="project-item"
              @click="handleSelect(project)"
            >
              <div class="project-info">
                <div class="project-name">{{ project.name }}</div>
                <div class="project-meta">
                  <span class="domain-tag">{{ project.primaryDomain }}</span>
                  <span v-if="project.description" class="desc-preview">{{ project.description }}</span>
                </div>
              </div>
              <div class="add-icon">+</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'select', project: any): void
  (e: 'cancel'): void
}>()

const keyword = ref('')
const loading = ref(false)
const projects = ref<any[]>([])

// Debounce search
let timer: any = null
const handleSearch = () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(fetchProjects, 300)
}

const fetchProjects = async () => {
  loading.value = true
  try {
    const { projects: list } = await $fetch<{ projects: any[] }>('/api/projects', {
      params: { search: keyword.value }
    })
    projects.value = list || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

watch(() => props.show, (val) => {
  if (val) {
    keyword.value = ''
    fetchProjects()
  }
})

const handleSelect = (project: any) => {
  emit('select', project)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: rgba(30, 30, 40, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  width: 600px;
  max-width: 90%;
  height: 70vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: white;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
}

.modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-bar {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.5;
}

.glass-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
}

.project-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.project-item {
  padding: 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.project-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.project-name {
  color: white;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.project-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.domain-tag {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.desc-preview {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
}

.project-item:hover .add-icon {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.loading-state, .empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
}
</style>
