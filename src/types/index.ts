export interface ClassRow {
  id: string;
  name: string;
  description: string | null;
  academicLevel: string | null;
  yearOfStudy?: number;
  academicYear?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CourseUnitRow {
  id: string;
  classId: string;
  title: string;
  code: string | null;
  description: string | null;
  curriculum: string | null;
  outline: string | null;
  objectives: string | null;
  teachingHours: number | null;
  contactHours: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TopicRow {
  id: string;
  courseUnitId: string;
  parentTopicId: string | null;
  name: string;
  description: string | null;
  contactHours: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ReferenceDocRow {
  id: string;
  courseUnitId: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'pptx' | 'image' | 'text';
  extractedText: string;
  fileSize?: string;
  uploadedAt: string;
}

export interface SlideItem {
  slideNumber: number;
  title: string;
  bulletPoints: string[];
  speakerNotes?: string;
}

export interface ModuleByHourItem {
  hourLabel: string;
  contentMarkdown: string;
  keyPoints: string[];
  studentActivities?: string;
}

export interface LectureNoteRow {
  id: string;
  courseUnitId: string;
  topicId?: string;
  title: string;
  contactHours: number;
  summary?: string;
  learningOutcomes?: string[];
  modulesByHour?: ModuleByHourItem[];
  fullMarkdownNotes: string;
  slides?: SlideItem[];
  citedReferences?: string[];
  updatedAt: string;
}

export interface AssessmentQuestion {
  questionNumber: number;
  questionText: string;
  options?: string[];
  allocatedMarks: number;
  topicTag?: string;
  modelAnswer: string;
  markingSchemeRubric: string;
}

export interface AssessmentSection {
  sectionName: string;
  sectionInstructions?: string;
  sectionMarks: number;
  questionType: 'mcq' | 'short_answer' | 'essay';
  questions: AssessmentQuestion[];
}

export interface AssessmentRow {
  id: string;
  courseUnitId: string;
  title: string;
  assessmentType: 'coursework' | 'assignment' | 'exam' | 'quiz';
  format: 'standard' | 'substandard' | 'custom_rubric';
  instructions?: string;
  totalMarks: number;
  durationMinutes?: number;
  sections: AssessmentSection[];
  createdAt: string;
}

export interface QuestionBankItem {
  id: string;
  courseUnitId: string;
  topicTag: string;
  questionType: 'mcq' | 'short_answer' | 'essay';
  questionText: string;
  options?: string[];
  allocatedMarks: number;
  modelAnswer: string;
  markingSchemeRubric: string;
  createdAt: string;
}

export interface StudentRow {
  id: string;
  classId: string;
  studentIdNumber: string;
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
  deletedAt: string | null;
}

export interface DeepSolveStep {
  stepNumber: number;
  stepTitle: string;
  explanation: string;
}

export interface DeepSolveResult {
  title: string;
  summaryAnswer: string;
  stepByStepSolution: DeepSolveStep[];
  tutorInsight: string;
  markingCriteriaNotes?: string;
  practiceQuestions?: { question: string; answer: string }[];
}

export interface DeepSolveMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  imageBase64?: string;
  audioText?: string;
  solution?: DeepSolveResult;
  createdAt: string;
}

export type NavigationLocation =
  | '/'
  | '/curriculum'
  | '/classes'
  | '/notes'
  | '/assessments'
  | '/students'
  | '/deepsolve'
  | '/library'
  | '/settings';
