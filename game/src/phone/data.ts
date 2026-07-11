import type { CallEntry, Contact } from './types';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const normalize = (n: string) => n.replace(/[\s\-+()]/g, '');

export const contacts: Contact[] = [
  { name: 'Mama', number: '0176123456' },
  { name: 'Papa', number: '01769876543' },
  { name: 'Lisa', number: '015112345678' },
  { name: 'Tom', number: '01719876543' },
  { name: 'Arbeit', number: '03012345678' },
  { name: 'Bäcker Müller', number: '030987654' },
];

export const lookupName = (number: string): string | undefined => {
  const cleaned = normalize(number);
  const match = contacts.find((c) => normalize(c.number) === cleaned);
  return match?.name;
};

const seedEntry = (id: string, number: string, name: string | undefined, delta: number, type: CallEntry['type']): CallEntry => ({
  id,
  number,
  name,
  timestamp: new Date(Date.now() - delta),
  type,
});

export const buildSeedCallLog = (): CallEntry[] => [
  seedEntry('s1', '0176123456', 'Mama', 25 * MIN, 'incoming'),
  seedEntry('s2', '03012345678', 'Arbeit', 2 * HOUR + 15 * MIN, 'outgoing'),
  seedEntry('s3', '01719876543', 'Tom', 5 * HOUR, 'missed'),
  seedEntry('s4', '015112345678', 'Lisa', 1 * DAY + 3 * HOUR, 'incoming'),
  seedEntry('s5', '030987654', 'Bäcker Müller', 1 * DAY + 7 * HOUR, 'outgoing'),
  seedEntry('s6', '017699988877', undefined, 3 * DAY, 'missed'),
  seedEntry('s7', '0176123456', 'Mama', 6 * DAY, 'incoming'),
];
