export type CallType = 'incoming' | 'outgoing' | 'missed';

export interface CallEntry {
  id: string;
  number: string;
  name?: string;
  timestamp: Date;
  type: CallType;
}

export interface Contact {
  number: string;
  name: string;
}
