export const fmtYield = (y: number) => y.toFixed(3) + '%';

export const fmtPrice = (p: number) => p.toFixed(3);

export const fmtBps = (b: number) => (b >= 0 ? '+' : '') + b.toFixed(1) + ' bps';

export const fmtChgBps = (b: number) => (b >= 0 ? '+' : '') + b.toFixed(1);

export const fmtPnL = (n: number) =>
  (n >= 0 ? '+' : '-') + '$' + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });

export const fmtDV01 = (n: number) =>
  '$' + Math.abs(Math.round(n)).toLocaleString();

export const fmtK = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return n.toFixed(0);
};
