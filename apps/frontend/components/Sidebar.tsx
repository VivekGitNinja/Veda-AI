'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Users, FileText, Sparkles, FolderOpen, Settings } from 'lucide-react';
import { useAssignmentStore } from '../store/useAssignmentStore';

interface SidebarProps {
  activeSection?: 'home' | 'groups' | 'assignments' | 'toolkit' | 'library' | 'settings';
  isPaperView?: boolean;
  onViewChange?: (view: 'dashboard' | 'create' | 'groups' | 'library' | 'settings') => void;
}

export default function Sidebar({ activeSection = 'assignments', isPaperView = false, onViewChange }: SidebarProps) {
  const router = useRouter();
  const { assignmentsList, profile, libraryItems, groupsList, lastCheckedCounts, markSectionAsChecked } = useAssignmentStore();

  const realAssignmentsCount = assignmentsList.filter(a => !a._id?.startsWith('mock-')).length;
  const realLibraryCount = libraryItems.length;
  const realGroupsCount = groupsList.length;

  React.useEffect(() => {
    if (activeSection === 'groups') {
      markSectionAsChecked('groups', realGroupsCount);
    } else if (activeSection === 'assignments' || activeSection === 'home') {
      markSectionAsChecked('assignments', realAssignmentsCount);
    } else if (activeSection === 'library') {
      markSectionAsChecked('library', realLibraryCount);
    }
  }, [activeSection, realGroupsCount, realAssignmentsCount, realLibraryCount]);

  const navItems = [
    { id: 'home', label: 'Home', icon: LayoutGrid },
    { id: 'groups', label: 'My Groups', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'toolkit', label: "AI Teacher's Toolkit", icon: Sparkles },
    { id: 'library', label: 'My Library', icon: FolderOpen },
  ];

  const handlePrimaryAction = () => {
    if (onViewChange) {
      onViewChange('create');
    } else {
      router.push('/?view=create');
    }
  };

  const handleNavClick = (id: string) => {
    const viewMap: Record<string, 'dashboard' | 'create' | 'groups' | 'library' | 'settings'> = {
      home: 'dashboard',
      assignments: 'dashboard',
      groups: 'groups',
      toolkit: 'create',
      library: 'library',
      settings: 'settings',
    };

    const targetView = viewMap[id];
    if (targetView) {
      if (onViewChange) {
        onViewChange(targetView);
      } else {
        router.push(`/?view=${targetView}`);
      }
    }
  };

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 hidden lg:flex h-full select-none overflow-y-auto no-scrollbar">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
          <div className="h-9 w-9 overflow-hidden shrink-0 rounded-xl">
            <img src="/logo.jpeg" alt="VedaAI Logo" className="h-full w-full object-cover" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-[#0F172A]">
            VedaAI
          </span>
        </div>

        {/* Primary Action Button directly below header */}
        <div className="px-4 py-4">
          <button
            onClick={handlePrimaryAction}
            className="w-full flex items-center justify-center gap-2 bg-[#2E3035] hover:bg-[#1E2022] text-white font-extrabold text-xs py-3 px-4 rounded-full border-2 border-[#FF6B35] shadow-lg shadow-orange-500/10 cursor-pointer transition-all active:scale-98"
          >
            <Sparkles className="h-4.5 w-4.5 text-[#FF6B35] fill-[#FF6B35]" />
            <span>{isPaperView ? "AI Teacher's Toolkit" : "Create Assignment"}</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;

            let badgeCount = 0;
            if (item.id === 'groups') {
              const lastChecked = lastCheckedCounts['groups'];
              badgeCount = lastChecked !== undefined ? Math.max(0, realGroupsCount - lastChecked) : realGroupsCount;
            } else if (item.id === 'assignments') {
              const lastChecked = lastCheckedCounts['assignments'];
              badgeCount = lastChecked !== undefined ? Math.max(0, realAssignmentsCount - lastChecked) : realAssignmentsCount;
            } else if (item.id === 'library') {
              const lastChecked = lastCheckedCounts['library'];
              badgeCount = lastChecked !== undefined ? Math.max(0, realLibraryCount - lastChecked) : realLibraryCount;
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#0F172A] bg-[#F1F5F9]'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-[#FF6B35]' : 'text-slate-400'}`} />
                  <span className="flex items-center gap-1.5">
                    <span>{item.label}</span>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B35]" />}
                  </span>
                </div>
                {badgeCount > 0 && (
                  <span className="bg-[#FF6B35] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile & Settings block */}
      <div className="flex flex-col">
        <div className="px-4 pb-2">
          <button 
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSection === 'settings' 
                ? 'text-[#0F172A] bg-[#F1F5F9]' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-[#F8FAFC]'
            }`}
          >
            <Settings className={`h-4.5 w-4.5 ${activeSection === 'settings' ? 'text-[#FF6B35]' : 'text-slate-400'}`} />
            <span className="flex items-center gap-1.5">
              <span>Settings</span>
              {activeSection === 'settings' && <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B35]" />}
            </span>
          </button>
        </div>
        
        {/* Figma School Profile Card */}
        <div 
          onClick={() => handleNavClick('settings')}
          className="p-4 border-t border-slate-100 flex items-center gap-3 bg-slate-50/50 hover:bg-slate-100/80 cursor-pointer transition-colors"
        >
          <div className="h-9 w-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center overflow-hidden shrink-0">
            {profile.schoolLogo ? (
              <img src={profile.schoolLogo} alt="School Logo" className="h-full w-full object-cover" />
            ) : isPaperView ? (
              <div className="h-full w-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-extrabold text-sm">
                🎓
              </div>
            ) : (
              <div className="h-full w-full bg-orange-100 flex items-center justify-center text-lg">
                🐵
              </div>
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-extrabold text-[#0F172A] truncate">{profile.schoolName}</span>
            <span className="text-[10px] text-slate-500 font-semibold truncate">{profile.schoolBranch}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
