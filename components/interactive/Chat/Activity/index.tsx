'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { LuRefreshCw as AutorenewOutlined } from 'react-icons/lu';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import MarkdownBlock from '../Message/MarkdownBlock';
import formatDate from '../Message/formatDate';
import { severities } from './Severtities.tsx';

export function getTimeDifference(timestamp1, timestamp2) {
  // Convert timestamps to Date objects
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  // Calculate the difference in milliseconds
  const diffInMs = Math.abs(date1 - date2);

  // Convert milliseconds to seconds
  const diffInSeconds = Math.floor(diffInMs / 1000);
  if (diffInSeconds === 0) return '<1s';

  // Calculate minutes and seconds
  const minutes = Math.floor(diffInSeconds / 60);
  const seconds = diffInSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes}m`;

  return `${minutes}m ${seconds}s`;
}

export type ActivityProps = {
  activityType: 'error' | 'info' | 'success' | 'warn' | 'thought' | 'reflection' | 'execution' | 'diagram';
  message: string;
  alternateBackground?: string;
  timestamp: string;
  nextTimestamp: string;
  children?: any[];
};

// Extend dayjs with plugins
dayjs.extend(timezone);
dayjs.extend(utc);

export function Activity({
  message,
  activityType,
  alternateBackground = 'primary',
  timestamp,
  nextTimestamp,
  children,
}: ActivityProps): ReactNode {
  // const [dots, setDots] = useState<string>('');
  const title = useMemo(() => message.split('\n')[0].replace(/:$/, ''), [message]).trim();
  const body = useMemo(() => message.split('\n').slice(1).join('\n'), [message]).trim();
  const [currentTime, setCurrentTime] = useState(dayjs().format('YYYY-MM-DDTHH:mm:ssZ'));
  const rootStyles = 'p-2.5 overflow-hidden flex gap-2';

  useEffect(() => {
    if (!nextTimestamp && activityType !== 'info') {
      const interval = setInterval(() => {
        // setDots((dots) => (dots.length < 2 ? dots + '.' : ''));
        setCurrentTime(dayjs().format('YYYY-MM-DDTHH:mm:ssZ'));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [nextTimestamp, activityType]);

  const rootChildren = (
    <Tooltip>
      <TooltipTrigger asChild>
        {body ? (
          <Accordion type='single'>
            <AccordionItem value='an-item'>
              <AccordionTrigger
                className={`${rootStyles} aginteractive-activity aginteractive-activity-${activityType.toLocaleLowerCase()} text-foreground flex items-center cursor-pointer justify-start gap-2`}
              >
                <div className='flex items-center justify-between gap-2 m-w-40'>
                  {activityType !== 'info' && !nextTimestamp ? (
                    <AutorenewOutlined className='animate-spin text-primary' />
                  ) : (
                    severities[activityType].icon
                  )}
                  {activityType !== 'info' && (
                    <div className='whitespace-nowrap'>{getTimeDifference(timestamp, nextTimestamp || currentTime)}</div>
                  )}
                  <div className={`mx-1 w-1 h-4 border-l-2`} />
                </div>

                <MarkdownBlock content={title /*+ (!nextTimestamp ? dots : '')*/} />
              </AccordionTrigger>
              <AccordionContent>
                <MarkdownBlock content={body} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <div
            className={`${rootStyles} aginteractive-activity text-foreground flex items-center justify-start cursor-pointer gap-2`}
          >
            <div className='flex items-center justify-between gap-2 m-w-40'>
              {activityType !== 'info' && !nextTimestamp ? (
                <AutorenewOutlined className='animate-spin text-primary' />
              ) : (
                severities[activityType].icon
              )}
              {activityType !== 'info' && (
                <div className='whitespace-nowrap'>{getTimeDifference(timestamp, nextTimestamp || currentTime)}</div>
              )}
              <div className={`mx-1 w-1 h-4 border-l-2`} />
            </div>

            <MarkdownBlock content={title /* + (!nextTimestamp ? dots : '')*/} />
          </div>
        )}
      </TooltipTrigger>
      <TooltipContent side='bottom' align='start' className='ml-3 mb-7'>
        {formatDate(timestamp, false)}
      </TooltipContent>
    </Tooltip>
  );

  if (!children || children.length <= 0) return rootChildren;

  return (
    <Accordion
      type='single'
      className={`w-full border-t border-border ${alternateBackground === 'primary' ? 'bg-primary/10' : ''}`}
    >
      <AccordionItem value='item-1' className='border-b-0'>
        <AccordionTrigger
          className={cn(
            rootStyles,
            'w-full flex justify-start items-center px-0 py-2.5 border-b border-border hover:no-underline',
          )}
        >
          {rootChildren}
        </AccordionTrigger>
        <AccordionContent className='pl-4 border-b-0'>
          {children?.map((child, index) => {
            const messageType = child.message.split(' ')[0];
            const messageBody = child.message.substring(child.message.indexOf(' '));
            return (
              <Activity
                key={child.timestamp + '-' + messageBody}
                activityType={
                  messageType.startsWith('[SUBACTIVITY]') && !messageType.split('[')[3]
                    ? 'success'
                    : (messageType
                        .split('[')
                        [messageType.startsWith('[SUBACTIVITY]') ? 3 : 2].split(']')[0]
                        .toLowerCase() as
                        | 'error'
                        | 'info'
                        | 'success'
                        | 'warn'
                        | 'thought'
                        | 'reflection'
                        | 'execution'
                        | 'diagram')
                }
                message={messageBody}
                nextTimestamp={index === children.length - 1 ? nextTimestamp : children[index + 1].timestamp}
                timestamp={child.timestamp}
                alternateBackground={alternateBackground}
                children={child.children}
              />
            );
          })}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
