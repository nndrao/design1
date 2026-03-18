import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-2 inline-block', className)}
      classNames={{
        /* v9 keys */
        root: '',
        months: 'flex flex-col sm:flex-row gap-3 relative',
        month: 'flex flex-col gap-3',
        month_caption: 'flex justify-center items-center relative h-7',
        caption_label: 'text-xs font-medium',
        nav: 'flex items-center justify-between absolute inset-x-0 top-0 h-7 px-1 z-10',
        button_previous: cn(
          'inline-flex items-center justify-center h-6 w-6 rounded-md border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer'
        ),
        button_next: cn(
          'inline-flex items-center justify-center h-6 w-6 rounded-md border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer'
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'text-muted-foreground rounded-md w-7 font-normal text-[10px] text-center',
        weeks: '',
        week: 'flex w-full mt-0.5',
        day: 'relative p-0 text-center text-[11px] focus-within:relative focus-within:z-20',
        day_button: cn(
          'inline-flex items-center justify-center h-7 w-7 p-0 font-normal text-[11px] rounded-md',
          'text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer',
          'aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:hover:bg-primary aria-selected:hover:text-primary-foreground',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50'
        ),
        /* v9 flag/state keys */
        selected: '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground',
        today: '[&>button]:bg-muted [&>button]:text-foreground [&>button]:font-semibold',
        outside: '[&>button]:text-muted-foreground [&>button]:opacity-40',
        disabled: '[&>button]:text-muted-foreground [&>button]:opacity-50',
        hidden: 'invisible',
        range_start: 'rounded-l-md',
        range_end: 'rounded-r-md',
        range_middle: '[&>button]:bg-accent [&>button]:text-accent-foreground',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
