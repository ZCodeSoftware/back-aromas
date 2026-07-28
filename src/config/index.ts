import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
    return {
        app: {
            appName: process.env.APP_NAME,
            app_port: process.env.PORT,
            api_key: process.env.APP_API_KEY,
            app_global_prefix: process.env.APP_GLOBAL_PREFIX,
            front: {
                front_base_url: process.env.FRONT_BASE_URL,
            },
            jwt: {
                secret: process.env.JWT_SECRET,
                /**
                 * Defaulted on purpose: an empty JWT_EXPIRATION_TIME reaches
                 * jwt.sign() as `undefined`, which mints tokens with no `exp` at
                 * all. There is no revocation list, so those never stop working.
                 */
                expiresIn: process.env.JWT_EXPIRATION_TIME || '1d',
            },
            domain: process.env.APP_DOMAIN,
            env: process.env.NODE_ENV,
            analytics: {
                /** Fixed UTC offset used to cut calendar days in reports. */
                tz_offset: process.env.ANALYTICS_TZ_OFFSET,
            },
        },
        mongo: {
            mongo_uri: process.env.MONGO_URI,
        }
    };
});
