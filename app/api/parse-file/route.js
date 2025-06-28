import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export const runtime = 'nodejs';

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const ext = file.name.split('.').pop().toLowerCase();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    let text = '';
    if (ext === 'txt' || ext === 'md') {
      text = buffer.toString('utf8');
    } else if (ext === 'pdf') {
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (ext === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      throw new Error('Unsupported file type');
    }
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
} 