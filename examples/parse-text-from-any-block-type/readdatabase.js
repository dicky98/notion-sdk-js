import { Client, iteratePaginatedAPI } from "@notionhq/client"
import { config } from "dotenv"
import fs from 'fs';

config()

const pageId = process.env.NOTION_PAGE_ID
const apiKey = process.env.NOTION_API_KEY
const todolistId = process.env.NOTION_DATABASE_ID

const notion = new Client({ auth: apiKey })

// 获取数据库属性的函数
async function getDatabaseContent(databaseId) {
    try {
        const response = await notion.databases.retrieve({
            database_id: databaseId,
        });
        
        console.log("数据库属性：");
        console.log(response.properties);
    } catch (error) {
        console.error(error);
    }
}

await getDatabaseContent(todolistId);
