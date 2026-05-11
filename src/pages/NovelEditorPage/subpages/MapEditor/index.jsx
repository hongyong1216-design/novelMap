import { useState } from 'react'
import MapCanvas from './components/MapCanvas/MapCanvas'
import ToolboxFab from './components/ToolboxFab/ToolboxFab'
import ToolboxModal from './components/ToolboxModal/ToolboxModal'
import './MapEditor.css'

export default function MapEditor() {
  const [toolboxOpen, setToolboxOpen] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState('veridian')
  const [brushStrokes, setBrushStrokes] = useState([])

  const addBrushStroke = (stroke) =>
    setBrushStrokes((prev) => [...prev, stroke])

  return (
    <div className="map-editor">
      <MapCanvas
        selectedRegion={selectedRegion}
        onSelectRegion={setSelectedRegion}
        brushStrokes={brushStrokes}
        onAddBrushStroke={addBrushStroke}
      />

      <ToolboxFab
        active={toolboxOpen}
        onClick={() => setToolboxOpen((v) => !v)}
      />

      <ToolboxModal
        open={toolboxOpen}
        onClose={() => setToolboxOpen(false)}
      />

      <div className="map-editor__context-indicator">
        RENDER_ENGINE: COBALT_CORE_V4.2 // BUFFER: STABLE
      </div>
    </div>
  )
}
