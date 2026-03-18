import { useState, useEffect } from 'react'
import type { MarketData } from './MarketDataContext'

export { fmtYield, fmtChgBps, fmtPnL, fmtK } from '@/lib/utils'

/* ── Types ─────────────────────────────────────────────────── */

export interface Treasury {
  tenor: string
  security: string
  cusip: string
  coupon: number
  maturity: string
  bidYield: number
  askYield: number
  bidPrice: number
  askPrice: number
  changeBps: number
  modDuration: number
  dv01PerMM: number
  mid: number
  chg: number
}

export interface YieldCurvePoint {
  tenor: string
  years: number
  yield: number
  priorYield: number
  prevClose: number
}

export interface CorpBond {
  issuer: string
  security: string
  cusip: string
  ratingMoody: string
  ratingSP: string
  sector: string
  coupon: number
  maturity: string
  bidYield: number
  askYield: number
  bidPrice: number
  askPrice: number
  zSpread: number
  oas: number
  changeBps: number
  duration: number
  dv01PerMM: number
  isHY: boolean
}

export interface CDXIndex {
  name: string
  series: number
  tenor: string
  bidSpread: number
  askSpread: number
  midSpread: number
  changeBps: number
  spreadDuration: number
  mid: number
  chg: number
}

export interface CDS {
  referenceEntity: string
  ticker: string
  ratingMoody: string
  ratingSP: string
  sector: string
  bidSpread: number
  askSpread: number
  midSpread: number
  changeBps: number
}

export interface TreasuryFuture {
  symbol: string
  description: string
  lastPrice: number
  change: number
  volume: number
  openInterest: number
}

export interface SOFRFuture {
  symbol: string
  description: string
  price: number
  impliedRate: number
  change: number
  volume: number
}

export interface KeyRateDuration {
  tenor: string
  value: number
}

export type AssetClass = 'Treasury' | 'Corporate' | 'Future' | 'CDS'

export interface Position {
  id: string
  security: string
  cusip: string
  assetClass: AssetClass
  side: 'LONG' | 'SHORT'
  size: number
  avgPx: number
  currPx: number
  currYld: number
  dv01: number
  cs01: number
  pnlToday: number
  pnlMtd: number
  pnlYtd: number
  mktVal: number
}

export type OrderStatus = 'Working' | 'Partial' | 'Filled' | 'Cancelled'

export interface Order {
  orderId: string
  time: string
  security: string
  cusip: string
  side: 'BUY' | 'SELL'
  sizeMM: number
  lmtYield: number
  lmtPrice: number
  filled: number
  avgYield: number
  avgPrice: number
  venue: string
  counterparty: string
  account: string
  status: OrderStatus
  trader: string
  settleDate: string
}

/* ── Helpers ───────────────────────────────────────────────── */

function mkT(t: Omit<Treasury, 'mid' | 'chg'>): Treasury {
  return { ...t, mid: (t.bidYield + t.askYield) / 2, chg: t.changeBps / 100 }
}

function mkCDX(c: Omit<CDXIndex, 'mid' | 'chg'>): CDXIndex {
  return { ...c, mid: c.midSpread, chg: c.changeBps }
}

/* ── Static data ───────────────────────────────────────────── */

export const BASE_TREASURIES: Treasury[] = [
  mkT({ tenor: '2Y', security: 'UST 4.500 03/28', cusip: '91282CKL4', coupon: 4.500, maturity: '2028-03-31', bidYield: 4.720, askYield: 4.715, bidPrice: 99.578, askPrice: 99.588, changeBps: -2.5, modDuration: 1.92, dv01PerMM: 192 }),
  mkT({ tenor: '3Y', security: 'UST 4.375 03/29', cusip: '91282CLM1', coupon: 4.375, maturity: '2029-03-15', bidYield: 4.600, askYield: 4.595, bidPrice: 99.358, askPrice: 99.372, changeBps: -2.0, modDuration: 2.80, dv01PerMM: 280 }),
  mkT({ tenor: '5Y', security: 'UST 4.250 02/31', cusip: '91282CMN8', coupon: 4.250, maturity: '2031-02-28', bidYield: 4.470, askYield: 4.465, bidPrice: 99.016, askPrice: 99.036, changeBps: -2.0, modDuration: 4.52, dv01PerMM: 452 }),
  mkT({ tenor: '7Y', security: 'UST 4.375 02/33', cusip: '91282CNP2', coupon: 4.375, maturity: '2033-02-15', bidYield: 4.420, askYield: 4.415, bidPrice: 99.688, askPrice: 99.714, changeBps: -1.5, modDuration: 6.10, dv01PerMM: 610 }),
  mkT({ tenor: '10Y', security: 'UST 4.250 02/36', cusip: '91282CPQ8', coupon: 4.250, maturity: '2036-02-15', bidYield: 4.380, askYield: 4.375, bidPrice: 98.942, askPrice: 98.976, changeBps: -2.0, modDuration: 8.25, dv01PerMM: 825 }),
  mkT({ tenor: '20Y', security: 'UST 4.750 02/46', cusip: '912810TW8', coupon: 4.750, maturity: '2046-02-15', bidYield: 4.550, askYield: 4.545, bidPrice: 103.125, askPrice: 103.172, changeBps: -1.5, modDuration: 13.10, dv01PerMM: 1310 }),
  mkT({ tenor: '30Y', security: 'UST 4.625 02/56', cusip: '912810TX6', coupon: 4.625, maturity: '2056-02-15', bidYield: 4.610, askYield: 4.605, bidPrice: 100.250, askPrice: 100.312, changeBps: -1.5, modDuration: 16.80, dv01PerMM: 1680 }),
]

export const BASE_CORP_BONDS: CorpBond[] = [
  { issuer: 'JPMorgan Chase', security: 'JPM 5.250 01/31', cusip: '46647PEF3', ratingMoody: 'A1', ratingSP: 'A-', sector: 'Financials', coupon: 5.250, maturity: '2031-01-15', bidYield: 5.120, askYield: 5.100, bidPrice: 100.625, askPrice: 100.719, zSpread: 65, oas: 62, changeBps: -0.5, duration: 4.20, dv01PerMM: 420, isHY: false },
  { issuer: 'Goldman Sachs', security: 'GS 5.500 11/29', cusip: '38141GZM7', ratingMoody: 'A2', ratingSP: 'BBB+', sector: 'Financials', coupon: 5.500, maturity: '2029-11-01', bidYield: 5.280, askYield: 5.260, bidPrice: 100.781, askPrice: 100.875, zSpread: 82, oas: 78, changeBps: 0.5, duration: 3.30, dv01PerMM: 330, isHY: false },
  { issuer: 'Apple Inc', security: 'AAPL 4.100 08/35', cusip: '037833EW5', ratingMoody: 'Aaa', ratingSP: 'AA+', sector: 'Technology', coupon: 4.100, maturity: '2035-08-01', bidYield: 4.680, askYield: 4.660, bidPrice: 95.375, askPrice: 95.531, zSpread: 30, oas: 28, changeBps: -1.0, duration: 7.60, dv01PerMM: 760, isHY: false },
  { issuer: 'Microsoft Corp', security: 'MSFT 4.000 02/36', cusip: '594918CF8', ratingMoody: 'Aaa', ratingSP: 'AAA', sector: 'Technology', coupon: 4.000, maturity: '2036-02-12', bidYield: 4.600, askYield: 4.580, bidPrice: 95.188, askPrice: 95.344, zSpread: 22, oas: 20, changeBps: -1.5, duration: 8.10, dv01PerMM: 810, isHY: false },
  { issuer: 'Amazon.com', security: 'AMZN 4.550 12/32', cusip: '023135BW2', ratingMoody: 'A1', ratingSP: 'AA', sector: 'Consumer Disc', coupon: 4.550, maturity: '2032-12-01', bidYield: 4.820, askYield: 4.800, bidPrice: 98.125, askPrice: 98.281, zSpread: 38, oas: 35, changeBps: -0.5, duration: 5.70, dv01PerMM: 570, isHY: false },
  { issuer: 'Bank of America', security: 'BAC 5.375 04/30', cusip: '06051GKH7', ratingMoody: 'A1', ratingSP: 'A-', sector: 'Financials', coupon: 5.375, maturity: '2030-04-15', bidYield: 5.200, askYield: 5.180, bidPrice: 100.625, askPrice: 100.750, zSpread: 73, oas: 70, changeBps: 1.0, duration: 3.60, dv01PerMM: 360, isHY: false },
  { issuer: 'Exxon Mobil', security: 'XOM 4.327 03/35', cusip: '30231GAV4', ratingMoody: 'Aa1', ratingSP: 'AA-', sector: 'Energy', coupon: 4.327, maturity: '2035-03-19', bidYield: 4.750, askYield: 4.730, bidPrice: 96.500, askPrice: 96.656, zSpread: 28, oas: 26, changeBps: -1.0, duration: 7.30, dv01PerMM: 730, isHY: false },
  { issuer: 'Verizon Comms', security: 'VZ 4.862 08/34', cusip: '92343VGK6', ratingMoody: 'Baa1', ratingSP: 'BBB+', sector: 'Telecom', coupon: 4.862, maturity: '2034-08-21', bidYield: 5.050, askYield: 5.030, bidPrice: 98.750, askPrice: 98.906, zSpread: 58, oas: 55, changeBps: 0.5, duration: 6.80, dv01PerMM: 680, isHY: false },
  { issuer: 'Boeing Co', security: 'BA 5.705 05/34', cusip: '097023DJ4', ratingMoody: 'Baa2', ratingSP: 'BBB-', sector: 'Industrials', coupon: 5.705, maturity: '2034-05-01', bidYield: 5.920, askYield: 5.900, bidPrice: 98.438, askPrice: 98.594, zSpread: 145, oas: 140, changeBps: 2.0, duration: 6.20, dv01PerMM: 620, isHY: false },
  { issuer: 'Ford Motor Co', security: 'F 6.100 08/32', cusip: '345370DA5', ratingMoody: 'Ba1', ratingSP: 'BB+', sector: 'Consumer Disc', coupon: 6.100, maturity: '2032-08-19', bidYield: 6.550, askYield: 6.520, bidPrice: 97.375, askPrice: 97.563, zSpread: 215, oas: 208, changeBps: 2.5, duration: 5.10, dv01PerMM: 510, isHY: true },
  { issuer: 'Tesla Inc', security: 'TSLA 5.300 08/30', cusip: '88160RAJ5', ratingMoody: 'Ba1', ratingSP: 'BB+', sector: 'Consumer Disc', coupon: 5.300, maturity: '2030-08-15', bidYield: 5.680, askYield: 5.650, bidPrice: 98.500, askPrice: 98.688, zSpread: 195, oas: 188, changeBps: -1.5, duration: 3.70, dv01PerMM: 370, isHY: true },
  { issuer: 'Carnival Corp', security: 'CCL 7.000 08/29', cusip: '143658BR8', ratingMoody: 'B1', ratingSP: 'B+', sector: 'Consumer Disc', coupon: 7.000, maturity: '2029-08-15', bidYield: 7.450, askYield: 7.400, bidPrice: 98.125, askPrice: 98.375, zSpread: 305, oas: 295, changeBps: -2.0, duration: 2.90, dv01PerMM: 290, isHY: true },
]

const BASE_CDX_RAW: Omit<CDXIndex, 'mid' | 'chg'>[] = [
  { name: 'CDX NA IG S43', series: 43, tenor: '5Y', bidSpread: 52.5, askSpread: 53.5, midSpread: 53.0, changeBps: -0.5, spreadDuration: 4.85 },
  { name: 'CDX NA HY S43', series: 43, tenor: '5Y', bidSpread: 338, askSpread: 342, midSpread: 340, changeBps: 2.0, spreadDuration: 4.40 },
  { name: 'iTraxx Europe S42', series: 42, tenor: '5Y', bidSpread: 55, askSpread: 56, midSpread: 55.5, changeBps: -0.8, spreadDuration: 4.90 },
  { name: 'iTraxx Xover S42', series: 42, tenor: '5Y', bidSpread: 295, askSpread: 299, midSpread: 297, changeBps: 1.5, spreadDuration: 4.35 },
  { name: 'CDX EM S40', series: 40, tenor: '5Y', bidSpread: 195, askSpread: 200, midSpread: 197.5, changeBps: 1.2, spreadDuration: 4.50 },
]
const BASE_CDX: CDXIndex[] = BASE_CDX_RAW.map(mkCDX)

const BASE_CDS_NAMES: CDS[] = [
  { referenceEntity: 'JPMorgan Chase', ticker: 'JPM', ratingMoody: 'A1', ratingSP: 'A-', sector: 'Financials', bidSpread: 48, askSpread: 52, midSpread: 50, changeBps: -0.5 },
  { referenceEntity: 'Goldman Sachs', ticker: 'GS', ratingMoody: 'A2', ratingSP: 'BBB+', sector: 'Financials', bidSpread: 58, askSpread: 62, midSpread: 60, changeBps: 0.5 },
  { referenceEntity: 'Ford Motor Co', ticker: 'F', ratingMoody: 'Ba1', ratingSP: 'BB+', sector: 'Consumer Disc', bidSpread: 185, askSpread: 195, midSpread: 190, changeBps: 3.0 },
  { referenceEntity: 'Tesla Inc', ticker: 'TSLA', ratingMoody: 'Ba1', ratingSP: 'BB+', sector: 'Consumer Disc', bidSpread: 145, askSpread: 155, midSpread: 150, changeBps: -2.0 },
  { referenceEntity: 'Boeing Co', ticker: 'BA', ratingMoody: 'Baa2', ratingSP: 'BBB-', sector: 'Industrials', bidSpread: 115, askSpread: 125, midSpread: 120, changeBps: 1.5 },
  { referenceEntity: 'AT&T Inc', ticker: 'T', ratingMoody: 'Baa2', ratingSP: 'BBB', sector: 'Telecom', bidSpread: 62, askSpread: 68, midSpread: 65, changeBps: 0.8 },
]

const BASE_T_FUTURES: TreasuryFuture[] = [
  { symbol: 'ZTM6', description: '2Y T-Note Jun26', lastPrice: 103.270, change: 0.031, volume: 1285000, openInterest: 4125000 },
  { symbol: 'ZFM6', description: '5Y T-Note Jun26', lastPrice: 107.195, change: 0.063, volume: 1650000, openInterest: 5480000 },
  { symbol: 'ZNM6', description: '10Y T-Note Jun26', lastPrice: 110.445, change: 0.094, volume: 2180000, openInterest: 6250000 },
  { symbol: 'ZBM6', description: '30Y T-Bond Jun26', lastPrice: 117.672, change: 0.156, volume: 685000, openInterest: 1820000 },
  { symbol: 'UBM6', description: 'Ultra Bond Jun26', lastPrice: 126.344, change: 0.219, volume: 342000, openInterest: 985000 },
]

const BASE_SOFR: SOFRFuture[] = [
  { symbol: 'SFRH6', description: 'SOFR Mar26', price: 94.710, impliedRate: 5.290, change: 0.005, volume: 285000 },
  { symbol: 'SFRM6', description: 'SOFR Jun26', price: 94.820, impliedRate: 5.180, change: 0.010, volume: 342000 },
  { symbol: 'SFRU6', description: 'SOFR Sep26', price: 95.020, impliedRate: 4.980, change: 0.015, volume: 218000 },
  { symbol: 'SFRZ6', description: 'SOFR Dec26', price: 95.180, impliedRate: 4.820, change: 0.010, volume: 195000 },
  { symbol: 'SFRH7', description: 'SOFR Mar27', price: 95.350, impliedRate: 4.650, change: 0.008, volume: 165000 },
  { symbol: 'SFRM7', description: 'SOFR Jun27', price: 95.480, impliedRate: 4.520, change: 0.012, volume: 128000 },
  { symbol: 'SFRU7', description: 'SOFR Sep27', price: 95.560, impliedRate: 4.440, change: 0.006, volume: 95000 },
  { symbol: 'SFRZ7', description: 'SOFR Dec27', price: 95.620, impliedRate: 4.380, change: 0.008, volume: 72000 },
]

const BASE_YIELD_CURVE: YieldCurvePoint[] = [
  { tenor: '3M', years: 0.25, yield: 5.240, priorYield: 5.250, prevClose: 5.250 },
  { tenor: '6M', years: 0.5, yield: 5.120, priorYield: 5.135, prevClose: 5.135 },
  { tenor: '1Y', years: 1, yield: 4.920, priorYield: 4.940, prevClose: 4.940 },
  { tenor: '2Y', years: 2, yield: 4.720, priorYield: 4.745, prevClose: 4.745 },
  { tenor: '3Y', years: 3, yield: 4.600, priorYield: 4.620, prevClose: 4.620 },
  { tenor: '5Y', years: 5, yield: 4.470, priorYield: 4.490, prevClose: 4.490 },
  { tenor: '7Y', years: 7, yield: 4.420, priorYield: 4.435, prevClose: 4.435 },
  { tenor: '10Y', years: 10, yield: 4.380, priorYield: 4.400, prevClose: 4.400 },
  { tenor: '20Y', years: 20, yield: 4.550, priorYield: 4.565, prevClose: 4.565 },
  { tenor: '30Y', years: 30, yield: 4.610, priorYield: 4.625, prevClose: 4.625 },
]

/* ── Dashboard-friendly simplified exports ────────────────── */

export const DASHBOARD_ORDERS: {
  time: string
  security: string
  side: 'Buy' | 'Sell'
  size: string
  yieldPrice: string
  status: 'Filled' | 'Working' | 'Partial' | 'Cancelled'
}[] = [
  { time: '08:32:15', security: 'UST 4.250 02/36', side: 'Buy', size: '25MM', yieldPrice: '4.392% / 98.841', status: 'Filled' },
  { time: '08:45:02', security: 'UST 4.500 03/28', side: 'Buy', size: '50MM', yieldPrice: '4.725% / 99.569', status: 'Filled' },
  { time: '09:15:30', security: 'ZNM6 10Y Fut', side: 'Sell', size: '100MM', yieldPrice: '110.469', status: 'Filled' },
  { time: '09:42:18', security: 'JPM 5.250 01/31', side: 'Buy', size: '10MM', yieldPrice: '5.130% / 100.531', status: 'Filled' },
  { time: '10:05:44', security: 'UST 4.625 02/56', side: 'Sell', size: '25MM', yieldPrice: '4.598% / 100.438', status: 'Filled' },
  { time: '10:30:12', security: 'F 6.100 08/32', side: 'Buy', size: '5MM', yieldPrice: '6.575% / 97.406', status: 'Filled' },
  { time: '11:15:55', security: 'UST 4.250 02/36', side: 'Buy', size: '50MM', yieldPrice: '4.370% / 99.058', status: 'Partial' },
  { time: '12:02:30', security: 'AAPL 4.100 08/35', side: 'Buy', size: '15MM', yieldPrice: '4.700% / 95.219', status: 'Working' },
  { time: '12:45:10', security: 'ZTM6 2Y Fut', side: 'Buy', size: '75MM', yieldPrice: '103.200', status: 'Working' },
  { time: '13:30:22', security: 'BA 5.705 05/34', side: 'Sell', size: '8MM', yieldPrice: '5.880% / 98.750', status: 'Cancelled' },
]

export const DASHBOARD_POSITIONS: {
  security: string
  direction: 'Long' | 'Short'
  notional: number
  pnl: number
  dv01: number
}[] = [
  { security: 'UST 4.500 03/28', direction: 'Long', notional: 50_000_000, pnl: 12800, dv01: 9600 },
  { security: 'UST 4.250 02/36', direction: 'Long', notional: 100_000_000, pnl: 34000, dv01: 82500 },
  { security: 'UST 4.625 02/56', direction: 'Short', notional: 25_000_000, pnl: 15625, dv01: -42000 },
  { security: 'JPM 5.250 01/31', direction: 'Long', notional: 10_000_000, pnl: -2500, dv01: 4200 },
  { security: 'F 6.100 08/32', direction: 'Long', notional: 5_000_000, pnl: -6250, dv01: 2550 },
  { security: 'ZNM6 10Y Fut', direction: 'Short', notional: 200_000_000, pnl: -39000, dv01: -131000 },
  { security: 'ZTM6 2Y Fut', direction: 'Long', notional: 150_000_000, pnl: 21750, dv01: 56700 },
  { security: 'CDX NA IG S43', direction: 'Short', notional: 50_000_000, pnl: 12125, dv01: 0 },
  { security: 'AAPL 4.100 08/35', direction: 'Long', notional: 15_000_000, pnl: 8500, dv01: 11400 },
  { security: 'VZ 4.862 08/34', direction: 'Long', notional: 8_000_000, pnl: -3200, dv01: 5440 },
]

/* ── Rich Position & Order data for Positions/Blotter panels ── */

export const BASE_POSITIONS: Position[] = [
  { id: 'POS-001', security: 'UST 4.500 03/28', cusip: '91282CKL4', assetClass: 'Treasury', side: 'LONG', size: 50, avgPx: 99.569, currPx: 99.588, currYld: 4.715, dv01: 9600, cs01: 0, pnlToday: 12800, pnlMtd: 38200, pnlYtd: 95400, mktVal: 49_794_000 },
  { id: 'POS-002', security: 'UST 4.250 02/36', cusip: '91282CPQ8', assetClass: 'Treasury', side: 'LONG', size: 100, avgPx: 98.841, currPx: 98.976, currYld: 4.375, dv01: 82500, cs01: 0, pnlToday: 34000, pnlMtd: 112500, pnlYtd: 285000, mktVal: 98_976_000 },
  { id: 'POS-003', security: 'UST 4.625 02/56', cusip: '912810TX6', assetClass: 'Treasury', side: 'SHORT', size: 25, avgPx: 100.438, currPx: 100.312, currYld: 4.605, dv01: -42000, cs01: 0, pnlToday: 15625, pnlMtd: 28750, pnlYtd: 62500, mktVal: -25_078_000 },
  { id: 'POS-004', security: 'JPM 5.250 01/31', cusip: '46647PEF3', assetClass: 'Corporate', side: 'LONG', size: 10, avgPx: 100.531, currPx: 100.719, currYld: 5.100, dv01: 4200, cs01: 3570, pnlToday: -2500, pnlMtd: 8400, pnlYtd: 18800, mktVal: 10_071_900 },
  { id: 'POS-005', security: 'F 6.100 08/32', cusip: '345370DA5', assetClass: 'Corporate', side: 'LONG', size: 5, avgPx: 97.406, currPx: 97.563, currYld: 6.520, dv01: 2550, cs01: 2168, pnlToday: -6250, pnlMtd: -12800, pnlYtd: -31250, mktVal: 4_878_150 },
  { id: 'POS-006', security: 'ZNM6 10Y Fut', cusip: 'N/A', assetClass: 'Future', side: 'SHORT', size: 200, avgPx: 110.469, currPx: 110.445, currYld: 0, dv01: -131000, cs01: 0, pnlToday: -39000, pnlMtd: -85000, pnlYtd: -142000, mktVal: -22_089_000 },
  { id: 'POS-007', security: 'ZTM6 2Y Fut', cusip: 'N/A', assetClass: 'Future', side: 'LONG', size: 150, avgPx: 103.200, currPx: 103.270, currYld: 0, dv01: 56700, cs01: 0, pnlToday: 21750, pnlMtd: 45000, pnlYtd: 105000, mktVal: 15_490_500 },
  { id: 'POS-008', security: 'CDX NA IG S43', cusip: 'N/A', assetClass: 'CDS', side: 'SHORT', size: 50, avgPx: 0, currPx: 0, currYld: 0, dv01: 0, cs01: -24250, pnlToday: 12125, pnlMtd: 18500, pnlYtd: 42000, mktVal: -2_425_000 },
  { id: 'POS-009', security: 'AAPL 4.100 08/35', cusip: '037833EW5', assetClass: 'Corporate', side: 'LONG', size: 15, avgPx: 95.219, currPx: 95.531, currYld: 4.660, dv01: 11400, cs01: 4200, pnlToday: 8500, pnlMtd: 22000, pnlYtd: 46800, mktVal: 14_329_650 },
  { id: 'POS-010', security: 'VZ 4.862 08/34', cusip: '92343VGK6', assetClass: 'Corporate', side: 'LONG', size: 8, avgPx: 98.750, currPx: 98.906, currYld: 5.030, dv01: 5440, cs01: 3740, pnlToday: -3200, pnlMtd: 6400, pnlYtd: 12480, mktVal: 7_912_480 },
]

export const BASE_ORDERS: Order[] = [
  { orderId: 'FI-20260317-001', time: '08:32:15', security: 'UST 4.250 02/36', cusip: '91282CPQ8', side: 'BUY', sizeMM: 25, lmtYield: 4.392, lmtPrice: 98.841, filled: 25, avgYield: 4.388, avgPrice: 98.862, venue: 'TradeWeb', counterparty: 'Goldman Sachs', account: 'MAIN-001', status: 'Filled', trader: 'J. Smith', settleDate: '2026-03-19' },
  { orderId: 'FI-20260317-002', time: '08:45:02', security: 'UST 4.500 03/28', cusip: '91282CKL4', side: 'BUY', sizeMM: 50, lmtYield: 4.725, lmtPrice: 99.569, filled: 50, avgYield: 4.720, avgPrice: 99.578, venue: 'Bloomberg', counterparty: 'JP Morgan', account: 'MAIN-001', status: 'Filled', trader: 'J. Smith', settleDate: '2026-03-19' },
  { orderId: 'FI-20260317-003', time: '09:15:30', security: 'ZNM6 10Y Fut', cusip: 'N/A', side: 'SELL', sizeMM: 100, lmtYield: 0, lmtPrice: 110.469, filled: 100, avgYield: 0, avgPrice: 110.465, venue: 'CME Globex', counterparty: '', account: 'FUT-002', status: 'Filled', trader: 'M. Chen', settleDate: '2026-03-18' },
  { orderId: 'FI-20260317-004', time: '09:42:18', security: 'JPM 5.250 01/31', cusip: '46647PEF3', side: 'BUY', sizeMM: 10, lmtYield: 5.130, lmtPrice: 100.531, filled: 10, avgYield: 5.120, avgPrice: 100.625, venue: 'MarketAxess', counterparty: 'Citadel', account: 'CREDIT-003', status: 'Filled', trader: 'A. Patel', settleDate: '2026-03-19' },
  { orderId: 'FI-20260317-005', time: '10:05:44', security: 'UST 4.625 02/56', cusip: '912810TX6', side: 'SELL', sizeMM: 25, lmtYield: 4.598, lmtPrice: 100.438, filled: 25, avgYield: 4.600, avgPrice: 100.406, venue: 'TradeWeb', counterparty: 'Morgan Stanley', account: 'MAIN-001', status: 'Filled', trader: 'J. Smith', settleDate: '2026-03-19' },
  { orderId: 'FI-20260317-006', time: '10:30:12', security: 'F 6.100 08/32', cusip: '345370DA5', side: 'BUY', sizeMM: 5, lmtYield: 6.575, lmtPrice: 97.406, filled: 5, avgYield: 6.550, avgPrice: 97.563, venue: 'MarketAxess', counterparty: 'Barclays', account: 'HY-004', status: 'Filled', trader: 'A. Patel', settleDate: '2026-03-19' },
  { orderId: 'FI-20260317-007', time: '11:15:55', security: 'UST 4.250 02/36', cusip: '91282CPQ8', side: 'BUY', sizeMM: 50, lmtYield: 4.370, lmtPrice: 99.058, filled: 32, avgYield: 4.375, avgPrice: 98.976, venue: 'TradeWeb', counterparty: 'Citadel', account: 'MAIN-001', status: 'Partial', trader: 'J. Smith', settleDate: '2026-03-19' },
  { orderId: 'FI-20260317-008', time: '12:02:30', security: 'AAPL 4.100 08/35', cusip: '037833EW5', side: 'BUY', sizeMM: 15, lmtYield: 4.700, lmtPrice: 95.219, filled: 0, avgYield: 0, avgPrice: 0, venue: 'Bloomberg', counterparty: '', account: 'IG-005', status: 'Working', trader: 'A. Patel', settleDate: '2026-03-19' },
  { orderId: 'FI-20260317-009', time: '12:45:10', security: 'ZTM6 2Y Fut', cusip: 'N/A', side: 'BUY', sizeMM: 75, lmtYield: 0, lmtPrice: 103.200, filled: 0, avgYield: 0, avgPrice: 0, venue: 'CME Globex', counterparty: '', account: 'FUT-002', status: 'Working', trader: 'M. Chen', settleDate: '2026-03-18' },
  { orderId: 'FI-20260317-010', time: '13:30:22', security: 'BA 5.705 05/34', cusip: '097023DJ4', side: 'SELL', sizeMM: 8, lmtYield: 5.880, lmtPrice: 98.750, filled: 0, avgYield: 0, avgPrice: 0, venue: 'MarketAxess', counterparty: '', account: 'IG-005', status: 'Cancelled', trader: 'A. Patel', settleDate: '2026-03-19' },
]

/* ── Live market data hook ─────────────────────────────────── */

function jitter(val: number, bps: number) {
  return val + (Math.random() - 0.5) * 2 * (bps / 10000)
}

export function useLiveMarketData(): MarketData {
  const [data, setData] = useState<MarketData>(() => buildSnapshot())

  useEffect(() => {
    const id = setInterval(() => setData(buildSnapshot()), 2000)
    return () => clearInterval(id)
  }, [])

  return data
}

function buildSnapshot(): MarketData {
  const treasuries: Treasury[] = BASE_TREASURIES.map((t) => {
    const bidYield = jitter(t.bidYield, 0.4)
    const askYield = jitter(t.askYield, 0.4)
    const changeBps = t.changeBps + (Math.random() - 0.5) * 0.4
    return {
      ...t,
      bidYield,
      askYield,
      changeBps,
      mid: (bidYield + askYield) / 2,
      chg: changeBps / 100,
    }
  })

  const corpBonds: CorpBond[] = BASE_CORP_BONDS.map((b) => ({
    ...b,
    bidYield: jitter(b.bidYield, 0.3),
    askYield: jitter(b.askYield, 0.3),
    changeBps: b.changeBps + (Math.random() - 0.5) * 0.3,
  }))

  const cdxIndices: CDXIndex[] = BASE_CDX.map((c) => {
    const midSpread = c.midSpread + (Math.random() - 0.5) * 0.6
    const changeBps = c.changeBps + (Math.random() - 0.5) * 0.4
    return { ...c, midSpread, changeBps, mid: midSpread, chg: changeBps }
  })

  const cdsNames: CDS[] = BASE_CDS_NAMES.map((s) => ({
    ...s,
    midSpread: s.midSpread + (Math.random() - 0.5) * 0.8,
    changeBps: s.changeBps + (Math.random() - 0.5) * 0.4,
  }))

  const tFutures: TreasuryFuture[] = BASE_T_FUTURES.map((f) => ({
    ...f,
    lastPrice: f.lastPrice + (Math.random() - 0.5) * 0.0625,
    change: f.change + (Math.random() - 0.5) * 0.03,
  }))

  const sofrFutures: SOFRFuture[] = BASE_SOFR.map((f) => ({
    ...f,
    price: f.price + (Math.random() - 0.5) * 0.005,
    impliedRate: f.impliedRate + (Math.random() - 0.5) * 0.005,
  }))

  const yieldCurve: YieldCurvePoint[] = BASE_YIELD_CURVE.map((pt) => ({
    ...pt,
    yield: jitter(pt.yield, 0.3),
  }))

  return { treasuries, corpBonds, tFutures, sofrFutures, cdxIndices, cdsNames, yieldCurve }
}
