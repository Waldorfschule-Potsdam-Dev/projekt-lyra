import { Routes, Route, useParams } from 'react-router-dom';
import ChatList from './ChatList';
import ChatView from './ChatView';
import ContactInfo from './ContactInfo';
import NewChat from './NewChat';
import StatusScreen from './StatusScreen';
import StatusComposer from './StatusComposer';
import PlumberJump from './PlumberJump';
import Settings from './Settings';
import HiddenChats from './HiddenChats';
import HiddenChatLock from './HiddenChatLock';
import type { Chat } from './types';

const MIN_MS = 60 * 1000;
const HOUR_MS = 60 * MIN_MS;
const DAY_MS = 24 * HOUR_MS;

const pad = (n: number) => String(n).padStart(2, '0');

export const getLastActivity = (chat: Chat): Date => {
  const last = chat.messages[chat.messages.length - 1];
  return last ? new Date(last.timestamp) : new Date();
};

export const isOnline = (chat: Chat, now: Date = new Date()): boolean => {
  if (chat.isTyping) return true;
  if (chat.lastSeen === 'online') return true;
  const lastActivity = getLastActivity(chat);
  const diff = now.getTime() - lastActivity.getTime();
  if (diff < 0) return true;
  return diff < 5 * MIN_MS;
};

export const formatLastSeen = (chat: Chat, now: Date = new Date(), isTypingOverride?: boolean): string => {
  const lastActivity = getLastActivity(chat);
  const safeActivity = lastActivity.getTime() > now.getTime() ? now : lastActivity;
  const diff = now.getTime() - safeActivity.getTime();
  const isTyping = isTypingOverride ?? chat.isTyping;

  if (isOnline(chat, now)) {
    if (isTyping) return 'schreibt...';
    return 'online';
  }

  if (diff < HOUR_MS) {
    const m = Math.max(1, Math.floor(diff / MIN_MS));
    return `zuletzt vor ${m} Min`;
  }

  const sameDay =
    safeActivity.getFullYear() === now.getFullYear() &&
    safeActivity.getMonth() === now.getMonth() &&
    safeActivity.getDate() === now.getDate();

  if (sameDay) {
    return `zuletzt heute um ${pad(safeActivity.getHours())}:${pad(safeActivity.getMinutes())}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    safeActivity.getFullYear() === yesterday.getFullYear() &&
    safeActivity.getMonth() === yesterday.getMonth() &&
    safeActivity.getDate() === yesterday.getDate();
  if (isYesterday) {
    return `zuletzt gestern um ${pad(safeActivity.getHours())}:${pad(safeActivity.getMinutes())}`;
  }

  const days = Math.floor(diff / DAY_MS);
  if (days < 7) {
    return `zuletzt vor ${days} Tagen`;
  }

  return `zuletzt am ${pad(safeActivity.getDate())}.${pad(safeActivity.getMonth() + 1)}.`;
};

export const formatMessageTime = (date: Date, now: Date = new Date()): string => {
  const safe = date.getTime() > now.getTime() ? now : date;
  const sameDay =
    safe.getFullYear() === now.getFullYear() &&
    safe.getMonth() === now.getMonth() &&
    safe.getDate() === now.getDate();
  if (sameDay) {
    return `${pad(safe.getHours())}:${pad(safe.getMinutes())}`;
  }
  const diffDays = Math.floor((now.getTime() - safe.getTime()) / DAY_MS);
  if (diffDays === 1) return 'Gestern';
  if (diffDays < 7) {
    return safe.toLocaleDateString('de-DE', { weekday: 'short' });
  }
  return safe.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

function ChatViewRoute() {
  const { chatId } = useParams<{ chatId: string }>();
  if (!chatId) return null;
  return <ChatView chatId={chatId} />;
}

export default function WazaaahApp() {
  return (
    <Routes>
      <Route path="/" element={<ChatList />} />
      <Route path="/chat/:chatId" element={<ChatViewRoute />} />
      <Route path="/contact/:chatId" element={<ContactInfo />} />
      <Route path="/new-chat" element={<NewChat />} />
      <Route path="/status" element={<StatusScreen />} />
      <Route path="/status/new" element={<StatusComposer />} />
      <Route path="/plumber" element={<PlumberJump />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/settings/hidden-chats" element={<HiddenChats />} />
      <Route path="/settings/hidden-chats/unlock/:chatId" element={<HiddenChatLock />} />
    </Routes>
  );
}
