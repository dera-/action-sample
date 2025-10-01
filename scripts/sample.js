// このスクリプトに与えられた引数をコンソールログに表示する
// 例えば、node sample.js arg1 arg2 と実行した場合、
// "Sample script executed with arguments: [ 'arg1', 'arg2' ] 2" と表示される
console.log('Sample script executed with arguments:', process.argv.slice(2), process.argv.length - 2);
