# GAS Create Sheet

Simple Google Apps Script (GAS) web API to create a copy of a Google Sheets template based on a requested type. It returns the URL of the new sheet.

## Features

- Duplicate a template sheet by type
- Store template + target folder mapping in a config sheet
- Simple JSON POST interface
- Clear error responses

## Tech

- TypeScript (compiled to plain Google Apps Script JS)
- No external runtime libraries
- Biome for format / lint

## Project Structure

```
src/
├── appsscript.json   # GAS manifest (copied to dist on build)
├── doPost.ts         # Entry point (web app POST)
├── duplicateFile.ts  # Drive file copy helper
└── getConfig.ts      # Read config sheet
```

Build output goes to `dist/` after `npm run build`.

## Prerequisites

- Google account + access to Apps Script and Drive
- One Google Sheet used as a config sheet (tab name: `config`)

Script Properties required (must be set even if value is just placeholders in current code):
- `SPREADSHEET_ID_CONFIG`: ID of the config spreadsheet
- `RECAPTCHA_SECRET`: Currently not used in logic, but code checks it exists

## Config Sheet Format

Sheet name: `config`

Header row (row 1): any labels. From row 2 downward:

| A (expired flag) | B (type)       | C (spreadsheetId)    | D (directoryId)      |
| ---------------- | -------------- | -------------------- | -------------------- |
| (empty / FALSE)  | form_type_1    | template_sheet_id    | target_folder_id     |
| (empty / FALSE)  | form_type_2    | another_template_id  | another_folder_id    |

Row is selected when:
1. Column A is empty / not truthy (e.g. unchecked checkbox)
2. Column B matches the requested `type`

Returned values supply the template file ID (column C) and target folder ID (column D).

## Install & Build

```bash
npm install
npm run build
```

This compiles TypeScript (`src/*.ts`) into `dist/*.js` and copies `appsscript.json` to `dist/`.

## Deploy (clasp)

Deployment to Google Apps Script uses `clasp`. Only the `dist/` directory is pushed (`rootDir` in `.clasp.json`).

### 1. Install & initial auth

```bash
npm install
npm run build   # generate dist/
npm install -g @google/clasp
clasp login     # browser auth
```

### 2. Build & push

```bash
npm run build      # TypeScript -> dist
clasp push         # Upload dist/ JS + manifest
```

Fast edit loop:
```bash
npm run build && clasp push
```

Optional convenience script (add to `package.json`):
```jsonc
"scripts": {
  // ...existing
  "push": "npm run build && clasp push"
}
```

### 3. Publish as a Web App

First time only (needs the Apps Script UI):

1. `clasp open`
2. Deploy > New deployment
3. Type: Web app
4. Execute as: Me (default)
5. Who has access: choose appropriate scope (Anyone / Domain / Only myself)
6. Deploy and copy the Web App URL

Subsequent releases:
```bash
npm run build
clasp push
clasp deploy --description "update YYYY-MM-DD"
```

If you just need the latest code without versioning, use the “test deployment” URL (not recommended for production stability).

`doPost` currently parses JSON even without a header, but clients should send `Content-Type: application/json`.

### 4. Script Properties

Apps Script > Project Settings > Script properties:

| Key | Example | Note |
| --- | ------- | ---- |
| `SPREADSHEET_ID_CONFIG` | `1Abc...` | Config spreadsheet ID |
| `RECAPTCHA_SECRET` | `dummy` | Only presence-checked for now |

Property changes take effect immediately; you don't need to redeploy.

### 5. Test (curl)

```bash
WEBAPP_URL="https://script.google.com/macros/s/XXXXXXXXXXXXXXXX/exec"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"type":"form_type_1","name":"Sample Sheet"}' \
  "$WEBAPP_URL" | jq .
```

Successful response:
```json
{"result":"done","url":"https://docs.google.com/spreadsheets/d/..."}
```

Error example (no matching config row):
```json
{"result":"error","error":"Config not found."}
```

### 6. Common pitfalls

- Forgot to build: editing `src/` without rebuilding leaves `dist/` stale
- Reusing someone else's `scriptId`: accidentally overwriting another project
- Config sheet name is fixed (`config`)
- Header row: first row ignored; data starts at row 2
- Expired flag: any truthy value in column A skips the row

---

## API

Endpoint: Web App URL (POST JSON)

Request body:
```json
{
  "type": "form_type_1",
  "name": "New Sheet Name"
}
```

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
  "error": "Message"
}
```

## Error Cases

- Missing or empty `type` / `name`
- Missing script properties
- Config row not found
- File or folder not found / copy failure

All errors return JSON with `result: "error"`.

## Security Notes

- Only the folder you target receives new copies
- Script properties keep IDs (and future secrets) out of code
- Add validation (e.g. reCAPTCHA) before production if needed
