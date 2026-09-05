import type { CSSProperties } from 'react'

const STEP_MS = 50

export function staggerDelay(index: number): CSSProperties {
  return { '--stagger-delay': `${index * STEP_MS}ms` } as CSSProperties
}
