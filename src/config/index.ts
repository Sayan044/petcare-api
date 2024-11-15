import dotenv from 'dotenv'

dotenv.config()

export const CONFIG = {
    PORT: process.env.PORT,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    EMAIL: process.env.EMAIL as string,
    PASSWORD: process.env.PASSWORD as string,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME as string,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
    PASSWORD_SECRET: process.env.PASSWORD_SECRET as string,
    COOKIE_SECRET: process.env.COOKIE_SECRET as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
    UPLOAD_PATH: process.env.UPLOAD_PATH as string,
    SERVER_URL: process.env.SERVER_URL as string,
    ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET as string
}
