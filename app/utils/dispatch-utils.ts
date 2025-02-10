import Bull from 'bull';
import type { BullJobOptions, RedisConfig } from 'root/worker.ts';
import { convertTime } from 'utils/convertTime-utils.ts';

enum JobName {
  SYNC_HUBSPOT_TO_NOTION = 'sync:HubspotToNotion',
  SYNC_NOTION_TO_HUBSPOT = 'sync:NotionToHubspot',
}

const redis: RedisConfig = {
  host: Bun.env.REDIS_HOST,
  port: Bun.env.REDIS_PORT,
  password: Bun.env.REDIS_PASSWORD,
  user: Bun.env.REDIS_USER,
};

const dispatch = async (name: JobName, data: Record<string, unknown>, opts: BullJobOptions): Promise<void> => {
  // Construct the queue into a bull accepted object
  const queue = new Bull(name, {
    redis,
    prefix: name,
    settings: {
      maxStalledCount: 3,
    },
  });

  // Add the job to the queue in redis
  await queue.add(data, {
    priority: opts.priority,
    attempts: opts.attempts ?? 1,
    timeout: opts.timeout ?? convertTime('5m'),
    delay: opts.delay ?? undefined,
    repeat: opts.repeat ?? undefined,
    backoff: opts.backoff ?? undefined,
    removeOnComplete: opts.removeOnComplete ?? {
      age: convertTime('1d'),
      count: 100,
    },
  } as BullJobOptions);

  return queue.close();
};

export { dispatch, JobName };
