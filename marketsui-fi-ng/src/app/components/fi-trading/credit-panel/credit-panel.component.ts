import { Component, computed, inject, signal } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { AllEnterpriseModule, LicenseManager, ModuleRegistry } from 'ag-grid-enterprise';
import type { ColDef, GridOptions, RowClassRules } from 'ag-grid-enterprise';
import { marketsUITheme } from '../../../shared/ag-grid-theme';
import { fmtChgBps, fmtPrice, fmtYield } from '../../../shared/utils';
import type { CorpBond, CDXIndex, CDS } from '../../../models/market-data.models';
import { MarketDataService } from '../../../services/market-data.service';

ModuleRegistry.registerModules([AllEnterpriseModule]);

/* ── Rating helpers ─────────────────────────────────────── */
type RatingBucket = 'Aaa/Aa' | 'A' | 'Baa' | 'HY' | 'NR';

function getRatingBucket(rating: string): RatingBucket {
  if (!rating) return 'NR';
  if (/^(Aaa|Aa[1-3]?)$/i.test(rating)) return 'Aaa/Aa';
  if (/^A[1-3]?$/i.test(rating)) return 'A';
  if (/^Baa[1-3]?$/i.test(rating)) return 'Baa';
  return 'HY';
}

function getRatingColor(bucket: RatingBucket): string {
  switch (bucket) {
    case 'Aaa/Aa':
      return 'var(--buy)';
    case 'A':
      return 'var(--buy)';
    case 'Baa':
      return 'var(--warning)';
    case 'HY':
      return 'var(--sell)';
    default:
      return 'var(--muted-foreground)';
  }
}

/* ── No local data — uses MarketDataService signals ──── */

/* ── Column definitions ─────────────────────────────────── */
const corpBondCols: ColDef<CorpBond>[] = [
  { field: 'issuer', headerName: 'Issuer', width: 130, pinned: 'left', cellClass: 'font-medium' },
  { field: 'security', headerName: 'Security', flex: 1 },
  { field: 'cusip', headerName: 'CUSIP', width: 88, cellClass: 'font-mono text-[10px]' },
  {
    headerName: 'Rating',
    width: 80,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      const bucket = getRatingBucket(params.data.ratingMoody);
      const color = getRatingColor(bucket);
      return `<span class="font-mono text-[10px] font-medium" style="color: ${color}">${params.data.ratingMoody}/${params.data.ratingSP}</span>`;
    },
  },
  { field: 'sector', headerName: 'Sector', width: 88 },
  { field: 'coupon', headerName: 'Cpn', width: 68, valueFormatter: (p: any) => p.value?.toFixed(3) ?? '' },
  { field: 'maturity', headerName: 'Maturity', width: 88 },
  { field: 'bidYield', headerName: 'Bid Yld', width: 78, cellClass: 'text-buy', valueFormatter: (p: any) => p.value != null ? fmtYield(p.value) : '' },
  { field: 'askYield', headerName: 'Ask Yld', width: 78, cellClass: 'text-sell', valueFormatter: (p: any) => p.value != null ? fmtYield(p.value) : '' },
  { field: 'bidPrice', headerName: 'Bid Px', width: 72, cellClass: 'text-buy', valueFormatter: (p: any) => p.value != null ? fmtPrice(p.value) : '' },
  { field: 'askPrice', headerName: 'Ask Px', width: 72, cellClass: 'text-sell', valueFormatter: (p: any) => p.value != null ? fmtPrice(p.value) : '' },
  { field: 'zSpread', headerName: 'Z-Spd', width: 72, cellClass: 'text-primary', valueFormatter: (p: any) => p.value?.toFixed(0) ?? '' },
  { field: 'oas', headerName: 'OAS', width: 72, valueFormatter: (p: any) => p.value?.toFixed(0) ?? '' },
  {
    field: 'changeBps',
    headerName: 'Chg bps',
    width: 76,
    valueFormatter: (p: any) => p.value != null ? fmtChgBps(p.value) : '',
    cellStyle: (params: any) => {
      if (params.value == null) return null;
      return { color: params.value >= 0 ? 'var(--sell)' : 'var(--buy)' };
    },
  },
  { field: 'duration', headerName: 'Dur', width: 62, valueFormatter: (p: any) => p.value?.toFixed(1) ?? '' },
  { field: 'dv01PerMM', headerName: 'DV01/MM', width: 80, valueFormatter: (p: any) => p.value != null ? '$' + Math.round(p.value).toLocaleString() : '' },
];

const corpBondRowClassRules: RowClassRules<CorpBond> = {
  'bg-sell/5': (params) => !!params.data?.isHY,
};

const cdxCols: ColDef<CDXIndex>[] = [
  { field: 'name', headerName: 'Index', width: 120 },
  { field: 'series', headerName: 'Ser', width: 56 },
  { field: 'tenor', headerName: 'Tenor', width: 60 },
  { field: 'bidSpread', headerName: 'Bid', width: 68, cellClass: 'text-buy', valueFormatter: (p: any) => p.value?.toFixed(1) ?? '' },
  { field: 'askSpread', headerName: 'Ask', width: 68, cellClass: 'text-sell', valueFormatter: (p: any) => p.value?.toFixed(1) ?? '' },
  { field: 'midSpread', headerName: 'Mid', width: 68, valueFormatter: (p: any) => p.value?.toFixed(1) ?? '' },
  {
    field: 'changeBps',
    headerName: 'Chg',
    width: 60,
    valueFormatter: (p: any) => p.value != null ? fmtChgBps(p.value) : '',
    cellStyle: (params: any) => {
      if (params.value == null) return null;
      return { color: params.value >= 0 ? 'var(--sell)' : 'var(--buy)' };
    },
  },
  { field: 'spreadDuration', headerName: 'Spd Dur', width: 74, valueFormatter: (p: any) => p.value?.toFixed(2) ?? '' },
];

const cdsCols: ColDef<CDS>[] = [
  {
    headerName: 'Reference Entity',
    width: 170,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      return `<span>${params.data.referenceEntity} <span class="text-muted-foreground text-[10px]">${params.data.ticker}</span></span>`;
    },
  },
  {
    headerName: 'Rating',
    width: 80,
    cellRenderer: (params: any) => {
      if (!params.data) return '';
      const bucket = getRatingBucket(params.data.ratingMoody);
      const color = getRatingColor(bucket);
      return `<span class="font-mono text-[10px] font-medium" style="color: ${color}">${params.data.ratingMoody}/${params.data.ratingSP}</span>`;
    },
  },
  { field: 'sector', headerName: 'Sector', width: 88 },
  { field: 'bidSpread', headerName: 'Bid', width: 72, cellClass: 'text-buy', valueFormatter: (p: any) => p.value?.toFixed(1) ?? '' },
  { field: 'askSpread', headerName: 'Ask', width: 72, cellClass: 'text-sell', valueFormatter: (p: any) => p.value?.toFixed(1) ?? '' },
  { field: 'midSpread', headerName: 'Mid', width: 72, valueFormatter: (p: any) => p.value?.toFixed(1) ?? '' },
  {
    field: 'changeBps',
    headerName: 'Chg bps',
    width: 72,
    valueFormatter: (p: any) => p.value != null ? fmtChgBps(p.value) : '',
    cellStyle: (params: any) => {
      if (params.value == null) return null;
      return { color: params.value >= 0 ? 'var(--sell)' : 'var(--buy)' };
    },
  },
];

@Component({
  selector: 'app-credit-panel',
  standalone: true,
  imports: [AgGridAngular],
  template: `
    <div class="grid h-full p-2 gap-2" style="grid-template-columns: 9fr 3fr; grid-template-rows: 10fr 5fr;">
      <!-- Corporate Bonds (top-left) -->
      <div class="bg-card rounded-lg border border-border flex flex-col overflow-hidden" style="grid-column: 1; grid-row: 1;">
        <div class="flex items-center justify-between px-3 py-1.5 border-b border-border shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-foreground">Corporate Bonds</span>
            <span class="text-[10px] text-muted-foreground font-mono">{{ corpBonds().length }}</span>
            <span class="text-[9px] font-medium px-1.5 py-0.5 rounded bg-buy/10 text-buy">IG {{ igCount() }}</span>
            <span class="text-[9px] font-medium px-1.5 py-0.5 rounded bg-sell/10 text-sell">HY {{ hyCount() }}</span>
          </div>
        </div>
        <div class="flex-1 min-h-0">
          <ag-grid-angular
            class="w-full h-full"
            [theme]="theme"
            [rowData]="corpBonds()"
            [columnDefs]="corpBondColDefs"
            [rowClassRules]="corpBondRowClassRules"
            [defaultColDef]="defaultColDef"
            [animateRows]="false"
            [suppressCellFocus]="true"
            [rowSelection]="rowSelection"
          />
        </div>
      </div>

      <!-- CDX Indices (top-right) -->
      <div class="bg-card rounded-lg border border-border flex flex-col overflow-hidden" style="grid-column: 2; grid-row: 1;">
        <div class="flex items-center px-3 py-1.5 border-b border-border shrink-0">
          <span class="text-xs font-semibold text-foreground">CDX Indices</span>
          <span class="text-[10px] text-muted-foreground font-mono ml-2">{{ cdxIndices().length }}</span>
        </div>
        <div class="flex-1 min-h-0">
          <ag-grid-angular
            class="w-full h-full"
            [theme]="theme"
            [rowData]="cdxIndices()"
            [columnDefs]="cdxColDefs"
            [defaultColDef]="defaultColDef"
            [animateRows]="false"
            [suppressCellFocus]="true"
            [rowSelection]="rowSelection"
          />
        </div>
      </div>

      <!-- Single-Name CDS (bottom, full width) -->
      <div class="bg-card rounded-lg border border-border flex flex-col overflow-hidden" style="grid-column: 1 / -1; grid-row: 2;">
        <div class="flex items-center px-3 py-1.5 border-b border-border shrink-0">
          <span class="text-xs font-semibold text-foreground">Single-Name CDS</span>
          <span class="text-[10px] text-muted-foreground font-mono ml-2">{{ cdsNames().length }}</span>
        </div>
        <div class="flex-1 min-h-0">
          <ag-grid-angular
            class="w-full h-full"
            [theme]="theme"
            [rowData]="cdsNames()"
            [columnDefs]="cdsColDefs"
            [defaultColDef]="defaultColDef"
            [animateRows]="false"
            [suppressCellFocus]="true"
            [rowSelection]="rowSelection"
          />
        </div>
      </div>
    </div>
  `,
})
export class CreditPanelComponent {
  private readonly mds = inject(MarketDataService);

  readonly theme = marketsUITheme;

  readonly defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    suppressMovable: true,
  };

  readonly rowSelection: GridOptions['rowSelection'] = { mode: 'singleRow', enableClickSelection: true };

  /* ── Data from service ─────────────────────────────────── */
  readonly corpBonds = this.mds.corpBonds;
  readonly cdxIndices = this.mds.cdxIndices;
  readonly cdsNames = this.mds.cdsNames;

  /* ── Column defs ──────────────────────────────────────── */
  readonly corpBondColDefs = corpBondCols;
  readonly corpBondRowClassRules = corpBondRowClassRules;
  readonly cdxColDefs = cdxCols;
  readonly cdsColDefs = cdsCols;

  /* ── Computed badges ──────────────────────────────────── */
  readonly igCount = computed(() => this.mds.corpBonds().filter((b) => !b.isHY).length);
  readonly hyCount = computed(() => this.mds.corpBonds().filter((b) => b.isHY).length);
}
