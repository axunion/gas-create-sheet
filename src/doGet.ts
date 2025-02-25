type GetResponse = {
	result: "done" | "error";
	data?: unknown;
	error?: string;
};

function _doGet() {
	const e = { parameter: { type: "" } };
	const result = doGet(e as unknown as GoogleAppsScript.Events.DoGet);
	console.log(result.getContent());
}

function doGet(
	e: GoogleAppsScript.Events.DoGet,
): GoogleAppsScript.Content.TextOutput {
	const response: GetResponse = { result: "done" };

	try {
		const type = e.parameter.type;

		if (!type) {
			throw new Error("Invalid parameter.");
		}

		response.data = type;
	} catch (error) {
		response.result = "error";
		response.error = error.message;
	}

	return ContentService.createTextOutput(JSON.stringify(response));
}
