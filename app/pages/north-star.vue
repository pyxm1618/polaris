<template>
  <DashboardLayout>
    <div v-if="pending" class="loading">加载星图数据...</div>
    <div v-else-if="error">加载失败，请重试</div>
    <div v-else class="northstar-page">
      
      <!-- Hero Section -->
      <section class="hero-section" v-if="data?.northStar">
        <div class="hero-content">
          <div class="label">MY NORTH STAR</div>
          <h1 class="main-goal">{{ data.northStar.title }}</h1>
        </div>
      </section>

      <!-- Milestones Grid -->
      <section class="milestones-section">
        <h2 class="section-title">年度里程碑 (2026 Roadmap)</h2>
        <div class="milestones-grid">
          <MilestoneCard 
            v-for="ms in (data?.milestones || [])" 
            :key="ms.id"
            :milestone="ms"
            @toggle="toggleMilestone"
          />
        </div>
      </section>

      <!-- Domains Overview -->
      <section class="domains-section">
        <h2 class="section-title">核心关注点 (Focus Domains)</h2>
        <div class="domains-list">
          <div v-for="domain in (data?.domains || [])" :key="domain.id" class="domain-tag glass-card">
            <span class="domain-color" :style="{ background: domain.color || '#ccc' }"></span>
            {{ domain.name }}
          </div>
        </div>
      </section>
      
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from '~/components/dashboard/DashboardLayout.vue'
import MilestoneCard from '~/components/northstar/MilestoneCard.vue'

const { data, pending, error, refresh } = await useFetch('/api/northstar/active')

const toggleMilestone = async (milestone: any) => {
  // Optimistic UI update
  const newStatus = milestone.status === 'completed' ? 'active' : 'completed'
  const oldStatus = milestone.status
  milestone.status = newStatus

  try {
    await $fetch('/api/milestones/update', {
      method: 'POST',
      body: { id: milestone.id, status: newStatus }
    })
    // 成功后无需操作，失败则回滚
  } catch (e) {
    milestone.status = oldStatus
    console.error('Update failed', e)
  }
}
</script>

<style scoped>
.northstar-page {
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: 4rem;
  animation: fade-in 0.6s ease-out;
}

.hero-section {
  text-align: center;
  padding: 4rem 2rem;
  margin-bottom: 3rem;
  position: relative;
}

.hero-section::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  background: var(--accent-glow);
  filter: blur(100px);
  opacity: 0.3;
  z-index: -1;
}

.label {
  font-size: 0.9rem;
  letter-spacing: 0.2em;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.main-goal {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  text-shadow: 0 4px 20px rgba(0,0,0,0.5);
}

.section-title {
  color: white;
  border-left: 4px solid var(--accent-glow);
  padding-left: 1rem;
  margin-bottom: 2rem;
}

.milestones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.domains-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.domain-tag {
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  border: 1px solid rgba(255,255,255,0.1);
}

.domain-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

@keyframes fade-in {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
</style>
