/**
 * Centralized PrimeReact Tailwind Passthrough Preset
 *
 * This file defines all styling for PrimeReact components in unstyled mode.
 * Components inherit their visual treatment from our design system CSS variables.
 * Only Tailwind utility classes are used — no inline styles, no theme CSS imports.
 *
 * Design tokens referenced via CSS variables:
 *   --background, --foreground, --card, --border, --muted, --muted-foreground,
 *   --primary, --primary-foreground, --ring, --buy, --sell, --warning, --radius
 */

export const primePassthrough = {
  /* ── Button ──────────────────────────────────────────────── */
  button: {
    root: ({ props }: any) => {
      const base = 'inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] cursor-pointer disabled:opacity-50 disabled:pointer-events-none'
      const size = props.size === 'small' ? 'text-[11px] px-2.5 py-1' : props.size === 'large' ? 'text-sm px-5 py-2.5' : 'text-xs px-3.5 py-1.5'
      const rounded = props.rounded ? 'rounded-full' : 'rounded-md'

      // Severity + variant
      const sev = props.severity ?? ''
      const outlined = props.outlined || props.variant === 'outlined'
      const text = props.text || props.variant === 'text'

      let color = ''
      if (text) {
        color = sev === 'danger' ? 'text-[var(--sell)] hover:bg-[var(--sell)]/10'
          : sev === 'success' ? 'text-[var(--buy)] hover:bg-[var(--buy)]/10'
          : sev === 'secondary' ? 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
          : sev === 'warn' || sev === 'warning' ? 'text-[var(--warning)] hover:bg-[var(--warning)]/10'
          : 'text-[var(--primary)] hover:bg-[var(--primary)]/10'
      } else if (outlined) {
        color = sev === 'danger' ? 'border border-[var(--sell)] text-[var(--sell)] hover:bg-[var(--sell)]/10'
          : sev === 'success' ? 'border border-[var(--buy)] text-[var(--buy)] hover:bg-[var(--buy)]/10'
          : sev === 'secondary' ? 'border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
          : 'border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10'
      } else {
        color = sev === 'danger' ? 'bg-[var(--sell)] text-white hover:opacity-90'
          : sev === 'success' ? 'bg-[var(--buy)] text-white hover:opacity-90'
          : sev === 'secondary' ? 'bg-[var(--muted)] text-[var(--foreground)] hover:opacity-80'
          : sev === 'warn' || sev === 'warning' ? 'bg-[var(--warning)] text-white hover:opacity-90'
          : sev === 'contrast' ? 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90'
          : 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90'
      }

      return { className: `${base} ${size} ${rounded} ${color}` }
    },
    icon: { className: 'text-[0.875em]' },
    label: { className: '' },
  },

  /* ── Dialog ──────────────────────────────────────────────── */
  dialog: {
    root: { className: 'bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-2xl max-h-[90vh] flex flex-col overflow-hidden' },
    header: { className: 'flex items-center justify-between px-4 py-3 border-b border-[var(--border)] text-sm font-semibold text-[var(--foreground)]' },
    headerTitle: { className: 'text-sm font-semibold' },
    headerActions: { className: 'flex items-center' },
    closeButton: { className: 'w-6 h-6 flex items-center justify-center rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer' },
    closeButtonIcon: { className: 'text-xs' },
    content: { className: 'px-4 py-3 overflow-y-auto flex-1 text-[var(--foreground)]' },
    footer: { className: 'px-4 py-3 border-t border-[var(--border)] flex justify-end gap-2' },
    mask: { className: 'fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]' },
  },

  /* ── InputText ───────────────────────────────────────────── */
  inputtext: {
    root: ({ props }: any) => ({
      className: `w-full bg-[var(--muted)] border border-[var(--border)] rounded-md px-3 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--ring)] focus:ring-1 focus:ring-[var(--ring)] font-[inherit] ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    }),
  },

  /* ── InputNumber ─────────────────────────────────────────── */
  inputnumber: {
    root: { className: 'inline-flex w-full' },
    input: {
      root: { className: 'w-full bg-[var(--muted)] border border-[var(--border)] rounded-md px-3 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--ring)] focus:ring-1 focus:ring-[var(--ring)] font-mono' },
    },
  },

  /* ── InputTextarea ───────────────────────────────────────── */
  inputtextarea: {
    root: { className: 'w-full bg-[var(--muted)] border border-[var(--border)] rounded-md px-3 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--ring)] focus:ring-1 focus:ring-[var(--ring)] resize-none' },
  },

  /* ── Dropdown ────────────────────────────────────────────── */
  dropdown: {
    root: ({ props }: any) => ({
      className: `inline-flex items-center w-full bg-[var(--muted)] border border-[var(--border)] rounded-md cursor-pointer ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    }),
    input: { className: 'flex-1 px-3 py-1.5 text-xs text-[var(--foreground)] bg-transparent outline-none truncate' },
    trigger: { className: 'flex items-center justify-center w-8 text-[var(--muted-foreground)]' },
    panel: { className: 'bg-[var(--card)] border border-[var(--border)] rounded-md shadow-lg mt-1 overflow-hidden z-[1001]' },
    wrapper: { className: 'max-h-48 overflow-auto' },
    list: { className: 'py-1' },
    item: ({ context }: any) => ({
      className: `px-3 py-1.5 text-xs cursor-pointer transition-colors ${context?.selected ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--foreground)] hover:bg-[var(--muted)]'}`,
    }),
    emptyMessage: { className: 'px-3 py-2 text-xs text-[var(--muted-foreground)]' },
  },

  /* ── SelectButton ────────────────────────────────────────── */
  selectbutton: {
    root: { className: 'inline-flex rounded-md overflow-hidden border border-[var(--border)]' },
    button: ({ context }: any) => ({
      className: `px-3 py-1.5 text-[11px] font-medium cursor-pointer transition-colors ${context?.active ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]'}`,
    }),
  },

  /* ── Checkbox ────────────────────────────────────────────── */
  checkbox: {
    root: { className: 'inline-flex items-center cursor-pointer' },
    input: { className: 'peer sr-only' },
    box: ({ props }: any) => ({
      className: `w-4 h-4 rounded border flex items-center justify-center transition-colors ${props.checked ? 'bg-[var(--primary)] border-[var(--primary)]' : 'bg-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)]'}`,
    }),
    icon: { className: 'text-white text-[10px]' },
  },

  /* ── InputSwitch ─────────────────────────────────────────── */
  inputswitch: {
    root: ({ props }: any) => ({
      className: `relative inline-block w-8 h-[18px] rounded-full cursor-pointer transition-colors ${props.checked ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`,
    }),
    slider: ({ props }: any) => ({
      className: `absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${props.checked ? 'translate-x-[14px]' : 'translate-x-0.5'}`,
    }),
  },

  /* ── Tag ──────────────────────────────────────────────────── */
  tag: {
    root: ({ props }: any) => {
      const sev = props.severity ?? ''
      const color = sev === 'danger' ? 'bg-[var(--sell)]/15 text-[var(--sell)]'
        : sev === 'success' ? 'bg-[var(--buy)]/15 text-[var(--buy)]'
        : sev === 'warning' || sev === 'warn' ? 'bg-[var(--warning)]/15 text-[var(--warning)]'
        : sev === 'info' ? 'bg-[var(--info)]/15 text-[var(--info)]'
        : sev === 'secondary' ? 'bg-[var(--muted)] text-[var(--muted-foreground)]'
        : 'bg-[var(--primary)]/15 text-[var(--primary)]'
      return { className: `inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${color}` }
    },
    icon: { className: 'text-[10px]' },
    value: { className: '' },
  },

  /* ── Badge ───────────────────────────────────────────────── */
  badge: {
    root: ({ props }: any) => {
      const sev = props.severity ?? ''
      const color = sev === 'danger' ? 'bg-[var(--sell)] text-white'
        : sev === 'success' ? 'bg-[var(--buy)] text-white'
        : sev === 'warning' || sev === 'warn' ? 'bg-[var(--warning)] text-white'
        : sev === 'info' ? 'bg-[var(--info)] text-white'
        : sev === 'secondary' ? 'bg-[var(--muted)] text-[var(--muted-foreground)]'
        : 'bg-[var(--primary)] text-[var(--primary-foreground)]'
      return { className: `inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-semibold rounded-full ${color}` }
    },
  },

  /* ── Message ─────────────────────────────────────────────── */
  message: {
    root: ({ props }: any) => {
      const sev = props.severity ?? 'info'
      const color = sev === 'error' ? 'bg-[var(--sell)]/10 border-[var(--sell)]/30 text-[var(--sell)]'
        : sev === 'success' ? 'bg-[var(--buy)]/10 border-[var(--buy)]/30 text-[var(--buy)]'
        : sev === 'warn' ? 'bg-[var(--warning)]/10 border-[var(--warning)]/30 text-[var(--warning)]'
        : 'bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]'
      return { className: `flex items-center gap-2 px-3 py-2 rounded-md border text-xs ${color}` }
    },
    icon: { className: 'text-sm shrink-0' },
    text: { className: 'text-xs' },
  },

  /* ── ProgressBar ─────────────────────────────────────────── */
  progressbar: {
    root: { className: 'w-full bg-[var(--muted)] rounded-full h-1.5 overflow-hidden' },
    value: ({ props }: any) => ({
      className: 'h-full rounded-full bg-[var(--primary)] transition-all duration-300',
      style: { width: `${props.value}%` },
    }),
    label: { className: 'hidden' },
  },

  /* ── Avatar ──────────────────────────────────────────────── */
  avatar: {
    root: ({ props }: any) => {
      const size = props.size === 'large' ? 'w-10 h-10 text-sm' : props.size === 'xlarge' ? 'w-14 h-14 text-lg' : 'w-8 h-8 text-xs'
      const shape = props.shape === 'circle' ? 'rounded-full' : 'rounded-md'
      return { className: `inline-flex items-center justify-center bg-[var(--muted)] text-[var(--foreground)] font-semibold ${size} ${shape}` }
    },
    label: { className: '' },
    icon: { className: '' },
  },

  /* ── Card ─────────────────────────────────────────────────── */
  card: {
    root: { className: 'bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden' },
    header: { className: '' },
    body: { className: 'p-3' },
    title: { className: 'text-sm font-semibold text-[var(--foreground)] mb-1' },
    subtitle: { className: 'text-[10px] text-[var(--muted-foreground)] mb-2' },
    content: { className: 'text-xs text-[var(--foreground)]' },
    footer: { className: 'pt-2 mt-2 border-t border-[var(--border)]' },
  },

  /* ── TabView ─────────────────────────────────────────────── */
  tabview: {
    root: { className: '' },
    nav: { className: 'flex border-b border-[var(--border)] gap-0' },
    tab: {
      header: ({ parent, context }: any) => ({
        className: `flex-shrink-0 ${context?.active ? '' : ''}`,
      }),
      headerAction: ({ parent, context }: any) => ({
        className: `px-3 py-1.5 text-xs font-medium cursor-pointer border-b-2 transition-colors ${context?.active ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`,
      }),
      content: { className: 'py-3 text-xs text-[var(--foreground)]' },
    },
    panelContainer: { className: '' },
  },

  /* ── Tooltip ─────────────────────────────────────────────── */
  tooltip: {
    root: { className: 'z-[1100]' },
    text: { className: 'bg-[var(--foreground)] text-[var(--background)] text-[10px] px-2 py-1 rounded shadow-lg' },
    arrow: { className: 'hidden' },
  },
}
