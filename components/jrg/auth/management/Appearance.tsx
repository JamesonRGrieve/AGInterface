'use client';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAppearance } from '../../theme/useAppearance';

export const Themes = () => {
  const { appearances, currentAppearance, setAppearance } = useAppearance();

  return (
    <div>
      <div>
        <h3 className='text-lg font-medium'>Themes</h3>
        <p className='text-sm text-muted-foreground'>Customize the interface. Switch between icons and labels on buttons.</p>
      </div>
      <Separator className='my-4' />
      <div>
        <RadioGroup
          defaultValue={currentAppearance}
          onValueChange={(value) => setAppearance(value)}
          className='grid grid-cols-2 gap-4'
        >
          {appearances.map((option) => (
            <div key={option} className='flex flex-col items-center gap-2'>
              <RadioGroupItem value={option} id={option} className='sr-only peer' />
              <Label
                htmlFor={option}
                className='rounded-md peer-data-[state=checked]:bg-primary [&:has([data-state=checked])]:bg-primary p-[2px] hover:bg-primary'
              >
                <div className='items-center p-1 border rounded-md w-52 border-muted bg-background'>
                  <div className={cn('p-2 space-y-2 rounded-sm bg-muted', option)}>
                    <div className='p-2 space-y-2 rounded-md shadow-sm bg-background'>
                      <div className='h-2 w-[80px] rounded-lg bg-primary' />
                      <div className='h-2 w-[100px] rounded-lg bg-secondary' />
                    </div>
                    <div className='flex items-center p-2 space-x-2 rounded-md shadow-sm bg-background'>
                      <div className='w-4 h-4 rounded-full bg-primary' />
                      <div className='h-2 w-[100px] rounded-lg bg-secondary' />
                    </div>
                    <div className='flex items-center p-2 space-x-2 rounded-md shadow-sm bg-background'>
                      <div className='w-4 h-4 rounded-full bg-foreground' />
                      <div className='h-2 w-[100px] rounded-lg bg-muted' />
                    </div>
                  </div>
                </div>
              </Label>
              <span className='capitalize text-card-foreground'>{option}</span>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};
