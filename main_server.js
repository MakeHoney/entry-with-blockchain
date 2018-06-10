const PORT = 7777;

var request = require('request');

var dgram	= require('dgram'),
	packet	= require('coap-packet'),
	parse	= packet.parse,
	generate = packet.generate,
	payload	= new Buffer(''),
	message	= generate({ payload: payload });

var controller = dgram.createSocket("udp6");

var url = 'http://localhost:8545/';

var postData = {
	jsonrpc: '2.0',
	method: 'eth_accounts',
	params: [],
	id: 1
}

var options = {
  url: url,
  method: 'POST',
  headers: {
		"Content-Type": "application/json"
	},
  body: postData,
  json: true
}


controller.on("message", function(msg, rinfo) {
	msg = parse(msg).payload.toString();
	console.log("controller got : " + msg + " from " + rinfo.address + ":" + rinfo.port);

	request(options, function (err, res, body) {
		if (err) {
			console.error('error posting json: ', err)
			throw err
		}
		var headers = res.headers
		var statusCode = res.statusCode
		console.log('headers: ', headers)
		console.log('statusCode: ', statusCode)
		console.log('result: ', body)
	})
});

controller.on("listening", function() {
	var address = controller.address();
	console.log("controller listening " + address.address + 
		":" + address.port);
});

controller.bind(PORT);
