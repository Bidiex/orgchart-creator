import React from 'react'
import { getSmoothStepPath } from '@xyflow/react'

export default function OrgEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {}
}) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8 // Curva en las esquinas para suavizar el conector
  })

  // Obtener estilos desde la data o usar valores por defecto
  const strokeColor = data?.style?.stroke || style.stroke || '#94a3b8'
  const strokeWidth = data?.style?.strokeWidth || style.strokeWidth || 2
  const strokeDasharray = data?.style?.strokeDasharray || style.strokeDasharray || null

  return (
    <path
      id={id}
      style={{
        ...style,
        stroke: strokeColor,
        strokeWidth,
        strokeDasharray,
        fill: 'none',
      }}
      fill="none"
      className="react-flow__edge-path transition-colors duration-300"
      d={edgePath}
    />
  )
}
