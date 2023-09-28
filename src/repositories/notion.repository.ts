import { Client } from "@notionhq/client"
import { withHandleNotionApiRateLimit } from "../helpers/withHandleNotionApiRateLimit"

const client = new Client({
  auth: process.env.NOTION_API_KEY
})

export const notion = {
  getPage: withHandleNotionApiRateLimit(client.pages.retrieve),
  createPage: withHandleNotionApiRateLimit(client.pages.create),
  queryDb: withHandleNotionApiRateLimit(client.databases.query),
  updatePage: withHandleNotionApiRateLimit(client.pages.update),
  deleteBlock: withHandleNotionApiRateLimit(client.blocks.delete)
}