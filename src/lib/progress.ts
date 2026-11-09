/** Clés localStorage partagées entre pages (progression). */
export const KEYS = {
  quiz: 'quiz:answers',
  katas: 'katas:solved',
  flashcards: 'flashcards:boxes',
  pieges: 'pieges:seen',
  cours: 'cours:read',
} as const

export type Leitner = Record<string, { box: number; due: number }>
