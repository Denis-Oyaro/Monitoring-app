/*
 * API Tests
 */

// Dependencies
const app = require('../index');
const assert = require('assert').strict;
const http = require('http');
const config = require('../lib/config');

// Holder for the tests
const api = {};

// Helpers
const helpers = {};
helpers.makeHttpGetRequest = function (path, callback) {
    // Configure the request details
    const requestDetails = {
        protocol: 'http:',
        hostname: 'localhost',
        port: config.httpPort,
        method: 'GET',
        path,
    };

    // Instantiate the request object
    const req = http.request(requestDetails, function (res) {
        callback(res);
    });

    // End the request
    req.end();
};

// The main init() function should be able to run without throwing
api['app.init should start without throwing'] = function (done, catchAsyncErrors) {
    assert.doesNotThrow(() => {
        app.init(function (err) {
            if (err) {
                catchAsyncErrors(err);
            } else {
                done();
            }
        });
    }, TypeError);
};

// Make a request to /ping
api['/ping should respond to GET with 200'] = function (done, catchAsyncErrors) {
    helpers.makeHttpGetRequest('/ping', function (res) {
        try {
            assert.strictEqual(res.statusCode, 200);
            done();
        } catch (e) {
            catchAsyncErrors(e);
        }
    });
};

// Make a request to /api/users
api['/api/users should respond to GET with 400'] = function (done, catchAsyncErrors) {
    helpers.makeHttpGetRequest('/api/users', function (res) {
        try {
            assert.strictEqual(res.statusCode, 400);
            done();
        } catch (e) {
            catchAsyncErrors(e);
        }
    });
};

// Make a request to a random path
api['A random path should respond to GET with 404'] = function (done, catchAsyncErrors) {
    helpers.makeHttpGetRequest('/this/path/shouldnt/exist', function (res) {
        try {
            assert.strictEqual(res.statusCode, 404);
            done();
        } catch (e) {
            catchAsyncErrors(e);
        }
    });
};

// Export the module
module.exports = api;
