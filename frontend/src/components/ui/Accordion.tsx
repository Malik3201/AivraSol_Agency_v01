import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface AccordionProps {
  type?: 'single' | 'multiple'
  children: ReactNode
  className?: string
  collapsible?: boolean
}

export function Accordion({ type = 'single', children, className, collapsible = true }: AccordionProps) {
  return (
    <AccordionPrimitive.Root
      type={type as any}
      collapsible={collapsible}
      className={cn('w-full', className)}
    >
      {children}
    </AccordionPrimitive.Root>
  )
}

interface AccordionItemProps {
  value: string
  children: ReactNode
  className?: string
}

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      value={value}
      className={cn('border-b border-border', className)}
    >
      {children}
    </AccordionPrimitive.Item>
  )
}

interface AccordionTriggerProps {
  children: ReactNode
  className?: string
}

export function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          'flex flex-1 items-center justify-between py-4 font-medium text-left transition-all hover:text-primary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg px-2',
          '[&[data-state=open]>svg]:rotate-180',
          className
        )}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-220 text-text-muted" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

interface AccordionContentProps {
  children: ReactNode
  className?: string
}

export function AccordionContent({ children, className }: AccordionContentProps) {
  return (
    <AccordionPrimitive.Content
      className={cn(
        'overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
        className
      )}
    >
      <div className="pb-4 pt-0 px-2">{children}</div>
    </AccordionPrimitive.Content>
  )
}

