import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BASE_TREASURIES, BASE_CORP_BONDS } from './marketData'
import type { Treasury, CorpBond } from './marketData'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

/* ── Types ──────────────────────────────────────────────── */

interface OrderTicketProps {
  open: boolean
  onClose: () => void
}

type Side = 'BUY' | 'SELL'
type LimitMode = 'yield' | 'price'
type Settlement = 'T+1' | 'T+2' | 'T+3' | 'T+5'

interface SearchResult {
  security: string
  cusip: string
  type: 'Treasury' | 'Corporate'
  source: Treasury | CorpBond
}

/* ── Constants ──────────────────────────────────────────── */

const ACCOUNTS = ['MAIN-FI', 'CORP-IG', 'CORP-HY', 'GOV-BOND']
const COUNTERPARTIES = ['Goldman Sachs', 'Morgan Stanley', 'JPMorgan', 'Barclays', 'Citi', 'BofA', 'HSBC', 'Deutsche Bank']
const VENUES = ['TradeWeb', 'Bloomberg', 'MarketAxess', 'DirectEx']
const TIF_OPTIONS = ['Day', 'GTC', 'IOC', 'FOK']
const SETTLE_OPTIONS: Settlement[] = ['T+1', 'T+2', 'T+3', 'T+5']

function buildSearchList(): SearchResult[] {
  const results: SearchResult[] = []
  for (const t of BASE_TREASURIES) {
    results.push({ security: t.security, cusip: t.cusip, type: 'Treasury', source: t })
  }
  for (const c of BASE_CORP_BONDS) {
    results.push({ security: c.security, cusip: c.cusip, type: 'Corporate', source: c })
  }
  return results
}

/* ── SelectField ──────────────────────────────────────── */

function SelectField({
  label, value, options, onChange,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/* ── Component ──────────────────────────────────────────── */

export function OrderTicket({ open, onClose }: OrderTicketProps) {
  const [side, setSide] = useState<Side>('BUY')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSecurity, setSelectedSecurity] = useState<SearchResult | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [faceValue, setFaceValue] = useState<string>('')
  const [limitMode, setLimitMode] = useState<LimitMode>('yield')
  const [limitValue, setLimitValue] = useState<string>('')
  const [account, setAccount] = useState(ACCOUNTS[0])
  const [counterparty, setCounterparty] = useState(COUNTERPARTIES[0])
  const [venue, setVenue] = useState(VENUES[0])
  const [tif, setTif] = useState(TIF_OPTIONS[0])
  const [settlement, setSettlement] = useState<Settlement>('T+1')
  const [submitted, setSubmitted] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const allSecurities = useMemo(buildSearchList, [])

  const filteredSecurities = useMemo(() => {
    if (!searchQuery.trim()) return allSecurities.slice(0, 8)
    const q = searchQuery.toLowerCase()
    return allSecurities.filter(
      (s) => s.security.toLowerCase().includes(q) || s.cusip.toLowerCase().includes(q)
    )
  }, [searchQuery, allSecurities])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (open) {
      setSide('BUY')
      setSearchQuery('')
      setSelectedSecurity(null)
      setFaceValue('')
      setLimitMode('yield')
      setLimitValue('')
      setAccount(ACCOUNTS[0])
      setCounterparty(COUNTERPARTIES[0])
      setVenue(VENUES[0])
      setTif(TIF_OPTIONS[0])
      setSettlement('T+1')
      setSubmitted(false)
    }
  }, [open])

  const handleSelectSecurity = useCallback((item: SearchResult) => {
    setSelectedSecurity(item)
    setSearchQuery(item.security)
    setShowDropdown(false)
  }, [])

  const handleSubmit = useCallback(() => {
    setSubmitted(true)
    setTimeout(() => onClose(), 1200)
  }, [onClose])

  const faceNum = faceValue ? parseFloat(faceValue) : null
  const notional = faceNum != null && faceNum > 0 ? faceNum * 1_000_000 : null
  const limitNum = limitValue ? parseFloat(limitValue) : null
  const isBuy = side === 'BUY'

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-[28rem] max-h-[80vh] flex flex-col p-0">
        {/* Fixed header */}
        <DialogHeader className="px-4 pt-4 pb-2 border-b border-border">
          <DialogTitle>New Order</DialogTitle>
          <DialogDescription className="sr-only">Create a new trading order</DialogDescription>
          {!submitted && (
            <ToggleGroup
              type="single"
              value={side}
              onValueChange={(v) => { if (v) setSide(v as Side) }}
              className="w-full mt-2"
            >
              <ToggleGroupItem
                value="BUY"
                className={cn(
                  'flex-1 rounded-full text-xs font-semibold',
                  side === 'BUY' && 'bg-buy text-buy-foreground hover:bg-buy/90 hover:text-buy-foreground data-[state=on]:bg-buy data-[state=on]:text-buy-foreground'
                )}
              >
                BUY
              </ToggleGroupItem>
              <ToggleGroupItem
                value="SELL"
                className={cn(
                  'flex-1 rounded-full text-xs font-semibold',
                  side === 'SELL' && 'bg-sell text-sell-foreground hover:bg-sell/90 hover:text-sell-foreground data-[state=on]:bg-sell data-[state=on]:text-sell-foreground'
                )}
              >
                SELL
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </DialogHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto px-4 py-3">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-xl', isBuy ? 'bg-buy/10 text-buy' : 'bg-sell/10 text-sell')}>&#10003;</div>
              <span className="text-sm font-semibold text-foreground">Order Submitted</span>
              <div className="bg-muted rounded-lg p-3 w-full max-w-xs flex flex-col gap-1.5">
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <span className="text-muted-foreground">Side</span>
                  <span className={cn('font-medium', isBuy ? 'text-buy' : 'text-sell')}>{side}</span>
                  <span className="text-muted-foreground">Size</span>
                  <span className="text-foreground font-mono">{faceNum ? `$${faceNum}MM` : '\u2014'}</span>
                  <span className="text-muted-foreground">Security</span>
                  <span className="text-foreground truncate">{selectedSecurity?.security ?? '\u2014'}</span>
                  <span className="text-muted-foreground">Limit</span>
                  <span className="text-foreground font-mono">{limitNum != null ? `${limitNum}${limitMode === 'yield' ? '%' : ''}` : '\u2014'}</span>
                  <span className="text-muted-foreground">Settle</span>
                  <span className="text-foreground">{settlement}</span>
                  <span className="text-muted-foreground">Venue</span>
                  <span className="text-foreground">{venue}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">

              {/* Security Search */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Security</label>
                <div ref={searchRef} className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); if (!e.target.value) setSelectedSecurity(null) }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Search bonds..."
                      className="pl-9"
                    />
                  </div>
                  {showDropdown && filteredSecurities.length > 0 && (
                    <div className="absolute z-10 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
                      {filteredSecurities.map((item) => (
                        <button
                          key={item.cusip}
                          onClick={() => handleSelectSecurity(item)}
                          className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-muted transition-colors"
                        >
                          <div className="flex flex-col">
                            <span className="text-[11px] text-foreground font-medium">{item.security}</span>
                            <span className="text-[9px] text-muted-foreground font-mono">{item.cusip}</span>
                          </div>
                          <Badge variant={item.type === 'Treasury' ? 'default' : 'buy'}>
                            {item.type}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Face Value */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Face Value ($MM)</label>
                <Input
                  type="number"
                  value={faceValue}
                  onChange={(e) => setFaceValue(e.target.value)}
                  placeholder="e.g. 25"
                  min={0}
                />
                {notional && <span className="text-[10px] text-muted-foreground font-mono">Notional: ${notional.toLocaleString()}</span>}
              </div>

              {/* Limit Yield / Price */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{limitMode === 'yield' ? 'Limit Yield' : 'Limit Price'}</label>
                  <ToggleGroup
                    type="single"
                    value={limitMode}
                    onValueChange={(v) => { if (v) setLimitMode(v as LimitMode) }}
                    size="sm"
                  >
                    <ToggleGroupItem value="yield" className="text-[10px]">Yield</ToggleGroupItem>
                    <ToggleGroupItem value="price" className="text-[10px]">Price</ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <Input
                  type="number"
                  value={limitValue}
                  onChange={(e) => setLimitValue(e.target.value)}
                  step="0.001"
                  placeholder={limitMode === 'yield' ? 'e.g. 4.425' : 'e.g. 100.500'}
                />
              </div>

              {/* Execution Details */}
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Account" value={account} options={ACCOUNTS} onChange={setAccount} />
                <SelectField label="Counterparty" value={counterparty} options={COUNTERPARTIES} onChange={setCounterparty} />
                <SelectField label="Venue" value={venue} options={VENUES} onChange={setVenue} />
                <SelectField label="Time-in-Force" value={tif} options={TIF_OPTIONS} onChange={setTif} />
              </div>

              {/* Settlement */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Settlement</label>
                <ToggleGroup
                  type="single"
                  value={settlement}
                  onValueChange={(v) => { if (v) setSettlement(v as Settlement) }}
                  size="sm"
                >
                  {SETTLE_OPTIONS.map((s) => (
                    <ToggleGroupItem key={s} value={s} className="text-[10px] flex-1">{s}</ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

            </div>
          )}
        </div>

        {/* Fixed footer */}
        {!submitted && (
          <DialogFooter className="px-4 pb-4 pt-2 border-t border-border">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant={isBuy ? 'buy' : 'sell'}
              onClick={handleSubmit}
              disabled={!selectedSecurity || !faceNum}
              className="flex-1"
            >
              Submit {side} Order
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default OrderTicket
