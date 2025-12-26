<template>
  <div class="task-item" :class="{ done: task.status === 'done' }">
    <div class="checkbox-wrapper">
      <input 
        type="checkbox" 
        :checked="task.status === 'done'"
        @change="toggleStatus"
        class="custom-checkbox"
      />
    </div>
    
    <div class="task-content">
      <div class="task-name">{{ task.name }}</div>
      <div class="task-meta">
        <span class="project-tag" v-if="task.project">
          {{ task.project.name }}
        </span>
        <span class="hours" v-if="task.estimatedHours">
          ⏱ {{ task.estimatedHours }}h
        </span>
      </div>
    </div>

    <!-- Domain Icon -->
    <div class="domain-icon" :title="task.domain">{{ getDomainIcon(task.domain) }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  task: any
}>()

const emit = defineEmits<{
  (e: 'update', task: any): void
}>()

const toggleStatus = async () => {
  const newStatus = props.task.status === 'done' ? 'todo' : 'done'
  
  // Optimistic update locally
  emit('update', { ...props.task, status: newStatus })

  try {
    await $fetch(`/api/tasks/${props.task.id}`, {
      method: 'PATCH',
      body: { status: newStatus }
    })
  } catch (error) {
    console.error('Update failed', error)
    // Revert on error
    emit('update', { ...props.task, status: props.task.status }) 
  }
}

const getDomainIcon = (domain: string) => {
  const map: Record<string, string> = {
    dev: '💻', product_design: '📱', growth: '📈', learning: '📚', other: '📂'
  }
  return map[domain] || '📂'
}
</script>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.task-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.task-item.done {
  opacity: 0.6;
}

.task-item.done .task-name {
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.4);
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
}

.custom-checkbox {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.custom-checkbox:checked {
  background: #10B981;
  border-color: #10B981;
}

.custom-checkbox:checked::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 14px;
  left: 3px;
  top: -1px;
}

.task-content {
  flex: 1;
}

.task-name {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin-bottom: 0.25rem;
  transition: all 0.2s ease;
}

.task-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.project-tag {
  background: rgba(102, 126, 234, 0.1);
  color: #a5b4fc;
  padding: 0 0.4rem;
  border-radius: 4px;
}

.domain-icon {
  font-size: 1.25rem;
  opacity: 0.5;
}
</style>
