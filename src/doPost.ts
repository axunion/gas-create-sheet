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
		const name = parameter.name;
		const email = parameter.email;
		const recaptcha = parameter.recaptcha;

		if (!type || !name || !email || !recaptcha) {
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

		const recaptchaResult = verifyRecaptcha(secret, recaptcha);

		if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
			const score = recaptchaResult.score || "-";
			const error = recaptchaResult["error-codes"].join(" ");
			throw new Error(`reCAPTCHA verification failed. ${score} ${error}`);
		}

		const copiedFile = duplicateTemplateFile({
			spreadsheetId: config.spreadsheetId,
			directoryId: config.directoryId,
			name: name,
		});

		if (!copiedFile) {
			throw new Error("Failed to duplicate the template file.");
		}

		const subject =
			"2025 JBBF全国青年フェローシップキャンプ 参加申込のお知らせ";
		const body = `
${name} 様
お手続きありがとうございます。
以下のファイルから申し込みをお願いします。

${copiedFile.getUrl()}`;

		GmailApp.sendEmail(email, subject, body);
	} catch (error) {
		response.result = "error";
		response.error = error.message;
	}

	return ContentService.createTextOutput(JSON.stringify(response));
}
