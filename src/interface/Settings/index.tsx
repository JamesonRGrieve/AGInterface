'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Extensions } from '@/interface/Settings/extensions';
import Training from '@/interface/Settings/training';

const sections = [
  {
    name: 'Training',
    component: <Training isUser />,
  },
  {
    name: 'Training (Admin)',
    component: <Training isUser={false} />,
  },
  {
    name: 'Extensions',
    component: <Extensions />,
  },
];

export function Settings() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const isDialogOpen = searchParams.get('settings-dialog') === 'true';

  const closeDialog = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('settings-dialog');
    router.replace(`${pathname}?${params.toString()}`);
  };

  if (!isDialogOpen) return <></>;

  return (
    <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
      <DialogContent className='sm:max-w-[800px]'>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={sections[0].name} className='flex gap-4'>
          <TabsList className='flex-col justify-start w-48 h-auto bg-transparent'>
            {sections.map(({ name }) => (
              <TabsTrigger
                key={name}
                value={name}
                className='justify-start w-full data-[state=active]:bg-muted rounded-lg py-2'
              >
                {name}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className='flex-1'>
            {sections.map(({ name, component }) => (
              <TabsContent key={name} value={name} className='mt-0 min-h-96'>
                {component}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
