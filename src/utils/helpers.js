export function formatTime(date) {
  const d = date || new Date()
  return d.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export function getTimeSuggestion() {
  const h = new Date().getHours()
  if (h >= 19 && h < 21) return { text: '最佳拍摄时间 - 下班高峰期', icon: '🌆' }
  if (h >= 21 && h < 23) return { text: '主活跃期 - 入住高峰', icon: '🌃' }
  if (h >= 23 || h < 2) return { text: '深夜时段 - 入住稳定期', icon: '🌙' }
  return { text: '建议夜间拍摄，亮灯效果更明显', icon: '🌇' }
}

export function getPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: null, lng: null, error: '浏览器不支持定位' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({ lat: null, lng: null, error: '定位失败' }),
      { enableHighAccuracy: true, timeout: 5000 }
    )
  })
}

export function unitTypes() {
  return [
    { value: '1t2h', label: '一梯两户' },
    { value: '1t4h', label: '一梯四户' },
    { value: '2t4h', label: '两梯四户' },
    { value: '2t6h', label: '两梯六户' },
  ]
}
