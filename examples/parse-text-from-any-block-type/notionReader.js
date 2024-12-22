import { Client, iteratePaginatedAPI } from '@notionhq/client';
import { config } from 'dotenv';
// 加载环境变量
config();

// 初始化 Notion 客户端
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// 查询数据库的函数
export async function queryDatabase(databaseId) {
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
        });
        return response.results;
    } catch (error) {
        console.error('Error querying database:', error);
    }
}

// 获取页面块的纯文本内容
export async function retrieveBlockChildren(notionapi, id) {
    console.log("正在检索块（异步）...")
    const blocks = []
  
    // 使用 iteratePaginatedAPI 辅助函数获取页面上的所有一级块
    for await (const block of iteratePaginatedAPI(notionapi.blocks.children.list, {
      block_id: id, // 可以将页面 ID 作为块 ID 传递：https://developers.notion.com/docs/working-with-page-content#modeling-content-as-blocks
    })) {
      blocks.push(block)
    }
  
    return blocks
  }