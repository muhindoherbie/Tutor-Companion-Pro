import React, { useState, useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { DashboardScreen } from './features/dashboard/DashboardScreen';
import { ClassesScreen } from './features/classes/ClassesScreen';
import { ClassDetailScreen } from './features/classes/ClassDetailScreen';
import { CurriculumIngestionScreen } from './features/curriculum/CurriculumIngestionScreen';
import { LectureNotesStudioScreen } from './features/notes/LectureNotesStudioScreen';
import { AssessmentsStudioScreen } from './features/assessments/AssessmentsStudioScreen';
import { StudentsScreen } from './features/students/StudentsScreen';
import { DeepSolveScreen } from './features/deepsolve/DeepSolveScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { NavigationLocation } from './types';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.hash ? window.location.hash.replace(/^#/, '') || '/' : '/';
  });

  const [activeUnitId, setActiveUnitId] = useState<string | undefined>(undefined);
  const [activeClassIdForStudents, setActiveClassIdForStudents] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleHashChange = () => {
      const hashPath = window.location.hash.replace(/^#/, '') || '/';
      setCurrentPath(hashPath);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
  };

  // Determine dynamic title for AppShell
  let screenTitle = 'Dashboard';
  if (currentPath === '/curriculum') {
    screenTitle = 'Curriculum Ingestion';
  } else if (currentPath === '/classes') {
    screenTitle = 'Academic Classes';
  } else if (currentPath.startsWith('/classes/')) {
    screenTitle = 'Class Details & Units';
  } else if (currentPath === '/notes') {
    screenTitle = 'Lecture Notes Studio';
  } else if (currentPath === '/assessments') {
    screenTitle = 'Assessments & Examination Studio';
  } else if (currentPath === '/students') {
    screenTitle = 'Students & Academic Gradebook';
  } else if (currentPath === '/deepsolve') {
    screenTitle = 'Deep Solve Assistant';
  } else if (currentPath === '/settings') {
    screenTitle = 'Settings & Workspace Sync';
  }

  // Parse class ID if route is /classes/:id
  const classIdMatch = currentPath.match(/^\/classes\/([^/]+)$/);
  const selectedClassId = classIdMatch ? classIdMatch[1] : null;

  return (
    <AppShell
      currentPath={currentPath}
      onNavigate={(path: NavigationLocation) => navigateTo(path)}
      title={screenTitle}
    >
      {selectedClassId ? (
        <ClassDetailScreen
          classId={selectedClassId}
          onNavigateBack={() => navigateTo('/classes')}
          onNavigateToNotes={(unitId) => {
            setActiveUnitId(unitId);
            navigateTo('/notes');
          }}
          onNavigateToAssessments={(unitId) => {
            setActiveUnitId(unitId);
            navigateTo('/assessments');
          }}
          onNavigateToStudents={(classId) => {
            setActiveClassIdForStudents(classId);
            navigateTo('/students');
          }}
        />
      ) : currentPath === '/curriculum' ? (
        <CurriculumIngestionScreen
          onNavigateToClasses={() => navigateTo('/classes')}
          onSelectClass={(id) => navigateTo(`/classes/${id}`)}
        />
      ) : currentPath === '/classes' ? (
        <ClassesScreen onSelectClass={(id) => navigateTo(`/classes/${id}`)} />
      ) : currentPath === '/notes' ? (
        <LectureNotesStudioScreen
          initialUnitId={activeUnitId}
          onSelectUnit={(id) => setActiveUnitId(id)}
        />
      ) : currentPath === '/assessments' ? (
        <AssessmentsStudioScreen
          initialUnitId={activeUnitId}
        />
      ) : currentPath === '/students' ? (
        <StudentsScreen
          initialClassId={activeClassIdForStudents}
          onSelectClass={(id) => setActiveClassIdForStudents(id)}
        />
      ) : currentPath === '/deepsolve' ? (
        <DeepSolveScreen />
      ) : currentPath === '/settings' ? (
        <SettingsScreen />
      ) : (
        <DashboardScreen
          onNavigateToClasses={() => navigateTo('/classes')}
          onSelectClass={(id) => navigateTo(`/classes/${id}`)}
          onNavigateToCurriculum={() => navigateTo('/curriculum')}
          onNavigateToNotes={() => navigateTo('/notes')}
          onNavigateToAssessments={() => navigateTo('/assessments')}
          onNavigateToStudents={() => navigateTo('/students')}
          onNavigateToDeepSolve={() => navigateTo('/deepsolve')}
        />
      )}
    </AppShell>
  );
};
