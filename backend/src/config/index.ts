import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'devtaskman-super-secret-key-12345!',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_NAME: process.env.DB_NAME || 'devtaskman',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
};
