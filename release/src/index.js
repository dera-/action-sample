const fs = require("fs");
const path = require("path");
const core = require("@actions/core");
const github = require("@actions/github");
const npmPublish = require("@jsdevtools/npm-publish");

try {
	const targetDirPath = core.getInput("target_dir_path");
	npmPublish({
		package: path.join(targetDirPath, "package.json"),
		token: core.getInput("npm_token"),
		tag: core.getInput("target_npm_tag"),
		access: "public"
	}).then(() => {
		const packageJson = require(path.join(targetDirPath, "package.json"));
		const version = packageJson["version"];
		let body = "";
		const changelogPath = path.join(targetDirPath, "CHANGELOG.md");
		if (fs.existsSync(changelogPath)) {
			const changelog = fs.readFileSync(changelogPath).toString();
			body = generateReleaseNote(changelog, version);
		}
		const octokit = github.getOctokit(core.getInput("github_token"));
		octokit.repos.createRelease({
			owner: "dera-",
			repo: core.getInput("git_repository"),
			tag_name: "v" + version,
			name: "Release " + version,
			body: body,
			target_commitish: core.getInput("target_branch")
		});
	});
} catch (error) {
	core.setFailed(error.message);
}
