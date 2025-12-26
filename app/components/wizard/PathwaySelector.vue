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
  <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
    <button
      v-for="item in pathways"
      :key="item.id"
      @click="toggle(item.id)"
      class="flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 h-28"
      :class="[
        modelValue.includes(item.id)
          ? 'border-blue-500 bg-blue-500/10 text-white shadow-lg shadow-blue-500/10'
          : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
      ]"
    >
      <component 
        :is="item.icon" 
        class="w-6 h-6 mb-2"
        :class="modelValue.includes(item.id) ? 'text-blue-400' : 'text-slate-500'" 
      />
      <div class="text-sm font-medium mb-0.5">{{ item.title }}</div>
      <div class="text-[10px] opacity-60 text-center leading-tight">{{ item.desc }}</div>
    </button>
  </div>
</template>
