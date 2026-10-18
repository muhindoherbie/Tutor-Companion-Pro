import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  Download,
  AlertCircle,
  Database,
  Eye,
  CheckCircle,
} from 'lucide-react';
import {
  useAllUnits,
  useTopicsForUnit,
  useAssessmentsForUnit,
  dbService,
} from '../../services/database';
import { exportAssessmentToDOCX } from '../../services/exporters';
import { AssessmentRow } from '../../types';

interface AssessmentsStudioScreenProps {
  initialUnitId?: string;
}

export const AssessmentsStudioScreen: React.FC<AssessmentsStudioScreenProps> = ({
  initialUnitId,
}) => {
  const units = useAllUnits();
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    initialUnitId || (units[0]?.id ?? '')
  );

  const selectedUnit = units.find((u) => u.id === selectedUnitId);
  const topics = useTopicsForUnit(selectedUnitId);
  const assessments = useAssessmentsForUnit(selectedUnitId);

  // Form state
  const [title, setTitle] = useState('');
  const [assessmentType, setAssessmentType] = useState<'exam' | 'coursework' | 'assignment' | 'quiz'>(
    'exam'
  );
  const [format, setFormat] = useState<'standard' | 'substandard' | 'custom_rubric'>('standard');
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [durationMinutes, setDurationMinutes] = useState<number>(120);
  const [selectedTopicNames, setSelectedTopicNames] = useState<string[]>([]);
  const [referenceExamStandard, setReferenceExamStandard] = useState('');

  // Execution state
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAssessment, setActiveAssessment] = useState<AssessmentRow | null>(
    assessments[0] || null
  );
  const [showMarkingScheme, setShowMarkingScheme] = useState(true);
  const [activeTab, setActiveTab] = useState<'viewer' | 'bank' | 'saved'>('viewer');
  const [savedToBankSuccess, setSavedToBankSuccess] = useState(false);

  const handleUnitChange = (id: string) => {
    setSelectedUnitId(id);
    setSelectedTopicNames([]);
    const unitAssessments = dbService.getAssessmentsForUnit(id);
    setActiveAssessment(unitAssessments[0] || null);
  };

  const toggleTopic = (topicName: string) => {
    if (selectedTopicNames.includes(topicName)) {
      setSelectedTopicNames(selectedTopicNames.filter((t) => t !== topicName));
    } else {
      setSelectedTopicNames([...selectedTopicNames, topicName]);
    }
  };

  const selectAllTopics = () => {
    setSelectedTopicNames(topics.map((t) => t.name));
  };

  const handleGenerateAssessment = async () => {
    if (!selectedUnit) return;

    setGenerating(true);
    setError(null);

    const topicsToAssess =
      selectedTopicNames.length > 0
        ? selectedTopicNames
        : topics.map((t) => t.name);

    try {
      const res = await fetch('/api/ai/generate-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitTitle: selectedUnit.title,
          unitCode: selectedUnit.code,
          assessmentTitle: title || `${selectedUnit.title} ${assessmentType.toUpperCase()}`,
          assessmentType,
          format,
          selectedTopics: topicsToAssess,
          referenceExamStandard: referenceExamStandard.trim() || undefined,
          totalMarks,
          durationMinutes,
          curriculumRequirements: selectedUnit.curriculum,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Server error ' + res.status);
      }

      const generated = await res.json();

      const saved = dbService.saveAssessment({
        courseUnitId: selectedUnit.id,
        title: generated.title || title || `${selectedUnit.title} Examination`,
        assessmentType,
        format,
        instructions: generated.instructions,
        totalMarks: generated.totalMarks || totalMarks,
        durationMinutes: generated.durationMinutes || durationMinutes,
        sections: generated.sections || [],
      });

      setActiveAssessment(saved);
      setActiveTab('viewer');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate assessment.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToQuestionBank = () => {
    if (!activeAssessment || !selectedUnit) return;
    activeAssessment.sections.forEach((sec) => {
      sec.questions.forEach((q) => {
        dbService.saveQuestionBankItem({
          courseUnitId: selectedUnit.id,
          topicTag: q.topicTag || 'General',
          questionType: sec.questionType,
          questionText: q.questionText,
          options: q.options,
          allocatedMarks: q.allocatedMarks,
          modelAnswer: q.modelAnswer,
          markingSchemeRubric: q.markingSchemeRubric,
        });
      });
    });
    setSavedToBankSuccess(true);
    setTimeout(() => setSavedToBankSuccess(false), 3000);
  };

  const handleExportDOCX = (withMarkingScheme: boolean) => {
    if (!activeAssessment || !selectedUnit) return;
    exportAssessmentToDOCX(activeAssessment, selectedUnit.title, withMarkingScheme);
  };

  const qBankItems = dbService.getQuestionBank().filter((q) => q.courseUnitId === selectedUnitId);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Award className="w-6 h-6 text-[#00696f]" />
          <span>Assessments & Examination Studio</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Generate courseworks, assignments, and standard examinations with complete marking schemes,
          step-by-step rubrics, topic selection, and reference exam standard mirroring.
        </p>
      </div>

      {/* Configuration Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Course Unit
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
              Assessment Type
            </label>
            <select
              value={assessmentType}
              onChange={(e) => setAssessmentType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f] bg-white"
            >
              <option value="exam">Final Examination</option>
              <option value="coursework">Continuous Coursework</option>
              <option value="assignment">Take-Home Assignment</option>
              <option value="quiz">Weekly Quiz / Test</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Exam Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f] bg-white"
            >
              <option value="standard">Standard (MCQs + Short + Essay)</option>
              <option value="substandard">Substandard / Short Quiz</option>
              <option value="custom_rubric">Mirror Reference Standard</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Assessment Paper Title
            </label>
            <input
              type="text"
              placeholder="e.g. End of Semester Examination — Clinical Pharmacokinetics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Total Marks
              </label>
              <input
                type="number"
                min={10}
                max={500}
                value={totalMarks}
                onChange={(e) => setTotalMarks(parseInt(e.target.value, 10) || 100)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Duration (Min)
              </label>
              <input
                type="number"
                min={15}
                max={360}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 120)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f]"
              />
            </div>
          </div>
        </div>

        {/* Topic Picker */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Select Topics to Include in Assessment
            </span>
            <button
              type="button"
              onClick={selectAllTopics}
              className="text-xs text-[#00696f] hover:underline"
            >
              Select All Topics
            </button>
          </div>

          {topics.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              No specific topics added for this unit. All unit outline competencies will be tested.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {topics.map((t) => {
                const checked = selectedTopicNames.includes(t.name);
                return (
                  <label
                    key={t.id}
                    onClick={() => toggleTopic(t.name)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      checked
                        ? 'bg-[#d2ecee]/40 border-[#00696f] text-[#004d52] font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="rounded text-[#00696f] focus:ring-[#00696f]"
                    />
                    <span className="truncate">{t.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Reference Exam Standard Mirroring */}
        {format === 'custom_rubric' && (
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Reference Exam Standard Structure (Paste Format / Question Pattern to Mirror)
            </label>
            <textarea
              rows={4}
              value={referenceExamStandard}
              onChange={(e) => setReferenceExamStandard(e.target.value)}
              placeholder="e.g. Section 1: 15 MCQs (15 marks). Section 2: Case study with 4 clinical questions (35 marks). Section 3: Essay question (50 marks)..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#00696f]"
            />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">
            {assessments.length} assessments created in this course unit
          </span>
          <button
            onClick={handleGenerateAssessment}
            disabled={generating || !selectedUnit}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00696f] hover:bg-[#005358] text-white rounded-xl text-sm font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Constructing Exam & Authoritative Marking Scheme...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Assessment & Marking Scheme</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('viewer')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'viewer'
              ? 'border-[#00696f] text-[#00696f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Assessment Paper & Solutions
        </button>
        <button
          onClick={() => setActiveTab('bank')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'bank'
              ? 'border-[#00696f] text-[#00696f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Unit Question Bank ({qBankItems.length})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'saved'
              ? 'border-[#00696f] text-[#00696f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Saved Assessments ({assessments.length})
        </button>
      </div>

      {/* Active Assessment Display */}
      {activeTab === 'viewer' && activeAssessment && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-6 p-6">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d2ecee] text-[#004d52]">
                  {activeAssessment.totalMarks} Total Marks  ·  {activeAssessment.durationMinutes || 120} Mins
                </span>
                <span className="text-xs text-slate-500 uppercase font-medium">
                  {activeAssessment.assessmentType}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{activeAssessment.title}</h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowMarkingScheme(!showMarkingScheme)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                  showMarkingScheme
                    ? 'bg-[#00696f] text-white border-[#00696f]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showMarkingScheme ? 'Hide Marking Scheme' : 'Show Marking Scheme'}</span>
              </button>

              <button
                onClick={handleSaveToQuestionBank}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#00696f] bg-[#00696f]/10 hover:bg-[#00696f]/20 rounded-xl transition-colors"
                title="Save questions to permanent bank"
              >
                {savedToBankSuccess ? <CheckCircle className="w-3.5 h-3.5" /> : <Database className="w-3.5 h-3.5" />}
                <span>{savedToBankSuccess ? 'Saved to Bank!' : 'Save to Question Bank'}</span>
              </button>

              <button
                onClick={() => handleExportDOCX(false)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
                title="Download exam paper for students (.docx)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Exam DOCX</span>
              </button>

              <button
                onClick={() => handleExportDOCX(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
                title="Download exam paper + marking scheme (.docx)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Scheme DOCX</span>
              </button>
            </div>
          </div>

          {activeAssessment.instructions && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
              <span className="font-bold text-slate-900">INSTRUCTIONS: </span>
              {activeAssessment.instructions}
            </div>
          )}

          {/* Sections List */}
          <div className="space-y-6">
            {activeAssessment.sections.map((sec, secIdx) => (
              <div key={secIdx} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{sec.sectionName}</h3>
                    {sec.sectionInstructions && (
                      <p className="text-xs text-slate-500 mt-0.5">{sec.sectionInstructions}</p>
                    )}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                    {sec.sectionMarks} Marks
                  </span>
                </div>

                <div className="space-y-4">
                  {sec.questions.map((q) => (
                    <div
                      key={q.questionNumber}
                      className="bg-slate-50/60 rounded-xl p-4 border border-slate-200 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-slate-800 text-sm">
                            Q{q.questionNumber}.
                          </span>
                          <p className="text-sm text-slate-900 font-medium whitespace-pre-line">
                            {q.questionText}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-[#00696f] shrink-0">
                          [{q.allocatedMarks} Marks]
                        </span>
                      </div>

                      {/* Options if MCQ */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className="text-xs p-2 rounded-lg bg-white border border-slate-200 text-slate-700"
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Marking Scheme View */}
                      {showMarkingScheme && (
                        <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
                          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                            <span className="font-bold text-emerald-800 block mb-1">
                              Model Solution / Answer:
                            </span>
                            <p className="text-emerald-950 whitespace-pre-line leading-relaxed">
                              {q.modelAnswer}
                            </p>
                          </div>

                          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                            <span className="font-bold text-amber-800 block mb-1">
                              Marking Guide & Rubric Allocation:
                            </span>
                            <p className="text-amber-950 whitespace-pre-line leading-relaxed">
                              {q.markingSchemeRubric}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Bank Tab */}
      {activeTab === 'bank' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              Question Bank — {selectedUnit?.title}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {qBankItems.length} questions in bank
            </span>
          </div>

          {qBankItems.length === 0 ? (
            <p className="text-sm text-slate-500 italic py-8 text-center">
              No questions in bank yet. Generate an assessment above and click &quot;Save to Question Bank&quot;.
            </p>
          ) : (
            <div className="space-y-3">
              {qBankItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#00696f] uppercase tracking-wider">
                      {item.topicTag} · {item.questionType.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {item.allocatedMarks} Marks
                    </span>
                  </div>
                  <p className="text-sm text-slate-900 font-medium">{item.questionText}</p>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-emerald-700">Model Answer: </span>
                    <span className="text-slate-700">{item.modelAnswer}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Saved Assessments Tab */}
      {activeTab === 'saved' && (
        <div className="space-y-3">
          {assessments.map((a) => (
            <div
              key={a.id}
              onClick={() => {
                setActiveAssessment(a);
                setActiveTab('viewer');
              }}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between shadow-xs"
            >
              <div>
                <h4 className="font-bold text-slate-900 text-base">{a.title}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {a.assessmentType.toUpperCase()}  ·  {a.totalMarks} Marks  ·  {a.sections.length} Sections  ·  {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dbService.deleteAssessment(a.id);
                }}
                className="p-2 text-slate-400 hover:text-red-500"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
