import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { demoWorld } from '../data/demoWorld'
import savedSubMaps from '../data/subMaps.json'
import { emptySubMap, normalizeSubMap } from '../utils/subMap'

const STORAGE_KEY = (novelId) => `novelmap:world:${novelId || 'default'}`

// data/subMaps.json 由子地图窗口的"保存到项目"写入 (dev server 代笔),
// 每条 = { marker, subMap }。标记一起存, 换台机器 / 清了 localStorage 之后
// 这些子地图仍有入口可以点开。
const savedEntries = Object.values(savedSubMaps || {})

const seedState = () => ({
  markers: [...demoWorld.markers, ...savedEntries.map((e) => e.marker).filter(Boolean)],
  labels: [...demoWorld.labels],
  regions: [...demoWorld.regions],
  routes: [...demoWorld.routes],
  // markerId → 该标记自己的那张地图 (见 utils/subMap.js)
  subMaps: Object.fromEntries(
    Object.entries(savedSubMaps || {}).map(([id, e]) => [id, normalizeSubMap(e.subMap)])
  ),
})

const loadFromStorage = (novelId) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(novelId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      markers: parsed.markers || [],
      labels: parsed.labels || [],
      regions: parsed.regions || [],
      routes: parsed.routes || [],
      subMaps: parsed.subMaps || {},
    }
  } catch (e) {
    console.warn('[useWorldData] localStorage load failed:', e)
    return null
  }
}

const saveToStorage = (novelId, data) => {
  try {
    localStorage.setItem(STORAGE_KEY(novelId), JSON.stringify(data))
  } catch (e) {
    console.warn('[useWorldData] localStorage save failed:', e)
  }
}

const initialState = (novelId) => loadFromStorage(novelId) || seedState()

const genId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

export default function useWorldData() {
  const { novelId } = useParams()
  const [world, setWorld] = useState(() => initialState(novelId))

  // novelId 切换时重新加载 (虽然当前路由结构下罕见, 但保持健壮)
  const lastNovelId = useRef(novelId)
  useEffect(() => {
    if (lastNovelId.current !== novelId) {
      setWorld(initialState(novelId))
      lastNovelId.current = novelId
    }
  }, [novelId])

  // 任何变更都持久化
  useEffect(() => {
    saveToStorage(novelId, world)
  }, [novelId, world])

  // ---- markers ----
  const addMarker = useCallback((marker) => {
    const withId = { id: marker.id || genId('mk'), ...marker }
    setWorld((w) => ({ ...w, markers: [...w.markers, withId] }))
    return withId.id
  }, [])

  const updateMarker = useCallback((id, patch) => {
    setWorld((w) => ({
      ...w,
      markers: w.markers.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }))
  }, [])

  const removeMarker = useCallback((id) => {
    setWorld((w) => {
      // 标记删了, 它名下的子地图一并清掉, 不留孤儿数据
      const subMaps = { ...w.subMaps }
      delete subMaps[id]
      return {
        ...w,
        markers: w.markers.filter((m) => m.id !== id),
        subMaps,
      }
    })
  }, [])

  // ---- 子地图 (world.subMaps[markerId]) ----
  // 只暴露一个 updater: 格子 / 标记 / 标签的增删改都在调用方就近写,
  // 免得这里堆出三套一模一样的 CRUD
  const updateSubMap = useCallback((markerId, updater) => {
    if (!markerId) return
    setWorld((w) => {
      const prev = normalizeSubMap(w.subMaps?.[markerId])
      return { ...w, subMaps: { ...w.subMaps, [markerId]: updater(prev) } }
    })
  }, [])

  const resetSubMap = useCallback((markerId) => {
    if (!markerId) return
    setWorld((w) => ({ ...w, subMaps: { ...w.subMaps, [markerId]: emptySubMap() } }))
  }, [])

  // ---- labels ----
  const addLabel = useCallback((label) => {
    const withId = { id: label.id || genId('lb'), ...label }
    setWorld((w) => ({ ...w, labels: [...w.labels, withId] }))
    return withId.id
  }, [])

  const updateLabel = useCallback((id, patch) => {
    setWorld((w) => ({
      ...w,
      labels: w.labels.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }))
  }, [])

  const removeLabel = useCallback((id) => {
    setWorld((w) => ({
      ...w,
      labels: w.labels.filter((l) => l.id !== id),
    }))
  }, [])

  // ---- 整体替换 (用于 JSON 导入) ----
  const replaceAll = useCallback((next) => {
    setWorld({
      markers: next.markers || [],
      labels: next.labels || [],
      regions: next.regions || [],
      routes: next.routes || [],
      subMaps: next.subMaps || {},
    })
  }, [])

  // ---- 重置为种子 ----
  const resetToSeed = useCallback(() => {
    setWorld(seedState())
  }, [])

  return {
    novelId,
    world,
    addMarker,
    updateMarker,
    removeMarker,
    addLabel,
    updateLabel,
    removeLabel,
    updateSubMap,
    resetSubMap,
    replaceAll,
    resetToSeed,
  }
}
