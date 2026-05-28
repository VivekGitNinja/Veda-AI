'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Menu, X, LayoutGrid, Users, FolderOpen, Sparkles, Settings, Search, LogOut, ShieldAlert } from 'lucide-react';
import Sidebar from '../Sidebar';
import { useAssignmentStore } from '../../store/useAssignmentStore';

interface MobileAppLayoutProps {
  children: React.ReactNode;
  activeSection?: 'home' | 'groups' | 'assignments' | 'toolkit' | 'library' | 'settings';
  isPaperView?: boolean;
}

export default function MobileAppLayout({ children, activeSection = 'assignments', isPaperView = false }: MobileAppLayoutProps) {
  const router = useRouter();
  const { 
    assignmentsList, 
    profile, 
    libraryItems, 
    groupsList, 
    searchQuery, 
    setSearchQuery, 
    lastCheckedCounts, 
    markSectionAsChecked,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useAssignmentStore();

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

  const lastCheckedGroups = lastCheckedCounts['groups'];
  const groupsBadgeCount = lastCheckedGroups !== undefined ? Math.max(0, realGroupsCount - lastCheckedGroups) : realGroupsCount;

  const lastCheckedLibrary = lastCheckedCounts['library'];
  const libraryBadgeCount = lastCheckedLibrary !== undefined ? Math.max(0, realLibraryCount - lastCheckedLibrary) : realLibraryCount;

  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Responsive interactive UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  // Mobile mock notifications
  const [showMobileNotifs, setShowMobileNotifs] = useState(false);

  const handleNavClick = (tab: string) => {
    const viewMap: Record<string, string> = {
      home: 'dashboard',
      assignments: 'dashboard',
      groups: 'groups',
      toolkit: 'create',
      library: 'library',
      settings: 'settings',
    };
    const targetView = viewMap[tab];
    if (targetView) {
      setSearchQuery('');
      router.push(`/?view=${targetView}`);
      setIsDrawerOpen(false);
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'home':
      case 'assignments':
        return 'Assignments';
      case 'groups':
        return 'My Groups';
      case 'toolkit':
        return "AI Teacher's Toolkit";
      case 'library':
        return 'My Library';
      case 'settings':
        return 'Settings';
      default:
        return 'VedaAI';
    }
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[#000000] lg:bg-[#F8FAFC] text-slate-100 lg:text-slate-800 flex font-sans">
      
      {/* =========================================================================
          DESKTOP LAYOUT (Screens >= 1024px)
          ========================================================================= */}
      <div className="hidden lg:flex flex-row w-full h-full overflow-hidden">
        
        {/* Persistent left sidebar — never scrolls */}
        <Sidebar activeSection={activeSection} isPaperView={isPaperView} />
        
        {/* Main Workspace content — only this column scrolls */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
          
          {/* Desktop Top Header Bar — sticky, never scrolls */}
          <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shrink-0 select-none">
            
            {/* Section path indicator */}
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#FF6B35]" />
              <h1 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
                {getSectionTitle()}
              </h1>
            </div>

            {/* Desktop Top bar controls */}
            <div className="flex items-center gap-6">
              
              {/* Search bar inside top navigation */}
              <div className="relative w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Quick search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/40"
                />
              </div>

              {/* Notification bell dropdown trigger */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowBellDropdown(!showBellDropdown);
                    setShowProfileDropdown(false);
                  }}
                  className="relative p-2 hover:bg-slate-100 rounded-full text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                >
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-[#FF6B35] border border-white" />
                  )}
                  <Bell className="h-4.5 w-4.5 stroke-[2.2]" />
                </button>

                {/* Notifications dropdown card */}
                {showBellDropdown && (
                  <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200/90 rounded-[20px] shadow-2xl z-50 py-3 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Notifications</span>
                        <span className="text-[9px] bg-orange-50 text-[#FF6B35] font-extrabold px-1.5 py-0.5 rounded">
                          {unreadCount} New
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            markAllNotificationsAsRead();
                          }}
                          className="text-[9px] text-[#FF6B35] hover:underline font-black cursor-pointer bg-transparent border-none p-0"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-[10px] text-slate-400 font-bold">No notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => markNotificationAsRead(n.id)}
                            className={`p-3 transition-colors flex flex-col gap-0.5 cursor-pointer ${
                              n.read ? 'bg-white hover:bg-slate-50' : 'bg-[#FFF9F6] hover:bg-[#FFF3EC]'
                            }`}
                          >
                            <div className="flex items-start gap-1.5">
                              {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B35] mt-1 shrink-0" />}
                              <p className={`text-[10px] leading-relaxed ${
                                n.read ? 'text-slate-400 font-bold' : 'text-slate-800 font-black'
                              }`}>
                                {n.text}
                              </p>
                            </div>
                            <span className={`text-[8px] text-slate-400 font-medium ${!n.read ? 'pl-3' : ''}`}>{n.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* School badge */}
              <div 
                onClick={() => router.push('/?view=settings')}
                className="hidden lg:flex flex-col text-right cursor-pointer hover:opacity-80 transition-opacity select-none"
              >
                <span className="text-xs font-black text-slate-800">{profile.schoolName}</span>
                <span className="text-[9px] text-slate-400 font-bold">{profile.schoolBranch}</span>
              </div>

              {/* Avatar menu dropdown trigger */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfileDropdown(!showProfileDropdown);
                    setShowBellDropdown(false);
                  }}
                  className="h-8.5 w-8.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-sm hover:scale-105 transition-transform cursor-pointer select-none"
                >
                  {profile.schoolLogo ? (
                    <img src={profile.schoolLogo} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    '🐵'
                  )}
                </button>

                {/* Profile actions dropdown card */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2.5 w-48 bg-white border border-slate-200/90 rounded-[20px] shadow-2xl z-50 py-1.5 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-black text-slate-800">{profile.teacherName}</p>
                      <p className="text-[9px] text-slate-400 font-bold truncate">{profile.teacherEmail}</p>
                    </div>
                    <button onClick={() => router.push('/?view=settings')} className="w-full flex items-center gap-2 px-4 py-2 text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-left transition-colors cursor-pointer">
                      <LayoutGrid className="h-3.5 w-3.5 text-slate-400" />
                      <span>Admin Dashboard</span>
                    </button>
                    <button onClick={() => router.push('/?view=settings')} className="w-full flex items-center gap-2 px-4 py-2 text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-left transition-colors cursor-pointer">
                      <Settings className="h-3.5 w-3.5 text-slate-400" />
                      <span>System Settings</span>
                    </button>
                    <div className="h-px bg-slate-100 my-1" />
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-[10px] font-bold text-rose-600 hover:bg-rose-50 text-left transition-colors cursor-pointer">
                      <LogOut className="h-3.5 w-3.5 text-rose-400" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </header>

          {/* Desktop workspace body — ONLY this area scrolls */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className={`${isPaperView ? 'max-w-[1250px]' : 'max-w-5xl'} mx-auto pb-8`}>
              {children}
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          MOBILE & TABLET VIEWPORTS (Screens < 1024px)
          True fixed shell: header + scrollable content + fixed bottom nav
          ========================================================================= */}
      <div className="flex lg:hidden flex-col w-full h-full bg-[#000000] overflow-x-hidden overflow-y-hidden">
        
        {/* ── FIXED TOP HEADER ── always visible, never scrolls away */}
        <div className="shrink-0 z-20 px-4 pt-3 pb-1">
          <header className="bg-white text-slate-900 rounded-2xl h-12 px-4 flex items-center justify-between shadow-sm border border-slate-200/60 select-none">
            {/* Logo + Brand name */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
              <div className="h-6.5 w-6.5 overflow-hidden shrink-0 rounded-[6px]">
                <img src="/logo.jpeg" alt="VedaAI Logo" className="h-full w-full object-cover" />
              </div>
              <span className="font-extrabold text-[15px] tracking-tight text-[#0F172A]">VedaAI</span>
            </div>

            {/* Notification Bell, Avatar, Hamburger Menu on Right */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div 
                className="relative p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-700"
                onClick={() => setShowMobileNotifs(!showMobileNotifs)}
              >
                {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-[#FF6B35]" />}
                <Bell className="h-4 w-4 stroke-[2.5]" />
              </div>

              {/* Avatar circle */}
              <div 
                onClick={() => router.push('/?view=settings')}
                className="h-6.5 w-6.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-xs cursor-pointer"
              >
                {profile.schoolLogo ? (
                  <img src={profile.schoolLogo} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  '🐵'
                )}
              </div>

              {/* Hamburger Menu Icon */}
              <button 
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-700 focus:outline-none"
              >
                {isDrawerOpen ? <X className="h-4.5 w-4.5 stroke-[2.5]" /> : <Menu className="h-4.5 w-4.5 stroke-[2.5]" />}
              </button>
            </div>
          </header>
        </div>

        {/* Mobile Notification Dropdown */}
        {showMobileNotifs && (
          <div className="absolute top-22 left-4 right-4 bg-white text-slate-900 border border-slate-200 rounded-[20px] shadow-2xl z-40 p-4 animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400">Notifications</span>
                <span className="text-[9px] bg-orange-50 text-[#FF6B35] font-extrabold px-1.5 py-0.5 rounded">
                  {unreadCount} New
                </span>
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllNotificationsAsRead();
                    }}
                    className="text-[9px] text-[#FF6B35] hover:underline font-black cursor-pointer bg-transparent border-none p-0"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setShowMobileNotifs(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center text-[10px] text-slate-400 font-bold py-2">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => markNotificationAsRead(n.id)}
                    className="text-[9.5px] leading-relaxed border-b border-slate-50 pb-2 last:border-b-0 last:pb-0 cursor-pointer"
                  >
                    <div className="flex items-start gap-1">
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B35] mt-1 shrink-0" />}
                      <p className={n.read ? 'text-slate-400 font-bold' : 'text-slate-700 font-black'}>
                        {n.text}
                      </p>
                    </div>
                    <span className={`text-[8px] text-slate-400 font-medium ${!n.read ? 'pl-2.5' : ''}`}>{n.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Drawer overlay */}
        {isDrawerOpen && (
          <div className="absolute inset-0 bg-black/60 z-40" onClick={() => setIsDrawerOpen(false)}>
            <div 
              className="absolute right-0 top-0 bottom-0 w-64 bg-[#18181B] border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                {/* Drawer logo header */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#FF6B35]" />
                    <span className="font-extrabold text-[13px] tracking-wider text-white uppercase">VedaAI Menu</span>
                  </div>
                  <button onClick={() => setIsDrawerOpen(false)} className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Drawer navigation links */}
                <nav className="space-y-1.5">
                  {[
                    { id: 'home', label: 'Home Dashboard', icon: LayoutGrid, count: realAssignmentsCount },
                    { id: 'groups', label: 'My Groups', icon: Users, count: realGroupsCount },
                    { id: 'library', label: 'My Library', icon: FolderOpen, count: realLibraryCount },
                    { id: 'toolkit', label: "AI Teacher's Toolkit", icon: Sparkles },
                    { id: 'settings', label: 'System Settings', icon: Settings },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id || (item.id === 'home' && activeSection === 'assignments');
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                          isActive 
                            ? 'bg-[#FF6B35] text-white' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <Icon className="h-4.5 w-4.5 shrink-0" />
                          <span>{item.label}</span>
                        </div>
                        {item.count !== undefined && item.count !== null && (
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full min-w-[20px] text-center ${
                            isActive ? 'bg-white text-[#FF6B35]' : 'bg-[#FF6B35] text-white'
                          }`}>
                            {item.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer footer */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <div 
                  onClick={() => {
                    router.push('/?view=settings');
                    setIsDrawerOpen(false);
                  }}
                  className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 select-none"
                >
                  <div className="h-7 w-7 rounded-lg bg-orange-50 flex items-center justify-center text-xs">
                    🎓
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white">{profile.schoolName}</span>
                    <span className="text-[8px] text-slate-500 font-bold">{profile.schoolBranch}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SCROLLABLE CONTENT AREA ── fills remaining space between header and bottom nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-4 pt-3 pb-4 bg-[#000000] min-h-0">
          <div className="max-w-2xl mx-auto pb-20">
            {children}
          </div>
        </div>

        {/* ── FIXED BOTTOM NAV ── always visible, pinned to the bottom of the screen */}
        <div className="shrink-0 px-4 py-3 bg-[#000000] border-t border-white/5 z-30 select-none">
          <div className="max-w-md mx-auto">
            <nav className="bg-[#18181B] rounded-full px-5 py-2.5 flex justify-between items-center border border-slate-800/80 shadow-2xl">
              {/* Home Tab */}
              <button
                onClick={() => handleNavClick('home')}
                className={`flex flex-col items-center gap-0.5 flex-1 transition-colors cursor-pointer ${
                  activeSection === 'assignments' || activeSection === 'home' ? 'text-white' : 'text-[#71717A] hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="text-[9px] font-bold">Home</span>
              </button>

              {/* My Groups Tab */}
              <button
                onClick={() => handleNavClick('groups')}
                className={`flex flex-col items-center gap-0.5 flex-1 transition-colors cursor-pointer relative ${
                  activeSection === 'groups' ? 'text-white' : 'text-[#71717A] hover:text-slate-200'
                }`}
              >
                <Users className="h-4 w-4" />
                <span className="text-[9px] font-bold">My Groups</span>
                {groupsBadgeCount > 0 && (
                  <span className="absolute -top-1.5 right-1.5 bg-[#FF6B35] text-white text-[7px] font-extrabold px-1.5 py-0.5 rounded-full">
                    {groupsBadgeCount}
                  </span>
                )}
              </button>

              {/* My Library Tab */}
              <button
                onClick={() => handleNavClick('library')}
                className={`flex flex-col items-center gap-0.5 flex-1 transition-colors cursor-pointer relative ${
                  activeSection === 'library' ? 'text-white' : 'text-[#71717A] hover:text-slate-200'
                }`}
              >
                <FolderOpen className="h-4 w-4" />
                <span className="text-[9px] font-bold">Library</span>
                {libraryBadgeCount > 0 && (
                  <span className="absolute -top-1.5 right-1.5 bg-[#FF6B35] text-white text-[7px] font-extrabold px-1.5 py-0.5 rounded-full">
                    {libraryBadgeCount}
                  </span>
                )}
              </button>

              {/* AI Toolkit Tab */}
              <button
                onClick={() => handleNavClick('toolkit')}
                className={`flex flex-col items-center gap-0.5 flex-1 transition-colors cursor-pointer ${
                  activeSection === 'toolkit' ? 'text-white' : 'text-[#71717A] hover:text-slate-200'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-[9px] font-bold">AI Toolkit</span>
              </button>
            </nav>
          </div>
        </div>

      </div>

    </div>
  );
}
