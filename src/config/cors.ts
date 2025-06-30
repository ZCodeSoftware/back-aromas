import config from './index';

let whiteListDev: string[] = [];

if (config().app.env === 'dev') {
    whiteListDev = ['http://localhost:3000', 'http://localhost:5173'];
}

const whiteList = [
    ...whiteListDev,
    "https://front-aromas.vercel.app"
];

export const corsOptions = {
    origin: function (origin, callback) {
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (whiteList.indexOf(origin) === -1) {
            const msg =
                'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
};