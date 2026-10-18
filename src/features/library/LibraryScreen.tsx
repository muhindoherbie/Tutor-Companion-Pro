import React from 'react';
import { BookOpen } from 'lucide-react';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';

export const LibraryScreen: React.FC = () => {
  return (
    <PlaceholderScreen
      icon={BookOpen}
      title="Digital Library"
      phase="Arrives in Phase 2"
      description="Import and organize textbooks, curricula, course outlines, research articles and other teaching materials (PDF, Word, PowerPoint, Excel and images) with full metadata. Materials stored here stay available offline and feed the AI generators in later phases."
    />
  );
};
