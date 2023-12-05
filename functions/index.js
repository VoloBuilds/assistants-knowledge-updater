const functions = require('firebase-functions');
const axios = require('axios');
const fs = require('fs');
const { OpenAI } = require("openai");
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


// Check if the page was updated within the last hour
function wasUpdatedRecently(lastEditedTime) {
    const oneHourAgo = new Date(new Date().getTime() - (60 * 60 * 1000));
    return new Date(lastEditedTime) > oneHourAgo;
}

async function deleteExistingFiles(assistantId) {
    const assistantFiles = await openai.beta.assistants.files.list(assistantId);
    console.log(`Deleting assistants files: ${assistantFiles.data}`)
    for (const file of assistantFiles.data) {
        try{
            await openai.beta.assistants.files.del(assistantId, file.id);
        }catch(err){
            console.log(`Error deleting file ${file.id} for assistant ${file.assistant_id}`)
        }
    }
}

async function uploadFileToOpenAI(filePath, assistantId) {
    await deleteExistingFiles(assistantId);

    //Upload file
    const uploadFileResponse = await openai.files.create({
        file: fs.createReadStream(filePath, {encoding: "utf8"}),
        purpose: 'assistants',
    });
    console.log(`Uploaded file - ${uploadFileResponse}`)

    //Link file with assistant
    const linkFileResponse = await openai.beta.assistants.files.create(
        assistantId, 
        { 
            file_id: uploadFileResponse.id
        }
    );
    console.log(`Linked file: ${linkFileResponse}`)
    return;
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
                if (block[blockType] && block[blockType].text) {
                    if (blockType === 'to_do') {
                        textContent += (block.to_do.checked ? "[x] " : "[ ] ");
                    }
                    block[blockType].text.forEach(textObj => {
                        textContent += textObj.plain_text;
                    });
                    textContent += "\n";
                }
                break;
            case 'heading_1':
            case 'heading_2':
            case 'heading_3':
                if (block[block.type] && block[block.type].text) {
                    block[block.type].text.forEach(textObj => {
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


exports.updateKnowledge = functions.https.onRequest(async (req, res) => {
    const pageId = req.query.pageId;
    const assistantId = req.query.assistantId;

    if (!pageId || !assistantId) {
        return res.status(400).send('Missing pageId or assistantId in query parameters');
    }

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
            
            const filePath = '/tmp/notion_data.txt';
            const fileData = extractTextFromNotionPage(notionBlocks.data.results);
            console.log(fileData);
            await fs.promises.writeFile(filePath, `Knowledge base: ${fileData}`, 'utf8');

            await uploadFileToOpenAI(filePath, assistantId);

            res.status(200).send('Notion page updated and processed successfully');
        } else {
            res.status(200).send('Notion page not updated recently');
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('Error processing Notion page');
    }
});
