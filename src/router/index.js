import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../pages/Dashboard.vue'
import Capture from '../pages/Capture.vue'
import BuildingMatrix from '../pages/BuildingMatrix.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard, meta: { title: '雷达' } },
  { path: '/capture', name: 'Capture', component: Capture, meta: { title: '拍照' } },
  { path: '/matrix', name: 'BuildingMatrix', component: BuildingMatrix, meta: { title: '楼栋' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
