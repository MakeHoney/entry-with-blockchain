const PORT = 7777;

var http = require('http');
var request = require('request');
var Web3 = require('web3');
var request = require('./contract/abc.js');

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var contractInstanceAddr = "0x48c03a0550373ce3ac5d6f488cb00066b9a70787";
var t = web3.eth.contract(request.abi).at(contractInstanceAddr);
var blockInfo = {
	hash: "",
	number: ""
}

web3.personal.unlockAccount(web3.eth.coinbase, "bhun");

var transactionHash = t.setValue.sendTransaction("test", "wow", {from:web3.eth.coinbase});

var interval = setInterval(function() {
	var receipt = web3.eth.getTransactionReceipt(transactionHash);
	if(receipt != null) {
		blockInfo.hash = receipt.blockHash;
		blockInfo.number = receipt.blockNumber;
		console.log(blockInfo.hash);
		console.log(blockInfo.number);
		if(blockInfo.hash.length > 0) {
			clearInterval(interval);
		}
	}
}, 50);
