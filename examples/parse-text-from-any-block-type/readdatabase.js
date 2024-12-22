import { Client } from '@notionhq/client';
import { config } from 'dotenv';
import { getWeekTasks, retrieveBlockChildren } from './getFilterTasks.js';
import { printBlockText } from './writeReport.js';
// 加载环境变量
config();

// 初始化 Notion 客户端
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// 查询数据库的函数
async function queryDatabase(databaseId) {
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
        });
        return response.results;
    } catch (error) {
        console.error('Error querying database:', error);
    }
}


// 打印属性值的函数
function printProperties(properties) {
    for (const [name, property] of Object.entries(properties)) {
        //console.log(`属性名: ${name}, 类型: ${property.type}, 结构: ${JSON.stringify(property, null, 2)}`);
        // console.log(`属性名: ${name}, 类型: ${property.type}, 值: ${JSON.stringify(property[property.type])}`);
        if (property.type == 'title') {
            console.log(`工作项: ${property.title.map(text => text.plain_text).join('')}`);
        }
        if (name == '上级 项目') {
            //const parentId = property.relation[0]?.id;
            if (property.relation[0]?.id) {
                console.log(`--父项 ID: ${property.relation[0]?.id}`);
            }
        } else if (name == '子级 项目') {
            //const childId = property.relation[0]?.id;
            if (property.relation[0]?.id) {
                console.log(`--子项 ID: ${property.relation[0]?.id}`);
            }
        } else if (name == '项目归属') {
            property.multi_select.forEach(select => {
                console.log(`--项目归属 : ${select.name}`);
            });         
        }
        }
    }
    
    // 主函数
    async function main() {
        const databaseId = process.env.NOTION_DATABASE_ID;
        const results = await queryDatabase(databaseId);
    
        // 设置目标年份和周数
        const targets = getWeekTasks(results, 2024, 50);
        console.log(`第50周的工作有：`);
        targets.forEach(async (page, index) => {
            //console.log(`任务 ${index + 1} : ${page.id}`);
            //console.log(`页面内容: ${JSON.stringify(page, null, 2)}`);
            const titleProperty = page.properties['事项名称'];
            if (titleProperty && titleProperty.title) {
                const title = titleProperty.title.map(text => text.plain_text).join('');
                console.log(`任务标题${index + 1}: ${title}`);
            }
            const taskContent = await retrieveBlockChildren(notion, page.id);
            // 获取并打印每个块的纯文本。
            printBlockText(taskContent)
            
            //打印属性值
            //printProperties(page.properties);
        });
    }

main();
