import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  School,
  Clock,
  Layers,
  ArrowRight,
  Upload,
} from 'lucide-react';
import { dbService } from '../../services/database';

interface ParsedUnit {
  title: string;
  code: string;
  contactHours: number;
  teachingHours: number;
  description: string;
  curriculum?: string;
  objectives: string[];
  outline: string[];
  topics: {
    name: string;
    contactHours: number;
    keyConcepts?: string;
  }[];
}

interface ParsedClass {
  className: string;
  academicLevel: string;
  yearOfStudy: number;
  description: string;
  courseUnits: ParsedUnit[];
}

interface CurriculumAnalysisResult {
  courseTitle: string;
  academicLevel: string;
  durationYears: number;
  summary: string;
  classes: ParsedClass[];
}

interface CurriculumIngestionScreenProps {
  onNavigateToClasses: () => void;
  onSelectClass: (classId: string) => void;
}

const SAMPLE_PHARMACY_CURRICULUM = `NATIONAL CURRICULUM AND TEACHER'S TRAINING GUIDE FOR DIPLOMA IN PHARMACY (DPH)
Duration: 3 Academic Years
Academic Level: Diploma

YEAR 1 (FIRST YEAR OF STUDY):
Class: Diploma Year 1 — Pharmacy
1. Course Unit: Pharmacology I: General Principles & Pharmacokinetics
   - Code: PHR 1101
   - Total Contact Hours: 45 Hours
   - Description: Fundamentals of drug absorption, distribution, metabolism, and elimination (ADME), receptor binding kinetics, and autonomic pharmacology.
   - Objectives:
     * Explain drug passage across biological membranes and Henderson-Hasselbalch ionization.
     * Calculate clearance, bioavailability, volume of distribution, and loading dose.
     * Differentiate sympathetic and parasympathetic receptor agonists and antagonists.
   - Outline:
     * Module 1: Introduction to Pharmacodynamics (10 Contact Hours)
     * Module 2: Pharmacokinetics: Absorption & Distribution (15 Contact Hours)
     * Module 3: Metabolism & Excretion (10 Contact Hours)
     * Module 4: Autonomic Nervous System Agents (10 Contact Hours)
   - Topics:
     * Topic 1: Receptor Theory & Agonism (4 Contact Hours)
     * Topic 2: ADME & Hepatic First-Pass Metabolism (6 Contact Hours)
     * Topic 3: Renal Clearance & Half-Life Equations (5 Contact Hours)

2. Course Unit: Pharmaceutical Calculations & Compounding
   - Code: PHR 1102
   - Total Contact Hours: 30 Hours
   - Description: Applied mathematical arithmetic for pharmaceutical compounding, dilution equations, metric conversions, and osmolarity.
   - Objectives:
     * Perform alligation alternate and medials accurately.
     * Compute pediatric doses using standard Clark's and Young's rules.
     * Calculate molarity, milliequivalents, and infusion drip rates.
   - Outline:
     * Module 1: Metric & Apothecary Conversions (6 Contact Hours)
     * Module 2: Percentage Solutions & Stock Dilution (10 Contact Hours)
     * Module 3: Pediatric & Clinical Dosage Math (8 Contact Hours)
     * Module 4: Osmolarity & Isotonic Preparations (6 Contact Hours)
   - Topics:
     * Topic 1: Ratio Strength & Percentage Calculations (5 Contact Hours)
     * Topic 2: Alligation Method for Intermediate Strengths (5 Contact Hours)

YEAR 2 (SECOND YEAR OF STUDY):
Class: Diploma Year 2 — Pharmacy
1. Course Unit: Clinical Pharmacotherapeutics & Pathology
   - Code: PHR 2101
   - Total Contact Hours: 60 Hours
   - Description: Disease states, clinical pharmacology, and evidence-based pharmacotherapy of cardiovascular, endocrine, and respiratory disorders.
   - Objectives:
     * Design therapeutic treatment regimens for hypertension, angina, and heart failure.
     * Formulate glycemic control plans in Type 1 and Type 2 diabetes mellitus.
     * Monitor drug interactions and adverse drug event reporting.
   - Outline:
     * Module 1: Cardiovascular Therapeutics (20 Contact Hours)
     * Module 2: Endocrine & Metabolic Disorders (15 Contact Hours)
     * Module 3: Respiratory Disorders (10 Contact Hours)
     * Module 4: Antimicrobial Stewardship (15 Contact Hours)
   - Topics:
     * Topic 1: Antihypertensive Agents (ACE inhibitors, ARBs, CCBs) (8 Contact Hours)
     * Topic 2: Insulin Preparations & Oral Hypoglycemics (8 Contact Hours)
     * Topic 3: Antibacterial Resistance & Beta-lactams (10 Contact Hours)
`;

export const CurriculumIngestionScreen: React.FC<CurriculumIngestionScreenProps> = ({
  onNavigateToClasses,
  onSelectClass,
}) => {
  const [courseName, setCourseName] = useState('');
  const [durationYears, setDurationYears] = useState('3');
  const [rawText, setRawText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CurriculumAnalysisResult | null>(null);
  const [committedCount, setCommittedCount] = useState<{ classes: number; units: number } | null>(
    null
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      if (!courseName) {
        setCourseName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    };
    reader.readAsText(file);
  };

  const loadSample = () => {
    setCourseName('Diploma in Pharmacy');
    setDurationYears('3');
    setRawText(SAMPLE_PHARMACY_CURRICULUM);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!rawText.trim()) {
      setError('Please paste or upload curriculum text or training guide content.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);
    setCommittedCount(null);

    try {
      const res = await fetch('/api/ai/analyze-curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          courseName,
          durationYears: parseInt(durationYears, 10) || 3,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Server returned error ' + res.status);
      }

      const data: CurriculumAnalysisResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze curriculum.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCommitToWorkspace = () => {
    if (!result) return;

    let classCount = 0;
    let unitCount = 0;

    for (const c of result.classes) {
      // Check if class already exists or create new
      let targetClass = dbService.getActiveClasses().find(
        (existing) => existing.name.toLowerCase() === c.className.toLowerCase()
      );

      if (!targetClass) {
        targetClass = dbService.createClass({
          name: c.className,
          academicLevel: c.academicLevel || result.academicLevel,
          yearOfStudy: c.yearOfStudy,
          description: c.description || `Class for ${result.courseTitle}`,
        });
        classCount++;
      }

      for (const u of c.courseUnits) {
        const createdUnit = dbService.createUnit({
          classId: targetClass.id,
          title: u.title,
          code: u.code,
          contactHours: u.contactHours,
          teachingHours: u.teachingHours || u.contactHours,
          description: u.description,
          curriculum: u.curriculum || result.courseTitle,
          objectives: Array.isArray(u.objectives) ? u.objectives.join('\n') : u.objectives,
          outline: Array.isArray(u.outline) ? u.outline.join('\n') : u.outline,
        });
        unitCount++;

        // Add detected topics with contact hours
        if (u.topics && Array.isArray(u.topics)) {
          u.topics.forEach((top, idx) => {
            dbService.createTopic({
              courseUnitId: createdUnit.id,
              name: top.name,
              description: top.keyConcepts,
              contactHours: top.contactHours,
              sortOrder: idx,
            });
          });
        }
      }
    }

    setCommittedCount({ classes: classCount, units: unitCount });
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[#00696f]" />
            <span>Curriculum & Teacher&apos;s Guide Ingestion</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Import an official curriculum document or syllabus. The AI analyzes competencies and
            automatically provisions classes, course units, contact hours, and outlines.
          </p>
        </div>

        <button
          onClick={loadSample}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#00696f] bg-[#00696f]/10 hover:bg-[#00696f]/20 rounded-xl transition-colors self-start shrink-0"
        >
          <FileText className="w-4 h-4" />
          <span>Load Sample: Pharmacy Diploma</span>
        </button>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Course / Program Title (Optional)
            </label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g. Diploma in Pharmacy, Certificate in Medical Laboratory"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Course Duration (Years)
            </label>
            <select
              value={durationYears}
              onChange={(e) => setDurationYears(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f] bg-white"
            >
              <option value="1">1 Year (Certificate)</option>
              <option value="2">2 Years (Diploma / Associate)</option>
              <option value="3">3 Years (Advanced Diploma)</option>
              <option value="4">4 Years (Bachelor / Degree)</option>
              <option value="5">5 Years (Professional Degree)</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Curriculum Text or Teacher&apos;s Guide Content
            </label>
            <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-[#00696f] hover:underline">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document (TXT/Text)</span>
              <input type="file" accept=".txt,.json,.md,.csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          <textarea
            rows={10}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste syllabus modules, course objectives, contact hours, topic outlines, or teacher's training guide content here..."
            className="w-full p-4 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f] font-mono leading-relaxed resize-y"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !rawText.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00696f] hover:bg-[#005358] text-white rounded-xl text-sm font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing Curriculum with Gemini 2.5 Flash...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Curriculum & Structure Classes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results Preview */}
      {result && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#d2ecee] text-[#004d52] mb-2">
                {result.academicLevel} Program  ·  {result.durationYears} Years
              </div>
              <h2 className="text-xl font-bold text-slate-900">{result.courseTitle}</h2>
              {result.summary && (
                <p className="text-sm text-slate-600 mt-1 max-w-3xl">{result.summary}</p>
              )}
            </div>

            <button
              onClick={handleCommitToWorkspace}
              disabled={Boolean(committedCount)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors disabled:opacity-70 shrink-0"
            >
              {committedCount ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Committed to Workspace!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Commit & Provision to Workspace</span>
                </>
              )}
            </button>
          </div>

          {committedCount && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-sm text-emerald-800 font-medium">
                  Successfully created {committedCount.classes} classes and {committedCount.units}{' '}
                  course units in your workspace!
                </p>
              </div>
              <button
                onClick={onNavigateToClasses}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
              >
                <span>View Classes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Classes Breakdown */}
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#00696f]" />
              <span>Extracted Classes & Course Units</span>
            </h3>

            <div className="grid grid-cols-1 gap-5">
              {result.classes.map((cls, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200 space-y-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#00696f]/10 text-[#00696f] flex items-center justify-center font-bold text-sm">
                        <School className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{cls.className}</h4>
                        <p className="text-xs text-slate-500">
                          Year {cls.yearOfStudy}  ·  {cls.courseUnits.length} Course Units
                        </p>
                      </div>
                    </div>
                    {committedCount && (
                      <button
                        onClick={() => {
                          const existing = dbService.getActiveClasses().find(
                            (c) => c.name.toLowerCase() === cls.className.toLowerCase()
                          );
                          if (existing) onSelectClass(existing.id);
                          else onNavigateToClasses();
                        }}
                        className="text-xs font-semibold text-[#00696f] hover:underline flex items-center gap-1 shrink-0"
                      >
                        <span>Open Class</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Units grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {cls.courseUnits.map((u, uIdx) => (
                      <div
                        key={uIdx}
                        className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[11px] font-mono font-bold text-[#00696f] px-2 py-0.5 rounded-md bg-[#00696f]/10">
                              {u.code || 'UNIT'}
                            </span>
                            <h5 className="font-semibold text-slate-900 text-sm mt-1">{u.title}</h5>
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{u.contactHours} hrs</span>
                          </span>
                        </div>

                        {u.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {u.description}
                          </p>
                        )}

                        {u.topics && u.topics.length > 0 && (
                          <div className="pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                              Topics ({u.topics.length})
                            </span>
                            <div className="space-y-1">
                              {u.topics.slice(0, 3).map((t, tIdx) => (
                                <div
                                  key={tIdx}
                                  className="text-xs text-slate-700 flex items-center justify-between"
                                >
                                  <span className="truncate pr-2">• {t.name}</span>
                                  <span className="text-[11px] text-slate-400 shrink-0">
                                    {t.contactHours}h
                                  </span>
                                </div>
                              ))}
                              {u.topics.length > 3 && (
                                <span className="text-[11px] text-slate-400 italic">
                                  + {u.topics.length - 3} more topics
                                </span>
                              )}
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
        </div>
      )}
    </div>
  );
};
