import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import type { ColDef } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { MarketDataService } from '../../../services/market-data.service';
import { marketsUITheme } from '../../../shared/ag-grid-theme';
import type { CorpBond, CDXIndex, CDS } from '../../../models/market-data.models';

ModuleRegistry.registerModules([AllEnterpriseModule]);

type RatingBucket = 'investment-high' | 'investment' | 'investment-low' | 'speculative';

function getRatingBucket(moody: string): RatingBucket {
  if (moody.startsWith('Aaa') || moody.startsWith('Aa')) return 'investment-high';
  if (moody.startsWith('A')) return 'investment';
  if (moody.startsWith('Baa')) return 'investment-low';
  return 'speculative';
}

function getRatingColor(bucket: RatingBucket): string {
  switch (bucket) {
    case 'investment-high': return 'var(--buy)';
    case 'investment': return 'var(--buy)';
    case 'investment-low': return 'var(--warning)';
    case 'speculative': return 'var(--sell)';
  }
}

@Component({
  selector: 'app-credit-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AgGridAngular],
  template: `
    <div class="h-full grid grid-cols-12 gap-3 p-4" style="grid-template-rows: 1fr auto;">
      <!-- Corporate Bonds Grid (left 9 cols, full height row 1) -->
      <div class="col-span-9 row-span-1 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
        <div class="flex items-center gap-2 px-3 py-2 border-b border-border">
          <span class="text-xs font-semibold">Corporate Bonds</span>
          <span class="text-[10px] text-muted-foreground">{{ mds.corpBonds().length }} bonds</span>
          <div class="flex items-center gap-1.5 ml-auto">
            <span class="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-secondary text-muted-foreground">
              IG {{ igCount() }}
            </span>
            <span class="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-secondary text-muted-foreground">
              HY {{ hyCount() }}
            </span>
          </div>
        </div>
        <div class="flex-1 min-h-0">
          <ag-grid-angular
            style="width: 100%; height: 100%;"
            [theme]="agTheme"
            [rowData]="mds.corpBonds()"
            [columnDefs]="bondColumnDefs"
            [defaultColDef]="defaultColDef"
            [getRowId]="getBondRowId"
            [animateRows]="false"
            [suppressCellFocus]="true"
          />
        </div>
      </div>

      <!-- CDX Indices (right 3 cols, row 1) -->
      <div class="col-span-3 row-span-1 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
        <div class="flex items-center gap-2 px-3 py-2 border-b border-border">
          <span class="text-xs font-semibold">CDX Indices</span>
          <span class="text-[9px] bg-secondary px-1.5 py-0.5 rounded-full text-muted-foreground font-medium">
            {{ mds.cdxIndices().length }}
          </span>
        </div>
        <div class="flex-1 min-h-0">
          <ag-grid-angular
            style="width: 100%; height: 100%;"
            [theme]="agTheme"
            [rowData]="mds.cdxIndices()"
            [columnDefs]="cdxColumnDefs"
            [defaultColDef]="defaultColDef"
            [getRowId]="getCdxRowId"
            [animateRows]="false"
            [suppressCellFocus]="true"
          />
        </div>
      </div>

      <!-- Single-Name CDS (full width, row 2) -->
      <div class="col-span-12 bg-card rounded-xl border border-border overflow-hidden flex flex-col" style="height: 280px;">
        <div class="flex items-center gap-2 px-3 py-2 border-b border-border">
          <span class="text-xs font-semibold">Single-Name CDS</span>
          <span class="text-[9px] bg-secondary px-1.5 py-0.5 rounded-full text-muted-foreground font-medium">
            {{ mds.cdsNames().length }}
          </span>
        </div>
        <div class="flex-1 min-h-0">
          <ag-grid-angular
            style="width: 100%; height: 100%;"
            [theme]="agTheme"
            [rowData]="mds.cdsNames()"
            [columnDefs]="cdsColumnDefs"
            [defaultColDef]="defaultColDef"
            [getRowId]="getCdsRowId"
            [animateRows]="false"
            [suppressCellFocus]="true"
          />
        </div>
      </div>
    </div>
  `,
})
export class CreditPanelComponent {
  readonly mds = inject(MarketDataService);
  readonly agTheme = marketsUITheme;

  readonly igCount = computed(() => this.mds.corpBonds().filter(b => !b.isHY).length);
  readonly hyCount = computed(() => this.mds.corpBonds().filter(b => b.isHY).length);

  readonly defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    suppressHeaderMenuButton: true,
  };

  readonly getBondRowId = (params: { data: CorpBond }) => params.data.cusip;
  readonly getCdxRowId = (params: { data: CDXIndex }) => `${params.data.name}-${params.data.series}-${params.data.tenor}`;
  readonly getCdsRowId = (params: { data: CDS }) => params.data.ticker;

  readonly bondColumnDefs: ColDef<CorpBond>[] = [
    { field: 'issuer', headerName: 'Issuer', width: 130, filter: 'agTextColumnFilter', cellClass: 'font-medium', pinned: 'left' },
    { field: 'security', headerName: 'Security', flex: 1, minWidth: 100 },
    { field: 'cusip', headerName: 'CUSIP', width: 88, cellClass: 'font-mono text-[10px]' },
    {
      field: 'ratingMoody', headerName: 'Rating', width: 80,
      cellStyle: params => {
        if (!params.data) return undefined;
        const color = getRatingColor(getRatingBucket(params.data.ratingMoody));
        return { color, fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: '500' };
      },
      valueFormatter: params => params.data ? `${params.data.ratingMoody}/${params.data.ratingSP}` : '',
    },
    { field: 'sector', headerName: 'Sector', width: 88, filter: 'agTextColumnFilter' },
    { field: 'coupon', headerName: 'Cpn', width: 68, type: 'rightAligned', cellClass: 'font-mono', valueFormatter: p => p.value != null ? p.value.toFixed(3) + '%' : '' },
    { field: 'maturity', headerName: 'Maturity', width: 88 },
    { field: 'bidYield', headerName: 'Bid Yld', width: 78, type: 'rightAligned', cellClass: 'font-mono font-semibold text-buy', valueFormatter: p => p.value != null ? p.value.toFixed(3) : '' },
    { field: 'askYield', headerName: 'Ask Yld', width: 78, type: 'rightAligned', cellClass: 'font-mono text-sell', valueFormatter: p => p.value != null ? p.value.toFixed(3) : '' },
    { field: 'bidPrice', headerName: 'Bid Px', width: 72, type: 'rightAligned', cellClass: 'font-mono text-buy', valueFormatter: p => p.value != null ? p.value.toFixed(2) : '' },
    { field: 'askPrice', headerName: 'Ask Px', width: 72, type: 'rightAligned', cellClass: 'font-mono text-sell', valueFormatter: p => p.value != null ? p.value.toFixed(2) : '' },
    { field: 'zSpread', headerName: 'Z-Spd', width: 72, type: 'rightAligned', cellClass: 'font-mono text-primary', valueFormatter: p => p.value != null ? Math.round(p.value).toString() : '' },
    { field: 'oas', headerName: 'OAS', width: 72, type: 'rightAligned', cellClass: 'font-mono', valueFormatter: p => p.value != null ? Math.round(p.value).toString() : '' },
    {
      field: 'changeBps', headerName: 'Chg bps', width: 76, type: 'rightAligned', cellClass: 'font-mono',
      valueFormatter: p => p.value != null ? (p.value >= 0 ? '+' : '') + p.value.toFixed(1) : '',
      cellStyle: p => {
        if (p.value == null) return undefined;
        if (p.value > 0) return { color: 'var(--sell)' };
        if (p.value < 0) return { color: 'var(--buy)' };
        return undefined;
      },
    },
    { field: 'duration', headerName: 'Dur', width: 62, type: 'rightAligned', cellClass: 'font-mono', valueFormatter: p => p.value != null ? p.value.toFixed(2) : '' },
    { field: 'dv01PerMM', headerName: 'DV01/MM', width: 80, type: 'rightAligned', cellClass: 'font-mono', valueFormatter: p => p.value != null ? '$' + Math.round(p.value).toLocaleString() : '' },
  ];

  readonly cdxColumnDefs: ColDef<CDXIndex>[] = [
    { field: 'name', headerName: 'Index', width: 120, cellClass: 'font-medium' },
    { field: 'series', headerName: 'Ser', width: 56, cellClass: 'font-mono' },
    { field: 'tenor', headerName: 'Tenor', width: 60 },
    { field: 'bidSpread', headerName: 'Bid', width: 68, type: 'rightAligned', cellClass: 'font-mono font-semibold text-buy', valueFormatter: p => p.value != null ? p.value.toFixed(1) : '' },
    { field: 'askSpread', headerName: 'Ask', width: 68, type: 'rightAligned', cellClass: 'font-mono text-sell', valueFormatter: p => p.value != null ? p.value.toFixed(1) : '' },
    { field: 'midSpread', headerName: 'Mid', width: 68, type: 'rightAligned', cellClass: 'font-mono', valueFormatter: p => p.value != null ? p.value.toFixed(1) : '' },
    {
      field: 'changeBps', headerName: 'Chg', width: 60, type: 'rightAligned', cellClass: 'font-mono',
      valueFormatter: p => p.value != null ? (p.value >= 0 ? '+' : '') + p.value.toFixed(1) : '',
      cellStyle: p => {
        if (p.value == null) return undefined;
        if (p.value > 0) return { color: 'var(--sell)' };
        if (p.value < 0) return { color: 'var(--buy)' };
        return undefined;
      },
    },
    { field: 'spreadDuration', headerName: 'Spd Dur', width: 74, type: 'rightAligned', cellClass: 'font-mono', valueFormatter: p => p.value != null ? p.value.toFixed(2) : '' },
  ];

  readonly cdsColumnDefs: ColDef<CDS>[] = [
    { field: 'referenceEntity', headerName: 'Reference Entity', width: 170, filter: 'agTextColumnFilter' },
    {
      field: 'ratingMoody', headerName: 'Rating', width: 80,
      cellStyle: params => {
        if (!params.data) return undefined;
        const color = getRatingColor(getRatingBucket(params.data.ratingMoody));
        return { color, fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: '500' };
      },
      valueFormatter: params => params.data ? `${params.data.ratingMoody}/${params.data.ratingSP}` : '',
    },
    { field: 'sector', headerName: 'Sector', width: 88, filter: 'agTextColumnFilter' },
    { field: 'bidSpread', headerName: 'Bid', width: 72, type: 'rightAligned', cellClass: 'font-mono font-semibold text-buy', valueFormatter: p => p.value != null ? p.value.toFixed(1) : '' },
    { field: 'askSpread', headerName: 'Ask', width: 72, type: 'rightAligned', cellClass: 'font-mono text-sell', valueFormatter: p => p.value != null ? p.value.toFixed(1) : '' },
    { field: 'midSpread', headerName: 'Mid', width: 72, type: 'rightAligned', cellClass: 'font-mono', valueFormatter: p => p.value != null ? p.value.toFixed(1) : '' },
    {
      field: 'changeBps', headerName: 'Chg bps', width: 72, type: 'rightAligned', cellClass: 'font-mono',
      valueFormatter: p => p.value != null ? (p.value >= 0 ? '+' : '') + p.value.toFixed(1) : '',
      cellStyle: p => {
        if (p.value == null) return undefined;
        if (p.value > 0) return { color: 'var(--sell)' };
        if (p.value < 0) return { color: 'var(--buy)' };
        return undefined;
      },
    },
  ];
}
