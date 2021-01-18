/*
 * Creat and export configuration variables
 */

// Container for all the environments
const environments = {};

// Staging (default) environment
environments.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: 'staging',
    hashingSecret: 'thisIsAStagingSecret',
    maxChecks: 5,
    twilio: {
        fromPhone: process.env.STAGING_FROM_PHONE,
        accountSid: process.env.STAGING_ACCOUNT_SID,
        authToken: process.env.STAGING_AUTH_TOKEN,
    },
    templateGlobals: {
        appName: 'UptimeChecker',
        companyName: 'NotARealCompany, Inc',
        yearCreated: '2021',
        baseUrl: 'http://localhost:3000/',
    },
};

// Testing environment
environments.testing = {
    httpPort: 4000,
    httpsPort: 4001,
    envName: 'testing',
    hashingSecret: 'thisIsATestingSecret',
    maxChecks: 5,
    twilio: {
        fromPhone: process.env.TEST_FROM_PHONE,
        accountSid: process.env.TEST_ACCOUNT_SID,
        authToken: process.env.TEST_AUTH_TOKEN,
    },
    templateGlobals: {
        appName: 'UptimeChecker',
        companyName: 'NotARealCompany, Inc',
        yearCreated: '2021',
        baseUrl: 'http://localhost:4000/',
    },
};

// Production environment
environments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: 'production',
    hashingSecret: 'thisIsAProductionSecret',
    maxChecks: 5,
    twilio: {
        fromPhone: process.env.PRODUCTION_FROM_PHONE,
        accountSid: process.env.PRODUCTION_ACCOUNT_SID,
        authToken: process.env.PRODUCTION_AUTH_TOKEN,
    },
    templateGlobals: {
        appName: 'UptimeChecker',
        companyName: 'NotARealCompany, Inc',
        yearCreated: '2021',
        baseUrl: 'http://localhost:5000/',
    },
};

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above. If not, default to staging
const environmentToExport = environments[currentEnvironment] || environments.staging;

// Export the module
module.exports = environmentToExport;
