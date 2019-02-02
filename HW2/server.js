// Import builtin net module.
var net = require('net');

// Create and return a net.Server object
var server = net.createServer(function(socket) {

    console.log('. client remote address : ' + socket.remoteAddress + ':' + socket.remotePort);

    // set encoding type
    socket.setEncoding('utf-8');

    // When receive client data.
    socket.on('data', function (data) {

        // Print received client data
        console.log('Receive client send data : ' + data);

        // Server send data back to client use client net.Socket object.
        socket.end('Server received data : ' + data);
    });

    // When client send data complete.
    socket.on('end', function () {
        console.log('Client disconnect.');
    });

    // When client timeout.
    socket.on('timeout', function () {
        console.log('Client request time out. ');
    })
});

// Make the server a TCP server listening on port 5000.
server.listen(5000, function () {

    // Get server address info.
    var serverInfo = server.address();

    var serverInfoJson = JSON.stringify(serverInfo);

    console.log('TCP server listen on address : ' + serverInfoJson);

    server.on('close', function () {
        console.log('TCP server is closed.');
    });

    server.on('error', function (error) {
        console.error(JSON.stringify(error));
    });

});
