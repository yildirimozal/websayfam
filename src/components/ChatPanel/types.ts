export interface Message {
  _id: string;
  content: string;
  author: {
    name: string;
    email: string;
    image?: string;
  };
  quotedMessage?: {
    _id: string;
    content: string;
    author: {
      name: string;
      email: string;
      image?: string;
    };
  } | null;
  createdAt: string;
  reactions: Array<{
    emoji: string;
    users: string[];
  }>;
}

export interface OnlineUser {
  name: string;
  email: string;
  image?: string;
  lastSeen: string;
}
