import type { Timestamp } from "firebase/firestore";

export interface DiaryImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  images: DiaryImage[];
  tags: string[];
  timestamp: Timestamp;
}
