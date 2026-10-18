import pptxgen from 'pptxgenjs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { jsPDF } from 'jspdf';
import { LectureNoteRow, AssessmentRow } from '../types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 1. Export Lecture Notes to PowerPoint (PPTX)
export async function exportLectureNotesToPPTX(note: LectureNoteRow, unitTitle: string): Promise<void> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  // Define Master Theme Colors
  const PRIMARY_TEAL = '00696F';
  const DARK_SLATE = '1E293B';
  const LIGHT_BG = 'F8FAFC';

  // Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: LIGHT_BG };
  titleSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.15,
    fill: { color: PRIMARY_TEAL },
  });

  titleSlide.addText(unitTitle, {
    x: 0.8,
    y: 1.8,
    w: '85%',
    fontSize: 20,
    bold: true,
    color: PRIMARY_TEAL,
  });

  titleSlide.addText(note.title, {
    x: 0.8,
    y: 2.5,
    w: '85%',
    fontSize: 32,
    bold: true,
    color: DARK_SLATE,
  });

  titleSlide.addText(`Contact Hours: ${note.contactHours} Hours  ·  Tutor Companion Lecture Suite`, {
    x: 0.8,
    y: 4.0,
    w: '85%',
    fontSize: 14,
    color: '64748B',
  });

  // Slide Decks
  if (note.slides && note.slides.length > 0) {
    for (const s of note.slides) {
      const slide = pptx.addSlide();
      slide.background = { color: 'FFFFFF' };

      // Top accent bar
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: '100%',
        h: 0.08,
        fill: { color: PRIMARY_TEAL },
      });

      // Header
      slide.addText(s.title, {
        x: 0.8,
        y: 0.6,
        w: '85%',
        fontSize: 22,
        bold: true,
        color: DARK_SLATE,
      });

      // Bullets
      const bulletObjects = s.bulletPoints.map((bp) => ({
        text: bp,
        options: {
          fontSize: 15,
          color: '334155',
          breakLine: true,
          bullet: true,
          spaceAfter: 10,
        },
      }));

      slide.addText(bulletObjects, {
        x: 0.8,
        y: 1.6,
        w: '85%',
        h: 4.5,
        valign: 'top',
      });

      // Speaker Notes
      if (s.speakerNotes) {
        slide.addNotes(s.speakerNotes);
      }
    }
  } else if (note.modulesByHour && note.modulesByHour.length > 0) {
    // Generate slides from modules if slides array is absent
    for (const m of note.modulesByHour) {
      const slide = pptx.addSlide();
      slide.background = { color: 'FFFFFF' };

      slide.addText(m.hourLabel, {
        x: 0.8,
        y: 0.6,
        w: '85%',
        fontSize: 22,
        bold: true,
        color: PRIMARY_TEAL,
      });

      const bulletObjects = m.keyPoints.map((kp) => ({
        text: kp,
        options: {
          fontSize: 16,
          color: '334155',
          breakLine: true,
          bullet: true,
          spaceAfter: 12,
        },
      }));

      slide.addText(bulletObjects, {
        x: 0.8,
        y: 1.6,
        w: '85%',
        h: 4.5,
        valign: 'top',
      });
    }
  }

  const safeFilename = `${note.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pptx`;
  await pptx.writeFile({ fileName: safeFilename });
}

// 2. Export Lecture Notes to Word (DOCX)
export async function exportLectureNotesToDOCX(note: LectureNoteRow, unitTitle: string): Promise<void> {
  const children: Paragraph[] = [
    new Paragraph({
      text: unitTitle.toUpperCase(),
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      text: note.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Allocated Contact Hours: `, bold: true }),
        new TextRun({ text: `${note.contactHours} Hours  |  ` }),
        new TextRun({ text: `Date: `, bold: true }),
        new TextRun({ text: new Date(note.updatedAt).toLocaleDateString() }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }),
  ];

  // Learning Outcomes
  if (note.learningOutcomes && note.learningOutcomes.length > 0) {
    children.push(
      new Paragraph({
        text: 'Learning Outcomes & Competencies',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      })
    );
    note.learningOutcomes.forEach((lo) => {
      children.push(
        new Paragraph({
          text: `• ${lo}`,
          spacing: { after: 60 },
        })
      );
    });
  }

  // Modules by Hour
  if (note.modulesByHour && note.modulesByHour.length > 0) {
    note.modulesByHour.forEach((m) => {
      children.push(
        new Paragraph({
          text: m.hourLabel,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 100 },
        })
      );

      // Clean markdown content
      const cleanText = m.contentMarkdown.replace(/#{1,6}\s?/g, '').trim();
      cleanText.split('\n\n').forEach((para) => {
        if (para.trim()) {
          children.push(
            new Paragraph({
              text: para.trim(),
              spacing: { after: 100 },
            })
          );
        }
      });

      if (m.keyPoints && m.keyPoints.length > 0) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: 'Core Takeaways:', bold: true, italics: true })],
            spacing: { before: 100, after: 60 },
          })
        );
        m.keyPoints.forEach((kp) => {
          children.push(
            new Paragraph({
              text: `✔ ${kp}`,
              spacing: { after: 40 },
            })
          );
        });
      }
    });
  } else {
    // Fallback to full markdown notes
    const cleanNotes = note.fullMarkdownNotes.replace(/#{1,6}\s?/g, '').trim();
    cleanNotes.split('\n\n').forEach((para) => {
      children.push(
        new Paragraph({
          text: para.trim(),
          spacing: { after: 100 },
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeFilename = `${note.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.docx`;
  downloadBlob(blob, safeFilename);
}

// 3. Export Lecture Notes to PDF
export function exportLectureNotesToPDF(note: LectureNoteRow, unitTitle: string): void {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxLineWidth = pageWidth - margin * 2;
  let cursorY = 50;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 105, 111); // #00696F
  doc.text(unitTitle.toUpperCase(), margin, cursorY);
  cursorY += 24;

  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  const titleLines = doc.splitTextToSize(note.title, maxLineWidth);
  doc.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 22 + 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Contact Hours: ${note.contactHours} Hours  |  Generated by Tutor Companion Academic Suite`,
    margin,
    cursorY
  );
  cursorY += 20;

  // Hairline separator
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 20;

  // Learning Outcomes
  if (note.learningOutcomes && note.learningOutcomes.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 105, 111);
    doc.text('Learning Outcomes', margin, cursorY);
    cursorY += 16;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);

    for (const lo of note.learningOutcomes) {
      if (cursorY > 780) {
        doc.addPage();
        cursorY = 50;
      }
      const lines = doc.splitTextToSize(`• ${lo}`, maxLineWidth);
      doc.text(lines, margin, cursorY);
      cursorY += lines.length * 14 + 4;
    }
    cursorY += 12;
  }

  // Modules / Notes
  const textContent = note.fullMarkdownNotes.replace(/#{1,6}\s?/g, '');
  const paragraphs = textContent.split('\n\n');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);

  for (const para of paragraphs) {
    if (!para.trim()) continue;
    if (cursorY > 780) {
      doc.addPage();
      cursorY = 50;
    }
    const lines = doc.splitTextToSize(para.trim(), maxLineWidth);
    doc.text(lines, margin, cursorY);
    cursorY += lines.length * 14 + 10;
  }

  const safeFilename = `${note.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  doc.save(safeFilename);
}

// 4. Export Assessment / Examination Paper (DOCX)
export async function exportAssessmentToDOCX(
  assessment: AssessmentRow,
  unitTitle: string,
  includeMarkingScheme: boolean = false
): Promise<void> {
  const children: Paragraph[] = [
    new Paragraph({
      text: 'ACADEMIC EXAMINATION BOARD',
      heading: HeadingLevel.HEADING_3,
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      text: unitTitle.toUpperCase(),
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `${assessment.title.toUpperCase()} ${includeMarkingScheme ? '— MARKING SCHEME & MODEL ANSWERS' : ''}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 140 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Total Marks: `, bold: true }),
        new TextRun({ text: `${assessment.totalMarks} Marks  |  ` }),
        new TextRun({ text: `Duration: `, bold: true }),
        new TextRun({ text: `${assessment.durationMinutes || 120} Minutes  |  ` }),
        new TextRun({ text: `Type: `, bold: true }),
        new TextRun({ text: `${assessment.assessmentType.toUpperCase()}` }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  ];

  if (assessment.instructions) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'INSTRUCTIONS TO CANDIDATES: ', bold: true }),
          new TextRun({ text: assessment.instructions }),
        ],
        spacing: { after: 240 },
      })
    );
  }

  assessment.sections.forEach((sec) => {
    children.push(
      new Paragraph({
        text: `${sec.sectionName} (${sec.sectionMarks} Marks)`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 80 },
      })
    );

    if (sec.sectionInstructions) {
      children.push(
        new Paragraph({
          text: sec.sectionInstructions,
          spacing: { after: 120 },
        })
      );
    }

    sec.questions.forEach((q) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Question ${q.questionNumber}: `, bold: true }),
            new TextRun({ text: q.questionText }),
            new TextRun({ text: ` [${q.allocatedMarks} Marks]`, bold: true }),
          ],
          spacing: { before: 80, after: 60 },
        })
      );

      if (q.options && q.options.length > 0) {
        q.options.forEach((opt) => {
          children.push(
            new Paragraph({
              text: `    ${opt}`,
              spacing: { after: 30 },
            })
          );
        });
      }

      if (includeMarkingScheme) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'MODEL ANSWER: ', bold: true, color: '00696F' }),
              new TextRun({ text: q.modelAnswer }),
            ],
            spacing: { before: 40, after: 40 },
          })
        );
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'MARKING RUBRIC: ', bold: true, color: '004D52' }),
              new TextRun({ text: q.markingSchemeRubric }),
            ],
            spacing: { after: 100 },
          })
        );
      }
    });
  });

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  const safeFilename = `${assessment.title.replace(/[^a-zA-Z0-9_-]/g, '_')}${includeMarkingScheme ? '_Marking_Scheme' : ''}.docx`;
  downloadBlob(blob, safeFilename);
}
