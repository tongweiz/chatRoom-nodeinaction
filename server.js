let http = require('http');
let fs = require('fs');
let path = require('path');
let mime = require('mime');
let chatServer = require('./lib/chat_server');
let cache = {}

function send404(response) {
    response.writeHead(400, {
        'Content-Type': 'text/plain'
    });
    response.write('Error 404: resource not found.');
    response.end();
}

function sendFile(response, filePath, fileContents) {
    response.writeHead(
        200, {
            'Content-Type': mime.lookup(path.basename(filePath))
        }
    );
    response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.readFile(absPath, function (err, data) {
            if (err) {
                send404(response);
            } else {
                cache[absPath] = data;
                sendFile(response, absPath, data);
            }
        });
    }
}

let server = http.createServer(function (request, response) {
    let filePath = false;

    if (request.url == '/') {
        filePath = 'public/index.html';
    } else {
        filePath = 'public' + request.url;
    }

    let absPath = './' + filePath;
    serveStatic(response, cache, absPath);
});

server.listen(3000, function () {
    console.log('server listening on port 3000.');
});

chatServer.listen(server);