type Config = {
	dueDate: Date;
	sheetId: string;
	spreadsheetId: string;
	directoryId: string;
};

function _getConfig(): void {
	const properties = PropertiesService.getScriptProperties().getProperties();
	const config = getConfig(properties.SPREADSHEET_ID_CONFIG, "");
	console.log(config);
}

function getConfig(sheetId: string, type: string): Config {
	const ss = SpreadsheetApp.openById(sheetId);
	const sheet = ss.getSheetByName("config");

	if (!sheet) {
		throw new Error("Config not found.");
	}

	const data = sheet.getDataRange().getValues();
	const row = data.find((row) => row[0] === type);

	if (!row) {
		throw new Error("Config not found.");
	}

	return {
		dueDate: row[1],
		sheetId: row[2].trim(),
		spreadsheetId: row[3].trim(),
		directoryId: row[4].trim(),
	};
}
