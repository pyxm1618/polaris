<template>
  <div class="glass-card step-card">
    <h2 class="step-title">专注领域</h2>
    <p class="step-desc">
      为了实现年度目标，你需要在哪些核心维度投入精力？
      <br>
      <span class="hint">这些标签将构成你日常任务的分类体系。</span>
    </p>

    <div class="domains-grid">
      <div 
        v-for="domain in allDomains" 
        :key="domain.id"
        class="domain-card"
        :class="{ selected: isSelected(domain.id) }"
        @click="toggleDomain(domain)"
      >
        <div class="card-content">
          <div class="text-group">
            <div class="name">{{ domain.name }}</div>
            <div class="desc">{{ domain.description }}</div>
          </div>
        </div>
        <div class="selection-ring"></div>
        <button 
          v-if="isCustom(domain.id)" 
          class="delete-btn"
          @click.stop="deleteCustomDomain(domain)"
        >
          <X class="icon-mini" />
        </button>
      </div>

      <!-- Add Custom Domain Button -->
      <div 
        class="domain-card add-card" 
        :class="{ 'is-input': isAdding }"
        @click="startAdding"
      >
        <div v-if="!isAdding" class="add-content">
          <Plus class="add-icon" />
          <span class="add-text">自定义标签</span>
        </div>
        <div v-else class="input-group" @click.stop>
          <div class="inputs-column">
            <input 
              ref="customInput"
              v-model="newDomainName"
              class="custom-input name-input"
              placeholder="标签名称"
              @keydown.enter="focusDesc"
            />
            <input 
              ref="descInput"
              v-model="newDomainDesc"
              class="custom-input desc-input"
              placeholder="一句话描述..."
              @keydown.enter="addCustomDomain"
            />
          </div>
          <button class="confirm-btn" @click.stop="addCustomDomain">
            <Check class="icon-mini" />
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Button Template (Inside loop) -->
    <!-- Note: This requires updating the v-for loop above, see next edit block -->

    <div class="actions">
      <button class="btn-ghost" @click="emit('back')">返回上一步</button>
      <button 
        class="btn-primary" 
        :disabled="modelValue.length === 0 || loading"
        @click="emit('finish')"
      >
        <Sparkles class="btn-icon" />
        {{ loading ? '正在生成规划...' : '生成年度排期' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sparkles, Plus, X, Check } from 'lucide-vue-next'

interface Domain {
  id: string
  name: string
  description: string
  color: string
}

const props = defineProps<{
  loading?: boolean
}>()

const modelValue = defineModel<Domain[]>({ required: true, default: () => [] })

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'finish'): void
}>()

// Tailored based on User Input
const predefinedDomains: Domain[] = [
  { 
    id: 'design', 
    name: '产品设计', 
    description: '界面交互与用户体验设计',
    color: 'pink' 
  },
  { 
    id: 'dev', 
    name: '技术研发', 
    description: '代码编写、架构与功能实现',
    color: 'blue' 
  },
  { 
    id: 'test', 
    name: '测试', 
    description: '功能验证、Bug 修复与调优',
    color: 'cyan' 
  },
  { 
    id: 'learning', 
    name: '学习知识', 
    description: '新技术探索与充电',
    color: 'purple' 
  },
  { 
    id: 'growth', 
    name: '运营推广', 
    description: '市场宣传与用户增长',
    color: 'orange' 
  },
  { 
    id: 'data', 
    name: '数据分析', 
    description: '指标监控与复盘分析',
    color: 'green' 
  },
  { 
    id: 'leisure', 
    name: '休闲娱乐', 
    description: '劳逸结合与状态恢复',
    color: 'teal' 
  }
]

const customDomains = ref<Domain[]>([])
const allDomains = computed(() => [...predefinedDomains, ...customDomains.value])

const isAdding = ref(false)
const newDomainName = ref('')
const newDomainDesc = ref('')
const customInput = ref<HTMLInputElement | null>(null)
const descInput = ref<HTMLInputElement | null>(null)

const isSelected = (id: string) => modelValue.value.some(d => d.id === id)
const isCustom = (id: string) => id.startsWith('custom-')

const toggleDomain = (domain: Domain) => {
  const index = modelValue.value.findIndex(d => d.id === domain.id)
  if (index === -1) {
    modelValue.value.push(domain)
  } else {
    modelValue.value.splice(index, 1)
  }
}

const deleteCustomDomain = (domain: Domain) => {
  // Remove from selection
  const selectedIndex = modelValue.value.findIndex(d => d.id === domain.id)
  if (selectedIndex !== -1) {
    modelValue.value.splice(selectedIndex, 1)
  }
  
  // Remove from custom list
  const customIndex = customDomains.value.findIndex(d => d.id === domain.id)
  if (customIndex !== -1) {
    customDomains.value.splice(customIndex, 1)
  }
}

const startAdding = async () => {
  isAdding.value = true
  await nextTick()
  customInput.value?.focus()
}

const focusDesc = () => {
  descInput.value?.focus()
}

const cancelAdding = () => {
  // Only cancel if clicking outside and fields are empty
  if (!newDomainName.value && !newDomainDesc.value) {
    isAdding.value = false
  }
}

const addCustomDomain = () => {
  if (!newDomainName.value.trim()) {
    isAdding.value = false
    return
  }
  
  const newDomain: Domain = {
    id: `custom-${Date.now()}`,
    name: newDomainName.value,
    description: newDomainDesc.value || '自定义标签',
    color: 'gray' // Default color for custom tags
  }
  
  customDomains.value.push(newDomain)
  modelValue.value.push(newDomain) // Auto select
  
  newDomainName.value = ''
  newDomainDesc.value = ''
  isAdding.value = false
}

// Global click handler to close input if clicking outside
// (Simplified: relying on basic blur or just button for now to avoid complexity)

onMounted(() => {
  if (modelValue.value.length === 0) {
    // Default select Product Design and Tech R&D
    if (predefinedDomains[0]) modelValue.value.push(predefinedDomains[0])
    if (predefinedDomains[1]) modelValue.value.push(predefinedDomains[1])
  }
})
</script>

<style scoped>
.step-card {
  max-width: 1000px;
  width: 100%;
  padding: 2rem;
  margin: 0 auto;
}

.step-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: white;
}

.step-desc {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.hint {
  font-size: 0.85rem;
  opacity: 0.7;
}

.domains-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.domain-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  align-items: center;
  min-height: 100px; /* Ensure height for consistency */
  padding-right: 2.5rem; /* Make room for delete button */
}

.domain-card:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
}

.domain-card.selected {
  background: rgba(var(--primary-rgb), 0.1);
  border-color: var(--primary);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  z-index: 1;
}

.text-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.domain-card.selected .name {
  color: white;
}

/* Selection Ring */
.selection-ring {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border: 2px solid var(--primary);
  border-radius: 16px;
  opacity: 0;
  transform: scale(0.95);
  transition: all 0.2s;
  pointer-events: none;
}

.domain-card.selected .selection-ring {
  opacity: 1;
  transform: scale(1);
}

/* Add Custom Card Styles */
.add-card {
  border-style: dashed;
  justify-content: center;
}

.add-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
}

.add-icon {
  width: 20px;
  height: 20px;
}

.add-card:hover .add-content {
  color: white;
}

.custom-input {
  background: transparent;
  border: none;
  font-size: 1rem;
  width: 100%;
  outline: none;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding: 0.2rem 0;
}

.custom-input::placeholder {
  color: rgba(255,255,255,0.3);
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 2rem;
}

.btn-primary {
  background: white;
  color: black;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255,255,255,0.2);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
}

.btn-ghost:hover {
  color: white;
}

.delete-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  z-index: 10;
  opacity: 0;
  transition: all 0.2s;
  border: none;
}

.domain-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: rgba(255, 59, 48, 0.2);
  color: #ff3b30;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding-right: 0.5rem;
}

.inputs-column {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.custom-input {
  background: transparent;
  border: none;
  font-size: 1rem;
  width: 100%;
  outline: none;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding: 0.2rem 0;
  transition: border-color 0.2s;
}

.custom-input:focus {
  border-bottom-color: var(--primary);
}

.name-input {
  color: white;
  font-weight: 600;
}

.desc-input {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.confirm-btn {
  background: rgba(255, 255, 255, 0.1);
  color: var(--primary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.confirm-btn:hover {
  background: var(--primary);
  color: black;
  border-color: var(--primary);
  transform: scale(1.05);
}

.icon-mini {
  width: 20px;
  height: 20px;
}
</style>
