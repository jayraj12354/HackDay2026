import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  href?: string
  showText?: boolean
}

export function Logo({ className, href = '/', showText = true }: LogoProps) {
  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect width="36" height="36" rx="10" className="fill-primary" />
        <path
          d="M18 10C13.5817 10 10 13.5817 10 18C10 22.4183 13.5817 26 18 26C22.4183 26 26 22.4183 26 18C26 13.5817 22.4183 10 18 10ZM18 12C21.3137 12 24 14.6863 24 18C24 21.3137 21.3137 24 18 24C14.6863 24 12 21.3137 12 18C12 14.6863 14.6863 12 18 12Z"
          className="fill-primary-foreground"
          fillOpacity="0.9"
        />
        <path
          d="M18 15L20.5 20H15.5L18 15Z"
          className="fill-primary-foreground"
        />
        <circle cx="18" cy="18" r="1.5" className="fill-primary" />
      </svg>
      {showText && (
        <span className="text-lg font-semibold tracking-tight">
          <span className="text-foreground">Cafe</span>
          <span className="text-primary">Stake</span>
        </span>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
