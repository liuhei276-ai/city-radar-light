<template>
  <div class="min-h-screen px-4 pt-12 pb-4">
    <!-- 顶部信息栏 -->
    <div class="card-glass mb-4">
      <div class="flex items-center justify-between text-xs">
        <div class="flex items-center gap-2 text-radar-muted">
          <span>📍</span>
          <span>{{ positionText }}</span>
        </div>
        <div class="text-radar-accent">{{ currentTime }}</div>
      </div>
      <div class="mt-2 text-radar-yellow text-xs flex items-center gap-1">
        <span>{{ suggestion.icon }}</span>
        <span>{{ suggestion.text }}</span>
      </div>
    </div>

    <!-- 相机/预览区域 -->
    <div class="card-glass mb-4 overflow-hidden" :style="{ height: '60vh' }">
      <!-- 未拍照 → 显示拍摄引导 -->
      <div v-if="!imageData" class="h-full flex flex-col items-center justify-center gap-4">
        <div class="w-24 h-24 rounded-full bg-radar-accent/10 flex items-center justify-center">
          <span class="text-5xl">📸</span>
        </div>
        <p class="text-radar-muted text-sm">对准楼栋立面拍摄</p>
        <p class="text-radar-muted text-xs">建议使用 2x 以上长焦</p>
      </div>

      <!-- 已拍照 → 预览图片 -->
      <div v-else class="h-full relative">
        <img :src="imageData" class="w-full h-full object-contain" alt="预览" />
        <!-- 操作浮层 -->
        <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <button @click="rotateImage" class="bg-radar-bg/80 backdrop-blur px-4 py-2 rounded-xl text-sm text-radar-text">
            🔄 旋转
          </button>
          <button @click="imageData = null" class="bg-red-500/20 backdrop-blur px-4 py-2 rounded-xl text-sm text-red-400">
            ✕ 重拍
          </button>
        </div>
      </div>
    </div>

    <!-- 底部按钮区 -->
    <div class="space-y-3" v-if="!imageData">
      <!-- 拍照 (调用摄像头) -->
      <label class="btn-primary w-full flex items-center justify-center gap-2 text-lg cursor-pointer">
        <span>📷</span>
        <span>拍照</span>
        <input type="file" accept="image/*" capture="environment" class="hidden" @change="onFileChange" />
      </label>

      <!-- 从相册选择 -->
      <label class="btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer">
        <span>🖼️</span>
        <span>从相册选择</span>
        <input type="file" accept="image/*" class="hidden" @change="onFileChange" />
      </label>
    </div>

    <!-- 确认上传 -->
    <button v-else @click="confirmUpload" class="btn-primary w-full flex items-center justify-center gap-2 text-lg">
      <span>✅</span>
      <span>确认 & 框选楼栋</span>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import db from '../db.js'
import { formatTime, getTimeSuggestion, getPosition } from '../utils/helpers.js'

const router = useRouter()
const imageData = ref(null)
const currentTime = ref('')
const positionText = ref('获取位置中...')
const lat = ref(null)
const lng = ref(null)
const suggestion = getTimeSuggestion()
const rotation = ref(0)
let timer

onMounted(async () => {
  timer = setInterval(() => {
    currentTime.value = formatTime(new Date())
  }, 1000)
  currentTime.value = formatTime(new Date())

  const pos = await getPosition()
  if (pos.lat) {
    lat.value = pos.lat
    lng.value = pos.lng
    positionText.value = `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`
  } else {
    positionText.value = pos.error || '未知位置'
  }
})

onUnmounted(() => clearInterval(timer))

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    imageData.value = ev.target.result
  }
  reader.readAsDataURL(file)
}

function rotateImage() {
  // 简单 DOM 旋转
  rotation.value = (rotation.value + 90) % 360
}

async function confirmUpload() {
  const id = await db.photos.add({
    timestamp: new Date().toISOString(),
    imageData: imageData.value,
    lat: lat.value,
    lng: lng.value,
  })
  router.push({ path: '/matrix', query: { photoId: id } })
}
</script>
