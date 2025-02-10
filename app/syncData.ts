// import type { Page } from 'utils/notion-utils.ts';
// import type { Issue } from 'root/index.ts';
// import { github } from 'utils/github-utils.ts';
// import log from 'utils/log-utils.ts';
// import notionUtils from 'utils/notion-utils.ts';

// export const syncData = async (githubIssue: Issue, notionPage: Page): Promise<void> => {
//   const notionPageId = `${notionPage.properties.ID.unique_id.prefix}-${notionPage.properties.ID.unique_id.number}`;
//   const notionPageTitle = notionPage.properties.Name.title[0]?.plain_text ?? '';
//   const notionPageUrl = notionPage.url;
//   const notionPageStatus = notionPage.properties.Status.status?.name;
//   const labels = [{ name: notionPage.properties.Status.status?.name }];
//   if (notionPageStatus === 'Drafts') labels.push({ name: 'Drafts' });
//   if (notionPageStatus === 'Backlog') labels.push({ name: 'Backlog' });
//   if (notionPageStatus === 'In Progress') labels.push({ name: 'In Progress' });
//   if (notionPageStatus === 'Needs Testing') labels.push({ name: 'Needs Testing' });
//   if (notionPageStatus === 'Testing Complete') labels.push({ name: 'Testing Complete' });
//   if (notionPageStatus === 'Things to Discuss') labels.push({ name: 'Things to Discuss' });
//   if (notionPageStatus === 'Closed') labels.push({ name: 'Closed' });

// try {
//   const updateGithubIssue = await github.issues.update({
//     owner: 'vpm-solutions',
//     repo: 'api',
//     issue_number: githubIssue.number,
//     title: `[${notionPageId}] ${notionPageTitle}`,
//     body: `This issue was created from Notion page: [${notionPageId}](${notionPageUrl})`,
//     state: notionPageStatus === 'Closed' ? 'closed' : 'open',
//     labels,
//   });

//   await notionUtils.update({
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//     pageId: notionPage.id,
//     properties: {
//       Name: {
//         title: [
//           {
//  ,
//             },
//           },
//         ],
//       },
//       'GitHub Issue ID': {
//         number: updateGithubIssue.data.number,
//       },
//     },
//   });
// } catch (error) {
//   log.error(`Error updating issue #${githubIssue.number} to match Notion page ${notionPageId}`, error);
// }
// };
