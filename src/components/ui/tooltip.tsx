'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';

import { cn } from '@/lib/utils';

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <TooltipPrimitive.Provider>{children}</TooltipPrimitive.Provider>;
};

const Tooltip = ({ delayDuration = 600, ...props }: TooltipPrimitive.TooltipProps) => (
  <TooltipPrimitive.Root delayDuration={delayDuration} {...props} />
);

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-lg',
      'animate-in fade-in-0 zoom-in-95 duration-300',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-200',
      'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// For basic use case where more control is not needed.
// For more complex use cases, use the standard tooltip component.
type TooltipBasicProps = React.PropsWithChildren & {
  title: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
};

const TooltipBasic = ({ title, side, children }: TooltipBasicProps) => (
  <Tooltip delayDuration={600}>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent side={side}>{title}</TooltipContent>
  </Tooltip>
);
TooltipBasic.displayName = 'TooltipBasic';

export { Tooltip, TooltipBasic, TooltipContent, TooltipProvider, TooltipTrigger };
