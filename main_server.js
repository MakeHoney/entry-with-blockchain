const PORT = 7777;

var Web3 = require('web3');
var mysql = require('mysql');
var vars = require('./contract/variables.js');
var dgram	= require('dgram'),
	packet	= require('coap-packet'),
	parse	= packet.parse,
	generate = packet.generate,
	payload	= new Buffer(''),
	message	= generate({ payload: payload });

var controller = dgram.createSocket("udp6");

/* database 연결 초기화 */
var dbConnection = mysql.createConnection({
	host: "localhost",
	user: "entry_manager",
	password: "1234",
	database: "embeded_class"
});
/* web3를 geth client와 연결 */
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
/* blockchain 내의 contract 주소 */
var contractInstanceAddr = "0x126b37bdedbb7d776b09398a23adb123949d88e3";
/* 이미 생성되어 blockchain에 올라가 있는 인스턴스를 할당 */
var paperInstance = web3.eth.contract(vars.abi).at(contractInstanceAddr);

/* CoAP을 타고 온 message 수신 */
controller.on("message", function(msg, rinfo) {
	// msg = parse(msg).payload.toString();
	// console.log("controller got : " + msg + " from " + rinfo.address + ":" + rinfo.port);
	console.log("server got message");

	/* transaction 발생시키기 이전 계정의 락을 풀어준다 */
	web3.personal.unlockAccount(web3.eth.coinbase, "bhun");

	/* database로부터 지문 정보를 불러온 뒤, 대조한다 */
	var sql = "SELECT * FROM infos WHERE finger_print = '0'"; // const -> var
	dbConnection.query(sql, function(err, row) {
		if(err) throw err;
		console.log(row)

		/* 지문 정보가 존재한다면 해당 지문에 해당하는 인물의 정보를 timestamp와 함께 transaction에 담아 발생시킨다 */
		if(row.length > 0) {

			/* transaction receipt를 참조하여 블록정보를 저장할 JSON object */
			var blockInfo = {
				hash: "",
				number: ""
			}

			/* database에서 불러온 정보들을 transaction에 담기 위해서 변수에 임시로 저장 */
			var name = row[0].name,
					address = row[0].address,
					phone = row[0].phone,
					inTime = new Date().toString();

			var transactionHash =
			paperInstance.setUserInformation.sendTransaction(name, address, phone, inTime, {from:web3.eth.coinbase, gas: '200000'});

			/* transaction receipt의 block 정보를 통하여 blockchain에 등재되었는지 50밀리세컨드 단위로 확인한다 */
			var interval = setInterval(function() {
				var receipt = web3.eth.getTransactionReceipt(transactionHash);
				if(receipt != null) {
					blockInfo.hash = receipt.blockHash;
					blockInfo.number = receipt.blockNumber;
					console.log(blockInfo.hash);
					console.log(blockInfo.number);

					/* blockchain에 입주자 정보가 등재되었다면 interval 함수를 중지시킨다 */
					if(blockInfo.hash.length > 0) {
						clearInterval(interval);
					}
				}
			}, 50);
		/* 지문 정보가 존재하지 않는다면 존재하지 않음을 알리고 아무일도 발생하지 않는다 */
		} else {
			console.log("invalid finger print");
		}
	});

	// dbConnection.end();

	/* blockchain에 등록된 정보를 조회하기 위한 테스트 코드 */
	var i = 0;
	while(paperInstance.getUserName.call(i, {from:web3.eth.coinbase}).length) {
		console.log(paperInstance.getUserName.call(i, {from:web3.eth.coinbase}))
		i++;
	}
});

/* CoAP 메세지 리스닝 */
controller.on("listening", function() {
	var address = controller.address();
	console.log("controller listening " + address.address +
		":" + address.port);
});

controller.bind(PORT);
