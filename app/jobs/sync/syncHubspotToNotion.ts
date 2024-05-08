import { JobName } from 'utils/dispatch-utils.ts';
import hubspotUtils, { TicketStatus } from 'utils/hubspot-utils.ts';
import log from 'utils/log-utils.ts';
import notionUtils from 'utils/notion-utils.ts';

export default {
  name: JobName.SYNC_HUBSPOT_TO_NOTION,
  async process(): Promise<void> {
    try {
      log.info('Syncing Hubspot to Notion...');
      /**
       * Notion will be our source of truth for the tasks/issues between
       * github and hubspot. So we will get the notion pages and than sync
       * those with github and hubspot.
       */
      const notionPages = await notionUtils.pages();

      const ticketsThatNeedAddedToNotion = hubspotUtils.tickets.filter(
        (ticket) => !notionPages.some((page) => page.properties['Hubspot Ticket ID'].number === Number(ticket.id)),
      );

      log.info(`${ticketsThatNeedAddedToNotion.length} tickets need added to notion`);

      for (const ticket of ticketsThatNeedAddedToNotion) {
        await notionUtils.create({
          parent: {
            database_id: Bun.env.NOTION_DATABASE_ID,
            type: 'database_id',
          },
          properties: {
            Name: {
              title: [
                {
                  text: {
                    content: ticket.properties.subject ?? 'Subject not found',
                  },
                },
              ],
            },
            Status: {
              status: {
                name: Object.entries(TicketStatus).find(([, value]) => value === ticket.properties.hs_pipeline_stage)?.[0] ?? 'Status not found',
              },
            },
            Priority: {
              select: {
                name: ticket.properties.development_priority ?? 'Priority not found',
              },
            },
            Type: {
              select: {
                name: ticket.properties.development_type ?? 'Type not found',
              },
            },
          },
        });
      }

      log.info(`${ticketsThatNeedAddedToNotion.length} notion pages created`);

      /**
       * This needs to be done with webhooks otherwise it overwrites what we do in notion
       */
      // for (const ticket of hubspotUtils.tickets) {
      //   const notionPage = notionPages.find((page) => page.properties['Hubspot Ticket ID'].number === Number(ticket.id));
      //   if (!notionPage) {
      //     throw new Error(`Notion page with Hubspot Ticket ID ${ticket.id} not found`);
      //   }

      //   await notionUtils.update({
      //     pageId: notionPage.id,
      //     properties: {
      //       Name: {
      //         title: [
      //           {
      //             text: {
      //               content: ticket.properties.subject ?? 'Subject not found',
      //             },
      //           },
      //         ],
      //       },
      //       Status: {
      //         status: {
      //           name: Object.entries(TicketStatus).find(([, value]) => value === ticket.properties.hs_pipeline_stage)?.[0] ?? 'Status not found',
      //         },
      //       },
      //       Priority: {
      //         select: {
      //           name: ticket.properties.development_priority ?? 'Priority not found',
      //         },
      //       },
      //       Type: {
      //         select: {
      //           name: ticket.properties.development_type ?? 'Type not found',
      //         },
      //       },
      //     },
      //   });
      // }

      // log.info(`${notionPages.length} notion pages updated`);
    } catch (error) {
      log.error('Error syncing Hubspot to Notion', error);
    }
  },
};
