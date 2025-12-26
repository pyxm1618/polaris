<template>
  <div class="stepper">
    <div class="stepper-track">
      <div 
        v-for="step in steps" 
        :key="step.number"
        class="stepper-item"
        :class="{ 
          active: step.number === currentStep,
          completed: step.number < currentStep 
        }"
      >
        <div class="stepper-circle">
          <span v-if="step.number < currentStep">✓</span>
          <span v-else>{{ step.number }}</span>
        </div>
        <div class="stepper-label">{{ step.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface StepperProps {
  currentStep: number
  totalSteps: number
}

const props = defineProps<StepperProps>()

const steps = computed(() => {
  const labels = ['战略定向', '项目映射', '任务拆解', '现实校验', '启航']
  return Array.from({ length: props.totalSteps }, (_, i) => ({
    number: i + 1,
    label: labels[i] || `步骤${i + 1}`
  }))
})
</script>

<style scoped>
.stepper {
  padding: 2rem 0;
}

.stepper-track {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.stepper-track::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 10%;
  right: 10%;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  z-index: 0;
}

.stepper-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

.stepper-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.stepper-item.active .stepper-circle {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}

.stepper-item.completed .stepper-circle {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
  color: #10b981;
}

.stepper-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  transition: color 0.3s ease;
}

.stepper-item.active .stepper-label {
  color: #fff;
  font-weight: 500;
}
</style>
