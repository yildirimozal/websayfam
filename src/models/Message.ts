import mongoose, { Document } from 'mongoose';

interface IMessage extends Document {
  content: string;
  author: {
    name: string;
    email: string;
    image?: string;
  };
  quotedMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  reactions: Array<{
    emoji: string;
    users: string[];
  }>;
}

interface MessageModel extends mongoose.Model<IMessage> {
  limitMessages(): Promise<void>;
}

const MessageSchema = new mongoose.Schema<IMessage>({
  content: {
    type: String,
    required: true,
  },
  author: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String },
  },
  quotedMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  reactions: [{
    emoji: String,
    users: [String], // user emails
  }],
});

// Mesaj sayısını 40 ile sınırla
MessageSchema.statics.limitMessages = async function() {
  const count = await this.countDocuments();
  if (count > 40) {
    const messagesToDelete = count - 40;
    const oldestMessages = await this.find()
      .sort({ createdAt: 1 })
      .limit(messagesToDelete);
    
    if (oldestMessages.length > 0) {
      await this.deleteMany({ _id: { $in: oldestMessages.map((m: IMessage) => m._id) } });
    }
  }
};

// Yeni mesaj eklendiğinde limit kontrolü yap
MessageSchema.post('save', async function(this: IMessage) {
  await (this.constructor as MessageModel).limitMessages();
});

export default (mongoose.models.Message as MessageModel) || mongoose.model<IMessage, MessageModel>('Message', MessageSchema);
