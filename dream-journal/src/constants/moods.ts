export type MoodId =
  | "peaceful"
  | "joyful"
  | "anxious"
  | "scary"
  | "strange"
  | "sad";

export interface Mood {
  id: MoodId;
  label: string;
  emoji: string;
}

export const MOODS: Mood[] = [
  { id: "peaceful", label: "Peaceful", emoji: "\u{1F54A}️" },
  { id: "joyful", label: "Joyful", emoji: "\u{1F600}" },
  { id: "anxious", label: "Anxious", emoji: "\u{1F630}" },
  { id: "scary", label: "Scary", emoji: "\u{1F47B}" },
  { id: "strange", label: "Strange", emoji: "\u{1F300}" },
  { id: "sad", label: "Sad", emoji: "\u{1F622}" },
];

export function getMood(id: MoodId): Mood {
  return MOODS.find((mood) => mood.id === id) ?? MOODS[0];
}
