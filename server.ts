import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Enable JSON parser with large payload limit for curriculum documents, images, and slides
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const AI_MODEL = 'gemini-2.5-flash';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1. Analyze Curriculum
app.post('/api/ai/analyze-curriculum', async (req, res) => {
  try {
    const { rawText, courseName, durationYears } = req.body;
    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ error: 'Curriculum text or guide content is required.' });
    }

    const systemPrompt = `You are a curriculum specialist and academic dean.
Your task is to analyze the provided curriculum document or teacher's guide for a complete course (e.g., Diploma in Pharmacy, Certificate in Medical Laboratory Technology, Nursing Foundations, Computer Science, etc.).
Extract and structure:
1. Course Title and Academic Level (e.g. Diploma, Certificate, Degree)
2. The classes across the course (e.g., Year 1, Year 2, Year 3 or Semester 1, Semester 2)
3. For each class, all Course Units with:
   - title
   - course code (e.g. PHR 1101, NUR 101)
   - contact hours / teaching hours
   - detailed description
   - learning objectives (bullet list)
   - course outline modules/topics sorted logically by contact hours and progression
   - topics list (with topic name, estimated contact hours, and key concepts)

Return strictly valid JSON matching the schema.`;

    const userPrompt = `Course Name / Target: ${courseName || 'Analyze from document'}
Duration in Years: ${durationYears || 'Analyze from document'}

Curriculum Document Content:
"""
${rawText.slice(0, 75000)}
"""`;

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            courseTitle: { type: Type.STRING },
            academicLevel: { type: Type.STRING },
            durationYears: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            classes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  className: { type: Type.STRING },
                  academicLevel: { type: Type.STRING },
                  yearOfStudy: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  courseUnits: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        code: { type: Type.STRING },
                        contactHours: { type: Type.NUMBER },
                        teachingHours: { type: Type.NUMBER },
                        description: { type: Type.STRING },
                        curriculum: { type: Type.STRING },
                        objectives: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        outline: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        topics: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING },
                              contactHours: { type: Type.NUMBER },
                              keyConcepts: { type: Type.STRING },
                            },
                            required: ['name', 'contactHours'],
                          },
                        },
                      },
                      required: ['title', 'code', 'contactHours', 'objectives', 'outline', 'topics'],
                    },
                  },
                },
                required: ['className', 'academicLevel', 'yearOfStudy', 'courseUnits'],
              },
            },
          },
          required: ['courseTitle', 'academicLevel', 'classes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Curriculum analysis error:', error);
    return res.status(500).json({
      error: 'Failed to analyze curriculum: ' + (error.message || String(error)),
    });
  }
});

// 2. Generate Lecture Notes Grounded in References & Structured by Contact Hours
app.post('/api/ai/generate-notes', async (req, res) => {
  try {
    const {
      unitTitle,
      unitCode,
      topicName,
      contactHours,
      objectives,
      referencesText,
      curriculumContext,
    } = req.body;

    const systemPrompt = `You are a university senior lecturer and curriculum author.
Your task is to generate comprehensive, exhaustive, and professionally organized lecture notes for a specific course topic.
CRITICAL REQUIREMENTS:
1. Contact Hours Structure: The depth, sections, and pacing of the notes MUST strictly correspond to the allocated ${contactHours || 2} contact hours (e.g. 1 contact hour ≈ 45-60 min lecture material, 2 hours = 90-120 min, 3 hours = 150-180 min). Divide the content clearly into contact hour segments or lecture modules.
2. Grounded in References: You must explicitly incorporate, synthesize, and cite the user's provided reference textbook/guide excerpts.
3. Content Completeness: Include:
   - Topic overview and aligned learning outcomes
   - Hour-by-hour structured lecture content with thorough explanations, clinical/practical examples, chemical/anatomical/mathematical details where relevant
   - Key terminology and definitions
   - In-class discussion prompts & practical exercises for students
   - Review self-assessment questions with answer hints
   - Slide presentation deck outline (5-10 slides with Title, Bullet Points, and Speaker Notes)`;

    const userPrompt = `Course Unit: ${unitTitle} (${unitCode || 'No code'})
Topic: ${topicName}
Contact Hours: ${contactHours || 2} hours
Unit Objectives:
${Array.isArray(objectives) ? objectives.join('\n') : objectives || 'Standard competencies'}

Curriculum Context:
${curriculumContext || 'Standard accredited curriculum'}

Provided Reference Materials & Text Extracts:
"""
${(referencesText || 'Use standard authoritative reference guidelines for this subject.').slice(0, 50000)}
"""`;

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            contactHours: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            learningOutcomes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            modulesByHour: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  hourLabel: { type: Type.STRING }, // e.g. "Hour 1: Pharmacokinetics Fundamentals"
                  contentMarkdown: { type: Type.STRING },
                  keyPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  studentActivities: { type: Type.STRING },
                },
                required: ['hourLabel', 'contentMarkdown', 'keyPoints'],
              },
            },
            fullMarkdownNotes: { type: Type.STRING },
            reviewQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answerGuide: { type: Type.STRING },
                },
                required: ['question', 'answerGuide'],
              },
            },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slideNumber: { type: Type.NUMBER },
                  title: { type: Type.STRING },
                  bulletPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  speakerNotes: { type: Type.STRING },
                },
                required: ['slideNumber', 'title', 'bulletPoints'],
              },
            },
          },
          required: ['title', 'learningOutcomes', 'modulesByHour', 'fullMarkdownNotes', 'slides'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Generate notes error:', error);
    return res.status(500).json({
      error: 'Failed to generate lecture notes: ' + (error.message || String(error)),
    });
  }
});

// 3. Generate Assessments, Coursework, Exams & Authoritative Marking Schemes
app.post('/api/ai/generate-assessment', async (req, res) => {
  try {
    const {
      unitTitle,
      unitCode,
      assessmentTitle,
      assessmentType, // 'coursework' | 'assignment' | 'exam' | 'quiz'
      format, // 'standard' (MCQs, Short answers, Essay) | 'substandard' | 'custom_rubric'
      selectedTopics, // Array of topic names
      referenceExamStandard, // Optional reference exam format provided by user
      totalMarks,
      durationMinutes,
      curriculumRequirements,
    } = req.body;

    const systemPrompt = `You are a chief examination officer and senior academic evaluator.
Your task is to construct a rigorous academic examination or coursework assessment based strictly on the selected topics and curriculum requirements.
Format Instructions:
- If format is "standard", structure into:
  - Section A: Multiple Choice Questions (MCQs) with 4 distinct options (A, B, C, D), correct option specified, and detailed explanation.
  - Section B: Short Answer / Structured Questions with specific mark allocation.
  - Section C: Long Essay / Scenario / Problem-Solving Questions with comprehensive breakdown.
- If user provided a "referenceExamStandard", mirror its exact structural pattern, weighting, question style, and instructions.
- Marking Scheme: You MUST provide an authoritative, exhaustive marking scheme and model solution for EVERY question, including exact marks breakdown for definitions, steps, calculations, and clinical reasoning.`;

    const userPrompt = `Course Unit: ${unitTitle} (${unitCode || ''})
Assessment Title: ${assessmentTitle || 'Comprehensive Examination'}
Assessment Type: ${assessmentType || 'exam'}
Format: ${format || 'standard'}
Target Total Marks: ${totalMarks || 100}
Duration: ${durationMinutes || 180} minutes
Selected Topics to Assess:
${Array.isArray(selectedTopics) ? selectedTopics.join('\n- ') : selectedTopics || 'All unit topics'}

Curriculum Requirements / Rubrics:
${curriculumRequirements || 'Standard tertiary academic rigor'}

${
  referenceExamStandard
    ? `Reference Exam Standard to Mirror:
"""
${referenceExamStandard.slice(0, 20000)}
"""`
    : ''
}`;

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            courseUnit: { type: Type.STRING },
            instructions: { type: Type.STRING },
            totalMarks: { type: Type.NUMBER },
            durationMinutes: { type: Type.NUMBER },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sectionName: { type: Type.STRING }, // e.g. "Section A: Multiple Choice Questions"
                  sectionInstructions: { type: Type.STRING },
                  sectionMarks: { type: Type.NUMBER },
                  questionType: { type: Type.STRING }, // 'mcq' | 'short_answer' | 'essay'
                  questions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        questionNumber: { type: Type.NUMBER },
                        questionText: { type: Type.STRING },
                        options: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        allocatedMarks: { type: Type.NUMBER },
                        topicTag: { type: Type.STRING },
                        modelAnswer: { type: Type.STRING },
                        markingSchemeRubric: { type: Type.STRING },
                      },
                      required: [
                        'questionNumber',
                        'questionText',
                        'allocatedMarks',
                        'modelAnswer',
                        'markingSchemeRubric',
                      ],
                    },
                  },
                },
                required: ['sectionName', 'sectionMarks', 'questionType', 'questions'],
              },
            },
          },
          required: ['title', 'instructions', 'totalMarks', 'sections'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Generate assessment error:', error);
    return res.status(500).json({
      error: 'Failed to generate assessment: ' + (error.message || String(error)),
    });
  }
});

// 4. Multimodal Deep Solve Assistant
app.post('/api/ai/deep-solve', async (req, res) => {
  try {
    const { query, imageBase64, imageMimeType, audioText, contextInfo } = req.body;
    if (!query && !imageBase64 && !audioText) {
      return res.status(400).json({ error: 'Please provide a question, image, or audio note to solve.' });
    }

    const systemPrompt = `You are an expert academic tutor and deep problem solver for higher education and vocational courses (pharmacy, medicine, engineering, sciences, humanities).
Solve the user's task, question, assignment problem, or attached image with deep mathematical, scientific, or conceptual rigor.
Provide:
1. Direct Executive Summary / Answer
2. Step-by-Step Rigorous Mathematical / Clinical / Conceptual Working
3. Tutor Explanatory Insights (pedagogical explanation of why this solution is correct)
4. Marking Advice (how examiners evaluate this question)
5. Related Practice Questions with brief solutions`;

    const parts: any[] = [];

    // Add image if attached
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: imageMimeType || 'image/png',
          data: imageBase64.replace(/^data:[^;]+;base64,/, ''),
        },
      });
    }

    const textContent = `Context: ${contextInfo || 'General academic inquiry'}
${audioText ? `Transcribed Voice Note: "${audioText}"\n` : ''}
User Problem/Question:
${query || 'Please solve the problem presented in the attached image.'}`;

    parts.push({ text: textContent });

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: { parts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summaryAnswer: { type: Type.STRING },
            stepByStepSolution: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.NUMBER },
                  stepTitle: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ['stepNumber', 'stepTitle', 'explanation'],
              },
            },
            tutorInsight: { type: Type.STRING },
            markingCriteriaNotes: { type: Type.STRING },
            practiceQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                },
                required: ['question', 'answer'],
              },
            },
          },
          required: ['title', 'summaryAnswer', 'stepByStepSolution', 'tutorInsight'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Deep solve error:', error);
    return res.status(500).json({
      error: 'Failed to deep solve: ' + (error.message || String(error)),
    });
  }
});

// Mount Vite or static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tutor Companion server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
