// Shared env vars in all environments
var shared = {
    StageBASEURL: process.env.STAGING_BASE_URL,
    DemoTimeServiceURL: process.env.TIME_SERVICE_URL,
    environment: process.env.APP_ENV,
    AWSAccessKeyId: process.env.AWS_ACCESSKEY,
    AWSSecretAccessKey: process.env.AWS_SECRETKEY,
    IMAGE_S3_BUCKET: process.env.S3_BUCKET,
    S3_BUCKET_STG: process.env.S3_BUCKET_STG,
    ENV_PRE: process.env.APP_ENV_PRE
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