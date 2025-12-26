<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal-card">
        <div class="modal-header">
          <h3>新建项目</h3>
          <button class="close-btn" @click="$emit('cancel')">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>项目名称</label>
            <input 
              v-model="form.name"
              class="glass-input"
              placeholder="如：个人记账APP开发"
              autoFocus
            />
          </div>

          <div class="form-group">
            <label>主要领域</label>
            <div class="domain-chips">
              <div 
                v-for="domain in domains" 
                :key="domain.value"
                class="domain-chip"
                :class="{ active: form.primaryDomain === domain.value }"
                :style="{ 
                  backgroundColor: form.primaryDomain === domain.value ? domain.color : 'rgba(255,255,255,0.05)',
                  borderColor: form.primaryDomain === domain.value ? domain.color : 'transparent'
                }"
                @click="form.primaryDomain = domain.value"
              >
                {{ domain.label }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>描述 (可选)</label>
            <textarea 
              v-model="form.description"
              class="glass-input"
              rows="3"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="$emit('cancel')">取消</button>
          <button 
            class="btn btn-primary" 
            :disabled="!form.name.trim()"
            @click="handleConfirm"
          >
            创建项目
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm', data: { name: string; primaryDomain: string; description: string }): void
  (e: 'cancel'): void
}>()

const form = reactive({
  name: '',
  primaryDomain: 'dev',
  description: ''
})

const domains = [
  { label: '研发', value: 'dev', color: '#3B82F6' },
  { label: '产品', value: 'product_design', color: '#8B5CF6' },
  { label: '运营', value: 'growth', color: '#F59E0B' },
  { label: '学习', value: 'learning', color: '#EF4444' },
  { label: '其他', value: 'other', color: '#6B7280' }
]

const handleConfirm = () => {
  emit('confirm', { ...form })
  // Reset
  form.name = ''
  form.description = ''
  form.primaryDomain = 'dev'
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
  width: 500px;
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

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.glass-input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
}

.domain-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.domain-chip {
  padding: 0.4rem 1rem;
  border-radius: 99px;
  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.domain-chip:hover {
  background: rgba(255, 255, 255, 0.1);
}

.domain-chip.active {
  color: white;
  font-weight: 500;
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
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

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
