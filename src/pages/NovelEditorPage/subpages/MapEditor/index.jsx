import { useState } from 'react'
import MapCanvas from './components/MapCanvas/MapCanvas'
import ToolboxFab from './components/ToolboxFab/ToolboxFab'
import ToolboxModal from './components/ToolboxModal/ToolboxModal'
import './MapEditor.css'

export default function MapEditor() {
  const [toolboxOpen, setToolboxOpen] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [brushStrokes, setBrushStrokes] = useState([])

  const [activeBrush, setActiveBrush] = useState(null)
  const [brushSize, setBrushSize] = useState(40)
  const [brushMode, setBrushMode] = useState('smooth')

  const addBrushStroke = (stroke) =>
    setBrushStrokes((prev) => [...prev, stroke])

  return (
    <div className="map-editor">
      <MapCanvas
        selectedRegion={selectedRegion}
        onSelectRegion={setSelectedRegion}
        activeBrush={activeBrush}
        brushSize={brushSize}
        brushMode={brushMode}
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
        activeBrush={activeBrush}
        onBrushChange={setActiveBrush}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        brushMode={brushMode}
        onBrushModeChange={setBrushMode}
      />
    </div>
  )
}
