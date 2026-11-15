window.__ModuleLoader__.load({
	id: "@apmixbot/dsh-client-ui-sidebar-documentpreview",
	chunk: "client.excel.js",
	factory: (require) => {
		const react = require("react");
		function ExcelBody() {
			return react.createElement("div", { role: "note", "data-excel-unsupported-notice": true, style: { padding: 16 } }, "Spreadsheet preview is not available. Open the file in a spreadsheet app.");
		}
		return { ExcelBody };
	}
});
