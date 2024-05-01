import os from 'os';
import type { KeepJobsOptions } from 'bull';
import Bull from 'bull';
import { round } from 'mathjs';
import log from 'utils/log-utils.ts';
import { schedule } from 'root/schedule.ts';
import jobs from 'root/jobs/index-jobs.ts';

interface RedisConfig {
  port: number;
  host: string;
  password: string;
  user: string;
}

interface BullOptions {
  redis: RedisConfig;
  prefix: string;
  settings: {
    maxStalledCount: 3;
  };
  jobOptions: BullJobOptions;
}

interface BullJobOptions {
  /**
   * Jobs with a higher priority will be processed before jobs with a lower priority. 1 is the highest
   */
  priority: 1 | 2 | 3;
  /**
   * Attempts to process the job before marking it as failed
   */
  attempts?: 3;
  /**
   * Milliseconds after which the job should fail with a timeout error
   */
  timeout?: number;
  /**
   * Milliseconds after which the job should be promoted to the active queue
   */
  delay?: number;
  /**
   * Used if the job is a repeatable job
   */
  repeat?: Bull.CronRepeatOptions;

  /**
   * Backoff setting for automatic retries if the job fails
   */
  backoff?: Bull.BackoffOptions;

  /**
   * Specify which jobs to keep after finishing processing this job.
   * If both age and count are specified, then the jobs kept will be the ones that satisfies both properties.
   */
  removeOnComplete?: KeepJobsOptions;
}

const redis: RedisConfig = {
  host: Bun.env.REDIS_HOST,
  port: Bun.env.REDIS_PORT,
  password: Bun.env.REDIS_PASSWORD,
  user: Bun.env.REDIS_USER,
};

const eventListeners = {
  process: (job: Bull.Job): void => {
    log.info(`Processing job ${job.id}`);
  },
  completed: (job: Bull.Job): void => {
    log.info(`Job ${job.id} completed on host ${os.hostname()}`);
  },
  stalled: (job: Bull.Job): void => {
    log.warn(`Job ${job.id} stalled`);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  failed: (job: Bull.Job, error: any): void => {
    log.error(`Job ${job.id} failed with error ${error.message}`, error);
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (error: any): void => {
    log.error(`Queue error ${error.message}`, error);
  },
  progress: (job: Bull.Job, progress: number): void => {
    /* eslint-disable-next-line */
    console.log(`Job ${job.id} is ${progress}% complete`);
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queuesObject = (): Array<{ queue: Bull.Queue; name: string; action: any }> => {
  const queues = [];
  for (const job of jobs) {
    const queue = new Bull(job.name, <BullOptions>{
      redis,
      prefix: job.name,
      settings: {
        maxStalledCount: 3,
      },
    });
    queues.push({ queue, name: job.name, action: job.process });
  }

  return queues;
};

export default (): void => {
  const queues = queuesObject();
  for (const { queue, action } of queues) {
    queue.on('process', eventListeners.process);
    queue.on('completed', eventListeners.completed);
    queue.on('stalled', eventListeners.stalled);
    queue.on('failed', eventListeners.failed);
    queue.on('error', eventListeners.error);
    queue.on('progress', (job, progress) => eventListeners.progress(job, round(progress, 2)));
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    queue.process(action);
  }

  /**
   * Start the schedule of jobs to run
   */
  return void schedule();
};

export type { RedisConfig, BullOptions, BullJobOptions };
