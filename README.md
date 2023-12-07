# OpenAI Knowledge Updater

## Overview
This project automates updating the knowledge base of an OpenAI assistant. Initially using Notion as a data source, it pulls data, writes it to a file, and uploads this file to an OpenAI assistant. The aim is to keep the AI assistant's information current and accurate. Emphasis is placed on expanding support to other data sources, with Notion serving as the starting point.

Full video tutorial using this code:
[![Power OpenAI Assistants API with YOUR data automatically](https://img.youtube.com/vi/JzxUW0ZT4to/0.jpg)](https://youtu.be/JzxUW0ZT4to)

## Key Features
- **Single File Update**: All data will be written to one file and only one data file will be associated with OpenAI. This is because OpenAI does not offer a way to tell files apart from each other, making it impossible to determine which files contain what data without managing it in a separate database.
- **Focused on Extensibility**: Designed for easy integration with various data sources.
- **Automated File Management**: Efficiently handles the deletion of old data files and uploading new ones for the OpenAI assistant.

## Getting Started

### Prerequisites
- Access to Notion and OpenAI accounts with necessary API keys.
- A Firebase project for deploying the function.

### Installation and Deployment
1. Clone the repository:
   ```bash
   git clone [repository URL]
   ```
2. Navigate to the project directory and install dependencies:
   ```bash
   cd [project-name]
   npm install
   ```
3. Set Up Environment Variables:
   - Create a `.env` file in the root of your project.
   - Copy the contents from `.env.sample` to `.env`.
   - Fill in your OpenAI API key and assistant ID:
     ```
     OPENAI_API_KEY=your_openai_api_key
     ASSISTANT_ID=your_openai_assistant_id
     ```
4. Deploy to Firebase:
   ```bash
   firebase deploy --only functions
   ```

### Usage
Make an HTTP request to your Firebase function with the Notion page ID and OpenAI assistant ID as query parameters.

### Example Request
```
https://[your-firebase-function-url]/updateKnowledge?pageId=YOUR_NOTION_PAGE_ID&assistantId=YOUR_OPENAI_ASSISTANT_ID
```

## Limitations and Contributions
- **Data Source**: Only supports Notion with certain limitations in block type support and lack of pagination.
- **File Management**: Uses a single file approach due to OpenAI API limitations.
- **Deployment**: Designed for deployment on Firebase Functions without out-of-the-box support for local running.

We are actively seeking contributions, particularly for:
- **Data Source Integration**: Adding more data sources.
- **Enhanced Notion Support**: Improving Notion integration with more block types and pagination.
- **Local Deployment**: Creating a local runnable version of the code.

## Contributing
1. Fork the repository.
2. Create a new branch for your feature.
3. Implement and test your changes.
4. Submit a pull request with a detailed description of your changes.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.