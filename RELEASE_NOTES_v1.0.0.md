# Tutor Companion v1.0.0

## Overview

Tutor Companion is an offline-first academic management and teaching operating suite for tutors, lecturers, educational directors, and training institutions. This first release brings together curriculum ingestion, lecture-note generation, assessment creation, student grade tracking, and AI-powered tutoring in a single desktop and mobile-ready experience.

## Highlights

- Curriculum and teacher's guide ingestion
  - Auto-detect program levels, durations, academic years, classes, course units, contact hours, and learning objectives
  - Provision classes and units from syllabus content in a single workflow
- Lecture Notes Studio
  - Generate structured lecture notes aligned with contact hours
  - Export to PPTX, DOCX, and PDF
- Assessments & Examination Studio
  - Create standard and substandard exams
  - Generate marking schemes, grading rubrics, and question banks
  - Work from selected syllabus topics or prior exam patterns
- Deep Solve AI Assistant
  - Multi-format Q&A support including text, voice, images, and documents
  - Step-by-step explanations for scientific, clinical, and mathematical problems
- Student Registry & Gradebook
  - Track student records, assessments, and academic performance
  - Calculate GPA and class averages with export-ready reports
- Offline-first resilience
  - Persistent local data storage with IndexedDB
  - Full workspace backup/restore for continuing work without internet access

## Included Build Artifacts

This release is designed to ship both desktop and mobile builds:

- Windows executable (.exe)
- Android APK (.apk)

The GitHub Actions release workflow in `.github/workflows/release.yml` is set up to build and publish these artifacts whenever a version tag like `v1.0.0` is pushed.

## Installation and Usage

### Local Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
```

### Windows build

```bash
npm run build:exe
```

### Android build

```bash
bash build-android-apk.sh
```

## Notes

- The project is configured as a TypeScript + React application with Vite.
- This release is the initial public version and establishes the core tutor workflow, academic admin features, and publishing pipeline.

## Changelog Summary

### Added
- Curriculum ingestion and automatic class/unit generation
- Academic workspace structure for classes and programs
- Lecture notes studio with export capabilities
- Assessment generation and marking schemes
- Student registry and gradebook features
- AI-powered Deep Solve assistance
- Offline-first workspace persistence and backups

### Changed
- Project packaged for desktop and mobile release distribution
- GitHub Actions release pipeline configured for versioned artifact publishing

### Fixed
- Build and release automation setup for Windows and Android outputs

## Release Trigger

```bash
git tag v1.0.0
git push origin v1.0.0
```

This will trigger the release workflow to build the Windows and Android binaries and publish the GitHub release.
