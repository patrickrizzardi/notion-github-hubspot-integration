import type { SimplePublicObjectInputForCreate } from '@hubspot/api-client/lib/codegen/crm/companies/index.js';
import type { Page } from 'root/index.ts';
import hubspotUtils, { TicketStatus } from 'utils/hubspot-utils.ts';
import log from 'utils/log-utils.ts';
import notionUtils from 'utils/notion-utils.ts';

export default async ({ notionPages }: { notionPages: Array<Page> }): Promise<void> => {
  try {
    const ticketsThatNeedAddedToHubspot = notionPages.filter((page) => !page.properties['Hubspot Ticket ID'].number);

    const newTickets = await hubspotUtils.createTicket(
      ticketsThatNeedAddedToHubspot.map(
        (ticket) => <SimplePublicObjectInputForCreate>(<unknown>{
            properties: {
              subject: ticket.properties.Name.title[0] ? ticket.properties.Name.title[0].plain_text : 'No title',
              content: ticket.url,
              hs_pipeline: Bun.env.HUBSPOT_PIPELINE_ID,
              hs_pipeline_stage: TicketStatus[<keyof typeof TicketStatus>ticket.properties.Status.status.name],
              development_priority: ticket.properties.Priority.select ? ticket.properties.Priority.select.name : 'Normal',
              development_type: ticket.properties.Type.select ? ticket.properties.Type.select.name : 'Other',
            },
          }),
      ),
    );

    for (const ticket of newTickets.results) {
      const notionPage = notionPages.find((page) => page.url === ticket.properties.content);
      if (notionPage) {
        await notionUtils.pages.update({
          page_id: notionPage.id,
          properties: {
            'Hubspot Ticket ID': {
              number: Number(ticket.id),
            },
          },
        });
      }
    }

    log.info(`${ticketsThatNeedAddedToHubspot.length} hubspot tickets created`);

    /**
     * For now we will only update the pipeline status because we don't want to overwrite the data in Hubspot
     * we will eventually use websockets or something to keep the data in sync
     */

    // const ticketsThatNeedUpdatedInHubspot = notionPages.filter((page) => page.properties['Hubspot Ticket ID'].number);

    // for (const ticket of ticketsThatNeedUpdatedInHubspot) {
    //   await hubspotUtils.updateTicket(String(ticket.properties['Hubspot Ticket ID'].number), {
    //     subject: ticket.properties.Name.title[0] ? ticket.properties.Name.title[0].plain_text : 'No title',
    //     content: ticket.url,
    //     hs_pipeline: Bun.env.HUBSPOT_PIPELINE_ID,
    //     hs_pipeline_stage: TicketStatus[<keyof typeof TicketStatus>ticket.properties.Status.status.name],
    //     development_priority: ticket.properties.Priority.select ? ticket.properties.Priority.select.name : 'Normal',
    //     development_type: ticket.properties.Type.select ? ticket.properties.Type.select.name : 'Other',
    //   });
    // }

    // log.info(`${notionPages.length} hubspot tickets updated`);
  } catch (error) {
    log.error(error);
  }
};
