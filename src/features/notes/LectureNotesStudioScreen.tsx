import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Presentation,
  FileText,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  FileDown,
  ChevronRight,
} from 'lucide-react';
import {
  useAllUnits,
  useTopicsForUnit,
  useReferencesForUnit,
  useNotesForUnit,
  dbService,
} from '../../services/database';
import {
  exportLectureNotesToPPTX,
  exportLectureNotesToDOCX,
  exportLectureNotesToPDF,
} from '../../services/exporters';
import { LectureNoteRow } from '../../types';

interface LectureNotesStudioScreenProps {
  initialUnitId?: string;
  onSelectUnit?: (unitId: string) => void;
}

export const LectureNotesStudioScreen: React.FC<LectureNotesStudioScreenProps> = ({
  initialUnitId,
  onSelectUnit,
}) => {
  const units = useAllUnits();
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    initialUnitId || (units[0]?.id ?? '')
  );

  const selectedUnit = units.find((u) => u.id === selectedUnitId);
  const topics = useTopicsForUnit(selectedUnitId);
  const references = useReferencesForUnit(selectedUnitId);
  const savedNotes = useNotesForUnit(selectedUnitId);

  const [selectedTopicName, setSelectedTopicName] = useState<string>('');
  const [contactHours, setContactHours] = useState<number>(2);
  const [activeTab, setActiveTab] = useState<'notes' | 'slides' | 'activities' | 'saved'>('notes');

  // Generating state
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<LectureNoteRow | null>(savedNotes[0] || null);

  // New reference modal
  const [isAddRefOpen, setIsAddRefOpen] = useState(false);
  const [newRefName, setNewRefName] = useState('');
  const [newRefContent, setNewRefContent] = useState('');
  const [exportingType, setExportingType] = useState<string | null>(null);

  const handleUnitChange = (id: string) => {
    setSelectedUnitId(id);
    onSelectUnit?.(id);
    setSelectedTopicName('');
    const unitNotes = dbService.getNotesForUnit(id);
    setActiveNote(unitNotes[0] || null);
  };

  const handleAddSampleReference = () => {
    if (!selectedUnitId) return;
    dbService.addReference({
      courseUnitId: selectedUnitId,
      fileName: 'Clinical_Guidelines_and_Pharmacopeia_Compendium.pdf',
      fileType: 'pdf',
      extractedText:
        'Official Clinical Guidelines: All systemic pharmacological interventions require evaluation of renal and hepatic clearance. Therapeutic range monitoring is recommended for narrow therapeutic index drugs. Dosage calculations must account for lean body mass and pediatric age milestones. Standard infusion formulas: Rate (mL/hr) = Total Volume / Time (hrs). Drip rate (gtt/min) = (Total Volume * Drop Factor) / (Time in minutes).',
      fileSize: '3.8 MB',
    });
  };

  const handleSaveReference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId || !newRefName.trim() || !newRefContent.trim()) return;
    dbService.addReference({
      courseUnitId: selectedUnitId,
      fileName: newRefName.trim(),
      fileType: newRefName.endsWith('.docx') ? 'docx' : newRefName.endsWith('.pptx') ? 'pptx' : 'pdf',
      extractedText: newRefContent.trim(),
    });
    setNewRefName('');
    setNewRefContent('');
    setIsAddRefOpen(false);
  };

  const handleGenerateNotes = async () => {
    if (!selectedUnit) return;
    const topicToUse =
      selectedTopicName || (topics[0]?.name ?? selectedUnit.title + ' Core Foundations');

    setGenerating(true);
    setError(null);

    // Combine uploaded references text
    const combinedRefs = references.map((r) => `[Source: ${r.fileName}]\n${r.extractedText}`).join('\n\n');

    try {
      const res = await fetch('/api/ai/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitTitle: selectedUnit.title,
          unitCode: selectedUnit.code,
          topicName: topicToUse,
          contactHours: contactHours || 2,
          objectives: selectedUnit.objectives,
          curriculumContext: selectedUnit.curriculum,
          referencesText: combinedRefs || 'Standard accredited medical/academic curriculum reference material.',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Server error ' + res.status);
      }

      const generated = await res.json();

      const saved = dbService.saveLectureNote({
        courseUnitId: selectedUnit.id,
        topicId: topics.find((t) => t.name === topicToUse)?.id,
        title: generated.title || `${topicToUse} (Lecture Notes)`,
        contactHours: generated.contactHours || contactHours,
        summary: generated.summary,
        learningOutcomes: generated.learningOutcomes,
        modulesByHour: generated.modulesByHour,
        fullMarkdownNotes: generated.fullMarkdownNotes,
        slides: generated.slides,
        citedReferences: references.map((r) => r.fileName),
      });

      setActiveNote(saved);
      setActiveTab('notes');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate lecture notes.');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPPTX = async () => {
    if (!activeNote || !selectedUnit) return;
    setExportingType('pptx');
    try {
      await exportLectureNotesToPPTX(activeNote, selectedUnit.title);
    } finally {
      setExportingType(null);
    }
  };

  const handleExportDOCX = async () => {
    if (!activeNote || !selectedUnit) return;
    setExportingType('docx');
    try {
      await exportLectureNotesToDOCX(activeNote, selectedUnit.title);
    } finally {
      setExportingType(null);
    }
  };

  const handleExportPDF = () => {
    if (!activeNote || !selectedUnit) return;
    setExportingType('pdf');
    try {
      exportLectureNotesToPDF(activeNote, selectedUnit.title);
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-[#00696f]" />
            <span>Lecture Notes Studio</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Generate comprehensive lecture notes organized strictly by curriculum contact hours,
            synthesized from uploaded reference documents, and ready to export to PowerPoint, Word,
            or PDF.
          </p>
        </div>
      </div>

      {/* Course Unit & Configuration Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Select Course Unit
            </label>
            <select
              value={selectedUnitId}
              onChange={(e) => handleUnitChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f] bg-white font-medium"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.code ? `${u.code} — ` : ''}
                  {u.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Target Topic
            </label>
            {topics.length > 0 ? (
              <select
                value={selectedTopicName}
                onChange={(e) => setSelectedTopicName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f] bg-white"
              >
                <option value="">All / Comprehensive Unit Foundations</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.contactHours || 2}h)
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Enter topic name..."
                value={selectedTopicName}
                onChange={(e) => setSelectedTopicName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f]"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Contact Hours Allocated
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={20}
                value={contactHours}
                onChange={(e) => setContactHours(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f]"
              />
              <span className="text-xs text-slate-500 font-medium shrink-0">Hours</span>
            </div>
          </div>
        </div>

        {/* References Section */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Attached Reference Documents ({references.length})
              </span>
              <span className="text-[11px] text-slate-400">
                (Textbooks, guidelines & papers parsed to ground notes)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddSampleReference}
                className="text-xs text-[#00696f] hover:underline"
              >
                + Add Sample Clinical Guide
              </button>
              <button
                type="button"
                onClick={() => setIsAddRefOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Reference</span>
              </button>
            </div>
          </div>

          {references.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              No custom references uploaded yet. Notes will be generated based on curriculum standards.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {references.map((r) => (
                <div
                  key={r.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
                >
                  <FileText className="w-3.5 h-3.5 text-[#00696f]" />
                  <span className="font-medium truncate max-w-[220px]">{r.fileName}</span>
                  <button
                    onClick={() => dbService.deleteReference(r.id)}
                    className="text-slate-400 hover:text-red-500 p-0.5"
                    title="Remove reference"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">
            {savedNotes.length} saved lecture notes in this unit
          </span>
          <button
            onClick={handleGenerateNotes}
            disabled={generating || !selectedUnit}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00696f] hover:bg-[#005358] text-white rounded-xl text-sm font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Grounded Notes by Contact Hours...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Lecture Notes from References</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Notes Viewer & Export Bar */}
      {activeNote ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Top Bar with Title & Multi-Format Exporters */}
          <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d2ecee] text-[#004d52]">
                  {activeNote.contactHours} Contact Hours
                </span>
                <span className="text-xs text-slate-400">
                  Updated {new Date(activeNote.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{activeNote.title}</h2>
            </div>

            {/* Document Export Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportPPTX}
                disabled={Boolean(exportingType)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors shadow-2xs"
                title="Download as Microsoft PowerPoint slides"
              >
                <Presentation className="w-4 h-4" />
                <span>{exportingType === 'pptx' ? 'Exporting...' : 'Export PPT (.pptx)'}</span>
              </button>

              <button
                onClick={handleExportDOCX}
                disabled={Boolean(exportingType)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors shadow-2xs"
                title="Download as Microsoft Word document"
              >
                <FileText className="w-4 h-4" />
                <span>{exportingType === 'docx' ? 'Exporting...' : 'Export Word (.docx)'}</span>
              </button>

              <button
                onClick={handleExportPDF}
                disabled={Boolean(exportingType)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors shadow-2xs"
                title="Download as formatted Adobe PDF"
              >
                <FileDown className="w-4 h-4" />
                <span>{exportingType === 'pdf' ? 'Exporting...' : 'Export PDF (.pdf)'}</span>
              </button>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-100 bg-slate-50/50">
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'notes'
                  ? 'border-[#00696f] text-[#00696f]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Full Lecture Notes
            </button>
            <button
              onClick={() => setActiveTab('slides')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'slides'
                  ? 'border-[#00696f] text-[#00696f]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Slide Presentation ({activeNote.slides?.length || 0} Slides)
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'activities'
                  ? 'border-[#00696f] text-[#00696f]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Hourly Modules & Activities
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'saved'
                  ? 'border-[#00696f] text-[#00696f]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Saved Notes ({savedNotes.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'notes' && (
              <div className="space-y-6 max-w-4xl">
                {activeNote.learningOutcomes && activeNote.learningOutcomes.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#00696f] mb-2">
                      Key Learning Outcomes
                    </h4>
                    <ul className="space-y-1.5">
                      {activeNote.learningOutcomes.map((lo, idx) => (
                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{lo}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed whitespace-pre-line font-sans">
                  {activeNote.fullMarkdownNotes}
                </div>

                {activeNote.citedReferences && activeNote.citedReferences.length > 0 && (
                  <div className="pt-4 border-t border-slate-200 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Cited References: </span>
                    {activeNote.citedReferences.join(' · ')}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'slides' && (
              <div className="space-y-4">
                {activeNote.slides && activeNote.slides.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeNote.slides.map((s, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <span className="text-[11px] font-bold text-[#00696f] uppercase tracking-wider">
                            Slide {s.slideNumber || idx + 1}
                          </span>
                          <span className="text-[11px] text-slate-400">16:9 Deck</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-base">{s.title}</h4>
                        <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-700">
                          {s.bulletPoints.map((bp, bIdx) => (
                            <li key={bIdx}>{bp}</li>
                          ))}
                        </ul>
                        {s.speakerNotes && (
                          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 italic">
                            <span className="font-semibold not-italic text-slate-600">
                              Speaker Notes:{' '}
                            </span>
                            {s.speakerNotes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No slide breakdown generated for this note.</p>
                )}
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="space-y-5">
                {activeNote.modulesByHour && activeNote.modulesByHour.length > 0 ? (
                  activeNote.modulesByHour.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#00696f]" />
                        <h4 className="font-bold text-slate-900 text-sm">{m.hourLabel}</h4>
                      </div>
                      <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                        {m.contentMarkdown}
                      </p>
                      {m.studentActivities && (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                          <span className="font-bold text-[#00696f]">Interactive Activity: </span>
                          <span className="text-slate-700">{m.studentActivities}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No hourly activities recorded.</p>
                )}
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="space-y-3">
                {savedNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      setActiveNote(note);
                      setActiveTab('notes');
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      activeNote.id === note.id
                        ? 'bg-[#d2ecee]/40 border-[#00696f]'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{note.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {note.contactHours} Contact Hours  ·  {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/90 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-800">No lecture notes selected</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            Choose a course unit above and click &quot;Generate Lecture Notes&quot; to synthesize
            comprehensive lesson materials from reference documents.
          </p>
        </div>
      )}

      {/* Upload Reference Modal */}
      {isAddRefOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Add Reference Document</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add excerpts from textbooks, clinical guidelines, or research papers for this course unit.
            </p>

            <form onSubmit={handleSaveReference} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Document / Book Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Goodman_and_Gilman_Pharmacology_Ch4.pdf"
                  value={newRefName}
                  onChange={(e) => setNewRefName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Extracted Material / Notes Content
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste textbook excerpts, definitions, formulas, or guidelines..."
                  value={newRefContent}
                  onChange={(e) => setNewRefContent(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRefOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#00696f] hover:bg-[#005358] rounded-xl shadow-xs"
                >
                  Save Reference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
