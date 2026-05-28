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

    server.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start backend server:', error);
    process.exit(1);
  }
};

startServer();
export { server };
