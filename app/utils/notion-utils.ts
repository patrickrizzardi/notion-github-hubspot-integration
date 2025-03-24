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
      number: number | null;
    };
    'GitHub Issue ID': {
      number: number;
    };
    Name: {
      title: Array<{ plain_text: string }>;
    };
    Status: {
      status?: {
        name:
          | 'Backlog'
          | 'Closed'
          | 'Drafts'
          | 'In Progress'
          | 'Needs Testing'
          | 'Open'
          | 'Ready For Code Review'
          | 'Testing Complete'
          | 'Things to Discuss';
      };
    };
    Priority: {
      select?: {
        name: 'Critical' | 'Future' | 'High' | 'Low' | 'Normal';
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
    relation: Array<string>;
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
    formula: Array<string>;
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
    formula: Array<string>;
  };
  'Tenure (Months)': {
    id: string;
    type: string;
    formula: Array<string>;
  };
  'Job Title': {
    id: string;
    type: string;
    select: Array<string>;
  };
  Name: {
    id: string;
    type: string;
    title: Array<string>;
  };
}

const notion = new Client({
  auth: Bun.env.NOTION_ACCESS_TOKEN,
});

export default {
  // pages: <Array<Page>>(<unknown>(
  //   await notion.databases.query({
  //     database_id: Bun.env.NOTION_DATABASE_ID,
  //   })
  // ).results),
  /**
   * Notion will be our source of truth for the tasks/issues between
   * github and hubspot. So we will get the notion pages and than sync
   * those with github and hubspot.
   */
  pages: async (): Promise<Array<Page>> => {
    let res = await notion.databases.query({
      /* eslint-disable */
      database_id: Bun.env.NOTION_DATABASE_ID,
      /* eslint-enable */
      // filter: {
      //   property: 'Last Edited Time',
      //   date: {
      //     past_month: {},
      //   },
      // },
    });
    let pages = res.results;

    while (res.has_more && res.next_cursor) {
      res = await notion.databases.query({
        /* eslint-disable */
        database_id: Bun.env.NOTION_DATABASE_ID,
        start_cursor: res.next_cursor,
        /* eslint-enable */
      });
      pages = [...pages, ...res.results];
    }

    return pages as unknown as Array<Page>;
  },
  user: async (pageId: string): Promise<Person> => {
    /* eslint-disable */
    const user = (await notion.pages.retrieve({ page_id: pageId })) as PageObjectResponse;
    /* eslint-enable */
    const { properties } = user;
    return properties as unknown as Person;
  },
  update: async ({ pageId, properties }: { pageId: string; properties: Record<string, any> }): Promise<void> => {
    await notion.pages.update({
      /* eslint-disable */

      page_id: pageId,
      properties,
      /* eslint-enable */
    });
  },
  create: async ({
    parent,
    properties,
  }: {
    /* eslint-disable */
    parent: { database_id: string; type?: 'database_id' } | { page_id: string; type?: 'page_id' };
    /* eslint-enable */
    properties: Record<string, any>;
  }): Promise<void> => {
    await notion.pages.create({
      parent,
      properties,
    });
  },
};

export type { Page, Person };
