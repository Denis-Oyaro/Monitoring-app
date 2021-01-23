/*
 *   Primary file for the API
 */

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const cluster = require('cluster');
const os = require('os');

// Declare the app
const app = {};

// Init function
app.init = function (callback) {
    // If we're on the master thread, start the background workers and CLI
    if (cluster.isMaster) {
        // Start the workers
        workers.init();

        // Start the CLI, but make sure it starts last
        setTimeout(() => {
            cli.init();
            callback(false);
        }, 50);

        // Fork the process
        for (let i = 0; i < os.cpus().length; i++) {
            cluster.fork();
        }
    } else {
        // If we're not on the master thread, start the server
        server.init();
    }
};

// Execute only if run as entry script i.e 'node index'
if (require.main === module) {
    app.init(function () {});
}

// Export the app
module.exports = app;
