// IconButton.tsx
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export default function IconButton({ Icon, label, description, ...props }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className='inline-block'>
          <Button {...props} className={cn('icon-btn', props.className || '')}>
            <Icon className='icon' />
            <span className='label'>{label}</span>
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{description}</TooltipContent>
    </Tooltip>
  );
}
