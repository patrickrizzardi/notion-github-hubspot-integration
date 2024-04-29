import type { Page } from 'root/index.ts';
import hubspotUtils, { TicketStatus } from 'utils/hubspot-utils.ts';
import log from 'utils/log-utils.ts';
import notionUtils from 'utils/notion-utils.ts';

export default async ({ notionPages }: { notionPages: Array<Page> }): Promise<void> => {
  try {
    const ticketsThatNeedAddedToNotion = hubspotUtils.tickets.filter(
      (ticket) => !notionPages.some((page) => page.properties['Hubspot Ticket ID'].number === Number(ticket.id)),
    );

    for (const ticket of ticketsThatNeedAddedToNotion) {
      await notionUtils.pages.create({
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

    for (const ticket of hubspotUtils.tickets) {
      const notionPage = notionPages.find((page) => page.properties['Hubspot Ticket ID'].number === Number(ticket.id));
      if (!notionPage) {
        throw new Error(`Notion page with Hubspot Ticket ID ${ticket.id} not found`);
      }

      await notionUtils.pages.update({
        page_id: notionPage.id,
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

    log.info(`${notionPages.length} notion pages updated`);
  } catch (error) {
    log.error(error);
  }
};
