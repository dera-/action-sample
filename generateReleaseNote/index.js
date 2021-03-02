const core = require("@actions/core");
const fs = require("fs");
const path = require("path");
const generateReleaseNote = require("./generateReleaseNote");

try {
	const repositoryPath = core.getInput("repository_path");
	const packageJson = require(path.join(repositoryPath, "package.json"));
	const version = packageJson["version"];
	core.setOutput("version", "v" + version);
	let body = "";
	const changelogPath = path.join(repositoryPath, "CHANGELOG.md");
	if (fs.existsSync(changelogPath)) {
		const changelog = fs.readFileSync(changelogPath).toString();
		body = generateReleaseNote(changelog, version);
	}
	core.setOutput("body", body);
} catch (error) {
	core.setFailed(error.message);
}
