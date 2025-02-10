import { Octokit } from '@octokit/rest';

/**
 * For some reason, the `Octokit` auth type is defined as `any`, so we have
 * to disable the `@typescript-eslint/no-unsafe-assignment` rule.
 */
const github = new Octokit({
  auth: Bun.env.GITHUB_ACCESS_TOKEN,
});

export { github };
