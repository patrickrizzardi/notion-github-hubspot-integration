import { convertTime } from 'utils/convertTime-utils.ts';
import { cronUtil } from 'utils/cron-utils.ts';
import { JobName, dispatch } from 'utils/dispatch-utils.ts';

export { schedule };

/**
 * Keep in mind all cron jobs are in UTC time.
 */

const schedule = async (): Promise<void> => {
  await dispatch(JobName.SYNC_NOTION_TO_HUBSPOT, {}, { priority: 1, repeat: { cron: cronUtil.everyFiveMinutes }, timeout: convertTime('3m') });
};
