export interface Treasury {
  tenor: string;
  security: string;
  cusip: string;
  coupon: number;
  maturity: string;
  bidYield: number;
  askYield: number;
  bidPrice: number;
  askPrice: number;
  changeBps: number;
  modDuration: number;
  dv01PerMM: number;
  mid: number;
  chg: number;
}

export interface YieldCurvePoint {
  tenor: string;
  years: number;
  yield: number;
  priorYield: number;
  prevClose: number;
}

export interface CorpBond {
  issuer: string;
  security: string;
  cusip: string;
  ratingMoody: string;
  ratingSP: string;
  sector: string;
  coupon: number;
  maturity: string;
  bidYield: number;
  askYield: number;
  bidPrice: number;
  askPrice: number;
  zSpread: number;
  oas: number;
  changeBps: number;
  duration: number;
  dv01PerMM: number;
  isHY: boolean;
}

export interface CDXIndex {
  name: string;
  series: number;
  tenor: string;
  bidSpread: number;
  askSpread: number;
  midSpread: number;
  changeBps: number;
  spreadDuration: number;
  mid: number;
  chg: number;
}

export interface CDS {
  referenceEntity: string;
  ticker: string;
  ratingMoody: string;
  ratingSP: string;
  sector: string;
  bidSpread: number;
  askSpread: number;
  midSpread: number;
  changeBps: number;
}

export interface TreasuryFuture {
  symbol: string;
  description: string;
  lastPrice: number;
  change: number;
  volume: number;
  openInterest: number;
}

export interface SOFRFuture {
  symbol: string;
  description: string;
  price: number;
  impliedRate: number;
  change: number;
  volume: number;
}

export interface KeyRateDuration {
  tenor: string;
  value: number;
}

export type AssetClass = 'Treasury' | 'Corporate' | 'Future' | 'CDS';

export interface Position {
  id: string;
  security: string;
  cusip: string;
  assetClass: AssetClass;
  side: 'LONG' | 'SHORT';
  size: number;
  avgPx: number;
  currPx: number;
  currYld: number;
  dv01: number;
  cs01: number;
  pnlToday: number;
  pnlMtd: number;
  pnlYtd: number;
  mktVal: number;
}

export type OrderStatus = 'Working' | 'Partial' | 'Filled' | 'Cancelled';

export interface Order {
  orderId: string;
  time: string;
  security: string;
  cusip: string;
  side: 'BUY' | 'SELL';
  sizeMM: number;
  lmtYield: number;
  lmtPrice: number;
  filled: number;
  avgYield: number;
  avgPrice: number;
  venue: string;
  counterparty: string;
  account: string;
  status: OrderStatus;
  trader: string;
  settleDate: string;
}

export interface MarketData {
  treasuries: Treasury[];
  corpBonds: CorpBond[];
  tFutures: TreasuryFuture[];
  sofrFutures: SOFRFuture[];
  cdxIndices: CDXIndex[];
  cdsNames: CDS[];
  yieldCurve: YieldCurvePoint[];
}

export interface TreasuryFutureRow extends TreasuryFuture {
  bid: number;
  ask: number;
  settle: number;
  high: number;
  low: number;
  dv01PerContract: number;
}

export interface SOFRFutureRow extends SOFRFuture {
  contract: string;
  openInterest: number;
}
