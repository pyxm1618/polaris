<template>
  <DashboardLayout>
    <div class="settings-page">
      <h1>设置 (Settings)</h1>
      
      <div class="section glass-card">
        <div class="user-header">
          <div class="avatar-large">
            <User class="icon-large" />
          </div>
          <div class="user-info">
            <h2>{{ user?.fullName || 'Solo Developer' }}</h2>
            <div class="email">{{ user?.primaryEmailAddress?.emailAddress || 'dev@polaris.app' }}</div>
          </div>
        </div>
      </div>

      <div class="settings-grid">
        <div class="setting-card glass-card">
          <div class="icon-box"><Paintbrush class="icon" /></div>
          <h3>外观</h3>
          <p>当前使用 "Ethereal Glass" 主题</p>
          <div class="toggle active"></div>
        </div>

        <div class="setting-card glass-card">
          <div class="icon-box"><Database class="icon" /></div>
          <h3>数据管理</h3>
          <p>数据已加密存储于 Turso 云端</p>
        </div>

         <div class="setting-card glass-card">
          <div class="icon-box"><Shield class="icon" /></div>
          <h3>隐私安全</h3>
          <p>账户保护已开启</p>
        </div>
      </div>

      <div class="actions">
        <button class="logout-btn" @click="handleSignOut">
          <LogOut class="icon-small" /> 退出登录 (Sign Out)
        </button>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from '~/components/dashboard/DashboardLayout.vue'
import { User, Paintbrush, Database, Shield, LogOut } from 'lucide-vue-next'
import { useClerk, useUser } from 'vue-clerk'

const { signOut } = useClerk()
const { user } = useUser()
const router = useRouter()

const handleSignOut = async () => {
  await signOut()
  router.push('/')
}
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
  animation: fade-in 0.6s ease-out;
}

h1 {
  color: white;
  margin-bottom: 2rem;
}

.section {
  padding: 2.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--accent-glow);
}

.icon-large {
  width: 40px;
  height: 40px;
  color: white;
}

.user-info h2 {
  margin: 0 0 0.5rem 0;
  color: white;
}

.email {
  color: var(--text-secondary);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.setting-card {
  padding: 2rem;
  background: rgba(255,255,255,0.03);
  transition: all 0.2s;
}

.setting-card:hover {
  background: rgba(255,255,255,0.08);
  transform: translateY(-2px);
}

.icon-box {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.icon {
  color: var(--accent-glow);
}

.setting-card h3 {
  color: white;
  margin: 0 0 0.5rem 0;
}

.setting-card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.actions {
  display: flex;
  justify-content: center;
}

.logout-btn {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
  border: 1px solid rgba(255, 59, 48, 0.2);
  padding: 1rem 3rem;
  border-radius: 50px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.logout-btn:hover {
  background: rgba(255, 59, 48, 0.2);
}

.icon-small {
  width: 18px;
  height: 18px;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
