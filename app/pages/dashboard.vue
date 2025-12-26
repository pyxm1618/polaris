<template>
  <DashboardLayout>
    <div v-if="pending">Loading cockpit...</div>
    <div v-else-if="error">Error loading data.</div>
    <div v-else class="dashboard-content">
      <NorthStarTracker 
        v-if="data"
        :north-star="data.northStar"
        :milestones="data.milestones" 
      />
      <DailyMissions 
        v-if="data"
        :tasks="data.todayTasks"
        @add="addTask"
        @toggle="toggleTask"
      />
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from '~/components/dashboard/DashboardLayout.vue'
import NorthStarTracker from '~/components/dashboard/NorthStarTracker.vue'
import DailyMissions from '~/components/dashboard/DailyMissions.vue'
import { useUser } from 'vue-clerk'

const { data, pending, error, refresh } = await useFetch('/api/dashboard')
const { user } = useUser()

const addTask = async (title: string) => {
  try {
    // Optimistic update (optional, but let's just refresh for MVP simplicity)
    await $fetch('/api/tasks/add', {
      method: 'POST',
      body: { title, userId: user.value?.id }
    })
    refresh()
  } catch (e) {
    console.error('Failed to add task', e)
  }
}

const toggleTask = async (task: any) => {
  // Optimistic UI update
  const newStatus = task.status === 'completed' ? 'pending' : 'completed'
  task.status = newStatus
  
  try {
    await $fetch('/api/tasks/update', {
      method: 'POST',
      body: { id: task.id, status: newStatus }
    })
    // No need to refresh for toggle usually, unless we want to sync timestamp
  } catch (e) {
    // Revert on error
    task.status = task.status === 'completed' ? 'pending' : 'completed'
    console.error('Failed to toggle task', e)
  }
}
</script>

<style scoped>
.dashboard-content {
  max-width: 900px;
  margin: 0 auto;
  animation: fade-in 0.5s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
