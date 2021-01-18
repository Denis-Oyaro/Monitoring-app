/*
 *   Primary file for the API
 */

module.exports = (function () {
    'use strict';
    // Dependencies
    const server = require('./lib/server');
    const workers = require('./lib/workers');
    const cli = require('./lib/cli');

    // Declare the app
    const app = {};

    foo = 'Menox Moyao';
    console.log(global.foo);

    // Init function
    app.init = function () {
        // Start the server
        server.init();

        // Start the workers
        workers.init();

        // Start the CLI, but make sure it starts last
        setTimeout(() => {
            cli.init();
        }, 50);
    };

    // Execute
    app.init();

    // Export app
    return app;
})();
