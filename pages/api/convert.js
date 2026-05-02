import formidable from 'formidable';
import fs from 'fs';
import mammoth from 'mammoth';
import { parse } from 'node-html-parser';
import {
  Document, Packer, Paragraph, TextRun,
  AlignmentType, BorderStyle, ShadingType,
} from 'docx';

export const config = {
  api: { bodyParser: false },
};

// ─── Colour palette (from aesthetic-notes skill) ──────────────────────────
const C = {
  mainTitle: '7C4DFF',
  h1:        'E91E8C',
  h2:        '0097A7',
  h3:        'FF6F00',
  h4:        '2E7D32',
  body:      '212121',
  note:      '4A148C',
  subpoint:  '1565C0',
};
const FONT = 'Segoe Script';

// ─── Builder helpers ───────────────────────────────────────────────────────
function makeTitle(t) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
    shading: { fill: 'EDE7F6', type: ShadingType.CLEAR },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.mainTitle, space: 4 } },
    children: [new TextRun({ text: '\u273F ' + t + ' \u273F', font: FONT, size: 52, bold: true, color: C.mainTitle })],
  });
}

function makeH1(t) {
  return new Paragraph({
    spacing: { before: 300, after: 120 },
    shading: { fill: 'FCE4EC', type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.THICK, size: 12, color: C.h1, space: 8 } },
    children: [new TextRun({ text: '\u2740 ' + t, font: FONT, size: 40, bold: true, color: C.h1 })],
  });
}

function makeH2(t) {
  return new Paragraph({
    spacing: { before: 240, after: 100 },
    shading: { fill: 'E0F7FA', type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 8, color: C.h2, space: 6 } },
    children: [new TextRun({ text: '\u2726 ' + t, font: FONT, size: 34, bold: true, color: C.h2 })],
  });
}

function makeH3(t) {
  return new Paragraph({
    spacing: { before: 180, after: 80 },
    children: [new TextRun({ text: '\u25C6 ' + t, font: FONT, size: 28, bold: true, color: C.h3 })],
  });
}

function makeH4(t) {
  return new Paragraph({
    spacing: { before: 140, after: 60 },
    children: [new TextRun({ text: '\u27A4 ' + t, font: FONT, size: 24, bold: true, color: C.h4 })],
  });
}

function makeBody(t) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    indent: { left: 200 },
    children: [new TextRun({ text: t, font: FONT, size: 20, color: C.body })],
  });
}

function makeBullet(t) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: 440, hanging: 280 },
    children: [
      new TextRun({ text: '\u2727  ', font: FONT, size: 20, color: 'E91E8C' }),
      new TextRun({ text: t, font: FONT, size: 20, color: C.subpoint }),
    ],
  });
}

function makeSubBullet(t) {
  return new Paragraph({
    spacing: { before: 30, after: 30 },
    indent: { left: 720, hanging: 280 },
    children: [
      new TextRun({ text: '\u25E6  ', font: FONT, size: 18, color: C.h3 }),
      new TextRun({ text: t, font: FONT, size: 18, color: C.body }),
    ],
  });
}

function makeNote(t) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    indent: { left: 200 },
    shading: { fill: 'FFF9C4', type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.DOTTED, size: 6, color: 'FFA000', space: 6 } },
    children: [
      new TextRun({ text: '\uD83D\uDCDD Note: ', font: FONT, size: 20, bold: true, color: 'E65100' }),
      new TextRun({ text: t, font: FONT, size: 20, color: C.note }),
    ],
  });
}

function makeDivider() {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: '~  \u273F  ~  \u273F  ~  \u273F  ~', font: FONT, size: 20, color: 'CE93D8' })],
  });
}

// ─── HTML → paragraphs ────────────────────────────────────────────────────
function htmlToAesthetic(html) {
  const root = parse(html);
  const children = [];
  let titleDone = false;
  let h1Count = 0;

  function walk(node) {
    const tag = node.tagName?.toLowerCase();
    const text = node.text?.trim();

    switch (tag) {
      case 'h1':
        if (!text) break;
        if (!titleDone) {
          children.push(makeTitle(text));
          titleDone = true;
        } else {
          if (h1Count > 0) children.push(makeDivider());
          children.push(makeH1(text));
        }
        h1Count++;
        break;

      case 'h2':
        if (text) children.push(makeH2(text));
        break;

      case 'h3':
        if (text) children.push(makeH3(text));
        break;

      case 'h4': case 'h5': case 'h6':
        if (text) children.push(makeH4(text));
        break;

      case 'p':
        if (!text) break;
        if (/^(note|important|nb|warning|tip)\s*:/i.test(text)) {
          children.push(makeNote(text.replace(/^[^:]+:\s*/i, '')));
        } else if (!titleDone) {
          // First paragraph with no headings becomes the title
          children.push(makeTitle(text));
          titleDone = true;
        } else {
          children.push(makeBody(text));
        }
        break;

      case 'ul': case 'ol':
        node.childNodes.forEach(li => {
          if (li.tagName?.toLowerCase() !== 'li') return;
          const liText = li.text?.trim();
          if (!liText) return;
          // Nested list?
          const nested = li.querySelector('ul, ol');
          if (nested) {
            const direct = li.childNodes
              .filter(n => n.nodeType === 3) // text nodes
              .map(n => n.text?.trim())
              .filter(Boolean)
              .join(' ');
            if (direct) children.push(makeBullet(direct));
            nested.childNodes.forEach(sub => {
              if (sub.tagName?.toLowerCase() === 'li') {
                const st = sub.text?.trim();
                if (st) children.push(makeSubBullet(st));
              }
            });
          } else {
            children.push(makeBullet(liText));
          }
        });
        break;

      default:
        // Recurse into unknown container tags
        if (tag && !['script', 'style', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th'].includes(tag)) {
          node.childNodes?.forEach(walk);
        }
    }
  }

  root.childNodes.forEach(walk);

  // Always end with a divider + closing line
  children.push(makeDivider());
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200 },
    children: [new TextRun({ text: '\u273F End of Notes \u273F', font: FONT, size: 24, color: 'CE93D8', italics: true })],
  }));

  return children;
}

// ─── Handler ───────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse multipart upload
  const form = formidable({ maxFileSize: 20 * 1024 * 1024 });
  let files;
  try {
    [, files] = await form.parse(req);
  } catch (e) {
    return res.status(400).json({ error: 'Upload failed: ' + e.message });
  }

  const uploaded = files.docx?.[0] || files.file?.[0];
  if (!uploaded) return res.status(400).json({ error: 'No file received' });

  // Read + convert docx → HTML
  let html;
  try {
    const buf = fs.readFileSync(uploaded.filepath);
    const result = await mammoth.convertToHtml({ buffer: buf });
    html = result.value;
  } catch (e) {
    return res.status(422).json({ error: 'Could not read document: ' + e.message });
  } finally {
    try { fs.unlinkSync(uploaded.filepath); } catch {}
  }

  if (!html?.trim()) {
    return res.status(422).json({ error: 'The document appears to be empty.' });
  }

  // Build aesthetic docx
  let outBuffer;
  try {
    const paragraphs = htmlToAesthetic(html);
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
          },
        },
        children: paragraphs,
      }],
    });
    outBuffer = await Packer.toBuffer(doc);
  } catch (e) {
    return res.status(500).json({ error: 'Build failed: ' + e.message });
  }

  const mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  res.setHeader('Content-Type', mime);
  res.setHeader('Content-Disposition', 'attachment; filename="aesthetic_notes.docx"');
  res.setHeader('Content-Length', outBuffer.length);
  res.send(outBuffer);
}
