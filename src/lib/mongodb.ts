import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB Client options
const clientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Mongoose options
const mongooseOptions = {
  bufferCommands: true,
  autoCreate: true,
  autoIndex: true,
};

let isConnected = false;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, clientOptions);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI, clientOptions);
  clientPromise = client.connect();
}

export async function connectToDatabase() {
  if (isConnected) {
    console.log('=> Using existing database connection');
    return mongoose.connection.db;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, mongooseOptions);

    isConnected = true;
    console.log('=> New database connection established');
    return db.connection.db;
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    isConnected = false;
    throw new Error('Veritabanına bağlanılamadı');
  }
}

mongoose.connection.on('connected', () => {
  console.log('MongoDB bağlantısı başarılı');
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB bağlantı hatası:', err);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB bağlantısı kesildi');
  isConnected = false;
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

export default clientPromise;
