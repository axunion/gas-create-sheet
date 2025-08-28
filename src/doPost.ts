type PostSuccessResponse = {
	result: "done";
	url: string;
};

type PostErrorResponse = {
	result: "error";
	error: string;
};

type PostResponse = PostSuccessResponse | PostErrorResponse;

function _doPost() {
	const e = { parameter: { type: "" } };
	const result = doPost(e as unknown as GoogleAppsScript.Events.DoPost);
	console.log(result.getContent());
}

function doPost(
	e: GoogleAppsScript.Events.DoPost,
): GoogleAppsScript.Content.TextOutput {
	let response: PostResponse;

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
		const copiedFile = _duplicateFile({
			fileId: config.spreadsheetId,
			directoryId: config.directoryId,
			name,
		});

		if (!copiedFile) {
			throw new Error("Failed to duplicate the template file.");
		}

		response = {
			result: "done",
			url: copiedFile.getUrl(),
		};
	} catch (error) {
		response = {
			result: "error",
			error: error.message,
		};
	}

	return ContentService.createTextOutput(JSON.stringify(response));
}
