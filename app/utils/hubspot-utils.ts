/* eslint-disable @typescript-eslint/naming-convention */
import { Client } from '@hubspot/api-client';
import type {
  BatchResponseSimplePublicObject,
  BatchResponseSimplePublicObjectWithErrors,
  SimplePublicObjectInputForCreate,
} from '@hubspot/api-client/lib/codegen/crm/companies/index.js';

export enum TicketStatus {
  Drafts = '177434688',
  Backlog = '177434689',
  'In Progress' = '177434690',
  Testing = '177434697',
  'Missing Information' = '177434698',
  Closed = '177434691',
  Icebox = '177434699',
}

const hubspot = new Client({ accessToken: Bun.env.HUBSPOT_TOKEN });

export default {
  tickets: (
    await hubspot.crm.tickets.getAll(undefined, undefined, [
      'development_priority',
      'development_type',
      'content',
      'createdate',
      'hs_lastmodifieddate',
      'hs_object_id',
      'hs_pipeline',
      'hs_pipeline_stage',
      'hs_ticket_category',
      'hs_ticket_priority',
      'subject',
    ])
  ).filter((ticket) => ticket.properties.hs_pipeline === Bun.env.HUBSPOT_PIPELINE_ID),
  ticket: async (ticketId: string): Promise<Record<string, string | null>> => {
    const ticket = await hubspot.crm.tickets.basicApi.getById(ticketId, [
      'development_priority',
      'development_type',
      'content',
      'createdate',
      'hs_lastmodifieddate',
      'hs_object_id',
      'hs_pipeline',
      'hs_pipeline_stage',
      'hs_ticket_category',
      'hs_ticket_priority',
      'subject',
    ]);
    if (ticket.properties.hs_pipeline !== Bun.env.HUBSPOT_PIPELINE_ID) {
      throw new Error(`Ticket ${ticketId} is not in the correct pipeline`);
    }

    return ticket.properties;
  },
  createTicket: async (
    tickets: Array<SimplePublicObjectInputForCreate>,
  ): Promise<BatchResponseSimplePublicObject | BatchResponseSimplePublicObjectWithErrors> => hubspot.crm.tickets.batchApi.create({ inputs: tickets }),
  updateTicket: async (ticketId: string, ticket: Record<string, string>): Promise<void> => {
    await hubspot.crm.tickets.batchApi.update({ inputs: [{ id: ticketId, properties: ticket }] });
  },
};
