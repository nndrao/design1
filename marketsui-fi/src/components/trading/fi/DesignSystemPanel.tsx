import React from "react";

interface ColorToken {
  token: string;
  tailwind: string;
  description: string;
}

interface ColorGroup {
  label: string;
  tokens: ColorToken[];
}

const colorGroups: ColorGroup[] = [
  {
    label: "Core Surfaces",
    tokens: [
      { token: "--background", tailwind: "bg-background", description: "Page / app background" },
      { token: "--foreground", tailwind: "text-foreground", description: "Primary text color" },
      { token: "--card", tailwind: "bg-card", description: "Card / panel background" },
      { token: "--card-foreground", tailwind: "text-card-foreground", description: "Text on cards" },
      { token: "--popover", tailwind: "bg-popover", description: "Popover / dropdown background" },
      { token: "--popover-foreground", tailwind: "text-popover-foreground", description: "Text inside popovers" },
    ],
  },
  {
    label: "Brand",
    tokens: [
      { token: "--primary", tailwind: "bg-primary", description: "Primary brand / interactive color" },
      { token: "--primary-foreground", tailwind: "text-primary-foreground", description: "Text on primary backgrounds" },
    ],
  },
  {
    label: "Neutral",
    tokens: [
      { token: "--secondary", tailwind: "bg-secondary", description: "Secondary surfaces" },
      { token: "--secondary-foreground", tailwind: "text-secondary-foreground", description: "Text on secondary" },
      { token: "--muted", tailwind: "bg-muted", description: "Muted / subtle backgrounds" },
      { token: "--muted-foreground", tailwind: "text-muted-foreground", description: "De-emphasized text" },
      { token: "--accent", tailwind: "bg-accent", description: "Accent highlights" },
      { token: "--accent-foreground", tailwind: "text-accent-foreground", description: "Text on accent" },
    ],
  },
  {
    label: "Semantic",
    tokens: [
      { token: "--destructive", tailwind: "bg-destructive", description: "Error / destructive actions" },
      { token: "--destructive-foreground", tailwind: "text-destructive-foreground", description: "Text on destructive" },
    ],
  },
  {
    label: "Chrome",
    tokens: [
      { token: "--border", tailwind: "border-border", description: "Borders and dividers" },
      { token: "--input", tailwind: "border-input", description: "Input field borders" },
      { token: "--ring", tailwind: "ring-ring", description: "Focus ring color" },
    ],
  },
  {
    label: "Trading: Buy/Sell",
    tokens: [
      { token: "--buy", tailwind: "bg-buy", description: "Buy action background" },
      { token: "--buy-foreground", tailwind: "text-buy-foreground", description: "Text on buy background" },
      { token: "--sell", tailwind: "bg-sell", description: "Sell action background" },
      { token: "--sell-foreground", tailwind: "text-sell-foreground", description: "Text on sell background" },
    ],
  },
  {
    label: "Trading: P&L",
    tokens: [
      { token: "--positive", tailwind: "text-positive", description: "Profit / positive change" },
      { token: "--negative", tailwind: "text-negative", description: "Loss / negative change" },
      { token: "--unchanged", tailwind: "text-unchanged", description: "Flat / no change" },
    ],
  },
  {
    label: "Trading: Order Status",
    tokens: [
      { token: "--status-filled", tailwind: "text-status-filled", description: "Fully filled orders" },
      { token: "--status-partial", tailwind: "text-status-partial", description: "Partially filled orders" },
      { token: "--status-working", tailwind: "text-status-working", description: "Working / open orders" },
      { token: "--status-cancelled", tailwind: "text-status-cancelled", description: "Cancelled orders" },
      { token: "--status-rejected", tailwind: "text-status-rejected", description: "Rejected orders" },
    ],
  },
  {
    label: "Alerts",
    tokens: [
      { token: "--warning", tailwind: "bg-warning", description: "Warning / caution state" },
      { token: "--warning-foreground", tailwind: "text-warning-foreground", description: "Text on warning" },
      { token: "--info", tailwind: "bg-info", description: "Informational state" },
      { token: "--info-foreground", tailwind: "text-info-foreground", description: "Text on info" },
      { token: "--success", tailwind: "bg-success", description: "Success state" },
      { token: "--success-foreground", tailwind: "text-success-foreground", description: "Text on success" },
    ],
  },
  {
    label: "Charts",
    tokens: [
      { token: "--chart-1", tailwind: "bg-chart-1", description: "Chart series 1 (blue)" },
      { token: "--chart-2", tailwind: "bg-chart-2", description: "Chart series 2 (green)" },
      { token: "--chart-3", tailwind: "bg-chart-3", description: "Chart series 3 (amber)" },
      { token: "--chart-4", tailwind: "bg-chart-4", description: "Chart series 4 (red)" },
      { token: "--chart-5", tailwind: "bg-chart-5", description: "Chart series 5 (purple)" },
    ],
  },
  {
    label: "UI",
    tokens: [
      { token: "--highlight", tailwind: "bg-highlight", description: "Row hover highlight" },
      { token: "--selection", tailwind: "bg-selection", description: "Selected row / item" },
      { token: "--ticker-bar", tailwind: "bg-ticker-bar", description: "Scrolling ticker bar background" },
      { token: "--ticker-bar-foreground", tailwind: "text-ticker-bar-foreground", description: "Ticker bar text" },
    ],
  },
  {
    label: "Sidebar",
    tokens: [
      { token: "--sidebar", tailwind: "bg-sidebar", description: "Sidebar background" },
      { token: "--sidebar-foreground", tailwind: "text-sidebar-foreground", description: "Sidebar text" },
      { token: "--sidebar-primary", tailwind: "bg-sidebar-primary", description: "Sidebar primary accent" },
      { token: "--sidebar-primary-foreground", tailwind: "text-sidebar-primary-foreground", description: "Text on sidebar primary" },
      { token: "--sidebar-accent", tailwind: "bg-sidebar-accent", description: "Sidebar accent background" },
      { token: "--sidebar-accent-foreground", tailwind: "text-sidebar-accent-foreground", description: "Text on sidebar accent" },
      { token: "--sidebar-border", tailwind: "border-sidebar-border", description: "Sidebar border color" },
      { token: "--sidebar-ring", tailwind: "ring-sidebar-ring", description: "Sidebar focus ring" },
    ],
  },
];

const typeSizes = [
  { label: "text-xs", size: "10px", className: "text-[10px]" },
  { label: "text-sm", size: "12px", className: "text-[12px]" },
  { label: "text-base", size: "14px", className: "text-[14px]" },
  { label: "text-lg", size: "16px", className: "text-[16px]" },
  { label: "text-xl", size: "20px", className: "text-[20px]" },
  { label: "text-2xl", size: "24px", className: "text-[24px]" },
];

const fontWeights = [
  { label: "Normal", weight: 400, className: "font-normal" },
  { label: "Medium", weight: 500, className: "font-medium" },
  { label: "Semibold", weight: 600, className: "font-semibold" },
  { label: "Bold", weight: 700, className: "font-bold" },
];

const spacingScale = [
  { unit: 1, px: 4 },
  { unit: 2, px: 8 },
  { unit: 3, px: 12 },
  { unit: 4, px: 16 },
  { unit: 6, px: 24 },
  { unit: 8, px: 32 },
  { unit: 12, px: 48 },
  { unit: 16, px: 64 },
];

const radii = [
  { label: "rounded-sm", className: "rounded-sm" },
  { label: "rounded", className: "rounded" },
  { label: "rounded-md", className: "rounded-md" },
  { label: "rounded-lg", className: "rounded-lg" },
  { label: "rounded-xl", className: "rounded-xl" },
  { label: "rounded-2xl", className: "rounded-2xl" },
];

const shadows = [
  { label: "shadow-sm", className: "shadow-sm" },
  { label: "shadow", className: "shadow" },
  { label: "shadow-md", className: "shadow-md" },
  { label: "shadow-lg", className: "shadow-lg" },
  { label: "shadow-xl", className: "shadow-xl" },
];

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-card-foreground mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function ColorGroupRows({ group }: { group: ColorGroup }) {
  return (
    <>
      <tr>
        <td
          colSpan={5}
          className="pt-4 pb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {group.label}
        </td>
      </tr>
      {group.tokens.map((t) => (
        <tr key={t.token} className="border-t border-border/50">
          <td className="px-3 py-2">
            <div
              className="w-8 h-8 rounded-md border border-border"
              style={{ background: `var(${t.token})` }}
            />
          </td>
          <td className="px-3 py-2 font-mono text-xs text-foreground">
            {t.token}
          </td>
          <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
            var({t.token})
          </td>
          <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
            {t.tailwind}
          </td>
          <td className="px-3 py-2 text-sm text-muted-foreground">
            {t.description}
          </td>
        </tr>
      ))}
    </>
  );
}

export function DesignSystemPanel() {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-6 bg-background">
      <h1 className="text-2xl font-bold text-foreground">Design System</h1>

      {/* Color Palette */}
      <SectionCard title="Color Palette">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Swatch
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Token
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  CSS Variable
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tailwind
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {colorGroups.map((g) => (
                <ColorGroupRows key={g.label} group={g} />
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Typography */}
      <SectionCard title="Typography">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Font Family: Inter
            </h3>
            <div className="space-y-3">
              {typeSizes.map((s) => (
                <div key={s.label} className="flex items-baseline gap-4">
                  <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
                    {s.label} ({s.size})
                  </span>
                  <span
                    className={`${s.className} text-foreground`}
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    The quick brown fox jumps over the lazy dog
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Font Weights
            </h3>
            <div className="space-y-2">
              {fontWeights.map((w) => (
                <div key={w.weight} className="flex items-baseline gap-4">
                  <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
                    {w.weight}
                  </span>
                  <span
                    className={`text-base text-foreground ${w.className}`}
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {w.label} &mdash; Trading Dashboard 123,456.78
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Monospace: JetBrains Mono
            </h3>
            <div className="space-y-2">
              {typeSizes.slice(0, 4).map((s) => (
                <div key={s.label} className="flex items-baseline gap-4">
                  <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
                    {s.label} ({s.size})
                  </span>
                  <span
                    className={`${s.className} text-foreground`}
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    USD/JPY 149.325 +0.42%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Spacing Scale */}
      <SectionCard title="Spacing Scale">
        <div className="space-y-3">
          {spacingScale.map((s) => (
            <div key={s.unit} className="flex items-center gap-4">
              <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground text-right">
                {s.unit} ({s.px}px)
              </span>
              <div
                className="bg-primary rounded-sm"
                style={{ width: `${s.px}px`, height: "24px" }}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Border Radius */}
      <SectionCard title="Border Radius">
        <div className="flex flex-wrap gap-6">
          {radii.map((r) => (
            <div key={r.label} className="flex flex-col items-center gap-2">
              <div
                className={`w-16 h-16 bg-primary ${r.className}`}
              />
              <span className="font-mono text-xs text-muted-foreground">
                {r.label}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Shadows */}
      <SectionCard title="Shadows">
        <div className="flex flex-wrap gap-6">
          {shadows.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <div
                className={`w-24 h-24 bg-card border border-border rounded-lg ${s.className} flex items-center justify-center`}
              >
                <span className="text-xs text-muted-foreground text-center px-1">
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export default DesignSystemPanel;
