import mongoose from 'mongoose';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

// Print startup environment variables status (without exposing secrets)
console.log('=== ENVIRONMENT VARIABLES VERIFICATION ===');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`PORT: ${process.env.PORT || 'default (5000)'}`);
console.log(`MONGODB_URI: ${process.env.MONGODB_URI ? 'PRESENT' : 'MISSING'}`);
console.log(`MONGO_URI: ${process.env.MONGO_URI ? 'PRESENT' : 'MISSING'}`);
console.log(`REDIS_URL: ${process.env.REDIS_URL ? 'PRESENT' : 'MISSING'}`);
console.log(`REDISURL: ${process.env.REDISURL ? 'PRESENT' : 'MISSING'}`);
console.log(`REDIS_HOST: ${process.env.REDIS_HOST || process.env.REDISHOST ? 'PRESENT' : 'MISSING'}`);
console.log(`REDIS_PORT: ${process.env.REDIS_PORT || process.env.REDISPORT ? 'PRESENT' : 'MISSING'}`);
console.log(`REDIS_PASSWORD: ${process.env.REDIS_PASSWORD || process.env.REDISPASSWORD ? 'PRESENT' : 'MISSING'}`);
console.log(`REDIS_USERNAME: ${process.env.REDIS_USERNAME || process.env.REDISUSER ? 'PRESENT' : 'MISSING'}`);
console.log(`AI_API_KEY: ${process.env.AI_API_KEY ? 'PRESENT (AI Active)' : 'MISSING (Mock Fallback)'}`);
console.log('==========================================');

// Resolve MongoDB Connection URI
const envMongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (isProd && !envMongoUri) {
  throw new Error('Production Database Connection Error: Neither MONGODB_URI nor MONGO_URI is set in the environment variables.');
}
const MONGODB_URI = envMongoUri || 'mongodb://127.0.0.1:27017/vedaai-assessment';

// Resolve Redis Connection variables
const redisUrl = process.env.REDIS_URL || process.env.REDISURL;
let REDIS_HOST = process.env.REDIS_HOST || process.env.REDISHOST;
let REDIS_PORT = parseInt(process.env.REDIS_PORT || process.env.REDISPORT || '', 10);
let REDIS_PASSWORD = process.env.REDIS_PASSWORD || process.env.REDISPASSWORD;
let REDIS_USERNAME = process.env.REDIS_USERNAME || process.env.REDISUSER || 'default';
let REDIS_TLS = false;

if (redisUrl) {
  try {
    const url = new URL(redisUrl);
    REDIS_HOST = url.hostname;
    REDIS_PORT = parseInt(url.port || '6379', 10);
    if (url.username) {
      REDIS_USERNAME = decodeURIComponent(url.username);
    }
    if (url.password) {
      REDIS_PASSWORD = decodeURIComponent(url.password);
    }
    if (url.protocol === 'rediss:') {
      REDIS_TLS = true;
    }
  } catch (err) {
    console.error('Failed to parse Redis URL connection string:', err);
  }
} else if (isProd && !REDIS_HOST) {
  throw new Error('Production Cache Error: Neither REDIS_URL nor REDIS_HOST environment variables are set.');
}

if (process.env.REDIS_TLS === 'true') {
  REDIS_TLS = true;
}

const finalRedisHost = REDIS_HOST || '127.0.0.1';
const finalRedisPort = isNaN(REDIS_PORT) ? 6379 : REDIS_PORT;
const finalRedisPassword = REDIS_PASSWORD || undefined;
const finalRedisUsername = REDIS_USERNAME || undefined;

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error: any) {
    console.error('MongoDB connection failed on startup:', error.message || error);
    // Do not call process.exit(1) so the container can boot and serve /health for diagnostics
  }
};

export const getRedisConnectionOptions = () => {
  return {
    host: finalRedisHost,
    port: finalRedisPort,
    password: finalRedisPassword,
    username: finalRedisUsername,
    maxRetriesPerRequest: null, // Required by BullMQ
    ...(REDIS_TLS ? { tls: {} } : {}),
  };
};

export const redisClient = createClient(
  redisUrl
    ? {
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
          ...(REDIS_TLS ? { tls: true } : {}),
        },
      }
    : {
        socket: {
          host: finalRedisHost,
          port: finalRedisPort,
          reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
          ...(REDIS_TLS ? { tls: true } : {}),
        },
        password: finalRedisPassword,
        username: finalRedisUsername,
      }
);

redisClient.on('error', (err) => {
  console.error('Redis client error event:', err.message);
});

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('Redis connected successfully');
    }
  } catch (error) {
    console.error('Redis connection failed:', error);
  }
};
