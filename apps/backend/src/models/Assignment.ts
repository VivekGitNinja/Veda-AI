import mongoose, { Schema, Document } from 'mongoose';
import { IAssignment } from '@vedaai/shared';

export interface IAssignmentDocument extends Omit<IAssignment, '_id'>, Document {}

const QuestionSchema = new Schema({
  text: { type: String, required: true },
  type: { type: String, required: true },
  difficulty: { type: String, required: true },
  marks: { type: Number, required: true },
  options: [{ type: String }],
});

const SectionSchema = new Schema({
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema],
});

export const QuestionPaperSchema = new Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  totalMarks: { type: Number, required: true },
  duration: { type: String, required: true },
  sections: [SectionSchema],
  answerKey: [{ questionIndex: Number, answer: String }],
});

const AssignmentSchema = new Schema<IAssignmentDocument>(
  {
    groupId: { type: String },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    dueDate: { type: String, required: true },
    difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
    questionType: { type: String, required: true, enum: ['mcq', 'short-answer', 'long-answer', 'case-based', 'mixed'] },
    numQuestions: { type: Number, required: true },
    marksPerQuestion: { type: Number, required: true },
    additionalInstructions: { type: String },
    fileContent: { type: String },
    fileName: { type: String },
    jobId: { type: String },
    status: {
      type: String,
      required: true,
      enum: ['queued', 'processing', 'generating', 'completed', 'failed'],
      default: 'queued',
    },
    progress: { type: Number, required: true, default: 0 },
    result: { type: QuestionPaperSchema },
    error: { type: String },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignmentDocument>('Assignment', AssignmentSchema);
export default Assignment;
