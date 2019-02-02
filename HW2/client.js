// Import buildin net module.
var net = require('net');

var option = {
    host:'35.243.136.73',
    port: 5000
}

// Create TCP client.
var client = net.createConnection(option, function () {
    console.log('Connection local address : ' + client.localAddress + ":" + client.localPort);
    console.log('Connection remote address : ' + client.remoteAddress + ":" + client.remotePort);
});

// set the encoding type
client.setEncoding('utf8');

// When receive server send back data.
client.on('data', function (data) {
    console.log('Server return data is : ' + data);
});

// When connection disconnected.
client.on('end',function () {
    console.log('Client socket disconnect. ');
});

client.on('error', function (err) {
    console.error(JSON.stringify(err));
});

client.write('Hello, world');
