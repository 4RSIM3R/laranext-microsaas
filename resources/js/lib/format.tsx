import { format } from 'date-fns';

const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ');

    if (names.length === 0) return '';
    if (names.length === 1) return names[0].charAt(0).toUpperCase();

    const firstInitial = names[0].charAt(0);
    const lastInitial = names[names.length - 1].charAt(0);

    return `${firstInitial}${lastInitial}`.toUpperCase();
};

export const initial_name = (input?: string) => {
    return getInitials(input ?? '');
};

export const date_format = (date?: any, formatStr: string = 'default') => {
    if (formatStr != 'default') {
        return format(date, formatStr);
    }

    if (date == null) {
        return null;
    }

    // const hoursDiff = differenceInHours(new Date(), date);

    return format(date, 'dd/MM/yyyy');

    // if (hoursDiff < 24) {
    //     return formatDistanceToNowStrict(date, { addSuffix: true });
    // } else {
    //     return format(date, 'dd MMM yyyy, HH:mm');
    // }
};

export const normalize_label = (input?: string) => {
    return (
        input
            ?.toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char: any) => char.toUpperCase()) || ''
    );
};

export const currency_format = (input?: number | string, currency?: string): string => {
    const num = typeof input === 'string' ? parseFloat(input) : input;

    if (typeof num !== 'number' || isNaN(num)) return '0';

    return num.toLocaleString('id-ID', {
        style: 'currency',
        currency: currency ?? 'IDR',
        minimumFractionDigits: 0,
    });
};

export const tax_rate_format = (input?: number): string => {
    if (typeof input !== 'number' || isNaN(input)) return '0%';

    return `${(input / 100).toFixed(2)}%`;
};

export function count_percentage(value?: number, divider?: number) {
    if (value === undefined || divider === undefined || divider === 0) {
        return 0;
    }
    return ((value / divider) * 100).toFixed(2);
}
