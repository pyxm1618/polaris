<template>
  <div class="toast-container">
    <TransitionGroup name="toast-slide">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item glass-card"
        :class="toast.type"
        role="alert"
      >
        <div class="toast-icon">
          <span v-if="toast.type === 'success'">✅</span>
          <span v-else-if="toast.type === 'error'">❌</span>
          <span v-else-if="toast.type === 'warning'">⚠️</span>
          <span v-else>ℹ️</span>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" @click="remove(toast.id)">×</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { toasts, remove } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  pointer-events: none; /* Allow clicks to pass through container */
}

.toast-item {
  pointer-events: auto;
  min-width: 300px;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-left: 4px solid;
  font-weight: 500;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.toast-close {
  margin-left: auto;
  background: transparent;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  line-height: 1;
  padding: 0 0.25rem;
  opacity: 0.6;
}

.toast-close:hover {
  opacity: 1;
}

/* Variants */
.success {
  border-color: #10B981;
  background: rgba(16, 185, 129, 0.1);
}
.error {
  border-color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
}
.warning {
  border-color: #F59E0B;
  background: rgba(245, 158, 11, 0.1);
}
.info {
  border-color: #3B82F6;
  background: rgba(59, 130, 246, 0.1);
}

/* Animations */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
