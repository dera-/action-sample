const assert = require('assert');
const generateReleaseNote = require("./generateReleaseNote");

try {
	const changelog = `
# CHANGELOG

## 2.0.1
* test1

## 2.0.0-beta.12
* test2

## 2.0.0-beta.1 - 11
* test3

## 1.5.1
`;
	// CHANGELOGに記載されているバージョンの内容を取得できる
	assert.strictEqual(generateReleaseNote(changelog, "2.0.1"), "* test1\n\n");
	assert.strictEqual(generateReleaseNote(changelog, "2.0.0-beta.12"), "* test2\n\n");
	// CHANGELOGに記載されていないバージョンを指定した場合空文字が返ってくる
	assert.strictEqual(generateReleaseNote(changelog, "1.5.0"), "");

	// CHANGELOGに記載されているバージョンが1つだけでも上記と同様の挙動となる
	const changelog2 = `
# CHANGELOG

## 1.0.0
* first release
`;
	assert.strictEqual(generateReleaseNote(changelog2, "1.0.0"), "* first release\n\n");
	assert.strictEqual(generateReleaseNote(changelog2, "1.0.1"), "");
} catch(e) {
	console.log(e);
	process.exit(1);
}
