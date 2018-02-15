const figlet = require('figlet');
const clear = require('clear');
const chalk = require('chalk');
const fs = require('fs');
var SHA256 = require("crypto-js/sha256");
var readline = require('readline');
var file = "blocks.txt";
var localUserName = "";

class Block {
    constructor(index, hash, previousHash, timestamp, data) {
        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
    }
}

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var getGenesisBlock = () => {
    return new Block(1, "1ec2ca6dbd0e94c33e2e731c8db34162055d45eea3a5f10349b0d9ad5a616857", "0", 1254862800, {user: "MobiDev", value: "Rocks!"});
};

var getLatestBlock = () => {
  var fileData = fs.readFileSync(file, 'utf8');
  var lines = fileData.split("\r\n");
  return JSON.parse(lines[lines.length - 2].toString());
}

var readAllBlocksAndPrint = () => {
  var i = 1;
  var fileData = fs.readFileSync(file, 'utf8');
  var lines = fileData.split("\r\n");
  lines.forEach(element => {
    if(i == lines.length){
        return;
    }
    console.log(i + " block: " + element);
    i++;
  });
}

var generateNextBlock = (blockData) => {
    var previousBlock = getLatestBlock();
    var nextIndex = previousBlock.index + 1;
    var nextTimestamp = new Date().getTime() / 1000;
    var nextHash = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
    return new Block(nextIndex, nextHash,  previousBlock.hash, nextTimestamp, blockData);
};

var calculateHash = (index, previousHash, timestamp, data) => {
    return SHA256(index + previousHash + timestamp + data).toString();
};

var checkGenesisBlock = () => {
    var fileData = fs.readFileSync(file, 'utf8');
    if(fileData){
        return;
    }
    fs.writeFile(file, JSON.stringify(getGenesisBlock()).toString() + "\r\n", function (err) {
        if (err) throw err;
    }); 
};

var isValidBlockchain = () => {
    var fileData = fs.readFileSync(file, 'utf8');
    var lines = fileData.split("\r\n");
    var block = null;
    var valid = true;
    var i = 1;
    lines.forEach(element => {
        if(i == lines.length || !valid){
            return;
        }
        block = JSON.parse(element);
        if(block.hash != calculateHash(block.index, block.previousHash, block.timestamp, block.data)){
            console.log("Actual hash: " + block.hash);
            console.log("Expected hash: " + calculateHash(block.index, block.previousHash, block.timestamp, block.data));
            console.log("Error! Wrong hash in block with id " + block.index);
            valid = false;
        }
        i++;
      });
    return valid;
};

const run = () => { 

if(!fs.existsSync(file)){
    fs.appendFile(file, JSON.stringify(getGenesisBlock()).toString() + "\r\n", function (err) {
        if (err) throw err;
    });   
}


rl.question('Please choose action:\r\n 1 - Add new Block;\r\n 2 - List all blocks in the chain;\r\n 3 - Validate chain consistency \r\n 4 - Exit \r\n', function (action) {
    
    if(action == 1){
        rl.question('Enter username: \r\n', function (username) {
            localUserName = username;
            if(localUserName){
                rl.question('Enter value: \r\n', function (value) {
                    if(value){
                        var jsonBlock = JSON.stringify(generateNextBlock({user: localUserName, value: value}));
                        var blocks = fs.openSync(file,'r+');
                        var fileData = fs.readFileSync(file, 'utf8');
                        fs.writeSync(blocks, jsonBlock + "\r\n", fileData.length, "utf8");
                        console.log("Block added!");
                        run();
                    }
                }); 
            }
        });
    }
    if(action == 2){
        readAllBlocksAndPrint();
        run();
    }
    if(action == 3){
        if(isValidBlockchain()){
            console.log(
                chalk.green(
                    figlet.textSync("Valid!", { horizontalLayout: 'full' })
                )
                );
        } else {
            console.log(
                chalk.red(
                    figlet.textSync("Not valid!", { horizontalLayout: 'full' })
                )
                );
        }
        run();
    }
    if(action == 4){
        console.log(
            chalk.yellow(
            figlet.textSync('Goodbye!', { horizontalLayout: 'full' })
            )
        );
        rl.close();
        process.stdin.destroy();
    }  

});
}

console.log(
    chalk.green(
      figlet.textSync('Blockchain', { horizontalLayout: 'full' })
    )
  );
  
run();
