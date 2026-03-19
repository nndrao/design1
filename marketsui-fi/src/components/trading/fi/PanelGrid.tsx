import { Children, cloneElement, isValidElement, type ReactNode, type ReactElement } from 'react'

export interface LayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
}

interface PanelGridProps {
  children: ReactNode
  layouts: Record<string, LayoutItem[]>
  cols?: Record<string, number>
  rowHeight?: number
}

export function PanelGrid({ children, layouts, rowHeight = 30 }: PanelGridProps) {
  const lgLayout = layouts.lg ?? []

  // Build a map from layout item key to grid position styles
  const styleMap = new Map<string, React.CSSProperties>()
  for (const item of lgLayout) {
    styleMap.set(item.i, {
      gridColumn: `${item.x + 1} / span ${item.w}`,
      gridRow: `${item.y + 1} / span ${item.h}`,
    })
  }

  return (
    <div className="h-full overflow-auto p-3">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gridAutoRows: `${rowHeight}px`,
          gap: '10px',
        }}
      >
        {Children.map(children, (child) => {
          if (!isValidElement(child)) return child
          const key = (child as ReactElement<{ key?: string }>).key
          if (key == null) return child
          // React prepends ".$" to keys in Children.map — strip it
          const cleanKey = String(key).replace(/^\.\$/, '')
          const gridStyle = styleMap.get(cleanKey)
          if (!gridStyle) return child
          return cloneElement(child as ReactElement<{ style?: React.CSSProperties }>, {
            style: { ...((child as ReactElement<{ style?: React.CSSProperties }>).props.style ?? {}), ...gridStyle },
          })
        })}
      </div>
    </div>
  )
}

export function DragHandle() {
  return (
    <span
      className="grid-drag-handle absolute top-1.5 right-1.5 cursor-default text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors z-10"
      title="Panel handle"
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="4" cy="4" r="1.5" /><circle cx="12" cy="4" r="1.5" />
        <circle cx="4" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" />
      </svg>
    </span>
  )
}
