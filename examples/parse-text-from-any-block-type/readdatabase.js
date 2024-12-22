import { getWeekTasks } from './getFilterTasks.js';
import { printBlockText, printProperties } from './writeReport.js';
import { queryDatabase, retrieveBlockChildren } from './notionReader.js';

// 主函数
async function main() {
    const databaseId = process.env.NOTION_DATABASE_ID;
    const results = await queryDatabase(databaseId);

    // 设置目标年份和周数
    const targets = getWeekTasks(results, 2024, 50);
    console.log(`第50周的工作有：`);
    targets.forEach(async (page, index) => {
        //console.log(`页面内容: ${JSON.stringify(page, null, 2)}`);
        const titleProperty = page.properties['事项名称'];
        const title = titleProperty.title.map(text => text.plain_text).join('');
        if (titleProperty && titleProperty.title) {
            console.log(`任务标题${index + 1}: ${title}`);
        }
        //const taskContent = await retrieveBlockChildren(notion, page.id);
        // 获取并打印每个块的纯文本。
        //printBlockText(taskContent)

        //打印数据库中的其他属性
        printProperties(page.properties);
    });
}

main();
