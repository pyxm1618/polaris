<script setup lang="ts">
import { Code2, PenTool, Briefcase, Building2, Package } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string[]
  goalType: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const pathways = [
  { id: 'saas', title: '独立开发/SaaS', icon: Code2, desc: 'App / 网站 / 插件' },
  { id: 'content', title: '内容变现', icon: PenTool, desc: '课程 / 专栏 / 电子书' },
  { id: 'outsource', title: '接单/外包', icon: Briefcase, desc: '技术咨询 / 定制开发' },
  { id: 'career', title: '职场/上班', icon: Building2, desc: '晋升 / 跳槽涨薪' },
  { id: 'other', title: '其他途径', icon: Package, desc: '电商 / 投资 / 实体' }
]

function toggle(id: string) {
  const newValue = props.modelValue.includes(id)
    ? props.modelValue.filter(v => v !== id)
    : [...props.modelValue, id]
  
  emit('update:modelValue', newValue)
}
</script>

<template>
  <div class="selector-tabs">
    <button
      v-for="pathway in pathways"
      :key="pathway.id"
      @click="toggle(pathway.id)"
      class="tab-item"
      :class="{ 'active': modelValue.includes(pathway.id) }"
    >
      <span class="tab-label">{{ pathway.title }}</span>
      <!-- 选中时的底部光条 -->
      <div v-if="modelValue.includes(pathway.id)" class="active-glow"></div>
    </button>
  </div>
</template>

<style scoped>
.selector-tabs {
  display: flex;
  flex-wrap: wrap; 
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.tab-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 999px; /* Pill shape */
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  color: #94a3b8; /* slate-400 */
  font-weight: 500;
  font-size: 0.95rem; /* Slightly larger text since no icon */
  transition: all 0.2s ease;
  overflow: hidden;
  cursor: pointer;
}

.tab-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
}

.tab-item.active {
  background: rgba(59, 130, 246, 0.15); /* blue-500/15 */
  color: white;
  border-color: rgba(96, 165, 250, 0.5); /* blue-400/50 */
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.1);
}

.active-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #60a5fa;
  box-shadow: 0 -2px 8px #60a5fa;
}
</style>
