type PostResponse = {
	result: "done" | "error";
	error?: string;
};

function doPost(
	e: GoogleAppsScript.Events.DoPost,
): GoogleAppsScript.Content.TextOutput {
	const response: PostResponse = { result: "done" };

	try {
		const parameter = JSON.parse(e.postData.contents);
		const type = parameter.type;

		if (!type) {
			throw new Error("Invalid parameter.");
		}
	} catch (error) {
		response.result = "error";
		response.error = error.message;
	}

	return ContentService.createTextOutput(JSON.stringify(response));
}
