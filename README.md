# Tutor Companion — Academic Management & Teaching Operating Suite

**A high-performance, offline-first academic management operating suite** designed for tutors, lecturers, educational directors, and training institutions. 

Tutor Companion empowers educators to ingest complete course syllabi (e.g. Diploma in Pharmacy, Certificate Programs, Nursing, Engineering), auto-generate contact-hour lecture notes with instant exports to PPTX, DOCX, and PDF, generate rigorous examinations with marking schemes, and manage student gradebooks with zero capacity limits.

---

## 🚀 Key Features

1. **Curriculum & Teacher's Guide Ingestion Engine**:
   - Ingests complete multi-year curriculum documents and syllabi.
   - Powered by Gemini 2.5 Flash to automatically detect program level, duration, academic years, classes, course units, contact hours, outlines, and learning objectives.
   - 1-click workspace commit to instantly provision classes and units.

2. **Lecture Notes Studio (PPTX, DOCX, PDF)**:
   - Organize notes strictly structured by contact hours highlighted in the curriculum.
   - Reference document analysis: upload textbooks, guidelines, or images, extracting factual materials for note generation.
   - Client-side one-click export into Microsoft PowerPoint (`.pptx`), Word Document (`.docx`), and Adobe PDF (`.pdf`).

3. **Assessments & Examination Studio**:
   - Generates standard exams (Multiple Choice Questions, Short Answer, Long Essay questions) or substandard exams.
   - Comprehensive marking schemes and grading rubrics for each question.
   - Topic selectivity: pick specific modules or syllabus topics to assess.
   - Reference exam ingestion: analyze previous past papers to replicate question formatting and difficulty.
   - Persistent Question Banks with model answers.

4. **Deep Solve AI Assistant**:
   - Multimodal problem solver supporting typed questions, voice audio dictation, document attachments, and photographic formula queries.
   - Step-by-step mathematical, clinical, and scientific derivation breakdowns.

5. **Student Registry & Academic Gradebook**:
   - Comprehensive student biodata tracking across academic years.
   - Continuous assessment gradebook: records coursework, assignments, midterm, and final exam marks.
   - Live GPA, class averages, passing rates, and 1-click CSV export.

6. **Offline-First Resilience & Unlimited Workspace**:
   - Local database persistence via browser storage and IndexedDB.
   - Works 100% offline; syncs when internet is available.
   - Full workspace JSON backup export and restore.
   - Zero limits on classes, course units, students, or documents.

---

## 📦 Releases: Windows (.EXE) & Android (.APK)

### Automated GitHub Release via CI/CD
This repository includes a production GitHub Actions workflow at `.github/workflows/release.yml`. When you push a git version tag, GitHub automatically compiles both the Windows executable and Android APK:

```bash
# 1. Connect your GitHub repository:
git remote add origin https://github.com/YOUR_USERNAME/tutor-companion.git

# 2. Push code to main branch:
git branch -M main
git push -u origin main

# 3. Create and push a version tag to trigger release build:
git tag v1.0.0
git push origin v1.0.0
```

Once pushed, GitHub Actions will:
- Build `TutorCompanion-Setup-Windows.exe`
- Build `TutorCompanion-Android.apk`
- Create a public GitHub Release with both binaries attached and download links ready for your students and staff!

---

### Local Builds

#### Windows Executable (.exe)
Double-click `build-windows-exe.bat` or run:
```bash
npm run build:exe
```
Installer output: `dist-electron/Tutor Companion Setup.exe`

#### Android Mobile Package (.apk)
Run the automated build script:
```bash
bash build-android-apk.sh
```
APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Instant Progressive Web App (PWA)
Tutor Companion can also be installed directly from any modern browser (Chrome, Edge) on Windows, macOS, Linux, and Android:
- On Windows: Click the **Install** button in the top bar or browser address bar.
- On Android: Tap Chrome menu (3 dots) &rarr; **Add to Home screen** / **Install app**.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Check types and compile production bundle
npm run build

# Run linter
npm run lint
```
