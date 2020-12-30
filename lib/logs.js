/*
 * Library for storing and rotating logs
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Container for the module
const lib = {};

// Base directory of the logs folder
lib.baseDir = path.join(__dirname, '..', '.logs/');

// Append a string to a file. Create the file if it does not exist
lib.append = function (file, str, callback) {
    fs.appendFile(`${lib.baseDir}${file}.log`, `${str}\n`, function (err) {
        if (err) {
            callback('Error appending to file');
        } else {
            callback(false);
        }
    });
};

// List all the logs, and optionally include the compressed logs
lib.list = function (includeCompressedLogs, callback) {
    fs.readdir(lib.baseDir, function (err, data) {
        if (!err && data && data.length > 0) {
            let trimmedFilenames = [];
            data.forEach(function (filename) {
                // Add the .log files
                if (filename.includes('.log')) {
                    trimmedFilenames.push(filename.replace('.log', ''));
                }

                // Add the .gz files
                if (includeCompressedLogs && filename.includes('.gz.b64')) {
                    trimmedFilenames.push(filename.replace('.gz.b64', ''));
                }
            });

            callback(false, trimmedFilenames);
        } else {
            callback(err, data);
        }
    });
};

// Compress the contents of a '.log' file into a '.gz.b64' file within the same directory
lib.compress = function (logId, newFileId, callback) {
    // Read input file
    fs.readFile(`${lib.baseDir}${logId}.log`, 'utf8', function (err, data) {
        if (err) {
            callback(err);
        } else {
            // Compress file
            zlib.gzip(data, function (err, buffer) {
                if (err) {
                    callback(err);
                } else {
                    // Write compress content to output file
                    fs.writeFile(`${lib.baseDir}${newFileId}.gz.b64`, buffer.toString('base64'), function (err) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(false);
                        }
                    });
                }
            });
        }
    });
};

// Decompress the contents of a '.gz.b64' file into a string variable
lib.decompress = function (fileId, callback) {
    // Read file to decompress
    fs.readFile(`${lib.baseDir}${fileId}.gz.b64`, 'utf8', function (err, contentStr) {
        if (err) {
            callback(err);
        } else {
            // Decompress the contents of file
            const inputBuffer = Buffer.from(contentStr, 'base64');
            zlib.unzip(inputBuffer, function (err, outputBuffer) {
                if (err) {
                    callback(err);
                } else {
                    const str = outputBuffer.toString();
                    callback(false, str);
                }
            });
        }
    });
};

// Truncate a log file
lib.truncate = function (logId, callback) {
    fs.truncate(`${lib.baseDir}${logId}.log`, function (err) {
        if (err) {
            callback(err);
        } else {
            callback(false);
        }
    });
};

// Export the module
module.exports = lib;
