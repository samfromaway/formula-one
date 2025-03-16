import parseISO from 'date-fns/parseISO';
import format from 'date-fns/format';
import isPast from 'date-fns/isPast';

const DEFAULT_DATE_FORMAT = 'dd MMM';
const DEFAULT_TIME_FORMAT = 'haaa';

export function formatDate(dateString: string, dateFormat: string) {
  const date = parseISO(dateString);

  return format(date, dateFormat);
}

export function formatDateFromISOString(dateString: string) {
  return formatDate(dateString, DEFAULT_DATE_FORMAT);
}

export function dateStringHasPassed(dateString: string) {
  return isPast(parseISO(dateString));
}
