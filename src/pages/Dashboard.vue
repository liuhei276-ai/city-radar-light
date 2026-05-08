<template>
  <div class="min-h-screen px-4 pt-12 pb-4">
    <!-- 顶部标题 -->
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-radar-accent text-glow tracking-wider">
        城市活跃度雷达
      </h1>
      <p class="text-radar-muted text-xs mt-1">团泊西 · 亮灯识别版</p>
    </div>

    <!-- 雷达脉冲动画 -->
    <div class="flex justify-center mb-8">
      <div class="relative w-36 h-36">
        <div class="absolute inset-0 rounded-full border border-radar-accent/20 radar-ring"></div>
        <div class="absolute inset-0 rounded-full border border-radar-accent/15 radar-ring"></div>
        <div class="absolute inset-0 rounded-full border border-radar-accent/10 radar-ring"></div>
        <div class="absolute inset-4 rounded-full bg-radar-accent/10 flex items-center justify-center">
          <span class="text-4xl">📡</span>
        </div>
        <!-- 旋转扫描线 -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-1 h-full bg-gradient-to-b from-transparent via-radar-accent/40 to-transparent origin-center animate-scan rounded-full"></div>
        </div>
      </div>
    </div>

    <!-- 4 个指标卡片 -->
    <div class="grid grid-cols-2 gap-3 mb-6">
      <div class="card-gradient animate-count">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">📸</span>
          <span class="text-radar-muted text-xs">采集总数</span>
        </div>
        <p class="text-3xl font-bold text-radar-accent">{{ stats.photoCount }}</p>
      </div>

      <div class="card-gradient animate-count" style="animation-delay: 0.1s">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">🏢</span>
          <span class="text-radar-muted text-xs">楼栋数</span>
        </div>
        <p class="text-3xl font-bold text-radar-green">{{ stats.buildingCount }}</p>
      </div>

      <div class="card-gradient animate-count" style="animation-delay: 0.2s">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">💡</span>
          <span class="text-radar-muted text-xs">平均亮灯率</span>
        </div>
        <p class="text-3xl font-bold text-radar-yellow">{{ stats.avgLightRate }}%</p>
      </div>

      <div class="card-gradient animate-count" style="animation-delay: 0.3s">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">📊</span>
          <span class="text-radar-muted text-xs">活跃指数</span>
        </div>
        <p class="text-3xl font-bold" :class="stats.activeIndex > 60 ? 'text-radar-green' : 'text-radar-yellow'">
          {{ stats.activeIndex }}
        </p>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="space-y-3">
      <button @click="goCapture" class="btn-primary w-full flex items-center justify-center gap-2 text-lg">
        <span>📸</span>
        <span>开始拍照</span>
      </button>

      <button @click="goMatrix" class="btn-secondary w-full flex items-center justify-center gap-2">
        <span>🏢</span>
        <span>楼栋管理</span>
      </button>
    </div>

    <!-- 提示 -->
    <div class="mt-6 text-center">
      <p class="text-radar-muted text-xs">
        {{ suggestion.text }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getStats } from '../db.js'
import { getTimeSuggestion } from '../utils/helpers.js'

const router = useRouter()
const stats = ref({ photoCount: 0, buildingCount: 0, avgLightRate: 0, activeIndex: 0 })
const suggestion = getTimeSuggestion()

onMounted(async () => {
  stats.value = await getStats()
})

function goCapture() {
  router.push('/capture')
}

function goMatrix() {
  router.push('/matrix')
}
</script>
