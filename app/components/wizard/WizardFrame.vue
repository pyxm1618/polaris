<template>
  <div class="wizard-container">
    <!-- Stepper -->
    <Stepper :current-step="wizardStore.currentStep" :total-steps="wizardStore.totalSteps" />

    <!-- Draft Recovery Modal -->
    <DraftModal
      :show="showDraftModal"
      :draft-step="wizardStore.currentStep"
      @continue="handleContinueDraft"
      @restart="handleRestartDraft"
    />

    <!-- Wizard Content -->
    <div class="wizard-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWizardStore } from '~/stores/wizard'
import Stepper from './Stepper.vue'
import DraftModal from './DraftModal.vue'

const wizardStore = useWizardStore()
const router = useRouter()
const toast = useToast()
const showDraftModal = ref(false)

onMounted(async () => {
  await wizardStore.init()
  
  if (wizardStore.hasDraft) {
    showDraftModal.value = true
  }
})

const handleContinueDraft = async () => {
  await wizardStore.continueDraft()
  showDraftModal.value = false
}

const handleRestartDraft = async () => {
  await wizardStore.deleteDraftAndRestart()
  showDraftModal.value = false
}

const handleFinish = async () => {
  try {
    await wizardStore.finalSave()
    router.push('/dashboard')
  } catch (error) {
    console.error('[Wizard Finish Error]', error)
    toast.error('保存失败，请重试')
  }
}
</script>

<style scoped>
.wizard-container {
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.wizard-content {
  flex: 1;
  margin: 2rem 0;
}

.wizard-nav {
  display: flex;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.nav-spacer {
  flex: 1;
}

.btn {
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
