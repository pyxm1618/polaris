<template>
  <div class="sidebar glass-panel">
    <div class="section">
      <h3 class="section-title">Views</h3>
      <div 
        class="nav-item" 
        :class="{ active: !selectedProjectId }"
        @click="$emit('select', null)"
      >
        <span class="icon">📋</span>
        <span class="text">All Tasks</span>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">Projects</h3>
      <div class="project-list">
        <div 
          v-for="project in projects" 
          :key="project.id"
          class="nav-item project-item"
          :class="{ active: selectedProjectId === project.id }"
          @click="$emit('select', project.id)"
        >
          <span class="dot" :style="{ background: getDomainColor(project.primary_domain) }"></span>
          <span class="text">{{ project.name }}</span>
          <span class="count" v-if="project.taskCount">{{ project.taskCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  projects: any[]
  selectedProjectId: string | null
}>()

const emit = defineEmits<{
  (e: 'select', id: string | null): void
}>()

const getDomainColor = (domain: string) => {
  const map: Record<string, string> = {
    dev: '#3B82F6',
    product_design: '#8B5CF6',
    growth: '#F59E0B',
    learning: '#EF4444',
    other: '#6B7280'
  }
  return map[domain] || '#6B7280'
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100%;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-title {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  padding-left: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-item.active {
  background: rgba(102, 126, 234, 0.1);
  color: #a5b4fc;
}

.icon {
  font-size: 1rem;
}

.text {
  font-size: 0.9rem;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.count {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
}
</style>
