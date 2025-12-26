<template>
  <DashboardLayout>
    <div class="calendar-page">
      <div class="header">
        <h1>{{ currentMonth }}</h1>
        <div class="year">{{ currentYear }}</div>
      </div>

      <div class="calendar-grid glass-card">
        <!-- Weekdays -->
        <div v-for="day in weekDays" :key="day" class="weekday-header">
          {{ day }}
        </div>

        <!-- Days -->
        <div 
          v-for="(date, index) in calendarDays" 
          :key="index"
          class="calendar-cell"
          :class="{ 
            'current-month': date.isCurrentMonth,
            'today': date.isToday,
            'weekend': date.isWeekend
          }"
        >
          <span class="day-number">{{ date.day }}</span>
          <div class="dots-container" v-if="date.hasEvents">
            <span class="dot"></span>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from '~/components/dashboard/DashboardLayout.vue'

const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const today = new Date()
const currentYear = today.getFullYear()
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const currentMonth = monthNames[today.getMonth()]

// Helper to generate calendar days
const getCalendarDays = () => {
  const days = []
  const firstDay = new Date(currentYear, today.getMonth(), 1)
  const lastDay = new Date(currentYear, today.getMonth() + 1, 0)
  
  // Previous month padding
  const startPadding = firstDay.getDay()
  const prevMonthLastDay = new Date(currentYear, today.getMonth(), 0).getDate()
  
  for (let i = startPadding - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: false,
      isWeekend: false
    })
  }

  // Current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dateToCheck = new Date(currentYear, today.getMonth(), i)
    days.push({
      day: i,
      isCurrentMonth: true,
      isWeekend: dateToCheck.getDay() === 0 || dateToCheck.getDay() === 6,
      isToday: i === today.getDate(),
      hasEvents: Math.random() > 0.7 // Mock events
    })
  }

  // Next month padding to fill 42 cells (6 rows)
  const remainingCells = 42 - days.length
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      isToday: false,
      isWeekend: false
    })
  }

  return days
}

const calendarDays = computed(() => getCalendarDays())
</script>

<style scoped>
.calendar-page {
  max-width: 1000px;
  margin: 0 auto;
  animation: fade-in 0.6s ease-out;
}

.header {
  margin-bottom: 2rem;
  color: white;
}

h1 {
  font-size: 3rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
}

.year {
  font-size: 1.5rem;
  opacity: 0.6;
  font-weight: 300;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
  overflow: hidden;
  padding: 1px;
}

.weekday-header {
  padding: 1.5rem 0.5rem;
  text-align: center;
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--accent-glow);
  background: rgba(0,0,0,0.2);
  letter-spacing: 0.1em;
}

.calendar-cell {
  background: rgba(30, 30, 40, 0.4); /* Darker default */
  min-height: 120px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s;
  color: rgba(255,255,255,0.3);
}

.calendar-cell:hover {
  background: rgba(255,255,255,0.05);
}

.calendar-cell.current-month {
  background: rgba(255,255,255,0.02);
  color: rgba(255,255,255,0.9);
}

.calendar-cell.today {
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(var(--primary-rgb), 0.2) 100%);
  border: 1px solid var(--primary);
  color: white;
  position: relative;
}

.calendar-cell.today::after {
  content: 'TODAY';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  font-weight: 900;
  opacity: 0.1;
  pointer-events: none;
}

.day-number {
  font-size: 1.2rem;
  font-weight: 500;
}

.dots-container {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.dot {
  width: 6px;
  height: 6px;
  background: var(--accent-glow);
  border-radius: 50%;
  box-shadow: 0 0 5px var(--accent-glow);
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
