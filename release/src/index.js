const fs = require("fs");
const path = require("path");
const core = require("@actions/core");
const github = require("@actions/github");
const npmPublish = require("@jsdevtools/npm-publish");
const generateReleaseNote = require("./generateReleaseNote");
const simpleGit = require("simple-git");
const inputs = {
	githubToken: core.getInput("github_token"),
	npmToken: core.getInput("npm_token"),
	onlyPullRequest: core.getInput("only_pull_request"),
};
const targetDirPath = process.env.GITHUB_WORKSPACE;
const packageJsonPath = path.join(targetDirPath, "package.json");
const changelogPath = path.join(targetDirPath, "CHANGELOG.md");
// GITHUB_REPOSITORYのフォーマットは オーナー名/リポジトリ名 となっているのでそれぞれ抽出する
const repositoryInfo = process.env.GITHUB_REPOSITORY.split("/");
const ownerName = repositoryInfo[0];
const repositoryName = repositoryInfo[1];
const gitCommitHash = process.env.GITHUB_SHA;
const currentBranch = process.env.GITHUB_REF_NAME;

(async () => {
	try {
		const git = simpleGit(targetDirPath);
		await git
			.addConfig("user.name", "github-actions", undefined, "global")
			.addConfig("user.email", "41898282+github-actions[bot]@users.noreply.github.com", undefined, "global");
		const octokit = github.getOctokit(inputs.githubToken);
		console.log("onlyPullRequest", inputs.onlyPullRequest);
		if (inputs.onlyPullRequest) {
			const branchName = `update-changelog-for-${Date.now()}`;
			await git.checkoutLocalBranch(branchName);
			const newfilePath = path.join(targetDirPath, "test.txt");
			fs.writeFileSync(newfilePath, "date:" + Date.now());
			await git.add(newfilePath);
			await git.commit("add test.txt");
			await git.push("origin", branchName);
			const prTitle = `Add file`;
			const prBody = `Add file.\n\nPlease check the contents and merge this Pull Request to proceed with the release.`;
			await octokit.rest.pulls.create({
				owner: ownerName,
				repo: repositoryName,
				title: prTitle,
				body: prBody,
				head: branchName,
				base: currentBranch
			});
			return;
		}
		await npmPublish({
			package: packageJsonPath,
			token: inputs.npmToken
		});
		const packageJson = require(packageJsonPath);
		const version = packageJson["version"];
		let body = "";
		if (fs.existsSync(changelogPath)) {
			const changelog = fs.readFileSync(changelogPath).toString();
			body = generateReleaseNote(changelog, version);
		}
		await octokit.rest.repos.createRelease({
			owner: ownerName,
			repo: repositoryName,
			tag_name: "v" + version,
			name: "Release v" + version,
			body: body,
			target_commitish: gitCommitHash
		});
	} catch(error) {
		core.setFailed(error.message);
	}
})();
