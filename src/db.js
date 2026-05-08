import Dexie from 'dexie'

const db = new Dexie('CityRadarLight')

db.version(1).stores({
  photos: '++id, timestamp, community, lat, lng',
  buildings: '++id, photoId, name, floors, units, unitType, hasShop, matrix',
  captureSessions: '++id, timestamp, photoCount, buildingCount',
})

export default db

// 辅助方法
export async function getStats() {
  const photoCount = await db.photos.count()
  const buildingCount = await db.buildings.count()
  const buildings = await db.buildings.toArray()
  
  let avgLightRate = 0
  if (buildings.length > 0) {
    const totalRate = buildings.reduce((sum, b) => {
      // 从 matrix 中计算亮灯率（如果有matrix数据的话）
      if (b.matrix) {
        const lit = b.matrix.filter(m => m === 1).length
        return sum + (lit / b.matrix.length) * 100
      }
      return sum
    }, 0)
    avgLightRate = Math.round(totalRate / buildings.length)
  }

  return {
    photoCount,
    buildingCount,
    avgLightRate,
    activeIndex: buildingCount > 0 ? Math.min(Math.round(avgLightRate * 0.8 + 10), 100) : 0,
  }
}
