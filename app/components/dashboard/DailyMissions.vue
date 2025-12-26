<template>
  <div class="missions-container glass-card">
    <div class="header">
      <h2>今日任务 (Mission)</h2>
      <div class="date">{{ new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'short', day: 'numeric' }) }}</div>
    </div>

    <div class="add-task-row">
      <input 
        v-model="newTaskTitle"
        type="text" 
        class="glass-input" 
        placeholder="+ 添加今日核心任务..."
        @keyup.enter="addTask"
      />
    </div>

    <div class="tasks-list">
      <div v-if="tasks.length === 0" class="empty-state">
        暂无任务。在上方输入，开启今天的征程吧！
      </div>
      
      <div 
        v-for="task in tasks" 
        :key="task.id" 
        class="task-item"
        :class="{ completed: task.status === 'completed' }"
      >
        <div class="checkbox" @click="toggleTask(task)">
          <div class="check-mark" v-if="task.status === 'completed'">✓</div>
        </div>
        <div class="task-content">
          <div class="task-title">{{ task.title }}</div>
          <div class="task-meta" v-if="task.domain_name">
            <span class="tag" :style="{ borderColor: task.domain_color }">{{ task.domain_name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  tasks: any[]
}>()

const emit = defineEmits<{
  (e: 'add', title: string): void
  (e: 'toggle', task: any): void
}>()

const newTaskTitle = ref('')

const addTask = () => {
  if (!newTaskTitle.value.trim()) return
  emit('add', newTaskTitle.value)
  newTaskTitle.value = ''
}

const toggleTask = (task: any) => {
  emit('toggle', task)
}
</script>

<style scoped>
.missions-container {
  min-height: 400px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 1rem;
}

h2 {
  margin: 0;
  color: white;
}

.date {
  color: var(--text-secondary);
  font-family: var(--font-sans);
}

.add-task-row {
  margin-bottom: 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
  font-style: italic;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  margin-bottom: 0.8rem;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.task-item:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.1);
}

.checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  margin-right: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.check-mark {
  color: var(--bg-color);
  font-size: 0.9rem;
  font-weight: bold;
}

.task-item.completed .checkbox {
  background: white;
  border-color: white;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  opacity: 0.5;
}

.task-content {
  flex: 1;
}

.task-title {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.tag {
  font-size: 0.8rem;
  padding: 0.1rem 0.5rem;
  border: 1px solid;
  border-radius: 10px;
  opacity: 0.8;
}
</style>
