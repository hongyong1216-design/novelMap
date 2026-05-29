import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { demoWorld } from '../data/demoWorld'

const STORAGE_KEY = (novelId) => `novelmap:world:${novelId || 'default'}`

const seedState = () => ({
  markers: [...demoWorld.markers],
  labels: [...demoWorld.labels],
  regions: [...demoWorld.regions],
  routes: [...demoWorld.routes],
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
    setWorld((w) => ({
      ...w,
      markers: w.markers.filter((m) => m.id !== id),
    }))
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
    replaceAll,
    resetToSeed,
  }
}
