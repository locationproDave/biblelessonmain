// Bible API service using bible-api.com (free, no API key required)
// Supports multiple translations and verse lookup

export interface BibleVerse {
  book_id: string
  book_name: string
  chapter: number
  verse: number
  text: string
}

export interface BiblePassage {
  reference: string
  verses: BibleVerse[]
  text: string
  translation_id: string
  translation_name: string
  translation_note: string
}

export interface BibleError {
  error: string
  reference?: string
}

export type BibleTranslation = 'kjv' | 'web' | 'bbe' | 'oeb-us' | 'clementine' | 'almeida'

export const TRANSLATIONS: { id: BibleTranslation; name: string; language: string }[] = [
  { id: 'kjv', name: 'King James Version', language: 'English' },
  { id: 'web', name: 'World English Bible', language: 'English' },
  { id: 'bbe', name: 'Bible in Basic English', language: 'English' },
  { id: 'oeb-us', name: 'Open English Bible (US)', language: 'English' },
]

const API_BASE = 'https://bible-api.com'

// Normalize book names for the API
function normalizeReference(reference: string): string {
  return reference.trim()
}

/**
 * Fetch a Bible passage by reference
 * Examples: "John 3:16", "Genesis 1:1-10", "Psalm 23", "Romans 8:28-39"
 */
export async function fetchPassage(
  reference: string,
  translation: BibleTranslation = 'kjv'
): Promise<BiblePassage> {
  const normalized = normalizeReference(reference)
  const url = `${API_BASE}/${encodeURIComponent(normalized)}?translation=${translation}`

  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 404) {
      throw new BibleApiError(
        `Passage not found: "${reference}". Please check the book name, chapter, and verse numbers.`,
        reference
      )
    }
    throw new BibleApiError(
      `Failed to fetch passage. The Bible API may be temporarily unavailable. Please try again.`,
      reference
    )
  }

  const data = await response.json()

  if (data.error) {
    throw new BibleApiError(data.error, reference)
  }

  return {
    reference: data.reference || reference,
    verses: (data.verses || []).map((v: any) => ({
      book_id: v.book_id || '',
      book_name: v.book_name || '',
      chapter: v.chapter || 0,
      verse: v.verse || 0,
      text: (v.text || '').trim(),
    })),
    text: (data.text || '').trim(),
    translation_id: data.translation_id || translation,
    translation_name: data.translation_name || translation.toUpperCase(),
    translation_note: data.translation_note || '',
  }
}

/**
 * Parse a user-typed reference into a normalized format
 * Handles: "John 3:16", "1 John 3:16", "Genesis 1", "Psalm 23:1-6"
 */
export function parseReference(input: string): { book: string; chapter: string; verse: string } | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // Match patterns like "1 John 3:16-18" or "Genesis 1" or "Psalm 23:1-6"
  const match = trimmed.match(/^(\d?\s*[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+)(?::(\S+))?$/)
  if (!match) return null

  return {
    book: match[1].trim(),
    chapter: match[2],
    verse: match[3] || '',
  }
}

/**
 * Build a reference string from parts
 */
export function buildReference(book: string, chapter: string, verse?: string): string {
  let ref = `${book} ${chapter}`
  if (verse) ref += `:${verse}`
  return ref
}

export class BibleApiError extends Error {
  reference?: string
  constructor(message: string, reference?: string) {
    super(message)
    this.name = 'BibleApiError'
    this.reference = reference
  }
}
