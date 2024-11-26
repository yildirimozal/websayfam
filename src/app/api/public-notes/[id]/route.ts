import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import PublicNote from '@/models/PublicNote';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`PUT /api/public-notes/${params.id} - Connecting to database...`);
    await connectToDatabase();
    console.log('Database connection successful');

    const { id } = params;
    const body = await request.json();
    console.log('Updating note:', id, 'with data:', body);
    
    const note = await PublicNote.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    if (!note) {
      console.log('Note not found:', id);
      return NextResponse.json(
        { error: 'Public note not found' },
        { status: 404 }
      );
    }

    console.log('Note updated successfully:', note);
    return NextResponse.json(note);
  } catch (error) {
    console.error('Error in PUT /api/public-notes/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update public note' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`DELETE /api/public-notes/${params.id} - Connecting to database...`);
    await connectToDatabase();
    console.log('Database connection successful');
    
    const { id } = params;
    console.log('Deleting note:', id);
    
    const note = await PublicNote.findByIdAndDelete(id);

    if (!note) {
      console.log('Note not found:', id);
      return NextResponse.json(
        { error: 'Public note not found' },
        { status: 404 }
      );
    }

    console.log('Note deleted successfully:', id);
    return NextResponse.json({ message: 'Public note deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/public-notes/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete public note' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`GET /api/public-notes/${params.id} - Connecting to database...`);
    await connectToDatabase();
    console.log('Database connection successful');
    
    const { id } = params;
    console.log('Fetching note:', id);
    
    const note = await PublicNote.findById(id);

    if (!note) {
      console.log('Note not found:', id);
      return NextResponse.json(
        { error: 'Public note not found' },
        { status: 404 }
      );
    }

    console.log('Note found:', note);
    return NextResponse.json(note);
  } catch (error) {
    console.error('Error in GET /api/public-notes/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public note' },
      { status: 500 }
    );
  }
}
