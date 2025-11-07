import dayjs from 'dayjs';

export const addDays = (days: number) => dayjs().add(days, 'day').toISOString();
export const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm');
