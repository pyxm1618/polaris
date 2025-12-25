<template>
  <div class="welcome-container">
    <div class="glass-card welcome-card">
      <h1>Conductor</h1>
      <p style="margin-bottom: 2rem; color: var(--text-secondary);">
        唯美 · 智能 · 极简
      </p>
      <div class="actions">
        <button class="btn-glass">开始规划 (Start)</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.welcome-card {
  text-align: center;
  max-width: 400px;
  width: 100%;
}

h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  text-shadow: 0 0 20px rgba(255,255,255,0.3);
}
</style>
