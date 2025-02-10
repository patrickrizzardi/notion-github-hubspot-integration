import worker from 'root/worker.ts';
import log from 'utils/log-utils.ts';
// import { createGithubIssueFromNotion } from 'root/createGithubIssueFromNotion.ts';
// import { syncData } from 'root/syncData.ts';
// import { github } from 'utils/github-utils.ts';
// import notionUtils from 'utils/notion-utils.ts';

log.info('Hubspot-Github-Notion integration started...');

interface Issue {
  number: number;
  title: string;
  body: string;
  state: 'closed' | 'open';
  labels: Array<{
    name: string;
  }>;
}

worker();

// /**
//  * Notion will be our source of truth for the tasks/issues between
//  * github and hubspot. So we will get the notion pages and than sync
//  * those with github and hubspot.
//  */
// const notionPages = <Array<Page>>(<unknown>(
//   await notionUtils.databases.query({
//     database_id: Bun.env.NOTION_DATABASE_ID,
//   })
// ).results);

// /**
//  * GitHub's REST API considers every pull request an issue, but not every issue is a pull request.
//  * Because of this we want to filter out pull requests from the list of issues.
//  */
// const githubIssues = <Array<Issue>>await github.paginate(github.issues.listForRepo, {
//   owner: 'vpm-solutions',
//   repo: 'api',
//   state: 'all',
//   per_page: 100,
// });

// /**
//  * Go through the list of notion pages and see which ones do not have a corresponding issue in GitHub.
//  */
// const pagesWithoutIssue = notionPages.filter((page) => !githubIssues.find((issue) => issue.number === page.properties['GitHub Issue ID'].number));
// await createGithubIssueFromNotion(pagesWithoutIssue);

// /**
//  * Update the title and body and status of an existing GitHub issue
//  * if it is out of sync with the corresponding Notion page
//  */
// let count = 0;
// for (const issue of githubIssues) {
//   const notionPage = notionPages.find((page) => page.properties['GitHub Issue ID'].number === issue.number);

//   if (!notionPage) {
//     // log.warn(`Notion page for issue #${issue.number} not found`);
//     continue;
//   }

//   if (notionPage.properties.Name.title[0] && !issue.title.endsWith(notionPage.properties.Name.title[0].plain_text)) {
//     await syncData(issue, notionPage);
//     count++;
//   }

//   if (notionPage.properties.Status.status.name === 'Closed' && issue.state === 'open') {
//     await syncData(issue, notionPage);
//     count++;
//   }

//   /**
//    * If the issue labels are out of sync with the Notion page, update them
//    */
//   const labels = [notionPage.properties.Status.status.name];
//   if (notionPage.properties.Status.status.name === 'Icebox') labels.push('Icebox');
//   if (notionPage.properties.Status.status.name === 'In Progress') labels.push('In Progress');
//   if (notionPage.properties.Status.status.name === 'Backlog') labels.push('Backlog');
//   if (notionPage.properties.Status.status.name === 'Testing') labels.push('Testing');
//   if (notionPage.properties.Status.status.name === 'Missing Information') labels.push('Missing Information');
//   if (notionPage.properties.Status.status.name === 'Drafts') labels.push('Drafts');

//   if (
//     issue.labels
//       .map((label) => label.name)
//       .sort()
//       .join() !== labels.sort().join()
//   ) {
//     await syncData(issue, notionPage);
//     count++;
//   }
// }

// log.info(`${count} issues updated`);

export type { Issue };
