import L from 'leaflet'

// 反转 Simple CRS 的 y 方向: 让 lat=0 在屏幕顶部, lat 越大越往下 (跟屏幕坐标一致)
// 这样 cell (x=0, y=0) 落在左上, (x=gridSize-1, y=gridSize-1) 落在右下,
// 增大 gridSize 时新增的格子自然出现在右边和下边。
// 世界地图与子地图共用同一套坐标系, 故抽到这里。
export const TopDownSimpleCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0),
})
