const path = require('path');  // for cross-platform compatibility
const fs = require('fs');
const solc = require('solc');

const lotteryPath = path.resolve(__dirname, 'contracts', 'Lottery.sol');  // __dirname = current directory
const source = fs.readFileSync(lotteryPath, 'utf8');

module.exports = solc.compile(source, 1).contracts[':Lottery'];  // returns contracts property only - see console.log(solc.compile(source, 1))








