'use client'

import { cn } from '@/lib/utils'

interface DeviceFrameProps {
  children?: React.ReactNode
  className?: string
}

export function DeviceFrame({ children, className }: DeviceFrameProps) {
  return (
    <div
      role="img"
      aria-label="App preview"
      className={cn(
        'relative rounded-[3rem] bg-white p-3 shadow-soft ring-1 ring-cocoa-900/10',
        'w-[320px] h-[640px] md:w-[360px] md:h-[720px]',
        className
      )}
    >
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
        <div className="relative mt-3 h-7 w-24 bg-cocoa-900 rounded-full shadow-md">
          {/* Camera & sensors */}
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cocoa-900/80" />
            <div className="w-12 h-2 rounded-full bg-cocoa-900/50" />
          </div>
        </div>
      </div>

      {/* Screen */}
      <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-cocoa-900">
        {children}
      </div>
    </div>
  )
}

