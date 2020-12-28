/*
 *   Primary file for the API
 */

// Dependencies
const http = require('http');
const https = require('https');
const fs = require('fs');
const { StringDecoder } = require('string_decoder');
const config = require('./lib/config');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

// Instantiate the HTTP server
const httpServer = http.createServer(function (req, res) {
    unifiedServer(req, res, 'http');
});

// Start the HTTP server
httpServer.listen(config.httpPort, function () {
    console.log(`The server is listening on port ${config.httpPort}`);
});

// Instantiate the HTTPS server
const httpsServerOptions = {
    key: fs.readFileSync('./https/key.pem'),
    cert: fs.readFileSync('./https/cert.pem'),
};
const httpsServer = https.createServer(httpsServerOptions, function (req, res) {
    unifiedServer(req, res, 'https');
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function () {
    console.log(`The server is listening on port ${config.httpsPort}`);
});

// Define request router
const router = {
    ping: handlers.ping,
    users: handlers.users,
    tokens: handlers.tokens,
    checks: handlers.checks,
};

// All the server logic for both http and https server
const unifiedServer = function (req, res, protocol) {
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
        const chosenHandler = router[trimmedPath] || handlers.notFound;

        // Construct the data object to send to handler
        const data = { trimmedPath, queryStringObject, method, headers, payload: helpers.parseJsonToObject(buffer) };

        // Route the request to the chosen handler
        chosenHandler(data, function (statusCode, payload) {
            // Use the status code called back by the handler, or default to 200
            statusCode = typeof statusCode === 'number' ? statusCode : 200;

            // Use the payload called back by the handler, or default to an empty object
            payload = typeof payload === 'object' && payload !== null ? payload : {};

            // Convert payload to string
            const payloadStr = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadStr);

            // Log message
            console.log(`Returning response: ${statusCode} ${payloadStr}`);
        });
    });
};
