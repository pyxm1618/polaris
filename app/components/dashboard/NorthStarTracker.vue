<template>
  <div class="tracker-card glass-card" v-if="northStar">
    <div class="header">
      <div class="label">2026 北极星 (North Star)</div>
      <h2 class="title">{{ northStar.title }}</h2>
    </div>

    <div class="progress-section">
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" :style="{ width: progress + '%' }">
          <div class="aurora-glow"></div>
        </div>
      </div>
      <div class="stats">
        <span>{{ completedMilestones }} / {{ totalMilestones }} 里程碑</span>
        <span>进度 {{ progress }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  northStar: any
  milestones: any[]
}>()

const totalMilestones = computed(() => props.milestones?.length || 0)
const completedMilestones = computed(() => props.milestones?.filter((m: any) => m.status === 'completed').length || 0)

const progress = computed(() => {
  if (totalMilestones.value === 0) return 0
  return Math.round((completedMilestones.value / totalMilestones.value) * 100)
})
</script>

<style scoped>
.tracker-card {
  margin-bottom: 2rem;
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
}

.label {
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  color: var(--accent-glow);
  margin-bottom: 0.5rem;
}

.title {
  font-size: 2rem;
  color: white;
  margin: 0 0 1.5rem 0;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.progress-bar-bg {
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  background: white;
  border-radius: 4px;
  position: relative;
  transition: width 1s ease-out;
}

.aurora-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, var(--aurora-1), var(--aurora-2));
  opacity: 0.7;
  filter: blur(4px);
}

.stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text-secondary);
}
</style>
