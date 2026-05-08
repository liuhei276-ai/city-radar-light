<template>
  <div class="min-h-screen bg-radar-bg flex flex-col">
    <!-- 主内容区 -->
    <main class="flex-1 overflow-y-auto pb-20">
      <router-view />
    </main>

    <!-- 底部导航 -->
    <nav class="fixed bottom-0 left-0 right-0 bg-radar-card/95 backdrop-blur-lg border-t border-white/5 px-4 py-2 z-50">
      <div class="max-w-lg mx-auto flex justify-around items-center">
        <router-link
          v-for="tab in tabs"
          :key="tab.path"
          :to="tab.path"
          class="flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all duration-200"
          :class="$route.path === tab.path ? 'text-radar-accent' : 'text-radar-muted'"
        >
          <span class="text-xl">{{ tab.icon }}</span>
          <span class="text-xs font-medium">{{ tab.label }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
const tabs = [
  { path: '/', icon: '📡', label: '雷达' },
  { path: '/capture', icon: '📸', label: '拍照' },
  { path: '/matrix', icon: '🏢', label: '楼栋' },
]
</script>
