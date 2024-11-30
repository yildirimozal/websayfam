import { connectToDatabase } from '@/lib/mongodb';
import PublicNote from '@/models/PublicNote';

async function migrateNotes() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    
    console.log('Dropping existing collection...');
    await PublicNote.collection.drop().catch(() => console.log('Collection does not exist'));
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateNotes();
