export const formatTimeFull = (
  timeStamp: number,
): string => {
  const dtFormat = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'UTC',
  });

  return dtFormat.format(new Date(timeStamp * 1e3));
};

export const formatTimeShort = (
  timeStamp: number,
): string => {
  const dtFormat = new Intl.DateTimeFormat('en-GB', {
    timeStyle: 'medium',
    timeZone: 'UTC',
  });

  return dtFormat.format(new Date(timeStamp * 1e3));
};
