export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  fromMe: boolean;
  status?: MessageStatus;
  audioUrl?: string;
  audioDuration?: number;
  sender?: string;
  clueId?: string;
}

export interface Chat {
  id: string;
  name: string;
  avatarColor: string;
  avatarUrl?: string;
  lastSeen?: string;
  isGroup?: boolean;
  isTyping?: boolean;
  isMuted?: boolean;
  isHidden?: boolean;
  unreadCount?: number;
  phone?: string;
  about?: string;
  messages: Message[];
}

export interface Status {
  id: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  imageUrl: string;
  caption?: string;
  timestamp: number;
  seen?: boolean;
}

export interface GalleryImage {
  id: string;
  url: string;
  source: 'gallery' | 'demo';
}