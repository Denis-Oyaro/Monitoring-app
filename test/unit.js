/*
 * Unit Tests
 */

//Dependencies
const helpers = require('../lib/helpers');
const assert = require('assert').strict;
const logs = require('../lib/logs');
const exampleDebuggingProblem = require('../lib/exampleDebuggingProblem');

// Holder for tests
const unit = {};

// Assert that the getANumber function is returning a number
unit['helpers.getANumber should return a number'] = function (done, catchAsyncErrors) {
    const val = helpers.getANumber();
    assert.strictEqual(typeof val, 'number');
    done();
};

// Assert that the getANumber function is returning 1
unit['helpers.getANumber should return 1'] = function (done, catchAsyncErrors) {
    const val = helpers.getANumber();
    assert.strictEqual(val, 1);
    done();
};

// Assert that the getANumber function is returning 2
unit['helpers.getANumber should return 2'] = function (done, catchAsyncErrors) {
    const val = helpers.getANumber();
    assert.strictEqual(val, 2);
    done();
};

// Logs.list should call back an array and a false error
unit['logs.list should call back a false error and an array of log names'] = function (done, catchAsyncErrors) {
    logs.list(true, function (err, logFilenames) {
        try {
            assert.strictEqual(err, false);
            assert.ok(logFilenames instanceof Array);
            done();
        } catch (e) {
            catchAsyncErrors(e);
        }
    });
};

// Log truncate should not throw if the logId doesn't exist
unit['logs.truncate should not throw if the logId does not exist. It should callback an error instead'] = function (done, catchAsyncErrors) {
    assert.doesNotThrow(() => {
        logs.truncate('I do not exist', function (err) {
            try {
                assert.ok(err);
                done();
            } catch (e) {
                catchAsyncErrors(e);
            }
        });
    }, TypeError);
};

// ExampleDebuggingProblem.init() should not throw (but it does)
unit['ExampleDebuggingProblem.init() should not throw when called'] = function (done, catchAsyncErrors) {
    assert.doesNotThrow(() => {
        exampleDebuggingProblem.init();
        done();
    }, ReferenceError);
};

// Export the module
module.exports = unit;
