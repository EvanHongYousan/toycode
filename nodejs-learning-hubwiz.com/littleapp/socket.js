var net = require('net');

net.createServer(function (conn) {
    conn.on('data', function (data) {
        conn.write([
            'HTTP/1.1 200 OK',
            'Content-Type: text/plain',
            'Content-Length: 11',
            '',
            'fdsaasdf fdsa'
        ].join('\n'));
    });
}).listen(800);