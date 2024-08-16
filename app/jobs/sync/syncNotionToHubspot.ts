import type { SimplePublicObjectInputForCreate } from '@hubspot/api-client/lib/codegen/crm/companies/index.js';
import { convertTime } from 'utils/convertTime-utils.ts';
import { JobName, dispatch } from 'utils/dispatch-utils.ts';
import hubspotUtils, { TicketStatus } from 'utils/hubspot-utils.ts';
import log from 'utils/log-utils.ts';
import notionUtils from 'utils/notion-utils.ts';

export default {
  name: JobName.SYNC_NOTION_TO_HUBSPOT,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, max-statements
  async process(): Promise<void> {
    try {
      log.info('Syncing Notion to Hubspot...');

      const notionPages = await notionUtils.pages();

      const ticketsThatNeedAddedToHubspot = notionPages.filter((page) => !page.properties['Hubspot Ticket ID'].number);

      const formattedTickets = ticketsThatNeedAddedToHubspot.map(
        (ticket) => <SimplePublicObjectInputForCreate>(<unknown>{
            properties: {
              subject: ticket.properties.Name.title[0]
                ? `[${`${ticket.properties.ID.unique_id.prefix}-${ticket.properties.ID.unique_id.number}`}] ${ticket.properties.Name.title[0].plain_text}`
                : 'No title',
              content: ticket.url,
              hs_pipeline: Bun.env.HUBSPOT_PIPELINE_ID,
              hs_pipeline_stage: ticket.properties.Status.status
                ? TicketStatus[<keyof typeof TicketStatus>ticket.properties.Status.status.name]
                : TicketStatus.Drafts,
              development_priority: ticket.properties.Priority.select ? ticket.properties.Priority.select.name : 'Normal',
              development_type: ticket.properties.Type.select ? ticket.properties.Type.select.name : 'Other',
            },
          }),
      );

      const newTickets = await hubspotUtils.createTickets(formattedTickets);

      for (const ticket of newTickets.results) {
        const notionPage = notionPages.find((page) => page.url === ticket.properties.content);
        if (notionPage) {
          await notionUtils.update({
            pageId: notionPage.id,
            properties: {
              'Hubspot Ticket ID': {
                number: Number(ticket.id),
              },
            },
          });
        }
      }

      log.info(`${formattedTickets.length} hubspot tickets created`);

      /**
       * For now we will only update the pipeline status because we don't want to overwrite the data in Hubspot
       * we will eventually use websockets or something to keep the data in sync
       */

      const ticketsThatNeedUpdatedInHubspot = notionPages.filter((page) => page.properties['Hubspot Ticket ID'].number);

      const tickets = [];
      const assignees: Array<{ notionUserId: string; hubspotUserId: number }> = [];
      for (const ticket of ticketsThatNeedUpdatedInHubspot) {
        const userPageId = ticket.properties.Assignee.relation[0] ? ticket.properties.Assignee.relation[0].id : null;
        let assignee = 0;

        if (userPageId) {
          const cachedAssignee = assignees.find((a) => a.notionUserId === userPageId);
          if (cachedAssignee) {
            assignee = cachedAssignee.hubspotUserId;
          } else {
            assignee = await notionUtils.user(userPageId).then((user) => user['Hubspot ID'].number);
            assignees.push({ notionUserId: userPageId, hubspotUserId: assignee });
          }
        }

        tickets.push({
          id: String(ticket.properties['Hubspot Ticket ID'].number),
          properties: {
            subject: ticket.properties.Name.title[0] ? ticket.properties.Name.title[0].plain_text : 'No title',
            content: ticket.url,
            hs_pipeline: Bun.env.HUBSPOT_PIPELINE_ID,
            hs_pipeline_stage: ticket.properties.Status.status
              ? TicketStatus[<keyof typeof TicketStatus>ticket.properties.Status.status.name]
              : TicketStatus.Drafts,
            development_priority: ticket.properties.Priority.select ? ticket.properties.Priority.select.name : 'Normal',
            development_type: ticket.properties.Type.select ? ticket.properties.Type.select.name : 'Other',
            hubspot_owner_id: assignee ? String(assignee) : undefined,
          },
        });
      }

      /**
       * Hubspot only allows 100 updates at a time, so we need to split them into chunks
       */
      const chunkSize = 100;
      for (let i = 0; i < tickets.length; i += chunkSize) {
        await hubspotUtils.updateTicket(tickets.slice(i, i + chunkSize));
      }

      log.info(`${notionPages.length} hubspot tickets updated`);
      await dispatch(JobName.SYNC_HUBSPOT_TO_NOTION, {}, { priority: 1, timeout: convertTime('1m') });
    } catch (error) {
      log.error(error);
    }
  },
};
