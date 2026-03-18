import React from "react";

const colorTokens = [
  // Core
  { token: "--background", light: "#E8E8E8", dark: "#000000", description: "Page background" },
  { token: "--foreground", light: "#1A1A1A", dark: "#FFFFFF", description: "Default text color" },
  { token: "--card", light: "#F0F0F0", dark: "#1A1D21", description: "Card surface" },
  { token: "--card-foreground", light: "#1A1A1A", dark: "#FFFFFF", description: "Card text color" },
  { token: "--popover", light: "#F0F0F0", dark: "#1A1D21", description: "Popover surface" },
  { token: "--popover-foreground", light: "#1A1A1A", dark: "#FFFFFF", description: "Popover text color" },
  // Brand
  { token: "--primary", light: "#60A5FA", dark: "#60A5FA", description: "Primary brand color" },
  { token: "--primary-foreground", light: "#FFFFFF", dark: "#000000", description: "Text on primary" },
  // Neutral
  { token: "--secondary", light: "#DCDCDC", dark: "#1E2124", description: "Secondary surfaces" },
  { token: "--secondary-foreground", light: "#1A1A1A", dark: "#FFFFFF", description: "Text on secondary" },
  { token: "--muted", light: "#DCDCDC", dark: "#1E2124", description: "Muted backgrounds" },
  { token: "--muted-foreground", light: "#5F6368", dark: "#9DA0A5", description: "Muted / subtle text" },
  { token: "--accent", light: "#DCDCDC", dark: "#1E2124", description: "Accent highlights" },
  { token: "--accent-foreground", light: "#1A1A1A", dark: "#FFFFFF", description: "Text on accent" },
  // Semantic
  { token: "--destructive", light: "#FF5252", dark: "#FF5252", description: "Error / destructive" },
  { token: "--destructive-foreground", light: "#FFFFFF", dark: "#FFFFFF", description: "Text on destructive" },
  { token: "--buy", light: "#14B8A6", dark: "#14B8A6", description: "Buy / positive action" },
  { token: "--sell", light: "#FF5252", dark: "#FF5252", description: "Sell / negative action" },
  { token: "--warning", light: "#FF9800", dark: "#FF9800", description: "Warning state" },
  { token: "--info", light: "#5B93D5", dark: "#5B93D5", description: "Informational state" },
  // Chrome
  { token: "--border", light: "#CCCCCC", dark: "#2C2F33", description: "Default borders" },
  { token: "--input", light: "#CCCCCC", dark: "#2C2F33", description: "Input borders" },
  { token: "--ring", light: "#60A5FA", dark: "#60A5FA", description: "Focus ring color" },
  { token: "--surface", light: "#F0F0F0", dark: "#1A1D21", description: "Elevated surface" },
  { token: "--elevated", light: "#FFFFFF", dark: "#23272B", description: "Highest elevation" },
  // Charts
  { token: "--chart-1", light: "#60A5FA", dark: "#60A5FA", description: "Chart series 1" },
  { token: "--chart-2", light: "#FF5252", dark: "#FF5252", description: "Chart series 2" },
  { token: "--chart-3", light: "#5B93D5", dark: "#5B93D5", description: "Chart series 3" },
  { token: "--chart-4", light: "#FF9800", dark: "#FF9800", description: "Chart series 4" },
  { token: "--chart-5", light: "#9C27B0", dark: "#9C27B0", description: "Chart series 5" },
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

function ColorGroup({ label, tokens }: { label: string; tokens: typeof colorTokens }) {
  return (
    <>
      <tr>
        <td
          colSpan={5}
          className="pt-4 pb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </td>
      </tr>
      {tokens.map((t) => (
        <tr key={t.token} className="border-t border-border/50">
          <td className="px-3 py-2">
            <div
              className="w-8 h-8 rounded-md border border-border"
              style={{ backgroundColor: `var(${t.token})` }}
            />
          </td>
          <td className="px-3 py-2 font-mono text-xs text-foreground">
            var({t.token})
          </td>
          <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
            {t.light}
          </td>
          <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
            {t.dark}
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
  const coreTokens = colorTokens.filter((t) =>
    ["--background", "--foreground", "--card", "--card-foreground", "--popover", "--popover-foreground"].includes(t.token)
  );
  const brandTokens = colorTokens.filter((t) =>
    ["--primary", "--primary-foreground"].includes(t.token)
  );
  const neutralTokens = colorTokens.filter((t) =>
    ["--secondary", "--secondary-foreground", "--muted", "--muted-foreground", "--accent", "--accent-foreground"].includes(t.token)
  );
  const semanticTokens = colorTokens.filter((t) =>
    ["--destructive", "--destructive-foreground", "--buy", "--sell", "--warning", "--info"].includes(t.token)
  );
  const chromeTokens = colorTokens.filter((t) =>
    ["--border", "--input", "--ring", "--surface", "--elevated"].includes(t.token)
  );
  const chartTokens = colorTokens.filter((t) => t.token.startsWith("--chart-"));

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
                  Light
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Dark
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <ColorGroup label="Core" tokens={coreTokens} />
              <ColorGroup label="Brand" tokens={brandTokens} />
              <ColorGroup label="Neutral" tokens={neutralTokens} />
              <ColorGroup label="Semantic" tokens={semanticTokens} />
              <ColorGroup label="Chrome" tokens={chromeTokens} />
              <ColorGroup label="Charts" tokens={chartTokens} />
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
