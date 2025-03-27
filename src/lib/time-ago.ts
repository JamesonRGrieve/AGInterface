import TimeAgo, { FormatStyleName } from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(en);

const timeAgo = new TimeAgo('en-US');

export const formatTimeAgo = (date: Date | string, style: FormatStyleName = 'twitter'): string => {
  if (!date) return '';
  try {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    return timeAgo.format(parsedDate, style);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};
