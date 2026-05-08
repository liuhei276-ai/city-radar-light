<template>
  <div class="min-h-screen px-4 pt-12 pb-4">
    <!-- 标题 -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-radar-text">楼栋框选</h2>
      <div class="flex gap-2">
        <button @click="addRectangle" class="bg-radar-accent/20 text-radar-accent px-3 py-1.5 rounded-lg text-sm">
          ➕ 选框
        </button>
        <button @click="deleteSelected" class="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-sm">
          🗑️ 删除
        </button>
      </div>
    </div>

    <!-- Fabric.js Canvas 容器 -->
    <div class="card-glass mb-4 overflow-hidden" ref="canvasContainer">
      <canvas id="fabricCanvas" width="400" height="500"></canvas>
    </div>

    <!-- 操作提示 -->
    <div class="text-radar-muted text-xs mb-4 space-y-1">
      <p>💡 点击「选框」后在图片上拖动绘制楼栋区域</p>
      <p>💡 选中框后按「删除」移除</p>
      <p>💡 拖动框四角可调整大小</p>
    </div>

    <!-- 已选楼栋列表 -->
    <div class="space-y-2 mb-4">
      <div v-for="b in buildings" :key="b.id"
           class="card-glass flex items-center justify-between cursor-pointer"
           :class="{ 'neon-border': selectedId === b.id }"
           @click="selectBuilding(b.id)">
        <div>
          <p class="text-sm font-medium text-radar-text">{{ b.name || '未命名楼栋' }}</p>
          <p class="text-xs text-radar-muted">{{ b.floors }}层 · {{ b.units }}单元 · {{ unitLabel(b.unitType) }}</p>
        </div>
        <div class="flex gap-2">
          <button @click.stop="editBuilding(b.id)" class="text-radar-accent text-sm">✏️</button>
          <button @click.stop="saveBuilding(b)" class="text-radar-green text-sm">💾</button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="buildings.length === 0" class="text-center py-8">
      <p class="text-radar-muted text-sm">暂无楼栋，请框选并配置</p>
    </div>

    <!-- 楼栋配置弹窗 -->
    <div v-if="showConfig" class="fixed inset-0 bg-black/60 backdrop-blur z-50 flex items-end">
      <div class="w-full bg-radar-card rounded-t-2xl p-6 max-w-lg mx-auto">
        <h3 class="text-lg font-bold text-radar-text mb-4">楼栋配置</h3>

        <div class="space-y-4">
          <!-- 楼栋名称 -->
          <div>
            <label class="text-radar-muted text-xs block mb-1">楼栋名称</label>
            <input v-model="configForm.name" class="w-full bg-radar-dim rounded-xl px-4 py-2.5 text-radar-text text-sm border border-white/5 focus:border-radar-accent/50 outline-none" placeholder="如：3号楼" />
          </div>

          <!-- 层数 + 单元数 -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-radar-muted text-xs block mb-1">总层数</label>
              <input type="number" v-model.number="configForm.floors" class="w-full bg-radar-dim rounded-xl px-4 py-2.5 text-radar-text text-sm border border-white/5 focus:border-radar-accent/50 outline-none" placeholder="33" />
            </div>
            <div>
              <label class="text-radar-muted text-xs block mb-1">单元数</label>
              <input type="number" v-model.number="configForm.units" class="w-full bg-radar-dim rounded-xl px-4 py-2.5 text-radar-text text-sm border border-white/5 focus:border-radar-accent/50 outline-none" placeholder="2" />
            </div>
          </div>

          <!-- 梯户类型 -->
          <div>
            <label class="text-radar-muted text-xs block mb-1">梯户类型</label>
            <select v-model="configForm.unitType" class="w-full bg-radar-dim rounded-xl px-4 py-2.5 text-radar-text text-sm border border-white/5 focus:border-radar-accent/50 outline-none">
              <option v-for="u in unitTypes" :key="u.value" :value="u.value">{{ u.label }}</option>
            </select>
          </div>

          <!-- 底商 -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-radar-text">有底商</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="configForm.hasShop" class="sr-only peer" />
              <div class="w-11 h-6 bg-radar-dim rounded-full peer peer-checked:bg-radar-accent/50 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>

        <!-- 按钮 -->
        <div class="grid grid-cols-2 gap-3 mt-6">
          <button @click="showConfig = false" class="btn-secondary">取消</button>
          <button @click="saveConfig" class="btn-primary">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { fabric } from 'fabric'
import db from '../db.js'
import { unitTypes } from '../utils/helpers.js'

const route = useRoute()
const canvasContainer = ref(null)
const canvas = ref(null)
const buildings = ref([])
const selectedId = ref(null)
const showConfig = ref(false)
const editingBuildingId = ref(null)

const configForm = ref({
  name: '',
  floors: 33,
  units: 2,
  unitType: '2t4h',
  hasShop: false,
})

onMounted(async () => {
  await nextTick()
  initCanvas()

  // 如果有 photoId，加载已有楼栋
  const photoId = Number(route.query.photoId)
  if (photoId) {
    const existing = await db.buildings.where('photoId').equals(photoId).toArray()
    buildings.value = existing.map(b => ({ ...b }))
  }
})

function initCanvas() {
  const c = new fabric.Canvas('fabricCanvas', {
    width: canvasContainer.value?.clientWidth || 400,
    height: Math.min(canvasContainer.value?.clientHeight || 500, window.innerHeight * 0.5),
    backgroundColor: '#0f172a',
    selection: true,
  })
  canvas.value = c

  // 加载图片（如果有当前照片）
  loadCurrentPhoto(c)
}

async function loadCurrentPhoto(c) {
  const photoId = Number(route.query.photoId)
  if (!photoId) return

  const photo = await db.photos.get(photoId)
  if (!photo || !photo.imageData) return

  fabric.Image.fromURL(photo.imageData, (img) => {
    const maxW = c.width
    const maxH = c.height
    const scale = Math.min(maxW / img.width, maxH / img.height, 1)
    img.set({ scaleX: scale, scaleY: scale, left: 0, top: 0, selectable: false, evented: false })
    c.setWidth(img.width * scale)
    c.setHeight(img.height * scale)
    c.setBackgroundImage(img, c.renderAll.bind(c))
  })
}

function addRectangle() {
  if (!canvas.value) return
  const rect = new fabric.Rect({
    left: 50 + Math.random() * 100,
    top: 50 + Math.random() * 100,
    width: 120,
    height: 250,
    fill: 'rgba(34, 211, 238, 0.15)',
    stroke: '#22d3ee',
    strokeWidth: 2,
    cornerColor: '#22d3ee',
    cornerSize: 10,
    transparentCorners: false,
    name: `楼栋 ${buildings.value.length + 1}`,
  })
  canvas.value.add(rect)
  canvas.value.setActiveObject(rect)
  canvas.value.renderAll()

  // 添加到列表
  const id = Date.now()
  buildings.value.push({
    id,
    name: `楼栋 ${buildings.value.length + 1}`,
    floors: 33,
    units: 2,
    unitType: '2t4h',
    hasShop: false,
    fabricId: rect.__customId || id,
  })
  rect.__customId = id
}

function deleteSelected() {
  if (!canvas.value) return
  const active = canvas.value.getActiveObject()
  if (active) {
    const id = active.__customId
    buildings.value = buildings.value.filter(b => b.id !== id)
    canvas.value.remove(active)
    canvas.value.discardActiveObject()
    canvas.value.renderAll()
  }
}

function selectBuilding(id) {
  selectedId.value = id
  if (!canvas.value) return
  const objects = canvas.value.getObjects()
  const target = objects.find(o => o.__customId === id)
  if (target) {
    canvas.value.setActiveObject(target)
    canvas.value.renderAll()
  }
}

function editBuilding(id) {
  const b = buildings.value.find(x => x.id === id)
  if (!b) return
  editingBuildingId.value = id
  configForm.value = { ...b }
  showConfig.value = true
}

async function saveBuilding(b) {
  if (b.id) {
    await db.buildings.put(b)
  }
}

function unitLabel(val) {
  const u = unitTypes().find(x => x.value === val)
  return u ? u.label : val
}

function saveConfig() {
  const idx = buildings.value.findIndex(b => b.id === editingBuildingId.value)
  if (idx >= 0) {
    buildings.value[idx] = { ...buildings.value[idx], ...configForm.value }
  }
  showConfig.value = false
}
</script>
