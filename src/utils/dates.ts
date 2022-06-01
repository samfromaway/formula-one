import parseISO from 'date-fns/parseISO';
import format from 'date-fns/format';

const DEFAULT_DATE_FORMAT = 'dd MMM';
const DEFAULT_TIME_FORMAT = 'haaa';

const makeUnconvertedDateFromISOString = (dateString: string) => {
  return parseISO(dateString.slice(0, 19));
};

export function formatDate(
  dateString: string,
  isUserTime: boolean,
  dateFormat: string
) {
  const date = isUserTime
    ? parseISO(dateString)
    : makeUnconvertedDateFromISOString(dateString);

  return format(date, dateFormat);
}

export function formatDateFromISOString(
  dateString: string,
  isUserTime: boolean
) {
  return formatDate(dateString, isUserTime, DEFAULT_DATE_FORMAT);
}

export function formatTimeFromISOString(
  dateString: string,
  isUserTime: boolean
) {
  return formatDate(dateString, isUserTime, DEFAULT_TIME_FORMAT);
}
