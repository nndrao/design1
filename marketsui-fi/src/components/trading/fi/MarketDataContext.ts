import { createContext, useContext } from 'react'
import type { Treasury, CorpBond, TreasuryFuture, SOFRFuture, CDXIndex, CDS, YieldCurvePoint } from './marketData'

export interface MarketData {
  treasuries: Treasury[]
  corpBonds: CorpBond[]
  tFutures: TreasuryFuture[]
  sofrFutures: SOFRFuture[]
  cdxIndices: CDXIndex[]
  cdsNames: CDS[]
  yieldCurve: YieldCurvePoint[]
}

export const MarketDataContext = createContext<MarketData | null>(null)
export const useMarketData = () => useContext(MarketDataContext)!
