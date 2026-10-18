import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  School,
  BookOpen,
  Award,
  Users,
  Bot,
  Settings,
  Search,
  Package,
} from 'lucide-react';
import { ConnectivityBadge } from './ConnectivityBadge';
import { ReleaseModal } from './ReleaseModal';
import { QuickSearchModal } from './QuickSearchModal';
import { NavigationLocation } from '../types';

interface AppShellProps {
  currentPath: NavigationLocation | string;
  onNavigate: (path: NavigationLocation) => void;
  title: string;
  children: React.ReactNode;
}

interface NavItem {
  path: NavigationLocation;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/curriculum', label: 'Curriculum Ingestion', icon: Sparkles },
  { path: '/classes', label: 'Classes & Units', icon: School },
  { path: '/notes', label: 'Lecture Notes Studio', icon: BookOpen },
  { path: '/assessments', label: 'Assessments & Exams', icon: Award },
  { path: '/students', label: 'Student Gradebook', icon: Users },
  { path: '/deepsolve', label: 'Deep Solve Assistant', icon: Bot },
  { path: '/settings', label: 'Settings & Cloud Sync', icon: Settings },
];

export const AppShell: React.FC<AppShellProps> = ({
  currentPath,
  onNavigate,
  title,
  children,
}) => {
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Global Ctrl+K / Cmd+K shortcut for quick search & custom open-release event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    const handleOpenRelease = () => {
      setIsReleaseModalOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-release-modal', handleOpenRelease);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-release-modal', handleOpenRelease);
    };
  }, []);

  const isSelected = (path: NavigationLocation) => {
    if (path === '/classes') {
      return currentPath.startsWith('/classes');
    }
    return currentPath === path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#00696f]/15">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6">
        {/* Zone 1: Single Brand element */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#00696f] text-white flex items-center justify-center font-extrabold text-sm shadow-xs group-hover:bg-[#005358] transition-colors">
              TC
            </div>
            <div className="whitespace-nowrap">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-[#00696f] transition-colors">
                Tutor Companion
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Search Affordance & Quick Breadcrumb */}
        <div className="flex-1 max-w-md hidden md:flex items-center">
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 bg-slate-100/90 hover:bg-slate-200/80 text-slate-500 rounded-xl text-xs font-medium border border-slate-200/80 transition-all shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search classes, units, students, exams...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white rounded border border-slate-200 shadow-2xs">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Zone 3: Primary Action (.exe/.apk release) & Network Status */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsReleaseModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
          >
            <Package className="w-3.5 h-3.5 text-teal-300" />
            <span className="hidden sm:inline">Release</span>
            <span className="font-mono text-[11px] text-teal-200">.exe / .apk</span>
          </button>

          <ConnectivityBadge />
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (lg:flex) */}
        <nav className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 py-5 px-3.5 gap-1 shrink-0 select-none">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2 pt-0.5">
            Academic Operations
          </div>
          {NAV_ITEMS.map((item) => {
            const active = isSelected(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all text-left ${
                  active
                    ? 'bg-[#00696f] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    active ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* Quick Release Banner in Sidebar */}
          <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => setIsReleaseModalOpen(true)}
              className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-colors group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-0.5">
                <span>Release Packages</span>
                <span className="font-mono text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded">v1.0.0</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Windows .exe & Android .apk packaging ready.
              </p>
            </button>

            <div className="px-3 text-[11px] text-slate-400">
              <span>Offline-First · </span>
              <span className="font-mono tabular-nums">Unlimited Workspace</span>
            </div>
          </div>
        </nav>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-8 bg-[#f8fafc]">
          {/* Breadcrumb strip for active view */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-1 hidden sm:flex items-center justify-between text-xs text-slate-400 border-b border-slate-200/40 mb-4">
            <div className="flex items-center gap-2">
              <span className="hover:text-slate-600 cursor-pointer" onClick={() => onNavigate('/')}>
                Home
              </span>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-slate-800">{title}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Tutor Companion Academic Suite
            </div>
          </div>

          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (< lg breakpoint) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 h-16 flex items-center justify-around px-1 overflow-x-auto shadow-lg">
        {NAV_ITEMS.map((item) => {
          const active = isSelected(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`flex flex-col items-center justify-center min-w-[50px] flex-1 py-1.5 transition-colors ${
                active ? 'text-[#00696f]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span
                className={`text-[9.5px] truncate max-w-[58px] ${
                  active ? 'font-bold text-[#00696f]' : 'font-normal'
                }`}
              >
                {item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Modals */}
      <ReleaseModal
        isOpen={isReleaseModalOpen}
        onClose={() => setIsReleaseModalOpen(false)}
      />
      <QuickSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onNavigate={(path) => onNavigate(path as any)}
      />
    </div>
  );
};
