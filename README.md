# GAS Create Sheet

A Google Apps Script (GAS) web application that creates copies of Google Sheets templates based on user requests. This service processes POST requests and duplicates predefined spreadsheet templates to specific Google Drive folders.

## Features

- 📝 Duplicate Google Sheets templates via web API
- 🔐 reCAPTCHA integration for spam protection
- ⏰ Configurable expiration dates for forms
- 📂 Organized file management with Google Drive folders
- 🔧 Configuration management via Google Sheets

## Project Structure

```
src/
├── appsscript.json      # Google Apps Script configuration
├── doPost.ts            # Main POST request handler
├── duplicateFile.ts     # File duplication functionality
├── getConfig.ts         # Configuration retrieval from sheets
└── verifyRecaptcha.ts   # reCAPTCHA verification (utility)
```

## Prerequisites

- Google Account with access to Google Apps Script
- Google Drive API enabled
- Google Sheets API enabled
- reCAPTCHA keys (for spam protection)

## Setup

### 1. Google Apps Script Project

1. Create a new Google Apps Script project
2. Replace the default code with the TypeScript files from this repository
3. Set the appropriate time zone in `appsscript.json`

### 2. Script Properties

Set the following script properties in your GAS project:

- `RECAPTCHA_SECRET`: Your reCAPTCHA secret key
- `SPREADSHEET_ID_CONFIG`: ID of the configuration spreadsheet

### 3. Configuration Spreadsheet

Create a Google Sheets file with a "config" sheet containing:

| Column A (expired) | Column B (type) | Column C (spreadsheetId) | Column D (directoryId) |
|---------------------|-----------------|-------------------------|------------------------|
| ☐                   | form_type_1     | template_sheet_id       | target_folder_id       |
| ☐                   | form_type_2     | another_template_id     | another_folder_id      |

Note: Column A should contain checkboxes (unchecked), and the type identifier goes in Column B.

### 4. Deploy as Web App

1. In Google Apps Script, click "Deploy" → "New deployment"
2. Choose "Web app" as the type
3. Set execute permissions appropriately
4. Copy the web app URL for use in your frontend

## API Usage

### POST Request

Send a POST request to your deployed web app URL with the following JSON payload:

```json
{
  "type": "form_type_1",
  "name": "New Sheet Name"
}
```

### Response

Success response:
```json
{
  "result": "done",
  "url": "https://docs.google.com/spreadsheets/d/..."
}
```

Error response:
```json
{
  "result": "error",
  "error": "Error message"
}
```

## Development

### Requirements

- Node.js (for development tools)
- TypeScript
- Biome (for formatting and linting)

### Install Dependencies

```bash
npm install
```

### Available Scripts

```bash
# Format code
npm run format

# Format and write changes
npm run format:write

# Lint code
npm run lint

# Lint and auto-fix
npm run lint:write

# Check both formatting and linting
npm run check

# Check and auto-fix
npm run check:write
```

## Error Handling

The application handles various error scenarios:

- Invalid or missing parameters
- Missing script properties
- Expired forms (past due date)
- File duplication failures
- Configuration retrieval errors

All errors are returned as JSON responses with descriptive error messages.

## Security Considerations

- reCAPTCHA integration helps prevent automated abuse
- Form expiration dates limit the window of vulnerability
- Proper error handling prevents information leakage
- Script properties keep sensitive data secure
