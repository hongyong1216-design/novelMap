import { useState, useRef } from 'react'
import './MapEditor.css'
import Toolbar from './map-editor/Toolbar'
import LeftPanel from './map-editor/LeftPanel'
import MapCanvas from './map-editor/MapCanvas'
import RightPanel from './map-editor/RightPanel'
import { defaultRegions } from './map-editor/data'

export default function MapEditor() {
  const [activeTool, setActiveTool] = useState('select')
  const [selectedRegion, setSelectedRegion] = useState('veridian')
  const [regions, setRegions] = useState(defaultRegions)
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
        <LeftPanel />
        <MapCanvas
          ref={canvasRef}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
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
