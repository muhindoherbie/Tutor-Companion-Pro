# Tutor Companion — AI-Powered Academic Management & Teaching Suite

A complete, enterprise-grade academic operating system for educators, tutors, and institutions to ingest entire national or institutional curricula, generate structured classes, course units, and hourly contact lecture notes with multi-format exports (PPTX, PDF, DOCX), construct differentiated assessments and exams with marking schemes, maintain an unlimited student marks registry, and solve complex academic tasks using a multimodal Deep Solve assistant.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed during interactive clarification and govern the system design:

- **AI Engine & Multimodal Ingestion**: Powered by Google's native `gemini-2.5-flash` via a secure server-side Express proxy (`/api/ai/*`). This handles full-text curricula, syllabi, scanned PDF/Word/PPT references, and tutor voice notes without hitting browser payload constraints or exposing API keys.
- **Multi-Format Export Engine**: Client-side document compilation generating native Microsoft PowerPoint presentations (`.pptx` via `pptxgenjs`), Microsoft Word documents (`.docx` via `docx`), and printable Adobe PDF documents (`.pdf` via `jspdf` & `html2canvas`) directly from generated lecture notes and exams.
- **Deep Solve Tutor Workspace**: A dedicated, always-accessible modal and dedicated view capable of solving tasks, mathematical proofs, pharmacology case studies, and exam questions from typed text, recorded voice audio, attached textbook images, and reference document snippets.
- **Unlimited Offline Data Layer**: Elimination of arbitrary entity limits (removing the 20-class limit, student caps, and file count limits) backed by browser IndexedDB + LocalStorage with structured JSON backup, restore, and cloud-readiness sync.

---

## 1. Overview & Core Concept

### What It Does
Tutor Companion transforms dense, complex curriculum documents (e.g., National Diploma in Pharmacy, Certificate in Medical Laboratory Technology, Nursing Foundations) into a fully structured academic workspace. It parses competencies, contact hours, and modules to automatically instantiate classes, course units, learning objectives, and hour-by-hour lecture notes rooted in uploaded reference materials. Educators can generate custom assessments (MCQs, short answer, essays, or substandard variations), maintain student biodata and marks records across academic years, and use AI to deep-solve academic problems.

### Target Audience & Persona
- **Individual Tutors & Lecturers**: Streamlining hours of manual lesson planning, slide preparation, and exam drafting.
- **Department Heads & Academic Coordinators**: Harmonizing teaching syllabi, tracking student marks across course units, and ensuring adherence to official curriculum hours.
- **Institutions**: Maintaining an offline-resilient, portable gradebook and course asset bank.

### Key Value
- **Zero-to-Syllabus in Seconds**: Ingesting a 50-page curriculum PDF or Word guide and getting an organized academic year structure with contact-hour lecture modules.
- **Grounded in Real References**: Lecture notes and exam questions cite and extract directly from user-uploaded textbooks and guidelines rather than generic hallucinations.
- **Offline First & Platform Agnostic**: Full local data persistence with responsive layout optimized for Windows PC widescreen displays and Android mobile viewports.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TUTOR WORKFLOW JOURNEY                            │
└─────────────────────────────────────────────────────────────────────────────┘
  1. Ingest Curriculum       2. Structure & Notes       3. Assess & Grade
  ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
  │ Upload Syllabus  │ ────> │ Auto-generate    │ ────> │ Build Exams &    │
  │ or paste guide   │       │ Classes, Units,  │       │ Marking Schemes; │
  │ (PDF/DOCX/Text)  │       │ Notes by Hours   │       │ Record Marks     │
  └──────────────────┘       └──────────────────┘       └──────────────────┘
           │                          │                          │
           v                          v                          v
  ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
  │ AI Extraction:   │       │ Export to PPTX,  │       │ Deep Solve Chat: │
  │ Modules, Hours,  │       │ DOCX, & PDF for  │       │ Solve exercises, │
  │ Objectives, Code │       │ Class Delivery   │       │ voice & images   │
  └──────────────────┘       └──────────────────┘       └──────────────────┘
```

1. **Curriculum Ingestion Flow**:
   - The user visits the **Curriculum Ingestion** tab or clicks "Import Curriculum" on the dashboard.
   - Uploads a course guide (PDF, DOCX, TXT, or pasted text), sets course parameters (e.g. "Diploma in Pharmacy", 3-year duration), and clicks "Analyze Curriculum".
   - The AI parses the guide and displays a preview: detected academic levels, classes, course units, credit/contact hours, and core objectives.
   - The tutor can review, edit names/hours, and click "Commit to Workspace". The app automatically provisions the classes, course units, and outlines.

2. **Lecture Notes & Reference Processing Flow**:
   - Within any Course Unit, the tutor opens the **Lecture Notes** tab.
   - The user uploads reference documents (textbooks, slides, papers, images) into the unit's Reference Library.
   - The tutor selects target topics or contact hour blocks (e.g. "Week 2: 3 Contact Hours - Pharmacokinetics").
   - Clicks "Generate Grounded Lecture Notes". The AI extracts pertinent textbook excerpts and synthesizes comprehensive notes, teaching points, student activities, and review questions.
   - The tutor can edit in rich text and export with 1-click to **PowerPoint (.pptx)**, **Word (.docx)**, or **Printable PDF**.

3. **Assessments & Question Bank Flow**:
   - The tutor navigates to **Assessments & Exams**.
   - Configures an assessment: selects target course unit, checks specific topics, chooses assessment type (Continuous Assessment, Coursework, Midterm, Final Exam, or Substandard quiz).
   - Selects format: Standard (Section A: MCQs, Section B: Short Answers, Section C: Long Essay Questions) or uploads a Reference Exam Standard for structural mirroring.
   - Generates the complete Exam Paper alongside an authoritative **Marking Scheme with Model Solutions and Rubrics**.
   - Questions can be saved directly to the unit's permanent **Question Bank**.

4. **Students & Gradebook Flow**:
   - The **Students** tab provides an interactive gradebook organized by Class and Year of Study.
   - Features comprehensive student biodata (Student ID, Full Name, Gender, Contact, Guardian, Enrollment Date, Status).
   - Dynamic assessment columns: marks for coursework, midterms, and finals with automatic weighted total calculation, letter grading, and GPA/rank summaries.
   - Full inline editing with bulk CSV import and export.

5. **Deep Solve AI Assistant**:
   - Accessible via a prominent floating action button or dedicated navigation tab.
   - Supports multimodal inputs: typed math/science questions, attached images (diagrams, handwritten student work, lab results), uploaded reference documents, or microphone audio recordings.
   - Delivers step-by-step academic solutions, pedagogical explanations, and rubric grading suggestions.

### Visual Identity & Theme
- **Color Discipline (60-30-10)**:
  - `60% Neutral Canvas`: Crisp slate-tinted canvas (`#F8FAFC` light / `#0F172A` dark) providing high legibility.
  - `30% Structural Panels`: Clean white surfaces (`#FFFFFF`), hairline borders (`#E2E8F0`), and neutral card divisions.
  - `10% Purposeful Accents`: Deep academic Teal (`#00696F` primary, `#004D52` hover) paired with soft cyan containers (`#D2ECEE`) and focused semantic alerts (emerald for pass/nominal, amber for pending, rose for alerts).
- **Typography**:
  - Display & Headings: `Plus Jakarta Sans` (bold, geometric authority).
  - Body & UI: `Plus Jakarta Sans` / `DM Sans` (exceptional readability across tables and notes).
  - Data & Metrics: `font-mono tabular-nums` (`JetBrains Mono`) for aligned grades, marks, and contact hours.
- **Navigation & Responsiveness**:
  - Desktop (≥960px): Persistent left navigation rail with collapsed/expanded labels.
  - Mobile & Tablet (<960px): Thumb-friendly bottom navigation bar with active indicator capsules and gesture-friendly cards.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Server-Side Gemini API via Express
- **Chosen Approach**: Full-stack Node/Express server (`server.ts`) wrapping Vite middlewares in development and serving the production build, exposing `/api/ai/*` proxy routes using `@google/genai` and `gemini-2.5-flash`.
- **Why**: Allows processing large curriculum documents, multimodal image/audio payloads, and complex prompt instructions safely on the backend with `process.env.GEMINI_API_KEY`. Avoids exposing API credentials to the client.

### Decision 2: Pure Client-Side Document Exporters (PPTX, DOCX, PDF)
- **Chosen Approach**: Utilize `pptxgenjs` for generating styled slide decks, `docx` for professional Word documents with headings and tables, and `jspdf` for print-ready PDFs.
- **Why**: Works completely offline once the web app is loaded. Instant generation with zero server latency or file upload queues.

### Decision 3: Removal of Entity Caps & Storage Architecture
- **Chosen Approach**: Replace the legacy 20-class cap and limited array storage with an IndexedDB-backed repository (`idb` / local database engine) alongside reactive React state.
- **Why**: The user requested unlimited classes, course units, students, and reference files. IndexedDB supports hundreds of megabytes of local data, offline availability, and high-speed querying.

### Decision 4: Hyperlinked Navigation Architecture
- **Chosen Approach**: Cross-entity linking throughout: clicking a class on the dashboard links to its units; clicking a unit links to its lecture notes, assessments, and gradebook tab; student records link to their performance across all enrolled units.
- **Why**: Fulfills the requirement for extensive, fluid cross-referencing across all tabs.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TUTOR COMPANION ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────┐
  │                         CLIENT (React 19 + Vite)                        │
  │                                                                         │
  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────────┐  │
  │  │  Curriculum  │ │   Classes &  │ │ Lecture Note │ │  Assessments & │  │
  │  │   Ingestion  │ │ Course Units │ │   Studio     │ │  Exam Studio   │  │
  │  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └───────┬────────┘  │
  │         │                │                │                 │           │
  │  ┌──────┴───────┐ ┌──────┴───────┐ ┌──────┴───────┐ ┌───────┴────────┐  │
  │  │   Students & │ │  Deep Solve  │ │ Doc Exporters │ │ Reactive DB  │  │
  │  │   Gradebook  │ │ Multimodal AI│ │PPTX/DOCX/PDF │ │  (IndexedDB) │  │
  │  └──────────────┘ └──────┬───────┘ └──────────────┘ └───────┬────────┘  │
  └──────────────────────────┼──────────────────────────────────┼───────────┘
                             │                                  │
                   HTTP/JSON │ (API Requests)                   │ Local Cache
                             v                                  v
  ┌──────────────────────────────────────────────────┐ ┌──────────────────┐
  │             SERVER (Express + Node.js)           │ │ Offline Storage  │
  │                                                  │ │ Browser          │
  │  POST /api/ai/analyze-curriculum                 │ │ IndexedDB Store  │
  │  POST /api/ai/generate-notes                     │ │ (Unlimited Docs) │
  │  POST /api/ai/generate-assessment                │ └──────────────────┘
  │  POST /api/ai/deep-solve                         │
  │                                                  │
  │  Uses @google/genai (gemini-2.5-flash)           │
  └──────────────────────────────────────────────────┘
```

### Data Entities & Schema

```typescript
// 1. Curriculum Ingestion Record
interface CurriculumImport {
  id: string;
  courseTitle: string; // e.g. "Diploma in Pharmacy"
  institution?: string;
  durationYears: number;
  rawText: string;
  analyzedAt: string;
  detectedClasses: {
    name: string;
    level: string;
    units: {
      title: string;
      code: string;
      contactHours: number;
      objectives: string[];
      outline: string[];
    }[];
  }[];
}

// 2. Class Entity (Unlimited)
interface AcademicClass {
  id: string;
  name: string;
  academicLevel: string;
  yearOfStudy: number;
  academicYear: string; // e.g. "2025/2026"
  description: string;
  createdAt: string;
  updatedAt: string;
}

// 3. Course Unit & Curriculum Mapping
interface CourseUnit {
  id: string;
  classId: string;
  title: string;
  code: string;
  contactHours: number;
  teachingHours: number;
  description: string;
  curriculum: string;
  objectives: string[];
  outline: string[];
  references: ReferenceDocument[];
  topics: CourseTopic[];
}

// 4. Topics & Contact Hours Breakdown
interface CourseTopic {
  id: string;
  unitId: string;
  name: string;
  contactHours: number;
  learningObjectives: string[];
  sortOrder: number;
}

// 5. Lecture Notes (Formatted by Contact Hours & Grounded in References)
interface LectureNote {
  id: string;
  unitId: string;
  topicId: string;
  title: string;
  contactHours: number;
  contentMarkdown: string;
  slideDeckData?: Slide[];
  citedReferences: string[];
  updatedAt: string;
}

// 6. Reference Documents & Text Excerpts
interface ReferenceDocument {
  id: string;
  unitId: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'pptx' | 'image' | 'text';
  extractedText: string;
  uploadedAt: string;
}

// 7. Assessments & Question Bank
interface Assessment {
  id: string;
  unitId: string;
  title: string;
  type: 'coursework' | 'assignment' | 'exam' | 'quiz';
  format: 'standard' | 'substandard' | 'custom_rubric';
  sections: {
    title: string;
    type: 'mcq' | 'short_answer' | 'essay';
    weightMarks: number;
    questions: {
      question: string;
      options?: string[];
      modelAnswer: string;
      markingGuide: string;
      maxMarks: number;
      topicTag: string;
    }[];
  }[];
  totalMarks: number;
  createdAt: string;
}

// 8. Students Biodata & Systematic Gradebook
interface Student {
  id: string;
  studentIdNumber: string; // e.g. "DPH/2025/042"
  classId: string;
  fullName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  contactEmail?: string;
  contactPhone?: string;
  guardianName?: string;
  guardianPhone?: string;
  yearOfStudy: number;
  enrollmentDate: string;
  marks: Record<string, number>; // assessmentId -> score
}
```

---

## 5. Implementation Stages & Delivery Steps

1. **Backend Integration & Express Server**:
   - Establish `server.ts` with Vite middlewares in development.
   - Implement `@google/genai` API endpoints with `gemini-2.5-flash`:
     - `/api/ai/analyze-curriculum`: Extracts structured classes, units, contact hours, and objectives.
     - `/api/ai/generate-notes`: Synthesizes lecture notes by contact hour aligned with uploaded reference materials.
     - `/api/ai/generate-assessment`: Generates standard or custom exams with complete marking schemes and rubrics.
     - `/api/ai/deep-solve`: Multimodal solver handling text, images, and transcribed audio queries.

2. **Unlimited Storage & Database Layer**:
   - Upgrade persistence service to IndexedDB with automatic local storage fallback.
   - Remove class, unit, and student quantity restrictions.
   - Add workspace export/import (JSON snapshot) for full local and cloud-ready backups.

3. **Curriculum Ingestion & Auto-Provisioning Engine**:
   - Document uploader supporting PDF, Word, text, and manual pastes.
   - Interactive preview matrix allowing tutors to inspect, adjust, and one-click provision classes, units, outlines, and objectives.

4. **Reference Library & Lecture Notes Studio**:
   - Reference document upload and content extractor.
   - Hourly contact notes builder with rich markdown editor.
   - Multi-format document export triggers: PPTX presentation generator, Word DOCX document builder, and formatted PDF print view.

5. **Assessment & Question Bank Studio**:
   - Assessment generator with topic checkboxes and standard format configuration (MCQs, Short Answer, Long Essay).
   - Sample reference exam uploader to mirror existing institutional formats.
   - Full marking scheme with rubric and model answers.
   - Question bank repository with search and filter capabilities.

6. **Students & Academic Gradebook**:
   - Student biodata management (ID, contact, year of study, guardian).
   - Interactive gradebook grid with real-time mark entry, weighted score tallies, and grading rules.
   - CSV import/export.

7. **Deep Solve Tutor Assistant**:
   - Dedicated tutor solver panel with voice recording capture, image attachment, document picker, and step-by-step resolution display.
