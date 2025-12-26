<template>
  <WizardFrame>
    <!-- Step 1: 战略定向 -->
    <StepNorthStar v-if="wizardStore.currentStep === 1" />

    <!-- Step 2: 项目映射 -->
    <StepProjects v-if="wizardStore.currentStep === 2" />

    <!-- Step 3: 任务拆解 -->
    <StepTasks v-if="wizardStore.currentStep === 3" />

    <!-- Step 4: 现实校验 -->
    <StepRealityCheck v-if="wizardStore.currentStep === 4" />

    <!-- Step 5: 启航 -->
    <StepLaunch v-if="wizardStore.currentStep === 5" />
  </WizardFrame>
</template>

<script setup lang="ts">
import { useWizardStore } from '~/stores/wizard'
import WizardFrame from '~/components/wizard/WizardFrame.vue'
import StepNorthStar from '~/components/wizard/StepNorthStar.vue'
import StepProjects from '~/components/wizard/StepProjects.vue'
import StepTasks from '~/components/wizard/StepTasks.vue'
import StepRealityCheck from '~/components/wizard/StepRealityCheck.vue'
import StepLaunch from '~/components/wizard/StepLaunch.vue'

const wizardStore = useWizardStore()

definePageMeta({
  layout: false // 使用全屏布局，不使用默认layout
})
</script>
