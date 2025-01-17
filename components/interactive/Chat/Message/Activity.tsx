'use client';

import {
  LuRefreshCw as AutorenewOutlined,
  LuChevronDown as ExpandMore,
  LuInfo as Info,
  LuPencil as Pencil,
} from 'react-icons/lu';
import { FaRunning } from 'react-icons/fa';
import { Ban as Error, CircleCheck, TriangleAlert } from 'lucide-react';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import formatDate from './formatDate';
import { TfiThought } from 'react-icons/tfi';
import { GiMirrorMirror } from 'react-icons/gi';

import MarkdownBlock from './MarkdownBlock';
function getTimeDifference(timestamp1, timestamp2) {
  // Convert timestamps to Date objects
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  // Calculate the difference in milliseconds
  const diffInMs = Math.abs(date1 - date2);

  // Convert milliseconds to seconds
  const diffInSeconds = Math.floor(diffInMs / 1000);

  // Calculate minutes and seconds
  const minutes = Math.floor(diffInSeconds / 60);
  const seconds = diffInSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes}m`;

  return `${minutes}m ${seconds}s`;
}
const severities = {
  error: {
    icon: (
      <Tooltip>
        <TooltipTrigger>
          <Error className='text-destructive' />
        </TooltipTrigger>
        <TooltipContent>Error</TooltipContent>
      </Tooltip>
    ),
    text: 'text-destructive',
    border: 'border-destructive',
  },

  info: {
    icon: (
      <Tooltip>
        <TooltipTrigger>
          <Info className='text-info' />
        </TooltipTrigger>
        <TooltipContent>Information</TooltipContent>
      </Tooltip>
    ),
    text: 'text-info',
    border: 'border-info',
  },
  success: {
    icon: (
      <Tooltip>
        <TooltipTrigger>
          <CircleCheck className='text-success' />
        </TooltipTrigger>
        <TooltipContent>Successful Activity</TooltipContent>
      </Tooltip>
    ),
    text: 'text-success',
    border: 'border-success',
  },
  warn: {
    icon: (
      <Tooltip>
        <TooltipTrigger>
          <TriangleAlert className='text-warning' />
        </TooltipTrigger>
        <TooltipContent>Warning</TooltipContent>
      </Tooltip>
    ),
    text: 'text-warning',
    border: 'border-warning',
  },
  thought: {
    icon: (
      <Tooltip>
        <TooltipTrigger>
          <TfiThought />
        </TooltipTrigger>
        <TooltipContent>Planned/Thought About an Activity</TooltipContent>
      </Tooltip>
    ),
    text: 'text-info',
    border: 'border-info',
  },
  reflection: {
    icon: (
      <Tooltip>
        <TooltipTrigger>
          <GiMirrorMirror />
        </TooltipTrigger>
        <TooltipContent>Reflected on an Activity</TooltipContent>
      </Tooltip>
    ),
    text: 'text-info',
    border: 'border-info',
  },
  execution: {
    icon: (
      <Tooltip>
        <TooltipTrigger>
          <FaRunning />
        </TooltipTrigger>
        <TooltipContent>Executed/Ran a Command</TooltipContent>
      </Tooltip>
    ),
    text: 'text-info',
    border: 'border-info',
  },
  diagram: {
    icon: (
      <Tooltip>
        <TooltipTrigger>
          <Pencil />
        </TooltipTrigger>
        <TooltipContent>Drew a Diagram</TooltipContent>
      </Tooltip>
    ),
    text: 'text-info',
    border: 'border-info',
  },
};

export type ActivityProps = {
  activityType: 'error' | 'info' | 'success' | 'warn' | 'thought' | 'reflection' | 'execution' | 'diagram';
  message: string;
  alternateBackground?: string;
  timestamp: string;
  nextTimestamp: string;
  children?: any[];
};
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// Extend dayjs with plugins
dayjs.extend(timezone);
dayjs.extend(utc);

export default function Activity({
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
  useEffect(() => {
    if (!nextTimestamp && activityType !== 'info') {
      const interval = setInterval(() => {
        // setDots((dots) => (dots.length < 2 ? dots + '.' : ''));
        setCurrentTime(dayjs().format('YYYY-MM-DDTHH:mm:ssZ'));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [nextTimestamp, activityType]);
  const rootStyles = 'p-2.5 overflow-hidden flex gap-2';
  const rootChildren = (
    <Tooltip>
      <TooltipTrigger asChild>
        {body ? (
          <Accordion type='single'>
            <AccordionItem value='an-item'>
              <AccordionTrigger
                className={`${rootStyles} text-foreground flex items-center cursor-pointer justify-start gap-2`}
              >
                <div className='w-20 flex items-center justify-between gap-2'>
                  {activityType !== 'info' && !nextTimestamp ? (
                    <AutorenewOutlined className='animate-spin text-primary' />
                  ) : (
                    severities[activityType].icon
                  )}
                  {activityType !== 'info' && <div>{getTimeDifference(timestamp, nextTimestamp || currentTime)}</div>}
                  <div className={`mx-1 w-1 h-4 border-l-2`}></div>
                </div>

                <MarkdownBlock content={title /*+ (!nextTimestamp ? dots : '')*/} />
              </AccordionTrigger>
              <AccordionContent>
                <MarkdownBlock content={body} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <div className={`${rootStyles} text-foreground flex items-center justify-start cursor-pointer gap-2`}>
            <div className='w-20 flex items-center justify-between gap-2'>
              {activityType !== 'info' && !nextTimestamp ? (
                <AutorenewOutlined className='animate-spin text-primary' />
              ) : (
                severities[activityType].icon
              )}
              {activityType !== 'info' && <div>{getTimeDifference(timestamp, nextTimestamp || currentTime)}</div>}
              <div className={`mx-1 w-1 h-4 border-l-2`}></div>
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

  return children?.length > 0 ? (
    <Accordion
      type='single'
      className={`w-full border-t border-border ${alternateBackground === 'primary' ? 'bg-primary/10' : ''}`}
    >
      <AccordionItem value='item-1' className='border-b-0'>
        <AccordionTrigger
          className={`${rootStyles} w-full flex justify-start items-center px-0 py-2.5 border-b border-border hover:no-underline`}
        >
          {rootChildren}
        </AccordionTrigger>
        <AccordionContent className='pl-4 border-b-0'>
          {children?.map((child, index) => {
            const messageType = child.message.split(' ')[0];
            const messageBody = child.message.substring(child.message.indexOf(' '));
            console.log(messageType);
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
  ) : (
    rootChildren
  );
}
