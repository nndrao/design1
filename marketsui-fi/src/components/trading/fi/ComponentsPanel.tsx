import { useState } from 'react'
import { Plus, Pencil, Trash2, Bold, Italic, Underline, AlertCircle, AlertTriangle, CheckCircle2, Info, ChevronDown, ChevronsUpDown, Settings, User, LogOut, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'
import { Calendar } from '@/components/ui/calendar'
import { Toaster } from '@/components/ui/sonner'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from '@/components/ui/table'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { AspectRatio } from '@/components/ui/aspect-ratio'

/* ── Section wrapper ────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase">{title}</h2>
      {children}
    </div>
  )
}

/* ── 1. Buttons ──────────────────────────────────────────────── */
function ButtonsShowcase() {
  return (
    <Section title="Button">
      <div className="space-y-3">
        {(['default', 'secondary', 'destructive', 'outline', 'ghost', 'buy', 'sell'] as const).map((variant) => (
          <div key={variant} className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground capitalize">{variant}</span>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant={variant} size="sm">{variant} sm</Button>
              <Button variant={variant}>{variant}</Button>
              <Button variant={variant} size="lg">{variant} lg</Button>
              <Button variant={variant} size="icon"><Plus className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        ))}
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Icon buttons</span>
          <div className="flex items-center gap-2">
            <Button size="icon"><Plus className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant="outline"><Pencil className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant="destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ── 2. Inputs ───────────────────────────────────────────────── */
function InputsShowcase() {
  return (
    <Section title="Input">
      <div className="grid grid-cols-2 gap-3 max-w-lg">
        <div className="space-y-1">
          <Label className="text-xs">Text</Label>
          <Input placeholder="Enter symbol..." />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Number</Label>
          <Input type="number" placeholder="0.00" step="0.01" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Disabled</Label>
          <Input disabled placeholder="Disabled" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">With value</Label>
          <Input defaultValue="USD/JPY" />
        </div>
      </div>
    </Section>
  )
}

/* ── 3. Select ───────────────────────────────────────────────── */
function SelectShowcase() {
  const [selected, setSelected] = useState('USD/JPY')
  return (
    <Section title="Select">
      <div className="max-w-xs space-y-1">
        <Label className="text-xs">Currency Pair</Label>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD/JPY">USD/JPY</SelectItem>
            <SelectItem value="EUR/USD">EUR/USD</SelectItem>
            <SelectItem value="GBP/USD">GBP/USD</SelectItem>
            <SelectItem value="AUD/USD">AUD/USD</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Selected: {selected}</p>
      </div>
    </Section>
  )
}

/* ── 4. Dialog ───────────────────────────────────────────────── */
function DialogShowcase() {
  const [open, setOpen] = useState(false)
  return (
    <Section title="Dialog">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Trade</DialogTitle>
            <DialogDescription>Are you sure you want to execute this order?</DialogDescription>
          </DialogHeader>
          <p className="text-xs text-foreground">Buy 10,000 USD/JPY at market price. This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <p className="text-xs text-muted-foreground">Dialog is {open ? 'open' : 'closed'}</p>
    </Section>
  )
}

/* ── 5. Badge ────────────────────────────────────────────────── */
function BadgeShowcase() {
  return (
    <Section title="Badge">
      <div className="flex flex-wrap gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="buy">Buy</Badge>
        <Badge variant="sell">Sell</Badge>
        <Badge variant="warning">Warning</Badge>
      </div>
    </Section>
  )
}

/* ── 6. Tabs ─────────────────────────────────────────────────── */
function TabsShowcase() {
  return (
    <Section title="Tabs">
      <Tabs defaultValue="overview" className="max-w-md">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p className="text-xs text-muted-foreground py-2">Portfolio summary and recent activity.</p>
        </TabsContent>
        <TabsContent value="analytics">
          <p className="text-xs text-muted-foreground py-2">Performance metrics and P&amp;L charts.</p>
        </TabsContent>
        <TabsContent value="settings">
          <p className="text-xs text-muted-foreground py-2">Notification and display preferences.</p>
        </TabsContent>
      </Tabs>
    </Section>
  )
}

/* ── 7. Switch ───────────────────────────────────────────────── */
function SwitchShowcase() {
  const [a, setA] = useState(false)
  const [b, setB] = useState(true)
  return (
    <Section title="Switch">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Switch checked={a} onCheckedChange={setA} />
          <span className="text-xs text-foreground">Dark mode: {a ? 'On' : 'Off'}</span>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={b} onCheckedChange={setB} />
          <span className="text-xs text-foreground">Notifications: {b ? 'On' : 'Off'}</span>
        </div>
      </div>
    </Section>
  )
}

/* ── 8. Checkbox ─────────────────────────────────────────────── */
function CheckboxShowcase() {
  const [c1, setC1] = useState(false)
  const [c2, setC2] = useState(true)
  return (
    <Section title="Checkbox">
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Checkbox checked={c1} onCheckedChange={(v) => setC1(v === true)} />
          <span className="text-xs text-foreground">Unchecked by default</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Checkbox checked={c2} onCheckedChange={(v) => setC2(v === true)} />
          <span className="text-xs text-foreground">Checked by default</span>
        </label>
      </div>
    </Section>
  )
}

/* ── 9. Progress ─────────────────────────────────────────────── */
function ProgressShowcase() {
  return (
    <Section title="Progress">
      <div className="space-y-3 max-w-md">
        {[15, 45, 70, 100].map((v) => (
          <div key={v} className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{v}%</span>
            </div>
            <Progress value={v} />
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ── 10. Tooltip ─────────────────────────────────────────────── */
function TooltipShowcase() {
  return (
    <Section title="Tooltip">
      <TooltipProvider>
        <div className="flex gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="sm">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent><p>Top tooltip</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">Bottom</Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>Bottom tooltip</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">Right</Button>
            </TooltipTrigger>
            <TooltipContent side="right"><p>Right tooltip</p></TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </Section>
  )
}

/* ── 11. Avatar ──────────────────────────────────────────────── */
function AvatarShowcase() {
  return (
    <Section title="Avatar">
      <div className="flex gap-3">
        {['JD', 'AS', 'MK', 'RL', 'TC'].map((initials) => (
          <Avatar key={initials}>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        ))}
      </div>
    </Section>
  )
}

/* ── 12. Card ────────────────────────────────────────────────── */
function CardShowcase() {
  return (
    <Section title="Card">
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>Review your trade details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Instrument</span>
              <span className="text-foreground font-medium">US 10Y T-Note</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Quantity</span>
              <span className="text-foreground font-medium">5,000,000</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Price</span>
              <span className="text-foreground font-medium">99.215</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" size="sm">Cancel</Button>
          <Button size="sm">Confirm</Button>
        </CardFooter>
      </Card>
    </Section>
  )
}

/* ── 13. Toggle ──────────────────────────────────────────────── */
function ToggleShowcase() {
  return (
    <Section title="Toggle">
      <div className="flex gap-2">
        <Toggle aria-label="Toggle bold"><Bold className="h-3.5 w-3.5" /></Toggle>
        <Toggle aria-label="Toggle italic"><Italic className="h-3.5 w-3.5" /></Toggle>
        <Toggle aria-label="Toggle underline" variant="outline"><Underline className="h-3.5 w-3.5" /></Toggle>
      </div>
    </Section>
  )
}

/* ── 14. ToggleGroup ─────────────────────────────────────────── */
function ToggleGroupShowcase() {
  return (
    <Section title="ToggleGroup">
      <div className="space-y-3">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Single select</span>
          <ToggleGroup type="single" defaultValue="center">
            <ToggleGroupItem value="left">Left</ToggleGroupItem>
            <ToggleGroupItem value="center">Center</ToggleGroupItem>
            <ToggleGroupItem value="right">Right</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Multiple select</span>
          <ToggleGroup type="multiple" defaultValue={['bold']}>
            <ToggleGroupItem value="bold"><Bold className="h-3.5 w-3.5" /></ToggleGroupItem>
            <ToggleGroupItem value="italic"><Italic className="h-3.5 w-3.5" /></ToggleGroupItem>
            <ToggleGroupItem value="underline"><Underline className="h-3.5 w-3.5" /></ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </Section>
  )
}

/* ── 15. Separator ───────────────────────────────────────────── */
function SeparatorShowcase() {
  return (
    <Section title="Separator">
      <div className="space-y-3">
        <p className="text-xs text-foreground">Content above</p>
        <Separator />
        <p className="text-xs text-foreground">Content below</p>
        <div className="flex items-center gap-3 h-5">
          <span className="text-xs text-foreground">Left</span>
          <Separator orientation="vertical" />
          <span className="text-xs text-foreground">Center</span>
          <Separator orientation="vertical" />
          <span className="text-xs text-foreground">Right</span>
        </div>
      </div>
    </Section>
  )
}

/* ── 16. Label ───────────────────────────────────────────────── */
function LabelShowcase() {
  return (
    <Section title="Label">
      <div className="space-y-2 max-w-xs">
        <div className="space-y-1">
          <Label htmlFor="label-demo-1" className="text-xs">Symbol</Label>
          <Input id="label-demo-1" placeholder="e.g. AAPL" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="label-demo-2" className="text-xs">Quantity</Label>
          <Input id="label-demo-2" type="number" placeholder="0" />
        </div>
      </div>
    </Section>
  )
}

/* ── 17. Alert ───────────────────────────────────────────────── */
function AlertShowcase() {
  return (
    <Section title="Alert">
      <div className="space-y-3 max-w-lg">
        <Alert>
          <Info className="h-3.5 w-3.5" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>Market data is delayed by 15 minutes.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Connection to exchange lost. Retrying...</AlertDescription>
        </Alert>
        <Alert variant="success">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Order filled at 99.215.</AlertDescription>
        </Alert>
        <Alert variant="warning">
          <AlertTriangle className="h-3.5 w-3.5" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Margin utilization above 80%.</AlertDescription>
        </Alert>
      </div>
    </Section>
  )
}

/* ── 18. AlertDialog ─────────────────────────────────────────── */
function AlertDialogShowcase() {
  return (
    <Section title="AlertDialog">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Cancel All Orders</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel all open orders?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel 12 open orders across all instruments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Orders</AlertDialogCancel>
            <AlertDialogAction>Cancel All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  )
}

/* ── 19. Popover ─────────────────────────────────────────────── */
function PopoverShowcase() {
  return (
    <Section title="Popover">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open Popover</Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-2">
            <h4 className="text-xs font-medium">Quick Settings</h4>
            <div className="space-y-1">
              <Label className="text-[11px]">Default Lot Size</Label>
              <Input type="number" defaultValue="1000000" className="h-6 text-[11px]" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Slippage Tolerance</Label>
              <Input type="number" defaultValue="0.5" step="0.1" className="h-6 text-[11px]" />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </Section>
  )
}

/* ── 20. DropdownMenu ────────────────────────────────────────── */
function DropdownMenuShowcase() {
  const [showGrid, setShowGrid] = useState(true)
  const [showPnl, setShowPnl] = useState(false)
  return (
    <Section title="DropdownMenu">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Settings className="h-3.5 w-3.5 mr-1" /> Options
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44">
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuItem><User className="h-3.5 w-3.5 mr-2" /> Profile</DropdownMenuItem>
          <DropdownMenuItem><Mail className="h-3.5 w-3.5 mr-2" /> Messages</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
            Show Grid
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showPnl} onCheckedChange={setShowPnl}>
            Show P&L
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive"><LogOut className="h-3.5 w-3.5 mr-2" /> Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Section>
  )
}

/* ── 21. Slider ──────────────────────────────────────────────── */
function SliderShowcase() {
  const [value, setValue] = useState([50])
  return (
    <Section title="Slider">
      <div className="max-w-xs space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Volume</span>
            <span>{value[0]}%</span>
          </div>
          <Slider value={value} onValueChange={setValue} max={100} step={1} />
        </div>
      </div>
    </Section>
  )
}

/* ── 22. ScrollArea ──────────────────────────────────────────── */
function ScrollAreaShowcase() {
  const instruments = [
    'US 2Y T-Note', 'US 5Y T-Note', 'US 10Y T-Note', 'US 30Y T-Bond',
    'DE 10Y Bund', 'UK 10Y Gilt', 'JP 10Y JGB', 'AU 10Y Bond',
    'CA 10Y Bond', 'FR 10Y OAT', 'IT 10Y BTP', 'ES 10Y Bono',
  ]
  return (
    <Section title="ScrollArea">
      <ScrollArea className="h-32 w-48 rounded-md border border-border">
        <div className="p-2">
          {instruments.map((inst) => (
            <div key={inst} className="text-xs py-1.5 border-b border-border last:border-0 text-foreground">
              {inst}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Section>
  )
}

/* ── 23. Skeleton ────────────────────────────────────────────── */
function SkeletonShowcase() {
  return (
    <Section title="Skeleton">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-[180px]" />
          <Skeleton className="h-3 w-[120px]" />
        </div>
      </div>
    </Section>
  )
}

/* ── 24. RadioGroup ──────────────────────────────────────────── */
function RadioGroupShowcase() {
  const [val, setVal] = useState('market')
  return (
    <Section title="RadioGroup">
      <RadioGroup value={val} onValueChange={setVal}>
        {[
          { value: 'market', label: 'Market Order' },
          { value: 'limit', label: 'Limit Order' },
          { value: 'stop', label: 'Stop Order' },
        ].map((opt) => (
          <div key={opt.value} className="flex items-center space-x-2">
            <RadioGroupItem value={opt.value} id={`radio-${opt.value}`} />
            <Label htmlFor={`radio-${opt.value}`} className="text-xs cursor-pointer">{opt.label}</Label>
          </div>
        ))}
      </RadioGroup>
      <p className="text-xs text-muted-foreground mt-1">Selected: {val}</p>
    </Section>
  )
}

/* ── 25. Textarea ────────────────────────────────────────────── */
function TextareaShowcase() {
  return (
    <Section title="Textarea">
      <div className="max-w-sm space-y-1">
        <Label className="text-xs">Trade Notes</Label>
        <Textarea placeholder="Enter notes for this trade..." />
      </div>
    </Section>
  )
}

/* ── 26. Accordion ───────────────────────────────────────────── */
function AccordionShowcase() {
  return (
    <Section title="Accordion">
      <Accordion type="single" collapsible className="max-w-sm">
        <AccordionItem value="item-1">
          <AccordionTrigger>Market Overview</AccordionTrigger>
          <AccordionContent>
            <p className="text-xs text-muted-foreground">Treasury yields moved higher across the curve with the 10Y up 3bps.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Position Summary</AccordionTrigger>
          <AccordionContent>
            <p className="text-xs text-muted-foreground">Net DV01: $12,500. Long duration bias with curve flattener.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Risk Limits</AccordionTrigger>
          <AccordionContent>
            <p className="text-xs text-muted-foreground">Current utilization: 62%. Daily VaR: $45,000.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Section>
  )
}

/* ── 27. HoverCard ───────────────────────────────────────────── */
function HoverCardShowcase() {
  return (
    <Section title="HoverCard">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link" className="text-xs p-0 h-auto">US 10Y T-Note</Button>
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold">US 10Y Treasury Note</h4>
            <div className="text-[11px] text-muted-foreground space-y-0.5">
              <p>CUSIP: 91282CJL6</p>
              <p>Coupon: 4.000%</p>
              <p>Maturity: 11/15/2033</p>
              <p>Last: 99.215 | Yield: 4.125%</p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
      <p className="text-xs text-muted-foreground mt-1">Hover over the link above</p>
    </Section>
  )
}

/* ── 28. Calendar ────────────────────────────────────────────── */
function CalendarShowcase() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  return (
    <Section title="Calendar">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border border-border w-fit"
      />
      <p className="text-xs text-muted-foreground">
        Selected: {date ? date.toLocaleDateString() : 'None'}
      </p>
    </Section>
  )
}

/* ── 29. Toast / Sonner ──────────────────────────────────────── */
function ToastShowcase() {
  return (
    <Section title="Toast (Sonner)">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => toast('Order submitted', { description: 'Buy 5M US 10Y at 99.215' })}>
          Default Toast
        </Button>
        <Button size="sm" variant="outline" onClick={() => toast.success('Order filled at 99.215')}>
          Success
        </Button>
        <Button size="sm" variant="destructive" onClick={() => toast.error('Order rejected: insufficient margin')}>
          Error
        </Button>
      </div>
      <Toaster />
    </Section>
  )
}

/* ── 30. Table ───────────────────────────────────────────────── */
function TableShowcase() {
  const bonds = [
    { name: 'US 2Y', coupon: '4.625%', yield: '4.312%', price: '99.875', chg: '+2.1' },
    { name: 'US 5Y', coupon: '4.250%', yield: '4.085%', price: '100.125', chg: '-1.3' },
    { name: 'US 10Y', coupon: '4.000%', yield: '4.125%', price: '99.215', chg: '+3.0' },
    { name: 'US 30Y', coupon: '4.375%', yield: '4.285%', price: '98.500', chg: '+4.2' },
  ]
  return (
    <Section title="Table">
      <Table>
        <TableCaption>US Treasury benchmark yields</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Bond</TableHead>
            <TableHead>Coupon</TableHead>
            <TableHead>Yield</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Chg (bps)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bonds.map((b) => (
            <TableRow key={b.name}>
              <TableCell className="font-medium">{b.name}</TableCell>
              <TableCell>{b.coupon}</TableCell>
              <TableCell>{b.yield}</TableCell>
              <TableCell>{b.price}</TableCell>
              <TableCell className={`text-right ${b.chg.startsWith('+') ? 'text-sell' : 'text-buy'}`}>{b.chg}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Section>
  )
}

/* ── 31. Sheet ───────────────────────────────────────────────── */
function SheetShowcase() {
  return (
    <Section title="Sheet">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open Side Panel</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Trade Details</SheetTitle>
            <SheetDescription>View and edit your order parameters.</SheetDescription>
          </SheetHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-1">
              <Label className="text-xs">Instrument</Label>
              <Input defaultValue="US 10Y T-Note" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Quantity</Label>
              <Input type="number" defaultValue="5000000" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Price</Label>
              <Input type="number" defaultValue="99.215" step="0.001" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Section>
  )
}

/* ── 32. AspectRatio ─────────────────────────────────────────── */
function AspectRatioShowcase() {
  return (
    <Section title="AspectRatio">
      <div className="w-64">
        <AspectRatio ratio={16 / 9} className="bg-muted rounded-md flex items-center justify-center">
          <span className="text-xs text-muted-foreground">16:9 Container</span>
        </AspectRatio>
      </div>
    </Section>
  )
}

/* ── Main Panel ──────────────────────────────────────────────── */
export function ComponentsPanel() {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 bg-background">
      <h1 className="text-lg font-bold text-foreground tracking-tight">Component Showcase</h1>
      <p className="text-xs text-muted-foreground -mt-2">All shadcn/ui components available in this project</p>
      <ButtonsShowcase />
      <InputsShowcase />
      <SelectShowcase />
      <DialogShowcase />
      <BadgeShowcase />
      <TabsShowcase />
      <SwitchShowcase />
      <CheckboxShowcase />
      <ProgressShowcase />
      <TooltipShowcase />
      <AvatarShowcase />
      <CardShowcase />
      <ToggleShowcase />
      <ToggleGroupShowcase />
      <SeparatorShowcase />
      <LabelShowcase />
      <AlertShowcase />
      <AlertDialogShowcase />
      <PopoverShowcase />
      <DropdownMenuShowcase />
      <SliderShowcase />
      <ScrollAreaShowcase />
      <SkeletonShowcase />
      <RadioGroupShowcase />
      <TextareaShowcase />
      <AccordionShowcase />
      <HoverCardShowcase />
      <CalendarShowcase />
      <ToastShowcase />
      <TableShowcase />
      <SheetShowcase />
      <AspectRatioShowcase />
    </div>
  )
}

export default ComponentsPanel
