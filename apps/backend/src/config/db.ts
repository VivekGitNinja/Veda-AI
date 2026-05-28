import mongoose from 'mongoose';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
let REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
let REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
let REDIS_TLS = false;

if (process.env.REDIS_URL) {
  try {
    const url = new URL(process.env.REDIS_URL);
    REDIS_HOST = url.hostname;
    REDIS_PORT = parseInt(url.port || '6379', 10);
    if (url.password) {
      REDIS_PASSWORD = decodeURIComponent(url.password);
    }
    if (url.protocol === 'rediss:') {
      REDIS_TLS = true;
    }
  } catch (err) {
    console.error('Failed to parse REDIS_URL:', err);
  }
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vedaai-assessment';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export const getRedisConnectionOptions = () => {
  return {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: null, // Required by BullMQ
    ...(REDIS_TLS ? { tls: {} } : {}),
  };
};

export const redisClient = createClient(
  process.env.REDIS_URL
    ? {
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
          ...(REDIS_TLS ? { tls: true } : {}),
        },
      }
    : {
        socket: {
          host: REDIS_HOST,
          port: REDIS_PORT,
          reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
        },
        password: REDIS_PASSWORD,
      }
);

redisClient.on('error', (err) => {
  // Catch but don't crash
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
