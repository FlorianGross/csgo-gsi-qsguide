http = require('http');
fs = require('fs');

port = 3000;
host = '127.0.0.1';

server = http.createServer(function(require, response) {
    console.log('Handling POST request...');

    var body = '';

    require.on('data', function (data) {
        body += data;
    });

    require.on('end', function () {
        console.log('POST payload: ' + body);

        response.end('');
    });
});

server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);
