import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile {
  schoolName: string;
  schoolBranch: string;
  teacherName: string;
  teacherEmail: string;
  academicSession: string;
  affiliationBoard: string;
  aiEngine: 'gemini' | 'mock';
  pdfFormatting: boolean;
  defaultDuration: string;
  defaultPassingMarks: number;
  defaultInstructions: string;
  schoolLogo?: string;
}

export interface IProfileDocument extends IProfile, Document {}

const ProfileSchema = new Schema<IProfileDocument>(
  {
    schoolName: { type: String, required: true, default: 'Delhi Public School' },
    schoolBranch: { type: String, required: true, default: 'Bokaro Steel City' },
    teacherName: { type: String, required: true, default: 'Lakshya K.' },
    teacherEmail: { type: String, required: true, default: 'lakshya@dpsbokaro.edu' },
    academicSession: { type: String, required: true, default: '2026-2027' },
    affiliationBoard: { type: String, required: true, default: 'CBSE' },
    aiEngine: { type: String, required: true, enum: ['gemini', 'mock'], default: 'mock' },
    pdfFormatting: { type: Boolean, required: true, default: true },
    defaultDuration: { type: String, required: true, default: '1 Hour' },
    defaultPassingMarks: { type: Number, required: true, default: 40 },
    defaultInstructions: { type: String, required: true, default: '1. All questions are compulsory.\n2. Please write your name and roll number clearly.' },
    schoolLogo: { type: String, required: false },
  },
  { timestamps: true }
);

export const Profile = mongoose.model<IProfileDocument>('Profile', ProfileSchema);
export default Profile;
