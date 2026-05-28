import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup {
  name: string;
  code: string;
  subject: string;
  grade: string;
  studentCount: number;
  assignmentsCount: number;
  avgScore: number;
  color: {
    bg: string;
    text: string;
    border: string;
    dot: string;
    badge: string;
  };
  lastActive: string;
  students: string[];
}

export interface IGroupDocument extends IGroup, Document {}

const GroupSchema = new Schema<IGroupDocument>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    studentCount: { type: Number, required: true, default: 0 },
    assignmentsCount: { type: Number, required: true, default: 0 },
    avgScore: { type: Number, required: true, default: 0 },
    color: {
      bg: { type: String, required: true },
      text: { type: String, required: true },
      border: { type: String, required: true },
      dot: { type: String, required: true },
      badge: { type: String, required: true },
    },
    lastActive: { type: String, required: true },
    students: [{ type: String }],
  },
  { timestamps: true }
);

export const Group = mongoose.model<IGroupDocument>('Group', GroupSchema);
export default Group;
