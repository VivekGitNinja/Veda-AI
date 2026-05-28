'use client';

import React, { useEffect, use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssignmentStore } from '../../../store/useAssignmentStore';
import MobileAppLayout from '../../../components/layout/MobileAppLayout';
import Toast from '../../../components/Toast';
import {
  Loader2,
  Clock,
  Cpu,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GenerateProgressPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const {
    activeAssignment,
    generationStatus,
    progress,
    errorMessage,
    fetchAssignment,
    connectWebSocket,
    disconnectWebSocket,
    regenerateAssignment
  } = useAssignmentStore();

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchAssignment(id).then((assignment) => {
      if (assignment) {
        if (assignment.status === 'completed') {
          router.push(`/paper/${id}`);
        } else {
          connectWebSocket(id, (result) => {
            setToast({ message: 'Paper generated successfully!', type: 'success' });
            setTimeout(() => {
              router.push(`/paper/${id}`);
            }, 1000);
          });
        }
      }
    });

    return () => {
      disconnectWebSocket();
    };
  }, [id, fetchAssignment, connectWebSocket, disconnectWebSocket, router]);

  const handleRegenerate = async () => {
    const successId = await regenerateAssignment(id);
    if (successId) {
      setToast({ message: 'Regeneration job started!', type: 'success' });
      connectWebSocket(id, (result) => {
        setToast({ message: 'Paper generated successfully!', type: 'success' });
        setTimeout(() => {
          router.push(`/paper/${id}`);
        }, 1000);
      });
    } else {
      setToast({ message: 'Failed to restart generation.', type: 'error' });
    }
  };

  const steps = [
    { key: 'queued', label: 'Queued', description: 'Assigned worker queue spot', progressMin: 0, progressMax: 10 },
    { key: 'processing', label: 'Processing Input', description: 'Analyzing assignment prompt & files', progressMin: 11, progressMax: 30 },
    { key: 'generating', label: 'Generating Questions', description: 'AI core drafting sections & keys', progressMin: 31, progressMax: 70 },
    { key: 'formatting', label: 'Formatting Layout', description: 'Validating and styling examination format', progressMin: 71, progressMax: 99 },
    { key: 'completed', label: 'Completed', description: 'Assessment ready to print', progressMin: 100, progressMax: 100 }
  ];

  const getStepStatus = (stepProgressMin: number, stepProgressMax: number, stepKey: string) => {
    if (generationStatus === 'failed') {
      return 'failed';
    }
    if (progress >= stepProgressMax) {
      return 'completed';
    }
    if (progress >= stepProgressMin && progress < stepProgressMax) {
      return 'active';
    }
    return 'pending';
  };

  return (
    <MobileAppLayout activeSection="toolkit">
      <div className="space-y-4 flex flex-col">
        {/* Header navigation bar */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
            Generation Status
          </span>
        </div>

        {/* Outer card with loading step layout */}
        <div className="bg-[#F4F4F5] text-slate-800 rounded-[28px] p-5 shadow-sm space-y-4">
          
          {activeAssignment && (
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[8px] text-[#FF6B35] font-black uppercase tracking-wider">
                  AI Generator Queue
                </span>
                <h2 className="text-[13px] font-extrabold text-[#0F172A] mt-0.5 leading-tight">{activeAssignment.title}</h2>
                <p className="text-slate-400 text-[9px] font-bold mt-0.5">Subject: {activeAssignment.subject}</p>
              </div>
              <div className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-right">
                <span className="block text-[7px] font-bold text-slate-400 uppercase">Difficulty</span>
                <span className="text-[9px] font-black text-[#0F172A] uppercase">{activeAssignment.difficulty}</span>
              </div>
            </div>
          )}

          {generationStatus === 'failed' ? (
            <div className="text-center space-y-3 py-2">
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-xl flex items-center gap-2.5">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
                <div className="text-left">
                  <h3 className="font-extrabold text-[11px]">Draft Generation Failed</h3>
                  <p className="text-[9px] text-rose-500/80 mt-0.5 font-bold leading-tight">{errorMessage || 'An error occurred during paper generation.'}</p>
                </div>
              </div>
              
              <div className="flex justify-center gap-2 pt-1">
                <Link
                  href="/"
                  className="flex items-center gap-1.5 text-[9px] font-bold border border-slate-200 bg-white text-slate-600 py-1.5 px-3 rounded-full hover:bg-slate-50 transition-colors"
                >
                  Edit Settings
                </Link>
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-1.5 text-[9px] font-bold bg-slate-900 hover:bg-slate-800 text-white py-1.5 px-3 rounded-full transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Try Again
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress details */}
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-[11px] font-black text-[#0F172A] flex items-center gap-1.5">
                    {progress === 100 ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-emerald-500" /> Complete
                      </>
                    ) : (
                      <>
                        <Loader2 className="h-4 w-4 text-[#FF6B35] animate-spin" /> Generating Paper
                      </>
                    )}
                  </h3>
                  <p className="text-slate-400 text-[9px] mt-0.5 font-bold">
                    {progress < 30 && 'Reading uploaded documents & reference file...'}
                    {progress >= 30 && progress < 70 && 'Drafting questions with structured AI generator...'}
                    {progress >= 70 && progress < 100 && 'Formatting exam sections & final answer keys...'}
                    {progress === 100 && 'Preparing final layout view...'}
                  </p>
                </div>
                <span className="text-xl font-black text-[#FF6B35] font-mono tracking-tighter shrink-0">
                  {progress}%
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#FF6B35] h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Progress Stepper list */}
              <div className="space-y-2 pt-1">
                {steps.map((step) => {
                  const status = getStepStatus(step.progressMin, step.progressMax, step.key);
                  
                  let icon = <Clock className="h-3.5 w-3.5 text-slate-300" />;
                  let textClass = 'text-slate-400';
                  let borderClass = 'border-slate-100 bg-white/40';

                  if (status === 'completed') {
                    icon = <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />;
                    textClass = 'text-slate-700 font-bold';
                    borderClass = 'border-emerald-100 bg-emerald-50/20';
                  } else if (status === 'active') {
                    icon = <Cpu className="h-3.5 w-3.5 text-[#FF6B35] animate-pulse" />;
                    textClass = 'text-[#0F172A] font-extrabold';
                    borderClass = 'border-orange-200 bg-white';
                  } else if (status === 'failed') {
                    icon = <AlertCircle className="h-3.5 w-3.5 text-rose-500" />;
                    textClass = 'text-rose-600';
                    borderClass = 'border-rose-100 bg-rose-50/20';
                  }

                  return (
                    <div
                      key={step.key}
                      className={`flex gap-3 p-2.5 border rounded-xl items-start transition-all duration-300 ${borderClass}`}
                    >
                      <div className="mt-0.5 shrink-0">{icon}</div>
                      <div className="flex flex-col">
                        <span className={`text-[10px] ${textClass}`}>{step.label}</span>
                        <span className="text-[8px] text-slate-400 mt-0.5 font-bold leading-tight">{step.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
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
