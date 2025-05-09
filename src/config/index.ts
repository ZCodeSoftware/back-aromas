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
                expiresIn: process.env.JWT_EXPIRATION_TIME,
            },
            domain: process.env.APP_DOMAIN,
            env: process.env.NODE_ENV,
        },
        mongo: {
            mongo_uri: process.env.MONGO_URI,
        }
    };
});
