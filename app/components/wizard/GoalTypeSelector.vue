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
  <div class="selector-tabs">
    <button
      v-for="type in goalTypes"
      :key="type.id"
      @click="emit('update:modelValue', type.id)"
      class="tab-item"
      :class="{ 'active': modelValue === type.id }"
    >
      <component :is="type.icon" class="icon" />
      <span class="tab-label">{{ type.title }}</span>
      
      <!-- 选中时的底部光条 -->
      <div v-if="modelValue === type.id" class="active-glow"></div>
    </button>
  </div>
</template>

<style scoped>
.selector-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  width: fit-content;
  margin: 0 auto; /* Center horizontally */
}

.tab-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid transparent;
  background: transparent;
  color: #94a3b8; /* slate-400 */
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.tab-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
}

.tab-item.active {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
  opacity: 0.7;
}

.tab-item.active .icon {
  opacity: 1;
  color: #60a5fa; /* blue-400 */
}

.active-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #60a5fa;
  box-shadow: 0 -2px 10px #60a5fa;
}
</style>
