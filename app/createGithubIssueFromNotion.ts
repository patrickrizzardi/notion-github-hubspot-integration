// import type { Page } from 'utils/notion-utils.ts';
// import { github } from 'utils/github-utils.ts';
// import notionUtils from 'utils/notion-utils.ts';
// import log from 'utils/log-utils.ts';

// export const createGithubIssueFromNotion = async (pagesWithoutGithubIssues: Array<Page>): Promise<void> => {
//   /**
//    * Create a new issue in GitHub for each page that does not have a corresponding issue
//    * and update the 'GitHub Issues ID' property in Notion with the new issue's number
//    */
//   for (const notionPage of pagesWithoutGithubIssues) {
//     const notionPageId = `${notionPage.properties.ID.unique_id.prefix}-${notionPage.properties.ID.unique_id.number}`;
//     const notionPageTitle = notionPage.properties.Name.title[0]?.plain_text ?? '';
//     const notionPageUrl = notionPage.url;
//     const notionPageStatus = notionPage.properties.Status.status.name;
//     const labels = [{ name: notionPage.properties.Status.status.name }];
//     if (notionPageStatus === 'Icebox') labels.push({ name: 'Icebox' });
//     if (notionPageStatus === 'In Progress') labels.push({ name: 'In Progress' });
//     if (notionPageStatus === 'Backlog') labels.push({ name: 'Backlog' });
//     if (notionPageStatus === 'Testing') labels.push({ name: 'Testing' });
//     if (notionPageStatus === 'Missing Information') labels.push({ name: 'Missing Information' });

//     const newGithubIssue = await github.issues.create({
//       owner: 'vpm-solutions',
//       repo: 'api',
//       title: `[${notionPageId}] ${notionPageTitle}`,
//       body: `This issue was created from Notion page: [${notionPageId}](${notionPageUrl})`,
//       state: notionPageStatus === 'Closed' ? 'closed' : 'open',
//       labels,
//     });

//     await notionUtils.update({
//       pageId: notionPage.id,
//       properties: {
//         'GitHub Issue ID': {
//           number: newGithubIssue.data.number,
//         },
//       },
//     });
//   }

//   log.info(`${pagesWithoutGithubIssues.length} issues created`);
// };
