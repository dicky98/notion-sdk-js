import { Client } from '@notionhq/client';
import { config } from 'dotenv';

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
    console.log(`属性名: ${name}, 类型: ${property.type}, 值: ${JSON.stringify(property[property.type])}`);
  }
}

// 主函数
async function main() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const results = await queryDatabase(databaseId);

  if (Array.isArray(results)) {
    results.forEach(page => {
        const today = new Date().toISOString().split('T')[0];
        const planStartTime = page.properties['计划时间']?.date?.start;
        const planEndTime = page.properties['计划时间']?.date?.end;
        const actualStartTime = page.properties['实际时间']?.date?.start;
        const actualEndTime = page.properties['实际时间']?.date?.end;
        //console.log(`计划开始时间: ${planStartTime}, 计划结束时间: ${planEndTime}`);
        //console.log(`实际开始时间: ${actualStartTime}, 实际结束时间: ${actualEndTime}`);
        const planTime = planStartTime && planEndTime ? [planStartTime, planEndTime] : null;
        const actualTime = actualStartTime && actualEndTime ? [actualStartTime, actualEndTime] : null;

        const isTodayInRange = (start, end) => {
            const todayDate = new Date(today);
            const startDate = new Date(start);
            const endDate = new Date(end);
            return todayDate >= startDate && todayDate <= endDate;
        };
        //console.log(`项ID: ${page.id}` + isTodayInRange(planStartTime, planEndTime));
        const isInPlanTimeRange = planTime && isTodayInRange(planTime[0], planTime[1]);
        const isInActualTimeRange = actualTime && isTodayInRange(actualTime[0], actualTime[1]);

        if (isInPlanTimeRange || isInActualTimeRange) {
            console.log(`项ID: ${page.id}`);
            printProperties(page.properties);
        }

        //if (planTime !== today && actualTime !== today) {
           // return;
       // }
     // console.log(`项ID: ${page.id}`);
     // printProperties(page.properties);
    });
  } else {
    console.error('Expected an array of results, but got:', results);
  }
}

main();
