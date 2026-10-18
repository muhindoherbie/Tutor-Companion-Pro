import { useEffect, useState } from 'react';
import {
  ClassRow,
  CourseUnitRow,
  TopicRow,
  ReferenceDocRow,
  LectureNoteRow,
  AssessmentRow,
  QuestionBankItem,
  StudentRow,
  DeepSolveMessage,
} from '../types';

export class DuplicateNameError extends Error {
  constructor() {
    super('An active class with this name already exists.');
    this.name = 'DuplicateNameError';
  }
}

export function generateId(): string {
  return 'id_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Storage keys
const K_CLASSES = 'tc_unlimited_classes';
const K_UNITS = 'tc_unlimited_units';
const K_TOPICS = 'tc_unlimited_topics';
const K_REFS = 'tc_unlimited_refs';
const K_NOTES = 'tc_unlimited_notes';
const K_ASSESSMENTS = 'tc_unlimited_assessments';
const K_QBANK = 'tc_unlimited_qbank';
const K_STUDENTS = 'tc_unlimited_students';
const K_DEEPSOLVE = 'tc_unlimited_deepsolve';

// Initial realistic academic workspace
const SEED_CLASSES: ClassRow[] = [
  {
    id: 'class-pharm-y1',
    name: 'Diploma Year 1 — Pharmacy',
    academicLevel: 'Diploma',
    yearOfStudy: 1,
    academicYear: '2025/2026',
    description: 'First-year foundational pharmacology, pharmaceutical chemistry, and dosage arithmetic.',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    deletedAt: null,
  },
  {
    id: 'class-pharm-y2',
    name: 'Diploma Year 2 — Pharmacy',
    academicLevel: 'Diploma',
    yearOfStudy: 2,
    academicYear: '2025/2026',
    description: 'Clinical pharmacotherapeutics, microbiology, toxicology, and hospital pharmacy practice.',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    deletedAt: null,
  },
  {
    id: 'class-cert-pharm',
    name: 'Certificate in Pharmacy Practice',
    academicLevel: 'Certificate',
    yearOfStudy: 1,
    academicYear: '2025/2026',
    description: 'Dispensing techniques, storage regulations, community pharmacy ethics, and patient communication.',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    deletedAt: null,
  },
];

const SEED_UNITS: CourseUnitRow[] = [
  {
    id: 'unit-phr-1101',
    classId: 'class-pharm-y1',
    title: 'Pharmacology I: General Principles',
    code: 'PHR 1101',
    contactHours: 45,
    teachingHours: 45,
    description: 'Foundations of drug pharmacodynamics, pharmacokinetics (ADME), receptor models, and adverse reactions.',
    curriculum: 'National Pharmacy Board Curriculum Standards',
    objectives: '1. Describe the molecular mechanisms of drug-receptor interactions.\n2. Calculate pharmacokinetic parameters including bioavailability and half-life.\n3. Identify major drug classes acting on the autonomic nervous system.',
    outline: 'Module 1: Introduction to Pharmacodynamics (10 Contact Hours)\nModule 2: Pharmacokinetics: Absorption & Distribution (15 Contact Hours)\nModule 3: Metabolism & Excretion (10 Contact Hours)\nModule 4: Autonomic Nervous System Agents (10 Contact Hours)',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    deletedAt: null,
  },
  {
    id: 'unit-phr-1102',
    classId: 'class-pharm-y1',
    title: 'Pharmaceutical Calculations & Compounding',
    code: 'PHR 1102',
    contactHours: 30,
    teachingHours: 30,
    description: 'Mathematical problem-solving for dosage calculations, stock dilution, percentage preparations, and osmolarity.',
    curriculum: 'National Pharmacy Board Curriculum Standards',
    objectives: '1. Formulate dilution solutions using alligation methods.\n2. Accurately calculate pediatric doses based on body surface area.\n3. Compute intravenous flow and infusion rates.',
    outline: 'Module 1: Units of Measurement & Conversions (6 Contact Hours)\nModule 2: Percentage Solutions & Dilution (10 Contact Hours)\nModule 3: Pediatric & Geriatric Dosage Calculations (8 Contact Hours)\nModule 4: Isotonicity & Osmolarity (6 Contact Hours)',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    deletedAt: null,
  },
  {
    id: 'unit-phr-2101',
    classId: 'class-pharm-y2',
    title: 'Clinical Pharmacology & Therapeutics',
    code: 'PHR 2101',
    contactHours: 60,
    teachingHours: 60,
    description: 'Therapeutic management of cardiovascular, endocrine, respiratory, and infectious disorders.',
    curriculum: 'National Pharmacy Board Curriculum Standards',
    objectives: '1. Select appropriate first-line antimicrobial therapy.\n2. Manage drug interactions in hypertensive and diabetic patients.\n3. Monitor therapeutic drug levels in clinical settings.',
    outline: 'Module 1: Cardiovascular Therapeutics (20 Contact Hours)\nModule 2: Endocrine & Metabolic Disorders (15 Contact Hours)\nModule 3: Antimicrobial Stewardship (15 Contact Hours)\nModule 4: Central Nervous System Agents (10 Contact Hours)',
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    deletedAt: null,
  },
];

const SEED_TOPICS: TopicRow[] = [
  {
    id: 'top-adme',
    courseUnitId: 'unit-phr-1101',
    parentTopicId: null,
    name: 'Absorption, Distribution, Metabolism, and Excretion (ADME)',
    description: 'First-pass hepatic metabolism, bioavailability, volume of distribution, and renal elimination.',
    contactHours: 6,
    sortOrder: 0,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    deletedAt: null,
  },
  {
    id: 'top-receptors',
    courseUnitId: 'unit-phr-1101',
    parentTopicId: null,
    name: 'Receptor Theory & Signal Transduction',
    description: 'G-protein coupled receptors, ion channels, enzyme-linked receptors, and agonists vs antagonists.',
    contactHours: 4,
    sortOrder: 1,
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    deletedAt: null,
  },
  {
    id: 'top-alligation',
    courseUnitId: 'unit-phr-1102',
    parentTopicId: null,
    name: 'Alligation Alternate & Stock Compounding',
    description: 'Mathematical matrices for mixing varying percentage preparations to yield desired intermediate strength.',
    contactHours: 4,
    sortOrder: 0,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    deletedAt: null,
  },
];

const SEED_REFS: ReferenceDocRow[] = [
  {
    id: 'ref-katzung',
    courseUnitId: 'unit-phr-1101',
    fileName: 'Basic_and_Clinical_Pharmacology_Katzung_Ch1-3.pdf',
    fileType: 'pdf',
    extractedText: 'Pharmacokinetics governs what the body does to the drug. Bioavailability (F) is the fraction of unchanged drug that reaches systemic circulation. For intravenous administration, F = 100%. For oral dosing, F is diminished by incomplete absorption and first-pass hepatic elimination. Volume of distribution (Vd) relates the amount of drug in the body to the concentration of drug in blood: Vd = Amount / C. Clearance (CL) represents the volume of plasma cleared of drug per unit time: CL = Rate of elimination / C. Half-life is defined by t1/2 = 0.693 * Vd / CL.',
    fileSize: '4.2 MB',
    uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

const SEED_NOTES: LectureNoteRow[] = [
  {
    id: 'note-adme-1',
    courseUnitId: 'unit-phr-1101',
    topicId: 'top-adme',
    title: 'Pharmacokinetics: Comprehensive ADME & Clinical Parameters',
    contactHours: 3,
    summary: 'Detailed examination of drug absorption barriers, bioavailability calculations, volume of distribution, and hepatic clearance.',
    learningOutcomes: [
      'Calculate oral bioavailability using Area Under the Curve (AUC)',
      'Differentiate between zero-order and first-order elimination kinetics',
      'Compute loading dose and maintenance dose based on Vd and clearance',
    ],
    modulesByHour: [
      {
        hourLabel: 'Hour 1: Drug Absorption & Bioavailability Pathways',
        contentMarkdown: '### Passive Diffusion vs Active Transport\nDrugs cross physiological membranes predominantly by passive nonionic diffusion. The Henderson-Hasselbalch equation governs degree of ionization based on local pH and drug pKa.\n\n### Bioavailability (F)\nBioavailability is computed as: `F = (AUC_oral / AUC_IV) * (Dose_IV / Dose_oral)`.\nFirst-pass hepatic metabolism via cytochrome P450 enzymes (particularly CYP3A4 and CYP2D6) significantly reduces oral bioavailability for drugs like propranolol and morphine.',
        keyPoints: [
          'Un-ionized forms of weak acids and bases penetrate lipid bilayers readily',
          'First pass metabolism occurs in gut wall and liver',
        ],
        studentActivities: 'Case discussion: Compare oral versus sublingual nitroglycerin bioavailability.',
      },
      {
        hourLabel: 'Hour 2: Volume of Distribution & Tissue Binding',
        contentMarkdown: '### Volume of Distribution (Vd)\nVd represents the apparent volume into which a drug distributes at equilibrium with plasma.\n- Low Vd (~3-5 L): High plasma protein binding (e.g., Warfarin, stays in vascular space).\n- High Vd (>100 L): High lipophilicity and tissue sequestration (e.g., Chloroquine, Digoxin).\n\n### Clinical Loading Dose Equation:\n`Loading Dose (mg) = (Target Plasma Concentration * Vd) / F`',
        keyPoints: [
          'Vd is an apparent, not anatomical volume',
          'Plasma protein binding restricts glomerular filtration',
        ],
        studentActivities: 'Calculate the loading dose for a 70kg patient needing target plasma concentration 15 mcg/mL with Vd = 0.5 L/kg.',
      },
      {
        hourLabel: 'Hour 3: Drug Clearance & Elimination Half-Life',
        contentMarkdown: '### Clearance (CL)\nClearance is additive: `CL_total = CL_renal + CL_hepatic + CL_biliary`.\n\n### Elimination Half-Life (t1/2)\n`t1/2 = (0.693 * Vd) / CL`\nIt takes approximately 4 to 5 half-lives to reach steady-state concentration (Css) during continuous infusion, and 4 to 5 half-lives to eliminate >95% of the drug after cessation.',
        keyPoints: [
          'Steady state is achieved after ~4-5 half-lives regardless of rate of infusion',
          'Clearance determines maintenance dose rate',
        ],
        studentActivities: 'Review clinical drug clearance in renal failure: Cockcroft-Gault equation practice.',
      },
    ],
    fullMarkdownNotes: `# Pharmacokinetics: ADME & Clinical Parameters
**Course Unit:** PHR 1101 · Pharmacology I  
**Contact Hours:** 3 Hours · Grounded in Katzung Ch. 1-3  

## Learning Objectives
1. Explain the physiological barriers to drug absorption and first-pass elimination.
2. Calculate volume of distribution, clearance, and elimination half-life.
3. Formulate individualized loading and maintenance dosing regimens.

---

## Hour 1: Drug Absorption & Bioavailability
Most drugs cross biological membranes via passive nonionic diffusion. The non-ionized form is lipid-soluble and diffuses across the phospholipid bilayer.
- **Bioavailability (F):** The fraction of an administered dose that reaches the systemic circulation unchanged.
- **First-Pass Effect:** Blood from the gastrointestinal tract drains directly into the liver via the portal vein before reaching the general circulation. High hepatic extraction results in low systemic availability.

## Hour 2: Distribution & Volume of Distribution (Vd)
Volume of distribution reflects the extent of drug partitioning between blood and tissues:
$$V_d = \\frac{\\text{Total amount of drug in body}}{\\text{Plasma drug concentration}}$$
A high Vd indicates extensive tissue storage (e.g. adipose tissue or intracellular binding).

## Hour 3: Elimination, Clearance & Half-Life
Clearance measures the intrinsic capacity of organs to eliminate drug:
$$\\text{Rate of Elimination} = CL \\times C$$
Elimination half-life determines dosage intervals and time to steady state:
$$t_{1/2} = \\frac{0.693 \\times V_d}{CL}$$
`,
    slides: [
      {
        slideNumber: 1,
        title: 'Pharmacokinetics: The Journey of a Drug',
        bulletPoints: [
          'Definition: What the body does to the drug',
          'The 4 pillars: Absorption, Distribution, Metabolism, Excretion',
          'Clinical significance: Dosing regimens & therapeutic windows',
        ],
        speakerNotes: 'Welcome students. Emphasize that pharmacokinetics determines how much drug reaches target receptors.',
      },
      {
        slideNumber: 2,
        title: 'Absorption & First-Pass Hepatic Elimination',
        bulletPoints: [
          'Passive diffusion depends on lipophilicity and pKa',
          'First-pass effect: Liver enzymes extract drugs before systemic distribution',
          'Route matters: IV (F=100%) vs Oral (F<100%) vs Sublingual (bypasses portal system)',
        ],
        speakerNotes: 'Explain why oral morphine doses are 3x higher than IV morphine doses.',
      },
      {
        slideNumber: 3,
        title: 'Volume of Distribution (Vd) & Loading Dose',
        bulletPoints: [
          'Vd is an apparent, mathematical volume of dilution',
          'High Vd = tissue sequestered; Low Vd = confined to plasma',
          'Equation: Loading Dose = (Target Concentration * Vd) / F',
        ],
        speakerNotes: 'Walk students through the Digoxin and Warfarin Vd comparison.',
      },
      {
        slideNumber: 4,
        title: 'Clearance & Steady-State Kinetics',
        bulletPoints: [
          'Clearance (CL): Volume of plasma cleared per unit time',
          'Steady State: Rate In = Rate Out (achieved after 4-5 half-lives)',
          'Maintenance Dose Rate = Target Css * CL',
        ],
        speakerNotes: 'Highlight that increasing the infusion rate increases Css, but does NOT shorten time to reach steady state.',
      },
    ],
    citedReferences: ['Basic_and_Clinical_Pharmacology_Katzung_Ch1-3.pdf', 'National Pharmacy Board Curriculum Standards'],
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const SEED_ASSESSMENTS: AssessmentRow[] = [
  {
    id: 'exam-phr-midterm',
    courseUnitId: 'unit-phr-1101',
    title: 'Midterm Examination: General Pharmacokinetics & Receptors',
    assessmentType: 'exam',
    format: 'standard',
    instructions: 'Answer ALL questions in Section A and Section B, and ONE question in Section C. Time allowed: 2 Hours. Total marks: 100.',
    totalMarks: 100,
    durationMinutes: 120,
    sections: [
      {
        sectionName: 'Section A: Multiple Choice Questions (20 Marks)',
        sectionInstructions: 'Choose the most appropriate option. Each question carries 2 marks.',
        sectionMarks: 20,
        questionType: 'mcq',
        questions: [
          {
            questionNumber: 1,
            questionText: 'Which pharmacokinetic parameter determines the time required to reach steady-state plasma concentration during continuous intravenous infusion?',
            options: [
              'A) Volume of distribution alone',
              'B) Elimination half-life (t1/2)',
              'C) Rate of intravenous infusion',
              'D) Bioavailability',
            ],
            allocatedMarks: 2,
            topicTag: 'ADME',
            modelAnswer: 'B) Elimination half-life (t1/2)',
            markingSchemeRubric: '2 marks for option B. 0 marks for other choices.',
          },
          {
            questionNumber: 2,
            questionText: 'A drug with an extremely high volume of distribution (Vd > 500 L in a 70 kg adult) is characteristic of which of the following?',
            options: [
              'A) Complete confinement to the intravascular compartment',
              'B) High binding to circulating serum albumin',
              'C) Extensive tissue binding and high lipophilicity',
              'D) Immediate rapid renal glomerular excretion',
            ],
            allocatedMarks: 2,
            topicTag: 'ADME',
            modelAnswer: 'C) Extensive tissue binding and high lipophilicity',
            markingSchemeRubric: '2 marks for option C. High tissue partitioning causes very low measured plasma concentration, producing a mathematically huge apparent volume.',
          },
        ],
      },
      {
        sectionName: 'Section B: Short Structured Questions (40 Marks)',
        sectionInstructions: 'Answer all questions concisely. Show all working for calculations.',
        sectionMarks: 40,
        questionType: 'short_answer',
        questions: [
          {
            questionNumber: 3,
            questionText: 'Define bioavailability (F) and explain why oral propranolol requires a significantly higher dose than intravenous propranolol.',
            allocatedMarks: 10,
            topicTag: 'Bioavailability',
            modelAnswer: 'Bioavailability (F) is the fraction of an administered dose of unchanged drug that reaches the systemic circulation.\nPropranolol undergoes extensive first-pass hepatic metabolism by CYP2D6 upon intestinal absorption. Up to 70-80% of an oral dose is extracted and converted to metabolites before entering systemic circulation. Consequently, a higher oral dose (e.g. 40-80 mg) is mandatory to achieve equivalent therapeutic plasma concentrations compared to 1-2 mg IV.',
            markingSchemeRubric: '- 3 marks: Accurate definition of bioavailability.\n- 3 marks: Identification of first-pass hepatic metabolism.\n- 2 marks: Anatomical route (gut to portal vein to liver).\n- 2 marks: Clinical dosage contrast explanation.',
          },
          {
            questionNumber: 4,
            questionText: 'Calculate the loading dose of Drug X required to achieve a target plasma concentration of 10 mcg/mL in a 60 kg patient, given Vd = 0.6 L/kg and oral bioavailability F = 0.8.',
            allocatedMarks: 10,
            topicTag: 'Dosage Calculations',
            modelAnswer: '1. Total Vd = 60 kg * 0.6 L/kg = 36 L\n2. Target concentration (C) = 10 mcg/mL = 10 mg/L\n3. Loading Dose = (C * Vd) / F\n4. Loading Dose = (10 mg/L * 36 L) / 0.8 = 360 mg / 0.8 = 450 mg.',
            markingSchemeRubric: '- 2 marks for Total Vd calculation (36 L)\n- 2 marks for unit conversion (10 mcg/mL = 10 mg/L)\n- 3 marks for loading dose formula\n- 3 marks for final answer (450 mg).',
          },
        ],
      },
      {
        sectionName: 'Section C: Long Essay & Clinical Scenario (40 Marks)',
        sectionInstructions: 'Select ONE comprehensive question. Demonstrate deep pharmacological rationale.',
        sectionMarks: 40,
        questionType: 'essay',
        questions: [
          {
            questionNumber: 5,
            questionText: 'A 68-year-old patient with chronic kidney disease (estimated GFR 25 mL/min) requires maintenance therapy with an aminoglycoside antibiotic. Discuss the pharmacokinetic principles of renal clearance, explain how clearance impacts the elimination half-life, and describe the dosage adjustment strategies (interval extension vs dose reduction) employed to avoid nephrotoxicity and ototoxicity.',
            allocatedMarks: 40,
            topicTag: 'Clinical Pharmacokinetics',
            modelAnswer: 'Aminoglycosides (e.g. Gentamicin) are polar molecules excreted almost exclusively unchanged via glomerular filtration.\nIn impaired renal function (reduced GFR), renal clearance decreases proportionally. Since t1/2 = (0.693 * Vd) / CL, a drop in clearance leads to prolonged half-life (from 2 hours to 12+ hours).\n\nDosage Adjustment Strategies:\n1. Dose Reduction: Decreasing individual dose while maintaining standard 8-hour intervals. Maintains steady blood levels but may fail to achieve adequate peak concentration (Cmax) necessary for concentration-dependent bactericidal killing.\n2. Interval Extension (Preferred): Administering standard high dose but extending interval to 24-48 hours. Preserves high peak-to-MIC ratio for post-antibiotic effect while allowing trough levels to fall below 1 mcg/mL, avoiding accumulation in renal tubular and cochlear cells.',
            markingSchemeRubric: '- 10 marks: Renal filtration mechanism of aminoglycosides and GFR proportionality.\n- 10 marks: Mathematical relationship between clearance and extended half-life.\n- 10 marks: Comparison of dose reduction vs interval extension.\n- 10 marks: Toxicity avoidance (peak vs trough monitoring and clinical justification).',
          },
        ],
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

const SEED_STUDENTS: StudentRow[] = [
  {
    id: 'stud-1',
    classId: 'class-pharm-y1',
    studentIdNumber: 'DPH/2025/001',
    fullName: 'Aisha Namubiru',
    gender: 'female',
    dateOfBirth: '2004-05-12',
    contactEmail: 'aisha.namubiru@campus.ac',
    contactPhone: '+256 701 458 920',
    guardianName: 'Dr. Joseph Namubiru',
    guardianPhone: '+256 772 301 990',
    yearOfStudy: 1,
    enrollmentDate: '2025-09-01',
    marks: {
      'exam-phr-midterm': 88,
    },
    deletedAt: null,
  },
  {
    id: 'stud-2',
    classId: 'class-pharm-y1',
    studentIdNumber: 'DPH/2025/002',
    fullName: 'Brian Kato',
    gender: 'male',
    dateOfBirth: '2003-11-28',
    contactEmail: 'brian.kato@campus.ac',
    contactPhone: '+256 752 901 112',
    guardianName: 'Mary Kato',
    guardianPhone: '+256 702 443 890',
    yearOfStudy: 1,
    enrollmentDate: '2025-09-01',
    marks: {
      'exam-phr-midterm': 76,
    },
    deletedAt: null,
  },
  {
    id: 'stud-3',
    classId: 'class-pharm-y1',
    studentIdNumber: 'DPH/2025/003',
    fullName: 'Catherine Ochieng',
    gender: 'female',
    dateOfBirth: '2004-02-14',
    contactEmail: 'catherine.ochieng@campus.ac',
    contactPhone: '+256 788 123 456',
    guardianName: 'Peter Ochieng',
    guardianPhone: '+256 788 998 776',
    yearOfStudy: 1,
    enrollmentDate: '2025-09-01',
    marks: {
      'exam-phr-midterm': 93,
    },
    deletedAt: null,
  },
  {
    id: 'stud-4',
    classId: 'class-pharm-y1',
    studentIdNumber: 'DPH/2025/004',
    fullName: 'David Mukasa',
    gender: 'male',
    dateOfBirth: '2003-08-19',
    contactEmail: 'david.mukasa@campus.ac',
    contactPhone: '+256 712 334 556',
    guardianName: 'Grace Mukasa',
    guardianPhone: '+256 712 998 877',
    yearOfStudy: 1,
    enrollmentDate: '2025-09-01',
    marks: {
      'exam-phr-midterm': 64,
    },
    deletedAt: null,
  },
];

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function save<T>(key: string, items: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.warn('Storage save failed:', err);
  }
}

export const dbService = {
  // --- CLASSES (Unlimited) ---
  getClasses(): ClassRow[] {
    return load<ClassRow>(K_CLASSES, SEED_CLASSES);
  },

  getActiveClasses(): ClassRow[] {
    return this.getClasses()
      .filter((c) => !c.deletedAt)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  getClassById(id: string): ClassRow | null {
    return this.getClasses().find((c) => c.id === id) ?? null;
  },

  activeNameExists(name: string, excludeId?: string): boolean {
    const clean = name.trim().toLowerCase();
    return this.getActiveClasses().some(
      (c) => c.name.trim().toLowerCase() === clean && c.id !== excludeId
    );
  },

  createClass(data: {
    name: string;
    description?: string;
    academicLevel?: string;
    yearOfStudy?: number;
    academicYear?: string;
  }): ClassRow {
    if (this.activeNameExists(data.name)) {
      throw new DuplicateNameError();
    }
    const all = this.getClasses();
    const now = new Date().toISOString();
    const newClass: ClassRow = {
      id: generateId(),
      name: data.name.trim(),
      description: data.description?.trim() || null,
      academicLevel: data.academicLevel?.trim() || null,
      yearOfStudy: data.yearOfStudy || 1,
      academicYear: data.academicYear || '2025/2026',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    all.push(newClass);
    save(K_CLASSES, all);
    notify();
    return newClass;
  },

  updateClass(
    id: string,
    data: {
      name: string;
      description?: string;
      academicLevel?: string;
      yearOfStudy?: number;
      academicYear?: string;
    }
  ): void {
    if (this.activeNameExists(data.name, id)) {
      throw new DuplicateNameError();
    }
    const all = this.getClasses();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) return;

    all[idx] = {
      ...all[idx],
      name: data.name.trim(),
      description: data.description?.trim() || null,
      academicLevel: data.academicLevel?.trim() || null,
      yearOfStudy: data.yearOfStudy ?? all[idx].yearOfStudy,
      academicYear: data.academicYear ?? all[idx].academicYear,
      updatedAt: new Date().toISOString(),
    };
    save(K_CLASSES, all);
    notify();
  },

  deleteClass(id: string): void {
    const now = new Date().toISOString();
    const classes = this.getClasses();
    const idx = classes.findIndex((c) => c.id === id);
    if (idx !== -1) {
      classes[idx].deletedAt = now;
      classes[idx].updatedAt = now;
      save(K_CLASSES, classes);
    }

    // Cascade delete units
    const units = this.getCourseUnits();
    const unitIds = new Set<string>();
    units.forEach((u) => {
      if (u.classId === id && !u.deletedAt) {
        u.deletedAt = now;
        unitIds.add(u.id);
      }
    });
    save(K_UNITS, units);

    // Cascade delete topics
    const topics = this.getTopics();
    topics.forEach((t) => {
      if (unitIds.has(t.courseUnitId) && !t.deletedAt) {
        t.deletedAt = now;
      }
    });
    save(K_TOPICS, topics);

    notify();
  },

  // --- COURSE UNITS (Unlimited) ---
  getCourseUnits(): CourseUnitRow[] {
    return load<CourseUnitRow>(K_UNITS, SEED_UNITS);
  },

  getUnitsForClass(classId: string): CourseUnitRow[] {
    return this.getCourseUnits()
      .filter((u) => u.classId === classId && !u.deletedAt)
      .sort((a, b) => a.title.localeCompare(b.title));
  },

  getUnitById(id: string): CourseUnitRow | null {
    return this.getCourseUnits().find((u) => u.id === id) ?? null;
  },

  createUnit(data: {
    classId: string;
    title: string;
    code?: string;
    contactHours?: number | null;
    teachingHours?: number | null;
    description?: string;
    curriculum?: string;
    objectives?: string;
    outline?: string;
  }): CourseUnitRow {
    const all = this.getCourseUnits();
    const now = new Date().toISOString();
    const newUnit: CourseUnitRow = {
      id: generateId(),
      classId: data.classId,
      title: data.title.trim(),
      code: data.code?.trim() || null,
      contactHours: data.contactHours ?? data.teachingHours ?? null,
      teachingHours: data.teachingHours ?? data.contactHours ?? null,
      description: data.description?.trim() || null,
      curriculum: data.curriculum?.trim() || null,
      objectives: data.objectives?.trim() || null,
      outline: data.outline?.trim() || null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    all.push(newUnit);
    save(K_UNITS, all);
    notify();
    return newUnit;
  },

  updateUnit(
    id: string,
    data: {
      title: string;
      code?: string;
      contactHours?: number | null;
      teachingHours?: number | null;
      description?: string;
      curriculum?: string;
      objectives?: string;
      outline?: string;
    }
  ): void {
    const all = this.getCourseUnits();
    const idx = all.findIndex((u) => u.id === id);
    if (idx === -1) return;

    all[idx] = {
      ...all[idx],
      title: data.title.trim(),
      code: data.code?.trim() || null,
      contactHours: data.contactHours ?? all[idx].contactHours,
      teachingHours: data.teachingHours ?? all[idx].teachingHours,
      description: data.description?.trim() || null,
      curriculum: data.curriculum?.trim() || null,
      objectives: data.objectives?.trim() || null,
      outline: data.outline?.trim() || null,
      updatedAt: new Date().toISOString(),
    };
    save(K_UNITS, all);
    notify();
  },

  deleteUnit(id: string): void {
    const now = new Date().toISOString();
    const units = this.getCourseUnits();
    const idx = units.findIndex((u) => u.id === id);
    if (idx !== -1) {
      units[idx].deletedAt = now;
      save(K_UNITS, units);
    }
    const topics = this.getTopics();
    topics.forEach((t) => {
      if (t.courseUnitId === id && !t.deletedAt) {
        t.deletedAt = now;
      }
    });
    save(K_TOPICS, topics);
    notify();
  },

  // --- TOPICS ---
  getTopics(): TopicRow[] {
    return load<TopicRow>(K_TOPICS, SEED_TOPICS);
  },

  getTopicsForUnit(unitId: string): TopicRow[] {
    return this.getTopics()
      .filter((t) => t.courseUnitId === unitId && !t.deletedAt)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  createTopic(data: {
    courseUnitId: string;
    name: string;
    description?: string;
    contactHours?: number;
    sortOrder?: number;
  }): TopicRow {
    const all = this.getTopics();
    const now = new Date().toISOString();
    const newTopic: TopicRow = {
      id: generateId(),
      courseUnitId: data.courseUnitId,
      parentTopicId: null,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      contactHours: data.contactHours ?? null,
      sortOrder: data.sortOrder ?? all.filter((t) => t.courseUnitId === data.courseUnitId).length,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    all.push(newTopic);
    save(K_TOPICS, all);
    notify();
    return newTopic;
  },

  deleteTopic(id: string): void {
    const all = this.getTopics();
    const idx = all.findIndex((t) => t.id === id);
    if (idx !== -1) {
      all[idx].deletedAt = new Date().toISOString();
      save(K_TOPICS, all);
      notify();
    }
  },

  // --- REFERENCES ---
  getReferences(): ReferenceDocRow[] {
    return load<ReferenceDocRow>(K_REFS, SEED_REFS);
  },

  getReferencesForUnit(unitId: string): ReferenceDocRow[] {
    return this.getReferences().filter((r) => r.courseUnitId === unitId);
  },

  addReference(data: {
    courseUnitId: string;
    fileName: string;
    fileType: 'pdf' | 'docx' | 'pptx' | 'image' | 'text';
    extractedText: string;
    fileSize?: string;
  }): ReferenceDocRow {
    const all = this.getReferences();
    const newRef: ReferenceDocRow = {
      id: generateId(),
      courseUnitId: data.courseUnitId,
      fileName: data.fileName,
      fileType: data.fileType,
      extractedText: data.extractedText,
      fileSize: data.fileSize || '1.0 MB',
      uploadedAt: new Date().toISOString(),
    };
    all.push(newRef);
    save(K_REFS, all);
    notify();
    return newRef;
  },

  deleteReference(id: string): void {
    const all = this.getReferences().filter((r) => r.id !== id);
    save(K_REFS, all);
    notify();
  },

  // --- LECTURE NOTES ---
  getLectureNotes(): LectureNoteRow[] {
    return load<LectureNoteRow>(K_NOTES, SEED_NOTES);
  },

  getNotesForUnit(unitId: string): LectureNoteRow[] {
    return this.getLectureNotes().filter((n) => n.courseUnitId === unitId);
  },

  getNoteById(id: string): LectureNoteRow | null {
    return this.getLectureNotes().find((n) => n.id === id) ?? null;
  },

  saveLectureNote(note: Omit<LectureNoteRow, 'id' | 'updatedAt'> & { id?: string }): LectureNoteRow {
    const all = this.getLectureNotes();
    const now = new Date().toISOString();
    if (note.id) {
      const idx = all.findIndex((n) => n.id === note.id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...note, updatedAt: now };
        save(K_NOTES, all);
        notify();
        return all[idx];
      }
    }
    const created: LectureNoteRow = {
      ...note,
      id: generateId(),
      updatedAt: now,
    };
    all.push(created);
    save(K_NOTES, all);
    notify();
    return created;
  },

  deleteLectureNote(id: string): void {
    const all = this.getLectureNotes().filter((n) => n.id !== id);
    save(K_NOTES, all);
    notify();
  },

  // --- ASSESSMENTS & EXAMS ---
  getAssessments(): AssessmentRow[] {
    return load<AssessmentRow>(K_ASSESSMENTS, SEED_ASSESSMENTS);
  },

  getAssessmentsForUnit(unitId: string): AssessmentRow[] {
    return this.getAssessments().filter((a) => a.courseUnitId === unitId);
  },

  saveAssessment(data: Omit<AssessmentRow, 'id' | 'createdAt'> & { id?: string }): AssessmentRow {
    const all = this.getAssessments();
    const now = new Date().toISOString();
    if (data.id) {
      const idx = all.findIndex((a) => a.id === data.id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...data };
        save(K_ASSESSMENTS, all);
        notify();
        return all[idx];
      }
    }
    const created: AssessmentRow = {
      ...data,
      id: generateId(),
      createdAt: now,
    };
    all.push(created);
    save(K_ASSESSMENTS, all);
    notify();
    return created;
  },

  deleteAssessment(id: string): void {
    const all = this.getAssessments().filter((a) => a.id !== id);
    save(K_ASSESSMENTS, all);
    notify();
  },

  // --- QUESTION BANK ---
  getQuestionBank(): QuestionBankItem[] {
    return load<QuestionBankItem>(K_QBANK, []);
  },

  saveQuestionBankItem(item: Omit<QuestionBankItem, 'id' | 'createdAt'>): QuestionBankItem {
    const all = this.getQuestionBank();
    const created: QuestionBankItem = {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    all.push(created);
    save(K_QBANK, all);
    notify();
    return created;
  },

  // --- STUDENTS & GRADES ---
  getStudents(): StudentRow[] {
    return load<StudentRow>(K_STUDENTS, SEED_STUDENTS);
  },

  getActiveStudents(): StudentRow[] {
    return this.getStudents().filter((s) => !s.deletedAt);
  },

  getStudentsForClass(classId: string): StudentRow[] {
    return this.getActiveStudents().filter((s) => s.classId === classId);
  },

  saveStudent(student: Omit<StudentRow, 'id' | 'deletedAt'> & { id?: string }): StudentRow {
    const all = this.getStudents();
    if (student.id) {
      const idx = all.findIndex((s) => s.id === student.id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...student };
        save(K_STUDENTS, all);
        notify();
        return all[idx];
      }
    }
    const created: StudentRow = {
      ...student,
      id: generateId(),
      deletedAt: null,
    };
    all.push(created);
    save(K_STUDENTS, all);
    notify();
    return created;
  },

  updateStudentMark(studentId: string, assessmentId: string, score: number): void {
    const all = this.getStudents();
    const idx = all.findIndex((s) => s.id === studentId);
    if (idx !== -1) {
      all[idx].marks = {
        ...(all[idx].marks || {}),
        [assessmentId]: score,
      };
      save(K_STUDENTS, all);
      notify();
    }
  },

  deleteStudent(id: string): void {
    const all = this.getStudents();
    const idx = all.findIndex((s) => s.id === id);
    if (idx !== -1) {
      all[idx].deletedAt = new Date().toISOString();
      save(K_STUDENTS, all);
      notify();
    }
  },

  // --- DEEP SOLVE CHAT ---
  getDeepSolveMessages(): DeepSolveMessage[] {
    return load<DeepSolveMessage>(K_DEEPSOLVE, []);
  },

  addDeepSolveMessage(msg: Omit<DeepSolveMessage, 'id' | 'createdAt'>): DeepSolveMessage {
    const all = this.getDeepSolveMessages();
    const created: DeepSolveMessage = {
      ...msg,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    all.push(created);
    save(K_DEEPSOLVE, all);
    notify();
    return created;
  },

  clearDeepSolve(): void {
    localStorage.removeItem(K_DEEPSOLVE);
    notify();
  },

  // --- FULL SNAPSHOT EXPORT / IMPORT ---
  exportFullWorkspace(): string {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      classes: this.getClasses(),
      units: this.getCourseUnits(),
      topics: this.getTopics(),
      references: this.getReferences(),
      notes: this.getLectureNotes(),
      assessments: this.getAssessments(),
      questionBank: this.getQuestionBank(),
      students: this.getStudents(),
    };
    return JSON.stringify(data, null, 2);
  },

  importFullWorkspace(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.classes) save(K_CLASSES, data.classes);
      if (data.units) save(K_UNITS, data.units);
      if (data.topics) save(K_TOPICS, data.topics);
      if (data.references) save(K_REFS, data.references);
      if (data.notes) save(K_NOTES, data.notes);
      if (data.assessments) save(K_ASSESSMENTS, data.assessments);
      if (data.questionBank) save(K_QBANK, data.questionBank);
      if (data.students) save(K_STUDENTS, data.students);
      notify();
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },

  resetDefaults(): void {
    localStorage.removeItem(K_CLASSES);
    localStorage.removeItem(K_UNITS);
    localStorage.removeItem(K_TOPICS);
    localStorage.removeItem(K_REFS);
    localStorage.removeItem(K_NOTES);
    localStorage.removeItem(K_ASSESSMENTS);
    localStorage.removeItem(K_QBANK);
    localStorage.removeItem(K_STUDENTS);
    localStorage.removeItem(K_DEEPSOLVE);
    notify();
  },
};

// --- REACT HOOKS ---
export function useActiveClasses(): ClassRow[] {
  const [, setVer] = useState(0);
  useEffect(() => {
    const listener = () => setVer((v) => v + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return dbService.getActiveClasses();
}

export function useClassById(id: string): ClassRow | null {
  const [, setVer] = useState(0);
  useEffect(() => {
    const listener = () => setVer((v) => v + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return dbService.getClassById(id);
}

export function useUnitsForClass(classId: string): CourseUnitRow[] {
  const [, setVer] = useState(0);
  useEffect(() => {
    const listener = () => setVer((v) => v + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return dbService.getUnitsForClass(classId);
}

export function useAllUnits(): CourseUnitRow[] {
  const [, setVer] = useState(0);
  useEffect(() => {
    const listener = () => setVer((v) => v + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return dbService.getCourseUnits().filter((u) => !u.deletedAt);
}

export function useUnitById(id: string): CourseUnitRow | null {
  const [, setVer] = useState(0);
  useEffect(() => {
    const listener = () => setVer((v) => v + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return dbService.getUnitById(id);
}

export function useTopicsForUnit(unitId: string): TopicRow[] {
  const [, setVer] = useState(0);
  useEffect(() => {
    const listener = () => setVer((v) => v + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return dbService.getTopicsForUnit(unitId);
}

export function useReferencesForUnit(unitId: string): ReferenceDocRow[] {
  const [, setVer] = useState(0);
  useEffect(() => {
    const listener = () => setVer((v) => v + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return dbService.getReferencesForUnit(unitId);
}

export function useNotesForUnit(unitId: string): LectureNoteRow[] {
  const [, setVer] = useState(0);
  useEffect(() => {
    const listener = () => setVer((v) => v + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return dbService.getNotesForUnit(unitId);
}

export function useAssessmentsForUnit(unitId: string): AssessmentRow[] {
  const [, setVer] = useState(0);
  useEffect(() => {
    const listener = () => setVer((v) => v + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return dbService.getAssessmentsForUnit(unitId);
}

export function useAllAssessments(): AssessmentRow[] {
  const [, setVer] = useState(0);
  useEffect(() => {
    const listener = () => setVer((v) => v + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return dbService.getAssessments();
}

export function useStudentsForClass(classId: string): StudentRow[] {
  const [, setVer] = useState(0);
  useEffect(() => {
    const listener = () => setVer((v) => v + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return dbService.getStudentsForClass(classId);
}

export function useAllActiveStudents(): StudentRow[] {
  const [, setVer] = useState(0);
  useEffect(() => {
    const listener = () => setVer((v) => v + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return dbService.getActiveStudents();
}

export function useDeepSolveMessages(): DeepSolveMessage[] {
  const [, setVer] = useState(0);
  useEffect(() => {
    const listener = () => setVer((v) => v + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return dbService.getDeepSolveMessages();
}
