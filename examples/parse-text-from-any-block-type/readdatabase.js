import { getWeekTasks } from './getFilterTasks.js';
import { printTasks } from './writeReport.js';
import { queryDatabase } from './notionReader.js';

// 主函数
async function main() {
    const databaseId = process.env.NOTION_DATABASE_ID;
    const results = await queryDatabase(databaseId);

    let week = 50;
    // 设置目标年份和周数
    const targets = getWeekTasks(results, 2024, week);
    let ToptasksArray = [];    //存放pageid和title
    console.log(`第50周的工作有：`);
    // 打印任务主标题
    targets.forEach(async (page) => {
        const titleProperty = page.properties['事项名称'];
        const title = titleProperty.title.map(text => text.plain_text).join('');
        const topTaskProperty = page.properties['上级 项目'];
        const topTask = topTaskProperty.relation[0]?.id; 
        if (titleProperty && titleProperty.title && !topTask) {
            ToptasksArray.push({ id: page.id, notionPage: page, title: title, subTasks: [] });
        }
    });
    //在主任务下加入子任务。
    targets.forEach(async (page) => {
        const titleProperty = page.properties['事项名称'];
        const title = titleProperty.title.map(text => text.plain_text).join('');
        const topTaskProperty = page.properties['上级 项目'];
        const topTask = topTaskProperty.relation[0]?.id;
        if (titleProperty && titleProperty.title && topTask) {
            const parentTaskIndex = ToptasksArray.findIndex(task => task.id === topTask);
            if (parentTaskIndex !== -1) {
                ToptasksArray[parentTaskIndex].subTasks.push({ id: page.id, title: title, notionPage: page });
            }
        }
    });
    printTasks(ToptasksArray);
}

main();
