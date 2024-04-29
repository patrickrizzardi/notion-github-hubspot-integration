import { Client } from '@notionhq/client';

export default new Client({
  auth: Bun.env.NOTION_TOKEN,
});
