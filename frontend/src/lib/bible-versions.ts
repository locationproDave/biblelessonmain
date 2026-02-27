export const BIBLE_VERSIONS = [
  { id: 'KJV', name: 'King James Version', abbr: 'KJV' },
  { id: 'NKJV', name: 'New King James Version', abbr: 'NKJV' },
  { id: 'NIV', name: 'New International Version', abbr: 'NIV' },
  { id: 'ESV', name: 'English Standard Version', abbr: 'ESV' },
  { id: 'NASB', name: 'New American Standard Bible', abbr: 'NASB' },
  { id: 'NLT', name: 'New Living Translation', abbr: 'NLT' },
  { id: 'NRSV', name: 'New Revised Standard Version', abbr: 'NRSV' },
  { id: 'CSB', name: 'Christian Standard Bible', abbr: 'CSB' },
  { id: 'HCSB', name: 'Holman Christian Standard Bible', abbr: 'HCSB' },
  { id: 'MSG', name: 'The Message', abbr: 'MSG' },
  { id: 'AMP', name: 'Amplified Bible', abbr: 'AMP' },
  { id: 'NRSVA', name: 'NRSV with Apocrypha', abbr: 'NRSVA' },
  { id: 'WEB', name: 'World English Bible', abbr: 'WEB' },
  { id: 'YLT', name: 'Young\'s Literal Translation', abbr: 'YLT' },
  { id: 'DARBY', name: 'Darby Translation', abbr: 'Darby' },
  { id: 'ASV', name: 'American Standard Version', abbr: 'ASV' },
  { id: 'WE', name: 'Wycliffe Bible', abbr: 'WE' },
  { id: 'DOUAY', name: 'Douay-Rheims Bible', abbr: 'Douay' },
  { id: 'NRSV-CE', name: 'NRSV Catholic Edition', abbr: 'NRSV-CE' },
  { id: 'NABRE', name: 'New American Bible Revised Edition', abbr: 'NABRE' },
] as const

export type BibleVersionId = typeof BIBLE_VERSIONS[number]['id']

export function getBibleVersionName(versionId: string): string {
  const version = BIBLE_VERSIONS.find(v => v.id === versionId)
  return version?.name || versionId
}

export function getBibleVersionAbbr(versionId: string): string {
  const version = BIBLE_VERSIONS.find(v => v.id === versionId)
  return version?.abbr || versionId
}
