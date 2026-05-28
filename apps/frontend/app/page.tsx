'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAssignmentStore } from '../store/useAssignmentStore';
import Toast from '../components/Toast';
import MobileAppLayout from '../components/layout/MobileAppLayout';
import {
  Plus,
  Calendar,
  Sparkles,
  X,
  PlusCircle,
  Trash2,
  MoreVertical,
  Filter,
  Search,
  ChevronLeft,
  ChevronDown,
  CalendarDays,
  FileCheck,
  Mic,
  UploadCloud,
  ChevronRight,
  User,
  Users,
  Settings as SettingsIcon,
  HelpCircle,
  FileText,
  Sliders,
  BookOpen,
  Clock,
  Tag,
  FolderOpen
} from 'lucide-react';
import { Difficulty, QuestionType, IAssignment } from '@vedaai/shared';

interface QuestionRow {
  typeString: string;
  numQuestions: number;
  marks: number;
}

const dropdownOptions = [
  'Multiple Choice Questions',
  'Short Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems'
];

// Map friendly dropdown options to backend schema QuestionTypes
const mapFriendlyToSchema = (typeStr: string): QuestionType => {
  switch (typeStr) {
    case 'Multiple Choice Questions':
      return 'mcq';
    case 'Short Questions':
      return 'short-answer';
    case 'Diagram/Graph-Based Questions':
      return 'case-based';
    case 'Numerical Problems':
      return 'long-answer';
    default:
      return 'mcq';
  }
};

const staticMockAssignments: IAssignment[] = [
  {
    _id: 'mock-1',
    title: 'Quiz on Electricity',
    subject: 'Physics',
    difficulty: 'medium',
    questionType: 'mcq',
    marksPerQuestion: 3,
    progress: 100,
    dueDate: '21-06-2025',
    createdAt: '2025-06-20T10:00:00.000Z',
    status: 'completed',
    numQuestions: 15,
    result: {
      title: 'DELHI PUBLIC SCHOOL, SECTOR-4, BOKARO',
      subject: 'Science (Physics - Electricity)',
      totalMarks: 45,
      duration: '1 Hour 30 Minutes',
      sections: []
    }
  },
  {
    _id: 'mock-2',
    title: 'Cell Structure and Function',
    subject: 'Biology',
    difficulty: 'easy',
    questionType: 'mcq',
    marksPerQuestion: 2,
    progress: 100,
    dueDate: '22-06-2025',
    createdAt: '2025-06-20T11:00:00.000Z',
    status: 'completed',
    numQuestions: 10,
    result: {
      title: 'DELHI PUBLIC SCHOOL, SECTOR-4, BOKARO',
      subject: 'Science (Biology)',
      totalMarks: 20,
      duration: '1 Hour 30 Minutes',
      sections: []
    }
  },
  {
    _id: 'mock-3',
    title: 'Chemical Reactions and Equations',
    subject: 'Chemistry',
    difficulty: 'hard',
    questionType: 'mcq',
    marksPerQuestion: 2.5,
    progress: 100,
    dueDate: '25-06-2025',
    createdAt: '2025-06-20T12:00:00.000Z',
    status: 'completed',
    numQuestions: 20,
    result: {
      title: 'DELHI PUBLIC SCHOOL, SECTOR-4, BOKARO',
      subject: 'Science (Chemistry)',
      totalMarks: 50,
      duration: '1 Hour 30 Minutes',
      sections: []
    }
  },
  {
    _id: 'mock-4',
    title: 'Light - Reflection and Refraction',
    subject: 'Physics',
    difficulty: 'medium',
    questionType: 'mcq',
    marksPerQuestion: 2.5,
    progress: 100,
    dueDate: '28-06-2025',
    createdAt: '2025-06-21T09:00:00.000Z',
    status: 'completed',
    numQuestions: 12,
    result: {
      title: 'DELHI PUBLIC SCHOOL, SECTOR-4, BOKARO',
      subject: 'Science (Physics)',
      totalMarks: 30,
      duration: '1 Hour 30 Minutes',
      sections: []
    }
  },
  {
    _id: 'mock-5',
    title: 'Acid, Bases and Salts',
    subject: 'Chemistry',
    difficulty: 'easy',
    questionType: 'mcq',
    marksPerQuestion: 2,
    progress: 100,
    dueDate: '30-06-2025',
    createdAt: '2025-06-22T08:00:00.000Z',
    status: 'completed',
    numQuestions: 15,
    result: {
      title: 'DELHI PUBLIC SCHOOL, SECTOR-4, BOKARO',
      subject: 'Science (Chemistry)',
      totalMarks: 30,
      duration: '1 Hour 30 Minutes',
      sections: []
    }
  },
  {
    _id: 'mock-6',
    title: 'Control and Coordination',
    subject: 'Biology',
    difficulty: 'medium',
    questionType: 'mcq',
    marksPerQuestion: 2.5,
    progress: 100,
    dueDate: '02-07-2025',
    createdAt: '2025-06-22T14:00:00.000Z',
    status: 'completed',
    numQuestions: 10,
    result: {
      title: 'DELHI PUBLIC SCHOOL, SECTOR-4, BOKARO',
      subject: 'Science (Biology)',
      totalMarks: 25,
      duration: '1 Hour 30 Minutes',
      sections: []
    }
  },
  {
    _id: 'mock-7',
    title: 'Carbon and its Compounds',
    subject: 'Chemistry',
    difficulty: 'hard',
    questionType: 'mcq',
    marksPerQuestion: 2.2,
    progress: 100,
    dueDate: '05-07-2025',
    createdAt: '2025-06-23T10:00:00.000Z',
    status: 'completed',
    numQuestions: 18,
    result: {
      title: 'DELHI PUBLIC SCHOOL, SECTOR-4, BOKARO',
      subject: 'Science (Chemistry)',
      totalMarks: 40,
      duration: '1 Hour 30 Minutes',
      sections: []
    }
  },
  {
    _id: 'mock-8',
    title: 'Our Environment Quiz',
    subject: 'Biology',
    difficulty: 'easy',
    questionType: 'mcq',
    marksPerQuestion: 2,
    progress: 100,
    dueDate: '08-07-2025',
    createdAt: '2025-06-24T09:00:00.000Z',
    status: 'completed',
    numQuestions: 8,
    result: {
      title: 'DELHI PUBLIC SCHOOL, SECTOR-4, BOKARO',
      subject: 'Science (Biology)',
      totalMarks: 16,
      duration: '1 Hour 30 Minutes',
      sections: []
    }
  },
  {
    _id: 'mock-9',
    title: 'Periodic Classification',
    subject: 'Chemistry',
    difficulty: 'medium',
    questionType: 'mcq',
    marksPerQuestion: 2,
    progress: 100,
    dueDate: '10-07-2025',
    createdAt: '2025-06-24T15:00:00.000Z',
    status: 'completed',
    numQuestions: 15,
    result: {
      title: 'DELHI PUBLIC SCHOOL, SECTOR-4, BOKARO',
      subject: 'Science (Chemistry)',
      totalMarks: 30,
      duration: '1 Hour 30 Minutes',
      sections: []
    }
  },
  {
    _id: 'mock-10',
    title: 'Sources of Energy Exam',
    subject: 'Physics',
    difficulty: 'medium',
    questionType: 'mcq',
    marksPerQuestion: 2.5,
    progress: 100,
    dueDate: '12-07-2025',
    createdAt: '2025-06-25T11:00:00.000Z',
    status: 'completed',
    numQuestions: 14,
    result: {
      title: 'DELHI PUBLIC SCHOOL, SECTOR-4, BOKARO',
      subject: 'Science (Physics)',
      totalMarks: 35,
      duration: '1 Hour 30 Minutes',
      sections: []
    }
  }
];

const formatDate = (dateInput: any) => {
  if (!dateInput) return '20-06-2025';
  try {
    if (typeof dateInput === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(dateInput)) {
      return dateInput;
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '20-06-2025';
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}-${month}-${year}`;
  } catch (e) {
    return '20-06-2025';
  }
};

const mockGroups: any[] = [];

const subjectColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'Physics': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  'Computer Science': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'Mathematics': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  'Chemistry': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  'Biology': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
};
const getSubjectColor = (subject: string) => subjectColors[subject] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' };

function DashboardPageContent() {
  const router = useRouter();
  const {
    form,
    assignmentsList,
    validationErrors,
    isGenerating,
    errorMessage,
    updateForm,
    createAssignment,
    fetchAssignments,
    deleteAssignment,
    resetForm,
    profile,
    updateProfile,
    fetchProfile,
    wsStatus,
    libraryItems,
    addLibraryItem,
    deleteLibraryItem,
    groupsList,
    fetchGroups,
    searchQuery,
    setSearchQuery
  } = useAssignmentStore();

  const searchParams = useSearchParams();
  const viewParam = searchParams ? searchParams.get('view') : null;
  const actionParam = searchParams ? searchParams.get('action') : null;

  const view = (viewParam === 'create' || viewParam === 'groups' || viewParam === 'library' || viewParam === 'settings')
    ? (viewParam as 'dashboard' | 'create' | 'groups' | 'library' | 'settings')
    : 'dashboard';

  const setView = (newView: 'dashboard' | 'create' | 'groups' | 'library' | 'settings') => {
    setSearchQuery('');
    router.push(`/?view=${newView}`);
  };

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Settings local states
  const [activeSettingsTab, setActiveSettingsTab] = useState<'profile' | 'ai' | 'preferences'>('profile');
  const [settingsSchoolName, setSettingsSchoolName] = useState('');
  const [settingsSchoolBranch, setSettingsSchoolBranch] = useState('');
  const [settingsTeacherName, setSettingsTeacherName] = useState('');
  const [settingsTeacherEmail, setSettingsTeacherEmail] = useState('');
  const [settingsSession, setSettingsSession] = useState('');
  const [settingsBoard, setSettingsBoard] = useState('');
  const [settingsAiEngine, setSettingsAiEngine] = useState<'gemini' | 'mock'>('mock');
  const [settingsPdfFormatting, setSettingsPdfFormatting] = useState(true);
  const [settingsDuration, setSettingsDuration] = useState('1 Hour');
  const [settingsPassingMarks, setSettingsPassingMarks] = useState(40);
  const [settingsInstructions, setSettingsInstructions] = useState('');
  const [settingsSchoolLogo, setSettingsSchoolLogo] = useState('');

  // Local state for mock integrations
  const skipReset = React.useRef(false);
  const [deletedMockIds, setDeletedMockIds] = useState<string[]>([]);
  const [displayAssignments, setDisplayAssignments] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [selectedLibrary, setSelectedLibrary] = useState<any | null>(null);
  const [groupTab, setGroupTab] = useState<'roster' | 'assignments'>('roster');

  // Question Structure rows matching Figma
  const [questionRows, setQuestionRows] = useState<QuestionRow[]>([
    { typeString: 'Multiple Choice Questions', numQuestions: 4, marks: 1 },
    { typeString: 'Short Questions', numQuestions: 3, marks: 2 },
    { typeString: 'Diagram/Graph-Based Questions', numQuestions: 5, marks: 5 }
  ]);

  // Sync settings when global profile updates
  useEffect(() => {
    if (profile) {
      setSettingsSchoolName(profile.schoolName);
      setSettingsSchoolBranch(profile.schoolBranch);
      setSettingsTeacherName(profile.teacherName);
      setSettingsTeacherEmail(profile.teacherEmail);
      setSettingsSession(profile.academicSession);
      setSettingsBoard(profile.affiliationBoard);
      setSettingsAiEngine(profile.aiEngine);
      setSettingsPdfFormatting(profile.pdfFormatting);
      setSettingsDuration(profile.defaultDuration || '1 Hour');
      setSettingsPassingMarks(profile.defaultPassingMarks || 40);
      setSettingsInstructions(profile.defaultInstructions || '');
      setSettingsSchoolLogo(profile.schoolLogo || '');
    }
  }, [profile]);

  const handleSaveProfile = () => {
    updateProfile({
      schoolName: settingsSchoolName,
      schoolBranch: settingsSchoolBranch,
      teacherName: settingsTeacherName,
      teacherEmail: settingsTeacherEmail,
      academicSession: settingsSession,
      affiliationBoard: settingsBoard,
      schoolLogo: settingsSchoolLogo,
    });
    setToast({ message: 'Profile settings successfully updated!', type: 'success' });
  };

  const handleSaveEngine = () => {
    updateProfile({
      aiEngine: settingsAiEngine,
      pdfFormatting: settingsPdfFormatting,
    });
    setToast({ message: 'AI Engine settings successfully updated!', type: 'success' });
  };

  const handleSavePreferences = () => {
    updateProfile({
      defaultDuration: settingsDuration,
      defaultPassingMarks: Number(settingsPassingMarks),
      defaultInstructions: settingsInstructions,
    });
    setToast({ message: 'Exam preferences successfully updated!', type: 'success' });
  };

  // Fetch assignments, profile & groups on mount
  useEffect(() => {
    fetchAssignments();
    fetchProfile();
    fetchGroups();
  }, [fetchAssignments, fetchProfile, fetchGroups]);

  // Handle side-effects when navigating to create
  useEffect(() => {
    if (view === 'create' || actionParam === 'create') {
      if (skipReset.current) {
        skipReset.current = false;
        return;
      }
      resetForm();
      setQuestionRows([
        { typeString: 'Multiple Choice Questions', numQuestions: 4, marks: 1 },
        { typeString: 'Short Questions', numQuestions: 3, marks: 2 },
        { typeString: 'Diagram/Graph-Based Questions', numQuestions: 5, marks: 5 }
      ]);
    }
  }, [view, actionParam, resetForm]);

  // Set real database assignments
  useEffect(() => {
    const realList = assignmentsList || [];
    const pureRealList = realList.filter(a => !a._id?.startsWith('mock-'));
    setDisplayAssignments(pureRealList);
  }, [assignmentsList]);

  // File context upload helper
  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setToast({ message: 'File size exceeds the 10MB limit.', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateForm({
        fileBase64: reader.result as string,
        fileName: file.name
      });
      setToast({ message: `File "${file.name}" uploaded successfully.`, type: 'success' });
    };
    reader.onerror = () => {
      setToast({ message: 'Failed to read file.', type: 'error' });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFileChange(file);
  };

  // Add/Delete table rows
  const addQuestionRow = () => {
    setQuestionRows([...questionRows, { typeString: 'Multiple Choice Questions', numQuestions: 5, marks: 2 }]);
  };

  const removeQuestionRow = (index: number) => {
    if (questionRows.length === 1) return;
    const newRows = [...questionRows];
    newRows.splice(index, 1);
    setQuestionRows(newRows);
  };

  const updateQuestionRow = (index: number, fields: Partial<QuestionRow>) => {
    const newRows = [...questionRows];
    newRows[index] = { ...newRows[index], ...fields };
    setQuestionRows(newRows);
  };

  // Stepper Submit action
  const handleGenerate = async () => {
    const totalQ = questionRows.reduce((sum, r) => sum + r.numQuestions, 0);
    const totalMarks = questionRows.reduce((sum, r) => sum + (r.numQuestions * r.marks), 0);
    const avgMarks = Math.round(totalMarks / totalQ) || 1;

    let qType: QuestionType = 'mixed';
    if (questionRows.length === 1) {
      qType = mapFriendlyToSchema(questionRows[0].typeString);
    }

    // Question Structure layout strings embedded inside additionalInstructions
    const structureTags = questionRows.map(
      (r) => `${r.numQuestions} ${r.typeString} (${r.marks} marks each)`
    ).join(', ');
    const enhancedInstructions = `[Question Structure: ${structureTags}] ${form.additionalInstructions || ''}`;

    updateForm({
      numQuestions: totalQ,
      marksPerQuestion: avgMarks,
      questionType: qType,
      additionalInstructions: enhancedInstructions
    });

    const assignmentId = await createAssignment();
    if (assignmentId) {
      setToast({ message: 'Assignment creation initiated!', type: 'success' });
      setView('dashboard');
      resetForm();
      setQuestionRows([
        { typeString: 'Multiple Choice Questions', numQuestions: 4, marks: 1 },
        { typeString: 'Short Questions', numQuestions: 3, marks: 2 },
        { typeString: 'Diagram/Graph-Based Questions', numQuestions: 5, marks: 5 }
      ]);
      setTimeout(() => {
        router.push(`/generate/${assignmentId}`);
      }, 500);
    } else {
      const freshErrorMessage = useAssignmentStore.getState().errorMessage;
      if (freshErrorMessage) {
        setToast({ message: freshErrorMessage, type: 'error' });
      } else {
        setToast({ message: 'Validation failed. Please correct form fields.', type: 'error' });
      }
    }
  };

  // Delete card handler
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    if (id.startsWith('mock-')) {
      setDeletedMockIds(prev => [...prev, id]);
      setToast({ message: 'Assignment deleted successfully.', type: 'success' });
      return;
    }
    const success = await deleteAssignment(id);
    if (success) {
      setToast({ message: 'Assignment deleted successfully.', type: 'success' });
    } else {
      const freshErrorMessage = useAssignmentStore.getState().errorMessage;
      setToast({ message: freshErrorMessage || 'Failed to delete assignment.', type: 'error' });
    }
  };

  // Calculations for live totals inside white form card
  const totalQuestionsCount = questionRows.reduce((sum, r) => sum + r.numQuestions, 0);
  const totalMarksSum = questionRows.reduce((sum, r) => sum + (r.numQuestions * r.marks), 0);

  // Search filter
  const filteredAssignments = displayAssignments.filter((a) => {
    const query = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(query) ||
      a.subject.toLowerCase().includes(query) ||
      a.difficulty.toLowerCase().includes(query)
    );
  });

  const activeSectionMap = {
    dashboard: 'assignments',
    create: 'toolkit',
    groups: 'groups',
    library: 'library',
    settings: 'settings',
  };
  const activeSection = activeSectionMap[view] as any;

  return (
    <MobileAppLayout activeSection={activeSection}>
      {view === 'dashboard' ? (
        // ================= DASHBOARD LISTINGS =================
        <div className="space-y-4 flex flex-col relative bg-[#000000] xl:bg-transparent text-white xl:text-slate-800">
          
          {/* Header block with back icon & Title */}
          <div className="relative flex xl:hidden items-center justify-center select-none h-8 w-full shrink-0">
            <button
              onClick={() => router.push('/')}
              className="absolute left-0 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#10B981]" />
              <h1 className="text-sm font-black tracking-tight text-white uppercase">Assignments</h1>
            </div>
          </div>

          {displayAssignments.length === 0 ? (
            /* Empty assignments state screen */
            <div className="flex-1 flex flex-col items-center justify-center text-center select-none py-12 px-4 bg-[#000000] xl:bg-transparent">
              {/* Custom document with sparkle icon illustration */}
              <div className="relative mb-6">
                <div className="bg-white/5 h-28 w-28 rounded-full flex items-center justify-center border border-white/10 relative">
                  <div className="bg-[#1C1C1E] border border-white/15 rounded-xl p-3.5 shadow-xl w-14 h-18 flex flex-col justify-between relative z-10">
                    <div className="space-y-1">
                      <div className="h-0.5 w-8 bg-slate-500 rounded" />
                      <div className="h-0.5 w-6 bg-slate-600 rounded" />
                      <div className="h-0.5 w-7 bg-slate-600 rounded" />
                    </div>
                    <div className="bg-[#FF6B35]/15 border border-[#FF6B35]/35 rounded-full h-6 w-6 flex items-center justify-center mx-auto text-[#FF6B35] font-black text-[10px]">
                      +
                    </div>
                  </div>
                  <span className="absolute top-4 left-4 text-xs animate-pulse">✨</span>
                  <span className="absolute bottom-4 right-4 text-xs animate-pulse">✨</span>
                </div>
              </div>

              <h2 className="text-sm font-extrabold text-white xl:text-slate-800">No assignments yet</h2>
              <p className="text-slate-400 xl:text-slate-500 text-[10px] mt-2 max-w-[280px] font-semibold leading-relaxed">
                Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
              </p>
              
              <button
                onClick={() => {
                  resetForm();
                  setView('create');
                }}
                className="mt-6 flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 font-extrabold text-[11px] py-2.5 px-6 rounded-full transition-all cursor-pointer shadow-sm active:scale-98"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3] text-slate-900" />
                <span>Create Your First Assignment</span>
              </button>
            </div>
          ) : (
            /* Cards lists dashboard */
            <div className="space-y-4 flex flex-col pb-8">
              {/* Search and filter row */}
              <div className="flex gap-2 items-center shrink-0">
                <div className="flex items-center bg-white rounded-2xl p-1 shadow-sm border border-slate-200 w-full">
                  <button className="flex items-center gap-1 text-slate-800 text-[10px] font-black px-3 py-1.5 hover:bg-slate-50 rounded-xl transition-colors shrink-0">
                    <Filter className="h-3.5 w-3.5 text-slate-500" />
                    <span>Filter</span>
                  </button>
                  <div className="h-4 w-px bg-slate-200 mx-1" />
                  <div className="relative flex-grow flex items-center pl-2">
                    <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search Name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent pl-7 pr-3 py-1 text-[10px] text-slate-800 focus:outline-none placeholder-slate-400 font-extrabold"
                    />
                  </div>
                </div>
              </div>

              {/* Stacked Cards Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6 space-y-0">
                {filteredAssignments.map((assignment) => {
                  const showMenu = activeMenuId === assignment._id;

                  const statusStyle = (({
                    completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                    queued: 'bg-amber-50 text-amber-600 border-amber-100',
                    processing: 'bg-blue-50 text-blue-600 border-blue-100',
                    generating: 'bg-violet-50 text-violet-600 border-violet-100',
                    failed: 'bg-rose-50 text-rose-600 border-rose-100',
                  } as Record<string, string>)[assignment.status]) || 'bg-slate-50 text-slate-500 border-slate-100';

                  return (
                    <div
                      key={assignment._id}
                      onClick={() => {
                        if (assignment.status === 'completed') {
                          router.push(`/paper/${assignment._id}`);
                        } else {
                          router.push(`/generate/${assignment._id}`);
                        }
                      }}
                      className="bg-[#F4F4F5] border border-slate-200 rounded-[24px] p-4.5 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col relative"
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-[8px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full border ${statusStyle}`}>
                          {assignment.status}
                        </span>

                        {/* Options Dots trigger */}
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setActiveMenuId(showMenu ? null : (assignment._id || null))}
                            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {showMenu && (
                            <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden py-0.5">
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  if (assignment.status === 'completed') {
                                    router.push(`/paper/${assignment._id}`);
                                  } else {
                                    router.push(`/generate/${assignment._id}`);
                                  }
                                }}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                              >
                                View Paper
                              </button>
                              <button
                                onClick={(e) => handleDelete(assignment._id!, e)}
                                className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <h3 className="font-extrabold text-[13px] text-[#0F172A] mt-3 inline-block border-b border-[#0F172A] pb-0.5 leading-tight">
                          {assignment.title}
                        </h3>
                      </div>

                      {/* Subject + meta pills */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="text-[8px] font-bold bg-white/60 text-slate-500 px-2 py-0.5 rounded-full">{assignment.subject}</span>
                        <span className="text-[8px] font-bold bg-white/60 text-slate-500 px-2 py-0.5 rounded-full capitalize">{assignment.difficulty}</span>
                        {assignment.result?.totalMarks ? (
                          <span className="text-[8px] font-bold bg-orange-50 text-[#FF6B35] border border-orange-100 px-2 py-0.5 rounded-full">{assignment.result.totalMarks} Marks</span>
                        ) : (
                          <span className="text-[8px] font-bold bg-white/60 text-slate-400 px-2 py-0.5 rounded-full">{assignment.numQuestions} Qs</span>
                        )}
                      </div>

                      {/* Date footer */}
                      <div className="flex justify-between items-center text-[8px] text-slate-400 font-extrabold border-t border-slate-200 pt-3 mt-3.5">
                        <span>Assigned on : {formatDate(assignment.createdAt)}</span>
                        <span>Due : {formatDate(assignment.dueDate)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Floating Action Plus Button bottom right */}
              <div className="sticky bottom-4 right-0 self-end z-20 mt-auto">
                <button
                  onClick={() => {
                    resetForm();
                    setView('create');
                  }}
                  className="h-12 w-12 rounded-full bg-[#FF6B35] hover:bg-orange-600 text-white shadow-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 hover:scale-105 border border-orange-500/10"
                >
                  <Plus className="h-6 w-6 text-white stroke-[2.5]" />
                </button>
              </div>

            </div>
          )}
        </div>
      ) : view === 'create' ? (
        // ================= CREATE WIZARD SCREEN =================
        <div className="space-y-4 flex flex-col select-none">
          
          {/* Header */}
          <div className="relative flex xl:hidden items-center justify-center select-none h-8 w-full">
            <button
              onClick={() => setView('dashboard')}
              className="absolute left-0 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#10B981]" />
              <h1 className="text-sm font-black tracking-tight text-white uppercase">Create Assignment</h1>
            </div>
          </div>

          {/* Stepper progress indicator */}
          <div className="w-full">
            <div className="h-1 bg-white/10 xl:bg-slate-200 rounded-full overflow-hidden flex">
              <div className="h-full w-[60%] bg-[#FF6B35] rounded-full" />
            </div>
          </div>

          {/* Content Card container with large rounded corners */}
          <div className="bg-[#F4F4F5] text-slate-800 rounded-[28px] p-5 shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column: Details & Upload */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-extrabold text-[#0F172A]">Assignment Details</h2>
                  <p className="text-[10px] text-slate-400 font-bold">Basic information about your assignment</p>
                </div>

                {/* Upload Box */}
                <div className="space-y-2">
                  {form.fileName ? (
                    <div className="flex items-center justify-between border border-slate-200 bg-white p-3 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-orange-50 border border-orange-100 p-2 rounded-lg text-[#FF6B35]">
                          <FileCheck className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-[#0F172A] truncate max-w-[150px]">{form.fileName}</span>
                          <span className="text-[8px] text-slate-400 font-bold">Reference content ready</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateForm({ fileBase64: '', fileName: '' })}
                        className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('wizard-file-input-mobile')?.click()}
                      className={`border border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                        dragActive 
                          ? 'border-[#FF6B35] bg-orange-50/20' 
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                    >
                      <input
                        id="wizard-file-input-mobile"
                        type="file"
                        accept=".txt,.pdf,.csv,.json,.md"
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files?.[0])}
                      />
                      <UploadCloud className="h-6 w-6 text-[#FF6B35] mx-auto mb-1" />
                      <p className="text-[10px] font-bold text-[#0F172A]">
                        Choose a file or drag & drop it here
                      </p>
                      <p className="text-[8px] text-slate-400 mt-0.5 font-bold">JPEG, PNG, upto 10MB</p>
                      <button
                        type="button"
                        className="mt-2 text-[8.5px] font-black bg-white hover:bg-slate-50 text-[#0F172A] py-1.5 px-4 rounded-full border border-slate-200 cursor-pointer shadow-sm"
                      >
                        Browse Files
                      </button>
                      <p className="text-[7.5px] text-slate-400 mt-2 font-bold">Upload images of your preferred document/image</p>
                    </div>
                  )}
                </div>

                {/* Inputs grid */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label htmlFor="w-title-m" className="text-[9px] font-bold text-slate-400 uppercase">Assignment Title *</label>
                    <input
                      id="w-title-m"
                      type="text"
                      placeholder="e.g. Science Test, Physics Quiz"
                      value={form.title}
                      onChange={(e) => updateForm({ title: e.target.value })}
                      className={`w-full bg-white border ${
                        validationErrors.title ? 'border-rose-400' : 'border-slate-200'
                      } rounded-xl px-3 py-2 text-[10px] text-slate-700 focus:outline-none font-semibold`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="w-subject-m" className="text-[9px] font-bold text-slate-400 uppercase">Subject / Topic *</label>
                    <input
                      id="w-subject-m"
                      type="text"
                      placeholder="e.g. Computer Science, Algebra"
                      value={form.subject}
                      onChange={(e) => updateForm({ subject: e.target.value })}
                      className={`w-full bg-white border ${
                        validationErrors.subject ? 'border-rose-400' : 'border-slate-200'
                      } rounded-xl px-3 py-2 text-[10px] text-slate-700 focus:outline-none font-semibold`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="w-group-m" className="text-[9px] font-bold text-slate-400 uppercase">Assign to Group (Optional)</label>
                    <div className="relative">
                      <select
                        id="w-group-m"
                        value={form.groupId || ''}
                        onChange={(e) => updateForm({ groupId: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 pr-8 py-2 text-[10px] text-slate-700 focus:outline-none font-semibold appearance-none"
                      >
                        <option value="">-- No Group Selected (Individual Assessment) --</option>
                        {groupsList.map((g) => (
                          <option key={g._id || g.id} value={g._id || g.id}>
                            {g.name} ({g.code})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Due Date & Difficulty */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="w-due-m" className="text-[9px] font-bold text-slate-400 uppercase">Due Date *</label>
                      <div className="relative">
                        <CalendarDays className="absolute right-3 top-2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input
                          id="w-due-m"
                          type="text"
                          placeholder="DD-MM-YYYY"
                          value={form.dueDate}
                          onChange={(e) => updateForm({ dueDate: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 pr-8 py-2 text-[10px] text-slate-700 focus:outline-none font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Difficulty</label>
                      <div className="grid grid-cols-3 gap-1 bg-white border border-slate-200 p-0.5 rounded-xl">
                        {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => {
                          const isSelected = form.difficulty === level;
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => updateForm({ difficulty: level })}
                              className={`rounded-lg py-1.5 text-[8px] font-black uppercase transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#FF6B35] text-white shadow-sm'
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              {level}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Question Setup */}
              <div className="space-y-4 md:border-l md:border-slate-200/80 md:pl-6">
                <div className="space-y-2 pt-0">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Question Types Configuration</span>
                  
                  <div className="space-y-2.5">
                    {questionRows.map((row, index) => (
                      <div key={index} className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col gap-3 relative shadow-sm text-slate-800">
                        
                        {/* Title Row with Select Dropdown & Close X */}
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <div className="relative flex items-center bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl px-2.5 py-1 cursor-pointer">
                            <select
                              value={row.typeString}
                              onChange={(e) => updateQuestionRow(index, { typeString: e.target.value })}
                              className="bg-transparent text-[10.5px] font-extrabold text-slate-800 focus:outline-none cursor-pointer pr-5 appearance-none"
                            >
                              {dropdownOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2 pointer-events-none" />
                          </div>
                          
                          {questionRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestionRow(index)}
                              className="h-6 w-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5 stroke-[2.5]" />
                            </button>
                          )}
                        </div>

                        {/* No. of Questions Row */}
                        <div className="flex items-center justify-between py-1">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">No. of Questions</span>
                          <div className="flex items-center gap-1.5 bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-full px-2.5 py-0.5 text-[#FF6B35]">
                            <button
                              type="button"
                              onClick={() => updateQuestionRow(index, { numQuestions: Math.max(1, row.numQuestions - 1) })}
                              className="w-5 h-5 rounded-full hover:bg-[#FF6B35]/25 flex items-center justify-center text-[11px] font-black transition-colors cursor-pointer select-none"
                            >
                              -
                            </button>
                            <span className="text-[10px] font-black px-1.5 min-w-[12px] text-center">{row.numQuestions}</span>
                            <button
                              type="button"
                              onClick={() => updateQuestionRow(index, { numQuestions: row.numQuestions + 1 })}
                              className="w-5 h-5 rounded-full hover:bg-[#FF6B35]/25 flex items-center justify-center text-[11px] font-black transition-colors cursor-pointer select-none"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Marks Row */}
                        <div className="flex items-center justify-between py-1">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Marks</span>
                          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-full px-2.5 py-0.5 text-slate-100">
                            <button
                              type="button"
                              onClick={() => updateQuestionRow(index, { marks: Math.max(1, row.marks - 1) })}
                              className="w-5 h-5 rounded-full hover:bg-slate-700 flex items-center justify-center text-[11px] font-black transition-colors cursor-pointer select-none"
                            >
                              -
                            </button>
                            <span className="text-[10px] font-black px-1.5 min-w-[12px] text-center">{row.marks}</span>
                            <button
                              type="button"
                              onClick={() => updateQuestionRow(index, { marks: row.marks + 1 })}
                              className="w-5 h-5 rounded-full hover:bg-slate-700 flex items-center justify-center text-[11px] font-black transition-colors cursor-pointer select-none"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={addQuestionRow}
                      className="flex items-center gap-2 text-[10px] font-black text-slate-800 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <div className="h-5.5 w-5.5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px]">
                        +
                      </div>
                      <span>Add Question Type</span>
                    </button>

                    <div className="text-right text-[9px] font-bold text-slate-500 space-y-0.5">
                      <p>Total Questions : {totalQuestionsCount}</p>
                      <p>Total Marks : {totalMarksSum}</p>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <label htmlFor="w-instructions-m" className="text-[9px] font-bold text-slate-400 uppercase">Additional Instructions</label>
                  <div className="relative bg-white border border-slate-200 rounded-xl focus-within:border-slate-300">
                    <textarea
                      id="w-instructions-m"
                      rows={3}
                      placeholder="e.g. Generate a question paper for 3 hour exam duration.."
                      value={form.additionalInstructions}
                      onChange={(e) => updateForm({ additionalInstructions: e.target.value })}
                      className="w-full bg-transparent px-3 py-2 text-[10px] text-slate-700 focus:outline-none font-semibold resize-none"
                    />
                  </div>
                </div>

              </div> {/* End of Right Column */}
            </div> {/* End of grid columns */}
          </div> {/* End of bg-[#F4F4F5] container */}

          {/* Stepper buttons */}
          <div className="flex justify-center items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setView('dashboard')}
              className="text-[10px] font-black border border-white/20 text-white bg-[#1C1C1E] hover:bg-white/5 py-2.5 px-6 rounded-full cursor-pointer transition-all active:scale-98"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="text-[10px] font-black bg-white text-[#09090B] hover:bg-slate-100 py-2.5 px-6 rounded-full shadow-lg cursor-pointer transition-all active:scale-98 disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Create →'}
            </button>
          </div>

        </div>
      ) : view === 'groups' ? (
        // ================= GROUPS SCREEN =================
        <div className="space-y-5 flex flex-col select-none">
          {/* Mobile header */}
          <div className="flex xl:hidden items-center gap-3">
            <button onClick={() => setView('dashboard')} className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0">
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <h1 className="text-lg font-black tracking-tight text-white">My Groups</h1>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3.5 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm">
              <Users className="h-3.5 w-3.5 text-blue-500" />
              <span>{groupsList.length} Groups</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3.5 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm">
              <BookOpen className="h-3.5 w-3.5 text-[#FF6B35]" />
              <span>{groupsList.reduce((s, g) => s + g.studentCount, 0)} Students</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3.5 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm">
              <FileText className="h-3.5 w-3.5 text-emerald-500" />
              <span>{groupsList.reduce((s, g) => s + g.assignmentsCount, 0)} Assignments</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search groups by name, subject or code..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35]/50 transition-all shadow-sm" />
          </div>

          {/* Group cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {groupsList.filter(g => {
              const q = searchQuery.toLowerCase();
              return g.name.toLowerCase().includes(q) || g.subject.toLowerCase().includes(q) || g.code.toLowerCase().includes(q);
            }).map((group) => (
              <div key={group._id || group.id} onClick={() => { setSelectedGroup(group); setGroupTab('roster'); }}
                className="group bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm hover:shadow-lg hover:border-[#FF6B35]/40 cursor-pointer transition-all duration-200 hover:-translate-y-1 active:scale-[0.98] relative overflow-hidden">
                {/* color strip */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${group.color.dot} opacity-60 group-hover:opacity-100 transition-opacity`} />
                {/* header row */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`h-10 w-10 rounded-xl ${group.color.bg} ${group.color.border} border flex items-center justify-center shrink-0`}>
                    <Users className={`h-5 w-5 ${group.color.text}`} />
                  </div>
                  <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full ${group.color.badge}`}>{group.code}</span>
                </div>
                <h3 className="font-extrabold text-[13px] text-slate-800 leading-snug mb-1">{group.name}</h3>
                <p className="text-[9px] text-slate-400 font-bold mb-3">{group.grade} • Last active: {group.lastActive}</p>
                {/* avatar stack */}
                <div className="flex items-center gap-1 mb-3">
                  {group.students.slice(0, 5).map((s: string, i: number) => (
                    <div key={i} className={`h-6 w-6 rounded-full ${group.color.bg} ${group.color.border} border-2 border-white flex items-center justify-center text-[8px] font-black ${group.color.text} -ml-1 first:ml-0`}>
                      {s.charAt(0)}
                    </div>
                  ))}
                  {group.studentCount > 5 && <span className="text-[8px] text-slate-400 font-bold ml-1">+{group.studentCount - 5}</span>}
                </div>
                {/* footer stats */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold">
                    <Users className="h-3 w-3" />
                    <span>{group.studentCount} students</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold">
                    <FileText className="h-3 w-3" />
                    <span>{group.assignmentsCount} tests</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold">
                    <span>Avg {group.avgScore}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : view === 'library' ? (
        // ================= LIBRARY SCREEN =================
        <div className="space-y-5 flex flex-col select-none">
          {/* Mobile Header */}
          <div className="flex xl:hidden items-center gap-3">
            <button
              onClick={() => setView('dashboard')}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              <h1 className="text-lg font-black tracking-tight text-white">My Library</h1>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white xl:bg-white/80 border border-slate-200 rounded-full px-3.5 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm">
              <FolderOpen className="h-3.5 w-3.5 text-violet-500" />
              <span>{libraryItems.length} Collections</span>
            </div>
            <div className="flex items-center gap-2 bg-white xl:bg-white/80 border border-slate-200 rounded-full px-3.5 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm">
              <BookOpen className="h-3.5 w-3.5 text-[#FF6B35]" />
              <span>{libraryItems.reduce((sum, l) => sum + l.itemsCount, 0)} Total Items</span>
            </div>
            <div className="flex items-center gap-2 bg-white xl:bg-white/80 border border-slate-200 rounded-full px-3.5 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm">
              <Tag className="h-3.5 w-3.5 text-emerald-500" />
              <span>{[...new Set(libraryItems.map(l => l.subject))].length} Subjects</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search collections by name or subject..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35]/50 transition-all shadow-sm"
            />
          </div>

          {/* Library Cards Grid */}
          {libraryItems.filter(lib => {
            const q = searchQuery.toLowerCase();
            return lib.name.toLowerCase().includes(q) || lib.subject.toLowerCase().includes(q) || lib.type.toLowerCase().includes(q);
          }).length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4">
              <div className="h-20 w-20 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
                <FolderOpen className="h-8 w-8 text-violet-400" />
              </div>
              <h3 className="text-sm font-extrabold text-white xl:text-slate-800 mb-1">No collections found</h3>
              <p className="text-[11px] text-slate-400 xl:text-slate-500 font-medium max-w-xs">Your question banks and exam templates will appear here as you build your library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {libraryItems.filter(lib => {
                const q = searchQuery.toLowerCase();
                return lib.name.toLowerCase().includes(q) || lib.subject.toLowerCase().includes(q) || lib.type.toLowerCase().includes(q);
              }).map((lib) => {
                const colors = getSubjectColor(lib.subject);
                return (
                  <div
                    key={lib.id}
                    onClick={() => setSelectedLibrary(lib)}
                    className="group bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm hover:shadow-lg hover:border-[#FF6B35]/40 cursor-pointer transition-all duration-200 hover:-translate-y-1 active:scale-[0.98] relative overflow-hidden"
                  >
                    {/* Decorative gradient strip */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${colors.dot} opacity-60 group-hover:opacity-100 transition-opacity`} />
                    
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`h-10 w-10 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center shrink-0`}>
                        <FolderOpen className={`h-5 w-5 ${colors.text}`} />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLibraryItem(lib.id);
                          setToast({ message: `"${lib.name}" removed from library.`, type: 'success' });
                        }}
                        className="h-7 w-7 rounded-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-[13px] text-slate-800 leading-snug mb-1.5 line-clamp-2">{lib.name}</h3>

                    {/* Description */}
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-3 line-clamp-2">{lib.description}</p>

                    {/* Tags row */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>{lib.subject}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{lib.type}</span>
                    </div>

                    {/* Footer stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold">
                        <BookOpen className="h-3 w-3" />
                        <span>{lib.itemsCount} items</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold">
                        <Clock className="h-3 w-3" />
                        <span>{lib.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // ================= SETTINGS SCREEN =================
        <div className="space-y-6 flex flex-col select-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('dashboard')}
                className="h-8 w-8 rounded-full bg-slate-100 xl:bg-white border border-slate-200 text-slate-700 flex items-center justify-center transition-colors shrink-0"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF6B35]" />
                <h1 className="text-xl font-black tracking-tight text-slate-800">System Preferences</h1>
              </div>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-6">
            {/* Settings Navigation Tabs */}
            <div className="w-full xl:w-60 flex flex-row xl:flex-col gap-1 overflow-x-auto no-scrollbar xl:overflow-x-visible shrink-0 pb-2 xl:pb-0 border-b xl:border-b-0 xl:border-r border-slate-200 pr-0 xl:pr-4">
              <button
                onClick={() => setActiveSettingsTab('profile')}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeSettingsTab === 'profile'
                    ? 'bg-slate-100 text-[#0F172A]'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <User className="h-4 w-4" />
                <span>School & Profile</span>
              </button>
              <button
                onClick={() => setActiveSettingsTab('ai')}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeSettingsTab === 'ai'
                    ? 'bg-slate-100 text-[#0F172A]'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <SettingsIcon className="h-4 w-4" />
                <span>AI Generator Engine</span>
              </button>
              <button
                onClick={() => setActiveSettingsTab('preferences')}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeSettingsTab === 'preferences'
                    ? 'bg-slate-100 text-[#0F172A]'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Sliders className="h-4 w-4" />
                <span>Exam Preferences</span>
              </button>
            </div>

            {/* Settings Tab Content */}
            <div className="flex-1 bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
              {activeSettingsTab === 'profile' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-sm font-black text-slate-800">Institution Details</h2>
                    <p className="text-[10px] text-slate-400 font-bold">Configure school profile and administrator information.</p>
                  </div>

                  {/* Logo Upload Section */}
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl select-none">
                    <div className="h-16 w-16 rounded-xl bg-orange-100/50 border border-orange-200 flex items-center justify-center overflow-hidden shrink-0 relative shadow-sm">
                      {settingsSchoolLogo ? (
                        <img src={settingsSchoolLogo} alt="Institution Logo" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-2xl">🐵</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Institution Logo</span>
                      <div className="flex gap-2">
                        <label className="bg-[#FF6B35] hover:bg-orange-600 text-white text-[9px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-sm">
                          Change Logo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setSettingsSchoolLogo(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        {settingsSchoolLogo && (
                          <button
                            onClick={() => setSettingsSchoolLogo('')}
                            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 text-[9px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all shadow-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Teacher Name</label>
                      <input
                        type="text"
                        value={settingsTeacherName}
                        onChange={(e) => setSettingsTeacherName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-4 py-3 rounded-xl focus:outline-none focus:border-[#FF6B35] transition-colors"
                        placeholder="Enter name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Teacher Email</label>
                      <input
                        type="email"
                        value={settingsTeacherEmail}
                        onChange={(e) => setSettingsTeacherEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-4 py-3 rounded-xl focus:outline-none focus:border-[#FF6B35] transition-colors"
                        placeholder="Enter email"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">School Name</label>
                      <input
                        type="text"
                        value={settingsSchoolName}
                        onChange={(e) => setSettingsSchoolName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-4 py-3 rounded-xl focus:outline-none focus:border-[#FF6B35] transition-colors"
                        placeholder="Enter school name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">School Branch / City</label>
                      <input
                        type="text"
                        value={settingsSchoolBranch}
                        onChange={(e) => setSettingsSchoolBranch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-4 py-3 rounded-xl focus:outline-none focus:border-[#FF6B35] transition-colors"
                        placeholder="Enter school branch"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Academic Session</label>
                      <div className="relative">
                        <select
                          value={settingsSession}
                          onChange={(e) => setSettingsSession(e.target.value)}
                          className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-4 py-3 rounded-xl focus:outline-none focus:border-[#FF6B35] cursor-pointer transition-colors"
                        >
                          <option value="2026-2027">Session 2026-2027</option>
                          <option value="2025-2026">Session 2025-2026</option>
                          <option value="2024-2025">Session 2024-2025</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-3.5 h-4.5 w-4.5 text-slate-400 pointer-events-none animate-none" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Affiliation Board</label>
                      <div className="relative">
                        <select
                          value={settingsBoard}
                          onChange={(e) => setSettingsBoard(e.target.value)}
                          className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-4 py-3 rounded-xl focus:outline-none focus:border-[#FF6B35] cursor-pointer transition-colors"
                        >
                          <option value="CBSE">CBSE (Central Board)</option>
                          <option value="ICSE">ICSE (Indian Certificate)</option>
                          <option value="IB">IB (International Baccalaureate)</option>
                          <option value="State Board">State Board</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-3.5 h-4.5 w-4.5 text-slate-400 pointer-events-none animate-none" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 bg-[#2E3035] hover:bg-[#1E2022] text-white font-extrabold text-[10px] py-3 px-6 rounded-full border-2 border-[#FF6B35] shadow-md hover:shadow-lg cursor-pointer transition-all active:scale-98"
                    >
                      <FileCheck className="h-4 w-4 text-[#FF6B35]" />
                      <span>Save Profile Settings</span>
                    </button>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'ai' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-sm font-black text-slate-800">AI Core Configurations</h2>
                    <p className="text-[10px] text-slate-400 font-bold">Manage LLM source providers and default question engine settings.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Generation Engine</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                          onClick={() => setSettingsAiEngine('mock')}
                          className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                            settingsAiEngine === 'mock'
                              ? 'border-[#FF6B35] bg-orange-50/20'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`h-3 w-3 rounded-full flex items-center justify-center border ${
                              settingsAiEngine === 'mock' ? 'border-[#FF6B35] bg-[#FF6B35]' : 'border-slate-300'
                            }`}>
                              {settingsAiEngine === 'mock' && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </span>
                            <span className="text-xs font-black text-slate-800">Local Sandbox Core</span>
                          </div>
                          <p className="text-[9px] text-slate-400 font-bold mt-2 ml-5.5">
                            Generates examinations instantly utilizing our optimized local subject question bank databases.
                          </p>
                        </div>

                        <div
                          onClick={() => setSettingsAiEngine('gemini')}
                          className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                            settingsAiEngine === 'gemini'
                              ? 'border-[#FF6B35] bg-orange-50/20'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`h-3 w-3 rounded-full flex items-center justify-center border ${
                              settingsAiEngine === 'gemini' ? 'border-[#FF6B35] bg-[#FF6B35]' : 'border-slate-300'
                            }`}>
                              {settingsAiEngine === 'gemini' && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </span>
                            <span className="text-xs font-black text-slate-800">Google Gemini 2.5 Flash</span>
                          </div>
                          <p className="text-[9px] text-slate-400 font-bold mt-2 ml-5.5">
                            Powers question paper synthesis using real-time LLM reasoning. Requires an active `AI_API_KEY` defined in the environment.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black text-slate-800">Automatic PDF Formatting</span>
                        <span className="text-[9px] text-slate-400 font-bold">Pre-builds session headers, name blocks, and borders inside assessment previews.</span>
                      </div>
                      <button
                        onClick={() => setSettingsPdfFormatting(!settingsPdfFormatting)}
                        className={`w-11 h-6 rounded-full transition-colors focus:outline-none flex items-center px-1 cursor-pointer ${
                          settingsPdfFormatting ? 'bg-[#FF6B35]' : 'bg-slate-200'
                        }`}
                      >
                        <span className={`h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform ${
                          settingsPdfFormatting ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      onClick={handleSaveEngine}
                      className="flex items-center gap-2 bg-[#2E3035] hover:bg-[#1E2022] text-white font-extrabold text-[10px] py-3 px-6 rounded-full border-2 border-[#FF6B35] shadow-md hover:shadow-lg cursor-pointer transition-all active:scale-98"
                    >
                      <Sparkles className="h-4 w-4 text-[#FF6B35] fill-[#FF6B35]" />
                      <span>Save Engine Settings</span>
                    </button>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'preferences' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-sm font-black text-slate-800">Default Exam Preferences</h2>
                    <p className="text-[10px] text-slate-400 font-bold">Configure default time limits, passing requirements, and standard instructions printed on examination papers.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Default Exam Duration</label>
                      <div className="relative">
                        <select
                          value={settingsDuration}
                          onChange={(e) => setSettingsDuration(e.target.value)}
                          className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-4 py-3 rounded-xl focus:outline-none focus:border-[#FF6B35] cursor-pointer transition-colors"
                        >
                          <option value="45 Minutes">45 Minutes</option>
                          <option value="1 Hour">1 Hour</option>
                          <option value="1.5 Hours">1.5 Hours</option>
                          <option value="2 Hours">2 Hours</option>
                          <option value="3 Hours">3 Hours</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-3.5 h-4.5 w-4.5 text-slate-400 pointer-events-none animate-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Default Passing Marks (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={settingsPassingMarks}
                        onChange={(e) => setSettingsPassingMarks(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-4 py-3 rounded-xl focus:outline-none focus:border-[#FF6B35] transition-colors"
                        placeholder="e.g. 40"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Standard Instructions (Printed on Paper)</label>
                    <textarea
                      rows={5}
                      value={settingsInstructions}
                      onChange={(e) => setSettingsInstructions(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-4 py-3 rounded-xl focus:outline-none focus:border-[#FF6B35] transition-colors"
                      placeholder="Enter standard instructions, one per line..."
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      onClick={handleSavePreferences}
                      className="flex items-center gap-2 bg-[#2E3035] hover:bg-[#1E2022] text-white font-extrabold text-[10px] py-3 px-6 rounded-full border-2 border-[#FF6B35] shadow-md hover:shadow-lg cursor-pointer transition-all active:scale-98"
                    >
                      <FileText className="h-4 w-4 text-[#FF6B35]" />
                      <span>Save Exam Preferences</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Group Details Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-[#1C1C1E] xl:bg-white border border-white/10 xl:border-slate-200 rounded-[24px] max-w-lg w-full p-6 shadow-2xl relative select-none">
            {/* Close button */}
            <button
              onClick={() => setSelectedGroup(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/5 xl:bg-slate-100 hover:bg-white/10 xl:hover:bg-slate-200 flex items-center justify-center text-slate-400 xl:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header info */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`h-11 w-11 rounded-xl ${selectedGroup.color?.bg || 'bg-blue-50'} ${selectedGroup.color?.border || 'border-blue-200'} border flex items-center justify-center text-lg shrink-0`}>
                <Users className={`h-6 w-6 ${selectedGroup.color?.text || 'text-blue-700'}`} />
              </div>
              <div>
                <h2 className="text-sm xl:text-base font-extrabold text-white xl:text-slate-800">
                  {selectedGroup.name}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400 xl:text-slate-500 font-bold">
                    Class Code:
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${selectedGroup.color?.badge || 'bg-blue-100 text-blue-700'}`}>
                    {selectedGroup.code}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-white/5 xl:bg-slate-50 border border-white/5 xl:border-slate-100 rounded-xl p-3 text-center">
                <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Students</span>
                <span className="text-sm xl:text-base font-black text-white xl:text-slate-800">{selectedGroup.studentCount || selectedGroup.students?.length || 0}</span>
              </div>
              <div className="bg-white/5 xl:bg-slate-50 border border-white/5 xl:border-slate-100 rounded-xl p-3 text-center">
                <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Tests</span>
                <span className="text-sm xl:text-base font-black text-white xl:text-slate-800">{selectedGroup.assignmentsCount || 0}</span>
              </div>
              <div className="bg-white/5 xl:bg-slate-50 border border-white/5 xl:border-slate-100 rounded-xl p-3 text-center">
                <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Avg Score</span>
                <span className="text-sm xl:text-base font-black text-emerald-500 xl:text-emerald-600">{selectedGroup.avgScore || 0}%</span>
              </div>
            </div>

            {/* Tabs switcher */}
            <div className="flex border-b border-white/10 xl:border-slate-100 mb-4">
              <button
                onClick={() => setGroupTab('roster')}
                className={`flex-1 pb-2.5 text-xs font-black border-b-2 transition-all ${
                  groupTab === 'roster'
                    ? 'border-[#FF6B35] text-white xl:text-slate-800'
                    : 'border-transparent text-slate-400 hover:text-white xl:hover:text-slate-800'
                }`}
              >
                Student Roster ({selectedGroup.studentCount || selectedGroup.students?.length || 0})
              </button>
              <button
                onClick={() => setGroupTab('assignments')}
                className={`flex-1 pb-2.5 text-xs font-black border-b-2 transition-all ${
                  groupTab === 'assignments'
                    ? 'border-[#FF6B35] text-white xl:text-slate-800'
                    : 'border-transparent text-slate-400 hover:text-white xl:hover:text-slate-800'
                }`}
              >
                Group Assignments ({selectedGroup.assignmentsCount || 0})
              </button>
            </div>

            {/* Modal Body depending on active tab */}
            <div className="h-60 overflow-y-auto border border-white/5 xl:border-slate-100 rounded-xl p-3 bg-white/5 xl:bg-slate-50/50">
              {groupTab === 'roster' ? (
                <div className="space-y-1.5">
                  {(selectedGroup.students || []).map((student: string, i: number) => (
                    <div key={i} className="flex items-center justify-between text-[11px] text-slate-300 xl:text-slate-700 font-semibold px-3 py-2 rounded-lg hover:bg-white/5 xl:hover:bg-white border border-transparent hover:border-white/10 xl:hover:border-slate-200/60 transition-all">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-6 w-6 rounded-full ${selectedGroup.color?.bg || 'bg-blue-50'} ${selectedGroup.color?.text || 'text-blue-700'} flex items-center justify-center text-[9px] font-black`}>
                          {student.charAt(0)}
                        </div>
                        <span>{student}</span>
                      </div>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 flex flex-col justify-start h-full">
                  {(() => {
                    const groupAssns = displayAssignments.filter(a => a.groupId === (selectedGroup._id || selectedGroup.id));
                    const listToShow = groupAssns.length > 0 ? groupAssns : displayAssignments.filter(a => {
                      const subj = selectedGroup.subject.toLowerCase();
                      return a.subject.toLowerCase().includes(subj) || subj.includes(a.subject.toLowerCase());
                    });
                    
                    if (listToShow.length > 0) {
                      return listToShow.map((a, i) => (
                        <div key={a._id || i} className="flex items-center justify-between p-3 border border-white/5 xl:border-slate-200/60 rounded-xl bg-white/5 xl:bg-white shadow-sm hover:border-[#FF6B35]/30 transition-all">
                          <div className="flex flex-col gap-0.5 max-w-[70%]">
                            <span className="text-[11px] text-slate-200 xl:text-slate-800 font-black truncate">{a.title}</span>
                            <span className="text-[9px] text-slate-400 font-medium">Difficulty: <span className="font-bold capitalize">{a.difficulty}</span></span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-300 xl:text-slate-700 font-black block">{a.numQuestions || 15} Qs</span>
                            <span className="text-[8px] text-slate-400 font-bold block mt-0.5">{a.dueDate ? `Due: ${a.dueDate}` : ''}</span>
                          </div>
                        </div>
                      ));
                    }
                    return (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <FileText className="h-8 w-8 text-slate-400 mb-2 opacity-50" />
                        <span className="text-[10px] text-slate-400 xl:text-slate-500 font-bold">No assignments created yet for this group.</span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="mt-6 flex justify-end gap-2 border-t border-white/5 xl:border-slate-100 pt-4">
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-[10px] font-bold text-slate-400 hover:text-white xl:hover:text-slate-800 px-4 py-2 rounded-full cursor-pointer transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  skipReset.current = true;
                  setSelectedGroup(null);
                  updateForm({
                    subject: selectedGroup.subject,
                    groupId: selectedGroup._id || selectedGroup.id
                  });
                  setView('create');
                }}
                className="text-[10px] font-black bg-[#FF6B35] text-white hover:bg-orange-600 px-4 py-2 rounded-full shadow cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Plus className="h-3 w-3" />
                <span>Create Group Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Library Collection Details Modal */}
      {selectedLibrary && (() => {
        const sc = getSubjectColor(selectedLibrary.subject);
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#1C1C1E] xl:bg-white border border-white/10 xl:border-slate-200 rounded-[24px] max-w-lg w-full shadow-2xl relative select-none overflow-hidden">
              {/* Colored header band */}
              <div className={`h-2 w-full ${sc.dot}`} />
              
              <div className="p-6">
                <button
                  onClick={() => setSelectedLibrary(null)}
                  className="absolute top-6 right-5 h-8 w-8 rounded-full bg-white/5 xl:bg-slate-100 hover:bg-white/10 xl:hover:bg-slate-200 flex items-center justify-center text-slate-400 xl:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Header */}
                <div className="flex items-start gap-3.5 mb-5 pr-10">
                  <div className={`h-12 w-12 rounded-xl ${sc.bg} ${sc.border} border flex items-center justify-center shrink-0`}>
                    <FolderOpen className={`h-6 w-6 ${sc.text}`} />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white xl:text-slate-800 leading-tight">
                      {selectedLibrary.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>{selectedLibrary.subject}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{selectedLibrary.type}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-400 xl:text-slate-500 font-medium leading-relaxed mb-5">{selectedLibrary.description}</p>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-white/5 xl:bg-slate-50 border border-white/5 xl:border-slate-100 rounded-xl p-3 text-center">
                    <span className="text-lg font-black text-white xl:text-slate-800">{selectedLibrary.itemsCount}</span>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Total Items</p>
                  </div>
                  <div className="bg-white/5 xl:bg-slate-50 border border-white/5 xl:border-slate-100 rounded-xl p-3 text-center">
                    <span className="text-lg font-black text-white xl:text-slate-800">{selectedLibrary.type.split(' ').length}</span>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Categories</p>
                  </div>
                  <div className="bg-white/5 xl:bg-slate-50 border border-white/5 xl:border-slate-100 rounded-xl p-3 text-center">
                    <span className="text-lg font-black text-white xl:text-slate-800">{selectedLibrary.lastUpdated}</span>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Last Updated</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center gap-2 border-t border-white/5 xl:border-slate-100 pt-4">
                  <button
                    onClick={() => {
                      deleteLibraryItem(selectedLibrary.id);
                      setSelectedLibrary(null);
                      setToast({ message: `"${selectedLibrary.name}" removed from library.`, type: 'success' });
                    }}
                    className="text-[10px] font-bold text-red-400 hover:text-red-500 px-4 py-2 rounded-full cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedLibrary(null)}
                      className="text-[10px] font-bold text-slate-400 hover:text-white lg:hover:text-slate-800 px-4 py-2 rounded-full cursor-pointer transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        skipReset.current = true;
                        setSelectedLibrary(null);
                        updateForm({ subject: selectedLibrary.subject });
                        setView('create');
                      }}
                      className="text-[10px] font-black bg-[#FF6B35] text-white hover:bg-orange-600 px-4 py-2.5 rounded-full shadow-lg shadow-orange-500/20 cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Create From Template</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </MobileAppLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090B] flex items-center justify-center text-xs font-bold text-slate-500">Loading...</div>}>
      <DashboardPageContent />
    </Suspense>
  );
}
