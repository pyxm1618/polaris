<template>
  <div class="dashboard-header glass-panel">
    <!-- North Star Section -->
    <div class="north-star-section">
      <div class="label">我的年度北极星</div>
      <h1 class="north-star-title">{{ stats?.northStar?.title || '尚未设定北极星' }}</h1>
      <div class="header-row">
        <div class="year-badge">{{ stats?.northStar?.year || new Date().getFullYear() }}</div>
        <SignedOut v-if="!stats?.northStar">
          <SignInButton mode="modal">
            <button class="btn btn-primary btn-sm">✨ 开启新规划</button>
          </SignInButton>
        </SignedOut>
        <SignedIn v-if="!stats?.northStar">
          <NuxtLink to="/wizard" class="btn btn-primary btn-sm">
            ✨ 开启新规划
          </NuxtLink>
        </SignedIn>
      </div>
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

      <!-- Progress Circle (SVG) -->
      <div class="progress-ring">
        <svg class="ring-svg" width="60" height="60" viewBox="0 0 60 60">
          <circle 
            class="ring-bg" 
            cx="30" cy="30" r="26" 
            fill="none" 
            stroke-width="6"
          />
          <circle 
            class="ring-progress" 
            cx="30" cy="30" r="26" 
            fill="none" 
            stroke-width="6"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeDashoffset"
          />
        </svg>
        <div class="progress-text">{{ progressPercent }}%</div>
      </div>

      <!-- Auth Section -->
      <div class="auth-section">
        <SignedOut>
          <SignInButton mode="modal">
            <button class="btn btn-secondary btn-sm">
              登录 / 注册
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton after-sign-out-url="/" />
        </SignedIn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SignedIn, SignedOut, SignInButton, UserButton } from 'vue-clerk'

const props = defineProps<{
  stats: any
}>()

const progressPercent = computed(() => {
  if (!props.stats?.stats?.totalTasks) return 0
  return Math.round((props.stats.stats.completedTasks / props.stats.stats.totalTasks) * 100)
})

const radius = 26
const circumference = 2 * Math.PI * radius
const strokeDashoffset = computed(() => {
  return circumference - (progressPercent.value / 100) * circumference
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

/* Progress Ring */
.progress-ring {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-svg {
  transform: rotate(-90deg);
}

.ring-bg {
  stroke: rgba(255, 255, 255, 0.1);
}

.ring-progress {
  stroke: #667eea;
  transition: stroke-dashoffset 0.5s ease;
}

.progress-text {
  position: absolute;
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
}

.auth-section {
  margin-left: 1rem;
  display: flex;
  align-items: center;
}

</style>
