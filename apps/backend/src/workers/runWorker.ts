import { connectDB, connectRedis } from '../config/db';
import { startAssessmentWorker } from './assessmentWorker';

const start = async () => {
  try {
    console.log('Connecting worker to databases...');
    await connectDB();
    await connectRedis();
    
    // Start BullMQ Worker
    startAssessmentWorker();
    
    console.log('Worker process running and listening for jobs.');
  } catch (error) {
    console.error('Worker failed to start:', error);
    process.exit(1);
  }
};

start();
