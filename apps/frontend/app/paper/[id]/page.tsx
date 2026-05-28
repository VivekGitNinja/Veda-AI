'use client';

import React, { useEffect, use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssignmentStore } from '../../../store/useAssignmentStore';
import MobileAppLayout from '../../../components/layout/MobileAppLayout';
import Toast from '../../../components/Toast';
import { jsPDF } from 'jspdf';
import {
  Download,
  RefreshCw,
  ChevronLeft,
  FileText,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

const staticMockAssignments = [
  {
    _id: 'mock-1',
    title: 'Quiz on Electricity',
    subject: 'Physics',
    difficulty: 'medium' as const,
    dueDate: '21-06-2025',
    createdAt: '2025-06-20T10:00:00.000Z',
    status: 'completed' as const,
    numQuestions: 15,
    result: { totalMarks: 45 }
  },
  {
    _id: 'mock-2',
    title: 'Cell Structure and Function',
    subject: 'Biology',
    difficulty: 'easy' as const,
    dueDate: '22-06-2025',
    createdAt: '2025-06-20T11:00:00.000Z',
    status: 'completed' as const,
    numQuestions: 10,
    result: { totalMarks: 20 }
  },
  {
    _id: 'mock-3',
    title: 'Chemical Reactions and Equations',
    subject: 'Chemistry',
    difficulty: 'hard' as const,
    dueDate: '25-06-2025',
    createdAt: '2025-06-20T12:00:00.000Z',
    status: 'completed' as const,
    numQuestions: 20,
    result: { totalMarks: 50 }
  },
  {
    _id: 'mock-4',
    title: 'Light - Reflection and Refraction',
    subject: 'Physics',
    difficulty: 'medium' as const,
    dueDate: '28-06-2025',
    createdAt: '2025-06-21T09:00:00.000Z',
    status: 'completed' as const,
    numQuestions: 12,
    result: { totalMarks: 30 }
  },
  {
    _id: 'mock-5',
    title: 'Acid, Bases and Salts',
    subject: 'Chemistry',
    difficulty: 'easy' as const,
    dueDate: '30-06-2025',
    createdAt: '2025-06-22T08:00:00.000Z',
    status: 'completed' as const,
    numQuestions: 15,
    result: { totalMarks: 30 }
  },
  {
    _id: 'mock-6',
    title: 'Control and Coordination',
    subject: 'Biology',
    difficulty: 'medium' as const,
    dueDate: '02-07-2025',
    createdAt: '2025-06-22T14:00:00.000Z',
    status: 'completed' as const,
    numQuestions: 10,
    result: { totalMarks: 25 }
  },
  {
    _id: 'mock-7',
    title: 'Carbon and its Compounds',
    subject: 'Chemistry',
    difficulty: 'hard' as const,
    dueDate: '05-07-2025',
    createdAt: '2025-06-23T10:00:00.000Z',
    status: 'completed' as const,
    numQuestions: 18,
    result: { totalMarks: 40 }
  },
  {
    _id: 'mock-8',
    title: 'Our Environment Quiz',
    subject: 'Biology',
    difficulty: 'easy' as const,
    dueDate: '08-07-2025',
    createdAt: '2025-06-24T09:00:00.000Z',
    status: 'completed' as const,
    numQuestions: 8,
    result: { totalMarks: 16 }
  },
  {
    _id: 'mock-9',
    title: 'Periodic Classification',
    subject: 'Chemistry',
    difficulty: 'medium' as const,
    dueDate: '10-07-2025',
    createdAt: '2025-06-24T15:00:00.000Z',
    status: 'completed' as const,
    numQuestions: 15,
    result: { totalMarks: 30 }
  },
  {
    _id: 'mock-10',
    title: 'Sources of Energy Exam',
    subject: 'Physics',
    difficulty: 'medium' as const,
    dueDate: '12-07-2025',
    createdAt: '2025-06-25T11:00:00.000Z',
    status: 'completed' as const,
    numQuestions: 14,
    result: { totalMarks: 35 }
  }
];

const mockQuizOnElectricityPaper = {
  title: 'DELHI PUBLIC SCHOOL, SECTOR-4, BOKARO',
  subject: 'Science (Physics - Electricity)',
  totalMarks: 45,
  duration: '1 Hour 30 Minutes',
  sections: [
    {
      title: 'Section A: Multiple Choice Questions',
      instruction: 'Answer all the questions. Each question carries 1 mark.',
      questions: [
        {
          text: 'Which of the following is a good conductor of electricity?',
          type: 'mcq' as const,
          difficulty: 'easy' as const,
          marks: 1,
          options: ['Rubber', 'Copper', 'Glass', 'Wood']
        },
        {
          text: 'The standard unit of electric current is:',
          type: 'mcq' as const,
          difficulty: 'easy' as const,
          marks: 1,
          options: ['Volt', 'Ampere', 'Ohm', 'Watt']
        },
        {
          text: 'What happens to the resistance of a wire when its length is doubled?',
          type: 'mcq' as const,
          difficulty: 'medium' as const,
          marks: 1,
          options: ['Halved', 'Doubled', 'Quadrupled', 'Remains same']
        },
        {
          text: 'Which device is used to measure potential difference in a circuit?',
          type: 'mcq' as const,
          difficulty: 'medium' as const,
          marks: 1,
          options: ['Ammeter', 'Voltmeter', 'Galvanometer', 'Rheostat']
        }
      ]
    },
    {
      title: 'Section B: Short Answer Questions',
      instruction: 'Answer in brief. Each question carries 2 marks.',
      questions: [
        {
          text: 'Define electric potential and potential difference. Write their SI units.',
          type: 'short-answer' as const,
          difficulty: 'medium' as const,
          marks: 2
        },
        {
          text: 'State Ohm\'s Law and write its mathematical expression representing V, I, and R.',
          type: 'short-answer' as const,
          difficulty: 'medium' as const,
          marks: 2
        },
        {
          text: 'Explain why tungsten is commonly used for filaments of electric lamps.',
          type: 'short-answer' as const,
          difficulty: 'hard' as const,
          marks: 2
        }
      ]
    },
    {
      title: 'Section C: Diagram/Graph-Based Questions',
      instruction: 'Analyze the given scenario and answer the questions. Each question carries 5 marks.',
      questions: [
        {
          text: 'Draw a schematic diagram of a circuit consisting of a battery of three cells, a 5-ohm resistor, an 8-ohm resistor, and a 12-ohm resistor, and a plug key, all connected in series.',
          type: 'case-based' as const,
          difficulty: 'hard' as const,
          marks: 5
        },
        {
          text: 'Study the V-I graph for a metallic wire at two different temperatures T1 and T2. Which temperature is higher and why?',
          type: 'case-based' as const,
          difficulty: 'hard' as const,
          marks: 5
        }
      ]
    }
  ],
  answerKey: [
    { questionIndex: 0, answer: 'Copper' },
    { questionIndex: 1, answer: 'Ampere' },
    { questionIndex: 2, answer: 'Doubled (Resistance is directly proportional to length)' },
    { questionIndex: 3, answer: 'Voltmeter' },
    { questionIndex: 4, answer: 'Electric potential is the work done in bringing a unit charge from infinity. Potential difference is work done per unit charge between two points. Unit: Volt.' },
    { questionIndex: 5, answer: 'Ohm\'s Law states V = IR (current is directly proportional to voltage across a conductor at constant temperature).' },
    { questionIndex: 6, answer: 'Tungsten has a very high melting point (3380°C) and high resistivity, preventing it from oxidizing or melting at high temperatures.' },
    { questionIndex: 7, answer: 'Circuit diagram showing 3-cell battery in series with 5 ohm, 8 ohm, 12 ohm resistors, key, and ammeter.' },
    { questionIndex: 8, answer: 'Temperature T1 is higher. Since slope of V-I graph is resistance, and resistance increases with temperature.' }
  ]
};

const getMockPaper = (id: string) => {
  if (id === 'mock-1') return mockQuizOnElectricityPaper;

  const matchingMock = staticMockAssignments.find(m => m._id === id);
  return {
    title: 'DELHI PUBLIC SCHOOL, SECTOR-4, BOKARO',
    subject: `Science (${matchingMock?.subject || 'General Study'})`,
    totalMarks: matchingMock?.result?.totalMarks || 30,
    duration: '1 Hour 30 Minutes',
    sections: [
      {
        title: 'Section A: Multiple Choice Questions',
        instruction: 'Select the correct option. Each question is 1 mark.',
        questions: [
          {
            text: 'What is the primary source of energy for Earth?',
            type: 'mcq' as const,
            difficulty: 'easy' as const,
            marks: 1,
            options: ['Moon', 'Sun', 'Wind', 'Geothermal']
          },
          {
            text: 'Which gas do plants absorb during photosynthesis?',
            type: 'mcq' as const,
            difficulty: 'easy' as const,
            marks: 1,
            options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen']
          }
        ]
      },
      {
        title: 'Section B: Short Answer Questions',
        instruction: 'Answer in brief.',
        questions: [
          {
            text: 'Explain the difference between renewable and non-renewable energy sources.',
            type: 'short-answer' as const,
            difficulty: 'medium' as const,
            marks: 2
          }
        ]
      }
    ],
    answerKey: [
      { questionIndex: 0, answer: 'Sun' },
      { questionIndex: 1, answer: 'Carbon Dioxide' },
      { questionIndex: 2, answer: 'Renewable energy is replenished naturally, non-renewable is finite.' }
    ]
  };
};

export default function AssessmentPaperPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const {
    activeAssignment,
    assignmentResult,
    errorMessage,
    fetchAssignment,
    fetchResult,
    regenerateAssignment
  } = useAssignmentStore();

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCredentials, setShowCredentials] = useState(true);
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    rollNo: '',
    section: ''
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (id.startsWith('mock-')) {
        const matchingMock = staticMockAssignments.find(m => m._id === id);
        const paper = getMockPaper(id);
        useAssignmentStore.setState({
          activeAssignment: {
            _id: id,
            title: matchingMock?.title || 'Quiz on Electricity',
            subject: matchingMock?.subject || 'Physics',
            dueDate: matchingMock?.dueDate || '21-06-2025',
            difficulty: matchingMock?.difficulty || 'medium',
            questionType: 'mcq',
            numQuestions: matchingMock?.numQuestions || 10,
            marksPerQuestion: 2,
            status: 'completed',
            progress: 100,
            result: paper
          },
          assignmentResult: paper,
          errorMessage: null
        });
        setLoading(false);
        return;
      }

      const assignment = await fetchAssignment(id);
      if (assignment) {
        if (assignment.status === 'completed') {
          await fetchResult(id);
        } else {
          router.push(`/generate/${id}`);
        }
      }
      setLoading(false);
    };
    loadData();
  }, [id, fetchAssignment, fetchResult, router]);

  const handleRegenerate = async () => {
    if (id.startsWith('mock-')) {
      setToast({ message: 'Mock data cannot be regenerated.', type: 'error' });
      return;
    }
    const successId = await regenerateAssignment(id);
    if (successId) {
      setToast({ message: 'Regeneration job started!', type: 'success' });
      setTimeout(() => {
        router.push(`/generate/${id}`);
      }, 500);
    } else {
      setToast({ message: 'Failed to restart generation.', type: 'error' });
    }
  };

  const generatePDF = () => {
    if (!assignmentResult) return;

    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;

      let yPos = 20;

      const addFooter = (pageNum: number) => {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(
          `Page ${pageNum} | Generated by VedaAI Assessment Engine`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      };

      let pageCount = 1;
      addFooter(pageCount);

      const checkPageOverflow = (neededHeight: number) => {
        if (yPos + neededHeight > pageHeight - 20) {
          doc.addPage();
          pageCount++;
          addFooter(pageCount);
          yPos = 20;
          
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(assignmentResult.title, margin, yPos);
          doc.text(`Subject: ${assignmentResult.subject}`, pageWidth - margin, yPos, { align: 'right' });
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
          yPos += 10;
        }
      };

      // Header School Details Block
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("DELHI PUBLIC SCHOOL, SECTOR-4, BOKARO", pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Two-column metadata layout
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Class: 8th`, margin, yPos);
      doc.text(`Max Marks: ${assignmentResult.totalMarks}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 6;

      doc.text(`Subject: ${assignmentResult.subject}`, margin, yPos);
      doc.text(`Time Allowed: ${assignmentResult.duration || '45 minutes'}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 8;

      // Double line divider
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 1.5;
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // Student blanks
      const sName = studentInfo.name ? studentInfo.name : '________________________';
      const sRoll = studentInfo.rollNo ? studentInfo.rollNo : '__________________';
      const sSec = studentInfo.section ? studentInfo.section : '____________';

      doc.text(`Name: ${sName}`, margin, yPos);
      yPos += 6;
      doc.text(`Roll Number: ${sRoll}`, margin, yPos);
      yPos += 6;
      doc.text(`Class: 8th Section: ${sSec}`, margin, yPos);
      yPos += 12;

      let questionNumber = 1;

      // Loop sections
      assignmentResult.sections.forEach((section) => {
        checkPageOverflow(20);
        
        // Section header
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(section.title, pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        // Section subsection instruction
        const subTitle = section.title.includes(':') ? section.title.split(':')[1].trim() : section.title;
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.text(subTitle, margin, yPos);
        yPos += 5;

        doc.setFont('Helvetica', 'italic');
        doc.text(section.instruction || 'Attempt all questions.', margin, yPos);
        yPos += 8;

        section.questions.forEach((q) => {
          const diffText = q.difficulty === 'hard' ? 'Challenging' : (q.difficulty === 'medium' ? 'Moderate' : 'Easy');
          const questionText = `[${diffText}] ${q.text}`;
          const textLines = doc.splitTextToSize(`${questionNumber}. ${questionText}`, contentWidth - 25);
          
          let neededHeight = textLines.length * 6 + 4;
          checkPageOverflow(neededHeight);

          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(9.5);
          
          // Print number on left, text in center, marks on right
          doc.text(`${questionNumber}.`, margin, yPos);
          doc.text(doc.splitTextToSize(questionText, contentWidth - 30), margin + 8, yPos);
          doc.text(`[${q.marks} Marks]`, pageWidth - margin, yPos, { align: 'right' });

          yPos += textLines.length * 6 + 2;
          questionNumber++;
        });

        yPos += 8;
      });

      // End signature
      checkPageOverflow(15);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text("End of Question Paper", pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Answer Key Section
      if (assignmentResult.answerKey && assignmentResult.answerKey.length > 0) {
        checkPageOverflow(25);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.text("Answer Key:", margin, yPos);
        yPos += 8;

        assignmentResult.answerKey.forEach((ans, idx) => {
          const ansText = `${ans.questionIndex + 1 || idx + 1}. ${ans.answer}`;
          const ansLines = doc.splitTextToSize(ansText, contentWidth);
          checkPageOverflow(ansLines.length * 5 + 4);
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.text(ansLines, margin, yPos);
          yPos += ansLines.length * 5 + 2;
        });
      }

      doc.save(`${assignmentResult.title.replace(/\s+/g, '_')}_Paper.pdf`);
      setToast({ message: 'PDF download started!', type: 'success' });
    } catch (err: any) {
      console.error(err);
      setToast({ message: 'Failed to export PDF file.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] lg:bg-transparent flex items-center justify-center text-xs font-bold text-slate-500">
        <Loader2 className="h-6 w-6 text-[#FF6B35] animate-spin mr-2" />
        <span>Loading Question Paper...</span>
      </div>
    );
  }

  if (errorMessage && !assignmentResult) {
    return (
      <MobileAppLayout activeSection="assignments">
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center select-none bg-[#000000] lg:bg-transparent min-h-[400px]">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <h2 className="text-sm font-extrabold text-white lg:text-slate-800 mt-4">Failed to load paper</h2>
          <p className="text-[10px] text-slate-400 lg:text-slate-500 mt-1 font-semibold leading-relaxed">{errorMessage}</p>
          <Link
            href="/"
            className="mt-6 inline-block text-[10px] font-bold bg-[#FF6B35] text-white hover:bg-orange-600 py-2 px-5 rounded-full transition-colors cursor-pointer"
          >
            Back to Dashboard
          </Link>
        </div>
      </MobileAppLayout>
    );
  }

  return (
    <MobileAppLayout activeSection="assignments" isPaperView={true}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start select-none bg-[#000000] lg:bg-transparent">
        
        {/* Left Column: Actions and Navigation */}
        <div className="space-y-4 lg:col-span-1">
          {/* Header navigation bar */}
          <div className="relative flex lg:hidden items-center justify-center select-none h-8 w-full">
            <button
              onClick={() => router.push('/')}
              className="absolute left-0 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#10B981]" />
              <h1 className="text-sm font-black tracking-tight text-white uppercase">Question Paper</h1>
            </div>
          </div>

          {/* AI Assistant Header card with orange action items */}
          <div className="bg-[#1C1C1E] border border-white/10 text-white rounded-[20px] p-4 space-y-3.5 shadow-md">
            <div className="space-y-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">AI Assistant</span>
              <p className="text-[10.5px] font-semibold leading-relaxed text-slate-200">
                Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleRegenerate}
                className="flex items-center justify-center gap-1.5 border border-white/20 bg-transparent hover:bg-white/5 text-white font-extrabold text-[9px] py-2 px-3 rounded-full cursor-pointer transition-colors flex-1"
              >
                <RefreshCw className="h-3 w-3 text-slate-300" />
                <span>Regenerate</span>
              </button>
              <button
                onClick={generatePDF}
                className="flex items-center justify-center gap-1.5 bg-[#FF6B35] text-white hover:bg-orange-600 font-extrabold text-[9px] py-2 px-4 rounded-full transition-all cursor-pointer shadow-md flex-1"
              >
                <Download className="h-3 w-3 text-white stroke-[2.5]" />
                <span>Download A4 PDF</span>
              </button>
            </div>
          </div>

        </div> {/* End of Left Column */}

        {assignmentResult && (
          <>
            {/* Left Column Part 2: Credentials Input */}
            <div className="space-y-4 lg:col-span-1 lg:mt-0">
              {/* Student Credentials Expandable panel */}
              <div className="bg-[#1C1C1E] border border-white/15 rounded-[20px] p-4 shadow-sm space-y-3">
                <button 
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">👤</span>
                    <h3 className="text-[10px] font-black text-white uppercase tracking-wider">Student Credentials</h3>
                  </div>
                  {showCredentials ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                
                {showCredentials && (
                  <div className="space-y-2.5 pt-1 border-t border-white/5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <p className="text-[8px] text-slate-400 font-semibold leading-relaxed">
                      Fill credentials to automatically render on the paper layout preview.
                    </p>

                    <div className="space-y-2">
                      <div className="space-y-0.5">
                        <label htmlFor="student-name" className="text-[8px] font-bold text-slate-500 uppercase">Full Name</label>
                        <input
                          id="student-name"
                          type="text"
                          placeholder="e.g. Sarah Connor"
                          value={studentInfo.name}
                          onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })}
                          className="w-full bg-[#2A2A2D] border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <label htmlFor="student-roll" className="text-[8px] font-bold text-slate-500 uppercase">Roll Number</label>
                          <input
                            id="student-roll"
                            type="text"
                            placeholder="e.g. CAL-901"
                            value={studentInfo.rollNo}
                            onChange={(e) => setStudentInfo({ ...studentInfo, rollNo: e.target.value })}
                            className="w-full bg-[#2A2A2D] border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none font-semibold"
                          />
                        </div>

                        <div className="space-y-0.5">
                          <label htmlFor="student-section" className="text-[8px] font-bold text-slate-500 uppercase">Section</label>
                          <input
                            id="student-section"
                            type="text"
                            placeholder="e.g. Section A"
                            value={studentInfo.section}
                            onChange={(e) => setStudentInfo({ ...studentInfo, section: e.target.value })}
                            className="w-full bg-[#2A2A2D] border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div> {/* End of Credentials Column */}

            {/* Right Column: Centered A4 Print Preview Canvas */}
            <div className="lg:col-span-2 flex justify-center pb-12 select-text">
              <div className="w-full max-w-full lg:max-w-[800px] bg-white border border-slate-300 rounded-2xl lg:rounded-[28px] p-4 sm:p-8 lg:p-12 shadow-lg space-y-6 font-serif leading-relaxed text-slate-900 min-h-[1000px]">
                
                {/* Paper Header */}
                <div className="text-center space-y-1">
                  <h1 className="text-[10px] font-black tracking-tight text-slate-900 uppercase">
                    DELHI PUBLIC SCHOOL, SECTOR-4, BOKARO
                  </h1>
                  <p className="text-[8px] font-bold text-slate-500 uppercase font-sans">CBSE Session 2026-2027</p>
                </div>

                {/* Spacing lines */}
                <div className="flex justify-between items-end border-b border-slate-300 pb-2.5 font-sans text-[8px] text-slate-800 font-black">
                  <div className="space-y-0.5">
                    <p>Class: 8th</p>
                    <p>Subject: {assignmentResult.subject}</p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <p>Max Marks: {assignmentResult.totalMarks}</p>
                    <p>Time Allowed: {assignmentResult.duration || '1 Hour 30 Minutes'}</p>
                  </div>
                </div>

                {/* Student credentials line */}
                <div className="space-y-1.5 pt-2 text-[8px] font-sans font-black border-b border-dashed border-slate-400 pb-3">
                  <p>Name: <span className="font-mono underline text-slate-800 decoration-slate-400 underline-offset-2 pl-0.5">{studentInfo.name || '________________________'}</span></p>
                  <div className="grid grid-cols-2 gap-2">
                    <p>Roll No: <span className="font-mono underline text-slate-800 decoration-slate-400 underline-offset-2 pl-0.5">{studentInfo.rollNo || '__________________'}</span></p>
                    <p>Class: 8th Section: <span className="font-mono underline text-slate-800 decoration-slate-400 underline-offset-2 pl-0.5">{studentInfo.section || '____________'}</span></p>
                  </div>
                </div>

                {/* Sections List */}
                <div className="space-y-5 pt-2">
                  {assignmentResult.sections.map((section, sIdx) => {
                    let questionNumberBase = 1;
                    for (let prevIdx = 0; prevIdx < sIdx; prevIdx++) {
                      questionNumberBase += assignmentResult.sections[prevIdx].questions.length;
                    }

                    return (
                      <div key={sIdx} className="space-y-3">
                        {/* Section heading centered */}
                        <div className="text-center">
                          <h2 className="text-[9px] font-black tracking-wider uppercase font-sans text-slate-900 bg-slate-100 py-0.5 px-2 rounded inline-block">
                            {section.title}
                          </h2>
                        </div>

                        {/* Section instructions */}
                        <div className="space-y-0.5 font-sans text-[8px] font-bold text-slate-700">
                          <p>{section.title.includes(':') ? section.title.split(':')[1].trim() : section.title}</p>
                          <p className="italic text-slate-500 font-normal">
                            {section.instruction}
                          </p>
                        </div>

                        {/* Questions */}
                        <div className="space-y-3 pt-1">
                          {section.questions.map((q, qIdx) => {
                            const absoluteQNum = questionNumberBase + qIdx;
                            const diffText = q.difficulty === 'hard' ? 'Challenging' : (q.difficulty === 'medium' ? 'Moderate' : 'Easy');

                            return (
                              <div key={qIdx} className="space-y-1.5">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex gap-1.5">
                                    <span className="font-bold text-slate-900 font-sans min-w-[12px] text-[10px]">
                                      {absoluteQNum}.
                                    </span>
                                    <p className="text-slate-800 text-[11px] leading-relaxed">
                                      <span className="font-sans font-bold text-slate-500 mr-1">[{diffText}]</span>
                                      {q.text}
                                    </p>
                                  </div>
                                  
                                  <span className="text-[8px] font-bold text-slate-700 shrink-0 font-sans mt-0.5">
                                    [{q.marks} Marks]
                                  </span>
                                </div>

                                {/* MCQ Options */}
                                {q.type === 'mcq' && q.options && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4 pt-0.5 text-[9px] font-sans text-slate-600">
                                    {q.options.map((opt, optIdx) => {
                                      const letter = String.fromCharCode(65 + optIdx);
                                      return (
                                        <div key={optIdx} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/50 p-1.5 rounded-lg">
                                          <div className="h-4.5 w-4.5 rounded-full border border-slate-300 flex items-center justify-center font-bold text-[8px] text-slate-400 bg-white shrink-0">
                                            {letter}
                                          </div>
                                          <span className="truncate">{opt}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* End of paper */}
                <div className="text-center pt-4 border-t border-slate-100">
                  <p className="font-extrabold text-[8px] font-sans tracking-widest uppercase text-slate-400">
                    End of Question Paper
                    <br />
                    <span className="text-[6.5px] font-normal tracking-normal lowercase italic text-slate-400">VedaAI System generated</span>
                  </p>
                </div>

                {/* Answer Key display */}
                {assignmentResult.answerKey && assignmentResult.answerKey.length > 0 && (
                  <div className="border-t border-dashed border-slate-300 pt-4 mt-4 space-y-2">
                    <h3 className="text-[9px] font-black uppercase font-sans text-slate-900 tracking-wider">
                      Answer Key:
                    </h3>
                    <div className="space-y-1.5 font-sans text-[9px] text-slate-600 leading-relaxed pl-1">
                      {assignmentResult.answerKey.map((ans, idx) => (
                        <div key={idx} className="flex gap-1.5">
                          <span className="font-bold text-slate-800">{idx + 1}.</span>
                          <p>{ans.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div> {/* End of Exam Paper Canvas */}
            </div> {/* End of Right Column */}
          </>
        )}
      </div>

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
