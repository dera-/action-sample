module.exports = (changelog, version) => {
	const changelogArray = changelog.split("\n");
	const regex = /## (\d+\.\d+\..+)/;
	let matchCount = 0;
	let body = "";
	for (let i = 0; i < changelogArray.length; i++) {
		const match = changelogArray[i].match(regex);
		if (match) {
			if (matchCount > 0) {
				break;
			} else if (match[1] === version) {
				matchCount++;
			}
		} else if (matchCount > 0) {
			body += changelogArray[i] + "\n";
		}
	}
	return body;
};
