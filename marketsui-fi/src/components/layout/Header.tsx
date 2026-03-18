import { useTheme } from '@/components/theme/ThemeProvider'
import { Sun, Moon, Search, Bell, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

function MarketsUIIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#60A5FA" />
      <polyline
        points="4,22 9,16 13,18.5 19,8 25,12"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="12" r="3" fill="white" />
    </svg>
  )
}

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-5 h-12 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <MarketsUIIcon />
          <div className="flex flex-col">
            <span className="text-sm tracking-tight leading-none">MarketsUI</span>
            <span className="text-[9px] text-primary font-medium tracking-wider uppercase leading-none mt-0.5">
              Fixed Income
            </span>
          </div>
        </div>
        <div className="h-5 w-px bg-border mx-1" />
        <span className="text-[11px] text-muted-foreground">Trading Terminal</span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" className="flex items-center gap-2 rounded-full bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground">
          <Search className="w-3 h-3" />
          <span>Search bonds...</span>
          <kbd className="ml-1 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">⌘K</kbd>
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
          <Settings className="w-4 h-4" />
        </Button>

        <div className="h-5 w-px bg-border mx-0.5" />

        <Button
          onClick={toggleTheme}
          variant="outline"
          size="sm"
          className="rounded-full gap-1.5"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          {theme === 'dark' ? 'Light' : 'Dark'}
        </Button>
      </div>
    </header>
  )
}
