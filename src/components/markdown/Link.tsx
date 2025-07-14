'use client';

import { cn } from '@/lib/utils';
import React, { ReactNode, useRef } from 'react';
// import Plyr from 'plyr-react';
// import 'plyr-react/plyr.css';

const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
  const href = e.currentTarget.getAttribute('href');
  if (href?.startsWith('#')) {
    e.preventDefault();
    const id = href.slice(1);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

const getYoutubeId = (url: string): string | null => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
};

type MarkdownLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

export default function MarkdownLink({ children, href, className, ...props }: MarkdownLinkProps): ReactNode {
  const isExternal = href && !href.startsWith('#');
  const youtubeId = href ? getYoutubeId(href) : null;
  const isVideo = href?.match(/\.(mp4|webm|ogg)$/i);
  const targetRef = useRef<HTMLAnchorElement>(null);
  if (youtubeId) {
    return (
      <div className='w-96'>
        <div className='relative w-full aspect-video'>
          <iframe
            title={youtubeId}
            className='absolute top-0 left-0 w-full h-full'
            src={`https://www.youtube.com/embed/${youtubeId}`}
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // if (isVideo) {
  //   return (
  //     <div className='w-96'>
  //       <div className='relative w-full aspect-video'>
  //         <Plyr
  //           source={{
  //             type: 'video',
  //             sources: [{ src: href, type: 'video/mp4' }],
  //           }}
  //           options={{
  //             controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
  //           }}
  //         />
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <a
      ref={targetRef}
      href={href}
      className={cn('underline hover:no-underline', className)}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      // onClick={isExternal ? undefined : handleAnchorClick}
      {...props}
    >
      {children}
    </a>
  );
}
