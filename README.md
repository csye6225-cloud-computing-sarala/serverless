# Serverless Email Verification Lambda Function

This repository contains the AWS Lambda function code for handling email verification when a new user registers on the web application.

## **Features**

- Receives SNS messages when a new user registers.
- Sends a verification email with a link that expires after 2 minutes.

// To zip handler function
zip -r lambda_function.zip handler.js package.json node_modules