/*
 * Server-related tasks
 */

// Dependencies
const http = require('http');
const https = require('https');
const fs = require('fs');
const { StringDecoder } = require('string_decoder');
const config = require('./config');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');
const util = require('util');

// Define a logging function
const debuglog = util.debuglog('server');

// Instantiate the server module object
const server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer(function (req, res) {
    server.unifiedServer(req, res, 'http');
});

// Instantiate the HTTPS server
server.httpsServerOptions = {
    key: fs.readFileSync(path.join(__dirname, '../https/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../https/cert.pem')),
};
server.httpsServer = https.createServer(server.httpsServerOptions, function (req, res) {
    server.unifiedServer(req, res, 'https');
});

// All the server logic for both http and https server
server.unifiedServer = function (req, res, protocol) {
    // Get the url and parse
    const parsedUrl = new URL(req.url, `${protocol}://${req.headers.host}`);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    const queryStringObject = parsedUrl.searchParams;

    // Get the http method
    const method = req.method.toLowerCase();

    // Get the headers as an object
    const headers = req.headers;

    // Get the payload, if any
    const decoder = new StringDecoder('utf8');
    let buffer = '';
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });
    req.on('end', function () {
        buffer += decoder.end();

        // Choose the handler this request should go to. If one is not found, use the notFound handler
        let chosenHandler = server.router[trimmedPath] || handlers.notFound;

        // If the request is within the public directory, use the public handler instead
        if (trimmedPath.includes('public/')) {
            chosenHandler = handlers.public;
        }

        // Construct the data object to send to handler
        const data = { trimmedPath, queryStringObject, method, headers, payload: helpers.parseJsonToObject(buffer) };

        // Route the request to the chosen handler
        try {
            chosenHandler(data, function (statusCode, payload, contentType) {
                server.processHandlerResponse(res, method, trimmedPath, statusCode, payload, contentType);
            });
        } catch (e) {
            debuglog(e);
            server.processHandlerResponse(res, method, trimmedPath, 500, { Error: 'An unknown error has occured' }, 'json');
        }
    });
};

// Process the response from the handler
server.processHandlerResponse = function (res, method, trimmedPath, statusCode, payload, contentType) {
    // Determine the type of response (fallback to JSON)
    contentType = typeof contentType === 'string' ? contentType : 'json';

    // Use the status code called back by the handler, or default to 200
    statusCode = typeof statusCode === 'number' ? statusCode : 200;

    // Return the response parts that are content specific
    let payloadStr = '';
    if (contentType === 'json') {
        res.setHeader('Content-Type', 'application/json');

        // Use the payload called back by the handler, or default to an empty object
        payload = typeof payload === 'object' && payload !== null ? payload : {};

        // Convert payload to string
        payloadStr = JSON.stringify(payload);
    }

    if (contentType === 'html') {
        res.setHeader('Content-Type', 'text/html');

        // Use the payload called back by the handler, or default to an empty string
        payloadStr = typeof payload === 'string' ? payload : '';
    }

    if (contentType === 'favicon') {
        res.setHeader('Content-Type', 'image/x-icon');

        // Use the payload called back by the handler, or default to an empty string
        payloadStr = typeof payload !== 'undefined' ? payload : '';
    }

    if (contentType === 'css') {
        res.setHeader('Content-Type', 'text/css');

        // Use the payload called back by the handler, or default to an empty string
        payloadStr = typeof payload !== 'undefined' ? payload : '';
    }

    if (contentType === 'png') {
        res.setHeader('Content-Type', 'image/png');

        // Use the payload called back by the handler, or default to an empty string
        payloadStr = typeof payload !== 'undefined' ? payload : '';
    }

    if (contentType === 'jpg') {
        res.setHeader('Content-Type', 'image/jpeg');

        // Use the payload called back by the handler, or default to an empty string
        payloadStr = typeof payload !== 'undefined' ? payload : '';
    }

    if (contentType === 'plain') {
        res.setHeader('Content-Type', 'text/plain');

        // Use the payload called back by the handler, or default to an empty string
        payloadStr = typeof payload !== 'undefined' ? payload : '';
    }

    // Return the response parts that are common to all content types
    res.writeHead(statusCode);
    res.end(payloadStr);

    // If response status code is 200, log green, otherwise, log red
    if (statusCode === 200) {
        debuglog('\x1b[32m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
    } else {
        debuglog('\x1b[31m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
    }
};

// Define request router
server.router = {
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/edit': handlers.accountEdit,
    'account/deleted': handlers.accountDeleted,
    'session/create': handlers.sessionCreate,
    'session/deleted': handlers.sessionDeleted,
    'checks/all': handlers.checksList,
    'checks/create': handlers.checksCreate,
    'checks/edit': handlers.checksEdit,
    ping: handlers.ping,
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/checks': handlers.checks,
    'favicon.ico': handlers.favicon,
    public: handlers.public,
    'examples/error': handlers.exampleError,
};

// Init script
server.init = function () {
    // Start the HTTP server
    server.httpServer.listen(config.httpPort, function () {
        console.log('\x1b[36m%s\x1b[0m', `The server is listening on port ${config.httpPort}`);
    });

    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, function () {
        console.log('\x1b[35m%s\x1b[0m', `The server is listening on port ${config.httpsPort}`);
    });
};

// Export the module
module.exports = server;
