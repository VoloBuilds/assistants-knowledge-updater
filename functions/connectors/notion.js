const axios = require('axios');
require('dotenv').config();

// Check if the page was updated within the last hour
function wasUpdatedRecently(lastEditedTime) {
    const oneHourAgo = new Date(new Date().getTime() - (60 * 60 * 1000));
    return new Date(lastEditedTime) > oneHourAgo;
}

function extractTextFromNotionPage(notionBlocks) {
    let textContent = "";

    // Helper function to process each block
    function processBlock(block) {
        // Depending on the block type, extract the text content
        switch (block.type) {
            case 'paragraph':
            case 'bulleted_list_item':
            case 'numbered_list_item':
            case 'to_do':
                const blockType = block.type;
                if (block[blockType] && block[blockType].rich_text) {
                    if (blockType === 'to_do') {
                        textContent += (block.to_do.checked ? "[x] " : "[ ] ");
                    }
                    block[blockType].rich_text.forEach(textObj => {
                        textContent += textObj.plain_text;
                    });
                    textContent += "\n";
                }
                break;
            case 'heading_1':
            case 'heading_2':
            case 'heading_3':
                if (block[block.type] && block[block.type].rich_text) {
                    block[block.type].rich_text.forEach(textObj => {
                        textContent += textObj.plain_text + "\n";
                    });
                }
                break;
            // Add cases for other block types as needed
        }

        // Process child blocks if they exist
        if (block.has_children && block.children) {
            block.children.forEach(processBlock);
        }
    }

    // Assuming the page JSON structure contains a top-level array of blocks
    notionBlocks.forEach(processBlock);

    return textContent;
}

async function getUpdatedNotionContent(pageId) {
    try {
        const notionPageMeta = await axios.get(`https://api.notion.com/v1/pages/${pageId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.NOTION_SECRET}`,
                'Notion-Version': '2022-06-28'
            }
        });

        const notionPage = notionPageMeta.data;
        if (wasUpdatedRecently(notionPage.last_edited_time)) {
            const notionBlocks = await axios.get(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
                headers: {
                    'Authorization': `Bearer ${process.env.NOTION_SECRET}`,
                    'Notion-Version': '2022-06-28'
                }
            });

            return extractTextFromNotionPage(notionBlocks.data.results);
        } else {
            return null; // Indicates no update
        }
    } catch (error) {
        console.error("Error in getUpdatedNotionContent:", error);
        throw error; // Rethrow to handle in the calling function
    }
}

module.exports = { getUpdatedNotionContent };
