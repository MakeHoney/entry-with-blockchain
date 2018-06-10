const PORT = 7777;

var http = require('http');
var request = require('request');
var Web3 = require('web3');
var mysql = require('mysql');
var vars = require('./contract/variables.js');

var dbConnection = mysql.createConnection({
	host: "localhost",
	user: "entry_manager",
	password: "1234",
	database: "embeded_class"
});
var dbReturn;

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var contractInstanceAddr = "0x126b37bdedbb7d776b09398a23adb123949d88e3";
// console.log(vars.abi)
var t = web3.eth.contract(vars.abi).at(contractInstanceAddr);
var blockInfo = {
	hash: "",
	number: ""
}

web3.personal.unlockAccount(web3.eth.coinbase, "bhun");

var sql = "SELECT * FROM infos WHERE finger_print = '0'"; // const -> var
dbConnection.query(sql, function(err, row) {
	if(err) throw err;
	console.log(row)
	if(row.length > 0) {

		var name = row[0].name,
				address = row[0].address,
				phone = row[0].phone,
				inTime = new Date().toString();
		var transactionHash =
		t.setUserInformation.sendTransaction(name, address, phone, inTime, {from:web3.eth.coinbase, gas: '200000'});

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


	} else {
		console.log("invalid finger print");
	}
});

dbConnection.end();


var i = 0;
while(t.getUserName.call(i, {from:web3.eth.coinbase}).length) {
	console.log(t.getUserName.call(i, {from:web3.eth.coinbase}))
	i++;
}
