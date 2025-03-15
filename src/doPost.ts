type PostResponse = {
	result: "done" | "error";
	url?: string;
	error?: string;
};

function doPost(
	e: GoogleAppsScript.Events.DoPost,
): GoogleAppsScript.Content.TextOutput {
	const response: PostResponse = { result: "done" };

	try {
		const parameter = JSON.parse(e.postData.contents);
		const type = parameter.type;
		const name = parameter.name;

		if (!type || !name) {
			throw new Error("Invalid parameter.");
		}

		const properties = PropertiesService.getScriptProperties().getProperties();
		const secret = properties.RECAPTCHA_SECRET;
		const configSheetId = properties.SPREADSHEET_ID_CONFIG;

		if (!secret || !configSheetId) {
			throw new Error("Invalid script properties.");
		}

		const config = getConfig(configSheetId, type);
		const date = new Date();

		if (date > config.dueDate) {
			throw new Error("This form has expired.");
		}

		const copiedFile = duplicateFile({
			fileId: config.spreadsheetId,
			directoryId: config.directoryId,
			name,
		});

		if (!copiedFile) {
			throw new Error("Failed to duplicate the template file.");
		}

		response.url = copiedFile.getUrl();
	} catch (error) {
		response.result = "error";
		response.error = error.message;
	}

	return ContentService.createTextOutput(JSON.stringify(response));
}
