<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal-card">
        <div class="modal-header">
          <h3>AI 智能任务拆解</h3>
          <button class="close-btn" @click="$emit('cancel')">×</button>
        </div>

        <div class="modal-body">
          <div class="ai-hint">
            <span class="icon">✨</span>
            <p>基于项目目标，为你生成完整的开发任务清单</p>
          </div>

          <div class="form-group">
            <label>交付物类型</label>
            <div class="chips-grid">
              <div 
                v-for="type in types" 
                :key="type"
                class="chip"
                :class="{ active: form.deliverableType === type }"
                @click="form.deliverableType = type"
              >
                {{ type }}
              </div>
              <input 
                v-if="!types.includes(form.deliverableType) && form.deliverableType" 
                v-model="form.deliverableType"
                class="chip active custom-input"
                placeholder="自定义..."
              />
            </div>
          </div>

          <div class="form-group">
            <label>包含的核心功能模块 (多选)</label>
            <div class="chips-grid">
              <div 
                v-for="feature in recommendedFeatures" 
                :key="feature"
                class="chip"
                :class="{ active: form.features.includes(feature) }"
                @click="toggleFeature(feature)"
              >
                {{ feature }}
              </div>
              <!-- Add Custom Functionality -->
              <div class="add-feature-wrapper">
                <input 
                  v-model="newFeature"
                  class="glass-input small"
                  placeholder="+ 添加功能"
                  @keyup.enter="addCustomFeature"
                />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>任务粒度偏好</label>
            <div class="granularity-options">
              <div 
                class="option-card"
                :class="{ active: form.granularity === 'day' }"
                @click="form.granularity = 'day'"
              >
                <div class="title">按天 (Day)</div>
                <div class="desc">4-16小时/任务</div>
              </div>
              <div 
                class="option-card"
                :class="{ active: form.granularity === 'week' }"
                @click="form.granularity = 'week'"
              >
                <div class="title">按周 (Week)</div>
                <div class="desc">20-40小时/任务</div>
              </div>
              <div 
                class="option-card"
                :class="{ active: form.granularity === 'session' }"
                @click="form.granularity = 'session'"
              >
                <div class="title">按次 (Session)</div>
                <div class="desc">2-4小时/任务</div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div class="tips">
            预计生成耗时: 10-20秒
          </div>
          <div class="buttons">
            <button class="btn btn-secondary" @click="$emit('cancel')">取消</button>
            <button 
              class="btn btn-magic" 
              :disabled="loading"
              @click="handleGenerate"
            >
              <span v-if="loading">✨ 拆解中...</span>
              <span v-else>✨ 开始生成</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
  projectName?: string
}>()

const emit = defineEmits<{
  (e: 'confirm', tasks: any[]): void
  (e: 'cancel'): void
}>()

const toast = useToast()
const loading = ref(false)
const newFeature = ref('')

const types = ['移动应用 (iOS/Android)', 'Web 网站', 'SaaS 平台', '微信小程序', '数据报表', '学习笔记']
const recommendedFeatures = ref(['用户登录/注册', '支付系统', '数据仪表盘', '设置页面', 'API对接'])

const form = reactive({
  deliverableType: types[0] || '默认类型',
  features: [] as string[],
  granularity: 'day'
})

const toggleFeature = (f: string) => {
  if (form.features.includes(f)) {
    form.features = form.features.filter(i => i !== f)
  } else {
    form.features.push(f)
  }
}

const addCustomFeature = () => {
  if (newFeature.value.trim()) {
    form.features.push(newFeature.value.trim())
    newFeature.value = ''
  }
}

const handleGenerate = async () => {
  if (form.features.length === 0) {
    toast.warning('请至少选择或输入一个功能模块')
    return
  }

  loading.value = true
  try {
    const { tasks } = await $fetch('/api/wizard/ai/generate-tasks', {
      method: 'POST',
      body: {
        projectName: props.projectName || '未命名项目',
        deliverableType: form.deliverableType,
        features: form.features,
        granularity: form.granularity
      }
    })
    
    emit('confirm', tasks)
  } catch (error) {
    console.error(error)
    toast.error('生成失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: rgba(30, 30, 40, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  width: 600px;
  max-width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: white;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
}

.modal-body {
  padding: 1.5rem;
}

.ai-hint {
  display: flex;
  gap: 0.75rem;
  background: rgba(139, 92, 246, 0.1);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  margin-bottom: 1.5rem;
  color: #a5b4fc;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.chips-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.chip {
  padding: 0.5rem 1rem;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip:hover {
  background: rgba(255, 255, 255, 0.1);
}

.chip.active {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8B5CF6;
  color: white;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.2);
}

.glass-input.small {
  padding: 0.4rem 0.8rem;
  font-size: 0.875rem;
  width: 120px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 99px;
  color: white;
}

.granularity-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.option-card {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}

.option-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

.option-card.active {
  border-color: #8B5CF6;
  background: rgba(139, 92, 246, 0.1);
}

.option-card .title {
  color: white;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.option-card .desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tips {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.4);
}

.buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  font-weight: 500;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.btn-magic {
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  color: white;
}

.btn-magic:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
