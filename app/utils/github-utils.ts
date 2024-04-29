import { Octokit } from '@octokit/rest';

/**
 * For some reason, the `Octokit` auth type is defined as `any`, so we have
 * to disable the `@typescript-eslint/no-unsafe-assignment` rule.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const github = new Octokit({
  auth: Bun.env.GITHUB_TOKEN,
});

export { github };
