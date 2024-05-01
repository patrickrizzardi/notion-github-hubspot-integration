/* eslint-disable @typescript-eslint/naming-convention */
declare module 'bun' {
  interface LogEnv {
    /**
     * This defaults to `info` if not set.
     */
    LOG_LEVEL?: string;

    /**
     * This defaults to `console` if not set.
     * You can add multiple transports by separating them with a comma.
     * For example: `LOG_TRANSPORTS=console,datadog,file`
     */
    LOG_TRANSPORTS: 'console' | 'datadog' | 'file';

    /**
     * This defaults to `./storage/logs/app.log` if not set.
     */
    LOG_FILE?: string;

    /**
     * This is unused if you don't add `datadog` to `LOG_TRANSPORTS`.
     * If you use `datadog` as a transport, you must set this.
     */
    DATADOG_API_KEY: string;
  }

  interface ServicesEnv {
    /**
     * This is a required environment variable, otherwise the app will not work.
     */
    GITHUB_ACCESS_TOKEN: string;

    /**
     * This is a required environment variable, otherwise the app will not work.
     */
    NOTION_ACCESS_TOKEN: string;

    /**
     * This is a required environment variable, otherwise the app will not work.
     */
    NOTION_DATABASE_ID: string;

    /**
     * This is a required environment variable, otherwise the app will not work.
     */
    HUBSPOT_ACCESS_TOKEN: string;

    /**
     * This is a required environment variable, otherwise the app will not work.
     */
    HUBSPOT_PIPELINE_ID: string;
  }

  interface RedisEnv {
    /**
     * This is a required environment variable, otherwise the app will not work.
     */
    REDIS_HOST: string;

    /**
     * This is a required environment variable, otherwise the app will not work.
     */
    REDIS_PORT: number;

    /**
     * This is a required environment variable, otherwise the app will not work.
     */
    REDIS_PASSWORD: string;

    /**
     * This is a required environment variable, otherwise the app will not work.
     */
    REDIS_USER: string;
  }

  export interface Env extends LogEnv, ServicesEnv, RedisEnv {
    /**
     * This defaults to `development` if not set.ACCESS_
     */
    NODE_ENV?: string;

    /**
     * App name
     */
    APP_NAME: string;
  }
}
