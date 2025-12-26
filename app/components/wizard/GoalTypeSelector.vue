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
  <div class="grid grid-cols-2 gap-4">
    <button
      v-for="type in goalTypes"
      :key="type.id"
      @click="emit('update:modelValue', type.id)"
      class="relative p-4 rounded-xl border transition-all duration-200 group hover:bg-slate-800/50"
      :class="[
        modelValue === type.id 
          ? 'border-blue-400 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
          : 'border-white/10 bg-slate-900/40 text-slate-300 hover:border-white/20'
      ]"
    >
      <div 
        class="mb-3 p-2 w-fit rounded-lg transition-colors"
        :class="modelValue === type.id ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-300 group-hover:bg-white/20'"
      >
        <component :is="type.icon" class="w-5 h-5" />
      </div>
      
      <div class="font-medium mb-1" :class="modelValue === type.id ? 'text-white' : 'text-slate-200'">
        {{ type.title }}
      </div>
      
      <div class="text-xs opacity-70" :class="modelValue === type.id ? 'text-blue-100' : 'text-slate-400'">
        {{ type.desc }}
      </div>
    </button>
  </div>
</template>
