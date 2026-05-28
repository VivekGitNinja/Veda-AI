import { create } from 'zustand';
import { IAssignmentForm, IAssignment, IQuestionPaper, JobStatus } from '@vedaai/shared';

export interface ProfileState {
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

interface AssignmentState {
  form: IAssignmentForm;
  validationErrors: Record<string, string>;
  isGenerating: boolean;
  generationStatus: JobStatus | 'idle';
  progress: number;
  wsStatus: 'disconnected' | 'connecting' | 'connected';
  activeAssignment: IAssignment | null;
  assignmentResult: IQuestionPaper | null;
  errorMessage: string | null;
  assignmentsList: IAssignment[];
  profile: ProfileState;
  libraryItems: {
    id: string;
    name: string;
    itemsCount: number;
    subject: string;
    type: string;
    lastUpdated: string;
    description: string;
  }[];

  groupsList: any[];
  fetchGroups: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  updateForm: (fields: Partial<IAssignmentForm>) => void;
  setForm: (form: IAssignmentForm) => void;
  resetForm: () => void;
  validateForm: () => boolean;
  createAssignment: () => Promise<string | null>;
  fetchAssignments: () => Promise<IAssignment[]>;
  fetchAssignment: (id: string) => Promise<IAssignment | null>;
  fetchResult: (id: string) => Promise<IQuestionPaper | null>;
  regenerateAssignment: (id: string) => Promise<string | null>;
  deleteAssignment: (id: string) => Promise<boolean>;
  connectWebSocket: (assignmentId: string, onComplete?: (result: IQuestionPaper) => void) => void;
  disconnectWebSocket: () => void;
  updateProfile: (fields: Partial<ProfileState>) => Promise<void>;
  fetchProfile: () => Promise<void>;
  addLibraryItem: (item: { name: string; itemsCount: number; subject: string; type: string; description: string }) => void;
  deleteLibraryItem: (id: string) => void;
  lastCheckedCounts: Record<string, number>;
  markSectionAsChecked: (sectionId: string, count: number) => void;
  notifications: { id: number; text: string; time: string; read: boolean }[];
  markNotificationAsRead: (id: number) => void;
  markAllNotificationsAsRead: () => void;
}

const initialProfile: ProfileState = {
  schoolName: 'Delhi Public School',
  schoolBranch: 'Bokaro Steel City',
  teacherName: 'Lakshya K.',
  teacherEmail: 'lakshya@dpsbokaro.edu',
  academicSession: '2026-2027',
  affiliationBoard: 'CBSE',
  aiEngine: 'mock',
  pdfFormatting: true,
  defaultDuration: '1 Hour',
  defaultPassingMarks: 40,
  defaultInstructions: '1. All questions are compulsory.\n2. Please write your name and roll number clearly.',
  schoolLogo: '',
};

const initialForm: IAssignmentForm = {
  groupId: '',
  title: '',
  subject: '',
  dueDate: '',
  difficulty: 'medium',
  questionType: 'mcq',
  numQuestions: 5,
  marksPerQuestion: 2,
  additionalInstructions: '',
  fileBase64: '',
  fileName: '',
};

const getUrls = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';
  return { API_URL, WS_URL };
};

let ws: WebSocket | null = null;

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
  form: initialForm,
  validationErrors: {},
  isGenerating: false,
  generationStatus: 'idle',
  progress: 0,
  wsStatus: 'disconnected',
  activeAssignment: null,
  assignmentResult: null,
  errorMessage: null,
  assignmentsList: [],
  profile: initialProfile,
  groupsList: [],
  searchQuery: '',
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  libraryItems: [
    { id: 'lib-1', name: 'Physics Mechanics Bank', itemsCount: 120, subject: 'Physics', type: 'Question Bank', lastUpdated: '2026-05-24', description: 'Comprehensive question set covering Newton laws, kinematics, and rotational dynamics.' },
    { id: 'lib-2', name: 'Intro to Python Quiz Templates', itemsCount: 45, subject: 'Computer Science', type: 'Quiz Template', lastUpdated: '2026-05-20', description: 'Standard quizzes covering basic syntax, loops, and data structures.' },
    { id: 'lib-3', name: 'Algebra Final Exam Drafts', itemsCount: 30, subject: 'Mathematics', type: 'Exam Draft', lastUpdated: '2026-05-18', description: 'Curated drafts for Advanced Calculus and Linear Algebra term examinations.' },
    { id: 'lib-4', name: 'Organic Chemistry Reference Bank', itemsCount: 80, subject: 'Chemistry', type: 'Reference Bank', lastUpdated: '2026-05-15', description: 'Syllabus-aligned repository of chemical structures, reactions, and mechanisms.' },
    { id: 'lib-5', name: 'Biology Genetics Quiz Outline', itemsCount: 25, subject: 'Biology', type: 'Quiz Template', lastUpdated: '2026-05-10', description: 'Ready-to-use genetics and cell division multiple-choice questionnaires.' }
  ],

  updateForm: (fields) => set((state) => ({ form: { ...state.form, ...fields } })),
  setForm: (form) => set({ form }),
  resetForm: () => set({ form: initialForm, validationErrors: {} }),

  addLibraryItem: (item) => {
    const newItem = {
      ...item,
      id: `lib-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    set((state) => ({ libraryItems: [newItem, ...state.libraryItems] }));
  },

  deleteLibraryItem: (id) => {
    set((state) => ({ libraryItems: state.libraryItems.filter((x) => x.id !== id) }));
  },
  fetchProfile: async () => {
    const { API_URL } = getUrls();
    try {
      const response = await fetch(`${API_URL}/profile`);
      if (response.ok) {
        const data = await response.json();
        set({ profile: data });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  },

  fetchGroups: async () => {
    const { API_URL } = getUrls();
    try {
      const response = await fetch(`${API_URL}/groups`);
      if (response.ok) {
        const data = await response.json();
        set({ groupsList: data });
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  },

  updateProfile: async (fields) => {
    const { API_URL } = getUrls();
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (response.ok) {
        const data = await response.json();
        set({ profile: data });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  },

  validateForm: () => {
    const { form } = get();
    const errors: Record<string, string> = {};

    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.subject.trim()) errors.subject = 'Subject or Topic is required';
    if (!form.dueDate) errors.dueDate = 'Due date is required';
    if (!form.difficulty) errors.difficulty = 'Difficulty is required';
    if (!form.questionType) errors.questionType = 'Question type is required';
    
    if (!form.numQuestions || form.numQuestions <= 0) {
      errors.numQuestions = 'Questions must be at least 1';
    }
    
    if (!form.marksPerQuestion || form.marksPerQuestion <= 0) {
      errors.marksPerQuestion = 'Marks must be at least 1';
    }

    set({ validationErrors: errors });
    return Object.keys(errors).length === 0;
  },

  createAssignment: async () => {
    if (!get().validateForm()) return null;

    set({ isGenerating: true, errorMessage: null });
    const { API_URL } = getUrls();
    
    try {
      const response = await fetch(`${API_URL}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(get().form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate assignment creation');
      }

      set({ isGenerating: true, generationStatus: 'queued', progress: 0 });
      return data.assignmentId;
    } catch (err: any) {
      set({ isGenerating: false, errorMessage: err.message });
      return null;
    }
  },

  fetchAssignments: async () => {
    set({ errorMessage: null });
    const { API_URL } = getUrls();
    try {
      const response = await fetch(`${API_URL}/assignments`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch assignments list');
      set({ assignmentsList: data.assignments || [] });
      return data.assignments || [];
    } catch (err: any) {
      set({ errorMessage: err.message });
      return [];
    }
  },

  fetchAssignment: async (id) => {
    set({ errorMessage: null });
    const { API_URL } = getUrls();

    try {
      const response = await fetch(`${API_URL}/assignments/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch assignment details');

      const assignment = data.assignment as IAssignment;
      set({
        activeAssignment: assignment,
        generationStatus: assignment.status,
        progress: assignment.progress,
        assignmentResult: assignment.result || null,
      });
      return assignment;
    } catch (err: any) {
      set({ errorMessage: err.message });
      return null;
    }
  },

  fetchResult: async (id) => {
    set({ errorMessage: null });
    const { API_URL } = getUrls();

    try {
      const response = await fetch(`${API_URL}/results/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch assignment results');

      set({ assignmentResult: data.result });
      return data.result;
    } catch (err: any) {
      set({ errorMessage: err.message });
      return null;
    }
  },

  regenerateAssignment: async (id) => {
    set({ isGenerating: true, errorMessage: null, progress: 0, generationStatus: 'queued' });
    const { API_URL } = getUrls();

    try {
      const response = await fetch(`${API_URL}/assignments/${id}/regenerate`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to regenerate assignment');
      return data.assignmentId;
    } catch (err: any) {
      set({ errorMessage: err.message, isGenerating: false });
      return null;
    }
  },

  deleteAssignment: async (id) => {
    set({ errorMessage: null });
    const { API_URL } = getUrls();
    try {
      const response = await fetch(`${API_URL}/assignments/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete assignment');
      
      const list = get().assignmentsList.filter(a => a._id !== id);
      set({ assignmentsList: list });
      return true;
    } catch (err: any) {
      set({ errorMessage: err.message });
      return false;
    }
  },

  connectWebSocket: (assignmentId, onComplete) => {
    get().disconnectWebSocket();
    set({ wsStatus: 'connecting' });
    const { WS_URL } = getUrls();

    try {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        set({ wsStatus: 'connected' });
        ws?.send(JSON.stringify({ type: 'subscribe', assignmentId }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'progress' && message.assignmentId === assignmentId) {
            set({
              generationStatus: message.status as JobStatus,
              progress: message.progress,
            });

            if (message.status === 'completed' && message.result) {
              set({
                assignmentResult: message.result,
                isGenerating: false,
              });
              if (onComplete) onComplete(message.result);
            } else if (message.status === 'failed') {
              set({
                errorMessage: message.error || 'Failed to generate assessment',
                isGenerating: false,
              });
            }
          }
        } catch (err) {
          console.error('Error parsing WS message:', err);
        }
      };

      ws.onclose = () => {
        set({ wsStatus: 'disconnected' });
      };

      ws.onerror = (err) => {
        console.error('WebSocket client error:', err);
        set({ wsStatus: 'disconnected' });
      };
    } catch (err: any) {
      console.error('Failed to create WebSocket connection:', err);
      set({ wsStatus: 'disconnected' });
    }
  },

  disconnectWebSocket: () => {
    if (ws) {
      try {
        ws.close();
      } catch (err) {
        console.error('Error closing WebSocket:', err);
      }
      ws = null;
    }
    set({ wsStatus: 'disconnected' });
  },

  lastCheckedCounts: {},
  markSectionAsChecked: (sectionId, count) => {
    set((state) => ({
      lastCheckedCounts: {
        ...state.lastCheckedCounts,
        [sectionId]: count,
      },
    }));
  },

  notifications: [
    { id: 1, text: '🎓 Quiz "Final Board Biology Exam" generated successfully!', time: '2m ago', read: false },
    { id: 2, text: '📋 New assignment draft created', time: '10m ago', read: false },
    { id: 3, text: '✨ Google Gemini API connected', time: '1h ago', read: false }
  ],
  markNotificationAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },
  markAllNotificationsAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },
}));
