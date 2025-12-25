<template>
  <!-- Background Animation -->
  <div class="aurora-bg">
    <div class="aurora-blob aurora-blob-1"></div>
    <div class="aurora-blob aurora-blob-2"></div>
    <div class="aurora-blob aurora-blob-3"></div>
  </div>
  
  <!-- Main Content Area -->
  <div class="layout-container">
    <NuxtPage />
  </div>
</template>

<style>
.layout-container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
