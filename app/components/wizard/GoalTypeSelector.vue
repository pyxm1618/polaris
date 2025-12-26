<script setup lang="ts">
import { Wallet, Rocket, Megaphone, GraduationCap } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const goalTypes = [
  {
    id: 'revenue',
    title: '搞钱',
    icon: Wallet,
    desc: '2025, 我要赚到...',
    placeholder: '¥ [ 目标金额 ] 万',
    hint: '普通开发者: 20-50万 / 高手: 50-200万'
  },
  {
    id: 'product',
    title: '做产品',
    icon: Rocket,
    desc: '做出一款用户量达到...',
    placeholder: '[ 目标用户数 ] 人',
    hint: 'MVP验证期: 100-1000 / 增长期: 1w+'
  },
  {
    id: 'influence',
    title: '做网红',
    icon: Megaphone,
    desc: '全网粉丝/订阅数达到...',
    placeholder: '[ 目标粉丝数 ] 人',
    hint: '垂直领域: 1w / 大众领域: 10w+'
  },
  {
    id: 'growth',
    title: '学技术',
    icon: GraduationCap,
    desc: '完成技术转型/学习...',
    placeholder: '如: 从后端转AI全栈',
    hint: null
  }
]
</script>

<template>
  <div class="selector-grid">
    <button
      v-for="type in goalTypes"
      :key="type.id"
      @click="emit('update:modelValue', type.id)"
      class="selector-card"
      :class="{ 'active': modelValue === type.id }"
    >
      <div class="icon-wrapper" :class="{ 'active': modelValue === type.id }">
        <component :is="type.icon" class="icon" />
      </div>
      
      <div class="card-title" :class="{ 'active': modelValue === type.id }">
        {{ type.title }}
      </div>
      
      <div class="card-desc" :class="{ 'active': modelValue === type.id }">
        {{ type.desc }}
      </div>
    </button>
  </div>
</template>

<style scoped>
.selector-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.selector-card {
  position: relative;
  padding: 1rem;
  border-radius: 0.75rem; /* rounded-xl */
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.6); /* deeply dark bg */
  text-align: left;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.selector-card:hover {
  background: rgba(255, 255, 255, 0.1);
}

.selector-card.active {
  border-color: #60a5fa; /* blue-400 */
  background: rgba(59, 130, 246, 0.2); /* blue-500/20 */
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}

.icon-wrapper {
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1; /* slate-300 */
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
}

.icon-wrapper.active {
  background: #3b82f6; /* blue-500 */
  color: white;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.card-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: #e2e8f0; /* slate-200 */
}

.card-title.active {
  color: white;
}

.card-desc {
  font-size: 0.75rem;
  color: #94a3b8; /* slate-400 */
  opacity: 0.8;
}

.card-desc.active {
  color: #dbeafe; /* blue-100 */
}
</style>
