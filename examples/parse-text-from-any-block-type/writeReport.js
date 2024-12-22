// 作者：Notion
// 从支持富文本的块子元素中获取富文本数组并返回纯文本。
// 注意：所有富文本对象都包含一个 plain_text 字段。
const getPlainTextFromRichText = richText => {
    return richText.map(t => t.plain_text).join("")
    // 注意：如果页面未与集成共享，页面提及将返回“Undefined”作为页面名称。参见：https://developers.notion.com/reference/block#mention
  }

// 从公共 API 支持的任何块类型中获取纯文本。
const getTextFromBlock = block => {
    let text

    // 从支持富文本的块中获取富文本
    if (block[block.type].rich_text) {
      // 如果是空行，这将是一个空字符串。
      text = getPlainTextFromRichText(block[block.type].rich_text)
    }
    // 获取没有富文本的块类型的文本
    else {
      switch (block.type) {
        case "unsupported":
          // 公共 API 尚不支持所有块类型
          text = "[不支持的块类型]"
          break
        case "bookmark":
          text = block.bookmark.url
          break
        case "child_database":
          text = "数据库标题: " + block.child_database.databaseId
          // 获取数据库中的所有属性
          text += "\n数据库属性: " + JSON.stringify(block.child_database.properties, null, 2)
          break
        case "child_page":
          text = block.child_page.title
          break
        case "embed":
        case "video":
        case "file":
        case "image":
        case "pdf":
          text = getMediaSourceText(block)
          break
        case "equation":
          text = block.equation.expression
          break
        case "link_preview":
          text = block.link_preview.url
          break
        case "synced_block":
          // 提供与其同步的块的 ID。
          text = block.synced_block.synced_from
            ? "此块与以下 ID 的块同步: " +
              block.synced_block.synced_from[block.synced_block.synced_from.type]
            : "源同步块，另一个块与之同步。"
          break
        case "table":
          // 仅包含表属性。
          // 获取子块以获取更多详细信息。
          text = "表宽: " + block.table.table_width
          break
        case "table_of_contents":
          // 不包括 ToC 的文本；只有颜色
          text = "ToC 颜色: " + block.table_of_contents.color
          break
        case "breadcrumb":
        case "column_list":
        case "divider":
          text = "无可用文本"
          break
        default:
          text = "[需要添加情况]"
          break
      }
    }
    // 具有 has_children 属性的块将需要获取子块。（此示例中未包含。）
    // 例如，嵌套的项目符号列表
    if (block.has_children) {
      // 目前，我们只会标记有子块。
      text = text + " (有子块)"
    }
    // 包含块类型以便于阅读。根据需要更新格式。
    return block.type + ": " + text
  }

export const printBlockText = blocks => {
    console.log("具体内容:")
    for (let i = 0; i < blocks.length; i++) {
      const text = getTextFromBlock(blocks[i])
      // 打印每个块的纯文本。
      console.log(text)
    }
  }

  // 打印属性值的函数
export function printProperties(properties) {
    for (const [name, property] of Object.entries(properties)) {
        //console.log(`属性名: ${name}, 类型: ${property.type}, 结构: ${JSON.stringify(property, null, 2)}`);
        // console.log(`属性名: ${name}, 类型: ${property.type}, 值: ${JSON.stringify(property[property.type])}`);
        // if (property.type == 'title') {
        //     console.log(`工作项: ${property.title.map(text => text.plain_text).join('')}`);
        // }
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

export function printTasks(tasks) {
    tasks.forEach(task => {
        console.log(`任务主标题: ${task.title} --在项目: ${task.notionPage.properties['项目归属'].multi_select[0].name}下`);
        task.subTasks.forEach(subTask => {
            console.log(`--子任务: ${subTask.title}`);
        });
    });
}