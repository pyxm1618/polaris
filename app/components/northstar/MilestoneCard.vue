<template>
  <div class="milestone-card glass-card" :class="{ completed: isCompleted }">
    <div class="ms-header">
      <div class="quarter-badge">Q{{ milestone.quarter }}</div>
      <div class="status-indicator">
        <span class="status-dot" :class="milestone.status"></span>
        {{ statusText }}
      </div>
    </div>
    
    <div class="ms-content">
      <h3 class="ms-title">{{ milestone.title }}</h3>
    </div>

    <div class="ms-actions">
      <button 
        v-if="!isCompleted"
        class="action-btn"
        @click="$emit('toggle', milestone)"
      >
        <CheckCircle class="icon" />
        标记完成
      </button>
      <div v-else class="completion-stamp">
        <CheckCircle2 class="icon success" /> 已达成
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle, CheckCircle2 } from 'lucide-vue-next'

const props = defineProps<{
  milestone: any
}>()

defineEmits<{
  (e: 'toggle', milestone: any): void
}>()

const isCompleted = computed(() => props.milestone.status === 'completed')

const statusText = computed(() => {
  switch (props.milestone.status) {
    case 'completed': return '已完成'
    case 'active': return '进行中'
    default: return '待处理'
  }
})
</script>

<style scoped>
.milestone-card {
  padding: 1.5rem;
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.milestone-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.05);
}

.milestone-card.completed {
  opacity: 0.8;
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(var(--primary-rgb), 0.1) 100%);
}

.ms-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.quarter-badge {
  background: rgba(255,255,255,0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--accent-glow);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
}

.status-dot.active { background: var(--accent-glow); box-shadow: 0 0 5px var(--accent-glow); }
.status-dot.completed { background: var(--primary); }

.ms-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.2rem;
  line-height: 1.4;
  color: white;
}

.action-btn {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255,255,255,0.15);
}

.icon {
  width: 16px;
  height: 16px;
}

.completion-stamp {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary);
  font-weight: bold;
}

.icon.success {
  color: var(--primary);
}
</style>
