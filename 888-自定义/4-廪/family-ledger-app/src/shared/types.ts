export type Entry = {
  id: string
  date: string
  amount: number
  category: string
  member: string
  note: string
  source: string
}

export type AppSettings = {
  passwordHash: string | null
  categories: string[]
  members: string[]
  sources: string[]
}

export type LedgerState = {
  settings: AppSettings
  entries: Entry[]
  createdAt: string
  updatedAt: string
}

export type ValidationIssue = {
  field: keyof Omit<Entry, 'id'>
  message: string
}
