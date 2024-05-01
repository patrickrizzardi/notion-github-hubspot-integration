/* eslint-disable @typescript-eslint/naming-convention */
import { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints.js';

interface Page {
  id: string;
  url: string;
  properties: {
    ID: {
      unique_id: {
        prefix: string;
        number: number;
      };
    };
    'Hubspot Ticket ID': {
      number: number;
    };
    'GitHub Issue ID': {
      number: number;
    };
    Name: {
      title: Array<{
        plain_text: string;
      }>;
    };
    Status: {
      status: {
        name: 'Backlog' | 'Closed' | 'Drafts' | 'Icebox' | 'In Progress' | 'Missing Information' | 'Open' | 'Testing';
      };
    };
    Priority: {
      select?: {
        name: 'Critical' | 'High' | 'Low' | 'Normal';
      };
    };
    Type: {
      select?: {
        name: 'Bug' | 'Enhancement' | 'Other';
      };
    };
    Assignee: {
      relation: [] | [{ id: string }];
    };
  };
}

interface Person {
  'Hubspot ID': {
    id: string;
    type: string;
    number: number;
  };
  Tasks: {
    id: string;
    type: string;
    relation: Array<object>;
    has_more: boolean;
  };
  'LinkedIn ': {
    id: string;
    type: string;
    url: string;
  };
  'GitHub ': {
    id: string;
    type: string;
    url: string;
  };
  'Personal Site': {
    id: string;
    type: string;
    url: string;
  };
  'With VPM': {
    id: string;
    type: string;
    formula: Array<object>;
  };
  Joined: {
    id: string;
    type: string;
    date: object;
  };
  Email: {
    id: string;
    type: string;
    email: string;
  };
  Phone: {
    id: string;
    type: string;
    phone_number: string;
  };
  'Tenure (Years)': {
    id: string;
    type: string;
    formula: Array<object>;
  };
  'Tenure (Months)': {
    id: string;
    type: string;
    formula: Array<object>;
  };
  'Job Title': {
    id: string;
    type: string;
    select: Array<object>;
  };
  Name: {
    id: string;
    type: string;
    title: Array<object>;
  };
}

const notion = new Client({
  auth: Bun.env.NOTION_ACCESS_TOKEN,
});

export default {
  /**
   * Notion will be our source of truth for the tasks/issues between
   * github and hubspot. So we will get the notion pages and than sync
   * those with github and hubspot.
   */
  pages: <Array<Page>>(<unknown>(
    await notion.databases.query({
      database_id: Bun.env.NOTION_DATABASE_ID,
    })
  ).results),
  user: async (pageId: string): Promise<Person> => {
    const user = <PageObjectResponse>await notion.pages.retrieve({ page_id: pageId });
    const { properties } = user;
    return <Person>(<unknown>properties);
  },
  update: async ({ pageId, properties }: { pageId: string; properties: Record<string, any> }): Promise<void> => {
    await notion.pages.update({
      page_id: pageId,
      properties,
    });
  },
  create: async ({
    parent,
    properties,
  }: {
    parent: { database_id: string; type?: 'database_id' } | { page_id: string; type?: 'page_id' };
    properties: Record<string, any>;
  }): Promise<void> => {
    await notion.pages.create({
      parent,
      properties,
    });
  },
};

export type { Page, Person };
