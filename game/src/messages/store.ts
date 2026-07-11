import { create } from 'zustand';
import { seedSms, type Sms, type SmsCategory } from './data';

export interface ExtendedSms extends Sms {
  sender?: 'me' | 'them';
}

interface MessagesState {
  smsList: ExtendedSms[];
  markAsRead: (category: SmsCategory) => void;
  sendMessage: (category: SmsCategory, body: string) => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  smsList: seedSms.map(sms => ({ ...sms, sender: 'them' as const })),
  markAsRead: (category) => set((state) => ({
    smsList: state.smsList.map(sms =>
      sms.category === category ? { ...sms, read: true } : sms
    )
  })),
  sendMessage: (category, body) => set((state) => ({
    smsList: [
      ...state.smsList,
      {
        id: `sms-${Date.now()}-${Math.random()}`,
        category,
        body,
        timestamp: Date.now(),
        read: true,
        sender: 'me'
      }
    ]
  }))
}));
