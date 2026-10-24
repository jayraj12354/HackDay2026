'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionContextType {
  value?: string | string[]
  onItemToggle: (itemValue: string) => void
}

const AccordionContext = React.createContext<AccordionContextType>({
  onItemToggle: () => {},
})

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple'
  collapsible?: boolean
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

export function Accordion({
  type = 'single',
  collapsible = true,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
  ...props
}: AccordionProps) {
  const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue)
  const isControlled = controlledValue !== undefined
  const activeValue = isControlled ? controlledValue : internalValue

  const onItemToggle = React.useCallback(
    (itemValue: string) => {
      const nextValue = activeValue === itemValue ? (collapsible ? undefined : itemValue) : itemValue
      if (!isControlled) {
        setInternalValue(nextValue)
      }
      if (onValueChange && nextValue !== undefined) {
        onValueChange(nextValue)
      }
    },
    [activeValue, collapsible, isControlled, onValueChange]
  )

  return (
    <AccordionContext.Provider value={{ value: activeValue, onItemToggle }}>
      <div className={cn('divide-y divide-slate-200', className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const ItemContext = React.createContext<{ itemValue: string; isOpen: boolean }>({
  itemValue: '',
  isOpen: false,
})

export function AccordionItem({ value, className, children, ...props }: AccordionItemProps) {
  const { value: activeValue } = React.useContext(AccordionContext)
  const isOpen = activeValue === value

  return (
    <ItemContext.Provider value={{ itemValue: value, isOpen }}>
      <div className={cn('border-b border-slate-200 py-1', className)} data-state={isOpen ? 'open' : 'closed'} {...props}>
        {children}
      </div>
    </ItemContext.Provider>
  )
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onItemToggle } = React.useContext(AccordionContext)
  const { itemValue, isOpen } = React.useContext(ItemContext)

  return (
    <button
      type="button"
      onClick={() => onItemToggle(itemValue)}
      className={cn(
        'flex w-full items-center justify-between py-4 text-left font-medium text-slate-900 transition-all hover:text-amber-700',
        className
      )}
      data-state={isOpen ? 'open' : 'closed'}
      aria-expanded={isOpen}
      {...props}
    >
      <span>{children}</span>
      <ChevronDown
        className={cn(
          'h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200',
          isOpen && 'rotate-180 text-amber-600'
        )}
      />
    </button>
  )
}

export function AccordionContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isOpen } = React.useContext(ItemContext)

  if (!isOpen) return null

  return (
    <div
      className={cn('pb-4 pt-1 text-sm text-slate-600 animate-in fade-in-50 duration-200', className)}
      data-state={isOpen ? 'open' : 'closed'}
      {...props}
    >
      {children}
    </div>
  )
}
