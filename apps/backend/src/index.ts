import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, connectRedis } from './config/db';
import router from './routes/assignmentRoutes';
import { initSocketServer } from './sockets/socketServer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS — restrict to frontend origin in production
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, same-origin) or matching FRONTEND_URL
      if (!origin || origin === allowedOrigin) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for dev; replace with: callback(new Error('Not allowed by CORS')) for strict prod
      }
    },
    credentials: true,
  })
);

// Support larger payloads for optional file uploads (Base64)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Simple alive-check endpoint (no DB/Redis required)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// API Routes
app.use('/api', router);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'VedaAI Assessment Creator API is running' });
});

const server = http.createServer(app);

const startServer = async () => {
  try {
    // Connections
    await connectDB();
    await connectRedis();

    // WebSockets initialization
    initSocketServer(server);

    // Bind server specifically to 0.0.0.0 for hosting platforms (Render/Railway/etc)
    server.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Backend server running on port ${PORT} (host: 0.0.0.0)`);
    });
  } catch (error) {
    console.error('Failed to start backend server:', error);
    process.exit(1);
  }
};

startServer();
export { server };
