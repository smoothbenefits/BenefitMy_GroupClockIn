// Shared env vars in all environments
var shared = {
    StageBASEURL: process.env.STAGING_BASE_URL,
    DemoTimeServiceURL: process.env.TIME_SERVICE_URL,
    environment: process.env.APP_ENV
};

//
var environments = {
    development: {
        ENV_VARS: shared
    },
    staging: {
        ENV_VARS: shared
    },
    production: {
        ENV_VARS: shared
    }
};

module.exports = environments;