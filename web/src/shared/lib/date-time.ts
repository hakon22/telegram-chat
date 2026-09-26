import { isNil } from 'lodash-es';
import moment from 'moment';

export const nowIso = (): string => moment().toISOString();

export const unixSecondsToIso = (unixSeconds: number): string => {
  return moment.unix(unixSeconds).toISOString();
};

export const fromUnixSecondsOrNow = (unixSeconds?: number): string => {
  if (isNil(unixSeconds)) {
    return nowIso();
  }

  return unixSecondsToIso(unixSeconds);
};
