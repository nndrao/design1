import type { ReactNode } from 'react'
import type { LayoutItem } from 'react-grid-layout'
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'

interface PanelGridProps {
  children: ReactNode
  layouts: Record<string, LayoutItem[]>
  cols?: Record<string, number>
  rowHeight?: number
}

export function PanelGrid({ children, layouts, cols, rowHeight = 30 }: PanelGridProps) {
  const { width, containerRef, mounted } = useContainerWidth()

  return (
    <div ref={containerRef} className="h-full overflow-auto p-3">
      {mounted && (
        <ResponsiveGridLayout
          width={width}
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768 }}
          cols={cols ?? { lg: 12, md: 12, sm: 6 }}
          rowHeight={rowHeight}
          margin={[10, 10]}
          dragConfig={{ handle: '.grid-drag-handle' }}
        >
          {children}
        </ResponsiveGridLayout>
      )}
    </div>
  )
}

export function DragHandle() {
  return (
    <span
      className="grid-drag-handle absolute top-1.5 right-1.5 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors z-10"
      title="Drag to rearrange"
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="4" cy="4" r="1.5" /><circle cx="12" cy="4" r="1.5" />
        <circle cx="4" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" />
      </svg>
    </span>
  )
}
