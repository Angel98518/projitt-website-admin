import { format, formatDistanceToNow, addDays, subDays, addMonths, subMonths, addYears, subYears, isSameDay, isSameMonth, isSameYear, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

// Replace moment().format('DD/MM/YYYY')
export const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy');
};

// Replace moment().format('DD MMM YYYY')
export const formatDateWithMonth = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd MMM yyyy');
};

// Replace moment().format('DD MMM, YYYY')
export const formatDateWithComma = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd MMM, yyyy');
};

// Replace moment().format('MMM YYYY')
export const formatMonthYear = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM yyyy');
};

// Replace moment().format('dddd, MMMM D, YYYY')
export const formatFullDate = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'EEEE, MMMM d, yyyy');
};

// Replace moment().format('hh:mm A')
export const formatTime12Hour = (time: string | Date | null | undefined): string => {
    if (!time) return '';
    const timeObj = typeof time === 'string' ? new Date(`2000-01-01T${time}`) : time;
    return format(timeObj, 'hh:mm a');
};

// Replace moment().format('HH:MM A')
export const formatTime24Hour = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'HH:mm a');
};

// Replace moment().fromNow()
export const formatRelativeTime = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
};

// Replace moment().format('hh')
export const getCurrentHour = (): string => {
    return format(new Date(), 'hh');
};

// Replace moment().format('mm')
export const getCurrentMinute = (): string => {
    return format(new Date(), 'mm');
};

// Replace moment().format('A')
export const getCurrentAmPm = (): string => {
    return format(new Date(), 'a').toUpperCase();
};

// Replace moment([year, month])
export const createDateFromYearMonth = (year: number, month: number): Date => {
    return new Date(year, month - 1, 1);
};

// Replace moment(date).format('YYYY-MM-DD')
export const formatDateForAPI = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'yyyy-MM-dd');
};

// Replace moment(date).date()
export const getDayOfMonth = (date: Date): number => {
    return date.getDate();
};

// Replace moment(day).format('MMM') + ' ' + day.date()
export const formatMonthAndDay = (date: Date): string => {
    return format(date, 'MMM d');
};

// Replace moment().clone() - Clone a date object
export const cloneDate = (date: Date): Date => {
    return new Date(date.getTime());
};

// Replace moment().add(1, 'day')
export const addDay = (date: Date, days: number = 1): Date => {
    return addDays(date, days);
};

// Replace moment().subtract(1, 'day')
export const subtractDay = (date: Date, days: number = 1): Date => {
    return subDays(date, days);
};

// Replace moment().add(1, 'month')
export const addMonth = (date: Date, months: number = 1): Date => {
    return addMonths(date, months);
};

// Replace moment().subtract(1, 'month')
export const subtractMonth = (date: Date, months: number = 1): Date => {
    return subMonths(date, months);
};

// Replace moment().add(1, 'year')
export const addYear = (date: Date, years: number = 1): Date => {
    return addYears(date, years);
};

// Replace moment().subtract(1, 'year')
export const subtractYear = (date: Date, years: number = 1): Date => {
    return subYears(date, years);
};

// Replace moment().isSame(otherDate, 'day')
export const isSameDate = (date1: Date, date2: Date): boolean => {
    return isSameDay(date1, date2);
};

// Replace moment().isSame(otherDate, 'month')
export const isSameMonthDate = (date1: Date, date2: Date): boolean => {
    return isSameMonth(date1, date2);
};

// Replace moment().isSame(otherDate, 'year')
export const isSameYearDate = (date1: Date, date2: Date): boolean => {
    return isSameYear(date1, date2);
};

// Replace moment().startOf('day')
export const startOfDayDate = (date: Date): Date => {
    return startOfDay(date);
};

// Replace moment().endOf('day')
export const endOfDayDate = (date: Date): Date => {
    return endOfDay(date);
};

// Replace moment().startOf('month')
export const startOfMonthDate = (date: Date): Date => {
    return startOfMonth(date);
};

// Replace moment().endOf('month')
export const endOfMonthDate = (date: Date): Date => {
    return endOfMonth(date);
};

// Replace moment().startOf('year')
export const startOfYearDate = (date: Date): Date => {
    return startOfYear(date);
};

// Replace moment().endOf('year')
export const endOfYearDate = (date: Date): Date => {
    return endOfYear(date);
};

// Replace moment().utc().local()
export const utcToLocal = (date: Date | string): Date => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
};

// Replace moment().format('YYYY-MM-DD')
export const formatDateYYYYMMDD = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'yyyy-MM-dd');
};

// Replace moment(time, 'HH:mm').format('hh:mm A')
export const formatTimeFrom24Hour = (time: string): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const date = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes));
    return format(date, 'hh:mm a');
};

// Replace moment().format('HH:mm')
export const formatTimeTo24Hour = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'HH:mm');
};

// Replace moment().isSameOrAfter(otherDate, 'day')
export const isSameOrAfterDate = (date1: Date, date2: Date): boolean => {
    return date1 >= date2;
};

// Replace moment().isBefore(otherDate, 'day')
export const isBeforeDate = (date1: Date, date2: Date): boolean => {
    return date1 < date2;
};

// Helper function to create a date from a date string (YYYY-MM-DD format)
export const createDateFromString = (dateString: string): Date => {
    return new Date(dateString);
};

// Helper function to get today's date at start of day
export const getTodayStartOfDay = (): Date => {
    return startOfDay(new Date());
};

// Helper function to get tomorrow's date at start of day
export const getTomorrowStartOfDay = (): Date => {
    return startOfDay(addDays(new Date(), 1));
};
