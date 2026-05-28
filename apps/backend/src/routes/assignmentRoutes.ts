import { Router } from 'express';
import {
  createAssignment,
  getAssignment,
  getAssignmentResult,
  regenerateAssignment,
  healthCheck,
  listAssignments,
  deleteAssignment,
} from '../controllers/assignmentController';
import { getProfile, updateProfile } from '../controllers/profileController';
import { listGroups } from '../controllers/groupController';

const router = Router();

// Health check
router.get('/health', healthCheck);

// Core endpoints
router.get('/assignments', listAssignments);
router.post('/assignments', createAssignment);
router.get('/assignments/:id', getAssignment);
router.delete('/assignments/:id', deleteAssignment);
router.get('/results/:assignmentId', getAssignmentResult);
router.post('/assignments/:id/regenerate', regenerateAssignment);

// Profile endpoints
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Groups endpoints
router.get('/groups', listGroups);

export default router;
