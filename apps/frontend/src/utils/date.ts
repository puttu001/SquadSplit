import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  if (isToday(d))     return `Today, ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, 'h:mm a')}`;
  return format(d, 'dd MMM yyyy');
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDateInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
