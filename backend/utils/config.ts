import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
dotenv.config({path: envFile});

export const config = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET || 'default_secret',
    jwtRefreshSecret: process.env.REFRESH_SECRET || 'default_refresh_token',
    jwtExpireIn: process.env.JWT_EXPIRES_IN || '15m', 
    jwtRefreshExpireIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    databaseUrl: process.env.DATABASE_URL,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200'
};