'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FAQSectionProps {
  faqs: Array<{
    q: string
    a: string
  }>
}

export function FAQSection({ faqs }: FAQSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Frequently asked questions</h3>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`}>
            <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
