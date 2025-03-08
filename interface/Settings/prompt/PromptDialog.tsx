'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/useToast';
import { useState } from 'react';
import { usePrompts } from '../../../../interface/hooks/usePrompt';

interface PromptDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  importMode?: boolean;
}

export default function PromptDialog({ open, setOpen, importMode = false }: PromptDialogProps) {
  const prompts = usePrompts();
  const [newPromptName, setNewPromptName] = useState('');
  const [promptBody, setPromptBody] = useState('');

  const handleNewPrompt = async () => {
    await prompts.create(newPromptName, promptBody);
    setOpen(false);
  };

  const handleImportPrompt = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 1) {
      toast({
        title: 'Error',
        description: 'You can only import one file at a time',
        duration: 5000,
      });
    } else {
      prompts.import(newPromptName, files[0]);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{importMode ? 'Import Prompt' : 'Create New Prompt'}</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='prompt-name' className='text-right'>
              Prompt Name
            </Label>
            <Input
              id='prompt-name'
              value={newPromptName}
              onChange={(e) => setNewPromptName(e.target.value)}
              className='col-span-3'
            />
          </div>
          {importMode ? (
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='import-prompts' className='text-right'>
                Import Prompt
              </Label>
              <Input id='import-prompts' type='file' onChange={handleImportPrompt} className='col-span-3' />
            </div>
          ) : (
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='prompt-content' className='text-right'>
                Prompt Body
              </Label>
              <Textarea
                id='prompt-content'
                value={promptBody}
                onChange={(e) => setPromptBody(e.target.value)}
                className='col-span-3'
                rows={4}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={importMode ? undefined : handleNewPrompt}>
            {importMode ? 'Import Prompt' : 'Create Prompt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
