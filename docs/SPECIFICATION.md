# Tutor Companion — Specification

**AI Development Command Document — Version 1.0**
Product Requirements, Technical Architecture, and AI Development Instructions.

> Purpose: This document defines the vision, features, technical requirements, and step-by-step commands for building Tutor Companion. You can give it to another AI model or coding agent to guide the development of the application.
>
> Source: product owner's command document (v1.0), transcribed 2026-10-18.

---

## 1. Project Overview

### 1.1 Application name

Tutor Companion

### 1.2 Project vision

Tutor Companion is a general-purpose, AI-powered teaching and academic management system designed to help tutors, lecturers, teachers, and educational institutions manage their academic responsibilities from one platform.

The application should provide the tools necessary to prepare lessons, organize classes, manage course units, create assessments, record student marks, analyze academic performance, and conduct research.

The system must be designed for Windows, Android, and web browsers from the beginning.

### 1.3 Target users

- Individual tutors and teachers.
- University lecturers.
- Diploma and certificate training institutions.
- Schools and colleges.
- Multiple tutors collaborating within an institution.

Tutor Companion must not be restricted to a single school. Any eligible tutor or institution should be able to register and use the platform.

### 1.4 Core operating principles

The application must follow these principles:

1. Cross-platform: Support Windows, Android, and the web.
2. Offline-first: Store essential data locally so users can continue working without an internet connection.
3. AI-powered: Integrate OpenAI to support educational content generation and research.
4. Independent workspaces: Give each tutor a separate workspace by default.
5. Optional cloud backup: Allow users to back up and restore their data when they choose.
6. Controlled collaboration: Permit tutors to share classes and academic resources only when authorized.
7. Data security: Protect accounts, teaching materials, and student records.
8. Modular development: Build the system in stages without compromising the overall architecture.

---

## 2. Core Functional Requirements

### 2.1 Dashboard

Create a professional dashboard displaying:

- Total classes.
- Total course units.
- Recently accessed textbooks and resources.
- Recently generated lecture notes.
- Upcoming assessments.
- Recent student performance reports.
- Storage usage.
- Internet connection status.
- Cloud backup and synchronization status.
- Quick actions for common teaching activities.

The dashboard must be responsive and suitable for computers, tablets, and mobile phones.

### 2.2 Class management

The application must allow users to:

- Create up to 20 classes per tutor workspace.
- Edit and delete classes.
- View all classes in one organized interface.
- Add multiple course units to each class.
- Store class descriptions and academic levels.
- Organize students by class.
- Associate curricula and learning materials with classes.

The 20-class limit should be enforced with a clear message when the limit is reached.

### 2.3 Course unit management

Each class must support multiple course units.

For every course unit, users should be able to manage:

- Course title and description.
- Course code.
- Curriculum.
- Course outline.
- Learning objectives and outcomes.
- Topics and subtopics.
- Teaching hours.
- Textbooks and references.
- Lecture notes.
- PowerPoint presentations.
- Assignments and coursework.
- Quizzes.
- Examinations.
- Model answers and marking guides.
- Student assessment results.

Course units must remain linked to their respective classes.

### 2.4 Digital library

Create a digital library where tutors can upload and organize academic materials.

Supported materials should include, where technically feasible:

- PDF textbooks.
- Word documents.
- PowerPoint presentations.
- Excel spreadsheets.
- Text documents.
- Curriculum documents.
- Course outlines.
- Research articles.
- Reading materials.
- Reference documents.
- Images and other educational resources.

Each resource should support metadata such as:

- Title.
- Author.
- Publication year.
- Edition.
- Subject.
- Course unit.
- Class.
- Source or publisher.
- File location.
- Notes and tags.

The application must support local storage of selected materials for offline access.

It should also allow tutors to organize resources by class, course unit, topic, and document type.

---

## 3. AI Teaching Assistant

The AI Teaching Assistant is one of the most important components of Tutor Companion.

It should use OpenAI to help tutors prepare educational materials based on their selected curricula, textbooks, references, and instructions.

### 3.1 Lecture note generator

The tutor should be able to select a class and course unit, choose the relevant curriculum topics, select reference materials, and generate lecture notes.

The generator should support:

- Comprehensive lecture notes.
- Topic-by-topic notes.
- Learning objectives.
- Definitions and explanations.
- Detailed subject discussions.
- Examples and case studies.
- Tables and diagrams where appropriate.
- Practical exercises.
- Revision questions.
- References and citations.
- Suggested further reading.
- Summaries and key learning points.

The tutor should be able to specify the required level of detail.

Generated content must be editable before it is exported or used in teaching.

The AI should prioritize uploaded source materials and distinguish verified source information from its own generated explanations.

### 3.2 Examination generator

The application must generate examinations aligned with the selected curriculum and learning outcomes.

Supported question types should include:

- Multiple-choice questions.
- True-or-false questions.
- Short-answer questions.
- Structured questions.
- Essay questions.
- Case-based questions.
- Practical assessment questions.

The tutor should be able to specify:

- Examination title.
- Class and course unit.
- Topics to assess.
- Examination duration.
- Total marks.
- Number of questions.
- Difficulty level.
- Question types.
- Marks allocated to each question.
- Instructions for candidates.

The system should also generate, when requested:

- Model answers.
- Marking guides.
- Marks allocation.
- Explanations for correct answers.
- Learning outcomes assessed.

The tutor must be able to review and edit an examination before exporting it.

### 3.3 Quiz generator

The application should generate quizzes for revision, classroom activities, and continuous assessment.

Required features:

- Select class and course unit.
- Select topics.
- Set quiz length.
- Choose question types.
- Set difficulty.
- Generate answers and explanations.
- Export quizzes to Word or PDF.
- Support interactive quizzes where technically feasible.

### 3.4 Assignment and coursework generator

The system should generate:

- Individual assignments.
- Group assignments.
- Coursework.
- Research assignments.
- Case studies.
- Practical exercises.
- Discussion questions.
- Project instructions.
- Assignment marking rubrics.

Assignments should be aligned with the curriculum and the intended learning outcomes.

### 3.5 Presentation generator

The application must generate teaching presentations in PowerPoint format.

The generator should support:

- Presentation titles.
- Learning objectives.
- Topic summaries.
- Detailed teaching points.
- Tables and illustrations.
- Case studies.
- Discussion questions.
- Revision questions.
- References.

The tutor should be able to choose presentation length and teaching level.

### 3.6 AI limitations and connectivity

OpenAI-powered generation will normally require an internet connection.

When offline, Tutor Companion should still allow users to access saved materials and work with supported local editing and document-generation features.

A local AI model may be investigated as a separate optional feature if fully offline AI generation is later required.

---

## 4. Document Generation and Export

Tutor Companion must support exporting educational materials into common file formats.

| Format | Intended use |
|---|---|
| DOCX | Lecture notes, assignments, examinations, and reports |
| PPTX | Teaching presentations |
| XLSX | Marksheets, grading tables, schedules, and analytical data |
| PDF | Printable lecture notes, examinations, assignments, and reports |

The export system must preserve headings, tables, formatting, and references as appropriate.

Users should be able to choose where to save generated files on their devices.

The application must not claim an export is successful unless the file has actually been generated and saved.

---

## 5. Student Management and Assessment

### 5.1 Student registration

The system must allow tutors to:

- Register students.
- Assign students to classes.
- View class lists.
- Edit student records.
- Import student records where supported.
- Export student lists where authorized.

Student data must be protected by appropriate access controls.

### 5.2 Marks management

The application should support recording marks for:

- Coursework.
- Assignments.
- Quizzes.
- Practical examinations.
- Midterm examinations.
- Final examinations.
- Other configurable assessments.

Tutors should be able to specify the maximum score for each assessment.

The system must validate scores and prevent invalid entries.

### 5.3 Grade calculations

The system should support configurable grading rules.

It must be possible to calculate:

- Assessment totals.
- Weighted scores.
- Final marks.
- Grades.
- Class averages.
- Pass rates.
- Student rankings, where appropriate.
- Performance trends.

Grading rules should not be hard-coded to a single institution's system.

The application should show the formulas used to calculate grades.

### 5.4 Academic performance analytics

Tutor Companion should analyze available assessment data to identify:

- Students performing well.
- Students needing additional support.
- Topics associated with low scores.
- Differences between assessments.
- Class performance trends.
- Areas that may need additional teaching.

Reports must be based on actual recorded data.

The system must not invent marks or student information.

---

## 6. Research and Multimedia Assistant

When online, Tutor Companion should help tutors find useful academic and educational resources.

### 6.1 Academic research

The system should help users discover:

- Research articles.
- Academic publications.
- Relevant guidelines.
- Educational reference materials.
- Scientific illustrations.
- Subject-specific resources.

For each result, the application should display available information such as the title, author, publication date, source, and URL.

AI-generated citations must not be presented as verified references unless they have been checked against actual sources.

### 6.2 Images and illustrations

The application should help tutors find relevant educational images, diagrams, and illustrations.

It should display source links and relevant attribution or licensing information when available.

### 6.3 YouTube integration

The application should help tutors find educational videos relevant to their course units.

Users should be able to associate video links with:

- Classes.
- Course units.
- Curriculum topics.
- Lecture notes.

Where possible, users should be able to save video links for later offline reference.

The application must not promise offline video playback unless the video has been lawfully downloaded and the technical requirements are satisfied.

---

## 7. Multi-Tutor and Multi-School Architecture

Tutor Companion must support individual tutors and institutions.

### 7.1 User accounts

Each tutor must have an individual account with secure authentication.

Tutors should be able to access their own authorized workspaces.

### 7.2 Separate workspaces

By default, each tutor should have a separate local workspace.

The application should not automatically upload all local data merely because a user signs in.

Tutors must be able to decide when to back up or synchronize their data.

### 7.3 Shared academic resources

Authorized tutors should be able to share selected resources and collaborate on classes and course units.

Sharing must be controlled through permissions.

Private records should remain private unless the owner explicitly shares them or an authorized organizational policy permits access.

### 7.4 School administration

The architecture should support optional school accounts and administrators.

Depending on the permissions assigned, administrators may be able to:

- Manage tutor memberships.
- Create shared classes.
- Assign teaching responsibilities.
- Manage institutional course units.
- Access authorized student records.
- Generate institutional reports.

A school administrator must not automatically receive access to every private workspace unless the system's documented permissions allow it.

---

## 8. Offline Storage, Backup, and Synchronization

Offline-first functionality is a core requirement.

### 8.1 Windows

The Windows version should provide:

- Installable desktop software.
- Local database storage.
- Local textbook and document storage.
- Offline access to saved classes and course units.
- Offline access to downloaded resources.
- Local marks management.
- Supported document generation without internet access.

### 8.2 Android

The Android version should provide:

- Installable software.
- Local data storage.
- Access to downloaded teaching materials.
- Offline access to saved records.
- Local editing of supported content.
- Optional backup and restoration.

### 8.3 Web

The web version should provide:

- Browser-based access.
- Secure authentication.
- Authorized cloud resources.
- Offline access to selected cached materials where supported.
- Local browser storage for supported offline workflows.

Because browser storage has limitations, the web version should clearly explain storage availability and provide appropriate export and backup options.

### 8.4 Optional cloud backup

Cloud backup must be initiated or enabled by the tutor.

The system should allow tutors to:

1. Sign in.
2. Open backup settings.
3. Select the data to back up.
4. Upload the selected data when online.
5. View available backups.
6. Restore a backup to a new device.
7. Review the restoration result.

### 8.5 Synchronization

The system should support manual synchronization when requested.

If local and cloud data conflict, the application must not silently overwrite either copy.

It should provide safe options for reviewing and resolving conflicts.

The application should also maintain backup versions and appropriate integrity checks.

---

## 9. Recommended Technical Architecture

The implementation should use a maintainable architecture that supports all three platforms.

One possible approach is:

| Component | Recommended direction |
|---|---|
| Windows application | Cross-platform desktop framework, such as Flutter or another suitable option |
| Android application | Cross-platform mobile framework |
| Web application | Responsive web interface |
| Backend | Secure API service |
| Cloud database | Relational database suitable for accounts and shared academic records |
| Windows local storage | Local database and file storage |
| Android local storage | Local database and application file storage |
| Web local storage | Browser database and service-worker caching where appropriate |
| AI integration | Secure server-side OpenAI API integration |
| Document generation | Libraries appropriate for DOCX, PPTX, XLSX, and PDF |
| Authentication | Secure account and session management |
| Synchronization | Versioned backup and synchronization service |

**Important:** These are architectural recommendations, not a requirement to use a particular framework. The selected technology must be evaluated against the actual development environment, platform requirements, maintenance needs, and budget.

API keys and other privileged secrets must never be embedded directly in distributable client applications.

---

## 10. Master Command for Another AI Model

The following is the primary instruction to give another AI model or coding agent.

Copy everything inside the command block.

```
PROJECT NAME: TUTOR COMPANION

ROLE:
Act as a senior software architect, product engineer,
AI integration specialist, database designer, and
cross-platform application developer.

PROJECT OBJECTIVE:
Build Tutor Companion, a general-purpose AI-powered
teaching and academic management suite for individual
tutors, teachers, lecturers, schools, and educational
institutions.

PLATFORMS:
1. Windows desktop application.
2. Android application.
3. Web application.

The architecture must support all three platforms
from the beginning.

CORE REQUIREMENTS:

1. Support up to 20 classes per applicable tutor
   workspace, with multiple course units in each class.

2. Provide a digital library for textbooks, PDFs,
   curricula, reference materials, and reading documents.

3. Generate lecture notes using uploaded textbooks,
   curricula, course outlines, references, and instructions.

4. Generate examinations, quizzes, assignments,
   coursework, practical exercises, and marking guides.

5. Generate PowerPoint presentations and export
   educational materials to DOCX, PPTX, XLSX, and PDF.

6. Support student registration, class rosters,
   assessment records, marks management, configurable
   grading, and academic performance analytics.

7. Integrate OpenAI for AI-powered educational tasks
   when an internet connection is available.

8. Provide online research assistance for academic
   references, articles, educational images, and
   relevant YouTube videos.

9. Support offline-first operation with locally stored
   records and downloaded teaching materials.

10. Give each tutor a separate local workspace by
    default.

11. Make cloud backup, restoration to new devices,
    and synchronization optional and user-controlled.

12. Support multiple tutors and schools with secure,
    permission-based collaboration.

13. Protect academic records, credentials, and API keys.

14. Provide clear error messages, data validation,
    backup status, and conflict-resolution workflows.

ENGINEERING INSTRUCTIONS:

A. Inspect the existing project files and development
   environment before making changes.

B. Do not assume that a particular framework has
   already been selected.

C. Propose the architecture, database schema, and
   implementation plan before substantial coding.

D. Build the application in manageable phases.

E. Preserve existing working features when modifying
   the project.

F. Implement proper error handling, validation,
   database migrations, and automated tests.

G. Never expose OpenAI API secrets in client code.

H. Do not fabricate academic references or claim
   generated content has been verified when it has not.

I. Require tutor review of AI-generated educational
   materials before they are finalized for use.

J. Do not silently overwrite conflicting local or
   cloud data.

K. Test the actual application before claiming that
   a feature is complete.

L. At the end of every phase, report:
   - Files created or modified.
   - Features implemented.
   - Tests performed and their results.
   - Known limitations.
   - Installation and execution instructions.
   - Recommended next steps.

FIRST TASK:
Inspect the development environment and prepare a
detailed implementation plan for Tutor Companion.

Do not attempt to implement the entire application
in one step.

Begin with the architecture and foundation, then
implement and test each module incrementally.
```

---

## 11. Step-by-Step Development Commands

After the AI has assessed the project and proposed the architecture, use the following commands one at a time.

Do not send all the commands simultaneously. Complete and test each phase before moving to the next.

### Command 1: Architecture and project planning

Using the Tutor Companion master specification, inspect the available project environment.

Recommend a cross-platform architecture for Windows, Android, and web.

Define:

- The application structure.
- The database schema.
- User accounts…

> **⚠️ Truncation note:** the source document supplied to the development team on 2026-10-18 ends here mid-sentence. Any remaining development commands (Command 2 onward) should be appended to this file verbatim when the product owner supplies them. The roadmap in [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md) already covers the full requirements of sections 1–10 of this specification.
