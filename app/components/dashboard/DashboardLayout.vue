<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="sidebar glass-card">
      <div class="logo">
        <Sparkles class="logo-icon" />
        <span class="logo-text">Polaris</span>
      </div>

      <nav class="nav-links">
        <NuxtLink to="/dashboard" class="nav-item">
          <Home class="icon" />
          控制台
        </NuxtLink>
        <NuxtLink to="/north-star" class="nav-item">
          <Zap class="icon" />
          北极星
        </NuxtLink>
        <NuxtLink to="/calendar" class="nav-item">
          <Calendar class="icon" />
          日历
        </NuxtLink>
        <NuxtLink to="/settings" class="nav-item">
          <Settings class="icon" />
          设置
        </NuxtLink>
      </nav>

      <NuxtLink to="/settings" class="user-profile">
        <div class="avatar">
          <User class="avatar-icon" />
        </div>
        <div class="username">Solo Dev</div>
      </NuxtLink>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { Home, Zap, Calendar, Settings, Sparkles, User } from 'lucide-vue-next'
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  z-index: 10;
}

.sidebar {
  width: 250px;
  /* Use explicit height calculation and ensure it fits */
  height: calc(100vh - 3rem); 
  margin: 1.5rem; 
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-radius: 20px;
  backdrop-filter: blur(20px);
  box-sizing: border-box; /* Critical for padding to not add to height */
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
}

.logo-icon {
  width: 24px;
  height: 24px;
  color: var(--accent-glow);
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1; /* Pushes user profile to bottom */
  overflow-y: auto; /* Allow nav to scroll if too tall */
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover, .nav-item.router-link-active {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.icon {
  width: 20px;
  height: 20px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0; /* Prevent shrinking */
  text-decoration: none;
  color: white;
  transition: background 0.2s;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.1);
}

.avatar {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.avatar-icon {
  width: 20px;
  height: 20px;
}

.main-content {
  flex: 1;
  padding: 2vh;
  overflow-y: auto;
}
</style>
