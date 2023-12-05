const functions = require('firebase-functions');
const fs = require('fs');
const { OpenAI } = require("openai");
const notionConnector = require('./connectors/notion');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


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
    console.log(`Uploaded file - ${uploadFileResponse.id}`)

    //Link file with assistant
    const linkFileResponse = await openai.beta.assistants.files.create(
        assistantId, 
        { 
            file_id: uploadFileResponse.id
        }
    );
    console.log(`Linked file ${linkFileResponse.id} with assistant ${linkFileResponse.assistant_id}`)
    return;
}

exports.updateKnowledge = functions.https.onRequest(async (req, res) => {
    const pageId = req.query.pageId;
    const assistantId = req.query.assistantId;

    if (!pageId || !assistantId) {
        return res.status(400).send('Missing pageId or assistantId in query parameters');
    }

    try {
        const fileData = await notionConnector.getUpdatedNotionContent(pageId);
        if (fileData) {
            const filePath = '/tmp/notion_data.txt';
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