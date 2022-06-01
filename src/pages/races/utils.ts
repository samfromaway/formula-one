import { formatDateFromISOString } from '@/utils/dates';
import { Race } from './lib/getRaces';

export const makeDateRange = (events: Race['events'], isUserTime: boolean) => {
  const orderedDates = events.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const firstDate = orderedDates[0].date;
  const lastDate = orderedDates[orderedDates.length - 1].date;
  const dateRange = `${formatDateFromISOString(
    firstDate,
    isUserTime
  )} - ${formatDateFromISOString(lastDate, isUserTime)}`;
  return dateRange;
};
