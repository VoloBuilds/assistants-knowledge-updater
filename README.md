# Monsterbrew GPT Cloud Function

## Overview

This repository demonstrates how to write and deploy a simple Google Cloud Function (Firebase Function) accompanied by an OpenAPI description. The primary functionality of this function is to process text and return a URL after performing specific actions. It's designed to serve as an example of how such functions can be utilized as Actions in Custom GPTs.

Full video tutorial using this code to create a custom GPT with actions and knowledge:
[![How to make GPTs with Actions and Knowledge | D&D Homebrew GPT](https://img.youtube.com/vi/m2lJqHix-9I/0.jpg)](https://youtu.be/m2lJqHix-9I)


## Functionality

The `index.js` file contains 2 Cloud Functions. One is named `createHomebrew`. This function:

1. **Validates the Request**: It ensures that the incoming request is a POST method and checks for the presence of required content in the request body.
2. **Processes the Text**: The function then uses Puppeteer to automate browser actions. It navigates to a specific website, inputs the received text, and performs certain actions to generate a URL.
3. **Responds with a URL**: Finally, the function returns this URL as a response to the initial request.

The other function, `privacyPolicy`, serves a static .txt file that you can use in your GPT.

## Prerequisites

Before deploying this function, ensure you have the following:

- Node.js installed
- Firebase CLI installed and configured
- Google Cloud account and Firebase project set up

## Setup and Deployment

1. **Install Dependencies**: Run `npm install` in the project directory to install required packages (`firebase-functions`, `puppeteer-core`, `chrome-aws-lambda`).
2. **Deploy to Firebase**: Use the command `firebase deploy --only functions` to deploy the function to your Firebase project.
3. **Make Privacy Policy public**: If you are creating a public GPT, you will need a public privacy policy. To remove the auth from this endpoint, you can run the following command:
`gcloud functions add-iam-policy-binding privacyPolicy --member="allUsers" --role="roles/cloudfunctions.invoker"`

## OpenAPI Description

The `openapi.json` file in the repository provides a detailed description of the API implemented by the Cloud Function. This includes information about the endpoints, request methods, expected request body format, and response structure.

## Usage

To use this function:

1. **Send a POST Request**: The request should be sent to the function's URL provided by Firebase after deployment.
2. **Include Content in Request Body**: The `content` key in the request body must contain the text to be processed.
3. **Receive the URL**: The function will return a URL in its response upon successful processing.

## Contributing

Contributions to enhance the functionality or documentation of this repository are welcome. Please follow the standard GitHub pull request process for your contributions.

## License

MIT

---