import { Client, iteratePaginatedAPI } from "@notionhq/client"
import { config } from "dotenv"

config()

const pageId = process.env.NOTION_PAGE_ID
const apiKey = process.env.NOTION_API_KEY

const notion = new Client({ auth: apiKey })

/* 
---------------------------------------------------------------------------
*/

// 从支持富文本的块子元素中获取富文本数组并返回纯文本。
// 注意：所有富文本对象都包含一个 plain_text 字段。
const getPlainTextFromRichText = richText => {
  return richText.map(t => t.plain_text).join("")
  // 注意：如果页面未与集成共享，页面提及将返回“Undefined”作为页面名称。参见：https://developers.notion.com/reference/block#mention
}

// 使用媒体块（文件、视频等）的源 URL 和可选标题
const getMediaSourceText = block => {
  let source, caption

  if (block[block.type].external) {
    source = block[block.type].external.url
  } else if (block[block.type].file) {
    source = block[block.type].file.url
  } else if (block[block.type].url) {
    source = block[block.type].url
  } else {
    source = "[缺少媒体块类型的情况]: " + block.type
  }
  // 如果有标题，返回标题和源
  if (block[block.type].caption.length) {
    caption = getPlainTextFromRichText(block[block.type].caption)
    return caption + ": " + source
  }
  // 如果没有标题，只返回源 URL
  return source
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

async function retrieveBlockChildren(id) {
  console.log("正在检索块（异步）...")
  const blocks = []

  // 使用 iteratePaginatedAPI 辅助函数获取页面上的所有一级块
  for await (const block of iteratePaginatedAPI(notion.blocks.children.list, {
    block_id: id, // 可以将页面 ID 作为块 ID 传递：https://developers.notion.com/docs/working-with-page-content#modeling-content-as-blocks
  })) {
    blocks.push(block)
  }

  return blocks
}

// 获取数据库内容的函数
async function getDatabaseContent(databaseId) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    });
    console.log(response.results);
  } catch (error) {
    console.error(error);
  }
}

const printBlockText = blocks => {
  console.log("显示块:")

  for (let i = 0; i < blocks.length; i++) {
    const text = getTextFromBlock(blocks[i])
    // 打印每个块的纯文本。
    console.log(text)
  }
}

async function main() {
  // 进行 API 调用以从 .env 中提供的页面检索所有块子元素
  const blocks = await retrieveBlockChildren(pageId)
  // 获取并打印每个块的纯文本。
  printBlockText(blocks)

  for (const block of blocks) {
    if (block.type === 'child_database') {
      console.log("数据库块的所有属性: ", JSON.stringify(block, null, 2));
      //const databaseId = process.env.NOTION_DATABASE_ID;
      //console.log("数据库块的 ID: " + block.child_database.database_id);
      //console.log("数据库块的 ID2: " + block.id);
      //const databaseId = block.id;
      //console.log("检测到数据库块。正在检索数据库内容...");
      //console.log("数据库 ID: " + databaseId);
      //await getDatabaseContent(databaseId);
    }
  }
}

main()
