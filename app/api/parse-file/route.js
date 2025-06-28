import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    let text = '';
    if (ext === 'txt' || ext === 'md') {
      text = new TextDecoder('utf-8').decode(buffer);
    } else {
      return NextResponse.json({ error: 'Only .txt and .md parsing supported. PDF/DOCX support coming soon.' }, { status: 400 });
    }

    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 