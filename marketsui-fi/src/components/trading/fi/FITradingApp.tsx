import { useState, useEffect, useCallback, useRef } from 'react'
import { MarketDataContext } from './MarketDataContext'
import { useLiveMarketData, fmtYield, fmtChgBps } from './marketData'
import { cn } from '@/lib/utils'
import { DashboardPanel } from './DashboardPanel'
import { RatesPanel } from './RatesPanel'
import { CreditPanel } from './CreditPanel'
import { FuturesPanel } from './FuturesPanel'
import { RiskPanel } from './RiskPanel'
import { PositionsPanel } from './PositionsPanel'
import { BlotterPanel } from './BlotterPanel'
import { DesignSystemPanel } from './DesignSystemPanel'
import { ComponentsPanel } from './ComponentsPanel'

type FITab =
  | 'Overview'
  | 'Rates'
  | 'Credit'
  | 'Futures'
  | 'Risk'
  | 'Positions & P&L'
  | 'Order Blotter'
  | 'Design System'
  | 'Components'

const TABS: FITab[] = [
  'Overview',
  'Rates',
  'Credit',
  'Futures',
  'Risk',
  'Positions & P&L',
  'Order Blotter',
  'Design System',
  'Components',
]

/* ── Flash hook ───────────────────────────────────────────── */
function useFlash(value: number | undefined) {
  const prevRef = useRef(value)
  const [flash, setFlash] = useState('')
  useEffect(() => {
    if (value != null && prevRef.current != null && prevRef.current !== value) {
      setFlash(value > prevRef.current ? 'flash-positive' : 'flash-negative')
      const timer = setTimeout(() => setFlash(''), 600)
      prevRef.current = value
      return () => clearTimeout(timer)
    }
    prevRef.current = value
  }, [value])
  return flash
}

/* ── Ticker item with flash ──────────────────────────────── */
function TickerItem({ label, mid, chg, fmtMid, fmtChg }: {
  label: string
  mid: number | undefined
  chg: number | undefined
  fmtMid: string
  fmtChg: string
}) {
  const flash = useFlash(mid)
  return (
    <div key={label} className="flex items-center gap-1">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('text-foreground', flash)}>{fmtMid}</span>
      {chg != null && (
        <span className={cn('text-[10px]', chg >= 0 ? 'text-sell' : 'text-buy')}>
          {fmtChg}
        </span>
      )}
    </div>
  )
}

/* ── Market time hook ─────────────────────────────────────── */
function useMarketTime() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1_000)
    return () => clearInterval(id)
  }, [])

  const etString = now.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  const etHour = Number(
    now.toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false })
  )
  const day = now.toLocaleString('en-US', { timeZone: 'America/New_York', weekday: 'short' })
  const isWeekday = !['Sat', 'Sun'].includes(day)
  const isOpen = isWeekday && etHour >= 8 && etHour < 17

  return { etString, isOpen }
}

/* ── Tab content switcher ─────────────────────────────────── */
function TabContent({ tab }: { tab: FITab }) {
  switch (tab) {
    case 'Overview':
      return <DashboardPanel />
    case 'Rates':
      return <RatesPanel />
    case 'Credit':
      return <CreditPanel />
    case 'Futures':
      return <FuturesPanel />
    case 'Risk':
      return <RiskPanel />
    case 'Positions & P&L':
      return <PositionsPanel />
    case 'Order Blotter':
      return <BlotterPanel />
    case 'Design System':
      return <DesignSystemPanel />
    case 'Components':
      return <ComponentsPanel />
  }
}

/* ── Market status bar ────────────────────────────────────── */
function MarketStatusBar() {
  const { etString, isOpen } = useMarketTime()
  const data = useLiveMarketData()

  const ust2 = data.treasuries.find((t) => t.tenor === '2Y')
  const ust5 = data.treasuries.find((t) => t.tenor === '5Y')
  const ust10 = data.treasuries.find((t) => t.tenor === '10Y')
  const ust30 = data.treasuries.find((t) => t.tenor === '30Y')
  const slope2s10s =
    ust10 && ust2 ? ((ust10.mid - ust2.mid) * 100).toFixed(1) : '—'
  const cdxIG = data.cdxIndices.find((c) => c.name.includes('IG'))
  const cdxHY = data.cdxIndices.find((c) => c.name.includes('HY'))

  const benchmarks = [
    { label: '2Y', ust: ust2 },
    { label: '5Y', ust: ust5 },
    { label: '10Y', ust: ust10 },
    { label: '30Y', ust: ust30 },
  ]

  return (
    <div className="flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-4 h-8 text-[11px] font-mono shrink-0">
      {/* Left: status + yields */}
      <div className="flex items-center gap-4">
        {/* Market status */}
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'inline-block w-1.5 h-1.5 rounded-full',
              isOpen ? 'bg-buy pulse-dot' : 'bg-sell'
            )}
          />
          <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
            {isOpen ? 'Market Open' : 'Market Closed'}
          </span>
        </div>

        <div className="h-3 w-px bg-border" />

        {/* Treasury yields */}
        {benchmarks.map(({ label, ust }) => (
          <TickerItem
            key={label}
            label={label}
            mid={ust?.mid}
            chg={ust?.chg}
            fmtMid={ust ? fmtYield(ust.mid) : '—'}
            fmtChg={ust ? fmtChgBps(ust.chg) : ''}
          />
        ))}

        <div className="h-3 w-px bg-border" />

        {/* 2s10s */}
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">2s10s</span>
          <span className="text-foreground">{slope2s10s} bps</span>
        </div>

        <div className="h-3 w-px bg-border" />

        {/* CDX indices */}
        {cdxIG && (
          <TickerItem
            label="CDX IG"
            mid={cdxIG.mid}
            chg={cdxIG.chg}
            fmtMid={cdxIG.mid.toFixed(1)}
            fmtChg={fmtChgBps(cdxIG.chg)}
          />
        )}
        {cdxHY && (
          <TickerItem
            label="CDX HY"
            mid={cdxHY.mid}
            chg={cdxHY.chg}
            fmtMid={cdxHY.mid.toFixed(1)}
            fmtChg={fmtChgBps(cdxHY.chg)}
          />
        )}
      </div>

      {/* Right: ET time */}
      <div className="text-muted-foreground">
        {etString} <span className="text-[9px] tracking-wider">ET</span>
      </div>
    </div>
  )
}

/* ── Keyboard Shortcuts Data ──────────────────────────────── */
const SHORTCUTS = [
  { keys: '1–9', description: 'Switch tabs' },
  { keys: 'N', description: 'New order' },
  { keys: '?', description: 'Show shortcuts' },
  { keys: 'Esc', description: 'Close dialogs' },
]

/* ── Shortcuts Overlay ───────────────────────────────────── */
function ShortcutsOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      <div
        className="relative bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-foreground">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-xs"
          >
            Esc
          </button>
        </div>
        <div className="grid gap-2">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center justify-between py-1.5">
              <span className="text-xs text-muted-foreground">{s.description}</span>
              <kbd className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary border border-border text-[11px] font-mono font-medium text-foreground">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Main orchestrator ────────────────────────────────────── */
export function FITradingApp() {
  const [activeTab, setActiveTab] = useState<FITab>('Overview')
  const [showShortcuts, setShowShortcuts] = useState(false)
  const data = useLiveMarketData()

  const handleTabClick = useCallback((tab: FITab) => {
    setActiveTab(tab)
  }, [])

  /* Keyboard shortcuts */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable
      if (isInput) return

      // ? — toggle shortcuts overlay
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setShowShortcuts((v) => !v)
        return
      }

      // Esc — close overlay
      if (e.key === 'Escape') {
        setShowShortcuts(false)
        return
      }

      // 1-9 — switch tabs
      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= 9 && num <= TABS.length) {
        e.preventDefault()
        setActiveTab(TABS[num - 1])
        return
      }

      // N — navigate to Order Blotter (where order ticket lives)
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setActiveTab('Order Blotter')
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <MarketDataContext.Provider value={data}>
      <div className="flex flex-col h-full bg-background">
        {/* Market Status Bar */}
        <MarketStatusBar />

        {/* Tab Bar */}
        <div className="flex items-center border-b border-border bg-card px-4 shrink-0">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={cn(
                'relative px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap',
                activeTab === tab
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full bg-primary" />
              )}
              <span className="ml-1 text-[9px] text-muted-foreground/50 font-mono">{i + 1}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <TabContent tab={activeTab} />
        </div>

        {/* Keyboard Shortcuts Overlay */}
        {showShortcuts && <ShortcutsOverlay onClose={() => setShowShortcuts(false)} />}
      </div>
    </MarketDataContext.Provider>
  )
}

export default FITradingApp
