export type QuestionType = 'mcq' | 'short-answer' | 'long-answer' | 'case-based' | 'mixed';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type JobStatus = 'queued' | 'processing' | 'generating' | 'completed' | 'failed';

export interface IQuestion {
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  options?: string[]; // Optional multiple choice options
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IQuestionPaper {
  title: string;
  subject: string;
  totalMarks: number;
  duration: string;
  sections: ISection[];
  answerKey?: { questionIndex: number; answer: string }[];
}

export interface IAssignment {
  _id?: string;
  groupId?: string;
  title: string;
  subject: string;
  dueDate: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  numQuestions: number;
  marksPerQuestion: number;
  additionalInstructions?: string;
  fileContent?: string;
  status: JobStatus;
  progress: number;
  result?: IQuestionPaper;
  error?: string;
  jobId?: string;
  fileName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAssignmentForm {
  groupId?: string;
  title: string;
  subject: string;
  dueDate: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  numQuestions: number;
  marksPerQuestion: number;
  additionalInstructions?: string;
  fileBase64?: string;
  fileName?: string;
}
