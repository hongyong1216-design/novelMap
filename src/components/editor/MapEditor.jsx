import { useState } from 'react'
import './MapEditor.css'
import Toolbar from './map-editor/Toolbar'
import LeftPanel from './map-editor/LeftPanel'
import MapCanvas from './map-editor/MapCanvas'
import RightPanel from './map-editor/RightPanel'
import { defaultRegions } from './map-editor/data'

export default function MapEditor() {
  const [activeTool, setActiveTool] = useState('select')
  const [selectedRegion, setSelectedRegion] = useState('veridian')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [regions, setRegions] = useState(defaultRegions)

  const handleCanvasMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: Math.round((e.clientX - rect.left) / rect.width * 2000),
      y: Math.round((e.clientY - rect.top) / rect.height * 1200)
    })
  }

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

  return (
    <div className="map-editor">
      <Toolbar activeTool={activeTool} onToolChange={setActiveTool} />
      <div className="map-body">
        <LeftPanel />
        <MapCanvas mousePos={mousePos} onMouseMove={handleCanvasMouseMove} />
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
