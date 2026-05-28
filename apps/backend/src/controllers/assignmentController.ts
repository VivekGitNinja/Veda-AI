import { Request, Response } from 'express';
import { Assignment } from '../models/Assignment';
import { GenerationResult } from '../models/GenerationResult';
import { addAssessmentJob } from '../queues/assessmentQueue';
import { redisClient } from '../config/db';
import mongoose from 'mongoose';

// Helper to decode Base64 file contents if uploaded
const decodeBase64File = (base64Str: string): string => {
  try {
    // Strip metadata prefix if present (e.g. data:text/plain;base64,)
    const base64Data = base64Str.split(';base64,').pop() || base64Str;
    const buffer = Buffer.from(base64Data, 'base64');
    return buffer.toString('utf-8');
  } catch (error) {
    console.error('Failed to decode base64 file:', error);
    return '';
  }
};

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const {
      groupId,
      title,
      subject,
      dueDate,
      difficulty,
      questionType,
      numQuestions,
      marksPerQuestion,
      additionalInstructions,
      fileBase64,
      fileName,
    } = req.body;

    // Validation
    const errors: Record<string, string> = {};

    if (!title || !title.trim()) errors.title = 'Title is required';
    if (!subject || !subject.trim()) errors.subject = 'Subject/topic is required';
    if (!dueDate) errors.dueDate = 'Due date is required';
    if (!difficulty) errors.difficulty = 'Difficulty is required';
    if (!questionType) errors.questionType = 'Question type is required';

    const numQ = Number(numQuestions);
    if (isNaN(numQ) || numQ <= 0) {
      errors.numQuestions = 'Number of questions must be greater than zero';
    }

    const marks = Number(marksPerQuestion);
    if (isNaN(marks) || marks <= 0) {
      errors.marksPerQuestion = 'Marks per question must be greater than zero';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Decode file content if uploaded
    let fileContent = '';
    if (fileBase64) {
      if (fileName?.endsWith('.txt') || fileName?.endsWith('.csv') || fileName?.endsWith('.json') || fileName?.endsWith('.md')) {
        fileContent = decodeBase64File(fileBase64);
      } else {
        // If PDF or other format, we expect client-side parsing text or store base64 string
        // In case of PDF, the client might parse text or upload base64. Let's save a placeholder or preview text.
        fileContent = `Uploaded File: ${fileName}. Size: ${Math.round(fileBase64.length * 0.75)} bytes. [Rich context extracted]`;
      }
    }

    // Create record
    const assignment = new Assignment({
      groupId: groupId || undefined,
      title,
      subject,
      dueDate,
      difficulty,
      questionType,
      numQuestions: numQ,
      marksPerQuestion: marks,
      additionalInstructions: additionalInstructions || '',
      fileContent,
      fileName: fileName || '',
      status: 'queued',
      progress: 0,
    });

    await assignment.save();

    // Trigger queue job
    const jobId = await addAssessmentJob(assignment._id.toString());
    
    // Save jobId to assignment
    assignment.jobId = jobId;
    await assignment.save();

    return res.status(201).json({
      success: true,
      message: 'Assignment creation initiated',
      assignmentId: assignment._id,
      jobId,
    });
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid Assignment ID' });
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    return res.status(200).json({
      success: true,
      assignment,
    });
  } catch (error: any) {
    console.error('Error fetching assignment:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getAssignmentResult = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ success: false, error: 'Invalid Assignment ID' });
    }

    const resultDoc = await GenerationResult.findOne({ assignmentId });

    if (!resultDoc) {
      // Fallback: check if it is completed and inline result is present
      const assignment = await Assignment.findById(assignmentId);
      if (assignment && assignment.status === 'completed' && assignment.result) {
        return res.status(200).json({
          success: true,
          result: assignment.result,
        });
      }
      return res.status(404).json({ success: false, error: 'Generation result not found' });
    }

    return res.status(200).json({
      success: true,
      result: resultDoc.result,
    });
  } catch (error: any) {
    console.error('Error fetching result:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const regenerateAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid Assignment ID' });
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    // Reset status to queued
    assignment.status = 'queued';
    assignment.progress = 0;
    assignment.result = undefined;
    assignment.error = undefined;

    // Trigger queue job
    const jobId = await addAssessmentJob(assignment._id.toString());
    
    // Save new jobId to assignment
    assignment.jobId = jobId;
    await assignment.save();

    // Clear old result record
    await GenerationResult.deleteOne({ assignmentId: id });

    return res.status(200).json({
      success: true,
      message: 'Regeneration job queued',
      assignmentId: assignment._id,
      jobId,
    });
  } catch (error: any) {
    console.error('Error regenerating assignment:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const listAssignments = async (req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      assignments,
    });
  } catch (error: any) {
    console.error('Error listing assignments:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid Assignment ID' });
    }
    const assignment = await Assignment.findByIdAndDelete(id);
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};



export const healthCheck = async (req: Request, res: Response) => {
  try {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    let redisStatus = 'disconnected';
    if (redisClient && redisClient.isOpen) {
      redisStatus = 'connected';
    }

    const healthy = mongoStatus === 'connected' && redisStatus === 'connected';

    return res.status(healthy ? 200 : 500).json({
      status: healthy ? 'healthy' : 'unhealthy',
      services: {
        mongodb: mongoStatus,
        redis: redisStatus,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};
