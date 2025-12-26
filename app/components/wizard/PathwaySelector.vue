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
  <div class="pathway-grid">
    <button
      v-for="item in pathways"
      :key="item.id"
      @click="toggle(item.id)"
      class="pathway-card"
      :class="{ 'active': modelValue.includes(item.id) }"
    >
      <component 
        :is="item.icon" 
        class="icon"
        :class="{ 'active': modelValue.includes(item.id) }"
      />
      <div class="card-title">{{ item.title }}</div>
      <div class="card-desc">{{ item.desc }}</div>
    </button>
  </div>
</template>

<style scoped>
.pathway-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .pathway-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

.pathway-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  height: 7rem; /* h-28 */
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.6); /* bg-slate-900/60 */
  color: #94a3b8; /* slate-400 */
  transition: all 0.2s ease;
  cursor: pointer;
}

.pathway-card:hover {
  background: rgba(255, 255, 255, 0.1);
}

.pathway-card.active {
  border-color: #60a5fa;
  background: rgba(59, 130, 246, 0.2);
  color: white;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
  margin-bottom: 0.5rem;
  color: #64748b; /* slate-500 */
}

.icon.active {
  color: #60a5fa; /* blue-400 */
}

.card-title {
  font-size: 0.875rem; /* text-sm */
  font-weight: 500;
  margin-bottom: 0.125rem;
}

.card-desc {
  font-size: 0.625rem; /* text-[10px] */
  opacity: 0.6;
  text-align: center;
  line-height: 1.25;
}
</style>
