<template>
  <div class="glass-card step-card">
    <h2 class="step-title">拆解里程碑 (Milestones)</h2>
    <p class="step-desc">
      为了达成 "{{ northStar }}"，你需要经历哪些关键节点？
      <br>
      <span class="hint">建议规划 3-4 个关键阶段（例如：MVP发布、首批用户、收入突破）</span>
    </p>

    <div class="milestones-list">
      <div 
        v-for="(item, index) in modelValue" 
        :key="index"
        class="milestone-item"
      >
        <div class="ms-index">Q{{ index + 1 }}</div>
        <input 
          v-model="item.title"
          class="glass-input ms-input"
          :placeholder="`第 ${index + 1} 阶段的目标是...`"
          @keyup.enter="focusNext(index)"
        />
        <button v-if="index > 0" class="btn-icon" @click="removeMilestone(index)">×</button>
      </div>
      
      <button 
        v-if="modelValue.length < 4"
        class="btn-ghost add-btn"
        @click="addMilestone"
      >
        + 添加里程碑
      </button>
    </div>

    <div class="actions">
      <button class="btn-ghost" @click="emit('back')">← 上一步</button>
      <button 
        class="btn-primary" 
        :disabled="!isValid"
        @click="emit('next')"
      >
        下一步 →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  northStar: string
}>()

const modelValue = defineModel<{ title: string }[]>({ default: () => [] })

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'next'): void
}>()

// Initialize with 1 empty milestone if empty
if (modelValue.value.length === 0) {
  modelValue.value.push({ title: '' })
}

const isValid = computed(() => modelValue.value.some(m => m.title.trim().length > 0))

const addMilestone = () => {
  if (modelValue.value.length < 4) {
    modelValue.value.push({ title: '' })
  }
}

const removeMilestone = (index: number) => {
  modelValue.value.splice(index, 1)
}

const focusNext = (index: number) => {
  // Logic to focus next input could go here, skipping for MVP simplicity
  if (index === modelValue.value.length - 1) addMilestone()
}
</script>

<style scoped>
.step-card {
  max-width: 700px;
  width: 100%;
  animation: float-in 0.6s ease-out;
}

.step-title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: white;
}

.step-desc {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.milestones-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.milestone-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: slide-up 0.3s ease-out;
}

.ms-index {
  font-family: serif;
  font-size: 1.2rem;
  color: var(--primary-light);
  width: 3rem;
  text-align: right;
}

.ms-input {
  flex: 1;
}

.add-btn {
  align-self: flex-start;
  margin-left: 4rem;
  font-size: 0.9rem;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.5rem;
}

.btn-icon:hover {
  color: var(--error);
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes float-in {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
