/*
 * Helpers for various tasks
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');
const querystring = require('querystring');
const https = require('https');

// Container for all the helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = function (str) {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return '';
    }
};

// Parse a json string to an object in all cases without throwing
helpers.parseJsonToObject = function (jsonStr) {
    let obj;
    try {
        obj = JSON.parse(jsonStr);
    } catch (err) {
        obj = {};
    }
    return obj;
};

// Create a string of random alphanumeric characters of a given length
helpers.createRandomString = function (strLength) {
    strLength = typeof strLength === 'number' && strLength > 0 ? strLength : 0;

    if (strLength) {
        // Define all the possible characters that could go into a string
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // Start the final string
        let str = '';
        for (let i = 0; i < strLength; i++) {
            // Get a random character from the possibleCharacters string
            const randomChar = possibleCharacters[Math.floor(Math.random() * possibleCharacters.length)];

            // Append this character to the final string
            str += randomChar;
        }

        // Return the final string
        return str;
    } else {
        return '';
    }
};

// Send an SMS message via twilio
helpers.sendTwilioSms = function (phone, msg, callback) {
    // Validate the parameters
    phone = typeof phone === 'string' && phone.trim().length === 10 ? phone.trim() : '';
    msg = typeof msg === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : '';

    if (phone && msg) {
        // Configure the request payload
        const payload = {
            From: config.twilio.fromPhone,
            To: `+1${phone}`,
            Body: msg,
        };

        // Stringify the payload
        const payloadStr = querystring.stringify(payload);

        // Configure the request details
        const requestDetails = {
            protocol: 'https:',
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
            auth: `${config.twilio.accountSid}:${config.twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(payloadStr),
            },
        };

        // Instantiate the request object
        const req = https.request(requestDetails, function (res) {
            // Get the response status code
            const status = res.statusCode;
            // Callback successfully if the response status is success
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback(`Status code returned was ${status}`);
            }
        });

        // Bind to the error event so that it doesn't get thrown
        req.on('error', function (e) {
            callback(e);
        });

        // Add the payload
        req.write(payloadStr);

        // End the request
        req.end();
    } else {
        callback('Given parameters were missing or invalid');
    }
};

// Export the module
module.exports = helpers;
