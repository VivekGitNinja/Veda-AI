import mongoose, { Schema, Document } from 'mongoose';
import { IQuestionPaper } from '@vedaai/shared';
import { QuestionPaperSchema } from './Assignment';

export interface IGenerationResultDocument extends Document {
  assignmentId: mongoose.Types.ObjectId;
  result?: IQuestionPaper;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const GenerationResultSchema = new Schema<IGenerationResultDocument>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    result: { type: QuestionPaperSchema },
    status: {
      type: String,
      required: true,
      enum: ['queued', 'processing', 'generating', 'completed', 'failed'],
      default: 'queued',
    },
  },
  { timestamps: true }
);

export const GenerationResult = mongoose.model<IGenerationResultDocument>('GenerationResult', GenerationResultSchema);
export default GenerationResult;
