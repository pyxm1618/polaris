<template>
  <div class="dashboard-header glass-panel">
    <!-- North Star Section -->
    <div class="north-star-section">
      <div class="label">我的年度北极星</div>
      <h1 class="north-star-title">{{ stats?.northStar?.title || '尚未设定北极星' }}</h1>
      <div class="year-badge">{{ stats?.northStar?.year || new Date().getFullYear() }}</div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-value">{{ stats?.time?.daysLeft || 0 }}</div>
        <div class="stat-label">本年剩余天数</div>
      </div>
      
      <div class="stat-divider"></div>

      <div class="stat-item">
        <div class="stat-value">{{ stats?.stats?.totalTasks || 0 }}</div>
        <div class="stat-label">总任务数</div>
      </div>

      <div class="stat-divider"></div>

      <div class="stat-item">
        <div class="stat-value highlight">{{ stats?.stats?.completedTasks || 0 }}</div>
        <div class="stat-label">已完成</div>
      </div>

      <!-- Progress Circle (Simple CSS implementation) -->
      <div class="progress-circle" :style="{ '--progress': progressPercent + '%' }">
        <div class="progress-text">{{ progressPercent }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  stats: any
}>()

const progressPercent = computed(() => {
  if (!props.stats?.stats?.totalTasks) return 0
  return Math.round((props.stats.stats.completedTasks / props.stats.stats.totalTasks) * 100)
})
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.north-star-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.north-star-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(90deg, #fff, #a5b4fc);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.year-badge {
  display: inline-block;
  background: rgba(102, 126, 234, 0.2);
  color: #a5b4fc;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  width: fit-content;
}

.stats-grid {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-value.highlight {
  color: #10B981;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.1);
}

/* Progress Circle */
.progress-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: conic-gradient(#667eea var(--progress), rgba(255, 255, 255, 0.1) 0deg);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.progress-circle::before {
  content: '';
  position: absolute;
  width: 52px;
  height: 52px;
  background: #1e1e28; /* Match bg color approximately */
  border-radius: 50%;
}

.progress-text {
  position: relative;
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
}
</style>
