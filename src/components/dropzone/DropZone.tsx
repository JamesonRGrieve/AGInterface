import React, { Children, PropsWithChildren } from 'react';
import { LuX } from 'react-icons/lu';
import { DropZoneProvider, useDropZone } from './DropZoneContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DropZoneProps {
  onUpload: (files: File[]) => void;
  [key: string]: any;
}

const DropZone: React.FC<PropsWithChildren<DropZoneProps>> & {
  Active: React.FC<PropsWithChildren>;
} = ({ children, onUpload, className, ...props }) => {
  const activeChildProvided = Children.toArray(children).some(
    (child) => React.isValidElement(child) && child.props['data-type'] === 'active-dropzone',
  );

  return (
    <DropZoneProvider onUpload={onUpload}>
      <div className={cn('relative', className)} {...props}>
        {!activeChildProvided && <DropZone.Active />}
        {children}
      </div>
    </DropZoneProvider>
  );
};

const Active: React.FC<PropsWithChildren> = ({ children, ...props }) => {
  const { isDragActive, setIsDragActive, fileType, fileCount, isOverDropZone } = useDropZone();

  if (!isDragActive) {
    return null;
  }

  const typeAndCount = fileType && fileCount && `${fileCount} ${fileCount === 1 ? 'file' : 'files'} (${fileType})`;

  return (
    <div
      data-type='active-dropzone'
      className='absolute top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center border border-dashed border-primary-500 bg-primary/10'
      {...props}
    >
      {children ?? <h6>{isOverDropZone ? `Drop ${typeAndCount} here` : `Upload ${typeAndCount}`}</h6>}

      {/* Manual close button because drag events are janky and sometimes doesn't close properly */}
      <Button size='icon' variant='ghost' onClick={() => setIsDragActive(false)} className='absolute top-2 right-2'>
        <LuX className='w-6 h-6' />
      </Button>
    </div>
  );
};

DropZone.Active = Active;

export { DropZone };
