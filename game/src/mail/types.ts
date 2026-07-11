export type Folder = 'inbox' | 'sent' | 'spam';
export type MailboxId = 'private' | 'work';

export type Account = {
  id: string;
  name: string;
  email: string;
  color: string;
  autoReply?: string[];
};

export type Email = {
  id: string;
  folder: Folder;
  fromId: string;
  toId: string;
  mailboxId: MailboxId;
  subject: string;
  body: string;
  timestamp: number;
  read: boolean;
  isAd?: boolean;
};
