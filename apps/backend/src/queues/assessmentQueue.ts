import { Queue } from 'bullmq';
import { getRedisConnectionOptions } from '../config/db';

const redisOptions = getRedisConnectionOptions();

export const assessmentQueue = new Queue('assessment-queue', {
  connection: {
    host: redisOptions.host,
    port: redisOptions.port,
    password: redisOptions.password,
  },
});

export const addAssessmentJob = async (assignmentId: string) => {
  const job = await assessmentQueue.add(
    'generate-assessment',
    { assignmentId },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
  return job.id;
};
