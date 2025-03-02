import Image from 'next/image';
import { ReactNode } from 'react';

export interface ImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export default function MarkdownImage({ src, alt, className, ...props }: ImageProps): ReactNode {
  if (!src) return null;

  const isAGInfrastructureServer = src.startsWith(process.env.NEXT_PUBLIC_API_URI as string);

  return (
    <div className={`relative w-full h-80 ${className || ''}`} {...props}>
      {isAGInfrastructureServer ? (
        <Image src={src} alt={alt || ''} fill className='object-contain object-left-center' />
      ) : (
        <img src={src} alt={alt || ''} className='w-full h-full object-contain object-left-center' />
      )}
    </div>
  );
}
