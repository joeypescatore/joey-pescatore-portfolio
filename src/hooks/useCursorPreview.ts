import { useState, type MouseEvent } from 'react'

const PREVIEW_OFFSET = 20
const VIEWPORT_MARGIN = 16

type PreviewSize = { width: number; height: number }

export function useCursorPreview(previewSize: PreviewSize) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  function handleMouseMove(event: MouseEvent) {
    setMousePos({ x: event.clientX, y: event.clientY })
  }

  function handleMouseLeave() {
    setHoveredIndex(null)
  }

  const maxX = window.innerWidth - previewSize.width - VIEWPORT_MARGIN
  const maxY = window.innerHeight - previewSize.height - VIEWPORT_MARGIN

  const previewX = Math.max(VIEWPORT_MARGIN, Math.min(mousePos.x + PREVIEW_OFFSET, maxX))
  const previewY = Math.max(VIEWPORT_MARGIN, Math.min(mousePos.y + PREVIEW_OFFSET, maxY))

  return {
    hoveredIndex,
    setHoveredIndex,
    previewX,
    previewY,
    handleMouseMove,
    handleMouseLeave,
  }
}
