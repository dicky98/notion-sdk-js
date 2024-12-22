// 获取指定年份和周数的起始和结束日期
import {iteratePaginatedAPI } from "@notionhq/client"

function getWeekDates(year, weekNumber) {
    // 创建当年1月1日的日期对象
    const firstDayOfYear = new Date(year, 0, 1);
    // 计算第一周的星期一
    const firstMonday = new Date(firstDayOfYear);
    firstMonday.setDate(firstMonday.getDate() + (8 - firstMonday.getDay()) % 7);
    
    // 计算目标周的星期一
    const targetMonday = new Date(firstMonday);
    targetMonday.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);
    
    // 计算目标周的星期日
    const targetSunday = new Date(targetMonday);
    targetSunday.setDate(targetMonday.getDate() + 6);
    
    return {
      start: targetMonday.toISOString().split('T')[0],
      end: targetSunday.toISOString().split('T')[0]
    };
  }

  export function getWeekTasks(results, year, weekNumber) {
    // 设置目标年份和周数
    const targetWeek = getWeekDates(year, weekNumber);
    const tasks = [];
    console.log(`第${weekNumber}周的工作有：`);
    if (Array.isArray(results)) {
      results.forEach(page => {
          const planStartTime = page.properties['计划时间']?.date?.start;
          const planEndTime = page.properties['计划时间']?.date?.end;
          const actualStartTime = page.properties['实际时间']?.date?.start;
          const actualEndTime = page.properties['实陇时间']?.date?.end;
          const planTime = planStartTime && planEndTime ? [planStartTime, planEndTime] : null;
          const actualTime = actualStartTime && actualEndTime ? [actualStartTime, actualEndTime] : null;
  
          const isDateRangeOverlap = (start1, end1, start2, end2) => {
              const s1 = new Date(start1);
              const e1 = new Date(end1);
              const s2 = new Date(start2);
              const e2 = new Date(end2);
              return s1 <= e2 && e1 >= s2;
          };
  
          const isInPlanTimeRange = planTime && isDateRangeOverlap(planTime[0], planTime[1], targetWeek.start, targetWeek.end);
          const isInActualTimeRange = actualTime && isDateRangeOverlap(actualTime[0], actualTime[1], targetWeek.start, targetWeek.end);
          if (isInPlanTimeRange || isInActualTimeRange) {
            tasks.push(page);
          }
      });
    } else {
      console.log('No results');
    }
    return tasks;
  }

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