import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import PublicNote from '@/models/PublicNote';

export async function GET() {
  try {
    console.log('GET /api/public-notes - Connecting to database...');
    await connectToDatabase();
    console.log('Database connection successful');

    console.log('Fetching public notes...');
    const notes = await PublicNote.find().sort({ createdAt: -1 });
    console.log(`Found ${notes.length} public notes`);

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error in GET /api/public-notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/public-notes - Connecting to database...');
    await connectToDatabase();
    console.log('Database connection successful');

    const body = await request.json();
    console.log('Received note data:', body);

    const note = new PublicNote(body);
    console.log('Created new note instance:', note);

    await note.save();
    console.log('Note saved successfully:', note._id);

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error in POST /api/public-notes:', error);
    return NextResponse.json(
      { error: 'Failed to create public note' },
      { status: 500 }
    );
  }
}
