import { useState, useRef } from 'react'
import './MapEditor.css'
import Toolbar from './map-editor/Toolbar'
import LeftPanel from './map-editor/LeftPanel'
import MapCanvas from './map-editor/MapCanvas'
import RightPanel from './map-editor/RightPanel'
import { defaultRegions, terrainBrushes, colorBrushes } from './map-editor/data'

export default function MapEditor() {
  const [activeTool, setActiveTool] = useState('select')
  const [selectedRegion, setSelectedRegion] = useState('veridian')
  const [regions, setRegions] = useState(defaultRegions)
  const [activeBrush, setActiveBrush] = useState(null)
  const [brushSize, setBrushSize] = useState(40)
  const [brushMode, setBrushMode] = useState('smooth')
  const [brushStrokes, setBrushStrokes] = useState([])
  const canvasRef = useRef(null)

  const toggleRegionExpand = (id) => {
    setRegions(prev => prev.map(r =>
      r.id === id ? { ...r, expanded: !r.expanded } : r
    ))
  }

  const toggleVisibility = (id) => {
    setRegions(prev => prev.map(r =>
      r.id === id ? { ...r, visible: !r.visible } : r
    ))
  }

  const handleToolChange = (tool) => {
    setActiveTool(tool)
    if (tool === 'zoomin' && canvasRef.current?._zoomIn) {
      canvasRef.current._zoomIn()
    } else if (tool === 'zoomout' && canvasRef.current?._zoomOut) {
      canvasRef.current._zoomOut()
    }
  }

  return (
    <div className="map-editor">
      <Toolbar activeTool={activeTool} onToolChange={handleToolChange} />
      <div className="map-body">
        <LeftPanel
          activeBrush={activeBrush}
          onBrushSelect={setActiveBrush}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          brushMode={brushMode}
          onBrushModeChange={setBrushMode}
        />
        <MapCanvas
          ref={canvasRef}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          activeBrush={activeBrush}
          brushSize={brushSize}
          brushMode={brushMode}
          brushStrokes={brushStrokes}
          onAddBrushStroke={(stroke) => setBrushStrokes(prev => [...prev, stroke])}
        />
        <RightPanel
          regions={regions}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          onToggleExpand={toggleRegionExpand}
          onToggleVisibility={toggleVisibility}
        />
      </div>
    </div>
  )
}
